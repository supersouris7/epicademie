import type { FastifyBaseLogger } from 'fastify';

/**
 * Envoi d'e-mails (validation d'adresse, réinitialisation de mot de passe).
 *
 * `Mailer` est l'interface ; `brevoMailer` l'adaptateur de production (API HTTP transactionnelle),
 * `simulationMailer` le mode sans fournisseur (recette, développement) et `memoryMailer` la boîte
 * d'envoi des tests. Aucune adresse complète ni aucun contenu n'est écrit dans les journaux.
 */
export interface Mail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  /** Lien secret du message (journalisé en simulation seulement). */
  readonly link?: string;
}

export interface Mailer {
  readonly send: (mail: Mail) => Promise<void>;
}

/** `lea@exemple.fr` → `l***@exemple.fr` (journaux sans adresse complète). */
export const maskEmail = (email: string) => email.replace(/^(.)[^@]*/, '$1***');

/** Simulation : le lien est journalisé (niveau info), sans autre donnée personnelle. */
export function simulationMailer(log: FastifyBaseLogger): Mailer {
  return {
    send: async (mail) => {
      log.info({ link: mail.link ?? null }, 'e-mail simulé : aucun fournisseur configuré');
    },
  };
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

/** `Nom <a@b.fr>` ou `a@b.fr` → expéditeur Brevo. */
export function parseSender(from: string): { name?: string; email: string } {
  const m = /^\s*(.*?)\s*<([^<>]+)>\s*$/.exec(from);
  return m?.[1] ? { name: m[1], email: m[2] ?? from } : { email: (m?.[2] ?? from).trim() };
}

/** API transactionnelle Brevo (HTTP) : la clé vient de l'environnement, jamais du code. */
export function brevoMailer(options: { apiKey: string; from: string; fetcher?: typeof fetch }): Mailer {
  const fetcher = options.fetcher ?? fetch;
  const sender = parseSender(options.from);
  return {
    send: async (mail) => {
      const res = await fetcher(BREVO_URL, {
        method: 'POST',
        headers: { 'api-key': options.apiKey, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender, to: [{ email: mail.to }], subject: mail.subject, textContent: mail.text }),
        signal: AbortSignal.timeout(10_000),
      });
      // Statut seul dans l'erreur : ni destinataire ni contenu.
      if (!res.ok) throw new Error(`envoi d'e-mail refusé par Brevo (HTTP ${res.status})`);
    },
  };
}

/** Boîte d'envoi en mémoire (tests) : les e-mails « envoyés » sont consultables. */
export function memoryMailer(): Mailer & { readonly outbox: Mail[] } {
  const outbox: Mail[] = [];
  return {
    outbox,
    send: async (mail) => {
      outbox.push(mail);
    },
  };
}

/**
 * Envoi détaché : `send` rend la main aussitôt, sans attendre le fournisseur, pour que le temps de
 * réponse d'une route ne dépende ni de lui ni de l'existence de l'adresse. Une erreur d'envoi est
 * journalisée (nature seulement : ni destinataire, ni contenu, ni lien). `idle()` attend les envois en cours.
 */
export function detachedMailer(
  mailer: Mailer,
  log: Pick<FastifyBaseLogger, 'warn'>,
): Mailer & { readonly idle: () => Promise<void> } {
  const pending = new Set<Promise<void>>();
  return {
    send: async (mail) => {
      const task: Promise<void> = (async () => mailer.send(mail))()
        .catch((err: unknown) => {
          log.warn(
            { event: 'mail_send_failed', reason: err instanceof Error ? err.name : 'inconnue' },
            'envoi d’e-mail échoué',
          );
        })
        .finally(() => pending.delete(task));
      pending.add(task);
    },
    idle: async () => {
      while (pending.size > 0) await Promise.all([...pending]);
    },
  };
}
