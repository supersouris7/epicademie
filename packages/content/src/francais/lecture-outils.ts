import type { Rng } from '../rng.ts';
import type { QuestionDraft, Rich } from '../types.ts';
import type { Trou } from './lecture.donnees.ts';
import { at, document, textTraps } from './outils.ts';

/** Formes de questions communes aux chapitres « Lire et comprendre ». */

const sansPoint = (t: string) => t.replace(/\.$/, '');

/** Association : la colonne de droite est décalée d'un ou deux rangs, jamais en face. */
export function associer(
  rng: Rng,
  prompt: string,
  paires: readonly (readonly [string, string])[],
  hint: string,
  etapes: readonly Rich[],
): QuestionDraft {
  const n = paires.length;
  const k = rng.int(1, n - 1);
  const right = paires.map((_, i) => at(paires, (i + k) % n)[1]);
  return {
    prompt,
    answer: { kind: 'match', left: paires.map((p) => p[0]), right, pairs: paires.map((p) => right.indexOf(p[1])) },
    hint,
    steps: [...etapes, `Réponses : **${paires.map(([a, b]) => `${sansPoint(a)} → ${sansPoint(b)}`).join(' ; ')}**.`],
    targetSeconds: 60,
  };
}

/** Texte à trous en liste, sous un document. */
export function trous(
  rng: Rng,
  texte: { readonly titre: string; readonly lignes: readonly string[]; readonly source?: string },
  liste: readonly Trou[],
  q: { readonly prompt: string; readonly hint: string; readonly etapes: readonly Rich[] },
): QuestionDraft {
  const fig = document(texte.titre, texte.lignes);
  return {
    prompt: q.prompt,
    figure: texte.source ? { ...fig, credit: `Source : ${texte.source}` } : fig,
    answer: {
      kind: 'cloze',
      parts: [...liste.map((t, i) => `${i === 0 ? '' : '. '}${t.etiquette} `), '.'],
      blanks: liste.map((t) => {
        const options = rng.shuffle([t.bon, ...t.faux]);
        return { mode: 'list' as const, options, correct: options.indexOf(t.bon) };
      }),
    },
    hint: q.hint,
    steps: [
      ...q.etapes,
      ...liste.map((t, i) => `Trou ${i + 1} : ${t.preuve}`),
      `Réponses : **${liste.map((t) => t.bon).join(' ; ')}**.`,
    ],
    targetSeconds: 120,
  };
}

/** Saisie : écritures justes et pièges expliqués. */
export function ecrire(
  accepted: readonly string[],
  pieges: readonly (readonly [string, string])[],
  q: Pick<QuestionDraft, 'prompt' | 'hint' | 'steps' | 'figure'>,
): QuestionDraft {
  return { ...q, answer: { kind: 'text', accepted }, traps: textTraps(accepted, pieges), targetSeconds: 60 };
}

/** Remise en ordre : les éléments ne sont jamais présentés déjà rangés. */
export function ranger(
  rng: Rng,
  ordre: readonly string[],
  q: Pick<QuestionDraft, 'prompt' | 'hint' | 'steps' | 'figure'>,
): QuestionDraft {
  let idx = rng.shuffle(ordre.map((_, i) => i));
  if (idx.every((v, i) => v === i)) idx = idx.reverse();
  return {
    ...q,
    answer: {
      kind: 'order',
      items: idx.map((i) => at(ordre, i)),
      correct: ordre.map((_, i) => idx.indexOf(i)),
    },
    targetSeconds: 90,
  };
}
