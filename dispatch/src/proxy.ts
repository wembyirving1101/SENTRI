import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, validSession } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  const authenticated = validSession(request.cookies.get(SESSION_COOKIE)?.value)
  if (path === '/api/auth') return NextResponse.next()
  if (path === '/login') {
    return authenticated ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next()
  }
  if (!authenticated) {
    if (path.startsWith('/api/')) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/design-preview', '/api/:path*'],
}
