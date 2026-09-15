'use client';
import { useState } from 'react';
import { useDialogFocus } from '@/lib/useDialogFocus';
import { DispatchItem, Email, Password, DataClassification } from '@/lib/types';
import GameIcon from './GameIcon';
interface TaskDetailsPanelProps {
    selectedQueueItem: DispatchItem | null;
    onStartTask: (item: DispatchItem) => void;
}
export const classificationLevels = [
    { id: 'public', title: 'PUBLIC', description: 'Safe to share with anyone.', icon: 'public' as const },
    { id: 'internal', title: 'INTERNAL', description: 'For employees only.', icon: 'building' as const },
    { id: 'confidential', title: 'CONFIDENTIAL', description: 'Authorized people only.', icon: 'password' as const },
    { id: 'restricted', title: 'RESTRICTED', description: 'Strictly limited access.', icon: 'shield' as const },
];
export default function TaskDetailsPanel({ selectedQueueItem: item, onStartTask }: TaskDetailsPanelProps) {
    const [previewId, setPreviewId] = useState<string | null>(null);
    useDialogFocus(previewId !== null && previewId === item?.id, () => setPreviewId(null));
    const doc = item?.type === 'data-classification' ? item.payload as DataClassification : null;
    const email = item?.type === 'email' ? item.payload as Email : null;
    const password = item?.type === 'password' ? item.payload as Password : null;
    return <section className="details-window metal-frame" aria-label="Task details">
    <h2 className="window-heading">TASK DETAILS</h2>
    <div className="details-paper paper-surface">
      {!item ? <p className="details-empty">Select a task from the queue to view its details.</p> : <>
        <div className="task-summary"><GameIcon name={doc ? 'folder' : email ? 'email' : 'password'} size={42}/><div><h3>{doc ? 'DATA CLASSIFICATION' : email ? 'EMAIL INVESTIGATION' : 'PASSWORD REVIEW'}</h3><p>From: {doc?.from ?? email?.from ?? password?.employee}</p><p>Time: {item.payload.timestamp}</p></div></div>
        {doc ? <>
          <h4 className="detail-label">DOCUMENT PREVIEW</h4>
          <button className="document-card" onClick={() => setPreviewId(item.id)} aria-label={`Preview ${doc.title}`}><span className="pdf-icon"><GameIcon name="file" size={48}/><b>{doc.fileType}</b></span><span><strong>{doc.title}</strong><small>{doc.fileSize}</small></span></button>
          {doc.shouldShareWith && <p className="sharing-note">Requested sharing: {doc.shouldShareWith}</p>}
          <h4 className="detail-label classification-heading">CLASSIFICATION LEVELS</h4>
          <div className="classification-levels">{classificationLevels.map(level => <div className={`classification-card classification-${level.id}`} key={level.id}><GameIcon name={level.icon} size={36}/><div><strong>{level.title}</strong><p>{level.description}</p></div></div>)}</div>
          <button className="console-button detail-action" onClick={() => setPreviewId(item.id)}>VIEW DOCUMENT</button>
        </> : <div className="task-description"><h4 className="detail-label">{email ? 'EMAIL DETAILS' : 'PASSWORD DETAILS'}</h4><h3>{email?.subject ?? password?.department}</h3><p>{email ? 'Examine the sender, links, attachments and message before making your decision.' : 'Review the submitted password against company policy before approving access.'}</p>{email?.attachments?.length ? <p>{email.attachments.length} attachment{email.attachments.length === 1 ? '' : 's'} to review</p> : null}</div>}
        {item.courseInfo && <p className="text-base leading-relaxed">{item.courseInfo.phase.toUpperCase()}{item.courseInfo.recovery ? ' · RECOVERY' : ''}<br />{item.courseInfo.submissionsUsed} / {item.courseInfo.attemptLimit} submissions used<br />{item.courseInfo.nextRewardExp.toLocaleString(undefined, { maximumFractionDigits: 2 })} EXP available on the next pass</p>}
        <div className="start-task-area"><button className="console-button detail-action" onClick={() => onStartTask(item)}>START TASK</button></div>
      </>}
    </div>
    {doc && previewId === item?.id && <div className="console-modal-backdrop" onClick={() => setPreviewId(null)}><section className="console-modal metal-frame document-preview-modal" role="dialog" aria-modal="true" aria-labelledby="document-preview-title" onClick={event => event.stopPropagation()}><div className="modal-title"><h2 id="document-preview-title">{doc.title}</h2><button className="console-button" onClick={() => setPreviewId(null)} aria-label="Close document preview">✕</button></div><div className="paper-surface document-preview-content"><p>{doc.preview}</p></div><button className="console-button" onClick={() => { setPreviewId(null); onStartTask(item!); }}>START TASK</button></section></div>}
  </section>;
}
