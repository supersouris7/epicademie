import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { api, gradeInfo, type LearningReport, type Profile } from '@epicademie/shared';
import { request } from '../../shared/api/client.ts';
import { ParentPage } from './ParentShell.tsx';
import { CharacterAvatar } from '../../shared/ui/game/CharacterAvatar.tsx';
import { useProfiles } from '../profiles/index.ts';
import { ToReview } from './ToReview.tsx';
import { SubjectCards, SubjectDetail } from './SubjectCards.tsx';
import { useSubjectBars } from './useSubjectBars.ts';
import { synthesis, toReview } from './summary.ts';

/**
 * Espace parent, rubrique Progrès : vue de chaque enfant (cartes matière, « À réviser »), puis page
 * d'un enfant : synthèse, avancement par matière et chapitre, notions à réviser. Lecture seule. Réservé au parent (code PIN ou mot de passe, verrou de 10 minutes). Écrit pour un parent non technicien : des mots, peu de chiffres.
 */

const useLearning = (profileId: string) =>
  useQuery({
    queryKey: ['learning', profileId],
    queryFn: () => request(api.learningReport, { params: { id: profileId } }),
  });

export function ParentHome() {
  const { data: profiles, isPending } = useProfiles();
  return (
    <ParentPage title="Progrès de vos enfants">
      {isPending && <p>Chargement…</p>}
      {profiles?.length === 0 && (
        <p>
          Aucun profil enfant pour l’instant.{' '}
          <Link to="/parent/profils/nouveau" className="text-accent font-bold underline">
            Ajouter un enfant
          </Link>
        </p>
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        {profiles?.map((p) => (
          <ChildCard key={p.id} profile={p} />
        ))}
      </ul>
    </ParentPage>
  );
}

function ChildCard({ profile: p }: { readonly profile: Profile }) {
  const { data: r } = useLearning(p.id);
  const bars = useSubjectBars(p, r);
  const navigate = useNavigate();
  const review = r ? toReview(r) : [];
  return (
    <li className="bg-surface flex flex-col gap-3 rounded-2xl p-4 shadow-sm" aria-label={`Progrès de ${p.name}`}>
      <div className="flex items-center gap-3">
        <CharacterAvatar avatar={p.avatar} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold">{p.name}</h3>
          <p className="text-muted text-sm">{p.grade ? gradeInfo(p.grade).name : 'Classe non renseignée'}</p>
        </div>
      </div>
      {bars && bars.length > 0 && (
        <SubjectCards bars={bars} onPick={(id) => void navigate(`/parent/enfant/${p.id}?matiere=${id}`)} />
      )}
      {review.length > 0 && (
        <p className="text-sm">
          <span className="text-muted font-bold">À réviser : </span>
          {review.map((i) => i.title).join(', ')}
        </p>
      )}
      <Link
        to={`/parent/enfant/${p.id}`}
        className="bg-accent mt-auto rounded-xl px-4 py-2.5 text-center font-bold text-white"
      >
        Voir les progrès de {p.name}
      </Link>
    </li>
  );
}

export function ChildReport() {
  const { profileId = '' } = useParams();
  const { data: profiles } = useProfiles();
  const child = profiles?.find((p) => p.id === profileId);
  const { data: r, isPending } = useLearning(profileId);
  return (
    <ParentPage
      title={child ? `Progrès de ${child.name}` : 'Progrès'}
      back={{ to: '/parent', label: 'Tous les enfants' }}
    >
      {isPending && <p>Chargement…</p>}
      {r && child && <ReportView report={r} child={child} />}
    </ParentPage>
  );
}

function ReportView({ report: r, child }: { readonly report: LearningReport; readonly child: Profile }) {
  const bars = useSubjectBars(child, r);
  const [params, setParams] = useSearchParams();
  const picked = bars?.find((b) => b.id === params.get('matiere'));
  // Ordre de la page : synthèse, avancement, à réviser. Les sections de l'Arène d'évaluation (réponses,
  // « Bilans » repliable) viendront s'ajouter ici, avant la synthèse, comme des blocs indépendants.
  return (
    <div className="flex flex-col gap-6">
      {bars && <p className="text-lg font-bold">{synthesis(child.name, bars)}</p>}
      {bars && bars.length > 0 && (
        <section aria-labelledby="avancement" className="flex flex-col gap-2">
          <h2 id="avancement" className="text-lg font-bold">
            Avancement
          </h2>
          <SubjectCards
            bars={bars}
            selected={picked?.id}
            onPick={(id) => setParams(id === picked?.id ? {} : { matiere: id }, { replace: true })}
          />
          {picked && <SubjectDetail bar={picked} />}
        </section>
      )}
      <ToReview items={toReview(r)} />
    </div>
  );
}
