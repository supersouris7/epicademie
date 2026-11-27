import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { analyzeSkill } from '../lisibilite.ts';
import { sensIssues } from '../sens.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import { FCM1_VERBE_SUJET } from './verbe-sujet.ts';
import {
  AVANT_SUJET,
  FAITS_VS,
  GROUPES_SUJETS,
  NOMS_VERBES,
  PHRASES_DOUBLES,
  PHRASES_INFINITIF,
  PHRASES_NEGATIVES,
  PHRASES_SIMPLES,
  SUJETS,
  SUJETS_PIEGES,
  VERBES_IRREGULIERS,
  VERBES_REGULIERS,
  sentence,
} from './verbe-sujet.donnees.ts';

const skills = FCM1_VERBE_SUJET;

describe('francais cm1 — le verbe et le sujet', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-verbe-conjugue',
      'fcm1-infinitif',
      'fcm1-groupe-sujet',
      'fcm1-types-sujets',
      'fcm1-nom-ou-verbe',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('chaque fait cite une source du registre et une citation non vide', () => {
    for (const f of FAITS_VS) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
  });

  it('au moins deux erreurs typiques expliquées par notion (niveaux 1 à 5, 20 graines)', () => {
    for (const s of skills) {
      const withTraps = new Set<number>();
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 20; seed++) {
          const q = generate(s.id, level as 1, seed);
          if (q.traps.length >= 2) withTraps.add(level);
          for (const t of q.traps) expect(t.why.trim().length).toBeGreaterThan(5);
        }
      expect(withTraps.size, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('la réponse attendue est juste et chaque piège est faux, à tous les niveaux', () => {
    for (const s of skills)
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 20; seed++) {
          const q = generate(s.id, level as 1, seed);
          if (q.answer.kind === 'choice')
            expect(check(q, { kind: 'choice', index: q.answer.correct }).correct).toBe(true);
          if (q.answer.kind === 'text') {
            const [first] = q.answer.accepted;
            expect(check(q, { kind: 'text', text: first ?? '' }).correct, `${s.id} N${level} g${seed}`).toBe(true);
            for (const t of q.traps)
              if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).correct, t.text).toBe(false);
          }
        }
  });
});

describe('banques de phrases', () => {
  it('chaque phrase étiquetée a le bon nombre de verbes', () => {
    const verbs = (p: readonly { tag: string }[]) => p.filter((m) => m.tag === 'v').length;
    for (const p of [...PHRASES_SIMPLES, ...PHRASES_INFINITIF, ...PHRASES_NEGATIVES]) expect(verbs(p)).toBe(1);
    for (const p of PHRASES_DOUBLES) expect(verbs(p)).toBe(2);
    for (const p of [...PHRASES_SIMPLES, ...PHRASES_NEGATIVES])
      for (const m of p) if (m.tag === 'v') expect(m.inf).toBeTruthy();
  });

  it('les infinitifs régulièrement formés se terminent par -er ou -ir', () => {
    for (const v of VERBES_REGULIERS) expect(v.inf).toMatch(/(er|ir)$/);
    for (const v of [...VERBES_REGULIERS, ...VERBES_IRREGULIERS]) expect(v.formes.length).toBeGreaterThanOrEqual(4);
  });

  it('nom ou verbe : les formes plurielles suivent la règle (-s pour le nom, -nt pour le verbe)', () => {
    for (const e of NOMS_VERBES) {
      expect(e.mot).toMatch(/e$/);
      expect(e.verbe.toLowerCase()).toContain(e.mot);
      expect(e.nom.toLowerCase()).toContain(e.mot);
    }
  });
});

describe('repasse du chapitre', () => {
  const each = (id: string, level: Level, test: (q: Question) => void) => {
    for (let seed = 0; seed < 80; seed++) test(generate(id, level, seed));
  };
  const typed = (q: Question, text: string) => check(q, { kind: 'text', text }).correct;
  const lines = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines : []);
  const bank = [...PHRASES_SIMPLES, ...PHRASES_INFINITIF, ...PHRASES_NEGATIVES, ...PHRASES_DOUBLES];

  it('version 2, un sens conforme et rien à reprendre selon le détecteur', () => {
    const chapter = { id: 'fcm1-verbe-sujet', subject: 'francais' as const, grade: 'cm1' as const };
    for (const s of skills) {
      expect(s.version, s.id).toBe(2);
      expect(s.sens?.length, s.id).toBeGreaterThanOrEqual(1);
      expect(sensIssues(s), s.id).toEqual([]);
      expect(analyzeSkill(s, chapter).counts, s.id).toEqual({});
    }
  });

  it('la dernière bulle donne la réponse en gras', () => {
    for (const s of skills)
      for (const level of [1, 2, 3, 4, 5] as const)
        each(s.id, level, (q) => expect(q.steps.at(-1), q.prompt).toMatch(/\*\*.+\*\*/));
  });

  it('verbe conjugué, niveau 5 : le total compte les verbes de chaque ligne, avec un infinitif à écarter', () => {
    const totals = new Set<number>();
    each('fcm1-verbe-conjugue', 5, (q) => {
      const phrases = lines(q).map((l) => bank.find((p) => `${sentence(p)}.` === l) ?? []);
      const count = (tag: string) => phrases.flat().filter((m) => m.tag === tag).length;
      expect(count('i')).toBeGreaterThanOrEqual(1);
      expect(check(q, { kind: 'number', text: String(count('v')) }).correct).toBe(true);
      totals.add(count('v'));
    });
    expect([...totals].sort()).toEqual([4, 5, 6]);
  });

  it('saisies : les accents ne sont pas exigés, la faute typique reste refusée', () => {
    const seen = new Set<string>();
    each('fcm1-infinitif', 4, (q) => {
      if (!/« (tu es|il est|vous êtes) »/.test(q.prompt)) return;
      seen.add('etre');
      expect(typed(q, 'être')).toBe(true);
      expect(typed(q, 'etre')).toBe(true);
    });
    each('fcm1-groupe-sujet', 3, (q) => {
      if (!q.prompt.includes('La maîtresse')) return;
      seen.add('maitresse');
      expect(typed(q, 'la maitresse')).toBe(true);
      expect(typed(q, 'maîtresse')).toBe(false);
    });
    each('fcm1-nom-ou-verbe', 3, (q) => {
      if (!q.prompt.includes('il élève')) return;
      seen.add('eleve');
      expect(typed(q, 'ils élèvent')).toBe(true);
      expect(typed(q, 'ils élèves')).toBe(false);
    });
    expect(seen.size).toBe(3);
  });

  it('aucune forme d’« être » qui soit aussi un autre verbe', () => {
    expect(VERBES_IRREGULIERS.flatMap((v) => v.formes)).not.toContain('je suis');
  });

  it('niveaux 4 et 5 du groupe sujet : la ligne demandée commence par un groupe qui dit quand', () => {
    each('fcm1-groupe-sujet', 5, (q) => {
      const n = Number(/ligne (\d)/.exec(q.prompt)?.[1]);
      expect(AVANT_SUJET.some((a) => lines(q)[n - 1]?.startsWith(a))).toBe(true);
    });
    for (const level of [4, 5] as const)
      each('fcm1-groupe-sujet', level, (q) => {
        for (const line of q.figure ? lines(q) : [q.prompt])
          expect(line).not.toMatch(/(matin|nuit|demain).*(matin|nuit|demain)/i);
      });
  });

  it('nom ou verbe, niveau 1 : les choix gardent le même ordre et la réponse suit la phrase', () => {
    const correct = new Set<number>();
    each('fcm1-nom-ou-verbe', 1, (q) => {
      if (q.answer.kind !== 'choice') throw new Error('choix attendu');
      expect(q.answer.options).toEqual(['un nom', 'un verbe', 'un adjectif']);
      const verbe = NOMS_VERBES.some((e) => q.prompt.endsWith(`« ${e.verbe} »`));
      expect(q.answer.correct).toBe(verbe ? 1 : 0);
      correct.add(q.answer.correct);
    });
    expect(correct.size).toBe(2);
  });

  it('groupes nominaux du CM1 seulement : aucun complément du nom parmi les sujets', () => {
    const groupes = [...GROUPES_SUJETS.map((g) => g.gs), ...[...SUJETS, ...SUJETS_PIEGES].map((x) => x.s)];
    for (const g of groupes) expect(g).not.toMatch(/ (de|du|des|d’|à|au|aux) /);
  });

  it('types de sujets, saisies : la consigne ne liste pas les réponses', () => {
    for (const level of [3, 4] as const)
      each('fcm1-types-sujets', level, (q) => expect(q.prompt).not.toMatch(/pronom|groupe nominal|plusieurs noms/i));
  });

  it('types de sujets, niveau 4 : seule nouveauté, un groupe qui dit quand devant un sujet du niveau 3', () => {
    const phrase = (x: (typeof SUJETS)[number]) => `${x.s} ${x.reste}`.toLowerCase();
    const contient = (q: Question, x: (typeof SUJETS)[number]) => q.prompt.toLowerCase().includes(phrase(x));
    for (const level of [3, 4] as const)
      each('fcm1-types-sujets', level, (q) => {
        expect(
          SUJETS.some((x) => contient(q, x)),
          q.prompt,
        ).toBe(true);
        expect(
          SUJETS_PIEGES.some((x) => contient(q, x)),
          q.prompt,
        ).toBe(false);
        expect(
          AVANT_SUJET.some((a) => q.prompt.includes(`« ${a} `)),
          q.prompt,
        ).toBe(level === 4);
      });
  });

  it('types de sujets, niveau 5 : compter le sujet piège a toujours son explication', () => {
    for (let seed = 0; seed < 500; seed++) {
      const q = generate('fcm1-types-sujets', 5, seed);
      if (q.answer.kind !== 'number') throw new Error('nombre attendu');
      const tropUn = String(q.answer.value.n / q.answer.value.d + 1);
      const result = check(q, { kind: 'number', text: tropUn });
      expect(result.correct).toBe(false);
      expect(JSON.stringify(result), `graine ${seed}`).toContain('Tu en as compté un de trop');
    }
  });

  it('« Qui est-ce qui » est suivi d’un verbe au singulier bien écrit', () => {
    const questions = new Set<string>();
    for (const id of ['fcm1-groupe-sujet', 'fcm1-types-sujets'])
      for (const level of [1, 3] as const)
        each(id, level, (q) => {
          for (const s of q.steps) {
            const verbe = /« Qui est-ce qui (\p{L}+)/u.exec(s)?.[1];
            if (verbe) questions.add(verbe);
          }
        });
    expect(questions).toContain('habite');
    expect([...questions].filter((v) => /(en|ons|ez|ent)$/.test(v))).toEqual([]);
  });
});
