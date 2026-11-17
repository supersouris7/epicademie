import { useEffect, useState } from 'react';
import { GameButton } from './game/GameButton.tsx';

/** Bascule plein écran (mode tablette). Masqué si l'API n'est pas disponible. */
export function FullscreenButton() {
  const [active, setActive] = useState(() => document.fullscreenElement !== null);
  useEffect(() => {
    const onChange = () => setActive(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);
  if (!document.fullscreenEnabled) return null;
  const toggle = () =>
    void (active ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => undefined);
  return (
    <GameButton
      variant="accent"
      iconOnly
      icon={active ? 'icons-navigation-fullscreen-exit' : 'icons-navigation-fullscreen'}
      onClick={toggle}
      aria-label={active ? 'Quitter le plein écran' : 'Plein écran'}
      title={active ? 'Quitter le plein écran' : 'Plein écran'}
    />
  );
}
