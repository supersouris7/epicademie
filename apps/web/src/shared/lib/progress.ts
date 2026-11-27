import { acquired as isAcquired, medal } from '@epicademie/engine';
import { accord, type Gender, type SkillProgress } from '@epicademie/shared';

export interface ChapterProgress {
  readonly total: number;
  readonly acquired: number;
  readonly started: number;
  readonly due: number;
}

export function chapterProgress(
  skillIds: readonly string[],
  states: ReadonlyMap<string, SkillProgress>,
  today: string,
): ChapterProgress {
  let acquired = 0;
  let started = 0;
  let due = 0;
  for (const id of skillIds) {
    const s = states.get(id);
    if (!s) continue;
    started++;
    // Notion acquise : médaille d'or ou de diamant (série entièrement réussie).
    if (isAcquired(s)) acquired++;
    if (s.due !== null && s.due <= today) due++;
  }
  return { total: skillIds.length, acquired, started, due };
}

/**
 * Niveau affiché d'une notion, tiré de sa médaille (toujours cohérent avec elle) :
 * jamais travaillée → « Pas encore évalué » ; pas de médaille → « À renforcer » ;
 * Bronze → « En progrès » ; Argent → « Presque acquise » ; Or → « Acquise » ; Diamant → « Maîtrisée
 * seul(e) » (neutre sans genre).
 */
export function masteryOf(
  s: SkillProgress | undefined,
  gender?: Gender | null,
): { id: string; label: string; color: string } {
  if (!s || s.attempts === 0) return { id: 'non-evalue', label: 'Pas encore évalué', color: 'var(--text-muted)' };
  switch (medal(s)) {
    case 'diamant': {
      const label = gender ? accord(gender, 'Maîtrisée seul', 'Maîtrisée seule') : 'Maîtrisée sans aide';
      return { id: 'sans-aide', label, color: 'var(--success)' };
    }
    case 'or':
      return { id: 'acquise', label: 'Acquise', color: 'var(--success)' };
    case 'argent':
      return { id: 'satisfaisante', label: 'Presque acquise', color: 'var(--accent)' };
    case 'bronze':
      return { id: 'en-progres', label: 'En progrès', color: 'var(--primary)' };
    default:
      return { id: 'a-renforcer', label: 'À renforcer', color: 'var(--primary)' };
  }
}
export interface Suggestion<C> {
  readonly chapter: C;
  readonly progress: ChapterProgress;
  /** Pourquoi ce chapitre : « 2 notions à revoir », « tu l'as commencé », « par où commencer ». */
  readonly why: string;
}

/** Où reprendre : d'abord ce qui est à revoir, puis un chapitre commencé, sinon le premier pas encore acquis. */
export function suggestChapter<C extends { readonly skills: readonly { readonly id: string }[] }>(
  chapters: readonly C[],
  states: ReadonlyMap<string, SkillProgress>,
  today: string,
): Suggestion<C> | null {
  const all = chapters.map((chapter) => ({
    chapter,
    progress: chapterProgress(
      chapter.skills.map((s) => s.id),
      states,
      today,
    ),
  }));
  const pick =
    all.find((x) => x.progress.due > 0) ??
    all.find((x) => x.progress.started > 0 && x.progress.acquired < x.progress.total) ??
    all.find((x) => x.progress.acquired < x.progress.total);
  if (!pick) return null;
  const { due, started } = pick.progress;
  const why =
    due > 0 ? `${due} notion${due > 1 ? 's' : ''} à revoir` : started > 0 ? 'tu l’as commencé' : 'par où commencer';
  return { ...pick, why };
}
