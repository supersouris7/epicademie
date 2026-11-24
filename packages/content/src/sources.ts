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
];

export const getSource = (id: string): Source | undefined => SOURCES.find((s) => s.id === id);
