import { describe, expect, it } from 'vitest';
import { normalizeText } from '../check.ts';
import { analyzeSkill } from '../lisibilite.ts';
import { createRng } from '../rng.ts';
import { sensIssues } from '../sens.ts';
import { getSource } from '../sources.ts';
import { NOTIONS, SKILLS, SOURCE } from './revolution-empire.ts';

const mot = (text: string) =>
  new RegExp(`(?<!\\p{L})${normalizeText(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'u');
const ecrites = NOTIONS.flatMap((n) => [
  ...n.libres.map((l) => ({ id: n.id, shown: `${l.q} ${l.indice}`, l })),
  ...n.docs.flatMap((d) => d.qs.map((l) => ({ id: n.id, shown: [d.title, ...d.lines, l.q, l.indice].join(' '), l }))),
]);

describe('histoire cm1 — Révolution et Empire', () => {
  it('cite une source du registre et une citation exacte pour chaque fait', () => {
    expect(getSource(SOURCE)).toBeDefined();
    for (const n of NOTIONS) {
      for (const f of [...n.faits, ...n.libres, ...n.docs.flatMap((d) => d.qs)]) {
        expect(f.quote.trim().length, n.id).toBeGreaterThan(20);
        expect(getSource(f.source ?? ''), `${n.id} : ${f.source}`).toBeDefined();
      }
    }
  });

  it('prévoit des erreurs typiques expliquées', () => {
    for (const n of NOTIONS) {
      for (const f of n.faits) {
        expect(f.wrong.length, n.id).toBeGreaterThanOrEqual(3);
        for (const w of f.wrong) expect(w.why.trim().length, n.id).toBeGreaterThan(0);
      }
    }
    for (const { id, l } of ecrites) expect(l.traps.length, id).toBeGreaterThanOrEqual(2);
  });

  it('repasse : mêmes identifiants, version 2, un sens par notion', () => {
    expect(SKILLS.map((s) => s.id)).toEqual([
      'hcm1-1789-execution',
      'hcm1-nation',
      'hcm1-napoleon',
      'hcm1-heritages-revolution',
    ]);
    for (const s of SKILLS) {
      expect(s.version, s.id).toBe(2);
      expect(s.sens?.length, s.id).toBe(1);
      expect(sensIssues(s), s.id).toEqual([]);
    }
  });

  it('le détecteur ne signale plus rien', () => {
    for (const s of SKILLS) {
      const report = analyzeSkill(s, { id: 'hcm1-revolution-empire', subject: 'histoire', grade: 'cm1' });
      expect({ id: s.id, counts: report.counts, words: report.words }).toEqual({ id: s.id, counts: {}, words: [] });
    }
  });

  it('saisie : seules les réponses demandées par la consigne sont acceptées', () => {
    const accepted = (q: string) => ecrites.find(({ l }) => l.q === q)?.l.accepted;
    expect(accepted('Écris le mot qui manque : avant la Révolution, c’est l’… Régime.')).toEqual([
      'Ancien',
      'l’Ancien',
    ]);
    expect(accepted('Écris le premier mot du titre de ce texte.')).toEqual([
      'Déclaration',
      'Declaration',
      'la Déclaration',
      'la Declaration',
    ]);
  });

  it('texte à trou sur les acquis : un seul verbe convient, annoncé par ses premières lettres', () => {
    const fait = NOTIONS.flatMap((n) => n.faits).find(
      (f) => f.q === 'Que fait Napoléon de certains acquis de la Révolution ?',
    );
    expect(fait?.gap[1]).toContain('« conse »');
    expect(fait?.gap[2]).toEqual(['conserve']);
  });

  it('n’annonce pas un nombre de mots pour « coup d’État »', () => {
    expect(JSON.stringify(NOTIONS)).not.toMatch(/expression en (deux|trois) mots/);
  });

  it('la dernière bulle donne la réponse en gras', () => {
    for (const s of SKILLS) {
      for (const level of [1, 2, 3, 4, 5] as const) {
        for (let seed = 1; seed <= 30; seed++) {
          expect(s.generate(createRng(seed), level).steps.at(-1), `${s.id} N${level}`).toContain('**');
        }
      }
    }
  });

  it('saisie : ni le texte, ni la consigne, ni l’indice ne contiennent une réponse acceptée', () => {
    for (const { id, shown, l } of ecrites) {
      for (const answer of l.accepted) expect(normalizeText(shown), `${id} : ${answer}`).not.toMatch(mot(answer));
    }
  });

  it('choix et texte à trou : l’indice ne souffle pas la réponse', () => {
    for (const n of NOTIONS) {
      for (const f of n.faits) {
        expect(normalizeText(f.indice), `${n.id} : ${f.a}`).not.toMatch(mot(f.a));
        for (const answer of f.gap[2]) {
          const phrase = normalizeText(`${f.indice} ${f.gap[0]}… ${f.gap[1]}`);
          expect(phrase, `${n.id} : ${answer}`).not.toMatch(mot(answer));
        }
      }
    }
  });

  it('une réponse écrite n’est jamais aussi un piège', () => {
    for (const { id, l } of ecrites) {
      const accepted = new Set(l.accepted.map(normalizeText));
      expect(
        l.traps.filter((t) => accepted.has(normalizeText(t.text))),
        id,
      ).toEqual([]);
    }
  });
});
