/** Poses illustrées de Questy (voir le catalogue d'assets). */
export const QUESTY_POSES = [
  'idle',
  'salut',
  'hero',
  'bravo',
  'pouce',
  'montre',
  'reflexion',
  'lecture',
  'surprise',
  'triste',
  'ko',
  'course',
  'jetpack',
  'tir',
  'bouclier',
  'dort',
] as const;
export type QuestyPoseId = (typeof QUESTY_POSES)[number];
