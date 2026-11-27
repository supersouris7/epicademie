import { useQuery } from '@tanstack/react-query';
import { api } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';
import { skillGrade, skillTitle } from './contentLabels.ts';
import { dateTime, ERROR_SOURCE_LABELS, errorLabel, nb } from './labels.ts';
import { Badge, DataTable, Loading, mutedClass, Panel } from './ui.tsx';

/** Points faibles et erreurs récentes (aucune donnée personnelle). */

export function Errors() {
  const { data } = useQuery({ queryKey: ['admin', 'errors'], queryFn: () => request(api.adminErrors) });
  if (!data) return <Loading />;
  return (
    <Panel title="Erreurs récentes (depuis le démarrage du serveur)">
      <DataTable
        label="Erreurs"
        rows={data}
        rowKey={(e) => `${e.source}-${e.message}`}
        searchText={(e) => `${errorLabel(e)} ${e.message} ${e.route ?? ''} ${ERROR_SOURCE_LABELS[e.source]}`}
        empty="Aucune erreur depuis le démarrage du serveur."
        columns={[
          { key: 'nombre', label: 'Nombre', render: (e) => nb(e.count), sort: (e) => e.count, align: 'right' },
          {
            key: 'erreur',
            label: 'Erreur',
            render: (e) => <span className="font-medium">{errorLabel(e)}</span>,
            sort: errorLabel,
          },
          {
            key: 'source',
            label: 'Origine',
            render: (e) => <Badge>{ERROR_SOURCE_LABELS[e.source]}</Badge>,
            sort: (e) => e.source,
          },
          { key: 'derniere', label: 'Dernière', render: (e) => dateTime(e.lastAt), sort: (e) => e.lastAt },
        ]}
        card={(e) => ({
          title: errorLabel(e),
          infos: [`${nb(e.count)} fois`, `Dernière : ${dateTime(e.lastAt)}`],
          badge: <Badge>{ERROR_SOURCE_LABELS[e.source]}</Badge>,
        })}
        detail={(e) => (
          <div className="flex flex-col gap-1 text-sm [overflow-wrap:anywhere]">
            <p className={mutedClass}>Message d’origine</p>
            <code className="text-xs">{e.message}</code>
            <p className={mutedClass}>
              Adresse : {e.route ?? '—'} · première fois le {dateTime(e.firstAt)}
            </p>
          </div>
        )}
      />
    </Panel>
  );
}

/** Notions les plus ratées (90 jours, anonyme) : de quoi améliorer les explications. */
export function WeakSkills() {
  const { data } = useQuery({ queryKey: ['admin', 'weak-skills'], queryFn: () => request(api.adminWeakSkills) });
  if (!data) return <Loading />;
  const rate = (w: { errors: number; answers: number }) => w.errors / w.answers;
  const badge = (w: { errors: number; answers: number }) => (
    <Badge tone={rate(w) > 0.5 ? 'red' : rate(w) > 0.3 ? 'amber' : 'slate'}>{Math.round(rate(w) * 100)} %</Badge>
  );
  return (
    <Panel title="Points faibles : notions les plus ratées (90 jours, anonyme)">
      <DataTable
        label="Points faibles"
        rows={data}
        rowKey={(w) => w.skillId}
        searchText={(w) => `${skillTitle(w.skillId)} ${w.skillId}`}
        empty="Pas encore assez de réponses (au moins 10 par notion)."
        columns={[
          {
            key: 'notion',
            label: 'Notion',
            render: (w) => <span className="font-medium">{skillTitle(w.skillId)}</span>,
          },
          { key: 'classe', label: 'Classe', render: (w) => skillGrade(w.skillId) },
          { key: 'erreurs', label: 'Erreurs', render: badge, sort: rate, align: 'right' },
          { key: 'reponses', label: 'Réponses', render: (w) => nb(w.answers), sort: (w) => w.answers, align: 'right' },
          { key: 'eleves', label: 'Élèves', render: (w) => nb(w.players), sort: (w) => w.players, align: 'right' },
        ]}
        card={(w) => ({
          title: skillTitle(w.skillId),
          infos: [`Classe : ${skillGrade(w.skillId)}`, `${nb(w.answers)} réponses · ${nb(w.players)} élèves`],
          badge: badge(w),
        })}
      />
    </Panel>
  );
}
