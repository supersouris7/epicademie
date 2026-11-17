import { useState } from 'react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf, type Chapter } from '@questeo/content';
import { bossUnlock } from '@questeo/engine';
import {
  AMMO,
  DEFAULT_AMMO,
  getAmmo,
  HINT_PRICE,
  ITEM_INFO,
  ITEMS,
  SUBJECTS,
  type BossRecord,
  type Profile,
} from '@questeo/shared';
import { bossesKey, buyHint, equipAmmo, useBosses } from '../../api/battles.ts';
import { useSkills } from '../../api/play.ts';
import { AmmoOrb } from '../../components/battle/BattleArena.tsx';
import { GameButton } from '../../components/game/GameButton.tsx';
import { GameIcon } from '../../components/game/GameIcon.tsx';
import { GamePanel } from '../../components/game/GamePanel.tsx';
import { ResourceCounter } from '../../components/game/ResourceCounter.tsx';
import { Questy } from '../../components/mascot/Questy.tsx';
import { PageShell } from '../../components/PageShell.tsx';
import { SpeechBubble } from '../../components/SpeechBubble.tsx';
import { useToast } from '../../components/Toast.tsx';
import { assetSrc } from '../../design/assets.ts';
import { bossFilter, bossOf } from '../../design/bosses.ts';
import { ITEM_ICONS } from '../../design/items.ts';
import { ApiError } from '../../api/client.ts';

/** Combat de boss : un boss par chapitre, débloqué quand chaque notion a été réussie à l'entraînement. */
export function BossChapters({ profile }: { readonly profile: Profile }) {
  const { subject = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toast, showToast] = useToast(2500);
  const [busy, setBusy] = useState(false);
  const info = SUBJECTS.find((s) => s.id === subject);
  const chapters = chaptersOf(subject);
  const { data: skills } = useSkills(profile.id);
  const { data: overview } = useBosses(profile.id);
  if (!info || chapters.length === 0) return <Navigate to="/jouer/boss" replace />;
  const states = new Map((skills ?? []).map((s) => [s.skillId, s]));
  const records = new Map((overview?.records ?? []).map((r) => [r.chapterId, r]));
  const inventory = overview?.inventory ?? { bouclier: 0, soin: 0, indice: 0 };
  const equipped = getAmmo(profile.ammo).id;
  const owned = (id: string) => {
    const a = getAmmo(id);
    return a.chapterId === null || records.has(a.chapterId);
  };

  const run = async (fn: () => Promise<unknown>, done?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (done) showToast(done);
      void qc.invalidateQueries({ queryKey: bossesKey(profile.id) });
      void qc.invalidateQueries({ queryKey: ['profiles'] });
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Problème de connexion');
    } finally {
      setBusy(false);
    }
  };

  // Chapitres avec boss d'abord, ceux « À venir » ensuite.
  const sorted = [...chapters.filter((c) => c.boss), ...chapters.filter((c) => !c.boss)];

  return (
    <PageShell title="Combat de boss" back="/jouer/boss">
      <div className="flex items-center gap-4">
        <Questy size={120} mood="angry" />
        <SpeechBubble>
          Réussis chaque notion d’un chapitre à l’entraînement pour réveiller son boss. Puis bats ses 7 mobs et
          retire-lui ses 3 vies !
        </SpeechBubble>
      </div>

      <GamePanel title="Ton sac" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {ITEMS.map((item) => (
            <div
              key={item}
              className="cartoon bg-surface-2 flex items-center gap-2 px-3 py-2"
              title={ITEM_INFO[item].earn}
            >
              <GameIcon id={ITEM_ICONS[item]} size="sm" />
              <span className="flex flex-col leading-tight">
                <span className="font-display text-lg">
                  {ITEM_INFO[item].name} × {inventory[item]}
                </span>
                <span className="text-muted text-xs font-bold">{ITEM_INFO[item].earn}</span>
              </span>
            </div>
          ))}
          <span className="flex-1" />
          <ResourceCounter icon="icons-resources-coin" value={profile.coins} label={`${profile.coins} pièces`} />
          <GameButton
            size="sm"
            variant="accent"
            icon="icons-navigation-hint"
            disabled={busy || profile.coins < HINT_PRICE}
            onClick={() => void run(() => buyHint(profile.id), 'Indice acheté !')}
          >
            Indice : {HINT_PRICE} pièces
          </GameButton>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-display text-lg tracking-wide">Munitions</span>
          <div role="radiogroup" aria-label="Munition" className="flex flex-wrap gap-2">
            {AMMO.map((a) => {
              const have = owned(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  role="radio"
                  aria-checked={equipped === a.id}
                  aria-label={have ? a.name : `${a.name}, à gagner`}
                  disabled={!have || busy}
                  onClick={() =>
                    void run(
                      () => equipAmmo(profile.id, a.id),
                      a.id === DEFAULT_AMMO ? undefined : `${a.name} équipée !`,
                    )
                  }
                  className={`cartoon cartoon-press flex items-center gap-2 px-3 py-1.5 font-bold ${equipped === a.id ? 'bg-accent text-toon' : 'bg-surface-2'} ${have ? '' : 'opacity-50 grayscale'}`}
                >
                  <AmmoOrb ammo={a} size={32} />
                  {a.name}
                </button>
              );
            })}
          </div>
        </div>
      </GamePanel>

      <ul className="grid gap-4 sm:grid-cols-2">
        {sorted.map((c, i) => {
          const unlock = bossUnlock(
            c.skills.map((s) => s.id),
            states,
          );
          return (
            <BossRow
              key={c.id}
              chapter={c}
              index={i}
              record={records.get(c.id)}
              done={unlock.done}
              total={unlock.total}
              unlocked={unlock.unlocked}
              onFight={() => void navigate(`/partie/boss/${c.id}`)}
              onTrain={() => void navigate(`/jouer/entrainement/${subject}/${c.id}`)}
              onSoon={() => showToast('Ce boss arrive bientôt !')}
            />
          );
        })}
      </ul>
      {toast}
    </PageShell>
  );
}

interface BossRowProps {
  readonly chapter: Chapter;
  readonly index: number;
  readonly record: BossRecord | undefined;
  readonly done: number;
  readonly total: number;
  readonly unlocked: boolean;
  readonly onFight: () => void;
  readonly onTrain: () => void;
  readonly onSoon: () => void;
}

function BossRow({ chapter, index, record, done, total, unlocked, onFight, onTrain, onSoon }: BossRowProps) {
  const boss = bossOf(chapter);
  const ready = Boolean(chapter.boss);
  // Boss à venir : pas de portrait (case vide) ; boss endormi : silhouette noire.
  const portrait = ready ? assetSrc(`bosses-maths-${boss.id}-portrait`) : null;
  return (
    <motion.li
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className={`cartoon bg-surface relative flex items-center gap-3 p-3 ${ready ? '' : 'opacity-60 grayscale'}`}
    >
      <div className="bg-accent-strong relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
        {portrait && (
          <img
            src={portrait}
            alt=""
            aria-hidden
            className={`h-full w-full object-contain p-1 ${unlocked || record ? '' : 'brightness-0'}`}
            style={{ filter: unlocked || record ? bossFilter(chapter.id) : undefined }}
          />
        )}
        {record && (
          <span className="absolute -right-1 -bottom-1">
            <GameIcon id="rewards-medals-or" size={36} label="Médaille de boss" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-display truncate text-xl tracking-wide">{chapter.title}</span>
        <span className="text-muted truncate text-sm font-bold">
          {ready ? boss.name : 'Boss à venir'}
          {record ? ` · vaincu ${record.wins} fois` : ''}
        </span>
        {ready && !unlocked && !record && (
          <span className="text-sm font-bold">
            Notions réussies : {done}/{total}
          </span>
        )}
      </div>
      {!ready ? (
        <span className="bg-gold text-on-light font-display rounded-full px-2.5 py-0.5 text-sm">
          <button type="button" onClick={onSoon} aria-label={`${chapter.title}, boss à venir`}>
            À venir
          </button>
        </span>
      ) : unlocked || record ? (
        <GameButton variant="danger" size="sm" icon="icons-navigation-play" onClick={onFight}>
          {record ? 'Rejouer' : 'Combattre'}
        </GameButton>
      ) : (
        <GameButton variant="surface" size="sm" icon="icons-status-locked" onClick={onTrain}>
          S’entraîner
        </GameButton>
      )}
    </motion.li>
  );
}
