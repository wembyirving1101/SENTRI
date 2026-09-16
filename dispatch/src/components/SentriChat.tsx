'use client'
import { useEffect, useRef, useState } from 'react'
import { useDialogFocus } from '@/lib/useDialogFocus'

type Message = { role: 'user' | 'assistant'; content: string; complete?: boolean }
export default function SentriChat({ open, onClose, paused }: { open: boolean; onClose: () => void; paused: boolean }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef<AbortController | null>(null)
  const scroll = useRef<HTMLDivElement>(null)
  const follow = useRef(true)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  useDialogFocus(open, onClose)
  useEffect(() => { if (!open) controller.current?.abort(); else { follow.current = true; inputRef.current?.focus() } }, [open])
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => { if (open && follow.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight }, [messages, busy, open])
  async function send() {
    if (controller.current || !input.trim()) return
    const question = input.trim()
    const history = [...messages.filter(m => m.role === 'user' || m.complete), { role: 'user' as const, content: question }].slice(-12).map(({ role, content }) => ({ role, content }))
    const abort = new AbortController(); controller.current = abort
    setMessages(old => [...old, { role: 'user', content: question }, { role: 'assistant', content: '' }])
    setInput(''); setBusy(true); setError(''); follow.current = true
    let answer = ''; let done = false
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: abort.signal })
      if (!response.ok) { const body = await response.json(); throw new Error(body.error ?? 'SENTRI is unavailable.') }
      if (!response.body) throw new Error('The response stream is unavailable.')
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
      function consume(line: string) {
        if (!line.trim()) return
        const event = JSON.parse(line)
        if (event.type === 'error') throw new Error(event.message)
        if (event.type === 'done') done = true
        if (event.type === 'token') {
          answer += event.text
          setMessages(old => old.map((m, i) => i === old.length - 1 ? { role: 'assistant', content: answer } : m))
        }
      }
      while (true) {
        const part = await reader.read()
        buffer += decoder.decode(part.value, { stream: !part.done })
        const lines = buffer.split('\n'); buffer = lines.pop() ?? ''
        lines.forEach(consume)
        if (part.done) { consume(buffer); break }
      }
      if (!done || !answer) throw new Error('The reply ended before SENTRI could finish. Please try again.')
      setMessages(old => old.map((m, i) => i === old.length - 1 ? { ...m, complete: true } : m))
    } catch (e) {
      if (abort.signal.aborted) setError('Response stopped.')
      else setError(e instanceof Error ? e.message : 'Could not reach SENTRI. Please try again.')
      abort.abort()
    } finally { controller.current = null; setBusy(false); inputRef.current?.focus() }
  }
  if (!open) return null
  return <section className="sentri-chat" role="dialog" aria-modal="true" aria-labelledby="chat-title">
    <header className="chat-header"><div><h1 id="chat-title">S E N T R I</h1><span>{paused ? 'DAY PAUSED' : 'DAY NOT STARTED'}</span></div><button type="button" onClick={onClose} aria-label="Close SENTRI chat">×</button></header>
    <div className="chat-conversation" ref={scroll} onScroll={() => { const node = scroll.current; if (node) follow.current = node.scrollHeight - node.scrollTop - node.clientHeight < 90 }}>
      <div className="chat-message assistant"><div className="chat-avatar"><img src="/design/sentri-portrait-rounded.png" alt="" /><span>SENTRI</span></div><p>Hey, what can I help you with?</p></div>
      {messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}>
        {message.role === 'assistant' && <div className="chat-avatar"><img src="/design/sentri-portrait-rounded.png" alt="" /><span>SENTRI</span></div>}
        <p>{message.content || (busy && index === messages.length - 1 ? 'SENTRI is thinking…' : 'No reply received.')}{busy && message.role === 'assistant' && index === messages.length - 1 && message.content && <span className="chat-cursor" aria-hidden="true"> ▌</span>}</p>
      </div>)}
    </div>
    <div className="chat-composer-area">{error && <p className="chat-error" role="alert">{error}</p>}<div className="chat-composer"><textarea ref={inputRef} aria-label="Message SENTRI" placeholder="Type a message…" value={input} maxLength={12000} onChange={e => setInput(e.target.value)} /><button type="button" disabled={!busy && !input.trim()} onClick={() => busy ? controller.current?.abort() : void send()} aria-label={busy ? 'Stop response' : 'Send message'}>{busy ? '■' : '↑'}</button></div><span className="sr-only" role="status">{busy ? 'SENTRI is responding' : 'Ready'}</span></div>
  </section>
}
