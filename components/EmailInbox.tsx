import { Star } from 'lucide-react'
import { Email } from '@/lib/types'
import { useClickSound } from '@/lib/useClickSound'

interface EmailInboxProps {
  emails: Email[]
  selectedEmailId: string | null
  onSelectEmail: (emailId: string) => void
}

export default function EmailInbox({
  emails,
  selectedEmailId,
  onSelectEmail,
}: EmailInboxProps) {
  const playClickSound = useClickSound()
  return (
    <div className="flex flex-col w-80 bg-background">
      {/* Inbox Header */}
      <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
          INBOX ({emails.length})
        </h2>
      </div>

      {/* Email List */}
      <div className="flex-1 divide-y divide-border">
        {emails.map((email) => {
          const isSelected = selectedEmailId === email.id

          return (
            <button
              key={email.id}
              onClick={() => {
                playClickSound()
                onSelectEmail(email.id)
              }}
              className={`w-full text-left px-4 py-3 transition-colors hover:bg-secondary ${
                isSelected ? 'bg-secondary border-l-4 border-l-accent' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                {/* Email Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-foreground truncate">
                    {email.from}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {email.subject}
                  </p>
                </div>

                {/* Timestamp & Star Icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {email.timestamp}
                  </p>
                  <button
                    onClick={(e) => {
                      playClickSound()
                      e.stopPropagation()
                    }}
                    className="hover:text-accent transition-colors cursor-pointer"
                  >
                    <Star size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
