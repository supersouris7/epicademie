import type { Rng } from '../../rng.ts';
import type { AnswerSpec, Rich, Trap } from '../../types.ts';

/** Association : colonnes mélangées, jamais déjà en face l'une de l'autre (une seule solution). */
export function association(rng: Rng, paires: readonly (readonly [Rich, Rich])[]): AnswerSpec {
  const left = rng.shuffle(paires);
  let right = rng.shuffle(paires.map((p) => p[1]));
  for (let i = 0; i < 20 && left.every((p, k) => right[k] === p[1]); i++) right = rng.shuffle(right);
  if (left.every((p, k) => right[k] === p[1])) right = [...right.slice(1), ...right.slice(0, 1)];
  return {
    kind: 'match',
    left: left.map((p) => p[0]),
    right,
    pairs: left.map((p) => right.indexOf(p[1])),
  };
}

/** Remise en ordre : éléments donnés dans le bon ordre, présentés mélangés (jamais déjà rangés). */
export function ordre(rng: Rng, enOrdre: readonly Rich[]): AnswerSpec {
  let items = rng.shuffle(enOrdre);
  for (let i = 0; i < 20 && items.every((x, k) => x === enOrdre[k]); i++) items = rng.shuffle(enOrdre);
  if (items.every((x, k) => x === enOrdre[k])) items = [...items.slice(1), ...items.slice(0, 1)];
  return { kind: 'order', items, correct: enOrdre.map((x) => items.indexOf(x)) };
}

/** Réponse écrite : variantes acceptées et erreurs typiques expliquées. */
export const saisie = (accepted: readonly string[], erreurs: readonly (readonly [string, Rich])[]) => ({
  answer: { kind: 'text', accepted } as AnswerSpec,
  traps: erreurs
    .filter(([t]) => !accepted.some((a) => a.toLowerCase() === t.toLowerCase()))
    .map(([text, why]): Trap => ({ text, why })),
});

/** Première lettre en majuscule (début de phrase). */
export const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
