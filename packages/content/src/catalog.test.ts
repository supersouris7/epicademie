import { describe, expect, it } from 'vitest';
import { SUBJECTS } from '@epicademie/shared';
import { battlePools, CHAPTERS, chaptersOf, generate, maxLevelOf } from './catalog.ts';
import { DOMAINS, SCIENCES_DOMAINS } from './types.ts';
import { check } from './check.ts';
import { eq, fmt, frac, toNumber } from './rational.ts';
import type { Figure, Level, Question, Response } from './types.ts';

const LEVELS: Level[] = [1, 2, 3];
const SEEDS = 150;

/** Réponse parfaite attendue pour une question. */
function perfect(q: Question): Response {
  const a = q.answer;
  switch (a.kind) {
    case 'number':
      return { kind: 'number', text: fmt(a.value) };
    case 'fraction':
      return { kind: 'fraction', num: String(a.value.n), den: String(a.value.d) };
    case 'choice':
      return { kind: 'choice', index: a.correct };
    case 'point':
      return { kind: 'point', x: a.x, y: a.y };
    case 'zone':
      return { kind: 'zone', zone: a.zone };
    case 'text':
      return { kind: 'text', text: a.accepted[0] ?? '' };
    case 'order':
      return { kind: 'order', order: [...a.correct] };
    case 'match':
      return { kind: 'match', pairs: [...a.pairs] };
    case 'cloze':
      return {
        kind: 'cloze',
        answers: a.blanks.map((b) => (b.mode === 'list' ? (b.options[b.correct] ?? '') : (b.accepted[0] ?? ''))),
      };
  }
}

function checkFigure(f: Figure | undefined) {
  if (!f) return;
  if (f.kind === 'numberLine') {
    expect(f.max).toBeGreaterThan(f.min);
    for (const p of f.points) {
      expect(p.at).toBeGreaterThanOrEqual(f.min);
      expect(p.at).toBeLessThanOrEqual(f.max);
    }
  }
  if (f.kind === 'grid') {
    for (const p of f.points) {
      expect(p.x).toBeGreaterThanOrEqual(f.xMin);
      expect(p.x).toBeLessThanOrEqual(f.xMax);
      expect(p.y).toBeGreaterThanOrEqual(f.yMin);
      expect(p.y).toBeLessThanOrEqual(f.yMax);
    }
  }
}

const withBoss = (c: (typeof CHAPTERS)[number]) => [...c.skills, ...(c.boss?.problems ?? []), ...(c.boss?.traps ?? [])];
const cases = CHAPTERS.flatMap((c) => withBoss(c).map((s) => [c.id, s.id] as const));

describe('catalogue', () => {
  it('combat de boss : dans chaque chapitre, toutes matières et toutes classes', () => {
    for (const c of CHAPTERS) expect(c.boss, c.id).toBeDefined();
    // Maths : problèmes et pièges écrits pour le boss.
    for (const c of CHAPTERS.filter((x) => x.subject === 'maths')) {
      expect(c.boss?.problems.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.boss?.traps.length, c.id).toBeGreaterThanOrEqual(1);
    }
    // Ailleurs : le boss pose les notions du chapitre (pas encore de questions dédiées).
    const anglais = CHAPTERS.find((c) => c.subject === 'anglais');
    expect(battlePools(anglais?.id ?? '')?.problems).toEqual(anglais?.skills.map((s) => s.id));
  });

  it('chaque chapitre porte le préfixe de sa matière et de sa classe (m5-, m6-, a5-…)', () => {
    const grade = { cm1: 'cm1-', cm2: 'cm2-', '6e': '6-', '5e': '5-', '4e': '4-', '3e': '3-', adulte: 'a-' };
    // Sciences : une lettre par domaine (p physique-chimie, v SVT, t technologie).
    const sciences: Record<string, string> = { 'physique-chimie': 'p', svt: 'v', technologie: 't' };
    const subject: Record<string, string> = {
      maths: 'm',
      francais: 'f',
      anglais: 'a',
      espagnol: 'e',
      geographie: 'g',
      histoire: 'h',
    };
    for (const c of CHAPTERS) {
      // EMC : domaine de la matière histoire, préfixe « em » (ADR 0034).
      const letter = c.domain === 'emc' ? 'em' : c.subject === 'sciences' ? sciences[c.domain] : subject[c.subject];
      const prefix = `${letter ?? '?'}${grade[c.grade]}`;
      expect(c.id.startsWith(prefix), c.id).toBe(true);
      for (const s of withBoss(c)) expect(s.id.startsWith(prefix), s.id).toBe(true);
    }
  });

  it('a des identifiants de chapitres uniques et non vides', () => {
    expect(new Set(CHAPTERS.map((c) => c.id)).size).toBe(CHAPTERS.length);
    for (const c of CHAPTERS) expect(c.skills.length).toBeGreaterThan(0);
  });

  it('chaque notion a un mémo court', () => {
    for (const c of CHAPTERS)
      for (const s of withBoss(c)) {
        expect(s.lesson.memo.length, s.id).toBeGreaterThan(0);
        expect(s.lesson.memo.length, s.id).toBeLessThanOrEqual(3);
      }
  });

  it.each(cases)('%s / %s : questions cohérentes (150 graines × 3 niveaux)', (_chapter, skillId) => {
    for (const level of LEVELS) {
      for (let seed = 1; seed <= SEEDS; seed++) {
        const q = generate(skillId, level, seed);
        const ctx = `${skillId} niveau ${level} graine ${seed}`;
        expect(q.prompt.length, ctx).toBeGreaterThan(3);
        expect(q.steps.length, `${ctx} : explication en plusieurs bulles`).toBeGreaterThan(1);
        expect(q.hint.length, `${ctx} : indice`).toBeGreaterThan(10);
        expect(q.hint, ctx).not.toMatch(/undefined|NaN|\[object/);
        // L'indice met sur la voie sans donner la réponse.
        if (q.answer.kind === 'number' && Math.abs(toNumber(q.answer.value)) >= 10)
          expect(q.hint, `${ctx} : l’indice donne la réponse`).not.toMatch(
            new RegExp(`= ${fmt(q.answer.value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\d,\u202f])`),
          );
        // La dernière bulle donne la réponse en gras.
        expect(q.steps.join(' '), `${ctx} : réponse en gras`).toMatch(/\*\*/);
        expect(q.prompt, ctx).not.toMatch(/undefined|NaN|\[object/);
        for (const s of q.steps) expect(s, ctx).not.toMatch(/undefined|NaN|\[object/);
        // La bonne réponse est acceptée.
        expect(check(q, perfect(q)).correct, ctx).toBe(true);
        const a = q.answer;
        if (a.kind === 'choice') {
          expect(new Set(a.options).size, `${ctx} options en double`).toBe(a.options.length);
          expect(a.options.length, ctx).toBeGreaterThanOrEqual(2);
          expect(a.correct, ctx).toBeGreaterThanOrEqual(0);
          for (const o of a.options) expect(o, ctx).not.toMatch(/undefined|NaN/);
        }
        // Aucun piège ne coïncide avec la bonne réponse.
        for (const t of q.traps) {
          if ('value' in t && (a.kind === 'number' || a.kind === 'fraction'))
            expect(eq(t.value, a.value), `${ctx} piège = réponse`).toBe(false);
          if ('option' in t && a.kind === 'choice') expect(t.option, `${ctx} piège = bonne option`).not.toBe(a.correct);
          expect(t.why, ctx).not.toMatch(/undefined|NaN/);
        }
        // Les réponses numériques s'écrivent (décimal fini ou fraction).
        if (a.kind === 'number') expect(() => fmt(a.value), ctx).not.toThrow();
        if (a.kind === 'fraction') expect(() => frac(a.value), ctx).not.toThrow();
        checkFigure(q.figure);
        // Déterminisme.
        expect(generate(skillId, level, seed), ctx).toEqual(q);
      }
    }
  });
});

describe('parcours Adulte', () => {
  it('chapitres existants, sans doublon, de la même matière ; le premier est gratuit', async () => {
    const { ADULT_PATHS, chaptersOf, gradesOf, isFreeChapter } = await import('./catalog.ts');
    const path = ADULT_PATHS.maths ?? [];
    const chapters = chaptersOf('maths', 'adulte');
    expect(chapters.map((c) => c.id)).toEqual(path);
    expect(new Set(path).size).toBe(path.length);
    expect(gradesOf('maths').at(-1)).toBe('adulte');
    expect(isFreeChapter(chapters[0]?.id ?? '')).toBe(true);
    // Les chapitres ne sont pas dupliqués dans le catalogue complet.
    expect(chaptersOf('maths').filter((c) => c.id === 'm6-numeration')).toHaveLength(1);
  });
});

describe('matière Sciences (#76)', () => {
  it('les chapitres de physique-chimie sont dans la matière sciences, domaine physique-chimie', () => {
    const chapters = chaptersOf('sciences');
    // Les chapitres des lots de contenu (ADR 0034, ex. « pcm1-matiere ») s'ajoutent à ceux du cycle 4.
    expect(chapters.map((c) => c.id).filter((id) => /^p[345]-/.test(id))).toEqual([
      'p5-unites',
      'p5-matiere',
      'p5-mouvement',
      'p5-energie',
      'p4-mouvement',
      'p4-electricite',
      'p3-energie',
    ]);
    // La SVT du CM1 à la 6e (préfixe « v ») relève du domaine « svt ».
    for (const c of chapters.filter((x) => x.id.startsWith('p'))) expect(c.domain).toBe('physique-chimie');
    expect(chaptersOf('physique')).toHaveLength(0);
  });

  it('seule la matière sciences utilise les domaines physique-chimie, svt et technologie', () => {
    for (const c of CHAPTERS) {
      expect(SCIENCES_DOMAINS.includes(c.domain as never), c.id).toBe(c.subject === 'sciences');
    }
    for (const d of SCIENCES_DOMAINS) expect(DOMAINS[d]).toBeTruthy();
  });

  it('un seul boss de matière : les chapitres de sciences ont tous un combat', () => {
    for (const c of chaptersOf('sciences')) expect(battlePools(c.id), c.id).not.toBeNull();
  });
});

describe('matière français et domaines (ADR 0034)', () => {
  const NEW_DOMAINS = [
    'grammaire',
    'conjugaison',
    'orthographe',
    'vocabulaire',
    'lecture',
    'litterature',
    'histoire',
    'geographie',
    'emc',
    'comprehension-orale',
    'culture',
  ] as const;

  it('chaque nouveau domaine a un libellé', () => {
    for (const d of NEW_DOMAINS) expect(DOMAINS[d], d).toBeTruthy();
  });

  it('toute matière publiée a au moins un chapitre (le français se remplit lot par lot, avant sa publication)', () => {
    for (const s of SUBJECTS.filter((x) => x.available)) expect(chaptersOf(s.id).length, s.id).toBeGreaterThan(0);
    for (const c of chaptersOf('francais')) expect(c.id.startsWith('f'), c.id).toBe(true);
  });

  it('les identifiants de chapitres restent uniques', () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('niveaux maximaux', () => {
  it('3 par défaut ; une notion inconnue vaut 3 ; un niveau demandé au-delà est ramené au maximum', () => {
    // Première notion encore à 3 niveaux (les lots de contenu les portent à 5 au fil de l'eau).
    const id = CHAPTERS.flatMap((c) => c.skills).find((x) => x.levels !== 5)!.id;
    expect(maxLevelOf(id)).toBe(3);
    expect(maxLevelOf('inconnue')).toBe(3);
    expect(generate(id, 5, 7).level).toBe(3);
    expect(generate(id, 2, 7).level).toBe(2);
  });
});
