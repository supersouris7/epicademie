import { useState } from 'react';
import { useLocation } from 'react-router';
import { api, GENERAL_REPORT_REASONS, REPORT_REASON_LABELS, type ReportReason } from '@epicademie/shared';
import { ApiError, request } from '../api/client.ts';
import { GameButton } from '../ui/game/GameButton.tsx';

/**
 * « Signaler un problème sur cet écran » (bug, affichage, son, trop difficile…), accessible depuis le menu
 * principal, l'Espace parent et, en mode debug, le drapeau de chaque écran. L'écran (route sans identifiant) et la version de
 * l'appli sont ajoutés automatiquement ; seule la précision facultative est saisie.
 */
export function GeneralReportButton({ className = '' }: { readonly className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Signaler un problème sur cet écran"
        title="Signaler un problème sur cet écran"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-4 focus-visible:outline-offset-2 ${className}`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path d="M6 3v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor" />
        </svg>
      </button>
      {open && <GeneralReportDialog onClose={() => setOpen(false)} />}
    </>
  );
}

export function GeneralReportDialog({ onClose }: { readonly onClose: () => void }) {
  const { pathname } = useLocation();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<'edit' | 'sending' | 'sent'>('edit');
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (!reason) return;
    setState('sending');
    try {
      await request(api.reportGeneral, {
        body: {
          reason: reason as (typeof GENERAL_REPORT_REASONS)[number],
          ...(comment.trim() ? { comment: comment.trim() } : {}),
          screen: pathname.slice(0, 200),
          appVersion: import.meta.env.VITE_RELEASE ?? 'dev',
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
      aria-label="Signaler un problème sur cet écran"
    >
      <div className="cartoon bg-surface flex max-h-[90dvh] w-full max-w-md flex-col gap-3 overflow-y-auto p-5">
        <h2 className="font-display text-2xl tracking-wide">Un problème sur cet écran ?</h2>
        {state === 'sent' ? (
          <>
            <p role="status">Merci ! On va regarder cet écran.</p>
            <GameButton onClick={onClose}>Fermer</GameButton>
          </>
        ) : (
          <>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 font-bold">Qu’est-ce qui ne va pas ?</legend>
              {GENERAL_REPORT_REASONS.map((r) => (
                <label key={r} className="flex items-center gap-2">
                  <input type="radio" name="souci" checked={reason === r} onChange={() => setReason(r)} />
                  {REPORT_REASON_LABELS[r]}
                </label>
              ))}
            </fieldset>
            <label className="flex flex-col gap-1 font-bold">
              Dis-nous en plus (facultatif)
              <textarea
                maxLength={500}
                rows={3}
                className="cartoon bg-surface-2 px-3 py-2 font-normal"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
            <p className="text-sm opacity-80">N’écris pas ton nom, ton e-mail ni ton téléphone.</p>
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
