/**
 * Preuves du chapitre « Société, Église et pouvoir politique dans l'occident féodal (XIe-XVe siècles) » (5e) : chacune
 * cite un identifiant du registre (`sources.ts`) et la citation exacte du texte. Les preuves sans `who` viennent du
 * programme du cycle 4 ; les autres, de la ressource d'accompagnement Éduscol du thème (mars 2016).
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const eduscol = (quote: string) => ({
  source: 'eduscol-5e-occident-feodal',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});

export const PREUVES = {
  // Programme du cycle 4, classe de 5e, thème 2
  societeFeodale: programme(
    'La société féodale, empreinte des valeurs religieuses du christianisme, se construit sous la domination conjointe des pouvoirs seigneuriaux, laïques et ecclésiastiques.',
  ),
  campagnes: programme('Les campagnes et leur exploitation constituent les ressources principales de ces pouvoirs.'),
  mouvementUrbain: programme(
    'Le mouvement urbain qui s’amorce principalement au XIIe siècle fait toutefois apparaître de nouveaux modes de vie et stimule l’économie marchande.',
  ),
  etatModerne: programme(
    'le gouvernement royal pose les bases d’un État moderne, en s’imposant progressivement face aux pouvoirs féodaux, en étendant son domaine et en développant un appareil administratif plus efficace pour le contrôler.',
  ),
  capetiensValois: programme('L’affirmation de l’État monarchique dans le Royaume des Capétiens et des Valois.'),

  // L'ordre seigneurial
  vilains: eduscol(
    'Elle s’exerce par une relation directe entre le seigneur, laïc ou religieux, et les paysans (« vilains ») du territoire de sa seigneurie',
  ),
  servage: eduscol(
    'cette domination ne peut être réduite au servage (minoritaire au début de la période puis en voie d’extinction)',
  ),
  tenures: eduscol(
    'ont fait du seigneur à la fois le possesseur de la terre, confiée en « tenures » héréditaires aux paysans, et le détenteur du pouvoir',
  ),
  carolingien: eduscol(
    'L’octroi de bénéfices aux vassaux et la décomposition de l’autorité carolingienne, entamée dès la seconde moitié du IXe siècle',
  ),
  defrichements: eduscol('par des défrichements et l’assèchement des marais'),
  chartesPaysans: eduscol(
    'permet parfois aux paysans de négocier des « chartes de franchises » qui fixent leurs droits et obligations face au seigneur',
  ),
  prisches: eduscol('la plus célèbre étant celle de Prisches (Nord) en 1158'),
  doublePouvoir: eduscol('Le double pouvoir du seigneur, foncier et juridico-politique'),
  banalites: eduscol('sous ses différentes formes (banalités, question de la transmission du patrimoine'),
  jacquerie: eduscol(
    'qui peut donner lieu à de violentes confrontations (comme lors de la jacquerie de 1358 et de sa répression)',
  ),
  innovations: eduscol(
    'la combinaison des effets bénéfiques de plusieurs innovations (utilisation du cheval, céréales de printemps, moulin…)',
  ),
  expansion: eduscol(
    'ce dernier induit une augmentation considérable des espaces cultivés, et permet un accroissement sans précédent de la population européenne',
  ),
  doublement: eduscol('XIe-XIVe siècles : doublement de la population européenne'),
  toponymie: eduscol(
    'ce dont témoigne encore aujourd’hui la toponymie (« Villeneuve », « Bourgneuf », « Les essarts » et leurs multiples déclinaisons locales)',
  ),
  peste: eduscol('la dynamique démographique se briser avec la peste noire (1347-1352)'),
  abus: eduscol(
    'Voir toutes les obligations au sein de la seigneurie comme des abus, sans saisir que nombre d’entre elles existent encore dans le cadre élargi d’un État moderne.',
  ),

  // La société urbaine
  villes: eduscol(
    'Les villes elles-mêmes croissent aux XIIe et XIIIe siècles et desserrent les liens de la domination féodale.',
  ),
  urbains: eduscol('À la fin de notre période, on estime que les urbains représentent 20% de la population européenne'),
  regions: eduscol(
    'regroupés surtout en Italie du Nord, en Flandre, dans l’axe rhénan et au sein du royaume de France',
  ),
  chartesVilles: eduscol('Le plus souvent, elles négocient avec le seigneur des chartes de franchises'),
  commune: eduscol(
    'parfois elles deviennent une « commune » qui s’administre elle-même et où s’affirme le groupe social de la bourgeoisie commerçante',
  ),
  corporations: eduscol(
    'De nouveaux modes de vie s’y développent (consommation de pain frais avec la naissance de la corporation des boulangers, de viande de bœuf avec la naissance de la corporation des bouchers).',
  ),
  causes: eduscol(
    'Le mouvement d’urbanisation peut être abordé à partir de ses causes : essor du commerce, importance des centres religieux, des Universités, des lieux de pouvoir',
  ),
  libertes: eduscol('les libertés des villes sont le plus souvent négociées avec le seigneur'),
  foire: eduscol(
    'l’abbaye de Saint-Denis contrôle à partir du début du XIIe siècle la foire du Lundit, qui lui procure des profits',
  ),
  comptoirs: eduscol('économique (établissement de comptoirs et échanges accrus avec l’Orient)'),
  nomFamille: eduscol(
    'la généralisation du nom de famille à partir du XIIe siècle, pour différencier plus aisément des individus devenus plus nombreux',
  ),

  // L'Église
  immergee: eduscol(
    'L’Église est à la fois immergée dans le monde féodal, ne serait-ce que par sa richesse foncière, et porteuse de valeurs différentes.',
  ),
  gregorienne: eduscol('Rendue plus cohérente et soudée par la réforme grégorienne au début de la période'),
  mendiants: eduscol(
    'capable tant d’absorber certains discours apparemment hétérodoxes (celui des ordres mendiants du XIIIe siècle)',
  ),
  premierOrdre: eduscol(
    'elle est seule capable de produire un discours global qui conforte sa situation de premier ordre',
  ),
  encadre: eduscol('Elle encadre la vie quotidienne des fidèles, imposant lentement son cadre moral'),
  ecrit: eduscol(
    'et s’appuie sur son quasi-monopole de l’écrit qui lui permet, par exemple, de contrôler la nouvelle institution universitaire',
  ),
  universites: eduscol('c’est dans les Universités que l’on apprend le droit canon et le droit romain'),
  sacre: eduscol('Elle sacre les rois d’Aragon, de France, d’Angleterre et les empereurs romains germaniques.'),
  paixDieu: eduscol(
    'Elle lance le mouvement de la « paix de Dieu » aux Xe et XIe siècles pour protéger les biens d’Église et les populations',
  ),
  chevalerie: eduscol('et bénit ensuite la chevalerie qu’elle entraîne dans les croisades'),
  paroisse: eduscol(
    'L’importance de la paroisse comme cadre de vie des paysans, comme le fait qu’il existe des seigneuries ecclésiastiques, permet d’introduire l’Église dans le thème.',
  ),
  ordresReligieux: eduscol('religieux (essor des ordres religieux, christianisation de l’Europe orientale)'),
  suger: eduscol(
    'L’abbé Suger est un homme de la réforme grégorienne, le conseiller du roi Louis VI et un véritable théoricien du pouvoir royal capétien, le constructeur de la basilique gothique.',
  ),
  necropole: eduscol('Et cette basilique est aussi la nécropole des rois de France.'),
  soutien: eduscol('L’Église apparaît comme le principal soutien de la monarchie capétienne'),

  // L'affirmation de l'État monarchique
  hugues: eduscol(
    'Hugues Capet est l’un d’eux : « duc de France », il possède, quand il devient roi en 987, un domaine, qui s’étend essentiellement en Ile-de-France et dans l’Orléanais, qui devient le « domaine royal ».',
  ),
  repere987: eduscol('987 : couronnement et sacre d’Hugues Capet'),
  appui: eduscol(
    'C’est à partir de la féodalité et de l’appui de l’Église que les Capétiens construisent leur domination.',
  ),
  caractereSacre: eduscol(
    'Son caractère sacré est son autre ressource, mais les relations avec les grands restent difficiles.',
  ),
  philippeAuguste: eduscol('Le règne de Philippe-Auguste (1180-1223) constitue incontestablement un tournant'),
  suzerain: eduscol(
    'À la figure du roi faible, suzerain de puissants princes des XIe et XIIe siècles, succède celle du roi souverain',
  ),
  bouvines: eduscol(
    'autour de la bataille de Bouvines (1214), première manifestation d’une nation en gestation et prise de contrôle des riches fiefs du nord du royaume',
  ),
  legistes: eduscol(
    'Philippe IV le Bel (1285-1314) s’entoure de « légistes » (nous dirions juristes) et convoque à partir de 1302 des états généraux.',
  ),
  louisIX: eduscol(
    'Le prestige religieux de la monarchie française est à son apogée avec le règne de Louis IX (1226-1270) qui est canonisé et devient saint Louis en 1297.',
  ),
  impot: eduscol('notamment avec la levée de l’impôt permanent à partir de 1360'),
  marges: eduscol('dans un espace mieux contrôlé hormis des marges (Bretagne, Bourgogne) plus autonomes'),
  centAns: eduscol('1337-1453 : Guerre de Cent Ans'),
  royaumeNational: eduscol(
    'le récit des difficultés du royaume de France durant la « guerre de Cent Ans » qui le transforme en royaume national',
  ),
  acteurs: eduscol('d’acteurs importants (Charles VII, Jeanne d’Arc)'),
  saintDenis: eduscol(
    'où se forme le lien privilégié entre le culte de saint Denis, la royauté capétienne et la protection du royaume',
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
