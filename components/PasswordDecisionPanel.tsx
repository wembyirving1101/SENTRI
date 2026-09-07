'use client'

import { Check, X, AlertCircle } from 'lucide-react'
import { useClickSound } from '@/lib/useClickSound'

interface PasswordDecisionPanelProps {
  onMakeDecision: (decision: 'approve' | 'revision' | 'reject') => void
}

export default function PasswordDecisionPanel({ onMakeDecision }: PasswordDecisionPanelProps) {
  const playClickSound = useClickSound()
  return (
    <div className="h-16 bg-[#171b1d] border border-[#3a3f42] rounded flex items-center justify-center gap-6 px-6 py-2">
      {/* Decision Label */}
      <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase mr-2">DECISION</span>

      {/* Decision Buttons */}
      <button
        onClick={() => {
          playClickSound()
          onMakeDecision('approve')
        }}
        className="px-8 py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded transition-colors flex items-center gap-2"
      >
        <Check size={18} />
        APPROVE
      </button>
      <button
        onClick={() => {
          playClickSound()
          onMakeDecision('revision')
        }}
        className="px-8 py-3 bg-yellow-700 hover:bg-yellow-600 text-white font-bold rounded transition-colors flex items-center gap-2"
      >
        <AlertCircle size={18} />
        REQUIRE REVISION
      </button>
      <button
        onClick={() => {
          playClickSound()
          onMakeDecision('reject')
        }}
        className="px-8 py-3 bg-red-700 hover:bg-red-600 text-white font-bold rounded transition-colors flex items-center gap-2"
      >
        <X size={18} />
        REJECT
      </button>
    </div>
  )
}
