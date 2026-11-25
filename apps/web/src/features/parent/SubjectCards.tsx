import { ProgressBar } from '../../shared/ui/game/ProgressBar.tsx';
import { SubjectIcon } from '../../shared/ui/game/SubjectIcon.tsx';
import { masteredPhrase, type SubjectBar } from './subjectProgress.ts';

/** Contenu d'une carte matière : relique sur la couleur de la matière, nom, barre, phrase. */
export function SubjectCardBody({ bar }: { readonly bar: SubjectBar }) {
  return (
    <>
      <span
        className="flex size-16 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `var(--subject-${bar.color})` }}
      >
        <SubjectIcon subject={bar.id} name={bar.name} {...bar.relic} size={48} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
        <span className="text-base font-bold">{bar.name}</span>
        <ProgressBar
          value={bar.acquired}
          max={Math.max(1, bar.total)}
          color="var(--success)"
          label={`Notions maîtrisées en ${bar.name}`}
          size="sm"
        />
        <span className="text-sm">{masteredPhrase(bar.acquired, bar.total)}</span>
      </span>
    </>
  );
}

/** Une carte par matière ; toucher une carte appelle onPick (détail par chapitre). */
export function SubjectCards({
  bars,
  selected,
  onPick,
}: {
  readonly bars: readonly SubjectBar[];
  readonly selected?: string | undefined;
  readonly onPick: (id: SubjectBar['id']) => void;
}) {
  return (
    // Deux colonnes selon la largeur du bloc, pas de l'écran : en tablette, les cartes enfant sont côte à côte.
    <div className="@container">
      <ul className="grid grid-cols-1 gap-2 @min-[26rem]:grid-cols-2" aria-label="Avancement par matière">
        {bars.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onPick(b.id)}
              aria-pressed={selected === b.id}
              aria-label={`${b.name} : ${masteredPhrase(b.acquired, b.total)}`}
              className={`bg-surface-2 flex min-h-20 w-full items-center gap-3 rounded-2xl p-2 ${selected === b.id ? 'outline-accent outline-2' : ''}`}
            >
              <SubjectCardBody bar={b} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Détail d'une matière : une barre par chapitre, puis les notions à retravailler. */
export function SubjectDetail({ bar }: { readonly bar: SubjectBar }) {
  return (
    <section aria-label={`Détail ${bar.name}`} className="flex flex-col gap-2">
      <h3 className="text-base font-bold">{bar.name}, chapitre par chapitre</h3>
      <ul className="flex flex-col gap-2">
        {bar.chapters.map((c) => (
          <li key={c.id} className="flex flex-col gap-1">
            <span className="text-sm font-bold">{c.title}</span>
            <ProgressBar
              value={c.acquired}
              max={Math.max(1, c.total)}
              color="var(--success)"
              label={`Notions maîtrisées, chapitre ${c.title}`}
              size="sm"
            />
            <span className="text-xs">{masteredPhrase(c.acquired, c.total)}</span>
          </li>
        ))}
      </ul>
      {bar.toRework.length > 0 && (
        <p className="text-sm">
          <span className="font-bold">À retravailler : </span>
          {bar.toRework.join(', ')}
        </p>
      )}
    </section>
  );
}
