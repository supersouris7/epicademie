import { fmt, frac, type Question, type Response } from '@questeo/content';

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
    case 'text':
      return a.accepted[0] ?? '';
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
    case 'text':
      return r.text;
  }
}

export const STAGE_LABELS = ['À revoir', 'Réussie une fois', 'Réussie deux fois', 'Acquise'] as const;

/** Message de fin de série pour une notion : sa médaille (meilleure série de 5) et la suite. */
export function medalMessage(s: {
  readonly answered: number;
  readonly bestBefore: number;
  readonly bestAfter: number;
  readonly due: string | null;
}): string {
  const when = s.due
    ? new Date(`${s.due}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  if (s.bestAfter >= 5) return s.bestBefore >= 5 ? 'Toujours en or : bravo !' : 'Médaille d’or : notion acquise !';
  if (s.answered < 5) return 'Fais une série de 5 sur cette notion pour gagner sa médaille.';
  if (s.bestAfter === 4) return 'Argent (4/5) : un sans-faute pour l’or !';
  if (s.bestAfter === 3) return 'Bronze (3/5) : vise 5/5 pour l’or !';
  return `À revoir ${when ? `dès ${when}` : 'bientôt'} : 3 bonnes réponses sur 5 pour le bronze.`;
}
