import { fmt, generate, type Response } from '@epicademie/content';
import type { QuestionRef } from '@epicademie/shared';

/** La bonne réponse à une question (régénérée comme le ferait le client), pour les tests. */
export function rightResponse({ skillId, level, seed }: QuestionRef): Response {
  const { answer } = generate(skillId, level, seed);
  switch (answer.kind) {
    case 'number':
      return { kind: 'number', text: fmt(answer.value) };
    case 'fraction':
      return { kind: 'fraction', num: String(answer.value.n), den: String(answer.value.d) };
    case 'choice':
      return { kind: 'choice', index: answer.correct };
    case 'point':
      return { kind: 'point', x: answer.x, y: answer.y };
    case 'zone':
      return { kind: 'zone', zone: answer.zone };
    case 'text':
      return { kind: 'text', text: answer.accepted[0] ?? '' };
    case 'order':
      return { kind: 'order', order: [...answer.correct] };
    case 'match':
      return { kind: 'match', pairs: [...answer.pairs] };
    case 'cloze':
      return {
        kind: 'cloze',
        answers: answer.blanks.map((b) => (b.mode === 'list' ? (b.options[b.correct] ?? '') : (b.accepted[0] ?? ''))),
      };
  }
}
