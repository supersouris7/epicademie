import { describe, expect, it } from 'vitest';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../../glossaires.ts';
import { createRng } from '../../rng.ts';
import { getSource } from '../../sources.ts';
import type { Level, Question, Skill } from '../../types.ts';
import { validateVariants } from '../../validate.ts';
import { FAITS } from './donnees.ts';
import { ST_CHAPTERS } from './index.ts';

const chapitre = ST_CHAPTERS.find((c) => c.id === 'vcm2-corps-humain');
const notions: readonly Skill[] = chapitre?.skills ?? [];
const LEVELS = [1, 2, 3, 4, 5] as const;

const tirages = (s: Skill, level: Level, n = 300): Question[] =>
  Array.from({ length: n }, (_, seed) => ({
    traps: [],
    targetSeconds: 30,
    ...s.generate(createRng(seed), level),
    skillId: s.id,
    level,
    seed,
  }));
const toutes = (s: Skill) => LEVELS.flatMap((l) => tirages(s, l));

describe('sciences CM2 : « Le corps humain »', () => {
  it('porte les quatre notions du lot, en SVT, à 5 niveaux', () => {
    expect(chapitre?.grade).toBe('cm2');
    expect(chapitre?.domain).toBe('svt');
    expect(notions.map((s) => s.id)).toEqual([
      'vcm2-digestion',
      'vcm2-alimentation',
      'vcm2-besoins-alimentaires',
      'vcm2-circulation',
    ]);
    for (const s of notions) expect(s.levels, s.id).toBe(5);
  });

  it('chaque source citée existe et porte au moins un fait cité ; les mots en gras sont définis', () => {
    for (const s of notions) {
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? []) {
        expect(getSource(id), id).toBeDefined();
        expect(
          FAITS.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
      }
      for (const t of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(t, SUBJECT_GLOSSARIES.sciences ?? []), t).toBe(true);
    }
  });

  it('questions valides aux 5 niveaux, distinctes, avec au moins deux pièges expliqués par notion', () => {
    for (const s of notions) {
      const prompts = LEVELS.map((level) => {
        const qs = tirages(s, level);
        expect(validateVariants(qs), `${s.id} ${level}`).toEqual([]);
        return qs.map((q) => q.prompt).join('|');
      });
      expect(new Set(prompts).size, s.id).toBe(5);
      const pieges = new Set(toutes(s).flatMap((q) => q.traps.map((t) => t.why)));
      expect(pieges.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('le niveau 5 s’appuie toujours sur un document', () => {
    for (const s of notions) for (const q of tirages(s, 5)) expect(q.figure?.kind, s.id).toBe('document');
  });

  it('hors programme du cycle 3 : ni respiration, ni os, ni poids du corps', () => {
    for (const s of notions)
      expect(JSON.stringify(toutes(s)), s.id).not.toMatch(
        /respiration|poumon|squelette|(?<!\p{L})os(?!\p{L})|surpoids|obés|régime|calorie/iu,
      );
  });

  it('alimentation : un repère alimentaire chiffré est toujours annoncé « pour les adultes »', () => {
    const alimentation = notions.find((s) => s.id === 'vcm2-alimentation')!;
    for (const q of toutes(alimentation))
      if (/fruits et légumes faut-il|légumes secs \?|aux adultes/.test(q.prompt)) expect(q.prompt).toMatch(/adultes/);
  });

  const notion = (id: string) => notions.find((s) => s.id === id)!;
  const accepte = (q: Question) => (q.answer.kind === 'text' ? q.answer.accepted : []);

  it('digestion : les changements de texture sont travaillés, dont une remise en ordre', () => {
    const digestion = notion('vcm2-digestion');
    expect(digestion.lesson.memo.join(' ')).toMatch(/bol alimentaire.*chyme/s);
    for (const level of [2, 3, 4, 5] as const)
      expect(JSON.stringify(tirages(digestion, level)), `niveau ${level}`).toMatch(/chyme/);
    expect(
      tirages(digestion, 3).some((q) => q.answer.kind === 'order' && JSON.stringify(q.answer).includes('chyme')),
    ).toBe(true);
  });

  it('digestion niveau 5 : récit exploité sans numéro de ligne, avec ordre, erreur et réponse écrite', () => {
    const qs = tirages(notion('vcm2-digestion'), 5);
    expect(new Set(qs.map((q) => q.answer.kind))).toEqual(new Set(['choice', 'order', 'text']));
    for (const q of qs) expect(q.prompt).not.toMatch(/ligne/);
    expect(qs.some((q) => q.prompt.includes('Quelle phrase est fausse'))).toBe(true);
  });

  it('variantes attendues acceptées', () => {
    const attendues: [string, 3 | 4, string[]][] = [
      ['vcm2-digestion', 4, ['mâcher', 'macher', 'mâchage', 'côlon', 'colon', 'petit intestin']],
      ['vcm2-alimentation', 3, ['1h', '1 h']],
      ['vcm2-alimentation', 4, ['légumineuses']],
      ['vcm2-besoins-alimentaires', 3, ['exercice physique', 'activités physiques', 'effort', 'l’exercice']],
      ['vcm2-besoins-alimentaires', 4, ['exercice physique', 'activités physiques', 'effort', 'l’exercice']],
    ];
    for (const [id, level, mots] of attendues) {
      const toutesAcceptees = tirages(notion(id), level).flatMap(accepte);
      for (const m of mots) expect(toutesAcceptees, `${id} ${m}`).toContain(m);
    }
    expect(JSON.stringify(tirages(notion('vcm2-alimentation'), 3))).toContain('eau du robinet');
  });

  it('alimentation niveaux 4 et 5 : cas à calculer, et plus la question du niveau 1', () => {
    const alimentation = notion('vcm2-alimentation');
    for (const q of tirages(alimentation, 4)) expect(q.prompt).not.toMatch(/seule boisson recommandée par/);
    const n5 = JSON.stringify(tirages(alimentation, 5));
    expect(n5).not.toMatch(/Supprimer toute l’eau|Ajouter du sucre|Ne plus bouger|fruit du goûter/);
    expect(n5).toMatch(/écran de loisir/);
  });

  it('alimentation : explications exactes sur les boissons sucrées et les familles', () => {
    const textes = JSON.stringify([2, 4].flatMap((l) => tirages(notion('vcm2-alimentation'), l as Level)));
    expect(textes).not.toMatch(/vient d’une plante|édulcorant/);
    expect(textes).toContain('comptent à part');
    expect(textes).toContain('ce n’est pas de l’eau');
  });

  it('besoins : des données comparent les âges, croissants, et le plus jeune sportif reste sous l’adolescent au calme', () => {
    const besoins = notion('vcm2-besoins-alimentaires');
    expect(besoins.lesson.sources).toContain('bo-restauration-2001');
    for (const level of [2, 4, 5] as const)
      expect(JSON.stringify(tirages(besoins, level)), `niveau ${level}`).toMatch(/adolescen/i);
    for (const q of tirages(besoins, 5)) {
      const lignes = q.figure?.kind === 'document' ? q.figure.lines : [];
      const n = lignes.map((l) => [...l.matchAll(/(\d+) points/g)].map((m) => Number(m[1])));
      expect(n[0]![0]!).toBeLessThan(n[1]![0]!);
      expect(n[1]![0]!).toBeLessThan(n[2]![0]!);
      for (const [calme, sport] of n) expect(sport!).toBeGreaterThan(calme!);
      expect(n[0]![1]!).toBeLessThan(n[2]![0]!);
    }
    expect(JSON.stringify(toutes(besoins))).not.toMatch(/cheveux|prénom|rajeuni|jour plus court/);
  });

  it('alimentation : le jus de fruits n’est jamais un piège contre « fruit ou légume »', () => {
    const alimentation = notions.find((s) => s.id === 'vcm2-alimentation')!;
    for (const q of tirages(alimentation, 2))
      if (q.prompt.includes('« fruit ou légume »')) expect(JSON.stringify(q.answer)).not.toContain('jus de fruits');
  });
});
