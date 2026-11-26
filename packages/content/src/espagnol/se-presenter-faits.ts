/**
 * Espagnol 5e, « Se présenter » (lot es-5e-01) : données citées. Chaque fait porte l'identifiant de sa source
 * (registre `sources.ts`) et une citation exacte du texte consulté le 26/11/2026 (copies d'archive web.archive.org
 * des pages de la Real Academia Española ; programme : annexe 9 de l'arrêté du 5 mai 2025).
 */

export interface Fait {
  readonly id: string;
  readonly sourceId: string;
  /** Citation exacte du texte source. */
  readonly quote: string;
  /** Ce que le fait établit pour la notion. */
  readonly claim: string;
}

const fait = (id: string, sourceId: string, claim: string, quote: string): Fait => ({ id, sourceId, quote, claim });
const PROGRAMME = 'espagnol-college-2025';

export const FAITS: readonly Fait[] = [
  // Saluer et prendre congé
  fait('hola', 'rae-dle-hola', '« hola » sert à saluer familièrement', 'U. como salutación familiar.'),
  fait('dias', 'rae-dle-dia', '« buenos días » sert à saluer', 'U. como fórmula de cortesía o para saludar.'),
  fait(
    'tardes',
    'rae-dle-tarde',
    '« buenas tardes » sert à saluer l’après-midi',
    'U. como fórmula de cortesía o para saludar durante la tarde.',
  ),
  fait(
    'noches',
    'rae-dle-noche',
    '« buenas noches » sert à saluer la nuit ou au coucher',
    'U. como fórmula de cortesía o para saludar durante la noche o al irse a acostar.',
  ),
  fait('adios', 'rae-dle-adios', '« adiós » sert à prendre congé', 'U. para despedirse.'),
  fait('luego', 'rae-dle-luego', '« hasta luego » sert à prendre congé', 'U. para despedirse.'),
  fait(
    'gracias',
    'rae-dle-gracia',
    '« gracias » sert à remercier',
    'U. como fórmula de cortesía para manifestar agradecimiento.',
  ),
  fait(
    'perdon',
    'rae-dle-perdon',
    '« perdón » sert à demander pardon',
    'U. como fórmula de cortesía para pedir disculpas.',
  ),
  fait(
    'politesse',
    PROGRAMME,
    'formules de salutation et de congé au programme',
    'Hola, buenos días / buenas tardes / buenas noches. Adiós,',
  ),
  fait('manana', PROGRAMME, '« hasta mañana » : à demain', 'Hasta mañana / hasta el lunes.'),
  fait('pronto', PROGRAMME, '« hasta pronto » : à bientôt', 'Hasta pronto / Hasta la próxima / Lo siento.'),
  fait('de-nada', PROGRAMME, '« de nada » répond à un remerciement', 'Muchísimas gracias / De nada.'),
  fait('que-tal', PROGRAMME, 'demander des nouvelles', '¿Qué tal? / ¿Qué tal están tus padres?'),
  fait('como-estas', PROGRAMME, 'demander et donner des nouvelles', '¡Hola! ¿Cómo estás? / Bien, gracias.'),
  fait('disculpa', PROGRAMME, 'formules d’excuse du programme', 'Por favor. / Disculpa. / Permiso.'),
  fait('disculpe', PROGRAMME, 'formule d’excuse en vouvoyant', 'Disculpe…'),
  fait('y-tu', PROGRAMME, 'renvoyer la question', '¿Y tú?'),
  // Se présenter
  fait(
    'llamarse',
    'rae-dle-llamar',
    '« llamarse » : avoir tel nom',
    'Tener el nombre o la denominación que se expresa.',
  ),
  fait('llamo', 'rae-dle-llamar', 'présent de « llamar » à la 1re personne', 'Primera | yo | llamo |'),
  fait(
    'reflechi',
    'rae-dpd-pronombres-atonos',
    'pronoms me, te, nos, os (sans forme réfléchie propre) et « se » à la 3e personne',
    'en las formas de primera y segunda persona solo se distingue entre singular y plural, y no existe una forma reflexiva específica',
  ),
  fait(
    'age',
    'rae-dle-tener',
    '« tener » exprime l’âge',
    'U., con los nombres que significan tiempo, para expresar la duración o edad de las cosas o personas de que se habla. Tener años.',
  ),
  fait('me-llamo', PROGRAMME, 'se présenter : nom et âge', 'Me llamo Antonio. Soy uruguayo'),
  fait('cuantos', PROGRAMME, 'demander l’âge', '¿Cuántos años tienes?'),
  // Nombres
  fait(
    'nombres-formes',
    'rae-dpd-cardinales',
    'les nombres 16 à 19 et 21 à 29 s’écrivent en un mot',
    'De los complejos, se escriben hoy en una sola palabra los correspondientes a los números 16 a 19 y 21 a 29',
  ),
  fait(
    'nombres-y',
    'rae-dpd-cardinales',
    'à partir de 30, dizaine et unité sont reliées par « y »',
    'los correspondientes a la adición de unidades a las decenas se escriben interponiendo entre los cardinales simples la conjunción y: treinta y uno',
  ),
  fait(
    'nombres-anciens',
    'rae-dpd-cardinales',
    '« diez y seis » et « veinte y uno » sont à éviter',
    'son anticuadas y deben evitarse',
  ),
  fait(
    'nombres-simples',
    'rae-dpd-cardinales',
    'les écritures en un mot (treintaicinco) sont admises mais minoritaires',
    'Estas grafías simples son asimismo válidas',
  ),
  fait(
    'nombres-vulgaires',
    'rae-dpd-cardinales',
    '« diciséis » est une forme fautive de « dieciséis »',
    'Son vulgares los compuestos correspondientes a la primera decena en los que se ha simplificado el diptongo',
  ),
  fait(
    'apocope',
    'rae-dpd-cardinales',
    '« uno » devient « un » (« veintiún ») devant un nom masculin',
    'adoptan siempre la forma apocopada un: un libro, veintiún soldados',
  ),
  fait(
    'cent',
    'rae-dpd-cardinales',
    '« cien » est un cardinal simple',
    'Hay cardinales simples ―de cero a quince, todas las decenas (diez, veinte, treinta, etc.), cien(to), quinientos y mil―',
  ),
  // Alphabet
  fait(
    'abecedaire',
    'rae-dpd-abecedario',
    'l’alphabet espagnol compte 27 lettres, dont ñ',
    'El abecedario español está hoy formado por las veintisiete letras siguientes: a, b, c, d, e, f, g, h, i, j, k, l, m, n, ñ, o, p, q, r, s, t, u, v, w, x, y, z',
  ),
  fait(
    'digraphes',
    'rae-dpd-abecedario',
    'ch et ll ne sont plus des lettres',
    'no forman hoy parte del abecedario por no ser propiamente letras',
  ),
  fait('nom-b', 'rae-dpd-letra-b', 'nom de b', 'Su nombre es femenino: la be.'),
  fait(
    'nom-b-amerique',
    'rae-dpd-letra-b',
    'en Amérique, autres noms de b',
    'En América recibe también los nombres de be larga, be grande y be alta.',
  ),
  fait(
    'son-ch',
    'rae-dpd-abecedario',
    'le groupe ch représente un son à lui seul',
    'por representar cada uno de ellos de forma exclusiva un fonema del español',
  ),
  fait('nom-g', 'rae-dpd-letra-g', 'nom de g', 'Su nombre es femenino: la ge'),
  fait('nom-h', 'rae-dpd-letra-h', 'nom de h', 'Su nombre es femenino: la hache'),
  fait(
    'son-h',
    'rae-dpd-letra-h',
    'h ne se prononce pas',
    'no representa, en el español estándar actual, ningún fonema',
  ),
  fait('nom-j', 'rae-dpd-letra-j', 'nom de j', 'Su nombre es femenino: la jota'),
  fait('nom-enye', 'rae-dpd-letra-enye', 'nom de ñ', 'Su nombre es femenino: la eñe'),
  fait('nom-q', 'rae-dpd-letra-q', 'nom de q', 'Su nombre es femenino: la cu.'),
  fait('nom-v', 'rae-dpd-letra-v', 'nom de v', 'Su nombre es femenino: la uve.'),
  fait(
    'nom-v-amerique',
    'rae-dpd-letra-v',
    'en Amérique, v s’appelle aussi « ve » ou « ve corta »',
    'En América recibe también los nombres de ve, ve corta',
  ),
  fait(
    'son-v',
    'rae-dpd-letra-v',
    'b et v se prononcent pareil',
    'No existe en español ninguna diferencia en la pronunciación de las letras b y v.',
  ),
  fait('nom-w', 'rae-dpd-letra-w', 'nom de w', 'Su nombre es femenino: la uve doble'),
  fait(
    'nom-w-amerique',
    'rae-dpd-letra-w',
    'autres noms de w',
    'En América existen otras denominaciones, como ve doble, doble ve y, en México y algunos países del área centroamericana y caribeña, doble u',
  ),
  fait('nom-x', 'rae-dpd-letra-x', 'nom de x', 'Su nombre es femenino: la equis'),
  fait('nom-y', 'rae-dpd-letra-y', 'noms de y', 'Su nombre es femenino: la ye o la i griega'),
  fait('nom-z', 'rae-dpd-letra-z', 'nom de z', 'Su nombre es femenino: la zeta'),
  // Accent tonique
  fait(
    'tonique',
    'rae-dpd-acento',
    'définition de la syllabe tonique',
    'La sílaba sobre la que recae el acento prosódico se denomina sílaba tónica o acentuada',
  ),
  fait(
    'aigues',
    'rae-dpd-acento',
    'aguda : dernière syllabe tonique',
    'Las palabras agudas son aquellas cuya última sílaba es tónica: reloj, avión, iglú.',
  ),
  fait(
    'planes',
    'rae-dpd-acento',
    'llana : avant-dernière syllabe tonique',
    'Las palabras llanas o graves son aquellas cuya penúltima sílaba es tónica: lápiz, blanco, cartera.',
  ),
  fait(
    'esdrujulas',
    'rae-dpd-acento',
    'esdrújula : antépénultième syllabe tonique',
    'Las palabras esdrújulas son aquellas cuya antepenúltima sílaba es tónica: pájaro, esdrújulo, sábado.',
  ),
  fait(
    'tilde-aigues',
    'rae-dpd-tilde',
    'une aguda sans accent écrit ne finit ni par n, ni par s, ni par une voyelle',
    'Las palabras agudas (→ acento, 1.2a) llevan tilde cuando terminan en -n o en -s no precedidas de otra consonante, o en las vocales a, e, i, o, u',
  ),
  fait(
    'tilde-planes',
    'rae-dpd-tilde',
    'une llana finissant par voyelle, n ou s n’a pas d’accent écrit',
    'No la llevan cuando terminan en -n o -s no precedidas de otra consonante, o en las vocales a, e, i, o, u',
  ),
  fait('tilde-esdrujulas', 'rae-dpd-tilde', 'les esdrújulas ont toujours un accent écrit', 'siempre llevan tilde'),
  fait('accent-programme', PROGRAMME, 'accent tonique au programme de 5e', 'Respect de l’accent tonique.'),
];

// ——— Saluer ———

export type Family = 'salut' | 'conge' | 'politesse' | 'nouvelles';

export interface Formula {
  readonly es: string;
  readonly fr: string;
  readonly family: Family;
  /** Situation donnée à l'élève : une seule formule du tableau y convient. */
  readonly situation: string;
}

const formula = (es: string, family: Family, fr: string, situation: string): Formula => ({ es, family, fr, situation });

export const FORMULAS: readonly Formula[] = [
  formula('hola', 'salut', 'salut', 'Tu retrouves un ami et tu lui dis « salut ».'),
  formula('buenos días', 'salut', 'bonjour (le matin)', 'Il est 8 h : tu salues ton professeur en arrivant.'),
  formula('buenas tardes', 'salut', 'bonjour (l’après-midi)', 'Il est 16 h : tu salues une voisine.'),
  formula('buenas noches', 'salut', 'bonne nuit, bonsoir (la nuit)', 'Tu vas te coucher : tu salues ta famille.'),
  formula('adiós', 'conge', 'au revoir', 'Tu veux simplement dire « au revoir ».'),
  formula('hasta luego', 'conge', 'à plus tard', 'En partant, tu veux dire « à plus tard ».'),
  formula('hasta mañana', 'conge', 'à demain', 'En partant, tu veux dire « à demain ».'),
  formula('hasta pronto', 'conge', 'à bientôt', 'En partant, tu veux dire « à bientôt ».'),
  formula('gracias', 'politesse', 'merci', 'Un camarade te prête un stylo : tu le remercies.'),
  formula('de nada', 'politesse', 'de rien', 'On te remercie : tu réponds « de rien ».'),
  formula('perdón', 'politesse', 'pardon', 'Tu bouscules quelqu’un : tu demandes pardon.'),
  formula('¿qué tal?', 'nouvelles', 'comment ça va ?', 'Tu demandes à un camarade comment ça va.'),
  formula('bien, gracias', 'nouvelles', 'bien, merci', 'On te demande comment ça va : tu réponds « bien, merci ».'),
];

// ——— Se présenter ———

export const PERSONS = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'] as const;
export type Person = (typeof PERSONS)[number];

export const PRONOUN: Readonly<Record<Person, string>> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él / ella',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos / ellas',
};

/** Pronom réfléchi de chaque personne (DPD, pronoms atones). */
export const REFLEXIVE: Readonly<Record<Person, string>> = {
  yo: 'me',
  tu: 'te',
  el: 'se',
  nosotros: 'nos',
  vosotros: 'os',
  ellos: 'se',
};

/** Présent de « llamar » (DLE, conjugaison de « llamar »). */
export const LLAMAR: Readonly<Record<Person, string>> = {
  yo: 'llamo',
  tu: 'llamas',
  el: 'llama',
  nosotros: 'llamamos',
  vosotros: 'llamáis',
  ellos: 'llaman',
};

/** Prénoms fictifs, repris des exemples du programme, avec leur genre (pour les accords). */
export const GENDER = {
  Clara: 'f',
  Antonio: 'm',
  Inés: 'f',
  Javier: 'm',
  Alicia: 'f',
  Gonzalo: 'm',
} as const;
export type Name = keyof typeof GENDER;
export const NAMES = Object.keys(GENDER) as Name[];

// ——— Nombres ———

const UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve',
] as const;

const TENS: Readonly<Record<number, string>> = {
  3: 'treinta',
  4: 'cuarenta',
  5: 'cincuenta',
  6: 'sesenta',
  7: 'setenta',
  8: 'ochenta',
  9: 'noventa',
};

/** Nombre de 0 à 100 en toutes lettres (DPD, « cardinales »). */
export function numberWord(n: number): string {
  if (n === 100) return 'cien';
  const unit = UNITS[n];
  if (unit !== undefined) return unit;
  const ten = TENS[Math.floor(n / 10)];
  if (ten === undefined) throw new Error(`nombre hors liste : ${n}`);
  return n % 10 === 0 ? ten : `${ten} y ${UNITS[n % 10] ?? ''}`;
}

// ——— Alphabet et accent tonique ———

/** Lettres dont le nom est cité par le DPD. */
export const LETTERS: readonly { readonly letter: string; readonly names: readonly string[] }[] = [
  { letter: 'b', names: ['be', 'be larga', 'be alta', 'be grande'] },
  { letter: 'g', names: ['ge'] },
  { letter: 'h', names: ['hache'] },
  { letter: 'j', names: ['jota'] },
  { letter: 'ñ', names: ['eñe'] },
  { letter: 'q', names: ['cu'] },
  { letter: 'v', names: ['uve', 've', 've corta'] },
  { letter: 'w', names: ['uve doble', 'doble uve', 've doble', 'doble ve', 'doble u'] },
  { letter: 'x', names: ['equis'] },
  { letter: 'y', names: ['ye', 'i griega'] },
  { letter: 'z', names: ['zeta'] },
];

export interface Word {
  readonly syllables: readonly string[];
  /** Indice de la syllabe tonique. */
  readonly stress: number;
}

const word = (split: string, stress: number): Word => ({ syllables: split.split('-'), stress });

/** Mots avec accent écrit (exemples du DPD et lexique du programme). */
export const WRITTEN_ACCENT: readonly Word[] = [
  word('a-vión', 1),
  word('lá-piz', 0),
  word('pá-ja-ro', 0),
  word('sá-ba-do', 0),
  word('mé-di-co', 0),
  word('es-drú-ju-lo', 1),
  word('sa-lón', 1),
  word('in-glés', 1),
  word('fran-cés', 1),
  word('ja-món', 1),
];

/** Mots sans accent écrit : la terminaison indique la syllabe tonique. */
export const NO_ACCENT: readonly Word[] = [
  word('re-loj', 1),
  word('blan-co', 0),
  word('car-te-ra', 1),
  word('es-pa-ñol', 2),
  word('ca-mi-sa', 1),
  word('tor-tu-ga', 1),
  word('ca-ba-llo', 1),
  word('na-ran-ja', 1),
  word('co-mer', 1),
  word('ver-dad', 1),
  word('a-zul', 1),
  word('pan-ta-lo-nes', 2),
  word('her-ma-no', 1),
  word('na-dar', 1),
];
