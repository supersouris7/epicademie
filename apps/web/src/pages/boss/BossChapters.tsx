import { useState } from 'react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useParams } from 'react-router';
import { chaptersOf, type Chapter } from '@questeo/content';
import { HINT_PRICE, ITEM_INFO, ITEMS, SUBJECTS, type BossRecord, type Profile } from '@questeo/shared';
import { bossesKey, buyHint, useBosses } from '../../api/battles.ts';
import { GameButton } from '../../components/game/GameButton.tsx';
import { GameIcon } from '../../components/game/GameIcon.tsx';
import { GamePanel } from '../../components/game/GamePanel.tsx';
import { SoonBadge } from '../../components/game/SoonBadge.tsx';
import { ResourceCounter } from '../../components/game/ResourceCounter.tsx';
import { Questy } from '../../components/mascot/Questy.tsx';
import { PageShell } from '../../components/PageShell.tsx';
import { SpeechBubble } from '../../components/SpeechBubble.tsx';
import { useToast } from '../../components/Toast.tsx';
import { assetSrc } from '../../design/assets.ts';
import { bossFilter, bossOf } from '../../design/bosses.ts';
import { ITEM_ICONS } from '../../design/items.ts';
import { ApiError } from '../../api/client.ts';

/** Combat de boss : un boss par chapitre, tous ouverts d'emblée ; l'équipement se gagne à l'entraînement. */
export function BossChapters({ profile }: { readonly profile: Profile }) {
  const { subject = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toast, showToast] = useToast(2500);
  const [busy, setBusy] = useState(false);
  const info = SUBJECTS.find((s) => s.id === subject);
  const chapters = chaptersOf(subject);
  const { data: overview } = useBosses(profile.id);
  if (!info || chapters.length === 0) return <Navigate to="/jouer/boss" replace />;
  const records = new Map((overview?.records ?? []).map((r) => [r.chapterId, r]));
  const inventory = overview?.inventory ?? { bouclier: 0, soin: 0, indice: 0 };

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
          Choisis ton boss : bats ses 7 mobs, puis retire-lui ses 3 vies ! Ton équipement se gagne dans les coffres de
          l’entraînement.
        </SpeechBubble>
      </div>

      <GamePanel title="Équipement" className="flex flex-col gap-3">
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
      </GamePanel>

      <ul className="grid gap-4 lg:grid-cols-2">
        {sorted.map((c, i) => (
          <BossRow
            key={c.id}
            chapter={c}
            index={i}
            record={records.get(c.id)}
            onFight={() => void navigate(`/partie/boss/${c.id}`)}
            onSoon={() => showToast('Ce boss arrive bientôt !')}
          />
        ))}
      </ul>
      {toast}
    </PageShell>
  );
}

interface BossRowProps {
  readonly chapter: Chapter;
  readonly index: number;
  readonly record: BossRecord | undefined;
  readonly onFight: () => void;
  readonly onSoon: () => void;
}

function BossRow({ chapter, index, record, onFight, onSoon }: BossRowProps) {
  const boss = bossOf(chapter);
  const ready = Boolean(chapter.boss);
  // Boss à venir : pas de portrait (case vide).
  const portrait = ready ? assetSrc(`bosses-maths-${boss.id}-portrait`) : null;
  const body = (
    <>
      <div className="bg-accent-strong relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
        {portrait && (
          <img
            src={portrait}
            alt=""
            aria-hidden
            className="h-full w-full object-contain p-1"
            style={{ filter: bossFilter(chapter.id) }}
          />
        )}
        {record && (
          <span className="absolute -right-1 -bottom-1">
            <GameIcon id="rewards-medals-or" size={36} label="Médaille de boss" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="font-display text-xl leading-tight tracking-wide">{chapter.title}</span>
        <span className="text-muted text-sm font-bold">
          {ready ? boss.name : 'Boss à venir'}
          {record ? ` · vaincu ${record.wins} fois` : ''}
        </span>
      </div>
    </>
  );
  return (
    <motion.li
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {ready ? (
        <div className="cartoon bg-surface flex flex-wrap items-center gap-3 p-3">
          {body}
          <GameButton variant="danger" size="sm" icon="icons-navigation-play" onClick={onFight}>
            {record ? 'Rejouer' : 'Combattre'}
          </GameButton>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSoon}
          aria-label={`${chapter.title}, boss à venir`}
          className="cartoon bg-surface flex w-full items-center gap-3 p-3 opacity-60 grayscale"
        >
          {body}
        </button>
      )}
      {!ready && <SoonBadge />}
    </motion.li>
  );
}
