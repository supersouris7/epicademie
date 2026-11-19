import { useQueryClient } from '@tanstack/react-query';
import { ITEM_INFO, ITEM_PRICES, ITEMS, RUBY_PRICE, type Profile } from '@questeo/shared';
import { buyItem, bossesKey, useBosses } from '../api/battles.ts';
import { GameButton } from '../components/game/GameButton.tsx';
import { GameIcon } from '../components/game/GameIcon.tsx';
import { PageShell } from '../components/PageShell.tsx';
import { useToast } from '../components/Toast.tsx';
import { ITEM_ICONS } from '../design/items.ts';

/** Boutique simple : consommables contre pièces, rubis rares achetés séparément. */
export function Shop({ profile }: { readonly profile: Profile }) {
  const qc = useQueryClient();
  const { data: overview } = useBosses(profile.id);
  const [toast, showToast] = useToast();
  const buy = (item: (typeof ITEMS)[number] | 'rubis', price: number) => {
    if (profile.coins < price) {
      showToast(`Il te faut ${price} pièces.`);
      return;
    }
    void buyItem(profile.id, item)
      .then(() => {
        showToast(item === 'rubis' ? 'Rubis acheté !' : `${ITEM_INFO[item].name} acheté !`);
        void qc.invalidateQueries({ queryKey: ['profiles'] });
        void qc.invalidateQueries({ queryKey: bossesKey(profile.id) });
      })
      .catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Problème de connexion'));
  };
  return (
    <PageShell title="Boutique" nav={profile}>
      <p className="text-muted font-bold">Utilise tes pièces pour préparer tes combats. Les rubis sont très rares.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const price = ITEM_PRICES[item];
          return (
            <section key={item} className="cartoon bg-surface flex items-center gap-3 p-4">
              <GameIcon id={ITEM_ICONS[item]} size={56} />
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-2xl tracking-wide">{ITEM_INFO[item].name}</h2>
                <p className="text-muted font-bold">{ITEM_INFO[item].effect}</p>
                <p className="text-muted text-sm">En réserve : {overview?.inventory[item] ?? 0}</p>
              </div>
              <GameButton size="sm" disabled={profile.coins < price} onClick={() => buy(item, price)}>
                {price} <GameIcon id="icons-resources-coin" size={20} />
              </GameButton>
            </section>
          );
        })}
        <section className="cartoon bg-surface flex items-center gap-3 p-4">
          <GameIcon id="icons-resources-gem" size={56} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl tracking-wide">Rubis</h2>
            <p className="text-muted font-bold">Monnaie rare pour de futurs objets spéciaux.</p>
          </div>
          <GameButton size="sm" disabled={profile.coins < RUBY_PRICE} onClick={() => buy('rubis', RUBY_PRICE)}>
            {RUBY_PRICE} <GameIcon id="icons-resources-coin" size={20} />
          </GameButton>
        </section>
      </div>
      {toast}
    </PageShell>
  );
}
