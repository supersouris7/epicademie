/**
 * Preuves du chapitre « Le temps de la République » : chacune cite un identifiant du registre (`sources.ts`) et la
 * citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 3.
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle3-2020', quote });
const emc = (quote: string) => ({ source: 'emc-2024', who: 'Le programme d’enseignement moral et civique', quote });
const senat = (source: string, quote: string) => ({ source, who: 'Le Sénat', quote });
const assemblee = (quote: string) => ({ source: 'an-vote-femmes', who: 'L’Assemblée nationale', quote });

export const PREUVES = {
  // 1892 : la République fête ses cent ans
  revolution: programme('De l’année 1789 à l’exécution du roi : Louis XVI, la Révolution, la Nation'),
  cent: programme('1892 : la République fête ses cent ans'),
  experiences: programme(
    'les Français ont vécu différentes expériences politiques depuis la Révolution y compris celles ayant suscité conflits et violences (1830, 1848, 1870)',
  ),
  ceremonies: programme('Les cérémonies mettent en scène les symboles républicains'),
  colonisation: programme('pendant cette période s’enclenche également un nouveau processus de colonisation'),
  juillet1830: senat(
    'senat-monarchie-juillet',
    'Les "Trois Glorieuses" de juillet 1830 mettent fin au régime de Charles X',
  ),
  republique1848: senat('senat-second-empire', 'La Constitution de 1848 avait rétabli la République'),
  septembre1870: senat('senat-naissance', 'la création du gouvernement provisoire le 4 septembre 1870'),
  hymne: senat(
    'senat-republique',
    'adoption de la Marseillaise comme hymne national, fixation de la fête nationale au 14 juillet',
  ),
  symboles: emc('les symboles républicains mentionnés par la Constitution : drapeau, hymne, devise'),
  devise: emc('comprendre la devise « Liberté, Égalité, Fraternité »'),

  // L’école au temps de Jules Ferry
  ecole: programme(
    'À partir des années 1880, l’adhésion à la République se construit en partie par l’école gratuite, laïque et obligatoire',
  ),
  gratuite: senat(
    'senat-ferry-scolaire',
    'La gratuité est votée en juin 1881, l’obligation scolaire (entre 6 et 13 ans) en mars 1882 comme la laïcité',
  ),
  obligation: senat(
    'senat-lois-ferry',
    "Ils affirment ensuite l'obligation de l'enseignement primaire, pour les enfants des deux sexes, de 6 à 13 ans",
  ),
  filles: senat(
    'senat-lois-ferry',
    'La véritable plus-value de ces textes porte sur la scolarisation des filles et des enfants des campagnes',
  ),
  normales: senat(
    'senat-lois-ferry',
    "le gouvernement crée des écoles normales, dans chaque département, pour assurer la formation d'instituteurs laïcs",
  ),
  normales1879: senat('senat-lois-ferry', "loi du 9 août 1879 sur l'établissement des écoles normales primaires"),
  personnel: senat(
    'senat-lois-ferry',
    "C'est la loi du 30 octobre 1886 sur l'organisation de l'enseignement primaire qui les en écarte en ordonnant la laïcisation progressive du personnel des écoles publiques",
  ),

  // Des républiques, une démocratie
  libertes: programme(
    'les libertés (liberté d’expression, liberté de culte…) et les droits (droit de vote, droits des femmes…) en vigueur aujourd’hui, sous la Ve République, sont le fruit d’une conquête et d’une évolution de la démocratie et de la société et qu’ils sont toujours questionnés',
  ),
  impot: emc(
    'caractériser différents devoirs du citoyen, comme sa participation au financement des charges supportées par l’État par le paiement de l’impôt (art. 13)',
  ),
  lois: emc('respecter les lois, contribuer à financer les dépenses publiques'),
  conscience: emc(
    'la liberté de conscience est celle de croire, celle de ne pas croire, celle aussi de changer de croyance ou de religion',
  ),
  limites: emc('ces libertés comportent aussi des limites pour que la liberté des uns n’entrave pas celle des autres'),
  expression: emc('le droit à la liberté d’expression (art. 11), d’opinion (art. 10), le droit à la sûreté (art. 2)'),
  declaration: emc('la Déclaration des droits de l’homme et du citoyen (1789)'),
  presse: emc('la loi du 29 juillet 1881 sur la liberté de la presse'),
  cultes: emc('le libre exercice des cultes (loi de 1905)'),
  civique: emc('Voter est un droit, c’est aussi un devoir civique'),
  femmes1944: emc('droit de vote des femmes en 1944'),

  // Le droit de vote des femmes
  hommes1848: assemblee(
    '5 mars 1848 Le Gouvernement provisoire de la République instaure le « suffrage universel » masculin',
  ),
  auclert: assemblee('13 février 1881 Hubertine Auclert lance le journal La Citoyenne'),
  chambre1919: assemblee(
    '20 mai 1919 La Chambre des députés adopte pour la première fois une proposition de loi instaurant le vote des femmes',
  ),
  senat1922: assemblee(
    '21 novembre 1922 Le Sénat refuse d’examiner les articles de la proposition de loi sur le vote des femmes',
  ),
  ordonnance: assemblee(
    '21 avril 1944 L’article 17 de l’ordonnance portant organisation des pouvoirs publics en France après la Libération dispose que « les femmes sont électrices et éligibles dans les mêmes conditions que les hommes »',
  ),
  municipales1945: assemblee('29 avril -13 mai 1945 Premier vote des femmes aux élections municipales'),
  national1945: assemblee('21 octobre 1945 Premier vote des femmes dans un scrutin national'),
  combats: emc('montrer que l’égalité des droits entre les femmes et les hommes est le résultat de combats'),
} satisfies Record<string, Preuve & { readonly source: string }>;
