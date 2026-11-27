import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { analyzeSkill } from '../lisibilite.ts';
import { sensIssues } from '../sens.ts';
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
      expect(s.lesson.sources).toContain('lve-cm-2026');
      expect(s.version, s.id).toBe(2);
      expect(s.sens?.length, s.id).toBeGreaterThan(0);
      expect(sensIssues(s), s.id).toEqual([]);
    }
  });

  it('le détecteur d’explications ne signale plus rien', () => {
    for (const s of skills) {
      const { counts, words } = analyzeSkill(s, ENGLISH_TIME_CHAPTER);
      expect({ id: s.id, counts, words }).toEqual({ id: s.id, counts: {}, words: [] });
    }
  });

  it('chaque question : 3 ou 4 bulles, la dernière donne la réponse en gras', () => {
    for (const s of skills)
      for (const level of [1, 2, 3, 4, 5] as const)
        for (let seed = 1; seed <= 40; seed++) {
          const q = generate(s.id, level, seed);
          const last = q.steps.at(-1) ?? '';
          const bold = [...last.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1] ?? '');
          expect(bold.length, `${s.id} ${level} ${last}`).toBeGreaterThan(0);
          if (q.answer.kind === 'text')
            expect(check(q, { kind: 'text', text: bold[0] ?? '' }).correct, last).toBe(true);
          if (q.answer.kind === 'choice') expect(bold[0]).toBe(q.answer.options[q.answer.correct]);
        }
  });

  it('niveaux 2 et 3 : aucune couleur qui s’écrit pareil dans les deux langues', () => {
    for (const level of [2, 3] as const)
      for (let seed = 1; seed <= 200; seed++)
        expect(JSON.stringify(generate('acm1-couleurs', level, seed).answer)).not.toContain('orange');
  });

  it('couleurs, niveau 5 : le nombre attendu est celui des lignes avec le bon objet et la bonne couleur', () => {
    const numbers = ['zero', 'one', 'two', 'three', 'four'];
    for (let seed = 1; seed <= 100; seed++) {
      const q = generate('acm1-couleurs', 5, seed);
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const [num, colour, many] = (q.answer.accepted[0] ?? '').split(' ');
      const found = q.figure.lines.filter((l) => l.endsWith(`My ${(many ?? '').slice(0, -1)} is ${colour}.`));
      expect(num, q.prompt).toBe(numbers[found.length]);
    }
  });

  it('couleurs : un mot au niveau 3, puis « a » + couleur + nom au singulier au niveau 4', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const word = generate('acm1-couleurs', 3, seed).answer;
      if (word.kind !== 'text') throw new Error('saisie attendue');
      expect(word.accepted[0]).toMatch(/^[a-z]+$/);
      const q = generate('acm1-couleurs', 4, seed);
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      const good = q.answer.accepted[0] ?? '';
      expect(good, q.prompt).toMatch(/^a (red|blue|green|black|white|yellow) (cat|bag|ball|car|bird)$/);
      const [, colour = '', noun = ''] = good.split(' ');
      for (const text of [`a ${noun} ${colour}`, `${colour} ${noun}`])
        expect(check(q, { kind: 'text', text }).correct, text).toBe(false);
    }
  });

  it('saisons, niveau 5 : indices en vocabulaire simple, deux par saison', () => {
    const known = new Set(
      (
        'new flowers open the trees are green again cold days end we see it’s hot and sunny swim in sea no school ' +
        'eat ice cream sun leaves now brown orange windy red on ground very snowy play snow christmas want'
      ).split(' '),
    );
    const bySeason = new Map<string, Set<string>>();
    for (let seed = 1; seed <= 300; seed++) {
      const q = generate('acm1-saisons', 5, seed);
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const text = q.figure.lines.join(' ');
      for (const w of text.toLowerCase().split(/[^a-z’]+/)) if (w) expect(known.has(w), `${w} : ${text}`).toBe(true);
      const season = q.answer.accepted[0] ?? '';
      bySeason.set(season, (bySeason.get(season) ?? new Set()).add(text));
    }
    expect([...bySeason.keys()].sort()).toEqual(SEASONS.map((s) => s.en).sort());
    for (const [season, texts] of bySeason) expect(texts.size, season).toBe(2);
  });

  it('date : ordinaux en lettres acceptés, calcul du niveau 5 vérifié', () => {
    const words: Readonly<Record<string, string>> = { 14: 'fourteenth', 28: 'twenty-eighth', 31: 'thirty-first' };
    const seen = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) {
      const q = generate('acm1-date', 3, seed);
      if (q.answer.kind !== 'text') continue;
      const [day = '', month = ''] = (q.answer.accepted[0] ?? '').split(' ');
      const word = words[day];
      if (!word) continue;
      seen.add(day);
      expect(right('acm1-date', 3, seed, `the ${word} of ${month}`)).toBe(true);
    }
    expect(seen.size).toBe(3);
    for (let seed = 1; seed <= 100; seed++) {
      const q = generate('acm1-date', 5, seed);
      if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
      const [first = '', second = ''] = q.figure.lines;
      const [, start, month] = /Monday (\d+) (\w+)/.exec(first) ?? [];
      const gap = DAYS.findIndex((d) => second.startsWith(`${d.en}:`));
      expect(gap).toBeGreaterThan(0);
      expect(q.answer.accepted[0]).toBe(`${Number(start) + gap} ${month ?? ''}`);
    }
  });

  it('météo : « warm », « It’s a sunny day » acceptés', () => {
    const tried = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      const q = generate('acm1-meteo', 4, seed);
      if (q.answer.kind !== 'text') continue;
      for (const [word, text] of [
        ['hot', 'It is warm.'],
        ['sunny', "It's a sunny day"],
      ] as const)
        if (q.answer.accepted.includes(`It’s ${word}`)) {
          tried.add(word);
          expect(right('acm1-meteo', 4, seed, text), text).toBe(true);
        }
    }
    expect(tried.size).toBe(2);
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
      const lines = d.figure?.kind === 'document' ? d.figure.lines : [];
      const weekday = /^([A-Z][a-z]+day):/.exec(lines[1] ?? '')?.[1] ?? '';
      expect(weekday).not.toBe('');
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
