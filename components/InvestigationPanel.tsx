import { AlertTriangle, User, Link2, FileText, MessageCircle, Share2 } from 'lucide-react'
import { InvestigationCategory } from '@/lib/types'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'
import { useClickSound } from '@/lib/useClickSound'

interface InvestigationPanelProps {
  investigationList: InvestigationCategory[]
  onMakeDecision: () => void
  onCheckboxChange?: (categoryId: string) => void
  onVerify?: () => void
}

export default function InvestigationPanel({
  investigationList,
  onMakeDecision,
  onCheckboxChange,
  onVerify,
}: InvestigationPanelProps) {
  const playClickSound = useClickSound()
  const checkedCount = investigationList.filter((item) => item.checked).length

  return (
    <div className={cn('w-[430px] h-full bg-[#171b1d] rounded flex flex-col', borderVariants({ variant: 'emphasis' }))}>
      {/* Level 2 Header - Dark and Sticky */}
      <div className={cn('bg-[#171b1d] px-4 py-5 flex items-center justify-between', borderVariants({ variant: 'divider' }), 'border-b')}>
        <div className="flex items-center gap-3">
          <AlertTriangle size={20} className="text-destructive flex-shrink-0" />
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
            INVESTIGATION LIST
          </h2>
        </div>
        <p className="text-sm text-muted-foreground font-bold">
          {checkedCount}/{investigationList.length}
        </p>
      </div>

      {/* Level 3 Content Area - Beige with margin */}
      <div className="flex-1 flex flex-col bg-[#d3cdc1] m-1 rounded min-h-0">
        {/* Investigation items container - scrollable if needed */}
        <div className="flex-1 overflow-y-auto">
          {investigationList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-[#666666] text-center">No email tasks available</p>
            </div>
          ) : (
            investigationList.map((item, index) => {
            const iconMap = {
              profile: <User size={40} className="text-[#999] flex-shrink-0" strokeWidth={1.5} />,
              link: <Link2 size={40} className="text-[#999] flex-shrink-0" strokeWidth={1.5} />,
              file: <FileText size={40} className="text-[#999] flex-shrink-0" strokeWidth={1.5} />,
              language: <MessageCircle size={40} className="text-[#999] flex-shrink-0" strokeWidth={1.5} />,
              context: <Share2 size={40} className="text-[#999] flex-shrink-0" strokeWidth={1.5} />,
              request: <Share2 size={40} className="text-[#999] flex-shrink-0" strokeWidth={1.5} />,
            }
            
            return (
              <div
                key={item.id}
                className={cn('bg-[#d3cdc1] p-4 flex items-start justify-between gap-4', index !== investigationList.length - 1 ? 'border-b-2 border-[#c5b8a8]' : '')}
              >
                <div className="flex gap-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {iconMap[item.id as keyof typeof iconMap]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-[#000000] mb-1">{item.label}</p>
                    <p className="text-base text-[#5a5a5a] mb-2">{item.description}</p>
                    {item.hasEvidence && (
                      <p className="text-base font-semibold text-[#7a9d6d]">✓ Evidence collected</p>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => {
                      playClickSound()
                      onCheckboxChange?.(item.id)
                    }}
                    className="w-6 h-6 cursor-pointer border-2 border-[#a89a8a] rounded"
                    style={{
                      backgroundColor: '#c1b5a8',
                      accentColor: '#c1b5a8',
                    }}
                  />
                </div>
              </div>
            )
            })
          )}
        </div>

        {/* Contact People Button */}
        {onVerify && (
          <div className={cn(borderVariants({ variant: 'divider' }), 'border-t px-3 py-3')}>
            <button
              onClick={() => {
                playClickSound()
                onVerify()
              }}
              className="w-full py-3 px-3 rounded font-bold text-sm uppercase tracking-wide transition-colors bg-[#c1b5a8] text-[#000000] hover:bg-[#b5a89a]"
            >
              Contact People
            </button>
          </div>
        )}

        {/* Evidence Collected Section */}
        <div className={cn(borderVariants({ variant: 'divider' }), 'border-t px-3 py-3')}>
          <p className="text-sm font-bold text-[#000000] uppercase mb-2">
            Evidence Collected
          </p>
          <p className="text-base text-[#000000] mb-3">
            Review the clues you&apos;ve found to build your case.
          </p>
        </div>

        {/* Make Decision Button */}
        <div className={cn(borderVariants({ variant: 'divider' }), 'border-t px-3 py-3')}>
          <button
            onClick={() => {
              playClickSound()
              onMakeDecision()
            }}
            className="w-full py-3 rounded font-bold text-base uppercase tracking-wide transition-colors bg-[#282c2f] text-white hover:bg-[#323539]"
          >
            Make a Decision
          </button>
        </div>
      </div>
    </div>
  )
}
