import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { ordre } from '../st/outils.ts';
import { qcm, type Qcm } from './kit.ts';
import { associer, document, ecrire, termeQcm, variantes, type Definitions, type Saisie } from './terre-kit.ts';

// ——— Squelette commun aux notions du chapitre « Reproduction et sexualité » (4e) ———

export interface Rangement {
  readonly prompt: string;
  readonly suite: readonly string[];
  readonly indice: string;
  readonly explication: string;
}

export interface Trous {
  readonly prompt: string;
  /** Segments autour des trous (un de plus que de trous). */
  readonly parts: readonly string[];
  /** [propositions, indice de la bonne]. */
  readonly choix: readonly (readonly [readonly string[], number])[];
  readonly indice: string;
  readonly explication: string;
}

export interface Dossier {
  readonly titre: string;
  readonly lignes: readonly string[];
  readonly questions: readonly Qcm[];
}

export interface Contenu<T extends string> {
  readonly defs: Definitions<T>;
  readonly reperes: Readonly<Record<T, string>>;
  readonly indice: string;
  /** Niveau 1 : trois termes très différents. */
  readonly simples: readonly [T, T, T];
  /** Niveau 2 : situations proches à distinguer. */
  readonly cas: readonly Qcm[];
  readonly rangements: readonly Rangement[];
  readonly trous: readonly Trous[];
  /** Niveau 3 : termes courants à écrire. */
  readonly faciles: readonly (Saisie & { readonly t: T })[];
  /** Niveau 4 : termes à écrire sans propositions. */
  readonly saisies: readonly Saisie[];
  /** Niveau 4 : cinq paires. */
  readonly series: readonly (readonly (readonly [string, string])[])[];
  readonly pieges: readonly Qcm[];
  /** Niveau 5 : documents inventés. */
  readonly dossiers: readonly Dossier[];
}

/** Saisie d'un terme défini : variantes avec article, erreurs expliquées par leur propre définition. */
export const saisieur =
  <T extends string>(defs: Definitions<T>, indice: string) =>
  (
    t: T,
    articles: readonly string[],
    erreurs: readonly T[],
    autresFormes: readonly string[] = [],
  ): Saisie & { readonly t: T } => ({
    t,
    prompt: `Écris le terme qui désigne ${defs[t]}.`,
    accepted: [...variantes(t, ...articles), ...autresFormes],
    erreurs: erreurs.map((e) => [e, `« ${e} » désigne ${defs[e]}.`] as const),
    indice,
    explication: `La définition décrit ${defs[t]}.`,
  });

export const generer =
  <T extends string>(c: Contenu<T>) =>
  (rng: Rng, level: number): QuestionDraft => {
    if (level === 1) {
      const t = rng.pick(c.simples);
      return qcm(
        rng,
        termeQcm(
          c.defs,
          t,
          c.simples.filter((x) => x !== t),
          c.indice,
          c.reperes[t],
        ),
        30,
      );
    }
    if (level === 2) {
      if (rng.int(0, 2) === 0) {
        const termes = rng.shuffle(Object.keys(c.defs) as T[]).slice(0, 3);
        return associer(
          rng,
          termes.map((t) => [t, c.defs[t]] as const),
          {
            prompt: `Associe chaque terme à sa description : ${termes.join(', ')}.`,
            indice: c.indice,
            explication: 'Chaque terme désigne une réalité précise : repère le mot clé de sa description.',
          },
          50,
        );
      }
      return qcm(rng, rng.pick(c.cas), 40);
    }
    if (level === 3) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        const r = rng.pick(c.rangements);
        return {
          prompt: r.prompt,
          answer: ordre(rng, r.suite),
          hint: r.indice,
          steps: [r.explication, `Ordre attendu : **${r.suite.join(' → ')}**.`],
          targetSeconds: 60,
        };
      }
      if (forme === 1) {
        const t = rng.pick(c.trous);
        const bonnes = t.choix.map(([options, i]) => options[i] ?? '');
        return {
          prompt: t.prompt,
          answer: {
            kind: 'cloze',
            parts: t.parts,
            blanks: t.choix.map(([options, correct]) => ({ mode: 'list' as const, options, correct })),
          },
          hint: t.indice,
          steps: [t.explication, `Réponses : **${bonnes.join(' ; ')}**.`],
          targetSeconds: 45,
        };
      }
      return ecrire(rng.pick(c.faciles), 40);
    }
    if (level === 4) {
      const forme = rng.int(0, 2);
      if (forme === 0) {
        const serie = rng.pick(c.series);
        return associer(
          rng,
          serie,
          {
            prompt: `Associe les cinq éléments : ${serie.map((p) => p[0]).join(', ')}.`,
            indice: 'Commence par les paires dont tu es sûr, puis procède par élimination.',
            explication: 'Chaque élément n’a qu’une seule description possible.',
          },
          75,
        );
      }
      if (forme === 1) return qcm(rng, rng.pick(c.pieges), 50);
      return ecrire(rng.pick(c.saisies), 40);
    }
    const d = rng.pick(c.dossiers);
    const q = qcm(rng, rng.pick(d.questions), 75);
    return { ...q, figure: document(d.titre, [...d.lignes]) };
  };
