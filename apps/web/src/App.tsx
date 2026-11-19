import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import type { Profile } from '@questeo/shared';
import { ApiError } from './api/client.ts';
import { useProfile } from './api/profiles.ts';
import { About } from './pages/About.tsx';
import { Heroes } from './pages/Heroes.tsx';
import { Hub } from './pages/Hub.tsx';
import { ModeSetup } from './pages/ModeSetup.tsx';
import { MultiModes } from './pages/MultiModes.tsx';
import { Arena } from './pages/Arena.tsx';
import { Online } from './pages/Online.tsx';
import { ProfileEditor } from './pages/ProfileEditor.tsx';
import { ProfilePicker } from './pages/ProfilePicker.tsx';
import { Progress } from './pages/Progress.tsx';
import { Settings } from './pages/Settings.tsx';
import { BossChapters } from './pages/boss/BossChapters.tsx';
import { BossPlay } from './pages/boss/BossPlay.tsx';
import { Chapters } from './pages/training/Chapters.tsx';
import { Notions } from './pages/training/Notions.tsx';
import { TrainingPlay } from './pages/training/TrainingPlay.tsx';
import { useSession } from './store/session.ts';
import { Notifications, RealtimeLink } from './components/Notifications.tsx';

/** Atelier graphique : chargé à la demande, seulement en développement (absent du build de production). */
const AssetPreview = import.meta.env.DEV
  ? lazy(() => import('./pages/dev/AssetPreview.tsx').then((m) => ({ default: m.AssetPreview })))
  : null;

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
  return (
    <>
      <RealtimeLink profileId={profileId} />
      <Notifications />
      <Routes>
        <Route path="/" element={<ProfilePicker />} />
        <Route path="/profils/nouveau" element={<ProfileEditor />} />
        <Route path="/profils/:id/modifier" element={<ProfileEditor />} />
        <Route path="/hub" element={<WithProfile>{(p) => <Hub profile={p} />}</WithProfile>} />
        <Route path="/heros" element={<WithProfile>{(p) => <Heroes profile={p} />}</WithProfile>} />
        <Route path="/multi" element={<WithProfile>{(p) => <MultiModes profile={p} />}</WithProfile>} />
        <Route path="/arene" element={<WithProfile>{(p) => <Arena profile={p} />}</WithProfile>} />
        <Route path="/connectes" element={<WithProfile>{(p) => <Online profile={p} />}</WithProfile>} />
        <Route path="/jouer/:modeId" element={<WithProfile>{(p) => <ModeSetup profile={p} />}</WithProfile>} />
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
        <Route path="/jouer/boss/:subject" element={<WithProfile>{(p) => <BossChapters profile={p} />}</WithProfile>} />
        <Route path="/partie/boss/:chapterId" element={<WithProfile>{(p) => <BossPlay profile={p} />}</WithProfile>} />
        <Route path="/progres" element={<WithProfile>{(p) => <Progress profile={p} />}</WithProfile>} />
        <Route path="/parametres" element={<WithProfile>{(p) => <Settings profile={p} />}</WithProfile>} />
        <Route path="/a-propos" element={<About />} />
        {AssetPreview && (
          <Route
            path="/dev/assets"
            element={
              <Suspense fallback={<p className="p-8 text-xl">Chargement…</p>}>
                <AssetPreview />
              </Suspense>
            }
          />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
