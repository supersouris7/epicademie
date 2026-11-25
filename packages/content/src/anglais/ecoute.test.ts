import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_LISTENING_CHAPTER } from './ecoute.ts';
import { FAITS, numberWord } from './ecoute-faits.ts';

const { skills } = ENGLISH_LISTENING_CHAPTER;
const IDS = ['acm1-nombres-entendus', 'acm1-consignes', 'acm1-mots-cles', 'acm1-reperes-uk'];
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 300 }, (_, i) => generate(id, level, i + 1));

describe('anglais cm1 : écouter et comprendre', () => {
  it('4 notions à 5 niveaux, sources valides et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(IDS);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('lve-cm-2026');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_LISTENING_CHAPTER })).toEqual([]);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
  });

  it('nombres de 1 à 100 : mots composés avec un tiret', () => {
    expect([1, 13, 30, 47, 90, 100].map(numberWord)).toEqual([
      'one',
      'thirteen',
      'thirty',
      'forty-seven',
      'ninety',
      'a hundred',
    ]);
    for (let n = 1; n <= 100; n++) expect(numberWord(n)).not.toContain('undefined');
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('écoute : voix anglaise, et une alternative à lire à chaque niveau (hors repères)', () => {
    for (const id of IDS.slice(0, 3))
      for (const l of LEVELS) {
        const qs = questions(id, l);
        expect(
          qs.some((q) => !q.audio),
          `${id} ${l}`,
        ).toBe(true);
        for (const q of qs) if (q.audio) expect(q.audio.lang).toBe('en-GB');
      }
    for (const id of IDS.slice(0, 2)) expect(questions(id, 1).some((q) => q.audio)).toBe(true);
  });

  it('une même phrase entendue avec les mêmes propositions attend toujours la même réponse', () => {
    for (const id of IDS)
      for (const l of LEVELS) {
        const seen = new Map<string, string>();
        for (const q of questions(id, l)) {
          if (!q.audio || q.answer.kind !== 'choice') continue;
          const key = `${q.prompt}|${[...q.answer.options].sort().join('|')}`;
          const good = q.answer.options[q.answer.correct]!;
          expect(seen.get(key) ?? good, key).toBe(good);
          seen.set(key, good);
        }
      }
  });

  it('saisie : réponses justes acceptées, chaque piège jugé faux et expliqué ; deux pièges au moins', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct, q.prompt).toBe(true);
          for (const t of q.traps)
            if ('text' in t)
              expect(check(q, { kind: 'text', text: t.text }).correct, `${q.prompt} ${t.text}`).toBe(false);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  const find = (id: string, level: Level, part: string) => questions(id, level).find((x) => x.prompt.includes(part))!;
  const right = (q: ReturnType<typeof find>, text: string) => check(q, { kind: 'text', text }).correct;

  it('consignes : « please » bien placé, variantes courantes, jamais « Don’t be quiet »', () => {
    const jump = find('acm1-consignes', 4, 'Ne saute pas');
    for (const text of ["Please don't jump", 'Please do not jump!', "Don't jump, please", 'do not jump please'])
      expect(right(jump, text), text).toBe(true);
    for (const text of ["don't please jump", 'do not please jump']) expect(right(jump, text), text).toBe(false);
    for (const [fr, texts] of [
      ['Colorie', ['colour in', 'color in', 'color']],
      ['Découpe', ['cut out']],
      ['Coche', ['check']],
      ['Lève-toi', ['get up']],
      ['Fais un tour', ['turn round', 'please, turn around']],
    ] as const)
      for (const text of texts) expect(right(find('acm1-consignes', 3, `« ${fr}`), text), text).toBe(true);
    expect(right(find('acm1-consignes', 4, 'Ne colorie pas'), "Don't colour in")).toBe(true);
    for (const l of [4, 5] as const)
      for (const q of questions('acm1-consignes', l))
        expect(JSON.stringify(q).toLowerCase()).not.toMatch(/ne te tais pas|don[’']t be quiet\./);
    for (const q of questions('acm1-consignes', 4))
      if (q.answer.kind === 'choice') expect(q.answer.options).toHaveLength(4);
  });

  it('mots-clés : mum, dad et « prénom’s » acceptés', () => {
    const qs = questions('acm1-mots-cles', 4);
    const yuna = qs.find((q) => q.prompt.includes('Yuna') && q.prompt.includes('un chien'))!;
    for (const text of ['mom', 'Mummy', 'mommy', "Yuna's mum", 'Yuna’s mum'])
      expect(right(yuna, text), text).toBe(true);
    const dad = qs.find((q) => q.prompt.includes('Yuna') && q.prompt.includes('un chat'))!;
    expect(right(dad, 'daddy')).toBe(true);
  });

  it('repères : indices sans la réponse, variantes acceptées, faits évalués présents dans le mémo', () => {
    for (const q of questions('acm1-reperes-uk', 1)) {
      if (q.answer.kind !== 'choice') continue;
      const good = q.answer.options[q.answer.correct]!.replace(/^(une?|le|des) /, '').split(' ')[0]!;
      expect(q.hint.toLowerCase(), q.prompt).not.toContain(good.toLowerCase());
    }
    for (const [part, text] of [
      ['jouer un tour', 'trick-or-treat'],
      ['drapeau du Royaume-Uni', 'the Union Flag'],
      ['drapeau du Royaume-Uni', 'Union Flag'],
    ] as const)
      expect(right(find('acm1-reperes-uk', 4, part), text), text).toBe(true);
    for (const [part, text] of [
      ['fantôme', 'the ghost'],
      ['sorcière', 'the witch'],
      ['citrouille', 'the pumpkin'],
    ] as const)
      expect(right(find('acm1-reperes-uk', 3, part), text), text).toBe(true);
    const memo = skills[3]!.lesson.memo.join(' ');
    for (const word of [
      'dragon',
      'Giant’s Causeway',
      'Union Jack',
      'egg hunt',
      'Trick or treat',
      'pumpkin',
      'witch',
      'ghost',
    ])
      expect(memo).toContain(word);
  });

  it('interdiction : « Don’t » avec apostrophe droite ou « Do not » acceptés', () => {
    const q = questions('acm1-consignes', 4).find((x) => x.prompt.includes('N’écris pas'))!;
    for (const text of ["Don't write!", 'Do not write', 'don’t write.'])
      expect(check(q, { kind: 'text', text }).correct, text).toBe(true);
    expect(check(q, { kind: 'text', text: 'No write' }).correct).toBe(false);
  });
});
