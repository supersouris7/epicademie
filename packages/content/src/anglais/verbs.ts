/**
 * Verbes irréguliers anglais : base verbale, prétérit, participe passé.
 * Formes vérifiées une à une le 20/11/2026 sur Wiktionary, « Appendix:English irregular verbs »
 * (https://en.wiktionary.org/wiki/Appendix:English_irregular_verbs, révision 91798533) :
 * les 24 lignes correspondent à la page. Les variantes archaïques ou rares de la page
 * (spake, writ, boughten, founden, drunken) ne sont pas enseignées.
 */
export interface IrregularVerb {
  readonly base: string;
  readonly french: string;
  /** Prétérit ; « be » en a deux (was, were). */
  readonly past: readonly string[];
  readonly participle: string;
  /** 1 : les plus courants ; 2 : courants ; 3 : à connaître en fin de collège. */
  readonly tier: 1 | 2 | 3;
}

export const IRREGULAR_VERBS: readonly IrregularVerb[] = [
  { base: 'be', french: 'être', past: ['was', 'were'], participle: 'been', tier: 1 },
  { base: 'have', french: 'avoir', past: ['had'], participle: 'had', tier: 1 },
  { base: 'do', french: 'faire', past: ['did'], participle: 'done', tier: 1 },
  { base: 'go', french: 'aller', past: ['went'], participle: 'gone', tier: 1 },
  { base: 'come', french: 'venir', past: ['came'], participle: 'come', tier: 1 },
  { base: 'see', french: 'voir', past: ['saw'], participle: 'seen', tier: 1 },
  { base: 'eat', french: 'manger', past: ['ate'], participle: 'eaten', tier: 1 },
  { base: 'make', french: 'fabriquer, faire', past: ['made'], participle: 'made', tier: 1 },
  { base: 'drink', french: 'boire', past: ['drank'], participle: 'drunk', tier: 2 },
  { base: 'take', french: 'prendre', past: ['took'], participle: 'taken', tier: 2 },
  { base: 'buy', french: 'acheter', past: ['bought'], participle: 'bought', tier: 2 },
  { base: 'write', french: 'écrire', past: ['wrote'], participle: 'written', tier: 2 },
  { base: 'read', french: 'lire', past: ['read'], participle: 'read', tier: 2 },
  { base: 'speak', french: 'parler', past: ['spoke'], participle: 'spoken', tier: 2 },
  { base: 'sleep', french: 'dormir', past: ['slept'], participle: 'slept', tier: 2 },
  { base: 'give', french: 'donner', past: ['gave'], participle: 'given', tier: 2 },
  { base: 'swim', french: 'nager', past: ['swam'], participle: 'swum', tier: 3 },
  { base: 'think', french: 'penser', past: ['thought'], participle: 'thought', tier: 3 },
  { base: 'know', french: 'savoir, connaître', past: ['knew'], participle: 'known', tier: 3 },
  { base: 'run', french: 'courir', past: ['ran'], participle: 'run', tier: 3 },
  { base: 'begin', french: 'commencer', past: ['began'], participle: 'begun', tier: 3 },
  { base: 'find', french: 'trouver', past: ['found'], participle: 'found', tier: 3 },
  { base: 'leave', french: 'partir, quitter', past: ['left'], participle: 'left', tier: 3 },
  { base: 'meet', french: 'rencontrer', past: ['met'], participle: 'met', tier: 3 },
];

/** Verbes d'un niveau : le niveau 1 garde les plus courants, le niveau 3 les prend tous. */
export const verbsFor = (level: 1 | 2 | 3) => IRREGULAR_VERBS.filter((v) => v.tier <= level);

/** Erreur typique : le verbe traité comme régulier (« goed », « eated »). */
export const regularised = (base: string) => (base.endsWith('e') ? `${base}d` : `${base}ed`);
