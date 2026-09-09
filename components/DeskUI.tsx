'use client';
import { useEffect, useState } from 'react';
import { useDialogFocus } from '@/lib/useDialogFocus';
import { VolumeX } from 'lucide-react';
import GameIcon from './GameIcon';
import { useClickSound } from '@/lib/useClickSound';
interface DeskUIProps {
    progressPercentage: number;
    onEndDay?: () => void;
    tasksCompleted?: number;
    tasksTotal?: number;
    isMuted?: boolean;
    onToggleMute?: () => void;
    isBusy?: boolean;
}
export default function DeskUI({ onEndDay, tasksCompleted = 0, tasksTotal = 0, isMuted = false, onToggleMute, isBusy }: DeskUIProps) {
    const playClickSound = useClickSound();
    const [modal, setModal] = useState<'handbook' | 'messages' | 'notes' | null>(null);
    const [notes, setNotes] = useState('');
    useDialogFocus(modal !== null, () => setModal(null));
    useEffect(() => {
        try {
            setNotes(localStorage.getItem('sentri-notes') ?? '');
        }
        catch { }
    }, []);
    const open = (name: typeof modal) => { playClickSound(); setModal(name); };
    const completion = tasksTotal > 0 ? Math.min(100, tasksCompleted / tasksTotal * 100) : 0;
    return <>
    <footer className="desk-surface">
      <button className="handbook-object" aria-label="Open employee handbook" onClick={() => open('handbook')}/>
      <section className="desk-monitor metal-frame" aria-label="Today's task progress"><div className="monitor-screen"><h2>TODAY’S TASKS</h2><p>{tasksCompleted} / {tasksTotal} COMPLETE</p><div className="daily-task-track" role="progressbar" aria-label="Today's tasks" aria-valuemin={0} aria-valuemax={tasksTotal || 1} aria-valuenow={tasksCompleted}><div style={{ width: `${completion}%` }}/>{[25, 50, 75].map(mark => <i key={mark} style={{ left: `${mark}%` }}/>)}</div></div></section>
      <div className="desk-organizer metal-frame"><div className="organizer-slot"/>
        <button className="console-button desk-message-button" onClick={() => open('messages')}><GameIcon name="email" size={36}/><span>MESSAGES</span></button>
        <button className="console-button desk-message-button" onClick={() => open('notes')}><GameIcon name="notes" size={36}/><span>NOTES</span>{notes.trim() && <span className="notification-badge">1</span>}</button>
      </div>
      <div className="coffee-object" role="img" aria-label="Kakfung Industries coffee mug"/>
      <button className="music-control metal-frame" onClick={() => { playClickSound(); onToggleMute?.(); }} aria-label={isMuted ? 'Unmute music' : 'Mute music'} aria-pressed={!isMuted}>{isMuted ? <VolumeX size={34}/> : <GameIcon name="music" size={34}/>}<span>{isMuted ? 'MUTED' : 'MUSIC'}</span></button>
      <div className="end-day-control metal-frame"><button className="end-day-button" onClick={() => { playClickSound(); onEndDay?.(); }} disabled={isBusy}>END DAY</button><span>{tasksCompleted}/{tasksTotal} TASKS</span></div>
    </footer>
    {modal && <div className="console-modal-backdrop" onClick={() => setModal(null)}><section className="console-modal metal-frame" role="dialog" aria-modal="true" aria-labelledby="desk-modal-title" onClick={event => event.stopPropagation()}><div className="modal-title"><h2 id="desk-modal-title">{modal === 'handbook' ? 'EMPLOYEE HANDBOOK' : modal.toUpperCase()}</h2><button className="console-button" aria-label="Close" onClick={() => setModal(null)}>✕</button></div>
      {modal === 'handbook' && <div className="paper-surface handbook-pages"><h3>COMPANY SECURITY POLICY</h3><h4>Email safety</h4><p>Verify the sender’s identity and domain. Inspect links and attachments before responding. The company will never request your password or PIN by email.</p><h4>Password security</h4><p>Use long, unique passwords. Review submitted passwords against company policy and request revisions when needed.</p><h4>Data handling</h4><p>Classify information before sharing it. Public data can be shared freely; internal information stays within the company. Confidential and restricted information require authorized access.</p><h4>Incident reporting</h4><p>Collect evidence and contact the appropriate person when a request seems suspicious.</p></div>}
      {modal === 'messages' && <div className="paper-surface handbook-pages"><h3>DISPATCH NOTICE</h3><p>Your current assignments are available in View Queue. Select an assignment and choose Start Task to begin.</p><p>{tasksCompleted} of {tasksTotal} tasks completed today.</p></div>}
      {modal === 'notes' && <><label className="sr-only" htmlFor="investigation-notes">Investigation notes</label><textarea id="investigation-notes" className="paper-surface notes-paper" maxLength={500} placeholder="Write your observations here…" value={notes} onChange={event => {
                    setNotes(event.target.value);
                    try {
                        localStorage.setItem('sentri-notes', event.target.value);
                    }
                    catch { }
                }}/><p className="notes-count">{notes.length}/500 · Saved on this device</p></>}
    </section></div>}
  </>;
}
