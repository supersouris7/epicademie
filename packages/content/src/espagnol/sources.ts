import type { Source } from '../sources-outils.ts';

/** Date de consultation des textes du lot es-5e-01 (copies d’archive web.archive.org des pages officielles). */
const CONSULTED_ES = '2026-11-26';

/** Article du Diccionario panhispánico de dudas (Real Academia Española). */
const dpd = (id: string, word: string, path: string = word): Source => ({
  id: `rae-dpd-${id}`,
  title: `Diccionario panhispánico de dudas, article « ${word} »`,
  publisher: 'Real Academia Española et Asociación de Academias de la Lengua Española',
  url: `https://www.rae.es/dpd/${encodeURIComponent(path)}`,
  textDate: '2026',
  consultedOn: CONSULTED_ES,
});

/** Article du Diccionario de la lengua española (Real Academia Española). */
const dle = (id: string, word: string): Source => ({
  id: `rae-dle-${id}`,
  title: `Diccionario de la lengua española, article « ${word} »`,
  publisher: 'Real Academia Española et Asociación de Academias de la Lengua Española',
  url: `https://dle.rae.es/${encodeURIComponent(word)}`,
  textDate: '2025',
  consultedOn: CONSULTED_ES,
});

/** Sources d’espagnol (registre : `sources.ts` à la racine du paquet). */
export const SOURCES: readonly Source[] = [
  {
    id: 'espagnol-college-2025',
    title: 'Programme d’espagnol pour les classes de collège (annexe 9 de l’arrêté du 5 mai 2025)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/sites/default/files/ensel621_annexe9.pdf',
    textDate: '2025-05-05',
    consultedOn: CONSULTED_ES,
  },
  dle('hola', 'hola'),
  dle('adios', 'adiós'),
  dle('dia', 'día'),
  dle('tarde', 'tarde'),
  dle('noche', 'noche'),
  dle('luego', 'luego'),
  dle('gracia', 'gracia'),
  dle('perdon', 'perdón'),
  dle('llamar', 'llamar'),
  dle('tener', 'tener'),
  // Lot es-5e-02 (présent des réguliers)
  ...[
    'hablar',
    'trabajar',
    'estudiar',
    'cantar',
    'bailar',
    'escuchar',
    'comer',
    'beber',
    'aprender',
    'leer',
    'vivir',
    'escribir',
    'abrir',
  ].map((v) => dle(v, v)),
  dpd('pronombres-tonicos', 'pronombres personales tónicos'),
  dpd('usted', 'usted'),
  dpd('vosotros', 'vosotros'),
  {
    id: 'rae-dpd-apendice-1',
    title: 'Diccionario panhispánico de dudas, apéndice 1 « Modelos de conjugación verbal » (1re édition)',
    publisher: 'Real Academia Española et Asociación de Academias de la Lengua Española',
    url: 'https://www.rae.es/dpd/apendices/apendice1.html',
    textDate: '2005',
    consultedOn: CONSULTED_ES,
  },
  dpd('abecedario', 'abecedario'),
  dpd('acento', 'acento'),
  dpd('tilde', 'tilde'),
  dpd('cardinales', 'cardinales'),
  dpd('pronombres-atonos', 'pronombres personales átonos'),
  dpd('letra-b', 'b'),
  dpd('letra-g', 'g'),
  dpd('letra-h', 'h'),
  dpd('letra-j', 'j'),
  dpd('letra-enye', 'ñ'),
  dpd('letra-q', 'q'),
  dpd('letra-v', 'v'),
  dpd('letra-w', 'w'),
  dpd('letra-x', 'x'),
  dpd('letra-y', 'y'),
  dpd('letra-z', 'z'),
  // Lot es-5e-03 (ser, estar, hay) : copies d’archive de 2023 et 2024 (dictionnaires) et de 2026 (Cervantes).
  ...['ser', 'estar', 'haber'].map((v) => ({ ...dle(v, v), textDate: '2023' })),
  ...['ser', 'estar', 'haber'].map((v) => ({ ...dpd(v, v), textDate: '2024' })),
  {
    id: 'cervantes-pcic-gramatica-a1-a2',
    title: 'Plan curricular del Instituto Cervantes, « Gramática. Inventario A1-A2 »',
    publisher: 'Instituto Cervantes',
    url: 'https://cvc.cervantes.es/ensenanza/biblioteca_ele/plan_curricular/niveles/02_gramatica_inventario_a1-a2.htm',
    textDate: '2026',
    consultedOn: CONSULTED_ES,
  },
];
