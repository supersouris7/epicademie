/**
 * Espagnol 5e, « Le présent des réguliers » (lot es-5e-02) : données citées. Chaque fait porte l'identifiant de sa
 * source (registre `sources.ts`) et une citation exacte du texte consulté le 26/11/2026 (copies d'archive
 * web.archive.org des pages de la Real Academia Española ; programme : annexe 9 de l'arrêté du 5 mai 2025).
 */
import type { Fait } from './se-presenter-faits.ts';

export type Group = 'ar' | 'er' | 'ir';
export const PERSONS = ['yo', 'tu', 'el', 'nosotros', 'vosotros', 'ellos'] as const;
export type Person = (typeof PERSONS)[number];

export const PRONOUN: Readonly<Record<Person, string>> = {
  yo: 'yo',
  tu: 'tú',
  el: 'él',
  nosotros: 'nosotros',
  vosotros: 'vosotros',
  ellos: 'ellos',
};

/** Verbes réguliers du lot : infinitif, sens, complément des phrases d'exercice. */
export const VERBES = {
  ar: [
    { inf: 'hablar', fr: 'parler', rest: 'español' },
    { inf: 'trabajar', fr: 'travailler', rest: 'en clase' },
    { inf: 'estudiar', fr: 'étudier', rest: 'en casa' },
    { inf: 'cantar', fr: 'chanter', rest: 'una canción' },
    { inf: 'bailar', fr: 'danser', rest: 'en la fiesta' },
    { inf: 'escuchar', fr: 'écouter', rest: 'música' },
  ],
  er: [
    { inf: 'comer', fr: 'manger', rest: 'una naranja' },
    { inf: 'beber', fr: 'boire', rest: 'agua' },
    { inf: 'aprender', fr: 'apprendre', rest: 'español' },
    { inf: 'leer', fr: 'lire', rest: 'un libro' },
  ],
  ir: [
    { inf: 'vivir', fr: 'vivre (habiter)', rest: 'en España' },
    { inf: 'escribir', fr: 'écrire', rest: 'un mensaje' },
    { inf: 'abrir', fr: 'ouvrir', rest: 'la puerta' },
  ],
} as const;

export type Verb = (typeof VERBES)[Group][number]['inf'];

/** Terminaisons du présent de l'indicatif, dans l'ordre des personnes. */
export const ENDINGS: Readonly<Record<Group, Readonly<Record<Person, string>>>> = {
  ar: { yo: 'o', tu: 'as', el: 'a', nosotros: 'amos', vosotros: 'áis', ellos: 'an' },
  er: { yo: 'o', tu: 'es', el: 'e', nosotros: 'emos', vosotros: 'éis', ellos: 'en' },
  ir: { yo: 'o', tu: 'es', el: 'e', nosotros: 'imos', vosotros: 'ís', ellos: 'en' },
};

/**
 * Présent relevé sur l'article de chaque verbe (yo, tú, él, nosotros, vosotros, ellos) : contrôle des formes de
 * `conjugaisons.generated.ts` utilisées par le lot.
 */
export const PRESENT_RELEVE: Readonly<Record<Verb, string>> = {
  hablar: 'hablo hablas habla hablamos habláis hablan',
  trabajar: 'trabajo trabajas trabaja trabajamos trabajáis trabajan',
  estudiar: 'estudio estudias estudia estudiamos estudiáis estudian',
  cantar: 'canto cantas canta cantamos cantáis cantan',
  bailar: 'bailo bailas baila bailamos bailáis bailan',
  escuchar: 'escucho escuchas escucha escuchamos escucháis escuchan',
  comer: 'como comes come comemos coméis comen',
  beber: 'bebo bebes bebe bebemos bebéis beben',
  aprender: 'aprendo aprendes aprende aprendemos aprendéis aprenden',
  leer: 'leo lees lee leemos leéis leen',
  vivir: 'vivo vives vive vivimos vivís viven',
  escribir: 'escribo escribes escribe escribimos escribís escriben',
  abrir: 'abro abres abre abrimos abrís abren',
};

/** Début des lignes du tableau « Presente » du dictionnaire, une par personne. */
const ROWS: Readonly<Record<Person, string>> = {
  yo: 'yo',
  tu: 'tú / vos',
  el: 'él, ella',
  nosotros: 'nosotros, nosotras',
  vosotros: 'vosotros, vosotras',
  ellos: 'ellos, ellas',
};

const fait = (id: string, sourceId: string, claim: string, quote: string): Fait => ({ id, sourceId, quote, claim });
const PROGRAMME = 'espagnol-college-2025';
const TONIQUES = 'rae-dpd-pronombres-tonicos';

const formFacts: Fait[] = (Object.keys(PRESENT_RELEVE) as Verb[]).flatMap((v) => {
  const forms = PRESENT_RELEVE[v].split(' ');
  return PERSONS.map((p, i) =>
    fait(`${v}-${p}`, `rae-dle-${v}`, `présent de « ${v} » avec « ${PRONOUN[p]} »`, `${ROWS[p]} | ${forms[i]}`),
  );
});

export const FAITS_PRESENT: readonly Fait[] = [
  fait(
    'programme-reguliers',
    PROGRAMME,
    'présent des verbes réguliers en -ar, -er, -ir au programme',
    'des verbes très usuels et réguliers en -ar/-er/-ir ;',
  ),
  fait(
    'programme-pronoms',
    PROGRAMME,
    'pronoms sujets : pour insister ou lever un doute',
    'Pronoms personnels sujets (pour insister, pour lever un doute sur la personne verbale).',
  ),
  fait(
    'modeles',
    'rae-dpd-apendice-1',
    'trois modèles de conjugaison régulière : amar, temer, partir',
    'tres verbos escogidos como modelo para la conjugación regular (amar, temer, partir)',
  ),
  ...formFacts,
  fait('pronom-yo', TONIQUES, '« yo » : 1re personne du singulier', 'sujeto |\nyo |\nnosotros/as |'),
  fait('pronom-tu', TONIQUES, '« tú » et « vosotros » : 2e personne', 'sujeto |\ntú, vos* |\nvosotros/as* |'),
  fait('pronom-el', TONIQUES, '« él », « usted » : 3e personne', 'masc. |\nél |\nusted** |\nellos |\nustedes** |'),
  fait('pronom-ella', TONIQUES, '« ella », « ellas » : féminin', 'fem. |\nella |\nellas |'),
  fait(
    'genre',
    TONIQUES,
    '« yo », « tú », « usted » ne varient pas en genre, les autres oui',
    'todos los pronombres personales tónicos tienen variación de género',
  ),
  fait(
    'omission',
    TONIQUES,
    'le sujet n’est pas obligatoire en espagnol',
    'El español es una lengua de sujeto no obligatorio',
  ),
  fait(
    'contraste',
    TONIQUES,
    'le pronom sujet s’exprime pour opposer',
    'El pronombre sujeto se hace explícito con finalidad contrastiva',
  ),
  fait(
    'ambiguite',
    TONIQUES,
    'le pronom sujet s’exprime pour lever une ambiguïté',
    'También se hace explícito a menudo el pronombre sujeto para deshacer ambigüedades',
  ),
  fait(
    'usted-politesse',
    'rae-dpd-usted',
    '« usted » sert au vouvoiement',
    'el singular usted es la forma empleada en la norma culta de América y de España para el tratamiento formal',
  ),
  fait(
    'usted-3e',
    'rae-dpd-usted',
    'avec « usted » sujet, le verbe est à la 3e personne',
    'si funciona como sujeto, el verbo debe ir en tercera persona',
  ),
  fait(
    'ustedes-amerique',
    'rae-dpd-usted',
    'en Amérique (et dans le sud de l’Espagne et aux Canaries), « ustedes » sert aussi entre proches',
    'ustedes es la única forma empleada para referirse a varios interlocutores, tanto en el tratamiento formal como en el informal',
  ),
  fait(
    'vosotros-espagne',
    'rae-dpd-vosotros',
    '« vosotros » : tutoiement de plusieurs personnes dans la plus grande partie de l’Espagne',
    'vosotros es la forma empleada en la mayor parte de España para el tratamiento informal',
  ),
  fait('tilde-tu', 'rae-dpd-tilde', '« tú » (pronom) porte un accent écrit', 'Tú ya me entiendes.'),
  fait('tilde-el', 'rae-dpd-tilde', '« él » (pronom) porte un accent écrit', 'Él se hace responsable.'),
];
