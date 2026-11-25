import { useState } from 'react';
import { AuditLog } from './Accounts.tsx';
import { DebugMode } from './DebugMode.tsx';
import { Anomalies, Errors } from './Insights.tsx';
import { Segmented } from './ui.tsx';

/** Outils techniques réunis : mode debug, erreurs, journal d'audit, anomalies. */

const TOOLS = [
  { value: 'debug', label: 'Mode debug' },
  { value: 'errors', label: 'Erreurs' },
  { value: 'audit', label: 'Journal d’audit' },
  { value: 'anomalies', label: 'Anomalies' },
] as const;
type Tool = (typeof TOOLS)[number]['value'];

export function Technical({ openAccount }: { readonly openAccount: (id: string) => void }) {
  const [tool, setTool] = useState<Tool>('debug');
  return (
    <div className="flex flex-col gap-3">
      <Segmented label="Outil" choices={TOOLS} value={tool} onChange={setTool} />
      {tool === 'debug' && <DebugMode />}
      {tool === 'errors' && <Errors />}
      {tool === 'audit' && <AuditLog onOpen={openAccount} />}
      {tool === 'anomalies' && <Anomalies />}
    </div>
  );
}
