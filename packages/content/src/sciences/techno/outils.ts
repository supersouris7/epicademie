import { choice, type Option } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Rich, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';

export { association, maj, ordre, saisie } from '../st/outils.ts';

/** QCM : propositions mélangées, chaque proposition fausse avec son explication. */
export const qcm = (rng: Rng, bonne: Rich, fausses: readonly Option[]): Pick<QuestionDraft, 'answer' | 'traps'> =>
  choice(rng, bonne, fausses);

/** Variantes acceptées d'un mot ou d'un groupe nominal : avec et sans article. */
export const formes = (mot: string, article: 'le' | 'la' | 'l’' | 'un' | 'une') => [
  mot,
  article === 'l’' ? `l’${mot}` : `${article} ${mot}`,
];

type Niveau = (rng: Rng) => QuestionDraft;

/** Notion à 5 niveaux : référence du programme (citation) et sources des faits. */
export const notion = (
  base: {
    readonly id: string;
    readonly title: string;
    readonly memo: readonly Rich[];
    readonly attendu: string;
    readonly sources: readonly string[];
    /** Classe dont le programme est cité (5e par défaut). */
    readonly classe?: '5e' | '4e';
  },
  niveaux: readonly [Niveau, Niveau, Niveau, Niveau, Niveau],
): Skill => ({
  id: base.id,
  title: base.title,
  levels: 5,
  version: 1,
  lesson: {
    memo: base.memo,
    source: `Programme de technologie du cycle 4, classe de ${base.classe ?? '5e'} (BO n° 9 du 29 février 2024) : « ${base.attendu} ».`,
    sources: [PROGRAMME, ...base.sources],
  },
  generate: (rng, level) => (niveaux[level - 1] ?? niveaux[0])(rng),
});
