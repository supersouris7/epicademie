import { useLocation, useNavigate } from 'react-router';
import type { HeroId } from '@questeo/shared';
import { HeroFace } from './battle/HeroFace.tsx';
import { GameIcon } from './game/GameIcon.tsx';

const ITEMS = [
  { to: '/hub', label: 'Accueil', icon: 'icons-navigation-home' },
  { to: '/heros', label: 'Héros', icon: null },
  { to: '/progres', label: 'Progrès', icon: 'icons-resources-progression' },
  { to: '/multi', label: 'Multi', icon: 'icons-navigation-team' },
  { to: '/parametres', label: 'Paramètres', icon: 'icons-navigation-settings' },
] as const;

/** Barre de navigation du bas, sur les écrans principaux (accueil, héros, progrès, multi, paramètres). */
export function MainNav({ hero }: { readonly hero: HeroId }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Menu principal"
      className="fixed inset-x-0 bottom-0 z-40 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4"
    >
      <ul className="cartoon bg-accent-strong mx-auto flex max-w-3xl items-stretch justify-around gap-1 p-1.5">
        {ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <li key={item.to} className="flex-1">
              <button
                type="button"
                onClick={() => void navigate(item.to)}
                aria-current={active ? 'page' : undefined}
                className={`font-display text-toon flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 text-xs tracking-wide transition-colors sm:text-sm ${active ? 'bg-accent ring-gold ring-2' : 'hover:bg-white/10'}`}
              >
                <span className="flex h-8 w-8 items-center justify-center">
                  {item.icon ? (
                    <GameIcon id={item.icon} size={30} />
                  ) : (
                    <HeroFace hero={hero} expression="confiant" size={34} />
                  )}
                </span>
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
