import { useState, type ReactNode } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  AVATAR_IDS,
  BirthDateSchema,
  ProfileNameSchema,
  type AvatarConfig,
  type Gender,
  type Grade,
  type Profile,
} from '@epicademie/shared';
import { useCreateProfile, useProfile, useUpdateProfile } from './api.ts';
import { HandOff } from './HandOff.tsx';
import { Avatar } from '../../shared/ui/Avatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { GradePicker } from '../../shared/ui/GradePicker.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useSession } from '../../shared/lib/session.ts';
import { useParentGate } from '../account/index.ts';

/** Portrait proposé à un nouveau joueur (il en choisit un autre d'un toucher). */
const randomPortrait = () => AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)] ?? '01';

/** Libellés selon qui remplit : l'élève lui-même (tutoiement) ou le parent pour son enfant (vouvoiement). */
const CHILD_VOICE = {
  title: 'Nouveau joueur',
  name: 'Ton prénom',
  gender: 'Tu es…',
  grade: 'Ta classe',
  avatar: 'Choisis ton avatar',
  start: 'C’est parti !',
  genderError: 'Choisis fille ou garçon.',
  birthError: 'Indique ta date de naissance.',
  gradeError: 'Choisis ta classe.',
};
const PARENT_VOICE: typeof CHILD_VOICE = {
  title: 'Profil de votre enfant',
  name: 'Prénom de votre enfant (ou un pseudo)',
  gender: 'Votre enfant est…',
  grade: 'Sa classe',
  avatar: 'Son personnage (il pourra en changer)',
  start: 'Créer son profil et jouer',
  genderError: 'Choisissez fille ou garçon.',
  birthError: 'Indiquez sa date de naissance.',
  gradeError: 'Choisissez sa classe.',
};

/** Profil créé par le parent (après l'inscription, ou depuis l'Espace parent) : on s'adresse au parent. */
function useVoice(parentSpace: ParentSpace | undefined, creating: boolean) {
  const [params] = useSearchParams();
  const forChild = !!parentSpace || params.get('pour') === 'enfant';
  const welcome = creating && params.get('bienvenue') === '1';
  return { t: forChild ? PARENT_VOICE : CHILD_VOICE, welcome, passDevice: welcome && forChild };
}

/** Création (`/profils/nouveau`) ou modification (`/profils/:id/modifier`) d'un profil. */
export function ProfileEditor({ parentSpace }: { readonly parentSpace?: ParentSpace } = {}) {
  const { id } = useParams();
  const { data: existing, isPending } = useProfile(id ?? null);
  if (id && isPending) return <PageShell back="/parametres">Chargement…</PageShell>;
  return <EditorForm key={existing?.id ?? 'new'} existing={existing} parentSpace={parentSpace} />;
}

/**
 * Éditeur ouvert depuis l'Espace parent : il y reste (cadre et retour fournis par l'espace),
 * revient à `doneTo` une fois fini et ne lance pas le jeu avec le profil créé.
 */
export interface ParentSpace {
  readonly shell: (props: { readonly title: string; readonly children: ReactNode }) => ReactNode;
  readonly doneTo: string;
}

function EditorForm({
  existing,
  parentSpace,
}: {
  readonly existing: Profile | undefined;
  readonly parentSpace: ParentSpace | undefined;
}) {
  const navigate = useNavigate();
  const { t, welcome, passDevice } = useVoice(parentSpace, !existing);
  const withParent = useParentGate();
  const create = useCreateProfile();
  const update = useUpdateProfile(existing?.id ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [gender, setGender] = useState<Gender | null>(existing?.gender ?? null);
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? '');
  const [grade, setGrade] = useState<Grade | null>(existing?.grade ?? null);
  const [avatar, setAvatar] = useState<AvatarConfig>(
    () => existing?.avatar ?? { style: 'portrait', seed: randomPortrait() },
  );
  const shown: AvatarConfig = { style: 'portrait', seed: avatar.seed };
  const [error, setError] = useState<string | null>(null);
  const saving = create.isPending || update.isPending;
  const { handOff, onCreated } = useAfterCreate(parentSpace, passDevice);

  const submit = async () => {
    const checked = validate({ name, gender, birthDate, grade }, t);
    if ('error' in checked) {
      setError(checked.error);
      return;
    }
    const payload = { ...checked.value, avatar: shown };
    try {
      // Identité d'un enfant : action réservée au parent (mot de passe demandé si besoin).
      await withParent(async () => {
        if (existing) {
          await update.mutateAsync(payload);
          void navigate(parentSpace?.doneTo ?? '/parametres');
        } else {
          onCreated(await create.mutateAsync(payload));
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const body = (
    <>
      {welcome && <WelcomeBanner />}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
          <CharacterAvatar avatar={shown} size={160} label="Aperçu de l’avatar" />
          <label className="flex w-full flex-1 flex-col gap-2">
            <span className="font-display text-xl tracking-wide">{t.name}</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              maxLength={20}
              autoComplete="off"
              className="cartoon bg-surface font-display min-h-16 px-4 text-3xl tracking-wide outline-none focus:ring-4 focus:ring-[var(--primary)]"
              placeholder="Ex. Léa"
            />
          </label>
        </div>
        {error && (
          <p role="alert" className="text-danger text-lg font-bold">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="font-display mb-2 text-xl tracking-wide">{t.gender}</legend>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ['fille', 'Une fille'],
                  ['garcon', 'Un garçon'],
                ] as const
              ).map(([g, label]) => (
                <GameButton
                  key={g}
                  variant={gender === g ? 'accent' : 'surface'}
                  selected={gender === g}
                  onClick={() => {
                    setGender(g);
                    setError(null);
                  }}
                >
                  {label}
                </GameButton>
              ))}
            </div>
          </fieldset>
          <label className="flex flex-col gap-2">
            <span className="font-display text-xl tracking-wide">Date de naissance</span>
            <input
              type="date"
              value={birthDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setError(null);
              }}
              className="cartoon bg-surface font-display min-h-14 px-4 text-xl outline-none focus:ring-4 focus:ring-[var(--primary)]"
              aria-label="Date de naissance"
            />
          </label>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="font-display mb-2 text-xl tracking-wide">{t.grade}</legend>
          <GradePicker
            parent={t === PARENT_VOICE}
            birthDate={birthDate}
            grade={grade}
            onChange={(g) => {
              setGrade(g);
              setError(null);
            }}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-display mb-2 text-xl tracking-wide">{t.avatar}</legend>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {AVATAR_IDS.map((seed) => (
              <button
                key={seed}
                type="button"
                aria-pressed={avatar.seed === seed}
                aria-label={`Avatar ${seed}`}
                onClick={() => setAvatar({ style: 'portrait', seed })}
                className={`flex justify-center rounded-full p-1 transition-transform ${avatar.seed === seed ? 'ring-primary scale-105 ring-4' : 'hover:scale-105'}`}
              >
                <Avatar avatar={{ style: 'portrait', seed }} size={72} className="max-w-full" />
              </button>
            ))}
          </div>
        </fieldset>

        <GameButton type="submit" size="lg" disabled={saving} className="self-stretch sm:self-end">
          {existing ? 'Enregistrer' : parentSpace ? 'Ajouter cet enfant' : t.start}
        </GameButton>
      </form>
    </>
  );
  if (handOff) return handOff;
  return (
    <EditorFrame parentSpace={parentSpace} editing={!!existing} title={t.title}>
      {body}
    </EditorFrame>
  );
}

/** Cadre de l'éditeur : celui de l'Espace parent s'il en vient, sinon une page du jeu. */
function EditorFrame({
  parentSpace,
  editing,
  title,
  children,
}: {
  readonly parentSpace: ParentSpace | undefined;
  readonly editing: boolean;
  readonly title: string;
  readonly children: ReactNode;
}) {
  if (parentSpace) {
    return <>{parentSpace.shell({ title: editing ? 'Modifier le profil' : 'Ajouter un enfant', children })}</>;
  }
  return (
    <PageShell title={editing ? 'Modifier mon profil' : title} back={editing ? '/parametres' : '/'}>
      {children}
    </PageShell>
  );
}

/**
 * Suite d'une création : retour à l'Espace parent, sinon le jeu avec ce profil. À l'inscription
 * (`passDevice`), le parent a rempli le formulaire : un écran le fait passer à l'enfant, qui lance le jeu.
 */
function useAfterCreate(parentSpace: ParentSpace | undefined, passDevice: boolean) {
  const navigate = useNavigate();
  const selectProfile = useSession((s) => s.selectProfile);
  const [waiting, setWaiting] = useState<Profile | null>(null);
  const play = (profile: Profile) => {
    selectProfile(profile.id);
    void navigate('/hub');
  };
  return {
    handOff: waiting && <HandOff name={waiting.name} onStart={() => play(waiting)} />,
    onCreated: (profile: Profile) => {
      if (parentSpace) void navigate(parentSpace.doneTo);
      else if (passDevice) setWaiting(profile);
      else play(profile);
    },
  };
}

/** Accueil juste après l'inscription : le parent sait qu'il crée le profil de son enfant, pas le sien. */
function WelcomeBanner() {
  return (
    <section aria-label="Compte créé" className="cartoon bg-surface mb-4 flex flex-col gap-1 p-4">
      <p className="font-display text-xl tracking-wide">✅ Votre compte parent est créé !</p>
      <p className="text-lg">
        Dernière étape : le <strong>profil de votre enfant</strong>, c’est lui qui va jouer. Vous pourrez ajouter ses
        frères et sœurs ensuite, depuis l’Espace parent.
      </p>
    </section>
  );
}

/** Contrôle du formulaire : message d'erreur (dans la voix choisie) ou données prêtes à envoyer. */
function validate(
  f: { name: string; gender: Gender | null; birthDate: string; grade: Grade | null },
  t: typeof CHILD_VOICE,
): { error: string } | { value: { name: string; gender: Gender; birthDate: string; grade: Grade } } {
  const parsed = ProfileNameSchema.safeParse(f.name);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Prénom invalide' };
  if (!f.gender) return { error: t.genderError };
  const birth = BirthDateSchema.safeParse(f.birthDate);
  if (!birth.success) return { error: t.birthError };
  if (!f.grade) return { error: t.gradeError };
  return { value: { name: parsed.data, gender: f.gender, birthDate: birth.data, grade: f.grade } };
}
