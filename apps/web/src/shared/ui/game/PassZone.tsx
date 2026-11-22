import { useEffect, useRef } from 'react';

/** Petit délai avant de pouvoir passer une étape (évite le double-toucher), en millisecondes. */
export const PASS_DELAY_MS = 600;

/**
 * Zone invisible plein écran : un toucher, un clic ou Entrée/Espace passe à la suite des dialogues
 * (aucun bouton visible). Elle prend le focus clavier et ignore les touchers des premiers instants ;
 * à remonter avec une `key` par étape pour relancer le délai.
 */
export function PassZone({
  onPass,
  step,
  className = 'absolute inset-0 z-10',
}: {
  onPass: () => void;
  /** Étape en cours : le délai (et le focus) repartent à chaque changement. */
  step?: string;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const ready = useRef(false);
  useEffect(() => {
    ref.current?.focus();
    ready.current = false;
    const t = window.setTimeout(() => {
      ready.current = true;
    }, PASS_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [step]);
  return (
    <button
      ref={ref}
      type="button"
      aria-label="Passer"
      onClick={() => ready.current && onPass()}
      className={`${className} cursor-pointer outline-none`}
    />
  );
}
