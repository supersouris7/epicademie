import type { ReactNode } from 'react';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';

/** Bannière 3:1 (cadre cartoon, phrase en surimpression sur dégradé) des menus Combat de boss et Entraînement. */
export function ModeBanner({ src, tagline }: { readonly src: string; readonly tagline: string }) {
  return (
    <div className="cartoon relative overflow-hidden">
      <img src={src} alt="" aria-hidden className="block aspect-[3/1] w-full object-cover" />
      <p className="font-display text-toon absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-6 pb-2 text-xl tracking-wide sm:text-2xl">
        {tagline}
      </p>
    </div>
  );
}

/** Encart d'information sous la bannière : icône (64 px) et texte. */
export function ModeNote({ icon, children }: { readonly icon: string; readonly children: ReactNode }) {
  return (
    <div className="cartoon bg-surface-2 flex items-center gap-3 p-3" role="note">
      <GameIcon id={icon} size={64} />
      <p className="text-lg font-bold">{children}</p>
    </div>
  );
}
