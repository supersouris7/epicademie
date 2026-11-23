import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { gradeInfo, HERO_NAMES, MODE_CATEGORIES, MODES, type ModeId, type Profile } from '@questeo/shared';
import { comingSoon } from '../../shared/lib/grades.ts';
import { ModeTile } from '../../shared/ui/ModeTile.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { CharacterSprite } from '../../shared/ui/game/CharacterSprite.tsx';
import { useEntrance } from '../../shared/lib/entrance.ts';

/** Écran des modes qui n'ouvrent pas l'écran générique de choix de matière. */
const ROUTES: Partial<Record<ModeId, string>> = { arene: '/arene' };

/** Accueil : le héros en pied et les 6 modes en 3 groupes (Apprendre, Défis, En famille). */
export function Hub({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const navigate = useNavigate();

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

      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        {/* Le héros en pied : toucher pour ouvrir « Mon héros ». */}
        <motion.button
          type="button"
          onClick={() => void navigate('/heros')}
          aria-label={`${HERO_NAMES[profile.hero]} : changer de héros`}
          whileTap={{ scale: 0.95 }}
          initial={enter ? { x: -40, opacity: 0 } : false}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 16 }}
          className="focus-visible:outline-gold flex flex-col items-center rounded-lg focus-visible:outline-4 focus-visible:outline-offset-4"
        >
          {/* Le héros en pied, animé sur place (bande de 8 images). */}
          <CharacterSprite hero={profile.hero} state="idle" height="min(18rem, 40vw)" />
          <span className="font-display text-toon text-2xl tracking-wide">{HERO_NAMES[profile.hero]}</span>
        </motion.button>

        <div className="flex flex-col gap-5">
          {MODE_CATEGORIES.map((cat) => (
            <section key={cat.id} className="flex flex-col gap-3" aria-labelledby={`groupe-${cat.id}`}>
              <h2 id={`groupe-${cat.id}`} className="font-display text-2xl tracking-wide">
                {cat.name}
              </h2>
              <ul className="grid grid-cols-2 gap-4">
                {MODES.filter((m) => m.category === cat.id).map((mode, i) => (
                  <ModeTile
                    key={mode.id}
                    mode={mode}
                    index={i}
                    onClick={() => void navigate(ROUTES[mode.id] ?? `/jouer/${mode.id}`)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
