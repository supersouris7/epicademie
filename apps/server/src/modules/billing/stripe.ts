import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stripe, sans SDK : création d'une session de paiement (Checkout, paiement unique) et
 * vérification de la signature des webhooks. Aucune clé n'est configurée tant qu'un compte
 * marchand n'a pas été ouvert (décision humaine) ; les tests utilisent des clés factices et un
 * faux `fetch`.
 * Références : https://docs.stripe.com/api/checkout/sessions/create,
 * https://docs.stripe.com/webhooks#verify-manually
 */

export interface CheckoutRequest {
  readonly subscriptionId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly label: string;
  readonly successUrl: string;
  readonly cancelUrl: string;
}

export interface StripeEvent {
  readonly id: string;
  readonly type: string;
  readonly data: { readonly object: Record<string, unknown> };
}

/** Écart maximal entre l'horodatage signé et maintenant (protection contre le rejeu). */
const TOLERANCE_SECONDS = 300;

export function stripeClient(secretKey: string, fetcher: typeof fetch = fetch) {
  return {
    /** Session Checkout ; renvoie son identifiant et l'adresse de la page de paiement. */
    async createCheckout(r: CheckoutRequest): Promise<{ id: string; url: string }> {
      const form = new URLSearchParams({
        mode: 'payment',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': r.currency,
        'line_items[0][price_data][unit_amount]': String(r.amountCents),
        'line_items[0][price_data][product_data][name]': r.label,
        client_reference_id: r.subscriptionId,
        'metadata[subscription_id]': r.subscriptionId,
        success_url: r.successUrl,
        cancel_url: r.cancelUrl,
      });
      const res = await fetcher('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          // Une requête rejouée ne crée pas deux sessions.
          'Idempotency-Key': `checkout-${r.subscriptionId}`,
        },
        body: form,
      });
      const body = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
      if (!res.ok || !body.id || !body.url) throw new Error(`Stripe : ${body.error?.message ?? res.status}`);
      return { id: body.id, url: body.url };
    },
  };
}

/**
 * Vérifie la signature `Stripe-Signature: t=…,v1=…` (HMAC-SHA256 de « t.corps brut ») et
 * l'horodatage ; renvoie l'événement, ou null si la signature est absente, fausse ou trop vieille.
 */
export function verifyStripeEvent(
  rawBody: string,
  header: string | undefined,
  secret: string,
  nowSeconds: number,
): StripeEvent | null {
  if (!header) return null;
  const parts = new Map<string, string[]>();
  for (const item of header.split(',')) {
    const [k, v] = item.split('=', 2);
    if (k && v) parts.set(k.trim(), [...(parts.get(k.trim()) ?? []), v.trim()]);
  }
  const t = Number(parts.get('t')?.[0]);
  if (!Number.isFinite(t) || Math.abs(nowSeconds - t) > TOLERANCE_SECONDS) return null;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  const ok = (parts.get('v1') ?? []).some((sig) => {
    const given = Buffer.from(sig, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
  if (!ok) return null;
  try {
    return JSON.parse(rawBody) as StripeEvent;
  } catch {
    return null;
  }
}

/** Signature d'un événement (tests et outils) : même calcul que Stripe. */
export const signStripePayload = (rawBody: string, secret: string, t: number) =>
  `t=${t},v1=${createHmac('sha256', secret).update(`${t}.${rawBody}`).digest('hex')}`;
