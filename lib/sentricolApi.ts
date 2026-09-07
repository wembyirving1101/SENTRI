import { DispatchItem } from '@/lib/types'

export interface PlayerProfile {
  userCode: string
  name: string
  department: string
  rank: string | null
  experience: number
  graduationPercentage: number
  unlockedDifficulty: number
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json()
  if (!response.ok) {
    throw new Error(body.error ?? `Request failed with ${response.status}`)
  }
  return body as T
}

export async function fetchPlayerProfile(userCode: string) {
  const response = await fetch(`/api/profile?userCode=${encodeURIComponent(userCode)}`, {
    cache: 'no-store',
  })
  return readJson<PlayerProfile>(response)
}

export async function requestPersonalizedTask(userCode: string) {
  const response = await fetch('/api/tasks/next', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userCode }),
  })
  return readJson<DispatchItem>(response)
}

export async function submitTaskDecision(input: {
  attemptId?: string
  decision: string
  attemptNumber?: number
  investigatedCategories?: string[]
  verified?: boolean
}) {
  if (!input.attemptId) return null

  const response = await fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return readJson<{
    isCorrect: boolean
    score: number
    experienceGained: number
    graduationPercentage: number
  }>(response)
}
