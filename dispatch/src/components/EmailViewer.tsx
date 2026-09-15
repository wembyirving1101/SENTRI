'use client'

import { ChevronLeft, ChevronRight, MoreVertical, Paperclip } from 'lucide-react'
import { Email } from '@/lib/types'
import { useClickSound } from '@/lib/useClickSound'

interface EmailViewerProps {
  email: Email
  onInvestigate: (categoryId: string) => void
  investigatedCategories: Set<string>
  isEmbedded?: boolean
}

export default function EmailViewer({ email, isEmbedded = false }: EmailViewerProps) {
  const playClickSound = useClickSound()
  const initials = email.from.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  const colors = ['#817c64', '#697e75', '#657d84', '#93816d', '#798368', '#94865f']
  const hash = email.from.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return (
    <article className={`email-viewer ${isEmbedded ? '' : 'email-viewer-standalone metal-frame'}`} aria-label="Selected email">
      {!isEmbedded && <>
        <header className="email-window-heading"><h2>EMAIL INVESTIGATION</h2><div className="email-viewer-toolbar">
          <button className="console-button" onClick={playClickSound} aria-label="Previous email"><ChevronLeft size={18}/></button>
          <button className="console-button" onClick={playClickSound} aria-label="Next email"><ChevronRight size={18}/></button>
          <button className="console-button" onClick={playClickSound} aria-label="More email options"><MoreVertical size={18}/></button>
        </div></header>
        <div className="email-viewer-tabs"><button>INBOX (5)</button><button>SENT</button></div>
      </>}
      <div className="email-reading-pane">
        <div className="email-subject-heading"><h1>{email.subject}</h1></div>
        <div className="email-sender-header">
          <div className="email-sender-avatar" style={{ backgroundColor: colors[hash % colors.length] }} aria-hidden="true">{initials}</div>
          <div className="email-sender-details"><p className="email-sender-name">{email.from}</p><p>{email.senderDomain}</p><p>to: {email.to}</p></div>
          <span className="email-sender-time">{email.timestamp}</span>
        </div>
        {email.workContext && <div className="email-work-context"><strong>Work context:</strong> {email.workContext}</div>}
        <div className="email-message-body">{email.body.split(/(\[[^\]\n]+\]\([^)]+\))/g).map((part, index) => {
          const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
          return link ? <span key={index}><span className="email-inline-link">{link[1]}</span><span className="email-link-destination"> ({link[2]})</span></span> : part
        })}</div>
        {email.attachments.length > 0 && <div className="email-attachments">{email.attachments.map((attachment, index) => (
          <div key={index} className="email-attachment"><Paperclip size={27} aria-hidden="true"/><div><p>{attachment.name}</p><small>{attachment.size} KB</small></div></div>
        ))}</div>}
      </div>
    </article>
  )
}
