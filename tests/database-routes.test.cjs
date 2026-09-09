const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const path = require('node:path')

// Exercise route logic with an isolated database double; never connect to real data.
function loadRoute(relative, query) {
  const exports = {}
  const source = fs.readFileSync(path.join(__dirname, '..', relative), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  vm.runInNewContext(code, {
    exports, console,
    require: (name) => {
      if (name === 'next/server') return { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } }
      if (name === '@/lib/db') return { isDatabaseConfigured: () => true, withTransaction: (fn) => fn({ query }) }
      throw new Error(name)
    },
  })
  return exports
}

for (const scenario of [
  { label: 'first correct answer', number: 1, categories: ['link'], delta: 5, correct: true },
  { label: 'second correct answer', number: 2, categories: ['link'], delta: 2, correct: true },
  { label: 'third correct answer', number: 3, categories: ['link'], delta: 0, correct: true },
  { label: 'fourth answer with missing evidence', number: 4, categories: [], delta: -1, correct: false },
]) {
  test(scenario.label, async () => {
    let delta
    const route = loadRoute('app/api/attempts/route.ts', async (sql, values) => {
      if (sql.includes('SELECT a.attempt_id')) return { rows: [{ attempt_id: '1', assignment_id: '1', user_id: 1,
        correct_decision: 'phishing', base_experience: 30, incident_code: 'email', started_at: new Date(),
        raw_content: { requiredInvestigationCategories: ['link'] } }] }
      if (sql.includes('UPDATE user_progress')) { delta = values[2]; return { rows: [{ graduation_percentage: '55' }] } }
      return { rows: [] }
    })
    const result = await route.POST({ json: async () => ({ attemptId: '1', decision: 'phishing',
      investigatedCategories: scenario.categories, attemptNumber: scenario.number }) })
    assert.equal(result.status, 200)
    assert.equal(result.body.isCorrect, scenario.correct)
    assert.equal(delta, scenario.delta)
  })
}

test('resume locks the user and returns existing assignment without inserting', async () => {
  const statements = []
  const route = loadRoute('app/api/tasks/next/route.ts', async (sql) => {
    statements.push(sql)
    if (sql.includes('SELECT ta.user_id')) return { rows: [{ assignment_id: '12', attempt_id: '13',
      raw_content: { id: 'email-existing' }, incident_code: 'email', match_score: '50' }] }
    return { rows: [] }
  })
  const result = await route.POST({ json: async () => ({ userCode: 'test-user' }) })
  assert.equal(result.body.attemptId, '13')
  assert.match(statements[0], /FOR UPDATE/)
  assert.equal(statements.some((sql) => sql.includes('INSERT')), false)
})

test('regular generation excludes known assignments and selects the requested task type', async () => {
  const calls = []
  const route = loadRoute('app/api/tasks/next/route.ts', async (sql, values) => {
    calls.push({ sql, values })
    return { rows: [] }
  })
  const result = await route.POST({ json: async () => ({ userCode: 'test-user',
    taskType: 'data-classification', knownAssignmentIds: ['12'] }) })
  assert.equal(result.status, 404)
  const active = calls.find(call => call.sql.includes('SELECT ta.user_id'))
  assert.match(active.sql, /NOT \(ta.assignment_id::text = ANY/)
  assert.deepEqual(Array.from(active.values), ['test-user', ['12'], 'data-classification'])
  const candidate = calls.find(call => call.sql.includes('WITH player'))
  assert.match(candidate.sql, /it.incident_code = \$2/)
  assert.deepEqual(Array.from(candidate.values), ['test-user', 'data-classification'])
})

test('invalid generation options are rejected before querying the database', async () => {
  const route = loadRoute('app/api/tasks/next/route.ts', async () => { throw new Error('Unexpected query') })
  const result = await route.POST({ json: async () => ({ userCode: 'test-user', taskType: 'invalid' }) })
  assert.equal(result.status, 400)
})
