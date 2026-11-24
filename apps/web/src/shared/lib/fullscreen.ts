import { useState } from 'react';
import { safeStorage } from './storage.ts';

/** Préférence « plein écran » (Paramètres), gardée sur l'appareil. */
const KEY = 'epicademie.fullscreen';

const read = () => safeStorage.get(KEY) === '1';
// Stockage indisponible : la préférence ne survivra pas au rechargement.
const write = (on: boolean) => safeStorage.set(KEY, on ? '1' : '0');

export const fullscreenSupported = () => typeof document !== 'undefined' && document.fullscreenEnabled;

const enter = () => {
  if (fullscreenSupported() && !document.fullscreenElement)
    void document.documentElement.requestFullscreen().catch(() => undefined);
};

/**
 * Le navigateur n'accepte le plein écran qu'après un geste : si la préférence est active, on y repasse
 * au premier toucher (après un rechargement ou une sortie avec Échap).
 */
export function installFullscreenPreference() {
  if (!fullscreenSupported()) return;
  document.addEventListener('pointerdown', () => {
    if (read()) enter();
  });
}

/** Interrupteur des Paramètres. */
export function useFullscreenPreference(): [boolean, (on: boolean) => void] {
  // La préférence survit à une sortie par Échap : le plein écran revient au prochain toucher.
  const [on, setOn] = useState(read);
  const set = (next: boolean) => {
    write(next);
    setOn(next);
    if (next) enter();
    else if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined);
  };
  return [on, set];
}
