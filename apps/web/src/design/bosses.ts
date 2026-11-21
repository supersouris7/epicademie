import type { Chapter } from '@questeo/content';
import { assetSrc, BOSS_FACE, type BossExpression, type PiBotHead, type SorcierPose } from './assets.ts';
import type { BossMedal } from '@questeo/shared';

/** Un boss par matière, le même pour tous ses chapitres et toutes les classes (docs/SPEC.md §6.2 bis). */
export interface BossIdentity {
  readonly id: string;
  readonly name: string;
  /** Mobs envoyés par ce boss (identifiants de bosses/minions). */
  readonly mobs: readonly string[];
  /** Couleurs du décor de remplacement tant que l'arène n'est pas livrée. */
  readonly sky: readonly [string, string];
}

/** Le Sorcier π : boss unique de tous les chapitres (refonte des personnages du 20/11/2026). */
const SORCIER: BossIdentity = {
  id: 'sorcier-pi',
  name: 'Sorcier π',
  mobs: ['pi-bot'],
  sky: ['#3b1d6e', '#8a5cd6'],
};

/** Boss de chaque matière : le Sorcier π partout pour l'instant. */
export const SUBJECT_BOSSES: Record<string, BossIdentity> = { maths: SORCIER };

export const bossOfSubject = (subject: string): BossIdentity => SUBJECT_BOSSES[subject] ?? SORCIER;
export const bossOf = (chapter: Pick<Chapter, 'subject'>) => bossOfSubject(chapter.subject);

/** Tête du boss pour une expression (identifiant d'asset) ; le portrait si elle n'est pas livrée. */
export function bossHeadId(bossId: string, expression: BossExpression): string {
  const id = `bosses-${bossId}-head-${BOSS_FACE[expression]}`;
  return assetSrc(id) ? id : `bosses-${bossId}-portrait`;
}

/** Pose fixe du boss (identifiant d'asset). */
export const bossPoseId = (bossId: string, pose: SorcierPose) => `bosses-${bossId}-pose-${pose}`;

/** Animation sur place : 4 images calmes (vies pleines), 4 images en rage (dernière vie). */
export const bossIdleRange = (lives: number): readonly [number, number] => (lives <= 1 ? [4, 4] : [0, 4]);

/** Expression du boss selon les vies qui lui restent (3 : menaçant, 2 : inquiet, 1 : furieux, en rage). */
export const bossMood = (lives: number): BossExpression =>
  lives >= 3 ? 'menace' : lives === 2 ? 'inquiet' : lives === 1 ? 'furieux' : 'ko';

/** Arènes du combat (environments/arenas), une tirée au hasard à chaque combat. */
export const ARENAS = ['espace', 'academie', 'volcan'] as const;
export const randomArena = (): string => ARENAS[Math.floor(Math.random() * ARENAS.length)] ?? 'academie';

/** Mob affiché pour la question n°`turn` (cosmétique). */
export const mobOf = (boss: BossIdentity, turn: number) => boss.mobs[turn % boss.mobs.length] ?? 'pi-bot';

/** Nom affiché d'un mob. */
export const mobName = (mob: string) =>
  mob === 'pi-bot' ? 'π-bot' : mob.charAt(0).toUpperCase() + mob.slice(1).replace(/-/g, ' ');

/** Tête d'un mob avec une expression (si elle est livrée), sinon son image entière. */
export function mobHeadId(mob: string, face: PiBotHead): string {
  const id = `bosses-minions-${mob}-head-${face}`;
  return assetSrc(id) ? id : `bosses-minions-${mob}`;
}

/** Icône de chaque médaille de boss (le diamant est la gemme). */
export const BOSS_MEDAL_ICONS: Record<BossMedal, string> = {
  bronze: 'rewards-medals-bronze',
  argent: 'rewards-medals-argent',
  or: 'rewards-medals-or',
  diamant: 'rewards-medals-diamant',
};
