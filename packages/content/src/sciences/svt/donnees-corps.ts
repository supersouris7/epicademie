/**
 * Faits du chapitre « Le corps en activité » (5e, lot sv-5e-03). Chaque fait cite son identifiant de source
 * (registre `sources.ts`) et la citation exacte du texte consulté (programme du cycle 4, programme de SVT de seconde
 * paru au Bulletin officiel en 2010, programme de SVT du collège de 2008, dictionnaires publiés par le CNRTL, Santé publique France). Les relevés et les
 * mesures des exercices sont inventés : ils illustrent ces faits, ils ne sont pas des faits.
 */
import { PROGRAMME, type Fait } from './donnees.ts';

/** Programme de SVT de seconde générale et technologique (BO spécial n° 4 du 29 avril 2010), thème « exercice physique ». */
export const BO_EFFORT = 'bo-svt-seconde-2010';
/** Programme de SVT du collège (BO spécial n° 6 du 28 août 2008), classe de cinquième. */
export const BO_COLLEGE = 'bo-svt-college-2008';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const FAITS_CORPS: readonly Fait[] = [
  // Programme du cycle 4.
  f(
    'programme-effort',
    PROGRAMME,
    'Expliquer comment le système nerveux, le système respiratoire et le système cardiovasculaire interviennent lors d’un effort musculaire',
  ),
  f('programme-rythmes', PROGRAMME, 'Rythmes cardiaque et respiratoire, et effort'),
  f('programme-digestion', PROGRAMME, 'Expliquer le devenir des aliments dans le tube digestif.'),
  f('programme-absorption', PROGRAMME, 'Système digestif, digestion, absorption ; aliments et nutriments.'),
  f(
    'programme-transport',
    PROGRAMME,
    'Relier les besoins en nutriments et dioxygène des cellules animales et le rôle des systèmes de transport dans l’organisme.',
  ),
  // Programme de cinquième de 2008 (organes, appareils, effort).
  f(
    'organes-echanges',
    BO_COLLEGE,
    'Les organes effectuent en permanence des échanges avec le sang : ils y prélèvent des nutriments et du dioxygène ; ils y rejettent des déchets dont le dioxyde de carbone.',
  ),
  f(
    'organes-rythmes',
    BO_COLLEGE,
    'La consommation de nutriments et de dioxygène, le rejet de dioxyde de carbone par les organes varient selon leur activité, cela s’accompagne de modifications au niveau de l’organisme (augmentation de la température, des rythmes cardiaque et respiratoire).',
  ),
  f(
    'air-trajet',
    BO_COLLEGE,
    'L’air pénètre dans le corps humain par le nez ou la bouche ; il est conduit jusqu’aux alvéoles pulmonaires par la trachée, les bronches, les bronchioles.',
  ),
  f('alveole-echange', BO_COLLEGE, 'Au niveau des alvéoles pulmonaires du dioxygène passe de l’air dans le sang.'),
  f(
    'digestion-nutriments',
    BO_COLLEGE,
    'La transformation de la plupart des aliments consommés en nutriments s’effectue dans le tube digestif sous l’action d’enzymes digestives. Ces transformations chimiques complètent l’action mécanique.',
  ),
  f('nutriments-intestin', BO_COLLEGE, 'Les nutriments passent dans le sang au niveau de l’intestin grêle.'),
  // Respiration.
  f(
    'respiration-fonction',
    'cnrtl-respiration',
    "Ensemble des fonctions par lesquelles sont assurés les échanges gazeux de l'organisme (absorption d'oxygène et élimination de gaz carbonique).",
  ),
  f(
    'poumons-bronches',
    'academie-poumon',
    'chacun des deux organes de structure alvéolaire, situés dans la cage thoracique, et qui débouchent au fond du pharynx par deux bronches reliées à la trachée',
  ),
  f('poumon-echanges', 'cnrtl-poumon', "où se font les échanges gazeux entre l'organisme et le milieu extérieur"),
  f('trachee-conduit', 'cnrtl-trachee', 'Conduit aérifère fibro-cartilagineux qui relie le larynx aux bronches.'),
  f(
    'bronches-definition',
    'academie-bronche',
    "Chacun des deux conduits aériens cartilagineux nés de la bifurcation de la trachée, et qui pénètrent dans les poumons, où leurs ramifications forment l'arbre bronchique.",
  ),
  f('alveole-definition', 'academie-alveole', 'Alvéole pulmonaire, extrémité des bronchioles pulmonaires.'),
  f(
    'diaphragme-definition',
    'academie-diaphragme',
    "Cloison musculaire, mince et convexe, qui sépare le thorax de l'abdomen. Le diaphragme est le principal muscle inspirateur.",
  ),
  f('inspiration-definition', 'academie-inspiration', "Action de faire pénétrer l'air dans les poumons."),
  f('expiration-definition', 'academie-expiration', "Action d'expulser l'air des poumons."),
  f(
    'sang-oxygenation',
    'academie-sang',
    'Oxygénation du sang, fixation du dioxygène par les globules rouges au cours de leur passage dans les poumons ou les branchies.',
  ),
  f(
    'capillaire-echanges',
    'academie-capillaire',
    'les très fins vaisseaux qui joignent les artérioles aux veinules et permettent les échanges nutritifs et gazeux entre le sang et les cellules.',
  ),
  // Circulation.
  f(
    'sang-composition',
    'academie-sang',
    'composée de globules rouges, de globules blancs et de plaquettes baignant dans le plasma, qui circule dans le système vasculaire',
  ),
  f(
    'sang-transport',
    'academie-sang',
    'Le sang assure le transport des gaz, des substances nutritives et des éléments qui participent à la défense de l’organisme.',
  ),
  f(
    'sang-veineux',
    'academie-sang',
    'Sang veineux, qui circule dans une veine ; qui est riche en dioxyde de carbone (en ce sens, on dit aussi Sang noir).',
  ),
  f('coeur-moteur', 'academie-coeur', 'qui est le principal moteur de la circulation du sang'),
  f(
    'coeur-cavites',
    'academie-coeur',
    'Le cœur comporte des cavités gauches, qui envoient le sang dans la circulation générale, et des cavités droites, qui envoient le sang dans la circulation pulmonaire.',
  ),
  f(
    'coeur-systole',
    'academie-coeur',
    'La contraction du cœur porte le nom de systole, sa dilatation porte le nom de diastole.',
  ),
  f(
    'artere-definition',
    'academie-artere',
    "apportant le sang du cœur dans toutes les parties de l'organisme. (…) L'artère pulmonaire part du ventricule droit et conduit le sang noir aux poumons.",
  ),
  f(
    'veine-definition',
    'cnrtl-veine',
    'Vaisseau sanguin dans lequel la circulation se fait de la périphérie vers le cœur.',
  ),
  f(
    'oreillette-definition',
    'academie-oreillette',
    "Chacune des deux cavités du cœur qui reçoit le sang et l'envoie dans le ventricule correspondant. L'oreillette droite reçoit le sang des veines caves, l'oreillette gauche celui des veines pulmonaires.",
  ),
  f(
    'ventricule-definition',
    'cnrtl-ventricule',
    'Cavité cardiaque, épaisse, faisant suite à une oreillette, dont la contraction chasse le sang dans les artères',
  ),
  f(
    'pouls-definition',
    'academie-pouls',
    "Battement des artères, que l'on peut sentir en plusieurs endroits du corps (…) Le pouls s'apprécie en appuyant deux doigts à l'intérieur du poignet, à la base du cou.",
  ),
  f(
    'pouls-frequence',
    'academie-pouls',
    'La fréquence du pouls, le nombre de battements en un temps donné, généralement de soixante-dix environ en une minute.',
  ),
  // Digestion.
  f(
    'digestion-definition',
    'cnrtl-digestion',
    "Ensemble des transformations, d'ordre mécanique ou chimique, subies par les aliments dans le tube digestif avant de parvenir à l'état sous lequel ils sont assimilables par les cellules",
  ),
  f(
    'mastication-definition',
    'cnrtl-mastication',
    'Action de mastiquer, de broyer les aliments avec les dents de manière à en favoriser la déglutition et la digestion.',
  ),
  f(
    'salive-definition',
    'cnrtl-salive',
    'Liquide physiologique incolore, alcalin, plus ou moins visqueux, qui humecte la bouche et qui sert principalement à la digestion buccale',
  ),
  f(
    'oesophage-definition',
    'cnrtl-oesophage',
    "Segment du tube digestif reliant le pharynx à l'estomac, et dont la fonction est de conduire les aliments dans l'estomac après la déglutition.",
  ),
  f(
    'estomac-poche',
    'cnrtl-estomac',
    'Organe en forme de poche dans lequel les aliments sont brassés, transformés en chyme',
  ),
  f('intestin-grele', 'cnrtl-intestin', 'Segment du tube digestif allant du pylore au gros intestin'),
  f('gros-intestin', 'cnrtl-intestin', 'Dernière partie du tube digestif'),
  f(
    'chyle-sang',
    'cnrtl-chyle',
    "Produit de la digestion d'apparence laiteuse qui est absorbé par la paroi de l'intestin grêle pour être conduit dans la circulation sanguine",
  ),
  f(
    'nutriment-definition',
    'academie-nutriment',
    'Les sels minéraux, le glucose, les acides aminés sont des nutriments. Au cours de la digestion, les aliments sont transformés en nutriments par l’action des enzymes digestives.',
  ),
  f(
    'absorption-definition',
    'academie-absorption',
    "Passage dans le sang et la lymphe, de l'eau, des sels minéraux, des produits de la digestion. Absorption intestinale du glucose.",
  ),
  f(
    'villosite-capillaires',
    'cnrtl-villosite',
    'Chacune des villosités intestinales contient, en plus du réseau de capillaires sanguins, un capillaire lymphatique',
  ),
  f(
    'bile-definition',
    'academie-bile',
    'sécrété par le foie, s’accumulant dans la vésicule biliaire et se déversant dans l’intestin au moment de la digestion',
  ),
  f(
    'pancreas-definition',
    'academie-pancreas',
    "sécrète des enzymes digestives déversées par des canaux dans l'intestin grêle",
  ),
  f(
    'excrement-definition',
    'academie-excrement',
    "matière éliminée par l'organisme. Surtout employé au pluriel pour désigner les matières fécales.",
  ),
  f('glucose-energie', 'academie-glucose', "constitue la principale source énergétique de l'organisme"),
  // Effort physique.
  f(
    'muscle-definition',
    'academie-muscle',
    "Organe formé de fibres dont les contractions produisent les mouvements des différentes parties du corps de l'homme et des animaux.",
  ),
  f(
    'activite-physique',
    'spf-activite-physique-2017',
    'L’activité physique correspond à tous les mouvements de notre corps produits par la contraction des muscles et qui entraînent une dépense en énergie supérieure à celle du repos.',
  ),
  f(
    'effort-dioxygene',
    BO_EFFORT,
    'L’effort physique augmente la consommation de dioxygène : - plus l’effort est intense, plus la consommation de dioxygène augmente ; - il y a une limite à la consommation de dioxygène.',
  ),
  f('effort-nutriments', BO_EFFORT, 'La consommation de nutriments dépend aussi de l’effort fourni.'),
  f(
    'effort-energie',
    BO_EFFORT,
    'Au cours d’un exercice long et/ou peu intense, l’énergie est fournie par la respiration, qui utilise le dioxygène et les nutriments.',
  ),
  f(
    'effort-parametres',
    BO_EFFORT,
    'Au cours de l’effort un certain nombre de paramètres physiologiques sont modifiés : fréquence cardiaque, volume d’éjection systolique (et donc débit cardiaque) ; fréquence ventilatoire et volume courant (et donc débit ventilatoire) ; pression artérielle.',
  ),
  f(
    'effort-approvisionnement',
    BO_EFFORT,
    'Ces modifications physiologiques permettent un meilleur approvisionnement des muscles en dioxygène et en nutriments.',
  ),
  f(
    'effort-sante',
    BO_EFFORT,
    'Un bon état cardiovasculaire et ventilatoire est indispensable à la pratique d’un exercice physique.',
  ),
  f(
    'effort-nerfs',
    BO_EFFORT,
    'un centre bulbaire intègre les informations issues des barorécepteurs et module les messages nerveux en direction de l’effecteur (cœur)',
  ),
  f('essoufflement-definition', 'academie-essoufflement', 'État d’une personne essoufflée ; respiration haletante.'),
  f(
    'echauffement-definition',
    'academie-echauffement',
    'préparation des muscles à un effort physique intense par des mouvements appropriés',
  ),
];
