import { describe, expect, it } from 'vitest';
import { CHAPTERS, generate, getSkill } from '@questeo/content';
import { toolTabs } from './tools.ts';

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
    const skill = CHAPTERS.filter((c) => c.subject === 'physique')
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
