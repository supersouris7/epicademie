import type { Skill } from '../types.ts';
import { notion, type DocQuestion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * 5e, « Égalité, fraternité et solidarité » (lot em-5e-01). Chaque fait cite le programme d'EMC du 13 juin 2024
 * (registre `emc-2024`) avec sa citation exacte. Les notions de risques sociaux, de Sécurité sociale et de risques
 * environnementaux, inscrites au programme, forment une notion à part. Les textes à lire du niveau 5 sont écrits
 * pour l'exercice.
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 5e : « Égalité, fraternité et solidarité »';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 5e.';

type Wrong = readonly [label: string, why: string];
const wrongs = (list: readonly Wrong[]) => list.map(([label, why]) => ({ label, why }));

/** Fait cité : citation, question et réponse, trois erreurs, phrase à trou, explication. */
const fait = (
  quote: string,
  [q, a]: readonly [string, string],
  wrong: readonly [Wrong, Wrong, Wrong],
  gap: Fait['gap'],
  explain: string,
): Fait => ({ quote, q, a, wrong: wrongs(wrong), gap, explain });

/** Fait exigeant : non proposé au niveau 1. */
const expert = (f: Fait): Fait => ({ ...f, avance: true });

const libre = (
  quote: string,
  q: string,
  accepted: readonly string[],
  traps: readonly Wrong[],
  explain: string,
): Libre => ({ quote, q, accepted, traps: traps.map(([text, why]) => ({ text, why })), explain });

const lecture = (
  quote: string,
  q: string,
  a: string,
  wrong: readonly [Wrong, Wrong, Wrong],
  explain: string,
): DocQuestion => ({ quote, q, a, wrong: wrongs(wrong), explain });

// ——— Citations exactes employées plusieurs fois ———

const PRINCIPE =
  'L’égalité entre les femmes et les hommes est un principe fondamental de la République française, garanti par la Constitution';
const PREAMBULE = 'La loi garantit à la femme, dans tous les domaines, des droits égaux à ceux de l’homme.';
const COMBATS =
  'droit de vote des femmes en 1944, droit d’exercer une profession sans autorisation du mari en 1965, loi sur l’interruption volontaire de grossesse (IVG) en 1975, loi sur l’autorité parentale conjointe en 1987, loi sur la parité en 2000';
const PARITE = 'comment on passe de l’égalité en droits à un égal accès aux mandats politiques';
const DEMEURENT =
  'de nombreuses inégalités demeurent et les violences sexistes et sexuelles persistent, qui nécessitent l’action des pouvoirs publics et de la société civile';
const ODD5 = 'c’est aussi un objectif de développement durable (ODD5)';

const DELIT = 'la discrimination est un délit qui contrevient au principe d’égalité';
const CODE_PENAL =
  'Le Code pénal définit la discrimination comme « toute distinction opérée entre les personnes physiques »';
const MECANISMES =
  'à la racine des agissements discriminatoires se trouvent des mécanismes d’exclusion (stéréotypes, préjugés, etc.) qui réduisent l’identité d’un individu à son appartenance à un groupe que l’on stigmatise';
const PUNIS = 'On retrouve ces stéréotypes dans le racisme, l’antisémitisme et la xénophobie, punis par la loi';
const HARCELEMENT = 'depuis 2022, le harcèlement scolaire est reconnu comme un délit';
const LOI_2008 = 'la loi du 27 mai 2008 punissant les discriminations';
const DEFENSEUR = 'Travailler à partir de situations ayant donné lieu à l’intervention du Défenseur des droits';
const INCLUSION = 'l’inclusion scolaire de tous les enfants sans aucune distinction';
const LOI_2005 =
  'loi du 11 février 2005 « Pour l’égalité des droits et des chances, la participation et la citoyenneté des personnes handicapées »';

const SOLIDARITE =
  'Le principe de solidarité signifie que la Nation assure aux individus libres et égaux en droit une protection';
const UNION =
  'Au nom de ce principe, lié à l’idéal de fraternité, l’État, les collectivités territoriales et la société civile (associations) unissent leurs forces pour réduire les inégalités';
const FRATERNITE =
  'La fraternité suppose de considérer l’autre comme son égal et d’estimer qu’il est du devoir de chacun de venir en aide aux autres en cas de nécessité';
const IMPOT =
  'l’impôt traduit la participation des citoyennes et des citoyens à la solidarité nationale (impôts directs et indirects)';
const MONDE = 'à l’échelle mondiale (institutions internationales et ONG)';
const EUROPE = 'la solidarité s’exerce également à l’échelle de l’Union européenne';
const ECOLE = 'son ambition de réduire les inégalités en donnant à tous accès à la connaissance';
const ACTEURS =
  'le rôle des différents acteurs et intervenants, ainsi que leur complémentarité, qu’ils soient locaux, régionaux ou nationaux, associatifs ou étatiques';

const RISQUES_SOCIAUX =
  'les risques sociaux (maladie, accident, invalidité, grossesse non désirée, perte d’emploi, perte d’autonomie liée à l’âge) sont tous les événements auxquels les individus risquent de ne pouvoir faire face avec leurs seules ressources';
const SECU = 'La Sécurité sociale et le système public de santé participent de la solidarité nationale';
const CIDE_SANTE =
  'le droit international garantit aux enfants le droit à la santé et à la sécurité sociale (art. 24 à 26 CIDE)';
const ENVIRONNEMENT =
  'les risques environnementaux (pollutions, incendies, catastrophes naturelles liées ou non au changement climatique) nécessitent la mobilisation de moyens à toutes les échelles';
const MOYENS =
  'pour la prévention, la mise en sécurité des personnes, l’aide aux victimes et la reconstruction (loi du 13 août 2004)';
const CIVILE = 'montrer que la sécurité civile est l’affaire de tous et souligner l’importance de la prévention';
const ODD3 =
  'L’ODD 3 « Bonne santé et bien-être » constitue un point d’entrée pour expliquer une politique de prévention en matière de santé publique';
const CATASTROPHE =
  'tant par l’intervention des forces de sécurité intérieure (sécurité civile, police et gendarmerie) que par la mobilisation des services de l’État';

const ASSOCIATIONS = 'Montrer la contribution des associations à la solidarité';
const RECONNAISSANCE = 'leur reconnaissance par l’État (intérêt public, exonération fiscale)';
const SANG = 'Sensibiliser au don de sang, acte de citoyenneté et de solidarité';
const CADETS = 'S’appuyer sur le dispositif des cadets de la sécurité civile';
const JEUNES = 'appui sur les élèves élus au conseil départemental, conseils municipaux de jeunes';
const PARCOURS = 'engagement au sein d’institutions et d’associations ou pour la Nation (service civique';

// ——— Notion 1 : l'égalité entre les femmes et les hommes ———

const egaliteFemmesHommes: Notion = {
  id: 'em5-egalite-femmes-hommes',
  title: 'L’égalité entre les femmes et les hommes : droits, parité, combats',
  hint: 'Repense au mémo : ce que garantit la Constitution, comment les droits ont été conquis et ce qui reste à faire.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'L’égalité entre les femmes et les hommes est un principe de la République, garanti par la **Constitution** : c’est l’**égalité en droit**.',
    'Elle vient de combats : droit de vote en 1944, métier sans autorisation du mari en 1965, **IVG** en 1975, **autorité parentale** conjointe en 1987, loi sur la **parité** en 2000.',
    'Des inégalités et des **violences sexistes et sexuelles** persistent. Exemple : un **stéréotype** de genre peut peser sur le choix d’un métier.',
  ],
  faits: [
    fait(
      PRINCIPE,
      [
        'Quel texte garantit l’égalité entre les femmes et les hommes, principe fondamental de la République ?',
        'la Constitution',
      ],
      [
        ['le règlement intérieur de chaque collège', 'Un règlement intérieur ne vaut que dans un établissement.'],
        ['aucun texte : c’est seulement une habitude', 'Ce principe est écrit et garanti par un texte fondamental.'],
        ['une affiche de campagne électorale', 'Une affiche ne garantit aucun droit.'],
      ],
      [
        'L’égalité entre les femmes et les hommes est garantie par la ',
        ', texte fondamental de la République.',
        ['Constitution', 'constitution'],
      ],
      'La Constitution est au sommet des règles : elle garantit ce principe.',
    ),
    fait(
      PREAMBULE,
      [
        'D’après le préambule de 1946, dans quels domaines la loi garantit-elle à la femme des droits égaux à ceux de l’homme ?',
        'dans tous les domaines',
      ],
      [
        ['seulement dans le domaine du vote', 'Le texte ne se limite pas au vote.'],
        ['seulement à l’intérieur de la famille', 'La famille n’est qu’un des domaines concernés.'],
        ['seulement au travail', 'Le travail est concerné, mais pas lui seul.'],
      ],
      ['La loi garantit à la femme, dans tous les ', ', des droits égaux à ceux de l’homme.', ['domaines', 'domaine']],
      'Le préambule de 1946 ne fait aucune exception : tous les domaines.',
    ),
    fait(
      COMBATS,
      ['En quelle année les femmes obtiennent-elles le droit de vote en France ?', '1944'],
      [
        ['1965', '1965 est l’année où une femme peut exercer un métier sans autorisation de son mari.'],
        ['2000', '2000 est l’année de la loi sur la parité.'],
        ['1975', '1975 est l’année de la loi sur l’IVG.'],
      ],
      ['Les femmes obtiennent le droit de vote en ', '.', ['1944']],
      '1944 ouvre la série : les autres droits cités viennent après (1965, 1975, 1987, 2000).',
    ),
    fait(
      COMBATS,
      ['Quel droit les femmes mariées obtiennent-elles en 1965 ?', 'exercer une profession sans autorisation du mari'],
      [
        ['voter pour la première fois', 'Le droit de vote date de 1944.'],
        ['accéder à la parité en politique', 'La loi sur la parité date de 2000.'],
        ['partager l’autorité parentale', 'La loi sur l’autorité parentale conjointe date de 1987.'],
      ],
      [
        'En 1965, une femme peut exercer une profession sans ',
        ' de son mari.',
        ['autorisation', 'l’autorisation', 'permission', 'accord', 'l’accord', 'consentement'],
      ],
      'Depuis 1965, l’accord du mari n’est plus nécessaire pour travailler.',
    ),
    expert(
      fait(
        COMBATS,
        ['Sur quoi porte la loi votée en 1987 ?', 'l’autorité parentale conjointe'],
        [
          ['le droit de vote des femmes', 'Ce droit date de 1944.'],
          ['la parité en politique', 'La parité fait l’objet d’une loi en 2000.'],
          ['l’interruption volontaire de grossesse', 'La loi sur l’IVG date de 1975.'],
        ],
        ['La loi de 1987 porte sur l’autorité ', ' conjointe.', ['parentale']],
        'En 1987, la loi concerne l’autorité parentale exercée ensemble.',
      ),
    ),
    fait(
      PARITE,
      ['La loi sur la parité de 2000 vise un égal accès des femmes et des hommes à quoi ?', 'aux mandats politiques'],
      [
        ['aux transports en commun', 'La parité dont il est question concerne la vie politique.'],
        ['aux vacances scolaires', 'Les vacances ne sont pas l’objet de cette loi.'],
        ['au permis de conduire', 'La loi vise les fonctions auxquelles on est élu.'],
      ],
      [
        'La loi sur la parité vise un égal accès aux ',
        ' politiques.',
        ['mandats', 'mandat', 'fonctions', 'postes', 'responsabilités'],
      ],
      'Avoir les mêmes droits ne suffit pas toujours : la parité vise un égal accès réel aux mandats politiques.',
    ),
    fait(
      DEMEURENT,
      [
        'Qui doit agir contre les inégalités et les violences sexistes qui persistent ?',
        'les pouvoirs publics et la société civile',
      ],
      [
        ['les victimes seulement', 'Les victimes ne doivent pas rester seules : l’action est collective.'],
        ['personne, car l’égalité est déjà complète', 'De nombreuses inégalités demeurent.'],
        ['uniquement les élèves d’un collège', 'L’action dépasse largement un établissement.'],
      ],
      ['Contre les inégalités qui demeurent, il faut l’action des pouvoirs publics et de la société ', '.', ['civile']],
      'Les pouvoirs publics et la société civile doivent agir.',
    ),
    expert(
      fait(
        ODD5,
        [
          'Sur le plan international, l’égalité entre les femmes et les hommes correspond à quel objectif de développement durable ?',
          'l’ODD 5',
        ],
        [
          ['l’ODD 3', 'L’ODD 3 porte sur la bonne santé et le bien-être.'],
          ['aucun objectif', 'L’égalité femmes-hommes fait partie des objectifs de développement durable.'],
          [
            'le service civique',
            'Le service civique est une forme d’engagement, pas un objectif de développement durable.',
          ],
        ],
        ['L’égalité femmes-hommes est un objectif de développement ', ' (ODD 5).', ['durable']],
        'L’égalité entre les femmes et les hommes est l’objectif numéro 5.',
      ),
    ),
  ],
  paires3: [
    ['1944', 'Droit de vote des femmes'],
    ['1975', 'Loi sur l’IVG'],
    ['2000', 'Loi sur la parité'],
  ],
  paires5: [
    ['1944', 'Droit de vote des femmes'],
    ['1965', 'Profession sans autorisation du mari'],
    ['1975', 'Loi sur l’IVG'],
    ['1987', 'Autorité parentale conjointe'],
    ['2000', 'Loi sur la parité'],
  ],
  libres: [
    libre(
      PARITE,
      'comment appelle-t-on le principe d’un égal accès des femmes et des hommes aux mandats politiques ?',
      ['parité', 'la parité', 'parite', 'la parite'],
      [
        ['mixité', 'La mixité réunit filles et garçons ; la parité vise un égal accès, ici aux mandats.'],
        ['majorité', 'La majorité désigne un âge ou le plus grand nombre de voix.'],
      ],
      'La parité organise un égal accès aux mandats politiques.',
    ),
    libre(
      COMBATS,
      'en quelle année une loi établit-elle la parité ? (en chiffres)',
      ['2000', 'en 2000'],
      [
        ['1944', '1944 est l’année du droit de vote des femmes.'],
        ['1987', '1987 concerne l’autorité parentale conjointe.'],
      ],
      'La loi sur la parité date de 2000.',
    ),
    libre(
      PRINCIPE,
      'quel texte fondamental de la République garantit l’égalité entre les femmes et les hommes ?',
      [
        'la Constitution',
        'Constitution',
        'la Constitution française',
        'la Constitution de 1958',
        'le préambule de la Constitution de 1946',
      ],
      [
        ['le Code de la route', 'Le Code de la route règle la circulation.'],
        ['le règlement intérieur', 'Il ne s’applique qu’à un établissement.'],
      ],
      'C’est la Constitution qui garantit ce principe.',
    ),
  ],
  docs: [
    {
      title: 'Une frise au CDI',
      lines: [
        'Des élèves préparent une frise sur les droits des femmes en France.',
        'Première carte : en 1944, les femmes obtiennent le droit de vote.',
        'Deuxième carte : en 1965, une épouse peut travailler sans l’accord de son mari.',
        'Dernière carte : en 2000, une loi sur la parité est votée.',
      ],
      qs: [
        lecture(
          COMBATS,
          'Qu’est-ce que cette frise permet de montrer ?',
          'l’égalité des droits s’est construite par étapes',
          [
            ['tous les droits ont été obtenus la même année', 'Les cartes portent des dates différentes.'],
            ['les femmes votaient avant 1944 comme les hommes', 'La première carte date ce droit de 1944.'],
            ['la parité a précédé le droit de vote', '2000 vient après 1944.'],
          ],
          'Les droits ont été conquis les uns après les autres, grâce à des combats.',
        ),
        lecture(
          PARITE,
          'La dernière carte concerne surtout quel domaine ?',
          'l’accès aux mandats politiques',
          [
            ['l’accès au permis de conduire', 'La parité de 2000 ne porte pas sur la conduite.'],
            ['le choix des prénoms', 'Aucune carte ne parle de prénoms.'],
            ['les horaires des cours', 'La frise traite des droits, pas des horaires.'],
          ],
          'La loi sur la parité cherche un égal accès aux mandats politiques.',
        ),
      ],
    },
    {
      title: 'Le forum des métiers',
      lines: [
        'Au forum des métiers, Nora s’intéresse à la mécanique.',
        'Un visiteur lui dit que ce métier « n’est pas pour les filles ».',
        'La professeure rappelle que la loi garantit des droits égaux.',
        'Elle propose d’inviter une mécanicienne à témoigner.',
      ],
      qs: [
        lecture(
          'Travailler avec les élèves sur les stéréotypes de genre à l’école',
          'Comment qualifier la phrase du visiteur ?',
          'un stéréotype de genre',
          [
            ['une règle de droit', 'Aucune loi ne réserve ce métier aux garçons.'],
            ['une mesure de parité', 'La parité vise au contraire un égal accès.'],
            [
              'un conseil fondé sur les résultats de Nora',
              'Le visiteur parle des filles en général, pas de ses résultats.',
            ],
          ],
          'La phrase attribue un métier selon le sexe : c’est un stéréotype de genre.',
        ),
        lecture(
          PREAMBULE,
          'Sur quoi la professeure s’appuie-t-elle ?',
          'l’égalité des droits garantie par la loi',
          [
            ['la préférence du visiteur', 'Elle contredit justement le visiteur.'],
            ['l’obligation pour Nora de choisir ce métier', 'Nora reste libre de son choix.'],
            ['l’interdiction aux garçons de faire ce métier', 'L’égalité n’exclut personne.'],
          ],
          'La loi garantit à la femme des droits égaux à ceux de l’homme, dans tous les domaines.',
        ),
      ],
    },
  ],
};

// ——— Notion 2 : les discriminations ———

const discriminations: Notion = {
  id: 'em5-discriminations',
  title: 'Les discriminations : les reconnaître, connaître le droit',
  hint: 'Repense au mémo : une discrimination traite des personnes différemment selon un critère, et la loi intervient.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Une **discrimination** est un **délit** contraire à l’égalité : on distingue des personnes selon un critère (origine, sexe, handicap, religion, apparence…).',
    'Elle naît souvent de **stéréotypes** et de **préjugés**. Le **racisme**, l’**antisémitisme** et la **xénophobie** sont punis par la loi.',
    'Le **harcèlement scolaire** est un délit depuis 2022. L’**inclusion** vise à accueillir chacun ; le **Défenseur des droits** peut intervenir. Exemple : refuser un élève à cause de son handicap est une discrimination.',
  ],
  faits: [
    fait(
      DELIT,
      ['Aux yeux de la loi, qu’est-ce qu’une discrimination ?', 'un délit contraire au principe d’égalité'],
      [
        ['une opinion que la loi protège toujours', 'Discriminer n’est pas une simple opinion : c’est puni.'],
        ['un droit réservé aux employeurs', 'Aucun employeur n’a le droit de discriminer.'],
        ['une impolitesse sans conséquence juridique', 'La loi la qualifie de délit.'],
      ],
      ['La discrimination est un ', ' qui contrevient au principe d’égalité.', ['délit', 'delit']],
      'La loi en fait un délit, car elle va contre l’égalité.',
    ),
    fait(
      CODE_PENAL,
      [
        'Quel texte définit la discrimination comme « toute distinction opérée entre les personnes physiques » selon certains critères ?',
        'le Code pénal',
      ],
      [
        ['le Code de la route', 'Il concerne la circulation.'],
        ['le carnet de liaison', 'Le carnet n’est pas un texte de loi.'],
        ['la charte informatique du collège', 'Elle règle l’usage du matériel numérique.'],
      ],
      ['Le Code ', ' définit la discrimination et prévoit sa punition.', ['pénal', 'penal']],
      'Le Code pénal réunit des infractions et leurs peines.',
    ),
    fait(
      'des critères liés à leur origine, à leur sexe, orientation sexuelle et identité de genre, à leur nationalité, à leur religion, à leur apparence physique, leur handicap',
      [
        'Laquelle de ces différences de traitement repose sur un critère de discrimination cité par la loi ?',
        'écarter une personne à cause de son handicap',
      ],
      [
        [
          'choisir le candidat qui a le diplôme exigé',
          'Le diplôme exigé n’est pas un critère lié à la personne cité ici.',
        ],
        ['noter une copie selon ses réponses', 'La note porte sur le travail, pas sur la personne.'],
        ['réserver la cantine à ceux qui s’y sont inscrits', 'L’inscription est la même règle pour tous.'],
      ],
      [
        'Refuser un élève parce qu’il se déplace en fauteuil roulant est une discrimination liée à son ',
        '.',
        ['handicap'],
      ],
      'Le handicap fait partie des critères que la loi interdit d’utiliser pour distinguer les personnes.',
    ),
    fait(
      MECANISMES,
      [
        'Qu’est-ce qui se trouve à la racine des agissements discriminatoires ?',
        'des mécanismes d’exclusion comme les stéréotypes et les préjugés',
      ],
      [
        ['une connaissance précise de chaque personne', 'C’est l’inverse : on réduit la personne à un groupe.'],
        ['le respect du principe d’égalité', 'La discrimination contrevient à ce principe.'],
        ['une obligation prévue par la loi', 'La loi punit ces agissements.'],
      ],
      ['Les stéréotypes et les ', ' sont des mécanismes d’exclusion.', ['préjugés', 'prejugés', 'prejuges', 'préjugé']],
      'Stéréotypes et préjugés enferment une personne dans un groupe que l’on stigmatise.',
    ),
    fait(
      PUNIS,
      ['Que prévoit le droit face au racisme, à l’antisémitisme et à la xénophobie ?', 'ils sont punis par la loi'],
      [
        ['ils sont autorisés s’ils sont dits à l’oral', 'Les paroles aussi peuvent être punies.'],
        ['ils relèvent seulement de la politesse', 'Ce ne sont pas de simples impolitesses.'],
        ['ils sont permis sur Internet', 'La loi s’applique aussi en ligne.'],
      ],
      ['Le racisme, l’antisémitisme et la xénophobie sont punis par la ', '.', ['loi']],
      'La loi punit le racisme, l’antisémitisme et la xénophobie.',
    ),
    fait(
      HARCELEMENT,
      ['Depuis quelle année le harcèlement scolaire est-il reconnu comme un délit ?', '2022'],
      [
        ['2005', '2005 est l’année de la loi sur les personnes handicapées.'],
        ['2008', '2008 est l’année d’une loi punissant les discriminations.'],
        ['2013', '2013 est l’année de la loi sur la refondation de l’école.'],
      ],
      ['Depuis 2022, le harcèlement scolaire est reconnu comme un ', '.', ['délit', 'delit']],
      'Depuis 2022, le harcèlement scolaire est un délit.',
    ),
    expert(
      fait(
        LOI_2005,
        [
          'Quelle loi vise l’égalité des droits et des chances des personnes handicapées ?',
          'la loi du 11 février 2005',
        ],
        [
          ['la loi du 27 mai 2008', 'La loi de 2008 punit les discriminations en général.'],
          ['la loi du 13 août 2004', 'La loi de 2004 concerne la sécurité civile.'],
          ['la loi de 1944 sur le vote des femmes', 'Elle ne porte pas sur le handicap.'],
        ],
        [
          'La loi de 2005 vise l’égalité des droits et des chances des personnes ',
          '.',
          ['handicapées', 'handicapees', 'en situation de handicap'],
        ],
        'La loi du 11 février 2005 porte sur les droits des personnes handicapées.',
      ),
    ),
    fait(
      INCLUSION,
      ['Que signifie l’inclusion scolaire ?', 'accueillir tous les enfants à l’école, sans distinction'],
      [
        ['réserver l’école aux élèves sans difficulté', 'C’est une exclusion, l’inverse de l’inclusion.'],
        ['séparer les élèves selon leur origine', 'Séparer ainsi serait une discrimination.'],
        ['accueillir seulement les enfants du quartier le plus riche', 'L’inclusion ne fait aucune distinction.'],
      ],
      ['L’', ' scolaire concerne tous les enfants, sans aucune distinction.', ['inclusion']],
      'L’inclusion cherche à scolariser tous les enfants, notamment en situation de handicap.',
    ),
    expert(
      fait(
        LOI_2008,
        ['Quel est l’objet de la loi du 27 mai 2008 ?', 'une loi punissant les discriminations'],
        [
          ['une loi sur la sécurité civile', 'La loi sur la sécurité civile date de 2004.'],
          ['une loi sur la parité en politique', 'La loi sur la parité date de 2000.'],
          ['une loi sur le droit de vote des femmes', 'Ce droit date de 1944.'],
        ],
        ['La loi du 27 mai 2008 punit les ', '.', ['discriminations', 'discrimination']],
        'La loi du 27 mai 2008 permet à la justice de punir les discriminations.',
      ),
    ),
  ],
  paires3: [
    ['Discrimination', 'Délit contraire à l’égalité'],
    ['Inclusion scolaire', 'Accueil de tous les enfants'],
    ['Stéréotypes et préjugés', 'Mécanismes d’exclusion'],
  ],
  paires5: [
    ['Code pénal', 'Définit la discrimination'],
    ['Loi du 27 mai 2008', 'Punit les discriminations'],
    ['Loi du 11 février 2005', 'Droits des personnes handicapées'],
    ['2022', 'Harcèlement scolaire reconnu comme délit'],
    ['Défenseur des droits', 'Peut intervenir dans des situations de discrimination'],
  ],
  libres: [
    libre(
      DELIT,
      'comment nomme-t-on le fait, puni par la loi, de distinguer des personnes selon leur origine, leur sexe ou leur handicap ?',
      ['discrimination', 'la discrimination', 'une discrimination'],
      [
        ['égalité', 'L’égalité est justement le principe que ce fait contredit.'],
        ['inclusion', 'L’inclusion accueille chacun : c’est l’inverse.'],
      ],
      'Cette distinction s’appelle une discrimination.',
    ),
    libre(
      DEFENSEUR,
      'quelle autorité, le Défenseur des …, peut intervenir dans des situations de discrimination ?',
      ['droits', 'Défenseur des droits', 'le Défenseur des droits', 'des droits', 'defenseur des droits'],
      [
        ['devoirs', 'Cette autorité défend des droits.'],
        ['impôts', 'Les impôts ne sont pas le sujet de cette autorité.'],
      ],
      'Le Défenseur des droits intervient dans de telles situations.',
    ),
    libre(
      HARCELEMENT,
      'depuis quelle année le harcèlement scolaire est-il un délit ? (en chiffres)',
      ['2022', 'en 2022', 'depuis 2022'],
      [
        ['2008', '2008 est l’année d’une loi contre les discriminations.'],
        ['2005', '2005 est l’année de la loi sur le handicap.'],
      ],
      'Le harcèlement scolaire est reconnu comme un délit depuis 2022.',
    ),
  ],
  docs: [
    {
      title: 'Une candidature écartée',
      lines: [
        'Une femme postule pour un emploi dont elle a le diplôme et l’expérience.',
        'Le responsable lui annonce qu’il refuse sa candidature parce qu’elle est enceinte.',
        'Elle conserve le message et demande conseil.',
      ],
      qs: [
        lecture(
          'leur situation de grossesse',
          'Quel critère explique le refus ?',
          'la situation de grossesse',
          [
            ['le manque de diplôme', 'Elle a le diplôme demandé.'],
            ['le manque d’expérience', 'Elle a l’expérience demandée.'],
            ['un retard dans l’envoi de la candidature', 'Le texte ne parle d’aucun retard.'],
          ],
          'La grossesse figure parmi les critères que la loi interdit d’utiliser.',
        ),
        lecture(
          DELIT,
          'Comment qualifier ce refus ?',
          'une discrimination, qui est un délit',
          [
            ['un choix libre que rien n’encadre', 'La loi encadre ce choix.'],
            ['une mesure d’inclusion', 'La candidate est exclue, pas incluse.'],
            ['une application de la parité', 'La parité n’autorise pas à écarter une femme enceinte.'],
          ],
          'Écarter quelqu’un pour ce motif contrevient au principe d’égalité.',
        ),
      ],
    },
    {
      title: 'Dans la cour',
      lines: [
        'Chaque jour, un groupe se moque d’un élève à cause de l’origine de sa famille.',
        'Les moqueurs répètent que « les gens comme lui sont tous pareils ».',
        'Une camarade prévient la conseillère principale d’éducation.',
      ],
      qs: [
        lecture(
          MECANISMES,
          'Que fait la phrase répétée par le groupe ?',
          'elle réduit un élève à un groupe que l’on stigmatise',
          [
            ['elle décrit ses qualités personnelles', 'Elle ignore au contraire ce qui lui est propre.'],
            ['elle favorise son inclusion', 'Elle le met à l’écart.'],
            ['elle rappelle le règlement', 'Aucune règle ne dit cela.'],
          ],
          'Le préjugé efface la personne derrière un groupe : c’est un mécanisme d’exclusion.',
        ),
        lecture(
          'les agissements discriminatoires sont aussi à la racine du harcèlement',
          'Les moqueries ont lieu chaque jour. Comment qualifier cette situation répétée ?',
          'un harcèlement, que la loi punit',
          [
            ['un débat réglé', 'Un débat respecte chacun ; ici un élève est visé.'],
            ['une élection de délégués', 'Il n’y a ni vote ni candidature.'],
            ['une simple plaisanterie sans effet', 'La répétition et la cible font la gravité.'],
          ],
          'La discrimination peut être à la racine du harcèlement, reconnu comme un délit.',
        ),
      ],
    },
  ],
};

// ——— Notion 3 : la solidarité ———

const solidarite: Notion = {
  id: 'em5-solidarite',
  title: 'La solidarité et ses échelles : de la fraternité à l’action',
  hint: 'Repense au mémo : la solidarité protège, elle réunit plusieurs acteurs et s’exerce à plusieurs échelles.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **solidarité** signifie que la **Nation** assure une protection à des individus libres et égaux en droit. Elle est liée à la **fraternité**.',
    'L’État, les **collectivités territoriales** et les **associations** s’unissent pour réduire les inégalités ; les **impôts** y participent.',
    'Elle s’exerce aussi à l’échelle de l’Union européenne et du monde. Exemple : l’école publique donne à tous accès à la connaissance.',
  ],
  faits: [
    fait(
      SOLIDARITE,
      ['Que signifie le principe de solidarité ?', 'la Nation assure une protection aux individus'],
      [
        ['chacun se débrouille seul en toute circonstance', 'La solidarité organise au contraire une protection.'],
        ['seuls les plus riches sont protégés', 'La protection vise des individus égaux en droit.'],
        ['la Nation protège seulement les élus', 'Elle ne se limite pas aux élus.'],
      ],
      ['Par le principe de solidarité, la Nation assure aux individus une ', '.', ['protection']],
      'La solidarité est une protection assurée par la Nation.',
    ),
    fait(
      UNION,
      ['À quel idéal de la devise le principe de solidarité est-il lié ?', 'la fraternité'],
      [
        ['la concurrence', 'La concurrence ne figure pas dans la devise.'],
        ['la neutralité', 'La neutralité n’est pas un mot de la devise.'],
        ['la majorité', 'La majorité n’est pas un idéal de la devise.'],
      ],
      ['Le principe de solidarité est lié à l’idéal de ', '.', ['fraternité', 'fraternite']],
      'La solidarité met en œuvre l’idéal de fraternité.',
    ),
    fait(
      UNION,
      [
        'Qui unit ses forces pour réduire les inégalités au nom de la solidarité ?',
        'l’État, les collectivités territoriales et les associations',
      ],
      [
        ['l’État seul', 'L’État n’agit pas seul.'],
        ['les familles seules', 'La solidarité dépasse la famille.'],
        ['les entreprises étrangères seules', 'Les acteurs cités sont l’État, les collectivités et la société civile.'],
      ],
      ['L’État, les ', ' territoriales et les associations unissent leurs forces.', ['collectivités', 'collectivites']],
      'Plusieurs acteurs se complètent : État, collectivités territoriales, société civile.',
    ),
    fait(
      FRATERNITE,
      [
        'Qu’implique la fraternité envers une personne dans le besoin ?',
        'la considérer comme son égale et lui venir en aide',
      ],
      [
        ['l’aider seulement si elle est de sa famille', 'Le devoir d’aide ne s’arrête pas à la famille.'],
        ['la juger avant de décider si elle est une égale', 'La fraternité part de l’égalité.'],
        ['attendre que quelqu’un d’autre agisse', 'C’est le devoir de chacun.'],
      ],
      ['La fraternité suppose de considérer l’autre comme son ', '.', ['égal', 'egal', 'égale']],
      'Considérer l’autre comme son égal conduit à l’aider en cas de nécessité.',
    ),
    fait(
      IMPOT,
      [
        'Comment les citoyennes et les citoyens participent-ils financièrement à la solidarité nationale ?',
        'par l’impôt',
      ],
      [
        ['par le vote seulement', 'Voter est un droit politique, pas une participation financière.'],
        ['par des amendes volontaires', 'Une amende est une sanction, elle n’est pas volontaire.'],
        ['par aucun moyen', 'L’impôt traduit cette participation.'],
      ],
      ['L’', ' traduit la participation des citoyens à la solidarité nationale.', ['impôt', 'impot']],
      'L’impôt, direct ou indirect, finance la solidarité.',
    ),
    fait(
      ECOLE,
      ['Dans quel but l’Éducation nationale donne-t-elle à tous accès à la connaissance ?', 'réduire les inégalités'],
      [
        ['réserver le savoir à quelques-uns', 'L’accès est ouvert à tous.'],
        ['remplacer la Sécurité sociale', 'L’école ne remplace pas la protection sociale.'],
        ['créer des inégalités entre élèves', 'L’ambition est de les réduire.'],
      ],
      [
        'En donnant à tous accès à la connaissance, l’école veut réduire les ',
        '.',
        ['inégalités', 'inegalites', 'inégalité'],
      ],
      'L’école met en œuvre la solidarité en cherchant à réduire les inégalités.',
    ),
    expert(
      fait(
        MONDE,
        [
          'Quels acteurs font vivre la solidarité à l’échelle mondiale ?',
          'des institutions internationales et des ONG',
        ],
        [
          ['le seul conseil municipal', 'Le conseil municipal agit à l’échelle de la commune.'],
          ['le conseil de la vie collégienne', 'Il agit à l’échelle du collège.'],
          ['aucun acteur : elle s’arrête aux frontières', 'La solidarité s’exerce aussi dans le monde.'],
        ],
        [
          'À l’échelle mondiale, agissent des institutions internationales et des ',
          '.',
          ['ONG', 'organisations non gouvernementales'],
        ],
        'Au-delà de l’Europe, des institutions internationales et des ONG agissent.',
      ),
    ),
  ],
  paires3: [
    ['Impôt', 'Participation à la solidarité nationale'],
    ['Fraternité', 'Venir en aide en cas de nécessité'],
    ['ONG', 'Actrices de la solidarité mondiale'],
  ],
  paires5: [
    ['Nation', 'Assure une protection aux individus'],
    ['Éducation nationale', 'Donne à tous accès à la connaissance'],
    ['Associations', 'Acteurs de la société civile'],
    ['Impôts directs et indirects', 'Participation à la solidarité nationale'],
    ['Institutions internationales', 'Échelle mondiale'],
  ],
  libres: [
    libre(
      SOLIDARITE,
      'comment nomme-t-on le principe selon lequel la Nation assure aux individus une protection ?',
      ['solidarité', 'la solidarité', 'solidarite', 'la solidarite', 'principe de solidarité'],
      [
        [
          'fraternité',
          'La fraternité est l’idéal auquel ce principe est lié ; on cherche le nom du principe lui-même.',
        ],
        ['laïcité', 'La laïcité garantit la liberté de conscience.'],
        ['parité', 'La parité vise un égal accès des femmes et des hommes.'],
      ],
      'C’est le principe de solidarité.',
    ),
    libre(
      IMPOT,
      'quel prélèvement, direct ou indirect, traduit la participation à la solidarité nationale ?',
      ['impôt', 'l’impôt', 'les impôts', 'impôts', 'impot', 'impots', 'impôts directs et indirects'],
      [
        ['amende', 'Une amende punit une infraction.'],
        ['salaire', 'Le salaire est une rémunération du travail.'],
      ],
      'Les impôts directs et indirects participent à la solidarité.',
    ),
    libre(
      EUROPE,
      'entre l’échelle nationale et l’échelle mondiale, à l’échelle de quelle Union la solidarité s’exerce-t-elle aussi ?',
      ['Union européenne', 'l’Union européenne', 'européenne', 'UE', 'l’UE', 'union europeenne'],
      [
        ['commune', 'La commune est une échelle locale, plus petite que la nation.'],
        ['région', 'La région est une échelle située à l’intérieur du pays.'],
      ],
      'La solidarité s’exerce aussi à l’échelle de l’Union européenne.',
    ),
  ],
  docs: [
    {
      title: 'Après la crue',
      lines: [
        'Une rivière déborde et inonde un quartier.',
        'La commune ouvre un gymnase pour loger les habitants.',
        'Des services de l’État organisent les secours et suivent les dégâts.',
        'Une association distribue des repas et des couvertures.',
      ],
      qs: [
        lecture(
          ACTEURS,
          'Que montre l’action de ces trois acteurs ?',
          'ils sont complémentaires, du local au national, publics et associatifs',
          [
            ['un seul acteur suffit toujours', 'Chacun apporte ici une aide différente.'],
            ['l’association remplace l’État et la commune', 'Les trois agissent ensemble.'],
            ['la solidarité ne concerne que l’argent', 'On voit un logement, des secours et des repas.'],
          ],
          'Acteurs locaux et nationaux, associatifs et étatiques se complètent.',
        ),
        lecture(
          UNION,
          'Dans ce texte, quel acteur représente la société civile ?',
          'l’association',
          [
            ['la commune', 'La commune est une collectivité territoriale.'],
            ['les services de l’État', 'Ils relèvent de l’État.'],
            ['la rivière', 'La rivière n’est pas un acteur de la solidarité.'],
          ],
          'La société civile comprend les associations.',
        ),
      ],
    },
    {
      title: 'La rentrée de Yanis',
      lines: [
        'Yanis entre en cinquième dans un collège public.',
        'Il suit des cours, emprunte des livres et utilise le CDI.',
        'Ses voisins sans enfant paient eux aussi des impôts.',
      ],
      qs: [
        lecture(
          IMPOT,
          'Pourquoi les voisins sans enfant participent-ils aussi à la solidarité ?',
          'leurs impôts traduisent leur participation à la solidarité nationale',
          [
            ['ils paient un droit d’entrée pour Yanis', 'Un impôt n’est pas un paiement pour un élève précis.'],
            ['ils sont obligés de donner des cours', 'Le texte parle d’impôts, pas de cours.'],
            ['ils ne participent à rien', 'Leurs impôts contribuent.'],
          ],
          'L’impôt est la participation de tous à la solidarité nationale.',
        ),
        lecture(
          ECOLE,
          'Quel objectif de solidarité le collège public sert-il ici ?',
          'donner à tous accès à la connaissance pour réduire les inégalités',
          [
            ['réserver le CDI aux meilleurs élèves', 'L’accès est ouvert à tous.'],
            ['faire payer chaque livre aux familles voisines', 'Le texte ne dit rien de tel.'],
            ['remplacer les secours en cas de crue', 'Ce n’est pas le rôle du collège.'],
          ],
          'L’école vise l’accès de tous à la connaissance.',
        ),
      ],
    },
  ],
};

// ——— Notion 4 : la protection face aux risques ———

const risques: Notion = {
  id: 'em5-risques-protection',
  title: 'Face aux risques : Sécurité sociale et sécurité civile',
  hint: 'Repense au mémo : distingue les risques de la vie d’une personne et ceux qui touchent un territoire.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Un **risque social** est un événement auquel on risque de ne pas faire face avec ses seules ressources : maladie, accident, perte d’emploi…',
    'La **Sécurité sociale** et le système public de santé participent à la solidarité nationale.',
    'Face aux **risques environnementaux** (pollution, incendie…), il faut la **prévention**, la mise en sécurité, l’aide aux victimes et la reconstruction. La **sécurité civile** est l’affaire de tous.',
  ],
  faits: [
    fait(
      RISQUES_SOCIAUX,
      [
        'Qu’appelle-t-on un risque social ?',
        'un événement auquel on risque de ne pas faire face avec ses seules ressources',
      ],
      [
        ['une dispute entre deux camarades', 'Un risque social touche les moyens de vivre d’une personne.'],
        ['une activité sportive choisie pour s’amuser', 'Ce n’est pas la définition d’un risque social.'],
        ['un désaccord pendant un débat', 'Un désaccord ne prive pas de ressources.'],
      ],
      [
        'Un risque social est un événement auquel on risque de ne pouvoir faire face avec ses seules ',
        '.',
        ['ressources', 'ressource'],
      ],
      'La personne seule risque de ne pas pouvoir faire face : d’où la protection collective.',
    ),
    fait(
      RISQUES_SOCIAUX,
      ['Lequel de ces événements est un risque social cité par le programme ?', 'la perte d’emploi'],
      [
        ['une inondation', 'L’inondation est un risque environnemental.'],
        ['un incendie de forêt', 'L’incendie est cité parmi les risques environnementaux.'],
        ['une pollution de l’eau', 'La pollution est un risque environnemental.'],
      ],
      ['Perdre son travail, c’est-à-dire la perte d’', ', est un risque social.', ['emploi']],
      'La perte d’emploi prive une personne de ressources : c’est un risque social.',
    ),
    fait(
      SECU,
      [
        'Avec le système public de santé, quelle institution participe à la solidarité nationale face aux risques sociaux ?',
        'la Sécurité sociale',
      ],
      [
        ['la sécurité routière', 'La sécurité routière vise à prévenir les accidents de la route.'],
        ['le conseil de classe', 'Il suit le travail des élèves.'],
        ['le conseil de la vie collégienne', 'C’est une instance du collège.'],
      ],
      ['La Sécurité ', ' participe à la solidarité nationale.', ['sociale']],
      'Sécurité sociale et système public de santé participent à la solidarité nationale.',
    ),
    expert(
      fait(
        CIDE_SANTE,
        [
          'Pour les enfants, quels droits le droit international garantit-il dans la Convention des droits de l’enfant ?',
          'le droit à la santé et à la sécurité sociale',
        ],
        [
          ['le droit de vote', 'Les articles cités portent sur la santé et la sécurité sociale, pas sur le vote.'],
          ['le droit de conduire', 'Aucun droit de ce type n’est cité.'],
          ['aucun droit en matière de santé', 'La convention en garantit.'],
        ],
        ['La CIDE garantit aux enfants le droit à la ', ' et à la sécurité sociale.', ['santé', 'sante']],
        'Les articles 24 à 26 de la CIDE garantissent santé et sécurité sociale.',
      ),
    ),
    fait(
      ENVIRONNEMENT,
      ['Lequel de ces événements est un risque environnemental ?', 'un incendie'],
      [
        ['la perte d’un emploi', 'C’est un risque social.'],
        ['une invalidité', 'L’invalidité est citée parmi les risques sociaux.'],
        ['la perte d’autonomie liée à l’âge', 'C’est un risque social.'],
      ],
      [
        'Les pollutions, les incendies et les ',
        ' naturelles sont des risques environnementaux.',
        ['catastrophes', 'catastrophe'],
      ],
      'Les incendies font partie des risques environnementaux.',
    ),
    fait(
      CIVILE,
      ['De qui la sécurité civile est-elle l’affaire ?', 'de tous'],
      [
        ['des victimes seulement', 'Chacun peut contribuer, avant même d’être victime.'],
        ['des élèves seulement', 'Elle ne concerne pas un seul groupe.'],
        ['de personne avant la catastrophe', 'La prévention commence avant.'],
      ],
      ['La sécurité civile est l’affaire de ', '.', ['tous', 'tout le monde', 'chacun']],
      'La sécurité civile concerne chacun, d’où l’importance de la prévention.',
    ),
    expert(
      fait(
        MOYENS,
        [
          'Quelle loi traite de la prévention, de la mise en sécurité, de l’aide aux victimes et de la reconstruction ?',
          'la loi du 13 août 2004',
        ],
        [
          ['la loi du 27 mai 2008', 'Elle punit les discriminations.'],
          ['la loi du 11 février 2005', 'Elle porte sur les personnes handicapées.'],
          ['la loi sur la parité de 2000', 'Elle concerne l’accès aux mandats politiques.'],
        ],
        ['La loi du 13 août ', ' concerne la sécurité civile.', ['2004']],
        'La loi du 13 août 2004 est le texte de référence cité pour la sécurité civile.',
      ),
    ),
    fait(
      ODD3,
      [
        'Quel type de politique de santé publique vise à agir avant que la maladie survienne, par exemple par la vaccination ?',
        'une politique de prévention',
      ],
      [
        ['une politique de reconstruction', 'La reconstruction suit des dégâts.'],
        ['une politique de parité', 'La parité concerne l’égal accès des femmes et des hommes.'],
        ['une politique de punition des malades', 'La santé publique protège, elle ne punit pas.'],
      ],
      ['La vaccination relève d’une politique de ', ' en santé publique.', ['prévention', 'prevention']],
      'L’objectif « Bonne santé et bien-être » sert à expliquer la prévention.',
    ),
  ],
  paires3: [
    ['Perte d’emploi', 'Risque social'],
    ['Pollution', 'Risque environnemental'],
    ['Campagne de vaccination', 'Action de prévention'],
  ],
  paires5: [
    ['Prévention', 'Agir avant que le risque survienne'],
    ['Mise en sécurité', 'Éloigner les personnes du danger'],
    ['Aide aux victimes', 'Secourir les personnes touchées'],
    ['Reconstruction', 'Rebâtir après les dégâts'],
    ['Sécurité sociale', 'Solidarité face aux risques sociaux'],
  ],
  libres: [
    libre(
      CIVILE,
      'comment nomme-t-on l’action qui vise à éviter qu’un risque se réalise ou à en limiter les effets, avant qu’il survienne ?',
      ['prévention', 'la prévention', 'prevention', 'la prevention'],
      [
        ['reconstruction', 'La reconstruction vient après les dégâts.'],
        ['réparation', 'Réparer vient après ; on cherche ici l’action menée avant.'],
      ],
      'Agir avant, c’est la prévention.',
    ),
    libre(
      SECU,
      'quelle institution, la Sécurité …, participe à la solidarité nationale avec le système public de santé ?',
      ['sociale', 'Sécurité sociale', 'la Sécurité sociale', 'securite sociale'],
      [
        ['civile', 'La sécurité civile intervient face aux dangers comme les incendies ou les catastrophes.'],
        ['routière', 'La sécurité routière concerne la circulation.'],
      ],
      'C’est la Sécurité sociale.',
    ),
    libre(
      CATASTROPHE,
      'après une catastrophe, la police et la gendarmerie interviennent, avec la sécurité … : quel mot manque ?',
      ['civile', 'sécurité civile', 'la sécurité civile', 'securite civile'],
      [
        ['sociale', 'La Sécurité sociale protège face aux risques sociaux.'],
        ['routière', 'La sécurité routière concerne la circulation, pas les secours après une catastrophe.'],
      ],
      'La sécurité civile secourt les victimes, avec la police et la gendarmerie.',
    ),
  ],
  docs: [
    {
      title: 'La chute de Samir',
      lines: [
        'Samir, qui est couvreur, se blesse en tombant d’un toit.',
        'Il ne peut plus travailler pendant plusieurs mois.',
        'Les soins coûtent cher et ses économies ne suffiraient pas.',
      ],
      qs: [
        lecture(
          RISQUES_SOCIAUX,
          'Pourquoi cet accident est-il un risque social ?',
          'Samir ne pourrait pas y faire face avec ses seules ressources',
          [
            ['il s’est produit en hauteur', 'Le lieu ne suffit pas à définir un risque social.'],
            ['il a pollué une rivière', 'Le texte ne parle d’aucune pollution.'],
            ['Samir exerce le métier de couvreur', 'Un risque social peut toucher tout le monde.'],
          ],
          'La définition tient à la difficulté de faire face seul.',
        ),
        lecture(
          SECU,
          'Quelle solidarité peut intervenir ?',
          'la Sécurité sociale et le système public de santé',
          [
            ['seulement les économies de Samir', 'Elles ne suffiraient pas.'],
            ['le conseil de la vie collégienne', 'Il agit au collège.'],
            ['la loi sur la parité', 'Elle concerne les mandats politiques.'],
          ],
          'Ils participent à la solidarité nationale face aux risques sociaux.',
        ),
      ],
    },
    {
      title: 'Un été sec',
      lines: [
        'La mairie d’un village boisé distribue des consignes contre les feux.',
        'En août, un incendie se déclare : des habitants sont mis à l’abri.',
        'Après le feu, les familles touchées sont aidées et les bâtiments réparés.',
      ],
      qs: [
        lecture(
          MOYENS,
          'Quelle action du texte relève de la prévention ?',
          'la distribution de consignes avant le feu',
          [
            ['la mise à l’abri pendant l’incendie', 'C’est la mise en sécurité des personnes.'],
            ['l’aide aux familles touchées', 'C’est l’aide aux victimes.'],
            ['la réparation des bâtiments', 'C’est la reconstruction.'],
          ],
          'La prévention a lieu avant que le danger se produise.',
        ),
        lecture(
          ENVIRONNEMENT,
          'De quel type de risque s’agit-il ?',
          'un risque environnemental',
          [
            ['un risque social lié à l’âge', 'Le texte décrit un incendie qui touche un territoire.'],
            ['une discrimination', 'Personne n’est écarté selon un critère.'],
            ['un harcèlement', 'Le texte ne décrit aucune violence répétée contre une personne.'],
          ],
          'Les incendies sont des risques environnementaux.',
        ),
      ],
    },
  ],
};

// ——— Notion 5 : l'engagement ———

const engagement: Notion = {
  id: 'em5-engagement',
  title: 'S’engager : associations, jeunes élus, gestes solidaires',
  hint: 'Repense au mémo : s’engager, c’est agir pour les autres, seul ou à plusieurs, à ta portée.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'L’**engagement**, c’est agir pour les autres. La **fraternité** fait de l’aide en cas de nécessité un devoir de chacun.',
    'Les **associations** contribuent à la solidarité ; l’État peut les reconnaître : **intérêt public**, **exonération** fiscale.',
    'Dès ton âge : **conseil municipal de jeunes** ou **cadets de la sécurité civile** ; plus tard : **don du sang** ou **service civique**.',
  ],
  faits: [
    fait(
      FRATERNITE,
      [
        'D’après l’idéal de fraternité, de qui est-ce le devoir de venir en aide aux autres en cas de nécessité ?',
        'de chacun',
      ],
      [
        ['des élus seulement', 'La fraternité ne vise pas les seuls élus.'],
        ['des adultes de la famille seulement', 'Ce devoir dépasse la famille.'],
        ['de personne', 'La fraternité en fait un devoir.'],
      ],
      ['La fraternité suppose qu’il est du devoir de ', ' de venir en aide aux autres.', ['chacun', 'tous']],
      'Le devoir d’aide revient à chacun : c’est la source de l’engagement.',
    ),
    fait(
      ASSOCIATIONS,
      ['Quels groupes de la société civile contribuent à la solidarité ?', 'les associations'],
      [
        ['les tribunaux', 'Les tribunaux rendent la justice : ce ne sont pas des groupes de la société civile.'],
        ['le Gouvernement', 'Le Gouvernement fait partie de l’État.'],
        ['les préfectures', 'Une préfecture est un service de l’État.'],
      ],
      [
        'Dans la société civile, des groupes appelés ',
        ' contribuent à la solidarité.',
        ['associations', 'association'],
      ],
      'Les associations permettent d’agir ensemble pour les autres.',
    ),
    expert(
      fait(
        RECONNAISSANCE,
        [
          'Comment l’État peut-il reconnaître le rôle d’une association ?',
          'par l’intérêt public et une exonération fiscale',
        ],
        [
          ['en lui donnant le droit de voter les lois', 'Les associations ne votent pas les lois.'],
          ['en la transformant en tribunal', 'Une association ne juge pas.'],
          ['en lui interdisant d’aider', 'La reconnaissance encourage son action.'],
        ],
        ['L’État peut reconnaître une association comme étant d’intérêt ', '.', ['public']],
        'La reconnaissance passe par l’intérêt public et l’exonération fiscale.',
      ),
    ),
    fait(
      SANG,
      ['Quel geste est présenté comme un acte de citoyenneté et de solidarité ?', 'le don du sang'],
      [
        ['l’achat d’un téléphone', 'Un achat personnel n’est pas un acte de solidarité.'],
        ['le refus d’aider un blessé', 'Refuser d’aider va contre la fraternité.'],
        ['la copie sur un camarade', 'Copier ne sert pas les autres.'],
      ],
      ['Le don du ', ' est un acte de citoyenneté et de solidarité.', ['sang']],
      'Donner son sang aide des personnes que l’on ne connaît pas.',
    ),
    fait(
      JEUNES,
      [
        'Dans quelle instance des jeunes peuvent-ils s’engager à l’échelle de la commune ?',
        'un conseil municipal de jeunes',
      ],
      [
        ['le Sénat', 'Le Sénat ne représente pas les jeunes d’une commune.'],
        ['un tribunal', 'Des jeunes n’y siègent pas pour représenter la commune.'],
        ['un jury d’assises', 'Ce n’est pas une instance pour les jeunes.'],
      ],
      ['Dans leur commune, des élèves peuvent siéger au conseil municipal de ', '.', ['jeunes', 'jeune']],
      'Les conseils municipaux de jeunes permettent de s’engager près de chez soi.',
    ),
    fait(
      CADETS,
      [
        'Quel dispositif permet à des jeunes de s’impliquer dans la sécurité civile ?',
        'les cadets de la sécurité civile',
      ],
      [
        ['la majorité numérique', 'Elle concerne l’inscription sur les réseaux sociaux.'],
        ['la parité', 'La parité vise un égal accès des femmes et des hommes.'],
        ['le Défenseur des droits', 'Cette autorité défend des droits ; ce n’est pas un dispositif pour les jeunes.'],
      ],
      ['Le dispositif des ', ' de la sécurité civile s’adresse à des jeunes.', ['cadets', 'cadet']],
      'Les cadets de la sécurité civile découvrent la prévention des risques.',
    ),
    fait(
      PARCOURS,
      [
        'Lequel de ces dispositifs est une forme d’engagement pour la Nation citée par le programme ?',
        'le service civique',
      ],
      [
        ['le permis de conduire', 'Passer le permis sert un but personnel.'],
        ['les vacances scolaires', 'Ce n’est pas un engagement.'],
        ['l’abonnement à une plateforme', 'Un abonnement est un achat.'],
      ],
      ['Le service ', ' est une forme d’engagement pour la Nation.', ['civique', 'national universel']],
      'Le service civique est une façon de s’engager pour la Nation.',
    ),
  ],
  paires3: [
    ['Don du sang', 'Aider des malades ou des blessés'],
    ['Conseil municipal de jeunes', 'S’engager pour sa commune'],
    ['Cadets de la sécurité civile', 'Découvrir la prévention des risques'],
  ],
  paires5: [
    ['Association', 'Acteur de la société civile'],
    ['Exonération fiscale', 'Reconnaissance par l’État'],
    ['Service civique', 'Engagement pour la Nation'],
    ['Conseil municipal de jeunes', 'Engagement dans la commune'],
    ['Don du sang', 'Acte de citoyenneté et de solidarité'],
  ],
  libres: [
    libre(
      ASSOCIATIONS,
      'quel nom donne-t-on à un groupe de la société civile où l’on s’unit, par exemple pour distribuer des repas ?',
      ['association', 'une association', 'l’association', 'associations'],
      [
        ['tribunal', 'Un tribunal rend la justice.'],
        ['préfecture', 'Une préfecture est un service de l’État.'],
      ],
      'C’est une association.',
    ),
    libre(
      SANG,
      'quel don est présenté comme un acte de citoyenneté et de solidarité : le don de … ?',
      ['sang', 'don de sang', 'don du sang', 'le don du sang', 'le don de sang'],
      [
        ['jouets', 'Ce geste peut être généreux, mais le programme cite ici un autre don.'],
        ['argent', 'Le don cité vient directement du corps et sert à soigner.'],
      ],
      'Le programme cite le don de sang.',
    ),
    libre(
      PARCOURS,
      'quel est le nom du service, qualifié de « civique », par lequel on peut s’engager ? Écris les deux mots.',
      ['service civique', 'le service civique'],
      [
        ['service public', 'Un service public rend un service à tous ; on cherche une forme d’engagement.'],
        ['service militaire', 'Le service cité ici est qualifié de « civique ».'],
      ],
      'Il s’agit du service civique.',
    ),
  ],
  docs: [
    {
      title: 'La collecte de Lina',
      lines: [
        'Lina remarque que des familles du quartier manquent de produits d’hygiène.',
        'Avec deux camarades, elle propose une collecte au collège.',
        'La principale donne son accord.',
        'Une association du quartier se charge de la distribution.',
      ],
      qs: [
        lecture(
          FRATERNITE,
          'Quelle valeur de la République l’initiative de Lina fait-elle vivre surtout ?',
          'la fraternité',
          [
            ['la laïcité', 'Aucune question de religion n’est en jeu.'],
            ['la liberté de la presse', 'Le texte ne parle pas de journaux.'],
            ['la majorité', 'Aucun vote n’est organisé.'],
          ],
          'Venir en aide à ceux qui en ont besoin relève de la fraternité.',
        ),
        lecture(
          ACTEURS,
          'Pourquoi l’association est-elle utile ?',
          'elle complète l’action des élèves en distribuant les produits',
          [
            ['elle remplace l’accord de la principale', 'La principale a donné son accord.'],
            ['elle interdit la collecte', 'Elle y participe.'],
            ['elle vend les produits aux familles', 'Le texte parle d’une distribution.'],
          ],
          'Les acteurs se complètent : élèves, collège, association.',
        ),
      ],
    },
    {
      title: 'Une voix pour le quartier',
      lines: [
        'Élu au conseil municipal de jeunes, Adam interroge des habitants.',
        'Plusieurs signalent un passage piéton mal éclairé.',
        'Adam présente le problème à la prochaine réunion.',
        'Le conseil rédige une proposition destinée à la mairie.',
      ],
      qs: [
        lecture(
          JEUNES,
          'Quelle forme prend l’engagement d’Adam ?',
          'représenter des habitants dans un conseil de jeunes',
          [
            ['donner son sang', 'Le texte ne parle pas de don.'],
            ['décider seul des travaux de la ville', 'Le conseil rédige une proposition : la mairie la reçoit.'],
            ['juger un automobiliste', 'Adam ne juge personne.'],
          ],
          'Il porte une demande d’intérêt collectif dans une instance d’élus jeunes.',
        ),
        lecture(
          'engagement et sens des responsabilités',
          'Quel comportement montre qu’Adam prend sa responsabilité au sérieux ?',
          'il recueille l’avis des habitants et le transmet',
          [
            ['il garde le problème pour lui', 'Il le présente en réunion.'],
            ['il invente un problème', 'Plusieurs habitants le signalent.'],
            ['il attend la fin de son mandat sans agir', 'Il agit dès la réunion suivante.'],
          ],
          'S’engager, c’est assumer sa mission jusqu’au bout.',
        ),
      ],
    },
  ],
};

export const EGALITE_FRATERNITE_SKILLS: readonly Skill[] = [
  egaliteFemmesHommes,
  discriminations,
  solidarite,
  risques,
  engagement,
].map(notion);
