import { NextRequest } from 'next/server'
import { authMode } from '@/lib/auth-config'
import { findAdmin } from '@/lib/admin-store'
import { SESSION_COOKIE, sessionUser } from '@/lib/admin-session'
import { failure, json, sameOrigin } from '@/lib/auth-http'
import { AuthError } from '@/lib/registration'
import { inviteEmployees, listEmployees, saveEmployees } from '@/lib/employee-store'
export const runtime = 'nodejs'
async function admin(request: NextRequest) {
  const id = sessionUser(request.cookies.get(SESSION_COOKIE)?.value)
  const account = id ? await findAdmin(id) : null
  if (!account) throw new AuthError('Please sign in as a company administrator.',401)
  if (authMode() !== 'database') throw new AuthError('Employee accounts require database mode.',409)
  return account
}
export async function GET(request: NextRequest) {
  try { const account = await admin(request); return json({ employees: await listEmployees(account.companyId), company: account.company }) }
  catch(error) { return failure(error) }
}
export async function POST(request: NextRequest) {
  try {
    sameOrigin(request)
    const account = await admin(request)
    const reader = request.body?.getReader(); if (!reader) throw new AuthError('Invalid request.')
    const chunks: Uint8Array[] = []; let size = 0
    while (true) { const {value,done} = await reader.read(); if(done) break; size+=value.length; if(size>2*1024*1024) { await reader.cancel(); throw new AuthError('Import is too large.',413) }; chunks.push(value) }
    let body
    try { body = JSON.parse(Buffer.concat(chunks).toString()) } catch { throw new AuthError('Invalid request.') }
    if (body?.action==='invite') return json(await inviteEmployees(account.companyId, body.ids))
    if (body?.action==='save' && Array.isArray(body.employees)) return json({employees: await saveEmployees(account.companyId,body.employees)})
    throw new AuthError('Invalid employee operation.')
  } catch(error) { return failure(error) }
}
