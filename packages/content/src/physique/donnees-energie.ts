/**
 * Faits du chapitre « Énergie et circuits » (5e). Chaque fait cite son identifiant de source (registre `sources.ts`)
 * et la citation exacte : programmes des cycles 3 et 4, programme de technologie du cycle 4, pages du ministère chargé
 * de la transition écologique, Dictionnaire de l’Académie française et Trésor de la langue française informatisé
 * (CNRTL). Les montages et les objets numérotés des exercices sont inventés : ce ne sont pas des faits.
 */
import { PROGRAMME, PROGRAMME_C3, referencesDe, type Fait } from './donnees-matiere.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const c3 = (id: string, citation: string) => fait(id, PROGRAMME_C3, citation);

const TECHNO = 'techno-c4-2024';
const RENOUVELABLES = 'ecologie-energies-renouvelables';
const CLIMAT = 'ecologie-changement-climatique';

export const FAITS_ENERGIE: readonly Fait[] = [
  // Sources et formes d'énergie.
  prog('identifier', 'Identifier les sources, les transferts, les conversions et les formes d’énergie.'),
  prog('formes', 'potentielle (dépendant de la position), thermique, électrique, chimique, nucléaire, lumineuse.'),
  c3(
    'ressources',
    'Rechercher des informations relatives à différentes ressources en énergie (Soleil, eau, vent, pétrole, bois, charbon, dihydrogène, combustible nucléaire (uranium), etc.)',
  ),
  c3(
    'renouvelable-programme',
    'au caractère renouvelable ou non, à l’échelle temporelle de la vie humaine, des ressources en énergie.',
  ),
  fait(
    'renouvelables-liste',
    RENOUVELABLES,
    'Les énergies renouvelables (EnR) sont alimentées par le soleil, le vent, la chaleur de la terre, les chutes d’eau, les marées…',
  ),
  fait(
    'fossiles',
    RENOUVELABLES,
    'Elles se distinguent des énergies fossiles, polluantes et dont les stocks diminuent.',
  ),
  fait('gaz-fossile', RENOUVELABLES, 'le gaz naturel qui, comme le pétrole, est une source d’énergie fossile'),
  fait('combustibles-fossiles', 'academie-fossile', 'La houille, le pétrole sont des combustibles fossiles.'),
  fait(
    'renouvelable-definition',
    'academie-renouvelable',
    'À la différence du pétrole et du gaz naturel, l’énergie solaire est une énergie renouvelable.',
  ),
  c3('cinetique', 'énergie cinétique (liée au mouvement)'),
  c3('pesanteur', 'énergie de pesanteur (dépendant de l’altitude sur Terre)'),
  c3('lumiere', 'la Terre reçoit de l’énergie du Soleil par la lumière qu’il émet'),
  fait('thermique', 'cnrtl-thermique', 'Qui se rapporte à la forme d’énergie qu’est la chaleur.'),
  fait(
    'nucleaire',
    'cnrtl-nucleaire',
    'Énergie dégagée par la fission du noyau d’atomes lourds ou la fusion de noyaux d’éléments légers',
  ),
  // Conversions.
  prog('conversion', 'Conversion d’une forme d’énergie en une autre.'),
  prog(
    'co2-programme',
    'Identifier un dispositif de conversion d’énergie dont le fonctionnement s’accompagne d’une émission de dioxyde de carbone.',
  ),
  c3(
    'transferts',
    'distinguer les énergies qui peuvent être stockées (énergies de pesanteur, cinétique, chimique, nucléaire et thermique) de celles qui correspondent à des transferts énergétiques (énergies électrique et lumineuse).',
  ),
  c3('chute', 'au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique'),
  c3(
    'moteur-pile',
    'conversion d’énergie chimique en énergie cinétique dans un dispositif constitué d’un moteur alimenté par une pile électrique',
  ),
  c3('essence', 'moteur à essence, de l’énergie chimique est convertie en énergie cinétique'),
  c3(
    'lampe-transfert',
    'transfert d’énergie électrique vers une lampe ou un autre appareil électrique alimentés par une pile électrique',
  ),
  fait('constituants', TECHNO, 'moteur électrique, lampe, radiateur, génératrice, vérin'),
  fait(
    'pile',
    'academie-pile',
    'Appareil, dispositif qui fournit de l’énergie électrique à partir de l’énergie chimique.',
  ),
  fait('photopile', 'cnrtl-pile', 'transforme le rayonnement solaire en électricité'),
  fait('eolienne', RENOUVELABLES, 'Les éoliennes convertissent l’énergie du vent en énergie électrique'),
  fait('lampe', 'academie-lampe', 'Lampe électrique, où la lumière est produite par l’électricité'),
  fait(
    'moteur',
    'academie-moteur',
    'Appareil qui utilise une source quelconque d’énergie pour produire de l’énergie mécanique, du mouvement.',
  ),
  fait('radiateur', 'academie-radiateur', 'Appareil de chauffage qui diffuse la chaleur à l’air ambiant.'),
  fait(
    'centrale-nucleaire',
    'academie-nucleaire',
    'Centrale nucléaire, usine produisant de l’électricité à partir de l’énergie nucléaire.',
  ),
  fait(
    'essence-petrole',
    'academie-petrole',
    'Le kérosène, les essences, le gazole, les paraffines sont des produits obtenus par distillation des pétroles.',
  ),
  fait(
    'co2-combustion',
    CLIMAT,
    'L’accumulation du dioxyde de carbone (CO2) dans l’atmosphère contribue pour 2/3 de l’augmentation de l’effet de serre induite par les activités humaines (combustion de gaz, de pétrole, déforestation, cimenteries, etc.).',
  ),
  // Circuits en série et en dérivation.
  prog('dipoles', 'Dipôles en série, dipôles en dérivation.'),
  prog(
    'circuits-5e',
    'Dès la classe de 5e, la mise en œuvre de circuits simples visant à réaliser des fonctions précises est recommandée.',
  ),
  prog('securite', 'Mettre en relation les lois de l’électricité et les règles de sécurité dans ce domaine.'),
  fait(
    'circuit',
    'cnrtl-circuit',
    'Suite de conducteurs formant un parcours fermé, à travers lesquels peut passer un courant électrique.',
  ),
  fait(
    'circuit-ouvert',
    'cnrtl-circuit',
    'Circuit dans lequel une interruption dans l’un des éléments empêche le passage du courant',
  ),
  fait('circuit-ferme', 'academie-circuit', 'Circuit fermé, où le courant peut circuler.'),
  fait(
    'interrupteur',
    'cnrtl-interrupteur',
    'Dispositif servant à couper ou à rétablir le passage du courant électrique dans un circuit.',
  ),
  fait('serie', 'cnrtl-serie', 'Placés à la suite les uns des autres et parcourus par le même courant'),
  fait('parallele', 'academie-om2-derivation', 'Un montage en parallèle constitue une dérivation.'),
  fait(
    'derivation',
    'academie-om2-derivation',
    'Action d’installer un circuit annexe entre deux points d’un circuit fermé ; ce circuit lui-même.',
  ),
  fait(
    'court-circuit',
    'cnrtl-court-circuit',
    'une augmentation de l’intensité du courant et une élévation dangereuse de la température des conducteurs',
  ),
  fait('generateur', 'academie-generateur', 'Les piles, les accumulateurs sont des générateurs de courant continu.'),
  // Conducteurs et isolants.
  c3('conductivite', 'éprouver la conductivité électrique de certains matériaux'),
  fait('conductibilite-techno', TECHNO, 'Les conductibilités électrique et thermique'),
  fait(
    'conducteur',
    'academie-conducteur',
    'Susceptible d’être parcouru par le courant électrique ou de transférer la chaleur.',
  ),
  fait(
    'isolant',
    'academie-isolant',
    'Qui n’est pas conducteur de l’électricité, de la chaleur, des ondes acoustiques.',
  ),
  fait(
    'isolants-exemples',
    'academie-isolant',
    'Le verre, le caoutchouc, la porcelaine sont des isolants électriques.',
  ),
  fait(
    'metaux',
    'academie-metal',
    'généralement bon conducteur de la chaleur et de l’électricité. Le fer, le cuivre, le magnésium, le calcium sont des métaux.',
  ),
  fait('cuivre', 'cnrtl-cuivre', 'bon conducteur de l’électricité'),
  fait('argent', 'academie-argent', 'bon conducteur de la chaleur et de l’électricité'),
  fait('graphite', 'academie-charbon', 'Morceau de graphite utilisé comme conducteur.'),
  fait(
    'ebonite',
    'academie-ebonite',
    'Matière plastique dure et noire, obtenue à partir de caoutchouc naturel et de soufre, qui constitue un bon isolant électrique.',
  ),
  fait(
    'electrocution',
    'academie-electrocution',
    'Action, qui peut être mortelle, du courant électrique sur un organisme.',
  ),
];

export const referencesEnergie = referencesDe(FAITS_ENERGIE);
