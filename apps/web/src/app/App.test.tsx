import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeProfile } from '../testing/fakeApi.ts';
import { renderApp } from '../testing/renderApp.tsx';
import { sockets } from '../testing/fakeSocket.ts';

vi.mock('socket.io-client', async () => (await import('../testing/fakeSocket.ts')).socketModule);

/**
 * Parcours des écrans hors partie, sur l'application complète et le faux serveur : chaque écran
 * s'affiche avec ses données, et les actions principales envoient la bonne requête.
 */

describe('profils', () => {
  it('choix du joueur : la liste vient du serveur', async () => {
    const { user } = renderApp('/', { profileId: null });
    expect(await screen.findByRole('heading', { name: 'Academy Fighters' })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /Léa/ }));
    expect(await screen.findByRole('group', { name: 'Mon joueur' })).toHaveTextContent('Léa');
  });

  it('nouveau joueur : champs obligatoires, classe proposée selon l’âge, création', async () => {
    const { user, server } = renderApp('/profils/nouveau', { profileId: null });
    const go = await screen.findByRole('button', { name: /C’est parti/ });
    await user.click(go);
    expect(screen.getByRole('alert')).toHaveTextContent('Le prénom est obligatoire');
    await user.type(screen.getByPlaceholderText('Ex. Léa'), 'Noé');
    await user.click(screen.getByRole('button', { name: 'Un garçon' }));
    await user.type(screen.getByLabelText('Date de naissance'), '2014-03-09');
    expect(await screen.findByText('Tu es en 5e ?')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Oui' }));
    await user.click(go);
    await waitFor(() => expect(server.calls.some((c) => c.method === 'POST' && c.path === '/profiles')).toBe(true));
    expect(await screen.findByRole('group', { name: 'Mon joueur' })).toHaveTextContent('Noé');
  });

  it('modification d’un profil existant', async () => {
    const { user, server } = renderApp(`/profils/${makeProfile().id}/modifier`);
    const name = await screen.findByPlaceholderText('Ex. Léa');
    await waitFor(() => expect(name).toHaveValue('Léa'));
    await user.clear(name);
    await user.type(name, 'Léna');
    await user.click(screen.getByRole('button', { name: /Enregistrer|C’est parti/ }));
    await waitFor(() => expect(server.calls.some((c) => c.method === 'PATCH')).toBe(true));
  });

  it('profil inconnu : retour au choix du joueur', async () => {
    renderApp('/hub', { profileId: '99999999-9999-4999-8999-999999999999' });
    expect(await screen.findByRole('heading', { name: 'Academy Fighters' })).toBeInTheDocument();
  });

  it('serveur injoignable : on peut réessayer', async () => {
    renderApp('/hub', {
      setup: (server) =>
        server.override('getProfile', () => {
          throw new Error('panne');
        }),
    });
    expect(await screen.findByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
    expect(screen.getByText(/joindre le serveur/)).toBeInTheDocument();
  });

  it('mon héros : collection (héros de départ), les autres sont à trouver dans les coffres', async () => {
    renderApp('/heros');
    expect(await screen.findByRole('heading', { name: 'Mon héros' })).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /Lina/ })).toBeChecked();
    expect(screen.getByRole('img', { name: 'Alex, à trouver dans un coffre' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /Alex/ })).not.toBeInTheDocument();
    expect(screen.getByText(/1 sur 2 trouvés/)).toBeInTheDocument();
  });
});

describe('accueil et choix du jeu', () => {
  it('hub : joueur, modes, navigation, connexion temps réel', async () => {
    const { user } = renderApp('/hub');
    expect(await screen.findByRole('group', { name: 'Mon joueur' })).toHaveTextContent('Léa');
    expect(sockets.at(-1)?.auth).toEqual({ profileId: makeProfile().id });
    await user.click(screen.getByRole('button', { name: /Entraînement/ }));
    expect(await screen.findByText(/C’est ici que tu gagnes ton/)).toBeInTheDocument();
  });

  it('entraînement : matières, chapitres de la classe, notions', async () => {
    const { user } = renderApp('/jouer/entrainement/maths');
    expect(await screen.findByRole('heading', { name: /Entraînement · Maths/ })).toBeInTheDocument();
    const grades = screen.getByRole('radiogroup', { name: 'Classe' });
    expect(within(grades).getByRole('radio', { name: /5e/ })).toHaveAttribute('aria-checked', 'true');
    await user.click(within(grades).getByRole('radio', { name: /6e/ }));
    await user.click((await screen.findAllByRole('button', { name: /Nombres entiers et décimaux/ })).at(-1)!);
    expect(await screen.findByRole('heading', { name: /Nombres entiers et décimaux/ })).toBeInTheDocument();
  });

  it('combat de boss : le choix de la matière, puis le Sorcier π et le choix du chapitre', async () => {
    const { user } = renderApp('/jouer/boss');
    await user.click(await screen.findByRole('button', { name: 'Maths' }));
    const closeUp = await screen.findByRole('dialog', { name: /te provoque/ });
    await user.click(within(closeUp).getByRole('button', { name: 'Passer' }));
    expect(await screen.findByRole('heading', { name: 'Combat de boss' })).toBeInTheDocument();
  });

  it('liste des boss : équipement depuis la réserve', async () => {
    const { user, server } = renderApp('/jouer/boss/maths?classe=5e', {
      inventory: { bouclier: 1, soin: 0, indice: 0 },
    });
    expect(await screen.findByRole('heading', { name: /Équipement/ })).toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: /^Bouclier × 1 en réserve/ }));
    await waitFor(() => expect(server.calls.some((c) => c.method === 'PUT')).toBe(true));
    expect(await screen.findByRole('button', { name: /Bouclier équipé/ })).toBeInTheDocument();
  });

  it('boutique : achat d’un objet', async () => {
    const { user, server } = renderApp('/shop');
    const buttons = await screen.findAllByRole('button', { name: /Acheter/ });
    await user.click(buttons[0]!);
    await waitFor(() => expect(server.calls.some((c) => c.path === '/shop')).toBe(true));
  });

  it('modes à plusieurs et joueurs connectés', async () => {
    renderApp('/multi');
    expect(await screen.findByRole('button', { name: /Arène/ })).toBeInTheDocument();
  });
});

describe('suivi et réglages', () => {
  it('progrès : domaines repliés, un toucher les ouvre', async () => {
    const { user } = renderApp('/progres', {
      skills: [
        {
          skillId: 'm5-tables',
          stage: 3,
          due: null,
          lastPracticed: '2026-11-19',
          attempts: 10,
          correct: 9,
          recent: [true, true],
          maintained: 1,
          best: 5,
        },
      ],
    });
    // Badges : grade atteint et prochain objectif.
    expect(await screen.findByRole('listitem', { name: 'Badge Chasseur de boss : Bronze' })).toHaveTextContent('2 / 5');
    expect(screen.getByRole('listitem', { name: 'Badge Persévérant : pas encore gagné' })).toBeInTheDocument();
    const domain = await screen.findByRole('button', { name: /^Nombres et calculs/ });
    expect(domain).toHaveAttribute('aria-expanded', 'false');
    await user.click(domain);
    expect(await screen.findByRole('heading', { name: 'Calcul mental' })).toBeInTheDocument();
  });

  it('paramètres : le son se coupe', async () => {
    const { user, server } = renderApp('/parametres');
    await user.click(await screen.findByRole('checkbox', { name: 'Effets sonores' }));
    await waitFor(() => expect(server.calls.some((c) => c.method === 'PATCH')).toBe(true));
  });

  it('à propos', async () => {
    renderApp('/a-propos');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('adresse inconnue : retour à l’accueil', async () => {
    renderApp('/nulle-part', { profileId: null });
    expect(await screen.findByRole('heading', { name: 'Academy Fighters' })).toBeInTheDocument();
  });
});
