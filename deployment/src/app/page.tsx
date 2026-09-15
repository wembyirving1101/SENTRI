import Link from 'next/link'
import TerminalShell from '@/components/TerminalShell'

export default function Home() {
  return <TerminalShell><section className="welcome">
    <span className="eyebrow">YOUR PEOPLE. YOUR FIRST LINE OF DEFENSE.</span>
    <h1>Good security<br />starts <em>here.</em></h1>
    <p>Connect your company to SENTRI.<br />Give your people the awareness to act with confidence.</p>
    <div className="entry-options"><Link href="/register" className="entry-card"><span className="eyebrow">01 / NEW COMPANY</span><h2>Initialize deployment</h2><p>Set up your company and administrator account.</p><span className="entry-action">[ REGISTER A COMPANY <span>→</span> ]</span></Link><Link href="/login" className="entry-card"><span className="eyebrow">02 / EXISTING COMPANY</span><h2>Return to your terminal</h2><p>Sign in to manage your company’s training.</p><span className="entry-action">[ ADMIN LOGIN <span>→</span> ]</span></Link></div>
    <span className="welcome-note">AWARENESS IS A TEAM EFFORT.</span>
  </section></TerminalShell>
}
