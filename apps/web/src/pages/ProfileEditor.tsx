import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  AVATAR_STYLES,
  BirthDateSchema,
  ProfileNameSchema,
  type AvatarConfig,
  type AvatarStyle,
  HEROES,
  type Gender,
  type HeroId,
  type Profile,
} from '@questeo/shared';
import { useCreateProfile, useProfile, useUpdateProfile } from '../api/profiles.ts';
import { Avatar } from '../components/Avatar.tsx';
import { GameButton } from '../components/game/GameButton.tsx';
import { HeroCard } from '../components/game/CharacterCard.tsx';
import { CharacterAvatar } from '../components/game/CharacterAvatar.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { useSession } from '../store/session.ts';

const STYLE_LABELS: Record<AvatarStyle, string> = {
  'fun-emoji': 'Émoji',
  'adventurer-neutral': 'Visage',
  pixelbot: 'Robot',
};

const randomSeed = () => crypto.randomUUID().slice(0, 8);
const seedBatch = () => Array.from({ length: 16 }, randomSeed);

/** Création (`/profils/nouveau`) ou modification (`/profils/:id/modifier`) d'un profil. */
export function ProfileEditor() {
  const { id } = useParams();
  const { data: existing, isPending } = useProfile(id ?? null);
  if (id && isPending) return <PageShell back="/parametres">Chargement…</PageShell>;
  return <EditorForm key={existing?.id ?? 'new'} existing={existing} />;
}

function EditorForm({ existing }: { readonly existing: Profile | undefined }) {
  const navigate = useNavigate();
  const selectProfile = useSession((s) => s.selectProfile);
  const create = useCreateProfile();
  const update = useUpdateProfile(existing?.id ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [gender, setGender] = useState<Gender | null>(existing?.gender ?? null);
  const [birthDate, setBirthDate] = useState(existing?.birthDate ?? '');
  const [hero, setHero] = useState<HeroId>(existing?.hero ?? 'alex');
  const [avatar, setAvatar] = useState<AvatarConfig>(
    existing?.avatar ?? { style: 'adventurer-neutral', seed: randomSeed() },
  );
  const shown: AvatarConfig = { style: avatar.style, seed: avatar.seed };
  const [seeds, setSeeds] = useState(seedBatch);
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
    const payload = { name: parsed.data, avatar: shown, gender, birthDate: birth.data, hero };
    try {
      if (existing) {
        await update.mutateAsync(payload);
        void navigate('/parametres');
      } else {
        const profile = await create.mutateAsync(payload);
        selectProfile(profile.id);
        void navigate('/hub');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <PageShell title={existing ? 'Modifier mon profil' : 'Nouveau joueur'} back={existing ? '/parametres' : '/'}>
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

        <fieldset className="flex flex-col gap-3">
          <legend className="font-display mb-2 text-xl tracking-wide">Style</legend>
          <div className="flex flex-wrap gap-3">
            {AVATAR_STYLES.map((style) => (
              <GameButton
                key={style}
                size="sm"
                variant={avatar.style === style ? 'accent' : 'surface'}
                selected={avatar.style === style}
                onClick={() => setAvatar((a) => ({ ...a, style }))}
              >
                {STYLE_LABELS[style]}
              </GameButton>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-display mb-2 text-xl tracking-wide">Choisis ta tête</legend>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
            {seeds.map((seed) => (
              <button
                key={seed}
                type="button"
                aria-pressed={avatar.seed === seed}
                aria-label={`Avatar ${seed}`}
                onClick={() => setAvatar((a) => ({ ...a, seed }))}
                className={`flex justify-center rounded-full p-1 ${avatar.seed === seed ? 'ring-primary ring-4' : ''}`}
              >
                <Avatar avatar={{ ...shown, seed }} size={72} />
              </button>
            ))}
          </div>
          <GameButton
            variant="surface"
            icon="icons-tools-dice"
            className="self-start"
            onClick={() => setSeeds(seedBatch())}
          >
            D’autres têtes
          </GameButton>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="font-display mb-2 text-xl tracking-wide">Ton héros (tu pourras en changer)</legend>
          <div role="radiogroup" aria-label="Ton héros" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {HEROES.map((h, i) => (
              <HeroCard
                key={h}
                hero={h}
                radio
                selected={hero === h}
                index={i}
                onClick={() => setHero(h)}
                className="min-h-40"
              />
            ))}
          </div>
        </fieldset>

        <GameButton type="submit" size="lg" disabled={saving} className="self-stretch sm:self-end">
          {existing ? 'Enregistrer' : 'C’est parti !'}
        </GameButton>
      </form>
    </PageShell>
  );
}
