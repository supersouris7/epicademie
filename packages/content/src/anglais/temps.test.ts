import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels } from '../types.ts';
import { ENGLISH_TIME_CHAPTER } from './temps.ts';
import { DAYS, FAITS, MONTHS, SEASONS, WEATHER } from './temps-faits.ts';

const { skills } = ENGLISH_TIME_CHAPTER;

describe('anglais cm1 : le temps qui passe', () => {
  it('6 notions à 5 niveaux, avec le programme du cycle 3 pour source', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'acm1-couleurs',
      'acm1-jours',
      'acm1-mois',
      'acm1-saisons',
      'acm1-date',
      'acm1-meteo',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('cycle3-2020');
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

  it('7 jours et 12 mois, dans l’ordre des sources', () => {
    expect(DAYS).toHaveLength(7);
    const song = FAITS.find((f) => f.id === 'mois')?.quote ?? '';
    const found = MONTHS.map((m) => song.indexOf(m.en));
    expect(found).toHaveLength(12);
    expect(found).toEqual([...found].sort((a, b) => a - b));
    expect(found.every((i) => i >= 0)).toBe(true);
  });

  it('saisie : réponse juste acceptée, chaque erreur typique expliquée', () => {
    for (const s of skills)
      for (const level of [3, 4, 5] as const)
        for (let seed = 1; seed <= 30; seed++) {
          const q = generate(s.id, level, seed);
          if (q.answer.kind !== 'text') continue;
          for (const text of q.answer.accepted) expect(check(q, { kind: 'text', text }).correct, q.prompt).toBe(true);
          for (const t of q.traps)
            if ('text' in t) expect(check(q, { kind: 'text', text: t.text }).why, q.prompt).toBe(t.why);
        }
  });

  it('chaque notion prévoit au moins deux erreurs typiques', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const level of [1, 2, 3, 4, 5] as const)
        for (let seed = 1; seed <= 20; seed++) for (const t of generate(s.id, level, seed).traps) reasons.add(t.why);
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  });

  const right = (id: string, level: 3 | 4 | 5, seed: number, text: string) =>
    check(generate(id, level, seed), { kind: 'text', text }).correct;

  it('niveau 1 : l’indice ne donne aucun mot anglais de la liste', () => {
    const words = [...DAYS, ...SEASONS, ...WEATHER].map((w) => w.en.toLowerCase());
    for (const id of ['acm1-couleurs', 'acm1-jours', 'acm1-saisons', 'acm1-meteo'])
      for (let seed = 1; seed <= 30; seed++) {
        const hint = generate(id, 1, seed).hint.toLowerCase();
        for (const w of [...words, 'red', 'blue', 'green', 'sun', 'rain'])
          expect(hint.split(/[^a-z]+/)).not.toContain(w);
      }
  });

  it('variantes justes acceptées : fall, dates avec « on » ou le jour', () => {
    let autumn = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const q = generate('acm1-saisons', 5, seed);
      if (q.answer.kind === 'text' && q.answer.accepted.includes('autumn')) {
        autumn++;
        expect(right('acm1-saisons', 5, seed, 'fall')).toBe(true);
      }
      const d = generate('acm1-date', 5, seed);
      if (d.answer.kind !== 'text') continue;
      const [day, month] = (d.answer.accepted[0] ?? '').split(' ');
      const weekday = /« ([A-Z][a-z]+day) »/.exec(d.prompt)?.[1] ?? '';
      for (const t of [`on ${day} ${month}`, `${weekday} ${day} ${month}`, `${month} the ${day}th`])
        if (!t.endsWith('th') || /^([4-9]|1\d|20)$/.test(day ?? ''))
          expect(right('acm1-date', 5, seed, t), t).toBe(true);
    }
    expect(autumn).toBeGreaterThan(0);
  });

  it('jours, niveau 5 : la veille et le lendemain, lundi compris', () => {
    const answers = new Set<string>();
    for (let seed = 1; seed <= 100; seed++) {
      const q = generate('acm1-jours', 5, seed);
      if (q.answer.kind === 'text') answers.add(q.answer.accepted[0] ?? '');
    }
    expect([...answers].sort()).toEqual(
      DAYS.slice(0, 5)
        .map((d) => d.en)
        .sort(),
    );
  });

  it('météo, niveau 5 : la réponse est le seul mot commun aux deux villes demandées', () => {
    for (let seed = 1; seed <= 60; seed++) {
      const q = generate('acm1-meteo', 5, seed);
      const towns = /à (\w+) et à (\w+) \?/.exec(q.prompt)?.slice(1) ?? [];
      expect(towns).toHaveLength(2);
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const lines = q.figure.lines;
      const [x, y] = towns.map(
        (t) => /it’s (\w+) and (\w+)/.exec(lines.find((l) => l.includes(t)) ?? '')?.slice(1) ?? [],
      );
      const common = (x ?? []).filter((w) => y?.includes(w));
      expect(common).toHaveLength(1);
      expect(q.answer.accepted[0]).toBe(`It’s ${common[0] ?? ''}`);
    }
  });
});
