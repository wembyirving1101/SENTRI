export const industries = ['Technology', 'Financial services', 'Healthcare', 'Manufacturing', 'Education', 'Retail & commerce', 'Professional services', 'Government & public sector', 'Energy & utilities', 'Transportation & logistics', 'Other']
export const departments = ['IT & Security', 'Human Resources', 'Finance', 'Accounting', 'Operations', 'Sales & Marketing', 'Customer Support', 'Procurement', 'Legal & Compliance', 'Research & Development', 'Management', 'Other']
export const ranks = ['Staff', 'Manager', 'Executive']
export type AuthMode = 'demo' | 'database'
export interface AdminProfile { userId: string; name: string; email: string; companyId: string; company: string; role: 'admin' }
export interface Registration { company: string; industry: string; name: string; email: string; department: string; rank: string; title: string; password: string }

export class AuthError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}

function field(input: Record<string, unknown>, key: string, limit: number) {
  const value = input[key]
  if (typeof value !== 'string' || !value.trim() || value.trim().length > limit) throw new AuthError(`Please enter a valid ${key} (up to ${limit} characters).`)
  return value.trim()
}

export function credentials(input: unknown, registering = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AuthError('Invalid form data.')
  const data = input as Record<string, unknown>
  const email = field(data, 'email', 150).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError('Please enter a valid email address.')
  const password = data.password
  // bcrypt only uses the first 72 UTF-8 bytes. Reject longer inputs instead of truncating.
  if (typeof password !== 'string' || password.length < (registering ? 12 : 1) || new TextEncoder().encode(password).length > 72) {
    throw new AuthError(registering ? 'Use a password of at least 12 characters and at most 72 UTF-8 bytes.' : 'Please enter a valid password.')
  }
  return { email, password }
}

export function registration(input: unknown): Registration {
  const auth = credentials(input, true)
  const data = input as Record<string, unknown>
  const industry = field(data, 'industry', 100)
  const department = field(data, 'department', 100)
  const rank = field(data, 'rank', 100)
  if (!industries.includes(industry) || !departments.includes(department) || !ranks.includes(rank)) throw new AuthError('Please select a valid industry, department, and rank.')
  return {
    ...auth, company: field(data, 'company', 120), name: field(data, 'name', 120),
    industry: industry === 'Other' ? field(data, 'otherIndustry', 100) : industry,
    department: department === 'Other' ? field(data, 'otherDepartment', 100) : department,
    rank, title: field(data, 'title', 100),
  }
}
