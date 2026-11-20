import { screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LearningReport } from '@questeo/shared';
import { emptyLearning, FAKE_PASSWORD } from '../../testing/fakeApi.ts';
import { renderApp } from '../../testing/renderApp.tsx';
import { weeklySummary, weekBars } from './summary.ts';

vi.mock('socket.io-client', async () => (await import('../../testing/fakeSocket.ts')).socketModule);

const tally = (answered: number, autonomous: number, helped = 0, collective = 0) => ({
  answered,
  autonomous,
  helped,
  hints: helped,
  collective,
});
const week = (date: string, t: ReturnType<typeof tally>) => ({
  week: date,
  tally: t,
  modes: ['entrainement' as const],
});

/** Enfant qui a joué : une notion à retravailler, une acquise, deux semaines d'activité. */
const report: LearningReport = {
  ...emptyLearning(),
  tally: tally(14, 9, 2),
  lastActivity: '2026-11-19T17:00:00.000Z',
  subjects: [
    {
      subject: 'maths',
      tally: tally(14, 9, 2),
      statuses: { 'non-commencee': 0, 'a-travailler': 1, 'en-progression': 0, 'a-consolider': 0, acquise: 1 },
    },
  ],
  chapters: [
    {
      chapterId: 'm5-calcul',
      subject: 'maths',
      tally: tally(14, 9, 2),
      statuses: { 'non-commencee': 0, 'a-travailler': 1, 'en-progression': 0, 'a-consolider': 0, acquise: 1 },
    },
  ],
  skills: [
    {
      skillId: 'm5-priorites',
      chapterId: 'm5-calcul',
      subject: 'maths',
      status: 'a-travailler',
      tally: tally(6, 2, 2),
      recentRate: 0.33,
      trend: 'baisse',
      lastPracticed: '2026-11-19T17:00:00.000Z',
      nextReview: '2026-11-20',
      recurringErrors: [{ text: 'La multiplication passe avant l’addition.', count: 3 }],
    },
    {
      skillId: 'm5-tables',
      chapterId: 'm5-calcul',
      subject: 'maths',
      status: 'acquise',
      tally: tally(8, 7),
      recentRate: 0.9,
      trend: 'stable',
      lastPracticed: '2026-11-18T17:00:00.000Z',
      nextReview: '2026-12-18',
      recurringErrors: [],
    },
  ],
  toRework: ['m5-priorites'],
  dueReviews: ['m5-priorites'],
  weeks: [week('2026-11-09', tally(4, 1)), week('2026-11-16', tally(10, 8, 2, 1))],
};

describe('lecture du suivi pour un parent', () => {
  it('bilan de la semaine en phrases, comparé à la semaine précédente', () => {
    const { lines } = weeklySummary(report);
    expect(lines).toEqual([
      '10 questions cette semaine, dont 8 réussies sans aide.',
      '2 réussites avec un indice ou au second essai.',
      'Plus de réussites sans aide que la semaine dernière : bravo !',
      '1 réponse données en équipe (non comptées dans sa progression).',
    ]);
    expect(weeklySummary(emptyLearning()).lines).toEqual(['Pas encore de séance cette semaine.']);
  });

  it('histogramme : hauteur relative à la semaine la plus remplie', () => {
    expect(weekBars(report).map((b) => b.height)).toEqual([0.4, 1]);
  });
});

describe('espace parent', () => {
  it('mot de passe demandé, puis carte de chaque enfant et détail', async () => {
    const { user } = renderApp('/parent', { parent: false, learning: report });
    await user.type(await screen.findByLabelText('Mot de passe'), FAKE_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Ouvrir l’espace parent' }));
    const card = await screen.findByRole('listitem', { name: 'Progrès de Léa' });
    expect(card).toHaveTextContent('Matières travaillées : Maths');
    expect(card).toHaveTextContent('À retravailler : Priorités opératoires');
    await user.click(within(card).getByRole('link', { name: /Voir le détail/ }));
    expect(await screen.findByRole('heading', { name: 'Bilan de la semaine' })).toBeInTheDocument();
    await user.click(screen.getByText(/Maths —/));
    expect(screen.getByText(/Erreur fréquente : La multiplication/)).toBeInTheDocument();
    expect(screen.getByText(/en baisse/)).toBeInTheDocument();
  });

  it('séance ciblée : les notions choisies deviennent une série pour l’enfant', async () => {
    const { user, server } = renderApp('/parent/11111111-1111-4111-8111-111111111111', { learning: report });
    const box = await screen.findByRole('checkbox', { name: /Priorités opératoires/ });
    expect(box).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Lancer la séance pour Léa' }));
    await screen.findByRole('progressbar', { name: 'Progression de la série' });
    expect(server.calls.find((c) => c.path === '/sessions')?.body).toMatchObject({
      chapterId: 'seance',
      skillId: 'm5-priorites',
    });
  });
});
