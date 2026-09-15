import Link from 'next/link'

export default function TerminalShell({ children, stage = '00', title = 'DEPLOYMENT TERMINAL' }: { children: React.ReactNode; stage?: string; title?: string }) {
  return <div className="terminal-shell">
    <header className="protocol-header"><Link href="/" className="brand" aria-label="SENTRI home">SENTRI<span>PROTOCOL</span></Link><div className="header-divider" /><span className="header-title">{title}</span><span className="deployment-number">DEPLOYMENT <b>{stage}</b></span></header>
    <main>{children}</main>
    <footer className="system-footer"><span><i className="status-light" /> SYSTEM ONLINE</span><span>COMPANY ACCESS TERMINAL <b>/</b> V.01</span><span>SENTRI SECURITY TRAINING</span></footer>
  </div>
}
