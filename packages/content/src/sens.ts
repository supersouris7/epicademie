/**
 * « Sens des matières » (docs/contenus/README.md) : règles contrôlées en CI et choix des phrases
 * montrées à l'enfant (après une réussite, à l'ouverture d'un chapitre, dans son progrès).
 */
import { getSource, isAllowedUrl } from './sources.ts';
import { SENS_LABELS, type Chapter, type Sens, type Skill } from './types.ts';

/** Longueur maximale d'une phrase de sens (une phrase courte, lisible d'un coup d'œil). */
export const SENS_MAX_LENGTH = 120;

/** Défauts des sens d'une notion (vide : conforme). L'absence de sens n'en est pas un (champ facultatif). */
export function sensIssues(skill: Pick<Skill, 'sens'>): string[] {
  return (skill.sens ?? []).flatMap((s) => {
    const source = getSource(s.source);
    return [
      !(s.type in SENS_LABELS) && `type inconnu : ${s.type}`,
      (s.text.length === 0 || s.text.length > SENS_MAX_LENGTH) && `longueur (${s.text.length}) : ${s.text}`,
      !source && `source inconnue : ${s.source}`,
      source && !isAllowedUrl(source.url) && `source non autorisée : ${source.url}`,
      s.citation.trim() === '' && `citation vide : ${s.text}`,
    ].filter((issue): issue is string => typeof issue === 'string');
  });
}

/** Un sens de la notion ; `seed` fait tourner les phrases d'une fois à l'autre. */
export const pickSens = (skill: Pick<Skill, 'sens'> | undefined, seed = 0): Sens | undefined =>
  skill?.sens?.[Math.abs(seed) % skill.sens.length];

/** « Pourquoi apprendre ça ? » : au plus `max` phrases différentes du chapitre, de types variés d'abord. */
export function chapterSens(chapter: Pick<Chapter, 'skills'>, max = 2): Sens[] {
  const all = [...new Map(chapter.skills.flatMap((s) => s.sens ?? []).map((s) => [s.text, s])).values()];
  const firstOfType = all.filter((s, i) => all.findIndex((o) => o.type === s.type) === i);
  return [...firstOfType, ...all.filter((s) => !firstOfType.includes(s))].slice(0, max);
}
