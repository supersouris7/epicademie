/**
 * Preuves du chapitre « Repères de 4e » : les citations des trois thèmes (déjà enregistrées par leurs chapitres) sont
 * reprises telles quelles ; s'ajoutent ici les rubriques « Principaux repères chronologiques à construire » des
 * ressources Éduscol de 4e, des passages sur les acteurs et la périodisation (mêmes ressources, programme du cycle 4)
 * et des définitions du Dictionnaire de l'Académie française et du TLFi.
 */
import type { Preuve } from './kit.ts';
import { PREUVES as CM2 } from './se-reperer-cm2-sources.ts';
import { PREUVES as REPUBLIQUE } from './temps-republique-sources.ts';
import { PREUVES as THEME3 } from './france-xixe-sources.ts';
import { PREUVES as THEME2 } from './xixe-siecle-sources.ts';
import { PREUVES as THEME1 } from './xviiie-siecle-sources.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const eduscol = (theme: 'xviiie' | 'xixe' | 'france-xixe', quote: string) => ({
  source: `eduscol-4e-${theme}`,
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});
const academie = <P extends Preuve>(preuve: P) => ({ ...preuve, who: 'Le Dictionnaire de l’Académie française' });

export const PREUVES = {
  theme1: THEME1,
  theme2: THEME2,
  theme3: THEME3,

  // Repères chronologiques à construire
  essorTraite: eduscol('xviiie', 'Années 1670 – années 1750 : essor de la traite'),
  parution: eduscol('xviiie', '1751-1772 : parution de L’Encyclopédie'),
  apogeeTraite: eduscol('xviiie', 'Fin XVIIIe siècle : apogée de la traite'),
  debutRevolution: eduscol('xviiie', '1789 : début de la Révolution française'),
  napoleon: eduscol('xviiie', '1799-1814/1815 : Napoléon Bonaparte au pouvoir'),
  debutsIndustrie: eduscol(
    'xixe',
    'Dernier tiers du XVIIIe siècle: débuts de la révolution industrielle en Angleterre',
  ),
  printemps: eduscol('xixe', '1848 : le « Printemps des peuples » / seconde abolition de l’esclavage en France'),
  secondeRevolution: eduscol('xixe', 'Années 1870 : début de la « seconde révolution industrielle »'),
  mondialisation: eduscol('xixe', '1870-1914 : « seconde mondialisation » et relance de la colonisation'),
  exposition: eduscol('xixe', '1900 : exposition universelle de Paris'),
  suffrage: eduscol('france-xixe', '1848 : adoption du suffrage universel'),
  proclamation: eduscol('france-xixe', '1870 : proclamation de la Troisième République'),
  ferryEcole: eduscol('france-xixe', '1882 : Jules Ferry et l’école gratuite, laïque et obligatoire'),
  dreyfus: eduscol('france-xixe', '1894-1906 : Affaire Dreyfus'),
  separation: eduscol('france-xixe', '1905 : séparation des Églises et de l’État'),

  // Périodisation, ruptures et continuités
  couvre: programme('de la mort de Louis XIV à l’installation de la Troisième République'),
  regimes: eduscol('france-xixe', 'une période, de 1815 à 1914, qui voit se succéder cinq régimes différents'),
  ruptureAncienRegime: eduscol(
    'xviiie',
    'un nouvel ordre politique qui rompt fondamentalement avec ce que l’on appelle désormais « l’Ancien régime »',
  ),
  ruptureVote: eduscol(
    'france-xixe',
    'En 1848, le passage du système censitaire au suffrage universel constitue tout de même une rupture « brusque »',
  ),
  continuiteCommerce: eduscol(
    'xviiie',
    'le commerce international se développe dans la continuité des circuits inaugurés au siècle précédent',
  ),
  modernes: CM2.modernes,
  contemporaine: CM2.contemporaine,
  siecle: academie(CM2.siecle),
  bornes: academie(CM2.bornes),

  // Acteurs
  acteursProgramme: programme(
    'Il s’agit notamment d’identifier les acteurs principaux de ces changements, sans réduire cette analyse aux seuls personnages politiques.',
  ),
  acteursCollectifs: eduscol('xviiie', 'Ces acteurs peuvent être bien sûr collectifs.'),
  frederic: eduscol(
    'xviiie',
    'Certains souverains, comme Frédéric II de Prusse, se réclament de ce mouvement et se disent « philosophes ».',
  ),
  turgot: eduscol(
    'xviiie',
    'Turgot, principal ministre des débuts du règne de Louis XVI, est lui-même un philosophe des Lumières.',
  ),
  quakers: eduscol(
    'xviiie',
    'les quakers des futurs États-Unis d’Amérique créent, dès 1775, la première société pour l’abolition de l’esclavage',
  ),
  auclert: REPUBLIQUE.auclert,
  darwin: eduscol(
    'xixe',
    'L’expédition à laquelle il participa à bord du Beagle de 1831 à 1836 l’amena non seulement à poser les premières bases de sa célèbre théorie sur l’origine des espèces',
  ),

  // Vocabulaire
  cens: academie({
    source: 'academie-cens',
    quote:
      "Cens électoral, quotité d'imposition qui, selon la Constitution de certains pays, était nécessaire pour être électeur ou éligible.",
  }),
  industrialisation: eduscol(
    'xixe',
    'On lui préfère celui « d’industrialisation » pour décrire le phénomène de montée de l’industrie dans les autres pays.',
  ),
} satisfies Record<string, unknown>;
