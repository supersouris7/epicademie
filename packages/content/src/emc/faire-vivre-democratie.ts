import type { Skill } from '../types.ts';
import { notion, type Citation, type DocQuestion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * 3e, « Faire vivre la démocratie » (lot em-3e-01) : institutions de la Ve République, élections, citoyenneté active,
 * défense et engagement, d’après le programme d’EMC du 13 juin 2024. Chaque fait cite le programme (registre
 * `emc-2024`), la Constitution ou le code du service national (Légifrance), une fiche Vie publique ou une page du
 * ministère de l’Éducation nationale, avec sa citation exacte. Le service national universel et la journée défense et
 * citoyenneté ne sont pas détaillés : leurs textes évoluent. Les textes à lire du niveau 5 sont écrits pour
 * l’exercice (personnes inventées).
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 3e : « Faire vivre la démocratie »';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 3e.';

/** Citation d’un texte du registre des sources. */
const cite =
  (id: string, label: string) =>
  (quote: string): Citation => ({ quote, from: { id, label } });
const prog = (quote: string): Citation => ({ quote });

const constitution = cite('constitution-1958', 'la Constitution de 1958');
const csn = cite('code-service-national-principes', 'le code du service national');
const csnEnseignement = cite('code-service-national-enseignement', 'le code du service national');
const vpPresident = cite('vie-publique-president-election', 'le site Vie publique');
const vpDeputes = cite('vie-publique-deputes', 'le site Vie publique');
const vpSenateurs = cite('vie-publique-senateurs', 'le site Vie publique');
const vpVote = cite('vie-publique-vote-obligatoire', 'le site Vie publique');
const vpListes = cite('vie-publique-listes-electorales', 'le site Vie publique');
const vpMunicipales = cite('vie-publique-municipales', 'le site Vie publique');
const vpReferendum = cite('vie-publique-referendum', 'le site Vie publique');
const vpCensure = cite('vie-publique-motion-censure', 'le site Vie publique');
const vpQpc = cite('vie-publique-qpc', 'le site Vie publique');
const vpAssociation = cite('vie-publique-association', 'le site Vie publique');
const vpSyndicat = cite('vie-publique-syndicat', 'le site Vie publique');
const vpManif = cite('vie-publique-manifestation', 'le site Vie publique');
const vpJures = cite('vie-publique-jure-assises', 'le site Vie publique');
const cvl = cite('education-cvl', 'le site du ministère de l’Éducation nationale');

type Wrong = readonly [label: string, why: string];
const wrongs = (list: readonly Wrong[]) => list.map(([label, why]) => ({ label, why }));

/** Fait cité : citation, question et réponse, trois erreurs, phrase à trou, explication. */
const fait = (
  citation: Citation,
  [q, a]: readonly [string, string],
  wrong: readonly [Wrong, Wrong, Wrong],
  gap: Fait['gap'],
  explain: string,
): Fait => ({ ...citation, q, a, wrong: wrongs(wrong), gap, explain });

/** Fait exigeant : non proposé au niveau 1. */
const expert = (f: Fait): Fait => ({ ...f, avance: true });

const libre = (
  citation: Citation,
  q: string,
  accepted: readonly string[],
  traps: readonly Wrong[],
  explain: string,
): Libre => ({ ...citation, q, accepted, traps: traps.map(([text, why]) => ({ text, why })), explain });

const lecture = (
  citation: Citation,
  q: string,
  a: string,
  wrong: readonly [Wrong, Wrong, Wrong],
  explain: string,
): DocQuestion => ({ ...citation, q, a, wrong: wrongs(wrong), explain });

const commun = { programme: PROGRAMME, credit: CREDIT } as const;

// ——— Citations exactes : Constitution de 1958 (Légifrance) ———

const SOUVERAINETE = constitution(
  'La souveraineté nationale appartient au peuple qui l’exerce par ses représentants et par la voie du référendum',
);
const SUFFRAGE = constitution('Il est toujours universel, égal et secret');
const ELECTEURS = constitution(
  'tous les nationaux français majeurs des deux sexes, jouissant de leurs droits civils et politiques',
);
const PARTIS = constitution('Les partis et groupements politiques concourent à l’expression du suffrage');
const GARDIEN = constitution('Le Président de la République veille au respect de la Constitution');
const MANDAT = constitution('Le Président de la République est élu pour cinq ans au suffrage universel direct');
const NOMME = constitution('Le Président de la République nomme le Premier ministre');
const DISSOLUTION = constitution('prononcer la dissolution de l’Assemblée nationale');
const CHEF_ARMEES = constitution('Le Président de la République est le chef des armées');
const POLITIQUE = constitution('Le Gouvernement détermine et conduit la politique de la Nation');
const DIRIGE = constitution('Le Premier ministre dirige l’action du Gouvernement');
const DEFENSE_PM = constitution('Il est responsable de la Défense nationale');
const PARLEMENT = constitution('Le Parlement vote la loi. Il contrôle l’action du Gouvernement');
const GUERRE = constitution('La déclaration de guerre est autorisée par le Parlement');
const INFORME = constitution(
  'Le Gouvernement informe le Parlement de sa décision de faire intervenir les forces armées à l’étranger, au plus tard trois jours après le début de l’intervention',
);
const PROLONGATION = constitution(
  'Lorsque la durée de l’intervention excède quatre mois, le Gouvernement soumet sa prolongation à l’autorisation du Parlement',
);
const CENSURE = constitution(
  'L’Assemblée nationale met en cause la responsabilité du Gouvernement par le vote d’une motion de censure',
);
const QPC = constitution(
  'il est soutenu qu’une disposition législative porte atteinte aux droits et libertés que la Constitution garantit, le Conseil constitutionnel peut être saisi',
);

// ——— Citations exactes : Vie publique ———

const DEMISSION = vpCensure(
  'Quand l’Assemblée nationale vote une motion de censure, le gouvernement doit démissionner',
);
const JUSTICIABLE = vpQpc('permet à tout justiciable de contester, devant le juge en charge de son litige');
const DEUX_TOURS = vpPresident('L’élection est organisée selon un mode de scrutin majoritaire à deux tours');
const DEUX_MANDATS = vpPresident('Le président de la République ne peut pas exercer plus de deux mandats consécutifs');
const DEPUTES = vpDeputes('Les députés sont élus au suffrage universel direct lors des élections législatives');
const SENATEURS = vpSenateurs('Les sénateurs sont élus par un collège de "grands électeurs" (suffrage indirect)');
const SIX_ANS = vpSenateurs('La durée du mandat de sénateur est de six ans');
const MUNICIPALES = vpMunicipales('Les conseillers municipaux sont élus pour six ans');
const LISTE = vpListes(
  'Toute personne souhaitant participer à une élection doit être inscrite sur la liste électorale de sa commune',
);
const DEVOIR = vpVote(
  'C’est aussi un devoir civique que doivent accomplir les citoyens pour le bon fonctionnement de la vie démocratique',
);
const NON_OBLIGATOIRE = vpVote('Cependant, le vote n’est pas obligatoire');
const REFERENDUM = vpReferendum(
  'Le référendum est une procédure de vote permettant de consulter directement les citoyens sur une question ou un texte',
);
const BUT_ASSO = vpAssociation('dans un but autre que de partager des bénéfices');
const DEUX_PERSONNES = vpAssociation(
  'Pour créer une association, il suffit de rassembler au moins deux personnes en vue d’un objectif commun et permanent',
);
const OBJET_SYNDICAT = vpSyndicat(
  'Un syndicat a pour objet exclusif l’étude et la défense des droits ainsi que des intérêts matériels et moraux',
);
const MANIF = vpManif(
  'Une manifestation est une réunion organisée sur la voie publique dans le but d’exprimer une conviction collective',
);
const DECLAREE = vpManif('Pour prévenir les troubles de l’ordre public, une manifestation doit être déclarée');
const CVL = cvl('Le CVL est le lieu où les lycéens sont associés aux décisions de l’établissement');
const JURES = vpJures(
  'Tout citoyen français âgé de 23 ans et plus, jouissant de ses droits civiques et inscrit sur les listes électorales, peut être tiré au sort pour siéger dans une cour d’assises, en tant que juré',
);

// ——— Citations exactes : code du service national ———

const CONCOURENT = csn('Les citoyens concourent à la défense et à la cohésion de la Nation');
const ENSEIGNEMENT = csnEnseignement(
  'Cet enseignement a pour objet de renforcer le lien armée-Nation tout en sensibilisant la jeunesse à son devoir de défense',
);

// ——— Citations exactes : programme de 3e ———

const CAMPAGNES = prog('le vote n’étant pas obligatoire, mais marquant un engagement au sein de la cité');
const ENGAGEMENT_EFFECTIF = prog(
  'la vie démocratique repose essentiellement sur l’engagement effectif des citoyennes et des citoyens dans la vie économique, sociale et politique',
);
const IDEAL = prog('La démocratie est ainsi envisagée comme un idéal à atteindre et non comme une réalité figée');
const FORMES = prog(
  'engagement politique et exercice d’un mandat, engagement syndical, engagement associatif ou humanitaire, démocratie scolaire',
);
const MANIFESTER = prog(
  'l’exercice de la liberté de manifester permet aux citoyennes et aux citoyens d’exprimer leurs opinions et de faire pression sur les gouvernements',
);
const INSTITUTIONS = prog('l’engagement dans les institutions (armée, police, justice, éducation)');

// ——— Notion 1 : institutions de la Ve République ———

const institutions: Notion = {
  ...commun,
  id: 'em3-institutions',
  title: 'Les institutions de la Ve République',
  hint: 'Demande-toi qui nomme, qui gouverne, qui vote la loi et qui la contrôle.',
  memo: [
    'La **Constitution** de 1958 organise la Ve République : le président de la République veille à son respect et nomme le Premier ministre ; il peut prononcer la **dissolution** de l’Assemblée nationale.',
    'Le **Gouvernement**, dirigé par le Premier ministre, conduit la politique de la Nation ; le **Parlement** (Assemblée nationale et Sénat) vote la loi et contrôle le Gouvernement.',
    'Réflexe brevet : l’Assemblée nationale peut renverser le Gouvernement par une **motion de censure** ; avec la **question prioritaire de constitutionnalité**, un justiciable peut contester une loi.',
  ],
  faits: [
    fait(
      PARLEMENT,
      ['Selon la Constitution, quelle institution vote la loi ?', 'le Parlement'],
      [
        ['le Conseil constitutionnel', 'Il vérifie que des lois respectent la Constitution, il ne les vote pas.'],
        ['le Premier ministre', 'Le Premier ministre dirige le Gouvernement et assure l’exécution des lois.'],
        ['le président de la République', 'Le président veille au respect de la Constitution, il ne vote pas la loi.'],
      ],
      ['La loi est votée par le ', '.', ['Parlement']],
      'Le Parlement vote la loi et contrôle l’action du Gouvernement.',
    ),
    fait(
      NOMME,
      ['Qui nomme le Premier ministre ?', 'le président de la République'],
      [
        ['les électeurs, au suffrage direct', 'Les électeurs ne désignent pas directement le Premier ministre.'],
        ['le président du Sénat', 'Il préside une assemblée du Parlement, il ne nomme pas le Premier ministre.'],
        ['le Conseil constitutionnel', 'Il contrôle la constitutionnalité, il ne nomme pas le chef du Gouvernement.'],
      ],
      ['Le Premier ministre est nommé par le ', ' de la République.', ['président', 'Président', 'president']],
      'La Constitution confie cette nomination au président de la République.',
    ),
    fait(
      POLITIQUE,
      ['Quelle institution détermine et conduit la politique de la Nation ?', 'le Gouvernement'],
      [
        ['le Conseil constitutionnel', 'Il juge de la conformité à la Constitution, il ne gouverne pas.'],
        ['le Sénat', 'Le Sénat fait partie du Parlement : il vote la loi et contrôle.'],
        ['le conseil municipal', 'Il règle les affaires d’une commune, pas la politique de la Nation.'],
      ],
      ['La politique de la Nation est déterminée et conduite par le ', '.', ['Gouvernement']],
      'L’article 20 de la Constitution confie cette mission au Gouvernement.',
    ),
    fait(
      CENSURE,
      ['Par quel vote l’Assemblée nationale peut-elle mettre en cause le Gouvernement ?', 'une motion de censure'],
      [
        ['un référendum', 'Un référendum consulte les électeurs, pas seulement les députés.'],
        ['une dissolution', 'La dissolution est décidée par le président et vise l’Assemblée.'],
        ['une promulgation', 'Promulguer, c’est ordonner l’application d’une loi.'],
      ],
      ['L’Assemblée nationale peut renverser le Gouvernement par une motion de ', '.', ['censure']],
      'La motion de censure est l’arme de l’Assemblée nationale contre le Gouvernement.',
    ),
    expert(
      fait(
        DISSOLUTION,
        ['Quelle assemblée le président de la République peut-il dissoudre ?', 'l’Assemblée nationale'],
        [
          ['le Sénat', 'La Constitution ne prévoit pas la dissolution du Sénat.'],
          ['le Conseil constitutionnel', 'Ce n’est pas une assemblée élue que l’on dissout.'],
          ['le Parlement européen', 'C’est une institution de l’Union européenne, pas de la Ve République.'],
        ],
        ['Le président de la République peut prononcer la ', ' de l’Assemblée nationale.', ['dissolution']],
        'La dissolution met fin au mandat des députés : de nouvelles élections sont organisées.',
      ),
    ),
    expert(
      fait(
        QPC,
        [
          'Quelle institution peut être saisie quand une loi est accusée, lors d’un procès, de porter atteinte aux droits garantis par la Constitution ?',
          'le Conseil constitutionnel',
        ],
        [
          ['le Gouvernement', 'Le Gouvernement conduit la politique, il ne juge pas les lois.'],
          ['la mairie', 'La mairie gère la commune.'],
          ['l’Assemblée nationale', 'Elle vote la loi mais ne la juge pas au regard de la Constitution.'],
        ],
        [
          'Quand une question prioritaire de constitutionnalité lui est transmise, la loi est jugée par le Conseil ',
          '.',
          ['constitutionnel'],
        ],
        'C’est la question prioritaire de constitutionnalité (QPC) : si les juges la lui transmettent, le Conseil constitutionnel vérifie que la loi respecte la Constitution.',
      ),
    ),
  ],
  paires3: [
    ['Parlement', 'Vote la loi'],
    ['Gouvernement', 'Conduit la politique de la Nation'],
    ['Conseil constitutionnel', 'Juge la conformité des lois à la Constitution'],
  ],
  paires5: [
    ['Président de la République', 'Nomme le Premier ministre'],
    ['Premier ministre', 'Dirige l’action du Gouvernement'],
    ['Parlement', 'Vote la loi'],
    ['Motion de censure', 'Met en cause la responsabilité du Gouvernement'],
    ['QPC', 'Permet à un justiciable de contester une loi'],
  ],
  libres: [
    libre(
      GARDIEN,
      'qui veille au respect de la Constitution : le président de la … ?',
      ['République', 'la République', 'republique'],
      [
        ['Assemblée', 'Le président de l’Assemblée nationale préside les députés.'],
        ['Sénat', 'Le président du Sénat préside les sénateurs.'],
      ],
      'Le président de la République veille au respect de la Constitution.',
    ),
    libre(
      DIRIGE,
      'qui dirige l’action du Gouvernement ?',
      ['le Premier ministre', 'Premier ministre'],
      [
        ['le Président de la République', 'Le président nomme le Premier ministre ; c’est ce dernier qui dirige.'],
        ['le Parlement', 'Le Parlement contrôle le Gouvernement.'],
      ],
      'Le Premier ministre dirige l’action du Gouvernement.',
    ),
    libre(
      DEMISSION,
      'après l’adoption d’une motion de censure par l’Assemblée nationale, que doit faire le Gouvernement ?',
      ['démissionner', 'il doit démissionner', 'demissionner', 'la démission'],
      [
        ['dissoudre', 'La dissolution vise l’Assemblée et relève du président.'],
        ['voter la loi', 'C’est le rôle du Parlement.'],
      ],
      'Le Gouvernement renversé doit démissionner.',
    ),
  ],
  docs: [
    {
      title: 'Un vote décisif',
      lines: [
        'Des députés reprochent au Gouvernement sa politique.',
        'Ils déposent une motion, débattue quelques jours plus tard.',
        'Au vote, la motion de censure obtient la majorité exigée.',
        'Le soir même, les journaux annoncent la chute du Gouvernement.',
      ],
      qs: [
        lecture(
          DEMISSION,
          'Quelle est la conséquence du vote décrit ?',
          'le Gouvernement doit démissionner',
          [
            ['le président de la République doit démissionner', 'La motion de censure vise le Gouvernement.'],
            ['le Sénat est dissous', 'La motion de censure ne dissout aucune assemblée.'],
            ['la Constitution est abrogée', 'Un vote de censure ne change pas la Constitution.'],
          ],
          'Une motion de censure adoptée oblige le Gouvernement à démissionner.',
        ),
        lecture(
          CENSURE,
          'Quelle assemblée a le pouvoir exercé dans ce texte ?',
          'l’Assemblée nationale',
          [
            ['le Sénat', 'La motion de censure relève de l’Assemblée nationale.'],
            ['le conseil régional', 'Il gère une région.'],
            ['le Conseil constitutionnel', 'Il ne vote pas de motion de censure.'],
          ],
          'Seuls les députés peuvent mettre en cause le Gouvernement par ce vote.',
        ),
      ],
    },
    {
      title: 'Au tribunal',
      lines: [
        'Mme Roy est partie à un procès.',
        'Elle pense qu’un article de loi utilisé contre elle porte atteinte à une liberté garantie par la Constitution.',
        'Son avocat pose une question au juge.',
        'La question est ensuite transmise jusqu’à l’institution compétente pour examiner la loi.',
      ],
      qs: [
        lecture(
          JUSTICIABLE,
          'Quel nom porte la procédure utilisée par Mme Roy ?',
          'la question prioritaire de constitutionnalité',
          [
            ['la motion de censure', 'Elle vise le Gouvernement, à l’Assemblée nationale.'],
            ['le référendum', 'Le référendum consulte tous les électeurs.'],
            ['la promulgation', 'C’est l’acte qui ordonne l’application d’une loi.'],
          ],
          'La QPC permet à un justiciable de contester une disposition législative pendant son procès.',
        ),
        lecture(
          QPC,
          'Quelle institution peut finalement examiner la loi ?',
          'le Conseil constitutionnel',
          [
            ['le Gouvernement', 'Il ne contrôle pas la constitutionnalité des lois.'],
            ['le président du Sénat', 'Il ne juge pas la loi.'],
            ['le préfet', 'Le préfet représente l’État dans un département.'],
          ],
          'Le Conseil constitutionnel vérifie que la loi respecte les droits et libertés garantis.',
        ),
      ],
    },
  ],
};

// ——— Notion 2 : élections ———

const elections: Notion = {
  ...commun,
  id: 'em3-elections',
  title: 'Les élections et le référendum',
  hint: 'Pour chaque vote, demande-toi : qui vote, pour qui, et pour combien de temps ?',
  memo: [
    'Le peuple exerce la **souveraineté** nationale par ses représentants et par le **référendum** ; le **suffrage universel** est égal et secret.',
    'Au **suffrage direct**, les électeurs choisissent eux-mêmes (président élu 5 ans, deux mandats de suite au plus ; députés) ; au **suffrage indirect**, des grands électeurs choisissent (sénateurs, élus 6 ans).',
    'Réflexe brevet : voter suppose d’être inscrit sur la **liste électorale** ; c’est un devoir civique, mais le vote n’est pas obligatoire.',
  ],
  faits: [
    fait(
      SUFFRAGE,
      ['Selon la Constitution, quelles sont les qualités du suffrage en France ?', 'il est universel, égal et secret'],
      [
        ['il est réservé, public et payant', 'Le suffrage n’est ni réservé ni payant, et le vote est secret.'],
        ['il est obligatoire, public et inégal', 'Chaque voix compte autant et le vote est secret.'],
        ['il est universel, public et obligatoire', 'Le suffrage est secret, et voter n’est pas obligatoire.'],
      ],
      ['Le suffrage est toujours universel, égal et ', '.', ['secret']],
      'L’article 3 de la Constitution fixe ces trois qualités.',
    ),
    fait(
      MANDAT,
      ['Pour combien de temps le président de la République est-il élu ?', 'cinq ans'],
      [
        ['sept ans', 'Le septennat a été remplacé par le quinquennat.'],
        ['six ans', 'Six ans est la durée du mandat des sénateurs.'],
        ['neuf ans', 'Neuf ans est la durée du mandat des membres nommés du Conseil constitutionnel.'],
      ],
      ['Le président de la République est élu pour ', ' ans (en chiffres ou en lettres).', ['cinq', '5']],
      'C’est le **quinquennat** : un mandat de cinq ans, qui a remplacé en 2000 le septennat (sept ans).',
    ),
    fait(
      SENATEURS,
      ['Comment les sénateurs sont-ils élus ?', 'au suffrage indirect, par des grands électeurs'],
      [
        ['au suffrage direct, par tous les électeurs', 'Ce sont les députés et le président qui sont élus ainsi.'],
        ['par nomination du Premier ministre', 'Les sénateurs sont élus, pas nommés.'],
        ['par tirage au sort', 'Le tirage au sort concerne par exemple les jurés d’assises.'],
      ],
      [
        'Les députés sont élus au suffrage direct ; les sénateurs, eux, au suffrage ',
        '.',
        ['indirect', 'universel indirect'],
      ],
      'Des « grands électeurs », eux-mêmes souvent élus, choisissent les sénateurs.',
    ),
    fait(
      NON_OBLIGATOIRE,
      ['Pour les citoyens, aux élections présidentielle ou municipales, voter est…', 'un droit, non obligatoire'],
      [
        ['une obligation punie d’une amende', 'En France, ne pas voter n’entraîne pas de sanction.'],
        ['réservé aux élus', 'Les citoyens inscrits votent, pas seulement les élus.'],
        ['interdit aux jeunes majeurs', 'Dès 18 ans, un Français peut voter s’il remplit les conditions.'],
      ],
      ['En France, le vote est un devoir civique, mais il n’est pas ', '.', ['obligatoire']],
      'Voter est un devoir civique, sans obligation légale pour les citoyens (les grands électeurs des sénatoriales font exception).',
    ),
    expert(
      fait(
        DEPUTES,
        ['Quelles élections désignent les députés ?', 'les élections législatives'],
        [
          ['les élections sénatoriales', 'Elles désignent les sénateurs.'],
          ['les élections municipales', 'Elles désignent les conseillers municipaux.'],
          ['les élections régionales', 'Elles désignent les conseillers régionaux.'],
        ],
        ['Les députés sont élus lors des élections ', '.', ['législatives', 'legislatives']],
        'Les élections législatives désignent les députés au suffrage universel direct.',
      ),
    ),
    fait(
      REFERENDUM,
      ['Qu’est-ce qu’un référendum ?', 'un vote qui consulte directement les citoyens sur une question ou un texte'],
      [
        ['un vote qui désigne les députés', 'Désigner des députés relève des élections législatives.'],
        ['un sondage réalisé par un journal', 'Un sondage n’est pas un vote officiel.'],
        ['une réunion du Conseil des ministres', 'Le Conseil des ministres réunit des membres du Gouvernement.'],
      ],
      [
        'Quand les citoyens répondent eux-mêmes à une question par un vote, c’est un ',
        '.',
        ['référendum', 'referendum'],
      ],
      'Au référendum, les électeurs répondent le plus souvent par « oui » ou « non ».',
    ),
    expert(
      fait(
        ELECTEURS,
        [
          'Selon la Constitution, qui sont les électeurs (dans les conditions fixées par la loi) ?',
          'les Français majeurs jouissant de leurs droits civils et politiques',
        ],
        [
          ['les habitants de tout âge', 'Il faut être majeur.'],
          ['les seuls élus', 'Le suffrage est universel : il ne se limite pas aux élus.'],
          ['les personnes qui paient un impôt élevé', 'Ce serait un suffrage censitaire, contraire à l’universel.'],
        ],
        [
          'Pour être électeur, il faut en principe être de nationalité française et ',
          ', c’est-à-dire avoir au moins 18 ans.',
          ['majeur', 'majeure'],
        ],
        'La Constitution cite les nationaux français majeurs des deux sexes.',
      ),
    ),
    expert(
      fait(
        DEUX_TOURS,
        ['Quel est le mode de scrutin de l’élection présidentielle ?', 'un scrutin majoritaire à deux tours'],
        [
          ['un scrutin à un seul tour par tirage au sort', 'Le président est élu par un vote, pas tiré au sort.'],
          ['un vote des seuls députés', 'Le président est élu au suffrage universel direct.'],
          ['une nomination par le Sénat', 'Le président n’est pas nommé : il est élu.'],
        ],
        ['L’élection présidentielle se déroule au scrutin majoritaire à ', ' tours.', ['deux', '2']],
        'Un second tour est organisé si aucun candidat n’obtient la majorité absolue au premier.',
      ),
    ),
  ],
  paires3: [
    ['Élections législatives', 'Députés'],
    ['Élections sénatoriales', 'Sénateurs'],
    ['Élections municipales', 'Conseillers municipaux'],
  ],
  paires5: [
    ['Mandat du président', '5 ans, suffrage universel direct, deux tours'],
    ['Mandat de sénateur', '6 ans, suffrage indirect'],
    ['Référendum', 'Les électeurs répondent à une question'],
    ['Liste électorale', 'Inscription nécessaire pour voter'],
    ['Partis politiques', 'Concourent à l’expression du suffrage'],
  ],
  libres: [
    libre(
      SOUVERAINETE,
      'à qui appartient la souveraineté nationale ? Au …',
      ['peuple', 'au peuple', 'le peuple'],
      [
        ['Parlement', 'Le Parlement représente le peuple, mais la souveraineté ne lui appartient pas.'],
        ['Gouvernement', 'Le Gouvernement conduit la politique, il ne possède pas la souveraineté.'],
      ],
      'Le peuple l’exerce par ses représentants et par la voie du référendum.',
    ),
    libre(
      DEVOIR,
      'voter est un droit, et aussi un devoir … (un adjectif)',
      ['civique', 'un devoir civique', 'citoyen', 'un devoir citoyen'],
      [
        ['obligatoire', 'En France, le vote n’est pas obligatoire pour les citoyens.'],
        ['militaire', 'Le vote ne relève pas de l’armée.'],
      ],
      'Le devoir civique contribue au bon fonctionnement de la démocratie.',
    ),
    libre(
      DEUX_MANDATS,
      'combien de mandats consécutifs un président de la République peut-il exercer au maximum ? (en chiffres)',
      ['2', 'deux'],
      [
        ['5', '5 est la durée du mandat en années.'],
        ['1', 'Le président peut être réélu une fois de suite.'],
      ],
      'Pas plus de deux mandats consécutifs.',
    ),
    libre(
      LISTE,
      'sur quelle liste faut-il être inscrit pour voter ? La liste …',
      ['électorale', 'electorale', 'la liste électorale', 'liste électorale'],
      [
        ['syndicale', 'Un syndicat défend des intérêts professionnels.'],
        ['civile', 'Cette inscription ne donne pas le droit de voter.'],
      ],
      'L’inscription sur la liste électorale de la commune est nécessaire.',
    ),
    libre(
      SIX_ANS,
      'quelle est la durée, en années, du mandat d’un sénateur ?',
      ['6', 'six', '6 ans', 'six ans'],
      [
        ['5', '5 ans : c’est la durée du mandat du président ou d’un député en principe.'],
        ['3', 'Le Sénat est renouvelé par moitié tous les 3 ans, mais le mandat dure plus longtemps.'],
      ],
      'Un sénateur est élu pour six ans.',
    ),
  ],
  docs: [
    {
      title: 'Une année d’élections',
      lines: [
        'Inès vient d’avoir 18 ans. Elle vérifie qu’elle figure sur la liste électorale de sa commune.',
        'En mars, elle vote pour choisir le conseil municipal.',
        'Son oncle, conseiller municipal désigné grand électeur, lui explique qu’il votera lui aussi, plus tard.',
        'Ce second vote désignera des sénateurs.',
      ],
      qs: [
        lecture(
          SENATEURS,
          'Quel type de suffrage désigne les sénateurs dans ce texte ?',
          'un suffrage indirect',
          [
            ['un suffrage direct', 'Ce sont des grands électeurs, et non tous les citoyens, qui votent.'],
            ['un référendum', 'Un référendum répond à une question, il ne désigne pas d’élus.'],
            ['un tirage au sort', 'Le texte parle d’un vote.'],
          ],
          'Entre les citoyens et les sénateurs, il y a des grands électeurs : c’est un suffrage indirect.',
        ),
        lecture(
          MUNICIPALES,
          'Pour combien de temps le conseil municipal choisi par Inès est-il élu ?',
          'six ans',
          [
            ['un an', 'Un mandat municipal dure plusieurs années.'],
            ['cinq ans', 'Cinq ans est la durée du mandat présidentiel.'],
            ['neuf ans', 'Neuf ans concerne les membres nommés du Conseil constitutionnel.'],
          ],
          'Les conseillers municipaux sont élus pour six ans.',
        ),
      ],
    },
    {
      title: 'Débat avant un vote',
      lines: [
        'Avant un scrutin, des partis défendent des programmes différents.',
        'Au marché, les habitants discutent et comparent leurs idées.',
        'Marc hésite à aller voter.',
        'Sa sœur lui répond : « Personne ne te forcera, mais voter, c’est prendre part aux choix de la cité. »',
      ],
      qs: [
        lecture(
          CAMPAGNES,
          'Que veut dire la sœur de Marc ?',
          'le vote n’est pas obligatoire, mais c’est un engagement dans la cité',
          [
            ['Marc paiera une amende s’il s’abstient', 'Le texte dit que personne ne le forcera.'],
            ['seuls les partis peuvent voter', 'Les partis défendent des idées, les électeurs votent.'],
            ['le débat est interdit avant un vote', 'Au contraire, les habitants discutent.'],
          ],
          'La campagne est un moment de débat ; voter est un engagement libre.',
        ),
        lecture(
          PARTIS,
          'Quel rôle jouent les partis dans ce texte ?',
          'ils concourent à l’expression du suffrage en proposant des programmes',
          [
            ['ils nomment les électeurs', 'Les électeurs ne sont pas nommés par les partis.'],
            ['ils comptent seuls les bulletins', 'Le texte parle de programmes à défendre.'],
            ['ils remplacent le vote', 'Les partis aident au choix, ils ne remplacent pas les électeurs.'],
          ],
          'La Constitution reconnaît ce rôle aux partis politiques.',
        ),
      ],
    },
  ],
};

// ——— Notion 3 : citoyenneté active ———

const citoyennete: Notion = {
  ...commun,
  id: 'em3-citoyennete-active',
  title: 'La citoyenneté active : s’engager',
  hint: 'Demande-toi qui agit, pour quel but, et par quel moyen.',
  memo: [
    'La démocratie se fait vivre par l’**engagement** : dans un parti ou un mandat, un **syndicat**, une **association**, l’humanitaire ou la démocratie scolaire.',
    'La liberté de **manifester** permet d’exprimer ses opinions et de faire pression sur les gouvernements ; une manifestation sur la voie publique doit être déclarée.',
    'Au lycée, le **conseil de la vie lycéenne** associe les élèves aux décisions : un exemple de démocratie scolaire à citer au brevet.',
  ],
  faits: [
    fait(
      ENGAGEMENT_EFFECTIF,
      ['Sur quoi repose essentiellement la vie démocratique ?', 'l’engagement effectif des citoyennes et des citoyens'],
      [
        [
          'le silence des citoyens entre les élections',
          'La démocratie demande au contraire la participation des citoyens.',
        ],
        ['les seules décisions des experts', 'Des experts peuvent éclairer, mais les citoyens participent.'],
        ['le seul vote des élus', 'Les citoyens agissent aussi, au-delà du travail des élus.'],
      ],
      ['La vie démocratique repose sur l’', ' effectif des citoyennes et des citoyens.', ['engagement']],
      'Voter, militer, adhérer : l’engagement fait vivre la démocratie.',
    ),
    fait(
      BUT_ASSO,
      [
        'Quel but une association relevant de la loi de 1901 ne peut-elle pas avoir ?',
        'partager des bénéfices entre ses membres',
      ],
      [
        ['défendre une cause', 'Défendre une cause est un but fréquent d’association.'],
        ['organiser des événements sportifs', 'Une association peut organiser du sport.'],
        ['mener une action humanitaire', 'L’action humanitaire est un but possible.'],
      ],
      ['Une association poursuit un but autre que de partager des ', '.', ['bénéfices', 'benefices']],
      'Le caractère non lucratif distingue l’association d’une entreprise.',
    ),
    fait(
      OBJET_SYNDICAT,
      ['Quel est l’objet d’un syndicat ?', 'étudier et défendre des droits et des intérêts professionnels'],
      [
        ['voter la loi à la place du Parlement', 'La loi est votée par le Parlement.'],
        ['partager les bénéfices d’une entreprise', 'Un syndicat défend des intérêts, il ne distribue pas de gains.'],
        ['nommer les ministres', 'Les ministres ne sont pas nommés par un syndicat.'],
      ],
      [
        'Un ',
        ' a pour objet l’étude et la défense des droits et des intérêts professionnels des personnes qu’il représente.',
        ['syndicat'],
      ],
      'Le syndicat représente et défend les travailleurs ou les professionnels.',
    ),
    fait(
      MANIF,
      ['Qu’est-ce qu’une manifestation ?', 'une réunion sur la voie publique pour exprimer une conviction collective'],
      [
        ['un vote pour choisir un député', 'C’est une élection législative.'],
        ['une réunion privée chez soi', 'La manifestation a lieu sur la voie publique.'],
        ['un jugement rendu par un tribunal', 'Un jugement relève de la justice.'],
      ],
      ['Une réunion sur la voie publique pour exprimer une conviction collective est une ', '.', ['manifestation']],
      'C’est un moyen d’expression collective et de pression sur le pouvoir politique.',
    ),
    expert(
      fait(
        DECLAREE,
        ['Que doivent faire les organisateurs avant une manifestation sur la voie publique ?', 'la déclarer'],
        [
          ['organiser un référendum', 'Un référendum est un vote national ou local.'],
          ['obtenir un vote du Parlement', 'Le Parlement n’autorise pas les manifestations une à une.'],
          ['la garder secrète', 'La manifestation doit au contraire être déclarée.'],
        ],
        ['Pour prévenir les troubles de l’ordre public, une manifestation doit être ', '.', ['déclarée', 'declaree']],
        'La déclaration préalable permet d’encadrer la manifestation, qui reste une liberté.',
      ),
    ),
    fait(
      CVL,
      [
        'Dans quelle instance les lycéens sont-ils associés aux décisions de leur établissement ?',
        'le conseil de la vie lycéenne (CVL)',
      ],
      [
        ['le Sénat', 'Le Sénat est une assemblée du Parlement.'],
        ['le conseil municipal', 'Il règle les affaires de la commune.'],
        ['le Conseil constitutionnel', 'Il contrôle la conformité des lois à la Constitution.'],
      ],
      [
        'Le Conseil des délégués pour la vie ',
        ' associe les lycéens aux décisions de l’établissement.',
        ['lycéenne', 'lyceenne'],
      ],
      'Le CVL est un lieu de démocratie scolaire.',
    ),
    expert(
      fait(
        IDEAL,
        [
          'Comment voir la démocratie pour comprendre que chacun peut encore l’améliorer ?',
          'comme un idéal à atteindre, qui n’est pas figé',
        ],
        [
          ['comme un système terminé, qui ne changera plus', 'La démocratie n’est pas figée : elle peut progresser.'],
          ['comme l’affaire des seuls élus', 'Chaque citoyen peut agir et participer.'],
          ['comme une tradition qui interdit le débat', 'La démocratie vit du débat.'],
        ],
        ['La démocratie est un ', ' à atteindre et non une réalité figée.', ['idéal', 'ideal']],
        'Parce qu’elle n’est jamais achevée, chaque citoyen peut contribuer à l’améliorer.',
      ),
    ),
  ],
  paires3: [
    ['Syndicat', 'Défendre des intérêts professionnels'],
    ['Association', 'Agir à plusieurs sans partager de bénéfices'],
    ['Manifestation', 'Exprimer une conviction sur la voie publique'],
  ],
  paires5: [
    ['Engagement politique', 'Exercer un mandat'],
    ['Engagement syndical', 'Défendre les droits au travail'],
    ['Démocratie scolaire', 'Siéger au CVL'],
    ['Déclaration préalable', 'Formalité avant de manifester'],
    ['Loi de 1901', 'Liberté de créer une association'],
  ],
  libres: [
    libre(
      DEUX_PERSONNES,
      'combien de personnes faut-il au minimum pour créer une association ? (en chiffres)',
      ['2', 'deux'],
      [
        ['10', 'Il n’en faut pas autant.'],
        ['1', 'Une association suppose de mettre en commun à plusieurs.'],
      ],
      'Au moins deux personnes, réunies autour d’un objectif commun.',
    ),
    libre(
      FORMES,
      'quel mot désigne l’engagement des élèves dans les instances de leur établissement ? La démocratie …',
      ['scolaire', 'la démocratie scolaire', 'démocratie scolaire', 'lycéenne'],
      [
        ['syndicale', 'Elle concerne le monde du travail.'],
        ['militaire', 'L’armée est une autre forme d’engagement, dans une institution.'],
      ],
      'La démocratie scolaire permet aux élèves de participer.',
    ),
    libre(
      MANIFESTER,
      'quelle liberté permet de défiler dans la rue pour faire pression sur un gouvernement ? La liberté de …',
      ['manifester', 'manifestation', 'de manifester', 'la liberté de manifester'],
      [
        ['circuler', 'Circuler, c’est se déplacer, pas porter une revendication.'],
        ['commerce', 'La liberté de commerce concerne les activités économiques.'],
      ],
      'La liberté de manifester sert à exprimer des opinions et à peser sur les décisions.',
    ),
  ],
  docs: [
    {
      title: 'Sauver la bibliothèque',
      lines: [
        'La mairie envisage de réduire les horaires de la bibliothèque.',
        'Hugo et une voisine créent une association pour la défendre, sans chercher à gagner d’argent.',
        'Avant de réunir des habitants sur la place, ils préviennent officiellement les autorités.',
        'Une délégation demande à rencontrer les élus.',
      ],
      qs: [
        lecture(
          BUT_ASSO,
          'Quel élément du texte montre le caractère non lucratif de leur groupe ?',
          'ils ne cherchent pas à gagner d’argent',
          [
            ['ils préviennent les autorités', 'Cette démarche concerne le rassemblement, pas l’argent.'],
            ['ils rencontrent les élus', 'La rencontre est une démarche, pas le but financier.'],
            ['la mairie réduit des horaires', 'Ce fait explique leur action, pas leur statut.'],
          ],
          'Une association agit dans un but autre que de partager des bénéfices.',
        ),
        lecture(
          DECLAREE,
          'Quelle formalité accomplissent-ils avant le rassemblement ?',
          'ils le déclarent',
          [
            ['ils organisent des élections', 'Un rassemblement n’est pas une élection.'],
            ['ils votent une loi', 'Seul le Parlement vote la loi.'],
            ['ils dissolvent le conseil municipal', 'Des habitants ne dissolvent pas un conseil.'],
          ],
          'Une manifestation sur la voie publique doit être déclarée.',
        ),
      ],
    },
    {
      title: 'Les horaires de la cantine',
      lines: [
        'Au lycée de Nora, les files à la cantine sont très longues.',
        'Nora, élue par les élèves, prépare une proposition.',
        'Elle la présente à l’instance qui réunit des délégués lycéens et des adultes.',
        'Le chef d’établissement inscrit le sujet à l’ordre du jour.',
      ],
      qs: [
        lecture(
          CVL,
          'De quelle instance s’agit-il probablement ?',
          'le Conseil des délégués pour la vie lycéenne',
          [
            ['le Conseil constitutionnel', 'Il juge la conformité des lois à la Constitution.'],
            ['l’Assemblée nationale', 'Elle réunit les députés.'],
            ['la cour d’assises', 'Elle juge des crimes.'],
          ],
          'Le CVL associe les lycéens aux décisions de leur établissement.',
        ),
        lecture(
          FORMES,
          'Quelle forme d’engagement Nora pratique-t-elle ?',
          'la démocratie scolaire',
          [
            ['l’engagement dans l’armée', 'Nora agit dans son lycée, pas dans une institution militaire.'],
            ['un mandat de sénatrice', 'Un sénateur est élu par des grands électeurs.'],
            ['une grève syndicale', 'Le texte parle d’une proposition portée en instance, pas d’une grève.'],
          ],
          'Représenter les élèves et proposer, c’est la démocratie scolaire.',
        ),
      ],
    },
  ],
};

// ——— Notion 4 : défense et engagement ———

const defense: Notion = {
  ...commun,
  id: 'em3-defense-engagement',
  title: 'Défense nationale et engagement dans les institutions',
  hint: 'Demande-toi qui décide pour la défense, et comment un citoyen peut s’engager.',
  memo: [
    'La **défense nationale** concerne tout le monde : les citoyens concourent à la défense et à la **cohésion** de la Nation.',
    'Le président de la République est chef des armées (article 15), le Premier ministre est responsable de la défense (article 21) ; le **Parlement** autorise la déclaration de guerre (article 35). À l’étranger, il est informé d’une intervention sous trois jours au plus et doit autoriser sa prolongation au-delà de quatre mois.',
    'On peut aussi s’engager dans les **institutions** : armée, police, justice, éducation. Au brevet, distingue qui décide et qui sert.',
  ],
  faits: [
    fait(
      CONCOURENT,
      [
        'Selon le code du service national, à quoi les citoyens concourent-ils ?',
        'à la défense et à la cohésion de la Nation',
      ],
      [
        ['à la seule gestion de leur commune', 'La phrase vise la Nation tout entière.'],
        ['au vote des lois à la place des députés', 'La loi est votée par le Parlement.'],
        ['à la publicité des entreprises', 'Cela n’a aucun rapport avec la défense.'],
      ],
      ['Les citoyens concourent à la défense et à la ', ' de la Nation.', ['cohésion', 'cohesion']],
      'La défense est un devoir qui concerne l’ensemble des citoyens.',
    ),
    fait(
      CHEF_ARMEES,
      ['Qui est le chef des armées sous la Ve République ?', 'le président de la République'],
      [
        ['le président du Sénat', 'Il préside une assemblée du Parlement.'],
        ['le maire de la capitale', 'Un maire dirige une commune.'],
        ['le Premier ministre', 'Il est responsable de la défense, mais le chef des armées est un autre.'],
      ],
      ['Le président de la République est le chef des ', '.', ['armées', 'armees']],
      'La Constitution lui confie ce titre (article 15).',
    ),
    fait(
      GUERRE,
      ['Quelle institution autorise la déclaration de guerre ?', 'le Parlement'],
      [
        ['le conseil municipal', 'Il ne s’occupe que de la commune.'],
        ['la cour d’assises', 'Elle juge des crimes.'],
        ['le Conseil constitutionnel', 'Il contrôle la conformité des lois à la Constitution.'],
      ],
      ['La déclaration de guerre est autorisée par le ', '.', ['Parlement']],
      'Les représentants du peuple ont le dernier mot pour autoriser la guerre.',
    ),
    expert(
      fait(
        DEFENSE_PM,
        [
          'Selon l’article 21 de la Constitution, quel membre de l’exécutif est responsable de la Défense nationale ?',
          'le Premier ministre',
        ],
        [
          ['le président du Conseil constitutionnel', 'Il ne fait pas partie de l’exécutif.'],
          ['le préfet', 'Il représente l’État dans un département.'],
          ['le président de l’Assemblée nationale', 'Il préside les députés, qui ne sont pas l’exécutif.'],
        ],
        ['Le Premier ministre est responsable de la Défense ', '.', ['nationale']],
        'L’article 21 charge le Premier ministre de diriger le Gouvernement et le rend responsable de la Défense nationale.',
      ),
    ),
    fait(
      ENSEIGNEMENT,
      [
        'Quel est l’objet de l’enseignement de la défense au collège et au lycée ?',
        'renforcer le lien armée-Nation et sensibiliser la jeunesse à son devoir de défense',
      ],
      [
        ['former chaque élève au combat', 'Il s’agit de sensibiliser, pas d’un entraînement au combat.'],
        ['recruter de force des élèves', 'Cet enseignement ne recrute personne.'],
        ['remplacer le vote des citoyens', 'Il n’a aucun lien avec le vote.'],
      ],
      ['L’enseignement de la défense vise à renforcer le lien armée-', '.', ['Nation']],
      'Il fait comprendre la défense et le devoir de défense.',
    ),
    fait(
      INSTITUTIONS,
      [
        'Quelle liste réunit uniquement des institutions de la République où l’on peut s’engager ?',
        'armée, police, justice, éducation',
      ],
      [
        [
          'commerce, publicité, tourisme, loisirs',
          'Ce sont des secteurs d’activité, pas des institutions de la République.',
        ],
        ['armée, banque, publicité, mode', 'Dans cette liste, seule l’armée est une institution de la République.'],
        ['club de sport, fan-club, magasin, marque', 'Aucun de ces éléments n’est une institution de la République.'],
      ],
      [
        'S’engager dans les institutions, c’est par exemple rejoindre l’armée, la police, la justice ou l’',
        ' pour enseigner.',
        ['éducation', 'education', 'éducation nationale', 'Éducation nationale', 'école', 'ecole'],
      ],
      'Armée, police, justice, éducation : quatre institutions au service de tous.',
    ),
    expert(
      fait(
        JURES,
        ['Comment un citoyen est-il désigné pour être juré d’assises ?', 'par tirage au sort'],
        [
          ['par une élection nationale', 'Les jurés ne sont pas élus.'],
          ['par le choix du président de la République', 'Le président ne choisit pas les jurés.'],
          ['par un concours', 'Aucun concours ne désigne les jurés.'],
        ],
        ['Les jurés d’assises sont tirés au ', '.', ['sort']],
        'Être juré est une façon pour un citoyen de participer à la justice.',
      ),
    ),
  ],
  paires3: [
    ['Chef des armées', 'Président de la République'],
    ['Autorise la déclaration de guerre', 'Parlement'],
    ['Participe au jugement des crimes', 'Juré d’assises'],
  ],
  paires5: [
    ['Article 15', 'Le président est chef des armées'],
    ['Article 21', 'Le Premier ministre est responsable de la défense'],
    ['Article 35', 'Guerre et interventions : rôle du Parlement'],
    ['Armée', 'Institution où l’on peut s’engager pour la défense'],
    ['Enseignement de la défense', 'Lien entre l’armée et la Nation'],
  ],
  libres: [
    libre(
      INFORME,
      'au plus tard combien de jours après le début d’une intervention à l’étranger le Parlement doit-il être informé ? (en chiffres)',
      ['3', 'trois'],
      [
        ['4', '4 se rapporte aux mois : au-delà, la prolongation doit être autorisée.'],
        ['30', 'Le délai est bien plus court.'],
      ],
      'Le Gouvernement informe le Parlement au plus tard trois jours après le début.',
    ),
    libre(
      PROLONGATION,
      'au-delà de combien de mois le Parlement doit-il autoriser la prolongation d’une intervention à l’étranger ? (en chiffres)',
      ['4', 'quatre'],
      [
        ['3', '3 se rapporte aux jours pour informer le Parlement.'],
        ['12', 'Le Parlement se prononce bien avant un an.'],
      ],
      'Au-delà de quatre mois, la prolongation est soumise à l’autorisation du Parlement.',
    ),
    libre(
      CHEF_ARMEES,
      'qui est le chef des armées sous la Ve République ?',
      [
        'le président de la République',
        'président de la République',
        'le president de la Republique',
        'le président',
        'président',
      ],
      [
        ['le Premier ministre', 'Il est responsable de la défense, mais le chef des armées est le président.'],
        ['le Parlement', 'Le Parlement autorise la déclaration de guerre, il ne commande pas les armées.'],
      ],
      'Le président de la République est le chef des armées.',
    ),
  ],
  docs: [
    {
      title: 'Une intervention à l’étranger',
      lines: [
        'Le Gouvernement envoie des soldats français dans un pays lointain.',
        'Deux jours après le début, il informe le Parlement et expose ses objectifs.',
        'Un débat a lieu, sans vote.',
        'Cinq mois plus tard, la mission continue.',
      ],
      qs: [
        lecture(
          PROLONGATION,
          'Au bout de plus de quatre mois, qu’est-il exigé ?',
          'l’autorisation du Parlement pour prolonger l’intervention',
          [
            ['un vote des seuls maires', 'Les maires n’autorisent pas les interventions.'],
            ['une décision d’une cour d’assises', 'Elle juge des crimes.'],
            ['aucune démarche', 'La Constitution prévoit un contrôle du Parlement.'],
          ],
          'La prolongation au-delà de quatre mois est soumise à l’autorisation du Parlement.',
        ),
        lecture(
          INFORME,
          'Le délai d’information du Parlement est-il respecté ?',
          'oui, il est informé au plus tard trois jours après le début',
          [
            ['non, il fallait l’informer un mois avant', 'La Constitution fixe un délai après le début.'],
            ['non, le Parlement n’a jamais à être informé', 'La Constitution impose cette information.'],
            ['oui, car aucun délai n’existe', 'Un délai de trois jours existe.'],
          ],
          'Deux jours est inférieur au maximum de trois jours.',
        ),
      ],
    },
    {
      title: 'Choisir un engagement',
      lines: [
        'Au collège, la classe de Yanis étudie la défense nationale.',
        'Yanis dit : « Je voudrais un métier au service de la Nation. »',
        'Il hésite entre l’armée et la police.',
        'Sa voisine rappelle qu’on peut aussi servir dans l’éducation ou la justice.',
      ],
      qs: [
        lecture(
          INSTITUTIONS,
          'Quelle idée ce texte illustre-t-il ?',
          'on peut s’engager dans différentes institutions',
          [
            ['seule l’armée permet de s’engager', 'La voisine cite aussi d’autres institutions.'],
            ['l’engagement est réservé aux élus', 'Le texte parle de métiers dans des institutions.'],
            ['on ne peut s’engager qu’à la retraite', 'Yanis est collégien et y réfléchit déjà.'],
          ],
          'Armée, police, justice, éducation : plusieurs voies existent.',
        ),
        lecture(
          ENSEIGNEMENT,
          'Pourquoi la classe de Yanis étudie-t-elle la défense ?',
          'pour renforcer le lien armée-Nation et sensibiliser au devoir de défense',
          [
            ['pour préparer un combat immédiat', 'C’est un enseignement, pas un entraînement au combat.'],
            ['pour désigner des jurés', 'Les jurés sont tirés au sort.'],
            ['pour remplacer les cours d’histoire', 'Il s’inscrit dans les enseignements, il ne les supprime pas.'],
          ],
          'Le code du service national fixe cet objectif.',
        ),
      ],
    },
  ],
};

export const FAIRE_VIVRE_DEMOCRATIE_SKILLS: readonly Skill[] = [institutions, elections, citoyennete, defense].map(
  notion,
);
