import { z } from 'zod';

/**
 * Abonnement familial (docs/adr/0020-abonnement.md) : paiement unique par année scolaire, sans
 * renouvellement automatique ; droits d'accès séparés du moteur de jeu.
 */

export const SUBSCRIPTION_STATUSES = ['en-attente', 'payee', 'echouee', 'remboursee'] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  'en-attente': 'Paiement en attente',
  payee: 'Payé',
  echouee: 'Paiement refusé',
  remboursee: 'Remboursé',
};

/** Offres (une seule pour l'instant ; le champ permet d'en ajouter sans migration). */
export const OFFERS = ['famille-annee'] as const;
export type Offer = (typeof OFFERS)[number];

/**
 * Fin de l'accès payé : la première fin d'année scolaire (`schoolYearEnd`, MM-JJ) tombant au
 * moins `minDays` jours après le paiement. Payer en juillet donne donc l'année suivante entière.
 */
export function premiumEndFor(paidOn: string, schoolYearEnd: string, minDays: number): string {
  const paid = Date.parse(`${paidOn}T00:00:00Z`);
  for (let year = Number(paidOn.slice(0, 4)); ; year++) {
    const end = `${year}-${schoolYearEnd}`;
    if ((Date.parse(`${end}T00:00:00Z`) - paid) / 86_400_000 >= minDays) return end;
  }
}

export const SubscriptionSchema = z.object({
  id: z.uuid(),
  offer: z.enum(OFFERS),
  status: z.enum(SUBSCRIPTION_STATUSES),
  amountCents: z.number().int().nonnegative(),
  currency: z.string(),
  /** Fin de l'accès payé (AAAA-MM-JJ). */
  periodEnd: z.string(),
  createdAt: z.string(),
  paidAt: z.string().nullable(),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const BillingSchema = z.object({
  /** Accès complet aujourd'hui. */
  premium: z.boolean(),
  /** Fin de l'accès payé en cours (ou du dernier, expiré), ou null. */
  until: z.string().nullable(),
  priceCents: z.number().int().positive(),
  currency: z.string(),
  /** Fin de l'accès si l'on payait aujourd'hui. */
  wouldEnd: z.string(),
  /** Le paiement en ligne est-il ouvert (prestataire configuré) ? */
  available: z.boolean(),
  /** Simulateur de paiement (développement et tests uniquement). */
  simulated: z.boolean(),
  history: z.array(SubscriptionSchema),
});
export type Billing = z.infer<typeof BillingSchema>;

export const CheckoutSchema = z.object({ url: z.string() });
export const SimulatePaymentSchema = z.object({ outcome: z.enum(['succes', 'echec']) });
