import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level } from '../types.ts';
import { DEPARTEMENTS } from './donnees.generated.ts';
import { GEOGRAPHIE_CHAPTERS } from './index.ts';
import { PROGRAMME } from './kit.ts';
import { METROPOLES } from './metropole.ts';
import { COMMUNES_INSEE, NOTIONS, SKILLS } from './reperes-monde.ts';
import { DEPARTEMENTS_INSEE } from './reperes.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => {
  const skill = SKILLS.find((s) => s.id === id);
  return Array.from({ length: 80 }, (_, seed) => skill!.generate(createRng(seed), level));
};

describe('géographie 6e — Repères : la France et le monde', () => {
  it('compte les quatre notions du lot, à 5 niveaux, en gardant l’identifiant des préfectures', () => {
    expect(SKILLS.map((s) => [s.id, s.version])).toEqual([
      ['g6-prefectures', 2],
      ['g6-continents-oceans', 1],
      ['g6-fleuves-montagnes', 1],
      ['g6-grandes-metropoles', 1],
    ]);
    for (const s of SKILLS) {
      expect(s.levels).toBe(5);
      expect(s.lesson.source).toContain('classe de sixième');
    }
    const chapitre = GEOGRAPHIE_CHAPTERS.find((c) => c.id === 'g6-prefectures');
    expect(chapitre?.title).toBe('Repères : la France et le monde');
    expect(chapitre?.skills).toEqual(SKILLS);
  });

  it('cite une source du registre et une citation pour chaque fait', () => {
    for (const n of NOTIONS) {
      const all = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs), ...(n.consigne ? [n.consigne] : [])];
      for (const f of all) {
        expect(getSource(f.src ?? PROGRAMME), `${n.id} ${f.src}`).toBeDefined();
        expect(f.quote.trim().length, n.id).toBeGreaterThan(10);
      }
      for (const id of n.sources ?? []) expect(getSource(id), `${n.id} ${id}`).toBeDefined();
    }
  });

  it('prévoit des pièges expliqués et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(4);
      for (const f of n.faits) expect(f.wrong.length, f.q).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, l.q).toBeGreaterThanOrEqual(2);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('cite des préfectures cohérentes avec les listes de l’INSEE et les données générées', () => {
    for (const d of DEPARTEMENTS_INSEE) {
      const releve = DEPARTEMENTS.find((x) => x.code === d.code);
      const chefLieu = d.ligne.slice(1, -1).split('","')[2];
      const commune = COMMUNES_INSEE.find((c) => c.code === chefLieu);
      expect(commune?.dep, d.code).toBe(d.code);
      expect(commune?.name, d.code).toBe(releve?.prefecture);
    }
    for (const [name, dep] of [
      ['Brest', '29'],
      ['Le Havre', '76'],
      ['Reims', '51'],
    ]) {
      expect(COMMUNES_INSEE.find((c) => c.name === name)?.dep).toBe(dep);
    }
  });

  it('associe les paires de préfectures et de pays aux données', () => {
    const [prefectures, , , metropoles] = NOTIONS;
    for (const [label, ville] of [...prefectures!.paires3, ...prefectures!.paires5]) {
      const code = /\((\w+)\)/.exec(label)?.[1];
      expect(DEPARTEMENTS.find((d) => d.code === code)?.prefecture, label).toBe(ville);
    }
    for (const [ville, pays] of [...metropoles!.paires3, ...metropoles!.paires5]) {
      expect(METROPOLES.find((m) => m.nom === ville)?.pays, ville).toContain(pays);
    }
  });

  it('interroge sur la carte : toucher aux niveaux 3 et 4, repères au niveau 5', () => {
    for (const s of SKILLS) {
      for (const level of [3, 4] as const) {
        expect(
          questions(s.id, level).some((q) => q.answer.kind === 'zone'),
          `${s.id} ${level}`,
        ).toBe(true);
      }
      expect(
        questions(s.id, 5).some((q) => q.figure?.kind === 'map'),
        s.id,
      ).toBe(true);
      expect(
        questions(s.id, 5).some((q) => q.figure?.kind === 'document'),
        s.id,
      ).toBe(true);
    }
  });

  it('accepte les écritures sans accent ni trait d’union', () => {
    const skill = SKILLS[0]!;
    const q = Array.from({ length: 600 }, (_, seed) => skill.generate(createRng(seed), 4)).find(
      (x) => x.answer.kind === 'text' && x.prompt.includes('« Manche »'),
    );
    expect(q).toBeDefined();
    const full = {
      ...q!,
      id: 't',
      traps: [],
      skillId: 'g6-prefectures',
      level: 4 as const,
      seed: 0,
      targetSeconds: 30,
    };
    expect(check(full, { kind: 'text', text: 'saint lo' }).correct).toBe(true);
  });

  it('n’affiche aucune ligne de fichier brute à l’élève', () => {
    for (const level of LEVELS) {
      for (const q of questions('g6-prefectures', level)) expect(q.steps.join(' ')).not.toContain('","');
    }
  });
});
