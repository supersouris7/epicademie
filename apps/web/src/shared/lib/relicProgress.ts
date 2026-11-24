import { chaptersOf } from '@epicademie/content';
import { playedGrade, type Grade, type Profile } from '@epicademie/shared';
import { useBosses } from '../api/queries.ts';

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

/** Progression des boss par matière, pour la classe donnée (par défaut la classe jouée du profil). */
export function useRelicProgress(profile: Profile): (subject: string, grade?: Grade) => RelicProgress {
  const { data } = useBosses(profile.id);
  const played = playedGrade(profile.grade);
  return (subject, grade = played) => relicProgressOf(subject, grade, data?.records ?? []);
}
