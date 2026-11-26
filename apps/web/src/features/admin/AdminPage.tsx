import { lazy, Suspense, useState } from 'react';
import { AdminGate, AdminShell, type AdminSection } from './AdminShell.tsx';
import { useStats } from './api.ts';
import { Overview } from './Overview.tsx';
import { Loading } from './ui.tsx';

// Rubriques qui affichent des contenus pédagogiques : chargées à leur ouverture.
const Accounts = lazy(() => import('./Accounts.tsx').then((m) => ({ default: m.Accounts })));
const Contents = lazy(() => import('./Contents.tsx').then((m) => ({ default: m.Contents })));
const Reports = lazy(() => import('./Reports.tsx').then((m) => ({ default: m.Reports })));
const Technical = lazy(() => import('./Technical.tsx').then((m) => ({ default: m.Technical })));
const WeakSkills = lazy(() => import('./Insights.tsx').then((m) => ({ default: m.WeakSkills })));

/**
 * Console d'administration (pédagogie et pilotage) : vue d'ensemble, signalements des familles avec
 * la question exacte régénérée, familles (recherche, fiche), état de validation des notions, points
 * faibles et outils techniques. Réservée à l'opérateur de la page de pilotage (en-tête secret du
 * frontal) : aucun compte de jeu, aucun bouton depuis l'application.
 */
const SECTIONS = [
  { id: 'stats', label: 'Vue d’ensemble' },
  { id: 'reports', label: 'Signalements' },
  { id: 'accounts', label: 'Familles' },
  { id: 'content', label: 'Notions' },
  { id: 'weak', label: 'Points faibles' },
  { id: 'technical', label: 'Technique' },
] as const satisfies readonly AdminSection[];
type SectionId = (typeof SECTIONS)[number]['id'];

export function AdminPage() {
  return (
    <AdminGate>
      <Console />
    </AdminGate>
  );
}

function Console() {
  const [active, setActive] = useState<SectionId>('stats');
  const [accountId, setAccountId] = useState<string | null>(null);
  const { data: stats } = useStats();
  const section = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  const select = (id: SectionId) => {
    setAccountId(null);
    setActive(id);
  };
  const openAccount = (id: string) => {
    setAccountId(id);
    setActive('accounts');
  };
  return (
    <AdminShell
      sections={SECTIONS.map((s) => (s.id === 'reports' ? { ...s, count: stats?.openReports } : s))}
      active={section.id}
      onSelect={(id) => select(id as SectionId)}
    >
      <div role="tabpanel" aria-label={section.label}>
        <Suspense key={section.id} fallback={<Loading />}>
          {section.id === 'stats' && <Overview openReports={() => select('reports')} />}
          {section.id === 'reports' && <Reports />}
          {section.id === 'accounts' && <Accounts openId={accountId} onOpen={setAccountId} />}
          {section.id === 'content' && <Contents />}
          {section.id === 'weak' && <WeakSkills />}
          {section.id === 'technical' && <Technical openAccount={openAccount} />}
        </Suspense>
      </div>
    </AdminShell>
  );
}
