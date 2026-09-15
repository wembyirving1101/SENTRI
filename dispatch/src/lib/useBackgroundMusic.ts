'use client'

import { useEffect, useRef, useState } from 'react'

export function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      const audio = new Audio('/music/gameplay-ost.mp3')
      audio.loop = true
      audio.volume = 0.3 // Set to 30% volume
      audioRef.current = audio

      // Start playing on mount
      audio.play().catch((err) => console.log('[v0] Could not auto-play music:', err))
    }

    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch((err) => console.log('[v0] Could not resume music:', err))
      } else {
        audioRef.current.pause()
      }
      setIsMuted(!isMuted)
    }
  }

  return { isMuted, toggleMute }
}
