import { fmt, frac, zoneName, type Question, type Response } from '@epicademie/content';
import { accord, type Gender } from '@epicademie/shared';

/** Bonne réponse en texte enrichi (pour la correction). */
export function formatAnswer(q: Question): string {
  const a = q.answer;
  switch (a.kind) {
    case 'number':
      return `${fmt(a.value)}${a.unit ? ` ${a.unit === '%' ? '%' : a.unit}` : ''}`;
    case 'fraction':
      return frac(a.value);
    case 'choice':
      return a.options[a.correct] ?? '';
    case 'point':
      return q.figure?.kind === 'grid' && q.figure.axes
        ? `le point de coordonnées (${fmt(a.x)} ; ${fmt(a.y)}), entouré en vert`
        : 'le nœud entouré en vert';
    case 'zone':
      return `**${zoneName(a.map, a.zone) ?? a.zone}**`;
    case 'text':
      return a.accepted[0] ?? '';
    case 'order':
      return a.correct.map((i) => a.items[i] ?? '').join(' → ');
    case 'match':
      return a.left.map((l, i) => `${l} ↔ ${a.right[a.pairs[i] ?? 0] ?? ''}`).join(' ; ');
    case 'cloze':
      return a.parts
        .map((p, i) => {
          const b = a.blanks[i];
          return `${p}${b ? `**${b.mode === 'list' ? (b.options[b.correct] ?? '') : (b.accepted[0] ?? '')}**` : ''}`;
        })
        .join('');
  }
}

/** Réponse donnée par l'élève, en texte enrichi (« Tu as répondu … »). */
export function formatResponse(q: Question, r: Response): string {
  const unit = q.answer.kind === 'number' && q.answer.unit ? ` ${q.answer.unit}` : '';
  switch (r.kind) {
    case 'number':
      return `${r.text}${unit}`;
    case 'fraction':
      return r.den.trim() === '' || r.den === '1' ? r.num : `{${r.num}/${r.den}}`;
    case 'choice':
      return q.answer.kind === 'choice' ? (q.answer.options[r.index] ?? '') : '';
    case 'point':
      return q.figure?.kind === 'grid' && q.figure.axes ? `le point (${fmt(r.x)} ; ${fmt(r.y)})` : 'ce nœud';
    case 'zone':
      return q.answer.kind === 'zone' ? (zoneName(q.answer.map, r.zone) ?? r.zone) : r.zone;
    case 'text':
      return r.text;
    case 'order': {
      const a = q.answer;
      return a.kind === 'order' ? r.order.map((i) => a.items[i] ?? '').join(' → ') : '';
    }
    case 'match': {
      const a = q.answer;
      return a.kind === 'match' ? a.left.map((l, i) => `${l} ↔ ${a.right[r.pairs[i] ?? -1] ?? '?'}`).join(' ; ') : '';
    }
    case 'cloze':
      return r.answers.join(' ; ');
    case 'unknown':
      return '';
  }
}

/** « Maîtrisée seul(e) » accordé au profil ; tournure neutre si le genre n'est pas renseigné. */
export const unaidedMessage = (gender: Gender | null | undefined) =>
  gender ? accord(gender, 'Tu l’as maîtrisée seul', 'Tu l’as maîtrisée seule') : 'Maîtrisée sans aide';

/** Message de fin de série pour une notion : sa médaille (meilleure série) et la suite. */
export function medalMessage(
  s: {
    readonly answered: number;
    readonly bestBefore: number;
    readonly bestAfter: number;
    readonly due: string | null;
  },
  gender?: Gender | null,
): string {
  const when = s.due
    ? new Date(`${s.due}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  if (s.bestAfter >= 6)
    return s.bestBefore >= 6 ? 'Toujours en diamant : bravo !' : `Médaille de diamant ! ${unaidedMessage(gender)} !`;
  if (s.bestAfter === 5)
    return `${s.bestBefore >= 5 ? 'Toujours en or : bravo !' : 'Médaille d’or : notion réussie !'} Pour le diamant : réussis tout du premier coup, sans indice ni explication !`;
  if (s.answered < 4) return 'Fais une série complète sur cette notion pour gagner sa médaille.';
  if (s.bestAfter === 4) return 'Argent : plus qu’une question à réussir pour l’or !';
  if (s.bestAfter === 3) return 'Bronze : encore deux questions à réussir pour l’or !';
  return `Pas encore de médaille : réessaie ${when ? `dès ${when}` : 'bientôt'}, ça vient !`;
}

/** Réponses saisies par les composants structurés (ordre, association, texte à trous). */
export const isStructured = (a: Question['answer']) => a.kind === 'order' || a.kind === 'match' || a.kind === 'cloze';
