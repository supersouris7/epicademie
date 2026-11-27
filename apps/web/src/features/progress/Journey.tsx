import { useState } from 'react';
import { CHAPTERS, getSkill, pickSens } from '@epicademie/content';
import { acquired, medal, MEDAL_LABELS } from '@epicademie/engine';
import type { Journey, JourneyPoint, Profile, SkillProgress } from '@epicademie/shared';
import { useJourney } from './api.ts';
import { MedalBadge } from '../../shared/ui/game/RewardBadge.tsx';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { SensNote } from '../../shared/ui/SensNote.tsx';
import { ago } from '../../shared/lib/dates.ts';
import { masteryOf } from '../../shared/lib/progress.ts';

/**
 * Progrès personnel : les efforts de la semaine, le chemin parcouru sur chaque notion et « ce que tu
 * sais maintenant faire ». L'enfant n'est comparé qu'à lui-même (aucun classement).
 */

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

function Effort({ effort }: { readonly effort: Journey['effort'] }) {
  const { series, days, reworked, pauseDays } = effort;
  return (
    <section aria-labelledby="efforts" className="cartoon bg-surface flex flex-col gap-2 p-4">
      <h2 id="efforts" className="font-display text-2xl tracking-wide">
        Tes efforts de la semaine
      </h2>
      {pauseDays !== null && <p className="text-lg font-bold">Te revoilà après {pauseDays} jours de pause : bravo !</p>}
      {series === 0 && days === 0 ? (
        <p className="font-bold">Une première série et ton compteur démarre.</p>
      ) : (
        <ul className="flex flex-col gap-1 font-bold">
          <li>
            {plural(series, 'série terminée', 'séries terminées')} ·{' '}
            {plural(days, 'jour d’entraînement', 'jours d’entraînement')}
          </li>
          {reworked.length > 0 && (
            <li>
              {plural(reworked.length, 'notion retravaillée', 'notions retravaillées')} après un « pas encore » : c’est
              comme ça qu’on progresse.
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

const score = (p: JourneyPoint) => `${p.correct}/${p.answered}`;

function Gains({ journey }: { readonly journey: Journey }) {
  return (
    <section aria-labelledby="chemin" className="cartoon bg-surface flex flex-col gap-2 p-4">
      <h2 id="chemin" className="font-display text-2xl tracking-wide">
        Ton chemin
      </h2>
      {journey.gains.length === 0 ? (
        <p className="font-bold">Reviens sur une notion dans quelques jours : tu verras le chemin parcouru.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {journey.gains.map((g) => (
            <li key={g.skillId} className="bg-surface-2 rounded-2xl p-3">
              <p className="font-display text-lg tracking-wide">{getSkill(g.skillId)?.title}</p>
              <p className="font-bold">
                {ago(g.before.day, journey.today)} : {score(g.before)} → {ago(g.now.day, journey.today)} :{' '}
                <span className="text-success">{score(g.now)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Notions montrées avant « Tout voir ». */
const SHOWN = 5;

/** Notions acquises (or ou diamant) : celles maîtrisées sans aide d'abord, puis les dernières travaillées. */
function KnowHow({ profile, states }: { readonly profile: Profile; readonly states: readonly SkillProgress[] }) {
  const [all, setAll] = useState(false);
  const known = new Set(CHAPTERS.flatMap((c) => c.skills.map((s) => s.id)));
  const done = states
    .filter((s) => known.has(s.skillId) && acquired(s))
    .sort((a, b) => b.best - a.best || (b.lastPracticed ?? '').localeCompare(a.lastPracticed ?? ''));
  return (
    <section aria-labelledby="savoir-faire" className="cartoon bg-surface flex flex-col gap-2 p-4">
      <h2 id="savoir-faire" className="font-display text-2xl tracking-wide">
        Ce que tu sais maintenant faire
      </h2>
      {done.length === 0 ? (
        <p className="font-bold">Ta première notion en or ou en diamant s’affichera ici.</p>
      ) : (
        <ul className="flex flex-col gap-2" aria-labelledby="savoir-faire">
          {(all ? done : done.slice(0, SHOWN)).map((s) => {
            const skill = getSkill(s.skillId);
            const sens = pickSens(skill);
            const m = medal(s);
            return (
              <li key={s.skillId} className="bg-surface-2 flex items-start gap-3 rounded-2xl p-3">
                <MedalBadge medal={m} size={36} label={MEDAL_LABELS[m]} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg tracking-wide">{skill?.title}</p>
                  {m === 'diamant' && <p className="text-success font-bold">{masteryOf(s, profile.gender).label}</p>}
                  {sens && <SensNote sens={sens} />}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {done.length > SHOWN && !all && (
        <GameButton variant="surface" size="sm" className="min-h-11 self-center" onClick={() => setAll(true)}>
          Tout voir ({done.length})
        </GameButton>
      )}
    </section>
  );
}

export function JourneySections({
  profile,
  states,
}: {
  readonly profile: Profile;
  readonly states: readonly SkillProgress[];
}) {
  const { data } = useJourney(profile.id);
  return (
    <>
      {data && <Effort effort={data.effort} />}
      {data && <Gains journey={data} />}
      <KnowHow profile={profile} states={states} />
    </>
  );
}
