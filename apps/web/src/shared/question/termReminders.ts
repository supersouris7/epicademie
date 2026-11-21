import { useSyncExternalStore } from 'react';

/**
 * Mots à revoir à la fin de la partie : en combat et en défi, la définition ne s'ouvre pas (on
 * joue) ; l'enfant peut demander qu'on la lui rappelle au récap. En mémoire, le temps de la partie.
 */
let words: readonly string[] = [];
const listeners = new Set<() => void>();
const changed = () => {
  for (const l of listeners) l();
};

export function remindTerm(id: string): void {
  if (!words.includes(id)) words = [...words, id];
  changed();
}

/** Nouvelle partie : la liste repart à zéro. */
export function clearTermReminders(): void {
  if (words.length === 0) return;
  words = [];
  changed();
}

export function useTermReminders(): readonly string[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => words,
  );
}
