import type { Chapter } from '@questeo/content';
import { assetSrc, BOSS_FACE, type BossExpression, type PiBotHead, type SorcierPose } from './assets.ts';
import type { BossMedal } from '@questeo/shared';
import { safeStorage } from '../shared/lib/storage.ts';

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

/**
 * Boss de chaque matière (décision du 21/11/2026) : le Sorcier π et son π-bot seulement en maths.
 * Les autres matières ont leur boss et leur mob, affichés en cadre provisoire tant que leurs
 * planches ne sont pas livrées (noms à changer librement).
 */
const boss = (id: string, name: string, mob: string, sky: readonly [string, string]): BossIdentity => ({
  id,
  name,
  mobs: [mob],
  sky,
});
export const SUBJECT_BOSSES: Record<string, BossIdentity> = {
  maths: SORCIER,
  anglais: boss('lord-blabla', 'Lord Blablabla', 'pipelette', ['#1d3b6e', '#5c8ad6']),
  espagnol: boss('senor-siesta', 'Señor Siesta', 'chili-bot', ['#6e1d1d', '#d6875c']),
  physique: boss('professeur-kaboum', 'Professeur Kaboum', 'electron-zinzin', ['#1d4f6e', '#5cc4d6']),
  geographie: boss('capitaine-boussole', 'Capitaine Boussole-Folle', 'globule-perdu', ['#1d6e3b', '#7ed65c']),
  histoire: boss('chronos-grognon', 'Chronos le Grognon', 'sablier-fou', ['#5a3b1d', '#d6b35c']),
};

export const bossOfSubject = (subject: string): BossIdentity => SUBJECT_BOSSES[subject] ?? SORCIER;
export const bossOf = (chapter: Pick<Chapter, 'subject'>) => bossOfSubject(chapter.subject);

/** Tête du boss pour une expression (identifiant d'asset) ; le portrait si elle n'est pas livrée
 * (et le cadre provisoire, via `characterSrc`, si le boss n'est pas encore dessiné). */
export function bossHeadId(bossId: string, expression: BossExpression): string {
  const id = `bosses-${bossId}-head-${BOSS_FACE[expression]}`;
  return assetSrc(id) ? id : `bosses-${bossId}-portrait`;
}

/** Pose fixe du boss (identifiant d'asset). */
export const bossPoseId = (bossId: string, pose: SorcierPose) => `bosses-${bossId}-pose-${pose}`;

/** Expression du boss selon les vies qui lui restent (3 : menaçant, 2 : inquiet, 1 : furieux, en rage). */
export const bossMood = (lives: number): BossExpression =>
  lives >= 3 ? 'menace' : lives === 2 ? 'inquiet' : lives === 1 ? 'furieux' : 'ko';

/** Les 5 arènes du combat (environments/arenas, images du client). */
export const ARENAS = ['jungle', 'espace', 'volcan', 'glace', 'academie'] as const;
export type ArenaId = (typeof ARENAS)[number];

const arenaKey = (profileId: string) => `questeo.arenes.${profileId}`;
const isArena = (v: unknown): v is ArenaId => ARENAS.includes(v as ArenaId);

/** Lit le paquet restant et la dernière arène ; tolère un stockage absent ou illisible. */
function readDeck(profileId: string): { deck: ArenaId[]; last: ArenaId | null } {
  try {
    const raw: unknown = JSON.parse(safeStorage.get(arenaKey(profileId)) ?? 'null');
    if (raw && typeof raw === 'object') {
      const { deck, last } = raw as { deck?: unknown; last?: unknown };
      const lastOk = isArena(last) ? last : null;
      if (Array.isArray(deck) && deck.every(isArena) && new Set(deck).size === deck.length) {
        return { deck, last: lastOk };
      }
      return { deck: [], last: lastOk };
    }
  } catch {
    /* JSON illisible : on repart d'un paquet neuf */
  }
  return { deck: [], last: null };
}

/**
 * Arène d'un combat, en rotation « paquet de cartes » par profil : les 5 passent avant qu'une
 * revienne, et jamais la même deux fois de suite (y compris entre deux paquets). Toutes matières.
 */
export function randomArena(profileId: string, rng: () => number = Math.random): ArenaId {
  const { deck: saved, last } = readDeck(profileId);
  let deck = saved;
  if (deck.length === 0) {
    // Nouveau paquet : mélange des 4 autres ; la dernière jouée ferme le paquet (jamais en tête).
    deck = ARENAS.filter((a) => a !== last);
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const [a, b] = [deck[i], deck[j]];
      if (a && b) [deck[i], deck[j]] = [b, a];
    }
    if (last !== null) deck.push(last);
  }
  const [next, ...rest] = deck;
  const arena = next ?? 'academie';
  safeStorage.set(arenaKey(profileId), JSON.stringify({ deck: rest, last: arena }));
  return arena;
}

/** Mob affiché pour la question n°`turn` (cosmétique). */
export const mobOf = (boss: BossIdentity, turn: number) => boss.mobs[turn % boss.mobs.length] ?? 'pi-bot';

const MOB_NAMES: Record<string, string> = {
  'pi-bot': 'π-bot',
  pipelette: 'Pipelette',
  'chili-bot': 'Chili-bot',
  'electron-zinzin': 'Électron Zinzin',
  'globule-perdu': 'Globule Perdu',
  'sablier-fou': 'Sablier Fou',
};

/** Nom affiché d'un mob. */
export const mobName = (mob: string) => MOB_NAMES[mob] ?? mob.charAt(0).toUpperCase() + mob.slice(1).replace(/-/g, ' ');

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
