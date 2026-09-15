const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { parseEnv } = require('node:util')
const { Pool } = require('pg')
const { compare } = require('bcryptjs')

test('PostgreSQL registration, login, tenant ownership, duplicate rejection, and rollback', async () => {
  const file = path.resolve(__dirname, '../.env.local')
  const local = fs.existsSync(file) ? parseEnv(fs.readFileSync(file, 'utf8')) : {}
  const connectionString = process.env.DATABASE_URL || local.DATABASE_URL
  assert.ok(connectionString, 'Configure DATABASE_URL before running database tests')
  const pool = new Pool({ connectionString, max: 1, connectionTimeoutMillis: 10000 })
  let client
  try {
    client = await pool.connect()
    await client.query('BEGIN')
    // Only temporary tables and their own temporary sequences are written.
    // pg_temp first ensures production tables cannot be touched by the store queries.
    await client.query('SET LOCAL search_path TO pg_temp')
    const schema = fs.readFileSync(path.resolve(__dirname, '../../dispatch/database/schema.sql'), 'utf8')
    const identity = schema.slice(schema.indexOf('CREATE TABLE companies'), schema.indexOf('-- SEGMENT B:'))
      .replaceAll('CREATE TABLE ', 'CREATE TEMP TABLE ')
    await client.query(identity)
    const load = require('./load-typescript.cjs')({
      './db': {
        database: () => client,
        transaction: async work => {
          await client.query('SAVEPOINT registration_test')
          try { const result = await work(client); await client.query('RELEASE SAVEPOINT registration_test'); return result }
          catch (error) { await client.query('ROLLBACK TO SAVEPOINT registration_test'); throw error }
        },
      },
    })
    process.env.DEPLOYMENT_AUTH_MODE = 'database'
    const store = load('src/lib/admin-store.ts')
    const { registration } = load('src/lib/registration.ts')
    const input = { company: 'Database Test Company', industry: 'Technology', name: 'Test Administrator', email: 'admin@integration.test', password: 'IntegrationPass123!', department: 'Finance', rank: 'Manager', title: 'Finance Lead' }
    const first = await store.registerAdmin(registration(input))
    assert.equal(first.role, 'admin')
    assert.equal(first.company, input.company)
    assert.equal('password_hash' in first, false)
    const saved = (await client.query('SELECT password_hash FROM users WHERE user_id = $1', [first.userId])).rows[0]
    assert.notEqual(saved.password_hash, input.password)
    assert.equal(await compare(input.password, saved.password_hash), true)
    assert.deepEqual(await store.loginAdmin(input.email, input.password), first)
    assert.equal((await client.query('SELECT last_login_at IS NOT NULL AS logged_in FROM users WHERE user_id = $1', [first.userId])).rows[0].logged_in, true)
    await assert.rejects(store.loginAdmin(input.email, 'IncorrectPassword!'), { status: 401 })
    await assert.rejects(store.registerAdmin(registration({ ...input, email: input.email.toUpperCase() })), { status: 409 })
    assert.equal((await client.query('SELECT count(*)::int AS count FROM companies')).rows[0].count, 1)
    const second = await store.registerAdmin(registration({ ...input, email: 'second@integration.test', company: 'Second Company' }))
    assert.notEqual(second.companyId, first.companyId)
    assert.deepEqual(await store.findAdmin(first.userId), first)
    assert.equal((await client.query('SELECT count(*)::int AS count FROM ranks')).rows[0].count, 1)
    // Simulate a final-write failure: earlier company/department/employee inserts must roll back.
    await client.query("ALTER TABLE users ADD CONSTRAINT reject_test_user CHECK (email <> 'fail@integration.test')")
    await assert.rejects(store.registerAdmin(registration({ ...input, email: 'fail@integration.test' })))
    assert.equal((await client.query('SELECT count(*)::int AS count FROM companies')).rows[0].count, 2)
    assert.equal((await client.query('SELECT count(*)::int AS count FROM employees')).rows[0].count, 2)
    await client.query("UPDATE users SET role = 'player' WHERE user_id = $1", [first.userId])
    assert.equal(await store.findAdmin(first.userId), null)
    await assert.rejects(store.loginAdmin(input.email, input.password), { status: 401 })
    await client.query('UPDATE employees SET is_active = false WHERE employee_id = (SELECT employee_id FROM users WHERE user_id = $1)', [second.userId])
    assert.equal(await store.findAdmin(second.userId), null)
    await assert.rejects(store.loginAdmin('second@integration.test', input.password), { status: 401 })
  } finally {
    if (client) { await client.query('ROLLBACK'); client.release() }
    await pool.end()
  }
})
