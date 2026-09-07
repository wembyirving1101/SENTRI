import { useCallback, useRef } from 'react';

export function useClickSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastPlayTimeRef = useRef<number>(0);

  const playClickSound = useCallback(() => {
    // Prevent overlapping sounds (debounce to 50ms)
    const now = Date.now();
    if (now - lastPlayTimeRef.current < 50) {
      return;
    }
    lastPlayTimeRef.current = now;

    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/SFX/click.mp3');
        audioRef.current.volume = 0.4;
      }

      // Reset and play
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      // Handle browser autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, user hasn't interacted with page yet
          // Silently fail - this is expected behavior
        });
      }
    } catch (error) {
      // Audio playback failed, silently continue
      console.log('[v0] Click sound failed to play (expected on some browsers)');
    }
  }, []);

  return playClickSound;
}
