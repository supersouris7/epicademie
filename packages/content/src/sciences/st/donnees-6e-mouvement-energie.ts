/**
 * Faits du chapitre « Mouvements et énergie » (6e, lot st-6e-02). Chaque fait cite son identifiant de source
 * (registre `sources.ts`) et la citation exacte : programme du cycle 3, Dictionnaire de l'Académie française, Trésor
 * de la langue française informatisé (CNRTL), Géoconfluences et ministère chargé de la transition écologique.
 * Les mobiles, les planètes désignées par une lettre, les distances, les durées et les montages des exercices sont
 * inventés et annoncés comme données de l'exercice : ce ne sont pas des faits.
 */
import { PROGRAMME, type Fait } from './donnees.ts';

const fait = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => fait(id, PROGRAMME, citation);
const RENOUVELABLES = 'ecologie-energies-renouvelables';

export const FAITS_MOUVEMENT_ENERGIE: readonly Fait[] = [
  // Types de mouvements.
  prog('point-de-vue', 'Décrire un mouvement en précisant le point de vue.'),
  prog(
    'annee-jour',
    'Associer la durée d’une année au mouvement de révolution de la Terre autour du Soleil, du point de vue héliocentrique, et associer la durée d’un jour au mouvement de rotation de la Terre autour de l’axe des pôles.',
  ),
  prog(
    'constante-variable',
    'Observer et identifier des situations où la vitesse d’un objet en mouvement par rapport à un observateur a une valeur constante ou variable.',
  ),
  fait('rectiligne', 'academie-rectiligne', 'Qui est en ligne droite. Trajectoire, mouvement rectilignes.'),
  fait('circulaire', 'academie-circulaire', 'Qui décrit un cercle.'),
  fait('uniforme', 'cnrtl-uniforme', 'soit constante au cours du temps (ex: mouvement uniforme)'),
  fait(
    'rotation',
    'academie-rotation',
    'Mouvement circulaire que décrit un corps tournant autour d’un point ou d’un axe fixes.',
  ),
  fait('revolution', 'academie-revolution', 'La révolution de la Terre autour du Soleil'),
  fait('heliocentrique', 'academie-heliocentrique', 'Qui prend le centre du Soleil comme point de référence.'),
  // Vitesse.
  prog(
    'calcul',
    'Calculer la valeur de la vitesse à partir de la distance parcourue et de la durée de déplacement dans le cas du mouvement uniforme d’un objet par rapport à un observateur.',
  ),
  prog(
    'conversions-planetes',
    'Effectuer des conversions d’unités de distance et de temps, en particulier dans le contexte du mouvement de révolution des planètes autour du Soleil.',
  ),
  fait(
    'quotient',
    'academie-moyenne',
    'vitesse moyenne, quotient de la distance parcourue par le temps mis à la parcourir.',
  ),
  fait('kilo', 'si-prefixes-bipm', 'kilo | k | 10³'),
  fait('heure', 'academie-heure', 'L’heure se divise en soixante minutes.'),
  fait('minute', 'academie-minute', 'La minute se divise en soixante secondes.'),
  fait('jour', 'academie-heure', 'Espace de temps correspondant à la vingt-quatrième partie du jour.'),
  // Sources et conversions d'énergie.
  prog(
    'formes',
    'Identifier différentes formes d’énergie (énergies de pesanteur, cinétique, chimique, thermique, électrique, nucléaire et lumineuse) dans des situations variées.',
  ),
  prog(
    'stockees-transferts',
    'distinguer les énergies qui peuvent être stockées (énergies de pesanteur, cinétique, chimique, nucléaire et thermique) de celles qui correspondent à des transferts énergétiques (énergies électrique et lumineuse).',
  ),
  prog(
    'ressources',
    'Rechercher des informations relatives à différentes ressources en énergie (Soleil, eau, vent, pétrole, bois, charbon, dihydrogène, combustible nucléaire (uranium), etc.) et les différencier selon leur caractère renouvelable ou non à l’échelle temporelle de la vie humaine.',
  ),
  prog('chute', 'au cours de la chute d’un objet, son énergie de pesanteur est convertie en énergie cinétique'),
  prog(
    'moteur-pile',
    'conversion d’énergie chimique en énergie cinétique dans un dispositif constitué d’un moteur alimenté par une pile électrique',
  ),
  prog('essence', 'de l’énergie chimique est convertie en énergie cinétique'),
  prog('soleil', 'la Terre reçoit de l’énergie du Soleil par la lumière qu’il émet'),
  fait(
    'renouvelables',
    RENOUVELABLES,
    'Les énergies renouvelables (EnR) sont alimentées par le soleil, le vent, la chaleur de la terre, les chutes d’eau, les marées…',
  ),
  fait(
    'peu-polluantes',
    RENOUVELABLES,
    'Ces sources d’énergie, considérées comme inépuisables à l’échelle du temps humain, n’engendrent pas ou peu de déchets ou d’émissions polluantes.',
  ),
  fait(
    'fossiles',
    RENOUVELABLES,
    'Elles se distinguent des énergies fossiles, polluantes et dont les stocks diminuent.',
  ),
  fait('gaz-naturel', RENOUVELABLES, 'le gaz naturel qui, comme le pétrole, est une source d’énergie fossile'),
  fait(
    'bois',
    RENOUVELABLES,
    'Il s’agit d’une source d’énergie considérée comme renouvelable, dans la mesure où la forêt est gérée de façon durable.',
  ),
  fait('eolienne', RENOUVELABLES, 'Les éoliennes convertissent l’énergie du vent en énergie électrique'),
  fait('charbon', 'academie-fossile', 'La houille, le pétrole sont des combustibles fossiles.'),
  prog(
    'hydro',
    'énergie de pesanteur (dépendant de l’altitude sur Terre), énergie cinétique (liée au mouvement) et énergie électrique',
  ),
  fait('thermique', 'cnrtl-thermique', 'Qui se rapporte à la forme d’énergie qu’est la chaleur.'),
  fait(
    'nucleaire',
    'cnrtl-nucleaire',
    'Énergie dégagée par la fission du noyau d’atomes lourds ou la fusion de noyaux d’éléments légers',
  ),
  fait(
    'essence-petrole',
    'academie-petrole',
    'Le kérosène, les essences, le gazole, les paraffines sont des produits obtenus par distillation des pétroles.',
  ),
  fait(
    'centrale-nucleaire',
    'academie-nucleaire',
    'Centrale nucléaire, usine produisant de l’électricité à partir de l’énergie nucléaire.',
  ),
  fait('maree', 'cnrtl-maree', 'Mouvement alternatif, périodique et journalier du niveau de la mer'),
  fait(
    'uranium-stock',
    'geoconfluences-transition-energetique',
    'un système reposant sur des énergies de stock (pétrole, charbon, gaz, uranium)',
  ),
  fait(
    'dechets-nucleaires',
    'ecologie-cycle-uranium',
    'Les déchets radioactifs issus des combustibles usés sont des déchets hautement radioactifs et à vie longue.',
  ),
  fait(
    'co2',
    'ecologie-effet-de-serre',
    'L’accumulation du dioxyde de carbone (CO2) dans l’atmosphère contribue pour 2/3 de l’augmentation de l’effet de serre induite par les activités humaines (combustion de gaz, de pétrole, déforestation, cimenteries, etc.).',
  ),
  // Circuit électrique.
  prog('boucle', 'Mettre en œuvre des circuits électriques à une boucle en respectant des consignes de sécurité.'),
  prog(
    'intervertir',
    'Mettre en évidence expérimentalement la possibilité d’intervertir les positions des composants d’un circuit à une boucle.',
  ),
  prog('elements', 'capteurs, moteurs électriques miniatures, éléments photovoltaïques'),
  prog(
    'usure',
    'aider les élèves à dépasser une conception circulatoire du courant (courant qui s’épuise ou qui s’use)',
  ),
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
  fait(
    'interrupteur',
    'cnrtl-interrupteur',
    'Dispositif servant à couper ou à rétablir le passage du courant électrique dans un circuit.',
  ),
  fait('generateur', 'academie-generateur', 'Les piles, les accumulateurs sont des générateurs de courant continu.'),
  fait(
    'recepteur',
    'academie-recepteur',
    'Appareil, installation qui convertissent l’énergie électrique fournie par un générateur en une autre forme d’énergie, lumineuse, thermique, mécanique ou chimique. Les ampoules, les résistances, les moteurs électriques, les électrolyseurs sont des récepteurs.',
  ),
  fait(
    'moteur',
    'academie-moteur',
    'Appareil qui utilise une source quelconque d’énergie pour produire de l’énergie mécanique, du mouvement.',
  ),
  fait(
    'pile',
    'academie-pile',
    'Appareil, dispositif qui fournit de l’énergie électrique à partir de l’énergie chimique.',
  ),
  fait(
    'photopile',
    'academie-photopile',
    'Dispositif utilisant l’effet photovoltaïque pour produire de l’électricité à partir de l’énergie solaire',
  ),
  fait(
    'capteur',
    'academie-capteur',
    'Appareil sensible à un phénomène physique, qu’il transforme en un signal, généralement électrique, transmissible à distance.',
  ),
];

export function references(...ids: readonly string[]) {
  const faits = ids.map((id) => {
    const f = FAITS_MOUVEMENT_ENERGIE.find((x) => x.id === id);
    if (!f) throw new Error(`Fait inconnu : ${id}`);
    return f;
  });
  return {
    source: `Programme du cycle 3, 6e (BOEN n° 31 du 30 juillet 2020 et n° 25 du 22 juin 2023) et textes cités : ${faits.map((f) => `« ${f.citation} »`).join(' ; ')}.`,
    sources: [...new Set([PROGRAMME, ...faits.map((f) => f.source)])],
  };
}
