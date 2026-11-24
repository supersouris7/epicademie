/**
 * Registre des sources (docs/adr/0034, point 6) : chaque notion (`Lesson.sources`) et chaque fait cite
 * un identifiant de ce registre. Seuls les domaines institutionnels de la liste ci-dessous sont admis.
 */
export interface Source {
  readonly id: string;
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
  /** Date du texte (AAAA-MM-JJ, ou AAAA-MM / AAAA si le jour est inconnu). */
  readonly textDate: string;
  /** Date de consultation (AAAA-MM-JJ). */
  readonly consultedOn: string;
}

/** Domaines institutionnels autorisés (un domaine couvre ses sous-domaines). */
export const ALLOWED_DOMAINS: readonly string[] = [
  'education.gouv.fr',
  'eduscol.education.fr',
  'legifrance.gouv.fr',
  'cnrtl.fr',
  'academie-francaise.fr',
  'bnf.fr',
  'insee.fr',
  'ign.fr',
  'europa.eu',
  'vie-publique.fr',
  'assemblee-nationale.fr',
  'senat.fr',
  'britishcouncil.org',
  'rae.es',
  'cervantes.es',
  'bipm.org',
  'cnrs.fr',
  'inserm.fr',
  'santepubliquefrance.fr',
  'meteofrance.fr',
  'mnhn.fr',
  'cnes.fr',
  'ademe.fr',
  'brgm.fr',
];

/** L'URL est en https et son domaine (ou un sous-domaine) est dans la liste autorisée. */
export function isAllowedUrl(url: string): boolean {
  const m = /^https:\/\/([a-z0-9.-]+)(?::\d+)?(?:[/?#]|$)/i.exec(url);
  if (!m) return false;
  const host = (m[1] ?? '').toLowerCase();
  return ALLOWED_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
}

const CONSULTED = '2026-11-24';

export const SOURCES: readonly Source[] = [
  {
    id: 'maths-cycle4-2026',
    title: 'Programme de mathématiques du cycle 4 (arrêté du 18 février 2026, BO n° 10)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/bo/2026/Hebdo10/MENE2602912A',
    textDate: '2026-02-18',
    consultedOn: CONSULTED,
  },
  {
    id: 'cycle3-2020',
    title: 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020 et BOEN n° 25 du 22 juin 2023)',
    publisher: 'Éduscol',
    url: 'https://eduscol.education.fr/document/50990/download',
    textDate: '2023-06-22',
    consultedOn: CONSULTED,
  },
  {
    id: 'maths-cycle3-2025',
    title: 'Programme de mathématiques du cycle 3 (CM1, CM2, 6e)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/sites/default/files/ensel620_annexe2-v2.pdf',
    textDate: '2025-04-17',
    consultedOn: CONSULTED,
  },
  {
    id: 'emc-2024',
    title: 'Programme d’enseignement moral et civique du CP à la terminale',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/sites/default/files/ensel934_annexe_ok.pdf',
    textDate: '2024-06-13',
    consultedOn: CONSULTED,
  },
  {
    id: 'francais-cycle3-2025',
    title: 'Programme de français du cycle 3 (CM1, CM2, 6e)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/sites/default/files/ensel620_annexe1.pdf',
    textDate: '2025-04-17',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-exclamation',
    title: 'Trésor de la langue française informatisé, article « exclamation »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/exclamation',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-interrogation',
    title: 'Trésor de la langue française informatisé, article « interrogation »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/interrogation',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'lv-college-2025',
    title: 'Programmes de langues vivantes étrangères du collège (arrêté du 5 mai 2025, BO n° 22)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/bo/2025/Hebdo22/MENE2504621A',
    textDate: '2025-05-05',
    consultedOn: CONSULTED,
  },
  {
    id: 'anglais-college-2025',
    title: 'Programme d’anglais pour les classes de collège (annexe 3 de l’arrêté du 5 mai 2025)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/sites/default/files/ensel621_annexe3.pdf',
    textDate: '2025-05-05',
    consultedOn: CONSULTED,
  },
  {
    id: 'si-prefixes-bipm',
    title: 'Les préfixes du SI (multiples et sous-multiples décimaux des unités)',
    publisher: 'Bureau international des poids et mesures (BIPM)',
    url: 'https://www.bipm.org/fr/measurement-units/si-prefixes',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'british-council-irregular-verbs',
    title: 'LearnEnglish, Irregular verbs',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/irregular-verbs',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-meeting-new-people',
    title: 'LearnEnglish, Speaking A1 : Meeting new people (transcription de la vidéo)',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/skills/speaking/a1-speaking/meeting-new-people',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-where-from',
    title: 'LearnEnglish, Speaking A1 : Talking about where you’re from (transcription de la vidéo)',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/skills/speaking/a1-speaking/talking-about-where-youre',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-question-forms',
    title: 'LearnEnglish, Grammar A1-A2 : Question forms',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/grammar/a1-a2-grammar/question-forms',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-verb-be',
    title: 'LearnEnglish, English grammar reference : Verb be',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/verb-be',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-possessives-adjectives',
    title: 'LearnEnglish, English grammar reference : Possessives: adjectives',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/grammar/english-grammar-reference/possessives-adjectives',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-flashcards-colours',
    title: 'LearnEnglish Kids, Colours flashcards',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/sites/kids/files/attachment/flashcards-colours.pdf',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-flashcards-weather',
    title: 'LearnEnglish Kids, Weather flashcards',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/sites/kids/files/attachment/flashcards-weather.pdf',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-adjectives',
    title: 'LearnEnglish Kids, Grammar practice : Adjectives',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice/adjectives',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-prepositions-time',
    title: 'LearnEnglish Kids, Grammar practice : Prepositions of time',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice/prepositions-time',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-prepositions-time',
    title: 'LearnEnglish, Grammar A1-A2 : Prepositions of time',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/grammar/a1-a2-grammar/prepositions-time',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-lunch-menu',
    title: 'LearnEnglish Kids, Level 1 reading : School lunch menu',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/read-write/reading-practice/level-1-reading/school-lunch-menu',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-halloween-invitation',
    title: 'LearnEnglish Kids, Level 1 reading : Halloween party invitation',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/read-write/reading-practice/level-1-reading/halloween-party-invitation',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-sports-day',
    title: 'LearnEnglish Kids, Level 1 reading : Sports day certificates',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/read-write/reading-practice/level-1-reading/sports-day-certificates',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-song-year',
    title: 'LearnEnglish Kids, Songs : Time for another year (paroles)',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/sites/kids/files/attachment/songs-time-for-another-year-lyrics.pdf',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-spring-winter',
    title: 'LearnEnglish Kids, Poems : Spring to winter (transcription)',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/listen-watch/poems/spring-winter',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bc-british-american',
    title:
      'LearnEnglish, Grammar reference : British English and American English (page archivée, web.archive.org, 2012)',
    publisher: 'British Council',
    url: 'https://learnenglish.britishcouncil.org/en/grammar-reference/british-english-and-american-english',
    textDate: '2011',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-weather-live',
    title: 'LearnEnglish Kids, Level 1 writing : The weather where I live',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/read-write/writing-practice/level-1-writing/weather-where-i-live',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-weather-your-turn',
    title: 'LearnEnglish Kids, Your turn : Weather',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/read-write/your-turn/weather',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-flashcards-1-12',
    title: 'LearnEnglish Kids, Numbers flashcards 1-12',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/sites/kids/files/attachment/flashcards-numbers-1-12.pdf',
    textDate: '2016',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-flashcards-13-24',
    title: 'LearnEnglish Kids, Numbers flashcards 13-24',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/sites/kids/files/attachment/flashcards-numbers-13-24.pdf',
    textDate: '2016',
    consultedOn: CONSULTED,
  },
  {
    id: 'bck-worksheet-10-100',
    title: 'LearnEnglish Kids, Numbers 10-100 worksheet (answers)',
    publisher: 'British Council',
    url: 'https://learnenglishkids.britishcouncil.org/sites/kids/files/attachment/worksheets-numbers-10-100-answers.pdf',
    textDate: '2016',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-fleuve',
    title: 'Trésor de la langue française informatisé, article « fleuve »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/fleuve',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-massif',
    title: 'Trésor de la langue française informatisé, article « massif »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/massif',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-montagne',
    title: 'Trésor de la langue française informatisé, article « montagne »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/montagne',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-commune',
    title: 'Trésor de la langue française informatisé, article « commune »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/commune',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'cnrtl-paysage',
    title: 'Trésor de la langue française informatisé, article « paysage »',
    publisher: 'CNRTL (CNRS, ATILF)',
    url: 'https://www.cnrtl.fr/definition/paysage',
    textDate: '2026',
    consultedOn: CONSULTED,
  },
  {
    id: 'insee-cog-2025',
    title: 'Code officiel géographique au 1er janvier 2025 (régions)',
    publisher: 'INSEE',
    url: 'https://www.insee.fr/fr/information/8377162',
    textDate: '2025-01-01',
    consultedOn: CONSULTED,
  },
];

export const getSource = (id: string): Source | undefined => SOURCES.find((s) => s.id === id);
