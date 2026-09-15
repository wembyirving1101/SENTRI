const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/employees.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const mod = { exports: {} }
new Function('exports', 'module', compiled)(mod.exports, mod)
const { parseCSV, reviewCSV, sampleEmployees, employeeError } = mod.exports
const headers = 'Full Name,Work Email,Employee ID,Department,Rank,Title,Employment Status\n'

test('quoted commas, escaped quotes, BOM and multiline fields parse correctly', () => {
  assert.deepEqual(parseCSV('\uFEFFa,b\r\n"one, two","line\n""quoted"""\r\n'), [['a','b'],['one, two','line\n"quoted"']])
  assert.throws(() => parseCSV('a\n"unclosed'), /not closed/)
})
test('duplicates in existing employees and within file are skipped as warnings', () => {
  const rows = reviewCSV(headers + 'Jason,jason@example.com,NEW,Finance,Staff,Analyst,True\nNew,new@example.com,NEW2,Finance,Staff,Analyst,True\nDuplicate,new@example.com,NEW3,Finance,Staff,Analyst,True', sampleEmployees)
  assert.deepEqual(rows.map(r => r.kind), ['warning','ready','warning'])
})
test('invalid ranks, missing fields, bad email and invalid employment flag are errors', () => {
  const rows = reviewCSV(headers + 'A,a@example.com,1,IT,Owner,Analyst,True\nB,b@example.com,2,IT,Staff,,True\nC,invalid,3,IT,Staff,Analyst,True\nD,d@example.com,4,IT,Staff,Analyst,Maybe', [])
  assert.deepEqual(rows.map(r=>r.kind), ['error','error','error','error'])
})
test('inactive status and optional default active are preserved', () => {
  assert.equal(reviewCSV(headers+'A,a@example.com,1,IT,staff,Analyst,False',[])[0].employee.active,false)
  const rows = reviewCSV('Full Name,Work Email,Employee ID,Department,Rank,Title\nA,a@example.com,1,IT,Staff,Analyst',[])
  assert.equal(rows[0].employee.active,true)
  assert.equal(rows[0].kind,'ready')
})
test('missing/duplicate headers and mismatched columns are rejected', () => {
  assert.throws(()=>reviewCSV('Full Name,Rank\nA,Staff',[]),/Missing columns/)
  assert.throws(()=>reviewCSV('Full Name,Full Name\nA,B',[]),/duplicate column/)
  assert.equal(reviewCSV(headers+'A,a@example.com,1,IT,Staff',[])[0].kind,'error')
})
test('editing self is allowed but case-insensitive duplicate identifiers are blocked', () => {
  assert.equal(employeeError({...sampleEmployees[0]},sampleEmployees),'')
  assert.match(employeeError({...sampleEmployees[0],id:'new',email:'JASON@example.com'},sampleEmployees),/email already exists/)
  assert.match(employeeError({...sampleEmployees[0],id:'new',email:'new@example.com',employeeId:'emp-001'},sampleEmployees),/ID already exists/)
})
