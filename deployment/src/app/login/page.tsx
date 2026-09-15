import Link from 'next/link'
import TerminalShell from '@/components/TerminalShell'

export default function Login() {
  return <TerminalShell title="ADMIN ACCESS"><section className="login-placeholder panel"><span className="eyebrow">ADMIN TERMINAL</span><h1>Admin login</h1><p>Admin sign-in is coming next. Company registration is available to preview now.</p><Link className="button primary" href="/register">[ REGISTER A COMPANY → ]</Link><Link className="text-link" href="/">← Back to start</Link></section></TerminalShell>
}
