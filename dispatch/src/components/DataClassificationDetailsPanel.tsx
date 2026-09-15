import { DataClassification } from '@/lib/types'
import { FileText, Lock, Building2, Globe } from 'lucide-react'
import Panel from './Panel'
import { useClickSound } from '@/lib/useClickSound'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface DataClassificationDetailsPanelProps {
  document: DataClassification | undefined
  onClassify: (classification: 'public' | 'internal' | 'confidential' | 'restricted') => void
}

export default function DataClassificationDetailsPanel({
  document,
  onClassify,
}: DataClassificationDetailsPanelProps) {
  const playClickSound = useClickSound()

  if (!document) {
    return (
      <div className={cn('flex flex-col h-full bg-[#171b1d] min-h-0', borderVariants({ variant: 'emphasis' }))}>
        {/* Layer 2: Header */}
        <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b flex-shrink-0')}>
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-[#d3cdc1]" />
            <h2 className="text-lg font-bold tracking-widest text-foreground">CLASSIFICATION</h2>
          </div>
        </div>

        {/* Empty State */}
        <div className={cn('flex-1 flex items-center justify-center m-1 rounded bg-[#d3cdc1] min-h-0')}>
          <p className="text-[#666666] text-center">No data classification tasks available</p>
        </div>
      </div>
    )
  }

  const classifications = [
    {
      id: 'public',
      label: 'PUBLIC',
      description: 'Safe to share with anyone.',
      icon: <Globe size={24} className="text-white" />,
      color: 'bg-[#4CAF50]',
      borderColor: 'border-[#45a049]',
      textColor: 'text-white',
    },
    {
      id: 'internal',
      label: 'INTERNAL',
      description: 'For internal use only.',
      icon: <Building2 size={24} className="text-white" />,
      color: 'bg-[#2196F3]',
      borderColor: 'border-[#0b7dda]',
      textColor: 'text-white',
    },
    {
      id: 'confidential',
      label: 'CONFIDENTIAL',
      description: 'Share only with authorized individuals.',
      icon: <Lock size={24} className="text-white" />,
      color: 'bg-[#FF9800]',
      borderColor: 'border-[#e68900]',
      textColor: 'text-white',
    },
    {
      id: 'restricted',
      label: 'RESTRICTED',
      description: 'Highly sensitive. Limited access only.',
      icon: <Lock size={24} className="text-white" />,
      color: 'bg-[#F44336]',
      borderColor: 'border-[#da190b]',
      textColor: 'text-white',
    },
  ]

  return (
    <div className={cn('flex flex-col h-full bg-[#171b1d] min-h-0', borderVariants({ variant: 'emphasis' }))}>
      {/* Layer 2: Header */}
      <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b flex-shrink-0')}>
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-[#d3cdc1]" />
          <h2 className="text-lg font-bold tracking-widest text-foreground">CLASSIFICATION</h2>
        </div>
      </div>

      {/* Layer 3: Panel */}
      <div className={cn('flex-1 flex flex-col gap-4 m-1 rounded bg-[#d3cdc1] p-6 min-h-0 overflow-y-auto')}>
        {/* Task Details */}
        <Panel className="p-4 bg-[#d3cdc1] text-[#000000]">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-[#000000]" />
            <span className="text-[#5a5a5a] uppercase text-xs font-bold">TASK DETAILS</span>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[#5a5a5a] uppercase text-xs font-bold">Document</p>
              <p className="text-[#000000] font-bold mt-1">{document.title}</p>
            </div>
            <div>
              <p className="text-[#5a5a5a] uppercase text-xs font-bold">From</p>
              <p className="text-[#000000] font-bold mt-1">{document.from}</p>
            </div>
            <div>
              <p className="text-[#5a5a5a] uppercase text-xs font-bold">Type</p>
              <p className="text-[#000000] font-bold mt-1">{document.fileType} • {document.fileSize}</p>
            </div>
            {document.shouldShareWith && (
              <div>
                <p className="text-[#5a5a5a] uppercase text-xs font-bold">Intended Recipient</p>
                <p className="text-[#000000] font-bold mt-1">{document.shouldShareWith}</p>
              </div>
            )}
          </div>
        </Panel>

        {/* Classification Options */}
        <div className="flex flex-col gap-3 flex-1">
          {classifications.map((classification) => (
            <button
              key={classification.id}
              onClick={() => {
                playClickSound()
                onClassify(classification.id as any)
              }}
              className={`${classification.color} ${classification.borderColor} border-2 p-4 rounded transition-all flex items-start gap-3 text-left hover:opacity-90 active:scale-95 shadow-md hover:shadow-lg`}
            >
              <div className="flex-shrink-0 mt-1">{classification.icon}</div>
              <div className="flex-1">
                <p className={`font-bold ${classification.textColor}`}>{classification.label}</p>
                <p className={`text-sm ${classification.textColor} opacity-90`}>{classification.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
