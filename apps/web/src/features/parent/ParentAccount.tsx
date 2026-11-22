import { Link } from 'react-router';
import { gradeInfo } from '@questeo/shared';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { ProfileEditor, useProfiles } from '../profiles/index.ts';
import { FamilyFriends } from './FamilyFriends.tsx';
import { JoinStudent } from './JoinStudent.tsx';
import { ParentCard, ParentPage } from './ParentShell.tsx';
import { PinSettings } from './PinSettings.tsx';

const PROFILES = '/parent/profils';

/** Rubrique Profils : les enfants du compte (ajout, modification) et leurs amis d'autres familles. */
export function ParentProfiles() {
  const { data: profiles, isPending } = useProfiles();
  return (
    <ParentPage title="Profils des enfants">
      {isPending && <p>Chargement…</p>}
      <ul className="flex flex-col gap-3">
        {profiles?.map((p) => (
          <li key={p.id} className="bg-surface flex items-center gap-3 rounded-2xl p-3 shadow-sm">
            <CharacterAvatar avatar={p.avatar} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{p.name}</span>
              <span className="text-muted block text-sm">
                {p.grade ? gradeInfo(p.grade).name : 'Classe non renseignée'}
              </span>
            </span>
            <Link
              to={`${PROFILES}/${p.id}/modifier`}
              aria-label={`Modifier le profil de ${p.name}`}
              className="font-bold underline"
            >
              Modifier
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to={`${PROFILES}/nouveau`}
        className="bg-accent self-start rounded-xl px-4 py-2.5 text-center font-bold text-white"
      >
        Ajouter un enfant
      </Link>
      <JoinStudent />
      <FamilyFriends />
    </ParentPage>
  );
}

/** Création ou modification d'un profil, sans quitter l'Espace parent. */
export function ParentProfileEditor() {
  return (
    <ProfileEditor
      parentSpace={{
        doneTo: PROFILES,
        shell: ({ title, children }) => (
          <ParentPage title={title} back={{ to: PROFILES, label: 'Profils' }}>
            {children}
          </ParentPage>
        ),
      }}
    />
  );
}

/** Rubrique Réglages : code PIN de l'Espace parent. */
export function ParentSettings() {
  return (
    <ParentPage title="Réglages">
      <ParentCard title="Code PIN parent" id="pin">
        <PinSettings />
      </ParentCard>
    </ParentPage>
  );
}
