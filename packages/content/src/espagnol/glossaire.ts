import type { SubjectTerm } from '../types.ts';

/** Glossaire de la matière : chaque mot difficile ou terme en gras d'un mémo y est défini. */
export const GLOSSAIRE: readonly SubjectTerm[] = [
  {
    id: 'formule-de-politesse',
    word: 'formules de politesse',
    forms: ['formule de politesse', 'formules de politesse'],
    definition: 'Expression toute faite pour saluer, remercier, s’excuser ou prendre congé.',
    example: '« Buenos días » et « gracias » sont des formules de politesse.',
  },
  {
    id: 'prendre-conge',
    word: 'prendre congé',
    forms: ['prendre congé', 'prends congé'],
    definition: 'Dire au revoir au moment de partir.',
    example: '« Hasta luego » sert à prendre congé.',
  },
  {
    id: 'verbe-pronominal',
    word: 'verbe pronominal',
    forms: ['verbe pronominal', 'verbes pronominaux'],
    definition: 'Verbe qui se conjugue avec un pronom de la même personne que le sujet.',
    example: 'llamarse : me llamo, te llamas.',
  },
  {
    id: 'pronom-reflechi',
    word: 'pronom réfléchi',
    forms: ['pronom réfléchi', 'pronoms réfléchis'],
    definition: 'Petit mot (me, te, se, nos, os, se) qui renvoie au sujet du verbe.',
    example: 'Dans « nos llamamos », « nos » renvoie à « nosotros ».',
  },
  {
    id: 'apocope',
    word: 'apocope',
    forms: ['apocope'],
    definition: 'Raccourcissement d’un mot : sa fin disparaît.',
    example: 'veintiuno devient veintiún devant « años ».',
  },
  {
    id: 'alphabet',
    word: 'alphabet',
    forms: ['alphabet', 'alphabets'],
    definition: 'La liste ordonnée des lettres d’une langue (en espagnol : abecedario).',
    example: 'L’alphabet espagnol contient la lettre ñ.',
  },
  {
    id: 'syllabe-tonique',
    word: 'syllabe tonique',
    forms: ['syllabe tonique', 'syllabes toniques'],
    definition: 'La syllabe d’un mot sur laquelle la voix insiste le plus.',
    example: 'Dans « camisa », la syllabe tonique est « mi ».',
  },
  {
    id: 'tilde',
    word: 'tilde',
    forms: ['tilde', 'tildes'],
    definition: 'En espagnol, l’accent écrit (´) posé sur une voyelle ; il montre la syllabe tonique.',
    example: 'Le mot « lápiz » porte une tilde sur le a.',
  },
  {
    id: 'aguda',
    word: 'aguda',
    forms: ['aguda', 'agudas'],
    definition: 'Mot dont la dernière syllabe est tonique.',
    example: '« reloj » est un mot aguda.',
  },
  {
    id: 'llana',
    word: 'llana',
    forms: ['llana', 'llanas'],
    definition: 'Mot dont l’avant-dernière syllabe est tonique.',
    example: '« blanco » est un mot llana.',
  },
  {
    id: 'esdrujula',
    word: 'esdrújula',
    forms: ['esdrújula', 'esdrújulas'],
    definition: 'Mot dont l’antépénultième syllabe (la troisième en partant de la fin) est tonique.',
    example: '« sábado » est un mot esdrújula.',
  },
];
