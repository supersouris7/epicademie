/**
 * Type et fabriques de sources partagés par les registres de chaque matière (`sources.ts`). Une fabrique ou une date
 * propre à une seule matière reste dans son fichier.
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

export const CONSULTED = '2026-11-24';

/** Textes relevés pour le lot ge-cm2-01 (copies d’archive web.archive.org des pages officielles). */
export const CONSULTED_GE_CM2 = '2026-11-25';

/** Article du Trésor de la langue française informatisé (CNRTL). */
export const tlfi = (id: string, word: string, path: string): Source => ({
  id: `cnrtl-${id}`,
  title: `Trésor de la langue française informatisé, article « ${word} »`,
  publisher: 'CNRTL (CNRS, ATILF)',
  url: `https://www.cnrtl.fr/definition/${path}`,
  textDate: '2026',
  consultedOn: '2026-11-25',
});

/** Article du Dictionnaire de l’Académie française (9e édition), publié par le CNRTL. */
export const academie = (id: string, word: string): Source => ({
  id: `academie-${id}`,
  title: `Dictionnaire de l’Académie française (9e édition), article « ${word} »`,
  publisher: 'Académie française, publié par le CNRTL',
  url: `https://www.cnrtl.fr/definition/academie9/${encodeURIComponent(word)}`,
  textDate: '2026',
  consultedOn: '2026-11-25',
});
