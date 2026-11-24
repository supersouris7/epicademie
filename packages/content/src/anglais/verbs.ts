/**
 * Verbes irréguliers anglais : base verbale, prétérit, participe passé.
 * Source institutionnelle (règle du 21/11/2026 : sources institutionnelles seulement) :
 * British Council, LearnEnglish, « Irregular verbs »
 * (https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/irregular-verbs),
 * tableau de 52 verbes relu ligne à ligne le 21/11/2026. Les formes viennent toutes de ce tableau.
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
  { base: 'begin', french: 'commencer', past: ['began'], participle: 'begun', tier: 2 },
  { base: 'break', french: 'casser', past: ['broke'], participle: 'broken', tier: 2 },
  { base: 'bring', french: 'apporter', past: ['brought'], participle: 'brought', tier: 2 },
  { base: 'buy', french: 'acheter', past: ['bought'], participle: 'bought', tier: 2 },
  { base: 'build', french: 'construire', past: ['built'], participle: 'built', tier: 3 },
  { base: 'choose', french: 'choisir', past: ['chose'], participle: 'chosen', tier: 3 },
  { base: 'come', french: 'venir', past: ['came'], participle: 'come', tier: 1 },
  { base: 'cost', french: 'coûter', past: ['cost'], participle: 'cost', tier: 3 },
  { base: 'cut', french: 'couper', past: ['cut'], participle: 'cut', tier: 3 },
  { base: 'do', french: 'faire', past: ['did'], participle: 'done', tier: 1 },
  { base: 'draw', french: 'dessiner', past: ['drew'], participle: 'drawn', tier: 3 },
  { base: 'drive', french: 'conduire', past: ['drove'], participle: 'driven', tier: 3 },
  { base: 'eat', french: 'manger', past: ['ate'], participle: 'eaten', tier: 1 },
  { base: 'feel', french: 'ressentir, se sentir', past: ['felt'], participle: 'felt', tier: 2 },
  { base: 'find', french: 'trouver', past: ['found'], participle: 'found', tier: 2 },
  { base: 'get', french: 'obtenir, recevoir', past: ['got'], participle: 'got', tier: 1 },
  { base: 'give', french: 'donner', past: ['gave'], participle: 'given', tier: 1 },
  { base: 'go', french: 'aller', past: ['went'], participle: 'gone', tier: 1 },
  { base: 'have', french: 'avoir', past: ['had'], participle: 'had', tier: 1 },
  { base: 'hear', french: 'entendre', past: ['heard'], participle: 'heard', tier: 2 },
  { base: 'hold', french: 'tenir', past: ['held'], participle: 'held', tier: 3 },
  { base: 'keep', french: 'garder', past: ['kept'], participle: 'kept', tier: 3 },
  { base: 'know', french: 'savoir, connaître', past: ['knew'], participle: 'known', tier: 2 },
  { base: 'leave', french: 'partir, quitter', past: ['left'], participle: 'left', tier: 2 },
  { base: 'lead', french: 'mener', past: ['led'], participle: 'led', tier: 3 },
  { base: 'let', french: 'laisser', past: ['let'], participle: 'let', tier: 3 },
  { base: 'lie', french: 'être allongé', past: ['lay'], participle: 'lain', tier: 3 },
  { base: 'lose', french: 'perdre', past: ['lost'], participle: 'lost', tier: 2 },
  { base: 'make', french: 'fabriquer, faire', past: ['made'], participle: 'made', tier: 1 },
  { base: 'mean', french: 'vouloir dire', past: ['meant'], participle: 'meant', tier: 3 },
  { base: 'meet', french: 'rencontrer', past: ['met'], participle: 'met', tier: 2 },
  { base: 'pay', french: 'payer', past: ['paid'], participle: 'paid', tier: 3 },
  { base: 'put', french: 'mettre, poser', past: ['put'], participle: 'put', tier: 2 },
  { base: 'run', french: 'courir', past: ['ran'], participle: 'run', tier: 2 },
  { base: 'say', french: 'dire', past: ['said'], participle: 'said', tier: 1 },
  { base: 'see', french: 'voir', past: ['saw'], participle: 'seen', tier: 1 },
  { base: 'sell', french: 'vendre', past: ['sold'], participle: 'sold', tier: 3 },
  { base: 'send', french: 'envoyer', past: ['sent'], participle: 'sent', tier: 3 },
  { base: 'set', french: 'régler, installer', past: ['set'], participle: 'set', tier: 3 },
  { base: 'sit', french: 's’asseoir', past: ['sat'], participle: 'sat', tier: 2 },
  { base: 'speak', french: 'parler', past: ['spoke'], participle: 'spoken', tier: 2 },
  { base: 'spend', french: 'dépenser, passer (du temps)', past: ['spent'], participle: 'spent', tier: 3 },
  { base: 'stand', french: 'être debout', past: ['stood'], participle: 'stood', tier: 3 },
  { base: 'take', french: 'prendre', past: ['took'], participle: 'taken', tier: 1 },
  { base: 'teach', french: 'enseigner', past: ['taught'], participle: 'taught', tier: 3 },
  { base: 'tell', french: 'raconter, dire à', past: ['told'], participle: 'told', tier: 2 },
  { base: 'think', french: 'penser', past: ['thought'], participle: 'thought', tier: 2 },
  { base: 'understand', french: 'comprendre', past: ['understood'], participle: 'understood', tier: 3 },
  { base: 'wear', french: 'porter (un vêtement)', past: ['wore'], participle: 'worn', tier: 3 },
  { base: 'win', french: 'gagner', past: ['won'], participle: 'won', tier: 2 },
  { base: 'write', french: 'écrire', past: ['wrote'], participle: 'written', tier: 2 },
];

/** Verbes d'un niveau : le niveau 1 garde les plus courants, le niveau 3 les prend tous. */
export const verbsFor = (level: number) => IRREGULAR_VERBS.filter((v) => v.tier <= level);

/** Erreur typique : le verbe traité comme régulier (« goed », « eated »). */
export const regularised = (base: string) => (base.endsWith('e') ? `${base}d` : `${base}ed`);
