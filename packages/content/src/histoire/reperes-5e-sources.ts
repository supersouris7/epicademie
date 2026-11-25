/**
 * Preuves du chapitre « Repères de 5e » : les citations des trois thèmes (déjà enregistrées par leurs chapitres) sont
 * reprises telles quelles ; s'ajoutent ici les rubriques « Principaux repères chronologiques à construire » et les
 * passages sur la périodisation, tirés des mêmes ressources Éduscol, du programme du cycle 4 et du Dictionnaire de
 * l'Académie française.
 */
import { PREUVES as THEME1 } from './chretientes-islam-sources.ts';
import type { Preuve } from './kit.ts';
import { PREUVES as THEME2 } from './occident-feodal-sources.ts';
import { PREUVES as CALCUL } from './se-reperer-sources.ts';
import { PREUVES as THEME3 } from './transformations-europe-sources.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const eduscol = (theme: string, quote: string) => ({
  source: `eduscol-5e-${theme}`,
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});
const academie = <P extends Preuve>(preuve: P) => ({ ...preuve, who: 'Le Dictionnaire de l’Académie française' });

export const PREUVES = {
  theme1: THEME1,
  theme2: THEME2,
  theme3: THEME3,

  // Programme du cycle 4
  couvre: programme('la classe de 5e couvre une vaste période, du Moyen-Âge à la Renaissance.'),

  // Repères et périodisation
  repereBouvines: eduscol('occident-feodal', '1214 : bataille de Bouvines'),
  philippeBouvines: eduscol(
    'occident-feodal',
    'La figure de Philippe Auguste permet d’illustrer ce renforcement autour de la bataille de Bouvines (1214)',
  ),
  huitSiecles: eduscol('chretientes-islam', 'et une longue période de huit siècles.'),
  cinqSiecles: eduscol('occident-feodal', 'Les limites chronologiques qui couvrent cinq siècles'),
  ruptureCrises: eduscol(
    'occident-feodal',
    'La rupture chronologique, entre les trois siècles de forte croissance démographique et économique (du XIe siècle au début du XIVe siècle) et les deux derniers de la période, marqués par les crises',
  ),
  tempsModernes: eduscol('transformations-europe', 'C’est avec ce thème que l’on entre dans les « temps modernes ».'),
  debutTheme3: eduscol(
    'transformations-europe',
    'on peut faire le choix de l’année 1453, avec la prise de Constantinople par les Turcs. Elle se termine avec la fin du règne de Louis XIV.',
  ),
  moyenAge: eduscol(
    'transformations-europe',
    'L’évêque humaniste Giovanni Andrea Bussi emploie pour la première fois en 1469 le terme de « Moyen Âge ».',
  ),
  opposition: eduscol(
    'transformations-europe',
    'Son usage se répand au XVIIe siècle pour lui opposer en amont l’Antiquité, et en aval la Renaissance.',
  ),

  // Vocabulaire
  empire: eduscol(
    'chretientes-islam',
    'ce qu’est un empire : l’affirmation d’un pouvoir central, une autorité s’exerçant sur des peuples et des territoires divers',
  ),

  // Calcul des siècles
  siecle: academie(CALCUL.siecle),
  bornes: academie(CALCUL.bornes),
};
