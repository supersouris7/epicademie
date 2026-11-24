import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { getAnySkill, glossaryEntry } from '@epicademie/content';
import { MathText } from '../../shared/question/MathText.tsx';
import { useTermReminders } from '../../shared/question/termReminders.ts';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { useSkills } from './api.ts';
import { oftenMissed, type RecapRow } from './advice.ts';
import type { Missed } from './types.ts';

/**
 * Récap de fin de partie (écran qui suit celui des récompenses), commun à tous les modes : tableau
 * des notions, erreurs commises (énoncé et bonne réponse) et, si une notion est souvent ratée, le
 * mot de Questy avec un bouton qui lance directement son entraînement.
 */
export function GameRecap({
  profileId,
  rows,
  table = true,
  missed = [],
}: {
  readonly profileId: string;
  readonly rows: readonly RecapRow[];
  /** Tableau des notions (sauf quand l'écran a déjà le sien, comme l'entraînement). */
  readonly table?: boolean;
  /** Questions ratées pendant la partie, avec la bonne réponse. */
  readonly missed?: readonly Missed[];
}) {
  const navigate = useNavigate();
  const { data: history } = useSkills(profileId);
  const advice = oftenMissed(rows, history);
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
      {missed.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="font-display text-lg tracking-wide">Tes erreurs ({missed.length})</h3>
          <ul className="flex flex-col gap-2">
            {missed.map((m, i) => (
              <li key={i} className="bg-surface-2 rounded-2xl p-3 text-lg">
                <MathText text={m.prompt} />
                <span className="text-muted mt-1 block font-bold">
                  Bonne réponse : <MathText text={m.answer} className="text-ink" />
                </span>
              </li>
            ))}
          </ul>
        </div>
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
            Tu fais souvent des erreurs sur <span className="font-display tracking-wide">{title(advice.skillId)}</span>.
            Tu devrais faire cet entraînement pour ne plus jamais hésiter !
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

/**
 * Écran « Ton récap » (2e écran de fin de partie, tous modes) : le récap puis les actions
 * proposées (`children`). Le 1er écran ne montre que les récompenses.
 */
export function RecapScreen({
  children,
  title = 'Ton récap',
  ...recap
}: {
  readonly profileId: string;
  readonly rows: readonly RecapRow[];
  readonly table?: boolean;
  readonly missed?: readonly Missed[];
  readonly title?: string;
  readonly children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-5 px-4 py-6">
      <h1 className="font-display text-3xl tracking-wide">{title}</h1>
      <GameRecap {...recap} />
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  );
}
