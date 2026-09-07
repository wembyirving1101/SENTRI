'use client'

import { useCallback, useRef } from 'react'

export function useChatSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  return useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('/SFX/chat-bubble.mp3')
        audioRef.current.volume = 0.4
      }

      // Reset and play
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Silently fail if autoplay is restricted
      })
    } catch (error) {
      // Silently fail
    }
  }, [])
}
