import { SUBJECT_GLOSSARIES, boldTerms, isDefined } from './glossaires.ts';
import { isReviewed } from './relectures.ts';
import { getSource, isAllowedUrl, type Source } from './sources.ts';
import { skillLevels, skillVersion, type Chapter, type Relecture, type Skill } from './types.ts';

/**
 * Contrôles de couverture des contenus (docs/adr/0034, points 6 à 8). S'appliquent aux notions à 5 niveaux :
 * les notions historiques (3 niveaux) sont migrées lot par lot, leur nombre ne peut que diminuer
 * (voir couverture.test.ts).
 */
export interface CoverageIssue {
  readonly skillId: string;
  readonly code: 'source-absente' | 'source-inconnue' | 'source-url' | 'relecture-absente' | 'terme-non-defini';
  readonly message: string;
}

export interface CoverageEntry {
  readonly skill: Skill;
  readonly chapter: Pick<Chapter, 'subject'>;
}

/** Notion concernée par les contrôles stricts : 5 niveaux. */
export const isStrict = (skill: Skill): boolean => skillLevels(skill) === 5;

/** Sources du registre citées par la notion qui n'existent pas ou dont l'URL est hors liste. */
export function sourceIssues(skill: Skill, registry?: readonly Source[]): CoverageIssue[] {
  const ids = skill.lesson.sources ?? [];
  if (ids.length === 0) {
    return [{ skillId: skill.id, code: 'source-absente', message: 'aucune source citée (Lesson.sources)' }];
  }
  return ids.flatMap((id): CoverageIssue[] => {
    const source = registry ? registry.find((s) => s.id === id) : getSource(id);
    if (!source)
      return [{ skillId: skill.id, code: 'source-inconnue', message: `source « ${id} » absente du registre` }];
    return isAllowedUrl(source.url)
      ? []
      : [{ skillId: skill.id, code: 'source-url', message: `URL hors domaines autorisés : ${source.url}` }];
  });
}

/** Relecture « ok » à la version courante, hors maths. */
export function reviewIssues(entry: CoverageEntry, list?: readonly Relecture[]): CoverageIssue[] {
  if (entry.chapter.subject === 'maths') return [];
  const version = skillVersion(entry.skill);
  return isReviewed(entry.skill.id, version, list)
    ? []
    : [
        {
          skillId: entry.skill.id,
          code: 'relecture-absente',
          message: `pas de relecture « ok » à la version ${version}`,
        },
      ];
}

/** Termes en gras du mémo absents du glossaire de la matière. */
export function glossaryIssues(entry: CoverageEntry): CoverageIssue[] {
  const glossary = SUBJECT_GLOSSARIES[entry.chapter.subject] ?? [];
  return entry.skill.lesson.memo
    .flatMap(boldTerms)
    .filter((t) => !isDefined(t, glossary))
    .map((t) => ({ skillId: entry.skill.id, code: 'terme-non-defini' as const, message: `« ${t} » non défini` }));
}

/** Tous les contrôles d'une notion à 5 niveaux (aucun pour une notion historique). */
export function auditSkill(entry: CoverageEntry, relectures?: readonly Relecture[]): CoverageIssue[] {
  if (!isStrict(entry.skill)) return [];
  return [...sourceIssues(entry.skill), ...reviewIssues(entry, relectures), ...glossaryIssues(entry)];
}
