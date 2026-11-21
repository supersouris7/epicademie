import { useNavigate } from 'react-router';
import { getAnySkill, glossaryEntry } from '@questeo/content';
import { MathText } from '../../shared/question/MathText.tsx';
import { useTermReminders } from '../../shared/question/termReminders.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { useSkills } from './api.ts';
import { adviceFor, type RecapRow } from './advice.ts';

/**
 * Récap de fin de partie, commun à tous les modes : tableau des notions (réponses, justes) et
 * entraînement conseillé (« Tu devrais t'entraîner sur… ») avec un bouton qui le lance.
 */
export function GameRecap({
  profileId,
  rows,
  table = true,
}: {
  readonly profileId: string;
  readonly rows: readonly RecapRow[];
  /** Tableau des notions (sauf quand l'écran a déjà le sien, comme l'entraînement). */
  readonly table?: boolean;
}) {
  const navigate = useNavigate();
  const { data: history } = useSkills(profileId);
  const advice = adviceFor(rows, history);
  const words = useTermReminders();
  const title = (id: string) => getAnySkill(id)?.title ?? id;
  return (
    <section aria-labelledby="recap" className="cartoon bg-surface flex w-full flex-col gap-3 p-3 text-left">
      <h2 id="recap" className="font-display text-xl tracking-wide">
        Récap de la partie
      </h2>
      {table && rows.length > 0 && (
        <table className="w-full text-left">
          <thead>
            <tr className="text-muted text-sm">
              <th className="py-1">Notion</th>
              <th className="py-1 text-right">Justes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.skillId} className="border-outline/20 border-t">
                <td className="py-1.5 font-bold">{title(r.skillId)}</td>
                <td
                  className={`py-1.5 text-right font-bold ${r.correct < r.answered ? 'text-danger' : 'text-success'}`}
                >
                  {r.correct} / {r.answered}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Mots touchés pendant la partie (combat, défi) : leur définition, comme promis. */}
      {words.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg tracking-wide">Les mots que tu voulais revoir</h3>
          {words.map((id) => {
            const entry = glossaryEntry(id);
            return entry ? (
              <div key={id} className="bg-surface-2 rounded-2xl p-3">
                <p className="font-display text-lg tracking-wide">{entry.word}</p>
                <p>
                  <MathText text={entry.definition} />
                </p>
                <p className="text-muted text-sm">
                  <MathText text={entry.example} />
                </p>
              </div>
            ) : null;
          })}
        </div>
      )}
      {advice ? (
        <div className="bg-surface-2 flex flex-wrap items-center gap-3 rounded-2xl p-3">
          <Questy mood="wink" size={56} />
          <p className="min-w-0 flex-1 font-bold">
            Tu devrais t’entraîner sur <span className="font-display tracking-wide">{title(advice.skillId)}</span>
            {advice.from === 'historique' ? ' : c’est ta notion la plus fragile en ce moment.' : '.'}
          </p>
          <GameButton
            icon="icons-navigation-play"
            onClick={() => void navigate(`/partie/entrainement/${advice.chapterId}/${advice.skillId}`)}
          >
            S’entraîner
          </GameButton>
        </div>
      ) : (
        <p className="font-bold">Rien à retravailler pour l’instant : bravo !</p>
      )}
    </section>
  );
}
