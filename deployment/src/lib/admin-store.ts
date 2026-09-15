import 'server-only'
import { randomUUID } from 'node:crypto'
import { hash, compare } from 'bcryptjs'
import { database, transaction } from './db'
import { authMode } from './auth-config'
import { AuthError, type AdminProfile, type Registration } from './registration'

type Account = AdminProfile & { password_hash: string }
const state = globalThis as unknown as { deploymentDemoAccounts?: Map<string, Account>; deploymentDemoReady?: Promise<void> }
const demoAccounts = state.deploymentDemoAccounts ??= new Map<string, Account>()
const demoEmail = 'admin@demo.sentri.test'
export const DEMO_CREDENTIALS = { email: demoEmail, password: 'SentriDemo123!' }
async function prepareDemo() {
  await (state.deploymentDemoReady ??= hash(DEMO_CREDENTIALS.password, 12).then(password_hash => {
    demoAccounts.set(demoEmail, { userId: 'demo-admin', companyId: 'demo-company', company: 'SENTRI Demo Company', name: 'Demo Administrator', email: demoEmail, role: 'admin', password_hash })
  }))
}
function profile(account: Account): AdminProfile {
  const { password_hash: _, ...publicAccount } = account
  return publicAccount
}
const accountQuery = `SELECT u.user_id::text AS "userId", e.full_name AS name, u.email, u.role,
  c.company_id::text AS "companyId", c.company_name AS company, u.password_hash
  FROM users u JOIN employees e ON e.employee_id = u.employee_id
  JOIN departments d ON d.department_id = e.department_id
  JOIN companies c ON c.company_id = d.company_id
  WHERE u.role = 'admin' AND e.is_active = true`

export async function registerAdmin(data: Registration): Promise<AdminProfile> {
  const passwordHash = await hash(data.password, 12)
  if (authMode() === 'demo') {
    await prepareDemo()
    if (demoAccounts.has(data.email)) throw new AuthError('This email is already registered. Please sign in.', 409)
    if (demoAccounts.size >= 100) throw new AuthError('Demo account capacity reached. Restart the demo server to clear it.', 503)
    const account: Account = { userId: randomUUID(), companyId: randomUUID(), company: data.company, name: data.name, email: data.email, role: 'admin', password_hash: passwordHash }
    demoAccounts.set(data.email, account)
    return profile(account)
  }
  try {
    return await transaction(async client => {
      // Serialize case-insensitive email registration across instances, without changing existing data.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [data.email])
      const existing = await client.query('SELECT 1 FROM users WHERE lower(email) = $1 UNION ALL SELECT 1 FROM employees WHERE lower(work_email) = $1 LIMIT 1', [data.email])
      if (existing.rowCount) throw new AuthError('This email is already registered. Please sign in.', 409)
      const company = await client.query<{ company_id: number }>('INSERT INTO companies (company_code, company_name, industry) VALUES ($1,$2,$3) RETURNING company_id', [`co_${randomUUID()}`, data.company, data.industry])
      const companyId = company.rows[0].company_id
      const department = await client.query<{ department_id: number }>('INSERT INTO departments (company_id, department_code, department_name) VALUES ($1,$2,$3) RETURNING department_id', [companyId, `dep_${randomUUID()}`, data.department])
      // Rank is organization seniority, separate from the administrator permission.
      await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [`sentri-rank:${data.rank}`])
      let rank = await client.query<{ rank_id: number }>('SELECT rank_id FROM ranks WHERE lower(rank_name) = lower($1) ORDER BY rank_id LIMIT 1', [data.rank])
      if (!rank.rowCount) rank = await client.query('INSERT INTO ranks (rank_code, rank_name, seniority_level) VALUES ($1,$2,$3) RETURNING rank_id', [`rank_${randomUUID()}`, data.rank, { Staff: 1, Manager: 2, Executive: 3 }[data.rank]])
      const employee = await client.query<{ employee_id: number }>('INSERT INTO employees (employee_code, department_id, rank_id, full_name, position_title, work_email) VALUES ($1,$2,$3,$4,$5,$6) RETURNING employee_id', [`emp_${randomUUID()}`, department.rows[0].department_id, rank.rows[0].rank_id, data.name, data.title, data.email])
      const user = await client.query<{ user_id: number }>(`INSERT INTO users (user_code, employee_id, username, email, password_hash, role) VALUES ($1,$2,$3,$4,$5,'admin') RETURNING user_id`, [`usr_${randomUUID()}`, employee.rows[0].employee_id, `admin_${randomUUID()}`, data.email, passwordHash])
      return { userId: String(user.rows[0].user_id), companyId: String(companyId), name: data.name, email: data.email, company: data.company, role: 'admin' }
    })
  } catch (error) {
    if ((error as { code?: string }).code === '23505') throw new AuthError('This email is already registered. Please sign in.', 409)
    throw error
  }
}

// A valid hash for a missing account keeps failed login work comparable to a real password check.
const dummyHash = hash('unused-' + randomUUID(), 12)
export async function loginAdmin(email: string, password: string): Promise<AdminProfile> {
  const mode = authMode()
  let account: Account | undefined
  if (mode === 'demo') { await prepareDemo(); account = demoAccounts.get(email) }
  else {
    const result = await database().query<Account>(`${accountQuery} AND lower(u.email) = $1 LIMIT 2`, [email])
    // Ambiguous legacy case-variant emails must be resolved before granting access.
    if (result.rows.length === 1) account = result.rows[0]
  }
  const matches = await compare(password, account?.password_hash ?? await dummyHash)
  if (!account || !matches) throw new AuthError('Work email or password is incorrect.', 401)
  if (mode === 'database') await database().query('UPDATE users SET last_login_at = now() WHERE user_id = $1', [account.userId])
  return profile(account)
}

export async function findAdmin(userId: string): Promise<AdminProfile | null> {
  if (authMode() === 'demo') {
    await prepareDemo()
    const account = [...demoAccounts.values()].find(account => account.userId === userId)
    return account ? profile(account) : null
  }
  if (!/^\d+$/.test(userId)) return null
  const result = await database().query<Account>(`${accountQuery} AND u.user_id = $1`, [userId])
  return result.rows[0] ? profile(result.rows[0]) : null
}
