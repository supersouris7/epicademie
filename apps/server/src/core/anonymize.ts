/**
 * Anonymisation des textes libres (commentaires de signalement, messages d'erreur) : e-mails,
 * numéros de téléphone, liens et prénoms/pseudos donnés sont remplacés par « [masqué] ».
 * Fonctions pures, appliquées côté serveur avant tout stockage.
 */

export const MASK = '[masqué]';

const EMAIL = /[^\s@<>(),;]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu;
const URL_LIKE = /(?:\b[a-z][a-z0-9+.-]*:\/\/|\bwww\.)\S+/gi;
/** Au moins 8 chiffres, séparés ou non par espaces, points, tirets, parenthèses (avec « + » éventuel). */
const PHONE = /(?<![\p{L}\p{N}])\+?\d(?:[\s.\-()]?\d){7,}(?![\p{L}\p{N}])/gu;

/** Minuscule sans accent, caractère par caractère (la longueur est conservée pour repérer les positions). */
function fold(text: string): string {
  return Array.from(text, (c) => {
    const base = c.normalize('NFD')[0]?.toLowerCase() ?? c;
    return base.length === c.length ? base : c;
  }).join('');
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Masque les noms donnés (mots entiers, sans tenir compte de la casse ni des accents). */
function maskNames(text: string, names: readonly string[]): string {
  const terms = new Set<string>();
  for (const name of names) {
    const whole = fold(name.trim());
    if (whole.length >= 2) terms.add(whole);
    for (const part of whole.split(/[\s'’-]+/)) if (part.length >= 3) terms.add(part);
  }
  if (terms.size === 0) return text;
  const folded = fold(text);
  const alternatives = [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp);
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives.join('|')})(?![\\p{L}\\p{N}])`, 'gu');
  const ranges = [...folded.matchAll(re)].map((m) => [m.index, m.index + m[0].length] as const);
  let out = text;
  for (const [start, end] of ranges.reverse()) out = out.slice(0, start) + MASK + out.slice(end);
  return out;
}

/** Filtre un texte libre : e-mails, liens, téléphones, puis les noms de la famille. */
export function anonymizeText(text: string, names: readonly string[] = []): string {
  const generic = text.replace(EMAIL, MASK).replace(URL_LIKE, MASK).replace(PHONE, MASK);
  return maskNames(generic, names);
}
