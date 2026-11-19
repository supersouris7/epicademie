import type { AvatarConfig, HeroId } from './profile.ts';

/** Joueur connecté (visible des autres). */
export interface OnlinePlayer {
  readonly id: string;
  readonly name: string;
  readonly hero: HeroId;
  readonly avatar: AvatarConfig;
  /** En partie d'arène (ne peut pas être invité). */
  readonly busy: boolean;
}

/** Messages prédéfinis entre joueurs (pas de texte libre : sûr pour les enfants). */
export const PRESET_MESSAGES = [
  'Salut !',
  'Bien joué !',
  'Bravo, champion·ne !',
  'Viens en arène !',
  'Prêt·e pour un défi ?',
  'J’arrive !',
  'Je fais un boss, je reviens.',
  'Trop fort !',
  'On se fait un entraînement ?',
  'Revanche ?',
  'GG !',
  'Merci !',
  'Pas maintenant, désolé·e.',
  'J’ai eu la médaille d’or !',
  'Tu as battu le Golem ?',
  'Le π-bot m’a eu…',
  'À plus tard !',
  'Courage, tu vas y arriver !',
] as const;

export const CHAT_EMOJIS = [
  '👋',
  '👍',
  '😄',
  '😂',
  '😮',
  '😎',
  '🔥',
  '⚡',
  '🏆',
  '💪',
  '❤️',
  '🤝',
  '🎉',
  '😅',
  '🤔',
  '🐱',
] as const;

export type ChatPayload =
  { readonly kind: 'preset'; readonly index: number } | { readonly kind: 'emoji'; readonly index: number };

export const chatText = (p: ChatPayload): string | null =>
  (p.kind === 'preset' ? PRESET_MESSAGES[p.index] : CHAT_EMOJIS[p.index]) ?? null;

/** Message reçu (notification en haut de l'écran). */
export interface ChatMessage {
  readonly from: Pick<OnlinePlayer, 'id' | 'name' | 'hero'>;
  readonly text: string;
  readonly at: number;
}

// ——— Arène : 2 à 4 joueurs, chacun répond à son tour sur son appareil ———

export const ARENA_MAX_PLAYERS = 4;
export const ARENA_HEARTS = 3;
/** Secondes pour répondre (multipliées par le handicap d'âge des plus grands). */
export const ARENA_TURN_SECONDS = 45;
/** Tours au plus : ensuite, le joueur qui a le plus de cœurs gagne. */
export const ARENA_MAX_TURNS = 30;

export interface ArenaPlayer {
  readonly id: string;
  readonly name: string;
  readonly hero: HeroId;
  readonly hearts: number;
  /** A accepté l'invitation (l'hôte : d'emblée). */
  readonly ready: boolean;
}

export interface ArenaQuestion {
  readonly skillId: string;
  readonly level: 1 | 2 | 3;
  readonly seed: number;
}

/** Ce qui vient de se passer (affiché à tous). */
export interface ArenaEvent {
  readonly playerId: string;
  readonly correct: boolean;
  /** Joueur attaqué (bonne réponse). */
  readonly targetId: string | null;
  readonly timeout: boolean;
}

export type ArenaPhase = 'lobby' | 'playing' | 'over';

export interface ArenaView {
  readonly id: string;
  readonly hostId: string;
  readonly chapterId: string;
  readonly phase: ArenaPhase;
  readonly players: readonly ArenaPlayer[];
  /** Joueur dont c'est le tour. */
  readonly turnId: string | null;
  readonly turn: number;
  readonly question: ArenaQuestion | null;
  /** Fin du temps de réponse (horodatage ms). */
  readonly deadline: number | null;
  readonly last: ArenaEvent | null;
  readonly winnerId: string | null;
}

/** Invitation reçue. */
export interface ArenaInvite {
  readonly arenaId: string;
  readonly from: Pick<OnlinePlayer, 'id' | 'name' | 'hero'>;
  readonly chapterId: string;
}
