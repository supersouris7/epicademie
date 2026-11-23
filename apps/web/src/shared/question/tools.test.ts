import { describe, expect, it } from 'vitest';
import { CHAPTERS, generate, getSkill } from '@questeo/content';
import { toolTabs } from './tools.ts';
import { erasedBy, textBox } from './tools/brouillonDraw.ts';

const tabs = (skillId: string) => toolTabs(generate(skillId, 2, 3), getSkill(skillId));

describe('outils proposés', () => {
  it('pas de calculatrice quand calculer est l’objectif', () => {
    for (const id of ['m5-tables', 'm5-carres', 'm5-relatifs-addition', 'm5-fractions-addition', 'm5-priorites'])
      expect(tabs(id), id).not.toContain('calculatrice');
  });
  it('langues, histoire, géographie : la réponse seule, sans calculatrice ni brouillon', () => {
    for (const subject of ['anglais', 'espagnol', 'histoire', 'geographie'])
      for (const chapter of CHAPTERS.filter((c) => c.subject === subject))
        for (const skill of chapter.skills) expect(tabs(skill.id), skill.id).toEqual(['reponse']);
  });
  it('physique-chimie : calculatrice et brouillon quand il y a des nombres ; question de cours : brouillon seul', () => {
    expect(tabs('p5-unites')).toEqual(['reponse', 'brouillon']);
    const skill = CHAPTERS.filter((c) => c.subject === 'sciences')
      .flatMap((c) => c.skills)
      .find((s) => /\d/.test(generate(s.id, 2, 3).prompt));
    expect(skill).toBeDefined();
    if (skill) expect(tabs(skill.id)).toEqual(expect.arrayContaining(['calculatrice', 'brouillon']));
  });
  it('calculatrice partout ailleurs en maths, même pour un calcul annexe (carrés, aires…)', () => {
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

describe('brouillon : texte et gomme', () => {
  const texte = { color: '#000', text: 'abc\ndef', points: [[100, 100, 0.5]] as const };
  const trait = { color: '#000', points: [[10, 10, 0.5]] as const };

  it('la gomme efface un texte touché, pas un texte éloigné', () => {
    expect(erasedBy(texte, [[110, 110, 0.5]])).toBe(true);
    expect(erasedBy(texte, [[300, 300, 0.5]])).toBe(false);
  });
  it('la gomme efface toujours les traits à proximité', () => {
    expect(erasedBy(trait, [[12, 12, 0.5]])).toBe(true);
    expect(erasedBy(trait, [[200, 200, 0.5]])).toBe(false);
  });
  it('un texte occupe autant de lignes que de retours à la ligne', () => {
    expect(textBox(texte)?.h).toBe(2 * 19);
    expect(textBox(trait)).toBeNull();
  });
});
