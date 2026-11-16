import { PageShell } from '../components/PageShell.tsx';
import { QuestyFull } from '../components/mascot/Questy.tsx';
import { CREDITS } from '../credits.ts';

export function About() {
  return (
    <PageShell title="À propos" back="/parametres">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <QuestyFull size={160} />
        <p className="text-lg">
          <strong>Questeo</strong> — l’aventure des exercices de 5e. Questy, le renard explorateur, est un personnage
          original créé pour Questeo.
        </p>
      </div>
      <section className="cartoon bg-surface flex flex-col gap-3 p-5">
        <h2 className="font-display text-2xl tracking-wide">Crédits</h2>
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
      </section>
    </PageShell>
  );
}
