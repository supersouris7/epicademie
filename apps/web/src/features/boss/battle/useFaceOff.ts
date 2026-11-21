import { useMemo, useState } from 'react';
import type { Chapter } from '@questeo/content';
import type { Profile } from '@questeo/shared';
import { useBosses } from '../api.ts';
import { faceOffTaunt } from '../../../shared/lib/battleLines.ts';
import { bossOf } from '../../../design/bosses.ts';
import { faceOffExchange, HERO_GENDER, type Exchange } from '../../../shared/lib/dialogue.ts';

/**
 * Face-à-face de l'entrée en scène : le boss provoque (plus vexé s'il a déjà perdu sur ce
 * chapitre), le héros répond. Tiré une fois par combat : jamais le même échange.
 */
export function useFaceOff(profile: Profile, chapter: Chapter): readonly Exchange[] {
  const [roll] = useState(Math.random);
  const { data: overview } = useBosses(profile.id);
  const beaten = (overview?.records ?? []).some((r) => r.chapterId === chapter.id && r.wins > 0);
  const bossId = bossOf(chapter).id;
  return useMemo(
    () => faceOffExchange(profile.hero, faceOffTaunt(chapter.title, beaten, HERO_GENDER[profile.hero], roll), bossId),
    [profile.hero, chapter.title, beaten, roll, bossId],
  );
}
