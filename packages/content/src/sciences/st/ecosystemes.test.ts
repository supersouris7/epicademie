import { describe, expect, it } from 'vitest';
import { check } from '../../check.ts';
import { createRng } from '../../rng.ts';
import { validateVariants } from '../../validate.ts';
import type { Level } from '../../types.ts';
import { generate } from '../../catalog.ts';
import { FAITS } from './donnees.ts';
import { ST_CHAPTERS } from './index.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const chapitres = ST_CHAPTERS.filter((c) => c.id === 'vcm2-ecosystemes' || c.id === 'v6-decomposition');
const notions = chapitres.flatMap((c) => c.skills);

describe('lot « Écosystèmes » (CM2) et décomposition (6e)', () => {
  it('quatre notions au CM2, les décomposeurs en 6e, à 5 niveaux', () => {
    expect(chapitres.map((c) => [c.grade, c.skills.map((s) => s.id)])).toEqual([
      ['cm2', ['vcm2-peuplement', 'vcm2-relations', 'vcm2-chaines-alimentaires', 'vcm2-actions-humaines']],
      ['6e', ['v6-decomposeurs']],
    ]);
    for (const s of notions) {
      expect(s.levels, s.id).toBe(5);
      expect(s.lesson.source, s.id).toContain('«');
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.source === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });

  it('500 graines par niveau : questions valides, niveaux distincts, deux pièges au moins par notion', () => {
    for (const s of notions) {
      const parNiveau = LEVELS.map((l) => Array.from({ length: 500 }, (_, seed) => generate(s.id, l, seed)));
      for (const qs of parNiveau) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(parNiveau.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
      expect(Math.max(...parNiveau.flat().map((q) => q.traps.length)), s.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('association des chaînes : une seule façon de suivre les flèches du réseau', () => {
    const chaines = notions.find((s) => s.id === 'vcm2-chaines-alimentaires');
    for (let seed = 0; seed < 500; seed++) {
      const q = chaines?.generate(createRng(seed), 4);
      if (q?.answer.kind !== 'match' || q.figure?.kind !== 'document') continue;
      const { left, right } = q.answer;
      const lignes = q.figure.lines.map((x) => x.toLowerCase());
      const permis = (i: number, j: number) => lignes.includes(`${left[i]} → ${right[j]}.`.toLowerCase());
      const compter = (i: number, pris: readonly number[]): number =>
        i === left.length
          ? 1
          : right.reduce<number>(
              (n, _, j) => (!pris.includes(j) && permis(i, j) ? n + compter(i + 1, [...pris, j]) : n),
              0,
            );
      expect(compter(0, []), `graine ${seed}`).toBe(1);
    }
  });

  it('les variantes sans accent sont acceptées', () => {
    const q = Array.from({ length: 300 }, (_, seed) => generate('vcm2-peuplement', 3, seed)).find(
      (x) => x.answer.kind === 'text' && x.answer.accepted.includes('humidité'),
    );
    expect(q && check(q, { kind: 'text', text: 'humidite' }).correct).toBe(true);
  });

  const textes = (id: string, level: Level) => Array.from({ length: 500 }, (_, seed) => generate(id, level, seed));

  it('relevés chiffrés : cloportes, escargots et vers de terre plus nombreux au frais, à l’ombre et à l’humide', () => {
    const defavorable = /il fait 25 degrés|8 heures par jour|le sol est sec/;
    const favorable = /il fait 12 degrés|1 heure par jour|le sol est mouillé/;
    for (const q of textes('vcm2-peuplement', 5)) {
      if (q.figure?.kind !== 'document') continue;
      const [a = '', b = ''] = q.figure.lines;
      // Seul le facteur étudié diffère entre A et B ; B (le plus peuplé) a la valeur favorable.
      const propre = (ligne: string, autre: string) => ligne.split(/ : | ; |\. /).find((x) => !autre.includes(x)) ?? '';
      expect(propre(b.slice(7), a)).toMatch(favorable);
      expect(propre(a.slice(7), b)).toMatch(defavorable);
      expect(JSON.stringify(q)).not.toMatch(/de escargots|Dans ce relevé, il y a/);
    }
    for (const q of textes('vcm2-peuplement', 4)) {
      const m = /Zone A : (.*?) ; des (.+?) : \d+\. Zone B : (.*?) ; des /.exec(q.prompt);
      if (!m) continue;
      const [, a = '', etre, b = ''] = m;
      const change = b.split(' ; ').find((x) => !a.includes(x)) ?? '';
      if (etre === 'pâquerettes') expect(change).toContain('8 heures');
      else {
        expect(['cloportes', 'escargots', 'vers de terre']).toContain(etre);
        expect(change).toMatch(favorable);
      }
    }
  });

  it('enquête : trois étapes à ordre unique', () => {
    for (const q of textes('vcm2-peuplement', 3)) if (q.answer.kind === 'order') expect(q.answer.items).toHaveLength(3);
  });

  it('jamais la route proposée quand on cherche ce qui empêche le sol d’absorber l’eau', () => {
    const concernees = textes('vcm2-actions-humaines', 5).filter((q) =>
      q.prompt.includes('Quelle action notée empêche le sol'),
    );
    expect(concernees.length).toBeGreaterThan(0);
    for (const q of concernees) expect(JSON.stringify([q.answer, q.traps])).not.toContain('Construire une route');
  });

  it('variantes de saisie des actions humaines', () => {
    const tous = ([3, 4] as const).flatMap((l) => textes('vcm2-actions-humaines', l));
    for (const [attendu, saisies] of [
      ['passe à poissons', ['passe à poisson', 'une passe a poissons']],
      ['négatif', ['un effet negatif']],
    ] as const) {
      const q = tous.find((x) => x.answer.kind === 'text' && x.answer.accepted.includes(attendu));
      for (const text of saisies) expect(q && check(q, { kind: 'text', text }).correct, text).toBe(true);
    }
    expect(tous.some((q) => q.prompt.includes('Sans propositions'))).toBe(false);
  });
});
