import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  subjectLabel,
  playedGrade,
  type EvaluationKind,
  type Profile,
  SUBJECT_IDS,
  type SubjectId,
} from '@epicademie/shared';
import { ApiError } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { evaluationHomeKey, startEvaluation, useEvaluationHome } from './api.ts';
import { competenceTitle, gradeName, KIND_INFO, round5 } from './texts.ts';

const KINDS: readonly EvaluationKind[] = ['origines', 'progression', 'maitres'];

const dateOf = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

/** Accueil de l'Arène d'évaluation pour une matière : épreuve à reprendre, choix du type, historique, entraînements conseillés. */
export function EvaluationHome({ profile }: { readonly profile: Profile }) {
  const params = useParams();
  const subject: SubjectId = (SUBJECT_IDS as readonly string[]).includes(params.subject ?? '')
    ? (params.subject as SubjectId)
    : 'maths';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toast, showToast] = useToast(3000);
  const [busy, setBusy] = useState(false);
  const { data: home, isLoading, isError } = useEvaluationHome(profile.id, subject);
  const name = subjectLabel(subject, playedGrade(profile.grade));

  const start = async (kind: EvaluationKind) => {
    if (busy) return;
    setBusy(true);
    try {
      const { id } = await startEvaluation({ profileId: profile.id, subject, kind });
      void qc.invalidateQueries({ queryKey: evaluationHomeKey(profile.id, subject) });
      void navigate(`/partie/evaluation/${id}`);
    } catch (e) {
      showToast(e instanceof ApiError ? e.message : 'Impossible de lancer l’épreuve. Le serveur est-il joignable ?');
      setBusy(false);
    }
  };

  return (
    <PageShell title={`Arène d’évaluation · ${name}`} back="/jouer/evaluation">
      <div className="flex items-center gap-4">
        <Questy size={110} mood="proud" />
        <SpeechBubble>
          Pas de note ici : on fait le point pour savoir quoi travailler. Pas d’indice pendant l’épreuve, les
          explications viennent après !
        </SpeechBubble>
      </div>
      {isLoading && <p role="status">Chargement…</p>}
      {isError && <p role="alert">Impossible de charger l’Arène pour l’instant.</p>}
      {home && !home.available && (
        <p className="cartoon bg-surface p-4 text-lg font-bold">
          {home.grade === null ? (
            <>
              Indique ta classe dans{' '}
              <Link className="underline" to={`/profils/${profile.id}/modifier`}>
                ton profil
              </Link>{' '}
              pour passer une épreuve.
            </>
          ) : (
            `${name} arrive bientôt dans l’Arène d’évaluation !`
          )}
        </p>
      )}
      {home?.available && (
        <>
          {home.open && (
            <section aria-label="Épreuve en cours" className="cartoon bg-surface flex flex-wrap items-center gap-3 p-4">
              <p className="min-w-0 flex-1 text-lg font-bold">
                Tu as une épreuve en cours ({KIND_INFO[home.open.kind].name}, commencée le {dateOf(home.open.startedAt)}
                ).
              </p>
              <GameButton
                icon="icons-navigation-play"
                onClick={() => void navigate(`/partie/evaluation/${home.open?.id}`)}
              >
                Reprendre
              </GameButton>
            </section>
          )}
          <ul className="grid gap-4 md:grid-cols-3" aria-label="Types d’épreuve">
            {KINDS.map((kind) => {
              const info = KIND_INFO[kind];
              const offer = home.kinds.find((k) => k.kind === kind);
              const ready = info.open && Boolean(offer?.available);
              const blocked = Boolean(home.open && home.open.kind !== kind);
              return (
                <li key={kind} className="cartoon bg-surface flex flex-col gap-2 p-4">
                  <h2 className="font-display text-2xl tracking-wide">{info.name}</h2>
                  {offer?.recommended && ready && <p className="font-bold">★ Conseillée : {offer.reason}</p>}
                  <p className="flex-1 text-lg">{info.pitch(gradeName(offer?.referentialGrade ?? null))}</p>
                  {ready ? (
                    <>
                      <p className="text-muted">
                        {offer?.rewardable
                          ? 'Récompense complète : XP et coffre.'
                          : 'Déjà faite sur cette période : tu peux la refaire, avec une récompense réduite.'}
                      </p>
                      <GameButton
                        size="md"
                        icon="icons-navigation-play"
                        disabled={busy || blocked}
                        onClick={() => void start(kind)}
                        aria-label={`Lancer l’${info.name}`}
                      >
                        {home.open?.kind === kind ? 'Reprendre' : 'Commencer'}
                      </GameButton>
                      {blocked && <p className="text-muted">Termine d’abord l’épreuve en cours.</p>}
                    </>
                  ) : (
                    <p className="font-bold" aria-label={`${info.name}, bientôt`}>
                      Bientôt
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {home.trainings.length > 0 && (
            <section aria-label="Entraînements conseillés" className="flex flex-col gap-2">
              <h2 className="font-display text-toon text-2xl tracking-wide">Pour progresser</h2>
              <ul className="flex flex-wrap gap-2">
                {home.trainings.map((t) => (
                  <li key={t.skillId}>
                    <GameButton
                      variant="surface"
                      onClick={() => void navigate(`/partie/entrainement/${t.chapterId}/${t.skillId}`)}
                    >
                      S’entraîner : {competenceTitle(t.chapterId)}
                    </GameButton>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section aria-label="Historique des épreuves" className="flex flex-col gap-2">
            <h2 className="font-display text-toon text-2xl tracking-wide">Mes épreuves</h2>
            {home.history.length === 0 ? (
              <p className="cartoon bg-surface p-3 text-lg">
                Pas encore d’épreuve : la première te donnera ton point de départ.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {home.history.map((h) => (
                  <li key={h.id}>
                    <Link
                      to={`/evaluation/${h.id}/resultat`}
                      className="cartoon bg-surface focus-visible:outline-gold flex flex-wrap items-center justify-between gap-2 p-3 text-lg focus-visible:outline-4"
                    >
                      <span className="font-bold">
                        {KIND_INFO[h.kind].name} · {dateOf(h.finishedAt)}
                        {h.partial ? ' (arrêtée en cours de route)' : ''}
                      </span>
                      <span>
                        {h.mastery !== null ? `Maîtrise ${round5(h.mastery)} %` : 'Maîtrise : pas assez de questions'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
      {toast}
    </PageShell>
  );
}
