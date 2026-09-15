import { CheckCircle, XCircle } from 'lucide-react'
import { Email } from '@/lib/types'
import { useClickSound } from '@/lib/useClickSound'

interface FeedbackModalProps {
  email: Email
  userDecision: 'legitimate' | 'phishing'
  attemptNumber: number
  isCorrect: boolean
  checkedInvestigationIds: string[]
  onContinue: () => void
}

export default function FeedbackModal({
  email,
  userDecision,
  attemptNumber,
  isCorrect,
  checkedInvestigationIds,
  onContinue,
}: FeedbackModalProps) {
  const playClickSound = useClickSound()
  const investigationIds = ['profile', 'link', 'file', 'language', 'context', 'request'] as const
  const requiredIds = email.requiredInvestigationCategories ?? Object.entries(email.investigationStates ?? {})
    .filter(([, state]) => state === 'suspicious')
    .map(([id]) => id as typeof investigationIds[number])
  const selectedIds = new Set(checkedInvestigationIds)
  const missingIds = requiredIds.filter((id) => !selectedIds.has(id))
  const unnecessaryIds = checkedInvestigationIds.filter((id) => !requiredIds.includes(id as typeof investigationIds[number]))
  const categoryLabels: Record<string, string> = {
    profile: 'Profile', link: 'Link', file: 'File', language: 'Language', context: 'Context', request: 'Request',
  }
  const missingHintCopy: Record<string, [string, string, string]> = {
    profile: [
      "There's another part of this email that you should verify before trusting it.",
      "Pay close attention to who actually sent this message and whether the domain is authentic.",
      "You should investigate the sender profile and domain.",
    ],
    link: [
      "There's another part of this email that you should verify before trusting it.",
      "Pay close attention to where the email's link actually leads.",
      "You should investigate the link destination.",
    ],
    file: [
      "Something included with this message may deserve a closer look.",
      "Pay close attention to the attached file and what it asks you to do.",
      "You should investigate the attached file.",
    ],
    language: [
      "Look more closely at how this message is written.",
      "Pay attention to the tone, wording, and pressure used in the message.",
      "You should investigate the language and phishing patterns.",
    ],
    context: [
      "Consider whether the situation described in this email makes sense.",
      "Pay close attention to urgency, timing, and whether this request fits the context.",
      "You should investigate the context and urgency of this message.",
    ],
    request: [
      "Consider what this message is asking you to do.",
      "Pay close attention to whether the requested action or access is unusual.",
      "You should investigate the request for access or information.",
    ],
  }
  const missingHint = missingIds[0]
    ? missingHintCopy[missingIds[0]][Math.min(attemptNumber, 3) - 1]
    : email.isLegitimate
      ? attemptNumber >= 3
        ? 'The information in this email appears consistent with a legitimate message.'
        : 'Before flagging another element, reconsider whether the email actually contains anything suspicious.'
      : attemptNumber >= 3
        ? "You've identified the important indicators. Remove anything you've flagged that isn't actually suspicious."
        : "You've identified the important indicators. Take another look at whether everything you've flagged is actually suspicious."

  const correctAnswer = email.isLegitimate ? 'legitimate' : 'phishing'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/55 p-6 backdrop-blur-md">
      <div className={`flex w-full max-w-lg flex-col overflow-hidden rounded-md border bg-card/95 shadow-2xl shadow-card/40 ${
        isCorrect ? 'border-green-500' : 'border-destructive'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-center gap-3 ${
          isCorrect ? 'bg-green-900 bg-opacity-20' : 'bg-destructive bg-opacity-20'
        }`}>
          {isCorrect ? (
            <>
              <CheckCircle size={28} className="text-green-500" />
              <h2 className="text-xl font-bold text-green-400 uppercase tracking-wide">
                Correct!
              </h2>
            </>
          ) : (
            <>
              <XCircle size={28} className="text-foreground" />
              <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                Incorrect!
              </h2>
            </>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Your Decision */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">
              Your Decision
            </label>
            <div className={`p-3 rounded border-l-4 ${
              isCorrect 
                ? 'bg-green-900 bg-opacity-20 border-green-500'
                : 'bg-destructive bg-opacity-20 border-destructive'
            }`}>
                <p className="text-sm font-bold uppercase tracking-wide text-primary-foreground">
                  {userDecision === 'phishing' ? 'Phishing' : 'Legitimate'}
                </p>
            </div>
          </div>

          {/* Hint after each wrong attempt; reveal the answer only on attempt four. */}
          {!isCorrect && attemptNumber < 4 && (
            <div className="rounded-md border border-border bg-secondary/70 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-xs font-bold uppercase tracking-wide text-foreground">
                  Sentri Hint
                </label>
                <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                  Attempt {attemptNumber} of 4
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {missingHint}
              </p>
            </div>
          )}

          {!isCorrect && attemptNumber >= 4 && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-green-400 uppercase block mb-2">Correct Answer</label>
                <div className="p-3 rounded border-l-4 bg-green-900 bg-opacity-20 border-green-500">
                  <p className="text-sm font-bold uppercase tracking-wide text-green-400">{correctAnswer}</p>
                </div>
              </div>
              <div className="border-t border-border pt-4 text-xs text-muted-foreground">
                <p><span className="font-bold text-foreground">Required investigation:</span> {requiredIds.map((id) => categoryLabels[id]).join(', ') || 'None'}</p>
                <p className="mt-2"><span className="font-bold text-foreground">Unnecessary investigation:</span> {unnecessaryIds.map((id) => categoryLabels[id]).join(', ') || 'None'}</p>
                <p className="mt-2">Your checklist must contain exactly the required categories. Missing or extra selections make the answer incorrect.</p>
              </div>
            </div>
          )}

          {/* Email Details */}
          <div className="border-t border-border pt-4 space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                From
              </label>
              <p className="text-sm text-foreground font-medium">{email.from}</p>
              <p className="text-xs text-muted-foreground">{email.senderDomain}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-1">
                Subject
              </label>
              <p className="text-sm text-foreground">{email.subject}</p>
            </div>
          </div>

          {/* Key Indicators */}
          {!isCorrect && (
            <div className="border-t border-border pt-4">
              <label className="text-xs font-bold text-muted-foreground uppercase block mb-2">
                Red Flags
              </label>
              <ul className="space-y-1 text-xs">
                {email.redFlags && email.redFlags.map((flag, idx) => (
                  <li key={idx} className="text-muted-foreground flex gap-2">
                    <span className="text-destructive">▸</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="border-t border-border px-6 py-4 bg-secondary">
          <button
            onClick={() => {
              playClickSound()
              onContinue()
            }}
            className="w-full py-3 px-4 bg-accent text-accent-foreground font-bold text-sm rounded uppercase hover:opacity-90 transition-opacity"
            >
            {isCorrect || attemptNumber >= 4 ? 'Continue to Next Case' : 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  )
}
