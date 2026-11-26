/**
 * Faits du chapitre « La Terre interne » (4e). Chaque fait cite son identifiant de source (registre `sources.ts`)
 * et la citation exacte du texte consulté (programme du cycle 4, Académie française et CNRTL, BRGM, CNRS Terre &
 * Univers). Les carnets, lieux, relevés et mesures des exercices de niveau 5 sont inventés : ils illustrent ces
 * faits, ils ne sont pas des faits.
 */
import type { Fait } from './donnees.ts';

export const PROGRAMME = 'cycle4-2020';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const FAITS_TERRE: readonly Fait[] = [
  // Programme.
  f('programme-globe', PROGRAMME, 'le globe terrestre (forme,'),
  f('programme-tectonique', PROGRAMME, 'dynamique interne et tectonique'),
  f('programme-eres', PROGRAMME, 'Ères géologiques.'),
  f('programme-phenomenes', PROGRAMME, 'Expliquer quelques phénomènes'),

  // Structure du globe.
  f('croute-definition', 'academie-croute', 'la surface solidifiée du globe (on dit aussi Écorce terrestre)'),
  f('manteau-definition', 'academie-manteau', 'Partie du globe terrestre située entre l’écorce et le noyau.'),
  f('noyau-definition', 'academie-noyau', 'Le noyau du globe terrestre, la partie centrale de la Terre.'),
  f('manteau-solide', 'insu-manteau', 'Le manteau est constitué de roches solides.'),
  f(
    'manteau-convection',
    'insu-manteau',
    'Le manteau terrestre constitue une enveloppe solide animée de lents et constants mouvements de convection.',
  ),
  f('noyau-externe', 'insu-noyau', 'des mouvements du fer liquide dans le noyau externe, 3000 km sous nos pieds'),
  f('noyau-metal', 'insu-noyau', 'en l’occurrence, un mélange de fer et de nickel fondus'),
  f('graine', 'insu-noyau', 'Cet océan de métal liquide, le noyau externe, entoure une graine de métal solide'),
  f(
    'moho',
    'insu-moho',
    'la discontinuité sismique de Mohorovicic (plus communément appelée Moho) représente sur l’ensemble du globe la limite entre le manteau et la croûte',
  ),
  f(
    'lithosphere-definition',
    'academie-lithosphere',
    'Enveloppe extérieure du globe terrestre, solide, rocheuse et irrégulière, de soixante-dix à cent kilomètres d’épaisseur.',
  ),
  f(
    'asthenosphere-definition',
    'academie-asthenosphere',
    'Couche interne et visqueuse du globe terrestre sur laquelle repose la lithosphère.',
  ),
  f(
    'asthenosphere-ductile',
    'insu-verre-olivine',
    'La séparation entre la lithosphère rigide et l’asthénosphère ductile',
  ),
  f('manteau-lithospherique', 'insu-verre-olivine', 'le minéral le plus abondant du manteau lithosphérique'),

  // Tectonique des plaques.
  f(
    'plaques',
    'insu-tectonique-debut',
    'La lithosphère, couche mobile la plus superficielle de la Terre, est divisée en un petit nombre de plaques rigides en déplacement sur l’asthénosphère',
  ),
  f(
    'plaques-phenomenes',
    'insu-tectonique-debut',
    'Cette structuration contrôle des phénomènes géologiques comme les tremblements de Terre ou le volcanisme.',
  ),
  f(
    'plaque-definition',
    'academie-plaque',
    'Chacune des parties superficielles rigides de la lithosphère, formant de vastes surfaces géologiquement peu actives, mais dont les zones de contact présentent une activité sismique et un volcanisme très importants.',
  ),
  f(
    'dorsale',
    'insu-dorsale',
    'Les dorsales médio-océaniques forment une chaîne volcanique sous-marine continue de plus de 60 000km où se forme le plancher océanique',
  ),
  f('dorsale-separation', 'insu-dorsale', 'les processus par lesquels deux plaques tectoniques se séparent'),
  f('dorsale-vitesse', 'insu-dorsale', 'des dorsales à taux d’ouverture intermédiaire (6-7 cm/an)'),
  f('dorsale-lente', 'insu-moho', 's’ouvre très lentement (~1 cm par an)'),
  f(
    'subduction',
    'insu-subduction-carbone',
    'Lorsqu’elle vieillit, sa densité augmente et elle plonge dans le manteau (phénomène de subduction).',
  ),
  f(
    'antilles',
    'insu-antilles',
    'les plaques nord-américaine et sud-américaine s’enfoncent sous la plaque des Caraïbes',
  ),
  f(
    'collision',
    'brgm-roches-alpes',
    'c’est quand l’océan se referme et que les continents entrent en collision que les forces gigantesques qui les poussent l’un contre l’autre font naître les montagnes',
  ),
  f(
    'cycle-montagne',
    'brgm-roches-alpes',
    'une chaîne de montagnes se forme au cours d’un cycle qui débute par l’ouverture d’un océan où se déposent des sédiments',
  ),
  f('continents-mobiles', 'brgm-roches-alpes', 'les continents ne sont pas fixes'),
  f('pyrenees', 'brgm-roches-alpes', 'avant que sa collision avec la plaque Europe n’engendre les Pyrénées'),
  f(
    'madagascar',
    'brgm-mayotte',
    'Il y a 180 millions d’années, alors que les dinosaures peuplent la Terre, Madagascar se sépare de l’Afrique',
  ),
  f('madagascar-distance', 'brgm-mayotte', 'En 100 millions d’années, Madagascar aura parcouru 1 500km.'),
  f(
    'rift',
    'academie-rift',
    'Région longue et étroite dans laquelle l’amincissement de la lithosphère provoque la formation de failles et de fossés d’effondrement.',
  ),

  // Roches.
  f(
    'trois-familles',
    'brgm-cycle-roches',
    'on distingue trois grandes familles de roches : des roches qu’on dit sédimentaires, des roches dites magmatiques et des roches métamorphiques',
  ),
  f(
    'sedimentaire-formation',
    'brgm-cycle-roches',
    'Les roches sédimentaires se forment à la surface de la Terre par l’altération, l’érosion de roches qui sont en surface.',
  ),
  f(
    'transport',
    'brgm-cycle-roches',
    'les particules qui sont formées sont transportées par le vent, par les fleuves, les rivières, et vont déposer des sédiments',
  ),
  f(
    'strates',
    'brgm-cycle-roches',
    'Ces sédiments vont s’accumuler les uns au-dessus des autres, et former des couches, des strates.',
  ),
  f(
    'compaction',
    'brgm-cycle-roches',
    'les particules vont se compacter, et l’eau, qui était initialement entre les grains, va s’échapper et le peu d’eau qui reste va se concentrer et cimenter les grains',
  ),
  f('gres', 'brgm-cycle-roches', 'c’est un sable qu’on a cimenté par compaction'),
  f(
    'craie',
    'brgm-cycle-roches',
    'La craie, par exemple, c’est une accumulation de micro-coquilles de tout petits organismes',
  ),
  f(
    'metamorphique',
    'brgm-cycle-roches',
    'la roche reste à l’état solide, mais l’augmentation de la pression et de la température transforme les minéraux',
  ),
  f('schiste', 'brgm-cycle-roches', 'une roche métamorphique qu’on appelle ici le schiste'),
  f(
    'fusion',
    'brgm-cycle-roches',
    'des conditions de pression et de température qui vont les faire fondre, et, donc, on va générer un magma',
  ),
  f(
    'plutonique',
    'brgm-cycle-roches',
    'elle va s’effectuer lentement et former des roches avec des gros cristaux, donc des roches magmatiques, mais des roches qu’on va appeler plutoniques',
  ),
  f(
    'volcanique',
    'brgm-cycle-roches',
    'si le magma remonte jusqu’en surface, c’est ce qu’on appelle les roches volcaniques, ça forme des volcans, et ces roches vont brutalement refroidir',
  ),
  f('basalte-grain', 'brgm-cycle-roches', 'on n’a pas cristallisé de minéraux visibles à l’œil nu'),
  f(
    'granite-rose',
    'brgm-tour-geologique',
    'Le granite rose breton est une roche magmatique, issue de la cristallisation d’un magma à quelques kilomètres sous terre',
  ),
  f('magmatique', 'academie-magmatique', 'qui provient de la solidification d’un magma'),
  f(
    'sedimentaire-fossiles',
    'academie-sedimentaire',
    'formée par l’accumulation ou la précipitation de particules de taille et d’origine variables, et qui contient souvent des fossiles',
  ),
  f(
    'gneiss',
    'academie-gneiss',
    'Roche métamorphique formée par des alternances de lits clairs, feldspath et quartz, et de lits sombres',
  ),
  f('metamorphique-exemples', 'academie-metamorphique', 'Les gneiss, les schistes sont des roches métamorphiques.'),
  f('granite', 'academie-granite', 'Roche cristalline grenue, de teinte claire'),
  f('basalte', 'academie-basalte', 'Roche volcanique de couleur sombre composée d’une pâte compacte'),
  f('craie-roche', 'academie-craie', 'Roche tendre, friable et poreuse, de formation sédimentaire'),
  f(
    'plutonique-definition',
    'academie-plutonique',
    'résulte de la cristallisation lente d’un magma dans les zones profondes de la croûte terrestre',
  ),
  f('sediment', 'academie-sediment', 'qui ont été transportées puis déposées par l’eau ou le vent'),
  f(
    'metamorphisme',
    'academie-metamorphisme',
    'à l’état solide, se trouve soumise à une élévation de température ou de pression',
  ),

  // Histoire de la Terre.
  f('age-terre', 'brgm-voyage-temps-geologiques', 'Voici une histoire à 4,5 milliards d’années'),
  f(
    'subdivisions',
    'brgm-temps-geologiques',
    'les subdivisions géologiques du temps sont basées sur les différentes formes de vie fossiles que l’on retrouve dans les couches géologiques correspondantes',
  ),
  f(
    'crises',
    'brgm-temps-geologiques',
    'Il y en a eu cinq majeures rien que pour les temps fossilifères – c’est-à-dire les derniers 540 millions d’années',
  ),
  f(
    'precambrien',
    'brgm-roches-alpes',
    'la limite entre Précambrien et ère primaire se plaçant vers -540 millions d’années',
  ),
  f(
    'fin-primaire',
    'insu-extinction-primaire',
    'À la fin de l’ère primaire, il y a 252 millions d’années, la plus importante extinction connue par la Terre rayait de la carte 90 % des espèces alors existantes.',
  ),
  f(
    'fin-cretace',
    'insu-dinosaures',
    'une extinction brutale à la fin du Crétacé, il y a environ 66 millions d’années',
  ),
  f('limite-cretace-tertiaire', 'insu-dinosaures', 'la limite Crétacé-Tertiaire'),
  f('trias', 'brgm-temps-geologiques', 'Trias (-252 à -201 millions d’années)'),
  f(
    'quaternaire',
    'brgm-voyage-temps-geologiques',
    'Celle-ci est caractérisée par le développement de cycles glaciaires et interglaciaires et par la large diffusion du genre Homo en Eurasie.',
  ),
  f(
    'fossile-definition',
    'academie-fossile',
    'Vestige, empreinte ou trace d’un organisme animal ou végétal, qu’on retrouve dans les couches sédimentaires.',
  ),
  f('ere-definition', 'academie-ere', 'Chaque grande division de l’histoire de la Terre.'),
  f(
    'paleontologie',
    'academie-paleontologie',
    'Science ayant pour objet l’étude des êtres vivants des temps géologiques',
  ),
  f('paleozoique', 'academie-paleozoique', 'on dit aussi Ère primaire'),
  f('mesozoique', 'cnrtl-mesozoique', 'Ère mésozoïque. Ère secondaire.'),
  f('cenozoique', 'cnrtl-cenozoique', 'on les réunit aujourd’hui sous le nom de Cénozoïque'),
  f('ammonite', 'academie-ammonite', 'Mollusque céphalopode fossile, caractéristique des terrains secondaires.'),
];
