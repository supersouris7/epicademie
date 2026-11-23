import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { assetSrc } from '../../design/assets.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

describe('ConfirmDialog : menu Pause', () => {
  it('chaque bouton, dont « Recommencer », a une icône livrée', () => {
    render(
      <ConfirmDialog
        title="Pause"
        message="Une pause ?"
        confirm="Quitter la partie"
        cancel="Reprendre"
        extra={{ label: 'Recommencer', onClick: () => undefined }}
        onConfirm={() => undefined}
        onCancel={() => undefined}
      />,
    );
    for (const name of ['Reprendre', 'Recommencer', 'Quitter la partie']) {
      expect(screen.getByRole('button', { name }).querySelector('img'), name).not.toBeNull();
    }
  });

  it("l'icône de « Recommencer » est celle des autres boutons de relance (retry)", () => {
    render(
      <ConfirmDialog
        title="Pause"
        message="m"
        confirm="Quitter"
        cancel="Reprendre"
        extra={{ label: 'Recommencer', onClick: () => undefined }}
        onConfirm={() => undefined}
        onCancel={() => undefined}
      />,
    );
    const retry = assetSrc('icons-navigation-retry');
    expect(retry).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Recommencer' }).querySelector('img')?.getAttribute('src')).toBe(retry);
  });
});
