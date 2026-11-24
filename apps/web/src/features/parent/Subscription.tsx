import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { api, SUBSCRIPTION_STATUS_LABELS } from '@epicademie/shared';
import { ApiError, request } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { useParentGate } from '../account/index.ts';
import { ParentPage } from './ParentShell.tsx';
import { billingKey, formatDay, formatPrice, useBilling } from './billing.ts';

/**
 * Abonnement familial, côté parent : ce qui est inclus, l'accès en cours, le paiement de
 * l'année scolaire (sans renouvellement automatique) et l'historique des paiements.
 */
export function Subscription() {
  const { data: b, isPending } = useBilling();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const withParent = useParentGate();
  const [error, setError] = useState<string | null>(null);
  const pay = () =>
    withParent(async () => {
      const { url } = await request(api.checkout);
      // Page du prestataire (autre site) ou simulateur (page de l'application).
      if (/^https?:/.test(url)) window.location.assign(url);
      else void navigate(url);
    }).catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Paiement impossible pour le moment.'));
  const returned = params.get('paiement');
  return (
    <ParentPage title="Abonnement familial">
      {returned === 'ok' && <p role="status">Merci ! Le paiement est en cours de validation.</p>}
      {returned === 'annule' && <p role="status">Paiement annulé : rien n’a été débité.</p>}
      {isPending && <p>Chargement…</p>}
      {b && (
        <>
          <section className="cartoon bg-surface flex flex-col gap-2 p-4">
            <h2 className="font-display text-2xl tracking-wide">
              {b.premium ? 'Abonnement actif' : 'Version gratuite'}
            </h2>
            {b.premium && b.until && <p>Tous les chapitres sont ouverts jusqu’au {formatDay(b.until)}.</p>}
            {!b.premium && (
              <p>
                Le 1er chapitre de chaque classe et de chaque matière est gratuit, sans limite d’exercices.
                {b.until &&
                  ` Le dernier abonnement s’est terminé le ${formatDay(b.until)} : les progrès sont conservés.`}
              </p>
            )}
            <ul className="list-disc pl-5">
              <li>Tous les chapitres, de toutes les classes et de toutes les matières.</li>
              <li>Tous les entraînements et tous les combats de boss.</li>
              <li>Tous les profils enfants de la famille.</li>
              <li>Paiement unique : pas de renouvellement automatique.</li>
            </ul>
            {b.available ? (
              <GameButton onClick={() => void pay()}>
                {b.premium ? 'Payer l’année suivante' : 'Payer l’année scolaire'} —{' '}
                {formatPrice(b.priceCents, b.currency)} (jusqu’au {formatDay(b.wouldEnd)})
              </GameButton>
            ) : (
              <p className="font-bold">Le paiement en ligne n’est pas encore ouvert.</p>
            )}
            {error && (
              <p role="alert" className="text-danger font-bold">
                {error}
              </p>
            )}
          </section>
          {b.history.length > 0 && (
            <section aria-labelledby="historique" className="flex flex-col gap-2">
              <h2 id="historique" className="font-display text-xl tracking-wide">
                Historique des paiements
              </h2>
              <ul className="flex flex-col gap-1">
                {b.history.map((h) => (
                  <li key={h.id} className="cartoon bg-surface px-3 py-2 text-sm">
                    {new Date(h.createdAt).toLocaleDateString('fr-FR')} — {formatPrice(h.amountCents, h.currency)} —{' '}
                    {SUBSCRIPTION_STATUS_LABELS[h.status]} (accès jusqu’au {formatDay(h.periodEnd)})
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </ParentPage>
  );
}

/** Simulateur de paiement (développement et tests uniquement : le serveur le refuse en production). */
export function PaymentSimulator() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const id = params.get('paiement') ?? '';
  const settle = async (outcome: 'succes' | 'echec') => {
    await request(api.simulatePayment, { params: { id }, body: { outcome } });
    await qc.invalidateQueries({ queryKey: billingKey });
    void navigate('/parent/abonnement');
  };
  return (
    <ParentPage title="Simulateur de paiement" back={{ to: '/parent/abonnement', label: 'Abonnement' }}>
      <p>Aucun paiement réel : choisis l’issue du paiement pour tester l’application.</p>
      <div className="flex flex-wrap gap-3">
        <GameButton variant="success" onClick={() => void settle('succes')}>
          Paiement accepté
        </GameButton>
        <GameButton variant="danger" onClick={() => void settle('echec')}>
          Paiement refusé
        </GameButton>
      </div>
    </ParentPage>
  );
}
