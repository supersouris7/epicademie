import { describe, expect, it } from 'vitest';
import { SUBJECT_IDS, SUBJECTS, subjectLabel } from './subjects.ts';

describe('libellé de matière selon la classe', () => {
  it('Sciences et technologie de CM1 à 6e, Sciences au collège', () => {
    for (const g of ['cm1', 'cm2', '6e'] as const) expect(subjectLabel('sciences', g)).toBe('Sciences et technologie');
    for (const g of ['5e', '4e', '3e', 'adulte'] as const) expect(subjectLabel('sciences', g)).toBe('Sciences');
    expect(subjectLabel('sciences')).toBe('Sciences');
  });

  it('les autres matières ne changent pas de nom', () => {
    expect(subjectLabel('maths', '6e')).toBe('Maths');
    expect(SUBJECT_IDS).toContain('sciences');
    expect(SUBJECT_IDS).not.toContain('physique');
  });

  it('le français existe, avec son libellé, mais n’est pas jouable tant qu’aucun chapitre n’est publié', () => {
    expect(SUBJECT_IDS).toContain('francais');
    expect(subjectLabel('francais', '6e')).toBe('Français');
    expect(SUBJECTS.find((s) => s.id === 'francais')).toMatchObject({ color: 'francais', available: false });
  });
});
