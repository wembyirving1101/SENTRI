import { Email, Password, DataClassification, InvestigationId, InvestigationPerformance } from './types'

export const investigationIds: InvestigationId[] = ['profile', 'link', 'language', 'file', 'request', 'context']

export function createInitialInvestigationPerformance(): InvestigationPerformance {
  return Object.fromEntries(investigationIds.map((id) => [id, 0])) as InvestigationPerformance
}

export function updateInvestigationPerformance(
  performance: InvestigationPerformance,
  email: Email,
  selectedIds: Set<string>,
  attemptNumber: number,
  finalReveal: boolean,
): InvestigationPerformance {
  const expected = new Set(email.requiredInvestigationCategories ?? [])
  return Object.fromEntries(investigationIds.map((id) => {
    const selected = selectedIds.has(id)
    const shouldBeSelected = expected.has(id)
    let delta = selected === shouldBeSelected ? 0 : 1
    if (shouldBeSelected && selected && attemptNumber === 1 && !finalReveal) delta = -1
    if (shouldBeSelected && selected && attemptNumber === 2 && !finalReveal) delta = -0.25
    if (shouldBeSelected && selected && attemptNumber >= 3 && !finalReveal) delta = 0
    if (finalReveal && shouldBeSelected && !selected) delta = 2
    if (finalReveal && !shouldBeSelected && selected) delta = 1
    return [id, Math.max(0, performance[id] + delta)]
  })) as InvestigationPerformance
}

export function selectAdaptiveEmail(
  emails: Email[],
  performance: InvestigationPerformance,
  usedIds: Set<string>,
): Email | null {
  const available = emails.filter((email) => !usedIds.has(email.id))
  if (!available.length) return null
  const scores = available.map((email) => {
    const criteria = email.requiredInvestigationCategories ?? []
    const weakness = criteria.reduce((sum, id) => sum + performance[id], 0)
    return { email, weight: 1 + weakness }
  })
  const total = scores.reduce((sum, item) => sum + item.weight, 0)
  let cursor = Math.random() * total
  for (const item of scores) {
    cursor -= item.weight
    if (cursor <= 0) return item.email
  }
  return scores.at(-1)?.email ?? null
}


export function selectRandomFromArray<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function getRandomDelay(min: number = 7000, max: number = 15000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generateRandomIncident(
  emails: Email[],
  passwords: Password[],
  documents: DataClassification[],
  usedIncidents: Set<string> = new Set()
): { type: 'email' | 'password' | 'data-classification'; id: string; payload: Email | Password | DataClassification } | null {
  const catalogs = [
    { type: 'email' as const, weight: 70, items: emails.filter(item => !usedIncidents.has(item.id)) },
    { type: 'data-classification' as const, weight: 20, items: documents.filter(item => !usedIncidents.has(item.id)) },
    { type: 'password' as const, weight: 10, items: passwords.filter(item => !usedIncidents.has(item.id)) },
  ].filter(catalog => catalog.items.length > 0)
  let cursor = Math.random() * catalogs.reduce((sum, catalog) => sum + catalog.weight, 0)
  for (const catalog of catalogs) {
    cursor -= catalog.weight
    if (cursor < 0) {
      const payload = selectRandomFromArray<Email | Password | DataClassification>(catalog.items)
      return { type: catalog.type, id: payload.id, payload }
    }
  }
  return null
}

export function getUniqueRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, array.length))
}
