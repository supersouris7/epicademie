import type { FastifyBaseLogger } from 'fastify';

/**
 * Envoi d'e-mails (réinitialisation de mot de passe, et plus tard reçus d'abonnement).
 *
 * Interface seulement : aucun fournisseur n'est branché tant qu'un compte n'a pas été ouvert
 * (décision humaine, voir docs/implementation/SUIVI.md). Sans fournisseur, `logMailer` écrit
 * dans les journaux le destinataire masqué et l'objet — jamais le contenu, qui porte un lien
 * secret. En développement uniquement, il écrit aussi le lien pour pouvoir tester.
 */
export interface Mail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
}

export interface Mailer {
  readonly send: (mail: Mail) => Promise<void>;
}

/** `lea@exemple.fr` → `l***@exemple.fr` (journaux sans adresse complète). */
export const maskEmail = (email: string) => email.replace(/^(.)[^@]*/, '$1***');

export function logMailer(log: FastifyBaseLogger, { revealContent }: { revealContent: boolean }): Mailer {
  return {
    send: async (mail) => {
      log.warn(
        { to: maskEmail(mail.to), subject: mail.subject, ...(revealContent ? { text: mail.text } : {}) },
        'e-mail non envoyé : aucun fournisseur configuré',
      );
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
