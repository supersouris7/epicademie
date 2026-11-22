import { useEffect, useMemo, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { generate } from '@questeo/content';
import type { ArenaView, ClientToServerEvents, ServerToClientEvents } from '@questeo/shared';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { MathText } from '../../shared/question/MathText.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Countdown, eventText, overTitle, PlayerChip, RaidBars } from '../arena/index.ts';

/**
 * Mode TV (docs/adr/0023-raid-et-tv.md) : un écran partagé (télévision, ordinateur branché)
 * affiche en grand l'arène ou le raid de la famille ; chacun répond sur son téléphone, qui sert
 * de manette. L'écran n'a pas de profil et ne peut pas jouer : il regarde seulement.
 */
export function TvScreen() {
  const [arena, setArena] = useState<ArenaView | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
      auth: { tv: true },
      transports: ['websocket', 'polling'],
    });
    socket.on('arena', (v) => setArena(v));
    socket.on('arena:closed', () => setArena(null));
    socket.on('connect_error', (e: Error) => setError(e.message));
    return () => {
      socket.disconnect();
    };
  }, []);
  const q = arena?.question ?? null;
  const question = useMemo(() => (q ? generate(q.skillId, q.level, q.seed) : null), [q]);

  if (!arena || arena.phase === 'lobby') {
    return (
      <PageShell title="Mode TV" back="/multi">
        <div className="flex flex-col items-center gap-4 text-center">
          <Questy mood="wink" size={160} />
          <p className="font-display text-3xl tracking-wide">
            {arena
              ? 'La partie va commencer…'
              : 'Lancez un Duel ou un Raid sur les téléphones : la partie s’affichera ici.'}
          </p>
          {error && (
            <p role="alert" className="text-danger font-bold">
              {error}
            </p>
          )}
        </div>
      </PageShell>
    );
  }
  const turnName = arena.players.find((p) => p.id === arena.turnId)?.name;
  return (
    <main aria-label="Écran TV" className="mx-auto flex min-h-dvh max-w-7xl flex-col gap-4 p-6 text-xl">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {arena.players.map((p) => (
          <PlayerChip key={p.id} arena={arena} id={p.id} me="" />
        ))}
      </div>
      {arena.raid && <RaidBars raid={arena.raid} />}
      {arena.phase === 'over' ? (
        <h1 className="font-display text-toon text-center text-6xl tracking-wide">{overTitle(arena, null)}</h1>
      ) : (
        <>
          {arena.last && (
            <p role="status" className="cartoon bg-surface p-3 text-center font-bold">
              {eventText(arena, arena.last)}
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="font-display flex-1 text-4xl tracking-wide">
              {arena.waitingFor
                ? `En attente de ${turnName} (déconnecté)…`
                : arena.quiz
                  ? `Manche ${arena.quiz.round} / ${arena.quiz.rounds} : à vos téléphones !`
                  : `Au tour de ${turnName} !`}
            </span>
            {arena.deadline && <Countdown deadline={arena.deadline} />}
          </div>
          {question && (
            <section className="cartoon bg-surface flex flex-col gap-4 p-6">
              <h1 className="text-4xl leading-snug font-bold sm:text-5xl">
                <MathText text={question.prompt} />
              </h1>
              {question.figure && <Figure figure={question.figure} maxHeight="40vh" />}
              {question.answer.kind === 'choice' && (
                <ol className="grid grid-cols-2 gap-3 text-3xl" type="A">
                  {question.answer.options.map((o) => (
                    <li key={o} className="cartoon bg-surface-2 p-3">
                      <MathText text={o} />
                    </li>
                  ))}
                </ol>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
