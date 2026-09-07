'use client'

import { useState } from 'react'
import { Mail, Lock, Shield, Database } from 'lucide-react'
import { QueueItem } from '@/lib/types'
import { mockEmails } from '@/lib/mockEmails'
import { mockPasswords } from '@/lib/mockPasswords'
import { mockDataClassifications } from '@/lib/mockDataClassification'
import { useClickSound } from '@/lib/useClickSound'
import { borderVariants } from '@/lib/borderVariants'
import { cn } from '@/lib/utils'

interface DispatchQueueViewProps {
  queue: QueueItem[]
  selectedQueueId: string | null
  onSelectQueue: (id: string) => void
}

export default function DispatchQueueView({ queue, selectedQueueId, onSelectQueue }: DispatchQueueViewProps) {
  const playClickSound = useClickSound()
  const [activeTab, setActiveTab] = useState('all')
  const tabs = [
    { id: 'all', label: 'ALL', count: queue.length },
    { id: 'email', label: 'EMAIL', count: queue.filter(q => q.type === 'email').length },
    { id: 'password', label: 'PASSWORD', count: queue.filter(q => q.type === 'password').length },
    { id: 'strength', label: 'STRENGTH', count: queue.filter(q => q.type === 'password-strength').length },
    { id: 'data', label: 'DATA', count: queue.filter(q => q.type === 'data-classification').length },
  ]

  const getFilteredQueue = () => {
    if (activeTab === 'all') return queue
    if (activeTab === 'email') return queue.filter(q => q.type === 'email')
    if (activeTab === 'password') return queue.filter(q => q.type === 'password')
    if (activeTab === 'strength') return queue.filter(q => q.type === 'password-strength')
    if (activeTab === 'data') return queue.filter(q => q.type === 'data-classification')
    return queue
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail size={16} />
      case 'password':
        return <Lock size={16} />
      case 'password-strength':
        return <Shield size={16} />
      case 'data-classification':
        return <Database size={16} />
      default:
        return null
    }
  }

  const getTaskDescription = (queueItem: QueueItem): string => {
    if (queueItem.type === 'email') {
      const email = mockEmails.find(e => e.id === queueItem.id)
      return email?.subject || 'Unknown email'
    } else if (queueItem.type === 'password') {
      return 'New password submission'
    } else if (queueItem.type === 'password-strength') {
      return 'Password strength check'
    } else if (queueItem.type === 'data-classification') {
      const doc = mockDataClassifications.find(d => d.id === queueItem.id)
      return doc?.name || 'Unknown document'
    }
    return 'Unknown task'
  }

  const getTaskSource = (queueItem: QueueItem): string => {
    if (queueItem.type === 'email') {
      const email = mockEmails.find(e => e.id === queueItem.id)
      return email?.from || 'Unknown'
    } else if (queueItem.type === 'data-classification') {
      const doc = mockDataClassifications.find(d => d.id === queueItem.id)
      return doc?.from || 'Unknown'
    }
    return 'System'
  }

  const getTaskTime = (queueItem: QueueItem): string => {
    if (queueItem.type === 'email') {
      const email = mockEmails.find(e => e.id === queueItem.id)
      return email?.timestamp || '--:--'
    }
    return 'Now'
  }

  const getPriority = (queueItem: QueueItem): 'HIGH' | 'MEDIUM' | 'LOW' => {
    if (queueItem.type === 'email') {
      const email = mockEmails.find(e => e.id === queueItem.id)
      return email?.priority || 'MEDIUM'
    } else if (queueItem.type === 'data-classification') {
      const doc = mockDataClassifications.find(d => d.id === queueItem.id)
      return doc?.priority || 'MEDIUM'
    }
    return 'MEDIUM'
  }

  const getPriorityColor = (priority: string) => {
    if (priority === 'HIGH') return 'bg-[#d8b8b8] border-2 border-[#c89898] text-[#000000]'
    if (priority === 'MEDIUM') return 'bg-[#d4c5a9] border-2 border-[#c4b599] text-[#000000]'
    return 'bg-[#a8d5a8] border-2 border-[#7fb87f] text-[#000000]'
  }

  const typeLabel = {
    email: 'Email',
    password: 'Password',
    'password-strength': 'Strength',
    'data-classification': 'Data',
  }

  return (
    <div className={cn('h-full flex flex-col bg-[#171b1d]', borderVariants({ variant: 'emphasis' }))}>
      {/* Layer 2: Header */}
      <div className={cn('px-6 py-4 bg-[#171b1d]', borderVariants({ variant: 'divider' }), 'border-b')}>
        <h2 className="text-lg font-bold tracking-widest text-foreground">DISPATCH QUEUE</h2>
      </div>

      {/* Layer 3: Panel */}
      <div className={cn('flex-1 flex flex-col m-1 rounded bg-[#d3cdc1]')}>
        {/* Tabs - Full Width Filter Bar */}
        <div className="flex gap-0">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound()
                setActiveTab(tab.id)
              }}
              className={`flex-1 px-3 py-3 text-xs font-bold tracking-widest uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-[#171b1d] text-[#d3cdc1] border-b-4 border-b-[#4CAF50] shadow-md'
                  : 'bg-[#d3cdc1] text-[#000000] border-b-2 border-b-[#a89a8a] hover:bg-[#cbc0b5]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Queue Table */}
        <div className="flex-1 px-6 pt-4 pb-6">
          {getFilteredQueue().length === 0 ? (
            <div className="text-center text-[#5a5a5a] text-sm py-8">
              No tasks in queue
            </div>
          ) : (
            <div className="space-y-0">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-[#c1b5a8] rounded-t text-sm font-bold text-[#5a5a5a] uppercase tracking-wider border-b-2 border-[#a89a8a]">
                <div className="col-span-2">TYPE</div>
                <div className="col-span-4">TASK</div>
                <div className="col-span-2">FROM</div>
                <div className="col-span-2">TIME</div>
                <div className="col-span-2">PRIORITY</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-[#a89a8a]">
                {getFilteredQueue().map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      playClickSound()
                      onSelectQueue(item.id)
                    }}
                    className={`w-full grid grid-cols-12 gap-2 px-3 py-3 text-left text-base font-semibold transition-colors hover:bg-[#c1b5a8] rounded ${
                      selectedQueueId === item.id ? 'bg-[#a8d5a8] bg-opacity-40 border-l-4 border-l-[#7fb87f]' : ''
                    }`}
                  >
                    <div className="col-span-2 flex items-center gap-2 text-[#000000] font-bold">
                      {getTaskTypeIcon(item.type)}
                    </div>
                    <div className="col-span-4 text-[#000000] font-bold truncate">
                      {getTaskDescription(item)}
                    </div>
                    <div className="col-span-2 text-[#5a5a5a] text-sm font-semibold truncate">
                      {getTaskSource(item)}
                    </div>
                    <div className="col-span-2 text-[#5a5a5a] text-sm font-semibold">
                      {getTaskTime(item)}
                    </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`px-4 py-2 rounded text-sm font-bold ${getPriorityColor(getPriority(item))}`}>
                      {getPriority(item)}
                    </span>
                  </div>
                </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
