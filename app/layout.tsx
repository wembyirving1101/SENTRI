import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import ScaleManager from '@/components/ScaleManager'
import './globals.css'


export const metadata: Metadata = {
  title: 'Sentricol - Cybersecurity Training Game',
  description: 'A 2D cybersecurity training game that transforms boring awareness courses into engaging investigations',
  generator: 'v0.app',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#282828',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <div className="game-container">
          <div className="game-screen">
            {children}
          </div>
        </div>
        <ScaleManager />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}


