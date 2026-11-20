import { useQuery } from '@tanstack/react-query';
import { ANOMALY_LABELS, api, SUBJECTS, SUBSCRIPTION_STATUS_LABELS } from '@questeo/shared';
import { request } from '../../shared/api/client.ts';

/** Pilotage : chiffres agrégés, anomalies de récompenses, erreurs récentes (aucune donnée personnelle). */

const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;
const euros = (cents: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const when = (iso: string) => new Date(iso).toLocaleString('fr-FR');

export function Stats() {
  const { data: s } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => request(api.adminStats) });
  if (!s) return <p>Chargement…</p>;
  const tiles: [string, string | number][] = [
    ['Familles', s.families],
    ['Profils enfants', s.profiles],
    ['Joueurs actifs (7 j)', s.activeProfiles7d],
    ['Séries terminées (7 j)', s.finishedSeries7d],
    ['Réponses (7 j)', s.answers7d],
    ['Réussite sans aide (7 j)', s.autonomousRate7d === null ? '—' : `${Math.round(s.autonomousRate7d * 100)} %`],
    ['Boss vaincus', s.bossWins],
    ['Familles abonnées', s.premiumFamilies],
    ['Signalements ouverts', s.openReports],
  ];
  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map(([label, value]) => (
          <div key={label} className="cartoon bg-surface flex flex-col p-3">
            <dt className="text-muted text-sm font-bold">{label}</dt>
            <dd className="font-display text-3xl tracking-wide">{value}</dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="par-matiere">
        <h3 id="par-matiere" className="font-display text-xl tracking-wide">
          Réponses par matière (7 jours)
        </h3>
        {s.answersBySubject7d.length === 0 ? (
          <p>Aucune réponse cette semaine.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th scope="col">Matière</th>
                <th scope="col">Réponses</th>
              </tr>
            </thead>
            <tbody>
              {s.answersBySubject7d.map((r) => (
                <tr key={r.subject}>
                  <td>{subjectName(r.subject)}</td>
                  <td>{r.answers}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
      <section aria-labelledby="paiements">
        <h3 id="paiements" className="font-display text-xl tracking-wide">
          Paiements
        </h3>
        {s.payments.length === 0 ? (
          <p>Aucun paiement.</p>
        ) : (
          <ul>
            {s.payments.map((p) => (
              <li key={p.status}>
                {SUBSCRIPTION_STATUS_LABELS[p.status]} : {p.count} ({euros(p.amountCents)})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function Anomalies() {
  const { data } = useQuery({ queryKey: ['admin', 'anomalies'], queryFn: () => request(api.adminAnomalies) });
  if (!data) return <p>Chargement…</p>;
  if (data.length === 0) return <p>Aucune anomalie de récompense : tout est dans les normes.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {data.map((a) => (
        <li key={`${a.rule}-${a.profileId}-${a.detail}`} className="cartoon bg-surface p-3">
          <p className="font-bold">{ANOMALY_LABELS[a.rule]}</p>
          <p>{a.detail}</p>
          <p className="text-muted text-sm">
            Profil {a.profileId.slice(0, 8)}…{a.at && ` · ${when(a.at)}`}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function Errors() {
  const { data } = useQuery({ queryKey: ['admin', 'errors'], queryFn: () => request(api.adminErrors) });
  if (!data) return <p>Chargement…</p>;
  if (data.length === 0) return <p>Aucune erreur depuis le démarrage du serveur.</p>;
  return (
    <ul className="flex flex-col gap-2">
      {data.map((e) => (
        <li key={`${e.source}-${e.message}`} className="cartoon bg-surface p-3">
          <p className="font-bold">
            {e.count} × {e.message}
          </p>
          <p className="text-muted text-sm">
            {e.source}
            {e.route && ` · ${e.route}`} · dernière le {when(e.lastAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}
