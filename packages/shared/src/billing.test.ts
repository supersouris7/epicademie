import { describe, expect, it } from 'vitest';
import { premiumEndFor } from './billing.ts';

describe('fin de l’accès payé', () => {
  it('l’année scolaire en cours, ou la suivante si elle se termine trop tôt', () => {
    expect(premiumEndFor('2026-11-20', '08-31', 60)).toBe('2027-08-31');
    expect(premiumEndFor('2027-08-15', '08-31', 60)).toBe('2028-08-31');
    expect(premiumEndFor('2027-06-01', '08-31', 60)).toBe('2027-08-31');
    expect(premiumEndFor('2027-07-15', '08-31', 60)).toBe('2028-08-31');
    expect(premiumEndFor('2026-11-20', '07-05', 30)).toBe('2027-07-05');
  });
});
