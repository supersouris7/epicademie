import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SkillProgress } from '@epicademie/shared';
import { renderApp } from '../../testing/renderApp.tsx';
import { ago } from '../../shared/lib/dates.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const state = (skillId: string, best: number): SkillProgress => ({
  skillId,
  stage: 2,
  due: null,
  attempts: 4,
  correct: 4,
  recent: [true],
  maintained: 0,
  best,
  lastPracticed: '2026-11-20',
});

describe('Mes progrès : le chemin parcouru', () => {
  it('comparaison à soi : avant et maintenant, efforts de la semaine, reprise après une pause', async () => {
    renderApp('/progres', {
      journey: {
        today: '2026-11-20',
        gains: [
          {
            skillId: 'm6-rang',
            before: { day: '2026-11-06', correct: 4, answered: 10 },
            now: { day: '2026-11-20', correct: 8, answered: 10 },
          },
        ],
        effort: { series: 3, days: 2, reworked: ['m6-rang'], pauseDays: 12 },
      },
    });
    const path = await screen.findByRole('region', { name: 'Ton chemin' });
    expect(within(path).getByRole('listitem')).toHaveTextContent(
      'Valeur d’un chiffre selon son rangIl y a 2 semaines : 4/10 → Aujourd’hui : 8/10',
    );
    const effort = screen.getByRole('region', { name: 'Tes efforts de la semaine' });
    expect(effort).toHaveTextContent('Te revoilà après 12 jours : content de te revoir !');
    expect(effort).toHaveTextContent('3 séries terminées · 2 jours d’entraînement');
    expect(effort).toHaveTextContent('1 notion retravaillée après un « pas encore »');
    // Jamais de comparaison à d'autres enfants.
    expect(document.body).not.toHaveTextContent(/classement|meilleurs? joueurs?|rang parmi/i);
  });

  it('ce que tu sais maintenant faire : notions en or ou diamant avec leur sens, le diamant mis en avant', async () => {
    const { user } = renderApp('/progres', {
      skills: [
        state('m6-rang', 5),
        state('m6-arrondir', 6),
        state('m6-encadrer', 4),
        ...['m6-add-decimaux', 'm6-fois-10', 'm6-cercle', 'm6-solides'].map((id) => state(id, 5)),
      ],
    });
    const list = await screen.findByRole('list', { name: 'Ce que tu sais maintenant faire' });
    const first = await within(list).findAllByRole('listitem');
    expect(first).toHaveLength(5);
    expect(first[0]).toHaveTextContent('Arrondir un décimal');
    expect(first[0]).toHaveTextContent(/Maîtrisée seul/);
    expect(first[0]).toHaveTextContent(/À quoi ça sert/);
    expect(within(list).queryByText('Encadrer, intercaler, droite graduée')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tout voir (6)' }));
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
  });

  it('au début : des invitations, sans reproche', async () => {
    renderApp('/progres');
    expect(await screen.findByText('Une première série et ton compteur démarre.')).toBeInTheDocument();
    expect(screen.getByText(/tu verras le chemin parcouru/)).toBeInTheDocument();
    expect(screen.getByText(/Ta première notion en or ou en diamant/)).toBeInTheDocument();
  });

  it('ancienneté en mots', () => {
    expect(
      ['2026-11-20', '2026-11-19', '2026-11-12', '2026-11-06', '2026-09-01'].map((d) => ago(d, '2026-11-20')),
    ).toEqual(['Aujourd’hui', 'Hier', 'Il y a 8 jours', 'Il y a 2 semaines', 'Il y a 2 mois']);
  });
});

describe('ouverture d’un chapitre', () => {
  it('« Pourquoi apprendre ça ? » : deux phrases de sens, sans clic', async () => {
    renderApp('/jouer/entrainement/maths/m6-numeration');
    const why = await screen.findByRole('region', { name: 'Pourquoi apprendre ça ?' });
    expect(within(why).getByText(/Avec un boulier ou un abaque/)).toBeInTheDocument();
    expect(within(why).getByText('Un peu d’histoire')).toBeInTheDocument();
  });

  it('rien pour un chapitre sans sens', async () => {
    renderApp('/jouer/entrainement/maths/m5-calcul');
    expect(await screen.findByRole('button', { name: /Épreuve du chapitre/ })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Pourquoi apprendre ça ?' })).not.toBeInTheDocument();
  });
});
