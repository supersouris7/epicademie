/** Graduations entières : 0, le milieu et un maximum pair (0 et 1 si l'on ne dépasse pas 1). */
export function integerTicks(max: number): number[] {
  if (max <= 1) return [0, 1];
  const top = max + (max % 2);
  return [0, top / 2, top];
}
