import { useState } from 'react';

/** Préférence « plein écran » (Paramètres), gardée sur l'appareil. */
const KEY = 'questeo.fullscreen';

const read = () => {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
};
const write = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    // Stockage indisponible : la préférence ne survivra pas au rechargement.
  }
};

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
