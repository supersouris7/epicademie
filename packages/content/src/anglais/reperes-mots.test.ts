import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { glossaryIssues, sourceIssues } from '../couverture.ts';
import { getSource, isAllowedUrl } from '../sources.ts';
import { skillLevels, type Level, type Question } from '../types.ts';
import { validateVariants } from '../validate.ts';
import { ENGLISH_WORDS_6E_CHAPTER } from './reperes-mots.ts';
import { COMPOUNDS, DERIVED, FAITS, MARKERS, ORDINALS } from './reperes-mots-faits.ts';

const { skills } = ENGLISH_WORDS_6E_CHAPTER;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const questions = (id: string, level: Level) => Array.from({ length: 600 }, (_, i) => generate(id, level, i + 1));
const find = (id: string, level: Level, part: string) => {
  const q = questions(id, level).find((x) => x.prompt.includes(part));
  if (!q) throw new Error(`question introuvable : ${part}`);
  return q;
};
const text = (q: Question, t: string) => check(q, { kind: 'text', text: t }).correct;
const accepts = (q: Question, ...answers: string[]) => {
  for (const a of answers) expect(text(q, a), `${q.prompt} → ${a}`).toBe(true);
};
const refuses = (q: Question, ...answers: string[]) => {
  for (const a of answers) expect(text(q, a), `${q.prompt} → ${a}`).toBe(false);
};
const expected = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('texte à trous attendu');
  return q.answer.blanks.map((b) => (b.mode === 'list' ? b.options[b.correct]! : b.accepted[0]!));
};
const quotes = FAITS.map((f) => f.quote.toLowerCase()).join(' § ');

describe('anglais 6e : temps, espace, formation des mots', () => {
  it('5 notions à 5 niveaux, sources citées et mots en gras définis', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'a6-marqueurs-temps',
      'a6-dates-ordinaux',
      'a6-prepositions-lieu',
      'a6-suffixes',
      'a6-noms-composes',
    ]);
    for (const s of skills) {
      expect(skillLevels(s)).toBe(5);
      expect(s.lesson.sources).toContain('anglais-college-2025');
      expect(sourceIssues(s)).toEqual([]);
      expect(glossaryIssues({ skill: s, chapter: ENGLISH_WORDS_6E_CHAPTER })).toEqual([]);
      for (const id of s.lesson.sources ?? [])
        expect(
          FAITS.some((f) => f.sourceId === id),
          `${s.id} ${id}`,
        ).toBe(true);
    }
  });

  it('chaque fait cite une source du registre (domaine autorisé) et une citation non vide', () => {
    expect(new Set(FAITS.map((f) => f.id)).size).toBe(FAITS.length);
    for (const f of FAITS) {
      const src = getSource(f.sourceId);
      expect(src, f.id).toBeDefined();
      expect(isAllowedUrl(src!.url), f.id).toBe(true);
      expect(f.quote.trim().length, f.id).toBeGreaterThan(0);
    }
  });

  it('les mots employés figurent dans les citations', () => {
    for (const o of ORDINALS) expect(quotes, o.word).toContain(o.word);
    for (const d of DERIVED) expect(quotes, d.word).toContain(d.word);
    for (const c of COMPOUNDS) expect(quotes, c.en).toContain(c.en);
    const programme = FAITS.find((f) => f.id === 'programme-marqueurs')!.quote;
    for (const m of MARKERS) if (m.en !== 'this morning') expect(programme).toContain(m.en);
  });

  it('questions valides et niveaux distincts', () => {
    for (const s of skills) {
      const byLevel = LEVELS.map((l) => questions(s.id, l));
      for (const qs of byLevel) expect(validateVariants(qs), s.id).toEqual([]);
      expect(new Set(byLevel.map((qs) => qs.map((q) => q.prompt).join('|'))).size, s.id).toBe(5);
    }
  }, 60_000);

  it('au moins deux erreurs typiques ; chaque réponse saisie est jugée juste, avec un indice qui la tait', () => {
    for (const s of skills) {
      const reasons = new Set<string>();
      for (const l of LEVELS)
        for (const q of questions(s.id, l)) {
          for (const t of q.traps) reasons.add(t.why);
          if (q.answer.kind !== 'text') continue;
          accepts(q, ...q.answer.accepted);
          const answer = q.answer.accepted[0]!.toLowerCase();
          // Mot entier : « on » ou « in » se cachent dans bien des mots français.
          const hint = ` ${q.hint
            .toLowerCase()
            .split(/[^a-z’-]+/)
            .join(' ')} `;
          expect(hint.includes(` ${answer} `), `${q.prompt} / ${q.hint}`).toBe(false);
        }
      expect(reasons.size, s.id).toBeGreaterThanOrEqual(2);
    }
  }, 60_000);

  it('niveau 5 : document, au moins 4 trous, réponses variables d’une graine à l’autre', () => {
    for (const s of skills) {
      const sequences = new Set<string>();
      for (const q of questions(s.id, 5)) {
        expect(q.figure?.kind).toBe('document');
        const answers = expected(q);
        expect(answers.length).toBeGreaterThanOrEqual(4);
        expect(check(q, { kind: 'cloze', answers }).correct, q.prompt).toBe(true);
        sequences.add(answers.join(','));
      }
      expect(sequences.size, s.id).toBeGreaterThan(3);
    }
  });

  it('marqueurs de temps : at the weekend (on admis), pas de préposition devant last', () => {
    const weekend = find('a6-marqueurs-temps', 3, 'the weekend.');
    accepts(weekend, 'at', 'on');
    refuses(weekend, 'in');
    const saturday = find('a6-marqueurs-temps', 3, 'Saturday.');
    accepts(saturday, 'on', 'On.');
    refuses(saturday, 'in', 'at');
    const last = find('a6-marqueurs-temps', 4, 'le week-end dernier');
    accepts(last, 'last weekend', 'Last week-end.');
    refuses(last, 'the last weekend', 'at last weekend');
  });

  it('dates : ordinal en toutes lettres, date écrite sous ses formes courantes', () => {
    const four = find('a6-dates-ordinaux', 3, '« 4e »');
    accepts(four, 'fourth', 'Fourth');
    refuses(four, 'four', '4th', 'forth');
    const may = find('a6-dates-ordinaux', 4, '« le 3 mai »');
    accepts(may, '3 May', '3rd May', 'May 3rd', 'May 3', 'the 3rd of May', '3rd of May', 'May the 3rd', 'on 3 May');
    refuses(may, '3 mai', '3th May', '3 of May', 'May');
    accepts(may, 'on May 3rd', 'on May 3', 'on May the 3rd', 'the 3rd May', 'on the 3rd May');
    const april = find('a6-dates-ordinaux', 4, '« le 4 avril »');
    accepts(april, 'on April 4th', 'on April 4', 'the 4th April', 'on the 4th April');
    for (const q of questions('a6-dates-ordinaux', 3).filter((x) => x.prompt.includes('« 21e »')))
      refuses(q, 'twenty first');
    expect(new Set(questions('a6-dates-ordinaux', 3).map((q) => q.prompt)).size).toBeGreaterThan(20);
  });

  it('prépositions : above et over admis, in front of en trois mots', () => {
    const above = find('a6-prepositions-lieu', 3, '« au-dessus de »');
    accepts(above, 'above', 'over');
    refuses(above, 'on', 'under');
    const front = find('a6-prepositions-lieu', 4, '(devant)');
    accepts(front, 'in front of');
    refuses(front, 'in front', 'front of', 'behind');
    const work = find('a6-prepositions-lieu', 4, '(au travail)');
    accepts(work, 'at');
    refuses(work, 'in', 'to');
    accepts(find('a6-prepositions-lieu', 3, '« sous »'), 'under', 'beneath');
    accepts(find('a6-prepositions-lieu', 3, '« en face de »'), 'opposite', 'across from');
    const facing = find('a6-prepositions-lieu', 4, '(en face de)');
    accepts(facing, 'opposite', 'across from');
    refuses(facing, 'in front of', 'opposite of');
    expect(facing.traps.map((t) => t.why).join(' ')).toContain('« in front of » veut dire « devant »');
    for (const level of [1, 2] as const)
      for (const q of questions('a6-prepositions-lieu', level)) {
        const shownText = JSON.stringify([q.prompt, q.answer]);
        expect(/\bdevant\b/.test(shownText) && shownText.includes('en face de'), `${q.prompt} ${shownText}`).toBe(
          false,
        );
        expect(shownText.includes('in front of') && shownText.includes('opposite'), shownText).toBe(false);
      }
  });

  it('suffixes : changements d’orthographe et exceptions', () => {
    const sun = find('a6-suffixes', 4, '« sun »');
    accepts(sun, 'sunny');
    refuses(sun, 'suny', 'sun');
    const good = find('a6-suffixes', 4, '« good »');
    accepts(good, 'well');
    refuses(good, 'goodly', 'good');
    const act = find('a6-suffixes', 4, '« act »');
    accepts(act, 'actor');
    refuses(act, 'acter');
    for (const base of ['fast', 'hard']) {
      const q = find('a6-suffixes', 4, `« ${base} »`);
      expect(q.prompt).toContain('very …');
      accepts(q, base);
      refuses(q, `${base}er`);
    }
    for (const q of questions('a6-suffixes', 1)) {
      const shownText = JSON.stringify(q.answer);
      if (q.prompt.includes('« suddenly »')) expect(shownText).not.toContain('"soudain"');
      if (q.prompt.includes('« quietly »')) expect(shownText).not.toContain('"doucement"');
      if (q.prompt.includes('« gently »')) expect(shownText).not.toContain('"calmement"');
      if (q.prompt.includes('« happily »')) expect(shownText).not.toContain('"heureusement"');
      if (q.prompt.includes('« fortunately »')) expect(shownText).not.toContain('"joyeusement"');
      if (q.prompt.includes('« badly »')) expect(shownText).not.toContain('"terriblement"');
      if (q.prompt.includes('« terribly »')) expect(shownText).not.toContain('"mal"');
    }
  });

  it('noms composés : ordre des mots, sans of ni ’s, un ou deux mots', () => {
    const pie = find('a6-noms-composes', 4, 'tarte aux pommes');
    accepts(pie, 'apple pie', 'Apple pie.');
    refuses(pie, 'pie apple', 'pie of apple', 'apple’s pie');
    const snow = find('a6-noms-composes', 4, 'bonhomme de neige');
    accepts(snow, 'snowman');
    refuses(snow, 'snow man', 'mansnow');
    const box = find('a6-noms-composes', 3, 'boîte à déjeuner');
    accepts(box, 'lunch box', 'lunchbox');
    refuses(box, 'box lunch');
    // Les initiales excluent les autres traductions justes (apple tart, swimming class, grocery list, suppertime).
    for (const [fr, first, second] of [
      ['tarte aux pommes', 'a', 'p'],
      ['cours de natation', 's', 'l'],
      ['liste de courses', 's', 'l'],
      ['heure du dîner', 'd', 't'],
    ] as const)
      expect(find('a6-noms-composes', 4, fr).prompt).toContain(`« ${first} » puis « ${second} »`);
    accepts(find('a6-noms-composes', 4, 'cours de natation'), 'swimming lesson', 'swimming lessons');
  });
});
