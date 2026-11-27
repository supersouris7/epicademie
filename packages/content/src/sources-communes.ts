import { CONSULTED, CONSULTED_GE_CM2, tlfi, type Source } from './sources-outils.ts';

/** Sources communes à plusieurs matières (registre : `sources.ts` à la racine du paquet). */
export const SOURCES: readonly Source[] = [
  {
    id: 'cycle3-2020',
    title: 'Programme du cycle 3 (BOEN n° 31 du 30 juillet 2020 et BOEN n° 25 du 22 juin 2023)',
    publisher: 'Éduscol',
    url: 'https://eduscol.education.fr/document/50990/download',
    textDate: '2023-06-22',
    consultedOn: CONSULTED,
  },
  {
    id: 'emc-2024',
    title: 'Programme d’enseignement moral et civique du CP à la terminale',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/sites/default/files/ensel934_annexe_ok.pdf',
    textDate: '2024-06-13',
    consultedOn: CONSULTED,
  },
  {
    id: 'cycle4-2020',
    title: 'Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020)',
    publisher: 'Éduscol',
    url: 'https://eduscol.education.fr/document/621/download',
    textDate: '2020-07-30',
    consultedOn: '2026-11-25',
  },
  {
    id: 'lv-college-2025',
    title: 'Programmes de langues vivantes étrangères du collège (arrêté du 5 mai 2025, BO n° 22)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://www.education.gouv.fr/bo/2025/Hebdo22/MENE2504621A',
    textDate: '2025-05-05',
    consultedOn: CONSULTED,
  },
  {
    id: 'insee-developpement-durable',
    title: '« Développement durable » (définition)',
    publisher: 'INSEE',
    url: 'https://www.insee.fr/fr/metadonnees/definition/c1644',
    textDate: '2026',
    consultedOn: CONSULTED_GE_CM2,
  },
  tlfi('nomade', 'nomade', 'nomade'),
  tlfi('bois', 'bois', 'bois'),
  tlfi('verre', 'verre', 'verre'),
  tlfi('acier', 'acier', 'acier'),
  { ...tlfi('transformation', 'transformation', 'transformation'), consultedOn: '2026-11-26' },
];
