import { useState } from 'react';
import { Accounts } from './Accounts.tsx';
import { AdminGate, AdminShell, type AdminSection } from './AdminShell.tsx';
import { useStats } from './api.ts';
import { Contents } from './Contents.tsx';
import { WeakSkills } from './Insights.tsx';
import { Overview } from './Overview.tsx';
import { Reports } from './Reports.tsx';
import { Technical } from './Technical.tsx';

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
        {section.id === 'stats' && <Overview openReports={() => select('reports')} />}
        {section.id === 'reports' && <Reports />}
        {section.id === 'accounts' && <Accounts openId={accountId} onOpen={setAccountId} />}
        {section.id === 'content' && <Contents />}
        {section.id === 'weak' && <WeakSkills />}
        {section.id === 'technical' && <Technical openAccount={openAccount} />}
      </div>
    </AdminShell>
  );
}
