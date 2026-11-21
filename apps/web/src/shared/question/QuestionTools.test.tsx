import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CHAPTERS, generate, getSkill, type Question } from '@questeo/content';
import { QuestionTools } from './QuestionTools.tsx';

/**
 * Zone de réponse et outils d'une question : pavé, calculatrice (résultat envoyé dans la
 * réponse), brouillon (pleine page), tableau de conversion, clavier pour les réponses écrites.
 */

/** 1re question générée d'une notion qui vérifie `test`. */
function find(test: (q: Question) => boolean): Question {
  for (const chapter of CHAPTERS)
    for (const skill of chapter.skills)
      for (const level of [1, 2, 3] as const)
        for (let seed = 0; seed < 4; seed++) {
          const q = generate(skill.id, level, seed);
          if (test(q)) return q;
        }
  throw new Error('aucune question ne convient');
}

const tools = (question: Question, onSubmit = vi.fn()) => {
  render(
    <QuestionTools
      question={question}
      skill={getSkill(question.skillId)}
      advice={getSkill(question.skillId)?.advice}
      picked={null}
      onSubmit={onSubmit}
    />,
  );
  return { user: userEvent.setup(), onSubmit };
};

describe('outils de réponse', () => {
  it('pavé : saisie, effacement, envoi', async () => {
    const q = generate('m5-tables', 1, 1);
    const { user, onSubmit } = tools(q);
    await user.click(screen.getByRole('button', { name: '4' }));
    await user.click(screen.getByRole('button', { name: '2' }));
    await user.click(screen.getByRole('button', { name: 'Effacer' }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'number', text: '4' });
  });

  it('clavier physique : chiffres et Entrée, « ? » quand rien n’est saisi', async () => {
    const q = generate('m5-tables', 1, 1);
    const onUnknown = vi.fn();
    const onSubmit = vi.fn();
    render(
      <QuestionTools
        question={q}
        skill={getSkill(q.skillId)}
        picked={null}
        onSubmit={onSubmit}
        onUnknown={onUnknown}
      />,
    );
    const user = userEvent.setup();
    await user.keyboard('?');
    expect(onUnknown).toHaveBeenCalledOnce();
    await user.keyboard('42{Enter}');
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'number', text: '42' });
  });

  it('clavier physique : QCM avec 1, 2, 3… ou A, B, C…', async () => {
    const q = find((x) => x.answer.kind === 'choice' && x.answer.options.length >= 3);
    const { user, onSubmit } = tools(q);
    await user.keyboard('2');
    expect(onSubmit).toHaveBeenLastCalledWith({ kind: 'choice', index: 1 });
    await user.keyboard('c');
    expect(onSubmit).toHaveBeenLastCalledWith({ kind: 'choice', index: 2 });
  });

  it('clavier physique : fraction, « / » passe au dénominateur', async () => {
    const q = find((x) => x.answer.kind === 'fraction');
    const { user, onSubmit } = tools(q);
    await user.keyboard('3/4{Enter}');
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'fraction', num: '3', den: '4' });
  });

  it('calculatrice : calcul puis résultat envoyé dans la réponse', async () => {
    const q = generate('m5-disque', 1, 1);
    const { user } = tools(q);
    await user.click(screen.getByRole('tab', { name: 'Calculatrice' }));
    const panel = screen.getByRole('tabpanel');
    // Le pavé de réponse reste monté (masqué) : les touches de la calculatrice sont les dernières.
    for (const k of ['2', '×', '3', '=']) await user.click(within(panel).getAllByRole('button', { name: k }).at(-1)!);
    expect(panel).toHaveTextContent('6');
    await user.click(screen.getByRole('button', { name: /Envoyer 6 dans ma réponse/ }));
    expect(screen.getByRole('tab', { name: 'Répondre' })).toHaveAttribute('aria-selected', 'true');
  });

  it('brouillon : stylos, pleine page et retour', async () => {
    const q = generate('m5-disque', 1, 1);
    const { user } = tools(q);
    await user.click(screen.getByRole('tab', { name: 'Brouillon' }));
    expect(screen.getByRole('img', { name: /Zone de brouillon/ })).toBeInTheDocument();
    const pens = within(screen.getByRole('toolbar', { name: 'Outils du brouillon' })).getAllByRole('button');
    await user.click(pens[1]!);
    await user.click(screen.getByRole('button', { name: 'Pleine page' }));
    const full = screen.getByRole('dialog', { name: 'Brouillon pleine page' });
    await user.click(within(full).getByRole('button', { name: 'Réduire' }));
    expect(screen.queryByRole('dialog', { name: 'Brouillon pleine page' })).not.toBeInTheDocument();
  });

  it('tableau de conversion : chiffres et virgule placés, résultat envoyé', async () => {
    const q = find((x) => getSkill(x.skillId)?.tools?.some((t) => t.startsWith('conversion')) === true);
    const { user } = tools(q);
    const tab = screen.getAllByRole('tab').find((t) => /conversion/i.test(t.textContent));
    if (!tab) throw new Error('onglet de conversion absent');
    await user.click(tab);
    const panel = screen.getByRole('tabpanel');
    const cells = within(panel).getAllByRole('button', { name: /Case/ });
    await user.click(cells[0]!);
    await user.keyboard('5');
    await user.click(within(panel).getByRole('button', { name: 'Tout effacer' }));
    expect(panel).toBeInTheDocument();
  });

  it('réponse écrite : clavier avec lettres accentuées', async () => {
    const q = find((x) => x.answer.kind === 'text');
    const { user, onSubmit } = tools(q);
    const keyboard = screen.getByRole('group', { name: 'Clavier' });
    await user.click(within(keyboard).getByRole('button', { name: 'Majuscule' }));
    await user.click(within(keyboard).getByRole('button', { name: 'A' }));
    await user.click(within(keyboard).getByRole('button', { name: 'Espace' }));
    await user.click(within(keyboard).getByRole('button', { name: 'Effacer' }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ kind: 'text' }));
  });

  it('QCM : l’option déjà essayée est grisée', async () => {
    const q = find((x) => x.answer.kind === 'choice' && x.answer.options.length > 2);
    const onSubmit = vi.fn();
    render(
      <QuestionTools
        question={q}
        skill={getSkill(q.skillId)}
        picked={null}
        excluded={0}
        attempt={1}
        onSubmit={onSubmit}
      />,
    );
    const options = within(screen.getByRole('tabpanel')).getAllByRole('button');
    expect(options[0]).toBeDisabled();
    await userEvent.setup().click(options[1]!);
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'choice', index: 1 });
  });
});
