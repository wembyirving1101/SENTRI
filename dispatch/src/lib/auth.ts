import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'sentri_dispatch_session'
export const SESSION_SECONDS = 60 * 60 * 24 * 30

function signature(payload: string) {
  const secret = process.env.DISPATCH_SESSION_SECRET
  if (!secret) throw new Error('DISPATCH_SESSION_SECRET is not configured')
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createSession(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ user: 'admin', expires: now + SESSION_SECONDS * 1000 })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function validSession(token: string | undefined, now = Date.now()) {
  if (!token) return false
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return false
    const [payload, supplied] = parts
    const expected = Buffer.from(signature(payload))
    const actual = Buffer.from(supplied)
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return session.user === 'admin' && Number.isFinite(session.expires) && session.expires > now
  } catch { return false }
}
