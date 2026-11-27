/**
 * « Sens des matières » en mathématiques (cycle 3) : les phrases montrées à l'enfant, chacune avec sa
 * source et le passage exact qui l'appuie. Leur rattachement aux notions est dans `sens.ts`.
 */
import type { Sens, SensType } from '../types.ts';

/** Programme de mathématiques du cycle 3 (BO n° 16 du 17/04/2025). */
const prog =
  (type: SensType) =>
  (text: string, citation: string): Sens => ({ type, text, source: 'maths-cycle3-2025', citation });
const usage = prog('usage');
const saisTu = prog('savais-tu');
const metier = prog('metier');
const histoire = prog('histoire');
/** Résumé de la brochure sur le Système international d'unités (BIPM). */
const bipm = (type: SensType, text: string, citation: string): Sens => ({
  type,
  text,
  source: 'bipm-si-resume',
  citation,
});
/** Programme du cycle 3 toutes disciplines (géographie, EPS). */
const c3 = (type: SensType, text: string, citation: string): Sens => ({ type, text, source: 'cycle3-2020', citation });

export const NOMBRES = {
  ecritures: histoire(
    'Les Grecs, les Romains et les Égyptiens écrivaient les nombres avec des lettres ou des dessins.',
    'écritures des nombres à partir de lettres ou de dessins : numérations acrophoniques grecque, romaine',
  ),
  boulier: usage(
    'Avec un boulier ou un abaque à jetons, tu revois comment marchent les nombres.',
    'la manipulation d’abaques à jetons ou de bouliers pour remobiliser le principe de la numération',
  ),
  actualite: usage(
    'Les nombres aident à comprendre des sujets d’aujourd’hui, comme le climat ou la biodiversité.',
    'des données réelles relatives à des sujets d’actualité, comme le changement climatique, la pollution ou la perte de biodiversité',
  ),
  distances: usage(
    'On peut estimer ce qu’on ne tient pas en main : la distance entre deux villes, l’eau d’une piscine.',
    'des éléments non manipulables (distance entre deux villes, durée d’un film, volume d’eau d’une piscine, etc.)',
  ),
  jalousies: histoire(
    'Plusieurs traditions ont leurs façons de calculer, comme la multiplication « par jalousies ».',
    'algorithmes opératoires, développés dans plusieurs traditions mathématiques, comme la multiplication par jalousies',
  ),
  partDivision: usage(
    'La division sert à trouver la taille d’une part, ou le nombre de parts égales.',
    'division partition pour calculer la valeur d’une part et division quotition',
  ),
} as const;

export const FRACTIONS = {
  partage: usage(
    'Une fraction sert à dire quelle part tu prends quand on partage un tout en parts égales.',
    'les fractions sont utilisées pour représenter une partie d’un tout dans le cadre d’un partage de ce tout en parts égales',
  ),
  mesure: usage(
    'Quand les nombres entiers ne suffisent plus pour mesurer, les fractions prennent le relais.',
    'les fractions sont utilisées pour mesurer des grandeurs lorsque les nombres entiers ne sont pas suffisants',
  ),
  quantite: usage(
    'Un tiers de 12 billes, un quart de 100 mètres : les fractions servent à prendre une part d’une quantité.',
    'calculer des fractions de quantités ou de grandeurs comme un tiers de 12 billes ou un quart de 100 mètres',
  ),
  histoire: histoire(
    'Des impôts, des héritages et des terrains à mesurer ont fait naître la notion de fraction.',
    'les contextes historiques (impôt, héritage, cadastre) qui ont conduit à la notion de fraction',
  ),
  rompu: histoire(
    'Autrefois, on appelait une fraction « nombre rompu » ou « nombre cassé ».',
    'une fraction a été appelée nombre rompu, nombre cassé ou encore nombre coupé',
  ),
  nombre: saisTu(
    'Les fractions sont aussi des nombres : elles se placent entre les nombres entiers.',
    'donner aux fractions le statut de nombres, qui s’intercalent entre les nombres entiers déjà connus',
  ),
} as const;

export const DECIMAUX = {
  monnaie: usage('La virgule sert tous les jours avec la monnaie, pour écrire les prix.', 'problèmes sur la monnaie'),
  mesure: usage(
    'Longueurs, masses, contenances : les décimaux mesurent quand les entiers ne suffisent plus.',
    'nombres permettent en effet de mesurer des grandeurs quand les entiers ne suffisent plus',
  ),
  stevin: histoire(
    'Simon Stevin, de Bruges, a utilisé une écriture des décimaux qui montre leur lien avec les fractions.',
    'l’écriture des nombres décimaux utilisée par Simon Stevin de Bruges',
  ),
  codage: saisTu(
    'La virgule est un code pour écrire plus court une somme de fractions : dixièmes, centièmes…',
    'un codage destiné à simplifier l’écriture du nombre',
  ),
} as const;

export const CALCUL = {
  sens: usage(
    'Les quatre opérations prennent tout leur sens quand elles résolvent des problèmes.',
    'la résolution de problèmes, qui permet de donner du sens aux opérations',
  ),
  mental: usage(
    'La place des chiffres dans un nombre t’aide à calculer vite dans ta tête.',
    'effectuer rapidement des calculs, en s’appuyant notamment sur la position des chiffres dans les nombres',
  ),
  memoire: saisTu(
    'Un résultat appris par cœur te revient presque aussitôt, sans le recalculer.',
    'des faits numériques qui peuvent être restitués de façon quasi instantanée',
  ),
  controle: usage(
    'Un ordre de grandeur te permet de contrôler un résultat.',
    'de grandeur lui permet de contrôler le résultat',
  ),
  informatique: saisTu(
    'Poser une opération, c’est suivre un algorithme : une suite d’étapes, comme en informatique.',
    'L’apprentissage des algorithmes des opérations posées',
  ),
} as const;

export const ALGEBRE = {
  prix: usage(
    'Des tee-shirts à 12 € plus 5 € de livraison : une lettre écrit le prix pour n’importe quel nombre.',
    'si on achète des tee-shirts à 12 € et si le coût de la livraison est 5 €',
  ),
  inconnu: usage(
    'Tu peux raisonner sur un nombre que tu ne connais pas encore, puis le trouver.',
    'résoudre des problèmes en raisonnant sur des nombres sans connaître leur valeur',
  ),
  egal: saisTu(
    'Le signe « = » ne sert pas qu’à donner un résultat : il relie deux calculs égaux.',
    'Il peut être placé entre deux expressions qui sont égales',
  ),
  programmes: usage(
    'Un programme de calcul peut se coder avec Scratch ou un tableur, pour vérifier les résultats.',
    'codés avec un logiciel de programmation par bloc comme Scratch ou sur une feuille d’un tableur',
  ),
  motifs: usage(
    'La règle d’une suite aide à trouver des termes très lointains, parfois avec un tableur.',
    'pour déterminer des termes éloignés',
  ),
} as const;

export const MESURES = {
  kilo: bipm(
    'savais-tu',
    'Le nom « kilogramme » contient déjà un préfixe, « kilo » : c’est un cas à part.',
    'son nom, pour des raisons historiques, contient déjà un préfixe',
  ),
  metrique: bipm(
    'histoire',
    'Le système métrique date de la Révolution française : en 1799, il est fondé sur le mètre et le kilogramme.',
    'l’époque de la Révolution française, a été fondé en 1799 sur le mètre et le kilogramme',
  ),
  convention: bipm(
    'histoire',
    'En 1875, on signe la Convention du Mètre, pour un système de mesures commun au monde entier.',
    'Convention du Mètre, signée le 20 mai 1875 ; il est chargé d’établir les fondements d’un système de mesures unique',
  ),
  lumiere: bipm(
    'savais-tu',
    'Aujourd’hui, le mètre est défini grâce à la vitesse de la lumière.',
    'Le mètre, symbole m, est l’unité de longueur du SI. Il est défini en prenant la valeur numérique fixée de la vitesse de la lumière dans le vide',
  ),
  prefixes: bipm(
    'savais-tu',
    'Les préfixes comme « kilo » ou « milli » servent avec toutes les unités du système international.',
    'Les préfixes peuvent être utilisés avec toutes les unités SI',
  ),
  estimer: usage(
    'Estimer une longueur ou une masse t’aide à repérer un résultat impossible.',
    'valider la vraisemblance des résultats trouvés',
  ),
  geographes: c3(
    'metier',
    'Les géographes travaillent avec des cartes et des photos.',
    'géographe (documents cartographiques, photographies',
  ),
  sport: c3(
    'metier',
    'En sport, on mesure ses performances et on les enregistre.',
    'Mesurer et quantifier les performances, les enregistrer',
  ),
} as const;

export const TEMPS = {
  base60: saisTu(
    'Les heures, les minutes et les secondes se comptent par soixante : c’est la base soixante.',
    'système sexagésimal (base soixante) utilisé pour les unités de durée',
  ),
  babylone: histoire(
    'Dans l’ancienne Babylone, on comptait avec un système qui marche comme nos heures et nos minutes.',
    'la numération sexagésimale paléo-babylonienne, qui repose sur les mêmes principes mathématiques que le système utilisé pour exprimer des durées en heures, minutes et secondes',
  ),
  clepsydre: histoire(
    'Pour partager le temps, on a utilisé des clepsydres : des horloges à eau.',
    'clepsydres (horloges à eau)',
  ),
  calendriers: histoire(
    'Il existe des calendriers réglés sur le Soleil, sur la Lune, ou sur les deux.',
    'différents types de calendriers : solaires, lunaires ou luni-solaires',
  ),
  usages: usage(
    'En sport, en lecture, en sciences : on mesure des durées dans beaucoup d’activités.',
    'Les unités de durée sont régulièrement utilisées dans divers cadres (EPS, travail sur la fluence en lecture ou en calcul, sciences',
  ),
  seconde: bipm('savais-tu', 'La seconde est définie grâce à un atome : le césium 133.', 'de l’atome de césium 133'),
} as const;

export const GEOMETRIE = {
  quotidien: usage(
    'La géométrie se voit partout : dans les objets, la salle de classe ou la cour de récréation.',
    'les objets de la vie courante, mais aussi l’environnement ordinaire de l’élève (la salle de classe ou la cour de récréation)',
  ),
  outils: usage(
    'Règle, équerre et compas servent à construire des figures précises.',
    'Utiliser les outils géométriques usuels : règle, règle graduée, équerre et compas',
  ),
  raisonner: usage(
    'Prouver et raisonner en géométrie t’aide dans d’autres matières, et plus tard dans ton métier.',
    'facultés qui seront également un atout majeur dans sa future vie personnelle et professionnelle',
  ),
  perspective: saisTu(
    'Sur un dessin en perspective, les arêtes cachées se tracent souvent en pointillés.',
    'les arêtes non visibles sont éventuellement tracées en pointillés',
  ),
  espace: usage(
    'Passer d’un objet en volume à son dessin, et l’inverse, aide à voir dans l’espace.',
    'passage, dans les deux sens, entre l’objet à trois dimensions et ses diverses représentations à deux dimensions',
  ),
  deplacements: usage(
    'On peut coder un déplacement dans un quartier, et même dans toute une ville.',
    'les environnements dans lesquels ces déplacements ont lieu (quartier, ville, etc.)',
  ),
  robot: usage(
    'Avec des instructions précises, on peut programmer un robot ou un personnage sur un écran.',
    'programmer un robot se déplaçant sur un quadrillage ou un personnage se déplaçant dans un quadrillage sur un écran',
  ),
  construction: usage(
    'Suivre un programme pour construire une figure, c’est déjà penser comme en informatique.',
    'des programmes de construction contribue également au développement de la pensée informatique',
  ),
} as const;

export const DONNEES = {
  sujets: usage(
    'Tableaux et graphiques aident à comprendre le climat, la pollution ou la biodiversité.',
    'des données réelles relatives à des sujets d’actualité, comme le changement climatique, la pollution ou la perte de biodiversité',
  ),
  critique: usage(
    'Lire des données fait travailler ton esprit critique et ta façon d’argumenter.',
    'L’interprétation de ces données sollicite',
  ),
  disciplines: metier(
    'En géographie, en sciences et en sport, on se sert de tableaux et de graphiques.',
    'la géographie, les sciences ou l’éducation physique et sportive',
  ),
  enquete: usage(
    'Avec les données, tu peux mener ta propre enquête : choisir une question, mesurer, ranger.',
    'les différentes phases d’une enquête statistique',
  ),
} as const;

export const HASARD = {
  memoire: saisTu(
    'Un dé « ne se souvient pas » : le lancer d’avant ne change rien au suivant.',
    'le dé « ne se souvient pas » du résultat',
  ),
  pile: saisTu(
    'À pile ou face, « pile » a une chance sur deux de sortir.',
    '« obtenir pile » en lançant une pièce de monnaie',
  ),
  jeux: usage(
    'Pièces, dés, cartes : les probabilités disent ce qui a le plus de chances d’arriver.',
    'jet d’une pièce de monnaie, lancer de dé, tirages dans une urne, tirage d’une carte dans un jeu de 52 cartes',
  ),
} as const;

export const PROPORTION = {
  quotidien: usage(
    'La proportionnalité sert beaucoup dans la vie de tous les jours et dans d’autres matières.',
    'notion essentielle dans la vie quotidienne et dans de nombreuses autres disciplines',
  ),
  courses: usage(
    'Si tu achètes 3 fois plus de pains aux raisins, tu paies 3 fois plus.',
    'Si j’achète 3 fois plus de pains aux raisins, alors je vais payer 3 fois plus.',
  ),
  coeur: saisTu(
    '« Prix au kilo » ou « battements du cœur par minute » : ces expressions cachent une proportionnalité.',
    '« prix au kilo » ou « nombre de battements du cœur par minute »',
  ),
  feuilles: usage(
    '4 fois moins de feuilles, c’est une pile 4 fois moins épaisse.',
    'Si je prends 4 fois moins de feuilles de papier',
  ),
} as const;

export const INFORMATIQUE = {
  universelle: usage(
    'La pensée informatique aide à résoudre des problèmes compliqués, avec ou sans machine.',
    'une approche universelle permettant de résoudre des problèmes complexes',
  ),
  ia: usage(
    'Penser comme un programme aide à comprendre l’intelligence artificielle.',
    'comprendre les enjeux contemporains tels que l’intelligence artificielle',
  ),
  scratch: usage(
    'Avec Scratch, tu assembles des blocs pour faire exécuter tes instructions.',
    'logiciel de programmation graphique par blocs comme Scratch',
  ),
} as const;
