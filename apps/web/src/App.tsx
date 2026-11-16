import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { Profile } from '@questeo/shared';
import { ApiError } from './api/client.ts';
import { useProfile } from './api/profiles.ts';
import { useApplyTheme } from './lib/theme.ts';
import { About } from './pages/About.tsx';
import { Hub } from './pages/Hub.tsx';
import { ModeSetup } from './pages/ModeSetup.tsx';
import { MultiModes } from './pages/MultiModes.tsx';
import { ProfileEditor } from './pages/ProfileEditor.tsx';
import { ProfilePicker } from './pages/ProfilePicker.tsx';
import { Settings } from './pages/Settings.tsx';
import { Chapters } from './pages/training/Chapters.tsx';
import { Notions } from './pages/training/Notions.tsx';
import { TrainingPlay } from './pages/training/TrainingPlay.tsx';
import { useSession } from './store/session.ts';

/** Rend `children(profile)` si un profil est sélectionné et existe, sinon renvoie vers l'accueil. */
function WithProfile({ children }: { readonly children: (profile: Profile) => ReactNode }) {
  const profileId = useSession((s) => s.profileId);
  const { data, error, isPending } = useProfile(profileId);
  if (!profileId || (error instanceof ApiError && error.status === 404)) return <Navigate to="/" replace />;
  if (isPending) return <p className="p-8 text-xl">Chargement…</p>;
  if (!data) return <Navigate to="/" replace />;
  return children(data);
}

export function App() {
  const profileId = useSession((s) => s.profileId);
  const { data: profile } = useProfile(profileId);
  useApplyTheme(profile?.theme ?? 'auto');

  return (
    <Routes>
      <Route path="/" element={<ProfilePicker />} />
      <Route path="/profils/nouveau" element={<ProfileEditor />} />
      <Route path="/profils/:id/modifier" element={<ProfileEditor />} />
      <Route path="/hub" element={<WithProfile>{(p) => <Hub profile={p} />}</WithProfile>} />
      <Route path="/multi" element={<WithProfile>{() => <MultiModes />}</WithProfile>} />
      <Route path="/jouer/:modeId" element={<WithProfile>{() => <ModeSetup />}</WithProfile>} />
      <Route
        path="/jouer/entrainement/:subject"
        element={<WithProfile>{(p) => <Chapters profile={p} />}</WithProfile>}
      />
      <Route
        path="/jouer/entrainement/:subject/:chapterId"
        element={<WithProfile>{(p) => <Notions profile={p} />}</WithProfile>}
      />
      <Route
        path="/partie/entrainement/:chapterId/:skillId"
        element={<WithProfile>{(p) => <TrainingPlay profile={p} />}</WithProfile>}
      />
      <Route path="/parametres" element={<WithProfile>{(p) => <Settings profile={p} />}</WithProfile>} />
      <Route path="/a-propos" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
