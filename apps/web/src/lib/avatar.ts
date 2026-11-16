import { useEffect, useState } from 'react';
import { Avatar as DiceAvatar, Style } from '@dicebear/core';
import type { AvatarConfig, AvatarStyle } from '@questeo/shared';

type Loader = () => Promise<{ default: unknown }>;

// Chargement paresseux : chaque style n'est téléchargé qu'à la première utilisation.
const LOADERS: Record<AvatarStyle, Loader> = {
  'fun-emoji': () => import('@dicebear/styles/fun-emoji.json'),
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

export function useAvatarUri({ style, seed }: Pick<AvatarConfig, 'style' | 'seed'>): string | null {
  const [uri, setUri] = useState<{ key: string; value: string } | null>(null);
  const key = `${style}:${seed}`;
  useEffect(() => {
    let alive = true;
    void loadStyle(style).then((s) => {
      if (alive) setUri({ key, value: new DiceAvatar(s, { seed }).toDataUri() });
    });
    return () => {
      alive = false;
    };
  }, [style, seed, key]);
  return uri?.key === key ? uri.value : null;
}
