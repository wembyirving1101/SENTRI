const test = require('node:test')
const assert = require('node:assert/strict')
process.env.DISPATCH_SESSION_SECRET = 'test-only-session-signing-key'
const { createSession, validSession, SESSION_SECONDS } = require('./load-typescript.cjs')()('lib/auth.ts')
test('session persists until its 30-day expiry', () => {
  const now = 1000000
  const token = createSession(now)
  assert.equal(validSession(token, now + 1000), true)
  assert.equal(validSession(token, now + SESSION_SECONDS * 1000), false)
})
test('missing, malformed and tampered sessions are rejected', () => {
  assert.equal(validSession(undefined), false)
  assert.equal(validSession('admin'), false)
  assert.equal(validSession(createSession() + 'x'), false)
  assert.equal(validSession(Buffer.from('{"user":"admin","expires":9999999999999}').toString('base64url') + '.fake'), false)
})
