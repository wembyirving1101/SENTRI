import { NextRequest } from 'next/server'
import { authMode } from '@/lib/auth-config'
import { findAdmin, DEMO_CREDENTIALS } from '@/lib/admin-store'
import { SESSION_COOKIE, sessionUser } from '@/lib/admin-session'
import { failure, json, sameOrigin } from '@/lib/auth-http'

export const runtime = 'nodejs'
export async function GET(request: NextRequest) {
  try {
    const mode = authMode()
    const userId = sessionUser(request.cookies.get(SESSION_COOKIE)?.value)
    const admin = userId ? await findAdmin(userId) : null
    return json({ mode, admin, ...(mode === 'demo' ? { demoCredentials: DEMO_CREDENTIALS } : {}) })
  } catch (error) { return failure(error) }
}
export async function DELETE(request: NextRequest) {
  try {
    sameOrigin(request)
    const response = json({ ok: true })
    response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production' || request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 })
    return response
  } catch (error) { return failure(error) }
}
