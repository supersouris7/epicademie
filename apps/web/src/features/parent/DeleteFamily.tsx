import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { DELETE_CONFIRMATION, ParentPinSchema, type FamilyDelete } from '@epicademie/shared';
import { ApiError } from '../../shared/api/client.ts';
import { useSession } from '../../shared/lib/session.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { deleteFamily, exportFamily, useMe, useSetMe } from '../account/index.ts';
import { ParentCard, ParentPage } from './ParentShell.tsx';

/** Ce qui disparaît avec le compte (droit à l'effacement) : montré avant toute action. */
const ERASED = [
  'le compte du parent (adresse e-mail, mot de passe, code PIN) et les appareils connectés',
  'les profils des enfants (pseudo, avatar, classe, héros, objets et récompenses)',
  'toute la progression : notions, parties, réponses, épreuves, combats de boss, chapitres étudiés',
  'les amitiés avec d’autres familles',
  'l’abonnement et l’historique des paiements (un paiement en cours est annulé)',
  'les signalements de questions envoyés par la famille',
] as const;

/** Télécharge un fichier JSON construit dans le navigateur (rien n'est envoyé ailleurs). */
function saveJson(data: unknown): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'epicademie-donnees-famille.json';
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Suppression du compte famille : liste de ce qui sera effacé, téléchargement des données
 * d'abord, puis double confirmation (mot SUPPRIMER + mot de passe ou code PIN).
 */
export function DeleteFamily() {
  const navigate = useNavigate();
  const setMe = useSetMe();
  const selectProfile = useSession((s) => s.selectProfile);
  const { data: me } = useMe();
  const [downloaded, setDownloaded] = useState(false);
  const [word, setWord] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const byPin = me?.hasPin === true;

  const download = async () => {
    setError(null);
    try {
      saveJson(await exportFamily());
      setDownloaded(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Téléchargement impossible pour le moment.');
    }
  };
  const confirm = async () => {
    const pin = ParentPinSchema.safeParse(secret);
    const input: FamilyDelete = {
      confirmation: DELETE_CONFIRMATION,
      ...(byPin ? { pin: pin.success ? pin.data : secret } : { password: secret }),
    };
    setBusy(true);
    setError(null);
    try {
      await deleteFamily(input);
      selectProfile(null);
      setMe(null);
      void navigate('/bienvenue', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Suppression impossible pour le moment.');
      setBusy(false);
    }
  };
  const ready = word === DELETE_CONFIRMATION && secret !== '';
  return (
    <ParentPage title="Supprimer le compte famille" back={{ to: '/parent/reglages', label: 'Réglages' }}>
      <ParentCard title="Ce qui sera effacé" id="efface">
        <p>La suppression est définitive : personne ne pourra récupérer ces données, nous non plus.</p>
        <ul className="list-disc pl-5">
          {ERASED.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ParentCard>
      <ParentCard title="1. Garder une copie" id="copie">
        <p>Télécharge d’abord tes données (fichier JSON : compte, profils, progression).</p>
        <GameButton variant="surface" size="sm" className="self-start" onClick={() => void download()}>
          Télécharger les données
        </GameButton>
        {downloaded && <p role="status">Données téléchargées.</p>}
      </ParentCard>
      <ParentCard title="2. Confirmer la suppression" id="confirmer">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) void confirm();
          }}
        >
          <label className="flex flex-col gap-1 font-bold">
            Écris {DELETE_CONFIRMATION} pour confirmer
            <input
              autoComplete="off"
              className="bg-surface-2 rounded-xl px-3 py-2 font-normal"
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 font-bold">
            {byPin ? 'Code PIN parent' : 'Mot de passe du compte'}
            <input
              type="password"
              autoComplete={byPin ? 'off' : 'current-password'}
              inputMode={byPin ? 'numeric' : undefined}
              maxLength={byPin ? 4 : undefined}
              className="bg-surface-2 rounded-xl px-3 py-2 font-normal"
              value={secret}
              onChange={(e) => setSecret(byPin ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value)}
            />
          </label>
          {error && (
            <p role="alert" className="text-danger font-bold">
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <GameButton type="submit" variant="danger" size="sm" disabled={!ready || busy}>
              Supprimer définitivement
            </GameButton>
            <Link to="/parent/reglages" className="min-h-11 self-center font-bold underline">
              Annuler
            </Link>
          </div>
        </form>
      </ParentCard>
    </ParentPage>
  );
}
