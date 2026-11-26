import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Rich } from '../../types.ts';
import { association, saisie } from '../st/outils.ts';
import type { Qcm } from './kit.ts';

// ——— Outils communs aux notions du chapitre « La Terre interne » (4e) ———

export type Definitions<T extends string> = Readonly<Record<T, string>>;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** QCM « quel terme désigne… ? » : chaque distracteur est expliqué par sa propre définition. */
export const termeQcm = <T extends string>(
  defs: Definitions<T>,
  terme: T,
  autres: readonly T[],
  indice: Rich,
  /** Pourquoi : le repère qui permet de retrouver le terme. */
  repere: Rich,
): Qcm => ({
  prompt: `Quel terme désigne ${defs[terme]} ?`,
  bonne: terme,
  fausses: autres.map((a) => [a, `${cap(a)} : ${defs[a]}.`]),
  indice,
  explication: [`La définition décrit ${defs[terme]}.`, repere],
});

const sansAccent = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '');

/** Variantes écrites d'un terme : avec ou sans article, avec ou sans accents. */
export const variantes = (mot: string, ...articles: string[]): string[] => {
  const formes = [mot, ...articles.map((a) => (a.endsWith('’') ? `${a}${mot}` : `${a} ${mot}`))];
  return [...new Set([...formes, ...formes.map(sansAccent)])];
};

export interface Saisie {
  readonly prompt: Rich;
  readonly accepted: readonly string[];
  readonly erreurs: readonly (readonly [string, Rich])[];
  readonly indice: Rich;
  /** Ce qu'on cherche et pourquoi ; la dernière bulle donne la réponse en gras. */
  readonly explication: Rich;
}

export function ecrire(q: Saisie, targetSeconds: number): QuestionDraft {
  const { answer, traps } = saisie(q.accepted, q.erreurs);
  return {
    prompt: q.prompt,
    answer,
    traps,
    hint: q.indice,
    steps: [q.explication, `Réponse : **${q.accepted[0]}**.`],
    targetSeconds,
  };
}

/** Association : la première bulle d'exemple reprend la première paire. */
export function associer(
  rng: Rng,
  paires: readonly (readonly [string, string])[],
  q: { readonly prompt: Rich; readonly indice: Rich; readonly explication: Rich },
  targetSeconds: number,
): QuestionDraft {
  const [terme = '', reponse = ''] = paires[0] ?? [];
  return {
    prompt: q.prompt,
    answer: association(rng, paires),
    hint: q.indice,
    steps: [q.explication, `Par exemple, ${terme} : **${reponse}**.`],
    targetSeconds,
  };
}

/** Document écrit pour l'exercice (lieux, carnets et mesures inventés). */
export const document = (title: string, lines: string[]) => ({
  kind: 'document' as const,
  title,
  lines,
  credit: 'Document écrit pour l’exercice',
});
