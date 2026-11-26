/**
 * Faits du chapitre « Signaux et unités » (5e). Chaque fait cite son identifiant de source (registre `sources.ts`) et
 * la citation exacte : programmes des cycles 3 et 4, Dictionnaire de l’Académie française et Trésor de la langue
 * française informatisé (CNRTL), Bureau international des poids et mesures, Inserm et ministère chargé de
 * l’écologie. Les situations et les valeurs des exercices (distances, durées, mesures) sont inventées et annoncées
 * comme données de l’exercice : ce ne sont pas des faits.
 */
import { PROGRAMME, PROGRAMME_C3, referencesDe, type Fait } from './donnees-matiere.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const bipm = (id: string, citation: string) => fait(id, 'bipm-si-resume', citation);

export const FAITS_SIGNAUX: readonly Fait[] = [
  // Lumière.
  prog('sources-programme', 'Distinguer une source primaire (objet lumineux) d’un objet diffusant.'),
  prog(
    'rectiligne-programme',
    'Exploiter expérimentalement la propagation rectiligne de la lumière dans le vide et le modèle du rayon lumineux.',
  ),
  prog('annee-lumiere-programme', 'Utiliser l’unité « année-lumière » comme unité de distance.'),
  prog('laser-programme', 'sensibiliser les élèves aux risques d’emploi des sources lumineuses (laser par exemple).'),
  fait('lumineux', 'academie-lumineux', 'Qui émet de la lumière. Un corps lumineux.'),
  fait('diffuser', 'academie-diffuser', 'Répandre dans toutes les directions. Diffuser la lumière, la chaleur.'),
  fait(
    'lune',
    'academie-lune',
    'Astre satellite de la terre, qui réfléchit sur elle la lumière qu’il reçoit du soleil.',
  ),
  fait(
    'etoile',
    'academie-etoile',
    'Corps céleste qui entretient sa propre source d’énergie et brille de sa lumière propre.',
  ),
  fait('planete', 'academie-planete', 'Une planète reçoit sa lumière du Soleil.'),
  fait(
    'rayon',
    'cnrtl-rayon',
    'Trajectoire rectiligne suivant laquelle se propage une radiation et, en partic., l’énergie lumineuse (dans un milieu homogène).',
  ),
  fait('ombre', 'academie-ombre', 'Obscurité relative que cause un corps opaque en interceptant la lumière'),
  fait('vitesse-lumiere', 'bipm-si-resume', 'la vitesse de la lumière dans le vide, c, est égale à 299 792 458 m/s'),
  fait('annee-lumiere', 'cnrtl-annee', 'Chemin parcouru par la lumière dans le vide en une année'),
  fait(
    'laser',
    'ecologie-lasers',
    'L’utilisation malveillante d’appareils laser est aujourd’hui un véritable danger pour le transport aérien.',
  ),
  // Son.
  prog('son-conditions', 'Décrire les conditions de propagation d’un son.'),
  prog('son-distance', 'Relier la distance parcourue par un son à la durée de propagation.'),
  prog('son-frequence', 'Notion de fréquence : sons audibles, infrasons et ultrasons.'),
  prog('risques-auditifs', 'sensibiliser les élèves aux risques auditifs.'),
  fait(
    'son-milieu',
    'cnrtl-son-nom',
    'vibration périodique ou quasi-périodique d’une onde matérielle propagée dans un milieu élastique, en particulier dans l’air',
  ),
  fait(
    'ondes-matiere',
    'cnrtl-onde',
    'Ondes qui se propagent par vibrations de la matière (gazeuse, liquide ou solide) sans qu’il y ait déplacement de celle-ci, comme par exemple les ondes sonores',
  ),
  fait(
    'ondes-lumiere',
    'cnrtl-onde',
    'qui se propagent en dehors de tout support matériel connu à la vitesse de 300 000 kilomètres/seconde dans l’air ou dans le vide',
  ),
  fait(
    'vitesse-son',
    'academie-propagation',
    'La vitesse de propagation du son dans l’air est de 344 m/s, celle de la lumière dans le vide d’environ 300 000 km/s.',
  ),
  fait(
    'orage',
    'cnrtl-propagation',
    'l’estimation de la distance d’un orage par le temps écoulé entre la vision de l’éclair et le bruit du tonnerre',
  ),
  fait(
    'echo',
    'academie-echo',
    'Effet de répétition du son produit par la réflexion de l’onde acoustique sur un obstacle',
  ),
  fait(
    'sonar',
    'cnrtl-sonar',
    'Appareil à ultrasons, émetteur et récepteur, servant, par l’écho sonore, à la détection d’objets sous-marins',
  ),
  fait(
    'frequence',
    'inserm-audition',
    'Sa fréquence correspond au nombre de vibrations par seconde qu’il génère et s’exprime en Hertz.',
  ),
  fait(
    'grave-aigu',
    'inserm-audition',
    'Si elle est faible, le son est grave. Et à l’inverse, plus elle est élevée, plus le son est aigu.',
  ),
  fait('audible', 'inserm-audition', 'Les fréquences captées par les humains varient de 20 à 20 000 Hz.'),
  fait('infrason', 'cnrtl-infrason', 'de fréquence trop faible pour être audible'),
  fait(
    'ultrason',
    'cnrtl-ultrason',
    'Vibration acoustique dont la fréquence dépasse 20 000 hertz et qui n’est pas perçue par l’oreille humaine.',
  ),
  fait('decibel', 'inserm-audition', 'L’intensité d’un son, exprimée en décibels'),
  fait(
    'cellules-ciliees',
    'inserm-audition',
    'Des niveaux sonores élevés détruisent de façon irréversible les cellules ciliées et altèrent les fibres nerveuses auditives.',
  ),
  // Unités et préfixes.
  fait('unites-c3', PROGRAMME_C3, 'une bonne connaissance des unités du système international de mesure étant visée.'),
  fait(
    'prefixes-c3',
    PROGRAMME_C3,
    'L’étude des préfixes des unités de mesure décimales, en lien avec les unités de numération, facilite la compréhension et l’apprentissage des unités de mesure',
  ),
  bipm('valeur', 'La valeur d’une grandeur s’exprime comme le produit d’un nombre par une unité.'),
  bipm(
    'si',
    'En 1960, la CGPM à sa 11 e réunion a officiellement défini et établi le Système international d’unités (SI).',
  ),
  bipm('metre', 'Le mètre, symbole m, est l’unité de longueur du SI.'),
  bipm('kilogramme', 'Le kilogramme, symbole kg, est l’unité de masse du SI.'),
  bipm('seconde', 'La seconde, symbole s, est l’unité de temps du SI.'),
  bipm('ampere', 'L’ampère, symbole A, est l’unité de courant électrique du SI.'),
  bipm('kelvin', 'Le kelvin, symbole K, est l’unité de température thermodynamique du SI.'),
  bipm('derivees', 'fréquence hertz Hz s−1 force newton N'),
  bipm('energie-puissance', 'énergie, travail, quantité de chaleur joule J'),
  bipm('puissance', 'puissance, flux énergétique watt W'),
  bipm('tension', 'différence de potentiel électrique volt V'),
  bipm(
    'symboles',
    'Les symboles des unités ne doivent donc pas être suivis d’un point, sauf s’ils se trouvent placés à la fin d’une phrase, et restent invariables au pluriel.',
  ),
  bipm(
    'majuscule',
    'Ils sont écrits en minuscules, sauf si le nom de l’unité dérive d’un nom propre, auquel cas la première lettre du symbole est en majuscule.',
  ),
  bipm('espace', 'On laisse toujours une espace entre le nombre et l’unité.'),
  bipm('hors-si', '1 min = 60 s'),
  bipm('heure', '1 h = 3600 s'),
  bipm('litre', '1 L = 1 dm 3'),
  bipm('tonne', '1 t = 1000 kg'),
  bipm(
    'prefixes',
    'Une série de préfixes, à utiliser avec les unités SI, ont été adoptés pour exprimer les valeurs des grandeurs beaucoup plus grandes ou plus petites que l’unité SI elle-même.',
  ),
  bipm('tableau-multiples', '10 1 déca da 10−1 déci d 10 2 hecto h 10−2 centi c 10 3 kilo k 10−3 milli m'),
  bipm('tableau-grands', '10 6 méga M 10−6 micro μ 10 9 giga G 10−9 nano n'),
  bipm('mot-unique', 'le symbole du préfixe et celui de l’unité forment un nouveau symbole, sans espace'),
  bipm(
    'cas-kilogramme',
    'Les multiples et sous-multiples du kilogramme sont formés par l’adjonction de préfixes au mot gramme',
  ),
];

export const referencesSignaux = referencesDe(FAITS_SIGNAUX);
