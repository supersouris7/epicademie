import { Questy } from './mascot/Questy.tsx';

/** Écran d'attente, le temps de télécharger le code de l'écran demandé. */
export function LoadingScreen() {
  return (
    <div role="status" className="mx-auto flex max-w-xl flex-col items-center gap-4 p-8 text-center">
      <Questy mood="ok" size={120} />
      <p className="text-xl font-bold">Chargement…</p>
    </div>
  );
}
