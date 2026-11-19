import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTimers } from './timers.ts';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function Probe({ onTick }: { readonly onTick: () => void }) {
  const later = useTimers();
  later(1000, onTick);
  return null;
}

describe('useTimers', () => {
  it('exécute l’action après le délai', () => {
    const tick = vi.fn();
    render(<Probe onTick={tick} />);
    act(() => void vi.advanceTimersByTime(1000));
    expect(tick).toHaveBeenCalled();
  });

  it('annule les actions en attente quand le composant disparaît', () => {
    const tick = vi.fn();
    const { unmount } = render(<Probe onTick={tick} />);
    unmount();
    act(() => void vi.advanceTimersByTime(5000));
    expect(tick).not.toHaveBeenCalled();
  });
});
