/**
 * Faits du chapitre CM2 « Se repérer dans le temps » : chacun cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte (programmes, Sénat, Assemblée nationale, Dictionnaire de l'Académie française et TLFi via
 * le CNRTL). Les faits déjà cités par les chapitres voisins sont repris tels quels.
 */
import { PREUVES as CM1, type Preuve } from './se-reperer-sources.ts';
import { PREUVES as REPUBLIQUE } from './temps-republique-sources.ts';

const tlfi = (quote: string): Preuve => ({ source: 'cnrtl-histoire', quote });

export const PREUVES = {
  // Compétences du cycle 3
  periodes: {
    source: 'cycle3-2020',
    quote: 'Situer chronologiquement des grandes périodes historiques',
  },
  frise: CM1.frise,
  ordonner: CM1.ordonner,
  memoriser: {
    source: 'cycle3-2020',
    quote: 'Mémoriser les repères historiques liés au programme et savoir les mobiliser dans différents contextes',
  },

  // Les grandes périodes
  prehistoire: {
    source: 'academie-prehistoire',
    quote: 'Période antérieure à celle sur laquelle on possède des témoignages écrits et qu’on appelle Histoire',
  },
  ancienne: { source: 'academie-histoire', quote: 'Histoire ancienne, relative à l’Antiquité.' },
  antiquite: tlfi(
    'Histoire ancienne. Histoire couvrant les périodes les plus anciennes que nous connaissions depuis l’apparition de l’écriture et jusqu’à la chute de l’Empire romain (476)',
  ),
  moyenAge1453: {
    source: 'academie-age',
    quote:
      'Le Moyen Âge, la période comprise entre la chute de l’Empire romain d’Occident, en 476, et la prise de Constantinople, en 1453.',
  },
  moyenAge1492: tlfi(
    'Histoire du Moyen Âge. Histoire qui commence en 476 et dont on fixe généralement le terme à la découverte de l’Amérique (1492)',
  ),
  modernes: {
    source: 'cnrtl-moderne',
    quote: 'Période qui débute à la fin du Moyen Âge et se termine à la Révolution française.',
  },
  contemporaine: {
    source: 'academie-histoire',
    quote: 'Histoire contemporaine, de 1789 à nos jours.',
  },

  // Durées
  duree: {
    source: 'academie-duree',
    quote: 'Espace de temps occupé par une action ou séparant le début et la fin d’un évènement.',
  },
  siecle: CM1.siecle,
  bornes: CM1.bornes,
  millenaire: CM1.millenaire,
  chronologie: CM1.chronologie,

  // Repères datés du CM1 et du CM2
  charlemagne: CM1.charlemagne,
  louisIx: CM1.louisIx,
  revolution: CM1.revolution,
  napoleon: CM1.napoleon,
  suffrage: REPUBLIQUE.hommes1848,
  gratuite: REPUBLIQUE.gratuite,
  cent: REPUBLIQUE.cent,
  cultes: REPUBLIQUE.cultes,
  femmes: REPUBLIQUE.femmes1944,
} satisfies Record<string, Preuve>;
