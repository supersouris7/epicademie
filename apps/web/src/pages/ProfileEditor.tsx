import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AVATAR_STYLES, ProfileNameSchema, type AvatarConfig, type AvatarStyle, type Profile } from '@questeo/shared';
import { useCreateProfile, useProfile, useUpdateProfile } from '../api/profiles.ts';
import { Avatar } from '../components/Avatar.tsx';
import { Button } from '../components/Button.tsx';
import { DiceIcon } from '../components/icons.tsx';
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
  const [avatar, setAvatar] = useState<AvatarConfig>(existing?.avatar ?? { style: 'fun-emoji', seed: randomSeed() });
  const [seeds, setSeeds] = useState(seedBatch);
  const [error, setError] = useState<string | null>(null);
  const saving = create.isPending || update.isPending;

  const submit = async () => {
    const parsed = ProfileNameSchema.safeParse(name);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Prénom invalide');
      return;
    }
    try {
      if (existing) {
        await update.mutateAsync({ name: parsed.data, avatar });
        void navigate('/parametres');
      } else {
        const profile = await create.mutateAsync({ name: parsed.data, avatar });
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
          <Avatar avatar={avatar} size={160} label="Aperçu de l’avatar" />
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

        <fieldset className="flex flex-col gap-3">
          <legend className="font-display mb-2 text-xl tracking-wide">Style</legend>
          <div className="flex flex-wrap gap-3">
            {AVATAR_STYLES.map((style) => (
              <button
                key={style}
                type="button"
                aria-pressed={avatar.style === style}
                onClick={() => setAvatar((a) => ({ ...a, style }))}
                className={`cartoon cartoon-press font-display min-h-12 px-4 text-lg ${avatar.style === style ? 'bg-accent text-white' : 'bg-surface'}`}
              >
                {STYLE_LABELS[style]}
              </button>
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
                <Avatar avatar={{ ...avatar, seed }} size={72} />
              </button>
            ))}
          </div>
          <Button variant="surface" className="self-start" onClick={() => setSeeds(seedBatch())}>
            <DiceIcon size={28} /> D’autres têtes
          </Button>
        </fieldset>

        <Button type="submit" size="lg" disabled={saving} className="self-stretch sm:self-end">
          {existing ? 'Enregistrer' : 'C’est parti !'}
        </Button>
      </form>
    </PageShell>
  );
}
