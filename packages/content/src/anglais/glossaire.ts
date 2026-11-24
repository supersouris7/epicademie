import type { SubjectTerm } from '../types.ts';

/** Glossaire de la matière : chaque mot difficile ou terme en gras d'un mémo y est défini. */
export const GLOSSAIRE: readonly SubjectTerm[] = [
  {
    id: 'saluer',
    word: 'saluer',
    forms: ['saluer', 'salue', 'saluons'],
    definition: 'Dire bonjour ou salut à quelqu’un quand on le voit.',
    example: 'En anglais, tu salues avec « Hello! » ou « Hi! ».',
  },
  {
    id: 'prendre-conge',
    word: 'prendre congé',
    forms: ['prendre congé', 'prends congé'],
    definition: 'Dire au revoir à quelqu’un quand on s’en va.',
    example: 'Pour prendre congé, tu dis « Bye for now! ».',
  },
  {
    id: 'contraction',
    word: 'contraction',
    forms: ['contraction', 'contractions'],
    definition: 'Deux mots raccourcis en un seul, avec une apostrophe.',
    example: 'What’s est la contraction de What is. I’m est la contraction de I am.',
  },
  {
    id: 'adjectif-possessif',
    word: 'adjectif possessif',
    forms: ['adjectif possessif', 'adjectifs possessifs'],
    definition: 'Petit mot qui dit à qui appartient une chose : mon, ton, son…',
    example: 'En anglais, « your » veut dire « ton » ou « ta » : your name.',
  },
  {
    id: 'verbe-be',
    word: 'verbe be',
    forms: ['verbe be', 'be'],
    definition: 'Le verbe « être » en anglais : I am, you are, he is…',
    example: 'I’m nine = je suis neuf (j’ai neuf ans).',
  },
  {
    id: 'do',
    word: 'do',
    forms: ['do'],
    definition: 'Petit mot qui aide à poser une question au présent (avec I, you, we, they).',
    example: 'Where do you live? Le mot « do » aide à poser la question.',
  },
  {
    id: 'dizaines',
    word: 'dizaines',
    forms: ['dizaine', 'dizaines'],
    definition: 'Les nombres ronds : 10, 20, 30, 40…',
    example: 'En anglais : ten, twenty, thirty, forty.',
  },
  {
    id: 'tiret',
    word: 'tiret',
    forms: ['tiret', 'tirets'],
    definition: 'Le petit trait « - » qui relie deux mots.',
    example: 'twenty-one s’écrit avec un tiret entre twenty et one.',
  },
];
