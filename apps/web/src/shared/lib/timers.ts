import { useCallback, useEffect, useRef } from 'react';

/**
 * Minuteurs liés à la vie d'un composant : `later(ms, fn)` programme une action, et toutes les
 * actions en attente sont annulées quand le composant disparaît (pas de mise à jour d'un écran
 * quitté, pas de fuite). Sert aux mises en scène (combats, animations enchaînées).
 */
export function useTimers(): (ms: number, fn: () => void) => void {
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const t of pending) window.clearTimeout(t);
    };
  }, []);
  return useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
}
