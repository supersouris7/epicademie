import { describe, expect, it } from 'vitest';
import { getSource } from '../sources.ts';
import { GLOSSAIRE } from './glossaire.ts';
import { PREUVES } from './france-xixe-sources.ts';
import { NOTIONS, SKILLS } from './france-xixe.ts';

const preuves = (n: (typeof NOTIONS)[number]) => [
  ...n.faits,
  ...n.libres,
  ...n.docs.flatMap((d) => d.qs),
  ...(n.frise ?? []),
];

describe('histoire 4e — Société, culture et politique dans la France du XIXe siècle', () => {
  it('propose les trois notions du référentiel, en 5 niveaux', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'h4-voter-1815-1870',
      'h4-troisieme-republique',
      'h4-conditions-feminines',
    ]);
    for (const s of SKILLS) expect([s.levels, s.version], s.id).toEqual([5, 1]);
  });

  it('cite pour chaque fait une source du registre, déclarée par la notion, et une citation', () => {
    for (const p of Object.values(PREUVES)) {
      expect(getSource(p.source), p.source).toBeDefined();
      expect(p.quote.trim().length, p.source).toBeGreaterThan(10);
    }
    NOTIONS.forEach((n, i) => {
      for (const p of preuves(n)) {
        expect(p.source, n.id).toBeDefined();
        expect(SKILLS[i]!.lesson.sources, n.id).toContain(p.source);
      }
      expect(SKILLS[i]!.lesson.sources, n.id).toContain('cycle4-2020');
      expect(SKILLS[i]!.lesson.sources, n.id).toContain('eduscol-4e-france-xixe');
    });
  });

  it('prévoit des erreurs typiques expliquées et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(6);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.libres.length, n.id).toBeGreaterThanOrEqual(3);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, n.id).toBeGreaterThanOrEqual(2);
      for (const d of n.docs) for (const q of d.qs) expect(q.wrong.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('rattache aux notions les sources de chaque fait cité dans le mémo', () => {
    const attendues = [
      ['an-revolution-1848'],
      ['vie-publique-loi-1905', 'bnf-zola-dreyfus'],
      ['an-femmes-revolution', 'senat-femmes-expression', 'vie-publique-vote-femmes', 'eduscol-4e-xixe'],
    ];
    attendues.forEach((ids, i) => {
      for (const id of ids) expect(SKILLS[i]!.lesson.sources, id).toContain(id);
    });
  });

  it('tient les corrections de la relecture (dates, droits et preuves)', () => {
    const texte = JSON.stringify(NOTIONS);
    expect(texte).not.toMatch(/universel masculin demeure|un non \W*et absolu|devient obligatoire/);
    expect(NOTIONS[0]!.memo.join(' ')).toContain('rétablit le suffrage universel masculin');
    expect(PREUVES.retabli1851.quote).toContain('rétablit le suffrage universel');
    expect(PREUVES.jaccuse.quote).toMatch(/Zola.*J'Accuse.*L'Aurore/);
    expect(PREUVES.fronde.quote).toMatch(/Marguerite Durand.*9 décembre 1897.*La fronde/);
    expect(texte).not.toContain('1893');
  });

  it('range chaque frise du plus ancien au plus récent', () => {
    for (const n of NOTIONS) {
      expect(n.frise!.length, n.id).toBeGreaterThanOrEqual(4);
      const years = n.frise!.map((r) => Number(/\d{4}/.exec(r.date)![0]));
      expect(
        [...years].sort((a, b) => a - b),
        n.id,
      ).toEqual(years);
      expect(new Set(years).size, n.id).toBe(years.length);
    }
  });

  it('définit au glossaire les termes nouveaux, sans doublon de forme', () => {
    const forms = GLOSSAIRE.flatMap((g) => [...new Set(g.forms.map((f) => f.toLowerCase()))]);
    for (const w of [
      'suffrage censitaire',
      'cens',
      'suffrage universel masculin',
      'candidats officiels',
      'plébiscite',
      'commune de paris',
      'lois constitutionnelles',
      'conscription',
      'isoloir',
      'affaire dreyfus',
      'séparation des églises et de l’état',
      'incapacité juridique',
      'ménagères',
      'bachelière',
      'prud’hommes',
      'féminisme',
    ]) {
      expect(
        forms.filter((f) => f === w),
        w,
      ).toHaveLength(1);
    }
  });
});
