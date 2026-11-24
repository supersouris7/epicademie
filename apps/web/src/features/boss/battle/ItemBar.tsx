import { itemRefusal } from '@epicademie/engine';
import { ITEM_INFO, MAX_ITEMS_PER_BATTLE, type BattleView, type ItemId } from '@epicademie/shared';
import { GameIcon } from '../../../shared/ui/game/GameIcon.tsx';
import { ITEM_ICONS } from '../../../design/items.ts';

/** Les 3 emplacements d'équipement du combat : un objet équipé par case, case vide une fois utilisé. */
export function ItemBar({
  battle,
  disabled,
  onUse,
}: {
  readonly battle: BattleView;
  readonly disabled: boolean;
  readonly onUse: (item: ItemId) => void;
}) {
  return (
    <div className="flex gap-1.5" aria-label="Objets équipés">
      {Array.from({ length: MAX_ITEMS_PER_BATTLE }, (_, i) => {
        const item = battle.equipped[i];
        if (!item)
          return (
            <span
              key={`vide-${i}`}
              aria-label="Emplacement vide"
              role="img"
              className="border-outline/60 h-11 w-11 rounded-xl border-2 border-dashed"
            />
          );
        const off = disabled || itemRefusal(battle, item) !== null;
        return (
          <button
            key={`${item}-${i}`}
            type="button"
            onClick={() => onUse(item)}
            aria-label={`${ITEM_INFO[item].name} : ${ITEM_INFO[item].effect}`}
            title={ITEM_INFO[item].effect}
            className={`cartoon cartoon-press bg-surface-2 relative flex h-11 w-11 items-center justify-center ${off ? 'opacity-45' : ''}`}
          >
            <GameIcon id={ITEM_ICONS[item]} size="sm" />
          </button>
        );
      })}
    </div>
  );
}
