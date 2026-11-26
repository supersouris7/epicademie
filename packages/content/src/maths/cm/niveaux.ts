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
