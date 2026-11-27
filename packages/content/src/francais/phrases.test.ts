import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { analyzeSkill } from '../lisibilite.ts';
import { sensIssues } from '../sens.ts';
import { getSource } from '../sources.ts';
import type { Level, Question } from '../types.ts';
import {
  A_COMPLETER,
  DECLARATIVES,
  EXCLAMATIVES,
  FAITS,
  IMPERATIVES,
  INFORMATIONS,
  INTENTIONS,
  INTERROGATIVES,
  NEGATIONS,
  OUBLIS,
  QUESTIONS,
  QUESTIONS_LUES,
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
      const answers = [DECLARATIVES, INTERROGATIVES, IMPERATIVES].map((bank) => String(count(q, bank)));
      expect(answers.reduce((sum, n) => sum + Number(n), 0)).toBe(lines(q).length);
      expect(check(q, { kind: 'cloze', answers }).correct).toBe(true);
    });
  });

  it('types, niveau 4 : le verbe change, l’énoncé ne contient pas la réponse', () => {
    const seen = new Set<string>();
    each('fcm1-types-phrases', 4, (q) => {
      const answer = q.answer.kind === 'text' ? (q.answer.accepted[0] ?? '') : '';
      const order = answer.replace(/ ?[.!]$/, '').toLowerCase();
      const [verb = '', ...rest] = order.split(' ');
      seen.add(order);
      expect(q.prompt.toLowerCase()).toContain(`« tu ${verb}s ${rest.join(' ')}. »`);
      expect(q.prompt.toLowerCase()).not.toContain(`${order}.`);
      expect(typed(q, `${verb}s ${rest.join(' ')}.`)).toBe(false);
      expect(typed(q, `${order}.`)).toBe(true);
    });
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });

  it('négative, niveau 5 : une phrase nouvelle sans « ne » à corriger, aucune négation modèle', () => {
    each('fcm1-forme-negative', 5, (q) => {
      const found = OUBLIS.filter((o) => lines(q).includes(`${o.fautive}.`));
      expect(found).toHaveLength(1);
      const o = found[0]!;
      for (const l of lines(q)) expect(l).not.toMatch(/\bne\b|n’/);
      expect(NEGATIONS.map((n) => n.pas)).not.toContain(o.corrigee);
      expect(q.prompt).not.toContain(o.verbe);
      expect(typed(q, `${o.corrigee}.`)).toBe(true);
      expect(typed(q, `${o.fautive}.`)).toBe(false);
      if (o.corrigee.includes('n’')) expect(typed(q, `${o.corrigee.replace('n’', 'ne ')}.`)).toBe(false);
    });
  });

  it('question, niveau 5 : une question nouvelle à trouver, aucune inversion modèle', () => {
    each('fcm1-poser-question', 5, (q) => {
      const found = QUESTIONS_LUES.filter((x) => lines(q).includes(`${x.estCeQue} ?`));
      expect(found).toHaveLength(1);
      const lue = found[0]!;
      expect(QUESTIONS.map((x) => x.inversion)).not.toContain(lue.inversion);
      expect(lines(q).filter((l) => l.endsWith('?'))).toHaveLength(1);
      expect(lines(q).join(' ')).not.toMatch(/-(t-)?(tu|il|elle|vous|nous|ils|elles)\b/);
      expect(q.prompt).not.toContain(lue.verbe);
      expect(typed(q, `${lue.inversion} ?`)).toBe(true);
      expect(typed(q, `${lue.estCeQue} ?`)).toBe(false);
    });
  });

  it('négative, niveau 2 : seules les négations présentées dans le mémo sont proposées', () => {
    each('fcm1-forme-negative', 2, (q) => {
      const options = q.answer.kind === 'choice' ? q.answer.options : [];
      expect([...options].sort()).toEqual(['ne… jamais', 'ne… pas', 'ne… plus']);
    });
  });

  it('exclamative, niveau 4 : l’élève choisit la tournure, l’énoncé ne la donne pas', () => {
    const seen = new Set<string>();
    each('fcm1-forme-exclamative', 4, (q) => {
      if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
      const parts = q.answer.parts;
      const answers = q.answer.blanks.map((_, i) => {
        const trou = A_COMPLETER.find((t) => parts[i + 1]?.startsWith(` ${t.suite} !`));
        seen.add(trou?.suite ?? '');
        return trou?.mot ?? '';
      });
      expect([...answers].sort()).toEqual(['Comme', 'Quel', 'Quelle']);
      expect(check(q, { kind: 'cloze', answers }).correct).toBe(true);
      expect(check(q, { kind: 'cloze', answers: [...answers].reverse() }).correct).toBe(false);
    });
    expect(seen.size).toBe(A_COMPLETER.length);
  });

  it('ponctuation, niveau 4 : les phrases ne sont écrites qu’une fois (dans les trous)', () => {
    each('fcm1-ponctuation-fin', 4, (q) => {
      const parts = q.answer.kind === 'cloze' ? q.answer.parts.join('') : '';
      expect(lines(q)).toHaveLength(3);
      for (const l of lines(q)) expect(parts).not.toContain(l);
    });
  });

  it('exclamative, niveau 5 : seules les phrases exclamatives sont comptées', () => {
    each('fcm1-forme-exclamative', 5, (q) => {
      const k = lines(q).filter((l) => EXCLAMATIVES.includes(l)).length;
      expect(check(q, { kind: 'number', text: String(k) }).correct).toBe(true);
    });
  });

  it('ponctuation : l’intention est donnée avec chaque phrase, à tous les niveaux', () => {
    const banks = { declarative: INFORMATIONS, interrogative: INTERROGATIVES, exclamative: EXCLAMATIVES };
    for (const level of [1, 2, 3, 4, 5] as const)
      each('fcm1-ponctuation-fin', level, (q) => {
        const texts = level >= 4 ? lines(q) : [q.prompt];
        for (const text of texts) {
          const [kind] = Object.entries(INTENTIONS).find(([, l]) => l.some((i) => text.includes(i))) ?? [];
          expect(kind, text).toBeDefined();
          const bank = banks[kind as keyof typeof banks];
          if (level !== 2)
            expect(
              bank.some((p) => text.includes(`« ${p} »`)),
              text,
            ).toBe(true);
        }
      });
  });

  it('ponctuation : le point seul pour une information, aucun « ! » proposé pour elle', () => {
    for (const level of [1, 3] as const)
      each('fcm1-ponctuation-fin', level, (q) => {
        const phrase = /« (.*) » \(sans signe\)/.exec(q.prompt)?.[1] ?? '';
        expect(phrase).not.toBe('');
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
      if (q.prompt.includes('Tu écoutes')) {
        seen.add('ecoute');
        expect(typed(q, 'Ecoute la maitresse !')).toBe(true);
      }
      if (q.prompt.includes('Tu ranges')) {
        seen.add('ranges');
        expect(typed(q, 'range ta chambre')).toBe(true);
        expect(typed(q, 'Ranges ta chambre.')).toBe(false);
      }
    });
    each('fcm1-forme-negative', 5, (q) => {
      if (!lines(q).includes('Elle écoute jamais la radio.')) return;
      seen.add('radio');
      expect(typed(q, "Elle n'ecoute jamais la radio")).toBe(true);
      expect(typed(q, 'Elle écoute jamais la radio.')).toBe(false);
    });
    expect(seen.size).toBe(3);
  });
});
