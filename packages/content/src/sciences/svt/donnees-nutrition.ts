/**
 * Faits du chapitre « Nutrition des êtres vivants » (5e, lot sv-5e-02). Chaque fait cite son identifiant de source
 * (registre `sources.ts`) et la citation exacte du texte consulté (programme du cycle 4, dictionnaires publiés par le
 * CNRTL, ministère chargé de la transition écologique). Les relevés, carnets et milieux des exercices sont inventés :
 * ils illustrent ces faits, ils ne sont pas des faits.
 */
import { PROGRAMME, type Fait } from './donnees.ts';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const FAITS_NUTRITION: readonly Fait[] = [
  // Programme.
  f(
    'programme-vegetaux',
    PROGRAMME,
    'Relier les besoins des cellules d’une plante chlorophyllienne (CO2, eau, sels minéraux et énergie lumineuse), les lieux de production ou de prélèvement de matière et de stockage et les systèmes de transport au sein de la plante.',
  ),
  f(
    'programme-respiration',
    PROGRAMME,
    'les végétaux verts se nourrissent du CO2 rejeté par la respiration des organismes (animaux et végétaux) et par la combustion de matière organique actuelle (en particulier par les décomposeurs dans le sol) ou fossile',
  ),
  f('programme-cellules', PROGRAMME, 'Relier les besoins en nutriments et dioxygène des cellules animales'),
  f(
    'programme-ecosystemes',
    PROGRAMME,
    'Expliquer comment une activité humaine peut modifier l’organisation et le fonctionnement des écosystèmes',
  ),
  f('programme-biodiversite', PROGRAMME, 'la biodiversité (diversité des espèces)'),
  f(
    'programme-evenements',
    PROGRAMME,
    'éruptions volcaniques de grande ampleur, introduction d’espèces invasives, compétitions entre organismes vivants',
  ),
  // Nutrition des végétaux.
  f(
    'photosynthese-definition',
    'academie-photosynthese',
    "Synthèse de substances organiques réalisée, sous l'action de la lumière, par les végétaux chlorophylliens à partir de l'eau, des sels minéraux et du dioxyde de carbone qu'ils puisent dans leur milieu naturel.",
  ),
  f('photosynthese-oxygene', 'academie-photosynthese', "La photosynthèse s'accompagne d'un rejet d'oxygène."),
  f(
    'chlorophylle-definition',
    'academie-chlorophylle',
    "Pigment vert répandu dans les organes des végétaux verts et assurant la photosynthèse des glucides sous l'action de la lumière solaire.",
  ),
  f(
    'autotrophe-definition',
    'academie-autotrophe',
    "Capable d'élaborer des substances organiques à partir d'éléments minéraux. Les plantes vertes sont autotrophes.",
  ),
  f(
    'heterotrophe-definition',
    'academie-heterotrophe',
    'utilisent les matières organiques produites par les végétaux chlorophylliens ou par des animaux. La plupart des animaux sont hétérotrophes.',
  ),
  f(
    'racine-fonctions',
    'cnrtl-racine',
    'qui permet la fixation du végétal dans le sol tout en assurant son alimentation en eau et en sels minéraux',
  ),
  f(
    'stomate-echanges',
    'cnrtl-stomate',
    'les stomates (...) qui, par leur nombre, permettent une diffusion rapide des gaz entre le milieu extérieur et le milieu intérieur',
  ),
  f(
    'stomate-feuilles',
    'cnrtl-stomate',
    "Dispositif de l'épiderme des végétaux (situé notamment à la face inférieure des feuilles aériennes",
  ),
  f('seve-deux-flots', 'cnrtl-seve', 'On appelle sève brute le flot qui monte, sève élaborée le flot qui descend.'),
  f(
    'seve-elaboree',
    'cnrtl-seve',
    "Liquide contenant des matières organiques et minérales issues de l'activité métabolique, de la photosynthèse",
  ),
  f('seve-vaisseaux', 'cnrtl-seve', 'Celui-là monte par les canaux du bois, celui-ci descend par les canaux du liber'),
  f(
    'amidon-reserve',
    'cnrtl-amidon',
    'constituant la réserve alimentaire de nombreux végétaux, notamment des céréales',
  ),
  f(
    'mycorhize-definition',
    'academie-mycorhize',
    "Association symbiotique entre les racines d'un végétal et le mycélium d'un champignon.",
  ),
  // Respiration.
  f(
    'respiration-echanges',
    'cnrtl-respiration',
    "Ensemble des fonctions par lesquelles sont assurés les échanges gazeux de l'organisme (absorption d'oxygène et élimination de gaz carbonique).",
  ),
  f(
    'respiration-vegetale',
    'cnrtl-respiration',
    "Ensemble des phénomènes d'échanges gazeux entre un végétal et l'atmosphère",
  ),
  f('respiration-jour-nuit', 'cnrtl-respiration', 'Respiration diurne, nocturne.'),
  f('respiration-organes', 'cnrtl-respiration', 'respiration branchiale, cutanée'),
  f(
    'poumon-definition',
    'cnrtl-poumon',
    'Organe principal de la respiration des mammifères, des oiseaux, des reptiles et de certains invertébrés, où se font les échanges gazeux',
  ),
  f('branchie-definition', 'academie-branchie', 'Organe respiratoire propre aux animaux aquatiques.'),
  f(
    'branchie-exemples',
    'academie-branchie',
    'Les mollusques lamellibranches et les larves des Amphibiens, appelées têtards, ont aussi des branchies.',
  ),
  f(
    'trachee-insectes',
    'cnrtl-trachee',
    "Les insectes respirent par des trachées, c'est-à-dire des tubes ramifiés dans tout le corps, remplis d'air",
  ),
  f('branchie-ouies', 'academie-branchie', "Les branchies des poissons sont situées à l'intérieur des ouïes."),
  f('dauphin-mammifere', 'academie-dauphin', 'Mammifère marin de la famille des Delphinidés'),
  // Écosystèmes.
  f(
    'ecosysteme-definition',
    'academie-ecosysteme',
    "Ensemble formé par une communauté d'êtres vivants, animaux et végétaux, et par le milieu dans lequel ils vivent.",
  ),
  f('ecosysteme-interactions', 'academie-ecosysteme', "Les composants d'un écosystème sont en interaction constante."),
  f(
    'biocenose-definition',
    'academie-biocenose',
    'Ensemble des animaux et des végétaux qui vivent dans les mêmes conditions de milieu, dans un espace donné, et qui sont liés par une dépendance réciproque.',
  ),
  f(
    'biotope-definition',
    'academie-biotope',
    "Aire géographique caractérisée par des conditions climatiques et physico-chimiques homogènes permettant l'existence d'une faune et d'une flore spécifiques.",
  ),
  f(
    'chaine-definition',
    'academie-chaine',
    "Chaîne alimentaire, série d'organismes vivants où chacun se nourrit du précédent.",
  ),
  f('chaine-producteur', 'cnrtl-chaine-alimentaire', 'du végétal (producteur) au carnivore (consommateur)'),
  f(
    'predateur-definition',
    'academie-predateur',
    "Animal qui vit aux dépens d'autres espèces animales qu'il capture et dont il se nourrit.",
  ),
  f('predateur-fouine', 'academie-predateur', 'La fouine est un petit prédateur nocturne.'),
  f(
    'parasite-definition',
    'academie-parasite',
    "Organisme qui vit et se développe au détriment de l'hôte sur lequel il s'est fixé.",
  ),
  f('phytophage-definition', 'academie-phytophage', 'qui se nourrit de matières végétales'),
  f('herbivore-definition', 'cnrtl-herbivore', "Qui se nourrit d'herbes ou d'autres substances végétales."),
  f('phyto-sens', 'cnrtl-phyto', 'de φυτόν «végétal, plante»'),
  f(
    'symbiose-definition',
    'cnrtl-symbiose',
    "Association durable entre deux ou plusieurs organismes et profitable à chacun d'eux.",
  ),
  f(
    'saprophyte-definition',
    'cnrtl-saprophyte',
    '(Végétal, microorganisme) qui vit aux dépens des matières organiques inertes et qui peut en provoquer la décomposition',
  ),
  // Biodiversité.
  f(
    'biodiversite-definition',
    'ecologie-biodiversite',
    'Cela recouvre l’ensemble des milieux naturels et des formes de vie (plantes, animaux, champignons, bactéries, etc.) et leurs interactions.',
  ),
  f('biodiversite-mot', 'ecologie-biodiversite', 'contraction de biologique et diversité'),
  f('biodiversite-milieux', 'ecologie-biodiversite', 'la diversité des milieux de vie à toutes les échelles'),
  f(
    'biodiversite-especes',
    'ecologie-biodiversite',
    'la diversité des espèces (y compris l’espèce humaine) qui vivent dans ces milieux',
  ),
  f('biodiversite-genetique', 'ecologie-biodiversite', 'la diversité génétique des individus au sein de chaque espèce'),
  f(
    'biodiversite-nombre',
    'ecologie-biodiversite',
    "1,8 million d'espèces connues pour une diversité réelle estimée jusqu'à 100 millions.",
  ),
  f('biodiversite-menaces', 'ecologie-biodiversite', 'Un million d’espèces sont menacées d’extinction dans le monde.'),
  f(
    'erosion-destruction',
    'ecologie-biodiversite',
    'la destruction et la fragmentation des milieux naturels liées, notamment, à l’urbanisation',
  ),
  f(
    'erosion-surexploitation',
    'ecologie-biodiversite',
    'la surexploitation d’espèces sauvages : surpêche, déforestation, braconnage',
  ),
  f('erosion-pollutions', 'ecologie-biodiversite', 'les pollutions de l’eau, des sols et de l’air'),
  f(
    'erosion-climat',
    'ecologie-biodiversite',
    'le changement climatique qui peut s’ajouter aux autres causes et les aggraver',
  ),
  f('erosion-invasives', 'ecologie-biodiversite', 'l’introduction d’espèces exotiques envahissantes'),
  f(
    'invasive-definition',
    'ecologie-especes-envahissantes',
    'une espèce introduite par l’homme volontairement ou involontairement sur un territoire hors de son aire de répartition naturelle, et qui menace les écosystèmes, les habitats naturels ou les espèces locales',
  ),
  f(
    'invasive-pas-toutes',
    'ecologie-especes-envahissantes',
    'Toutes les espèces introduites ne sont pas envahissantes',
  ),
  f(
    'invasive-ressources',
    'ecologie-especes-envahissantes',
    'elles accaparent une part trop importante des ressources',
  ),
  f('invasive-ragondin', 'ecologie-especes-envahissantes', 'le ragondin (Myocastor coypus)'),
  f('invasive-frelon', 'ecologie-especes-envahissantes', 'le frelon asiatique (Vespa velutina)'),
  f(
    'espece-definition',
    'academie-espece',
    'Unité de classification groupant les êtres vivants qui ont les mêmes caractères morphologiques, histologiques, cytologiques, sont féconds entre eux et présentent des comportements communs.',
  ),
  f('espece-feconde', 'cnrtl-espece', 'qui reproduisent entre eux des êtres semblables et également féconds'),
  f('endemique-definition', 'academie-endemique', "Dont l'aire de répartition est limitée à un territoire, à un pays."),
  f(
    'pollinisation-definition',
    'academie-pollinisation',
    "Transport des grains de pollen jusqu'au stigmate du pistil chez les Angiospermes",
  ),
];
