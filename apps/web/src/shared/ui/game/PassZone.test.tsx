import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PassZone } from './PassZone.tsx';

afterEach(() => vi.useRealTimers());

describe('PassZone', () => {
  it('a le focus, ignore le toucher trop rapide, puis passe au toucher', async () => {
    vi.useFakeTimers();
    const onPass = vi.fn();
    render(<PassZone onPass={onPass} />);
    const zone = screen.getByRole('button', { name: 'Passer' });
    expect(zone).toHaveFocus();
    fireEvent.click(zone);
    expect(onPass).not.toHaveBeenCalled();
    await act(() => vi.advanceTimersByTimeAsync(700));
    fireEvent.click(zone);
    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('un changement d’étape relance le délai', async () => {
    vi.useFakeTimers();
    const onPass = vi.fn();
    const { rerender } = render(<PassZone onPass={onPass} step="a" />);
    await act(() => vi.advanceTimersByTimeAsync(700));
    rerender(<PassZone onPass={onPass} step="b" />);
    fireEvent.click(screen.getByRole('button', { name: 'Passer' }));
    expect(onPass).not.toHaveBeenCalled();
  });
});
