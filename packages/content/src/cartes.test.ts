import { describe, expect, it } from 'vitest';
import { MAP_IDS, zoneIds, zoneName } from './cartes.ts';
import { check } from './check.ts';
import { DEPARTEMENTS, REGIONS } from './geographie/donnees.generated.ts';
import type { Question } from './types.ts';
import { validateQuestion } from './validate.ts';

const base = {
  skillId: 't',
  level: 1,
  seed: 1,
  prompt: 'Où est la Bretagne ?',
  steps: ['Étape.'],
  hint: 'Indice.',
  traps: [],
  targetSeconds: 30,
} as const;
const codes = (q: Question) => validateQuestion(q).map((i) => i.code);
const zone = (z: string, extra: Partial<Question> = {}): Question => ({
  ...base,
  answer: { kind: 'zone', map: 'france-regions', zone: z },
  ...extra,
});

describe('registre des zones', () => {
  it('chaque carte a des zones nommées, identifiants distincts', () => {
    for (const map of MAP_IDS) {
      const ids = zoneIds(map);
      expect(ids.length).toBeGreaterThan(4);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(zoneName(map, id)?.trim()).toBeTruthy();
    }
  });

  it('régions et départements : codes identiques au code officiel géographique (INSEE), métropole', () => {
    const regions = REGIONS.map((r) => r.code).filter((c) => Number(c) >= 11);
    expect([...zoneIds('france-regions')].sort()).toEqual(regions.sort());
    const deps = DEPARTEMENTS.map((d) => d.code).filter((c) => c.length === 2);
    expect([...zoneIds('france-departements')].sort()).toEqual(deps.sort());
  });

  it('une zone inconnue (ou héritée de Object) n’existe pas', () => {
    expect(zoneName('france-regions', 'constructor')).toBeUndefined();
    expect(zoneName('europe', '53')).toBeUndefined();
    expect(zoneName('monde', 'atlantique')).toBe('Océan Atlantique');
  });

  it('le monde contient continents, océans et grands fleuves', () => {
    const ids = zoneIds('monde');
    for (const id of ['afrique', 'asie', 'oceanie', 'atlantique', 'pacifique', 'indien', 'nil', 'amazone']) {
      expect(ids).toContain(id);
    }
  });
});

describe('réponse « zone »', () => {
  const q = zone('53', {
    traps: [{ zone: '52', why: 'Les Pays de la Loire sont au sud-est de la Bretagne.' }],
  });

  it('accepte la bonne zone, refuse les autres (avec le piège prévu)', () => {
    expect(check(q, { kind: 'zone', zone: '53' }).correct).toBe(true);
    const bad = check(q, { kind: 'zone', zone: '52' });
    expect(bad.correct).toBe(false);
    expect(bad.why).toContain('Pays de la Loire');
    expect(check(q, { kind: 'zone', zone: '11' }).correct).toBe(false);
  });

  it('une zone inconnue ou une autre forme de réponse est à refaire', () => {
    expect(check(q, { kind: 'zone', zone: 'zzz' })).toMatchObject({ correct: false, invalid: true });
    expect(check(q, { kind: 'choice', index: 0 })).toMatchObject({ correct: false, invalid: true });
  });

  it('« je ne sais pas » compte comme une erreur', () => {
    expect(check(q, { kind: 'unknown' }).correct).toBe(false);
  });

  it('le validateur accepte une question bien formée', () => {
    expect(codes(q)).toEqual([]);
  });

  it('le validateur refuse une zone absente de la carte, un piège juste ou inconnu', () => {
    expect(codes(zone('zzz'))).toContain('zone-inconnue');
    expect(codes(zone('53', { traps: [{ zone: '53', why: 'x' }] }))).toContain('piege-juste');
    expect(codes(zone('53', { traps: [{ zone: 'zzz', why: 'x' }] }))).toContain('piege-zone');
  });
});

describe('figure « map »', () => {
  const withFigure = (figure: Question['figure']): Question => ({
    ...base,
    figure,
    answer: { kind: 'choice', options: ['Bretagne', 'Normandie'], correct: 0 },
  });

  it('accepte une carte avec zones surlignées et repères', () => {
    const f = {
      kind: 'map',
      map: 'france-regions',
      highlight: ['53'],
      marks: [
        { zone: '28', label: '1' },
        { zone: '52', label: '2' },
      ],
    } as const;
    expect(codes(withFigure(f))).toEqual([]);
  });

  it('refuse une zone inconnue, des repères vides, en double ou sur la même zone', () => {
    expect(codes(withFigure({ kind: 'map', map: 'europe', highlight: ['53'] }))).toContain('figure');
    expect(codes(withFigure({ kind: 'map', map: 'europe', marks: [{ zone: 'fra', label: ' ' }] }))).toContain('figure');
    const dup = [
      { zone: 'fra', label: 'A' },
      { zone: 'esp', label: 'A' },
    ];
    expect(codes(withFigure({ kind: 'map', map: 'europe', marks: dup }))).toContain('figure');
    const same = [
      { zone: 'fra', label: 'A' },
      { zone: 'fra', label: 'B' },
    ];
    expect(codes(withFigure({ kind: 'map', map: 'europe', marks: same }))).toContain('figure');
  });
});
