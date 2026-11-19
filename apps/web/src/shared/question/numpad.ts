/** Applique une touche du pavé à une saisie. */
export function applyKey(value: string, key: string, maxLength = 12): string {
  if (key === '⌫') return value.slice(0, -1);
  if (key === '−') return value.startsWith('−') ? value.slice(1) : `−${value}`;
  if (key === ',') return value.includes(',') ? value : `${value || '0'},`;
  if (value.replace('−', '').length >= maxLength) return value;
  if (value === '0') return key;
  if (value === '−0') return `−${key}`;
  return value + key;
}
