import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_LISTENING_6E_CHAPTER } from './ecoute-6e.ts';
import { CULTURE } from './ecoute-6e-donnees.ts';
import { FAITS } from './ecoute-6e-faits.ts';

const { skills } = ENGLISH_LISTENING_6E_CHAPTER;
const IDS = ['a6-message-court', 'a6-nombres-dates-heures', 'a6-reperes-culturels'];
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const cache = new Map<string, Question[]>();
const questions = (id: string, level: Level) => {
  const key = `${id}-${level}`;
  const found = cache.get(key) ?? Array.from({ length: 600 }, (_, i) => generate(id, level, i + 1));
  cache.set(key, found);
  return found;
};

describe('anglais 6e : écouter et comprendre', () => {
  it('3 notions à 5 niveaux, programme cité et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(IDS);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_LISTENING_6E_CHAPTER })).toEqual([]);
    }
  });

  it('chaque fait a un identifiant unique, une source du registre et une citation', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('écoute : voix anglaise, alternative à lire à chaque niveau', () => {
    for (const id of IDS.slice(0, 2))
      for (const l of LEVELS) {
        const qs = questions(id, l);
        expect(
          qs.some((q) => q.audio),
          `${id} ${l}`,
        ).toBe(true);
        expect(
          qs.some((q) => !q.audio),
          `${id} ${l}`,
        ).toBe(true);
        for (const q of qs) if (q.audio) expect(q.audio.lang).toBe('en-GB');
      }
  });

  it('une même question entendue attend toujours le même texte lu', () => {
    for (const id of IDS.slice(0, 2))
      for (const l of LEVELS) {
        const seen = new Map<string, string>();
        for (const q of questions(id, l)) {
          if (!q.audio) continue;
          const options = q.answer.kind === 'choice' ? [...q.answer.options].sort() : [];
          const key = `${q.prompt}|${options.join('|')}`;
          expect(seen.get(key) ?? q.audio.text, key).toBe(q.audio.text);
          seen.set(key, q.audio.text);
        }
      }
  });

  it('saisie : réponses justes acceptées, pièges refusés ; deux erreurs typiques au moins', () => {
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

  it('dates et heures saisies : variantes d’écriture acceptées', () => {
    const date = questions(IDS[1]!, 3).find((q) => q.prompt.includes('Écris la date'))!;
    if (date.answer.kind !== 'text') throw new Error('saisie attendue');
    const first = date.answer.accepted[0]!;
    expect(check(date, { kind: 'text', text: `le ${first}` }).correct).toBe(true);
    const clock = questions(IDS[1]!, 4).find((q) => q.prompt.startsWith('L’horloge affiche 3:15'))!;
    for (const text of ['quarter past three', 'a quarter past three', 'It’s fifteen past three.'])
      expect(check(clock, { kind: 'text', text }).correct, text).toBe(true);
    expect(check(clock, { kind: 'text', text: 'quarter to three' }).correct).toBe(false);
  });

  it('l’indice ne contient pas la réponse', () => {
    for (const s of skills)
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          if (q.answer.kind !== 'choice') continue;
          const good = q.answer.options[q.answer.correct]!.toLowerCase();
          expect(q.hint.toLowerCase(), q.prompt).not.toContain(good);
        }
  });

  it('repères : chaque fait évalué a trois leurres, des paires distinctes et figure dans le mémo', () => {
    for (const c of CULTURE) expect(c.wrong, c.id).toHaveLength(3);
    expect(new Set(CULTURE.map((c) => c.pair[1])).size).toBe(CULTURE.length);
    const memo = skills[2]!.lesson.memo.join(' ');
    for (const word of [
      'Saint Patrick’s Day',
      'Thanksgiving',
      'Halloween',
      'Bonfire Night',
      'Pancake Day',
      'Highlands',
      'Mississippi',
      'Nairobi',
      'Dublin',
      'Hogwarts',
      'Finn McCool',
      'Giant’s Causeway',
      'Grinch',
    ])
      expect(memo).toContain(word);
  });
});
