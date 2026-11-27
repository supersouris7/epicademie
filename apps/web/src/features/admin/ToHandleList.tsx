import { useReports } from './api.ts';
import { date, plural } from './labels.ts';
import { groupReports } from './reportGroups.ts';
import { mutedClass } from './ui.tsx';

/** Notions signalées montrées dans « À traiter » (la liste complète est dans sa rubrique). */
const TODO_SHOWN = 5;

/** Signalements en attente, une ligne par notion (les doublons sont regroupés). */
export default function ToHandleList() {
  const fresh = useReports('nouveau');
  const started = useReports('en-cours');
  const groups = groupReports([...(fresh.data ?? []), ...(started.data ?? [])]);
  return (
    <ul aria-label="Signalements à traiter" className="flex flex-col text-sm">
      {groups.slice(0, TODO_SHOWN).map((g) => (
        <li key={g.key} className="flex flex-wrap justify-between gap-x-3 border-t border-pilot-line py-1.5">
          <span className="font-medium">{g.title}</span>
          <span className={mutedClass}>
            {plural(g.reports.length, 'signalement')} · dernier le {date(g.latest)}
          </span>
        </li>
      ))}
      {groups.length > TODO_SHOWN && (
        <li className={`border-t border-pilot-line pt-1.5 ${mutedClass}`}>
          et {plural(groups.length - TODO_SHOWN, 'autre notion', 'autres notions')}
        </li>
      )}
    </ul>
  );
}
