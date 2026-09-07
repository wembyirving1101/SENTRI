'use client'

import { Mail } from 'lucide-react'
import EmailInbox from './EmailInbox'
import EmailViewer from './EmailViewer'
import { Email } from '@/lib/types'

interface EmailInvestigationProps {
  emails: Email[]
  selectedEmailId: string | null
  currentEmail: Email | undefined
  onSelectEmail: (emailId: string) => void
  onInvestigate: (categoryId: string) => void
  investigatedCategories: Set<string>
}

export default function EmailInvestigation({
  emails,
  selectedEmailId,
  currentEmail,
  onSelectEmail,
  onInvestigate,
  investigatedCategories,
}: EmailInvestigationProps) {
  return (
    <div className="flex-1 h-full bg-[#171b1d] border border-[#3a3f42] rounded flex flex-col">
      {/* Level 2 Header - Dark and Sticky */}
      <div className="bg-[#171b1d] border-b border-[#3a3f42] px-4 py-5 z-10 flex items-center gap-3">
        <Mail size={24} className="text-muted-foreground flex-shrink-0" />
        <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
          EMAIL INVESTIGATION
        </h2>
      </div>

      {/* Level 3 Content Area - Beige with padding to show Level 1 border */}
      <div className="flex-1 flex bg-[#d3cdc1] m-1 rounded">
        {/* Inbox Section */}
        <div className="w-80 flex flex-col bg-[#d3cdc1] border-r border-[#c5b8a8] p-2 gap-2">
          <div className="bg-[#d3cdc1] rounded border border-[#c5b8a8] px-2 py-1 text-xs font-medium text-[#000000]">
            <span className="uppercase">Inbox ({emails.length})</span>
          </div>
          <div className="flex-1 space-y-2">
            {emails.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[#666666] text-sm text-center">No email tasks available</p>
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmailId === email.id

                return (
                  <button
                    key={email.id}
                    onClick={() => onSelectEmail(email.id)}
                    className={`w-full text-left px-3 py-3 rounded border transition-colors ${
                      isSelected
                        ? 'bg-success text-[#000000] border-success'
                        : 'bg-[#d3cdc1] text-[#000000] border-[#c5b8a8] hover:bg-[#cbc0b5] hover:text-[#000000]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Email Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {email.from}
                        </p>
                        <p className="text-xs opacity-70 truncate">
                          {email.subject}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs opacity-70 flex-shrink-0">
                        {email.timestamp}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Email Viewer Section */}
        {currentEmail ? (
          <EmailViewer
            email={currentEmail}
            onInvestigate={onInvestigate}
            investigatedCategories={investigatedCategories}
            isEmbedded={true}
          />
        ) : (
          <div className="flex-1 bg-[#d3cdc1] flex items-center justify-center">
            <p className="text-[#666666] text-center">
              {emails.length === 0 ? 'No email tasks available' : 'Select an email to view'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
