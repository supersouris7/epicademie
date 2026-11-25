import type { Skill } from '../types.ts';
import { notion, type Citation, type DocQuestion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * 4e, « Défendre les droits et les libertés » (lot em-4e-01) : thème « L’État de droit et les libertés » du
 * programme d'EMC du 13 juin 2024 (libertés individuelles et collectives, ordre public, État de droit et hiérarchie
 * des normes, justice et institutions judiciaires, textes qui garantissent les droits). Chaque fait cite le programme
 * (registre `emc-2024`), la DDHC (Légifrance) ou une fiche Vie publique, avec sa citation exacte. Les textes à lire
 * du niveau 5 sont écrits pour l'exercice (personnes inventées), sauf les extraits de la DDHC.
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 4e : « Défendre les droits et les libertés », L’État de droit et les libertés';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 4e.';

/** Citation d'un texte du registre des sources. */
const cite =
  (id: string, label: string) =>
  (quote: string): Citation => ({ quote, from: { id, label } });
const prog = (quote: string): Citation => ({ quote });

const ddhc = cite('ddhc-1789', 'la Déclaration des droits de l’homme et du citoyen');
const vpEtat = cite('vie-publique-etat-de-droit', 'le site Vie publique');
const vpJustice = cite('vie-publique-organisation-justice', 'le site Vie publique');
const vpCassation = cite('vie-publique-cour-cassation', 'le site Vie publique');
const vpAppel = cite('vie-publique-appel', 'le site Vie publique');
const vpJures = cite('vie-publique-jure-assises', 'le site Vie publique');
const vpIndependance = cite('vie-publique-justice-independante', 'le site Vie publique');

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

// ——— Citations exactes : programme de 4e ———

const INDIVIDUELLES = prog(
  'Les libertés individuelles permettent aux citoyennes et aux citoyens d’être maîtres de leurs mouvements et de leurs choix (liberté de circulation ou de mariage, par exemple), mais aussi de leurs opinions et croyances (liberté d’opinion, liberté de conscience), ainsi que d’exprimer celles-ci (liberté d’expression), y compris en ligne',
);
const COLLECTIVES = prog(
  'Les libertés collectives leur permettent de s’associer les uns avec les autres et de s’engager dans la vie de la société (droit de réunion, d’association, de manifestation, droit syndical, liberté de la presse)',
);
const LIMITES = prog(
  'nos libertés sont toutefois encadrées par la loi et limitées, en premier lieu par les libertés des autres, que nous n’avons pas le droit d’entraver ou de violer (art. 4 DDHC)',
);
const ORDRE_PUBLIC = prog(
  'ensuite par la défense de l’ordre public qui concerne non seulement la sécurité, mais également la tranquillité, la salubrité, le respect de la dignité de la personne humaine',
);
const SECTES = prog(
  'montrer que la loi ne définit pas la secte (au nom de la liberté de croyance), mais permet de réprimer les dérives sectaires, qui portent atteinte à l’ordre public, mais aussi aux droits fondamentaux, à la sécurité ou à l’intégrité des personnes',
);
const GARANTIES = prog(
  'les libertés sont garanties par le droit : elles figurent dans le bloc de constitutionnalité reconnu par le Conseil constitutionnel, et l’action de l’État elle-même est soumise à la justice (son action ne peut violer les droits du citoyen)',
);
const INDEPENDANCE = prog(
  'l’indépendance de la justice est une condition de l’État de droit, son organisation garantissant le traitement équitable des justiciables',
);
const TRAITES = prog(
  'les droits et libertés sont enfin garantis par des traités internationaux et leur respect contrôlé par des cours supranationales (Cour européenne des droits de l’homme notamment)',
);
const ORGANISATION = prog(
  'le rôle et le fonctionnement des jurys populaires ; la justice des mineurs et le droit à la protection',
);
const TEXTES = prog(
  'À partir de la Déclaration des droits de l’homme et du citoyen (préambule, art. 2), de la Déclaration universelle des droits de l’homme (préambule, art. 1 et 2) et de la Convention internationale des droits de l’enfant, faire comprendre aux élèves que ces textes leur garantissent des droits et libertés au quotidien',
);
const CIDE_ARTICLES = prog(
  'intérêt supérieur de l’enfant (art. 3 CIDE), liberté d’expression (art. 13), liberté d’association et de réunion (art. 15), liberté d’information (art. 17)',
);
const SURETE = prog(
  'La « sûreté » fait partie des droits affirmés par la Déclaration des droits de l’homme et du citoyen (DDHC, art. 2). Elle signifie à la fois que les droits du citoyen sont protégés et qu’il doit se trouver en sécurité. Les forces de sécurité intérieure, comme la police, la gendarmerie, les pompiers et les douanes, répondent à cette exigence',
);

// ——— Citations exactes : DDHC (Légifrance) ———

const PREAMBULE = ddhc(
  'considérant que l’ignorance, l’oubli ou le mépris des droits de l’Homme sont les seules causes des malheurs publics et de la corruption des Gouvernements',
);
const ART1 = ddhc('Les hommes naissent et demeurent libres et égaux en droits');
const ART2 = ddhc(
  'Le but de toute association politique est la conservation des droits naturels et imprescriptibles de l’Homme. Ces droits sont la liberté, la propriété, la sûreté, et la résistance à l’oppression',
);
const ART4 = ddhc('La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui');
const ART4_BORNES = ddhc('Ces bornes ne peuvent être déterminées que par la Loi');
const ART7 = ddhc(
  'Nul homme ne peut être accusé, arrêté ni détenu que dans les cas déterminés par la Loi, et selon les formes qu’elle a prescrites',
);
const ART9 = ddhc('Tout homme étant présumé innocent jusqu’à ce qu’il ait été déclaré coupable');
const ART10 = ddhc(
  'Nul ne doit être inquiété pour ses opinions, même religieuses, pourvu que leur manifestation ne trouble pas l’ordre public établi par la Loi',
);
const ART16 = ddhc(
  'Toute Société dans laquelle la garantie des Droits n’est pas assurée, ni la séparation des Pouvoirs déterminée, n’a point de Constitution',
);

// ——— Citations exactes : Vie publique ———

const DEFINITION = vpEtat(
  'Le concept d’État de droit s’oppose à la notion de pouvoir arbitraire. Il désigne un État dans lequel la puissance publique est soumise aux règles de droit',
);
const HIERARCHIE = vpEtat(
  'les lois votées par le Parlement doivent respecter le bloc de constitutionnalité (composé de la Constitution de 1958 et de plusieurs textes tels que la Déclaration des droits de l’homme et du citoyen de 1789 ou le préambule de la Constitution de 1946)',
);
const EGALITE = vpEtat('L’égalité des sujets de droit constitue la deuxième condition essentielle d’un État de droit');
const SEPARATION = vpEtat(
  'l’État de droit suppose la séparation des pouvoirs qui vise à éviter la concentration du pouvoir dans les mains d’un despote',
);
const POUVOIRS = vpEtat(
  'le pouvoir de voter la loi (pouvoir législatif) ; le pouvoir d’exécuter les lois et pour ce faire d’édicter des règlements (pouvoir exécutif) ; le pouvoir de rendre la justice (pouvoir judiciaire)',
);

const DEUX_ORDRES = vpJustice(
  'Dans l’organisation de la justice, justice judiciaire et justice administrative sont distinctes et indépendantes l’une de l’autre',
);
const PYRAMIDE = vpJustice(
  'Les tribunaux et cours de chaque ordre sont organisés selon une structure pyramidale : une juridiction de première instance, une juridiction d’appel, une juridiction de cassation',
);
const SOMMETS = vpJustice(
  'Il s’agit de la Cour de cassation pour l’ordre judiciaire et du Conseil d’État pour l’ordre administratif',
);
const PERSONNES_PUBLIQUES = vpJustice(
  'des tribunaux spécifiques sont créés pour connaître des litiges impliquant les personnes publiques',
);
const PENAL = vpJustice(
  'pour les autres infractions : tribunal correctionnel ou tribunal de police, cour d’appel, puis pourvoi auprès de la chambre criminelle de la Cour de cassation',
);
const ADMINISTRATIF = vpJustice('Contrôle, pourvoi : Conseil d’État, section du contentieux');
const CONFLITS = vpJustice('Ces conflits de compétence entre les deux ordres sont réglés par le Tribunal des conflits');

const JUGE_DU_DROIT = vpCassation(
  'La Cour de cassation est juge du droit : sans se prononcer sur le fond de l’affaire, elle vérifie la correcte application de la loi par les juges du fond qui ont rendu la décision contestée',
);
const APPEL = vpAppel(
  'L’appel est une voie de recours contre un premier jugement. L’appel permet de juger une seconde fois un litige',
);
const COUR_APPEL = vpAppel('La juridiction qui rejuge une affaire après un appel est une cour d’appel');
const JURES = vpJures(
  'Tout citoyen français âgé de 23 ans et plus, jouissant de ses droits civiques et inscrit sur les listes électorales, peut être tiré au sort pour siéger dans une cour d’assises, en tant que juré',
);
const JURES_JUGES = vpJures('Les jurés d’assises exercent la fonction de juge, au côté de magistrats professionnels');
const IMPARTIALITE = vpIndependance(
  'l’impartialité, dont l’importance est notamment consacrée par la Convention européenne des droits de l’homme, désigne l’absence de préjugés qui doit caractériser le juge',
);
const STATUT = vpIndependance(
  'ils ne sont pas des fonctionnaires et ne sont par conséquent pas soumis à l’autorité hiérarchique d’un ministre. Ils sont inamovibles',
);

// ——— Notion 1 : l'État de droit ———

const etatDeDroit: Notion = {
  id: 'em4-etat-de-droit',
  title: 'L’État de droit : un pouvoir soumis au droit',
  hint: 'Repense au mémo : à quoi la puissance publique est soumise, comment les règles sont rangées, comment le pouvoir est partagé.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Dans un **État de droit**, la puissance publique est soumise aux règles de droit : c’est le contraire du pouvoir **arbitraire**. Il repose sur la **hiérarchie des normes**, l’égalité devant la loi et la **séparation des pouvoirs** (législatif, exécutif, judiciaire).',
    'Les lois votées par le Parlement doivent respecter le **bloc de constitutionnalité** (Constitution de 1958, DDHC de 1789, préambule de 1946), reconnu par le **Conseil constitutionnel**. L’action de l’État elle-même est soumise à la justice.',
    'Les droits sont aussi garantis par des traités, contrôlés par la **Cour européenne des droits de l’homme**. Exemple : si une administration viole les droits d’un citoyen, un juge peut examiner sa décision.',
  ],
  faits: [
    fait(
      DEFINITION,
      ['À quelle notion l’État de droit s’oppose-t-il ?', 'au pouvoir arbitraire'],
      [
        ['à la démocratie', 'L’État de droit s’oppose au pouvoir sans règle, pas au pouvoir des citoyens.'],
        ['à la séparation des pouvoirs', 'C’est au contraire l’une de ses conditions.'],
        ['à l’égalité devant la loi', 'C’est au contraire l’une de ses conditions essentielles.'],
      ],
      ['Le concept d’État de droit s’oppose à la notion de pouvoir ', '.', ['arbitraire']],
      'Un pouvoir arbitraire décide selon sa seule volonté ; l’État de droit se soumet à des règles.',
    ),
    fait(
      DEFINITION,
      ['Dans un État de droit, à quoi la puissance publique est-elle soumise ?', 'aux règles de droit'],
      [
        ['à la seule volonté de son chef', 'Ce serait justement un pouvoir arbitraire.'],
        ['à aucune règle, puisqu’elle les fait', 'Celui qui fait les règles doit lui aussi les respecter.'],
        ['à l’avis des réseaux sociaux', 'Une opinion en ligne n’est pas une règle de droit.'],
      ],
      ['Dans un État de droit, la puissance publique est soumise aux règles de ', '.', ['droit']],
      'Même l’État doit respecter le droit : c’est le sens de l’expression « État de droit ».',
    ),
    fait(
      HIERARCHIE,
      ['Que doivent respecter les lois votées par le Parlement ?', 'le bloc de constitutionnalité'],
      [
        ['les arrêtés du maire', 'Les décisions administratives sont en bas de la hiérarchie, sous la loi.'],
        ['rien : la loi est la norme la plus haute', 'Au-dessus de la loi se trouve le bloc de constitutionnalité.'],
        ['le règlement intérieur des collèges', 'Un règlement intérieur doit respecter la loi, pas l’inverse.'],
      ],
      [
        'Les lois votées par le Parlement doivent respecter le bloc de ',
        '.',
        ['constitutionnalité', 'constitutionnalite'],
      ],
      'C’est la hiérarchie des normes : chaque règle respecte celles qui lui sont supérieures.',
    ),
    fait(
      SEPARATION,
      [
        'Quel principe de l’État de droit vise à éviter la concentration du pouvoir dans les mains d’un despote ?',
        'la séparation des pouvoirs',
      ],
      [
        ['la hiérarchie des normes', 'Elle range les règles de droit ; elle ne répartit pas le pouvoir entre organes.'],
        ['l’égalité des sujets de droit', 'Elle concerne les personnes soumises au droit, pas le partage du pouvoir.'],
        ['la souveraineté nationale', 'Elle dit à qui appartient le pouvoir, pas comment il est réparti.'],
      ],
      ['La séparation des ', ' vise à éviter la concentration du pouvoir.', ['pouvoirs', 'pouvoir']],
      'Le pouvoir est distribué entre des organes indépendants : voter la loi, l’exécuter, rendre la justice.',
    ),
    fait(
      GARANTIES,
      ['D’après le programme, à quoi l’action de l’État elle-même est-elle soumise ?', 'à la justice'],
      [
        ['à aucun contrôle', 'Dans un État de droit, l’action de l’État ne peut violer les droits du citoyen.'],
        ['à la seule police', 'La police agit dans le cadre du droit ; elle ne juge pas l’État.'],
        ['aux sondages d’opinion', 'Un sondage mesure une opinion, il ne juge pas.'],
      ],
      ['L’action de l’État elle-même est soumise à la ', '.', ['justice']],
      'Un citoyen peut contester devant un juge une décision de l’État qui violerait ses droits.',
    ),
    expert(
      fait(
        HIERARCHIE,
        [
          'Quel texte de 1789 fait partie du bloc de constitutionnalité ?',
          'la Déclaration des droits de l’homme et du citoyen',
        ],
        [
          ['la Convention internationale des droits de l’enfant', 'C’est un traité de 1989, pas un texte de 1789.'],
          ['le Code pénal', 'Le Code pénal réunit des lois : il est placé sous le bloc de constitutionnalité.'],
          ['le préambule de la Constitution de 1946', 'Il fait bien partie du bloc, mais il date de 1946.'],
        ],
        [
          'Le bloc de constitutionnalité comprend la Constitution de 1958 et la Déclaration des droits de l’homme et du ',
          ' de 1789.',
          ['citoyen'],
        ],
        'La DDHC de 1789 est toujours une norme supérieure aux lois.',
      ),
    ),
    expert(
      fait(
        TRAITES,
        [
          'Quelle cour supranationale contrôle le respect des droits et libertés garantis par des traités ?',
          'la Cour européenne des droits de l’homme',
        ],
        [
          ['le Conseil constitutionnel', 'C’est une institution française, pas une cour supranationale.'],
          ['la Cour de cassation', 'C’est la cour suprême de l’ordre judiciaire français.'],
          ['le tribunal administratif', 'C’est un tribunal français de première instance.'],
        ],
        [
          'Le respect des droits est contrôlé par des cours supranationales, comme la Cour européenne des droits de l’',
          '.',
          ['homme'],
        ],
        '« Supranationale » : placée au-dessus des États ; elle contrôle le respect des traités.',
      ),
    ),
    expert(
      fait(
        EGALITE,
        [
          'Quelle condition essentielle d’un État de droit veut que chacun soit soumis au droit de la même façon ?',
          'l’égalité des sujets de droit',
        ],
        [
          ['les privilèges de naissance', 'Les privilèges sont le contraire de l’égalité devant le droit.'],
          ['la hiérarchie des normes', 'Elle range les règles, elle ne concerne pas les personnes.'],
          ['la séparation des pouvoirs', 'Elle répartit le pouvoir entre des organes, pas entre des personnes.'],
        ],
        ['L’égalité des sujets de ', ' constitue la deuxième condition essentielle d’un État de droit.', ['droit']],
        'Personnes et organisations, et même l’État, sont soumises aux mêmes règles.',
      ),
    ),
  ],
  paires3: [
    ['État de droit', 'Puissance publique soumise aux règles de droit'],
    ['Pouvoir arbitraire', 'Pouvoir qui ne respecte aucune règle'],
    ['Bloc de constitutionnalité', 'Normes que les lois doivent respecter'],
  ],
  paires5: [
    ['Pouvoir législatif', 'Voter la loi'],
    ['Pouvoir exécutif', 'Exécuter les lois et édicter des règlements'],
    ['Pouvoir judiciaire', 'Rendre la justice'],
    ['Conseil constitutionnel', 'Reconnaît le bloc de constitutionnalité'],
    ['Cour européenne des droits de l’homme', 'Cour supranationale qui contrôle le respect des droits'],
  ],
  libres: [
    libre(
      DEFINITION,
      'quel adjectif désigne le pouvoir auquel l’État de droit s’oppose ? Le pouvoir …',
      ['arbitraire'],
      [
        ['démocratique', 'L’État de droit ne s’oppose pas à la démocratie, mais au pouvoir sans règle.'],
        ['judiciaire', 'Le pouvoir judiciaire rend la justice : il fait partie de l’État de droit.'],
      ],
      'Arbitraire : qui dépend de la seule volonté de celui qui décide, sans règle.',
    ),
    libre(
      POUVOIRS,
      'quel pouvoir est chargé de voter la loi ? Le pouvoir …',
      ['législatif', 'legislatif', 'le pouvoir législatif', 'le pouvoir legislatif'],
      [
        ['exécutif', 'Le pouvoir exécutif exécute les lois et édicte des règlements.'],
        ['judiciaire', 'Le pouvoir judiciaire rend la justice.'],
      ],
      'Le Parlement vote la loi : c’est le pouvoir législatif.',
    ),
    libre(
      GARANTIES,
      'quelle institution reconnaît le bloc de constitutionnalité ? Le Conseil …',
      ['constitutionnel', 'Conseil constitutionnel', 'le Conseil constitutionnel'],
      [
        ['d’État', 'Le Conseil d’État est au sommet de l’ordre administratif.'],
        ['municipal', 'Le conseil municipal règle les affaires de la commune.'],
      ],
      'Le Conseil constitutionnel veille à ce que les lois respectent le bloc de constitutionnalité.',
    ),
  ],
  docs: [
    {
      title: 'Une décision contestée',
      lines: [
        'Le maire d’une commune interdit à toutes les associations d’utiliser les salles municipales, sans donner de raison.',
        'Une association de quartier estime que cette décision porte atteinte à la liberté de réunion.',
        'Elle saisit le tribunal administratif.',
        'Le juge examine si la décision du maire respecte le droit.',
      ],
      qs: [
        lecture(
          GARANTIES,
          'Quel principe de l’État de droit ce texte illustre-t-il ?',
          'l’action des pouvoirs publics est soumise à la justice',
          [
            ['le maire décide sans aucun contrôle', 'Le juge peut justement examiner la décision du maire.'],
            ['seuls les citoyens doivent respecter le droit', 'Les autorités publiques aussi doivent le respecter.'],
            [
              'la justice ne peut pas juger une administration',
              'Le tribunal administratif juge les litiges avec les personnes publiques.',
            ],
          ],
          'Même une autorité publique doit respecter le droit, sous le contrôle d’un juge.',
        ),
        lecture(
          DEFINITION,
          'Si le maire pouvait décider sans règle et sans aucun recours possible, comment qualifierait-on son pouvoir ?',
          'arbitraire',
          [
            ['démocratique', 'Un maire est élu, mais décider sans règle ni contrôle n’est pas démocratique.'],
            ['judiciaire', 'Le maire n’exerce pas le pouvoir de juger.'],
            ['constitutionnel', 'Un pouvoir sans règle ne respecte justement pas la Constitution.'],
          ],
          'L’État de droit s’oppose au pouvoir arbitraire.',
        ),
      ],
    },
    {
      title: 'Une loi examinée',
      lines: [
        'Le Parlement vote une nouvelle loi sur les réunions publiques.',
        'Certains estiment qu’un article de cette loi porte atteinte à une liberté proclamée en 1789.',
        'Le Conseil constitutionnel est saisi.',
        'Il vérifie que la loi respecte le bloc de constitutionnalité.',
      ],
      qs: [
        lecture(
          HIERARCHIE,
          'Pourquoi la loi doit-elle respecter un texte de 1789 ?',
          'la DDHC fait partie du bloc de constitutionnalité, supérieur aux lois',
          [
            [
              'parce qu’un texte ancien vaut toujours plus qu’un texte récent',
              'C’est la place dans la hiérarchie des normes qui compte, pas l’âge.',
            ],
            [
              'parce que le Parlement n’a aucun pouvoir',
              'Le Parlement vote les lois, mais dans le respect de normes supérieures.',
            ],
            [
              'parce que le Conseil constitutionnel écrit les lois',
              'Il ne les écrit pas : il contrôle leur conformité.',
            ],
          ],
          'La hiérarchie des normes place le bloc de constitutionnalité au-dessus des lois.',
        ),
        lecture(
          POUVOIRS,
          'Quel pouvoir a voté la loi dans ce texte ?',
          'le pouvoir législatif',
          [
            ['le pouvoir exécutif', 'Le pouvoir exécutif exécute les lois ; il ne les vote pas.'],
            ['le pouvoir judiciaire', 'Le pouvoir judiciaire rend la justice.'],
            ['le pouvoir municipal', 'Ce n’est pas l’un des trois pouvoirs de la séparation des pouvoirs.'],
          ],
          'Le Parlement exerce le pouvoir législatif : il vote la loi.',
        ),
      ],
    },
  ],
};

// ——— Notion 2 : libertés fondamentales ———

const libertes: Notion = {
  id: 'em4-libertes-fondamentales',
  title: 'Les libertés fondamentales et leurs limites',
  hint: 'Demande-toi si la liberté s’exerce seul ou avec d’autres, puis ce qui peut la limiter : autrui, la loi, l’ordre public.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Les **libertés individuelles** rendent chacun maître de ses mouvements, de ses choix, de ses opinions et croyances (liberté de circulation, de conscience, d’expression). Les **libertés collectives** permettent d’agir avec d’autres : réunion, association, manifestation, droit syndical, liberté de la presse.',
    'Ce sont des **libertés fondamentales**, liées à la dignité humaine. Elles sont encadrées par la loi : la liberté consiste à faire tout ce qui ne nuit pas à autrui (DDHC, art. 4), et elle est limitée par l’**ordre public** (sécurité, tranquillité, salubrité, dignité).',
    'Exemple : au nom de la liberté de croyance, la loi ne définit pas la secte, mais elle réprime les **dérives sectaires**.',
  ],
  faits: [
    fait(
      INDIVIDUELLES,
      ['La liberté de circulation est-elle une liberté individuelle ou collective ?', 'une liberté individuelle'],
      [
        ['une liberté collective', 'Circuler, c’est être maître de ses mouvements : cela concerne chacun.'],
        ['un devoir du citoyen', 'C’est une liberté, pas une obligation.'],
        ['une limite fixée par l’ordre public', 'L’ordre public peut limiter les libertés ; il n’en est pas une.'],
      ],
      ['La liberté de circulation est une liberté ', '.', ['individuelle']],
      'Les libertés individuelles rendent chacun maître de ses mouvements et de ses choix.',
    ),
    fait(
      COLLECTIVES,
      ['Laquelle de ces libertés est une liberté collective ?', 'le droit de réunion'],
      [
        ['la liberté de circulation', 'Elle concerne les mouvements de chacun : elle est individuelle.'],
        ['la liberté de conscience', 'Elle concerne les croyances de chacun : elle est individuelle.'],
        ['la liberté de mariage', 'Le programme la range parmi les libertés individuelles.'],
      ],
      ['Le droit de réunion et le droit d’association sont des libertés ', '.', ['collectives', 'collective']],
      'Les libertés collectives permettent de s’associer et de s’engager avec d’autres.',
    ),
    fait(
      INDIVIDUELLES,
      ['Quelle liberté individuelle protège le fait d’avoir ses propres croyances ?', 'la liberté de conscience'],
      [
        ['la liberté de la presse', 'C’est une liberté collective, liée à l’information.'],
        ['le droit syndical', 'C’est une liberté collective, liée au travail.'],
        ['la liberté de circulation', 'Elle concerne les déplacements, pas les croyances.'],
      ],
      [
        'Être maître de ses opinions et croyances relève de la liberté d’opinion et de la liberté de ',
        '.',
        ['conscience'],
      ],
      'La liberté de conscience permet de croire ou de ne pas croire.',
    ),
    fait(
      ART4,
      [
        'D’après l’article 4 de la DDHC, en quoi consiste la liberté ?',
        'pouvoir faire tout ce qui ne nuit pas à autrui',
      ],
      [
        [
          'pouvoir faire tout ce que l’on veut',
          'La liberté a des bornes : celles qui protègent les droits des autres.',
        ],
        ['obéir sans discuter', 'Obéir sans discuter n’est pas la définition de la liberté.'],
        ['faire ce que la majorité décide', 'L’article 4 ne parle pas de majorité, mais de ne pas nuire à autrui.'],
      ],
      ['La liberté consiste à pouvoir faire tout ce qui ne nuit pas à ', '.', ['autrui', 'les autres']],
      'Ma liberté s’arrête là où elle nuirait aux droits des autres.',
    ),
    fait(
      LIMITES,
      ['D’après le programme, qu’est-ce qui limite en premier lieu nos libertés ?', 'les libertés des autres'],
      [
        ['la volonté du plus fort', 'La force ne fixe pas les limites : la loi les fixe pour tous.'],
        ['rien : la liberté est sans limite', 'Nos libertés sont encadrées par la loi et limitées.'],
        ['les opinions de la majorité', 'Une opinion majoritaire ne limite pas les libertés des autres.'],
      ],
      ['Nos libertés sont limitées, en premier lieu, par les libertés des ', '.', ['autres']],
      'Nous n’avons pas le droit d’entraver ou de violer les libertés des autres.',
    ),
    expert(
      fait(
        ORDRE_PUBLIC,
        [
          'Outre la sécurité, que recouvre l’ordre public selon le programme ?',
          'la tranquillité, la salubrité et le respect de la dignité de la personne humaine',
        ],
        [
          ['la richesse et la réussite de chacun', 'L’ordre public protège la vie commune, pas la fortune.'],
          ['le silence de la presse', 'La liberté de la presse est une liberté collective protégée.'],
          ['l’obligation d’avoir les mêmes opinions', 'Ce serait contraire à la liberté d’opinion.'],
        ],
        [
          'L’ordre public concerne la sécurité, la tranquillité, la ',
          ' et le respect de la dignité de la personne humaine.',
          ['salubrité', 'salubrite'],
        ],
        'L’ordre public permet à chacun de jouir de ses droits et libertés.',
      ),
    ),
    expert(
      fait(
        ART4_BORNES,
        ['D’après l’article 4 de la DDHC, qui peut fixer les bornes de la liberté ?', 'la loi'],
        [
          ['chaque citoyen, pour lui-même', 'Chacun ne fixe pas ses propres limites : la loi les fixe pour tous.'],
          ['le plus fort', 'Ce serait la loi du plus fort, le contraire de l’État de droit.'],
          ['les réseaux sociaux', 'Une plateforme applique la loi, elle ne la fait pas.'],
        ],
        ['Ces bornes ne peuvent être déterminées que par la ', '.', ['loi']],
        'Seule la loi, la même pour tous, peut limiter les libertés.',
      ),
    ),
    expert(
      fait(
        SECTES,
        [
          'Que fait la loi face aux sectes, au nom de la liberté de croyance ?',
          'elle ne définit pas la secte mais réprime les dérives sectaires',
        ],
        [
          ['elle interdit toutes les croyances minoritaires', 'Ce serait contraire à la liberté de croyance.'],
          ['elle laisse faire toutes les dérives', 'Elle réprime les dérives qui portent atteinte aux personnes.'],
          ['elle oblige chacun à déclarer sa croyance', 'La liberté de conscience protège justement les croyances.'],
        ],
        ['La loi ne définit pas la secte, mais permet de réprimer les dérives ', '.', ['sectaires', 'sectaire']],
        'La loi ne juge pas une croyance ; elle punit les atteintes aux personnes.',
      ),
    ),
    expert(
      fait(
        ART10,
        [
          'D’après l’article 10 de la DDHC, à quelle condition la manifestation des opinions, même religieuses, est-elle protégée ?',
          'qu’elle ne trouble pas l’ordre public établi par la loi',
        ],
        [
          ['qu’elle soit approuvée par la majorité', 'Une opinion minoritaire est protégée elle aussi.'],
          ['qu’elle reste secrète', 'L’article protège la manifestation des opinions.'],
          ['qu’elle soit autorisée par une religion', 'L’article 10 pose une limite fixée par la loi.'],
        ],
        [
          'Nul ne doit être inquiété pour ses opinions, même religieuses, pourvu que leur manifestation ne trouble pas l’',
          ' public établi par la loi.',
          ['ordre'],
        ],
        'L’ordre public est l’une des limites posées par la loi à l’exercice des libertés.',
      ),
    ),
  ],
  paires3: [
    ['Liberté individuelle', 'Être maître de ses mouvements et de ses choix'],
    ['Liberté collective', 'S’associer et s’engager avec d’autres'],
    ['Ordre public', 'Sécurité, tranquillité, salubrité, dignité'],
  ],
  paires5: [
    ['Liberté de conscience', 'Choisir ses croyances'],
    ['Droit d’association', 'Créer un groupe organisé avec d’autres'],
    ['Liberté de la presse', 'Publier des informations et des opinions'],
    ['Article 4 de la DDHC', 'Ne pas nuire à autrui'],
    ['Dérive sectaire', 'Atteinte aux personnes réprimée par la loi'],
  ],
  libres: [
    libre(
      COLLECTIVES,
      'quelle liberté collective permet aux journaux d’informer librement ? La liberté de la …',
      ['presse', 'la presse'],
      [
        ['conscience', 'La liberté de conscience porte sur les croyances : c’est une liberté individuelle.'],
        ['circulation', 'La liberté de circulation concerne les déplacements.'],
      ],
      'La liberté de la presse fait partie des libertés collectives.',
    ),
    libre(
      ART4,
      'quel mot l’article 4 de la DDHC emploie-t-il pour désigner « les autres » ?',
      ['autrui'],
      [
        ['soi', 'L’article 4 protège les autres, pas soi-même.'],
        ['l’État', 'Le texte parle des autres membres de la société.'],
      ],
      '« Autrui » désigne les autres personnes.',
    ),
    libre(
      SECTES,
      'quel adjectif complète l’expression : la loi réprime les dérives … ?',
      ['sectaires', 'sectaire'],
      [
        ['religieuses', 'La loi ne vise pas une religion : elle réprime des dérives sectaires.'],
        ['collectives', 'Les libertés collectives sont protégées, elles ne sont pas réprimées.'],
      ],
      'Les dérives sectaires portent atteinte à l’ordre public, aux droits et à l’intégrité des personnes.',
    ),
  ],
  docs: [
    {
      title: 'Un samedi en ville',
      lines: [
        'Des habitants créent une association pour défendre un parc de leur ville.',
        'Ils organisent une manifestation le samedi suivant.',
        'Le jour venu, quelques personnes veulent bloquer l’entrée de l’hôpital voisin.',
        'Les organisateurs leur demandent de laisser passer les ambulances.',
      ],
      qs: [
        lecture(
          COLLECTIVES,
          'Quelles libertés les habitants exercent-ils en créant l’association et en manifestant ?',
          'des libertés collectives',
          [
            ['des libertés individuelles seulement', 'Ils agissent ensemble : ce sont des libertés collectives.'],
            ['aucune liberté, car manifester est interdit', 'Le droit de manifestation est une liberté collective.'],
            ['la seule liberté de conscience', 'Elle concerne les croyances, pas l’action en groupe.'],
          ],
          'Association et manifestation font partie des libertés collectives.',
        ),
        lecture(
          ART4,
          'Pourquoi bloquer l’entrée de l’hôpital dépasse-t-il les bornes de la liberté ?',
          'cela nuit à autrui',
          [
            ['parce que toute manifestation est interdite', 'La manifestation elle-même est une liberté.'],
            ['parce que les associations n’ont aucun droit', 'Les associations exercent une liberté collective.'],
            ['cela ne dépasse rien : la liberté n’a pas de limite', 'La liberté s’arrête là où elle nuit aux autres.'],
          ],
          'Empêcher l’accès aux soins nuit aux autres : la liberté ne le permet pas.',
        ),
      ],
    },
    {
      title: 'Une enquête sur un groupe',
      lines: [
        'Un groupe promet la guérison à ses membres contre des séances très chères.',
        'Il leur demande de couper tout contact avec leur famille.',
        'Une ancienne membre porte plainte.',
        'L’enquête porte sur les atteintes subies, pas sur les croyances du groupe.',
      ],
      qs: [
        lecture(
          SECTES,
          'Pourquoi l’enquête ne porte-t-elle pas sur les croyances du groupe ?',
          'la liberté de croyance est protégée ; la loi réprime seulement les dérives',
          [
            ['les croyances sont toutes interdites', 'Au contraire, la liberté de croyance est protégée.'],
            [
              'la police choisit les bonnes croyances',
              'La loi ne définit pas la secte : elle ne juge pas une croyance.',
            ],
            ['une plainte ne sert à rien', 'La plainte permet justement d’enquêter sur les atteintes.'],
          ],
          'La loi protège les croyances, mais punit les atteintes aux personnes.',
        ),
        lecture(
          SECTES,
          'Qu’est-ce que la loi peut réprimer dans ce cas ?',
          'une dérive qui porte atteinte à l’intégrité des personnes',
          [
            ['le fait d’avoir une croyance', 'Avoir une croyance relève de la liberté de conscience.'],
            ['le fait de créer une association', 'C’est une liberté collective.'],
            ['le fait de porter plainte', 'Porter plainte est un droit.'],
          ],
          'Couper quelqu’un de sa famille et l’exploiter porte atteinte à ses droits : c’est une dérive.',
        ),
      ],
    },
  ],
};

// ——— Notion 3 : la justice ———

const justice: Notion = {
  id: 'em4-justice',
  title: 'La justice : indépendance et organisation',
  hint: 'Repense au mémo : deux ordres, une pyramide à trois étages dans chacun, et des juges indépendants et impartiaux.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'L’**indépendance de la justice** est une condition de l’État de droit : les juges ne sont pas soumis à l’autorité d’un ministre et sont **inamovibles**. L’**impartialité**, c’est l’absence de préjugés du juge envers les **justiciables**.',
    'La justice a deux ordres : l’**ordre judiciaire** (tribunal correctionnel, cour d’assises…) et l’**ordre administratif**, qui juge les litiges impliquant les personnes publiques. Chacun forme une pyramide : **première instance**, **appel**, **cassation** ; au sommet, la **Cour de cassation** et le **Conseil d’État**.',
    'Exemple : en **cour d’assises**, des **jurés** tirés au sort jugent avec des magistrats professionnels. La justice des mineurs est liée au droit à la protection.',
  ],
  faits: [
    fait(
      INDEPENDANCE,
      ['D’après le programme, l’indépendance de la justice est une condition de quoi ?', 'de l’État de droit'],
      [
        ['de la richesse du pays', 'Le programme la relie au droit, pas à l’économie.'],
        ['de l’élection du président', 'L’élection relève du vote, pas de la justice.'],
        ['de la rapidité des procès', 'Le programme parle du traitement équitable des justiciables.'],
      ],
      ['L’indépendance de la justice est une condition de l’État de ', '.', ['droit']],
      'Un juge qui dépendrait du pouvoir ne pourrait pas protéger les droits de chacun.',
    ),
    fait(
      DEUX_ORDRES,
      ['Quels sont les deux ordres de juridiction en France ?', 'l’ordre judiciaire et l’ordre administratif'],
      [
        ['l’ordre civil et l’ordre militaire', 'Ce ne sont pas les deux ordres de juridiction.'],
        [
          'l’ordre national et l’ordre européen',
          'Les cours européennes ne forment pas un ordre de la justice française.',
        ],
        [
          'l’ordre public et l’ordre privé',
          'L’ordre public désigne la sécurité et la tranquillité, pas un ordre de juridiction.',
        ],
      ],
      ['Justice judiciaire et justice ', ' sont distinctes et indépendantes l’une de l’autre.', ['administrative']],
      'On parle de dualité des ordres de juridiction : judiciaire et administratif.',
    ),
    fait(
      PYRAMIDE,
      [
        'Dans chaque ordre, comment les juridictions sont-elles rangées, de la base au sommet ?',
        'première instance, appel, cassation',
      ],
      [
        ['cassation, appel, première instance', 'C’est l’ordre inverse : la cassation est au sommet.'],
        [
          'appel, première instance, cassation',
          'On fait appel d’un premier jugement : la première instance vient avant.',
        ],
        ['première instance, cassation, appel', 'La cassation est la dernière étape, au sommet.'],
      ],
      [
        'Chaque ordre comprend une juridiction de première instance, une juridiction d’appel et une juridiction de ',
        '.',
        ['cassation'],
      ],
      'La structure est pyramidale : première instance à la base, cassation au sommet.',
    ),
    fait(
      SOMMETS,
      ['Quelle juridiction est au sommet de l’ordre administratif ?', 'le Conseil d’État'],
      [
        ['la Cour de cassation', 'Elle est au sommet de l’ordre judiciaire.'],
        ['le Conseil constitutionnel', 'Il contrôle les lois ; ce n’est pas le sommet de l’ordre administratif.'],
        ['le tribunal administratif', 'Il juge en première instance, à la base de la pyramide.'],
      ],
      ['Au sommet de l’ordre judiciaire se trouve la Cour de ', '.', ['cassation']],
      'Cour de cassation pour l’ordre judiciaire, Conseil d’État pour l’ordre administratif.',
    ),
    fait(
      APPEL,
      ['À quoi sert l’appel ?', 'à juger une seconde fois un litige'],
      [
        [
          'à vérifier seulement l’application du droit',
          'C’est le rôle du pourvoi en cassation, qui ne rejuge pas les faits.',
        ],
        ['à tirer au sort les jurés', 'Le tirage au sort concerne la cour d’assises.'],
        ['à annuler une loi', 'Un appel vise un jugement, pas une loi.'],
      ],
      ['L’appel permet de juger une ', ' fois un litige.', ['seconde', 'deuxième', 'deuxieme']],
      'L’appel est une voie de recours contre un premier jugement.',
    ),
    fait(
      ORGANISATION,
      ['À quel droit le programme associe-t-il la justice des mineurs ?', 'au droit à la protection'],
      [
        ['au droit de vote', 'Le droit de vote est un droit politique, sans lien ici.'],
        ['au droit de ne jamais être jugé', 'Un mineur peut être jugé, par une justice adaptée.'],
        ['au droit de choisir son juge', 'Aucun justiciable ne choisit son juge.'],
      ],
      ['La justice des mineurs est liée au droit à la ', '.', ['protection']],
      'La justice des mineurs tient compte de l’âge et protège l’enfant.',
    ),
    expert(
      fait(
        JUGE_DU_DROIT,
        ['Que vérifie la Cour de cassation ?', 'la correcte application de la loi par les juges du fond'],
        [
          [
            'les faits de l’affaire, comme lors d’un nouveau procès',
            'Elle ne se prononce pas sur le fond : elle est juge du droit.',
          ],
          ['le choix des jurés', 'Le tirage au sort des jurés relève de la cour d’assises.'],
          ['les dépenses des tribunaux', 'Elle juge des pourvois, pas des budgets.'],
        ],
        ['La Cour de cassation est juge du ', ' : elle ne se prononce pas sur le fond de l’affaire.', ['droit']],
        'Elle garantit que la loi est appliquée de la même façon partout.',
      ),
    ),
    expert(
      fait(
        JURES,
        [
          'Qui peut être tiré au sort pour être juré de cour d’assises ?',
          'un citoyen français de 23 ans et plus, inscrit sur les listes électorales',
        ],
        [
          ['tout volontaire, dès 16 ans', 'Il faut être citoyen français, avoir 23 ans et plus, et être tiré au sort.'],
          ['uniquement un magistrat professionnel', 'Les jurés siègent justement au côté des magistrats.'],
          ['un avocat choisi par l’accusé', 'Les jurés sont tirés au sort, pas choisis par une partie.'],
        ],
        ['Un juré d’assises est tiré au ', ' parmi les citoyens inscrits sur les listes électorales.', ['sort']],
        'Le jury populaire fait participer des citoyens au jugement des crimes.',
      ),
    ),
    expert(
      fait(
        IMPARTIALITE,
        ['Que désigne l’impartialité du juge ?', 'l’absence de préjugés'],
        [
          ['l’obéissance au ministre', 'Les juges ne sont pas soumis à l’autorité d’un ministre.'],
          ['la rapidité du jugement', 'L’impartialité concerne l’attitude du juge, pas la durée.'],
          ['la sévérité des peines', 'Être impartial, c’est ne pas avoir de parti pris.'],
        ],
        [
          'L’impartialité désigne l’absence de ',
          ' qui doit caractériser le juge.',
          ['préjugés', 'prejuges', 'préjugé', 'prejuge'],
        ],
        'Un juge impartial traite chaque justiciable de façon équitable.',
      ),
    ),
    expert(
      fait(
        STATUT,
        [
          'Qu’est-ce qui garantit l’indépendance des juges vis-à-vis du pouvoir ?',
          'ils ne sont pas soumis à l’autorité d’un ministre et sont inamovibles',
        ],
        [
          [
            'ils sont élus chaque année par les justiciables',
            'Les magistrats professionnels ne sont pas élus par les justiciables.',
          ],
          ['ils obéissent aux ordres du Gouvernement', 'Ce serait le contraire de l’indépendance.'],
          ['ils sont choisis par les parties au procès', 'Aucune partie ne choisit son juge.'],
        ],
        ['Les juges ne sont pas soumis à l’autorité hiérarchique d’un ', '.', ['ministre']],
        'Un juge qu’on ne peut pas déplacer ni commander peut juger sans pression.',
      ),
    ),
    expert(
      fait(
        JURES_JUGES,
        [
          'Quelle fonction les jurés d’assises exercent-ils ?',
          'la fonction de juge, au côté de magistrats professionnels',
        ],
        [
          ['celle d’avocat de l’accusé', 'L’avocat défend une partie ; le juré juge.'],
          ['celle de simple spectateur', 'Les jurés jugent, ils ne se contentent pas d’assister.'],
          ['celle de policier chargé de l’enquête', 'L’enquête précède le procès ; le juré juge.'],
        ],
        ['Les jurés d’assises exercent la fonction de ', ', au côté de magistrats professionnels.', ['juge']],
        'Des citoyens participent ainsi directement à la justice : c’est le jury populaire.',
      ),
    ),
  ],
  paires3: [
    ['Ordre judiciaire', 'Sommet : Cour de cassation'],
    ['Ordre administratif', 'Sommet : Conseil d’État'],
    ['Juré d’assises', 'Citoyen tiré au sort'],
  ],
  paires5: [
    ['Première instance', 'Premier jugement d’une affaire'],
    ['Appel', 'Juger une seconde fois le litige'],
    ['Cassation', 'Vérifier la bonne application du droit'],
    ['Impartialité', 'Absence de préjugés du juge'],
    ['Tribunal des conflits', 'Règle les conflits entre les deux ordres'],
  ],
  libres: [
    libre(
      SOMMETS,
      'quelle juridiction est au sommet de l’ordre judiciaire ? La Cour de …',
      ['cassation', 'Cour de cassation', 'la Cour de cassation'],
      [
        ['appel', 'La cour d’appel juge en second degré, pas au sommet.'],
        ['assises', 'La cour d’assises juge les crimes ; elle n’est pas au sommet.'],
      ],
      'La Cour de cassation est la cour suprême de l’ordre judiciaire.',
    ),
    libre(
      COUR_APPEL,
      'comment s’appelle la juridiction qui rejuge une affaire après un appel ? La cour d’…',
      ['appel', 'cour d’appel', 'la cour d’appel'],
      [
        ['assises', 'La cour d’assises juge les crimes ; ce n’est pas elle qui rejuge après un appel ordinaire.'],
        ['cassation', 'La Cour de cassation ne rejuge pas les faits.'],
      ],
      'L’appel conduit l’affaire devant une juridiction du second degré : la cour d’appel.',
    ),
    libre(
      JURES,
      'à partir de quel âge un citoyen peut-il être juré d’assises ? (en chiffres)',
      ['23', '23 ans'],
      [
        ['18', 'Il faut avoir au moins 23 ans pour être juré d’assises.'],
        ['21', 'Il faut avoir au moins 23 ans pour être juré d’assises.'],
      ],
      'Les jurés sont tirés au sort parmi les citoyens de 23 ans et plus.',
    ),
    libre(
      CONFLITS,
      'quelle juridiction règle les conflits de compétence entre les deux ordres ? Le Tribunal des …',
      ['conflits', 'Tribunal des conflits', 'le Tribunal des conflits'],
      [
        ['litiges', 'Le mot exact est « conflits » : Tribunal des conflits.'],
        ['cassation', 'La Cour de cassation est le sommet de l’ordre judiciaire.'],
      ],
      'Le Tribunal des conflits décide quel ordre est compétent pour juger un litige.',
    ),
  ],
  docs: [
    {
      title: 'Une audience au tribunal correctionnel',
      lines: [
        'Une classe de 4e assiste à une audience du tribunal correctionnel.',
        'Un homme est jugé pour un délit ; le tribunal le déclare coupable.',
        'Son avocate annonce qu’il va faire appel.',
        'La juge rappelle qu’un pourvoi en cassation sera ensuite possible contre l’arrêt de la cour d’appel.',
      ],
      qs: [
        lecture(
          COUR_APPEL,
          'Que se passera-t-il après l’appel ?',
          'une cour d’appel rejugera l’affaire',
          [
            ['la Cour de cassation rejugera directement les faits', 'La Cour de cassation ne juge pas les faits.'],
            ['le premier jugement ne pourra plus être contesté', 'Faire appel, c’est justement le contester.'],
            ['le tribunal correctionnel se rejugera lui-même', 'L’appel transfère l’affaire à une autre juridiction.'],
          ],
          'L’appel permet de juger l’affaire une seconde fois, devant une cour d’appel.',
        ),
        lecture(
          PENAL,
          'À quel ordre de juridiction appartient le tribunal correctionnel ?',
          'l’ordre judiciaire',
          [
            ['l’ordre administratif', 'L’ordre administratif juge les litiges avec les personnes publiques.'],
            ['aucun : c’est une cour supranationale', 'C’est une juridiction française.'],
            ['l’ordre constitutionnel', 'Le Conseil constitutionnel n’est pas au sommet d’un ordre de juridiction.'],
          ],
          'Tribunal correctionnel, cour d’appel, puis Cour de cassation : c’est l’ordre judiciaire.',
        ),
      ],
    },
    {
      title: 'Un litige avec une mairie',
      lines: [
        'Une habitante conteste une décision de sa mairie.',
        'Elle saisit le tribunal administratif, qui rejette sa demande.',
        'Elle fait appel devant la cour administrative d’appel.',
        'En dernier recours, un pourvoi peut être porté devant la plus haute juridiction de cet ordre.',
      ],
      qs: [
        lecture(
          ADMINISTRATIF,
          'Quelle est la plus haute juridiction évoquée à la dernière ligne ?',
          'le Conseil d’État',
          [
            ['la Cour de cassation', 'Elle est au sommet de l’ordre judiciaire, pas de l’ordre administratif.'],
            ['le Conseil constitutionnel', 'Il contrôle les lois ; il ne juge pas ce pourvoi.'],
            ['la cour d’assises', 'Elle juge les crimes, dans l’ordre judiciaire.'],
          ],
          'Litige avec une personne publique : ordre administratif, au sommet duquel siège le Conseil d’État.',
        ),
        lecture(
          PERSONNES_PUBLIQUES,
          'Pourquoi l’habitante s’adresse-t-elle au tribunal administratif ?',
          'son litige implique une personne publique, la mairie',
          [
            [
              'parce qu’elle a commis un délit',
              'Un délit est jugé par le tribunal correctionnel, dans l’ordre judiciaire.',
            ],
            ['parce que c’est la Cour de cassation', 'Le tribunal administratif juge en première instance.'],
            ['parce que les jurés y sont tirés au sort', 'Les jurés siègent en cour d’assises.'],
          ],
          'Les tribunaux administratifs jugent les litiges qui impliquent les personnes publiques.',
        ),
      ],
    },
  ],
};

// ——— Notion 4 : les déclarations des droits ———

const declarations: Notion = {
  id: 'em4-declarations-droits',
  title: 'Les déclarations des droits : DDHC, DUDH, CIDE',
  hint: 'Repère le texte (1789, universelle, enfant), puis l’article cité : 1er, 2, 16 de la DDHC ou 3, 13, 15, 17 de la CIDE.',
  programme: PROGRAMME,
  credit: 'Extraits de la Déclaration des droits de l’homme et du citoyen de 1789 (texte publié sur Légifrance).',
  memo: [
    'La DDHC de 1789 proclame des droits naturels et **imprescriptibles** : la liberté, la propriété, la **sûreté** et la **résistance à l’oppression** (art. 2). Son préambule voit dans l’oubli ou le mépris des droits les seules causes des malheurs publics.',
    'La **Déclaration universelle des droits de l’homme** et la Convention internationale des droits de l’enfant (CIDE) garantissent aussi des droits au quotidien : **intérêt supérieur de l’enfant** (art. 3), liberté d’expression (art. 13), d’association et de réunion (art. 15), d’information (art. 17).',
    'Article 16 de la DDHC : sans garantie des droits ni séparation des pouvoirs, une société « n’a point de Constitution ». Exemple : la sûreté protège tes droits et ta sécurité.',
  ],
  faits: [
    fait(
      ART1,
      [
        'D’après l’article 1er de la DDHC, comment les hommes naissent-ils et demeurent-ils ?',
        'libres et égaux en droits',
      ],
      [
        ['riches ou pauvres selon leur naissance', 'L’article 1er écarte justement les privilèges de naissance.'],
        ['soumis à l’autorité du roi', 'La DDHC proclame des droits, pas une soumission.'],
        ['tous identiques en tout point', 'Égaux en droits ne veut pas dire identiques.'],
      ],
      ['Les hommes naissent et demeurent libres et ', ' en droits.', ['égaux', 'egaux']],
      'L’égalité en droits est le premier principe proclamé en 1789.',
    ),
    fait(
      ART2,
      [
        'D’après l’article 2 de la DDHC, quels sont les droits naturels et imprescriptibles de l’homme ?',
        'la liberté, la propriété, la sûreté et la résistance à l’oppression',
      ],
      [
        ['la liberté, l’égalité et la fraternité', 'C’est la devise de la République, pas la liste de l’article 2.'],
        ['le vote, l’impôt et le service militaire', 'Ce ne sont pas les droits cités à l’article 2.'],
        ['l’éducation, la santé et le logement', 'Ces droits ne figurent pas à l’article 2 de la DDHC.'],
      ],
      [
        'Ces droits sont la liberté, la propriété, la ',
        ' et la résistance à l’oppression.',
        ['sûreté', 'surete', 'sureté'],
      ],
      'L’article 2 cite quatre droits : liberté, propriété, sûreté, résistance à l’oppression.',
    ),
    fait(
      SURETE,
      [
        'Que signifie la « sûreté », droit affirmé par l’article 2 de la DDHC ?',
        'les droits du citoyen sont protégés et il doit se trouver en sécurité',
      ],
      [
        ['le droit de posséder une arme', 'La sûreté est une protection, pas un droit de s’armer.'],
        ['le droit de choisir ses juges', 'Aucun justiciable ne choisit son juge.'],
        ['la liberté de ne pas payer d’impôt', 'La sûreté n’a pas de lien avec l’impôt.'],
      ],
      [
        'La sûreté signifie que les droits du citoyen sont protégés et qu’il doit se trouver en ',
        '.',
        ['sécurité', 'securite'],
      ],
      'Police, gendarmerie, pompiers et douanes répondent à cette exigence de sûreté.',
    ),
    fait(
      CIDE_ARTICLES,
      [
        'Quel principe l’article 3 de la Convention internationale des droits de l’enfant établit-il ?',
        'l’intérêt supérieur de l’enfant',
      ],
      [
        ['le droit de vote des enfants', 'La CIDE ne donne pas le droit de vote aux enfants.'],
        ['l’autorité absolue des adultes', 'C’est l’intérêt de l’enfant qui doit primer.'],
        ['l’obligation de travailler', 'La CIDE protège au contraire l’enfant.'],
      ],
      ['L’article 3 de la CIDE établit l’intérêt ', ' de l’enfant.', ['supérieur', 'superieur']],
      'Toute décision qui concerne un enfant doit tenir compte d’abord de son intérêt.',
    ),
    fait(
      TEXTES,
      [
        'Quels textes le programme de 4e cite-t-il pour montrer que des droits et libertés sont garantis au quotidien ?',
        'la DDHC, la Déclaration universelle des droits de l’homme et la CIDE',
      ],
      [
        ['le Code de la route et le Code pénal', 'Ce sont des lois, pas des déclarations des droits.'],
        ['la seule Constitution de 1958', 'Le programme cite trois textes, dont deux internationaux.'],
        ['les règlements intérieurs des collèges', 'Ils doivent respecter ces droits, mais ne les proclament pas.'],
      ],
      [
        'La DDHC, la Déclaration ',
        ' des droits de l’homme et la CIDE garantissent des droits et libertés au quotidien.',
        ['universelle'],
      ],
      'Un texte français de 1789 et deux textes internationaux garantissent des droits.',
    ),
    expert(
      fait(
        PREAMBULE,
        [
          'D’après le préambule de la DDHC, quelles sont les seules causes des malheurs publics ?',
          'l’ignorance, l’oubli ou le mépris des droits de l’homme',
        ],
        [
          ['les guerres et les épidémies', 'Le préambule met en cause l’oubli des droits, pas les catastrophes.'],
          ['la pauvreté des campagnes', 'Ce n’est pas la cause citée par le préambule.'],
          ['le manque d’impôts', 'Le préambule parle des droits de l’Homme.'],
        ],
        [
          'L’ignorance, l’oubli ou le ',
          ' des droits de l’Homme sont les seules causes des malheurs publics.',
          ['mépris', 'mepris'],
        ],
        'D’où l’idée de déclarer les droits, pour que chacun les connaisse et les rappelle.',
      ),
    ),
    expert(
      fait(
        ART16,
        [
          'D’après l’article 16 de la DDHC, que n’a pas une société sans garantie des droits ni séparation des pouvoirs ?',
          'une Constitution',
        ],
        [
          ['un roi', 'L’article 16 ne parle pas de roi.'],
          ['une armée', 'L’article 16 ne parle pas d’armée.'],
          ['une capitale', 'L’article 16 ne parle pas de capitale.'],
        ],
        ['Toute société sans garantie des droits ni séparation des pouvoirs « n’a point de ', ' ».', ['Constitution']],
        'Pour la DDHC, une vraie Constitution garantit les droits et sépare les pouvoirs.',
      ),
    ),
    expert(
      fait(
        CIDE_ARTICLES,
        [
          'Quelles libertés l’article 15 de la CIDE garantit-il, selon le programme ?',
          'la liberté d’association et de réunion',
        ],
        [
          ['la liberté d’information', 'C’est l’article 17.'],
          ['la liberté d’expression', 'C’est l’article 13.'],
          ['le droit de vote', 'La CIDE ne donne pas le droit de vote aux enfants.'],
        ],
        ['L’article 15 de la CIDE garantit la liberté d’association et de ', '.', ['réunion', 'reunion']],
        'Article 13 : expression ; article 15 : association et réunion ; article 17 : information.',
      ),
    ),
  ],
  paires3: [
    ['DDHC', 'Texte de 1789 sur les droits naturels'],
    ['CIDE', 'Convention sur les droits de l’enfant'],
    ['Sûreté', 'Être protégé et en sécurité'],
  ],
  paires5: [
    ['Article 1er de la DDHC', 'Libres et égaux en droits'],
    ['Article 2 de la DDHC', 'Liberté, propriété, sûreté, résistance à l’oppression'],
    ['Article 16 de la DDHC', 'Garantie des droits et séparation des pouvoirs'],
    ['Article 3 de la CIDE', 'Intérêt supérieur de l’enfant'],
    ['Article 17 de la CIDE', 'Liberté d’information'],
  ],
  libres: [
    libre(
      ART2,
      'complète le dernier droit cité à l’article 2 de la DDHC : « la résistance à l’… »',
      ['oppression', 'l’oppression'],
      [
        ['obéissance', 'Résister à l’obéissance n’a pas de sens : le texte vise l’oppression.'],
        ['autorité', 'Le texte ne vise pas toute autorité, mais l’oppression.'],
      ],
      'L’oppression est un pouvoir qui écrase les droits ; y résister est un droit naturel.',
    ),
    libre(
      CIDE_ARTICLES,
      'quel adjectif complète le principe de l’article 3 de la CIDE : « l’intérêt … de l’enfant » ?',
      ['supérieur', 'superieur'],
      [
        ['général', 'L’intérêt général concerne toute la société ; la CIDE parle de l’intérêt supérieur de l’enfant.'],
        ['particulier', 'Le texte dit « supérieur » : cet intérêt passe en premier.'],
      ],
      'L’intérêt supérieur de l’enfant doit guider les décisions qui le concernent.',
    ),
    libre(
      ART16,
      'd’après l’article 16 de la DDHC, une société sans séparation des pouvoirs n’a point de … (un mot)',
      ['Constitution', 'une Constitution'],
      [
        ['roi', 'L’article 16 ne parle pas de roi.'],
        ['loi', 'Le mot exact est « Constitution ».'],
      ],
      'Garantie des droits et séparation des pouvoirs sont les deux conditions d’une Constitution.',
    ),
  ],
  docs: [
    {
      title: 'DDHC, 1789 : préambule et articles 1er et 2 (extraits)',
      lines: [
        'Préambule : « l’ignorance, l’oubli ou le mépris des droits de l’Homme sont les seules causes des malheurs publics et de la corruption des Gouvernements ».',
        'Article 1er : « Les hommes naissent et demeurent libres et égaux en droits. »',
        'Article 2 : « Le but de toute association politique est la conservation des droits naturels et imprescriptibles de l’Homme. Ces droits sont la liberté, la propriété, la sûreté, et la résistance à l’oppression. »',
      ],
      qs: [
        lecture(
          PREAMBULE,
          'D’après le préambule, pourquoi faut-il déclarer les droits ?',
          'parce que leur oubli ou leur mépris cause les malheurs publics',
          [
            ['pour fixer le montant des impôts', 'Le préambule ne parle pas d’impôts.'],
            ['pour renforcer le pouvoir du roi', 'Le texte veut protéger les droits, pas un pouvoir.'],
            ['parce que les droits changent chaque année', 'Ils sont dits naturels et imprescriptibles.'],
          ],
          'Rappeler les droits à tous doit éviter qu’ils soient oubliés ou méprisés.',
        ),
        lecture(
          SURETE,
          'Lequel des droits de l’article 2 signifie que le citoyen doit se trouver en sécurité ?',
          'la sûreté',
          [
            ['la propriété', 'La propriété concerne les biens.'],
            ['la liberté', 'La liberté consiste à faire ce qui ne nuit pas à autrui.'],
            ['la résistance à l’oppression', 'C’est le droit de s’opposer à un pouvoir oppressif.'],
          ],
          'Le programme précise que la sûreté protège les droits du citoyen et sa sécurité.',
        ),
      ],
    },
    {
      title: 'DDHC, 1789 : articles 7 et 9 (extraits)',
      lines: [
        'Article 7 : « Nul homme ne peut être accusé, arrêté ni détenu que dans les cas déterminés par la Loi, et selon les formes qu’elle a prescrites. »',
        'Article 9 : « Tout homme étant présumé innocent jusqu’à ce qu’il ait été déclaré coupable […] »',
      ],
      qs: [
        lecture(
          ART7,
          'Contre quoi l’article 7 protège-t-il chacun ?',
          'contre une arrestation décidée en dehors des cas prévus par la loi',
          [
            ['contre toute forme de critique', 'L’article 7 parle d’accusation et d’arrestation.'],
            ['contre la perte de ses biens', 'C’est le droit de propriété, à l’article 17.'],
            ['contre toute enquête de police', 'Une arrestation reste possible dans les cas prévus par la loi.'],
          ],
          'Seule la loi fixe les cas et les formes d’une arrestation : c’est le refus de l’arbitraire.',
        ),
        lecture(
          ART9,
          'D’après l’article 9, comment est considérée une personne accusée tant qu’elle n’a pas été déclarée coupable ?',
          'présumée innocente',
          [
            ['coupable', 'Seul un jugement peut déclarer une personne coupable.'],
            ['suspecte pour toujours', 'L’accusation ne suffit pas à faire d’elle un coupable.'],
            ['privée de tous ses droits', 'La personne accusée garde ses droits.'],
          ],
          'La présomption d’innocence protège chaque justiciable jusqu’au jugement.',
        ),
      ],
    },
  ],
};

export const DROITS_LIBERTES_SKILLS: readonly Skill[] = [etatDeDroit, libertes, justice, declarations].map(notion);
