import { useEffect, useRef } from 'react';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { QuestyPose } from '../../shared/ui/mascot/QuestyPose.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';

/** Après le 1er profil créé par le parent : il passe l'appareil à son enfant, qui lance le jeu. */
export function HandOff({ name, onStart }: { readonly name: string; readonly onStart: () => void }) {
  const start = useRef<HTMLButtonElement>(null);
  useEffect(() => start.current?.focus(), []);
  return (
    <PageShell>
      <div className="m-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
        <QuestyPose pose="salut" mood="wink" size={160} />
        <h1 className="font-display text-toon max-w-full text-3xl leading-tight tracking-wide text-balance wrap-anywhere sm:text-4xl">
          Le profil de {name} est prêt&nbsp;!
        </h1>
        <p id="passer-appareil" className="cartoon bg-surface max-w-full p-4 text-xl font-bold wrap-anywhere">
          Passez maintenant l’appareil à {name}.
        </p>
        <GameButton
          ref={start}
          size="xl"
          onClick={onStart}
          aria-describedby="passer-appareil"
          className="max-w-full self-stretch py-3 wrap-anywhere"
        >
          C’est parti, {name}&nbsp;!
        </GameButton>
      </div>
    </PageShell>
  );
}
