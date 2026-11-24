import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { check } from '@epicademie/content';
import type { EvaluationResult, Profile } from '@epicademie/shared';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { formatAnswer, formatResponse } from '../../shared/question/answers.ts';
import { MathText } from '../../shared/question/MathText.tsx';
import { ChestReveal } from '../../shared/ui/game/ChestReveal.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { ProgressBar } from '../../shared/ui/game/ProgressBar.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useEvaluationResult, useEvaluationReview } from './api.ts';
import { appreciation } from './appreciation.ts';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { competenceTitle, domainLabel, formatNote, generateEvaluation, gradeName, KIND_INFO, note20 } from './texts.ts';

function Section({ title, children }: { readonly title: string; readonly children: ReactNode }) {
  return (
    <section aria-label={title} className="cartoon bg-surface flex flex-col gap-2 p-4">
      <h2 className="font-display text-2xl tracking-wide">{title}</h2>
      {children}
    </section>
  );
}

function Chips({ ids, empty }: { readonly ids: readonly string[]; readonly empty: string }) {
  if (ids.length === 0) return <p className="text-muted text-lg">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-2">
      {ids.map((id) => (
        <li key={id} className="bg-surface-2 rounded-full px-3 py-1 text-lg font-bold">
          {competenceTitle(id)}
        </li>
      ))}
    </ul>
  );
}

/** Bilan d'une épreuve : note sur 20, domaines, forces, points à travailler, suite. */
export function EvaluationResults({ profile }: { readonly profile: Profile }) {
  const { id = '' } = useParams();
  const location = useLocation();
  const fresh = (location.state as { fresh?: EvaluationResult } | null)?.fresh;
  const { data, isLoading, isError } = useEvaluationResult(id);
  const result = fresh?.id === id ? fresh : data;
  const back = `/jouer/evaluation/${result?.subject ?? 'maths'}`;
  if (!result) {
    return (
      <PageShell title="Mon bilan" back="/jouer/evaluation">
        {isLoading && <p role="status">Chargement du bilan…</p>}
        {isError && <p role="alert">Ce bilan est introuvable.</p>}
      </PageShell>
    );
  }
  return <Body result={result} profile={profile} back={back} isNew={fresh?.id === id} />;
}

function Scores({ r, grade }: { readonly r: EvaluationResult; readonly grade: string }) {
  return (
    <Section title="Ma note">
      {r.masteryDisplayable && r.mastery !== null && (
        <p
          className="font-display text-toon text-5xl text-[var(--gold)]"
          aria-label={`Note : ${note20(r.mastery)} sur 20`}
        >
          {note20(r.mastery)}
          <span className="text-muted text-2xl"> /20</span>
        </p>
      )}
      <p className="text-muted text-lg">Ta note sur 20 dit ce que tu réussis dans le programme de {grade} évalué.</p>
      <ProgressBar
        value={r.masteryDisplayable && r.mastery !== null ? note20(r.mastery) : 0}
        max={20}
        label="Note"
        color="var(--success)"
        text={r.masteryDisplayable && r.mastery !== null ? `Note ${formatNote(r.mastery)}` : 'Note : –'}
      />
      <p className="text-lg">
        {r.counts.mastered} maîtrisée{r.counts.mastered > 1 ? 's' : ''} · {r.counts.inProgress} en progrès ·{' '}
        {r.counts.struggling} à travailler · {r.questions} questions
      </p>
    </Section>
  );
}

function Rewards({ r, isNew }: { readonly r: EvaluationResult; readonly isNew: boolean }) {
  return (
    <Section title="Récompenses">
      <p className="flex flex-wrap items-center gap-2 text-lg font-bold">
        +{r.rewards.xp} XP · +{r.rewards.coins}
        <GameIcon id="icons-resources-coin" size={22} label="pièces" />
      </p>
      <p className="text-muted text-lg">
        Ces récompenses disent merci pour ta participation : elles ne dépendent jamais du nombre de bonnes réponses.
        {!r.rewards.inPeriod && ' Cette épreuve était déjà faite sur la période : récompense réduite, sans coffre.'}
      </p>
      {isNew && r.rewards.chest && <ChestReveal chest={r.rewards.chestContent} />}
    </Section>
  );
}

function Body(p: {
  readonly result: EvaluationResult;
  readonly profile: Profile;
  readonly back: string;
  readonly isNew: boolean;
}) {
  const r = p.result;
  const navigate = useNavigate();
  const [review, setReview] = useState(false);
  const info = KIND_INFO[r.kind];
  const grade = gradeName(r.referentialGrade);
  const adv = r.competences.filter((c) => c.role === 'avance' && c.state === 'maitrisee');
  const title = (cid: string) => r.competences.find((c) => c.id === cid)?.title ?? competenceTitle(cid);
  const mood = appreciation(r.masteryDisplayable ? r.mastery : null, r.id, r.partial);
  return (
    <PageShell title={`Mon bilan · ${info.name}`} back={p.back}>
      <div className="flex items-center gap-3">
        <HeroFace hero={p.profile.hero} expression="joie" size={90} />
        <p className="min-w-0 flex-1 text-xl font-bold">
          {r.partial
            ? 'Tu as fait ce que tu pouvais, et c’est déjà utile : voilà ce qu’on a pu voir.'
            : 'Bravo, l’épreuve est terminée ! Voilà où tu en es.'}
        </p>
      </div>

      {mood && (
        <div className="flex items-center gap-3" aria-label="Appréciation de Questy">
          <Questy size={90} mood={mood.mood} />
          <SpeechBubble>
            <strong>{mood.label} !</strong> {mood.line}
          </SpeechBubble>
        </div>
      )}

      <Scores r={r} grade={grade} />

      {r.domains.length > 0 && (
        <Section title="Par domaine">
          <ul className="flex flex-col gap-2">
            {r.domains.map((d) => (
              <li key={d.domain}>
                <ProgressBar
                  value={d.mastery === null ? 0 : note20(d.mastery)}
                  max={20}
                  label={domainLabel(d.domain)}
                  color="var(--success)"
                  size="sm"
                />
                <p className="text-lg">
                  <strong>{domainLabel(d.domain)}</strong> · {d.mastery === null ? 'pas évalué' : formatNote(d.mastery)}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="Tes points forts">
        <Chips ids={r.strengths} empty="Rien de maîtrisé pour l’instant : on va y travailler ensemble." />
        {adv.length > 0 && (
          <p className="text-lg">
            <strong>Déjà au niveau supérieur</strong> (hors score) : {adv.map((c) => c.title).join(', ')}.
          </p>
        )}
      </Section>

      <Section title={r.kind === 'origines' ? 'À consolider pour réussir dans ta classe' : 'À travailler'}>
        <Chips
          ids={r.kind === 'origines' && r.forNextYear.length > 0 ? r.forNextYear : r.toWork}
          empty="Rien de fragile repéré, bravo !"
        />
        {r.prerequisitesToRework.length > 0 && (
          <>
            <p className="text-lg font-bold">Des bases plus anciennes à revoir :</p>
            <Chips ids={r.prerequisitesToRework} empty="" />
          </>
        )}
      </Section>

      {(r.notEvaluated.length > 0 || r.notStudied.length > 0) && (
        <Section title="Pas évalué">
          <p className="text-muted text-lg">Ce n’est pas une mauvaise note : on n’a simplement pas pu le voir.</p>
          <Chips ids={[...r.notEvaluated, ...r.notStudied]} empty="" />
        </Section>
      )}

      {r.progress && (
        <Section title="Tes progrès">
          <p className="text-lg">
            Depuis ton bilan précédent ({r.progress.common} compétences comparées) : {r.progress.newlyMastered.length}{' '}
            nouvelle(s) maîtrisée(s), {r.progress.resolved.length} difficulté(s) surmontée(s).
          </p>
        </Section>
      )}

      {r.trainings.length > 0 && (
        <Section title="Pour progresser, lance un entraînement">
          <ul className="flex flex-wrap gap-2">
            {r.trainings.map((t) => (
              <li key={t.skillId}>
                <GameButton
                  icon="icons-navigation-play"
                  onClick={() => void navigate(`/partie/entrainement/${t.chapterId}/${t.skillId}`)}
                >
                  {title(t.chapterId)}
                </GameButton>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Rewards r={r} isNew={p.isNew} />

      <div className="flex flex-wrap gap-2">
        <GameButton variant="surface" aria-expanded={review} onClick={() => setReview((v) => !v)}>
          {review ? 'Masquer les corrections' : 'Revoir mes réponses et les explications'}
        </GameButton>
        <GameButton variant="surface" onClick={() => void navigate('/hub')}>
          Accueil
        </GameButton>
        <Link
          to={p.back}
          className="font-display focus-visible:outline-gold self-center text-lg underline focus-visible:outline-4"
        >
          Mes épreuves
        </Link>
      </div>
      {review && <Review id={r.id} />}
    </PageShell>
  );
}

/** Corrections : enfin, la question, la réponse donnée, la bonne réponse et l'explication. */
function Review({ id }: { readonly id: string }) {
  const { data, isLoading } = useEvaluationReview(id, true);
  if (isLoading || !data) return <p role="status">Chargement des corrections…</p>;
  return (
    <ol className="flex flex-col gap-2" aria-label="Corrections">
      {data.questions.map((q, i) => {
        const question = generateEvaluation(q.skillId, q.level, q.seed);
        const response = q.response as Parameters<typeof formatResponse>[1];
        const given = response.kind === 'unknown' ? 'Je ne sais pas' : formatResponse(question, response);
        const why = response.kind === 'unknown' ? undefined : check(question, response).why;
        return (
          <li key={i} className="cartoon bg-surface flex flex-col gap-1 p-3 text-lg">
            <MathText text={question.prompt} />
            <span className={q.correct ? 'text-success font-bold' : 'font-bold'}>
              {q.correct ? 'Réussie' : 'À retravailler'} · ta réponse : <MathText text={given} />
            </span>
            {!q.correct && (
              <span className="font-bold">
                Bonne réponse : <MathText text={formatAnswer(question)} />
              </span>
            )}
            {!q.correct && (why ?? question.steps.at(-1)) && (
              <span className="text-muted">
                <MathText text={why ?? question.steps.at(-1) ?? ''} />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
