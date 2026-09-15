'use client'

import { useEffect } from 'react'

interface ScaleManagerProps {
  aspectRatio?: '16:9' | '16:10'
}

export default function ScaleManager({ aspectRatio = '16:9' }: ScaleManagerProps) {
  useEffect(() => {
    const gameScreen = document.querySelector('.game-screen') as HTMLElement
    if (!gameScreen) return

    const gameHeight = aspectRatio === '16:9' ? 1080 : 1200

    const updateScale = () => {
      const scale = Math.min(
        window.innerWidth / 1920,
        window.innerHeight / gameHeight
      )
      gameScreen.style.transform = `scale(${scale})`
      gameScreen.style.height = `${gameHeight}px`
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [aspectRatio])

  return null
}
