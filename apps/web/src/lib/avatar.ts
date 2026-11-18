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

/** Avatars déjà dessinés : réutilisés tout de suite (pas d'avatar vide qui clignote à chaque page). */
const drawn = new Map<string, string>();

export function useAvatarUri({ style, seed }: Pick<AvatarConfig, 'style' | 'seed'>): string | null {
  const key = `${style}:${seed}`;
  const [uri, setUri] = useState<{ key: string; value: string } | null>(() => {
    const value = drawn.get(key);
    return value ? { key, value } : null;
  });
  useEffect(() => {
    if (drawn.has(key)) return;
    let alive = true;
    void loadStyle(style).then((s) => {
      const value = new DiceAvatar(s, { seed }).toDataUri();
      drawn.set(key, value);
      if (alive) setUri({ key, value });
    });
    return () => {
      alive = false;
    };
  }, [style, seed, key]);
  return uri?.key === key ? uri.value : (drawn.get(key) ?? null);
}
