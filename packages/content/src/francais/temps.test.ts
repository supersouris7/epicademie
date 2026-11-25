import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import { PERSONNES, avecSujet } from './present.donnees.ts';
import {
  FAITS_TEMPS,
  IRREGULIERS_CITES,
  REGULIERS,
  REGULIERS_ER,
  SUJETS_ACCORDES,
  VERBES_TEMPS,
  auxiliaireDe,
  conjugue,
  faitTemps,
  negatif,
  participe,
  passeCompose,
} from './temps.donnees.ts';
import { FCM1_TEMPS } from './temps.ts';

const skills = FCM1_TEMPS;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const saisie = (text: string) => ({ kind: 'text' as const, text });
const accepte = (q: Question) => {
  if (q.answer.kind !== 'text') throw new Error('forme inattendue');
  return q.answer.accepted;
};
const trouve = (id: string, level: Level, morceau: string) => {
  const q = tirages(id, level).find((x) => x.prompt.includes(morceau));
  if (!q) throw new Error(`aucune question « ${morceau} »`);
  return q;
};

describe('francais cm1 — imparfait, futur et passé composé', () => {
  it('le chapitre compte les cinq notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-imparfait',
      'fcm1-futur',
      'fcm1-passe-compose',
      'fcm1-infinitif-participe',
      'fcm1-passe-compose-negatif',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_TEMPS.map((f) => f.id)).size).toBe(FAITS_TEMPS.length);
    for (const f of FAITS_TEMPS) {
      expect(getSource(f.source), f.id).toBeDefined();
      expect(f.citation.trim().length, f.id).toBeGreaterThan(7);
    }
    for (const s of skills) {
      for (const id of s.lesson.sources ?? []) expect(getSource(id), id).toBeDefined();
      for (const term of s.lesson.memo.flatMap(boldTerms))
        expect(isDefined(term, SUBJECT_GLOSSARIES.francais ?? []), term).toBe(true);
    }
  });

  it('questions valides et distinctes aux 5 niveaux, au moins deux pièges expliqués', () => {
    for (const s of skills) {
      let niveauxAvecPieges = 0;
      const enonces = new Set<string>();
      for (const level of LEVELS) {
        const qs = tirages(s.id, level);
        expect(validateVariants(qs), `${s.id} N${level}`).toEqual([]);
        if (qs.some((q) => q.traps.length >= 2)) niveauxAvecPieges++;
        enonces.add(qs.map((q) => q.prompt).join('|'));
      }
      expect(niveauxAvecPieges, s.id).toBeGreaterThanOrEqual(3);
      expect(enonces.size, s.id).toBe(5);
    }
  });

  it('QCM : 3 propositions au niveau 1 ; 4 au niveau 2 ; saisie sans propositions au niveau 4', () => {
    for (const s of skills) {
      for (const level of [1, 2] as const) {
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'choice') expect(q.answer.options, q.prompt).toHaveLength(level + 2);
          else expect(q.answer.kind).toBe('match');
        }
      }
      for (const q of tirages(s.id, 4)) expect(q.answer.kind, q.prompt).toBe('text');
    }
  });

  it('niveau 5 : un texte de 4 lignes, un trou par ligne', () => {
    for (const s of skills) {
      for (const q of tirages(s.id, 5)) {
        if (q.figure?.kind !== 'document' || q.answer.kind !== 'cloze') throw new Error('forme inattendue');
        expect(q.figure.lines).toHaveLength(4);
        expect(q.answer.blanks).toHaveLength(4);
      }
    }
  });
});

describe('formes relevées', () => {
  it('imparfait : marque -ai- ou -i- et marque de personne pour tous les verbes', () => {
    const fins = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
    for (const v of VERBES_TEMPS)
      PERSONNES.forEach((p, i) => expect(conjugue('imparfait', v, p).endsWith(fins[i] ?? '?'), v).toBe(true));
  });

  it('futur : marque -r- et marque de personne pour tous les verbes', () => {
    const fins = ['rai', 'ras', 'ra', 'rons', 'rez', 'ront'];
    for (const v of VERBES_TEMPS)
      PERSONNES.forEach((p, i) => expect(conjugue('futur', v, p).endsWith(fins[i] ?? '?'), v).toBe(true));
  });

  it('verbes réguliers : futur = infinitif + marque ; participe en -é ou -i', () => {
    for (const v of REGULIERS) {
      expect(conjugue('futur', v, 'tu')).toBe(`${v}as`);
      expect(participe(v)).toBe(REGULIERS_ER.includes(v) ? `${v.slice(0, -2)}é` : v.slice(0, -1));
    }
  });

  it('les verbes du programme sont tous travaillés ; seuls aller et venir prennent « être »', () => {
    const memoriser = faitTemps('a-memoriser').citation;
    for (const v of IRREGULIERS_CITES.slice(2)) expect(memoriser).toContain(v);
    expect(VERBES_TEMPS.filter((v) => auxiliaireDe(v) === 'être')).toEqual(['aller', 'venir']);
  });

  it('citations des pages de conjugaison, au texte près', () => {
    expect(faitTemps('compose-aller').citation).toBe(
      'je suis allé … tu es allé … il/elle/on est allé … nous sommes allés … vous êtes allés … ils/elles sont allés',
    );
    expect(faitTemps('imparfait-écouter').citation.startsWith('j’écoutais … tu écoutais')).toBe(true);
  });

  it('accord avec « être », négation autour de l’auxiliaire', () => {
    const elles = SUJETS_ACCORDES.find((s) => s.texte === 'Elles');
    const il = SUJETS_ACCORDES.find((s) => s.texte === 'Il');
    if (!elles || !il) throw new Error('sujet absent');
    expect(passeCompose('venir', elles)).toBe('sont venues');
    expect(passeCompose('chanter', elles)).toBe('ont chanté');
    expect(negatif('aller', il, 'jamais')).toBe('n’est jamais allé');
    expect(negatif('venir', elles, 'plus')).toBe('ne sont plus venues');
    expect(avecSujet('Je', 'étais')).toBe('J’étais');
  });
});

describe('correction des réponses', () => {
  it('imparfait : « nous voyons » est refusé et expliqué (le i manque)', () => {
    const q = tirages('fcm1-imparfait', 4).find((x) => x.prompt.includes('« voir »') && accepte(x)[0] === 'voyions');
    if (!q) throw new Error('aucune question « voyions »');
    expect(check(q, saisie('voyions')).correct).toBe(true);
    const faux = check(q, saisie('voyons'));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('le i');
  });

  it('futur : garder le radical de l’infinitif est refusé et expliqué', () => {
    const q = trouve('fcm1-futur', 4, '« voir »');
    const faux = check(q, saisie(accepte(q)[0]?.replace('verr', 'voir') ?? ''));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('radical');
  });

  it('passé composé : apostrophe droite acceptée, accord oublié refusé', () => {
    for (const q of tirages('fcm1-passe-compose', 4)) {
      const [bon] = accepte(q);
      if (!bon) throw new Error(q.prompt);
      expect(check(q, saisie(bon)).correct).toBe(true);
    }
    const q = tirages('fcm1-passe-compose', 4).find((x) => accepte(x)[0]?.startsWith('sont ven'));
    if (!q) throw new Error('aucune question « sont venus »');
    const faux = check(q, saisie('sont venu'));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('s’accorde');
  });

  it('infinitif : l’auxiliaire seul est refusé', () => {
    const q = trouve('fcm1-infinitif-participe', 4, 'pris');
    expect(check(q, saisie('prendre')).correct).toBe(true);
    expect(check(q, saisie('avoir')).why).toContain('auxiliaire');
  });

  it("négation : « pas » après le participe est refusé, « n'» droit est accepté", () => {
    for (const q of tirages('fcm1-passe-compose-negatif', 4)) {
      const [bon] = accepte(q);
      if (!bon) throw new Error(q.prompt);
      expect(check(q, saisie(bon.replace('’', "'"))).correct).toBe(true);
      const faux = check(q, saisie(bon.replace(/ (jamais|plus) (\S+)$/, ' $2 $1')));
      expect(faux.correct).toBe(false);
      expect(faux.why).toContain('avant le participe passé');
    }
  });

  it('négation niveau 3 : l’ordre juste forme la phrase négative', () => {
    const ordres = tirages('fcm1-passe-compose-negatif', 3).filter((q) => q.answer.kind === 'order');
    expect(ordres.length).toBeGreaterThan(0);
    for (const q of ordres) {
      if (q.answer.kind !== 'order') continue;
      const { items, correct } = q.answer;
      const phrase = correct.map((i) => items[i]);
      expect(['ne', 'n’']).toContain(phrase[1]);
      expect(phrase[3]).toBe('pas');
    }
  });
});
