import { getChapter } from '@epicademie/content';

/** Titre d'un chapitre invité en Duel (export par défaut : chargé à la demande). */
export default function ChapterTitle({ chapterId }: { readonly chapterId: string }) {
  return <>{getChapter(chapterId)?.title ?? 'maths'}</>;
}
