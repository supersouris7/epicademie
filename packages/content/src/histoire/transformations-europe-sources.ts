/**
 * Preuves du chapitre « Transformations de l'Europe et ouverture sur le monde aux XVIe et XVIIe siècles » (5e) :
 * chacune cite un identifiant du registre (`sources.ts`) et la citation exacte du texte. Sources : la ressource
 * d'accompagnement Éduscol du thème (mars 2016) et des articles de BnF Essentiels.
 */
import type { Preuve } from './kit.ts';

const eduscol = (quote: string) => ({
  source: 'eduscol-5e-transformations-europe',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});
const bnf = (source: string, quote: string) => ({ source, who: 'La Bibliothèque nationale de France', quote });

export const PREUVES = {
  // Grandes découvertes et premiers empires
  iberiques: eduscol('Les Grandes Découvertes sont d’abord le fait des Portugais et des Espagnols.'),
  routes: eduscol(
    'Les voyages d’exploration sont le plus souvent motivés par le désir d’ouvrir de nouvelles routes maritimes vers les Indes, l’empire Ottoman contrôlant les routes terrestres.',
  ),
  henri: eduscol(
    'Sous l’impulsion du prince portugais Henri le Navigateur (mort en 1460), la côte ouest de l’Afrique a été explorée.',
  ),
  colomb: eduscol(
    'Isabelle de Castille et Ferdinand d’Aragon soutiennent le projet de Christophe Colomb qui cherche une nouvelle route pour les Indes orientales.',
  ),
  amerique: eduscol('1492 : la découverte de l’Amérique.'),
  constantinople: eduscol('1453 : la prise de Constantinople.'),
  gama: bnf(
    'bnf-vasco-de-gama',
    'la flottille de Vasco de Gama mit à la voile vers le nord-est et toucha la côte indienne, deux lieues au nord de Calicut, le 20 mai 1498',
  ),
  tordesillas: eduscol(
    'En 1494, le traité de Tordesillas partage entre l’Espagne et le Portugal toutes les terres découvertes et à découvrir',
  ),
  magellan: eduscol('Les Grandes Découvertes s’achèvent avec le retour en Europe d’un des navires de Magellan (1522)'),
  conquistadors: bnf(
    'bnf-conquista',
    'L’appât de l’or donna des ailes aux conquistadors. Tout a été dit sur leur cruauté, leur cupidité et leur barbarie.',
  ),
  traite: bnf('bnf-conquista', 'Le cycle infernal de la traite des esclaves noirs commença dès la conquête.'),
  metaux: bnf(
    'bnf-conquista',
    'Entre 1503 et 1660, 300 tonnes d’or et 25 000 tonnes d’argent quittèrent l’Amérique pour l’Espagne.',
  ),
  charlesQuint: eduscol('Charles Quint est le souverain le plus puissant de la chrétienté.'),
  saintEmpire: eduscol('en 1519 il succède à son grand-père à la tête du Saint-Empire romain germanique'),
  soliman: eduscol('Ce dernier est à son apogée sous le règne de Soliman le Magnifique'),
  calife: eduscol(
    'Soliman unifie le monde musulman et porte, comme son prédécesseur Sélim Ier depuis 1516, le titre de calife',
  ),
  lepante: eduscol(
    'c’est la défaite navale de Lépante (1571) que l’on retient souvent comme marquant le début d’un lent déclin',
  ),

  // Humanisme, réformes et conflits religieux
  humanisme: bnf(
    'bnf-humanisme',
    'Son principe directeur était l’aspiration à un renouveau de l’Antiquité, à travers la quête, l’étude et l’imitation des textes et des vestiges conservés.',
  ),
  italie: bnf('bnf-humanisme', 'Né dans les milieux savants italiens du 14e siècle'),
  manuscrits: bnf(
    'bnf-humanisme',
    'les humanistes se sont lancés à la recherche tous azimuts de manuscrits, pour reconstituer les œuvres du passé dans leurs versions primitives et intégrales',
  ),
  homme: eduscol('le centrage sur l’homme opéré par la Renaissance et l’humanisme'),
  bible: bnf(
    'bnf-naissance-imprimerie',
    'Le tout premier livre qu’imprime Gutenberg est une Bible monumentale, en plein milieu du 15e siècle.',
  ),
  caracteres: bnf('bnf-naissance-imprimerie', 'la maîtrise de caractères mobiles en plomb'),
  diffusion: eduscol('L’imprimerie permet la diffusion des idées nouvelles.'),
  erasme: eduscol('Erasme, par exemple, voudrait une réforme de l’Église sans rupture.'),
  theses: eduscol('1517 : Luther publie ses 95 thèses.'),
  indulgences: bnf(
    'bnf-papaute-reforme',
    'Luther condamne la pratique de l’Église qui permet alors à certains d’acheter le salut de leur âme grâce à des “indulgences”.',
  ),
  calvin: bnf('bnf-papaute-reforme', 'Jean Calvin à Genève'),
  eglises: eduscol('la constitution de nouvelles Églises (luthériennes, réformées, anglicane)'),
  trente: eduscol(
    'le catholicisme, avec le Concile de Trente (1545-1563), se réforme en gardant le lien avec la tradition et la papauté',
  ),
  unite: eduscol('La rupture de l’unité religieuse européenne ruine le rêve de Charles Quint'),
  guerres: eduscol('De 1562 à 1598, le pouvoir royal est déstabilisé par les guerres de religion'),
  nantes: eduscol('c’est le pouvoir royal qui impose l’Édit de Nantes'),
  repereNantes: eduscol('1598 : l’Édit de Nantes.'),

  // Du Prince de la Renaissance au roi absolu
  sacre: bnf(
    'bnf-francois-ier-ottomans',
    'Reims, 25 janvier 1515 : les mains sur la Bible, le tout nouveau roi de France jure au nom du Christ de maintenir la paix au sein du peuple chrétien',
  ),
  marignan: bnf(
    'bnf-marignan-pavie',
    'cette bataille de Pavie qui, en 1525, valut au roi plus d’un an de captivité en Espagne',
  ),
  victoire: bnf('bnf-marignan-pavie', '« Marignan, 1515 » est cependant une victoire'),
  villers: bnf(
    'bnf-francois-ier-arts',
    'En 1539, par l’ordonnance de Villers-Cotterêts, François Ier décrète l’usage obligatoire du français pour certains textes à caractère juridique.',
  ),
  vinci: eduscol('Léonard de Vinci a passé ses dernières années auprès de François Ier'),
  alliance: eduscol('François Ier s’allie contre son rival à Soliman'),
  prince: eduscol('François Ier, roi humaniste parmi les nobles.'),
  consensus: eduscol('Henri IV, roi de consensus contre les factions.'),
  maitre: eduscol('Louis XIV, roi guerrier maître de la noblesse.'),
  assassinat: eduscol('l’assassinat d’Henri IV, la révocation de l’Édit de Nantes en 1685'),
  revocation: eduscol('La révocation de l’Édit de Nantes par Louis XIV (1685)'),
  ordre: eduscol('l’État est désormais clairement seul à garantir l’ordre'),
  noblesse: eduscol('un enjeu essentiel du pouvoir royal sera la mise sous tutelle de la noblesse'),
  fronde: eduscol('malgré la réaction de la Fronde (1648-1653)'),
  regne: eduscol('1661-1715 : le règne de Louis XIV.'),
  fetes: bnf(
    'bnf-fetes-versailles',
    'pour Louis XIV, la fête de cour est un acte à la fois esthétique et politique, un instrument au service du pouvoir qui lui permet d’exercer un contrôle sur les courtisans',
  ),
  pratique: eduscol(
    'Confondre idéologie absolutiste et la réalité de la pratique du pouvoir « absolu » sous Louis XIV.',
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
