import { Mail } from 'lucide-react'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'
import { useClickSound } from '@/lib/useClickSound'
import { DispatchItem } from '@/lib/types'

interface TasksPanelProps {
  currentTaskType: 'email' | 'password' | 'data-classification'
  onSelectTask: (taskType: 'email' | 'password' | 'data-classification') => void
  dispatchQueue: DispatchItem[]
}

export default function TasksPanel({ currentTaskType, onSelectTask, dispatchQueue }: TasksPanelProps) {
  const playClickSound = useClickSound()
  
  const emailCount = dispatchQueue.filter((item) => item.type === 'email').length
  const tasks = [
    {
      id: 'email',
      icon: Mail,
      label: 'Email Investigation',
      active: currentTaskType === 'email',
      count: emailCount,
    },
  ]

  return (
    <div className={cn('bg-card rounded p-4 flex-1 flex flex-col', borderVariants({ variant: 'emphasis' }))}>
      <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-3">
        TASKS
      </h2>
      <div className="space-y-2 flex-1">
        {tasks.map((task) => {
          const Icon = task.icon
          return (
            <button
              key={task.id}
              onClick={() => {
                playClickSound()
                onSelectTask(task.id as any)
              }}
              className={`w-full flex items-center gap-2 px-4 py-3 rounded text-base font-bold transition-colors ${
                task.active
                  ? 'bg-success text-success-foreground hover:opacity-90'
                  : 'bg-secondary text-foreground hover:bg-opacity-75'
              }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left font-bold">{task.label}</span>
              {task.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-destructive text-destructive-foreground rounded text-xs font-bold">
                  {task.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
