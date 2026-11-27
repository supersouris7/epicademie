import { useState } from 'react';
import { motion } from 'motion/react';
import { noop, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf } from '@epicademie/content';
import { SUBJECTS, getMode, playedGrade, subjectLabel, type Profile, type SubjectId } from '@epicademie/shared';
import { evaluationHomeQuery } from '../evaluation/index.ts';
import { onIntent } from '../../shared/lib/intent.ts';
import { acquired } from '@epicademie/engine';
import { useSkills } from '../training/index.ts';
import { EmperorScene, emperorDue } from '../boss/index.ts';
import { useRelicProgress } from '../../shared/lib/relicProgress.ts';
import { assetSrc } from '../../design/assets.ts';
import { ProgressBar } from '../../shared/ui/game/ProgressBar.tsx';
import { RELICS } from '../../design/relics.ts';
import { MODE_MOODS, setupBubble } from '../../shared/lib/modes.ts';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { SoonBadge } from '../../shared/ui/game/SoonBadge.tsx';
import { SubjectIcon } from '../../shared/ui/game/SubjectIcon.tsx';
import { bestScore } from '../defis/index.ts';
import { ModeBanner, ModeNote } from './ModeBanner.tsx';
import { CHEST_ICON } from '../../shared/ui/game/ChestReveal.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { useEntrance } from '../../shared/lib/entrance.ts';

/** Après le choix du mode : choix de la matière. */
export function ModeSetup({ profile }: { readonly profile: Profile }) {
  const enter = useEntrance();
  const { modeId = '' } = useParams();
  const mode = getMode(modeId);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: skills } = useSkills(profile.id);
  const relicOf = useRelicProgress(profile);
  // L'Empereur du Savoir se présente en plein écran une fois par jour, à l'entrée du Mode Histoire.
  const [emperor, setEmperor] = useState(() => modeId === 'boss' && emperorDue(profile.id));
  if (!mode) return <Navigate to="/hub" replace />;
  const isBoss = mode.id === 'boss';
  const isTraining = mode.id === 'entrainement';
  const bannerSrc = assetSrc(isBoss ? 'bosses-empereur-banniere' : 'environments-entrainement-banniere');
  const isDefi = mode.id === 'chrono' || mode.id === 'survie';
  const isEvaluation = mode.id === 'evaluation';
  // Barre sous chaque matière (classe du joueur) : notions acquises (Entraînement) ou boss vaincus (Combat).
  const grade = playedGrade(profile.grade);
  const progressOf = (subject: string) => {
    const chapters = chaptersOf(subject, grade);
    if (isBoss) {
      const { won, max } = relicOf(subject);
      return { value: won, max };
    }
    const ids = chapters.flatMap((c) => c.skills.map((k) => k.id));
    const states = new Map((skills ?? []).map((k) => [k.skillId, k]));
    const gold = ids.filter((id) => acquired(states.get(id))).length;
    return { value: gold, max: ids.length };
  };
  const back = mode.category === 'multi' ? '/multi' : '/hub';
  const playable = ['entrainement', 'boss', 'chrono', 'survie', 'evaluation'].includes(mode.id) && mode.available;
  const pickSubject = (subject: string, name: string, available: boolean) => {
    if (!available || chaptersOf(subject).length === 0) showToast(`${name} arrive bientôt !`);
    else if (mode.id === 'chrono' || mode.id === 'survie') void navigate(`/partie/defi/${mode.id}/${subject}`);
    else if (playable) void navigate(`/jouer/${mode.id}/${subject}`);
    else showToast(`${mode.name} arrive bientôt !`);
  };

  const prepare = (subject: SubjectId) => {
    if (isEvaluation) void qc.query(evaluationHomeQuery(profile.id, subject)).catch(noop);
  };

  return (
    <PageShell title={mode.name} back={back}>
      {bannerSrc && (isBoss || isTraining) ? (
        <ModeBanner
          src={bannerSrc}
          tagline={
            isBoss
              ? 'Bats les boss des matières, reprends le savoir à l’Empereur !'
              : 'Entraîne-toi, gagne des médailles et des coffres !'
          }
        />
      ) : (
        <div className="flex items-center gap-4">
          <Questy size={130} mood={MODE_MOODS[mode.id]} />
          <SpeechBubble>{setupBubble(mode)}</SpeechBubble>
        </div>
      )}
      {isBoss && emperor && <EmperorScene profileId={profile.id} onDone={() => setEmperor(false)} />}
      {isBoss && (
        // Mode Histoire : chaque boss vaincu donne un éclat de la relique de sa matière.
        <ModeNote icon={RELICS.maths.icon}>
          Chaque boss vaincu te donne un <strong>éclat de relique</strong> de sa matière. Retrouve tes reliques dans{' '}
          <strong>Mes progrès</strong> !
        </ModeNote>
      )}
      {isTraining && (
        // Entraînement : c'est ici qu'on gagne son équipement (coffres et médailles).
        <ModeNote icon={CHEST_ICON}>Une série sans faute t’offre un coffre ! Choisis ta matière.</ModeNote>
      )}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SUBJECTS.map((s, i) => (
          <motion.li
            key={s.id}
            className="relative"
            {...onIntent(() => prepare(s.id))}
            initial={enter ? { scale: 0.8, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.05, type: 'spring', stiffness: 220, damping: 15 }}
          >
            <button
              type="button"
              onClick={() => pickSubject(s.id, subjectLabel(s.id, grade), s.available)}
              aria-label={s.available ? subjectLabel(s.id, grade) : `${s.name}, à venir`}
              className={`cartoon bevel cartoon-press gloss relative flex min-h-36 w-full flex-col items-center justify-center gap-2 p-4 hover:brightness-110 ${s.available ? '' : 'opacity-60 grayscale'}`}
              style={{ backgroundColor: `var(--subject-${s.color})` }}
            >
              {(() => {
                // Progression de la classe (0 pour une matière à venir) ; la relique se colore avec elle.
                const p = s.available && chaptersOf(s.id).length > 0 ? progressOf(s.id) : { value: 0, max: 1 };
                const relic = s.available ? relicOf(s.id) : { won: 0, max: 0 };
                return (
                  <>
                    {/* Relique de la matière : grise, se remplit avec les boss vaincus (tous les modes). */}
                    <SubjectIcon
                      subject={s.id}
                      name={subjectLabel(s.id, grade)}
                      {...relic}
                      size={isBoss || isTraining ? 80 : 72}
                    />
                    <span className="font-display text-toon text-xl tracking-wide sm:text-2xl">
                      {subjectLabel(s.id, grade)}
                    </span>
                    {isDefi ? (
                      // Défis : le record à battre plutôt qu'une barre.
                      <span className="font-display text-toon rounded-full bg-black/25 px-3 py-0.5 text-base">
                        {(() => {
                          const best = bestScore(mode.id, profile.id, s.id, grade);
                          return best > 0 ? `Record : ${best} pts` : 'Pas encore de record';
                        })()}
                      </span>
                    ) : (
                      !isBoss &&
                      !isEvaluation && (
                        <ProgressBar
                          className="w-full"
                          value={p.value}
                          max={Math.max(1, p.max)}
                          color="var(--success)"
                          label={`Notions acquises en ${s.name}`}
                          size="sm"
                        />
                      )
                    )}
                  </>
                );
              })()}
            </button>
            {!s.available && <SoonBadge />}
          </motion.li>
        ))}
      </ul>
      {toast}
    </PageShell>
  );
}
