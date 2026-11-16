import { useEffect, useState } from 'react';
import { Avatar as DiceAvatar, Style } from '@dicebear/core';
import type { AvatarConfig, AvatarStyle } from '@questeo/shared';

type Loader = () => Promise<{ default: unknown }>;

// Chargement paresseux : chaque style n'est téléchargé qu'à la première utilisation.
const LOADERS: Record<AvatarStyle, Loader> = {
  'fun-emoji': () => import('@dicebear/styles/fun-emoji.json'),
  'big-ears': () => import('@dicebear/styles/big-ears.json'),
  'adventurer-neutral': () => import('@dicebear/styles/adventurer-neutral.json'),
  pixelbot: () => import('@dicebear/styles/pixelbot.json'),
};

const styles = new Map<AvatarStyle, Promise<Style>>();
const loadStyle = (name: AvatarStyle): Promise<Style> => {
  let style = styles.get(name);
  if (!style) {
    style = LOADERS[name]().then((m) => new Style(m.default));
    styles.set(name, style);
  }
  return style;
};

/** Coiffures big-ears (long01…long20, short01…short20) selon le choix fille / garçon. */
const HAIR = {
  long: Array.from({ length: 20 }, (_, i) => `long${String(i + 1).padStart(2, '0')}`),
  short: Array.from({ length: 20 }, (_, i) => `short${String(i + 1).padStart(2, '0')}`),
} as const;

export function useAvatarUri({ style, seed, hair }: Pick<AvatarConfig, 'style' | 'seed' | 'hair'>): string | null {
  const [uri, setUri] = useState<{ key: string; value: string } | null>(null);
  const key = `${style}:${seed}:${hair ?? ''}`;
  useEffect(() => {
    let alive = true;
    void loadStyle(style).then((s) => {
      const options = style === 'big-ears' && hair ? { seed, hairVariant: [...HAIR[hair]] } : { seed };
      if (alive) setUri({ key, value: new DiceAvatar(s, options).toDataUri() });
    });
    return () => {
      alive = false;
    };
  }, [style, seed, hair, key]);
  return uri?.key === key ? uri.value : null;
}
