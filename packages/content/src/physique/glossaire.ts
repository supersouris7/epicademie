import type { SubjectTerm } from '../types.ts';

/**
 * Glossaire de physique-chimie (collège) : chaque mot difficile ou terme en gras d'un mémo y est défini.
 * Les termes déjà définis par le glossaire des sciences (solide, liquide, gaz, mélange, masse, volume,
 * soluble…) ne sont pas répétés ici.
 */
const terme = (id: string, word: string, forms: string[], definition: string, example: string): SubjectTerm => ({
  id: `pc-${id}`,
  word,
  forms,
  definition,
  example,
});

export const GLOSSAIRE: readonly SubjectTerm[] = [
  terme(
    'molecule',
    'molécule',
    ['molécule', 'molécules'],
    'Très petite particule de matière, invisible à l’œil nu.',
    'Dans un solide, les molécules sont fortement liées les unes aux autres.',
  ),
  terme(
    'fusion',
    'fusion',
    ['fusion'],
    'Passage de l’état solide à l’état liquide.',
    'La fusion d’un glaçon donne de l’eau.',
  ),
  terme(
    'solidification',
    'solidification',
    ['solidification'],
    'Passage de l’état liquide à l’état solide.',
    'La solidification de l’eau donne de la glace.',
  ),
  terme(
    'vaporisation',
    'vaporisation',
    ['vaporisation'],
    'Passage de l’état liquide à l’état gazeux.',
    'La vaporisation de l’eau a lieu par évaporation ou par ébullition.',
  ),
  terme(
    'liquefaction',
    'liquéfaction',
    ['liquéfaction', 'condensation'],
    'Passage de l’état gazeux à l’état liquide (on dit aussi condensation).',
    'La buée sur une bouteille froide vient de la liquéfaction de la vapeur d’eau.',
  ),
  terme(
    'sublimation',
    'sublimation',
    ['sublimation'],
    'Passage direct de l’état solide à l’état gazeux, sans passer par l’état liquide.',
    'Lors d’une sublimation, on ne voit jamais de liquide.',
  ),
  terme(
    'corps-pur',
    'corps pur',
    ['corps pur', 'corps purs'],
    'Corps qui ne contient aucune matière étrangère détectable.',
    'De l’eau pure est un corps pur.',
  ),
  terme(
    'homogene',
    'homogène',
    ['homogène', 'homogènes'],
    'Se dit d’un mélange dont on ne peut pas distinguer les constituants.',
    'L’eau salée limpide est un mélange homogène.',
  ),
  terme(
    'heterogene',
    'hétérogène',
    ['hétérogène', 'hétérogènes'],
    'Se dit d’un mélange dont on distingue des éléments différents.',
    'L’eau avec du sable est un mélange hétérogène.',
  ),
  terme(
    'masse-volumique',
    'masse volumique',
    ['masse volumique', 'masses volumiques'],
    'Masse d’une unité de volume d’une substance.',
    '2 g/cm³ : un centimètre cube de la substance a une masse de 2 g.',
  ),
  terme(
    'solvant',
    'solvant',
    ['solvant', 'solvants'],
    'Substance, souvent liquide, qui en dissout une autre.',
    'Dans l’eau sucrée, l’eau est le solvant.',
  ),
  terme(
    'solute',
    'soluté',
    ['soluté', 'solutés'],
    'Substance dissoute dans un solvant.',
    'Dans l’eau sucrée, le sucre est le soluté.',
  ),
  terme(
    'saturee',
    'saturée',
    ['saturée', 'saturé', 'saturées'],
    'Se dit d’une solution qui contient le maximum de substance qu’elle peut dissoudre, à une température donnée.',
    'Si le sel reste au fond malgré l’agitation, la solution est saturée.',
  ),
  terme(
    'solubilite',
    'solubilité',
    ['solubilité'],
    'Masse maximale d’une substance que l’on peut dissoudre dans un volume donné de solvant, à une température donnée.',
    'Une solubilité de 200 g/L : au plus 200 g dans un litre d’eau.',
  ),
  terme(
    'miscible',
    'miscibles',
    ['miscible', 'miscibles', 'miscibilité'],
    'Se dit de corps qui peuvent se mélanger de façon homogène.',
    'Deux liquides miscibles ne forment pas deux couches.',
  ),
];
