import { dec, mul, r, type Rational } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { Skill } from '../../types.ts';
import { chapterOf, skillsOf } from '../kit.ts';

/** Outils communs aux chapitres de la 6e. */

/** Programme de 6e (cycle 3, BO n°16 du 17 avril 2025) : nombres, calcul, fractions, algèbre. */
export const S = skillsOf('6e');

export const C = chapterOf('6e');

/** Notion dont les énoncés ou les réponses ont changé (`Skill.version` 2). */
export const versionDeux = (skill: Skill): Skill => ({ ...skill, version: 2 });

/** Décimal dont le dernier chiffre n'est pas 0 (pour avoir vraiment `d` décimales). */
export function exactDecimal(rng: Rng, min: number, max: number, d: number): Rational {
  if (max <= min) throw new Error('exactDecimal : intervalle vide');
  for (;;) {
    const v = rng.int(min * 10 ** d, max * 10 ** d);
    if (v % 10 !== 0 || d === 0) return dec(v, d);
  }
}

/** Conversion d'une valeur entre deux unités d'une échelle de 10 en 10 (ou 100 en 100 : `step`). */
export function convert(x: Rational, fromIndex: number, toIndex: number, step = 10): Rational {
  const p = toIndex - fromIndex;
  return p >= 0 ? mul(x, r(step ** p)) : mul(x, r(1, step ** -p));
}
