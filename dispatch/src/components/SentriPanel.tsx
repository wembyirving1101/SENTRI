export default function SentriPanel({ isQueueOpen, courseStatus, courseMessage, onResumeCourse, onOpenChat, chatAvailable, chatHint }: {
    isQueueOpen: boolean;
    onOpenChat?: () => void;
    chatAvailable?: boolean;
    chatHint?: string;
    courseStatus?: string;
    courseMessage?: string | null;
    onResumeCourse?: () => void;
}) {
    return <section className="sentri-window metal-frame" aria-label="SENTRI assistant">
    <h2 className="console-label">SENTRI</h2>
    <button type="button" className="sentri-chat-launch" disabled={!chatAvailable} onClick={onOpenChat} aria-label="Open SENTRI chat" title={chatHint}>
    <div className="sentri-content">
      <div className="sentri-portrait"><img src="/design/sentri-portrait-rounded.png" alt="SENTRI, a friendly cream robot with round cyan eyes" width={120} height={132}/></div>
      <div className="sentri-speech" role="status">{courseStatus === 'graduated' ? 'Course complete! You earned 1,000 EXP and passed every required phase.' : courseStatus === 'needs-follow-up' ? 'Your EXP is saved. Contact your training administrator for follow-up.' : courseStatus === 'content-blocked' ? <><span title={courseMessage ?? undefined}>Waiting for a new course case.</span><span>Check your course connection.</span></> : isQueueOpen ? 'Choose a task to begin.' : 'Investigate carefully. Collect evidence before you decide.'}</div>
    </div>
    <span className="sentri-chat-availability">{chatHint}</span></button>
  </section>;
}
