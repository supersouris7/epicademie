import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { getAnySkill } from '@questeo/content';
import { playedGrade, SUBJECT_IDS, type Profile, type SessionSummary, type SubjectId } from '@questeo/shared';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { playSound } from '../../shared/lib/sound.ts';
import type { HeroExpression } from '../../design/assets.ts';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { MathText } from '../../shared/question/MathText.tsx';
import { QuestionTools } from '../../shared/question/QuestionTools.tsx';
import { DOCK_HEIGHT } from '../../shared/question/tools.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { ChestReveal } from '../../shared/ui/game/ChestReveal.tsx';
import { bestScore, CHRONO_MS, comboOf, PRESSURE_S, SURVIE_HEARTS, type DefiId } from './rules.ts';
import { useDefi, type DefiMiss, type Feedback } from './useDefi.ts';
import { RecapScreen } from '../training/index.ts';

const TITLES: Record<DefiId, string> = { chrono: 'Contre-la-montre', survie: 'Survie' };
const RULES: Record<DefiId, string> = {
  chrono:
    '60 secondes, et chaque bonne réponse te rend du temps : un peu pour une question rapide, jusqu’à +10 s pour un problème long. Une erreur coûte 5 s et casse ta série. Plus la question est difficile et plus tu réponds vite, plus tu marques de points ; enchaîne les bonnes réponses pour un COMBO jusqu’à ×5.',
  survie:
    '3 cœurs. Chaque erreur coûte un cœur et casse ta série, et ça devient plus dur toutes les 5 bonnes réponses. Plus la question est difficile et plus tu réponds vite, plus tu marques de points ; enchaîne les bonnes réponses pour un COMBO jusqu’à ×5.',
};

/** Nombre qui défile jusqu'à sa nouvelle valeur (immédiat avec « réduire les animations »). */
function useCountUp(target: number, reduce: boolean | null): number {
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduce) return;
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 450);
      const v = Math.round(start + (target - start) * k);
      from.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce]);
  return reduce ? target : shown;
}

/** Battement sonore sur les 10 dernières secondes : de plus en plus rapide (respecte le réglage du son). */
function useHeartbeat(on: boolean, secondsLeft: number) {
  const period = secondsLeft > 6 ? 1000 : secondsLeft > 3 ? 600 : 350;
  useEffect(() => {
    if (!on) return;
    playSound('click', 0.35);
    const t = window.setInterval(() => playSound('click', 0.35), period);
    return () => window.clearInterval(t);
  }, [on, period]);
}

/**
 * Défis (Contre-la-montre, Survie) : questions des chapitres accessibles de sa classe dans la
 * matière, sans indice ni second essai, enchaînées vite (docs/adr/0026-defis.md).
 */
export function DefiPlay({ profile }: { readonly profile: Profile }) {
  const params = useParams();
  const kind: DefiId = params.defi === 'survie' ? 'survie' : 'chrono';
  const subject: SubjectId = (SUBJECT_IDS as readonly string[]).includes(params.subject ?? '')
    ? (params.subject as SubjectId)
    : 'maths';
  const grade = playedGrade(profile.grade);
  const [toast, showToast] = useToast(2500);
  const d = useDefi(profile, kind, subject, showToast);
  const reduce = useReducedMotion();
  const points = useCountUp(d.score.points, reduce);
  const pressure = d.phase === 'playing' && kind === 'chrono' && d.secondsLeft <= PRESSURE_S;
  useHeartbeat(pressure, d.secondsLeft);

  if (d.phase === 'intro') {
    return (
      <PageShell title={TITLES[kind]} back={`/jouer/${kind}`}>
        <Intro
          kind={kind}
          best={bestScore(kind, profile.id, subject, grade)}
          available={d.available}
          onStart={() => void d.start()}
        />
        {toast}
      </PageShell>
    );
  }
  if (d.phase !== 'playing') {
    return (
      <PageShell title={TITLES[kind]} back={`/jouer/${kind}`}>
        <Results
          profile={profile}
          points={d.score.points}
          best={bestScore(kind, profile.id, subject, grade)}
          record={d.record}
          summary={d.summary}
          misses={d.misses}
          saving={d.phase === 'finishing'}
        />
      </PageShell>
    );
  }
  const urgent = pressure || (kind === 'survie' && d.score.hearts === 1);
  const combo = comboOf(d.score.streak);
  const expression = heroExpression(kind, d, urgent);
  const shake = shakes(reduce, pressure, d.flash);
  return (
    <motion.div
      animate={shake ? { x: [0, -2, 2, -1, 1, 0] } : { x: 0 }}
      transition={shake ? { duration: pressure ? 0.5 : 0.3, repeat: pressure ? Infinity : 0 } : { duration: 0 }}
      className="mx-auto flex h-dvh max-w-6xl flex-col gap-2 px-3 py-3 sm:px-4"
    >
      <FlashOverlay flash={d.flash} reduce={reduce} />
      <header className="flex items-center gap-3">
        <HeroFace hero={profile.hero} expression={expression} size={52} />
        <div className="flex flex-col leading-none">
          <span className="font-display text-3xl tabular-nums" aria-label={`${d.score.points} points`}>
            {points} <span className="text-base">pts</span>
          </span>
          <span className="text-muted text-sm font-bold">{d.score.correct} bonnes réponses</span>
        </div>
        <ComboBadge combo={combo} reduce={reduce} />
        <span className="flex-1" />
        {kind === 'survie' && <Hearts hearts={d.score.hearts} />}
        <GameButton size="sm" variant="surface" onClick={d.stop}>
          Arrêter
        </GameButton>
      </header>
      {kind === 'chrono' && (
        <TimeBar leftMs={d.leftMs} seconds={d.secondsLeft} pressure={pressure} flash={d.flash} reduce={reduce} />
      )}
      <FeedbackLine kind={kind} flash={d.flash} reduce={reduce} />
      {d.question && (
        <motion.main
          key={`${d.question.skillId}-${d.question.seed}`}
          initial={reduce ? false : { x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] flex min-h-0 flex-1 flex-col gap-3"
        >
          <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <h1 className="text-2xl leading-snug font-bold sm:text-3xl">
              <MathText text={d.question.prompt} terms />
            </h1>
            {d.question.figure && <Figure figure={d.question.figure} maxHeight="var(--figure-max)" />}
          </section>
          <section
            className={`side:h-[min(100%,520px)] side:self-center flex ${DOCK_HEIGHT} min-h-0 shrink-0 flex-col`}
          >
            <QuestionTools
              key={`${d.question.skillId}-${d.question.seed}`}
              question={d.question}
              skill={getAnySkill(d.question.skillId)}
              picked={null}
              onSubmit={d.submit}
            />
          </section>
        </motion.main>
      )}
      {toast}
    </motion.div>
  );
}

/** Expression du héros selon la situation (concentré, content, surpris ou vexé, inquiet, fier d'un record). */
function heroExpression(
  kind: DefiId,
  d: { readonly flash: Feedback | null; readonly previousBest: number; readonly score: { readonly points: number } },
  urgent: boolean,
): HeroExpression {
  if (d.flash) {
    if (!d.flash.correct) return kind === 'survie' ? 'colere' : 'surprise';
    return d.flash.combo >= 3 ? 'rire' : 'joie';
  }
  if (d.previousBest > 0 && d.score.points > d.previousBest) return 'enthousiaste';
  return urgent ? 'triste' : 'determine';
}

/** Secousse de l'écran : erreur, ou pression des dernières secondes (jamais avec « réduire les animations »). */
const shakes = (reduce: boolean | null, pressure: boolean, flash: Feedback | null) =>
  !reduce && (pressure || flash?.correct === false);

/** Gros « COMBO ×n » dès ×2. */
function ComboBadge({ combo, reduce }: { readonly combo: number; readonly reduce: boolean | null }) {
  if (combo <= 1) return null;
  return (
    <motion.span
      key={combo}
      initial={reduce ? false : { scale: 1.8, rotate: -8 }}
      animate={{ scale: 1, rotate: 0 }}
      className="font-display text-toon bg-primary rounded-xl px-3 py-1 text-2xl tracking-wider text-white"
    >
      COMBO ×{combo}
    </motion.span>
  );
}

function Hearts({ hearts }: { readonly hearts: number }) {
  return (
    <span role="img" aria-label={`${hearts} cœurs sur ${SURVIE_HEARTS}`} className="flex gap-0.5">
      {Array.from({ length: SURVIE_HEARTS }, (_, i) => (
        <GameIcon key={i} id={i < hearts ? 'icons-resources-life' : 'icons-resources-life-empty'} size="sm" />
      ))}
    </span>
  );
}

/** Retour instantané : points gagnés, ou coût de l'erreur. */
function FeedbackLine(p: { readonly kind: DefiId; readonly flash: Feedback | null; readonly reduce: boolean | null }) {
  const f = p.flash;
  const wrong = p.kind === 'survie' ? 'Raté : −1 cœur, série perdue' : 'Raté : −5 s, série perdue';
  return (
    <div className="h-8" aria-live="polite">
      {f && (
        <motion.p
          key={f.id}
          role="status"
          initial={p.reduce ? false : { y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`font-display text-center text-xl tracking-wide ${f.correct ? 'text-success' : 'text-danger'}`}
        >
          {f.correct ? `Bonne réponse ! +${f.gained}` : wrong}
        </motion.p>
      )}
    </div>
  );
}

/** Éclair de couleur sur tout l'écran à chaque réponse (supprimé avec « réduire les animations »). */
function FlashOverlay({ flash, reduce }: { readonly flash: Feedback | null; readonly reduce: boolean | null }) {
  if (reduce) return null;
  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          key={flash.id}
          aria-hidden
          initial={{ opacity: 0.45 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className={`pointer-events-none fixed inset-0 z-10 ${flash.correct ? 'bg-success' : 'bg-danger'}`}
        />
      )}
    </AnimatePresence>
  );
}

/** Gain de temps en secondes, au dixième près, virgule française (« 2 », « 4,5 »). */
const formatGain = (ms: number) => String(Math.round(ms / 100) / 10).replace('.', ',');

/** Chrono : barre qui se vide (inverse de la progression) et secondes ; +N s / −5 s animés. */
function TimeBar(p: {
  readonly leftMs: number;
  readonly seconds: number;
  readonly pressure: boolean;
  readonly flash: Feedback | null;
  readonly reduce: boolean | null;
}) {
  const pct = Math.min(100, (p.leftMs / Math.max(CHRONO_MS, p.leftMs)) * 100);
  const pulse = p.pressure && !p.reduce ? 'animate-pulse' : '';
  return (
    <div className="relative flex items-center gap-3">
      <div
        role="progressbar"
        aria-label="Temps restant"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        className="bg-surface-2 border-outline h-5 flex-1 overflow-hidden rounded-full border-2"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-linear ${p.pressure ? 'bg-danger' : 'bg-primary'} ${pulse}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        role="timer"
        className={`font-display min-w-20 rounded-full px-3 py-1 text-center text-xl tabular-nums ${p.pressure ? `bg-danger text-white ${pulse}` : 'bg-surface-2'}`}
      >
        ⏱ {p.seconds} s
      </span>
      <AnimatePresence>
        {p.flash && !p.reduce && (
          <motion.span
            key={p.flash.id}
            aria-hidden
            initial={{ y: 0, opacity: 1, scale: 1.4 }}
            animate={{ y: -18, opacity: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className={`font-display absolute right-24 -bottom-1 text-2xl ${p.flash.correct ? 'text-success' : 'text-danger'}`}
          >
            {p.flash.correct ? `+${formatGain(p.flash.timeGainMs)} s` : '−5 s'}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

function Intro(p: {
  readonly kind: DefiId;
  readonly best: number;
  readonly available: boolean;
  readonly onStart: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3">
        <Questy mood={p.kind === 'chrono' ? 'wow' : 'cool'} size={100} />
        <SpeechBubble>{RULES[p.kind]}</SpeechBubble>
      </div>
      {p.best > 0 && <p className="font-bold">Ton record : {p.best} points.</p>}
      {p.available ? (
        <GameButton size="lg" icon="icons-navigation-play" onClick={p.onStart} className="self-center">
          C’est parti !
        </GameButton>
      ) : (
        <p>Aucun chapitre de ta classe n’est encore disponible dans cette matière.</p>
      )}
    </>
  );
}

function Results(p: {
  readonly profile: Profile;
  readonly points: number;
  readonly best: number;
  readonly record: boolean;
  readonly summary: SessionSummary | null;
  readonly misses: readonly DefiMiss[];
  readonly saving: boolean;
}) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [recap, setRecap] = useState(false);
  const [review, setReview] = useState(false);
  const shown = useCountUp(p.points, reduce);
  if (recap && p.summary) {
    return (
      <RecapScreen profileId={p.profile.id} rows={p.summary.skills}>
        <GameButton onClick={() => window.location.reload()}>Rejouer</GameButton>
        <GameButton variant="surface" onClick={() => void navigate('/hub')}>
          Accueil
        </GameButton>
      </RecapScreen>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <HeroFace hero={p.profile.hero} expression={p.record ? 'enthousiaste' : 'joie'} size={110} />
      <h1 className="font-display text-toon text-4xl tracking-wide">{shown} points</h1>
      {p.record ? (
        <p className="text-xl font-bold">Nouveau record !</p>
      ) : (
        p.best > 0 && <p className="text-lg font-bold">Ton record : {p.best} points</p>
      )}
      {p.summary && (
        <p className="flex items-center gap-2 text-lg font-bold">
          +{p.summary.xpGained} XP · +{p.summary.coinsGained + (p.summary.chest?.coins ?? 0)}
          <GameIcon id="icons-resources-coin" size={22} label="pièces" />
        </p>
      )}
      {p.saving && <p>Enregistrement…</p>}
      {p.summary?.chest && <ChestReveal chest={p.summary.chest} />}
      {p.misses.length > 0 && (
        <GameButton variant="surface" onClick={() => setReview((r) => !r)} aria-expanded={review}>
          Revoir mes erreurs ({p.misses.length})
        </GameButton>
      )}
      {review && <MissList misses={p.misses} />}
      {p.summary ? (
        <GameButton size="lg" icon="icons-navigation-next" onClick={() => setRecap(true)}>
          Suite
        </GameButton>
      ) : (
        !p.saving && (
          <div className="flex flex-wrap justify-center gap-2">
            <GameButton onClick={() => window.location.reload()}>Rejouer</GameButton>
            <GameButton variant="surface" onClick={() => void navigate('/hub')}>
              Accueil
            </GameButton>
          </div>
        )
      )}
    </div>
  );
}

/** Erreurs de la partie : question, réponse donnée, bonne réponse, explication courte. */
function MissList({ misses }: { readonly misses: readonly DefiMiss[] }) {
  return (
    <ul className="flex w-full flex-col gap-2 text-left" aria-label="Mes erreurs">
      {misses.map((m, i) => (
        <li key={i} className="cartoon bg-surface flex flex-col gap-1 p-3 text-lg">
          <MathText text={m.prompt} />
          <span className="text-danger font-bold">
            Ta réponse : <MathText text={m.given} />
          </span>
          <span className="text-success font-bold">
            Bonne réponse : <MathText text={m.answer} />
          </span>
          {m.why && (
            <span className="text-muted">
              <MathText text={m.why} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
