import 'server-only'
import { randomBytes } from 'node:crypto'
import { AuthError, type AuthMode } from './registration'

const state = globalThis as unknown as { deploymentDemoSecret?: string }
export function authMode(): AuthMode {
  const mode = process.env.DEPLOYMENT_AUTH_MODE ?? 'demo'
  if (mode !== 'demo' && mode !== 'database') throw new AuthError('Authentication mode is not configured correctly.', 503)
  return mode
}

export function sessionSecret() {
  if (authMode() === 'demo') return state.deploymentDemoSecret ??= randomBytes(32).toString('hex')
  const secret = process.env.DEPLOYMENT_SESSION_SECRET
  if (!secret || secret.length < 32) throw new AuthError('Admin sign-in is not configured. Please contact your administrator.', 503)
  return secret
}
