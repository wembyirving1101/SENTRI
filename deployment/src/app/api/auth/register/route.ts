import { NextRequest } from 'next/server'
import { registerAdmin } from '@/lib/admin-store'
import { registration } from '@/lib/registration'
import { authMode, sessionSecret } from '@/lib/auth-config'
import { failure, formBody, json, throttle } from '@/lib/auth-http'

export const runtime = 'nodejs'
export async function POST(request: NextRequest) {
  try {
    const data = registration(await formBody(request))
    throttle(`register:${data.email}`)
    sessionSecret() // Fail before creating an account if database sign-in is not configured.
    const admin = await registerAdmin(data)
    return json({ mode: authMode(), admin }, 201)
  } catch (error) { return failure(error) }
}
