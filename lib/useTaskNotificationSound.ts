import { useCallback, useRef } from 'react';

export function useTaskNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playTaskNotificationSound = useCallback(() => {
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio('/SFX/task-notification.mp3');
        audioRef.current.volume = 0.6;
      }

      // Reset and play
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      // Handle browser autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented
        });
      }
    } catch (error) {
      // Audio playback failed, silently continue
    }
  }, []);

  return playTaskNotificationSound;
}
