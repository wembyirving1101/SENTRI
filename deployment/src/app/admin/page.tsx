'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import TerminalShell from '@/components/TerminalShell'
import AdminDialog from '@/components/AdminDialog'
import { departments, employeeError, reviewCSV, sampleEmployees, template, type Employee, type ImportRow, type Rank } from '@/lib/employees'

const STORAGE = 'sentri-admin-preview-v1'
const emptyEmployee = (): Employee => ({ id: '', name: '', email: '', employeeId: '', department: '', rank: 'Staff', title: '', active: true, invitation: 'Not sent' })

export default function Admin() {
  const [employees, setEmployees] = useState<Employee[]>(sampleEmployees)
  const [loaded, setLoaded] = useState(false)
  const [company, setCompany] = useState('Kahfung Industries')
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All employees')
  const [modal, setModal] = useState<'employee' | 'import' | 'invite' | 'notes' | 'handbook' | null>(null)
  const [draft, setDraft] = useState<Employee>(emptyEmployee)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [notes, setNotes] = useState('')
  const [rows, setRows] = useState<ImportRow[]>([])
  const [filename, setFilename] = useState('')
  const [reading, setReading] = useState(false)
  const readId = useRef(0)
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE)
      if (saved) {
        const state = JSON.parse(saved)
        if (Array.isArray(state.employees) && state.employees.every((e: Employee) => typeof e?.id === 'string' && typeof e.active === 'boolean' && ['Not sent','Pending','Accepted','Expired'].includes(e.invitation) && [e.name,e.email,e.employeeId,e.department,e.title,e.rank].every(v => typeof v === 'string'))) setEmployees(state.employees)
        if (typeof state.notes === 'string') setNotes(state.notes)
      }
      const registration = sessionStorage.getItem('sentri-company-preview')
      if (registration) setCompany(registration)
    } catch { setNotice('Saved preview data could not be read. Showing sample employees.') }
    setLoaded(true)
  }, [])
  useEffect(() => { if (loaded) { try { localStorage.setItem(STORAGE, JSON.stringify({ employees, notes })) } catch { setNotice('Browser storage is unavailable. Changes will last only for this session.') } } }, [employees, notes, loaded])
  const active = employees.filter(e => e.active).length
  const visible = employees.filter(e => `${e.name} ${e.email} ${e.employeeId} ${e.department}`.toLowerCase().includes(search.toLowerCase()) && (filter === 'All employees' || (filter === 'Active' ? e.active : filter === 'Inactive' ? !e.active : e.invitation === filter)))
  const eligible = (e: Employee) => e.active && e.invitation !== 'Accepted'
  const visibleEligible = visible.filter(eligible)
  const recipients = employees.filter(e => selected.includes(e.id) && eligible(e))
  const allSelected = visibleEligible.length > 0 && visibleEligible.every(e => selected.includes(e.id))
  function open(next: typeof modal) { setError(''); setModal(next) }
  function close() { readId.current++; setReading(false); setModal(null); setError('') }
  function saveEmployee(event: React.FormEvent) {
    event.preventDefault()
    const clean = { ...draft, name: draft.name.trim(), email: draft.email.trim().toLowerCase(), employeeId: draft.employeeId.trim(), title: draft.title.trim(), department: draft.department.trim() }
    const problem = employeeError(clean, employees)
    if (problem) { setError(problem); return }
    const previous = employees.find(e => e.id === clean.id)
    if (previous && previous.email !== clean.email) clean.invitation = 'Not sent'
    setEmployees(old => clean.id ? old.map(e => e.id === clean.id ? clean : e) : [...old, { ...clean, id: crypto.randomUUID() }])
    setSelected(old => old.filter(id => id !== clean.id)); setNotice(previous ? 'Employee profile updated.' : 'Employee added to the queue.'); close()
  }
  async function readFile(file?: File) {
    if (!file) return
    const id = ++readId.current; setError(''); setRows([]); setFilename(file.name)
    if (!file.name.toLowerCase().endsWith('.csv')) { setError('Choose a .csv file.'); return }
    if (file.size > 2 * 1024 * 1024) { setError('Choose a file smaller than 2 MB.'); return }
    setReading(true)
    try { const text = await file.text(); if (id === readId.current) setRows(reviewCSV(text, employees)) }
    catch (error) { if (id === readId.current) setError(error instanceof Error ? error.message : 'Unable to read this file.') }
    finally { if (id === readId.current) setReading(false) }
  }
  function importRows() {
    const valid = rows.filter(row => row.kind === 'ready').map(row => ({ ...row.employee, id: crypto.randomUUID() }))
    const checked = [...employees]
    for (const e of valid) { const problem = employeeError(e, checked); if (problem) { setError(`${e.name}: ${problem} Please select the file again.`); return } checked.push(e) }
    setEmployees(checked); setNotice(`${valid.length} employees imported. No invitations sent.`); close()
  }
  function downloadTemplate() { const url = URL.createObjectURL(new Blob([template], { type: 'text/csv;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'sentri-employee-template.csv'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  const field = (key: keyof Employee, value: string | boolean) => setDraft(old => ({ ...old, [key]: value }))
  return <TerminalShell title="COMPANY DEPLOYMENT" stage="ADMIN">
    <section className="admin-workspace">
      <div className="admin-page-heading"><div><span className="eyebrow">COMPANY CONTROL CENTER</span><h1>{company}</h1><p>EMPLOYEE DEPLOYMENT</p></div><span className="preview-stamp">LOCAL PREVIEW</span></div>
      <div className="admin-preview-note">Sample workspace · Changes are saved in this browser only. Invitations are simulated.</div>
      {notice && <div className="admin-notice" role="status"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
      <div className="admin-grid"><aside className="admin-sidebar"><section className="panel employee-stats"><div className="panel-heading"><h2>EMPLOYEES</h2><span>PERSONNEL</span></div><div className="stat-total"><strong>{employees.length.toString().padStart(2,'0')}</strong><span>TOTAL RECORDS</span></div><div className="stat-split"><span><i className="status-light" />{active} ACTIVE</span><span>{employees.length-active} INACTIVE</span></div><div className="sidebar-actions"><button disabled={!loaded} className="button primary" onClick={() => { setDraft(emptyEmployee()); open('employee') }}>＋ ADD EMPLOYEE</button><button disabled={!loaded} className="button" onClick={() => { setRows([]); setFilename(''); open('import') }}>↓ IMPORT CSV</button></div></section><section className="panel admin-companion"><div className="panel-heading"><h2>SENTRI</h2><span className="status-light" /></div><img src="/sentri.png" alt="SENTRI, your deployment assistant" /><p>“Let’s get your people ready.”</p><small>Add your team, review their details, then prepare invitations.</small></section></aside>
      <section className="panel queue-panel"><div className="panel-heading"><h2>DEPLOYMENT QUEUE</h2><span>{employees.length} RECORDS</span></div><div className="queue-toolbar"><label><span className="sr-only">Search employees</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, ID, department…" /></label><label><span className="sr-only">Filter employees</span><select value={filter} onChange={e=>setFilter(e.target.value)}>{['All employees','Active','Inactive','Not sent','Pending','Accepted','Expired'].map(value=><option key={value}>{value}</option>)}</select></label></div>
        <div className="queue-table-wrap"><table className="employee-table"><thead><tr><th><input type="checkbox" aria-label="Select all eligible visible employees" disabled={!visibleEligible.length} checked={allSelected} onChange={()=>setSelected(old=>allSelected ? old.filter(id=>!visibleEligible.some(e=>e.id===id)) : [...new Set([...old,...visibleEligible.map(e=>e.id)])])} /></th><th>NAME / EMPLOYEE ID</th><th>DEPARTMENT</th><th>RANK</th><th>EMPLOYMENT</th><th>INVITATION</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{visible.map(e=><tr key={e.id} className={selected.includes(e.id)?'selected-row':''}><td><input type="checkbox" aria-label={`Select ${e.name}`} checked={selected.includes(e.id)} disabled={!eligible(e)} title={!e.active ? 'Inactive employees cannot be invited' : e.invitation==='Accepted' ? 'Invitation already accepted' : undefined} onChange={()=>setSelected(old=>old.includes(e.id)?old.filter(id=>id!==e.id):[...old,e.id])} /></td><td><strong>{e.name}</strong><small>{e.employeeId}</small></td><td>{e.department}</td><td>{e.rank}</td><td><span className={`employment ${e.active?'active':'inactive'}`}>{e.active?'Active':'Inactive'}</span></td><td><span className={`invitation ${e.invitation.toLowerCase().replace(' ','-')}`}>{e.invitation}</span></td><td><button className="edit-link" aria-label={`Edit ${e.name}`} onClick={()=>{setDraft({...e});open('employee')}}>EDIT</button></td></tr>)}</tbody></table>{!visible.length&&<div className="empty-queue"><h3>No employees found</h3><p>{employees.length?'Try another search or filter.':'Add an employee or import a CSV to begin.'}</p></div>}</div>
        <div className="queue-footer"><div><strong>{recipients.length} SELECTED</strong><small>{visible.length} of {employees.length} shown · Inactive and accepted records cannot be selected.</small></div><button className="button primary" disabled={!recipients.length} onClick={()=>open('invite')}>SEND INVITATIONS →</button></div>
      </section></div>
      <div className="admin-desk"><span className="desk-brand">SENTRI</span><button onClick={()=>open('handbook')}>▤ HANDBOOK</button><button onClick={()=>open('notes')}>▧ NOTES</button><span className="desk-summary">DEPLOYMENT STATUS <b>{employees.length} EMPLOYEES</b></span><Link href="/">EXIT PANEL ↗</Link></div>
    </section>
    {modal==='employee'&&<AdminDialog title={draft.id?'EDIT EMPLOYEE':'NEW EMPLOYEE'} onClose={close}><form onSubmit={saveEmployee}><span className="eyebrow">EMPLOYEE PROFILE</span><label htmlFor="employee-name">FULL NAME</label><input id="employee-name" required maxLength={120} value={draft.name} onChange={e=>field('name',e.target.value)} autoComplete="off" /><div className="fields-grid"><div><label htmlFor="employee-email">WORK EMAIL</label><input id="employee-email" required type="email" maxLength={254} value={draft.email} onChange={e=>field('email',e.target.value)} /></div><div><label htmlFor="employee-id">EMPLOYEE ID</label><input id="employee-id" required maxLength={80} value={draft.employeeId} onChange={e=>field('employeeId',e.target.value)} /></div><div><label htmlFor="employee-department">DEPARTMENT</label><input id="employee-department" list="department-options" required maxLength={100} value={draft.department} onChange={e=>field('department',e.target.value)} /><datalist id="department-options">{departments.map(d=><option key={d} value={d}/>)}</datalist></div><div><label htmlFor="employee-rank">RANK</label><select id="employee-rank" value={draft.rank} onChange={e=>field('rank',e.target.value as Rank)}>{['Staff','Manager','Executive'].map(r=><option key={r}>{r}</option>)}</select></div></div><label htmlFor="employee-title">TITLE</label><input id="employee-title" required maxLength={120} value={draft.title} onChange={e=>field('title',e.target.value)} /><fieldset className="employment-options"><legend>EMPLOYMENT STATUS</legend><label><input type="radio" name="employment" checked={draft.active} onChange={()=>field('active',true)} />ACTIVE</label><label><input type="radio" name="employment" checked={!draft.active} onChange={()=>field('active',false)} />INACTIVE</label></fieldset>{error&&<p className="form-error" role="alert">{error}</p>}<div className="form-footer"><button type="button" className="button" onClick={close}>CANCEL</button><button className="button primary" type="submit">{draft.id?'SAVE CHANGES':'ADD EMPLOYEE'}</button></div></form></AdminDialog>}
    {modal==='import'&&<AdminDialog title={rows.length?'IMPORT REVIEW':'EMPLOYEE DATA IMPORT'} wide={!!rows.length} onClose={close}>{!rows.length?<><p className="dialog-description">Load a personnel file. Review every record before adding it to the queue.</p><div className="csv-drop" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void readFile(e.dataTransfer.files[0])}}><span aria-hidden="true">⇩</span><strong>DROP CSV FILE HERE</strong><button className="button" disabled={reading} onClick={()=>fileInput.current?.click()}>OR SELECT FILE</button><small>CSV · up to 2 MB / 2,000 records</small><input ref={fileInput} className="sr-only" type="file" accept=".csv,text/csv" onChange={e=>{void readFile(e.target.files?.[0]);e.target.value=''}} aria-label="Choose employee CSV" /></div><p className="csv-columns"><strong>REQUIRED COLUMNS</strong>Full Name · Work Email · Employee ID · Department · Rank · Title<br /><small>Optional: Employment Status (True/False). Defaults to Active.</small></p><button className="button" onClick={downloadTemplate}>↓ DOWNLOAD TEMPLATE</button>{reading&&<p role="status">Reading {filename}…</p>}</>:<><div className="import-file"><strong>{filename}</strong><span>{rows.length} RECORDS DETECTED</span></div><div className="import-counts"><span>✓ {rows.filter(r=>r.kind==='ready').length} VALID</span><span>△ {rows.filter(r=>r.kind==='warning').length} WARNINGS</span><span>× {rows.filter(r=>r.kind==='error').length} ERRORS</span></div><div className="import-table-wrap"><table className="employee-table"><thead><tr><th>ROW</th><th>NAME / EMAIL</th><th>DEPARTMENT</th><th>REVIEW</th></tr></thead><tbody>{rows.map(row=><tr key={row.line}><td>{row.line}</td><td>{row.employee.name||'—'}<small>{row.employee.email||'Missing email'}</small></td><td>{row.employee.department||'—'}</td><td><span className={`review-${row.kind}`}>{row.kind==='ready'?'✓':row.kind==='warning'?'△':'×'} {row.issue}</span></td></tr>)}</tbody></table></div><p className="dialog-description">Only valid records will be imported. Duplicate and invalid records are skipped. No invitations are sent.</p><div className="form-footer"><button className="button" onClick={()=>{setRows([]);setError('')}}>← CHOOSE ANOTHER FILE</button><button className="button primary" disabled={!rows.some(r=>r.kind==='ready')} onClick={importRows}>IMPORT {rows.filter(r=>r.kind==='ready').length} VALID RECORDS</button></div></>}{error&&<p className="form-error" role="alert">{error}</p>}</AdminDialog>}
    {modal==='invite'&&<AdminDialog title="INVITATION DISPATCH" onClose={close}><h3>Review {recipients.length} recipients</h3><p className="dialog-description">Preview mode: this operation changes local statuses to Pending. It does not send email or create employee access.</p><ul className="recipient-list">{recipients.map(e=><li key={e.id}><strong>{e.name}</strong><span>{e.email}</span>{e.invitation==='Pending'&&<small>Resend simulation</small>}</li>)}</ul><div className="form-footer"><button className="button" onClick={close}>CANCEL</button><button className="button primary" onClick={()=>{setEmployees(old=>old.map(e=>recipients.some(r=>r.id===e.id)?{...e,invitation:'Pending'}:e));setNotice(`${recipients.length} invitations simulated. No emails sent.`);setSelected([]);close()}}>SIMULATE INVITATIONS →</button></div></AdminDialog>}
    {modal==='notes'&&<AdminDialog title="DEPLOYMENT NOTES" onClose={close}><label htmlFor="admin-notes">YOUR WORKSPACE NOTES</label><textarea id="admin-notes" value={notes} maxLength={10000} onChange={e=>setNotes(e.target.value)} placeholder="Keep track of your deployment checklist…" /><p className="dialog-description">Saved in this browser with your preview workspace.</p><div className="form-footer"><button className="button primary" onClick={close}>DONE</button></div></AdminDialog>}
    {modal==='handbook'&&<AdminDialog title="DEPLOYMENT HANDBOOK" onClose={close}><div className="handbook-copy"><h3>Prepare your team</h3><p>1. Add employees individually or use the CSV template.</p><p>2. Keep work emails and employee IDs unique. Rank describes the employee’s organizational level.</p><p>3. Review imported records before confirming. Duplicates and incomplete records are skipped.</p><p>4. Select active employees to prepare invitations. Accepted employees do not need another invitation.</p><h3>Employment ≠ invitation</h3><p>Active / Inactive describes employment. Not sent / Pending / Accepted / Expired describes invitation state.</p><p>This preview stores changes only in this browser. It cannot send emails or grant access.</p></div></AdminDialog>}
  </TerminalShell>
}
