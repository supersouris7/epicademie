import type { Grade } from '@epicademie/shared';
import { createRng } from './rng.ts';
import { autoDemo } from './explain.ts';
import { MATHS_CHAPTERS } from './maths/index.ts';
import { ANGLAIS_CHAPTERS } from './anglais/index.ts';
import { ESPAGNOL_CHAPTERS } from './espagnol/index.ts';
import { PHYSIQUE_CHAPTERS } from './physique/index.ts';
import { GEOGRAPHIE_CHAPTERS } from './geographie/index.ts';
import { HISTOIRE_CHAPTERS } from './histoire/index.ts';
import { skillLevels, type Chapter, type Level, type Question, type Skill } from './types.ts';

/**
 * Hors maths, pas encore de problèmes ni de pièges écrits pour les boss (décision du 21/11/2026) :
 * le combat est ouvert quand même, le boss pose les notions du chapitre (voir `battlePools`).
 */
const withBattle = (chapters: readonly Chapter[]): Chapter[] =>
  chapters.map((c) => (c.boss ? c : { ...c, boss: { problems: [], traps: [] } }));

export const CHAPTERS: readonly Chapter[] = [
  ...MATHS_CHAPTERS,
  ...withBattle(ANGLAIS_CHAPTERS),
  ...withBattle(ESPAGNOL_CHAPTERS),
  ...withBattle(PHYSIQUE_CHAPTERS),
  ...withBattle(GEOGRAPHIE_CHAPTERS),
  ...withBattle(HISTOIRE_CHAPTERS),
];

const skills = new Map<string, { skill: Skill; chapter: Chapter }>();
for (const chapter of CHAPTERS) {
  for (const skill of chapter.skills) {
    if (skills.has(skill.id)) throw new Error(`Identifiant de notion en double : ${skill.id}`);
    skills.set(skill.id, { skill, chapter });
  }
}
/** Problèmes et pièges des boss : générables, mais hors entraînement et hors répétition espacée. */
const bossSkills = new Map<string, { skill: Skill; chapter: Chapter }>();
for (const chapter of CHAPTERS) {
  for (const skill of [...(chapter.boss?.problems ?? []), ...(chapter.boss?.traps ?? [])]) {
    if (skills.has(skill.id) || bossSkills.has(skill.id)) throw new Error(`Identifiant en double : ${skill.id}`);
    bossSkills.set(skill.id, { skill, chapter });
  }
}

export const getSkill = (id: string) => skills.get(id)?.skill;
export const getChapterOfSkill = (id: string) => skills.get(id)?.chapter;
export const getChapter = (id: string) => CHAPTERS.find((c) => c.id === id);
/**
 * Parcours « Adulte » (remise à niveau, décision du 20/11/2026 : « pour les adultes pour qui
 * l'école c'est loin ») : une sélection ordonnée de chapitres déjà vérifiés, des bases utiles au
 * quotidien vers le collège. Aucun contenu nouveau : chaque chapitre garde sa classe d'origine.
 */
export const ADULT_PATHS: Readonly<Partial<Record<string, readonly string[]>>> = {
  maths: [
    'm6-numeration',
    'm5-calcul',
    'm5-operations',
    'm6-fractions',
    'm6-pourcentages',
    'm4-proportionnalite',
    'mcm2-mesures',
    'm6-durees',
    'm6-aires',
    'm6-volumes',
    'm5-relatifs',
    'm4-litteral',
    'm4-triangles',
    'm4-statistiques',
    'm5-probabilites',
    'm3-proportionnalite',
  ],
};

/** Chapitres d'une matière, d'une classe donnée (Adulte : son parcours) ou de toutes. */
export const chaptersOf = (subject: string, grade?: Grade): Chapter[] => {
  if (grade === 'adulte') {
    return (ADULT_PATHS[subject] ?? []).flatMap(
      (id) => CHAPTERS.find((c) => c.id === id && c.subject === subject) ?? [],
    );
  }
  return CHAPTERS.filter((c) => c.subject === subject && (grade === undefined || c.grade === grade));
};
/** Classes qui ont du contenu dans une matière, dans l'ordre de la scolarité (Adulte en dernier). */
export const gradesOf = (subject: string): Grade[] => {
  const order: readonly Grade[] = ['cm1', 'cm2', '6e', '5e', '4e', '3e', 'adulte'];
  return order.filter((g) => chaptersOf(subject, g).length > 0);
};
export const allSkillIds = () => [...skills.keys()];

/** Notion d'entraînement ou question de boss (pour l'affichage et la correction). */
export const getAnySkill = (id: string) => skills.get(id)?.skill ?? bossSkills.get(id)?.skill;
export const isBossSkill = (id: string) => bossSkills.has(id);
/** Chapitre d'une notion d'entraînement ou d'une question de boss (suivi des apprentissages). */
export const chapterOfAnySkill = (id: string) => (skills.get(id) ?? bossSkills.get(id))?.chapter;
/** Classe d'une notion d'entraînement ou d'une question de boss. */
export const gradeOfSkill = (id: string): Grade | undefined => (skills.get(id) ?? bossSkills.get(id))?.chapter.grade;

/**
 * Chapitre gratuit : le 1er chapitre de chaque classe dans chaque matière (version gratuite,
 * décision du 20/11/2026). Les autres chapitres demandent l'abonnement familial.
 */
export const isFreeChapter = (chapterId: string): boolean => {
  const chapter = getChapter(chapterId);
  return chapter !== undefined && chaptersOf(chapter.subject, chapter.grade)[0]?.id === chapter.id;
};

/** Toutes les notions (entraînement et questions de boss), avec leur chapitre. */
export const allSkillEntries = () => [
  ...[...skills.values()].map((e) => ({ ...e, boss: false })),
  ...[...bossSkills.values()].map((e) => ({ ...e, boss: true })),
];

/** Chapitres qui ont un combat de boss. */
export const bossChapters = () => CHAPTERS.filter((c) => c.boss);

/** Générateurs du combat d'un chapitre (mobs = notions d'entraînement). */
export function battlePools(chapterId: string) {
  const chapter = getChapter(chapterId);
  if (!chapter?.boss) return null;
  const mobs = chapter.skills.map((s) => s.id);
  const own = (list: readonly Skill[]) => (list.length > 0 ? list.map((s) => s.id) : mobs);
  // Sans problèmes ni pièges écrits pour ce boss : il pose les notions du chapitre.
  return { mobs, problems: own(chapter.boss.problems), traps: own(chapter.boss.traps) };
}

/** Niveau maximal d'une notion (3 si elle est inconnue). */
export const maxLevelOf = (skillId: string): Level =>
  skillLevels((skills.get(skillId) ?? bossSkills.get(skillId))?.skill);

/** Génère la question (déterministe pour un triplet notion / niveau / graine ; niveau borné à celui de la notion). */
export function generate(skillId: string, level: Level, seed: number): Question {
  const entry = skills.get(skillId) ?? bossSkills.get(skillId);
  if (!entry) throw new Error(`Notion inconnue : ${skillId}`);
  level = Math.min(level, skillLevels(entry.skill)) as Level;
  const draft = entry.skill.generate(createRng(seed), level);
  const demo = draft.demo ?? autoDemo(draft, entry.chapter);
  return { traps: [], targetSeconds: 20, ...draft, ...(demo ? { demo } : {}), skillId, level, seed };
}
