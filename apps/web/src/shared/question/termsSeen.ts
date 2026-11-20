/**
 * Mots du glossaire déjà regardés sur cet appareil (confort : « Mon dictionnaire » les signale).
 * Stockage local, protégé : sans accès au stockage, rien n'est retenu et tout fonctionne.
 */
const KEY = 'af:mots-vus';

export function termsSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function markTermSeen(id: string): void {
  try {
    const seen = termsSeen();
    seen.add(id);
    localStorage.setItem(KEY, JSON.stringify([...seen]));
  } catch {
    // Stockage indisponible : sans conséquence.
  }
}
