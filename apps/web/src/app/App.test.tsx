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

  it('mon héros : Alex et Lina débloqués dès le début, on peut changer', async () => {
    renderApp('/heros');
    expect(await screen.findByRole('heading', { name: 'Mon héros' })).toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: /Lina/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /Alex/ })).not.toBeChecked();
    // Plus de « collection » : un simple choix entre les héros.
    expect(screen.getByRole('heading', { name: 'Choisis ton héros' })).toBeInTheDocument();
  });
});

describe('accueil et choix du jeu', () => {
  it('hub : joueur, modes, navigation, connexion temps réel', async () => {
    const { user } = renderApp('/hub');
    expect(await screen.findByRole('group', { name: 'Mon joueur' })).toHaveTextContent('Léa');
    expect(sockets.at(-1)?.auth).toEqual({ profileId: makeProfile().id });
    await user.click(screen.getByRole('button', { name: /Entraînement/ }));
    // Même présentation que le Mode Histoire : accroche sur la bannière, encart d'information, plus de Questy.
    expect(await screen.findByText('Entraîne-toi, gagne des médailles et des coffres !')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/Une série sans faute t’offre un coffre/);
    expect(screen.getByRole('button', { name: /Notions acquises en Maths|Maths/ })).toBeInTheDocument();
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

  it('combat de boss : l’Empereur en deux temps, puis la matière, le Sorcier π et le choix du chapitre', async () => {
    const { user } = renderApp('/jouer/boss');
    const pass = () => new Promise((r) => setTimeout(r, 700)); // anti double-toucher
    const emperor = await screen.findByRole('dialog', { name: 'L’Empereur du Savoir' });
    expect(within(emperor).getByRole('status')).toHaveTextContent(/protègent le savoir de toutes les matières/);
    await pass();
    await user.click(within(emperor).getByRole('button', { name: 'Passer' }));
    expect(await within(emperor).findByText(/avec ce savoir, je vais conquérir le monde/)).toBeInTheDocument();
    await pass();
    await user.click(within(emperor).getByRole('button', { name: 'Passer' }));
    expect(screen.queryByRole('dialog', { name: 'L’Empereur du Savoir' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('button', { name: 'Maths' }));
    const closeUp = await screen.findByRole('dialog', { name: /te provoque/ });
    await pass();
    await user.click(within(closeUp).getByRole('button', { name: 'Passer' }));
    expect(await screen.findByRole('heading', { name: 'Mode Histoire' })).toBeInTheDocument();
  });

  it('liste des boss : équipement depuis la réserve', async () => {
    const { user, server } = renderApp('/jouer/boss/maths?classe=5e', {
      inventory: { bouclier: 1, soin: 0, indice: 0 },
    });
    expect(await screen.findByRole('heading', { name: 'Équipe-toi pour ce combat' })).toBeInTheDocument();
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
    expect(await screen.findByRole('button', { name: /Duels/ })).toBeInTheDocument();
  });
});

describe('suivi et réglages', () => {
  it('progrès : résumé par matière, puis le détail (domaines repliés), et les badges à part', async () => {
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
    // Résumé : une barre par matière ; un toucher ouvre le détail.
    await user.click(await screen.findByRole('button', { name: /^Maths : 1 notions médaillées/ }));
    const domain = await screen.findByRole('button', { name: /^Nombres et calculs/ });
    expect(domain).toHaveAttribute('aria-expanded', 'false');
    await user.click(domain);
    expect(await screen.findByRole('heading', { name: 'Calcul mental' })).toBeInTheDocument();
    // Badges : grade atteint et prochain objectif, sur leur page.
    await user.click(screen.getByRole('button', { name: 'Retour' }));
    await user.click(await screen.findByRole('button', { name: /Trophées, badges et inventaire/ }));
    expect(await screen.findByRole('listitem', { name: 'Badge Chasseur de boss : Bronze' })).toHaveTextContent('2 / 5');
    expect(screen.getByRole('listitem', { name: 'Badge Persévérant : pas encore gagné' })).toBeInTheDocument();
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
