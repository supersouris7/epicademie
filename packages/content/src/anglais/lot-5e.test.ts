import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_PRESENT_5E_CHAPTER, ADVERBS, FRAMES } from './present-5e.ts';
import { FAITS as PRESENT_FACTS } from './present-5e-faits.ts';
import { ENGLISH_PAST_5E_CHAPTER, REGULAR_VERBS, misspelt } from './preterit.ts';
import { FAITS as PAST_FACTS } from './preterit-faits.ts';
import { IRREGULAR_VERBS } from './verbs.ts';

const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const CHAPTERS = [
  { chapter: ENGLISH_PRESENT_5E_CHAPTER, facts: PRESENT_FACTS },
  { chapter: ENGLISH_PAST_5E_CHAPTER, facts: PAST_FACTS },
];
/** Les notions du lot : à 5 niveaux (le participe passé, historique, reste à 3). */
const LOT = CHAPTERS.flatMap((c) => c.chapter.skills).filter((s) => skillLevels(s) === 5);
const questions = (id: string, level: Level) => Array.from({ length: 400 }, (_, i) => generate(id, level, i + 1));
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const blanks = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
  return q.answer.blanks.map((b) => (b.mode === 'list' ? b.options[b.correct]! : b.accepted[0]!));
};
const filled = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
  const a = blanks(q);
  return q.answer.parts.map((p, i) => `${p}${a[i] ?? ''}`).join('');
};
const lines = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('document attendu');
  return q.figure.lines;
};
const find = (id: string, level: Level, part: string) => {
  const q = questions(id, level).find((x) => x.prompt.includes(part));
  if (!q) throw new Error(`question introuvable : ${part}`);
  return q;
};

describe('anglais 5e : présent simple, be + ing et prétérit', () => {
  it('8 notions à 5 niveaux, identifiants historiques conservés', () => {
    expect(LOT.map((s) => [s.id, s.version])).toEqual([
      ['a5-present-formes', 1],
      ['a5-present-ou-be-ing', 1],
      ['a5-adverbes-frequence', 1],
      ['a5-marqueurs-temps', 1],
      ['a5-preterit-regulier', 2],
      ['a5-preterit', 2],
      ['a5-preterit-did', 1],
      ['a5-phrase', 2],
    ]);
  });

  it('sources citées par un fait, domaines autorisés, mots en gras définis', () => {
    for (const { chapter, facts } of CHAPTERS) {
      expect(new Set(facts.map((f) => f.id)).size).toBe(facts.length);
      for (const f of facts) {
        expect(isAllowedUrl(getSource(f.sourceId)!.url), f.id).toBe(true);
        expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
      }
      for (const s of chapter.skills.filter((x) => LOT.includes(x))) {
        expect(skillLevels(s)).toBe(5);
        expect(s.lesson.sources).toContain('anglais-college-2025');
        expect(sourceIssues(s)).toEqual([]);
        expect(glossaryIssues({ skill: s, chapter })).toEqual([]);
        for (const id of s.lesson.sources ?? [])
          expect(
            facts.some((f) => f.sourceId === id),
            `${s.id} ${id}`,
          ).toBe(true);
      }
    }
  });

  it('questions valides, niveaux distincts, au moins deux pièges, réponses acceptées', () => {
    for (const s of LOT) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
      const reasons = new Set(byLevel.flat().flatMap((q) => q.traps.map((t) => t.why)));
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
      for (const q of byLevel.flat()) {
        if (q.answer.kind !== 'text') continue;
        for (const t of q.answer.accepted) expect(text(q, t), q.prompt).toBe(true);
      }
    }
  });

  it('formes : contraction ou forme longue, jamais -s après does', () => {
    const q = find('a5-present-formes', 4, 'négative : « Tom plays football');
    const when = /football (.+)\. »/.exec(q.prompt)![1]!;
    for (const t of [`Tom doesn’t play football ${when}`, `Tom does not play football ${when}.`])
      expect(text(q, t), t).toBe(true);
    expect(text(q, `Tom doesn’t plays football ${when}.`)).toBe(false);
  });

  it('présent ou be + ing : verbe d’état au présent simple', () => {
    const q = find('a5-present-ou-be-ing', 4, '« like »');
    expect(text(q, 'likes')).toBe(true);
    expect(text(q, 'is liking')).toBe(false);
  });

  it('adverbes : échelle du British Council ; le relevé donne l’adverbe', () => {
    expect(ADVERBS.map((a) => a.en)).toEqual(['always', 'usually', 'often', 'sometimes', 'never']);
    for (const q of questions('a5-adverbes-frequence', 5)) {
      const a = blanks(q);
      lines(q).forEach((line, i) => {
        const days = Number(/(\d) days/.exec(line)![1]);
        expect(a[2 * i]).toBe(days === 7 ? 'always' : days === 0 ? 'never' : 'sometimes');
      });
    }
  });

  it('marqueurs : « ago » et « in » suivent le sens du décompte', () => {
    for (const q of questions('a5-marqueurs-temps', 4)) {
      if (q.answer.kind !== 'text') throw new Error('saisie attendue');
      const past = q.prompt.includes('visited');
      expect(q.answer.accepted[0]).toMatch(past ? /^\w+ days ago$/ : /^in \w+ days$/);
    }
  });

  it('réguliers : orthographe de chaque groupe, erreur typique différente', () => {
    const past = Object.fromEntries(REGULAR_VERBS.map((v) => [v.base, v.past]));
    expect(past).toMatchObject({ like: 'liked', stop: 'stopped', try: 'tried', play: 'played', call: 'called' });
    for (const v of REGULAR_VERBS) {
      expect(misspelt(v)).not.toBe(v.past);
      expect(IRREGULAR_VERBS.some((i) => i.base === v.base)).toBe(false);
    }
  });

  it('irréguliers : « went » accepté, « goed » expliqué ; was ou were selon le sujet', () => {
    const q = find('a5-preterit', 3, '« to go »');
    expect(text(q, 'Went')).toBe(true);
    const wrong = check(q, { kind: 'text', text: 'goed' });
    expect(wrong.correct).toBe(false);
    expect(wrong.why).toMatch(/irrégulier/);
    expect(text(find('a5-preterit', 4, 'Yesterday, Tom'), 'was')).toBe(true);
    expect(text(find('a5-preterit', 4, 'Yesterday, my parents'), 'were')).toBe(true);
  });

  it('did : base verbale après did ; « your » accepté pour « my »', () => {
    const q = find('a5-preterit-did', 4, 'oui ou non) : « My brother');
    if (q.answer.kind !== 'text') throw new Error('saisie attendue');
    for (const a of q.answer.accepted) expect(a).toMatch(/^Did (my brother|your brother|he) /);
  });

  it('did : « to » final et pronom sujet acceptés dans la question avec Where', () => {
    for (const [verb, past] of [
      ['walk', 'walked to the park'],
      ['go', 'went to school'],
    ] as const) {
      const q = find('a5-preterit-did', 4, `le lieu : « My parents ${past}`);
      const when = /(?:park|school) (.+)\. »/.exec(q.prompt)![1]!;
      for (const subject of ['my parents', 'your parents', 'they'])
        for (const end of ['', ' to', ` ${when}`, ` to ${when}`])
          for (const mark of ['', '?', ' ?']) {
            const t = `Where did ${subject} ${verb}${end}${mark}`;
            expect(text(q, t), t).toBe(true);
          }
      expect(text(q, `Where did they ${past.split(' ')[0]}?`)).toBe(false);
    }
  });

  it('did : pronom sujet accepté dans la question oui/non et la négation', () => {
    const ask = find('a5-preterit-did', 4, 'oui ou non) : « Lisa played football');
    const askWhen = /football (.+)\. »/.exec(ask.prompt)![1]!;
    expect(text(ask, `Did she play football ${askWhen}?`)).toBe(true);
    const no = find('a5-preterit-did', 4, 'négative : « Lisa played football');
    const noWhen = /football (.+)\. »/.exec(no.prompt)![1]!;
    for (const t of [`She didn’t play football ${noWhen}.`, `She did not play football ${noWhen}`])
      expect(text(no, t), t).toBe(true);
    expect(text(no, `He didn’t play football ${noWhen}.`)).toBe(false);
  });

  it('did : le document du niveau 5 est un message, pas une carte postale', () => {
    for (const q of questions('a5-preterit-did', 5)) {
      expect(q.figure?.kind === 'document' && q.figure.title).toMatch(/^A message from /);
      expect(q.prompt).toMatch(/^Lis le message de /);
    }
  });

  it('marqueurs : aucune habitude avec un verbe dont le prétérit s’écrit comme la forme employée', () => {
    const same = new Set([
      ...['bet', 'cost', 'cut', 'fit', 'hit', 'hurt', 'let', 'put', 'quit', 'read', 'set', 'shut', 'spread'],
      ...IRREGULAR_VERBS.filter((v) => v.past.includes(v.base)).map((v) => v.base),
    ]);
    const habits = FRAMES.find((f) => f.moment === 'habit')!.frames;
    for (const frame of habits)
      for (const word of frame.toLowerCase().split(' ')) expect(same.has(word), frame).toBe(false);
  });

  it('marqueurs : même semaine précisée au niveau 5, « … time » accepté', () => {
    for (const q of questions('a5-marqueurs-temps', 5)) expect(q.prompt).toContain('même semaine');
    const q = find('a5-marqueurs-temps', 3, '« dans deux ans »');
    for (const t of ['in two years’ time', "in 2 years' time"]) expect(text(q, t), t).toBe(true);
    for (const x of questions('a5-marqueurs-temps', 4)) {
      if (x.answer.kind !== 'text' || !x.answer.accepted[0]!.startsWith('in ')) continue;
      expect(text(x, `${x.answer.accepted[1]!}’ time`), x.prompt).toBe(true);
    }
  });

  it('niveaux 5 : les textes complétés suivent le document', () => {
    for (const q of questions('a5-preterit-did', 5)) {
      const done = filled(q);
      const yes = /“?I (?!didn’t)(\w+) /.exec(lines(q).find((l) => !l.includes('didn’t'))!)![1]!;
      expect(done).toMatch(/^« Did \w+ \w+ .+\? » « (Yes, (he|she) did|No, (he|she) didn’t)\. »/);
      if (done.includes('« No,')) expect(done).toContain(` ${yes} `);
      else expect(done).toMatch(/ didn’t \w+ /);
    }
    for (const q of questions('a5-phrase', 5)) expect(filled(q)).toMatch(/The weather was nice\. (He|She) didn’t \w+ /);
    for (const q of questions('a5-present-ou-be-ing', 5)) expect(filled(q)).toMatch(/ is \w+ing .+ isn’t \w+ing /);
  });
});
