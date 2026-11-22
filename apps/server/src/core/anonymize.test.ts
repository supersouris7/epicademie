import { describe, expect, it } from 'vitest';
import { anonymizeText } from './anonymize.ts';

describe('anonymisation des textes libres', () => {
  it('masque e-mails, liens et numéros de téléphone', () => {
    const out = anonymizeText(
      'écris à maman.dupont@mail.fr ou appelle le 06 12 34 56 78 / +33 6 12 34 56 78, voir https://x.fr/a?b=1 et www.site.com',
    );
    expect(out).toBe('écris à [masqué] ou appelle le [masqué] / [masqué], voir [masqué] et [masqué]');
  });

  it('masque les prénoms de la famille (casse et accents ignorés, mots entiers seulement)', () => {
    const names = ['Léa', 'Jean-Paul'];
    expect(anonymizeText('LEA a dit que Lea et léa… Paul aussi, mais Leader non', names)).toBe(
      '[masqué] a dit que [masqué] et [masqué]… [masqué] aussi, mais Leader non',
    );
  });

  it('laisse intact un texte sans donnée personnelle (nombres courts compris)', () => {
    expect(anonymizeText('6 × 7 = 42, pas 43 (page 12)', ['Zoé'])).toBe('6 × 7 = 42, pas 43 (page 12)');
  });
});
