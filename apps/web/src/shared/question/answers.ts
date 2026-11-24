import { fmt, frac, type Question, type Response } from '@epicademie/content';

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
    case 'unknown':
      return '';
  }
}

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
  if (s.answered < 4) return 'Fais une série complète sur cette notion pour gagner sa médaille.';
  if (s.bestAfter === 4) return 'Argent (une erreur) : un sans-faute pour l’or !';
  if (s.bestAfter === 3) return 'Bronze (deux erreurs) : un sans-faute pour l’or !';
  return `À revoir ${when ? `dès ${when}` : 'bientôt'} : deux erreurs au plus pour le bronze.`;
}
