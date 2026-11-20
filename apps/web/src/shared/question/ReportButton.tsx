import { useState } from 'react';
import { api, REPORT_REASON_LABELS, REPORT_REASONS, type ReportReason } from '@questeo/shared';
import type { Question } from '@questeo/content';
import { ApiError, request } from '../api/client.ts';
import { useSession } from '../lib/session.ts';
import { GameButton } from '../ui/game/GameButton.tsx';

/**
 * « Signaler un problème » sur une question : un motif à choisir (et une précision facultative),
 * envoyé à l'équipe avec la notion, le niveau et la graine (la question exacte se régénère).
 * Petit bouton discret, à côté de la pause.
 */
export function ReportButton({ question }: { readonly question: Question }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Signaler un problème"
        title="Signaler un problème"
        className="cartoon cartoon-press bg-surface-2 flex h-11 w-11 shrink-0 items-center justify-center hover:brightness-110 focus-visible:outline-4 focus-visible:outline-offset-2"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path d="M6 3v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor" />
        </svg>
      </button>
      {open && <ReportDialog question={question} onClose={() => setOpen(false)} />}
    </>
  );
}

function ReportDialog({ question, onClose }: { readonly question: Question; readonly onClose: () => void }) {
  const profileId = useSession((s) => s.profileId);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'edit' | 'sending' | 'sent'>('edit');
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!reason || !profileId) return;
    setState('sending');
    try {
      await request(api.reportQuestion, {
        body: {
          profileId,
          skillId: question.skillId,
          level: question.level,
          seed: question.seed,
          reason,
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        },
      });
      setState('sent');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible pour le moment.');
      setState('edit');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Signaler un problème"
    >
      <div className="cartoon bg-surface flex max-h-[90dvh] w-full max-w-md flex-col gap-3 overflow-y-auto p-5">
        <h2 className="font-display text-2xl tracking-wide">Signaler un problème</h2>
        {state === 'sent' ? (
          <>
            <p role="status">Merci ! L’équipe va regarder cette question.</p>
            <GameButton onClick={onClose}>Fermer</GameButton>
          </>
        ) : (
          <>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 font-bold">Qu’est-ce qui ne va pas ?</legend>
              {REPORT_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2">
                  <input type="radio" name="motif" checked={reason === r} onChange={() => setReason(r)} />
                  {REPORT_REASON_LABELS[r]}
                </label>
              ))}
            </fieldset>
            <label className="flex flex-col gap-1 font-bold">
              Précision (facultatif)
              <textarea
                maxLength={500}
                rows={3}
                className="cartoon bg-surface-2 px-3 py-2 font-normal"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="text-danger font-bold">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <GameButton disabled={!reason || state === 'sending'} onClick={() => void send()}>
                Envoyer
              </GameButton>
              <GameButton variant="surface" onClick={onClose}>
                Annuler
              </GameButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
