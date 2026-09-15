import type { TaskType } from '@/lib/types'

// Keep the phase engine available, but use ordinary mixed practice for now.
// This shared switch controls both the interface and API routing.
export const TRAINING_CONFIG = { phaseProgressionEnabled: false }

export const REGULAR_TASK_SEQUENCE: readonly TaskType[] = [
  'email', 'email', 'data-classification', 'email', 'email',
  'password', 'email', 'data-classification', 'email', 'email',
]

// Seven emails, two classification tasks and one password task per ten slots.
export function regularTaskType(index: number): TaskType {
  return REGULAR_TASK_SEQUENCE[index % REGULAR_TASK_SEQUENCE.length]
}
