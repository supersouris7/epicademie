/** Outils communs aux notions d’anglais de 5e (lot an-5e-01). */
export interface Person {
  /** En début de phrase. */
  readonly text: string;
  /** Au milieu d’une phrase (question). */
  readonly mid: string;
  readonly pronoun: 'he' | 'she' | 'we' | 'they';
}
const person = (text: string, pronoun: Person['pronoun'], mid = text): Person => ({ text, mid, pronoun });

export const SINGLE: readonly Person[] = [
  person('Tom', 'he'),
  person('Emir', 'he'),
  person('Lisa', 'she'),
  person('Maya', 'she'),
  person('My brother', 'he', 'my brother'),
  person('My sister', 'she', 'my sister'),
];
export const SEVERAL: readonly Person[] = [
  person('My parents', 'they', 'my parents'),
  person('Tom and Lisa', 'they'),
  person('They', 'they', 'they'),
  person('We', 'we', 'we'),
];
export const PEOPLE: readonly Person[] = [...SINGLE, ...SEVERAL];
/** Prénoms inventés, pour les documents. */
export const NAMED = SINGLE.slice(0, 4);

export const isThird = (p: Person) => p.pronoun === 'he' || p.pronoun === 'she';

/** « My brother » dans la question : « your brother » (on s’adresse à la personne) est aussi correct. */
export const mids = (p: Person): readonly Person[] =>
  p.mid.startsWith('my ') ? [p, { ...p, mid: p.mid.replace('my ', 'your ') }] : [p];

/** Saisies acceptées : phrase avec ou sans point final. */
export const dotted = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}.`]);
/** Questions avec ou sans point d’interrogation (collé ou précédé d’une espace). */
export const asked = (forms: readonly string[]) => forms.flatMap((f) => [f, `${f}?`, `${f} ?`]);

export interface TextTrap {
  readonly text: string;
  readonly why: string;
}
/** Une erreur typique reste reconnue avec ou sans ponctuation finale. */
export const dottedTraps = (traps: readonly TextTrap[]) =>
  traps.flatMap((t) => dotted([t.text]).map((text) => ({ text, why: t.why })));
export const askedTraps = (traps: readonly TextTrap[]) =>
  traps.flatMap((t) => asked([t.text]).map((text) => ({ text, why: t.why })));

/** Éléments à ranger, cités dans leur ordre mélangé : l’énoncé reste distinct sans donner la réponse. */
export const listed = (items: readonly string[]) => items.map((w) => `« ${w} »`).join(' · ');

export const WRITTEN = 'Écrit pour l’exercice.';
