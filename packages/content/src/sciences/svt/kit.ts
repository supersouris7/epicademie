import { choice } from '../../build.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Rich } from '../../types.ts';

/** QCM écrit en données : bonne réponse, erreurs expliquées, indice et explication. */
export interface Qcm {
  readonly prompt: Rich;
  readonly bonne: Rich;
  /** [proposition fausse, pourquoi elle est fausse]. */
  readonly fausses: readonly (readonly [Rich, Rich])[];
  readonly indice: Rich;
  /** Ce qu'on cherche et pourquoi ; la réponse en gras est ajoutée ensuite. */
  readonly explication: readonly Rich[];
}

export function qcm(rng: Rng, q: Qcm, targetSeconds: number): QuestionDraft {
  const { answer, traps } = choice(
    rng,
    q.bonne,
    q.fausses.map(([label, why]) => ({ label, why })),
  );
  return {
    prompt: q.prompt,
    answer,
    traps,
    hint: q.indice,
    steps: [...q.explication, `Réponse : **${q.bonne}**.`],
    targetSeconds,
  };
}
