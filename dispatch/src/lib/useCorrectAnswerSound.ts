import { useRef } from 'react'

export function useCorrectAnswerSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayTimeRef = useRef<number>(0)

  const playCorrectSound = () => {
    const now = Date.now()
    if (now - lastPlayTimeRef.current < 50) {
      return
    }
    lastPlayTimeRef.current = now

    if (!audioRef.current) {
      audioRef.current = new Audio('/SFX/correct-answer.mp3')
      audioRef.current.volume = 0.4
    }

    try {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    } catch {
      // Silently fail if audio can't play
    }
  }

  return playCorrectSound
}
