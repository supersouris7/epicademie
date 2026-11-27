import { ANOMALY_LABELS } from '@epicademie/shared';
import { useAnomalies } from './api.ts';
import { dateTime } from './labels.ts';
import { Badge, DataTable, Loading, mutedClass, Panel } from './ui.tsx';

/** Anomalies de récompenses (aucune donnée personnelle). */
export function Anomalies() {
  const { data } = useAnomalies();
  if (!data) return <Loading />;
  return (
    <Panel title="Anomalies de récompenses (30 jours)">
      <DataTable
        label="Anomalies"
        rows={data}
        rowKey={(a) => `${a.rule}-${a.profileId}-${a.detail}`}
        searchText={(a) => `${ANOMALY_LABELS[a.rule]} ${a.detail} ${a.profileId}`}
        empty="Aucune anomalie de récompense : tout est dans les normes."
        columns={[
          {
            key: 'regle',
            label: 'Règle',
            render: (a) => <Badge tone="amber">{ANOMALY_LABELS[a.rule]}</Badge>,
            sort: (a) => a.rule,
          },
          { key: 'detail', label: 'Constat', render: (a) => a.detail },
          { key: 'date', label: 'Date', render: (a) => dateTime(a.at), sort: (a) => a.at ?? '' },
        ]}
        card={(a) => ({ title: ANOMALY_LABELS[a.rule], infos: [a.detail, dateTime(a.at)] })}
        detail={(a) => <p className={mutedClass}>Identifiant du profil : {a.profileId}</p>}
      />
    </Panel>
  );
}
