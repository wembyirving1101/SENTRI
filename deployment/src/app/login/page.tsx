import Link from 'next/link'
import TerminalShell from '@/components/TerminalShell'

export default function Login() {
  return <TerminalShell title="ADMIN ACCESS"><section className="login-placeholder panel"><span className="eyebrow">ADMIN TERMINAL</span><h1>Your control center</h1><p>Explore the admin panel with sample employees. Sign-in and company accounts are not connected yet.</p><Link className="button primary" href="/admin">[ OPEN ADMIN PREVIEW → ]</Link><Link className="text-link" href="/register">Register a company →</Link><Link className="text-link" href="/">← Back to start</Link></section></TerminalShell>
}
