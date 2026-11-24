import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';
import type { Profile } from '@questeo/shared';
import { ApiError } from '../shared/api/client.ts';
import { useSession } from '../shared/lib/session.ts';
import { GameButton } from '../shared/ui/game/GameButton.tsx';
import { Questy } from '../shared/ui/mascot/Questy.tsx';
import {
  ForgotPasswordScreen,
  HiddenInRecette,
  LoginScreen,
  ParentGateProvider,
  RequireAccount,
  ResetPasswordScreen,
  SignupScreen,
  VerifyEmailScreen,
  StudentAgeScreen,
  StudentRecoverScreen,
  StudentSignupScreen,
  WelcomeScreen,
} from '../features/account/index.ts';
import { AdminPage } from '../features/admin/index.ts';
import { Arena } from '../features/arena/index.ts';
import {
  ChildReport,
  ParentHome,
  ParentProfileEditor,
  ParentProfiles,
  DeleteFamily,
  ParentSettings,
  PaymentSimulator,
  Subscription,
} from '../features/parent/index.ts';
import { BossChapters, BossPlay, Shop } from '../features/boss/index.ts';
import { Hub, ModeSetup, MultiModes } from '../features/hub/index.ts';
import { Heroes, ProfileEditor, ProfilePicker, useProfile } from '../features/profiles/index.ts';
import { Progress, SubjectProgress, TrophiesPage } from '../features/progress/index.ts';
import { Dictionary } from '../features/dictionary/index.ts';
import { Term } from '../shared/question/Term.tsx';
import { NoDefinitions } from '../shared/question/TermLocked.tsx';
import { TermContext } from '../shared/question/termContext.ts';
import { TvScreen } from '../features/tv/index.ts';
import { DefiPlay } from '../features/defis/index.ts';
import { Notifications, Friends, Online, Ranking, RealtimeLink } from '../features/realtime/index.ts';
import { About, Settings } from '../features/settings/index.ts';
import { Chapters, Notions, TrainingPlay } from '../features/training/index.ts';
import { DebugFlag } from '../shared/question/DebugFlag.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';

/**
 * Application : routes et garde de profil. Chaque écran vient d'une fonctionnalité
 * (`features/<domaine>`, importée par son index) ; une barrière d'erreur entoure le tout.
 */

/** Atelier graphique : chargé à la demande, seulement en développement (absent du build de production). */
const AssetPreview = import.meta.env.DEV
  ? lazy(() => import('../dev/AssetPreview.tsx').then((m) => ({ default: m.AssetPreview })))
  : null;

/** Rend `children(profile)` si un profil est sélectionné et existe, sinon renvoie vers l'accueil. */
function WithProfile({ children }: { readonly children: (profile: Profile) => ReactNode }) {
  const profileId = useSession((s) => s.profileId);
  const { data, error, isPending, refetch } = useProfile(profileId);
  // Profil supprimé ou identifiant périmé : retour au choix du profil.
  const gone = error instanceof ApiError && (error.status === 404 || error.status === 400);
  if (!profileId || gone) return <Navigate to="/" replace />;
  if (isPending) return <p className="p-8 text-xl">Chargement…</p>;
  if (!data) {
    // Serveur injoignable : on propose de réessayer plutôt que de perdre l'écran en cours.
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
        <Questy mood="sad" size={120} />
        <p className="text-xl font-bold">{error.message}</p>
        <GameButton onClick={() => void refetch()}>Réessayer</GameButton>
      </div>
    );
  }
  return children(data);
}

/** Pages connectées : temps réel et notifications seulement quand l'appareil a une session. */
function ConnectedShell({ profileId }: { readonly profileId: string | null }) {
  return (
    <RequireAccount>
      <RealtimeLink profileId={profileId} />
      <Notifications />
    </RequireAccount>
  );
}

function LegacyAbonnement() {
  const { pathname, search } = useLocation();
  return <Navigate to={`/parent${pathname}${search}`} replace />;
}

export function App() {
  const profileId = useSession((s) => s.profileId);
  return (
    <ErrorBoundary>
      <TermContext.Provider value={Term}>
        <ParentGateProvider>
          <Routes>
            {/* Pages publiques : compte familial et informations. */}
            {/* Plateforme de test : ces parcours mènent directement à « Se connecter ». */}
            <Route
              path="/bienvenue"
              element={
                <HiddenInRecette>
                  <WelcomeScreen />
                </HiddenInRecette>
              }
            />
            <Route
              path="/eleve"
              element={
                <HiddenInRecette>
                  <StudentAgeScreen />
                </HiddenInRecette>
              }
            />
            <Route
              path="/eleve/inscription"
              element={
                <HiddenInRecette>
                  <StudentSignupScreen />
                </HiddenInRecette>
              }
            />
            <Route
              path="/eleve/code"
              element={
                <HiddenInRecette>
                  <StudentRecoverScreen />
                </HiddenInRecette>
              }
            />
            <Route path="/connexion" element={<LoginScreen />} />
            <Route path="/inscription" element={<SignupScreen />} />
            <Route path="/email/verification" element={<VerifyEmailScreen />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordScreen />} />
            <Route path="/mot-de-passe/nouveau" element={<ResetPasswordScreen />} />
            <Route path="/a-propos" element={<About />} />
            {/* Tout le reste demande un appareil connecté au compte de la famille. */}
            <Route element={<ConnectedShell profileId={profileId} />}>
              <Route path="/" element={<ProfilePicker />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/parent" element={<ParentHome />} />
              <Route path="/tv" element={<TvScreen />} />
              <Route path="/parent/enfant/:profileId" element={<ChildReport />} />
              <Route path="/parent/abonnement" element={<Subscription />} />
              <Route path="/parent/abonnement/simulateur" element={<PaymentSimulator />} />
              <Route path="/parent/profils" element={<ParentProfiles />} />
              <Route path="/parent/profils/nouveau" element={<ParentProfileEditor />} />
              <Route path="/parent/profils/:id/modifier" element={<ParentProfileEditor />} />
              <Route path="/parent/reglages" element={<ParentSettings />} />
              <Route path="/parent/reglages/supprimer" element={<DeleteFamily />} />
              {/* Anciennes adresses (favoris, retours de paiement déjà émis) : on reste dans l'Espace parent. */}
              <Route path="/abonnement/*" element={<LegacyAbonnement />} />
              <Route path="/profils/nouveau" element={<ProfileEditor />} />
              <Route path="/profils/:id/modifier" element={<ProfileEditor />} />
              <Route path="/hub" element={<WithProfile>{(p) => <Hub profile={p} />}</WithProfile>} />
              <Route path="/shop" element={<WithProfile>{(p) => <Shop profile={p} />}</WithProfile>} />
              <Route path="/heros" element={<WithProfile>{(p) => <Heroes profile={p} />}</WithProfile>} />
              <Route path="/dictionnaire" element={<WithProfile>{(p) => <Dictionary profile={p} />}</WithProfile>} />
              <Route path="/multi" element={<WithProfile>{(p) => <MultiModes profile={p} />}</WithProfile>} />
              <Route path="/arene" element={<WithProfile>{(p) => <Arena profile={p} />}</WithProfile>} />
              <Route path="/connectes" element={<WithProfile>{(p) => <Online profile={p} />}</WithProfile>} />
              <Route path="/amis" element={<WithProfile>{(p) => <Friends profile={p} />}</WithProfile>} />
              <Route path="/classement" element={<WithProfile>{(p) => <Ranking profile={p} />}</WithProfile>} />
              <Route
                path="/partie/defi/:defi/:subject"
                element={
                  <NoDefinitions>
                    <WithProfile>{(p) => <DefiPlay profile={p} />}</WithProfile>
                  </NoDefinitions>
                }
              />
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
              <Route
                path="/jouer/boss/:subject"
                element={<WithProfile>{(p) => <BossChapters profile={p} />}</WithProfile>}
              />
              <Route
                path="/partie/boss/:chapterId"
                element={
                  <NoDefinitions>
                    <WithProfile>{(p) => <BossPlay profile={p} />}</WithProfile>
                  </NoDefinitions>
                }
              />
              <Route path="/progres" element={<WithProfile>{(p) => <Progress profile={p} />}</WithProfile>} />
              <Route
                path="/progres/trophees"
                element={<WithProfile>{(p) => <TrophiesPage profile={p} />}</WithProfile>}
              />
              <Route
                path="/progres/:subject"
                element={<WithProfile>{(p) => <SubjectProgress profile={p} />}</WithProfile>}
              />
              <Route path="/parametres" element={<WithProfile>{(p) => <Settings profile={p} />}</WithProfile>} />
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
            </Route>
          </Routes>
          <DebugFlag />
        </ParentGateProvider>
      </TermContext.Provider>
    </ErrorBoundary>
  );
}
