import { useState } from 'react';
import { Keyboard } from '../shared/question/tools/Keyboard.tsx';
import { typeKey } from '../shared/question/keyboard.ts';
import { HEROES } from '@questeo/shared';
import { MEDALS } from '@questeo/engine';
import { BossCard } from '../shared/ui/game/BossCard.tsx';
import { CharacterAvatar } from '../shared/ui/game/CharacterAvatar.tsx';
import { HeroCard } from '../shared/ui/game/CharacterCard.tsx';
import { GameButton } from '../shared/ui/game/GameButton.tsx';
import { GamePanel } from '../shared/ui/game/GamePanel.tsx';
import { BossHealthBar, EnergyBar, HealthBar, XPBar } from '../shared/ui/game/HudBars.tsx';
import { MedalBadge, RewardBadge } from '../shared/ui/game/RewardBadge.tsx';
import { ResourceCounter } from '../shared/ui/game/ResourceCounter.tsx';
import { PageShell } from '../shared/ui/PageShell.tsx';
import { Questy } from '../shared/ui/mascot/Questy.tsx';
import { QuestyPose } from '../shared/ui/mascot/QuestyPose.tsx';
import { MOOD_IDS } from '../shared/ui/mascot/moods.ts';
import { QUESTY_POSES } from '../shared/ui/mascot/poses.ts';
import { assetSrc, MANIFEST, type AssetStatus, type ManifestEntry } from '../design/assets.ts';

const STATUS_STYLE: Record<AssetStatus, string> = {
  disponible: 'bg-success',
  provisoire: 'bg-primary',
  manquant: 'bg-danger',
};

function AssetTile({ entry }: { readonly entry: ManifestEntry }) {
  const src = entry.format === 'composant' ? null : entry.format === 'svg' ? entry.path : assetSrc(entry.id);
  return (
    <li className="cartoon bg-surface flex flex-col gap-1 p-2 text-xs">
      <div className="bg-surface-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg [background-image:repeating-conic-gradient(var(--track)_0_25%,transparent_0_50%)] [background-size:16px_16px]">
        {src ? (
          <img src={src} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-muted p-2 text-center font-bold">aucune image</span>
        )}
      </div>
      <span className="truncate font-bold" title={entry.id}>
        {entry.id}
      </span>
      <span className="text-muted">
        {entry.format} · {entry.size}
        {entry.priority ? ` · P${entry.priority}` : ''}
      </span>
      <span className={`text-on-color w-fit rounded-full px-2 font-bold ${STATUS_STYLE[entry.status]}`}>
        {entry.status}
      </span>
    </li>
  );
}

function KeyboardDemo() {
  const [text, setText] = useState('');
  const [upper, setUpper] = useState(false);
  return (
    <GamePanel title="Clavier" className="flex flex-col gap-3">
      <p className="font-display min-h-10 text-2xl" aria-label="Saisie clavier">
        {text || '…'}
      </p>
      <Keyboard
        onKey={(k) => {
          setText((v) => typeKey(v, k, upper));
          setUpper(false);
        }}
        onSubmit={() => setText('')}
        canSubmit={text !== ''}
        upper={upper}
        onShift={() => setUpper((u) => !u)}
      />
    </GamePanel>
  );
}

function Gallery() {
  return (
    <div className="flex flex-col gap-8">
      <KeyboardDemo />
      <GamePanel title="Boutons" className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {(['primary', 'accent', 'info', 'success', 'danger', 'surface'] as const).map((v) => (
            <GameButton key={v} variant={v} icon="icons-navigation-play">
              {v}
            </GameButton>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <GameButton selected>Sélectionné</GameButton>
          <GameButton disabled>Désactivé</GameButton>
          <GameButton locked>Verrouillé</GameButton>
          <GameButton size="xl" icon="icons-navigation-play">
            Jouer
          </GameButton>
          {['home', 'back', 'settings', 'team', 'close', 'hint'].map((n) => (
            <GameButton key={n} variant="accent" iconOnly icon={`icons-navigation-${n}`} aria-label={n} />
          ))}
        </div>
      </GamePanel>
      <GamePanel title="HUD" className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-wrap gap-4">
          <ResourceCounter icon="icons-resources-coin" value={2480} label="2 480 pièces" onAdd={() => undefined} />
          <ResourceCounter icon="icons-resources-gem" value={320} label="320 gemmes" />
          <ResourceCounter icon="icons-resources-streak" value={7} label="Série de 7 jours" />
        </div>
        <XPBar level={12} xp={3450} xpForNext={5000} title="Championne" />
        <HealthBar value={3} max={5} />
        <EnergyBar value={45} max={50} />
        <div className="sm:col-span-2">
          <BossHealthBar
            name="Golem des Équations"
            hp={62}
            maxHp={100}
            portrait="bosses-maths-golem-des-equations-portrait"
          />
        </div>
      </GamePanel>
      <GamePanel title="Personnages" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <CharacterAvatar avatar={{ style: 'adventurer-neutral', seed: 'demo' }} level={12} />
          <CharacterAvatar avatar={{ style: 'pixelbot', seed: 'robot' }} size={64} />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {HEROES.map((h, i) => (
            <HeroCard key={h} hero={h} index={i} selected={i === 0} caption="Niv. 12" className="min-h-40" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <BossCard
            name="Golem des Équations"
            image="bosses-maths-golem-des-equations"
            subject="Maths"
            color="var(--subject-maths)"
          />
          <BossCard
            name="Géomatrix"
            image="bosses-maths-geomatrix"
            subject="Maths"
            color="var(--subject-maths)"
            defeated
          />
        </div>
      </GamePanel>
      <GamePanel title="Récompenses" className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {MEDALS.map((m) => (
            <MedalBadge key={m} medal={m} size={56} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <RewardBadge tone="gold" icon="icons-resources-xp" value="+120" label="XP" />
          <RewardBadge icon="icons-resources-coin" value="+12" label="pièces" />
          <RewardBadge tone="accent" icon="rewards-chests-rare" value="×1" label="coffre rare" />
          <RewardBadge icon="rewards-collectibles-trophy" value="Record" label="battu" />
        </div>
      </GamePanel>
      <GamePanel title="Questy" className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          {MOOD_IDS.map((m) => (
            <Questy key={m} mood={m} size={72} />
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {QUESTY_POSES.map((p) => (
            <figure key={p} className="flex flex-col items-center text-xs font-bold">
              <QuestyPose pose={p} mood="happy" size={96} />
              {p}
            </figure>
          ))}
        </div>
      </GamePanel>
    </div>
  );
}

/** Prévisualisation interne (développement uniquement) : composants et catalogue d'assets par catégorie. */
export function AssetPreview() {
  const [tab, setTab] = useState<'composants' | AssetStatus | 'tous'>('composants');
  const counts = { disponible: 0, provisoire: 0, manquant: 0 };
  for (const m of MANIFEST) counts[m.status]++;
  const shown = MANIFEST.filter((m) => tab === 'tous' || m.status === tab);
  const categories = [...new Set(shown.map((m) => m.category))].sort();
  return (
    <PageShell title="Atelier graphique" back="/">
      <div className="flex flex-wrap gap-2" role="tablist">
        {(['composants', 'tous', 'disponible', 'provisoire', 'manquant'] as const).map((t) => (
          <GameButton
            key={t}
            size="sm"
            role="tab"
            aria-selected={tab === t}
            variant={tab === t ? 'accent' : 'surface'}
            onClick={() => setTab(t)}
          >
            {t}
            {t in counts ? ` (${counts[t as AssetStatus]})` : t === 'tous' ? ` (${MANIFEST.length})` : ''}
          </GameButton>
        ))}
      </div>
      {tab === 'composants' ? (
        <Gallery />
      ) : (
        categories.map((cat) => (
          <GamePanel key={cat} title={cat}>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
              {shown
                .filter((m) => m.category === cat)
                .map((m) => (
                  <AssetTile key={m.id} entry={m} />
                ))}
            </ul>
          </GamePanel>
        ))
      )}
    </PageShell>
  );
}
