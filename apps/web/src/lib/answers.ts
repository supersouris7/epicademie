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

export function stageMessage(stage: number, due: string | null): string {
  const when = due
    ? new Date(`${due}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';
  switch (stage) {
    case 0:
      return `À revoir ${when ? `dès ${when}` : 'bientôt'}`;
    case 1:
      return `1re réussite ! Prochaine révision ${when}`;
    case 2:
      return `2e réussite ! Dernière révision ${when}`;
    default:
      return `Acquise ! Petit rappel ${when}`;
  }
}
