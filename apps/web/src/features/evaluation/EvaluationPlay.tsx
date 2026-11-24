import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate, useParams } from 'react-router';
import { getAnySkill, getCe2Skill, type Response } from '@epicademie/content';
import type { EvaluationQuestion, Profile } from '@epicademie/shared';
import { ApiError } from '../../shared/api/client.ts';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { assetSrc } from '../../design/assets.ts';
import { bossHeadId, bossOfSubject } from '../../design/bosses.ts';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { MathText } from '../../shared/question/MathText.tsx';
import { QuestionTools } from '../../shared/question/QuestionTools.tsx';
import { DOCK_HEIGHT } from '../../shared/question/tools.ts';
import { ConfirmDialog } from '../../shared/ui/ConfirmDialog.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { HUD_FRAME, HudBar, HudPortrait } from '../../shared/ui/game/Hud.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { answerQuestion, chooseAdvanced, finishEvaluation, nextQuestion } from './api.ts';
import { domainLabel, generateEvaluation } from './texts.ts';

type Phase =
  | { readonly step: 'loading' }
  | { readonly step: 'question'; readonly question: EvaluationQuestion }
  | { readonly step: 'bonus' }
  | { readonly step: 'closing' }
  | { readonly step: 'error'; readonly message: string };

/** Phrases neutres du héros entre deux questions : jamais de juste ni de faux (décision du client). */
const ENCOURAGEMENTS = [
  'On continue !',
  'Bien joué d’être là !',
  'Prends ton temps.',
  'Tu avances !',
  'Concentre-toi !',
];

const UNKNOWN_WARNING =
  'Cette question comptera comme « je ne sais pas » : pas de souci, cela aide à voir ce qu’il te reste à découvrir.';

/**
 * Épreuve scénarisée : le serveur choisit chaque question, l'écran la génère (notion, niveau, graine)
 * et envoie la réponse sans jamais recevoir juste ou faux. Aucun indice, aucune définition :
 * les explications viennent dans le bilan. Recharger la page reprend à la question en attente.
 */
export function EvaluationPlay({ profile }: { readonly profile: Profile }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [toast, showToast] = useToast(3000);
  const [phase, setPhase] = useState<Phase>({ step: 'loading' });
  const [progress, setProgress] = useState({ index: 1, planned: 1 });
  const [answered, setAnswered] = useState(0);
  const [sending, setSending] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const shownAt = useRef(0);
  const closing = useRef(false);

  const fail = useCallback((e: unknown) => {
    const message =
      e instanceof ApiError && e.status === 410
        ? 'Cette épreuve a expiré : relance-la depuis l’Arène (tes réponses sont gardées).'
        : e instanceof ApiError && (e.status === 404 || e.status === 409)
          ? e.message
          : 'Connexion perdue. Ton épreuve est gardée : tu pourras la reprendre.';
    setPhase({ step: 'error', message });
  }, []);

  const finish = useCallback(async () => {
    if (closing.current) return;
    closing.current = true;
    setPhase({ step: 'closing' });
    try {
      const result = await finishEvaluation(id);
      void navigate(`/evaluation/${id}/resultat`, { replace: true, state: { fresh: result } });
    } catch (e) {
      closing.current = false;
      fail(e);
    }
  }, [id, navigate, fail]);

  const load = useCallback(async () => {
    try {
      const n = await nextQuestion(id);
      if (!n.done) {
        setProgress({ index: n.question.index, planned: n.question.planned });
        shownAt.current = performance.now();
        setPhase({ step: 'question', question: n.question });
      } else if (n.canExploreAdvanced) setPhase({ step: 'bonus' });
      else await finish();
    } catch (e) {
      fail(e);
    }
  }, [id, finish, fail]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement de la question en attente au montage
    void load();
  }, [load]);

  const current = phase.step === 'question' ? phase.question : null;
  const generated = useMemo(
    () => (current ? generateEvaluation(current.skillId, current.level, current.seed) : null),
    [current],
  );

  const send = async (response: Response) => {
    if (!current || !generated || sending) return;
    setSending(true);
    try {
      const r = await answerQuestion(id, {
        skillId: current.skillId,
        level: current.level,
        seed: current.seed,
        response,
        durationMs: Math.min(3_600_000, Math.round(performance.now() - shownAt.current)),
      });
      if (r.invalid) {
        showToast('Écris un nombre valide (ex. 3,5 ou −2).');
      } else {
        setAnswered((n) => n + 1);
        await load();
      }
    } catch (e) {
      if (e instanceof ApiError && e.status >= 500) showToast('Réponse non enregistrée : réessaie.');
      else if (e instanceof ApiError && e.status !== 409) fail(e);
      else await load();
    } finally {
      setSending(false);
    }
  };

  const unknown = () => void send({ kind: 'unknown' });
  const skill = current ? (getAnySkill(current.skillId) ?? getCe2Skill(current.skillId)) : undefined;

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-2 px-3 py-3 sm:px-4">
      <PlayHeader
        hero={profile.hero}
        index={progress.index}
        total={progress.planned}
        domain={current?.domain ?? null}
        onQuit={() => setConfirmQuit(true)}
      />
      {phase.step === 'loading' && <p role="status">Chargement de ton épreuve…</p>}
      {phase.step === 'closing' && (
        <div className="flex items-center gap-3" role="status">
          <Questy size={90} mood="proud" />
          <SpeechBubble>Bravo, tu as fini ! Je prépare ton bilan…</SpeechBubble>
        </div>
      )}
      {phase.step === 'error' && (
        <div className="flex flex-col items-center gap-3 text-center" role="alert">
          <Questy size={100} mood="sad" />
          <p className="text-lg font-bold">{phase.message}</p>
          <div className="flex gap-2">
            <GameButton variant="surface" onClick={() => void navigate('/jouer/evaluation/maths', { replace: true })}>
              Retour à l’Arène
            </GameButton>
            <GameButton onClick={() => void load()}>Réessayer</GameButton>
          </div>
        </div>
      )}
      {phase.step === 'bonus' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <Questy size={110} mood="wow" />
          <SpeechBubble>
            Quelle épreuve ! Tu veux tenter quelques défis bonus, plus difficiles ? Ils ne changent pas ton bilan.
          </SpeechBubble>
          <div className="flex flex-wrap justify-center gap-3">
            <GameButton
              icon="icons-navigation-play"
              onClick={() => {
                void chooseAdvanced(id, true).then(load, fail);
              }}
            >
              Oui, je tente !
            </GameButton>
            <GameButton
              variant="surface"
              onClick={() => {
                void chooseAdvanced(id, false).then(finish, fail);
              }}
            >
              Non merci, voir mon bilan
            </GameButton>
          </div>
        </div>
      )}
      {current && generated && (
        <motion.main
          key={`${current.skillId}-${current.seed}`}
          initial={reduce ? false : { x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] flex min-h-0 flex-1 flex-col gap-3"
        >
          <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <p className="text-muted font-bold" aria-live="polite">
              {ENCOURAGEMENTS[answered % ENCOURAGEMENTS.length]}
            </p>
            <h1 className="text-2xl leading-snug font-bold sm:text-3xl">
              <MathText text={generated.prompt} terms />
            </h1>
            {generated.figure && <Figure figure={generated.figure} maxHeight="var(--figure-max)" />}
          </section>
          <section
            className={`side:h-[min(100%,520px)] side:self-center flex ${DOCK_HEIGHT} min-h-0 shrink-0 flex-col`}
          >
            <QuestionTools
              key={`${current.skillId}-${current.seed}`}
              question={generated}
              skill={skill}
              picked={null}
              onSubmit={(r) => void send(r)}
              onUnknown={unknown}
              unknownWarning={UNKNOWN_WARNING}
            />
          </section>
        </motion.main>
      )}
      {confirmQuit && (
        <ConfirmDialog
          title="Quitter l’épreuve ?"
          message="Ton épreuve est gardée : tu pourras la reprendre depuis l’Arène d’évaluation."
          confirm="Quitter"
          cancel="Continuer"
          onConfirm={() => void navigate('/hub', { replace: true })}
          onCancel={() => setConfirmQuit(false)}
        />
      )}
      {toast}
    </div>
  );
}

/**
 * HUD de l'épreuve, même langage que les HUD de combat et de défis (cadre sombre, portraits inclinés,
 * jauge segmentée) : une case par question du nombre fixe annoncé, jamais de juste ou faux.
 * Au-delà du nombre fixe : défis bonus, affichés à part.
 */
function PlayHeader(p: {
  readonly hero: Profile['hero'];
  readonly index: number;
  readonly total: number;
  readonly domain: string | null;
  readonly onQuit: () => void;
}) {
  const bonus = p.index > p.total;
  const done = bonus ? p.total : Math.max(0, p.index - 1);
  const bossSrc = assetSrc(bossHeadId(bossOfSubject('maths').id, 'menace'));
  return (
    <header
      className={`${HUD_FRAME} flex shrink-0 items-center gap-2 px-2 py-1.5 sm:gap-3 sm:px-3`}
      aria-label="Épreuve des Origines"
    >
      <HudPortrait side="left">
        <HeroFace hero={p.hero} expression="determine" size={52} />
      </HudPortrait>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-baseline gap-x-2 sm:gap-x-3">
          {bonus ? (
            <span className="font-display text-toon text-xl leading-none whitespace-nowrap text-[var(--gold)] sm:text-2xl">
              Défi bonus
            </span>
          ) : (
            <span
              className="font-display text-xl leading-none whitespace-nowrap tabular-nums sm:text-3xl"
              aria-label={`Question ${p.index} sur ${p.total}`}
            >
              {p.index}
              <span className="text-base text-white/70 sm:text-lg"> / {p.total}</span>
            </span>
          )}
          {p.domain && <span className="truncate text-sm font-bold text-white/90">{domainLabel(p.domain)}</span>}
        </div>
        <HudBar
          side="left"
          kind="xp"
          value={done}
          max={p.total}
          segments={p.total}
          role="progressbar"
          label="Progression de l’épreuve"
        />
      </div>
      {bossSrc && (
        <span className="hidden sm:block">
          <HudPortrait side="right" size={52}>
            <img src={bossSrc} alt="" aria-hidden draggable={false} className="h-11 w-11 object-contain" />
          </HudPortrait>
        </span>
      )}
      <GameButton variant="surface" size="sm" onClick={p.onQuit}>
        Quitter
      </GameButton>
    </header>
  );
}
