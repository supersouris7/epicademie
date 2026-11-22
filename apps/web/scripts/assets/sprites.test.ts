// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { JOBS, type Job } from './sprites.ts';

const targetsOf = (job: Job): readonly string[] => (job.kind === 'anim' ? [job.target] : job.targets);

describe('orientation du Sorcier π (ticket 62)', () => {
  const jobs = JOBS.filter((j) => targetsOf(j).some((t) => t.startsWith('bosses/sorcier-pi/')));

  it('couvre animation, poses, têtes et portrait', () => {
    const all = jobs.flatMap(targetsOf);
    for (const part of [
      'anim-idle',
      'pose-idle',
      'pose-hurt',
      'pose-defeat',
      'head-menace',
      'head-rage-cri',
      'portrait',
    ]) {
      expect(all).toContain(`bosses/sorcier-pi/${part}`);
    }
  });

  it("aucune planche du Sorcier π n'est retournée : toutes sont dessinées tournées vers le héros", () => {
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    for (const job of jobs) expect(job.mirror ?? false, job.board).toBe(false);
  });
});
