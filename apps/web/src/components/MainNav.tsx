import { useLocation, useNavigate } from 'react-router';
import { levelFromXp } from '@questeo/engine';
import type { Profile } from '@questeo/shared';
import { HeroFace } from './battle/HeroFace.tsx';
import { CharacterAvatar } from './game/CharacterAvatar.tsx';
import { GameIcon } from './game/GameIcon.tsx';
import { ProgressBar } from './game/ProgressBar.tsx';

const ITEMS = [
  { to: '/hub', label: 'Accueil', icon: 'icons-navigation-home' },
  { to: '/heros', label: 'Héros', icon: null },
  { to: '/progres', label: 'Progrès', icon: 'icons-resources-progression' },
  { to: '/multi', label: 'Multi', icon: 'icons-navigation-team' },
  { to: '/parametres', label: 'Paramètres', icon: 'icons-navigation-settings' },
] as const;

/**
 * Barre du haut des écrans principaux, figée : le joueur en bref (avatar, prénom, niveau, pièces)
 * et les cinq onglets. Sur téléphone, deux lignes ; à partir de la tablette en paysage, une seule.
 */
export function MainNav({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { level, xpInLevel, xpForNext } = levelFromXp(profile.xp, profile.gender);
  return (
    <div className="bg-bg/90 sticky top-0 z-40 -mx-4 px-4 pt-2 pb-2 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="cartoon bg-accent-strong flex flex-wrap items-center gap-x-3 gap-y-1.5 p-1.5 lg:flex-nowrap">
        {/* Le joueur : toucher l'avatar pour changer de joueur. */}
        <div className="flex min-w-0 flex-1 items-center gap-2 pl-1" aria-label="Mon joueur" role="group">
          <button type="button" onClick={() => void navigate('/')} aria-label="Changer de joueur" className="shrink-0">
            <CharacterAvatar avatar={profile.avatar} size={44} />
          </button>
          {/* Pseudo, puis niveau et barre d'XP (même barre segmentée que celles du combat). */}
          <span className="font-display text-toon max-w-[34%] shrink truncate text-lg leading-tight tracking-wide">
            {profile.name}
          </span>
          <span className="font-display text-gold shrink-0 text-sm">Niv. {level}</span>
          <ProgressBar
            className="min-w-16 flex-1 sm:max-w-48"
            value={xpInLevel}
            max={xpForNext}
            segments={10}
            color="var(--gold)"
            label={`Niveau ${level}, ${xpInLevel} XP sur ${xpForNext}`}
            size="sm"
          />
          <span
            className="font-display text-toon flex shrink-0 items-center gap-1 pr-1 text-lg"
            role="status"
            aria-label={`${profile.coins} pièces`}
          >
            <GameIcon id="icons-resources-coin" size={26} />
            {profile.coins.toLocaleString('fr-FR')}
          </span>
        </div>

        <nav aria-label="Menu principal" className="w-full lg:w-auto">
          <ul className="flex items-stretch gap-1">
            {ITEMS.map((item) => {
              const active = pathname === item.to;
              return (
                <li key={item.to} className="flex-1 lg:flex-none">
                  <button
                    type="button"
                    onClick={() => void navigate(item.to)}
                    aria-current={active ? 'page' : undefined}
                    className={`font-display text-toon flex w-full flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-xs tracking-wide transition-colors sm:text-sm lg:w-20 ${active ? 'bg-accent gloss ring-gold ring-2' : 'hover:bg-white/10'}`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center">
                      {item.icon ? (
                        <GameIcon id={item.icon} size={26} />
                      ) : (
                        <HeroFace hero={profile.hero} expression="confiant" size={30} />
                      )}
                    </span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
