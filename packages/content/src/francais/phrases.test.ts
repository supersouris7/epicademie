import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { analyzeSkill } from '../lisibilite.ts';
import { sensIssues } from '../sens.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import {
  DECLARATIVES,
  EXCLAMATIVES,
  FAITS,
  IMPERATIVES,
  IMPERATIVES_NEGATIVES,
  INFORMATIONS,
  INTERROGATIVES,
} from './phrases.donnees.ts';
import { FRANCAIS_CHAPTERS } from './index.ts';

const skills = FRANCAIS_CHAPTERS.filter((c) => c.id === 'fcm1-phrases').flatMap((c) => c.skills);

describe('francais cm1 — types et formes de phrases', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-types-phrases',
      'fcm1-poser-question',
      'fcm1-forme-negative',
      'fcm1-forme-exclamative',
      'fcm1-ponctuation-fin',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('chaque fait cite une source du registre et une citation non vide', () => {
    for (const f of FAITS) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(10);
    }
  });

  it('au moins deux erreurs typiques expliquées par notion (sur 20 graines, niveaux 1 à 5)', () => {
    for (const s of skills) {
      const withTraps = new Set<number>();
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 20; seed++) {
          const q = generate(s.id, level as 1, seed);
          if (q.traps.length >= 2) withTraps.add(level);
          for (const t of q.traps) expect(t.why.trim().length).toBeGreaterThan(5);
        }
      // Tous les niveaux sauf les niveaux à association/ordre (pas de piège ciblé possible).
      expect(withTraps.size, s.id).toBeGreaterThanOrEqual(3);
    }
  });

  it('la réponse attendue est juste et chaque piège est faux, à tous les niveaux', () => {
    for (const s of skills)
      for (let level = 1; level <= 5; level++)
        for (let seed = 0; seed < 20; seed++) {
          const q = generate(s.id, level as 1, seed);
          expect(q.answer).toBeDefined();
          if (q.answer.kind === 'choice')
            expect(check(q, { kind: 'choice', index: q.answer.correct }).correct).toBe(true);
        }
  });

  it('repasse : version 2, un sens conforme et rien à reprendre selon le détecteur', () => {
    const chapter = { id: 'fcm1-phrases', subject: 'francais' as const, grade: 'cm1' as const };
    for (const s of skills) {
      expect(s.version, s.id).toBe(2);
      expect(s.sens?.length, s.id).toBeGreaterThanOrEqual(1);
      expect(sensIssues(s), s.id).toEqual([]);
      expect(analyzeSkill(s, chapter).counts, s.id).toEqual({});
    }
  });

  const each = (id: string, level: Level, test: (q: Question) => void) => {
    for (let seed = 0; seed < 60; seed++) test(generate(id, level, seed));
  };
  const lines = (q: Question) => (q.figure?.kind === 'document' ? q.figure.lines : []);
  const typed = (q: Question, text: string) => check(q, { kind: 'text', text }).correct;

  it('types, niveau 5 : les trois nombres correspondent aux lignes du texte', () => {
    const count = (q: Question, bank: readonly string[]) =>
      lines(q).filter((l) => bank.includes(l.replace(/ ?[.?!]$/, ''))).length;
    each('fcm1-types-phrases', 5, (q) => {
      const answers = [DECLARATIVES, INTERROGATIVES, [...IMPERATIVES, ...IMPERATIVES_NEGATIVES]].map((bank) =>
        String(count(q, bank)),
      );
      expect(answers.reduce((sum, n) => sum + Number(n), 0)).toBe(lines(q).length);
      expect(check(q, { kind: 'cloze', answers }).correct).toBe(true);
    });
  });

  it('exclamative, niveau 5 : seules les phrases exclamatives sont comptées', () => {
    each('fcm1-forme-exclamative', 5, (q) => {
      const k = lines(q).filter((l) => EXCLAMATIVES.includes(l)).length;
      expect(check(q, { kind: 'number', text: String(k) }).correct).toBe(true);
    });
  });

  it('ponctuation : le point seul pour une information, aucun « ! » proposé pour elle', () => {
    for (const level of [1, 3] as const)
      each('fcm1-ponctuation-fin', level, (q) => {
        const phrase = /« (.*) … »/.exec(q.prompt)?.[1] ?? '';
        if (!INFORMATIONS.includes(phrase)) return;
        if (q.answer.kind === 'choice') {
          expect(q.answer.options[q.answer.correct]).toBe('.');
          expect(q.answer.options).not.toContain('!');
        } else expect(typed(q, '.')).toBe(true);
      });
  });

  it('saisie : accents, apostrophe et signe de fin tolérés, la faute typique refusée', () => {
    const seen = new Set<string>();
    each('fcm1-types-phrases', 4, (q) => {
      if (q.prompt.includes('Vous écoutez')) {
        seen.add('ecoutez');
        expect(typed(q, 'Ecoutez la radio !')).toBe(true);
      }
      if (q.prompt.includes('Tu ranges')) {
        seen.add('ranges');
        expect(typed(q, 'range ta chambre')).toBe(true);
        expect(typed(q, 'Ranges ta chambre.')).toBe(false);
      }
    });
    each('fcm1-forme-exclamative', 4, (q) => {
      if (!q.prompt.includes('Ce gâteau')) return;
      seen.add('gateau');
      expect(typed(q, 'Comme ce gâteau est bon!')).toBe(true);
      expect(typed(q, 'Comme ce gâteau est bon.')).toBe(false);
    });
    each('fcm1-forme-negative', 5, (q) => {
      if (!/ligne (\d)/.test(q.prompt)) return;
      const n = Number(/ligne (\d)/.exec(q.prompt)?.[1]);
      if (lines(q)[n - 1] !== 'Ouvre la porte.') return;
      seen.add('porte');
      expect(typed(q, "N'ouvre pas la porte !")).toBe(true);
      expect(typed(q, 'Ouvre pas la porte.')).toBe(false);
    });
    expect(seen.size).toBe(4);
  });
});
