import type { Rng } from '../../rng.ts';
import type { AnswerSpec, Level, QuestionDraft, Skill, Trap } from '../../types.ts';
import type { Contexte } from './contexte.ts';

/** Source du registre commune aux notions du CM1 à 5 niveaux : le programme du cycle 3. */
const PROGRAMME = 'maths-cycle3-2025';

/**
 * Notion existante portée à 5 niveaux (lots `ma-cm1-nXX`) : même identifiant (progression des élèves),
 * source du programme citée, version 2 car les énoncés changent.
 */
export const cinqNiveaux =
  (S: Contexte['S']) =>
  (...args: Parameters<Contexte['S']>): Skill => {
    const s = S(...args);
    return { ...s, levels: 5, version: 2, lesson: { ...s.lesson, sources: [PROGRAMME] } };
  };

type Gabarit = (rng: Rng) => QuestionDraft;

/** Générateur d'une notion à partir d'une fabrique de question par niveau, du 1 au 5. */
export const parNiveau = (niveaux: readonly [Gabarit, Gabarit, Gabarit, Gabarit, Gabarit]) => {
  return (rng: Rng, level: Level): QuestionDraft => niveaux[(level - 1) as 0 | 1 | 2 | 3 | 4](rng);
};

const SIGNES = ['<', '=', '>'] as const;

/** Choix d'un signe : propositions toujours dans l'ordre <, =, >, quelle que soit la bonne réponse. */
export const signes = (bon: '<' | '>', pourInverse: string, pourEgal: string) => {
  const answer: AnswerSpec = { kind: 'choice', options: [...SIGNES], correct: SIGNES.indexOf(bon) };
  const traps: Trap[] = SIGNES.flatMap((s, option) =>
    s === bon ? [] : [{ option, why: s === '=' ? pourEgal : pourInverse }],
  );
  return { answer, traps };
};

/** Mélange jusqu'à ce que les éléments ne soient pas déjà dans l'ordre demandé (clé croissante). */
export function aRanger<T>(rng: Rng, items: readonly T[], key: (t: T) => number): { items: T[]; correct: number[] } {
  for (;;) {
    const shown = rng.shuffle([...items]);
    const correct = shown
      .map((t, i) => ({ k: key(t), i }))
      .sort((a, b) => a.k - b.k)
      .map((x) => x.i);
    if (correct.some((c, i) => c !== i)) return { items: shown, correct };
  }
}

/** Association de paires [gauche, droite] : la colonne de droite est mélangée, jamais déjà en face. */
export function associer(rng: Rng, paires: readonly (readonly [string, string])[]): AnswerSpec {
  for (;;) {
    const ordre = rng.shuffle(paires.map((_, i) => i));
    if (ordre.every((x, i) => x === i)) continue;
    return {
      kind: 'match',
      left: paires.map((p) => p[0]),
      right: ordre.map((i) => paires[i]?.[1] ?? ''),
      pairs: paires.map((_, i) => ordre.indexOf(i)),
    };
  }
}
