import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { getMode, gradeInfo, HERO_NAMES, MODES, type ModeId, type Profile } from '@questeo/shared';
import { comingSoon } from '../../shared/lib/grades.ts';
import { ModeTile } from '../../shared/ui/ModeTile.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { OnlineBanner } from '../realtime/index.ts';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { CharacterSprite } from '../../shared/ui/game/CharacterSprite.tsx';
import { useEntrance } from '../../shared/lib/entrance.ts';

/** Les deux grands modes jouables, chacun sa couleur. */
const MAIN_MODES: readonly { id: ModeId; color: string }[] = [
  { id: 'entrainement', color: 'var(--success)' },
  { id: 'boss', color: 'var(--boss)' },
];

/** Accueil : le héros en pied à côté des deux grands modes, les défis en dessous. */
export function Hub({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const navigate = useNavigate();
  const [toast, showToast] = useToast();

  return (
    <PageShell nav={profile}>
      {profile.grade && !gradeInfo(profile.grade).available && (
        <p className="cartoon bg-surface-2 p-3 font-bold" role="note">
          {comingSoon(profile.grade)}
        </p>
      )}

      {(!profile.gender || !profile.birthDate || !profile.grade) && (
        <button
          type="button"
          onClick={() => void navigate(`/profils/${profile.id}/modifier`)}
          className="cartoon cartoon-press bg-gold font-display text-on-light flex items-center gap-3 p-3 text-left text-lg"
        >
          <span className="flex-1">Complète ton profil (fille ou garçon, date de naissance, classe)</span>
          <span aria-hidden>→</span>
        </button>
      )}

      {/* Questy annonce les joueurs connectés (liste et messages en touchant). */}
      <OnlineBanner meId={profile.id} />

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Le héros en pied : toucher pour ouvrir « Mon héros ». */}
        <motion.button
          type="button"
          onClick={() => void navigate('/heros')}
          aria-label={`${HERO_NAMES[profile.hero]} : changer de héros`}
          whileTap={{ scale: 0.95 }}
          initial={enter ? { x: -40, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
          className="flex flex-col items-center"
        >
          {/* Le héros en pied, animé sur place (bande de 8 images). */}
          <CharacterSprite hero={profile.hero} state="idle" height="min(18rem, 40vw)" />
          <span className="font-display text-toon text-2xl tracking-wide">{HERO_NAMES[profile.hero]}</span>
        </motion.button>

        <ul className="flex flex-col gap-4" aria-label="Jouer">
          {MAIN_MODES.map((m, i) => {
            const mode = getMode(m.id);
            if (!mode) return null;
            return (
              <motion.li
                key={m.id}
                initial={enter ? { x: 30, opacity: 0 } : false}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: 'spring', stiffness: 200, damping: 16 }}
              >
                <button
                  type="button"
                  onClick={() => void navigate(`/jouer/${mode.id}`)}
                  className="cartoon bevel cartoon-press flex min-h-28 w-full flex-col items-center justify-center gap-1 p-3 text-center text-white hover:brightness-110 sm:min-h-36 sm:flex-row sm:justify-start sm:gap-4 sm:p-4 sm:text-left"
                  style={{
                    background: `linear-gradient(150deg, ${m.color}, color-mix(in srgb, ${m.color} 55%, var(--outline)))`,
                  }}
                >
                  <GameIcon id={`icons-modes-${mode.id}`} size={64} className="shrink-0 drop-shadow-lg" />
                  <span className="font-display text-toon text-xl leading-tight tracking-wide sm:flex-1 sm:text-4xl">
                    {mode.name}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <section className="flex flex-col gap-3" aria-labelledby="defis">
        <h2 id="defis" className="font-display text-2xl tracking-wide">
          Défis
        </h2>
        <ul className="grid grid-cols-2 gap-4">
          {MODES.filter((m) => m.category === 'defis').map((mode, i) => (
            <ModeTile
              key={mode.id}
              mode={mode}
              index={i}
              onClick={() => (mode.available ? void navigate(`/jouer/${mode.id}`) : showToast('Bientôt disponible !'))}
            />
          ))}
        </ul>
      </section>
      {toast}
    </PageShell>
  );
}
