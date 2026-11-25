import { useState } from 'react';
import {
  ACCOUNT_STATE_LABELS,
  ACCOUNT_STATES,
  ACCOUNT_TYPE_LABELS,
  ACCOUNT_TYPES,
  AUDIT_ACTION_LABELS,
  gradeInfo,
  ITEM_INFO,
  MODES,
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  subjectLabel,
  SUBSCRIPTION_STATUS_LABELS,
  type AccountDetail,
  type AccountRow,
  type AccountSearch,
  type AuditPage,
} from '@epicademie/shared';
import { ApiError } from '../../shared/api/client.ts';
import { useAccount, useAccounts, useAudit, useResetPassword } from './api.ts';
import {
  chapterTitle,
  date,
  dateTime,
  labelOf,
  money,
  offerLabel,
  plural,
  providerLabel,
  skillTitle,
} from './labels.ts';
import {
  AdminButton,
  Badge,
  cardClass,
  errorClass,
  innerCardClass,
  inputClass,
  mutedClass,
  Panel,
  RowCard,
  Segmented,
  tableClass,
  tdClass,
  thClass,
} from './ui.tsx';
import { useIsPhone } from './useIsPhone.ts';

/**
 * Familles et comptes : recherche et liste paginées côté serveur (25 par page), fiche détaillée d'un compte,
 * mot de passe temporaire, journal d'audit. Aucune liste complète n'est jamais chargée ; ouvrir une
 * fiche est journalisé (RGPD : traçabilité des accès aux données d'enfants).
 */

const DEFAULT_SEARCH: AccountSearch = { q: '', type: 'tous', state: 'tous', sort: 'creation', order: 'desc', page: 0 };

export function Accounts({
  openId,
  onOpen,
}: {
  /** Fiche ouverte (aussi depuis le journal d'audit), ou null pour la liste. */
  readonly openId: string | null;
  readonly onOpen: (id: string | null) => void;
}) {
  const [search, setSearch] = useState<AccountSearch>(DEFAULT_SEARCH);
  const [typed, setTyped] = useState('');
  const { data, isPending, error, isFetching } = useAccounts(search);
  if (openId) return <AccountSheet id={openId} onBack={() => onOpen(null)} />;
  const change = (patch: Partial<AccountSearch>) => setSearch((s) => ({ ...s, page: 0, ...patch }));
  return (
    <Panel title="Familles et comptes">
      <div className="flex flex-col gap-3">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            change({ q: typed.trim() });
          }}
        >
          <label className={`flex flex-col gap-1 ${mutedClass}`}>
            Recherche
            <input
              type="search"
              className={`${inputClass} w-72`}
              placeholder="E-mail, identifiant de famille ou prénom"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </label>
          <AdminButton type="submit" tone="primary">
            Rechercher
          </AdminButton>
          <Segmented
            label="Type"
            value={search.type}
            onChange={(type) => change({ type })}
            choices={ACCOUNT_TYPES.map((t) => ({ value: t, label: ACCOUNT_TYPE_LABELS[t] }))}
          />
          <label className={`flex flex-col gap-1 ${mutedClass}`}>
            État
            <select
              className={inputClass}
              value={search.state}
              onChange={(e) => change({ state: e.target.value as AccountSearch['state'] })}
            >
              {ACCOUNT_STATES.map((s) => (
                <option key={s} value={s}>
                  {ACCOUNT_STATE_LABELS[s]}
                </option>
              ))}
            </select>
          </label>
          <label className={`flex flex-col gap-1 ${mutedClass}`}>
            Tri
            <select
              className={inputClass}
              value={`${search.sort}:${search.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split(':') as [AccountSearch['sort'], AccountSearch['order']];
                change({ sort, order });
              }}
            >
              <option value="creation:desc">Création : récents d’abord</option>
              <option value="creation:asc">Création : anciens d’abord</option>
              <option value="activite:desc">Activité : récents d’abord</option>
              <option value="activite:asc">Activité : anciens d’abord</option>
            </select>
          </label>
        </form>
        {error && (
          <p role="alert" className={errorClass}>
            {error.message}
          </p>
        )}
        {isPending ? (
          <p className={mutedClass}>Chargement…</p>
        ) : (
          data && (
            <>
              <p className={mutedClass} role="status">
                {data.total} compte{data.total > 1 ? 's' : ''} · page {data.page + 1}
                {isFetching ? ' · mise à jour…' : ''}
              </p>
              <AccountList rows={data.items} onOpen={onOpen} />
              <div className="flex items-center gap-2">
                <AdminButton
                  disabled={search.page === 0}
                  onClick={() => setSearch((s) => ({ ...s, page: s.page - 1 }))}
                >
                  Précédent
                </AdminButton>
                <AdminButton disabled={!data.hasMore} onClick={() => setSearch((s) => ({ ...s, page: s.page + 1 }))}>
                  Suivant
                </AdminButton>
              </div>
            </>
          )
        )}
      </div>
    </Panel>
  );
}

const accountName = (r: AccountRow) => r.email ?? 'Élève autonome (sans e-mail)';
const accountType = (type: AccountRow['type']) => ACCOUNT_TYPE_LABELS[type];
const toValidate = (r: AccountRow) => r.email !== null && !r.emailVerified;

function AccountList({
  rows,
  onOpen,
}: {
  readonly rows: readonly AccountRow[];
  readonly onOpen: (id: string) => void;
}) {
  const phone = useIsPhone();
  if (rows.length === 0) return <p className={mutedClass}>Aucun compte ne correspond.</p>;
  if (phone) {
    return (
      <ul aria-label="Comptes" className="flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.id}>
            <RowCard
              onClick={() => onOpen(r.id)}
              content={{
                title: accountName(r),
                infos: [r.profileNames.join(', ') || 'Aucun profil', `Dernière activité : ${date(r.lastActivityAt)}`],
                badge: toValidate(r) ? (
                  <Badge tone="amber">E-mail à valider</Badge>
                ) : (
                  <Badge>{accountType(r.type)}</Badge>
                ),
              }}
            />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table aria-label="Comptes" className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Compte</th>
            <th className={thClass}>Type</th>
            <th className={thClass}>Profils</th>
            <th className={thClass}>Créé le</th>
            <th className={thClass}>Dernière activité</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className={`${tdClass} font-medium`}>
                {accountName(r)}
                {toValidate(r) && (
                  <>
                    {' '}
                    <Badge tone="amber">E-mail à valider</Badge>
                  </>
                )}
              </td>
              <td className={tdClass}>{accountType(r.type)}</td>
              <td className={tdClass}>{r.profileNames.join(', ') || '—'}</td>
              <td className={tdClass}>{date(r.createdAt)}</td>
              <td className={tdClass}>{date(r.lastActivityAt)}</td>
              <td className={`${tdClass} text-right whitespace-nowrap`}>
                <AdminButton onClick={() => onOpen(r.id)}>Ouvrir la fiche</AdminButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <div>
      <dt className={mutedClass}>{label}</dt>
      <dd className="text-sm font-semibold [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

const itemNames: Record<string, string> = Object.fromEntries(
  Object.entries(ITEM_INFO).map(([id, info]) => [id, info.name]),
);
const modeNames: Record<string, string> = Object.fromEntries(MODES.map((m) => [m.id, m.name]));

const METHOD_LABELS = { 'mot-de-passe': 'Mot de passe', google: 'Google', 'code-recuperation': 'Code de récupération' };

function AccountSheet({ id, onBack }: { readonly id: string; readonly onBack: () => void }) {
  const { data, isPending, error } = useAccount(id);
  return (
    <Panel title="Fiche du compte" actions={<AdminButton onClick={onBack}>Retour à la liste</AdminButton>}>
      {isPending && <p className={mutedClass}>Chargement…</p>}
      {error && (
        <p role="alert" className={errorClass}>
          {error.message}
        </p>
      )}
      {data && <Sheet d={data} />}
    </Panel>
  );
}

function Sheet({ d }: { readonly d: AccountDetail }) {
  const a = d.account;
  return (
    <div className="flex flex-col gap-5">
      <p className={mutedClass}>Cette consultation est enregistrée dans le journal d’audit.</p>
      <section aria-label="Compte">
        <h3 className="mb-2 font-bold">Compte</h3>
        <dl className="grid gap-3 sm:grid-cols-3">
          <Field label="E-mail">{a.email ?? 'Aucun (élève autonome)'}</Field>
          <Field label="Type">{ACCOUNT_TYPE_LABELS[a.type]}</Field>
          <Field label="Identifiant de famille">
            <code className="text-xs">{a.familyId}</code>
          </Field>
          <Field label="Création">{dateTime(a.createdAt)}</Field>
          <Field label="Dernière connexion">{dateTime(a.lastLoginAt)}</Field>
          <Field label="Dernière activité">{dateTime(a.lastActivityAt)}</Field>
          <Field label="E-mail validé">{a.emailVerifiedAt ? `Oui, le ${date(a.emailVerifiedAt)}` : 'Non'}</Field>
          <Field label="Méthodes de connexion">{a.methods.map((m) => METHOD_LABELS[m]).join(', ') || 'Aucune'}</Field>
          <Field label="Code PIN parent">{a.hasPin ? 'Défini' : 'Non défini'}</Field>
        </dl>
      </section>
      <section aria-label="Profils">
        <h3 className="mb-2 font-bold">Profils enfants ({d.profiles.length})</h3>
        {d.profiles.length === 0 && <p className={mutedClass}>Aucun profil.</p>}
        <ul className="flex flex-col gap-2">
          {d.profiles.map((p) => (
            <li key={p.id} className={`${innerCardClass} p-3 text-sm`}>
              <p className="font-semibold">
                {p.name}{' '}
                <span className="font-normal text-pilot-mut">
                  · {p.grade ? gradeInfo(p.grade).name : 'classe non renseignée'}
                </span>
              </p>
              <p className={mutedClass}>
                Créé le {date(p.createdAt)} · dernière activité {date(p.lastActivityAt)} · {p.xp} XP · {p.coins} pièces
                · {p.rubies} rubis
              </p>
              <p className={mutedClass}>
                {plural(p.games, 'partie')} · {p.correctAnswers}/{p.answers} bonnes réponses · {p.skillsMastered}/
                {p.skillsStudied} notions maîtrisées · {p.heroesOwned} héros ·{' '}
                {plural(p.bossWins, 'victoire de boss', 'victoires de boss')}
              </p>
              <p className={mutedClass}>
                Objets :{' '}
                {p.items.length ? p.items.map((i) => `${labelOf(itemNames, i.item)} ×${i.count}`).join(', ') : 'aucun'}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Activité récente">
        <h3 className="mb-2 font-bold">Activité récente</h3>
        {d.recentGames.length === 0 && <p className={mutedClass}>Aucune partie.</p>}
        <ul className="flex flex-col gap-0.5 text-sm">
          {d.recentGames.map((g, i) => (
            <li key={i}>
              {dateTime(g.startedAt)} — {g.profileName} · {labelOf(modeNames, g.mode)} · {subjectLabel(g.subject)} ·{' '}
              {chapterTitle(g.chapterId)} ({g.correct}/{g.answered})
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Signalements">
        <h3 className="mb-2 font-bold">Signalements envoyés</h3>
        {d.reports.length === 0 && <p className={mutedClass}>Aucun signalement.</p>}
        <ul className="flex flex-col gap-0.5 text-sm">
          {d.reports.map((r) => (
            <li key={r.id}>
              {date(r.createdAt)} — {r.skillId ? skillTitle(r.skillId) : 'Général'} · {REPORT_REASON_LABELS[r.reason]} ·{' '}
              {REPORT_STATUS_LABELS[r.status]}
              {r.comment ? ` : « ${r.comment} »` : ''}
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Démarches en cours">
        <h3 className="mb-2 font-bold">Consentements et suppression (RGPD)</h3>
        <p className="text-sm">
          Invitation de rattachement parent : {d.pending.invitation ? 'en cours' : 'aucune'} · lien de réinitialisation
          : {d.pending.passwordReset ? 'en cours' : 'aucun'} · lien de validation d’e-mail :{' '}
          {d.pending.emailVerification ? 'en cours' : 'aucun'}. La suppression d’un compte est immédiate : aucune
          demande ne reste en attente.
        </p>
      </section>
      <section aria-label="Abonnement">
        <h3 className="mb-2 font-bold">Abonnement</h3>
        {d.subscriptions.length === 0 && <p className={mutedClass}>Aucun abonnement.</p>}
        <ul className="flex flex-col gap-0.5 text-sm">
          {d.subscriptions.map((s, i) => (
            <li key={i}>
              {offerLabel(s.offer)} · {labelOf(SUBSCRIPTION_STATUS_LABELS, s.status)} ·{' '}
              {money(s.amountCents, s.currency)} · jusqu’au {date(s.periodEnd)} ({providerLabel(s.provider)})
            </li>
          ))}
        </ul>
      </section>
      {a.type === 'famille' && <ResetPassword id={a.id} />}
    </div>
  );
}

function ResetPassword({ id }: { readonly id: string }) {
  const reset = useResetPassword(id);
  const [confirming, setConfirming] = useState(false);
  return (
    <section aria-label="Mot de passe" className={`${cardClass} p-3`}>
      <h3 className="mb-2 font-bold">Réinitialiser le mot de passe</h3>
      {reset.data ? (
        <div role="status" className="flex flex-col gap-1 text-sm">
          <p>
            Mot de passe temporaire (affiché une seule fois) :{' '}
            <code className="rounded-[4px] bg-pilot-bg px-1.5 py-0.5 text-base font-bold">{reset.data.password}</code>
          </p>
          <p className={mutedClass}>
            {reset.data.sessionsClosed} session{reset.data.sessionsClosed > 1 ? 's' : ''} fermée
            {reset.data.sessionsClosed > 1 ? 's' : ''}. À transmettre au parent, qui le changera à sa connexion.
          </p>
        </div>
      ) : confirming ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>Cela ferme toutes les sessions du compte et change son mot de passe. Continuer ?</span>
          <AdminButton tone="danger" disabled={reset.isPending} onClick={() => reset.mutate()}>
            Oui, générer un mot de passe
          </AdminButton>
          <AdminButton onClick={() => setConfirming(false)}>Annuler</AdminButton>
        </div>
      ) : (
        <AdminButton onClick={() => setConfirming(true)}>Générer un mot de passe temporaire</AdminButton>
      )}
      {reset.error && (
        <p role="alert" className={`mt-2 ${errorClass}`}>
          {reset.error instanceof ApiError ? reset.error.message : 'Réinitialisation impossible.'}
        </p>
      )}
    </section>
  );
}

type AuditEntry = AuditPage['items'][number];

/** Nom court du compte, avec lien vers sa fiche s'il existe encore. */
function AuditAccount({ entry, onOpen }: { readonly entry: AuditEntry; readonly onOpen: (id: string) => void }) {
  if (!entry.accountExists) return <span className={mutedClass}>{entry.accountLabel}</span>;
  return (
    <button
      type="button"
      onClick={() => onOpen(entry.accountId)}
      className="cursor-pointer text-left font-semibold text-pilot-acc underline [overflow-wrap:anywhere]"
    >
      {entry.accountLabel}
    </button>
  );
}

function AuditList({
  items,
  onOpen,
}: {
  readonly items: readonly AuditEntry[];
  readonly onOpen: (id: string) => void;
}) {
  const phone = useIsPhone();
  if (phone) {
    return (
      <ul aria-label="Journal d’audit" className="flex flex-col gap-2">
        {items.map((e) => (
          <li key={e.id}>
            <RowCard
              onClick={e.accountExists ? () => onOpen(e.accountId) : undefined}
              content={{
                title: AUDIT_ACTION_LABELS[e.action],
                infos: [e.accountLabel, `${dateTime(e.at)} · ${e.operator}`],
              }}
            />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table aria-label="Journal d’audit" className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Date</th>
            <th className={thClass}>Opérateur</th>
            <th className={thClass}>Action</th>
            <th className={thClass}>Compte</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td className={tdClass}>{dateTime(e.at)}</td>
              <td className={tdClass}>{e.operator}</td>
              <td className={tdClass}>{AUDIT_ACTION_LABELS[e.action]}</td>
              <td className={tdClass}>
                <AuditAccount entry={e} onOpen={onOpen} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Journal d'audit : consultations de fiches et réinitialisations (opérateur, action, compte, date). */
export function AuditLog({ onOpen }: { readonly onOpen: (id: string) => void }) {
  const [page, setPage] = useState(0);
  const { data, isPending } = useAudit(page);
  return (
    <Panel title="Journal d’audit">
      {isPending || !data ? (
        <p className={mutedClass}>Chargement…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data.items.length === 0 ? (
            <p className={mutedClass}>Aucun accès enregistré.</p>
          ) : (
            <AuditList items={data.items} onOpen={onOpen} />
          )}
          <div className="flex gap-2">
            <AdminButton disabled={page === 0} onClick={() => setPage(page - 1)}>
              Précédent
            </AdminButton>
            <AdminButton disabled={!data.hasMore} onClick={() => setPage(page + 1)}>
              Suivant
            </AdminButton>
          </div>
        </div>
      )}
    </Panel>
  );
}
