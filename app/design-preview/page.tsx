import type { Metadata } from 'next'
import DispatchConsole from '@/components/DispatchConsole'

export const metadata: Metadata = { title: 'SENTRI — Design Preview (sample data)' }

export default function DesignPreview() {
  return <DispatchConsole designPreview />
}
