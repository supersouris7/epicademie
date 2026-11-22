import { useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AVATAR_IDS,
  BirthDateSchema,
  ProfileNameSchema,
  type AvatarConfig,
  type Gender,
  type Grade,
  type Profile,
} from '@questeo/shared';
import { useCreateProfile, useProfile, useUpdateProfile } from './api.ts';
import { Avatar } from '../../shared/ui/Avatar.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { GradePicker } from '../../shared/ui/GradePicker.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useSession } from '../../shared/lib/session.ts';
import { useParentGate } from '../account/index.ts';

/** Portrait proposé à un nouveau joueur (il en choisit un autre d'un toucher). */
const randomPortrait = () => AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)] ?? '01';

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
  const selectProfile = useSession((s) => s.selectProfile);
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

  const submit = async () => {
    const parsed = ProfileNameSchema.safeParse(name);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Prénom invalide');
      return;
    }
    if (!gender) {
      setError('Choisis fille ou garçon.');
      return;
    }
    const birth = BirthDateSchema.safeParse(birthDate);
    if (!birth.success) {
      setError('Indique ta date de naissance.');
      return;
    }
    if (!grade) {
      setError('Choisis ta classe.');
      return;
    }
    const payload = { name: parsed.data, avatar: shown, gender, birthDate: birth.data, grade };
    try {
      // Identité d'un enfant : action réservée au parent (mot de passe demandé si besoin).
      await withParent(async () => {
        if (existing) {
          await update.mutateAsync(payload);
          void navigate(parentSpace?.doneTo ?? '/parametres');
        } else {
          const profile = await create.mutateAsync(payload);
          if (parentSpace) {
            void navigate(parentSpace.doneTo);
          } else {
            selectProfile(profile.id);
            void navigate('/hub');
          }
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const body = (
    <>
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
            <span className="font-display text-xl tracking-wide">Ton prénom</span>
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
            <legend className="font-display mb-2 text-xl tracking-wide">Tu es…</legend>
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
          <legend className="font-display mb-2 text-xl tracking-wide">Ta classe</legend>
          <GradePicker
            birthDate={birthDate}
            grade={grade}
            onChange={(g) => {
              setGrade(g);
              setError(null);
            }}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-display mb-2 text-xl tracking-wide">Choisis ton avatar</legend>
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
          {existing ? 'Enregistrer' : parentSpace ? 'Ajouter cet enfant' : 'C’est parti !'}
        </GameButton>
      </form>
    </>
  );
  if (parentSpace) {
    return <>{parentSpace.shell({ title: existing ? 'Modifier le profil' : 'Ajouter un enfant', children: body })}</>;
  }
  return (
    <PageShell title={existing ? 'Modifier mon profil' : 'Nouveau joueur'} back={existing ? '/parametres' : '/'}>
      {body}
    </PageShell>
  );
}
