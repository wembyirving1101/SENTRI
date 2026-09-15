import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { authMode, sessionSecret } from './auth-config'

export const SESSION_COOKIE = 'sentri_deployment_session'
export const SESSION_SECONDS = 60 * 60 * 8
function signature(payload: string) { return createHmac('sha256', sessionSecret()).update(payload).digest('base64url') }
export function createSession(userId: string, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ userId, mode: authMode(), purpose: 'deployment-admin', expires: now + SESSION_SECONDS * 1000 })).toString('base64url')
  return `${payload}.${signature(payload)}`
}
export function sessionUser(token: string | undefined, now = Date.now()): string | null {
  if (!token || token.length > 2048) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const expected = Buffer.from(signature(parts[0]))
    const supplied = Buffer.from(parts[1])
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString())
    return payload.purpose === 'deployment-admin' && payload.mode === authMode() && typeof payload.userId === 'string' && Number.isFinite(payload.expires) && payload.expires > now ? payload.userId : null
  } catch { return null }
}
