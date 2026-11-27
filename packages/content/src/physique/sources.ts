import { academie, tlfi, type Source } from '../sources-outils.ts';

/** Sources de physique-chimie (registre : `sources.ts` à la racine du paquet). */
export const SOURCES: readonly Source[] = [
  // Lot pc-5e-01 : organisation de la matière.
  tlfi('fusion', 'fusion', 'fusion'),
  tlfi('solidification', 'solidification', 'solidification'),
  tlfi('vaporisation', 'vaporisation', 'vaporisation'),
  tlfi('liquefaction', 'liquéfaction', 'liqu%C3%A9faction'),
  tlfi('condensation', 'condensation', 'condensation'),
  tlfi('ebullition', 'ébullition', '%C3%A9bullition'),
  tlfi('evaporation', 'évaporation', '%C3%A9vaporation'),
  tlfi('sublimation', 'sublimation', 'sublimation'),
  tlfi('solide', 'solide', 'solide'),
  tlfi('liquide', 'liquide', 'liquide'),
  tlfi('gaz', 'gaz', 'gaz'),
  tlfi('pur', 'pur', 'pur'),
  tlfi('melange', 'mélange', 'm%C3%A9lange'),
  tlfi('homogene', 'homogène', 'homog%C3%A8ne'),
  tlfi('heterogene', 'hétérogène', 'h%C3%A9t%C3%A9rog%C3%A8ne'),
  tlfi('azote', 'azote', 'azote'),
  tlfi('volumique', 'volumique', 'volumique'),
  tlfi('insoluble', 'insoluble', 'insoluble'),
  tlfi('solvant', 'solvant', 'solvant'),
  tlfi('solute', 'soluté', 'solut%C3%A9'),
  tlfi('sature', 'saturé', 'satur%C3%A9'),
  tlfi('solubilite', 'solubilité', 'solubilit%C3%A9'),
  tlfi('miscible', 'miscible', 'miscible'),
  { ...academie('eutectique', 'eutectique'), consultedOn: '2026-11-26' },
  { ...academie('limpide', 'limpide'), consultedOn: '2026-11-26' },
  // Lot pc-5e-02 : mouvement (trajectoire, vitesse et ralentir : sources déjà au registre).
  { ...academie('referentiel', 'référentiel'), consultedOn: '2026-11-26' },
  { ...academie('mouvement', 'mouvement'), consultedOn: '2026-11-26' },
  { ...academie('rectiligne', 'rectiligne'), consultedOn: '2026-11-26' },
  {
    ...academie('circulaire', 'circulaire'),
    url: 'https://www.cnrtl.fr/definition/academie9/circulaire/adjectif',
    consultedOn: '2026-11-26',
  },
  { ...academie('accelere', 'accéléré'), consultedOn: '2026-11-26' },
  { ...academie('direction', 'direction'), consultedOn: '2026-11-26' },
  { ...academie('moyenne', 'moyenne'), consultedOn: '2026-11-26' },
  { ...tlfi('mouvement', 'mouvement', 'mouvement'), consultedOn: '2026-11-26' },
  { ...tlfi('uniforme', 'uniforme', 'uniforme/adjectif'), consultedOn: '2026-11-26' },
  {
    ...academie('sens', 'sens'),
    url: 'https://www.cnrtl.fr/definition/academie9/sens/nom',
    consultedOn: '2026-11-26',
  },
  // Lot pc-5e-03 : énergie et circuits (pile, métal, dérivation, fossile, pétrole, charbon, cuivre : déjà au registre).
  ...(
    [
      ['renouvelable', 'renouvelable'],
      ['nucleaire', 'nucléaire'],
      ['lampe', 'lampe'],
      ['moteur', 'moteur'],
      ['radiateur', 'radiateur'],
      ['generateur', 'générateur'],
      ['circuit', 'circuit'],
      ['conducteur', 'conducteur'],
      ['argent', 'argent'],
      ['ebonite', 'ébonite'],
      ['electrocution', 'électrocution'],
    ] as const
  ).map(([id, mot]) => ({ ...academie(id, mot), consultedOn: '2026-11-26' })),
  {
    ...academie('isolant', 'isolant'),
    url: 'https://www.cnrtl.fr/definition/academie9/isolant/adjectif',
    consultedOn: '2026-11-26',
  },
  { ...tlfi('pile', 'pile', 'pile/nom'), consultedOn: '2026-11-26' },
  { ...tlfi('thermique', 'thermique', 'thermique'), consultedOn: '2026-11-26' },
  { ...tlfi('nucleaire', 'nucléaire', 'nucl%C3%A9aire'), consultedOn: '2026-11-26' },
  { ...tlfi('circuit', 'circuit', 'circuit'), consultedOn: '2026-11-26' },
  { ...tlfi('serie', 'série', 's%C3%A9rie'), consultedOn: '2026-11-26' },
  { ...tlfi('interrupteur', 'interrupteur', 'interrupteur'), consultedOn: '2026-11-26' },
  { ...tlfi('court-circuit', 'court-circuit', 'court-circuit'), consultedOn: '2026-11-26' },
  // Lot pc-5e-04 : signaux et unités (grandeur : source déjà au registre).
  ...(
    [
      ['lumineux', 'lumineux'],
      ['diffuser', 'diffuser'],
      ['ombre', 'ombre'],
      ['lune', 'lune'],
      ['etoile', 'étoile'],
      ['planete', 'planète'],
      ['propagation', 'propagation'],
      ['echo', 'écho'],
    ] as const
  ).map(([id, mot]) => ({ ...academie(id, mot), consultedOn: '2026-11-26' })),
  { ...tlfi('rayon', 'rayon', 'rayon'), consultedOn: '2026-11-26' },
  { ...tlfi('annee', 'année', 'ann%C3%A9e'), consultedOn: '2026-11-26' },
  { ...tlfi('onde', 'onde', 'onde'), consultedOn: '2026-11-26' },
  { ...tlfi('son-nom', 'son', 'son'), consultedOn: '2026-11-26' },
  { ...tlfi('ultrason', 'ultrason', 'ultrason'), consultedOn: '2026-11-26' },
  { ...tlfi('infrason', 'infrason', 'infrason'), consultedOn: '2026-11-26' },
  { ...tlfi('sonar', 'sonar', 'sonar'), consultedOn: '2026-11-26' },
  { ...tlfi('propagation', 'propagation', 'propagation'), consultedOn: '2026-11-26' },
  // Lot pc-4e-01 : atomes et transformations (protoxyde d’azote et mélange : sources déjà au registre).
  ...(
    [
      ['atome', 'atome'],
      ['molecule', 'molécule'],
      ['dioxyde', 'dioxyde'],
      ['monoxyde', 'monoxyde'],
      ['methane', 'méthane'],
      ['carbone', 'carbone'],
      ['oxygene', 'oxygène'],
      ['hydrogene', 'hydrogène'],
      ['azote', 'azote'],
      ['formule', 'formule'],
      ['reaction', 'réaction'],
      ['reactif', 'réactif'],
      ['produit', 'produit'],
      ['combustion', 'combustion'],
      ['combustible', 'combustible'],
    ] as const
  ).map(([id, mot]) => ({ ...academie(id, mot), consultedOn: '2026-11-26' })),
  { ...tlfi('eau', 'eau', 'eau'), consultedOn: '2026-11-26' },
  { ...tlfi('molecule', 'molécule', 'mol%C3%A9cule'), consultedOn: '2026-11-26' },
  { ...tlfi('comburant', 'comburant', 'comburant'), consultedOn: '2026-11-26' },
  // Lot pc-4e-02 : mouvement et interactions (direction, sens : sources déjà au registre).
  ...(
    [
      ['interaction', 'interaction'],
      ['contact', 'contact'],
      ['distance', 'distance'],
      ['action', 'action'],
      ['equilibre', 'équilibre'],
      ['newton', 'newton'],
      ['dynamometre', 'dynamomètre'],
      ['kilometre', 'kilomètre'],
    ] as const
  ).map(([id, mot]) => ({ ...academie(id, mot), consultedOn: '2026-11-26' })),
  ...(
    [
      ['metre', 'mètre', 'm%C3%A8tre/nom'],
      ['force', 'force', 'force/nom'],
      ['poids', 'poids', 'poids/nom'],
    ] as const
  ).map(([id, mot, chemin]) => ({
    ...academie(id, mot),
    url: `https://www.cnrtl.fr/definition/academie9/${chemin}`,
    consultedOn: '2026-11-26',
  })),
  { ...tlfi('aimant', 'aimant', 'aimant'), consultedOn: '2026-11-26' },
  { ...tlfi('suspente', 'suspente', 'suspente'), consultedOn: '2026-11-26' },
  { ...tlfi('vecteur', 'vecteur', 'vecteur/nom'), consultedOn: '2026-11-26' },
  {
    id: 'seconde-pc-2019',
    title: 'Programme de physique-chimie de seconde générale et technologique (BO spécial n° 1 du 22 janvier 2019)',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://cache.media.education.gouv.fr/file/SP1-MEN-22-1-2019/98/9/spe634_annexe_1062989.pdf',
    textDate: '2019-01-22',
    consultedOn: '2026-11-26',
  },
  {
    id: 'eduscol-ethanol-4e',
    title: 'La cheminée à l’éthanol (Physique-chimie 4e, Organisation et transformations de la matière, BRNE)',
    publisher: 'Éduscol',
    url: 'https://eduscol.education.fr/document/29578/download',
    textDate: '2020-04-11',
    consultedOn: '2026-11-26',
  },
  {
    id: 'bipm-si-resume',
    title: 'Résumé de la Brochure sur le Système international d’unités (SI)',
    publisher: 'Bureau international des poids et mesures (BIPM)',
    url: 'https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-concise-FR.pdf',
    textDate: '2019',
    consultedOn: '2026-11-26',
  },
  {
    id: 'inserm-audition',
    title: 'Troubles de l’audition – Surdités (dossier)',
    publisher: 'Inserm',
    url: 'https://www.inserm.fr/dossier/troubles-audition-surdites/',
    textDate: '2023-11-07',
    consultedOn: '2026-11-26',
  },
  {
    id: 'ecologie-lasers',
    title: 'Lutte contre l’usage des lasers dans le transport aérien',
    publisher: 'Ministère de la Transition écologique',
    url: 'https://www.ecologie.gouv.fr/politiques-publiques/lutte-contre-lusage-lasers-transport-aerien',
    textDate: '2016-11-22',
    consultedOn: '2026-11-26',
  },
  // Lot pc-4e-03 : électricité (circuit, court-circuit, interrupteur, résistance, programme de seconde et BIPM : sources déjà au registre).
  ...(
    [
      ['ampere', 'ampère'],
      ['amperemetre', 'ampèremètre'],
      ['ohm', 'ohm'],
      ['noeud', 'nœud'],
    ] as const
  ).map(([id, mot]) => ({ ...academie(id, mot), consultedOn: '2026-11-26' })),
  ...(
    [
      ['tension', 'tension', 'tension'],
      ['voltmetre', 'voltmètre', 'voltm%C3%A8tre'],
      ['intensite', 'intensité', 'intensit%C3%A9'],
      ['maille', 'maille', 'maille'],
      ['borne', 'borne', 'borne'],
      ['surtension', 'surtension', 'surtension'],
      ['sous-tension', 'sous-tension', 'sous-tension'],
    ] as const
  ).map(([id, mot, chemin]) => ({ ...tlfi(id, mot, chemin), consultedOn: '2026-11-26' })),
  {
    id: 'college-pc-2008',
    title:
      'Programme de physique-chimie du collège (BO spécial n° 6 du 28 août 2008), programme antérieur cité pour l’énoncé des lois de l’électricité',
    publisher: 'Ministère de l’Éducation nationale',
    url: 'https://cache.media.education.gouv.fr/file/special_6/52/7/Programme_physique-chimie_33527.pdf',
    textDate: '2008-08-28',
    consultedOn: '2026-11-26',
  },
  {
    id: 'eduscol-electricite-lois',
    title: 'Électricité (Physique-chimie, seconde) : proposition d’énoncés des lois dans un circuit électrique',
    publisher: 'Éduscol',
    url: 'https://eduscol.education.gouv.fr/sites/default/files/document/ra19lyceegt2phychiressources-electricite1161322pdf-82476.pdf',
    textDate: '2019-07',
    consultedOn: '2026-11-26',
  },
];
