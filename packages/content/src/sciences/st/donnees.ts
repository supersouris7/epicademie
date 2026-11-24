/**
 * Faits des chapitres « La matière », « Mouvement et énergie » et « Le vivant » (CM1). Chaque fait cite son identifiant de source (registre `sources.ts`) et la
 * citation exacte du texte officiel (programme du cycle 3, Éduscol, domaine « Matière, mouvement, énergie,
 * information »). Les exemples du quotidien (un caillou, une pomme, la buée…) illustrent ces faits : ils ne sont pas des faits.
 */
export interface Fait {
  readonly id: string;
  /** Identifiant dans le registre des sources. */
  readonly source: string;
  /** Citation exacte. */
  readonly citation: string;
}

export const PROGRAMME = 'cycle3-2020';
export const SI = 'si-prefixes-bipm';

export const FAITS: readonly Fait[] = [
  {
    id: 'etats-trois',
    source: PROGRAMME,
    citation:
      'Différencier les états physiques solide (forme et volume propres), liquide (volume propre et absence de forme propre) et gazeux (ni forme propre ni volume propre).',
  },
  {
    id: 'etats-reversibles',
    source: PROGRAMME,
    citation: 'Observer des changements d’état physique et leur réversibilité.',
  },
  {
    id: 'etats-eau',
    source: PROGRAMME,
    citation: 'Identifier les différents états physiques de la matière dans la nature, en particulier ceux de l’eau.',
  },
  {
    id: 'masse-balance',
    source: PROGRAMME,
    citation:
      'Mesurer la masse d’un solide ou d’un liquide à l’aide d’une balance, en tarant la balance le cas échéant.',
  },
  {
    id: 'masse-unites',
    source: PROGRAMME,
    citation:
      'Effectuer des conversions d’unités de masse (en se limitant à des unités usuelles : tonne, quintal, kilogramme, gramme et milligramme).',
  },
  {
    id: 'volume-deplacement',
    source: PROGRAMME,
    citation: 'Mesurer le volume d’un liquide et mesurer celui d’un solide par déplacement de liquide.',
  },
  {
    id: 'si-kilo',
    source: SI,
    citation: 'kilo | k | 10³',
  },
  {
    id: 'si-milli',
    source: SI,
    citation: 'milli | m | 10⁻³',
  },
  {
    id: 'melanges-separer',
    source: PROGRAMME,
    citation:
      'Séparer les constituants d’un mélange de solides ou d’un mélange solide-liquide par tamisage, décantation, filtration.',
  },
  {
    id: 'melanges-dissoudre',
    source: PROGRAMME,
    citation:
      'Observer que certains solides peuvent se dissoudre dans l’eau et qu’il est possible de les récupérer par évaporation.',
  },
  {
    id: 'melanges-sel',
    source: PROGRAMME,
    citation: 'La séparation par évaporation trouve une application immédiate dans la récolte du sel',
  },
  {
    id: 'melanges-masse',
    source: PROGRAMME,
    citation:
      'Mettre en évidence expérimentalement que la masse totale se conserve lors du mélange d’un solide dans un liquide.',
  },
  {
    id: 'energie-ressources',
    source: PROGRAMME,
    citation:
      'Rechercher des informations relatives à différentes ressources en énergie (Soleil, eau, vent, pétrole, bois, charbon, dihydrogène, combustible nucléaire (uranium), etc.)',
  },
  {
    id: 'energie-soleil',
    source: PROGRAMME,
    citation:
      'L’importance de l’énergie reçue du Soleil pour la vie sur Terre et pour les activités humaines est mentionnée.',
  },
  {
    id: 'energie-soleil-lumiere',
    source: PROGRAMME,
    citation: 'la Terre reçoit de l’énergie du Soleil par la lumière qu’il émet',
  },
  {
    id: 'energie-usages',
    source: PROGRAMME,
    citation: '(chauffage, moyens de transport, production d’électricité, etc.)',
  },
  {
    id: 'energie-formes-cm',
    source: PROGRAMME,
    citation:
      'Identifier différentes formes d’énergie : énergie de pesanteur (dépendant de l’altitude sur Terre), énergie cinétique (liée au mouvement) et énergie électrique, par exemple dans le contexte de la production d’électricité par une centrale hydro-électrique ou une éolienne.',
  },
  {
    id: 'energie-chute',
    source: PROGRAMME,
    citation: 'au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique',
  },
  {
    id: 'energie-moulin',
    source: PROGRAMME,
    citation:
      'conversion d’énergie potentielle en énergie cinétique dans un dispositif mécanique (moulin à eau par exemple)',
  },
  {
    id: 'energie-lampe',
    source: PROGRAMME,
    citation:
      'transfert d’énergie électrique vers une lampe ou un autre appareil électrique alimentés par une pile électrique',
  },
  {
    id: 'energie-experience',
    source: PROGRAMME,
    citation: 'Réaliser expérimentalement un dispositif de conversion d’énergie.',
  },
  {
    id: 'mouvement-point-de-vue',
    source: PROGRAMME,
    citation:
      'L’étude du mouvement d’un objet nécessite toujours la mention du point de vue selon lequel ce mouvement est décrit et caractérisé.',
  },
  {
    id: 'mouvement-train',
    source: PROGRAMME,
    citation: 'le train se déplace en ligne droite par rapport à une personne sur le quai de la gare',
  },
  {
    id: 'mouvement-toupie',
    source: PROGRAMME,
    citation: 'un point coloré sur une toupie ou un disque décrit un cercle par rapport à l’axe de rotation',
  },
  {
    id: 'mouvement-identifier',
    source: PROGRAMME,
    citation: 'Observer et identifier le mouvement rectiligne ou circulaire d’un objet, en précisant le point de vue.',
  },
  {
    id: 'mouvement-distance',
    source: PROGRAMME,
    citation: 'Mesurer une distance lors du déplacement d’un objet.',
  },
  {
    id: 'mouvement-duree',
    source: PROGRAMME,
    citation: 'Mesurer une durée, comme intervalle entre deux instants, lors du déplacement d’un objet.',
  },
  {
    id: 'mouvement-conversions',
    source: PROGRAMME,
    citation: 'Effectuer des conversions d’unités de distance et de temps.',
  },
  // ——— Chapitre « Le vivant » : programme du cycle 3 et définitions du Trésor de la langue française (CNRTL). ———
  {
    id: 'vivant-classer',
    source: PROGRAMME,
    citation:
      "Réaliser une classification en groupes emboités pour mettre en évidence des liens de parenté à partir d'un petit nombre d’espèces possédant des attributs identifiés.",
  },
  {
    id: 'vivant-matiere',
    source: PROGRAMME,
    citation:
      'Exploiter des données mettant en évidence le besoin de matière pour la croissance et le développement des êtres vivants.',
  },
  {
    id: 'vivant-besoins-variation',
    source: PROGRAMME,
    citation:
      'Exploiter des données pour expliquer la variation des besoins alimentaires au cours de la croissance et selon l’activité physique.',
  },
  {
    id: 'vivant-animaux-nourriture',
    source: PROGRAMME,
    citation:
      'Relier la production de matière par les animaux à leur consommation de nourriture provenant d’autres êtres vivants.',
  },
  {
    id: 'vivant-vegetaux-besoins',
    source: PROGRAMME,
    citation: 'Expérimenter pour identifier quelques besoins des végétaux.',
  },
  {
    id: 'vivant-vegetaux-liste',
    source: PROGRAMME,
    citation:
      'Concevoir et mettre en œuvre des expériences pour relier la production de matière par les végétaux et leurs besoins (lumière, eau, sels minéraux, dioxyde de carbone).',
  },
  {
    id: 'vivant-vegetaux-base',
    source: PROGRAMME,
    citation: 'Repérer la place singulière des végétaux positionnés à la base des réseaux alimentaires.',
  },
  {
    id: 'vivant-chaines',
    source: PROGRAMME,
    citation: 'Représenter les liens alimentaires entre les êtres vivants par des chaînes formant un réseau.',
  },
  {
    id: 'vivant-cycle',
    source: PROGRAMME,
    citation:
      'Exploiter des observations issues de cultures ou d’élevages pour identifier les différentes étapes d’un cycle de vie (naissance, croissance, reproduction, vieillissement, mort) et les formes associées (graine-plantule-plante fleurie, œuf-embryon-larve ou jeune-adulte).',
  },
  {
    id: 'vertebre-classes',
    source: 'cnrtl-vertebre',
    citation:
      'Embranchement du règne animal comprenant tous les organismes constitués de vertèbres osseuses ou cartilagineuses, répartis en cinq classes: Batraciens, Mammifères, Oiseaux, Poissons, Reptiles.',
  },
  {
    id: 'vertebre-def',
    source: 'cnrtl-vertebre',
    citation: 'Qui a des vertèbres, un squelette.',
  },
  {
    id: 'invertebre-def',
    source: 'cnrtl-invertebre',
    citation: "Qui n'a ni vertèbres ni squelette intérieur.",
  },
  {
    id: 'mammifere-def',
    source: 'cnrtl-mammifere',
    citation:
      "Classe d'animaux vertébrés, vivipares, qui sont caractérisés essentiellement par la présence de mamelles, d'un cœur à quatre cavités, d'un système nerveux et encéphalique développé, par une température interne constante et une respiration de type pulmonaire.",
  },
  {
    id: 'oiseau-def',
    source: 'cnrtl-oiseau',
    citation:
      "Animal ovipare appartenant à la classe des vertébrés tétrapodes, à sang chaud, au corps couvert de plumes, dont la tête est munie d'un bec corné dépourvu de dents, dont les membres postérieurs sont des pattes et les membres antérieurs des ailes, ce qui le rend le plus souvent apte au vol.",
  },
  {
    id: 'poisson-def',
    source: 'cnrtl-poisson',
    citation:
      "Animal aquatique vertébré à peau non cornée, à température variable et à respiration généralement branchiale, pourvu de nageoires et possédant généralement une vessie natatoire, présentant souvent un corps fusiforme et couvert d'écailles, qui se reproduit selon le mode ovipare ou vivipare.",
  },
  {
    id: 'batracien-def',
    source: 'cnrtl-batracien',
    citation:
      'Animal à sang froid, à peau nue et humide, à respiration branchiale chez les larves (les têtards), presque toujours pulmo-cutanée chez les adultes, et dont le type est la grenouille.',
  },
  {
    id: 'insecte-def',
    source: 'cnrtl-insecte',
    citation:
      "Petit animal invertébré arthropode caractérisé par un corps formé de trois parties bien distinctes : la tête, le thorax, muni de trois paires de pattes, et l'abdomen.",
  },
  {
    id: 'arachnide-def',
    source: 'cnrtl-arachnide',
    citation:
      "Classe d'arthropodes terrestres à huit pattes, sans ailes ni antennes, comme les araignées, les faucheurs, les scorpions et dont le corps comprend en général deux segments : l'abdomen et le céphalothorax qui porte l'appareil buccal.",
  },
  {
    id: 'mollusque-def',
    source: 'cnrtl-mollusque',
    citation:
      "Embranchement d'animaux invertébrés, vivant en eau douce ou salée ou sur terre, dont le corps mou est souvent recouvert d'une coquille calcaire et comprend fondamentalement une région céphalique que prolonge la masse viscérale supportée par le pied, organe ventral musculeux.",
  },
  {
    id: 'espece-chat',
    source: 'cnrtl-chat',
    citation:
      'Genre de mammifères carnivores de la famille des Félidés comprenant le lion, le tigre, la panthère, le lynx, etc. Nom sc. felis.',
  },
  {
    id: 'espece-chauve-souris',
    source: 'cnrtl-chauve-souris',
    citation:
      'Petit mammifère de la famille des Chéiroptères ressemblant à une souris et volant grâce à des ailes membraneuses.',
  },
  {
    id: 'espece-baleine',
    source: 'cnrtl-baleine',
    citation:
      "Mammifère marin de très grande taille, de l'ordre des cétacés, qui présente à la machoire supérieure de grandes lames cornées appelées fanons :",
  },
  {
    id: 'espece-pigeon',
    source: 'cnrtl-pigeon',
    citation: 'Oiseau domestique granivore de la famille des Colombidés',
  },
  {
    id: 'espece-manchot',
    source: 'cnrtl-manchot',
    citation:
      "Oiseau palmipède marin d'assez grande taille, souvent confondu avec le pingouin, auquel les membres antérieurs impropres au vol servent de nageoire, qui vit en colonies nombreuses dans les régions australes, notamment dans l'Antarctique, et qui se nourrit de poissons.",
  },
  {
    id: 'espece-truite',
    source: 'cnrtl-truite',
    citation:
      'Poisson physostome, de la famille des Salmonidés, comprenant plusieurs espèces, au corps fusiforme couvert de petites écailles argentées',
  },
  {
    id: 'espece-grenouille',
    source: 'cnrtl-grenouille',
    citation: 'appartenant à la classe des Batraciens.',
  },
  {
    id: 'espece-mouche',
    source: 'cnrtl-mouche',
    citation: 'Insecte volant.',
  },
  {
    id: 'espece-coccinelle',
    source: 'cnrtl-coccinelle',
    citation:
      'Insecte coléoptère cryptotétrame, de la famille des Coccinellidés au corps hémisphérique rouge avec des points noirs.',
  },
  {
    id: 'espece-papillon',
    source: 'cnrtl-papillon',
    citation: "Insecte lépidoptère pourvu d'ailes colorées à écailles fines et poudreuses.",
  },
  {
    id: 'espece-abeille',
    source: 'cnrtl-abeille',
    citation: 'Insecte hyménoptère vivant en colonie et produisant la cire et le miel.',
  },
  {
    id: 'espece-escargot',
    source: 'cnrtl-escargot',
    citation:
      'Mollusque gastéropode terrestre, hermaphrodite, à coquille calcaire spiralée, qui est herbivore et dont certaines espèces sont comestibles.',
  },
  {
    id: 'espece-araignee',
    source: 'cnrtl-araignee',
    citation:
      "Animal articulé de la classe des arachnides et de l'ordre des aranéides et qui tisse une toile où se prennent les insectes dont il se nourrit.",
  },
  {
    id: 'racine-def',
    source: 'cnrtl-racine',
    citation:
      "Partie inférieure, le plus souvent souterraine, d'une plante vasculaire, qui permet la fixation du végétal dans le sol tout en assurant son alimentation en eau et en sels minéraux.",
  },
  {
    id: 'herbivore-def',
    source: 'cnrtl-herbivore',
    citation: "Qui se nourrit d'herbes ou d'autres substances végétales.",
  },
  {
    id: 'carnivore-def',
    source: 'cnrtl-carnivore',
    citation: "En parlant d'un animal. Qui se nourrit principalement de la chair d'autres animaux.",
  },
  {
    id: 'omnivore-def',
    source: 'cnrtl-omnivore',
    citation: "Qui se nourrit indifféremment d'aliments d'origine animale ou végétale.",
  },
  {
    id: 'germination-def',
    source: 'cnrtl-germination',
    citation:
      'Ensemble des phénomènes au terme desquels une graine développe son embryon et donne naissance à une nouvelle plante de la même espèce que la sienne propre.',
  },
  {
    id: 'embryon-graine',
    source: 'cnrtl-embryon',
    citation: 'Jeune plante renfermée dans la graine.',
  },
  {
    id: 'embryon-oeuf',
    source: 'cnrtl-embryon',
    citation:
      "L'œuf à partir du moment où commence sa segmentation jusqu'au moment où il se libère des enveloppes vitellines.",
  },
  {
    id: 'plantule-def',
    source: 'cnrtl-plantule',
    citation:
      'Jeune plante issue de la germination de la graine, qui se développe en utilisant les réserves des cotylédons.',
  },
  {
    id: 'fruit-def',
    source: 'cnrtl-fruit',
    citation: 'Production du végétal qui succède à la fleur.',
  },
  {
    id: 'larve-def',
    source: 'cnrtl-larve',
    citation:
      "Forme intermédiaire qu'affectent certains animaux, notamment les insectes, au premier stade de leur développement, avant le stade adulte.",
  },
  {
    id: 'tetard-def',
    source: 'cnrtl-tetard',
    citation:
      'Larve des Batraciens, à grosse tête prolongée directement par le corps, à respiration branchiale et à vie exclusivement aquatique.',
  },
  {
    id: 'chenille-def',
    source: 'cnrtl-chenille',
    citation: "Larve de papillon, au corps allongé, formé d'anneaux et généralement velu",
  },
  {
    id: 'chrysalide-def',
    source: 'cnrtl-chrysalide',
    citation: "Nymphe des lépidoptères dont l'état est intermédiaire entre celui de chenille et celui de papillon",
  },
];
