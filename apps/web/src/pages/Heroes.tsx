import { useState } from 'react';
import { motion } from 'motion/react';
import { AVAILABLE_HEROES, HEROES, HERO_NAMES, type HeroId, type Profile } from '@questeo/shared';
import { useUpdateProfile } from '../api/profiles.ts';
import { HeroFace } from '../components/battle/HeroFace.tsx';
import { HeroCard } from '../components/game/CharacterCard.tsx';
import { CharacterSprite } from '../components/game/CharacterSprite.tsx';
import { GamePanel } from '../components/game/GamePanel.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { SoonBadge } from '../components/game/SoonBadge.tsx';
import { useToast } from '../components/Toast.tsx';
import { CHARACTERS, HERO_EXPRESSIONS, type AnimationState, type HeroExpression } from '../design/assets.ts';

/** Poses montrées à tour de rôle quand on touche le héros. */
const SHOWCASE: readonly AnimationState[] = ['idle', 'shoot', 'shield', 'jump', 'run', 'victory'];
const HERO_CHOICES = [...AVAILABLE_HEROES, ...HEROES.filter((hero) => !AVAILABLE_HEROES.includes(hero))];

/** Menu « Mon héros » : séparé du profil, on y choisit son personnage de combat. */
export function Heroes({ profile }: { readonly profile: Profile }) {
  const update = useUpdateProfile(profile.id);
  const [toast, showToast] = useToast();
  const [pose, setPose] = useState(0);
  const [face, setFace] = useState<HeroExpression>('confiant');
  const hero = profile.hero;
  const spec = CHARACTERS.find((c) => c.id === hero);

  const choose = (h: HeroId) => {
    if (h === hero || update.isPending) return;
    update.mutate({ hero: h }, { onSuccess: () => showToast(`${HERO_NAMES[h]} est ton héros !`) });
  };

  return (
    <PageShell title="Mon héros" nav={profile}>
      <GamePanel className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
        <motion.button
          type="button"
          onClick={() => setPose((i) => (i + 1) % SHOWCASE.length)}
          whileTap={{ scale: 0.95 }}
          aria-label={`${HERO_NAMES[hero]} : changer de pose`}
          className="shrink-0"
        >
          <CharacterSprite hero={hero} state={SHOWCASE[pose] ?? 'idle'} height={260} />
        </motion.button>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="font-display text-4xl tracking-wide">{HERO_NAMES[hero]}</h2>
          {spec && (
            <>
              <p className="text-xl font-bold">{spec.role}</p>
            </>
          )}
          <div className="flex items-center gap-3">
            <HeroFace hero={hero} expression={face} size={72} />
            <span className="text-muted text-sm font-bold">Ses humeurs</span>
          </div>
          <div className="flex flex-wrap gap-1" aria-label="Humeurs">
            {HERO_EXPRESSIONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setFace(e)}
                aria-label={e}
                aria-pressed={face === e}
                className={`rounded-full p-0.5 ${face === e ? 'ring-gold ring-2' : ''}`}
              >
                <HeroFace hero={hero} expression={e} size={36} />
              </button>
            ))}
          </div>
        </div>
      </GamePanel>

      <h2 className="font-display text-2xl tracking-wide">Choisis ton héros</h2>
      <div role="radiogroup" aria-label="Ton héros" className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {HERO_CHOICES.map((h, i) =>
          AVAILABLE_HEROES.includes(h) ? (
            <HeroCard
              key={h}
              hero={h}
              radio
              selected={hero === h}
              index={i}
              onClick={() => choose(h)}
              className="min-h-40"
            />
          ) : (
            // Héros à venir : carte mystère « ? », sans nom ni portrait.
            <div
              key={h}
              className="cartoon bg-surface-2 relative flex min-h-40 items-center justify-center"
              aria-label="Héros mystère, à venir"
              role="img"
            >
              <span aria-hidden className="font-display text-muted text-7xl">
                ?
              </span>
              <SoonBadge />
            </div>
          ),
        )}
      </div>
      {toast}
    </PageShell>
  );
}
