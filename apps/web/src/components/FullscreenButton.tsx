import { useEffect, useState } from 'react';
import { FullscreenIcon } from './icons.tsx';

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
    <button
      type="button"
      onClick={toggle}
      className="cartoon cartoon-press bg-surface flex h-14 w-14 items-center justify-center text-2xl"
      aria-label={active ? 'Quitter le plein écran' : 'Plein écran'}
      title={active ? 'Quitter le plein écran' : 'Plein écran'}
    >
      <FullscreenIcon exit={active} size={30} />
    </button>
  );
}
