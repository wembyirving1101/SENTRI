'use client'

import { DataClassification } from '@/lib/types'
import { FileText } from 'lucide-react'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface DataClassificationTaskProps {
  document: DataClassification | undefined
}

export default function DataClassificationTask({
  document,
}: DataClassificationTaskProps) {
  if (!document) {
    return (
      <div className={cn('flex-1 flex flex-col h-full bg-[#171b1d]', borderVariants({ variant: 'emphasis' }))}>
        {/* Layer 2: Header */}
        <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b')}>
          <h2 className="text-lg font-bold tracking-widest text-foreground">TASK: DATA CLASSIFICATION</h2>
        </div>

        {/* Empty State */}
        <div className={cn('flex-1 flex items-center justify-center m-1 rounded bg-[#d3cdc1]')}>
          <p className="text-[#666666] text-center">No data classification tasks available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex-1 flex flex-col h-full bg-[#171b1d]', borderVariants({ variant: 'emphasis' }))}>
      {/* Layer 2: Header */}
      <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b')}>
        <h2 className="text-lg font-bold tracking-widest text-foreground">TASK: DATA CLASSIFICATION</h2>
      </div>

      {/* Layer 3: Panel */}
      <div className={cn('flex-1 flex gap-6 m-1 rounded bg-[#d3cdc1]')}>
        {/* Main Content - Document Preview */}
        <div className="flex-1 flex flex-col gap-6 p-6">
          {/* Document Info */}
          <div className="bg-[#d3cdc1] rounded p-4">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-[#000000]" />
              <div>
                <p className="text-[#5a5a5a] uppercase text-xs font-bold">From: {document.from}</p>
                <p className="text-[#5a5a5a] uppercase text-xs font-bold">Time: {document.timestamp}</p>
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-[#d3cdc1] rounded p-4 flex-1 flex flex-col">
            <span className="text-[#5a5a5a] uppercase text-xs font-bold block mb-3">DOCUMENT PREVIEW</span>
            <div className="flex-1 flex flex-col gap-3">
              <div className="bg-[#c1b5a8] rounded p-3 flex items-center gap-3">
                <FileText size={32} className="text-[#000000] flex-shrink-0" />
                <div>
                  <p className="font-bold text-[#000000]">{document.title}</p>
                  <p className="text-[#5a5a5a] text-xs">{document.fileSize}</p>
                </div>
              </div>
              <div className="bg-[#c1b5a8] rounded p-4 flex-1">
                <p className="text-[#000000] text-sm whitespace-pre-wrap">{document.preview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
