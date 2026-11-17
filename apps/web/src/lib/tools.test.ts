import { describe, expect, it } from 'vitest';
import { generate, getSkill } from '@questeo/content';
import { toolTabs } from './tools.ts';

const tabs = (skillId: string) => toolTabs(generate(skillId, 2, 3), getSkill(skillId));

describe('outils proposés', () => {
  it('pas de calculatrice quand calculer est l’objectif', () => {
    for (const id of ['m5-tables', 'm5-carres', 'm5-relatifs-addition', 'm5-fractions-addition', 'm5-priorites'])
      expect(tabs(id), id).not.toContain('calculatrice');
  });
  it('calculatrice partout ailleurs, même pour un calcul annexe (carrés, aires…)', () => {
    for (const id of [
      'm5-puissances-expressions',
      'm5-disque',
      'm5-triangle-aire',
      'm5-substitution',
      'm5-pourcentages',
    ])
      expect(tabs(id), id).toContain('calculatrice');
  });
});
