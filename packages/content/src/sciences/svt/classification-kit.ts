import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Rich } from '../../types.ts';
import { surDocument } from './nutrition-kit.ts';

/** Fiches d'animaux imaginaires : les caractères sont réels, les noms et les animaux sont inventés. */
export type Profil = 'vertebre' | 'oiseau' | 'mammifere' | 'primate' | 'insecte' | 'arachnide';

export const CARACTERES: Readonly<Record<Profil, readonly string[]>> = {
  vertebre: ['des vertèbres'],
  oiseau: ['des vertèbres', 'des plumes'],
  mammifere: ['des vertèbres', 'des mamelles'],
  primate: ['des vertèbres', 'des mamelles', 'un pouce opposable'],
  insecte: ['un squelette externe articulé', 'six pattes'],
  arachnide: ['un squelette externe articulé', 'huit pattes'],
};

/** Chaque profil a ses propres noms : un énoncé identique désigne toujours les mêmes fiches, donc la même réponse. */
const NOMS: Readonly<Record<Profil, readonly string[]>> = {
  vertebre: ['le zorbe', 'le quisse'],
  oiseau: ['le mirlu', 'le brandu'],
  mammifere: ['le grapou', 'le fénol'],
  primate: ['le ticlo', 'le vastrin'],
  insecte: ['le nuvic', 'le spirol'],
  arachnide: ['le plofe', 'le glomi'],
};

export interface Fiche {
  readonly nom: string;
  readonly profil: Profil;
}

/** Une fiche par profil demandé (profils distincts), avec un nom tiré au sort. */
export const fiches = <const P extends readonly Profil[]>(rng: Rng, profils: P) =>
  profils.map((profil): Fiche => ({ profil, nom: rng.pick(NOMS[profil]) })) as { [K in keyof P]: Fiche };

export const Maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const communs = (a: Profil, b: Profil) => CARACTERES[a].filter((c) => CARACTERES[b].includes(c));

const ligne = (x: Fiche) => `${Maj(x.nom)} : ${CARACTERES[x.profil].join(', ')}.`;

/** Place les fiches (mélangées) en document ; leur résumé est aussi repris dans l'énoncé pour le distinguer. */
export const avecFiches = (rng: Rng, liste: readonly Fiche[], question: QuestionDraft): QuestionDraft => {
  const melange = rng.shuffle(liste);
  return surDocument('Fiches d’animaux imaginaires', melange.map(ligne), {
    ...question,
    prompt: `Lis les fiches (${melange.map((x) => x.nom).join(', ')}). ${question.prompt}`,
  });
};

/** Question de comptage avec deux erreurs typiques expliquées. */
export const compter = (
  prompt: Rich,
  attendu: number,
  erreurs: readonly (readonly [number, Rich])[],
  indice: Rich,
  etapes: readonly Rich[],
): QuestionDraft => ({
  prompt,
  answer: num(attendu),
  traps: traps(r(attendu), erreurs),
  hint: indice,
  steps: [...etapes, `Réponse : **${attendu}**.`],
  targetSeconds: 70,
});
