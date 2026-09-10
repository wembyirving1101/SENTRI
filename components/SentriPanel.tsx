export default function SentriPanel({ isQueueOpen, courseStatus, courseMessage, onResumeCourse }: {
    isQueueOpen: boolean;
    courseStatus?: string;
    courseMessage?: string | null;
    onResumeCourse?: () => void;
}) {
    return <section className="sentri-window metal-frame" aria-label="SENTRI assistant">
    <h2 className="console-label">SENTRI</h2>
    <div className="sentri-content">
      <div className="sentri-portrait"><img src="/design/sentri-portrait.png" alt="SENTRI, a friendly cream robot with cyan eyes" width={120} height={132}/></div>
      <div className="sentri-speech" role="status">{courseStatus === 'graduated' ? 'Course complete! You earned 1,000 EXP and passed every required phase.' : courseStatus === 'needs-follow-up' ? 'Your EXP is saved. Contact your training administrator for follow-up.' : courseStatus === 'content-blocked' ? <><span title={courseMessage ?? undefined}>Waiting for a new course case.</span><button className="console-button p-2 mt-2" onClick={onResumeCourse}>CHECK AGAIN</button></> : isQueueOpen ? 'Choose a task to begin.' : 'Investigate carefully. Collect evidence before you decide.'}</div>
    </div>
  </section>;
}
