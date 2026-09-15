import { Bot } from 'lucide-react'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface ProgressPanelProps {
  tasksCompleted?: number
  tasksTotal?: number
}

export default function ProgressPanel({ tasksCompleted = 2, tasksTotal = 4 }: ProgressPanelProps) {
  const progressPercentage = (tasksCompleted / tasksTotal) * 100

  return (
    <div className={cn('bg-card rounded p-4 flex-1 flex flex-col', borderVariants({ variant: 'emphasis' }))}>
      <div className="space-y-4 flex-1">
        {/* Progress Section */}
        <div>
          <h2 className="text-xs font-bold tracking-widest text-muted-foreground mb-3 uppercase">
            PROGRESS
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">TODAY&apos;S TASKS</span>
              <span className="font-mono text-sm font-bold text-accent">{tasksCompleted}/{tasksTotal}</span>
            </div>
            <div className={cn('bg-secondary rounded h-4', borderVariants({ variant: 'divider' }))}>
              <div 
                className="bg-success h-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sentri Bot Section */}
      <div className={cn('pt-4 mt-4', borderVariants({ variant: 'divider' }), 'border-t')}>
        <div className="flex gap-3">
          <div className={cn('w-12 h-12 bg-secondary rounded flex items-center justify-center flex-shrink-0', borderVariants({ variant: 'divider' }))}>
            <Bot size={24} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">SENTRI</p>
            <p className="text-xs text-muted-foreground leading-tight mt-1">
              Investigate carefully. Collect evidence before you decide.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
