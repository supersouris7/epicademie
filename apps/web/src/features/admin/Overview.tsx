import { lazy, Suspense } from 'react';
import { OFFERS, SUBJECTS, SUBSCRIPTION_STATUS_LABELS, type AdminStats, type AdminTrends } from '@epicademie/shared';
import { useAnomalies, useStats, useTrends } from './api.ts';
import { BarChart, LineChart, ShareChart } from './Charts.tsx';
import { Anomalies } from './Anomalies.tsx';
import { useCan } from './can.ts';
import { money, nb, offerLabel, providerLabel } from './labels.ts';
import { AdminButton, DataTable, Kpi, Loading, mutedClass, Panel, titleClass } from './ui.tsx';

/** Vue d'ensemble : l'essentiel et ce qui attend une action, puis la semaine et le cumul. */

const ToHandleList = lazy(() => import('./ToHandleList.tsx'));

const gridClass = 'grid grid-cols-2 gap-2.5 lg:grid-cols-4';
const columnsClass = 'grid grid-cols-[minmax(0,1fr)] gap-[18px] lg:grid-cols-2';
const subjectName = (id: string) => SUBJECTS.find((s) => s.id === id)?.name ?? id;

export function Overview({ openReports }: { readonly openReports: () => void }) {
  const { data: s } = useStats();
  const { data: trends } = useTrends();
  const can = useCan();
  const { data: anomalies } = useAnomalies(can('comptes:lire'));
  if (!s) return <p className={mutedClass}>Chargement…</p>;
  return (
    <div className="flex flex-col gap-[18px]">
      <section aria-label="Indicateurs clés">
        <dl className={gridClass}>
          <Kpi label="Familles" value={nb(s.families)} hint="inscrites" />
          <Kpi label="Enfants actifs" value={nb(s.activeProfiles7d)} hint="sur 7 jours" />
          {s.premiumFamilies !== null && (
            <Kpi label="Abonnés" value={nb(s.premiumFamilies)} hint={OFFERS.map(offerLabel).join(', ')} />
          )}
          <Kpi
            label="Signalements à traiter"
            value={
              <button type="button" onClick={openReports} className="cursor-pointer text-pilot-acc underline">
                {nb(s.openReports)}
              </button>
            }
          />
        </dl>
      </section>
      <ToHandle total={s.openReports} openReports={openReports} />
      {anomalies && anomalies.length > 0 && <Anomalies />}
      {trends && <Trends trends={trends} />}
      <Week s={s} />
      <AllTime s={s} trends={trends} />
    </div>
  );
}

/** Signalements en attente : la liste (et les titres des notions) n'est chargée que s'il y en a. */
function ToHandle({ total, openReports }: { readonly total: number; readonly openReports: () => void }) {
  return (
    <Panel
      title="À traiter"
      actions={total > 0 && <AdminButton onClick={openReports}>Voir les signalements</AdminButton>}
    >
      {total === 0 ? (
        <p className={mutedClass}>Rien à traiter : aucun signalement en attente.</p>
      ) : (
        <Suspense fallback={<Loading />}>
          <ToHandleList />
        </Suspense>
      )}
    </Panel>
  );
}

function Trends({ trends }: { readonly trends: AdminTrends }) {
  return (
    <div className={columnsClass}>
      <Panel title="Comptes créés par jour (30 jours)">
        <BarChart
          title="Comptes créés par jour"
          unit={{ one: 'compte', many: 'comptes' }}
          points={trends.accountsByDay.map((d) => ({ label: d.day, value: d.count }))}
        />
      </Panel>
      {trends.activeSubscriptionsByDay && (
        <Panel title="Abonnements actifs (30 jours)">
          <LineChart
            title="Abonnements actifs par jour"
            unit={{ one: 'abonnement', many: 'abonnements' }}
            points={trends.activeSubscriptionsByDay.map((d) => ({ label: d.day, value: d.count }))}
          />
        </Panel>
      )}
      {/* Une répartition n'a de sens qu'à partir de deux formules. */}
      {trends.activeByOffer && trends.activeByOffer.length > 1 && (
        <Panel title="Répartition par formule">
          <ShareChart
            title="Abonnements actifs par formule"
            points={trends.activeByOffer.map((o) => ({ label: offerLabel(o.offer), value: o.count }))}
          />
        </Panel>
      )}
    </div>
  );
}

/** Uniquement des chiffres calculés sur les 7 derniers jours. */
function Week({ s }: { readonly s: AdminStats }) {
  return (
    <section aria-label="7 derniers jours" className="flex flex-col gap-2.5">
      <h2 className={titleClass}>7 derniers jours</h2>
      <dl className={gridClass}>
        <Kpi label="Réponses" value={nb(s.answers7d)} />
        <Kpi label="Séries terminées" value={nb(s.finishedSeries7d)} />
        <Kpi
          label="Réussite sans aide"
          value={s.autonomousRate7d === null ? '—' : `${Math.round(s.autonomousRate7d * 100)} %`}
        />
      </dl>
      <Panel title="Réponses par matière">
        <DataTable
          label="Réponses par matière"
          rows={s.answersBySubject7d}
          rowKey={(r) => r.subject}
          empty="Aucune réponse cette semaine."
          columns={[
            {
              key: 'matiere',
              label: 'Matière',
              render: (r) => subjectName(r.subject),
              sort: (r) => subjectName(r.subject),
            },
            {
              key: 'reponses',
              label: 'Réponses',
              render: (r) => nb(r.answers),
              sort: (r) => r.answers,
              align: 'right',
            },
          ]}
        />
      </Panel>
    </section>
  );
}

function AllTime({ s, trends }: { readonly s: AdminStats; readonly trends: AdminTrends | undefined }) {
  const providers = trends?.paymentProviders?.map(providerLabel).join(', ');
  return (
    <section aria-label="Depuis le début" className="flex flex-col gap-2.5">
      <h2 className={titleClass}>Depuis le début</h2>
      <dl className={gridClass}>
        <Kpi label="Profils enfants" value={nb(s.profiles)} />
        <Kpi label="Boss vaincus" value={nb(s.bossWins)} />
        {s.payments && (
          <Kpi
            label="Encaissements d’essai, depuis le début"
            value={trends && trends.revenueCents !== null ? money(trends.revenueCents) : '—'}
            hint={providers ? `Prestataire : ${providers}` : 'Aucun paiement'}
          />
        )}
      </dl>
      {s.payments && <Payments payments={s.payments} />}
    </section>
  );
}

function Payments({ payments }: { readonly payments: NonNullable<AdminStats['payments']> }) {
  return (
    <Panel title="Paiements">
      <DataTable
        label="Paiements"
        rows={payments}
        rowKey={(p) => p.status}
        empty="Aucun paiement."
        columns={[
          { key: 'etat', label: 'État', render: (p) => SUBSCRIPTION_STATUS_LABELS[p.status] },
          { key: 'nombre', label: 'Nombre', render: (p) => nb(p.count), sort: (p) => p.count, align: 'right' },
          {
            key: 'montant',
            label: 'Montant',
            render: (p) => money(p.amountCents),
            sort: (p) => p.amountCents,
            align: 'right',
          },
        ]}
      />
    </Panel>
  );
}
