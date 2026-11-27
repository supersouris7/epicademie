import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AdminErrorBoundary } from './AdminErrorBoundary.tsx';

describe('barrière d’erreur de la console', () => {
  it('écran de secours au thème de la console', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal('fetch', () => Promise.reject(new Error('hors ligne')));
    const Broken = () => {
      throw new Error('panne');
    };
    render(
      <AdminErrorBoundary>
        <Broken />
      </AdminErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-pilot-bg');
    expect(screen.getByRole('button', { name: 'Recharger' })).toBeInTheDocument();
    vi.restoreAllMocks();
  });
});
