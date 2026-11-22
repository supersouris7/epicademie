import { useState } from 'react';
import { motion } from 'motion/react';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate, NavigationType, useLocation, useNavigate, useNavigationType, useParams } from 'react-router';
import { chaptersOf, type Chapter } from '@questeo/content';
import {
  BOSS_MEDAL_LABELS,
  ITEM_INFO,
  ITEMS,
  MAX_ITEMS_PER_BATTLE,
  SUBJECTS,
  type ItemId,
  type BossRecord,
  type Profile,
} from '@questeo/shared';
import { bossesKey, equipItems, useBosses } from './api.ts';
import { HeroFace } from '../../shared/battle/HeroFace.tsx';
import { BlinkText } from '../../shared/ui/game/BlinkText.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { GameIcon } from '../../shared/ui/game/GameIcon.tsx';
import { SoonBadge } from '../../shared/ui/game/SoonBadge.tsx';
import { GradeTabs } from '../../shared/ui/GradeTabs.tsx';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { useToast } from '../../shared/ui/Toast.tsx';
import { PremiumLock } from '../../shared/ui/game/PremiumLock.tsx';
import { useChapterAccess } from '../parent/index.ts';

/** Chapitre réservé à l'abonnement familial. */
const LOCKED = 'Ce chapitre fait partie de l’abonnement familial : demande à tes parents !';
import { BOSS_MEDAL_ICONS, bossHeadId, bossOfSubject } from '../../design/bosses.ts';
import { assetSrc, characterSrc } from '../../design/assets.ts';
import { BossCloseUp } from '../../shared/battle/BattleScenes.tsx';
import { subjectTaunt } from '../../shared/lib/battleLines.ts';

import { ITEM_ICONS } from '../../design/items.ts';
import { ApiError } from '../../shared/api/client.ts';
import { useGradeChoice } from '../../shared/lib/grades.ts';
import { useEntrance } from '../../shared/lib/entrance.ts';

/** Combat de boss : un boss par chapitre, tous ouverts d'emblée ; l'équipement se gagne à l'entraînement. */
export function BossChapters({ profile }: { readonly profile: Profile }) {
  const equipBg = assetSrc('environments-equipement-fond');
  const { subject = '' } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [toast, showToast] = useToast(2500);
  const canPlay = useChapterAccess();
  const [busy, setBusy] = useState(false);
  // Gros plan du boss qui provoque, à chaque entrée dans la matière (passable d'un toucher).
  // …mais pas au retour d'un combat ni par « précédent ».
  const location = useLocation();
  const navType = useNavigationType();
  const [closeUp, setCloseUp] = useState(
    // (Le 1er chargement de la page, adresse tapée ou rechargement, compte comme une entrée.)
    () =>
      (navType !== NavigationType.Pop || location.key === 'default') &&
      !(location.state as { fromBattle?: boolean } | null)?.fromBattle,
  );
  const [roll] = useState(Math.random);
  const info = SUBJECTS.find((s) => s.id === subject);
  const { grade, grades, own, setGrade } = useGradeChoice(profile, subject);
  const chapters = chaptersOf(subject, grade);
  const { data: overview } = useBosses(profile.id);
  if (!info || chapters.length === 0) return <Navigate to="/jouer/boss" replace />;
  const records = new Map((overview?.records ?? []).map((r) => [r.chapterId, r]));
  const inventory = overview?.inventory ?? { bouclier: 0, soin: 0, indice: 0 };
  const equipped = overview?.equipped ?? [];
  // Réserve : ce que le joueur possède sans l'avoir équipé.
  const reserve = Object.fromEntries(
    ITEMS.map((i) => [i, inventory[i] - equipped.filter((e) => e === i).length]),
  ) as Record<ItemId, number>;
  const equip = (items: readonly ItemId[]) =>
    run(async () => qc.setQueryData(bossesKey(profile.id), await equipItems(profile.id, items)));
  const subjectIds = new Set(chaptersOf(subject).map((c) => c.id));
  const wins = (overview?.records ?? []).filter((r) => subjectIds.has(r.chapterId)).reduce((n, r) => n + r.wins, 0);
  const boss = bossOfSubject(subject);

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
    <PageShell title="Mode Histoire" back="/jouer/boss">
      {/* Équipement : la tête du héros et ses 3 emplacements ; dessous, la réserve (ce qui n'est pas équipé). */}
      <section
        aria-labelledby="equipement"
        className="cartoon bg-surface-2 relative isolate flex flex-col gap-3 overflow-hidden p-3"
      >
        {equipBg && (
          <>
            <img
              src={equipBg}
              alt=""
              aria-hidden
              className="absolute inset-0 -z-10 h-full w-full object-cover object-center"
            />
            {/* Voile léger : textes et emplacements restent lisibles. */}
            <div aria-hidden className="absolute inset-0 -z-10 bg-[#1b0a3d]/45" />
          </>
        )}
        <BlinkText as="h2" id="equipement" delay={0} className="font-display text-toon text-xl tracking-wide">
          Équipe-toi pour ce combat
        </BlinkText>
        <div className="flex items-center gap-3">
          <HeroFace hero={profile.hero} expression="determine" size={64} />
          <div className="flex gap-2" aria-label="Objets équipés">
            {Array.from({ length: MAX_ITEMS_PER_BATTLE }, (_, i) => {
              const item = equipped[i];
              return item ? (
                <button
                  key={`${item}-${i}`}
                  type="button"
                  disabled={busy}
                  onClick={() => void equip(equipped.filter((_, k) => k !== i))}
                  aria-label={`${ITEM_INFO[item].name} équipé : toucher pour le remettre en réserve`}
                  className="cartoon cartoon-press bg-surface-2 flex h-16 w-16 items-center justify-center"
                >
                  <GameIcon id={ITEM_ICONS[item]} size={44} />
                </button>
              ) : (
                <span
                  key={`vide-${i}`}
                  role="img"
                  aria-label="Emplacement vide"
                  className="h-16 w-16 rounded-2xl border-[3px] border-dashed border-white/70"
                />
              );
            })}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-white">Réserve :</span>
          {ITEMS.map((item) => {
            const left = reserve[item];
            const full = equipped.length >= MAX_ITEMS_PER_BATTLE;
            return (
              <button
                key={item}
                type="button"
                disabled={busy || left <= 0 || full}
                onClick={() => void equip([...equipped, item])}
                title={`${ITEM_INFO[item].effect}. ${ITEM_INFO[item].earn}.`}
                aria-label={`${ITEM_INFO[item].name} × ${left} en réserve${left > 0 && !full ? ' : toucher pour l’équiper' : ''}`}
                className="cartoon cartoon-press bg-surface-2 font-display flex items-center gap-1 rounded-full py-0.5 pr-3 pl-1 text-lg disabled:opacity-50"
              >
                <GameIcon id={ITEM_ICONS[item]} size={30} />× {left}
              </button>
            );
          })}
        </div>
      </section>

      <GradeTabs grades={grades} value={grade} own={own} onChange={setGrade} />
      <ul className="grid gap-4 lg:grid-cols-2">
        {sorted.map((c, i) => (
          <BossRow
            key={c.id}
            chapter={c}
            index={i}
            record={records.get(c.id)}
            locked={!canPlay(c.id)}
            onFight={() => (canPlay(c.id) ? void navigate(`/partie/boss/${c.id}`) : showToast(LOCKED))}
            onSoon={() => showToast('Ce boss arrive bientôt !')}
          />
        ))}
      </ul>
      {toast}
      {closeUp && overview && (
        <BossCloseUp
          bossId={boss.id}
          name={boss.name}
          text={subjectTaunt(wins, profile.gender, roll, subject)}
          expression={wins === 0 ? 'moqueur' : 'colere'}
          onDone={() => setCloseUp(false)}
        />
      )}
    </PageShell>
  );
}

interface BossRowProps {
  /** Chapitre réservé à l'abonnement familial. */
  readonly locked: boolean;
  readonly chapter: Chapter;
  readonly index: number;
  readonly record: BossRecord | undefined;
  readonly onFight: () => void;
  readonly onSoon: () => void;
}

function BossRow({ chapter, index, record, locked, onFight, onSoon }: BossRowProps) {
  const enter = useEntrance();
  const ready = Boolean(chapter.boss);
  const boss = bossOfSubject(chapter.subject);
  const body = (
    <>
      {/* La tête du boss du chapitre (cadre provisoire s'il n'est pas encore dessiné), puis la médaille. */}
      <img
        src={characterSrc(bossHeadId(boss.id, 'menace'))}
        alt=""
        aria-hidden
        className="h-14 w-14 shrink-0 object-contain"
      />
      {record ? (
        <GameIcon
          id={BOSS_MEDAL_ICONS[record.bestMedal]}
          size={64}
          label={`Médaille ${BOSS_MEDAL_LABELS[record.bestMedal]}`}
        />
      ) : (
        <span
          role="img"
          aria-label="Pas encore de médaille"
          className="border-outline/60 h-16 w-16 shrink-0 rounded-full border-[3px] border-dashed"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="font-display text-xl leading-tight tracking-wide">{chapter.title}</span>
        {locked && <PremiumLock />}
        <span className="text-muted text-sm font-bold">
          {/* Même boss partout : on montre plutôt où l'on en est. */}
          {!ready
            ? 'Boss à venir'
            : record
              ? `Médaille ${BOSS_MEDAL_LABELS[record.bestMedal]} · vaincu ${record.wins} fois`
              : 'Pas encore vaincu'}
        </span>
      </div>
    </>
  );
  return (
    <motion.li
      initial={enter ? { y: 20, opacity: 0 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {ready ? (
        <div className="cartoon bg-surface flex flex-wrap items-center gap-3 p-3">
          {body}
          <GameButton
            variant="danger"
            size="sm"
            icon="icons-navigation-play"
            onClick={onFight}
            className="w-full sm:w-auto"
          >
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
