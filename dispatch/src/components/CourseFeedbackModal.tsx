'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import { useDialogFocus } from '@/lib/useDialogFocus'
import { EXP_UNIT, type CourseView } from '@/lib/emailCourse'

export default function CourseFeedbackModal({ active, busy, onContinue }: {
  active: NonNullable<CourseView['active']>; busy: boolean; onContinue: () => void;
}) {
  useDialogFocus(true, () => {})
  const feedback = active.feedback!
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-card/55 p-6 backdrop-blur-md">
    <section role="dialog" aria-modal="true" aria-labelledby="course-feedback-title" className={`flex w-full max-w-lg flex-col overflow-hidden rounded-md border bg-card/95 shadow-2xl ${feedback.passed ? 'border-green-500' : 'border-destructive'}`}>
      <div className="px-6 py-4 flex items-center justify-center gap-3">
        {feedback.passed ? <CheckCircle className="text-green-500" size={28} /> : <XCircle size={28} />}
        <h2 id="course-feedback-title" className="text-xl font-bold uppercase">{feedback.passed ? 'Passed!' : feedback.terminal ? 'Case review' : 'Try again'}</h2>
      </div>
      <div className="px-6 py-6 space-y-5">
        <p>Submission {feedback.attempt} of {feedback.attemptLimit} · {Math.round(feedback.performance * 100)}% performance</p>
        <p className="text-2xl font-bold">+{(feedback.earnedUnits / EXP_UNIT).toLocaleString(undefined, { maximumFractionDigits: 2 })} EXP</p>
        <p className="text-sm leading-relaxed">{feedback.message}</p>
        {feedback.decision && <p><strong>Reviewed decision:</strong> {feedback.decision}</p>}
        {feedback.supportingEvidence && <p className="text-sm"><strong>Supporting evidence:</strong> {feedback.supportingEvidence.map(id => active.public.evidence.find(e => e.id === id)?.label ?? id).join(', ')}</p>}
      </div>
      <div className="border-t border-border px-6 py-4 bg-secondary">
        <button disabled={busy} onClick={onContinue} className="w-full py-3 px-4 bg-accent text-accent-foreground font-bold text-sm rounded uppercase disabled:opacity-50">
          {busy ? 'Saving…' : feedback.terminal ? 'Continue' : 'Review evidence again'}
        </button>
      </div>
    </section>
  </div>
}
