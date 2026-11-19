import { motion, useReducedMotion } from 'motion/react';
import { assetSrc } from '../../../design/assets.ts';
import type { MoodId } from './moods.ts';
import type { QuestyPoseId } from './poses.ts';
import { Questy } from './Questy.tsx';

interface QuestyPoseProps {
  readonly pose: QuestyPoseId;
  /** Humeur utilisée si la pose n'est pas encore illustrée (tête seule). */
  readonly mood: MoodId;
  readonly size?: number;
  readonly label?: string;
}

/** Questy en pied dans une pose ; respire doucement (désactivé si l'utilisateur réduit les animations). */
export function QuestyPose({ pose, mood, size = 120, label = '' }: QuestyPoseProps) {
  const reduce = useReducedMotion();
  const src = assetSrc(`characters-questy-pose-${pose}`);
  if (!src) return <Questy mood={mood} size={size} title={label} />;
  return (
    <motion.img
      src={src}
      alt={label}
      aria-hidden={label ? undefined : true}
      draggable={false}
      decoding="async"
      style={{ width: size, height: size }}
      className="object-contain"
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
