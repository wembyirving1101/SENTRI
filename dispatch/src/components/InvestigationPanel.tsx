import { AlertTriangle, User, Link2, FileText, MessageCircle, Share2, ClipboardList, Users } from 'lucide-react'
import { InvestigationCategory } from '@/lib/types'
import { useClickSound } from '@/lib/useClickSound'

interface InvestigationPanelProps {
  investigationList: (Omit<InvestigationCategory, 'id'> & { id: string })[]
  onMakeDecision: () => void
  onCheckboxChange?: (categoryId: string) => void
  onVerify?: () => void
  disabled?: boolean
  attemptLabel?: string
  supportingEvidence?: boolean
}

const icons = { profile: User, link: Link2, file: FileText, language: MessageCircle, context: Share2, request: ClipboardList }

export default function InvestigationPanel({ investigationList, onMakeDecision, onCheckboxChange, onVerify, disabled = false, attemptLabel, supportingEvidence = false }: InvestigationPanelProps) {
  const playClickSound = useClickSound()
  const checkedCount = investigationList.filter(item => item.checked).length

  return (
    <section className="email-evidence-window metal-frame" aria-label="Investigation list">
      <header className="email-window-heading"><AlertTriangle size={25} className="evidence-alert" aria-hidden="true"/><h2>INVESTIGATION LIST</h2><span className="evidence-counter">{attemptLabel ?? `${checkedCount}/${investigationList.length}`}</span></header>
      <div className="email-evidence-paper paper-surface">
        <div className="email-evidence-list">
          {investigationList.length === 0 ? <p className="email-empty">No email tasks available</p> : investigationList.map(item => {
            const Icon = icons[item.id as keyof typeof icons] ?? FileText
            return <div key={item.id} className={`email-evidence-item ${item.checked ? 'is-selected' : ''}`}>
              <div className="evidence-icon"><Icon size={30} strokeWidth={1.5} aria-hidden="true"/></div>
              <div className="evidence-copy"><h3>{item.label}</h3><p>{item.description}</p>{item.hasEvidence && !supportingEvidence && <span className="evidence-collected">✓ Evidence collected</span>}</div>
              <input type="checkbox" disabled={disabled} aria-label={`Use ${item.label} as evidence`} checked={item.checked} onChange={() => { playClickSound(); onCheckboxChange?.(item.id) }} className="email-evidence-checkbox"/>
            </div>
          })}
        </div>
        <div className="email-evidence-actions">
          {onVerify && <button onClick={() => { playClickSound(); onVerify() }} className="email-contact-button"><Users size={23} aria-hidden="true"/>Contact People</button>}
          <div className="email-evidence-summary"><h3>Evidence Collected</h3><p>{supportingEvidence ? 'Select the records supporting your decision, including evidence that a message is legitimate. Reading does not spend a submission.' : 'Review the clues you’ve found to build your case.'}</p></div>
          <button disabled={disabled} onClick={() => { playClickSound(); onMakeDecision() }} className="console-button email-decision-button">Make a Decision</button>
        </div>
      </div>
    </section>
  )
}
