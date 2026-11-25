import { tlfi, academie, type Source } from '../../sources-outils.ts';

/** Sources de technologie (registre : `sources.ts` à la racine du paquet). */
export const SOURCES: readonly Source[] = [
  // ——— Technologie 5e (lot te-5e-01) ———
  {
    id: 'techno-c4-2024',
    title: 'Programme de technologie du cycle 4 (arrêté du 9 février 2024, BO n° 9 du 29 février 2024)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/bo/2024/Hebdo9/MENE2402802A',
    textDate: '2024-02-29',
    consultedOn: '2026-11-25',
  },
  {
    id: 'ecologie-indice-reparabilite',
    title: '« Indice de réparabilité »',
    publisher: 'Ministère de la Transition écologique',
    url: 'https://www.ecologie.gouv.fr/politiques-publiques/indice-reparabilite',
    textDate: '2026',
    consultedOn: '2026-11-25',
  },
  academie('ergonomie', 'ergonomie'),
  academie('cahier', 'cahier'),
  tlfi('besoin', 'besoin', 'besoin'),
  tlfi('usage', 'usage', 'usage'),
  tlfi('norme', 'norme', 'norme'),
  tlfi('label', 'label', 'label'),
  tlfi('securite', 'sécurité', 's%C3%A9curit%C3%A9'),
  tlfi('materiau', 'matériau', 'mat%C3%A9riau'),
  tlfi('aluminium', 'aluminium', 'aluminium'),
  tlfi('cuivre', 'cuivre', 'cuivre'),
  tlfi('thermoformage', 'thermoformage', 'thermoformage'),
  tlfi('pliage', 'pliage', 'pliage'),
  tlfi('usinage', 'usinage', 'usinage'),
  tlfi('percage', 'perçage', 'per%C3%A7age'),
  tlfi('souder', 'souder', 'souder'),
  tlfi('riveter', 'riveter', 'riveter'),
  tlfi('boulon', 'boulon', 'boulon'),
];
