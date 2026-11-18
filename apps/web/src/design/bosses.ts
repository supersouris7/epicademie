import type { Chapter, DomainId } from '@questeo/content';
import type { BossMedal } from '@questeo/shared';

/** Un boss par domaine des maths, recoloré selon le chapitre (docs/SPEC.md §6.2 bis). */
export interface BossIdentity {
  readonly id: string;
  readonly name: string;
  /** Mobs envoyés par ce boss (identifiants de bosses/minions). */
  readonly mobs: readonly string[];
  /** Couleurs du décor de remplacement tant que l'arène n'est pas livrée. */
  readonly sky: readonly [string, string];
}

export const DOMAIN_BOSSES: Record<DomainId, BossIdentity> = {
  nombres: {
    id: 'golem-des-equations',
    name: 'Golem des Équations',
    mobs: ['calculatrice', 'cube-bot', 'bloc-code'],
    sky: ['#3b1d6e', '#8a5cd6'],
  },
  geometrie: {
    id: 'geomatrix',
    name: 'Géomatrix',
    mobs: ['equerre', 'compas', 'cube-bot'],
    sky: ['#1b2a6b', '#5a7be0'],
  },
  grandeurs: {
    id: 'geomatrix',
    name: 'Géomatrix',
    mobs: ['equerre', 'calculatrice', 'cube-bot'],
    sky: ['#14324a', '#3c9ad6'],
  },
  donnees: {
    id: 'probabot',
    name: 'Probabot',
    mobs: ['de', 'camembert', 'calculatrice'],
    sky: ['#4a2a12', '#d69a3c'],
  },
  fonctions: {
    id: 'courbix',
    name: 'Courbix',
    mobs: ['courbe', 'camembert', 'calculatrice'],
    sky: ['#0b1d3a', '#1f8fb0'],
  },
  informatique: {
    id: 'ia-des-connaissances',
    name: 'IA des Connaissances',
    mobs: ['bug', 'bloc-code', 'cube-bot'],
    sky: ['#081a2a', '#2a7a9a'],
  },
};

/** Teinte du boss selon le chapitre : deux chapitres d'un même domaine n'ont pas le même boss à l'écran. */
const CHAPTER_HUE: Record<string, number> = {
  'm5-relatifs': 0,
  'm5-fractions': 150,
  'm5-proportionnalite': 0,
};

export const bossOf = (chapter: Chapter) => DOMAIN_BOSSES[chapter.domain];
/** Teinte stable tirée de l'identifiant pour les chapitres sans teinte choisie. */
const hashHue = (id: string) => {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return Math.round(h / 30) * 30;
};

export const bossFilter = (chapterId: string) => {
  const hue = CHAPTER_HUE[chapterId] ?? hashHue(chapterId);
  return hue ? `hue-rotate(${hue}deg)` : undefined;
};
/** Arènes du combat (environments/arenas), une tirée au hasard à chaque combat. */
export const ARENAS = ['espace', 'academie', 'jungle', 'volcan', 'glace'] as const;
export const randomArena = (): string => ARENAS[Math.floor(Math.random() * ARENAS.length)] ?? 'academie';

/** Mob affiché pour la question n°`turn` (cosmétique). */
export const mobOf = (boss: BossIdentity, turn: number) => boss.mobs[turn % boss.mobs.length] ?? 'calculatrice';

/** Icône de chaque médaille de boss (le diamant est la gemme). */
export const BOSS_MEDAL_ICONS: Record<BossMedal, string> = {
  bronze: 'rewards-medals-bronze',
  argent: 'rewards-medals-argent',
  or: 'rewards-medals-or',
  diamant: 'icons-resources-gem',
};
