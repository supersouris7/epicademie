import { PageShell } from '../../shared/ui/PageShell.tsx';
import { GamePanel } from '../../shared/ui/game/GamePanel.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { CREDITS } from './credits.ts';
import { AVAILABLE } from '../../design/assets.available.ts';

/** À propos : présentation du jeu et crédits (sons, polices, illustrations). */
export function About() {
  return (
    <PageShell title="À propos" back="/parametres">
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <Questy size={140} mood="cool" />
        <p className="text-lg">
          <strong>Épicadémie</strong> — l’aventure des maths, du CM1 à la 3e. Questy, le robot à écran LED qui change de
          tête selon l’humeur, est un personnage original créé pour Épicadémie.
        </p>
      </div>
      <GamePanel title="Données personnelles" className="flex flex-col gap-2">
        <p>
          <strong>Moins de 15 ans</strong> : ton compte ne contient ni nom ni e-mail, seulement un pseudo, un avatar, ta
          classe et ta progression. Pour payer ou donner accès à un suivi, un parent doit rattacher ton compte au sien :
          c’est la règle pour protéger les enfants (consentement d’un parent avant 15 ans).
        </p>
        <p>
          <strong>15 ans et plus, et parents</strong> : nous gardons l’e-mail et le mot de passe (chiffré) pour te
          connecter. Rien n’est envoyé à des tiers et aucune publicité n’est affichée.
        </p>
        <p className="text-muted text-sm">
          Ton code de récupération et les codes d’invitation sont chiffrés chez nous : personne ne peut les relire. Tu
          peux demander à un parent de supprimer ton profil à tout moment.
        </p>
      </GamePanel>
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
      <p className="text-muted text-center text-sm">© 2026 Épicadémie — tous droits réservés.</p>
    </PageShell>
  );
}
