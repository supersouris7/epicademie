import { useNavigate } from 'react-router';
import { MODES, type Profile } from '@questeo/shared';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { OnlineBanner } from '../realtime/index.ts';
import { assetSrc } from '../../design/assets.ts';
import { CATEGORY_COLORS, MODE_MOODS } from '../../shared/lib/modes.ts';

/** Multijoueur : l'Arène (jouable) et les modes à venir ; les joueurs connectés en tête. */
export function MultiModes({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const modes = MODES.filter((m) => m.category === 'multi');
  return (
    <PageShell title="Multijoueur" nav={profile}>
      <div className="flex items-center gap-3">
        <Questy mood="wink" size={88} />
        <SpeechBubble>Chacun sur sa tablette ou son ordi : défie tes amis connectés !</SpeechBubble>
      </div>
      <OnlineBanner meId={profile.id} />
      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Modes multijoueur">
        {modes.map((mode) => {
          const icon = assetSrc(`icons-modes-${mode.id}`) ? (
            <GameIcon id={`icons-modes-${mode.id}`} size={48} className="shrink-0" />
          ) : (
            <Questy mood={MODE_MOODS[mode.id]} size={48} title="" />
          );
          const body = (
            <>
              {icon}
              <span className="flex min-w-0 flex-1 flex-col text-left">
                <span className="font-display text-toon text-xl tracking-wide">{mode.name}</span>
                <span className="text-sm font-bold">{mode.pitch}</span>
              </span>
            </>
          );
          return (
            <li key={mode.id}>
              {mode.available ? (
                <button
                  type="button"
                  onClick={() => void navigate(mode.id === 'arene' ? '/arene' : `/jouer/${mode.id}`)}
                  className="cartoon bevel cartoon-press gloss flex w-full items-center gap-3 p-3 text-white hover:brightness-110"
                  style={{ backgroundColor: CATEGORY_COLORS[mode.category] }}
                >
                  {body}
                </button>
              ) : (
                <div
                  className="cartoon flex items-center gap-3 p-3 text-white opacity-70"
                  style={{ backgroundColor: CATEGORY_COLORS[mode.category] }}
                >
                  {body}
                  <span className="bg-gold text-on-light font-display shrink-0 rounded-full px-3 py-1 text-sm">
                    À venir
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </PageShell>
  );
}
