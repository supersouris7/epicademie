import { useEffect, useSyncExternalStore } from 'react';

/**
 * Musique de fond (boucles CC0 de Juhani Junkala, voir public/music/LICENSE-juhani-junkala-cc0.txt).
 * Un seul lecteur pour toute l'appli : le morceau suit l'écran (menus, entraînement, combat), un écran
 * peut imposer un moment (« boss », « victoire »). Coupée par l'interrupteur « Musique » du profil.
 */
export const TRACKS = ['menu', 'entrainement', 'combat', 'boss', 'victoire'] as const;
export type Track = (typeof TRACKS)[number];

const VOLUME = 0.32;
/** La victoire se joue une fois ; les autres morceaux tournent en boucle. */
const ONCE: ReadonlySet<Track> = new Set(['victoire']);

let audio: HTMLAudioElement | null = null;
let current: Track | null = null;
let enabled = false;
let waitingForGesture = false;

function player(): HTMLAudioElement | null {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return null;
  audio ??= new Audio();
  return audio;
}

/** Les navigateurs bloquent le son avant le premier geste : on relance au premier toucher. */
function play(a: HTMLAudioElement) {
  a.volume = VOLUME;
  a.play().catch(() => {
    if (waitingForGesture) return;
    waitingForGesture = true;
    const retry = () => {
      waitingForGesture = false;
      window.removeEventListener('pointerdown', retry);
      window.removeEventListener('keydown', retry);
      if (enabled && current) void a.play().catch(() => undefined);
    };
    window.addEventListener('pointerdown', retry, { once: true });
    window.addEventListener('keydown', retry, { once: true });
  });
}

function apply(track: Track | null) {
  const a = player();
  if (!a) return;
  if (!enabled || !track) {
    a.pause();
    current = track;
    return;
  }
  if (track === current && !a.paused) return;
  if (track !== current) {
    a.src = `/music/${track}.mp3`;
    a.loop = !ONCE.has(track);
    current = track;
  }
  play(a);
}

export function setMusicEnabled(on: boolean) {
  enabled = on;
  apply(current);
}

export function setTrack(track: Track | null) {
  apply(track);
}

// ——— Moment imposé par un écran (boss, victoire) ———

let moment: Track | null = null;
const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setMusicMoment(track: Track | null) {
  if (moment === track) return;
  moment = track;
  for (const fn of listeners) fn();
}

export const useMusicMoment = () =>
  useSyncExternalStore(
    subscribe,
    () => moment,
    () => null,
  );

/** Un écran impose un morceau tant qu'il est affiché (null : celui de l'écran). */
export function useMusic(track: Track | null) {
  useEffect(() => {
    setMusicMoment(track);
    return () => setMusicMoment(null);
  }, [track]);
}

/** Morceau par défaut d'une adresse. */
export function trackOf(pathname: string): Track | null {
  if (pathname === '/' || pathname.startsWith('/profils')) return null;
  if (pathname.startsWith('/partie/entrainement')) return 'entrainement';
  if (pathname.startsWith('/partie/boss')) return 'combat';
  return 'menu';
}
