export type Rank = 'Staff' | 'Manager' | 'Executive'
export type Invitation = 'Not sent' | 'Pending' | 'Accepted' | 'Expired'
export type Employee = { id: string; name: string; email: string; employeeId: string; department: string; rank: Rank; title: string; active: boolean; invitation: Invitation }
export const departments = ['IT & Security', 'Human Resources', 'Finance', 'Accounting', 'Operations', 'Sales & Marketing', 'Customer Support', 'Procurement', 'Legal & Compliance', 'Research & Development', 'Management']
export const template = 'Full Name,Work Email,Employee ID,Department,Rank,Title,Employment Status\r\nAlex Example,alex@example.com,EMP-005,Operations,Staff,Operations Specialist,True\r\n'
export const sampleEmployees: Employee[] = [
  { id: 'sample-1', name: 'Jason Lee', email: 'jason@example.com', employeeId: 'EMP-001', department: 'Finance', rank: 'Staff', title: 'Financial Analyst', active: true, invitation: 'Pending' },
  { id: 'sample-2', name: 'Sarah Wong', email: 'sarah@example.com', employeeId: 'EMP-002', department: 'Human Resources', rank: 'Manager', title: 'HR Manager', active: true, invitation: 'Accepted' },
  { id: 'sample-3', name: 'Daniel Tan', email: 'daniel@example.com', employeeId: 'EMP-003', department: 'IT & Security', rank: 'Staff', title: 'Support Specialist', active: true, invitation: 'Not sent' },
  { id: 'sample-4', name: 'Maya Chen', email: 'maya@example.com', employeeId: 'EMP-004', department: 'Sales & Marketing', rank: 'Executive', title: 'Marketing Director', active: false, invitation: 'Expired' },
]
export function employeeError(employee: Employee, existing: Employee[]) {
  if (![employee.name, employee.email, employee.employeeId, employee.department, employee.title].every(value => value.trim())) return 'Complete all required fields.'
  if (employee.name.length > 120 || employee.email.length > 150 || employee.employeeId.length > 80 || employee.department.length > 100 || employee.title.length > 100) return 'A field exceeds its allowed length (name 120, email 150, employee ID 80, department/title 100).'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) return 'Enter a valid work email.'
  if (!['Staff', 'Manager', 'Executive'].includes(employee.rank)) return 'Rank must be Staff, Manager, or Executive.'
  if (existing.some(item => item.id !== employee.id && item.email.toLowerCase() === employee.email.toLowerCase())) return 'This work email already exists.'
  if (existing.some(item => item.id !== employee.id && item.employeeId.toLowerCase() === employee.employeeId.toLowerCase())) return 'This employee ID already exists.'
  return ''
}

/** Parse quoted CSV fields, escaped quotes, CRLF and embedded line breaks. */
export function parseCSV(source: string): string[][] {
  const text = source.replace(/^\uFEFF/, '')
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false; let closed = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (char === '"') { quoted = false; closed = true }
      else field += char
    } else if (char === ',') { row.push(field); field = ''; closed = false }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field); if (row.some(value => value.trim())) rows.push(row)
      row = []; field = ''; closed = false
    } else if (char === '"') {
      if (field || closed) throw new Error('Unexpected quote. Use the CSV template and try again.')
      quoted = true
    } else {
      if (closed && char.trim()) throw new Error('Unexpected text after a quoted field.')
      if (!closed) field += char
    }
  }
  if (quoted) throw new Error('A quoted field is not closed. Check the CSV file.')
  row.push(field); if (row.some(value => value.trim())) rows.push(row)
  return rows
}
export type ImportRow = { line: number; employee: Employee; issue: string; kind: 'ready' | 'warning' | 'error' }
export function reviewCSV(source: string, existing: Employee[]): ImportRow[] {
  const [headers, ...rows] = parseCSV(source)
  if (!headers || rows.length === 0) throw new Error('The file must contain column headers and at least one employee.')
  if (rows.length > 2000) throw new Error('Import up to 2,000 employees at a time.')
  const normalized = headers.map(value => value.trim().toLowerCase())
  if (new Set(normalized).size !== normalized.length) throw new Error('The file contains duplicate column headers.')
  const required = ['full name', 'work email', 'employee id', 'department', 'rank', 'title']
  const missing = required.filter(name => !normalized.includes(name))
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}.`)
  const seen = [...existing]
  return rows.map((row, index) => {
    const get = (name: string) => (row[normalized.indexOf(name)] ?? '').trim()
    const rawRank = get('rank')
    const rank = (['Staff', 'Manager', 'Executive'].find(value => value.toLowerCase() === rawRank.toLowerCase()) ?? rawRank) as Rank
    const status = get('employment status').toLowerCase()
    const employee: Employee = { id: `import-${index}`, name: get('full name'), email: get('work email').toLowerCase(), employeeId: get('employee id'), department: get('department'), rank, title: get('title'), active: !['false', 'inactive'].includes(status), invitation: 'Not sent' }
    let issue = row.length !== headers.length ? 'Column count does not match the header.' : employeeError(employee, seen.map(item => ({ ...item, id: `existing-${item.id}` })))
    if (!issue && status && !['true', 'false', 'active', 'inactive'].includes(status)) issue = 'Employment Status must be True/False or Active/Inactive.'
    const kind = issue ? (/already exists/.test(issue) ? 'warning' : 'error') : 'ready'
    if (!issue) seen.push(employee)
    return { line: index + 2, employee, kind, issue: issue || 'Ready' }
  })
}
