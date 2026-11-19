import { PageShell } from '../../shared/ui/PageShell.tsx';
import { GamePanel } from '../../shared/ui/game/GamePanel.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { CREDITS } from './credits.ts';
import { AVAILABLE } from '../../design/assets.available.ts';

export function About() {
  return (
    <PageShell title="À propos" back="/parametres">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Questy size={140} mood="cool" />
        <p className="text-lg">
          <strong>Academy Fighters</strong> — l’aventure des maths, du CM1 à la 3e. Questy, le robot à écran LED qui
          change de tête selon l’humeur, est un personnage original créé pour Academy Fighters.
        </p>
      </div>
      <GamePanel title="Crédits" className="flex flex-col gap-3">
        <ul className="flex flex-col gap-2">
          {CREDITS.map((c) => (
            <li key={c.work}>
              <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="font-bold underline">
                {c.work}
              </a>{' '}
              par {c.author} —{' '}
              <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                {c.license}
              </a>
              .
            </li>
          ))}
        </ul>
        <p className="text-muted text-sm">Les avatars sont des remixes générés par DiceBear à partir de ces œuvres.</p>
        {AVAILABLE.length > 0 && (
          <p className="text-muted text-sm">
            Les illustrations du jeu sont créées avec ChatGPT Images (OpenAI) d’après la direction artistique d’Academy
            Fighters.
          </p>
        )}
      </GamePanel>
    </PageShell>
  );
}
