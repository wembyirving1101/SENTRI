'use client'

import GameIcon from './GameIcon'
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

export default function EmailInvestigation({ emails, selectedEmailId, currentEmail, onSelectEmail, onInvestigate, investigatedCategories }: EmailInvestigationProps) {
  return (
    <section className="email-investigation-window metal-frame" aria-label="Email investigation">
      <header className="email-window-heading"><GameIcon name="email" size={29}/><h2>EMAIL INVESTIGATION</h2></header>
      <div className="email-workspace paper-surface">
        <aside className="email-inbox" aria-label="Email inbox">
          <h3 className="email-inbox-heading">INBOX ({emails.length})</h3>
          <div className="email-inbox-list">
            {emails.length === 0 ? <p className="email-empty">No email tasks available</p> : emails.map(email => (
              <button key={email.id} onClick={() => onSelectEmail(email.id)} aria-pressed={selectedEmailId === email.id} className={`email-inbox-card ${selectedEmailId === email.id ? 'is-selected' : ''}`}>
                <span className="email-inbox-sender">{email.from}</span>
                <span className="email-inbox-subject">{email.subject}</span>
                <span className="email-inbox-time">{email.timestamp}</span>
              </button>
            ))}
          </div>
        </aside>
        {currentEmail ? <EmailViewer email={currentEmail} onInvestigate={onInvestigate} investigatedCategories={investigatedCategories} isEmbedded/> : <p className="email-empty">{emails.length === 0 ? 'No email tasks available' : 'Select an email to view'}</p>}
      </div>
    </section>
  )
}
