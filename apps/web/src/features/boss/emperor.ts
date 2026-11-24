import { localToday } from '../../shared/lib/dates.ts';
import { safeStorage } from '../../shared/lib/storage.ts';

/** L'Empereur du Savoir ne se présente qu'une fois par jour et par joueur (mémorisé sur l'appareil). */
const KEY = 'epicademie.empereur.';

export function emperorDue(profileId: string): boolean {
  return safeStorage.get(KEY + profileId) !== localToday();
}

export function markEmperorSeen(profileId: string): void {
  safeStorage.set(KEY + profileId, localToday());
}
