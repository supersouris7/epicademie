/**
 * Faits des chapitres « La matière », « Mouvement et énergie » et « Le vivant » (CM1), puis « Matériaux et mélanges » et « Mouvement et énergie » « Le corps humain » et « Écosystèmes » (CM2), « Signal et information » et « La décomposition » (6e). Chaque fait cite son identifiant de source (registre `sources.ts`) et la
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
    id: 'etioler-def',
    source: 'cnrtl-etioler',
    citation: "Se décolorer, devenir grêle et moins amer en poussant à l'abri de l'air, de la lumière",
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
  {
    id: 'materiaux-origine',
    source: PROGRAMME,
    citation:
      'Distinguer les matériaux fabriqués ou transformés par l’être humain des matériaux directement disponibles dans la nature.',
  },
  {
    id: 'materiaux-lumiere',
    source: PROGRAMME,
    citation: 'Observer et classer des objets selon qu’ils sont transparents, opaques à la lumière ou translucides.',
  },
  {
    id: 'materiaux-tri',
    source: PROGRAMME,
    citation: 'Utiliser les propriétés physiques des matériaux pour les classer, notamment à des fins de tri.',
  },
  {
    id: 'separer-techniques',
    source: PROGRAMME,
    citation:
      'Séparer les constituants d’un mélange de solides ou d’un mélange solide-liquide par tamisage, décantation, filtration.',
  },
  {
    id: 'dissolution-evaporation',
    source: PROGRAMME,
    citation:
      'Observer que certains solides peuvent se dissoudre dans l’eau et qu’il est possible de les récupérer par évaporation.',
  },
  {
    id: 'dissolution-masse',
    source: PROGRAMME,
    citation:
      'Mettre en évidence expérimentalement que la masse totale se conserve lors du mélange d’un solide dans un liquide.',
  },
  {
    id: 'dissolution-sel',
    source: PROGRAMME,
    citation: 'La séparation par évaporation trouve une application immédiate dans la récolte du sel',
  },
  {
    id: 'signal-attendu',
    source: PROGRAMME,
    citation:
      'Identifier des signaux de natures différentes et citer des applications dans lesquelles un signal permet de transmettre une information.',
  },
  {
    id: 'signal-6e-identifier',
    source: PROGRAMME,
    citation:
      'Identifier différents signaux pour transmettre de l’information (signal sonore, lumineux, électrique, etc.).',
  },
  {
    id: 'signal-6e-applications',
    source: PROGRAMME,
    citation: 'Citer quelques applications des signaux pour transmettre de l’information.',
  },
  {
    id: 'signal-perimetre',
    source: PROGRAMME,
    citation:
      'Au cycle 3, le travail concerne les signaux lumineux et électriques. Les autres types de signaux peuvent être mentionnés en lien avec la transmission d’informations.',
  },
  {
    id: 'signal-applications',
    source: PROGRAMME,
    citation:
      'L’utilisation des signaux lumineux, électriques ou sonores pour transmettre de l’information est illustrée grâce à des applications concrètes (feux de signalisation, voyant de charge d’un appareil, alarme sonore, câbles de communication sous-marins, etc.).',
  },
  {
    id: 'bois-def',
    source: 'cnrtl-bois',
    citation: 'Matière (racines, tronc, branches) qui constitue l’arbre (à l’exception du feuillage)',
  },
  {
    id: 'sable-def',
    source: 'cnrtl-sable',
    citation:
      'Roche sédimentaire meuble, constituée de petits fragments provenant de la désagrégation de roches de nature diverse',
  },
  {
    id: 'argile-def',
    source: 'cnrtl-argile',
    citation:
      'Terre glaise, composée de silicate d’alumine hydraté résultant surtout de la décomposition des feldspaths',
  },
  {
    id: 'coton-def',
    source: 'cnrtl-coton',
    citation: 'Duvet végétal soyeux, entourant les graines du cotonnier et utilisé comme matière textile.',
  },
  {
    id: 'laine-def',
    source: 'cnrtl-laine',
    citation:
      'Matière constituée par les poils doux et épais, plus ou moins longs, poussant sur la peau de certains mammifères',
  },
  {
    id: 'pierre-def',
    source: 'cnrtl-pierre',
    citation:
      'Matière minérale solide plus ou moins dure qu’on rencontre en masses compactes à la surface et à l’intérieur du sol.',
  },
  {
    id: 'verre-def',
    source: 'cnrtl-verre',
    citation:
      'Substance solide, transparente et cassante, obtenue par la fusion d’un sable siliceux avec du carbonate de sodium ou de potassium.',
  },
  {
    id: 'brique-def',
    source: 'cnrtl-brique',
    citation: 'fabriquée à partir d’une pâte d’argile pétrie, moulée, séchée puis cuite au four',
  },
  {
    id: 'acier-def',
    source: 'cnrtl-acier',
    citation: 'Métal plus dur et plus résistant que le fer, obtenu par un alliage de fer et de carbone',
  },
  {
    id: 'papier-def',
    source: 'cnrtl-papier',
    citation:
      'Matière à base de cellulose, faite de fibres végétales naturelles ou transformées, réduites en une pâte homogène que l’on étend et sèche pour former une feuille mince.',
  },
  {
    id: 'nylon-def',
    source: 'cnrtl-nylon',
    citation: 'Matière synthétique appartenant à la famille des polyamides',
  },
  {
    id: 'transparent-def',
    source: 'cnrtl-transparent',
    citation: 'Qui laisse passer la lumière, qui ne fait pas écran à la vision.',
  },
  {
    id: 'opaque-def',
    source: 'cnrtl-opaque',
    citation: 'Qui s’oppose au passage de la lumière',
  },
  {
    id: 'translucide-def',
    source: 'cnrtl-translucide',
    citation:
      'Qui laisse passer les rayons lumineux mais ne permet pas de distinguer nettement les contours ou les couleurs des objets.',
  },
  {
    id: 'translucide-exemples',
    source: 'cnrtl-translucide',
    citation: 'Matière, papier huilé, pierre, porcelaine, verre dépoli translucide',
  },
  {
    id: 'tamis-def',
    source: 'cnrtl-tamis',
    citation: 'sert à séparer des particules solides de tailles différentes ou à filtrer des liquides',
  },
  {
    id: 'filtre-def',
    source: 'cnrtl-filtre',
    citation:
      'Corps poreux ou dispositif à travers lequel on fait passer un fluide pour retenir des corps et des substances solides qu’il contient.',
  },
  {
    id: 'sel-def',
    source: 'cnrtl-sel',
    citation: 'formée de cristaux blanchâtres, friables et solubles dans l’eau',
  },
  {
    id: 'soluble-def',
    source: 'cnrtl-soluble',
    citation: 'Qui peut se dissoudre dans un solvant approprié, un liquide ou un corps liquéfié.',
  },
  {
    id: 'signal-def',
    source: 'cnrtl-signal',
    citation:
      'Signe conventionnel ou système de signes conventionnels destiné à informer ou à prévenir quelqu’un de quelque chose.',
  },
  {
    id: 'signal-natures',
    source: 'cnrtl-signal',
    citation:
      'Phénomène physique (tension, courant, champ électromagnétique, onde sonore ou lumineuse) transmettant une information.',
  },
  {
    id: 'sirene-def',
    source: 'cnrtl-sirene',
    citation: 'Appareil servant à produire un signal sonore très puissant',
  },
  {
    id: 'voyant-def',
    source: 'cnrtl-voyant',
    citation:
      'Lampe s’allumant pour attirer l’attention sur un danger, un dysfonctionnement ou pour indiquer qu’un appareil fonctionne.',
  },
  // ——— Chapitre « Mouvement et énergie » (CM2) : programme, CNRTL, Académie française, ministère. ———
  {
    id: 'mouvement-soleil',
    source: PROGRAMME,
    citation: 'le Soleil décrit une courbe dans le ciel du point de vue de la cour de récréation',
  },
  {
    id: 'trajectoire-def',
    source: 'cnrtl-trajectoire',
    citation: 'Courbe décrite par le centre de gravité d’un mobile.',
  },
  {
    id: 'vitesse-def',
    source: 'cnrtl-vitesse',
    citation: 'espace parcouru en fonction du temps mis à le parcourir',
  },
  {
    id: 'vitesse-activites',
    source: PROGRAMME,
    citation:
      'des activités de mesure de distances, de durées (la durée est définie comme l’intervalle entre deux instants), et de vitesse',
  },
  {
    id: 'vitesse-calcul-6e',
    source: PROGRAMME,
    citation:
      'En classe de sixième, seul le calcul de la valeur de la vitesse à partir de la distance parcourue et de la durée de déplacement dans le cas d’un mouvement uniforme est exigible.',
  },
  {
    id: 'renouvelable-sensibilisation',
    source: PROGRAMME,
    citation:
      'Les élèves sont sensibilisés au caractère renouvelable ou non, à l’échelle temporelle de la vie humaine, des ressources en énergie.',
  },
  {
    id: 'enr-alimentation',
    source: 'ecologie-energies-renouvelables',
    citation:
      'Les énergies renouvelables (EnR) sont alimentées par le soleil, le vent, la chaleur de la terre, les chutes d’eau, les marées…',
  },
  {
    id: 'enr-inepuisables',
    source: 'ecologie-energies-renouvelables',
    citation: 'Ces sources d’énergie, considérées comme inépuisables à l’échelle du temps humain',
  },
  {
    id: 'enr-fossiles',
    source: 'ecologie-energies-renouvelables',
    citation: 'Elles se distinguent des énergies fossiles, polluantes et dont les stocks diminuent.',
  },
  {
    id: 'enr-bois',
    source: 'ecologie-biomasse',
    citation: 'Le chauffage individuel au bois représente la première source d’énergie renouvelable en France',
  },
  {
    id: 'enr-bois-condition',
    source: 'ecologie-energies-renouvelables',
    citation:
      'Il s’agit d’une source d’énergie considérée comme renouvelable, dans la mesure où la forêt est gérée de façon durable.',
  },
  {
    id: 'enr-geothermie',
    source: 'ecologie-energies-renouvelables',
    citation: 'exploitent toutes la chaleur de la croûte terrestre',
  },
  { id: 'vent-def', source: 'cnrtl-vent', citation: 'Déplacement d’air plus ou moins important' },
  {
    id: 'maree-def',
    source: 'cnrtl-maree',
    citation: 'Mouvement alternatif, périodique et journalier du niveau de la mer',
  },
  {
    id: 'fossile-combustibles',
    source: 'academie-fossile',
    citation:
      'Combustibles fossiles, produits par la transformation de matières organiques enfouies dans la terre. La houille, le pétrole sont des combustibles fossiles.',
  },
  {
    id: 'charbon-fossile',
    source: 'academie-charbon',
    citation:
      'Le charbon est une roche fossile résultant de la carbonisation de débris végétaux au cours des âges géologiques.',
  },
  {
    id: 'petrole-def',
    source: 'academie-petrole',
    citation:
      'Huile minérale d’origine naturelle, issue de l’accumulation et de la transformation de matière organique',
  },
  {
    id: 'conversion-attendu',
    source: PROGRAMME,
    citation: 'Identifier les formes d’énergie mises en jeu dans un dispositif de conversion d’énergie.',
  },
  // ——— Chapitre « Le corps humain » (CM2) : programme, CNRTL, Académie française, Santé publique France, Bulletin officiel. ———
  {
    id: 'corps-role-aliments',
    source: PROGRAMME,
    citation: 'Expliquer le rôle des aliments pour le fonctionnement de l’organisme.',
  },
  {
    id: 'corps-trajet',
    source: PROGRAMME,
    citation:
      'Identifier et localiser la transformation des aliments dans l’appareil digestif (mastication par les dents, changements de texture lors du trajet).',
  },
  {
    id: 'corps-circulation',
    source: PROGRAMME,
    citation: 'Identifier le rôle de la circulation sanguine dans l’approvisionnement des organes.',
  },
  {
    id: 'corps-comportements',
    source: PROGRAMME,
    citation:
      'Citer quelques comportements alimentaires et règles d’hygiène favorables à la santé (équilibre alimentaire, qualité sanitaire des aliments, brossage des dents, etc.).',
  },
  {
    id: 'digestion-def',
    source: 'cnrtl-digestion',
    citation:
      "Ensemble des transformations, d'ordre mécanique ou chimique, subies par les aliments dans le tube digestif avant de parvenir à l'état sous lequel ils sont assimilables par les cellules",
  },
  {
    id: 'mastication-def',
    source: 'cnrtl-mastication',
    citation:
      'Action de mastiquer, de broyer les aliments avec les dents de manière à en favoriser la déglutition et la digestion.',
  },
  { id: 'dent-role', source: 'cnrtl-dent', citation: 'destiné à saisir, retenir et broyer les aliments.' },
  {
    id: 'salive-def',
    source: 'cnrtl-salive',
    citation:
      'Liquide physiologique incolore, alcalin, plus ou moins visqueux, qui humecte la bouche et qui sert principalement à la digestion buccale',
  },
  {
    id: 'bol-def',
    source: 'cnrtl-bol',
    citation: "Quantité d'aliments mastiqués et imprégnés de salive déglutis en une seule fois",
  },
  {
    id: 'chyme-def',
    source: 'cnrtl-chyme',
    citation:
      'Bouillie semi-liquide, de couleur grisâtre ou brunâtre, provenant de la digestion buccale et gastrique des aliments.',
  },
  {
    id: 'oesophage-def',
    source: 'cnrtl-oesophage',
    citation:
      "Segment du tube digestif reliant le pharynx à l'estomac, et dont la fonction est de conduire les aliments dans l'estomac après la déglutition.",
  },
  {
    id: 'estomac-def',
    source: 'cnrtl-estomac',
    citation: 'Organe en forme de poche dans lequel les aliments sont brassés, transformés en chyme',
  },
  { id: 'intestin-def', source: 'cnrtl-intestin', citation: "Partie du tube digestif qui va de l'estomac à l'anus." },
  {
    id: 'intestin-grele',
    source: 'cnrtl-intestin',
    citation: 'Segment du tube digestif allant du pylore au gros intestin',
  },
  { id: 'gros-intestin', source: 'cnrtl-intestin', citation: 'Dernière partie du tube digestif' },
  {
    id: 'chyle-sang',
    source: 'cnrtl-chyle',
    citation:
      "Produit de la digestion d'apparence laiteuse qui est absorbé par la paroi de l'intestin grêle pour être conduit dans la circulation sanguine",
  },
  {
    id: 'aliment-def',
    source: 'cnrtl-aliment',
    citation:
      'Toute substance susceptible de fournir aux êtres vivants les éléments nécessaires à leur croissance ou à leur conservation',
  },
  {
    id: 'aliment-jeunes',
    source: 'cnrtl-aliment',
    citation:
      "chez les êtres jeunes, ils doivent en outre servir à l'édification, au développement de chaque partie du corps",
  },
  {
    id: 'croissance-def',
    source: 'cnrtl-croissance',
    citation: 'Action de grandir (surtout en hauteur, largeur ou en nombre)',
  },
  {
    id: 'activite-def',
    source: 'spf-activite-physique-2017',
    citation:
      'L’activité physique correspond à tous les mouvements de notre corps produits par la contraction des muscles et qui entraînent une dépense en énergie supérieure à celle du repos.',
  },
  {
    id: 'activite-exemples',
    source: 'spf-activite-physique-2017',
    citation:
      'se déplacer à pied ou à vélo, porter une charge, monter ou descendre les escaliers, être actif à son domicile sont des pratiques d’activité physique.',
  },
  {
    id: 'activite-enfants',
    source: 'spf-activite-physique-2017',
    citation: 'pratiquer au moins une heure par jour d’activité physique d’intensité modérée et élevée.',
  },
  {
    id: 'ecrans-enfants',
    source: 'spf-activite-physique-2017',
    citation: 'limiter le temps de loisir passé devant un écran à deux heures par jour.',
  },
  {
    id: 'besoins-variables',
    source: 'bo-restauration-2001',
    citation:
      "Les besoins énergétiques sont variables d'un sujet à l'autre, en particulier chez l'enfant. Ils sont fonction de la masse corporelle, du degré d'activité, mais aussi de facteurs innés.",
  },
  {
    id: 'besoins-croissance',
    source: 'bo-restauration-2001',
    citation:
      'le repas de midi est une source privilégiée des nutriments essentiels à leur croissance et à leur développement psychomoteur',
  },
  {
    id: 'besoins-ages',
    source: 'bo-restauration-2001',
    citation:
      "pour les élèves de maternelle : 8 g de protéines de bonne qualité, 180 mg de calcium, 2,4 mg de fer ; pour les élèves de l'école élémentaire : 11 g de protéines de bonne qualité, 220 mg de calcium,2,8 mg de fer ; pour les adolescents : 17 à 20 g de protéines de bonne qualité, 300 à 400 mg de calcium, 4 à 7 mg de fer.",
  },
  { id: 'repas-fruits', source: 'spf-alimentation-2019', citation: 'Au moins 5 fruits et légumes par jour' },
  {
    id: 'repas-legumes-secs',
    source: 'spf-alimentation-2019',
    citation: 'Des légumes secs au moins 2 fois par semaine : lentilles, haricots secs, pois chiches, etc.',
  },
  { id: 'repas-eau', source: 'spf-alimentation-2019', citation: 'L’eau est la seule boisson recommandée' },
  {
    id: 'repas-sucrees',
    source: 'spf-alimentation-2019',
    citation:
      'On entend par boissons sucrées : les jus de fruits, les boissons aux fruits, les sirops, les eaux aromatisées, les sodas même « light » et les boissons dites « énergisantes ».',
  },
  {
    id: 'repas-sucrees-limite',
    source: 'spf-alimentation-2019',
    citation: 'Les boissons sucrées doivent être limitées le plus possible',
  },
  { id: 'repas-sel', source: 'spf-alimentation-2019', citation: 'Limiter la consommation de sel et de produits salés' },
  {
    id: 'repas-sel-origine',
    source: 'spf-alimentation-2019',
    citation:
      'Le sel consommé provient surtout des produits transformés : charcuterie, plats préparés du commerce, soupes déshydratées, fromage, pain, etc.',
  },
  {
    id: 'repas-gras',
    source: 'spf-alimentation-2019',
    citation: 'Réduire la consommation d’aliments gras, sucrés, salés et ultra-transformés',
  },
  { id: 'repas-variete', source: 'spf-alimentation-2019', citation: 'privilégier la variété, le fait maison' },
  {
    id: 'sang-def',
    source: 'cnrtl-sang',
    citation:
      "propulsé par le cœur dans un système fermé de vaisseaux (appareil circulatoire), remplit de multiples fonctions essentielles à l'organisme (notamment la fonction nutritive, respiratoire, excrétoire, immunisante)",
  },
  { id: 'coeur-role', source: 'cnrtl-coeur', citation: 'agent principal de la circulation sanguine' },
  {
    id: 'artere-def',
    source: 'cnrtl-artere',
    citation:
      'Chacun des vaisseaux qui, partant des ventricules du cœur, distribuent le sang dans toutes les parties du corps',
  },
  {
    id: 'veine-def',
    source: 'cnrtl-veine',
    citation: 'Vaisseau sanguin dans lequel la circulation se fait de la périphérie vers le cœur.',
  },
  {
    id: 'capillaire-def',
    source: 'academie-capillaire',
    citation:
      'les très fins vaisseaux qui joignent les artérioles aux veinules et permettent les échanges nutritifs et gazeux entre le sang et les cellules.',
  },
  // Écosystèmes (CM2) et décomposeurs (6e), lot st-cm2-04.
  {
    id: 'eco-caracteriser',
    source: PROGRAMME,
    citation:
      'Caractériser, à partir d’un exemple, un écosystème par son milieu de vie, l’ensemble des êtres vivants et les interactions en son sein.',
  },
  {
    id: 'eco-relations',
    source: PROGRAMME,
    citation:
      'Décrire plusieurs types de relations entre espèces au sein d’un écosystème (coopérations, prédation, etc.).',
  },
  {
    id: 'eco-repartition',
    source: PROGRAMME,
    citation:
      'Comparer, à partir d’observations ou d’expériences, la répartition des êtres vivants dans des milieux proches pour relier les facteurs abiotiques (physico-chimiques) et cette répartition (la température, l’ensoleillement ou l’humidité, etc.).',
  },
  {
    id: 'eco-pollinisation',
    source: PROGRAMME,
    citation: 'Illustrer la notion de coopération (interaction mutualiste) avec l’exemple de la pollinisation.',
  },
  {
    id: 'eco-actions',
    source: PROGRAMME,
    citation:
      'Mettre en évidence quelques répercussions positives et négatives des actions humaines sur l’environnement proche.',
  },
  {
    id: 'decompo-mort',
    source: PROGRAMME,
    citation:
      'Mettre en évidence que la matière organique des êtres vivants est décomposée après leur mort (exemple du sol).',
  },
  {
    id: 'decompo-role',
    source: PROGRAMME,
    citation:
      'Dégager le rôle clé des êtres vivants, en particulier des microorganismes, dans la décomposition de la matière organique, contribuant au cycle de la matière.',
  },
  {
    id: 'ecosysteme-def',
    source: 'academie-ecosysteme',
    citation:
      "Ensemble formé par une communauté d'êtres vivants, animaux et végétaux, et par le milieu dans lequel ils vivent. Les composants d'un écosystème sont en interaction constante.",
  },
  { id: 'proie-def', source: 'academie-proie', citation: "Être vivant qu'un animal capture pour s'en nourrir." },
  {
    id: 'predateur-def',
    source: 'academie-predateur',
    citation: "Animal qui vit aux dépens d'autres espèces animales qu'il capture et dont il se nourrit.",
  },
  {
    id: 'mutualisme-def',
    source: 'academie-mutualisme',
    citation:
      "Association de deux animaux d'espèces différentes qui tirent profit de cette union sans vivre aux dépens l'un de l'autre. Le mutualisme de l'anémone de mer et du bernard-l'hermite.",
  },
  {
    id: 'lichen-symbiose',
    source: 'cnrtl-symbiose',
    citation: "Un lichen est la symbiose d'une algue et d'un champignon",
  },
  {
    id: 'symbiose-def',
    source: 'cnrtl-symbiose',
    citation: "Association durable entre deux ou plusieurs organismes et profitable à chacun d'eux.",
  },
  {
    id: 'ensoleillement-def',
    source: 'academie-ensoleillement',
    citation: 'Temps pendant lequel un lieu est ensoleillé.',
  },
  {
    id: 'humidite-def',
    source: 'academie-humidite',
    citation: "Caractère ou état de ce qui est humide ; eau, vapeur d'eau présente dans un corps, un lieu, etc.",
  },
  {
    id: 'litiere-def',
    source: 'academie-litiere',
    citation:
      "Couche de débris végétaux peu altérés qui se trouvent à la surface d'un sol, notamment d'un sol forestier.",
  },
  {
    id: 'humus-def',
    source: 'cnrtl-humus',
    citation:
      'Terre brune noirâtre provenant de la décomposition de débris végétaux et/ou animaux dans le sol et qui contribue à sa fertilité.',
  },
  {
    id: 'humus-bacteries',
    source: 'cnrtl-humus',
    citation:
      "provenant de la décomposition de la matière organique fraîche par l'action de bactéries ou d'autres organismes vivants.",
  },
  {
    id: 'moisissure-def',
    source: 'academie-moisissure',
    citation:
      'Champignon microscopique qui se développe, en formant souvent des taches duveteuses, sur des matières organiques humides dont il provoque la décomposition ou la fermentation',
  },
  {
    id: 'microorganisme-def',
    source: 'academie-micro-organisme',
    citation: 'Les bactéries, les virus, certains protozoaires sont des microorganismes.',
  },
  {
    id: 'lombric-def',
    source: 'academie-lombric',
    citation: "Le lombric contribue à la fertilité du sol en l'aérant par les galeries qu'il y creuse.",
  },
  {
    id: 'lombricomposteur-def',
    source: 'ecologie-biodechets',
    citation: 'lombricomposteur (composteur individuel basé sur la digestion de déchets alimentaires par des lombrics)',
  },
  {
    id: 'compost-sol',
    source: 'ecologie-biodechets',
    citation:
      'la valorisation organique via le compostage, l’épandage ou la méthanisation permet de faire retourner au sol ou de transformer des matières organiques brutes en une matière valorisable',
  },
  {
    id: 'action-destruction',
    source: 'ecologie-biodiversite',
    citation:
      'la destruction et la fragmentation des milieux naturels liées, notamment, à l’urbanisation et au développement des infrastructures de transport',
  },
  {
    id: 'action-pollutions',
    source: 'ecologie-biodiversite',
    citation: 'les pollutions de l’eau, des sols et de l’air',
  },
  {
    id: 'action-surexploitation',
    source: 'ecologie-biodiversite',
    citation: 'la surexploitation d’espèces sauvages : surpêche, déforestation, braconnage, etc.',
  },
  {
    id: 'action-fragmentation',
    source: 'ecologie-trame-verte',
    citation:
      'les infrastructures de transport comme les routes et les voies ferrées, les barrages sur les cours d’eau, l’agriculture et la foresterie intensive, ou encore la pollution lumineuse ou sonore, réduisent la surface des espaces naturels et les fragmentent, limitant ainsi les possibilités de déplacement des espèces.',
  },
  {
    id: 'action-haies',
    source: 'ecologie-trame-verte',
    citation:
      'le maintien et la restauration d’infrastructures agroécologiques, entités favorables au fonctionnement de la trame, tels que les haies, bandes enherbées, bocages, arbres isolés et bosquets, mares, milieux humides, bords des cours d’eau',
  },
  {
    id: 'action-passes',
    source: 'ecologie-trame-verte',
    citation:
      'L’effacement des ouvrages ou leur aménagement, en installant notamment des passes à poissons, permet aux espèces de franchir ces obstacles et d’assurer leur cycle de vie.',
  },
  {
    id: 'action-ville',
    source: 'ecologie-trame-verte',
    citation:
      'le mode de gestion de l’espace est primordial pour favoriser la biodiversité et les continuités écologiques. La gestion différenciée consiste à pratiquer un entretien adapté des espaces verts selon leurs caractéristiques et leurs usages. Arrêter les traitements phytosanitaires, faucher tardivement, planter des essences locales…les actions possibles sont diverses.',
  },
  {
    id: 'action-lumiere',
    source: 'ecologie-pollution-lumineuse',
    citation:
      'Elles sont aussi une source de perturbations pour la biodiversité (modification du système proie-prédateur, perturbation des cycles de reproduction, des migrations…)',
  },
  {
    id: 'action-impermeable',
    source: 'ecologie-artificialisation',
    citation: 'un sol imperméabilisé n’absorbe pas l’eau de pluie',
  },
];
