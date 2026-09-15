'use client'
import { useEffect, useState } from 'react'
import { Monitor, Volume2, UserRound, LogOut, X } from 'lucide-react'
import { useDialogFocus } from '@/lib/useDialogFocus'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSaveSettings?: (settings: { aspectRatio: '16:9' | '16:10' }) => void
  currentAspectRatio?: '16:9' | '16:10'
  isMuted?: boolean
  onToggleMute?: () => void
}
export default function SettingsModal({ isOpen, onClose, onSaveSettings, currentAspectRatio = '16:9', isMuted, onToggleMute }: Props) {
  const [category, setCategory] = useState('audio')
  const [ratio, setRatio] = useState(currentAspectRatio)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useDialogFocus(isOpen, () => { if (!busy) onClose() })
  useEffect(() => { if (isOpen) { setRatio(currentAspectRatio); setError('') } }, [isOpen, currentAspectRatio])
  async function logout() {
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/auth', { method: 'DELETE' })
      if (!response.ok) throw new Error()
      window.location.replace('/login')
    } catch { setError('Could not log out. Please try again.'); setBusy(false) }
  }
  if (!isOpen) return null
  const categories = [{ id: 'audio', label: 'AUDIO', icon: Volume2 }, { id: 'display', label: 'DISPLAY', icon: Monitor }, { id: 'account', label: 'ACCOUNT', icon: UserRound }]
  return <div className="console-modal-backdrop" onClick={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <section className="console-modal metal-frame terminal-settings" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <header className="modal-title"><div><small>DISPATCH / CONTROL PANEL</small><h2 id="settings-title">TERMINAL SETTINGS</h2></div><button className="console-button" aria-label="Close settings" disabled={busy} onClick={onClose}><X size={24} /></button></header>
      <div className="settings-body">
        <nav aria-label="Settings categories">{categories.map(({ id, label, icon: Icon }) => <button key={id} className={`console-button ${category === id ? 'selected' : ''}`} aria-pressed={category === id} onClick={() => setCategory(id)}><Icon size={24} />{label}</button>)}<span className="settings-terminal-id">SENTRI<br />EMPLOYEE TERMINAL</span></nav>
        <div className="settings-content paper-surface">
          {category === 'audio' && <><span className="settings-section-code">01 / AUDIO</span><h3>Sound & atmosphere</h3><p>Control the background music at your desk.</p><div className="settings-row"><div><strong>BACKGROUND MUSIC</strong><p>The dispatch room soundtrack.</p></div><button className="console-button" aria-pressed={!isMuted} onClick={onToggleMute}>{isMuted ? 'OFF' : 'ON'}</button></div></>}
          {category === 'display' && <><span className="settings-section-code">02 / DISPLAY</span><h3>Your workspace</h3><p>Choose the proportions of your dispatch console.</p><fieldset><legend>ASPECT RATIO</legend><div className="settings-ratios">{(['16:9', '16:10'] as const).map(value => <button key={value} className={`console-button ${ratio === value ? 'selected' : ''}`} aria-pressed={ratio === value} onClick={() => setRatio(value)}>{value}<small>{value === '16:9' ? '1920 × 1080' : '1920 × 1200'}</small></button>)}</div></fieldset></>}
          {category === 'account' && <><span className="settings-section-code">03 / ACCOUNT</span><h3>Signed in as admin</h3><p>Temporary employee access account.</p><div className="settings-row"><div><strong>REMEMBERED ON THIS DEVICE</strong><p>Your sign-in lasts for up to 30 days.<br />Log out to end access on this browser.</p></div><UserRound size={32} /></div></>}
        </div>
      </div>
      {error && <p role="alert" className="settings-error">{error}</p>}
      <footer className="settings-footer"><button className="console-button settings-logout" disabled={busy} onClick={logout}><LogOut size={22} />{busy ? 'LOGGING OUT…' : 'LOG OUT'}</button><button className="console-button" disabled={busy} onClick={() => { onSaveSettings?.({ aspectRatio: ratio }); onClose() }}>SAVE & CLOSE</button></footer>
    </section>
  </div>
}
