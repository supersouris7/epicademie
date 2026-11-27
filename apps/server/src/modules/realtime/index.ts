/**
 * Module « temps réel » : présence des joueurs, messages prédéfinis, arène multijoueur, Duel à distance.
 * API publique du module (les autres modules n'importent que ce fichier).
 */
export { attachRealtime, type RealtimeServer } from './gateway.ts';
export { createPresence, type Presence } from './presence.ts';
export { originAllowed } from './origin.ts';
