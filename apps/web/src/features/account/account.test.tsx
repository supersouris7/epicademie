import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  FAKE_PASSWORD,
  FAKE_VERIFICATION_TOKEN,
  STUDENT_CODE,
  TAKEN_EMAIL,
  UNVERIFIED_EMAIL,
} from '../../testing/fakeApi.ts';
import { renderApp } from '../../testing/renderApp.tsx';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

/** Parcours du compte familial sur l'application complète et le faux serveur. */

describe('connexion de l’appareil', () => {
  it('sans session : toute page renvoie à la connexion ; mauvais puis bon mot de passe', async () => {
    const { user, server } = renderApp('/hub', { loggedIn: false });
    // Sans session : accueil « parent ou élève » ; le parent va à la connexion.
    expect(await screen.findByRole('heading', { name: 'Bienvenue !' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Je suis un parent' }));
    expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    await user.type(screen.getByLabelText('E-mail du parent'), 'parent@famille.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'pas le bon');
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('incorrect');
    await user.clear(screen.getByLabelText('Mot de passe'));
    await user.type(screen.getByLabelText('Mot de passe'), FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));
    // Retour à la page demandée.
    expect(await screen.findByRole('group', { name: 'Mon joueur' })).toBeInTheDocument();
    expect(server.calls.some((c) => c.path === '/auth/login')).toBe(true);
  });

  it('production — inscription : mot de passe trop court refusé, puis « vérifie ta boîte mail »', async () => {
    const { user, server } = renderApp('/inscription', { loggedIn: false, profiles: [] });
    await user.type(await screen.findByLabelText('E-mail du parent'), 'nouveau@famille.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'court');
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }));
    expect(screen.getByRole('alert')).toHaveTextContent('au moins 12 caractères');
    await user.type(screen.getByLabelText('Mot de passe'), ' et assez long maintenant');
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }));
    // Aucune session à l'inscription : il faut ouvrir le lien reçu par e-mail.
    expect(await screen.findByRole('heading', { name: 'Vérifie ta boîte mail' })).toBeInTheDocument();
    // Message identique que l'adresse soit libre ou déjà prise (pas d'énumération).
    expect(screen.getByRole('status')).toHaveTextContent('nouveau@famille.test');
    expect(screen.getByRole('status')).toHaveTextContent('Si l’adresse');
    expect(screen.getByRole('status')).toHaveTextContent('peut être utilisée');
    await user.click(screen.getByRole('button', { name: 'Renvoyer le lien' }));
    expect(await screen.findByText(/nouveau lien vient de partir/)).toBeInTheDocument();
    expect(server.calls.find((c) => c.path === '/auth/email/resend')?.body).toEqual({ email: 'nouveau@famille.test' });
  });

  it('lien reçu par e-mail : le mot de passe est exigé ; un mauvais mot de passe laisse réessayer', async () => {
    const { user, server } = renderApp(`/email/verification?jeton=${FAKE_VERIFICATION_TOKEN}`, {
      loggedIn: false,
      profiles: [],
    });
    // Le lien seul ne suffit pas : le mot de passe est exigé ; un mauvais mot de passe laisse réessayer.
    await user.type(await screen.findByLabelText('Mot de passe du compte'), 'pas le bon');
    await user.click(screen.getByRole('button', { name: 'Valider mon adresse' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ce n’est pas le mot de passe choisi à l’inscription.');
    expect(screen.getByRole('link', { name: /Mot de passe oublié/ })).toHaveAttribute('href', '/mot-de-passe-oublie');
    await user.clear(screen.getByLabelText('Mot de passe du compte'));
    await user.type(screen.getByLabelText('Mot de passe du compte'), FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Valider mon adresse' }));
    expect(await screen.findByRole('heading', { name: 'Nouveau joueur' })).toBeInTheDocument();
    expect(server.calls.filter((c) => c.path === '/auth/email/verify').at(-1)?.body).toEqual({
      token: FAKE_VERIFICATION_TOKEN,
      password: FAKE_PASSWORD,
    });
  });

  it('connexion refusée tant que l’adresse n’est pas validée : message clair et « Renvoyer le lien »', async () => {
    const { user, server } = renderApp('/connexion', { loggedIn: false });
    await user.type(await screen.findByLabelText('E-mail du parent'), UNVERIFIED_EMAIL);
    await user.type(screen.getByLabelText('Mot de passe'), FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('pas encore validée');
    await user.click(screen.getByRole('button', { name: 'Renvoyer le lien' }));
    await waitFor(() =>
      expect(server.calls.find((c) => c.path === '/auth/email/resend')?.body).toEqual({ email: UNVERIFIED_EMAIL }),
    );
  });

  it('lien déjà utilisé ou expiré : message, et demande d’un nouveau lien', async () => {
    const { user, server } = renderApp('/email/verification?jeton=ancien-jeton-0123456789abcdefghijk', {
      loggedIn: false,
    });
    await user.type(await screen.findByLabelText('Mot de passe du compte'), FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Valider mon adresse' }));
    expect(await screen.findByRole('heading', { name: 'Lien non valable' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('déjà été utilisé');
    await user.type(screen.getByLabelText('Ton e-mail'), 'moi@famille.test');
    await user.click(screen.getByRole('button', { name: 'Renvoyer le lien' }));
    await waitFor(() => expect(server.calls.some((c) => c.path === '/auth/email/resend')).toBe(true));
    // Le lien n'a été présenté qu'une fois au serveur (usage unique).
    expect(server.calls.filter((c) => c.path === '/auth/email/verify')).toHaveLength(1);
  });

  it('« Continuer avec Google » : proposé seulement si le serveur l’a configuré', async () => {
    const off = renderApp('/connexion', { loggedIn: false });
    await screen.findByLabelText('E-mail du parent');
    await waitFor(() => expect(off.server.calls.some((c) => c.path === '/auth/options')).toBe(true));
    expect(screen.queryByRole('link', { name: 'Continuer avec Google' })).not.toBeInTheDocument();
    off.unmount();
    renderApp('/inscription', { loggedIn: false, google: true });
    expect(await screen.findByRole('link', { name: 'Continuer avec Google' })).toHaveAttribute(
      'href',
      '/api/v1/auth/google/start',
    );
  });

  it('retour de Google en échec : message sur la page de connexion', async () => {
    renderApp('/connexion?erreur=google', { loggedIn: false });
    expect(await screen.findByRole('alert')).toHaveTextContent('Google impossible');
  });

  it('mot de passe oublié, puis nouveau mot de passe par le lien', async () => {
    const { user, server } = renderApp('/mot-de-passe-oublie', { loggedIn: false });
    await user.type(await screen.findByLabelText('E-mail du parent'), 'parent@famille.test');
    await user.click(screen.getByRole('button', { name: 'Recevoir le lien' }));
    expect(await screen.findByRole('status')).toHaveTextContent('valable une heure');
    expect(server.calls.some((c) => c.path === '/auth/password/forgot')).toBe(true);
  });

  it('lien de réinitialisation : nouveau mot de passe enregistré, retour à la connexion', async () => {
    const { user, server } = renderApp('/mot-de-passe/nouveau?jeton=abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG', {
      loggedIn: false,
    });
    await user.type(await screen.findByLabelText('Nouveau mot de passe'), 'un nouveau mot de passe');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(server.calls.find((c) => c.path === '/auth/password/reset')?.body).toMatchObject({
      token: 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFG',
    });
  });

  it('déconnexion de l’appareil depuis les paramètres', async () => {
    const { user, server } = renderApp('/parametres');
    await user.click(await screen.findByRole('button', { name: 'Déconnecter cet appareil' }));
    expect(await screen.findByRole('heading', { name: 'Bienvenue !' })).toBeInTheDocument();
    expect(server.calls.some((c) => c.path === '/auth/logout')).toBe(true);
  });
});

describe('verrou parent', () => {
  it('créer un profil demande le mot de passe du parent, puis se fait', async () => {
    const { user, server } = renderApp('/profils/nouveau', { parent: false });
    await user.type(await screen.findByPlaceholderText('Ex. Léa'), 'Noé');
    await user.click(screen.getByRole('button', { name: 'Un garçon' }));
    await user.type(screen.getByLabelText('Date de naissance'), '2014-03-09');
    await user.click(await screen.findByRole('button', { name: 'Oui' }));
    await user.click(screen.getByRole('button', { name: /C’est parti/ }));

    const gate = await screen.findByRole('dialog', { name: 'Espace parent' });
    await user.type(within(gate).getByLabelText(/Mot de passe/), 'faux');
    await user.click(within(gate).getByRole('button', { name: 'Ouvrir l’Espace parent' }));
    expect(await within(gate).findByRole('alert')).toHaveTextContent('incorrect');
    await user.clear(within(gate).getByLabelText(/Mot de passe/));
    await user.type(within(gate).getByLabelText(/Mot de passe/), FAKE_PASSWORD);
    await user.click(within(gate).getByRole('button', { name: 'Ouvrir l’Espace parent' }));

    await waitFor(() => expect([...server.profiles.values()].some((p) => p.name === 'Noé')).toBe(true));
    expect(screen.queryByRole('dialog', { name: 'Espace parent' })).not.toBeInTheDocument();
  });

  it('annuler la demande de mot de passe : rien n’est créé', async () => {
    const { user, server } = renderApp('/profils/nouveau', { parent: false });
    await user.type(await screen.findByPlaceholderText('Ex. Léa'), 'Noé');
    await user.click(screen.getByRole('button', { name: 'Un garçon' }));
    await user.type(screen.getByLabelText('Date de naissance'), '2014-03-09');
    await user.click(await screen.findByRole('button', { name: 'Oui' }));
    await user.click(screen.getByRole('button', { name: /C’est parti/ }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Espace parent' })).getByRole('button', { name: 'Annuler' }),
    );
    expect([...server.profiles.values()].some((p) => p.name === 'Noé')).toBe(false);
  });
});

describe('parcours de l’élève', () => {
  it('15 ans ou plus : compte complet, libellés adaptés (« Ton e-mail »)', async () => {
    const { user } = renderApp('/bienvenue', { loggedIn: false });
    await user.click(await screen.findByRole('button', { name: 'Je suis un élève' }));
    await user.type(screen.getByLabelText('Mon âge (en années)'), '16');
    await user.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(await screen.findByLabelText('Ton e-mail')).toBeInTheDocument();
  });

  it('âge invalide refusé ; moins de 15 ans : pseudo, classe, avatar, puis code à noter', async () => {
    const { user, server } = renderApp('/eleve', { loggedIn: false });
    await user.type(await screen.findByLabelText('Mon âge (en années)'), 'douze');
    await user.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(screen.getByRole('alert')).toHaveTextContent('en chiffres');
    await user.clear(screen.getByLabelText('Mon âge (en années)'));
    await user.type(screen.getByLabelText('Mon âge (en années)'), '12');
    await user.click(screen.getByRole('button', { name: 'Continuer' }));

    // Aucun champ e-mail ni mot de passe : pseudo, classe, avatar seulement.
    expect(await screen.findByLabelText('Ton pseudo')).toBeInTheDocument();
    expect(screen.queryByLabelText(/e-mail/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'C’est parti !' }));
    expect(screen.getByRole('alert')).toHaveTextContent('pseudo');
    await user.type(screen.getByLabelText('Ton pseudo'), 'Capucine');
    await user.click(screen.getByRole('button', { name: 'C’est parti !' }));
    expect(screen.getByRole('alert')).toHaveTextContent('classe');
    await user.click(screen.getByRole('radio', { name: '5e' }));
    await user.click(screen.getByRole('button', { name: 'C’est parti !' }));

    expect(await screen.findByRole('heading', { name: 'Note bien ton code' })).toBeInTheDocument();
    expect(screen.getByText(STUDENT_CODE)).toBeInTheDocument();
    expect(server.calls.find((c) => c.path === '/auth/student/signup')?.body).toMatchObject({
      name: 'Capucine',
      grade: '5e',
    });
    expect(JSON.stringify(server.calls.find((c) => c.path === '/auth/student/signup')?.body)).not.toMatch(
      /mail|password/,
    );
  });
});

describe('plateforme de test (recette)', () => {
  const recette = { loggedIn: false, recette: true } as const;

  it('« / » mène directement à « Se connecter », avec « Créer un compte » bien visible', async () => {
    renderApp('/', recette);
    expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Créer un compte' })).toHaveAttribute('href', '/inscription');
    expect(screen.queryByRole('button', { name: 'Je suis un élève' })).not.toBeInTheDocument();
  });

  it('/bienvenue et le parcours élève autonome sont masqués', async () => {
    for (const path of ['/bienvenue', '/eleve', '/eleve/code']) {
      const view = renderApp(path, recette);
      expect(await screen.findByRole('heading', { name: 'Connexion' })).toBeInTheDocument();
      view.unmount();
    }
  });

  it('inscription : 8 caractères suffisent, compte actif et connecté, aucun message sur un lien ou une boîte mail', async () => {
    const { user, server } = renderApp('/inscription', { ...recette, profiles: [] });
    await user.type(await screen.findByLabelText('E-mail du parent'), 'nouveau@famille.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'court');
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }));
    expect(screen.getByRole('alert')).toHaveTextContent('au moins 8 caractères');
    await user.type(screen.getByLabelText('Mot de passe'), '1234');
    expect(screen.getByRole('link', { name: 'Se connecter' })).toHaveAttribute('href', '/connexion');
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }));
    expect(await screen.findByRole('heading', { name: 'Nouveau joueur' })).toBeInTheDocument();
    expect(server.calls.some((c) => c.path === '/auth/email/resend')).toBe(false);
    expect(document.body).not.toHaveTextContent(/lien|boîte mail|valid/i);
  });

  it('adresse déjà utilisée : message clair', async () => {
    const { user } = renderApp('/inscription', recette);
    await user.type(await screen.findByLabelText('E-mail du parent'), TAKEN_EMAIL);
    await user.type(screen.getByLabelText('Mot de passe'), 'huit caractères au moins');
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Cette adresse a déjà un compte : connectez-vous.');
  });

  it('mot de passe oublié : consigne à la place du formulaire', async () => {
    renderApp('/mot-de-passe-oublie', recette);
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Plateforme de test : demandez votre nouveau mot de passe à l’administrateur qui vous a fourni les accès.',
    );
    expect(screen.queryByRole('button', { name: /Recevoir/ })).not.toBeInTheDocument();
  });
});

describe('production : accueil et mot de passe', () => {
  it('le bouton « Créer un compte » de recette n’existe pas ; la longueur vient du serveur', async () => {
    const { user } = renderApp('/inscription', { loggedIn: false, passwordMinLength: 14 });
    await user.type(await screen.findByLabelText('E-mail du parent'), 'a@famille.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'douze car. 12');
    await user.click(screen.getByRole('button', { name: 'Créer le compte' }));
    expect(screen.getByRole('alert')).toHaveTextContent('au moins 14 caractères');
    expect(screen.queryByRole('link', { name: 'Se connecter' })).not.toBeInTheDocument();
  });
});

describe('afficher / masquer le mot de passe', () => {
  it('connexion et inscription : bouton accessible qui bascule le champ', async () => {
    for (const path of ['/connexion', '/inscription']) {
      const { user, unmount } = renderApp(path, { loggedIn: false });
      const field = await screen.findByLabelText('Mot de passe');
      expect(field).toHaveAttribute('type', 'password');
      const toggle = screen.getByRole('button', { name: /Afficher le mot de passe/ });
      expect(toggle).toHaveAttribute('aria-pressed', 'false');
      await user.click(toggle);
      expect(field).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /Masquer le mot de passe/ })).toHaveAttribute('aria-pressed', 'true');
      unmount();
    }
  });
});
