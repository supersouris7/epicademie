import { describe, expect, it } from 'vitest';
import { allSkillEntries } from './catalog.ts';
import { SENS_MAX_LENGTH, chapterSens, pickSens, sensIssues } from './sens.ts';
import { SENS_LABELS, type Sens } from './types.ts';

const entries = allSkillEntries().filter((e) => !e.boss);
/** Périmètre où le sens est déjà exigé : mathématiques du CM1, du CM2 et de la 6e. */
const required = entries.filter((e) => e.chapter.subject === 'maths' && ['cm1', 'cm2', '6e'].includes(e.chapter.grade));

const sens = (over: Partial<Sens> = {}): Sens => ({
  type: 'usage',
  text: 'Une phrase.',
  source: 'maths-cycle3-2025',
  citation: 'un passage',
  ...over,
});

describe('sens des matières', () => {
  it('quatre types, dans les mots montrés à l’enfant', () => {
    expect(Object.values(SENS_LABELS)).toEqual([
      'À quoi ça sert',
      'Le sais-tu ?',
      'Qui s’en sert',
      'Un peu d’histoire',
    ]);
  });

  it('le contrôle repère un sens trop long, sans source connue ou sans citation', () => {
    expect(sensIssues({ sens: [sens()] })).toEqual([]);
    expect(sensIssues({})).toEqual([]);
    expect(sensIssues({ sens: [sens({ text: 'a'.repeat(SENS_MAX_LENGTH + 1) })] })).toHaveLength(1);
    expect(sensIssues({ sens: [sens({ source: 'inconnue' })] })).toHaveLength(1);
    expect(sensIssues({ sens: [sens({ citation: ' ' })] })).toHaveLength(1);
  });

  it('tout sens écrit est conforme', () => {
    expect(entries.flatMap((e) => sensIssues(e.skill).map((i) => `${e.skill.id} ${i}`))).toEqual([]);
  });

  it('maths CM1, CM2, 6e : chaque notion a au moins un sens', () => {
    expect(required.length).toBeGreaterThan(180);
    expect(required.filter((e) => !e.skill.sens?.length).map((e) => e.skill.id)).toEqual([]);
  });

  it('les quatre types sont présents', () => {
    const types = new Set(required.flatMap((e) => e.skill.sens?.map((s) => s.type) ?? []));
    expect([...types].sort()).toEqual(Object.keys(SENS_LABELS).sort());
  });

  it('ailleurs, le champ est facultatif : son absence n’est qu’un avertissement', async ({ annotate }) => {
    const missing = entries.filter((e) => !e.skill.sens?.length);
    if (missing.length === 0) return;
    await annotate(`Notions sans « sens » (facultatif) : ${missing.length} sur ${entries.length}`, 'warning');
  });

  it('choix des phrases : une par notion, des types variés en ouverture de chapitre', () => {
    const a = sens({ text: 'A.' });
    const b = sens({ text: 'B.' });
    const h = sens({ type: 'histoire', text: 'H.' });
    expect(pickSens({ sens: [a, b] }, 3)).toBe(b);
    expect(pickSens({}, 3)).toBeUndefined();
    const chapter = { skills: [{ sens: [a, b] }, { sens: [a, h] }] as never };
    expect(chapterSens(chapter).map((s) => s.text)).toEqual(['A.', 'H.']);
    expect(chapterSens(chapter, 3).map((s) => s.text)).toEqual(['A.', 'H.', 'B.']);
  });
});
