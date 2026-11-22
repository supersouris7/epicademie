import { useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  AVATAR_IDS,
  GRADE_INFO,
  ProfileNameSchema,
  STUDENT_AUTONOMOUS_MAX_AGE,
  type Grade,
  type InviteResult,
} from '@questeo/shared';
import { ApiError } from '../../shared/api/client.ts';
import { Avatar } from '../../shared/ui/Avatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { createInvite, recoverStudent, renewStudentRecovery, signupStudent, useSetMe } from './api.ts';

/**
 * Parcours de l'élève : accueil (parent ou élève), âge, puis compte complet (15 ans et plus) ou
 * compte sans donnée personnelle (moins de 15 ans : pseudo, avatar, classe). Voir
 * docs/adr/0026-eleve-autonome.md.
 */

const message = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

/** Premier écran : qui es-tu ? */
export function WelcomeScreen() {
  const navigate = useNavigate();
  // La page demandée avant la redirection est gardée pour le retour après connexion.
  const from: unknown = useLocation().state;
  return (
    <PageShell title="Bienvenue !">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <div className="flex items-center gap-3">
          <Questy mood="happy" size={96} />
          <p className="text-lg">Salut, je suis Questy ! Dis-moi qui tu es pour commencer.</p>
        </div>
        <GameButton size="lg" onClick={() => void navigate('/eleve')}>
          Je suis un élève
        </GameButton>
        <GameButton size="lg" variant="surface" onClick={() => void navigate('/connexion', { state: from })}>
          Je suis un parent
        </GameButton>
      </div>
    </PageShell>
  );
}

/** Âge de l'élève : décide du type de compte (moins de 15 ans : sans e-mail). */
export function StudentAgeScreen() {
  const navigate = useNavigate();
  const id = useId();
  const [age, setAge] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <PageShell title="Ton âge" back="/bienvenue">
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(age);
          if (!Number.isInteger(n) || n < 3 || n > 100) {
            setError('Indique ton âge en chiffres, par exemple 12.');
            return;
          }
          void navigate(n > STUDENT_AUTONOMOUS_MAX_AGE ? '/inscription?eleve=1' : '/eleve/inscription');
        }}
      >
        <div className="flex items-center gap-3">
          <Questy mood="happy" size={72} />
          <p className="text-lg">Quel âge as-tu ? Ça me sert à préparer ton compte, je ne le garde pas.</p>
        </div>
        <label htmlFor={id} className="font-bold">
          Mon âge (en années)
        </label>
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          className="cartoon bg-surface px-3 py-3 text-lg"
          value={age}
          onChange={(e) => {
            setAge(e.target.value);
            setError(null);
          }}
        />
        {error && (
          <p role="alert" className="text-danger font-bold">
            {error}
          </p>
        )}
        <GameButton type="submit" size="lg">
          Continuer
        </GameButton>
        <Link to="/eleve/code" className="text-center font-bold underline">
          J’ai déjà un compte : j’ai mon code de récupération
        </Link>
      </form>
    </PageShell>
  );
}

/** Un code à noter ou à donner : affiché en grand, lisible lettre par lettre. */
function CodeBox({ code, label }: { readonly code: string; readonly label: string }) {
  return (
    <div className="cartoon bg-surface flex flex-col gap-2 p-4 text-center">
      <p className="font-bold">{label}</p>
      <p aria-label={`Code : ${code.split('').join(' ')}`} className="font-display text-3xl tracking-widest">
        {code}
      </p>
    </div>
  );
}

/** Compte d'un élève de moins de 15 ans : pseudo, classe, avatar. Aucune donnée personnelle. */
export function StudentSignupScreen() {
  const navigate = useNavigate();
  const setMe = useSetMe();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [seed, setSeed] = useState<string>(AVATAR_IDS[0] ?? '01');
  const [error, setError] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (recoveryCode) {
    return (
      <PageShell title="Note bien ton code">
        <div className="mx-auto flex w-full max-w-md flex-col gap-4">
          <div className="flex items-center gap-3">
            <Questy mood="wink" size={72} />
            <p className="text-lg">
              Ton compte est prêt ! Ce code te permet de retrouver ton compte sur un autre appareil.{' '}
              <strong>Note-le sur papier : je ne le montrerai plus.</strong>
            </p>
          </div>
          <CodeBox code={recoveryCode} label="Ton code de récupération" />
          <GameButton size="lg" onClick={() => void navigate('/', { replace: true })}>
            J’ai noté mon code
          </GameButton>
        </div>
      </PageShell>
    );
  }

  const submit = async () => {
    const parsed = ProfileNameSchema.safeParse(name);
    if (!parsed.success) {
      setError(name.trim() === '' ? 'Choisis un pseudo.' : (parsed.error.issues[0]?.message ?? 'Pseudo invalide'));
      return;
    }
    if (!grade) {
      setError('Choisis ta classe.');
      return;
    }
    setBusy(true);
    try {
      // Le parcours n'arrive ici que pour moins de 15 ans ; le serveur le revérifie et ne garde pas l'âge.
      const result = await signupStudent({
        name: parsed.data,
        avatar: { style: 'portrait', seed },
        grade,
        age: STUDENT_AUTONOMOUS_MAX_AGE,
      });
      setMe(result.me);
      setRecoveryCode(result.recoveryCode);
    } catch (err) {
      setError(message(err, 'Création impossible pour le moment.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Ton compte" back="/eleve">
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="flex items-center gap-3">
          <Questy mood="happy" size={72} />
          <p className="text-lg">
            Choisis un pseudo : ne mets <strong>ni ton vrai nom, ni ton e-mail</strong>.
          </p>
        </div>
        <label className="flex flex-col gap-1">
          <span className="font-bold">Ton pseudo</span>
          <input
            value={name}
            maxLength={20}
            autoComplete="off"
            className="cartoon bg-surface px-3 py-3 text-lg"
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
          />
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">Ta classe</legend>
          <div role="radiogroup" aria-label="Ta classe" className="grid grid-cols-3 gap-2">
            {GRADE_INFO.filter((g) => g.id !== 'adulte').map((g) => (
              <GameButton
                key={g.id}
                role="radio"
                aria-checked={grade === g.id}
                variant={grade === g.id ? 'accent' : 'surface'}
                selected={grade === g.id}
                onClick={() => {
                  setGrade(g.id);
                  setError(null);
                }}
              >
                {g.name}
              </GameButton>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 font-bold">Choisis ton avatar</legend>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={seed === id}
                aria-label={`Avatar ${id}`}
                onClick={() => setSeed(id)}
                className={`flex justify-center rounded-full p-1 ${seed === id ? 'ring-primary scale-105 ring-4' : ''}`}
              >
                <Avatar avatar={{ style: 'portrait', seed: id }} size={64} className="max-w-full" />
              </button>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-danger font-bold">
            {error}
          </p>
        )}
        <GameButton type="submit" size="lg" disabled={busy}>
          C’est parti !
        </GameButton>
      </form>
    </PageShell>
  );
}

/** Reconnexion sur un autre appareil avec le code de récupération. */
export function StudentRecoverScreen() {
  const navigate = useNavigate();
  const setMe = useSetMe();
  const id = useId();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <PageShell title="Retrouver mon compte" back="/eleve">
      <form
        className="mx-auto flex w-full max-w-md flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void recoverStudent(code)
            .then((me) => {
              setMe(me);
              void navigate('/', { replace: true });
            })
            .catch((err: unknown) => setError(message(err, 'Connexion impossible pour le moment.')));
        }}
      >
        <div className="flex items-center gap-3">
          <Questy mood="happy" size={72} />
          <p className="text-lg">Recopie le code que tu as noté quand tu as créé ton compte.</p>
        </div>
        <label htmlFor={id} className="font-bold">
          Mon code de récupération
        </label>
        <input
          id={id}
          autoComplete="off"
          autoCapitalize="characters"
          className="cartoon bg-surface px-3 py-3 text-lg uppercase"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setError(null);
          }}
        />
        {error && (
          <p role="alert" className="text-danger font-bold">
            {error}
          </p>
        )}
        <GameButton type="submit" size="lg">
          Retrouver mon compte
        </GameButton>
      </form>
    </PageShell>
  );
}

/**
 * Espace de l'élève sans parent rattaché (à la place de l'Espace parent) : explique pourquoi
 * le paiement et le suivi sont fermés, donne un code d'invitation et un nouveau code de récupération.
 */
export function StudentSpace() {
  const [invite, setInvite] = useState<InviteResult | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fail = (err: unknown) => setError(message(err, 'Impossible pour le moment.'));
  return (
    <section aria-labelledby="eleve-espace" className="cartoon bg-surface flex flex-col gap-3 p-4">
      <h2 id="eleve-espace" className="font-display text-xl">
        Demande à un parent
      </h2>
      <p>
        L’abonnement et l’Espace parent sont réservés à un parent. Demande-lui de rattacher ton compte au sien : tu
        garderas toute ta progression.
      </p>
      <GameButton variant="accent" onClick={() => void createInvite().then(setInvite).catch(fail)}>
        Afficher mon code pour un parent
      </GameButton>
      {invite && (
        <div role="status">
          <CodeBox code={invite.code} label="Donne ce code à un parent (valable 24 heures, une seule fois)" />
        </div>
      )}
      <GameButton
        variant="surface"
        onClick={() =>
          void renewStudentRecovery()
            .then((r) => setRecovery(r.recoveryCode))
            .catch(fail)
        }
      >
        Changer mon code de récupération
      </GameButton>
      {recovery && (
        <div role="status">
          <CodeBox code={recovery} label="Nouveau code : note-le, l’ancien ne marche plus" />
        </div>
      )}
      {error && (
        <p role="alert" className="text-danger font-bold">
          {error}
        </p>
      )}
    </section>
  );
}
