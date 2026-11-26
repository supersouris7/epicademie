/**
 * Preuves du chapitre de 3e « La Première Guerre mondiale et les totalitarismes » : chacune cite un identifiant du
 * registre (`sources.ts`) et la citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 4. Les
 * preuves déjà citées par le chapitre de CM2 sont reprises telles quelles.
 */
import type { Preuve } from './kit.ts';
import { PREUVES as CM2 } from './guerres-europe-sources.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const de = (who: string, source: string) => (quote: string) => ({ source, who, quote });
const ressource3e = de('La ressource d’Éduscol pour la 3e', 'eduscol-3e-guerres-totales');
const ressource1re = de('La ressource d’Éduscol sur la Première Guerre mondiale', 'eduscol-1re-premiere-guerre');
const ressourceTle = de('La ressource d’Éduscol sur les totalitarismes', 'eduscol-tle-totalitarismes');
const rapport = de('Un rapport de l’Assemblée nationale', 'an-rapport-armeniens-1998');
const genocides = de('Éduscol, le site de l’Éducation nationale,', 'eduscol-genocides');
const loi = de('La loi du 29 janvier 2001', 'legifrance-genocide-armenien-2001');
const union = de('L’Assemblée nationale', 'an-1914-union-sacree');
const annee1917 = de('L’Assemblée nationale', 'an-1914-1917');
const front = de('L’Assemblée nationale', 'an-front-populaire');
const instabilite = de('L’Assemblée nationale', 'an-instabilite-politique');
const nazisme = de('L’Assemblée nationale', 'an-montee-nazisme');
const civils = de('Le site officiel Vie-publique', 'vie-publique-1914-civils');
const tlfi = (id: string, quote: string) => ({
  source: `cnrtl-${id}`,
  who: 'Le Trésor de la langue française',
  quote,
});

export const PREUVES = {
  // ——— La guerre totale ———
  reperesGuerre: ressource3e('1914-1918 : Grande Guerre'),
  mobilise: programme(
    'En mobilisant les civils aussi bien que les militaires, la Grande Guerre met à l’épreuve la cohésion des sociétés et fragilise durablement des régimes en place.',
  ),
  mouvementPosition: ressource1re('le passage de la guerre de mouvement à une guerre de position'),
  tranchee: ressource1re(
    'autour de la tranchée tant il est vrai qu’elle s’est imposée comme le symbole des combats de la Grande Guerre',
  ),
  economie: ressource1re(
    'la mise en place, dès 1914, d’une économie de guerre dans laquelle les femmes, les travailleurs coloniaux, voire les enfants pallient le manque d’hommes',
  ),
  propagande: ressource1re(
    'la mobilisation des esprits par la propagande mais aussi par l’engagement des autorités morales (Églises, intellectuels, école)',
  ),
  frontInterieur: ressource1re(
    'La séance pourrait s’organiser autour de la notion de « front intérieur » qui, à la faveur de nombreuses études, s’est imposée pour rendre compte de ce qui se passe à l’arrière.',
  ),
  unionSacree: union(
    'pour le 4 août. Dans son message aux Chambres, lu par le président du Conseil René Viviani, Poincaré introduit le terme d’« Union sacrée »',
  ),
  unionDate: union('Raymond Poincaré, Président de la République, message aux assemblées du 4 août 1914'),
  solidarite: union(
    'Poincaré introduit le terme d’« Union sacrée », traduisant la nécessaire solidarité face à l’ennemi',
  ),
  crise1917: annee1917('font de 1917 une année de crise'),
  mutineries: annee1917('l’échec de l’offensive Nivelle au Chemin des Dames et les mutineries qui s’ensuivent'),
  executions: civils('entre août et octobre 1914, 6 500 civils belges et français sont exécutés'),
  paris1918: civils('Les canons lourds qui bombardent Paris du 23 mars au 9 août 1918 font 256 victimes'),
  morts: CM2.morts,
  verdun: CM2.verdun,
  armistice: CM2.rethondes,

  // ——— Le génocide des Arméniens ———
  armeniensProgramme: programme(
    'Combattants et civils subissent des violences extrêmes, dont témoigne particulièrement le génocide des Arméniens en 1915.',
  ),
  ottoman: ressource1re('les Arméniens dans l’Empire ottoman, victimes d’un génocide'),
  radicalisation: ressource3e('des violences préexistantes se radicalisent, comme dans le cas du génocide arménien'),
  massacres1894: rapport('Plus de 200.000 Arméniens sont tués (de 1894 à 1896)'),
  jeunesTurcs: rapport(
    'les principaux ministres du gouvernement jeunes-turcs sont membres du parti Union et Progrès, qui exerce une dictature sur tout le pays',
  ),
  alliance: rapport('en novembre 1914, l’Empire ottoman se range aux côtés de l’Allemagne et de l’Autriche-Hongrie'),
  rafle: genocides(
    'la journée du 24 avril 1915 qui a vu l’arrestation de près de 600 intellectuels arméniens par les autorités ottomanes à Constantinople qui ont été déportés ou assassinés',
  ),
  bilanGenocide: genocides(
    'Ce jour marque le début d’un génocide qui a provoqué la mort de plus d’un million de personnes.',
  ),
  convois: rapport('Femmes, enfants, vieillards sont organisés en convois qui prennent la route de la déportation'),
  deserts: rapport('Les déserts de Mésopotamie et de Syrie sont le tombeau de ces colonies de déportés.'),
  secret: rapport(
    'les ordres de mise à mort ont été donnés dans le secret, la déportation servant de couverture légale',
  ),
  proces1919: rapport('En 1919 se tient à Constantinople le procès des unionistes'),
  loi2001: loi('La France reconnaît publiquement le génocide arménien de 1915.'),
  loiDate: genocides(
    'La France avait officiellement reconnu l’existence du génocide arménien par la loi n° 2001-70 du 29 janvier 2001',
  ),
  commemoration: genocides(
    'Le décret n° 2019-291 du 10 avril 2019 relatif à la commémoration annuelle du génocide arménien de 1915 crée la journée mémorielle du 24 avril.',
  ),
  definition: tlfi('genocide', 'Extermination systématique d’un groupe humain'),

  // ——— Les démocraties fragilisées ———
  epicentre: ressourceTle('La société américaine, épicentre de la crise'),
  diffusion: ressourceTle('la dépression mondiale qui commence par la crise de 1929'),
  chomage: ressourceTle('l’émergence d’un chômage de masse'),
  france1931: ressourceTle(
    'En France, les difficultés économiques et sociales deviennent très significatives à partir de 1931.',
  ),
  centre: ressource3e(
    'Les pays de l’Europe centrale et orientale basculent vers des régimes autoritaires dans les années trente, à l’exception de la Tchécoslovaquie.',
  ),
  ligues: instabilite('Les ligues antiparlementaires sont réactivées ou créées'),
  antiparlementarisme: instabilite('tandis que s’étend une vague d’antiparlementarisme'),
  fevrier1934: instabilite('ce qui suscite le 6 février 1934 une manifestation qui tourne à l’émeute'),
  antifascisme: ressourceTle(
    'la victoire du Front populaire n’est pas directement imputable à la crise de 1929. Elle résulte d’une crise politique majeure marquée par la montée de l’antiparlementarisme, la xénophobie et l’antisémitisme, et son ciment est l’antifascisme',
  ),
  alliance1936: ressourceTle(
    'le Front populaire, alliance électorale entre le parti communiste français (PCF), la section française de l’internationale ouvrière (SFIO) et le parti radical, remporte les élections législatives',
  ),
  victoire: front('A l’issue du second tour, le 3 mai 1936, la victoire est triomphale'),
  blum: front('Léon Blum préside le Gouvernement'),
  matignon: front('Dans la nuit du 7 au 8 juin sont signés les accords Matignon.'),
  conges: front('la loi sur les congés payés accordant quinze jours de vacances aux salariés'),
  quarante: front('la loi fixant à 40 heures la durée hebdomadaire du travail'),
  munich: nazisme(
    'Le 30 septembre 1938 Hitler, Daladier, Mussolini et Chamberlain signent les accords de Munich qui prévoient l’annexion des Sudètes par l’Allemagne',
  ),

  // ——— Les régimes totalitaires ———
  totalitaire: tlfi(
    'totalitaire',
    'Qui fonctionne sur le mode du parti unique interdisant toute opposition organisée ou personnelle, accaparant tous les pouvoirs',
  ),
  terreur: ressourceTle('Les régimes totalitaires s’enracinent par le recours à la violence et à la terreur.'),
  russie: programme(
    'En Russie, la guerre totale installe les conditions de la révolution bolchevique, le communisme soviétique stalinien s’établit au cours des années 1920.',
  ),
  revolution1917: ressource3e('1917 : Révolution Russe'),
  mussolini: ressource1re('Octobre 1922 : Mussolini parvient au pouvoir en Italie.'),
  fascisme: tlfi('fascisme', 'Doctrine que Mussolini érigea en Italie en système politique'),
  staline1928: ressourceTle('Mussolini arrive au pouvoir en 1922 et Staline s’impose définitivement en 1928.'),
  collectivisation: ressourceTle(
    '1929 est un tournant puisque Staline décide de relancer la révolution communiste avec la collectivisation',
  ),
  staline1937: ressourceTle('la politique lancée par Staline en août 1937'),
  ressorts: ressourceTle('ressorts spécifiques des régimes totalitaires comme la propagande, la censure'),
  reponse: ressourceTle(
    'Le Front populaire souhaite répondre aux attentes sociales fortes pour éviter que les masses ne soient séduites par les modèles proposés en Italie, en Allemagne, en URSS.',
  ),
  grandeTerreur: ressourceTle('1937-1938 : la Grande Terreur en URSS.'),
  hitler1933: ressourceTle(
    'permet en janvier 1933 l’arrivée au pouvoir d’Adolf Hitler, qui prône une politique nationaliste, raciste et antisémite',
  ),
  fuhrer: tlfi('fuhrer', 'Titre adopté par Adolf Hitler à partir de 1934.'),
  nuremberg: ressourceTle(
    'les étapes de la politique antisémite nazie. Dès 1933, avec la mise en place d’une politique de ségrégation à l’intérieur de l’Allemagne (boycott en 1933, lois de Nuremberg en 1935)',
  ),
  cristal: ressourceTle('9-10 novembre 1938 : la nuit de Cristal.'),
  pogrom: ressourceTle('Les nazis déclenchent la Nuit de Cristal, vaste pogrom'),
  depression: programme(
    'Après la paix de Versailles puis la Grande Dépression, le régime nazi s’impose et noue des alliances.',
  ),
} satisfies Record<string, Preuve>;
