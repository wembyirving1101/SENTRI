import { X } from 'lucide-react'
import { Email } from '@/lib/types'
import { useClickSound } from '@/lib/useClickSound'

interface DecisionModalProps {
  email: Email
  onDecide: (decision: 'legitimate' | 'phishing') => void
  onClose: () => void
}

export default function DecisionModal({
  email,
  onDecide,
  onClose,
}: DecisionModalProps) {
  const playClickSound = useClickSound()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/55 p-6 backdrop-blur-md">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-md border border-border bg-card/95 shadow-2xl shadow-background/40">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/80 px-6 py-4">
          <h2 className="text-base font-bold uppercase tracking-[0.16em] text-foreground">
            Make Your Decision
          </h2>
          <button
            onClick={() => {
              playClickSound()
              onClose()
            }}
            className="p-1 hover:bg-border rounded transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-4 px-6 py-5">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
              From
            </label>
            <p className="text-sm text-foreground font-medium">{email.from}</p>
            <p className="text-xs text-muted-foreground">{email.senderDomain}</p>
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
              Subject
            </label>
            <p className="text-sm text-foreground">{email.subject}</p>
          </div>

          <div className="border-t border-border pt-4">
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">
              Your Determination
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Based on your investigation, is this email legitimate or phishing?
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-border bg-secondary/80 px-6 py-4">
          <button
            onClick={() => {
              playClickSound()
              onDecide('phishing')
            }}
            className="flex-1 rounded-md bg-destructive px-4 py-3 text-sm font-bold uppercase tracking-wide text-black transition-opacity hover:opacity-90"
          >
            Phishing
          </button>
          <button
            onClick={() => {
              playClickSound()
              onDecide('legitimate')
            }}
            className="flex-1 rounded-md bg-green-600 px-4 py-3 text-sm font-bold uppercase tracking-wide text-black transition-opacity hover:opacity-90"
          >
            Legitimate
          </button>
        </div>
      </div>
    </div>
  )
}
