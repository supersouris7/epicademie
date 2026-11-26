import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { Figure, Level, QuestionDraft, Rich } from '../../types.ts';
import { association, ordre, saisie } from '../st/outils.ts';
import { qcm } from './kit.ts';

/** Une question écrite en données, tirée au sort parmi celles de son niveau. */
export type Modele = (rng: Rng) => QuestionDraft;

/** [proposition ou mot faux, pourquoi]. */
export type Erreurs = readonly (readonly [Rich, Rich])[];

export const choisir =
  (prompt: Rich, bonne: Rich, fausses: Erreurs, indice: Rich, pourquoi: Rich): Modele =>
  (rng) =>
    // Un énoncé long (document résumé) laisse plus de temps.
    qcm(rng, { prompt, bonne, fausses, indice, explication: [pourquoi] }, prompt.length > 120 ? 55 : 30);

export const ecrire =
  (prompt: Rich, accepted: readonly string[], erreurs: Erreurs, indice: Rich, pourquoi: Rich): Modele =>
  () => ({
    prompt,
    ...saisie(accepted, erreurs),
    hint: indice,
    steps: [pourquoi, `Réponse : **${accepted[0] ?? ''}**.`],
    targetSeconds: 35,
  });

export const associer =
  (prompt: Rich, paires: readonly (readonly [Rich, Rich])[], indice: Rich, pourquoi: Rich): Modele =>
  (rng) => ({
    prompt: `${prompt} : ${paires.map((p) => p[0]).join(', ')}.`,
    answer: association(rng, paires),
    hint: indice,
    steps: [pourquoi, `Par exemple : **${paires[0]?.[0] ?? ''} → ${paires[0]?.[1] ?? ''}**.`],
    targetSeconds: 25 + 8 * paires.length,
  });

export const ranger =
  (prompt: Rich, enOrdre: readonly Rich[], indice: Rich, pourquoi: Rich): Modele =>
  (rng) => ({
    prompt,
    answer: ordre(rng, enOrdre),
    hint: indice,
    steps: [pourquoi, `Ordre : **${enOrdre.join(' → ')}**.`],
    targetSeconds: 50,
  });

/** Phrase à trous : les segments entourent les trous ; la première variante acceptée est la réponse affichée. */
export const completer =
  (
    prompt: Rich,
    parts: readonly string[],
    trous: readonly (readonly string[])[],
    indice: Rich,
    pourquoi: Rich,
  ): Modele =>
  () => ({
    prompt,
    answer: { kind: 'cloze', parts, blanks: trous.map((accepted) => ({ mode: 'text' as const, accepted })) },
    hint: indice,
    steps: [pourquoi, `Réponses : **${trous.map((t) => t[0] ?? '').join(' ; ')}**.`],
    targetSeconds: 45,
  });

/** Calcul sur un relevé : grand − petit, avec les deux erreurs typiques (additionner, recopier une valeur). */
export const ecart = (prompt: Rich, grand: number, petit: number, indice: Rich, pourquoi: Rich): QuestionDraft => ({
  prompt,
  answer: num(grand - petit),
  traps: traps(r(grand - petit), [
    [grand + petit, 'On cherche un écart entre deux valeurs : il faut soustraire, pas additionner.'],
    [petit, 'Tu as recopié une valeur du relevé. Il faut calculer la différence entre les deux.'],
  ]),
  hint: indice,
  steps: [pourquoi, `${grand} − ${petit} = **${grand - petit}**.`],
  targetSeconds: 60,
});

/** Ajoute un document (inventé pour l'exercice) à une question. */
export const surDocument = (title: string, lines: readonly string[], question: QuestionDraft): QuestionDraft => ({
  ...question,
  figure: { kind: 'document', title, lines, credit: 'Document écrit pour l’exercice' } satisfies Figure,
});

/** Un modèle tiré au sort parmi ceux du niveau demandé (niveaux 1 à 5). */
export const generer =
  (niveaux: readonly [readonly Modele[], readonly Modele[], readonly Modele[], readonly Modele[], readonly Modele[]]) =>
  (rng: Rng, level: Level): QuestionDraft =>
    rng.pick(niveaux[level - 1] ?? niveaux[0])(rng);
