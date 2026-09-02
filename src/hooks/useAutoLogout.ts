import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutos exactos
const LAST_ACTIVITY_KEY = 'bee_last_activity_timestamp';

/**
 * Hook to automatically log out the user and return to the landing page
 * after 15 minutes of user inactivity (no mouse, keyboard, touch, scroll).
 */
export function useAutoLogout(
  isActive: boolean,
  onLogout: () => void
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (!isActive) return;

    const now = Date.now();
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    } catch {
      // ignore storage errors
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onLogout();
    }, INACTIVITY_TIMEOUT_MS);
  }, [isActive, onLogout]);

  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Check if session was already expired from a previous background tab/window
    try {
      const savedTime = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (savedTime) {
        const diff = Date.now() - parseInt(savedTime, 10);
        if (diff >= INACTIVITY_TIMEOUT_MS) {
          onLogout();
          return;
        }
      }
    } catch {
      // ignore
    }

    // Start initial timer
    resetTimer();

    // Activity event listeners across DOM
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'wheel'
    ];

    const handleUserActivity = () => {
      resetTimer();
    };

    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Also check on window focus / visibilitychange
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          const savedTime = localStorage.getItem(LAST_ACTIVITY_KEY);
          if (savedTime) {
            const diff = Date.now() - parseInt(savedTime, 10);
            if (diff >= INACTIVITY_TIMEOUT_MS) {
              onLogout();
              return;
            }
          }
        } catch {
          // ignore
        }
        resetTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive, onLogout, resetTimer]);
}
