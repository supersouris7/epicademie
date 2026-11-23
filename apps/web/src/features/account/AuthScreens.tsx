import { useId, useState, type ReactNode } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router';
import { PASSWORD_MIN } from '@questeo/shared';
import { ApiError } from '../../shared/api/client.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import {
  forgotPassword,
  GOOGLE_START_URL,
  login,
  resendVerification,
  resetPassword,
  signup,
  useAuthOptions,
  useMe,
  useSetMe,
  verifyEmail,
} from './api.ts';

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
    return <Navigate to="/bienvenue" replace state={{ from: location.pathname }} />;
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

/** « Continuer avec Google » : lien (redirection du navigateur), affiché seulement si le serveur l'a configuré. */
function GoogleButton() {
  const { data } = useAuthOptions();
  if (!data?.google) return null;
  return (
    <>
      <a
        href={GOOGLE_START_URL}
        className="cartoon bg-surface focus-visible:outline-primary flex min-h-14 items-center justify-center px-5 text-xl font-bold"
      >
        Continuer avec Google
      </a>
      <p className="text-muted text-center text-sm" aria-hidden="true">
        ou avec ton e-mail
      </p>
    </>
  );
}

/** Chemin interne d'un lien absolu (simulation : le lien de validation est affiché pour la recette). */
const internalPath = (link: string) => {
  try {
    const u = new URL(link, window.location.origin);
    return `${u.pathname}${u.search}`;
  } catch {
    return link;
  }
};

/** Demande d'un nouveau lien de validation (le serveur limite le débit et ne dit rien sur l'adresse). */
function ResendVerification({ email }: { readonly email: string }) {
  const [state, setState] = useState<{ done: boolean; link?: string; error?: string }>({ done: false });
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <GameButton
        type="button"
        variant="surface"
        disabled={busy || email === ''}
        onClick={() => {
          setBusy(true);
          resendVerification(email)
            .then((r) => setState({ done: true, link: r.verificationLink }))
            .catch((err: unknown) => setState({ done: false, error: message(err, 'Envoi impossible pour le moment.') }))
            .finally(() => setBusy(false));
        }}
      >
        Renvoyer le lien
      </GameButton>
      {state.done && (
        <p role="status">Si cette adresse attend sa validation, un nouveau lien vient de partir. Pense aux spams.</p>
      )}
      {state.error && (
        <p role="alert" className="text-danger font-bold">
          {state.error}
        </p>
      )}
      {state.link && (
        <Link to={internalPath(state.link)} className="underline">
          Ouvrir le lien (mode simulation, sans envoi réel)
        </Link>
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
  /** Sous le message d'erreur (ex. renvoi du lien de validation). */
  readonly extra?: ReactNode;
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
        {props.extra}
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
  const [error, setError] = useState<string | null>(
    useSearchParams()[0].get('erreur') === 'google'
      ? 'Connexion avec Google impossible : réessaie, ou utilise ton e-mail.'
      : null,
  );
  const [unverified, setUnverified] = useState(false);
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
          setUnverified(err instanceof ApiError && err.code === 'EMAIL_NOT_VERIFIED');
          setError(message(err, 'Connexion impossible pour le moment.'));
        }
      }}
      extra={unverified ? <ResendVerification email={email} /> : undefined}
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
      <GoogleButton />
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
  // Élève de 15 ans ou plus (parcours « Je suis un élève ») : même compte, libellés adaptés.
  const student = useSearchParams()[0].get('eleve') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ email: string; link?: string } | null>(null);
  if (sent) return <CheckMailScreen email={sent.email} link={sent.link} />;
  return (
    <AuthForm
      title={student ? 'Ton compte' : 'Compte familial'}
      intro={
        student
          ? 'Crée ton compte avec ton e-mail, puis choisis ton profil de joueur.'
          : 'Un compte pour toute la famille : le parent le crée, puis ajoute le profil de chaque enfant.'
      }
      submit="Créer le compte"
      error={error}
      onSubmit={async () => {
        if (password.length < PASSWORD_MIN) {
          setError(`Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`);
          return;
        }
        try {
          const result = await signup({ email, password });
          setSent({ email: result.email, link: result.verificationLink });
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
      <GoogleButton />
      <Field
        label={student ? 'Ton e-mail' : 'E-mail du parent'}
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />
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

/** Après l'inscription : le compte existe mais n'ouvre qu'avec le lien envoyé par e-mail. */
function CheckMailScreen({ email, link }: { readonly email: string; readonly link?: string }) {
  return (
    <PageShell title="Vérifie ta boîte mail" back="/connexion">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="flex items-center gap-3">
          <Questy mood="happy" size={72} />
          <p className="text-lg" role="status">
            Si l’adresse <strong>{email}</strong> peut être utilisée, un lien de confirmation vient d’être envoyé.
            Ouvre-le (valable 24 heures), puis saisis le mot de passe choisi pour activer le compte. Si un compte existe
            déjà avec cette adresse, tu reçois un message qui l’explique.
          </p>
        </div>
        <p className="text-muted">
          Rien dans la boîte ? Regarde les courriers indésirables, ou demande un nouveau lien.
        </p>
        <ResendVerification email={email} />
        {link && (
          <Link to={internalPath(link)} className="font-bold underline">
            Ouvrir le lien (mode simulation, sans envoi réel)
          </Link>
        )}
        <Link to="/connexion" className="text-center font-bold underline">
          Retour à la connexion
        </Link>
      </div>
    </PageShell>
  );
}

/**
 * Page du lien reçu par e-mail : pour valider l'adresse, on saisit aussi le mot de passe choisi à
 * l'inscription (preuve que c'est bien la personne qui a créé le compte). Qui ne le connaît pas passe
 * par « Mot de passe oublié », qui valide aussi l'adresse.
 */
export function VerifyEmailScreen() {
  const token = useSearchParams()[0].get('jeton') ?? '';
  const navigate = useNavigate();
  const setMe = useSetMe();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  /** Lien inutilisable (périmé, déjà utilisé, absent) : on propose d'en demander un autre. */
  const [dead, setDead] = useState<string | null>(token ? null : 'Ce lien n’est pas valide : demande-en un nouveau.');
  const [email, setEmail] = useState('');
  if (dead) {
    return (
      <PageShell title="Lien non valable" back="/connexion">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <div className="flex items-center gap-3">
            <Questy mood="sad" size={72} />
            <p role="alert" className="text-lg font-bold">
              {dead}
            </p>
          </div>
          <p>Un lien ne marche qu’une fois et pendant 24 heures. Indique ton adresse pour en recevoir un nouveau.</p>
          <Field label="Ton e-mail" type="email" autoComplete="email" value={email} onChange={setEmail} />
          <ResendVerification email={email} />
          <Link to="/connexion" className="text-center font-bold underline">
            J’ai déjà validé : me connecter
          </Link>
        </div>
      </PageShell>
    );
  }
  return (
    <AuthForm
      title="Validation de l’adresse"
      intro="Dernière étape : saisis le mot de passe choisi à l’inscription pour activer le compte."
      submit="Valider mon adresse"
      error={error}
      onSubmit={async () => {
        try {
          setMe(await verifyEmail(token, password));
          void navigate('/profils/nouveau', { replace: true });
        } catch (err) {
          // Mot de passe refusé : le lien reste valable, on réessaie ici. Autre refus : lien à renouveler.
          if (err instanceof ApiError && err.status === 401) setError(err.message);
          else setDead(message(err, 'Validation impossible pour le moment.'));
        }
      }}
      footer={
        <>
          <p className="text-muted text-sm font-normal">
            Tu ne connais pas ce mot de passe (ce n’est pas toi qui as créé le compte) ?
          </p>
          <Link to="/mot-de-passe-oublie" className="underline">
            Mot de passe oublié : valider l’adresse et choisir un mot de passe
          </Link>
        </>
      }
    >
      <Field
        label="Mot de passe du compte"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
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
