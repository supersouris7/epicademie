/** Outils communs aux deux chapitres du lot an-5e-05. */
import type { Figure, Trap } from '../types.ts';
import { normalizeText } from '../check.ts';
import { ABOUT, ended, endedTraps } from './futur.ts';

export const document = (title: string, lines: readonly string[]): Figure => ({
  kind: 'document',
  title,
  lines: [...lines],
  credit: ABOUT,
});

/** Dernière bulle d’un texte à trous. */
export const ok = (answers: readonly string[]) => `Écris : **${answers.join(', ')}**.`;

/** Saisies acceptées, avec ou sans point final. */
export const typed = (forms: readonly string[]) => ({ kind: 'text' as const, accepted: ended(forms) });

/** Erreurs typiques avec ou sans point final ; une forme acceptée n’est jamais un piège. */
export function textTraps(accepted: readonly string[], traps: readonly Trap[]): Trap[] {
  const good = new Set(ended(accepted).map(normalizeText));
  return endedTraps(traps.filter((t) => 'text' in t && t.text !== '' && !good.has(normalizeText(t.text))));
}
