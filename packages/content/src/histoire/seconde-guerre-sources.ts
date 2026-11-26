/**
 * Preuves du chapitre de 3e « La Seconde Guerre mondiale » : chacune cite un identifiant du registre (`sources.ts`)
 * et la citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 4. Les preuves déjà citées par
 * le chapitre de CM2 sont reprises telles quelles.
 */
import type { Preuve } from './kit.ts';
import { PREUVES as CM2 } from './guerres-europe-sources.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const de = (who: string, source: string) => (quote: string) => ({ source, who, quote });
const ressource3e = de('La ressource d’Éduscol pour la 3e', 'eduscol-3e-guerres-totales');
const ressourceTle = de('La ressource d’Éduscol pour la terminale', 'eduscol-tle-totalitarismes');
const genocides = de('Éduscol, le site de l’Éducation nationale,', 'eduscol-genocides');
const journee = de('Éduscol, le site de l’Éducation nationale,', 'eduscol-journee-resistance');
const vichy = de('Le dossier d’histoire du Sénat', 'senat-1940-dossier-vichy');
const chronologie = de('La chronologie du Sénat', 'senat-1940-chronologie');
const repli = de('Le dossier d’histoire du Sénat', 'senat-1940-repli');
const liberation = de('Le dossier d’histoire du Sénat', 'senat-1944-liberation');
const academie = (id: string, quote: string) => ({
  source: `academie-${id}`,
  who: 'Le Dictionnaire de l’Académie française',
  quote,
});

export const PREUVES = {
  // ——— La guerre d’anéantissement ———
  programmeAneantissement: programme(
    'Violence de masse et anéantissement caractérisent la Deuxième Guerre mondiale, conflit aux dimensions planétaires.',
  ),
  pacte: ressource3e('La signature du pacte germano-soviétique, le 23 août 1939'),
  declaree: ressource3e('Déclarée le 3 septembre à la suite de l’agression allemande contre la Pologne'),
  frontEst: ressource3e(
    'elle prend, avec l’attaque de l’URSS par Hitler le 22 juin 1941, la figure d’une « guerre d’anéantissement » sur le front de l’Est',
  ),
  causeGenocides: ressource3e('cette radicalisation est une des causes des génocides juif et tzigane'),
  croisade: ressourceTle(
    'La guerre menée contre l’URSS est une véritable « croisade » d’anéantissement qui mêle objectifs militaires, politiques, économiques et raciaux.',
  ),
  espaceVital: ressourceTle(
    'le projet vise avant tout l’aménagement d’un « espace vital » au détriment des populations de l’Est',
  ),
  barbarossa: ressourceTle(
    'L’opération Barbarossa se distingue par cet aspect d’accomplissement du projet national-socialiste',
  ),
  civils: ressourceTle(
    'Les civils sont placés au cœur de ce conflit à la fois comme acteurs et comme victimes, victimes de violences extrêmes.',
  ),
  bombardements: ressourceTle(
    'les bombardements de masse faits pour désorganiser l’adversaire, quitte à cibler de très nombreux civils',
  ),
  hiroshima: ressourceTle(
    'Le 6 août, une première bombe est larguée sur Hiroshima (340 000 habitants), où se trouve un important siège du commandement militaire nippon, et le 9 août une seconde bombe est lancée sur Nagasaki',
  ),
  atomique: ressourceTle('le premier et unique usage de l’arme atomique dans l’histoire'),
  japon: CM2.japon,
  victoire: CM2.victoire,
  debarquement: CM2.debarquement,
  pologne: CM2.pologne,
  aneantissement: academie('aneantissement', 'Destruction complète.'),

  // ——— Le génocide des Juifs et des Tsiganes ———
  definition: academie('genocide', 'Entreprise d’extermination systématique d’un groupe humain.'),
  victimes: academie('genocide', 'Le génocide perpétré par le régime nazi sur les populations juive et tzigane.'),
  shoah: CM2.shoah,
  motShoah: CM2.motShoah,
  roms: CM2.roms,
  hitler1933: ressourceTle(
    'permet en janvier 1933 l’arrivée au pouvoir d’Adolf Hitler, qui prône une politique nationaliste, raciste et antisémite',
  ),
  nuremberg: ressourceTle(
    'Dès 1933, avec la mise en place d’une politique de ségrégation à l’intérieur de l’Allemagne (boycott en 1933, lois de Nuremberg en 1935)',
  ),
  cristal: ressourceTle('Les nazis déclenchent la Nuit de Cristal, vaste pogrom'),
  etapes: ressourceTle(
    'l’extermination est l’étape ultime d’un processus en quatre étapes : l’identification, l’expropriation, la concentration et l’extermination',
  ),
  einsatz: ressourceTle(
    'la volonté d’extermination des Juifs d’Europe se concrétise dès l’été 1941 par les premiers massacres collectifs perpétrés par les Einsatzgruppen',
  ),
  centres: ressourceTle('l’implantation des centres de mise à mort sur le territoire polonais'),
  processusTsigane: ressourceTle(
    'recensement et classement, stérilisations, massacres des Einsatzgruppen, ghettoïsation et déportations',
  ),
  ghetto: academie('ghetto', 'quartier où résidaient les Juifs, par choix ou par obligation'),
  deportation: academie('deportation', 'Transfert et internement dans un camp de concentration ou d’extermination.'),
  antisemitisme: academie('antisemitisme', 'Racisme dirigé contre les Juifs et tout ce qui est perçu comme juif.'),
  rafle: CM2.rafle,
  livrer: CM2.livrer,
  auschwitz: genocides(
    'la date du 27 janvier, jour anniversaire de la découverte du camp d’Auschwitz (27 janvier 1945)',
  ),

  // ——— La France défaite et occupée ———
  guerre1939: chronologie(
    '3 septembre 1939 : la Grande- Bretagne et la France déclarent la guerre à l’Allemagne après l’invasion de la Pologne',
  ),
  offensive: ressourceTle('La bataille de France commence le 10 mai 1940.'),
  exode: ressourceTle('tentent de rejoindre le Sud : c’est l’exode'),
  paris: chronologie('14 juin 1940 : les troupes allemandes entrent à Paris.'),
  defaite: CM2.defaite,
  petain17: journee('Le 17 juin 1940, le maréchal Pétain annonce dans un discours radiodiffusé la fin des combats.'),
  armistice: chronologie('22 juin 1940 : signature de l’armistice à Rethondes'),
  armisticeDef: academie('armistice', 'Arrêt provisoire des hostilités convenu entre des belligérants.'),
  zoneOccupee: repli('Bordeaux se trouve dorénavant en zone occupée'),
  zoneLibre: repli(
    'le Gouvernement français reprend la route, en direction de l’Auvergne, pour fixer son siège en zone libre',
  ),
  vichySiege: repli('dès le 1er juillet, le Gouvernement décide-t-il de transférer son siège à Vichy'),
  occupationDef: academie(
    'occupation',
    'la période durant laquelle, de 1940 à 1944, la France fut partiellement, puis entièrement occupée',
  ),
  rationnement: academie(
    'rationnement',
    'l’ensemble des mesures prises par un gouvernement, une autorité quand les biens de première nécessité ne sont plus disponibles qu’en quantité limitée',
  ),
  sto: journee('des hommes requis pour le Service du travail obligatoire en février 1943 prennent le maquis'),
  parisLibere: liberation('Durant l’insurrection parisienne et les combats de la Libération, du 19 au 25 août'),

  // ——— Vichy, collaboration, Résistance ———
  pleinsPouvoirs: vichy('Le texte est mis au vote et adopté par 569 voix contre 80 et 17 abstentions.'),
  pouvoirs: vichy(
    'l’Assemblée Nationale donne tous pouvoirs au gouvernement de la République, sous la signature et l’autorité du maréchal Pétain',
  ),
  devise: vichy('Cette Constitution devra garantir les droits du Travail, de la Famille et de la Patrie.'),
  etatFrancais: vichy('le Gouvernement promulgue les actes constitutionnels fondateurs de l’État français'),
  autoritaire: {
    source: 'an-1940-1958',
    who: 'L’Assemblée nationale',
    quote: 'la France est dominée par un régime autoritaire et très hostile aux valeurs républicaines',
  },
  collaboration: CM2.collaboration,
  collaborationPolitique: {
    source: 'academie-collaboration',
    who: 'Le Dictionnaire de l’Académie française',
    quote: 'La politique de collaboration décidée par le gouvernement de Vichy.',
  },
  milice: academie(
    'milice',
    'organisation paramilitaire de volontaires, créée en 1943 par le gouvernement de Vichy pour combattre la résistance à l’occupation allemande et renforcer la répression',
  ),
  appel: CM2.appel,
  franceLibre: CM2.franceLibre,
  combattante: CM2.combattante,
  clandestins: CM2.clandestins,
  moulin: CM2.moulin,
  cnr: journee(
    'La première réunion du Conseil de la Résistance (qui deviendra le Conseil national de la Résistance -le CNR- à l’automne 1943) s’est déroulée clandestinement le 27 mai 1943',
  ),
  programmeCnr: journee('est adopté, à l’unanimité, le programme du CNR le 15 mars 1944'),
  maquis: academie(
    'maquis',
    'région retirée ou d’accès difficile, dans laquelle se sont regroupés et cachés ceux qui résistaient par les armes à l’occupant allemand',
  ),
  resistanceDef: academie(
    'resistance',
    'ensemble des actions d’opposition qui furent menées à travers l’Europe dans les différents pays occupés par l’Allemagne nazie ou ses alliés',
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
