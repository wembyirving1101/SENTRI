'use client'

import { useEffect, useState } from 'react'
import type { AdminProfile, AuthMode } from './registration'

export interface SessionView { mode: AuthMode; admin: AdminProfile | null; demoCredentials?: { email: string; password: string } }
export async function authRequest<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api/auth/${path}`, { method, cache: 'no-store', headers: body ? { 'Content-Type': 'application/json' } : undefined, body: body ? JSON.stringify(body) : undefined })
  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'Unable to complete this request.')
  return result as T
}
export function useAdminSession() {
  const [session, setSession] = useState<SessionView | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    void authRequest<SessionView>('session').then(value => { if (!cancelled) setSession(value) }).catch(() => { if (!cancelled) setError('Unable to load account access. Please refresh to try again.') })
    return () => { cancelled = true }
  }, [])
  return { session, setSession, error }
}
