import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'SENTRI — Deployment', description: 'Company initialization and administration for SENTRI.' }
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
