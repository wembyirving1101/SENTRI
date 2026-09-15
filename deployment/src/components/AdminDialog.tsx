'use client'
import { useEffect, useRef } from 'react'

export default function AdminDialog({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement as HTMLElement; dialog.showModal(); return () => { dialog.close(); previous?.focus() } }, [])
  return <dialog ref={ref} className={`admin-dialog ${wide ? 'wide' : ''}`} onCancel={event => { event.preventDefault(); onClose() }} onClick={event => { if (event.target === event.currentTarget) { const rect = event.currentTarget.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose() } }} aria-labelledby="admin-dialog-title"><header className="dialog-title"><h2 id="admin-dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></header><div className="dialog-paper">{children}</div></dialog>
}
