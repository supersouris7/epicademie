import type { SubjectTerm } from '../types.ts';

/** Glossaire de la matière : chaque mot difficile ou terme en gras d'un mémo y est défini. */
export const GLOSSAIRE: readonly SubjectTerm[] = [
  {
    id: 'type-de-phrase',
    word: 'type de phrase',
    forms: ['types de phrases', 'type', 'types'],
    definition: 'Ce que la phrase fait : elle informe, elle pose une question ou elle donne un ordre.',
    example: 'Il y a trois types : déclaratif, interrogatif, impératif.',
  },
  {
    id: 'phrase-declarative',
    word: 'phrase déclarative',
    forms: ['phrases déclaratives', 'déclarative', 'déclaratives', 'déclaratif'],
    definition: 'Phrase qui donne une information. Elle dit ce qui est, sans poser de question ni donner d’ordre.',
    example: 'Le chat dort sur le canapé.',
  },
  {
    id: 'phrase-interrogative',
    word: 'phrase interrogative',
    forms: ['phrases interrogatives', 'interrogative', 'interrogatives', 'interrogatif'],
    definition: 'Phrase qui pose une question. À l’écrit, elle se termine par un point d’interrogation.',
    example: 'Où as-tu rangé ton cahier ?',
  },
  {
    id: 'phrase-imperative',
    word: 'phrase impérative',
    forms: ['phrases impératives', 'impérative', 'impératives', 'impératif', 'injonctif'],
    definition: 'Phrase qui donne un ordre ou un conseil. Le verbe est à l’impératif, souvent sans sujet.',
    example: 'Range ta chambre.',
  },
  {
    id: 'forme-negative',
    word: 'forme négative',
    forms: ['négative', 'négation', 'phrase négative'],
    definition:
      'Forme d’une phrase qui dit que quelque chose n’est pas, ne se fait pas. Le verbe est entouré de deux mots.',
    example: 'Le chien ne dort pas.',
  },
  {
    id: 'forme-exclamative',
    word: 'forme exclamative',
    forms: ['exclamative', 'phrase exclamative'],
    definition:
      'Forme d’une phrase qui exprime une émotion vive (joie, surprise…). Elle se termine par un point d’exclamation.',
    example: 'Quel beau dessin !',
  },
  {
    id: 'inversion',
    word: 'inversion du sujet',
    forms: ['inversion', 'sujet inversé'],
    definition: 'Le sujet se place après le verbe, relié par un trait d’union.',
    example: 'Tu viens ? devient Viens-tu ?',
  },
  {
    id: 'est-ce-que',
    word: 'est-ce que',
    forms: ['est-ce qu’', "est-ce qu'", 'est-ce que…'],
    definition: 'Petit groupe de mots placé au début d’une phrase pour en faire une question. Le sujet ne bouge pas.',
    example: 'Est-ce que tu viens ?',
  },
  {
    id: 'intonation',
    word: 'intonation',
    forms: ['intonation ascendante'],
    definition: 'La mélodie de la voix. Pour une question, la voix monte à la fin de la phrase.',
    example: 'Tu viens ? (la voix monte sur « viens »)',
  },
  {
    id: 'ponctuation',
    word: 'ponctuation',
    forms: ['signe de ponctuation', 'signes de ponctuation'],
    definition:
      'Les petits signes qui organisent un texte : le point, la virgule, le point d’interrogation, le point d’exclamation.',
    example: '. , ? !',
  },
  {
    id: 'point-d-interrogation',
    word: 'point d’interrogation',
    forms: ["point d'interrogation"],
    definition: 'Le signe « ? ». Il termine une phrase qui pose une question.',
    example: 'Quelle heure est-il ?',
  },
  {
    id: 'point-d-exclamation',
    word: 'point d’exclamation',
    forms: ["point d'exclamation"],
    definition: 'Le signe « ! ». Il termine une phrase qui exprime une émotion vive.',
    example: 'Quelle belle surprise !',
  },
  {
    id: 'verbe',
    word: 'verbe',
    forms: ['verbes'],
    definition: 'Le mot qui dit ce que quelqu’un fait ou ce qu’il est. Il change selon le sujet et le temps.',
    example: 'Le chien dort.',
  },
  {
    id: 'sujet',
    word: 'sujet',
    forms: ['sujets'],
    definition: 'Le mot ou le groupe de mots qui dit qui fait l’action du verbe.',
    example: 'Le chien dort. (le sujet est « le chien »)',
  },
  {
    id: 'emotion',
    word: 'émotion vive',
    forms: ['émotion'],
    definition: 'Un sentiment fort : joie, surprise, peur, admiration…',
    example: 'Quelle belle surprise !',
  },
];
