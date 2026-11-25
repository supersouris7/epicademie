import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_LISTENING_CHAPTER } from './ecoute.ts';
import { FAITS } from './ecoute-faits.ts';

const { skills } = ENGLISH_LISTENING_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const IDS = ['acm2-heure-entendue', 'acm2-prix-dates', 'acm2-dialogue', 'acm2-reperes-culturels'];
const questions = (id: string, level: Level) => Array.from({ length: 300 }, (_, i) => generate(id, level, i + 1));

describe('anglais cm2 : écouter et comprendre', () => {
  it('4 notions à 5 niveaux, sources valides et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(IDS);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('lve-cm-2026');
      expect(s.lesson.sources).toContain('cycle3-2020');
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

  it('questions valides (300 graines) et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  });

  it('saisie : réponses justes acceptées, chaque piège jugé faux ; deux pièges expliqués au moins', () => {
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

  it('écoute : le texte entendu n’est jamais dans l’énoncé, et chaque notion d’écoute a des variantes à lire', () => {
    for (const id of ['acm2-heure-entendue', 'acm2-prix-dates', 'acm2-dialogue']) {
      const all = LEVELS.flatMap((l) => questions(id, l));
      const audio = all.filter((q) => q.audio);
      expect(audio.length, id).toBeGreaterThan(0);
      for (const q of audio) {
        expect(q.audio!.lang).toBe('en-GB');
        expect(q.prompt).not.toContain(q.audio!.text);
      }
      expect(all.filter((q) => !q.audio).length, id).toBeGreaterThan(0);
    }
  });

  it('heure : quarter to, half past et o’clock donnent la bonne heure', () => {
    const qs = questions('acm2-heure-entendue', 2).filter((q) => q.audio);
    const cases: Record<string, string> = {
      'It’s quarter to six.': '5:45',
      'It’s quarter past six.': '6:15',
      'It’s half past twelve.': '12:30',
    };
    let seen = 0;
    for (const q of qs) {
      const good = cases[q.audio!.text];
      if (!good || q.answer.kind !== 'choice') continue;
      seen++;
      expect(q.answer.options[q.answer.correct]).toBe(good);
    }
    expect(seen).toBeGreaterThan(0);
    const say = questions('acm2-heure-entendue', 4).find((q) => q.prompt.includes(' 6:35.'))!;
    for (const text of ['twenty-five to seven', 'It’s twenty five to seven.', "it's twenty-five to seven"])
      expect(check(say, { kind: 'text', text }).correct, text).toBe(true);
    expect(check(say, { kind: 'text', text: 'thirty-five past six' }).correct).toBe(false);
  });

  it('dates : 1st, 2nd, 3rd, mais 11th, 12th, 13th', () => {
    for (const q of questions('acm2-prix-dates', 4)) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      const good = q.answer.accepted[0]!;
      const day = Number(/the (\d+)/.exec(good)![1]);
      const suffix = day >= 11 && day <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][day % 10] ?? 'th');
      expect(good, q.prompt).toContain(`${day}${suffix}`);
    }
  });

  it('niveau 5 : la réponse vient du message ou du dialogue', () => {
    for (const q of questions('acm2-reperes-culturels', 5)) {
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'choice') throw new Error('document attendu');
      const kid = /préférée de (\w+)/.exec(q.prompt)![1]!;
      const line = q.figure.lines.find((l) => l.startsWith(`${kid}:`))!;
      const fest = /festival is ([\w ]+)\./.exec(line)![1]!;
      const dates: Record<string, string> = {
        Halloween: '31 octobre',
        'Bonfire Night': '5 novembre',
        Christmas: '25 décembre',
        'Pancake Day': 'un mardi de février ou de mars',
      };
      expect(q.answer.options[q.answer.correct]).toBe(dates[fest]);
    }
    for (const q of questions('acm2-prix-dates', 5)) {
      if (q.answer.kind !== 'choice') throw new Error('QCM attendu');
      const text = q.audio?.text ?? (q.figure?.kind === 'document' ? q.figure.lines.join(' ') : '');
      const price = /£(\d+)\.(\d\d)/.exec(text)!;
      expect(q.answer.options[q.answer.correct]).toContain(`${price[1]},${price[2]} £`);
    }
  });
});
