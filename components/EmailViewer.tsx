'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical, FileText } from 'lucide-react'
import { Email } from '@/lib/types'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'
import { useClickSound } from '@/lib/useClickSound'

interface EmailViewerProps {
  email: Email
  onInvestigate: (categoryId: string) => void
  investigatedCategories: Set<string>
  isEmbedded?: boolean
}

export default function EmailViewer({
  email,
  onInvestigate,
  investigatedCategories,
  isEmbedded = false,
}: EmailViewerProps) {
  const playClickSound = useClickSound()
  const [showInvestigationPanel, setShowInvestigationPanel] = useState(true)

  // Generate avatar color based on sender name
  const getAvatarColor = (name: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F']
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  // Get initials from sender name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const investigationButtons = [
    { id: 'profile', label: 'PROFILE', icon: '👤' },
    { id: 'link', label: 'LINK', icon: '🔗' },
    { id: 'file', label: 'FILE', icon: '📄' },
    { id: 'language', label: 'LANGUAGE', icon: '💬' },
    { id: 'context', label: 'CONTEXT', icon: '🔍' },
    { id: 'request', label: 'REQUEST', icon: '⚠️' },
  ]

  const handleInvestigate = (categoryId: string) => {
    onInvestigate(categoryId)
  }

  const senderInitials = getInitials(email.from)
  const avatarColor = getAvatarColor(email.from)

  return (
    <div className={cn('flex-1 flex flex-col', isEmbedded ? 'bg-[#d3cdc1] text-[#000000]' : cn('bg-card rounded', borderVariants({ variant: 'emphasis' })))}>
      {/* Header - Only show when not embedded */}
      {!isEmbedded && (
        <>
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xs font-bold tracking-widest text-muted-foreground uppercase mb-1">
                EMAIL INVESTIGATION
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={playClickSound}
                className="p-2 hover:bg-secondary rounded transition-colors">
                <ChevronLeft size={18} className="text-muted-foreground" />
              </button>
              <button 
                onClick={playClickSound}
                className="p-2 hover:bg-secondary rounded transition-colors">
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
              <button 
                onClick={playClickSound}
                className="p-2 hover:bg-secondary rounded transition-colors">
                <MoreVertical size={18} className="text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border bg-secondary px-4 flex gap-4 text-xs font-medium text-muted-foreground">
            <button className="py-3 border-b-2 border-accent text-accent">
              INBOX (5)
            </button>
            <button className="py-3 border-b-2 border-transparent hover:text-foreground">
              SENT
            </button>
          </div>
        </>
      )}

      {/* Email Content - No Cards Design */}
      <div className="flex-1">
        <div className={isEmbedded ? 'bg-[#d3cdc1]' : 'bg-background'}>
          {/* Subject Title */}
          <div className={`border-b px-6 py-4 ${isEmbedded ? 'border-[#c5b8a8] bg-[#d3cdc1]' : 'border-border bg-card'}`}>
            <h1 className={`text-2xl font-bold ${isEmbedded ? 'text-[#000000]' : 'text-foreground'}`}>{email.subject}</h1>
          </div>

          {/* Sender Profile Section */}
          <div className={`border-b px-6 py-5 flex items-start justify-between ${isEmbedded ? 'border-[#c5b8a8] bg-[#d3cdc1]' : 'border-border bg-card'}`}>
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base flex-shrink-0"
                style={{ backgroundColor: avatarColor }}
              >
                {senderInitials}
              </div>

              {/* Sender Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-base ${isEmbedded ? 'text-[#000000]' : 'text-foreground'}`}>{email.from}</p>
                <p className={`text-sm ${isEmbedded ? 'text-[#000000] opacity-70' : 'text-muted-foreground'}`}>{email.senderDomain}</p>
                <p className={`text-sm ${isEmbedded ? 'text-[#000000] opacity-70' : 'text-muted-foreground'}`}>to: {email.to}</p>
              </div>
            </div>

            {/* Timestamp */}
            <span className={`text-sm font-mono flex-shrink-0 ml-4 ${isEmbedded ? 'text-[#000000] opacity-70' : 'text-muted-foreground'}`}>
              {email.timestamp}
            </span>
          </div>

          {/* Email Body Content */}
          {email.workContext && <div className="px-6 pt-4 text-sm leading-relaxed text-[#000000]"><strong>Work context:</strong> {email.workContext}</div>}
          <div className={`px-6 py-6 text-base leading-relaxed whitespace-pre-wrap ${isEmbedded ? 'text-[#000000]' : 'text-foreground'}`}>
            {email.body}
          </div>

          {/* Attachments */}
          {email.attachments.length > 0 && (
            <div className={`border-t px-6 py-6 ${isEmbedded ? 'border-[#c5b8a8]' : 'border-border'}`}>
              <div className="space-y-3">
                {email.attachments.map((attachment, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                      isEmbedded
                        ? 'border border-[#c5b8a8] bg-[#d3cdc1] hover:bg-[#cbc0b5] text-[#000000]'
                        : 'border border-border bg-secondary hover:bg-opacity-75 text-foreground'
                    }`}
                  >
                    <FileText size={20} className={isEmbedded ? 'text-[#000000] opacity-70 flex-shrink-0' : 'text-muted-foreground flex-shrink-0'} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-medium ${isEmbedded ? 'text-[#000000]' : 'text-foreground'}`}>{attachment.name}</p>
                      <p className={`text-sm ${isEmbedded ? 'text-[#000000] opacity-70' : 'text-muted-foreground'}`}>{attachment.size} KB</p>
                    </div>
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
