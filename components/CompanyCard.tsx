import { Building2 } from 'lucide-react'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface CompanyCardProps {
  companyName: string
  department: string
  role: 'Associate' | 'Executive' | 'Manager'
}

export default function CompanyCard({ companyName, department, role }: CompanyCardProps) {
  return (
    <div className={cn('bg-card rounded p-4', borderVariants({ variant: 'emphasis' }))}>
      <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-3">
        COMPANY
      </div>
      
      <div className="flex gap-3 items-start">
        <div className={cn('w-10 h-10 bg-secondary rounded flex items-center justify-center flex-shrink-0', borderVariants({ variant: 'divider' }))}>
          <Building2 size={20} className="text-accent" />
        </div>
        
        <div className="flex-1">
          <div className="text-base font-bold text-foreground uppercase tracking-wide leading-tight">
            {companyName}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {role.toUpperCase()}
          </div>
          <div className={cn('text-sm text-muted-foreground mt-2 pt-2', borderVariants({ variant: 'divider' }), 'border-t')}>
            {department}
          </div>
        </div>
      </div>
    </div>
  )
}
