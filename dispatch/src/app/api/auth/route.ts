import { NextRequest, NextResponse } from 'next/server'
import { createSession, SESSION_COOKIE, SESSION_SECONDS } from '@/lib/auth'

function sameOrigin(request: NextRequest) {
  return request.headers.get('origin') === request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  let input
  try { input = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (input?.email !== 'admin' || input?.password !== '123') {
    return NextResponse.json({ error: 'Work email or password is incorrect.' }, { status: 401 })
  }
  try {
    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, createSession(), {
      httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: SESSION_SECONDS,
    })
    response.headers.set('Cache-Control', 'no-store')
    return response
  } catch {
    return NextResponse.json({ error: 'Sign-in is unavailable. Please contact your administrator.' }, { status: 503 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  const response = NextResponse.json({ ok: true })
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, secure: request.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 0 })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
