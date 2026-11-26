import { useState } from 'react';
import type { AdminPermission } from '@epicademie/shared';
import { AuditLog } from './Accounts.tsx';
import { DebugMode } from './DebugMode.tsx';
import { Anomalies } from './Anomalies.tsx';
import { Errors } from './Insights.tsx';
import { useCan } from './can.ts';
import { Segmented } from './ui.tsx';

/** Outils techniques réunis : mode debug, erreurs, journal d'audit, anomalies. */

const TOOLS = [
  { value: 'debug', label: 'Mode debug', permission: 'signalements:traiter' },
  { value: 'errors', label: 'Erreurs', permission: 'audit:lire' },
  { value: 'audit', label: 'Journal d’audit', permission: 'audit:lire' },
  { value: 'anomalies', label: 'Anomalies', permission: 'comptes:lire' },
] as const satisfies readonly { value: string; label: string; permission: AdminPermission }[];
type Tool = (typeof TOOLS)[number]['value'];

export function Technical({ openAccount }: { readonly openAccount: (id: string) => void }) {
  const can = useCan();
  const [tool, setTool] = useState<Tool>('debug');
  return (
    <div className="flex flex-col gap-3">
      <Segmented label="Outil" choices={TOOLS.filter((t) => can(t.permission))} value={tool} onChange={setTool} />
      {tool === 'debug' && <DebugMode />}
      {tool === 'errors' && <Errors />}
      {tool === 'audit' && <AuditLog onOpen={openAccount} />}
      {tool === 'anomalies' && <Anomalies />}
    </div>
  );
}
