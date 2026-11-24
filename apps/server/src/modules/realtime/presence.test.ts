import { describe, expect, it } from 'vitest';
import type { Profile } from '@epicademie/shared';
import { createPresence, type PlayerSocket } from './presence.ts';

const socket = () => ({ connected: true, emit: () => true }) as unknown as PlayerSocket;
const player = (id: string, name: string) =>
  ({ id, name, hero: 'alex', avatar: { style: 'portrait', seed: '07' } }) as unknown as Profile;

describe('présence : famille et amis', () => {
  it('chacun voit sa famille et ses amis actifs, jamais les autres enfants', () => {
    const p = createPresence();
    p.join(socket(), player('lea', 'Léa'), 'f1', ['tom']);
    p.join(socket(), player('zoe', 'Zoé'), 'f1');
    p.join(socket(), player('tom', 'Tom'), 'f2', ['lea']);
    p.join(socket(), player('max', 'Max'), 'f3');
    const names = (id: string) => p.visibleTo(id, () => false).map((x) => `${x.name}${x.friend ? ' (ami)' : ''}`);
    expect(names('lea')).toEqual(['Léa', 'Zoé', 'Tom (ami)']);
    expect(names('tom')).toEqual(['Léa (ami)', 'Tom']);
    expect(names('max')).toEqual(['Max']);
    expect(p.linked('lea', 'tom')).toBe(true);
    expect(p.linked('lea', 'max')).toBe(false);
    expect(p.linked('zoe', 'tom')).toBe(false);
  });

  it('amitié retirée : plus visibles, et la passerelle est prévenue', () => {
    const p = createPresence();
    p.join(socket(), player('lea', 'Léa'), 'f1', ['tom']);
    p.join(socket(), player('tom', 'Tom'), 'f2', ['lea']);
    let changes = 0;
    p.onChanged(() => changes++);
    p.setFriends('lea', []);
    p.setFriends('tom', []);
    p.changed();
    expect(p.linked('lea', 'tom')).toBe(false);
    expect(changes).toBe(1);
  });
});
