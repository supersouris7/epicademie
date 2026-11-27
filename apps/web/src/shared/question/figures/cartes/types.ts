/** Une zone d'un fond de carte : chemin SVG, centre (pour les repères et la navigation au clavier). */
export interface ZoneFond {
  readonly id: string;
  readonly d: string;
  readonly c: readonly [number, number];
  /** Monde : mer (océan), terre (continent) ou fleuve (ligne) ; absent = surface. */
  readonly k?: 'sea' | 'land' | 'river';
}

/** Fond de carte simplifié (généré par `scripts/fonds-cartes.mjs`). */
export interface FondCarte {
  readonly w: number;
  readonly h: number;
  readonly zones: readonly ZoneFond[];
  /** Surfaces voisines dessinées en gris, non sélectionnables. */
  readonly back: string;
}

/** Cadrage d'une carte : centre (coordonnées du fond) et facteur de zoom. */
export interface VueCarte {
  readonly cx: number;
  readonly cy: number;
  readonly zoom: number;
}
