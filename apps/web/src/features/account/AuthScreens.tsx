import { useId, useState, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';
import { PASSWORD_MIN } from '@questeo/shared';
import { ApiError } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { forgotPassword, login, resetPassword, signup, useMe, useSetMe } from './api.ts';

/**
 * Écrans du compte familial (connexion, inscription, mot de passe oublié) et garde des pages
 * qui demandent une session. Écrits pour le parent : phrases simples, une action par écran.
 */

const message = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

/**
 * Pages réservées aux appareils connectés : sans session, retour à la connexion. `children`
 * (temps réel, notifications) n'est monté qu'une fois la session vérifiée.
 */
export function RequireAccount({ children }: { readonly children?: ReactNode }) {
  const { data, error, isPending, refetch } = useMe();
  const location = useLocation();
  if (isPending) return <p className="p-8 text-xl">Chargement…</p>;
  if (error instanceof ApiError && error.status === 401) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }
  if (!data) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{message(error, 'Impossible de joindre le serveur.')}</p>
        <GameButton onClick={() => void refetch()}>Réessayer</GameButton>
      </div>
    );
  }
  return (
    <>
      {children}
      <Outlet />
    </>
  );
}

/** Champ de formulaire simple, libellé au-dessus ; l'aide est liée au champ (lecteurs d'écran). */
function Field(props: {
  readonly label: string;
  readonly type: 'email' | 'password';
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly autoComplete: string;
  readonly hint?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {props.label}
      </label>
      <input
        id={id}
        type={props.type}
        autoComplete={props.autoComplete}
        required
        aria-describedby={props.hint ? `${id}-aide` : undefined}
        className="cartoon bg-surface px-3 py-3 text-lg"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
      {props.hint && (
        <span id={`${id}-aide`} className="text-muted text-sm">
          {props.hint}
        </span>
      )}
    </div>
  );
}

function AuthForm(props: {
  readonly title: string;
  readonly intro: ReactNode;
  readonly submit: string;
  readonly onSubmit: () => Promise<void>;
  readonly error: string | null;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <PageShell title={props.title}>
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          void props.onSubmit().finally(() => setBusy(false));
        }}
      >
        <div className="flex items-center gap-3">
          <Questy mood="happy" size={72} />
          <p className="text-lg">{props.intro}</p>
        </div>
        {props.children}
        {props.error && (
          <p role="alert" className="text-danger font-bold">
            {props.error}
          </p>
        )}
        <GameButton type="submit" size="lg" disabled={busy}>
          {props.submit}
        </GameButton>
        {props.footer && <div className="flex flex-col gap-2 text-center font-bold">{props.footer}</div>}
      </form>
    </PageShell>
  );
}

export function LoginScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const setMe = useSetMe();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  return (
    <AuthForm
      title="Connexion"
      intro="Connecte l’appareil au compte de la famille : les enfants pourront ensuite choisir leur profil."
      submit="Se connecter"
      error={error}
      onSubmit={async () => {
        try {
          setMe(await login({ email, password }));
          void navigate(from, { replace: true });
        } catch (err) {
          setError(message(err, 'Connexion impossible pour le moment.'));
        }
      }}
      footer={
        <>
          <Link to="/inscription" className="underline">
            Pas encore de compte ? Créer le compte familial
          </Link>
          <Link to="/mot-de-passe-oublie" className="underline">
            Mot de passe oublié
          </Link>
        </>
      }
    >
      <Field label="E-mail du parent" type="email" autoComplete="email" value={email} onChange={setEmail} />
      <Field
        label="Mot de passe"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />
    </AuthForm>
  );
}

export function SignupScreen() {
  const navigate = useNavigate();
  const setMe = useSetMe();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <AuthForm
      title="Compte familial"
      intro="Un compte pour toute la famille : le parent le crée, puis ajoute le profil de chaque enfant."
      submit="Créer le compte"
      error={error}
      onSubmit={async () => {
        if (password.length < PASSWORD_MIN) {
          setError(`Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`);
          return;
        }
        try {
          setMe(await signup({ email, password }));
          void navigate('/profils/nouveau', { replace: true });
        } catch (err) {
          setError(message(err, 'Création impossible pour le moment.'));
        }
      }}
      footer={
        <Link to="/connexion" className="underline">
          J’ai déjà un compte
        </Link>
      }
    >
      <Field label="E-mail du parent" type="email" autoComplete="email" value={email} onChange={setEmail} />
      <Field
        label="Mot de passe"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        hint={`Au moins ${PASSWORD_MIN} caractères. Une phrase facile à retenir fonctionne très bien.`}
      />
    </AuthForm>
  );
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (sent) {
    return (
      <PageShell title="Mot de passe oublié" back="/connexion">
        <p className="text-lg" role="status">
          Si un compte existe pour {email}, un e-mail vient de partir avec un lien pour choisir un nouveau mot de passe.
          Il est valable une heure.
        </p>
      </PageShell>
    );
  }
  return (
    <AuthForm
      title="Mot de passe oublié"
      intro="Indique l’adresse du compte : tu recevras un lien pour choisir un nouveau mot de passe."
      submit="Recevoir le lien"
      error={error}
      onSubmit={async () => {
        try {
          await forgotPassword(email);
          setSent(true);
        } catch (err) {
          setError(message(err, 'Envoi impossible pour le moment.'));
        }
      }}
      footer={
        <Link to="/connexion" className="underline">
          Retour à la connexion
        </Link>
      }
    >
      <Field label="E-mail du parent" type="email" autoComplete="email" value={email} onChange={setEmail} />
    </AuthForm>
  );
}

export function ResetPasswordScreen() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const token = params.get('jeton') ?? '';
  return (
    <AuthForm
      title="Nouveau mot de passe"
      intro="Choisis le nouveau mot de passe du compte familial. Les autres appareils seront déconnectés."
      submit="Enregistrer"
      error={error}
      onSubmit={async () => {
        if (password.length < PASSWORD_MIN) {
          setError(`Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`);
          return;
        }
        try {
          await resetPassword(token, password);
          void navigate('/connexion', { replace: true });
        } catch (err) {
          setError(message(err, 'Enregistrement impossible pour le moment.'));
        }
      }}
    >
      <Field
        label="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={setPassword}
        hint={`Au moins ${PASSWORD_MIN} caractères.`}
      />
    </AuthForm>
  );
}
