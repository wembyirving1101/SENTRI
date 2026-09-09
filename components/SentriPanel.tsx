export default function SentriPanel({ isQueueOpen }: {
    isQueueOpen: boolean;
}) {
    return <section className="sentri-window metal-frame" aria-label="SENTRI assistant">
    <h2 className="console-label">SENTRI</h2>
    <div className="sentri-content">
      <div className="sentri-portrait" role="img" aria-label="SENTRI, a friendly cream robot with cyan eyes"/>
      <div className="sentri-speech">{isQueueOpen ? 'Choose a task to begin.' : 'Investigate carefully. Collect evidence before you decide.'}</div>
    </div>
  </section>;
}
