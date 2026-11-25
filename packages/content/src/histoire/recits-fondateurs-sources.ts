/**
 * Faits du chapitre « Récits fondateurs et citoyenneté » : chacun cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte (programme du cycle 3, ressource Éduscol du thème 2, BnF Essentiels, Vie-publique, TLFi et
 * Dictionnaire de l'Académie française publiés par le CNRTL).
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string): Preuve => ({ source: 'cycle3-2020', quote });
const eduscol = (quote: string): Preuve => ({ source: 'eduscol-6e-recits-fondateurs', who: 'Éduscol', quote });
const bnf = (source: string, quote: string): Preuve => ({ source, who: 'La Bibliothèque nationale de France', quote });
const viePublique = (quote: string): Preuve => ({
  source: 'vie-publique-citoyennete-antiquite',
  who: 'Le site Vie-publique',
  quote,
});
const tlfi = (source: string, quote: string): Preuve => ({ source, who: 'Le Trésor de la langue française', quote });
const academie = (source: string, quote: string): Preuve => ({
  source,
  who: 'Le Dictionnaire de l’Académie française',
  quote,
});

export const PREUVES = {
  // Programme
  recits: programme('Les récits mythiques et bibliques sont mis en relation avec les découvertes archéologiques'),
  rivales: programme('l’univers culturel commun des Grecs vivant dans des cités rivales'),
  dominer: programme('Comment le mythe de sa fondation permet-il à Rome d’asseoir sa domination'),
  contexte: programme('La naissance du monothéisme juif dans un monde polythéiste'),

  // Le monde des cités grecques
  morcele: eduscol(
    'Dans un monde politiquement morcelé, l’univers culturel commun des Grecs est incarné par l’Iliade et l’Odyssée',
  ),
  educateur: eduscol('Platon nous dit qu’Homère fut l’éducateur de la Grèce'),
  olympie: eduscol('celui d’Olympie où, dès 776, les jeux olympiques ont été institués'),
  delphes: eduscol(
    'un sanctuaire panhellénique, celui de Delphes, autour du dieu Apollon et de sa prêtresse la Pythie',
  ),
  poemes: bnf('bnf-iliade-odyssee', 'Les deux grands poèmes épiques d’Homère'),
  treves: eduscol(
    'Les trêves engendrées par les fêtes religieuses comme lors des jeux à Olympie rappellent le morcellement politique',
  ),
  herodote: eduscol(
    'Il existe un monde grec qui se définit par un même sang, une même langue, pour (les) dieux des sanctuaires et des sacrifices communs, des mœurs semblables',
  ),
  concourir: eduscol('être admis à concourir prouvant ainsi la « grécité » de l’individu'),
  siege: bnf('bnf-guerre-troie', 'L’Iliade raconte la dernière année du siège de Troie, qui aurait duré dix ans'),
  ulysse: bnf(
    'bnf-iliade-odyssee',
    'l’épopée d’Ulysse construisant par la ruse les instruments de son retour à Ithaque',
  ),
  oral: bnf(
    'bnf-iliade-odyssee',
    'Il est communément admis aujourd’hui que les poèmes homériques ont leur origine dans la tradition orale',
  ),
  alphabet: bnf(
    'bnf-alphabet-grec',
    'c’est l’alphabet phénicien, mieux adapté à leur langue, qu’ils adoptent en définitive, vraisemblablement vers 800 av. J.-C.',
  ),
  voyelles: bnf('bnf-alphabet-grec', 'Cet emprunt se double d’une innovation révolutionnaire : les voyelles'),
  lois: bnf('bnf-ecriture-grecque', 'Vers 650 av. J.-C., l’écrit fait son entrée dans la cité'),
  aede: tlfi(
    'cnrtl-aede',
    'Poète épique ou hymnique de la Grèce archaïque, généralement aussi chanteur-récitant de ses œuvres',
  ),

  // Rome du mythe à l'histoire
  mythe: tlfi(
    'cnrtl-mythe',
    'Récit relatant des faits imaginaires non consignés par l’histoire, transmis par la tradition',
  ),
  enee: eduscol('le mythe de l’origine troyenne de Rome avec la descendance d’Énée'),
  hellanicos: eduscol('relatée par le Grec Hellanicos de Mytilène au Ve siècle av. J.-C.'),
  romulus: eduscol('celui de Romulus, fils du dieu Mars'),
  titeLive: eduscol('rapporté avec un scepticisme non dissimulé par Tite-Live à l’époque d’Auguste'),
  date753: eduscol('fondant la ville le 21 avril 753 avant notre ère'),
  remus: eduscol('tuant son frère jumeau Rémus'),
  louve: eduscol('Selon la légende, la louve y aurait abrité et nourri Remus et Romulus'),
  peuplement: eduscol(
    'L’archéologie indique un peuplement du site de Rome dès le Xe siècle av. J.-C., avec une transformation importante au VIIIe siècle avant notre ère',
  ),
  muraille: eduscol('La découverte en 1988 par l’archéologue Andrea Carandini d’une muraille du VIIIe siècle'),
  virgile: eduscol('un motif littéraire avec l’Énéide de Virgile'),
  heritiers: eduscol('la volonté romaine d’apparaître comme les successeurs légitimes de la puissance grecque'),
  glorification: eduscol(
    'une glorification du devenir « futur » de la ville de Rome, et de l’extension de sa domination sur le monde méditerranéen',
  ),

  // La naissance du monothéisme juif
  monotheisme: eduscol('au monothéisme (l’idée qu’il n’existe qu’un seul dieu créateur du monde)'),
  monolatrie: eduscol(
    'la monolâtrie (le fait d’adorer un seul dieu en le préférant aux autres, sans nier l’existence d’autres dieux)',
  ),
  polytheisme: tlfi(
    'cnrtl-polytheisme',
    'Doctrine religieuse ou système philosophique qui admet l’existence de plusieurs dieux',
  ),
  passage: eduscol('au moment de l’exil à Babylone, c’est-à-dire de la déportation des élites du royaume de Juda'),
  prise: eduscol('la prise de Jérusalem par les Babyloniens en 587 avant J.-C. et le retour à Jérusalem en 538'),
  royaumes: eduscol('l’archéologie confirme l’existence des deux royaumes d’Israël et de Juda'),
  redaction: eduscol(
    'C’est pourtant au Ier millénaire avant J.-C. que les livres qui composent la Bible hébraïque ont été rédigés',
  ),
  torah: bnf(
    'bnf-judaisme-textes',
    'la Torah, dont la racine signifie « enseignement », désigne les cinq livres du Pentateuque',
  ),
  moise: bnf(
    'bnf-judaisme-textes',
    'La rédaction du Pentateuque, communément attribuée à Moïse par la tradition croyante, est aujourd’hui rajeunie de plusieurs siècles par les derniers travaux des historiens',
  ),
  qumran: bnf(
    'bnf-judaisme-textes',
    'le plus ancien manuscrit d’un livre de la Bible hébraïque, le livre de Samuel, découvert à Qumran en 1947, est daté du 3e siècle avant notre ère',
  ),
  tables: bnf('bnf-livres-tradition-juive', 'les « Dix Paroles » furent révélées à Moïse sur le mont Sinaï'),

  // La citoyenneté à Athènes et à Rome
  invention: viePublique('la qualité de citoyen est une invention des cités grecques'),
  droit: viePublique('le droit de participer à la gestion des affaires publiques'),
  minorite: viePublique('à Athènes, seuls 10% des habitants ont la qualité de citoyens'),
  exclus: viePublique('Les femmes, les esclaves et les "métèques", c’est-à-dire les étrangers, en sont exclus'),
  extension: viePublique(
    'Au fur et à mesure de l’extension de son empire, Rome donne à un nombre d’individus toujours plus important le droit de cité',
  ),
  caracalla: viePublique(
    'l’édit de Caracalla (212 ap. J-C), par lequel tous les habitants de l’Empire se voient reconnaître cette qualité',
  ),
  devoirs: eduscol(
    'La citoyenneté athénienne se définit par la participation des citoyens à la vie politique, à la défense de la cité et à la religion civique',
  ),
  panathenees: eduscol(
    'La fête des Panathénées est la principale manifestation du culte poliade rendu à la déesse protectrice',
  ),
  frise: eduscol('La frise éponyme, bas-relief qui décorait le temple du Parthénon sur l’Acropole'),
  pericles: eduscol('Ve siècle avant J.-C. : Athènes au temps de Périclès'),
  democratie: tlfi(
    'cnrtl-democratie',
    'Régime politique, système de gouvernement dans lequel le pouvoir est exercé par le peuple, par l’ensemble des citoyens',
  ),
  meteque: tlfi('cnrtl-meteque', 'Étranger domicilié dans la cité, protégé par la loi'),
  ostracisme: tlfi(
    'cnrtl-ostracisme',
    'Bannissement d’une durée de dix ans prononcé à la suite d’un jugement du peuple',
  ),
  consul: tlfi('cnrtl-consul', 'Magistrat élu par le peuple pour un an'),
  senat: tlfi(
    'cnrtl-senat',
    'Assemblée de patriciens de la Rome antique qui détenait l’essentiel du pouvoir politique sous la République',
  ),
  patricien: tlfi(
    'cnrtl-patricien',
    'Personne qui appartenait, de par sa naissance, à la classe sociale la plus élevée chez les citoyens romains',
  ),
  plebe: tlfi(
    'cnrtl-plebe',
    'Élément de la population romaine ne jouissant aux origines que de droits très restreints',
  ),
  tribun: tlfi(
    'cnrtl-tribun',
    'Représentant élu de la plèbe chargé de la défense des droits et des intérêts des plébéiens',
  ),
  comices: academie(
    'academie-comices',
    'Assemblées du peuple, pour élire des magistrats, ou pour traiter des affaires importantes de la république',
  ),
} satisfies Record<string, Preuve>;
