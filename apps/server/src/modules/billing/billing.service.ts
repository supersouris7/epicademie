import { chapterOfAnySkill, getChapter, isFreeChapter } from '@questeo/content';
import { premiumEndFor, type Billing } from '@questeo/shared';
import type { Db } from '../../db/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { BillingConfig } from '../../config.ts';
import { AppError, conflict, notFound, premiumRequired } from '../../core/errors.ts';
import { billingRepo } from './billing.repo.ts';
import { stripeClient, type StripeEvent } from './stripe.ts';

/**
 * Abonnement familial (docs/adr/0020-abonnement.md) : paiement unique par année scolaire, sans
 * renouvellement automatique. L'accès premium se déduit des paiements réussis ; les progrès
 * restent accessibles après expiration (seul le jeu sur les chapitres payants s'arrête).
 */

export interface BillingDeps {
  readonly db: Db;
  readonly clock: Clock;
  readonly config: BillingConfig;
  /** Adresse publique du site (retours de paiement). */
  readonly appUrl: () => string;
  /** Appels HTTP vers le prestataire (remplaçable en test). */
  readonly fetcher?: typeof fetch;
  /** Paiement clos (métriques). */
  readonly onSettled?: (status: 'payee' | 'echouee') => void;
}

const OFFER = 'famille-annee' as const;

export function createBillingService({ db, clock, config, appUrl, fetcher, onSettled }: BillingDeps) {
  const repo = billingRepo(db);
  const today = () => clock.today();
  const wouldEnd = () => premiumEndFor(today(), config.schoolYearEnd, config.minDays);

  const status = async (familyId: string): Promise<Billing> => {
    const [history, active] = await Promise.all([repo.history(familyId), repo.activeUntil(familyId, today())]);
    const lastPaid = history
      .filter((h) => h.status === 'payee')
      .map((h) => h.periodEnd)
      .sort()
      .at(-1);
    return {
      premium: active !== undefined,
      until: active ?? lastPaid ?? null,
      priceCents: config.priceCents,
      currency: config.currency,
      wouldEnd: wouldEnd(),
      available: config.provider !== 'aucun',
      simulated: config.provider === 'simulateur',
      history: history.map((h) => ({
        id: h.id,
        offer: h.offer,
        status: h.status,
        amountCents: h.amountCents,
        currency: h.currency,
        periodEnd: h.periodEnd,
        createdAt: h.createdAt.toISOString(),
        paidAt: h.paidAt?.toISOString() ?? null,
      })),
    };
  };

  /** Clôt un paiement en attente (une seule fois, quel que soit le nombre de notifications). */
  const settle = async (id: string, outcome: 'payee' | 'echouee') => {
    const changed = await db.transaction(async (tx) => {
      const r = billingRepo(tx);
      const sub = await r.findForUpdate(id);
      if (sub?.status !== 'en-attente') return false;
      await r.settle(id, outcome, clock.now());
      return true;
    });
    if (changed) onSettled?.(outcome);
  };

  const isPremium = async (familyId: string) => (await repo.activeUntil(familyId, today())) !== undefined;

  return {
    status,
    isPremium,

    /** Un chapitre payant demande l'abonnement (le 1er chapitre de chaque classe est gratuit). */
    async requireChapter(familyId: string, chapterId: string): Promise<void> {
      if (!getChapter(chapterId) || isFreeChapter(chapterId)) return;
      if (!(await isPremium(familyId))) throw premiumRequired();
    },

    /** Même règle pour une notion (révisions, séances ciblées : plusieurs chapitres). */
    async requireSkill(familyId: string, skillId: string): Promise<void> {
      const chapter = chapterOfAnySkill(skillId);
      if (!chapter || isFreeChapter(chapter.id)) return;
      if (!(await isPremium(familyId))) throw premiumRequired();
    },

    /** Commence le paiement de l'année scolaire ; renvoie la page de paiement. */
    async checkout(familyId: string): Promise<{ url: string }> {
      if (config.provider === 'aucun') {
        throw new AppError('UNAVAILABLE', 'Le paiement en ligne n’est pas encore ouvert.');
      }
      const end = wouldEnd();
      const active = await repo.activeUntil(familyId, today());
      if (active !== undefined && active >= end) throw conflict('L’abonnement couvre déjà cette année scolaire.');
      const id = await repo.create({
        familyId,
        offer: OFFER,
        amountCents: config.priceCents,
        currency: config.currency,
        periodEnd: end,
        provider: config.provider,
      });
      if (config.provider === 'simulateur') return { url: `/parent/abonnement/simulateur?paiement=${id}` };
      const stripe = stripeClient(config.stripeSecretKey ?? '', fetcher);
      const session = await stripe.createCheckout({
        subscriptionId: id,
        amountCents: config.priceCents,
        currency: config.currency,
        label: `Academy Fighters — abonnement familial jusqu’au ${end}`,
        successUrl: `${appUrl()}/parent/abonnement?paiement=ok`,
        cancelUrl: `${appUrl()}/parent/abonnement?paiement=annule`,
      });
      await repo.setProviderRef(id, session.id);
      return { url: session.url };
    },

    /**
     * Avant l'effacement d'une famille : ferme les sessions de paiement Stripe encore ouvertes.
     * Le paiement est unique (aucun renouvellement à résilier). Une erreur du prestataire
     * interrompt la suppression : mieux vaut réessayer que laisser un paiement possible.
     */
    async cancelPending(familyId: string): Promise<void> {
      if (config.provider !== 'stripe') return;
      const stripe = stripeClient(config.stripeSecretKey ?? '', fetcher);
      for (const ref of await repo.pendingStripeRefs(familyId)) await stripe.expireCheckout(ref);
    },

    /** Simulateur (hors production) : le parent choisit l'issue du paiement. */
    async simulate(familyId: string, id: string, outcome: 'succes' | 'echec'): Promise<Billing> {
      if (config.provider !== 'simulateur') throw notFound('Simulateur indisponible');
      const sub = (await repo.history(familyId)).find((h) => h.id === id);
      if (!sub) throw notFound('Paiement introuvable');
      await settle(id, outcome === 'succes' ? 'payee' : 'echouee');
      return status(familyId);
    },

    /** Notification Stripe (déjà vérifiée) : paiement réussi ou échoué ; idempotente. */
    async stripeEvent(event: StripeEvent): Promise<void> {
      const object = event.data.object;
      const metadata = object.metadata as Record<string, string> | undefined;
      const id = metadata?.subscription_id;
      if (!id) return;
      if (event.type === 'checkout.session.completed' && object.payment_status === 'paid') await settle(id, 'payee');
      if (event.type === 'checkout.session.async_payment_succeeded') await settle(id, 'payee');
      if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
        await settle(id, 'echouee');
      }
    },
  };
}

export type BillingService = ReturnType<typeof createBillingService>;
