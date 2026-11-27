import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { Figure, QuestionDraft, Skill } from '../../types.ts';
import { referencesVivant } from './donnees-6e-vivant.ts';
import { association, maj, ordre, saisie } from './outils.ts';

// ——— Formes de questions du chapitre « Le vivant » (6e) : une explication, puis la réponse en gras. ———

/** Proposition ou réponse fausse, avec son explication. */
export type Faux = readonly [string, string];

interface Commun {
  readonly prompt: string;
  readonly hint: string;
  /** Pourquoi la réponse est juste : première et deuxième bulles de la correction. */
  readonly pourquoi: readonly string[];
  readonly figure?: Figure;
}

const commun = (c: Commun, reponse: string, targetSeconds: number) => ({
  prompt: c.prompt,
  hint: c.hint,
  steps: [...c.pourquoi, `Réponse : **${reponse}**.`],
  targetSeconds,
  ...(c.figure ? { figure: c.figure } : {}),
});

export const qcm = (rng: Rng, c: Commun & { bon: string; faux: readonly Faux[] }): QuestionDraft => ({
  ...commun(c, c.bon, c.figure ? 70 : 35),
  ...choice(
    rng,
    c.bon,
    c.faux.map(([label, why]) => ({ label, why })),
  ),
});

const sansAccent = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

/** Variantes acceptées d'un mot : seul ou avec un article, avec ou sans accents. */
export const formes = (mot: string, ...articles: readonly string[]): string[] => {
  const base = [mot, ...articles.map((a) => (a.endsWith('’') ? `${a}${mot}` : `${a} ${mot}`))];
  return [...new Set(base.flatMap((b) => [b, sansAccent(b)]))];
};

export const ecrit = (c: Commun & { accepte: readonly string[]; faux: readonly Faux[] }): QuestionDraft => ({
  ...commun(c, c.accepte[0] ?? '', c.figure ? 75 : 40),
  ...saisie(c.accepte, c.faux),
});

export const associer = (rng: Rng, c: Commun & { paires: readonly (readonly [string, string])[] }): QuestionDraft => ({
  ...commun(c, c.paires.map(([a, b]) => `${a} → ${b}`).join(' ; '), 15 * c.paires.length),
  answer: association(rng, c.paires),
});

export const ranger = (rng: Rng, c: Commun & { enOrdre: readonly string[] }): QuestionDraft => ({
  ...commun(c, c.enOrdre.join(' → '), 50),
  answer: ordre(rng, c.enOrdre),
});

export const compter = (
  c: Commun & { valeur: number; unite?: string; faux: readonly (readonly [number, string])[] },
): QuestionDraft => ({
  ...commun(c, `${c.valeur}${c.unite ? ` ${c.unite}` : ''}`, c.figure ? 75 : 45),
  answer: num(c.valeur, c.unite),
  traps: traps(
    r(c.valeur),
    c.faux.map(([v, why]): [number, string] => [v, why]),
  ),
});

/** Trous à compléter dans des listes : `trous` donne les propositions, la bonne en premier. */
export const completer = (
  rng: Rng,
  c: Commun & { parts: readonly string[]; trous: readonly (readonly string[])[] },
): QuestionDraft => ({
  ...commun(c, c.trous.map((t) => t[0]).join(' ; '), 45),
  answer: {
    kind: 'cloze',
    parts: c.parts,
    blanks: c.trous.map((t) => {
      const options = rng.shuffle(t);
      return { mode: 'list' as const, options, correct: options.indexOf(t[0] ?? '') };
    }),
  },
});

export const document = (title: string, lines: readonly string[]): Figure => ({ kind: 'document', title, lines });

/** Liste de noms pour un énoncé, dans un ordre stable (il ne donne pas la réponse). */
export const liste = (noms: readonly string[]) => [...noms].sort((a, b) => a.localeCompare(b, 'fr')).join(', ');

/** Associer `n` paires tirées d'une banque. */
export const paires = (
  rng: Rng,
  banque: readonly (readonly [string, string])[],
  n: number,
  consigne: string,
): QuestionDraft => {
  const choisies = rng.shuffle(banque).slice(0, n);
  return associer(rng, {
    prompt: `${consigne} : ${liste(choisies.map((p) => p[0]))}.`,
    paires: choisies,
    hint: 'Commence par les paires dont tu es sûr, puis procède par élimination.',
    pourquoi: choisies.map(([a, b]) => `${maj(a)} : ${b}.`),
  });
};

type Niveau = (rng: Rng) => QuestionDraft;

export const notion = (s: {
  id: string;
  title: string;
  memo: readonly string[];
  faits: readonly string[];
  niveaux: readonly [Niveau, Niveau, Niveau, Niveau, Niveau];
}): Skill => ({
  id: s.id,
  title: s.title,
  levels: 5,
  version: 1,
  lesson: { memo: s.memo, ...referencesVivant(...s.faits) },
  generate: (rng, level) => (s.niveaux[level - 1] ?? s.niveaux[0])(rng),
});
