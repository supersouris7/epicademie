/**
 * Anglais 6e, « Le présent simple » (lot an-6e-01) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages du British Council ; programme d'anglais du collège).
 * Les espaces et retours à la ligne sont réduits à une espace.
 *
 * Programme (6e, A1 / A1+) : présent simple, 3e personne du singulier, phrases négatives et (A1+) interrogatives.
 * Les listes du programme sont indicatives. Les personnages et les phrases des exercices sont inventés.
 */
import type { Fait } from './presentation-faits.ts';

const fait = (id: string, sourceId: string, quote: string, claim: string): Fait => ({ id, sourceId, quote, claim });
const PROG = 'anglais-college-2025';
const REF = 'bc-present-simple';
const A1 = 'bc-present-simple-a1';
const QN = 'bc-questions-negatives';

export const FAITS: readonly Fait[] = [
  fait(
    'programme-present',
    PROG,
    'Le présent simple : connaitre le présent des verbes les plus courants ainsi que les auxiliaires be et have',
    'Le présent simple est au programme de 6e.',
  ),
  fait(
    'programme-3e',
    PROG,
    'La 3e personne du singulier : he sleeps, she rides her bike, she brushes, he goes, he tidies, she doesn’t live, etc.',
    '3e personne : sleeps, rides, brushes, goes, tidies ; négation « doesn’t live ».',
  ),
  fait(
    'programme-phrases',
    PROG,
    'Former des phrases simples (affirmatives, négatives avec not et (A1+) interrogatives)',
    'Phrases affirmatives, négatives et interrogatives au programme.',
  ),
  fait('programme-question', PROG, 'Do you know its capital city?', 'Exemple officiel de question avec do.'),
  fait('base', REF, 'The present tense is the base form of the verb: I work in London.', 'Au présent : la base.'),
  fait(
    'troisieme-s',
    REF,
    'But with the third person singular (she/he/it), we add an –s: She works in London.',
    'Avec she, he, it : on ajoute -s.',
  ),
  fait(
    'habitude',
    REF,
    'something that happens regularly in the present: I play football every weekend.',
    'Le présent simple dit une habitude.',
  ),
  fait(
    'vrai',
    A1,
    'We can also use it for things which are generally true.',
    'Le présent simple dit aussi ce qui est vrai en général.',
  ),
  fait(
    'orthographe',
    A1,
    'Remember that we add s or es for he, she and it. Sometimes we also change y to i.',
    '-s ou -es avec he, she, it ; parfois y devient i.',
  ),
  fait('finishes', A1, 'She finishes work early on Fridays.', 'finish → finishes.'),
  fait('studies', A1, 'My brother studies at university.', 'study → studies.'),
  fait('starts', A1, "My favourite TV show starts at 8 o'clock.", 'start → starts.'),
  fait('eats', A1, 'He/she/it eats meat.', 'eat → eats.'),
  fait('phones', A1, 'My dad phones me every day.', 'phone → phones.'),
  fait(
    'irreguliers',
    A1,
    'The he, she and it forms for have, do and go are irregular. He has a flat in the city centre. She does yoga on Tuesdays. My dog goes for a walk every morning.',
    'have → has, do → does, go → goes.',
  ),
  fait('plays', REF, 'Who plays football at the weekend?', 'play → plays.'),
  fait('comes', REF, 'She/He comes from … .', 'come → comes.'),
  fait(
    'negation-regle',
    REF,
    "We use do and does to make negatives with the present simple. We use doesn't for the third person singular (she/he/it) and don't for the others.",
    'Négation : doesn’t avec he, she, it ; don’t avec les autres.',
  ),
  fait('negation-contraction', REF, "I like tennis but I don't like football. (don't = do not)", 'don’t = do not.'),
  fait(
    'negation-doesnt',
    REF,
    "John doesn't live in Manchester. (doesn't = does not)",
    'doesn’t = does not ; le verbe reste à la base.',
  ),
  fait(
    'negation-sauf-be',
    QN,
    'For all verbs except be and have, we use do/does + not or did + not to make negatives in the present simple and past simple',
    'La négation avec do ou does ne concerne pas be (have suit deux modèles).',
  ),
  fait(
    'have-deux-modeles',
    QN,
    'We make questions and negatives with have in two ways. Usually we use do/does or did',
    'Avec have, on emploie d’habitude do ou does ; l’autre forme est aussi acceptée.',
  ),
  fait('have-sans-do', QN, "She hasn't any money.", 'Autre négation possible avec have : hasn’t.'),
  fait('have-question', QN, 'Has she enough money?', 'Autre question possible avec have : Has… ?'),
  fait(
    'question-regle',
    REF,
    'We use do and does to make questions with the present simple. We use does for the third person singular (she/he/it) and do for the others.',
    'Question : does avec he, she, it ; do avec les autres.',
  ),
  fait('question-base', QN, 'He works hard.> Does he work hard?', 'Après does, le verbe revient à la base.'),
  fait(
    'question-reponses',
    A1,
    "We can answer questions with Yes, I/you/we/they do, Yes, he/she/it does, or No, I/you/we/they don't or No, he/she/it doesn't.",
    'Réponses courtes avec do, does, don’t, doesn’t.',
  ),
  fait(
    'question-mot',
    A1,
    'We can also put question words like what, where, who or what time before do or does.',
    'Le mot interrogatif se place devant do ou does.',
  ),
];
