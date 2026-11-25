/**
 * Faits du chapitre « Objets et systèmes techniques » (technologie 5e). Chaque fait cite son identifiant de source
 * (registre `sources.ts`) et la citation exacte du texte officiel. Les objets et situations des exercices
 * (un vélo, une gourde…) illustrent ces faits : ils ne sont pas des faits.
 */
export interface Fait {
  readonly id: string;
  /** Identifiant dans le registre des sources. */
  readonly source: string;
  /** Citation exacte. */
  readonly citation: string;
}

/** Programme de technologie du cycle 4 en vigueur (BO n° 9 du 29 février 2024). */
export const PROGRAMME = 'techno-c4-2024';
/** Programme de sciences et technologie du cycle 3 : acquis réinvestis (besoin, fonction technique, solution). */
export const CYCLE3 = 'cycle3-2020';

export const FAITS: readonly Fait[] = [
  // ——— Besoin, usage, fonctions ———
  {
    id: 'programme-besoins',
    source: PROGRAMME,
    citation: 'Les besoins élémentaires de tout être humain (alimentation, santé, habitat, sécurité, etc.)',
  },
  {
    id: 'programme-choisir',
    source: PROGRAMME,
    citation: 'Choisir un OST parmi plusieurs propositions en vue de répondre à un besoin',
  },
  {
    id: 'programme-fonction-technique',
    source: PROGRAMME,
    citation: 'La fonction technique, le principe technique',
  },
  {
    id: 'programme-principes',
    source: PROGRAMME,
    citation: 'Comparer des principes techniques pour une même fonction technique',
  },
  {
    id: 'cycle3-besoins',
    source: CYCLE3,
    citation: 'Identifier des besoins et leur évolution (se déplacer, se chauffer, s’alimenter, etc.).',
  },
  {
    id: 'cycle3-distinguer',
    source: CYCLE3,
    citation: 'Distinguer un besoin et les fonctions techniques réalisées par un objet technique.',
  },
  {
    id: 'cycle3-lampe',
    source: CYCLE3,
    citation: 'chacun jouant un rôle précis (éclairer, allumer/éteindre, transporter l’énergie électrique, etc.)',
  },
  { id: 'besoin-def', source: 'cnrtl-besoin', citation: 'Situation de manque ou prise de conscience d’un manque.' },
  {
    id: 'usage-def',
    source: 'cnrtl-usage',
    citation:
      'de faire agir un objet, une matière selon leur nature, leur fonction propre afin d’obtenir un effet qui permette de satisfaire un besoin',
  },
  // ——— Contraintes et choix de conception ———
  {
    id: 'programme-choix-conception',
    source: PROGRAMME,
    citation:
      'Repérer et expliquer les choix de conception dans les domaines de l’ergonomie et de la sécurité ou en lien avec des objectifs de développement durable',
  },
  {
    id: 'programme-contraintes',
    source: PROGRAMME,
    citation:
      'prise en compte des exigences issues des normes ou d’un cahier des charges, labels et certifications ; l’ergonomie liée à l’usage',
  },
  {
    id: 'cahier-def',
    source: 'academie-cahier',
    citation: 'Document indiquant les conditions d’exécution d’un marché de travaux',
  },
  {
    id: 'norme-def',
    source: 'cnrtl-norme',
    citation:
      'Ensemble de données (mesures, caractéristiques, qualités, formules de composition) définissant un matériau, un produit, un objet ou un procédé',
  },
  {
    id: 'label-def',
    source: 'cnrtl-label',
    citation:
      'Marque distinctive créée par un syndicat professionnel ou un organisme parapublic et apposée sur un produit commercialisé pour en garantir la qualité',
  },
  {
    id: 'securite-def',
    source: 'cnrtl-securite',
    citation: 'entraîne l’absence de dangers pour les personnes',
  },
  {
    id: 'ergonomie-def',
    source: 'academie-ergonomie',
    citation: 'la mise au point des équipements et des matériels les mieux adaptés à la personne qui travaille',
  },
  {
    id: 'developpement-durable-def',
    source: 'insee-developpement-durable',
    citation:
      'un développement qui répond aux besoins du présent sans compromettre la capacité des générations futures à répondre aux leurs',
  },
  // ——— Matériaux et procédés ———
  {
    id: 'programme-materiaux',
    source: PROGRAMME,
    citation: 'Identifier les principaux matériaux constitutifs d’un OST',
  },
  {
    id: 'programme-ateliers',
    source: PROGRAMME,
    citation: 'Découvrir les procédés de réalisation présents dans un atelier de fabrication collaboratif',
  },
  {
    id: 'programme-procedes',
    source: PROGRAMME,
    citation:
      'Les procédés d’obtention de pièce (ajout et enlèvement de matière), de mise en forme (pliage, thermoformage) et d’assemblage (fixe et démontable)',
  },
  {
    id: 'programme-moyens',
    source: PROGRAMME,
    citation: 'découpe au laser, centre d’usinage, fabrication additive (imprimante 3D)',
  },
  {
    id: 'materiau-def',
    source: 'cnrtl-materiau',
    citation: 'Type de matière qui entre dans la construction d’un objet fabriqué.',
  },
  {
    id: 'acier-def',
    source: 'cnrtl-acier',
    citation: 'Métal plus dur et plus résistant que le fer, obtenu par un alliage de fer et de carbone',
  },
  { id: 'aluminium-def', source: 'cnrtl-aluminium', citation: 'Métal blanc, très léger' },
  {
    id: 'cuivre-def',
    source: 'cnrtl-cuivre',
    citation: 'Métal de couleur rouge-brun, ductile et malléable, bon conducteur de l’électricité',
  },
  {
    id: 'verre-def',
    source: 'cnrtl-verre',
    citation: 'Substance solide, transparente et cassante, obtenue par la fusion d’un sable siliceux',
  },
  {
    id: 'bois-def',
    source: 'cnrtl-bois',
    citation: 'Matière (racines, tronc, branches) qui constitue l’arbre (à l’exception du feuillage)',
  },
  {
    id: 'thermoformage-def',
    source: 'cnrtl-thermoformage',
    citation: 'Technique qui permet la réalisation de formes d’un matériau par chauffage.',
  },
  { id: 'pliage-def', source: 'cnrtl-pliage', citation: 'Action de plier quelque chose; résultat de cette action.' },
  {
    id: 'usinage-def',
    source: 'cnrtl-usinage',
    citation: 'façonnage d’une pièce brute pour l’amener à sa forme définitive',
  },
  { id: 'percage-def', source: 'cnrtl-percage', citation: 'Action de percer des trous dans une matière' },
  {
    id: 'souder-def',
    source: 'cnrtl-souder',
    citation: 'faire adhérer en un tout continu des pièces métalliques ou des produits synthétiques',
  },
  { id: 'riveter-def', source: 'cnrtl-riveter', citation: 'Assembler, fixer par des rivets.' },
  {
    id: 'boulon-def',
    source: 'cnrtl-boulon',
    citation: 'comportant une tête et un écrou et servant à relier entre elles des pièces de bois ou de métal',
  },
  // ——— Usages et environnement ———
  {
    id: 'programme-interacteurs',
    source: PROGRAMME,
    citation: 'Les interacteurs extérieurs : usagers, données, autres objets, éléments de l’environnement',
  },
  {
    id: 'programme-liste-interacteurs',
    source: PROGRAMME,
    citation: 'Faire la liste des interacteurs extérieurs d’un OST',
  },
  {
    id: 'programme-cycle-de-vie',
    source: PROGRAMME,
    citation:
      'Les étapes du cycle de vie d’un OST : extraction, traitement, fabrication, assemblage, utilisation, fin de vie, transport',
  },
  {
    id: 'programme-etapes-influencees',
    source: PROGRAMME,
    citation: 'Identifier les étapes du cycle de vie d’un OST influencées par les choix de matériaux et d’énergie',
  },
  {
    id: 'programme-incidences',
    source: PROGRAMME,
    citation:
      'consommation d’énergie, disponibilité et consommation de ressources, rejets et déchets, échanges de données',
  },
  {
    id: 'reparabilite-note',
    source: 'ecologie-indice-reparabilite',
    citation:
      'En affichant une note de 0 à 10, cet indice informe les consommateurs sur le caractère plus ou moins réparable des produits concernés.',
  },
];
