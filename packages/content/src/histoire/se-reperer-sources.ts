/**
 * Faits du chapitre « Se repérer dans le temps » : chacun cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte (programme du cycle 3, Dictionnaire de l'Académie française et TLFi via le CNRTL).
 */
export interface Preuve {
  readonly source: string;
  readonly quote: string;
}

const programme = (quote: string): Preuve => ({ source: 'cycle3-2020', quote });

export const PREUVES = {
  frise: programme(
    'Utiliser des documents donnant à voir une représentation du temps (dont les frises chronologiques), à différentes échelles, et le lexique relatif au découpage du temps',
  ),
  ordonner: programme(
    'Ordonner des faits les uns par rapport aux autres et les situer dans une époque ou une période donnée',
  ),
  migrations: programme(
    "à partir du IVe siècle, des peuples venus de l'est, notamment les Francs et les Wisigoths, s'installent sur plusieurs siècles dans l'empire romain d'Occident, qui s'effondre définitivement vers la fin du Ve siècle",
  ),
  charlemagne: programme('Charlemagne, couronné empereur en 800, roi des Francs et des Lombards'),
  louisIx: programme('Louis IX, le « roi chrétien » au XIIIe siècle'),
  revolution: programme('De l’année 1789 à l’exécution du roi : Louis XVI, la Révolution, la Nation'),
  napoleon: programme('est proclamé empereur des Français en 1804'),
  routeSoie: programme('Un commerce régulier entre Rome et la Chine existe depuis le IIe siècle avant J.-C.'),
  siecle: {
    source: 'academie-siecle',
    quote:
      'Durée de cent ans ; chacune des périodes de cent ans qui s’ordonnent à partir d’un point chronologique de référence et, spécialement, de la date présumée de la naissance du Christ.',
  },
  bornes: {
    source: 'academie-siecle',
    quote: 'Le siècle actuel a commencé le premier jour de l’année 2001 et finira le dernier jour de l’année 2100.',
  },
  millenaire: { source: 'tlfi-millenaire', quote: 'Période de mille ans.' },
  lettres: {
    source: 'tlfi-romain',
    quote: 'Lettres capitales I, V, X, L, C, D, M, correspondant à 1, 5, 10, 50, 100, 500, 1 000',
  },
  quatre: { source: 'academie-quatre', quote: 'Quatre s’écrit 4 en chiffres arabes et IV en chiffres romains.' },
  neuf: { source: 'academie-neuf', quote: 'Neuf s’écrit 9 en chiffres arabes et IX en chiffres romains.' },
  quatorze: {
    source: 'academie-quatorze',
    quote: 'Quatorze s’écrit 14 en chiffres arabes et XIV en chiffres romains.',
  },
  siecleRomain: { source: 'academie-nombres', quote: 'les numéros des siècles : le XXe siècle' },
  chronologie: {
    source: 'academie-chronologie',
    quote: 'Ensemble de faits historiques présentés dans l’ordre de leur succession.',
  },
  ere: {
    source: 'academie-ere',
    quote: 'L’ère chrétienne commence à la date présumée de la naissance du Christ',
  },
  jc: {
    source: 'tlfi-siecle',
    quote: 'de Jésus-Christ (J.-C.), avant notre ère, avant l’ère chrétienne',
  },
} satisfies Record<string, Preuve>;
