'use client';
import { useState } from 'react';
import { DispatchItem, Email, Password, DataClassification } from '@/lib/types';
import { useClickSound } from '@/lib/useClickSound';
import GameIcon from './GameIcon';
interface DispatchQueueViewProps {
    queue: DispatchItem[];
    selectedQueueId: string | null;
    onSelectQueue: (id: string) => void;
    isLoading?: boolean;
}
export default function DispatchQueueView({ queue, selectedQueueId, onSelectQueue, isLoading }: DispatchQueueViewProps) {
    const playClickSound = useClickSound();
    const [activeTab, setActiveTab] = useState('all');
    const tabs = [{ id: 'all', label: 'ALL' }, { id: 'email', label: 'EMAIL' }, { id: 'password', label: 'PASSWORD' }, { id: 'data-classification', label: 'DATA' }];
    const filtered = activeTab === 'all' ? queue : queue.filter(item => item.type === activeTab);
    return <section className="queue-window metal-frame" aria-label="Dispatch queue" aria-busy={isLoading}>
    <h2 className="window-heading">DISPATCH QUEUE</h2>
    <div className="queue-tabs" role="tablist" aria-label="Filter tasks">{tabs.map(tab => <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls="queue-results" id={`queue-tab-${tab.id}`} tabIndex={0} className={activeTab === tab.id ? 'is-selected' : ''} onClick={() => { playClickSound(); setActiveTab(tab.id); }}>{tab.label} ({tab.id === 'all' ? queue.length : queue.filter(item => item.type === tab.id).length})</button>)}</div>
    <div className="queue-paper paper-surface" id="queue-results" role="tabpanel" aria-labelledby={`queue-tab-${activeTab}`}>
      <div className="queue-columns queue-column-headings"><span>TYPE</span><span>TASK</span><span>FROM</span><span>TIME</span><span>PRIORITY</span></div>
      <div className="queue-rows">{filtered.map(item => {
            const email = item.payload as Email;
            const password = item.payload as Password;
            const doc = item.payload as DataClassification;
            const label = item.type === 'email' ? 'Email' : item.type === 'password' ? 'Password' : 'Data';
            const title = item.type === 'email' ? email.subject : item.type === 'password' ? 'Review access password' : `Classify document: “${doc.title}”`;
            const source = item.type === 'password' ? password.employee : item.type === 'email' ? email.from : doc.from;
            const priority = item.priority ?? 'MEDIUM';
            return <button key={item.id} className={`queue-columns queue-row ${selectedQueueId === item.id ? 'is-selected' : ''}`} aria-pressed={selectedQueueId === item.id} onClick={() => { playClickSound(); onSelectQueue(item.id); }}>
          <span className="queue-type"><GameIcon name={item.type === 'data-classification' ? 'folder' : item.type} size={36}/>{label}</span>
          <span className="queue-task-title">{title}</span><span className="queue-source" title={source}>{source}</span><span className="queue-time">{item.payload.timestamp || '—'}</span><span className="queue-priority"><span className={`priority-label priority-${priority.toLowerCase()}`}>{priority}</span>{selectedQueueId === item.id && <span className="selection-arrow" aria-hidden="true">▸</span>}</span>
        </button>;
        })}</div>
      {filtered.length === 0 && <div className="queue-empty" role="status">{isLoading ? 'Receiving your next assignment…' : 'No tasks in this queue.'}</div>}
    </div>
  </section>;
}
