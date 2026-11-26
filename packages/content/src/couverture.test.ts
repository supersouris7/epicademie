import { describe, expect, it } from 'vitest';
import { CHAPTERS, allSkillEntries, generate } from './catalog.ts';
import { auditSkill, glossaryIssues, isStrict, reviewIssues, sourceIssues } from './couverture.ts';
import { previewOf, previewSkill } from './apercu.ts';
import { RELECTURES, isReviewed } from './relectures.ts';
import { ALLOWED_DOMAINS, SOURCES, isAllowedUrl } from './sources.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from './glossaires.ts';
import { validateVariants } from './validate.ts';
import type { Skill } from './types.ts';

const skill = (over: Partial<Skill> & { sources?: string[]; memo?: string[] } = {}): Skill => ({
  id: 'x-test',
  title: 'Test',
  levels: 5,
  version: 2,
  lesson: { memo: over.memo ?? ['Un **mot**.'], source: 'prog', ...(over.sources ? { sources: over.sources } : {}) },
  generate: () => ({ prompt: 'p', answer: { kind: 'text', accepted: ['a'] }, steps: ['s'], hint: 'h' }),
});

describe('registre des sources', () => {
  it('chaque source a une URL d’un domaine institutionnel autorisé et des dates', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length);
    for (const s of SOURCES) {
      expect(isAllowedUrl(s.url), s.id).toBe(true);
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.textDate).toMatch(/^\d{4}(-\d{2}(-\d{2})?)?$/);
      expect(s.consultedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(ALLOWED_DOMAINS).toContain('eduscol.education.fr');
  });

  it('refuse les domaines non institutionnels, http et les faux sous-domaines', () => {
    expect(isAllowedUrl('https://fr.wikipedia.org/wiki/Clovis')).toBe(false);
    expect(isAllowedUrl('http://eduscol.education.fr/x')).toBe(false);
    expect(isAllowedUrl('https://evil-education.gouv.fr.example.com/')).toBe(false);
    expect(isAllowedUrl('https://noteducation.gouv.fr/')).toBe(false);
    expect(isAllowedUrl('pas une url')).toBe(false);
    expect(isAllowedUrl('https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A')).toBe(true);
  });
});

describe('règles de couverture d’une notion à 5 niveaux', () => {
  it('sources : absente, inconnue, URL refusée, valide', () => {
    expect(sourceIssues(skill()).map((i) => i.code)).toEqual(['source-absente']);
    expect(sourceIssues(skill({ sources: ['nope'] })).map((i) => i.code)).toEqual(['source-inconnue']);
    const bad = [{ ...SOURCES[0]!, id: 'bad', url: 'https://example.com/x' }];
    expect(sourceIssues(skill({ sources: ['bad'] }), bad).map((i) => i.code)).toEqual(['source-url']);
    expect(sourceIssues(skill({ sources: ['cycle3-2020'] }))).toEqual([]);
  });

  it('relecture : « ok » à la version courante exigée hors maths seulement', () => {
    const s = skill();
    const list = [{ skillId: 'x-test', version: 1, lot: 'l', date: '2026-11-24', verdict: 'ok' as const }];
    expect(reviewIssues({ skill: s, chapter: { subject: 'histoire' } }, list).map((i) => i.code)).toEqual([
      'relecture-absente',
    ]);
    expect(isReviewed('x-test', 2, [{ ...list[0]!, version: 2 }])).toBe(true);
    expect(isReviewed('x-test', 2, [{ ...list[0]!, version: 2, verdict: 'corriger' }])).toBe(false);
    expect(reviewIssues({ skill: s, chapter: { subject: 'maths' } }, list)).toEqual([]);
  });

  it('glossaire : chaque terme en gras du mémo est défini', () => {
    expect(boldTerms('Le **sujet** et le **verbe**.')).toEqual(['sujet', 'verbe']);
    const entry = { skill: skill(), chapter: { subject: 'maths' as const } };
    expect(glossaryIssues(entry).map((i) => i.code)).toEqual(['terme-non-defini']);
    expect(isDefined('Quotient', SUBJECT_GLOSSARIES.maths!)).toBe(true);
  });

  it('une notion à 3 niveaux n’est pas contrôlée ici', () => {
    const legacy = { ...skill(), levels: 3 as const };
    expect(isStrict(legacy)).toBe(false);
    expect(auditSkill({ skill: legacy, chapter: { subject: 'histoire' } })).toEqual([]);
  });
});

describe('couverture du catalogue', () => {
  const entries = allSkillEntries().filter((e) => !e.boss);

  it('toute notion à 5 niveaux a sources, relecture « ok » (hors maths) et termes définis', () => {
    const issues = entries.flatMap((e) => auditSkill(e).map((i) => `${i.skillId} ${i.code} : ${i.message}`));
    expect(issues).toEqual([]);
  });

  it('toute notion à 5 niveaux produit des questions valides aux 5 niveaux, progressives', () => {
    for (const { skill: s } of entries.filter((e) => isStrict(e.skill))) {
      const byLevel = ([1, 2, 3, 4, 5] as const).map((level) =>
        Array.from({ length: 20 }, (_, seed) => generate(s.id, level, seed)),
      );
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      const prompts = byLevel.map((qs) => qs.map((q) => q.prompt).join('|'));
      expect(new Set(prompts).size, `${s.id} : niveaux identiques`).toBe(5);
    }
  });

  it('les sources citées existent dans le registre', () => {
    const ids = new Set(SOURCES.map((s) => s.id));
    for (const { skill: s } of entries) for (const id of s.lesson.sources ?? []) expect(ids.has(id), s.id).toBe(true);
  });

  it('les relectures visent des notions existantes', () => {
    const known = new Set(entries.map((e) => e.skill.id));
    for (const r of RELECTURES) expect(known.has(r.skillId), r.skillId).toBe(true);
  });

  it('notions historiques (3 niveaux) : leur nombre ne peut que diminuer', () => {
    const historiques = entries.filter((e) => !isStrict(e.skill));
    // À abaisser à chaque lot qui migre des notions vers 5 niveaux ; ne jamais relever.
    expect(historiques.length).toBeLessThanOrEqual(HISTORIQUES_MAX);
  });
});

// Nombre de notions à 3 niveaux au moment du lot moteur (mo-03).
const HISTORIQUES_MAX = 353;

describe('aperçu de relecture', () => {
  it('une notion : 5 niveaux × 3 graines avec énoncé, réponse, pièges, indice, étapes et sources', () => {
    // Une notion historique (3 niveaux) d’anglais.
    const english = CHAPTERS.filter((c) => c.subject === 'anglais').flatMap((c) => c.skills);
    const id = english.find((s) => !isStrict(s))!.id;
    const md = previewSkill(id);
    expect(md).toContain('### Niveau 3');
    expect(md).not.toContain('### Niveau 4');
    expect(md.match(/- \*\*Graine \d+\*\*/g)).toHaveLength(3 * 3);
    for (const k of ['Réponse :', 'Pièges :', 'Indice :', 'Étapes :', '### Sources']) expect(md).toContain(k);
  });

  it('un chapitre : toutes ses notions ; notion inconnue : erreur', () => {
    const c = CHAPTERS.find((x) => x.subject === 'histoire')!;
    const md = previewOf(c.id);
    for (const s of c.skills) expect(md).toContain(`\`${s.id}\``);
    expect(() => previewOf('inconnue')).toThrow();
  });
});
