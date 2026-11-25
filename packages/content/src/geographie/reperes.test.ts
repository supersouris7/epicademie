import { describe, expect, it } from 'vitest';
import { check } from '../check.ts';
import { createRng } from '../rng.ts';
import { getSource } from '../sources.ts';
import type { Level } from '../types.ts';
import { DEPARTEMENTS, PAYS_UE } from './donnees.generated.ts';
import { PROGRAMME } from './kit.ts';
import { DEPARTEMENTS_INSEE, NOTIONS, PAYS, SKILLS, TRAVAILLES } from './reperes.ts';

const questions = (id: string, level: Level) => {
  const skill = SKILLS.find((s) => s.id === id);
  return Array.from({ length: 60 }, (_, seed) => skill!.generate(createRng(seed), level));
};

describe('géographie cm2 — Repères : France et Europe', () => {
  it('compte les trois notions du lot, à 5 niveaux, en gardant l’identifiant des départements', () => {
    expect(SKILLS.map((s) => [s.id, s.version])).toEqual([
      ['gcm2-departements', 2],
      ['gcm2-europe-capitales', 1],
      ['gcm2-continents-oceans', 1],
    ]);
    for (const s of SKILLS) {
      expect(s.levels).toBe(5);
      expect(s.lesson.source).toContain('classe de CM2');
    }
  });

  it('cite une source du registre et une citation pour chaque fait', () => {
    for (const n of NOTIONS) {
      const all = [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)];
      for (const f of all) {
        expect(getSource(f.src ?? PROGRAMME), `${n.id} ${f.src}`).toBeDefined();
        expect(f.quote.trim().length, n.id).toBeGreaterThan(10);
      }
    }
  });

  it('cite les lignes de l’INSEE, cohérentes avec les données générées', () => {
    expect(DEPARTEMENTS_INSEE.map((d) => [d.code, d.name])).toEqual(DEPARTEMENTS.map((d) => [d.code, d.name]));
  });

  it('donne les mêmes capitales que les données relevées sur le site de l’Union européenne', () => {
    for (const p of PAYS) {
      const source = getSource(`ue-pays-${p.zone}`);
      const releve = PAYS_UE.find((c) => source?.title.includes(`« ${c.name} »`));
      expect(releve?.capital.split(';')[0], p.zone).toBe(p.capitale);
    }
  });

  it('prévoit des pièges expliqués et assez de matière', () => {
    for (const n of NOTIONS) {
      expect(n.faits.length, n.id).toBeGreaterThanOrEqual(4);
      for (const f of n.faits) expect(f.wrong.length, f.q).toBeGreaterThanOrEqual(3);
      for (const l of n.libres) expect(l.traps.length, l.q).toBeGreaterThanOrEqual(2);
      for (const f of n.faits) if (f.choix) expect(f.choix, f.q).toContain(f.gap[2][0]);
      expect(n.paires3.length, n.id).toBe(3);
      expect(n.paires5.length, n.id).toBe(5);
      expect(n.docs.length, n.id).toBeGreaterThanOrEqual(2);
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
    }
  });

  it('accepte les écritures sans accent ni trait d’union', () => {
    const q = questions('gcm2-departements', 3).find((x) => x.prompt.includes('numéro 29'));
    expect(q).toBeDefined();
    const full = {
      ...q!,
      id: 't',
      traps: [],
      skillId: 'gcm2-departements',
      level: 3 as const,
      seed: 0,
      targetSeconds: 30,
    };
    expect(check(full, { kind: 'cloze', answers: ['finistere'] }).correct).toBe(true);
  });

  it('au niveau 2, ne propose que les départements travaillés', () => {
    const noms = DEPARTEMENTS_INSEE.filter((d) => TRAVAILLES.includes(d.code)).map((d) => d.name);
    expect(noms).toHaveLength(13);
    // Tirage « numéro → nom » (les faits rédigés gardent leurs propres distracteurs).
    const tirages = questions('gcm2-departements', 2).filter((q) => q.hint.includes('ordre alphabétique des noms'));
    expect(tirages.length).toBeGreaterThan(0);
    for (const q of tirages) {
      expect(TRAVAILLES, q.prompt).toContain(/numéro (\w+) \?/.exec(q.prompt)?.[1]);
      if (q.answer.kind !== 'choice') throw new Error(q.prompt);
      for (const option of q.answer.options) expect(noms, q.prompt).toContain(option);
    }
  });

  it('ne présente pas 975 comme un département', () => {
    const memo = SKILLS.find((s) => s.id === 'gcm2-departements')!.lesson.memo.join(' ');
    expect(memo).toContain('971, 972, 973, 974 et 976');
    expect(memo).not.toContain('à 976');
  });

  it('ne montre pas de ligne de fichier brute à l’élève', () => {
    for (const level of [1, 2, 3, 4, 5] as const) {
      for (const q of questions('gcm2-departements', level)) expect(q.steps.join(' ')).not.toContain('","');
    }
  });
});
