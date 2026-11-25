import { describe, expect, it } from 'vitest';
import { generate } from '../catalog.ts';
import { check } from '../check.ts';
import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from '../glossaires.ts';
import { getSource } from '../sources.ts';
import { validateVariants } from '../validate.ts';
import type { Level, Question } from '../types.ts';
import {
  EMPLOIS_ER,
  EMPLOIS_IR,
  FAITS_PRESENT,
  IRREGULIERS,
  IR_AUTRES,
  PERSONNES,
  PHRASES_ETRE_AVOIR,
  PIEGES_IRREGULIERS,
  VARIATIONS,
  VERBES,
  avecSujet,
  faitPresent,
  forme,
  formes,
  sourceDe,
} from './present.donnees.ts';
import { FCM1_PRESENT } from './present.ts';

const skills = FCM1_PRESENT;
const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];
const tirages = (id: string, level: Level) => Array.from({ length: 200 }, (_, seed) => generate(id, level, seed));
const lignes = (q: Question) => {
  if (q.figure?.kind !== 'document') throw new Error('forme inattendue');
  return q.figure.lines;
};
const trous = (q: Question) => {
  if (q.answer.kind !== 'cloze') throw new Error('forme inattendue');
  return q.answer.blanks.map((b) => (b.mode === 'text' ? b.accepted : []));
};
const saisie = (text: string) => ({ kind: 'text' as const, text });

describe('francais cm1 — conjuguer au présent', () => {
  it('le chapitre compte les six notions du lot, à 5 niveaux', () => {
    expect(skills.map((s) => s.id)).toEqual([
      'fcm1-radical-terminaison',
      'fcm1-present-er',
      'fcm1-present-ir',
      'fcm1-etre-avoir',
      'fcm1-present-irreguliers',
      'fcm1-present-variations',
    ]);
    for (const s of skills) expect(s.levels).toBe(5);
  });

  it('faits et notions citent des sources du registre ; les termes en gras sont définis', () => {
    expect(new Set(FAITS_PRESENT.map((f) => f.id)).size).toBe(FAITS_PRESENT.length);
    for (const f of FAITS_PRESENT) {
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

  it('QCM : 3 propositions au niveau 1 ; 4 au niveau 2 hors association', () => {
    for (const s of skills) {
      for (const level of [1, 2] as const) {
        for (const q of tirages(s.id, level)) {
          if (q.answer.kind === 'choice') expect(q.answer.options, q.prompt).toHaveLength(level + 2);
          else expect(q.answer.kind).toBe('match');
        }
      }
    }
  });
});

describe('formes du présent', () => {
  it('chaque verbe a six formes, sourcées par sa page de conjugaison', () => {
    for (const v of VERBES) {
      expect(PERSONNES.map((p) => forme(v, p)).filter(Boolean), v).toHaveLength(6);
      const f = faitPresent(`present-${v}`);
      expect(f.source).toBe(sourceDe(v));
      expect(getSource(f.source)?.url).toBe(`https://www.cnrtl.fr/morphologie/${encodeURIComponent(v)}/verbe`);
    }
  });

  it('les terminaisons des 1er et 2e groupes se retrouvent dans les formes relevées', () => {
    const er = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
    const ir = ['is', 'is', 'it', 'issons', 'issez', 'issent'];
    for (const [v] of EMPLOIS_ER) expect(PERSONNES.map((p) => forme(v, p))).toEqual(er.map((t) => v.slice(0, -2) + t));
    for (const [v] of EMPLOIS_IR) expect(PERSONNES.map((p) => forme(v, p))).toEqual(ir.map((t) => v.slice(0, -2) + t));
    for (const v of IR_AUTRES) expect(forme(v, 'nous')).not.toContain('iss');
  });

  it('les entêtes du Dictionnaire de l’Académie concordent avec le tableau', () => {
    for (const v of ['être', 'avoir', 'faire', 'aller'] as const) {
      const id = `header-${v === 'être' ? 'etre' : v}`;
      const lu = faitPresent(id)
        .citation.split(', ')
        .map((x) => x.replace(/^(je |j'|tu |il |nous |vous |ils )/, ''));
      expect(lu, v).toEqual(PERSONNES.map((p) => forme(v, p)));
    }
  });

  it('chaque variation du radical est attestée par la source citée', () => {
    const modeles: Record<string, string> = {
      avancer: 'avancer',
      bouger: 'bouger',
      broyer: 'essuyer',
      balayer: 'payer',
      appeler: 'appeler',
      jeter: 'jeter',
      celer: 'peler',
      acheter: 'acheter',
      ceder: 'céder',
    };
    for (const x of VARIATIONS) {
      expect(faitPresent(x.fait).citation.length).toBeGreaterThan(7);
      const infinitif = x.verbe;
      if (x.fait !== 'variations-radical') expect(Object.keys(modeles)).toContain(x.fait);
      // La variation se voit : au moins une forme n'est pas « radical de l'infinitif + terminaison ».
      const regulieres = ['e', 'es', 'e', 'ons', 'ez', 'ent'].map((t) => infinitif.slice(0, -2) + t);
      expect(
        PERSONNES.some((p, i) => forme(x.verbe, p) !== regulieres[i]),
        x.verbe,
      ).toBe(true);
    }
    for (const [fait, v] of [
      ['avancer', 'avancer'],
      ['bouger', 'bouger'],
      ['appeler', 'appeler'],
      ['jeter', 'jeter'],
      ['acheter', 'acheter'],
      ['ceder', 'céder'],
    ] as const) {
      const citation = faitPresent(fait).citation;
      expect(citation).toContain(forme(v, 'je'));
      expect(citation).toContain(`nous ${forme(v, 'nous')}`);
    }
  });

  it('« je » devient « j’ » devant une voyelle seulement', () => {
    expect(avecSujet('Je', 'écoute')).toBe('J’écoute');
    expect(avecSujet('je', 'ai')).toBe('j’ai');
    expect(avecSujet('Je', 'chante')).toBe('Je chante');
    expect(avecSujet('Tu', 'es')).toBe('Tu es');
  });

  it('banques : les huit verbes irréguliers du programme, des pièges qui sont bien faux', () => {
    expect(faitPresent('a-memoriser').citation).toContain(`(${IRREGULIERS.join(', ')})`);
    for (const [v, p, faux] of PIEGES_IRREGULIERS) expect(formes(v, p), faux).not.toContain(faux);
    for (const p of PERSONNES)
      for (const v of ['être', 'avoir'] as const)
        expect(PHRASES_ETRE_AVOIR.some((x) => x.verbe === v) && forme(v, p)).toBeTruthy();
  });
});

describe('correction des réponses', () => {
  it('« payer » : paie et paye sont acceptés, payent et paient aussi', () => {
    const qs = LEVELS.slice(2, 4).flatMap((l) => tirages('fcm1-present-variations', l));
    const q = qs.find((x) => x.prompt.includes('« payer »') && x.prompt.includes('Ils …'));
    const cible = q ?? qs.find((x) => x.prompt.includes('« payer »'));
    if (cible?.answer.kind !== 'text') throw new Error('aucune question « payer »');
    expect(cible.answer.accepted.length).toBeGreaterThanOrEqual(4);
    for (const a of cible.answer.accepted) expect(check(cible, saisie(a)).correct).toBe(true);
  });

  it('variations : garder le radical de l’infinitif est refusé et expliqué', () => {
    const q = tirages('fcm1-present-variations', 3).find((x) => x.prompt.includes('« placer »'));
    if (!q) throw new Error('aucune question « placer »');
    expect(check(q, saisie('plaçons')).correct).toBe(true);
    const faux = check(q, saisie('placons'));
    expect(faux.correct).toBe(false);
    expect(faux.why).toContain('cédille');
  });

  it('être ou avoir : l’autre verbe est refusé et expliqué', () => {
    for (const q of tirages('fcm1-etre-avoir', 4)) {
      const x = PHRASES_ETRE_AVOIR.find((y) => q.prompt.includes(`« ${y.sujet.texte} … ${y.fin}. »`));
      if (!x) throw new Error(q.prompt);
      expect(check(q, saisie(forme(x.verbe, x.sujet.personne))).correct).toBe(true);
      const autre = check(q, saisie(forme(x.verbe === 'être' ? 'avoir' : 'être', x.sujet.personne)));
      expect(autre.correct).toBe(false);
      expect(autre.why).toContain(x.verbe);
    }
  });

  it('niveau 5 : un trou par verbe à conjuguer, la forme du sujet est attendue', () => {
    for (const s of skills.filter((x) => x.id !== 'fcm1-radical-terminaison')) {
      for (const q of tirages(s.id, 5)) {
        expect(lignes(q)).toHaveLength(4);
        trous(q).forEach((acceptes, i) => {
          const v = VERBES.find((x) => lignes(q)[i]?.includes(`(${x})`));
          if (!v) throw new Error(lignes(q)[i]);
          expect(PERSONNES.flatMap((p) => formes(v, p))).toContain(acceptes[0]);
        });
      }
    }
  });

  it('radical et terminaison niveau 5 : les deux morceaux reforment le verbe de la ligne', () => {
    for (const q of tirages('fcm1-radical-terminaison', 5)) {
      const justes = trous(q);
      expect(justes).toHaveLength(6);
      lignes(q).forEach((l, i) => {
        const verbe = `${justes[2 * i]?.[0]}${justes[2 * i + 1]?.[0]}`;
        expect(l.split(' '), l).toContain(verbe);
      });
    }
  });

  it('variations niveau 5 : au moins 3 lignes modifient le radical, chaque ligne est expliquée à juste titre', () => {
    const terminaisons = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
    for (const q of tirages('fcm1-present-variations', 5)) {
      const modifiees = trous(q).map((acceptes, i) => {
        const x = VARIATIONS.find((y) => lignes(q)[i]?.includes(`(${y.verbe})`));
        if (!x) throw new Error(lignes(q)[i]);
        expect(lignes(q)[i]?.startsWith('Je ')).toBe(false);
        const change = !terminaisons.some((t) => acceptes[0] === x.verbe.slice(0, -2) + t);
        const etape = q.steps.map(String).find((s) => s.startsWith(`Ligne ${i + 1} :`));
        expect(etape?.includes('le radical ne change pas'), etape).toBe(!change);
        expect(etape?.includes('paie ou il paye'), etape).toBe(change && x.verbe === 'payer');
        return change;
      });
      expect(modifiees.filter(Boolean).length, lignes(q).join(' ')).toBeGreaterThanOrEqual(3);
    }
  });

  it('2e groupe niveau 2 : un seul verbe du 2e groupe proposé', () => {
    const deuxieme = new Set<string>(EMPLOIS_IR.map(([v]) => v));
    for (const q of tirages('fcm1-present-ir', 2)) {
      if (q.answer.kind !== 'choice') throw new Error('forme inattendue');
      expect(q.answer.options.filter((o) => deuxieme.has(o))).toHaveLength(1);
    }
  });
});
