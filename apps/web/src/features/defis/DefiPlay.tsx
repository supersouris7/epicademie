import { useNavigate, useParams } from 'react-router';
import { getAnySkill } from '@questeo/content';
import { SUBJECT_IDS, type Profile, type SessionSummary, type SubjectId } from '@questeo/shared';
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
import { bestScore, SURVIE_HEARTS, type DefiId } from './rules.ts';
import { useDefi } from './useDefi.ts';

const TITLES: Record<DefiId, string> = { chrono: 'Contre-la-montre', survie: 'Survie' };
const RULES: Record<DefiId, string> = {
  chrono: '60 secondes pour donner un maximum de bonnes réponses. Une erreur ne coûte rien : on passe à la suivante !',
  survie:
    '3 cœurs. Chaque erreur coûte un cœur, et ça devient plus dur toutes les 5 bonnes réponses. Tiens le plus longtemps possible !',
};

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
  const [toast, showToast] = useToast(2500);
  const d = useDefi(profile, kind, subject, showToast);

  if (d.phase === 'intro') {
    return (
      <PageShell title={TITLES[kind]} back={`/jouer/${kind}`}>
        <Intro
          kind={kind}
          best={bestScore(kind, profile.id, subject)}
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
        <Results correct={d.score.correct} record={d.record} summary={d.summary} saving={d.phase === 'finishing'} />
      </PageShell>
    );
  }
  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      <header className="flex items-center gap-3">
        <span className="font-display text-2xl" aria-label={`${d.score.correct} bonnes réponses`}>
          ★ {d.score.correct}
        </span>
        <span className="flex-1" />
        {kind === 'chrono' ? (
          <span
            role="timer"
            className={`font-display rounded-full px-3 py-1 text-xl ${d.secondsLeft <= 10 ? 'bg-danger text-white' : 'bg-surface-2'}`}
          >
            ⏱ {d.secondsLeft} s
          </span>
        ) : (
          <span role="img" aria-label={`${d.score.hearts} cœurs sur ${SURVIE_HEARTS}`} className="flex gap-0.5">
            {Array.from({ length: SURVIE_HEARTS }, (_, i) => (
              <GameIcon
                key={i}
                id={i < d.score.hearts ? 'icons-resources-life' : 'icons-resources-life-empty'}
                size="sm"
              />
            ))}
          </span>
        )}
        <GameButton size="sm" variant="surface" onClick={d.stop}>
          Arrêter
        </GameButton>
      </header>
      {d.flash !== null && (
        <p
          role="status"
          className={`cartoon p-2 text-center text-lg font-bold text-white ${d.flash ? 'bg-success' : 'bg-danger'}`}
        >
          {d.flash ? 'Bonne réponse !' : kind === 'survie' ? 'Raté : −1 cœur' : 'Raté !'}
        </p>
      )}
      {d.question && (
        <main className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] flex min-h-0 flex-1 flex-col gap-3">
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
        </main>
      )}
      {toast}
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
      {p.best > 0 && <p className="font-bold">Ton record : {p.best} bonnes réponses.</p>}
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
  readonly correct: number;
  readonly record: boolean;
  readonly summary: SessionSummary | null;
  readonly saving: boolean;
}) {
  const navigate = useNavigate();
  const s = p.correct > 1 ? 's' : '';
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Questy mood={p.record ? 'proud' : 'happy'} size={110} />
      <h1 className="font-display text-toon text-4xl tracking-wide">
        {p.correct} bonne{s} réponse{s}
      </h1>
      {p.record && <p className="text-xl font-bold">Nouveau record !</p>}
      {p.summary && (
        <p className="flex items-center gap-2 text-lg font-bold">
          +{p.summary.xpGained} XP · +{p.summary.coinsGained + (p.summary.chest?.coins ?? 0)}
          <GameIcon id="icons-resources-coin" size={22} label="pièces" />
        </p>
      )}
      {p.saving && <p>Enregistrement…</p>}
      <div className="flex flex-wrap justify-center gap-2">
        <GameButton onClick={() => window.location.reload()}>Rejouer</GameButton>
        <GameButton variant="surface" onClick={() => void navigate('/hub')}>
          Accueil
        </GameButton>
      </div>
    </div>
  );
}
