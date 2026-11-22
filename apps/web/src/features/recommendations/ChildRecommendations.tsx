import { useNavigate } from 'react-router';
import { getAnySkill, getChapterOfSkill } from '@questeo/content';
import type { Profile } from '@questeo/shared';
import { GameButton } from '../../shared/ui/game/GameButton.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { useChildRecommendations } from './api.ts';

/**
 * Accueil de l'enfant : Questy présente le mot de son parent, avec un bouton qui lance directement
 * l'entraînement de la notion recommandée. Rien n'est affiché s'il n'y a pas de recommandation.
 */
export function ChildRecommendations({ profile }: { readonly profile: Profile }) {
  const navigate = useNavigate();
  const { data } = useChildRecommendations(profile.id);
  const items = (data ?? []).flatMap((r) => {
    const chapter = getChapterOfSkill(r.skillId);
    return chapter ? [{ rec: r, chapterId: chapter.id, title: getAnySkill(r.skillId)?.title ?? r.skillId }] : [];
  });
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="mot-parent" className="flex flex-col gap-3">
      <h2 id="mot-parent" className="font-display text-2xl tracking-wide">
        Ton parent te recommande
      </h2>
      <ul className="flex flex-col gap-3">
        {items.map(({ rec, chapterId, title }) => (
          <li key={rec.id} className="cartoon bg-gold text-on-light flex flex-wrap items-center gap-3 p-3">
            <Questy mood="happy" size={56} />
            <div className="min-w-0 flex-1">
              <p className="font-bold">
                Ton parent te propose de t’entraîner sur <span className="font-display tracking-wide">{title}</span>.
              </p>
              {rec.note && <blockquote className="mt-1 font-bold italic">« {rec.note} »</blockquote>}
            </div>
            <GameButton
              icon="icons-navigation-play"
              onClick={() => void navigate(`/partie/entrainement/${chapterId}/${rec.skillId}`)}
            >
              S’entraîner
            </GameButton>
          </li>
        ))}
      </ul>
    </section>
  );
}
