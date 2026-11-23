import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ApiError } from '../../shared/api/client.ts';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useTestMailbox } from './api.ts';

const URL_RE = /(https?:\/\/[^\s]+)/g;

/** Chemin interne d'un lien absolu (le site de recette peut être joint par plusieurs adresses). */
const internalPath = (link: string) => {
  try {
    const u = new URL(link, window.location.origin);
    return `${u.pathname}${u.search}`;
  } catch {
    return link;
  }
};

/** Texte du message, liens cliquables. */
function MailText({ text }: { readonly text: string }) {
  return (
    <p className="break-words whitespace-pre-line">
      {text.split(URL_RE).map((part, i) =>
        i % 2 === 1 ? (
          <Link key={i} to={internalPath(part)} className="font-bold underline">
            {part}
          </Link>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/**
 * Recette : les e-mails simulés (aucun envoi réel), pour retrouver les liens de validation ou de
 * nouveau mot de passe. Le serveur répond 404 hors simulation (jamais en production).
 */
export function TestMailboxScreen() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get('email') ?? '');
  const { data, error, isPending } = useTestMailbox(true);
  const wanted = email.trim().toLowerCase();
  const messages = (data?.messages ?? []).filter((m) => !wanted || m.to.toLowerCase() === wanted);
  return (
    <PageShell title="Boîte mail de test" back="/connexion">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <p className="text-lg">
          Version de test : aucun e-mail n’est envoyé. Retrouvez ici les messages que vous auriez reçus.
        </p>
        <label className="flex flex-col gap-1">
          <span className="font-bold">Adresse e-mail (laisser vide pour tout voir)</span>
          <input
            type="email"
            className="cartoon bg-surface px-3 py-3 text-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-danger font-bold">
            {error instanceof ApiError && error.status === 404
              ? 'La boîte mail de test n’est pas disponible sur ce serveur.'
              : 'Impossible de lire la boîte mail de test pour le moment.'}
          </p>
        )}
        {!error && !isPending && messages.length === 0 && <p role="status">Aucun message pour le moment.</p>}
        <ul className="flex flex-col gap-3">
          {messages.map((m) => (
            <li key={`${m.sentAt}-${m.to}-${m.subject}`} className="cartoon bg-surface flex flex-col gap-2 p-4">
              <h2 className="text-lg font-bold">{m.subject}</h2>
              <p className="text-muted text-sm">
                Pour {m.to} · {new Date(m.sentAt).toLocaleString('fr-FR')}
              </p>
              <MailText text={m.text} />
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
