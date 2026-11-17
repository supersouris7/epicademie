/** Définition d'un SVG généré. `file` est relatif à public/assets. */
export interface SvgAsset {
  readonly id: string;
  readonly file: string;
  readonly title: string;
  readonly usage: string;
  /** Par défaut : 0 0 64 64. */
  readonly viewBox?: string;
  readonly body: string;
  /** Par défaut : disponible. */
  readonly status?: 'disponible' | 'provisoire';
}
