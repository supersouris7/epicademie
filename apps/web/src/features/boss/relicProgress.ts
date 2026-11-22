import { chaptersOf } from '@questeo/content';
import { playedGrade, type Grade, type Profile } from '@questeo/shared';
import { useBosses } from './api.ts';

/** Boss vaincus d'une matière (sur ceux de la classe jouée). Source unique du remplissage des reliques. */
export interface RelicProgress {
  readonly won: number;
  readonly max: number;
}

/** Fonction pure : compte les boss vaincus d'une matière parmi les records du joueur. */
export function relicProgressOf(
  subject: string,
  grade: Grade | undefined,
  records: readonly { readonly chapterId: string; readonly wins: number }[],
): RelicProgress {
  const ids = new Set(
    chaptersOf(subject, grade)
      .filter((c) => c.boss)
      .map((c) => c.id),
  );
  return { won: records.filter((r) => ids.has(r.chapterId) && r.wins > 0).length, max: ids.size };
}

/** Progression des boss par matière, pour la classe jouée du profil. */
export function useRelicProgress(profile: Profile): (subject: string) => RelicProgress {
  const { data } = useBosses(profile.id);
  const grade = playedGrade(profile.grade);
  return (subject) => relicProgressOf(subject, grade, data?.records ?? []);
}
