import { NextRequest } from 'next/server'
import { loginAdmin } from '@/lib/admin-store'
import { credentials } from '@/lib/registration'
import { authMode, sessionSecret } from '@/lib/auth-config'
import { createSession, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/admin-session'
import { failure, formBody, json, throttle } from '@/lib/auth-http'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    const data = credentials(await formBody(request))
    throttle(`login:${data.email}`)
    sessionSecret()
    const admin = await loginAdmin(data.email, data.password)
    const response = json({ mode: authMode(), admin })
    response.cookies.set(SESSION_COOKIE, createSession(admin.userId), { httpOnly: true, secure: process.env.NODE_ENV === 'production' || request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS })
    return response
  } catch (error) { return failure(error) }
}
