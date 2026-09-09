export default function SentriPanel({ isQueueOpen }: {
    isQueueOpen: boolean;
}) {
    return <section className="sentri-window metal-frame" aria-label="SENTRI assistant">
    <h2 className="console-label">SENTRI</h2>
    <div className="sentri-content">
      <div className="sentri-portrait"><img src="/design/sentri-portrait.png" alt="SENTRI, a friendly cream robot with cyan eyes" width={120} height={132}/></div>
      <div className="sentri-speech">{isQueueOpen ? 'Choose a task to begin.' : 'Investigate carefully. Collect evidence before you decide.'}</div>
    </div>
  </section>;
}
