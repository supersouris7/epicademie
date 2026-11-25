import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_TASTES_CHAPTER } from './gouts.ts';
import { FAITS } from './gouts-faits.ts';

const { skills } = ENGLISH_TASTES_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 300 }, (_, i) => generate(id, level, i + 1));

describe('anglais cm1 : goûts et capacités', () => {
  it('4 notions à 5 niveaux, sources valides et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual(['acm1-like', 'acm1-can', 'acm1-sports-loisirs', 'acm1-animaux']);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('lve-cm-2026');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_TASTES_CHAPTER })).toEqual([]);
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

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs.slice(0, 20)), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
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

  it('négations : « cannot », « do not » et apostrophe droite acceptés', () => {
    const can = questions('acm1-can', 4).find((q) => q.prompt.includes('forme négative'))!;
    const [, subject, action] = /« (\w+) can (.+)\. »/.exec(can.prompt) ?? [];
    for (const n of ['can’t', "can't", 'cannot'])
      expect(check(can, { kind: 'text', text: `${subject} ${n} ${action}.` }).correct, n).toBe(true);
    const like = questions('acm1-like', 4).find((q) => q.prompt.includes('forme négative'))!;
    const [, who, thing] = /« (\w+) likes (\w+)\. »/.exec(like.prompt) ?? [];
    for (const n of ["doesn't", 'does not'])
      expect(check(like, { kind: 'text', text: `${who} ${n} like ${thing}` }).correct, n).toBe(true);
  });

  it('niveau 5 : la réponse vient de la ligne du bon enfant', () => {
    for (const id of ['acm1-like', 'acm1-can', 'acm1-sports-loisirs', 'acm1-animaux'])
      for (const q of questions(id, 5)) {
        if (q.figure?.kind !== 'document' || q.answer.kind !== 'text') throw new Error('document attendu');
        const kid = q.figure.lines
          .map((l) => l.split(':')[0]!)
          .find((n) => new RegExp(`(\\b|’)${n}\\b`).test(q.prompt))!;
        const line = q.figure.lines.find((l) => l.startsWith(`${kid}:`))!;
        const good = q.answer.accepted[0]!;
        if (id === 'acm1-like') {
          const thing = /like (\w+)\?/.exec(q.prompt)![1]!;
          expect(line).toContain(good.startsWith('Yes') ? `I like ${thing}.` : `I don’t like ${thing}.`);
        } else if (id === 'acm1-animaux') expect(line).toContain(`I’ve got a ${good.split(' got a ')[1]}.`);
        else {
          const said = good
            .replace(/^(He|She) /, 'I ')
            .replace('likes', 'like')
            .replace('doesn’t', 'don’t');
          expect(line, q.prompt).toContain(`${said}.`);
        }
      }
  });

  it('le programme cité est celui du cours moyen (arrêté du 26 février 2026)', () => {
    expect(FAITS.filter((f) => f.sourceId === 'lve-cm-2026').length).toBeGreaterThan(0);
    for (const s of skills) {
      expect(s.lesson.sources).not.toContain('cycle3-2020');
      expect(s.lesson.source).toContain('26 février 2026');
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.sourceId === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });

  it('réponse courte : l’énoncé dit si l’enfant est une fille ou un garçon', () => {
    const short = [...questions('acm1-like', 5), ...questions('acm1-can', 4)].filter((q) =>
      q.prompt.includes('réponse courte'),
    );
    expect(short.length).toBeGreaterThan(0);
    for (const q of short) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      const girl = /\b(he|she)\b/.exec(q.answer.accepted[0]!)![1] === 'she';
      expect(q.prompt).toContain(girl ? 'est une fille.' : 'est un garçon.');
    }
  });

  it('can, niveaux 3 et 5 : les autres écritures de l’action sont acceptées', () => {
    const variants = {
      'ride a bike': ['ride a bicycle', 'cycle'],
      'run fast': ['run quickly'],
      'play the guitar': ['play guitar'],
      'play the piano': ['play piano'],
    };
    for (const level of [3, 5] as const)
      for (const q of questions('acm1-can', level)) {
        if (q.answer.kind !== 'text') throw new Error('saisie attendue');
        const good = q.answer.accepted[0]!;
        for (const [en, others] of Object.entries(variants)) {
          if (!good.endsWith(` ${en}`)) continue;
          const subject = good.split(' ')[0]!;
          const modals = good.includes(' can ') ? ['can'] : ['can’t', 'cannot', 'can not'];
          for (const m of modals)
            for (const x of others)
              expect(check(q, { kind: 'text', text: `${subject} ${m} ${x}` }).correct, `${m} ${x}`).toBe(true);
        }
      }
  });

  it('loisirs et animaux : variantes acceptées, « to » refusé devant -ing, indice juste', () => {
    const find = (id: string, level: Level, fr: string) => {
      const q = Array.from({ length: 800 }, (_, i) => generate(id, level, i + 1)).find(
        (x) => x.answer.kind === 'text' && x.prompt.includes(`« ${fr} »`),
      );
      expect(q, fr).toBeDefined();
      return q!;
    };
    const cases: readonly [string, readonly string[], readonly string[]][] = [
      ['faire du vélo', ['to ride a bike', 'to go cycling', 'cycling'], ['to cycling']],
      ['aller à la pêche', ['to go fishing', 'to fish'], ['to fishing']],
      ['faire du roller', ['rollerblade', 'to rollerblade'], ['to rollerblading']],
      ['faire du skate', ['to skateboard'], ['to skateboarding']],
      ['regarder la télé', ['watch the television'], []],
      ['jouer sur l’ordinateur', ['play on a computer'], []],
    ];
    for (const [fr, right, wrong] of cases) {
      const q = find('acm1-sports-loisirs', 4, fr);
      for (const text of right) expect(check(q, { kind: 'text', text }).correct, text).toBe(true);
      for (const text of wrong) expect(check(q, { kind: 'text', text }).correct, text).toBe(false);
    }
    const budgie = find('acm1-animaux', 3, 'la perruche');
    expect(check(budgie, { kind: 'text', text: 'a parakeet' }).correct).toBe(true);
    expect(find('acm1-animaux', 3, 'le cochon d’Inde').hint).toContain('2 mots');
  });

  it('can, niveau 2 : l’écoute ne montre pas la phrase dans l’énoncé', () => {
    const audio = questions('acm1-can', 2).filter((q) => q.audio);
    expect(audio.length).toBeGreaterThan(0);
    for (const q of audio) expect(q.prompt).not.toContain(q.audio!.text);
  });
});
