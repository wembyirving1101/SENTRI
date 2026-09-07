'use client'

import { Mail, Lock, Shield, Database, FileText, Clock, User, AlertCircle } from 'lucide-react'
import { DispatchItem as QueueItem, Email, Password, DataClassification } from '@/lib/types'
import { mockEmails } from '@/lib/mockEmails'
import { mockPasswords } from '@/lib/mockPasswords'
import { mockDataClassifications } from '@/lib/mockDataClassification'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface TaskDetailsPanelProps {
  selectedQueueItem: QueueItem | null
}

export default function TaskDetailsPanel({ selectedQueueItem }: TaskDetailsPanelProps) {
  if (!selectedQueueItem) {
    return (
      <div className={cn('bg-[#171b1d] rounded h-full flex flex-col min-h-0', borderVariants({ variant: 'emphasis' }))}>
        {/* Layer 2: Header */}
        <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b')}>
          <h2 className="text-lg font-bold tracking-widest text-foreground">TASK DETAILS</h2>
        </div>
        {/* Layer 3: Panel */}
        <div className={cn('flex-1 flex items-center justify-center m-1 rounded bg-[#d3cdc1] min-h-0')}>
          <div className="text-center text-[#5a5a5a]">
            <p className="text-sm">Select a task from the queue to view details</p>
          </div>
        </div>
      </div>
    )
  }

  const getEmailDetails = () => {
    const email = selectedQueueItem.payload as Email
    if (!email) return null
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#5a5a5a] uppercase tracking-wider mb-2">
            EMAIL DETAILS
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">From</label>
              <p className="text-base text-[#000000] font-bold">{email.from}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Subject</label>
              <p className="text-base text-[#000000] font-semibold">{email.subject}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Time</label>
              <p className="text-base text-[#000000] font-semibold">{email.timestamp}</p>
            </div>
            {email.attachments && email.attachments.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground">Attachments</label>
                <div className="space-y-1 mt-1">
                  {email.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-secondary rounded text-xs">
                      <FileText size={14} />
                      <span>{att.name} ({att.size}KB)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getPasswordDetails = () => {
    const password = selectedQueueItem.payload as Password
    if (!password) return null
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#5a5a5a] uppercase tracking-wider mb-2">
            PASSWORD DETAILS
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Submitted by</label>
              <p className="text-base text-[#000000] font-bold">{password.employee}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Purpose</label>
              <p className="text-base text-[#000000] font-semibold">{password.department}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Characteristics</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {password.characteristics.map((char, idx) => (
                  <span key={idx} className="bg-[#c1b5a8] text-xs px-2 py-1 rounded text-[#000000]">
                    {char.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getDataClassificationDetails = () => {
    const doc = selectedQueueItem.payload as DataClassification
    if (!doc) return null
    
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#5a5a5a] uppercase tracking-wider mb-2">
            DATA CLASSIFICATION
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Document</label>
              <p className="text-base text-[#000000] font-bold">{doc.title}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">From</label>
              <p className="text-base text-[#000000] font-semibold">{doc.from}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Time</label>
              <p className="text-base text-[#000000] font-semibold">{doc.timestamp}</p>
            </div>
            <div>
              <label className="text-sm text-[#5a5a5a] font-semibold">Current Classification</label>
              <p className="text-base text-[#000000] font-bold">Awaiting your review</p>
            </div>
            {doc.shouldShareWith && (
              <div>
                <label className="text-sm text-[#5a5a5a] font-semibold">Sharing With</label>
                <p className="text-sm text-[#000000]">{doc.shouldShareWith}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const getTaskTypeIcon = () => {
    switch (selectedQueueItem.type) {
      case 'email':
        return <Mail size={20} className="text-accent" />
      case 'password':
        return <Lock size={20} className="text-accent" />
      case 'data-classification':
        return <Database size={20} className="text-accent" />
      default:
        return null
    }
  }

  const getTaskTypeLabel = () => {
    switch (selectedQueueItem.type) {
      case 'email':
        return 'Email Investigation'
      case 'password':
        return 'Password Review'
      case 'data-classification':
        return 'Data Classification'
      default:
        return 'Unknown Task'
    }
  }

  return (
    <div className={cn('bg-[#171b1d] rounded h-full flex flex-col min-h-0', borderVariants({ variant: 'emphasis' }))}>
      {/* Layer 2: Header */}
      <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b flex-shrink-0')}>
        <h2 className="text-lg font-bold tracking-widest text-foreground">TASK DETAILS</h2>
      </div>

      {/* Layer 3: Panel */}
      <div className={cn('flex-1 flex flex-col m-1 rounded bg-[#d3cdc1] p-6 min-h-0 overflow-y-auto')}>
        {/* Task Type Header */}
        <div className={cn('flex items-center gap-3 mb-4 pb-4', borderVariants({ variant: 'divider' }), 'border-b border-[#a89a8a] flex-shrink-0')}>
          <div className={cn('w-10 h-10 bg-[#c1b5a8] rounded flex items-center justify-center flex-shrink-0 border border-[#a89a8a]')}>
            {getTaskTypeIcon()}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#000000] uppercase tracking-wide">
              {getTaskTypeLabel()}
            </h3>
          </div>
        </div>

        {/* Details */}
        <div>
          {selectedQueueItem.type === 'email' && getEmailDetails()}
          {selectedQueueItem.type === 'password' && getPasswordDetails()}
          {selectedQueueItem.type === 'data-classification' && getDataClassificationDetails()}
        </div>

        {/* Action Button */}
        <div className={cn('pt-4 mt-4 flex-shrink-0', borderVariants({ variant: 'divider' }), 'border-t border-[#a89a8a]')}>
          <button className="w-full bg-[#7a7a7a] hover:bg-[#6a6a6a] text-white py-2 rounded font-medium text-sm transition-colors uppercase tracking-wider">
            Review Task
          </button>
        </div>
      </div>
    </div>
  )
}
