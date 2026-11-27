import type { Response } from '@epicademie/content';
import type { BattleView } from '@epicademie/shared';

/** Réglages de la mise en scène du combat de boss (durées en millisecondes). */

/** Retour à la liste des boss depuis un combat : pas de gros plan du boss. */
export const FROM_BATTLE = { fromBattle: true } as const;

/** Après une erreur : ce qui s'est passé, avant de passer à la suite. */
export interface Missed {
  readonly given: Response;
  readonly why?: string;
  readonly next: BattleView;
}

/** Ce qu'une aide change à la médaille (voir `bossMedal`). */
export const HELP_MEDAL_NOTE = 'Avec un indice ou un objet, l’or reste possible ; le diamant se gagne sans aide.';

/** Confirmation du « ? » : ce que l'indice utilise, et ce qu'il change à la médaille. */
export function hintWarning(hintItem: boolean, diamondOpen: boolean) {
  const use = hintItem
    ? 'Ça va utiliser ton objet Indice pour afficher l’indice.'
    : 'Voici un indice. Ton attaque sera juste un peu moins forte.';
  return diamondOpen ? `${use} ${HELP_MEDAL_NOTE}` : use;
}

export const STAGE_LABEL = { mob: '', probleme: 'Problème', piege: 'Piège !' } as const;
/** Durées de l'animation d'un tir (ms). */
export const HIT_MS = 450;
export const NEXT_MS = 1500;
/** Durée de la scène en grand après une erreur, avant l'explication. */
export const MISS_SCENE_MS = 1400;
/** Entrée en scène avec le mot de Questy, puis arrivée du boss (le temps de lire). */
export const INTRO_MS = 11000;
/** Rage : début, montée progressive (flashs blancs), rage ; 3 s chacune. */
export const RAGE_STEP_MS = 3000;
/** Pose finale (KO du boss ou défaite du héros) avant le bilan. */
export const FINAL_POSE_MS = 3200;
