import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SubjectIcon } from './SubjectIcon.tsx';

describe('SubjectIcon', () => {
  it('expose la progression des boss dans son libellé', () => {
    render(<SubjectIcon subject="maths" name="Maths" won={2} max={5} size={48} />);
    expect(screen.getByRole('img', { name: '2 boss vaincus sur 5 en Maths' })).toBeTruthy();
  });

  it('remplit la relique du bas vers le haut selon les boss vaincus', () => {
    const { container } = render(<SubjectIcon subject="maths" name="Maths" won={1} max={4} />);
    const filled = container.querySelector<HTMLElement>('[style*="clip-path"]');
    expect(filled?.style.clipPath).toBe('inset(75% 0px 0px)');
  });

  it('reste grise mais lisible sans boss (matière à venir)', () => {
    const { container } = render(<SubjectIcon subject="espagnol" name="Espagnol" won={0} max={0} />);
    expect(screen.getByRole('img', { name: '0 boss vaincus sur 0 en Espagnol' })).toBeTruthy();
    expect(container.querySelector('.grayscale')).not.toBeNull();
    expect(container.querySelector<HTMLElement>('[style*="clip-path"]')?.style.clipPath).toBe('inset(100% 0px 0px)');
  });
});
