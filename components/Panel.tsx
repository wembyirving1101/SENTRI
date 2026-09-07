import React from 'react'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface PanelProps {
  children: React.ReactNode
  className?: string
  border?: 'default' | 'emphasis' | 'strongEmphasis' | 'divider'
}

export default function Panel({ children, className = '', border = 'emphasis' }: PanelProps) {
  return (
    <div
      className={cn(
        'bg-panel text-panel-foreground rounded flex flex-col',
        borderVariants({ variant: border }),
        className
      )}
    >
      {children}
    </div>
  )
}
