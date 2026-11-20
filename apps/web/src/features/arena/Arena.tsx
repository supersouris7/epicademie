import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router';
import { chaptersOf, generate, getAnySkill, getChapter } from '@questeo/content';
import { eventText, overTitle } from './arenaText.ts';
import {
  ARENA_HEARTS,
  ARENA_MAX_PLAYERS,
  type ArenaKind,
  type ArenaView,
  type Profile,
  type RaidStatus,
} from '@questeo/shared';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { HeroSays } from '../../shared/battle/BattleScenes.tsx';
import { Confetti } from '../../shared/ui/Confetti.tsx';
import { Figure } from '../../shared/question/figures/Figure.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { GradeTabs } from '../../shared/ui/GradeTabs.tsx';
import { MathText } from '../../shared/question/MathText.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { QuestionTools } from '../../shared/question/QuestionTools.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { heroSays } from '../../shared/lib/dialogue.ts';
import { useGradeChoice } from '../../shared/lib/grades.ts';
import { DOCK_HEIGHT } from '../../shared/question/tools.ts';
import { useRealtime } from '../realtime/index.ts';

/**
 * Arène : 2 à 4 joueurs connectés, chacun sur son appareil. À son tour, on répond à une question du
 * chapitre : juste = on attaque l'adversaire le plus en forme ; faux ou trop lent = on perd un cœur.
 * Le dernier debout gagne. L'état de la partie vit sur le serveur.
 */
export function Arena({ profile }: { readonly profile: Profile }) {
  const arena = useRealtime((s) => s.arena);
  if (!arena) return <ArenaSetup profile={profile} />;
  if (arena.phase === 'lobby') return <ArenaLobby profile={profile} arena={arena} />;
  return <ArenaGame profile={profile} arena={arena} />;
}

function ArenaSetup({ profile }: { readonly profile: Profile }) {
  const [params] = useSearchParams();
  const online = useRealtime((s) => s.online);
  const others = online.filter((p) => p.id !== profile.id && !p.busy);
  const create = useRealtime((s) => s.createArena);
  const kind: ArenaKind = params.get('mode') === 'raid' ? 'raid' : 'duel';
  const { grade, grades, own, setGrade } = useGradeChoice(profile, 'maths');
  const chapters = chaptersOf('maths', grade);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [invite, setInvite] = useState<readonly string[]>(() => {
    const id = params.get('invite');
    return id ? [id] : [];
  });
  const toggle = (id: string) =>
    setInvite((l) => (l.includes(id) ? l.filter((x) => x !== id) : l.length < ARENA_MAX_PLAYERS - 1 ? [...l, id] : l));
  const chosen = chapters.find((c) => c.id === chapterId) ?? chapters[0];
  return (
    <PageShell title={kind === 'raid' ? 'Raid' : 'Arène'} back="/multi">
      <div className="flex items-center gap-3">
        <Questy mood={kind === 'raid' ? 'wink' : 'angry'} size={80} />
        <SpeechBubble>
          {kind === 'raid'
            ? 'Toute l’équipe contre le boss ! Chaque bonne réponse le frappe ; chaque erreur coûte un cœur à l’équipe.'
            : 'Chacun son tour : bonne réponse, tu attaques ! Le dernier debout gagne.'}
        </SpeechBubble>
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl tracking-wide">1. Le chapitre</h2>
        <GradeTabs grades={grades} value={grade} own={own} onChange={setGrade} />
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Chapitre">
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={chosen?.id === c.id}
              onClick={() => setChapterId(c.id)}
              className={`cartoon cartoon-press px-3 py-2 font-bold ${chosen?.id === c.id ? 'bg-accent gloss text-white' : 'bg-surface'}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-display text-2xl tracking-wide">
          {kind === 'raid' ? '2. Tes équipiers (1 à 3)' : '2. Tes adversaires (1 à 3)'}
        </h2>
        {others.length === 0 && (
          <p className="text-muted font-bold">Personne n’est disponible : attends qu’un ami se connecte.</p>
        )}
        <div className="flex flex-col gap-2" role="group" aria-label={kind === 'raid' ? 'Équipiers' : 'Adversaires'}>
          {others.map((p) => (
            <label key={p.id} className="cartoon bg-surface flex cursor-pointer items-center gap-3 p-2.5">
              <input
                type="checkbox"
                checked={invite.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="h-6 w-6 accent-[var(--accent)]"
              />
              <HeroFace hero={p.hero} expression="determine" size={40} />
              <span className="font-display text-xl tracking-wide">{p.name}</span>
            </label>
          ))}
        </div>
      </section>
      <GameButton
        size="lg"
        variant="danger"
        icon="icons-navigation-play"
        disabled={!chosen || invite.length === 0}
        onClick={() => chosen && create(chosen.id, invite, kind)}
      >
        Envoyer les invitations
      </GameButton>
    </PageShell>
  );
}

export function PlayerChip({ arena, id, me }: { readonly arena: ArenaView; readonly id: string; readonly me: string }) {
  const p = arena.players.find((x) => x.id === id);
  if (!p) return null;
  const turn = arena.turnId === id;
  const out = arena.phase !== 'lobby' && p.hearts <= 0;
  return (
    <div
      className={`cartoon flex min-w-0 flex-col items-center gap-0.5 p-2 transition-transform ${turn ? 'bg-accent scale-105 text-white' : 'bg-surface'} ${out ? 'opacity-40 grayscale' : ''}`}
    >
      <HeroFace hero={p.hero} expression={out ? 'etourdi' : turn ? 'determine' : 'confiant'} size={48} />
      <span className="font-display max-w-full truncate text-base tracking-wide">
        {p.name}
        {id === me ? ' (toi)' : ''}
      </span>
      {p.away && (
        <span className="text-danger text-xs font-bold" role="status">
          Déconnecté…
        </span>
      )}
      {arena.phase === 'lobby' ? (
        <span className="text-xs font-bold">{p.ready ? 'Prêt !' : 'Invité…'}</span>
      ) : (
        <span className="flex" aria-label={`${p.hearts} cœurs`} role="img">
          {Array.from({ length: ARENA_HEARTS }, (_, i) => (
            <GameIcon key={i} id={i < p.hearts ? 'icons-resources-life' : 'icons-resources-life-empty'} size={18} />
          ))}
        </span>
      )}
    </div>
  );
}

function ArenaLobby({ profile, arena }: { readonly profile: Profile; readonly arena: ArenaView }) {
  const start = useRealtime((s) => s.startArena);
  const leave = useRealtime((s) => s.leaveArena);
  const host = arena.hostId === profile.id;
  const ready = arena.players.filter((p) => p.ready).length;
  return (
    <PageShell title="Arène · salon" back="/multi">
      <p className="font-display text-xl tracking-wide">{getChapter(arena.chapterId)?.title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {arena.players.map((p) => (
          <PlayerChip key={p.id} arena={arena} id={p.id} me={profile.id} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Questy mood="wink" size={70} />
        <SpeechBubble>
          {host
            ? ready >= 2
              ? 'Tout le monde est là ? Lance le combat !'
              : 'On attend que tes amis acceptent l’invitation…'
            : 'Tu es prêt ! On attend que l’hôte lance la partie.'}
        </SpeechBubble>
      </div>
      <div className="flex flex-wrap gap-3">
        {host && (
          <GameButton size="lg" variant="danger" icon="icons-navigation-play" disabled={ready < 2} onClick={start}>
            Lancer le combat
          </GameButton>
        )}
        <GameButton variant="surface" onClick={leave}>
          Quitter
        </GameButton>
      </div>
    </PageShell>
  );
}

export function Countdown({ deadline }: { readonly deadline: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, Math.ceil((deadline - now) / 1000));
  return (
    <span
      role="timer"
      className={`font-display rounded-full px-3 py-1 text-lg ${left <= 10 ? 'bg-danger text-white' : 'bg-surface-2'}`}
    >
      ⏱ {left} s
    </span>
  );
}

function ArenaGame({ profile, arena }: { readonly profile: Profile; readonly arena: ArenaView }) {
  const navigate = useNavigate();
  const answer = useRealtime((s) => s.answerArena);
  const leave = useRealtime((s) => s.leaveArena);
  const q = arena.question;
  const question = useMemo(() => (q ? generate(q.skillId, q.level, q.seed) : null), [q]);
  const myTurn = arena.turnId === profile.id;
  const name = (id: string | null) => arena.players.find((p) => p.id === id)?.name ?? '?';
  const turnName = name(arena.turnId);
  const last = arena.last;
  // Réplique de mon héros quand c'est moi qui viens de jouer (ou qui suis attaqué).
  const myLine = useMemo(() => {
    if (!last) return null;
    if (last.playerId === profile.id) return heroSays(profile.hero, last.correct ? 'shoot' : 'hurt');
    if (last.targetId === profile.id) return heroSays(profile.hero, 'hurt');
    return null;
  }, [last, profile.id, profile.hero]);

  if (arena.phase === 'over') {
    const won = arena.raid ? arena.raid.won === true : arena.winnerId === profile.id;
    const line = heroSays(profile.hero, won ? 'victory' : 'defeat');
    return (
      <PageShell title={arena.raid ? 'Raid' : 'Arène'} back="/multi">
        {won && <Confetti />}
        <div className="flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-toon text-4xl tracking-wide">{overTitle(arena, profile.id)}</h1>
          {arena.raid && <RaidBars raid={arena.raid} />}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {arena.players.map((p) => (
              <PlayerChip key={p.id} arena={arena} id={p.id} me={profile.id} />
            ))}
          </div>
          <div className="w-full max-w-lg text-left">
            <HeroSays hero={profile.hero} face={line.face} text={line.text} delay={0.3} />
          </div>
          <GameButton
            icon="icons-navigation-next"
            onClick={() => {
              leave();
              void navigate('/multi');
            }}
          >
            Retour
          </GameButton>
        </div>
      </PageShell>
    );
  }

  return (
    <div className="mx-auto flex h-dvh max-w-6xl flex-col gap-3 px-3 py-3 sm:px-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {arena.players.map((p) => (
          <PlayerChip key={p.id} arena={arena} id={p.id} me={profile.id} />
        ))}
      </div>
      {last && (
        <motion.p
          key={arena.turn}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`cartoon px-3 py-2 text-center font-bold ${last.correct ? 'bg-success text-white' : 'bg-[#ffdcdc] text-on-light'}`}
          role="status"
        >
          {eventText(arena, last)}
        </motion.p>
      )}
      {arena.raid && <RaidBars raid={arena.raid} />}
      {myLine && (
        <HeroSays key={`l-${arena.turn}`} hero={profile.hero} face={myLine.face} text={myLine.text} delay={0.2} />
      )}
      <div className="flex items-center gap-2">
        <span className="font-display flex-1 text-xl tracking-wide">
          {myTurn ? 'À toi de jouer !' : `Au tour de ${turnName}…`}
        </span>
        {arena.deadline && <Countdown deadline={arena.deadline} />}
        <GameButton size="sm" variant="surface" onClick={leave}>
          Quitter
        </GameButton>
      </div>
      {question && q && (
        <main className="side:grid side:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] flex min-h-0 flex-1 flex-col gap-3">
          <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            <h1 className="text-2xl leading-snug font-bold sm:text-3xl">
              <MathText text={question.prompt} />
            </h1>
            {question.figure && <Figure figure={question.figure} maxHeight="var(--figure-max)" />}
          </section>
          {myTurn ? (
            <section
              className={`side:h-[min(100%,520px)] side:self-center flex ${DOCK_HEIGHT} min-h-0 shrink-0 flex-col`}
            >
              <QuestionTools
                key={`${q.seed}-${arena.turn}`}
                question={question}
                skill={getAnySkill(q.skillId)}
                picked={null}
                onSubmit={(r) => answer(r)}
              />
            </section>
          ) : (
            <div className="cartoon bg-surface-2 flex items-center gap-3 p-3">
              <Questy mood="wow" size={56} />
              <p className="font-bold">Cherche aussi dans ta tête : ce sera peut-être ton tour après !</p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

/** Raid : vie du boss et cœurs de l'équipe. */
export function RaidBars({ raid }: { readonly raid: RaidStatus }) {
  return (
    <div className="grid w-full gap-2 sm:grid-cols-2">
      <div className="cartoon bg-surface flex flex-col gap-1 p-2">
        <span className="font-bold">
          Boss : {raid.bossHp} / {raid.bossMaxHp} PV
        </span>
        <span
          role="progressbar"
          aria-label="Vie du boss"
          aria-valuemin={0}
          aria-valuemax={raid.bossMaxHp}
          aria-valuenow={raid.bossHp}
          className="bg-surface-2 border-outline h-4 overflow-hidden rounded-full border-2"
        >
          <span className="bg-danger block h-full" style={{ width: `${(raid.bossHp / raid.bossMaxHp) * 100}%` }} />
        </span>
      </div>
      <div
        className="cartoon bg-surface flex items-center gap-2 p-2"
        aria-label={`Cœurs de l’équipe : ${raid.teamHearts} sur ${raid.teamMaxHearts}`}
      >
        <span className="font-bold">Équipe :</span>
        <span aria-hidden className="text-xl">
          {'❤️'.repeat(raid.teamHearts)}
          {'🤍'.repeat(raid.teamMaxHearts - raid.teamHearts)}
        </span>
      </div>
    </div>
  );
}
