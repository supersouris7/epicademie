import { MODES, type Profile } from '@questeo/shared';
import { PageShell } from '../components/PageShell.tsx';
import { SpeechBubble } from '../components/SpeechBubble.tsx';
import { GameIcon } from '../components/game/GameIcon.tsx';
import { Questy } from '../components/mascot/Questy.tsx';
import { assetSrc } from '../design/assets.ts';
import { CATEGORY_COLORS, MODE_MOODS } from '../lib/modes.ts';

/**
 * Multijoueur : aucun mode n'est encore jouable. Un message clair et l'aperçu des modes à venir,
 * sans tuiles à toucher pour rien.
 */
export function MultiModes({ profile }: { readonly profile: Profile }) {
  const modes = MODES.filter((m) => m.category === 'multi');
  const soon = modes.every((m) => !m.available);
  return (
    <PageShell title="Multijoueur" nav={profile}>
      <div className="flex items-center gap-3">
        <Questy mood="wink" size={88} />
        <SpeechBubble>
          {soon
            ? 'Le multijoueur arrive bientôt ! En attendant, entraîne-toi et bats les boss.'
            : 'Choisis un mode : chaque joueur rejoint avec son téléphone.'}
        </SpeechBubble>
      </div>
      <p className="text-muted text-lg font-bold">
        Bientôt : l’écran affichera la partie, chaque joueur rejoindra avec son téléphone en scannant un QR code.
      </p>
      <ul className="grid gap-3 sm:grid-cols-2" aria-label="Modes à venir">
        {modes.map((mode) => (
          <li
            key={mode.id}
            className="cartoon flex items-center gap-3 p-3 text-white opacity-80"
            style={{ backgroundColor: CATEGORY_COLORS[mode.category] }}
          >
            {assetSrc(`icons-modes-${mode.id}`) ? (
              <GameIcon id={`icons-modes-${mode.id}`} size={48} className="shrink-0" />
            ) : (
              <Questy mood={MODE_MOODS[mode.id]} size={48} title="" />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-display text-toon text-xl tracking-wide">{mode.name}</span>
              <span className="text-sm font-bold">{mode.pitch}</span>
            </span>
            <span className="bg-gold text-on-light font-display shrink-0 rounded-full px-3 py-1 text-sm">À venir</span>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
