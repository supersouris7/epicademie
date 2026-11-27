import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM2, « Vivre en République » (lot em-cm2-01). Chaque fait cite le programme d'EMC du 13 juin 2024
 * (registre `emc-2024`) avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice
 * (personnages inventés). Les rôles du maire (élu local, représentant de l'État, état civil, école, environnement)
 * figurent dans le programme de CE2 : ils sont repris ici comme rappel pour la notion « la commune et ses élus »,
 * que le programme de CM2 aborde par la rencontre avec les élus locaux et les conseillers municipaux juniors.
 * Compléments vie-publique.fr (registre) : élection du maire par le conseil municipal ; droits civils, sociaux et politiques.
 */

const PROGRAMME = 'classe de CM2 : « Vivre en République »';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de CM2.';

// ——— Citations exactes du programme ———

const SYMBOLES =
  'connaître et comprendre les symboles républicains mentionnés par la Constitution : drapeau, hymne, devise, et d’autres coutumiers comme Marianne';
/** Registre des sources : fiches de vie-publique.fr. */
const VP_MAIRE = 'vie-publique-maire';
const VP_CITOYEN = 'vie-publique-citoyen';
const COUTUMIERS = '« Coutumiers » veut dire « d’usage ».';
const FETE = 'connaître la fête nationale du 14 juillet (héritière de la Fête de la Fédération de 1790)';
const RESPECT_SYMBOLES = 'comprendre la nécessité de respecter ces symboles';
const EUROPE =
  'Connaître le drapeau européen, comprendre pourquoi il est associé au drapeau tricolore sur les bâtiments publics et reconnaitre l’hymne européen';
const DEVISE = 'comprendre la devise « Liberté, Égalité, Fraternité »';

const NATIONALITE =
  'À partir de l’article 7 de la Convention internationale des droits de l’enfant, faire comprendre que tout enfant possède dès sa naissance des droits, dont celui d’acquérir une nationalité';
const DROITS_FRANCE =
  'Par des exemples choisis illustrant des droits, comprendre qu’en France, tout individu bénéficie de droits comme celui à l’éducation, d’être soigné, etc.';
const DDHC =
  'citer quelques droits individuels et collectifs comme le droit à la liberté d’expression (art. 11), d’opinion (art. 10), le droit à la sûreté (art. 2)';
const POLITIQUES =
  'les distinguer des droits politiques comme le droit de vote et d’éligibilité qui permettent de participer aux décisions de la vie publique';
const DEVOIRS =
  'connaître les devoirs du citoyen et de toute personne résidant sur le territoire national : respecter les lois, contribuer à financer les dépenses publiques';
const DROITS_AUTRES = 'Chaque citoyen doit respecter les droits des autres qui sont identiques aux siens';
const PREJUGES = 'La lutte contre les discriminations suppose la déconstruction des préjugés et des stéréotypes';

const MAIRE_ELU = 'savoir que le maire est un élu local, et le représentant de l’État dans la commune';
const MAIRE_ROLE = 'connaître son rôle à la tête de la collectivité (état civil, école, environnement)';
const ELUS_LOCAUX =
  'Une rencontre avec des élus locaux (maire de la commune, conseillers municipaux) peut être ainsi l’occasion pour les élèves d’appréhender l’engagement de citoyennes et de citoyens actifs';
const CANDIDATS =
  'citoyennes et de citoyens actifs qui se sont portés candidats à une élection municipale, et de comprendre les modalités d’exercice de leur mandat local';
const JUNIORS =
  'L’expérience des conseillers municipaux juniors est considérée en vue d’expliquer le rôle politique du citoyen qui, par le vote, participe à la vie de sa cité';
const DELEGUE =
  'À partir de l’organisation d’une élection (délégué de classe par exemple), comprendre les règles et le fonctionnement de l’élection présidentielle';

const VOTE_ROLE =
  'connaître le rôle politique des citoyennes et des citoyens : ils ont vocation à participer à la vie politique du pays et à l’évolution des institutions';
const ELECTEURS =
  'les électeurs et les électrices sont à l’origine des lois en vigueur par l’intermédiaire de leurs représentants démocratiquement élus';
const SOUVERAINETE = 'la souveraineté nationale appartient au peuple';
const DEVOIR_CIVIQUE = 'Voter est un droit, c’est aussi un devoir civique';
const BON_FONCTIONNEMENT = 'par leur vote citoyennes et citoyens assurent le bon fonctionnement de la démocratie';

// ——— Notion 1 : valeurs et symboles ———

const valeursSymboles: Notion = {
  id: 'emcm2-valeurs-symboles',
  title: 'Les valeurs et les symboles de la République',
  hint: 'Pense à ce qui représente la France : ce qu’on voit, ce qu’on chante, ce qu’on lit.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **République** se fait voir grâce à des **symboles** : le **drapeau** tricolore, l’**hymne** (la Marseillaise), la **devise** « Liberté, Égalité, Fraternité » et **Marianne**.',
    'Les trois premiers sont cités dans la **Constitution**. On les respecte, car ils nous rassemblent. La fête nationale est le 14 juillet.',
    'La France est aussi membre de l’**Union européenne**. Son drapeau est souvent posé à côté du drapeau tricolore.',
  ],
  faits: [
    {
      q: 'Quelle est la devise de la République française ?',
      a: 'Liberté, Égalité, Fraternité',
      wrong: [
        { label: 'Courage, Force, Victoire', why: 'Ce n’est pas la devise de la République.' },
        { label: 'Paix, Argent, Pouvoir', why: 'La devise ne parle ni d’argent ni de pouvoir.' },
        {
          label: 'Liberté, Sécurité, Amitié',
          why: 'Deux mots ne sont pas dans la devise : la bonne est « Liberté, Égalité, Fraternité ».',
        },
      ],
      gap: ['La devise de la République est « Liberté, Égalité, ', ' ».', ['Fraternité', 'fraternité', 'Fraternite']],
      quote: DEVISE,
      explain: 'La devise a trois mots : liberté, égalité, fraternité.',
    },
    {
      q: 'Quel jour célèbre-t-on la fête nationale en France ?',
      a: 'le 14 juillet',
      wrong: [
        { label: 'le 1er janvier', why: 'Le 1er janvier est le premier jour de l’année, pas la fête nationale.' },
        { label: 'le 25 décembre', why: 'Le 25 décembre est Noël, pas la fête nationale.' },
        { label: 'le 11 novembre', why: 'Le 11 novembre est une commémoration, pas la fête nationale.' },
      ],
      gap: ['La fête nationale française a lieu le ', ' (jour et mois).', ['14 juillet', '14/07', '14 juillet.']],
      quote: FETE,
      explain: 'La fête nationale est le 14 juillet. Elle vient de la Fête de la Fédération de 1790.',
    },
    {
      q: 'Quels sont trois symboles de la République cités par la Constitution ?',
      a: 'le drapeau, l’hymne et la devise',
      wrong: [
        {
          label: 'le sapin, le chocolat et la baguette',
          why: 'Ce sont des objets du quotidien, pas des symboles de la République.',
        },
        {
          label: 'le maillot, le ballon et le sifflet',
          why: 'Ce sont des objets de sport, pas des symboles de la République.',
        },
        { label: 'le mètre, le kilo et le litre', why: 'Ce sont des unités de mesure, pas des symboles.' },
      ],
      gap: [
        'Le drapeau, l’',
        ' et la devise sont des symboles de la République cités dans la Constitution.',
        ['hymne'],
      ],
      quote: SYMBOLES,
      explain: `La Constitution cite le drapeau, l’hymne et la devise. Marianne est un symbole coutumier. ${COUTUMIERS}`,
    },
    {
      q: 'Pourquoi faut-il respecter les symboles de la République ?',
      a: 'parce qu’ils représentent la République et rassemblent tout le monde',
      wrong: [
        { label: 'parce qu’ils sont très chers', why: 'Leur valeur ne compte pas : ils représentent la République.' },
        { label: 'parce qu’ils sont très anciens', why: 'L’ancienneté n’est pas la raison : ils nous rassemblent.' },
        { label: 'parce qu’ils appartiennent au maire', why: 'Ils appartiennent à tous, pas à une seule personne.' },
      ],
      gap: [
        'Rester silencieux pendant l’hymne national, c’est une façon de montrer qu’on le ',
        '.',
        ['respecte', 'honore'],
      ],
      quote: RESPECT_SYMBOLES,
      explain:
        'Les symboles rendent la République visible. Les respecter, c’est respecter ce que nous avons en commun.',
    },
    {
      q: 'Quel drapeau flotte souvent à côté du drapeau tricolore sur les bâtiments publics ?',
      a: 'le drapeau européen',
      wrong: [
        {
          label: 'le drapeau d’un club de sport',
          why: 'Un club n’a pas sa place à côté du drapeau tricolore sur un bâtiment public.',
        },
        {
          label: 'le drapeau d’une marque',
          why: 'Une marque est privée : les bâtiments publics n’affichent pas sa publicité.',
        },
        {
          label: 'le drapeau d’un seul pays voisin',
          why: 'C’est le drapeau de l’Union européenne qui est associé à celui de la France.',
        },
      ],
      gap: [
        'Sur les bâtiments publics, le drapeau tricolore est associé au drapeau ',
        '.',
        ['européen', 'europeen', 'de l’Union européenne'],
      ],
      quote: EUROPE,
      explain: 'La France est membre de l’Union européenne : son drapeau est associé au drapeau tricolore.',
    },
  ],
  paires3: [
    ['Hymne', 'La Marseillaise'],
    ['Devise', 'Liberté, Égalité, Fraternité'],
    ['Fête nationale', 'Le 14 juillet'],
  ],
  paires5: [
    ['Hymne', 'La Marseillaise'],
    ['Devise', 'Liberté, Égalité, Fraternité'],
    ['Fête nationale', 'Le 14 juillet'],
    ['Marianne', 'Visage de la République'],
    ['Union européenne', 'Groupe de pays d’Europe dont la France fait partie'],
  ],
  libres: [
    {
      q: 'Comment s’appelle l’hymne national de la France (un mot) ?',
      accepted: ['marseillaise', 'la marseillaise', 'La Marseillaise'],
      traps: [
        { text: 'drapeau', why: 'Un drapeau se regarde : l’hymne, lui, se chante.' },
        { text: 'devise', why: 'La devise est une phrase de trois mots, pas un chant.' },
      ],
      quote: SYMBOLES,
      explain: `L’hymne national s’appelle la Marseillaise. ${COUTUMIERS}`,
    },
    {
      q: 'Quel est le visage qui symbolise la République, un prénom de femme (un mot) ?',
      accepted: ['marianne', 'Marianne'],
      traps: [
        { text: 'marseillaise', why: 'La Marseillaise est l’hymne, pas un visage.' },
        { text: 'liberté', why: 'La liberté est un mot de la devise, pas le nom du visage de la République.' },
      ],
      quote: SYMBOLES,
      explain: `Marianne est un symbole coutumier de la République. ${COUTUMIERS}`,
    },
  ],
  docs: [
    {
      title: 'Devant la mairie',
      lines: [
        'Devant la mairie, deux drapeaux flottent côte à côte.',
        'Le premier est bleu, blanc et rouge. Le second est bleu avec des étoiles.',
        'Léa demande : « Pourquoi y en a-t-il deux ? »',
        'Sa maîtresse répond : « La France fait partie de l’Union européenne. »',
      ],
      qs: [
        {
          q: 'Que représente le drapeau bleu avec des étoiles ?',
          a: 'l’Union européenne',
          wrong: [
            { label: 'la ville', why: 'Le texte dit que la France fait partie de l’Union européenne.' },
            {
              label: 'l’école de Léa',
              why: 'Ce drapeau est celui de l’Union européenne, pas celui de l’école.',
            },
            { label: 'un club de sport', why: 'Un club n’est pas un symbole d’un bâtiment public.' },
          ],
          quote: EUROPE,
          explain:
            'La France est membre de l’Union européenne. Le drapeau européen est associé au drapeau tricolore sur les bâtiments publics.',
        },
        {
          q: 'Quel est le nom du drapeau bleu, blanc et rouge ?',
          a: 'le drapeau tricolore',
          wrong: [
            { label: 'le drapeau européen', why: 'Le drapeau européen est le bleu avec des étoiles.' },
            { label: 'la devise', why: 'La devise est une phrase, pas un drapeau.' },
            { label: 'l’hymne', why: 'L’hymne se chante, il ne se hisse pas au mât.' },
          ],
          quote: SYMBOLES,
          explain: `Le drapeau tricolore est un symbole de la République, cité par la Constitution. ${COUTUMIERS}`,
        },
      ],
    },
    {
      title: 'La cérémonie du 11 novembre',
      lines: [
        'Le 11 novembre, la classe de Samir va devant le monument aux morts.',
        'Ce monument porte les noms de soldats morts à la guerre. Il garde la mémoire collective : les souvenirs que tout un pays partage.',
        'Le maire est là. Tout le monde se tait quand la Marseillaise est jouée.',
        'Samir demande : « Pourquoi on reste debout et silencieux ? »',
      ],
      qs: [
        {
          q: 'Quel symbole est joué pendant la cérémonie ?',
          a: 'l’hymne national',
          wrong: [
            { label: 'la devise', why: 'La devise s’écrit ou se dit, mais ce n’est pas un air de musique.' },
            { label: 'le drapeau', why: 'Un drapeau ne se joue pas : on le regarde.' },
            { label: 'Marianne', why: 'Marianne est un visage, pas un air de musique.' },
          ],
          quote: SYMBOLES,
          explain: `La Marseillaise est l’hymne national : on la joue pendant les cérémonies. ${COUTUMIERS}`,
        },
        {
          q: 'Pourquoi reste-t-on silencieux pendant la cérémonie ?',
          a: 'pour respecter les symboles et la mémoire collective',
          wrong: [
            { label: 'pour gagner un jeu', why: 'Une cérémonie n’est pas un jeu.' },
            { label: 'parce que c’est une punition', why: 'Ce n’est pas une punition : c’est du respect.' },
            {
              label: 'parce que le maire l’ordonne seul',
              why: 'Le silence montre le respect de tous, pas l’ordre d’une seule personne.',
            },
          ],
          quote: RESPECT_SYMBOLES,
          explain: 'Pendant la cérémonie du 11 novembre, se taire montre qu’on respecte les symboles et la mémoire.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : droits de tous ———

const droitsDeTous: Notion = {
  id: 'emcm2-droits-de-tous',
  title: 'Les droits et les devoirs de tous',
  hint: 'Demande-toi : est-ce un droit qu’on a, ou une chose qu’on doit faire ?',
  programme: PROGRAMME,
  sources: [VP_CITOYEN],
  credit: CREDIT,
  memo: [
    'Un **droit** te protège ou te permet d’agir. En France, tout le monde a des **droits sociaux** (aller à l’école, être soigné) et des **droits civils** : la **DDHC** (1789) cite la liberté d’expression, d’opinion et la sûreté (être protégé contre une arrestation injuste).',
    'Les **droits politiques**, comme voter, viennent à la majorité. La **Convention des droits de l’enfant** (article 7) donne à chaque enfant le droit d’avoir une nationalité.',
    'Un **devoir** est ce que tu dois faire : respecter les lois et les droits des autres, payer l’**impôt**. Il faut aussi combattre les **préjugés**.',
  ],
  faits: [
    {
      q: 'Quel droit as-tu, en France, comme tout individu ?',
      a: 'le droit à l’éducation',
      wrong: [
        {
          label: 'le droit de ne jamais suivre de règles',
          why: 'Les droits s’exercent dans le cadre des règles et des lois.',
        },
        {
          label: 'le droit de faire ce qu’on veut aux autres',
          why: 'Chaque citoyen doit respecter les droits des autres.',
        },
        {
          label: 'le droit de choisir ses voisins',
          why: 'Ce droit n’existe pas : on ne choisit pas qui habite à côté.',
        },
      ],
      gap: [
        'En France, chaque enfant a droit à l’',
        ' : il peut aller à l’école.',
        ['éducation', 'education', 'instruction', 'enseignement'],
      ],
      quote: DROITS_FRANCE,
      explain: 'En France, tout individu a des droits, comme celui à l’éducation et celui d’être soigné.',
    },
    {
      avance: true,
      q: 'Quel article de la Convention internationale des droits de l’enfant parle de la nationalité ?',
      a: 'l’article 7',
      wrong: [
        { label: 'l’article 11', why: 'Dans la Convention, l’article sur la nationalité est le 7, pas le 11.' },
        { label: 'l’article 13', why: 'Dans la Convention, l’article sur la nationalité est le 7, pas le 13.' },
        { label: 'l’article 3', why: 'Dans la Convention, l’article sur la nationalité est le 7, pas le 3.' },
      ],
      gap: [
        'Tout enfant a des droits dès sa naissance, dont celui d’acquérir une ',
        '.',
        ['nationalité', 'nationalite'],
      ],
      quote: NATIONALITE,
      explain: 'L’article 7 dit que tout enfant a, dès sa naissance, le droit d’acquérir une nationalité.',
    },
    {
      q: 'Quel est un droit politique ?',
      a: 'le droit de vote',
      wrong: [
        { label: 'le droit d’être soigné', why: 'C’est un droit social, pour tout le monde : il ne sert pas à voter.' },
        {
          label: 'le droit d’aller à l’école',
          why: 'C’est un droit social, pour tous les enfants : il ne sert pas à voter.',
        },
        {
          label: 'le droit de jouer à la récré',
          why: 'Ce n’est pas un droit politique : il ne sert pas à décider de la vie publique.',
        },
      ],
      gap: ['Le droit de vote est un droit ', ' : il permet de participer aux décisions.', ['politique', 'civique']],
      quote: POLITIQUES,
      explain:
        'Les droits politiques, comme voter et être candidat, permettent de participer aux décisions de la vie publique.',
    },
    {
      avance: true,
      q: 'Quel article de la DDHC protège la liberté d’expression ?',
      a: 'l’article 11',
      wrong: [
        { label: 'l’article 13', why: 'L’article 13 parle de l’impôt.' },
        { label: 'l’article 2', why: 'L’article 2 parle de la sûreté.' },
        { label: 'l’article 10', why: 'L’article 10 protège la liberté d’opinion.' },
      ],
      gap: ['La liberté d’expression est l’article ', ' de la DDHC (en chiffres).', ['11', 'onze']],
      quote: DDHC,
      explain:
        'Dans la DDHC, l’article 11 est la liberté d’expression, l’article 10 l’opinion et l’article 2 la sûreté.',
    },
    {
      q: 'Quel est un devoir du citoyen ?',
      a: 'payer l’impôt',
      wrong: [
        {
          label: 'choisir les lois tout seul',
          why: 'Les lois sont élaborées avec les représentants élus, pas par une seule personne.',
        },
        { label: 'ne jamais respecter les autres', why: 'Chacun doit respecter les droits des autres.' },
        { label: 'décider de ce que les autres pensent', why: 'La liberté d’opinion protège chacun.' },
      ],
      gap: [
        'Pour financer les dépenses publiques, chaque citoyen paie l’',
        '.',
        ['impôt', 'impot', 'impôts', 'impots'],
      ],
      quote: DEVOIRS,
      explain:
        'Respecter les lois et contribuer aux dépenses publiques sont des devoirs. L’impôt finance les charges de l’État (article 13 de la DDHC). C’est un devoir du citoyen.',
    },
  ],
  paires3: [
    ['Droit civil', 'Dire ce qu’on pense'],
    ['Droit social', 'Aller à l’école, être soigné'],
    ['Droit politique', 'Voter, être candidat'],
  ],
  paires5: [
    ['Droit civil', 'Dire ce qu’on pense, être en sûreté'],
    ['Droit social', 'Aller à l’école, être soigné'],
    ['Droit politique', 'Voter, être candidat'],
    ['Devoir', 'Respecter les lois'],
    ['Article 13 de la DDHC', 'Impôt pour financer l’État'],
  ],
  libres: [
    {
      q: 'Lina répète que « les garçons ne savent pas cuisiner » sans l’avoir vérifié. Cette idée toute faite est un … (un mot).',
      accepted: [
        'préjugé',
        'prejuge',
        'un préjugé',
        'stéréotype',
        'stereotype',
        'un stéréotype',
        'cliché',
        'cliche',
        'un cliché',
      ],
      traps: [
        { text: 'droit', why: 'Un droit protège ou permet d’agir : ici, c’est une idée sur un groupe.' },
        { text: 'devoir', why: 'Un devoir est une chose à faire : ici, c’est une idée toute faite.' },
      ],
      quote: PREJUGES,
      explain: 'Une idée toute faite sur un groupe est un préjugé, ou un stéréotype. Il faut la combattre.',
    },
    {
      q: 'L’article 2 de la DDHC cite un droit qui protège contre les arrestations injustes : la … (un mot).',
      accepted: ['sûreté', 'surete', 'la sûreté', 'la surete'],
      traps: [
        { text: 'sécurité', why: 'L’idée est proche, mais le mot écrit dans l’article 2 est un autre : « sû… ».' },
        {
          text: 'liberté',
          why: 'L’article 2 cite aussi la liberté, mais le droit contre les arrestations injustes a son propre nom.',
        },
        { text: 'devise', why: 'La devise est une phrase de trois mots, pas un droit de l’article 2.' },
        { text: 'majorité', why: 'La majorité est un âge, pas un droit de l’article 2.' },
      ],
      quote: DDHC,
      explain: 'La sûreté, citée à l’article 2, protège chacun contre une arrestation injuste.',
    },
    {
      q: 'Devenue majeure, une citoyenne peut se présenter à une élection. Ce droit d’être élue s’appelle l’… (un mot).',
      accepted: ['éligibilité', 'eligibilite', 'l’éligibilité', 'l’eligibilite'],
      traps: [
        { text: 'éducation', why: 'L’éducation est un droit d’apprendre, pas le droit d’être élu.' },
        { text: 'élection', why: 'L’élection est le vote lui-même : cherche le nom du droit de s’y présenter.' },
      ],
      quote: POLITIQUES,
      explain: 'Le droit de vote et d’éligibilité sont des droits politiques.',
    },
  ],
  docs: [
    {
      title: 'Au conseil des enfants',
      lines: [
        'La classe de CM2 de Mina parle de ses droits.',
        'Mina dit : « Tout le monde a le droit d’aller à l’école et d’être soigné. »',
        'Hugo ajoute : « Moi, je peux dire ce que je pense, mais pas insulter. »',
        'Leur maître dit : « Chacun doit respecter les droits des autres. »',
      ],
      qs: [
        {
          q: 'Quel droit Mina cite-t-elle ?',
          a: 'le droit à l’éducation et à la santé',
          wrong: [
            { label: 'le droit de vote', why: 'Mina ne parle pas de voter dans le texte.' },
            { label: 'le droit de payer l’impôt', why: 'L’impôt est un devoir, pas un droit.' },
            { label: 'le droit de ne jamais travailler', why: 'Ce droit n’est pas cité dans le texte.' },
          ],
          quote: DROITS_FRANCE,
          explain: 'Mina cite l’école et les soins, deux droits dont bénéficie tout individu en France.',
        },
        {
          q: 'Que veut dire le maître avec sa phrase ?',
          a: 'ma liberté s’arrête là où commencent les droits des autres',
          wrong: [
            { label: 'seuls les adultes ont des droits', why: 'Tout enfant possède des droits dès sa naissance.' },
            { label: 'on peut tout dire, même insulter', why: 'Respecter les droits des autres interdit d’insulter.' },
            { label: 'les droits ne servent à rien', why: 'Les droits protègent chacun, y compris les enfants.' },
          ],
          quote: DROITS_AUTRES,
          explain: 'Chaque citoyen doit respecter les droits des autres, qui sont identiques aux siens.',
        },
      ],
    },
    {
      title: 'Les préjugés de la cour',
      lines: [
        'Dans la cour, Lucas dit : « Les filles ne savent pas jouer au foot. »',
        'Sa camarade Inès marque trois buts.',
        'La maîtresse explique : « C’est un préjugé. Il faut le combattre pour que chacun soit respecté. »',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on l’idée de Lucas sur les filles et le foot ?',
          a: 'un préjugé',
          wrong: [
            {
              label: 'un droit politique',
              why: 'Un droit politique permet de voter. L’idée de Lucas n’est pas un droit.',
            },
            { label: 'une loi', why: 'Une loi est une règle du pays, pas une idée toute faite.' },
            { label: 'une preuve', why: 'Les trois buts d’Inès montrent le contraire de l’idée de Lucas.' },
          ],
          quote: PREJUGES,
          explain: 'Un préjugé est une idée toute faite sur un groupe, sans l’avoir vérifiée.',
        },
        {
          q: 'Que faut-il faire contre les préjugés ?',
          a: 'les combattre pour lutter contre les discriminations',
          wrong: [
            { label: 'les répéter pour qu’ils soient vrais', why: 'Répéter un préjugé ne le rend pas vrai.' },
            {
              label: 'les ignorer et se moquer',
              why: 'Ignorer ne combat rien, et se moquer ne respecte pas les autres.',
            },
            {
              label: 'les écrire dans la loi',
              why: 'Une loi ne doit pas traiter les personnes différemment : elle est la même pour tous.',
            },
          ],
          quote: PREJUGES,
          explain: 'La lutte contre les discriminations suppose la déconstruction des préjugés et des stéréotypes.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : la commune et ses élus ———

const communeElus: Notion = {
  id: 'emcm2-commune-elus',
  title: 'La commune et ses élus',
  hint: 'Pense à ta mairie : qui la dirige ? Qui l’aide ?',
  programme: PROGRAMME,
  sources: [VP_MAIRE],
  credit: CREDIT,
  memo: [
    'Ta **commune** est la ville ou le village où tu vis. Les électeurs élisent les **conseillers municipaux**. Ensuite, le conseil municipal élit le **maire**.',
    'Le maire est un élu local. Il représente aussi l’État dans la commune. Rappel du CE2 : il s’occupe de l’**état civil**, de l’école et de l’environnement.',
    'Les élus ont été **candidats** à une élection. Leur **mandat** dure un temps donné. Les conseillers municipaux juniors s’exercent à ce rôle.',
  ],
  faits: [
    {
      q: 'Qui est le maire ?',
      a: 'un élu local',
      wrong: [
        { label: 'un élève de la classe', why: 'Le maire est un adulte élu, pas un élève.' },
        { label: 'un policier qui vit dans la commune', why: 'Le maire n’est pas policier : c’est un élu.' },
        {
          label: 'le chef des commerçants',
          why: 'Le maire est élu par le conseil municipal, pas par les commerçants.',
        },
      ],
      gap: ['Le maire est un élu ', ' et le représentant de l’État dans la commune.', ['local']],
      quote: MAIRE_ELU,
      explain: 'Le maire est élu pour la commune. Il représente aussi l’État sur ce territoire.',
    },
    {
      q: 'Dans quels domaines le maire a-t-il un rôle ?',
      a: 'l’état civil, l’école et l’environnement',
      wrong: [
        { label: 'l’armée, la monnaie et les prisons', why: 'Ces domaines dépendent de l’État, pas du maire.' },
        {
          label: 'le cinéma, le foot et la météo',
          why: 'Pense à la mairie : le maire ne s’occupe pas du temps qu’il fait.',
        },
        {
          label: 'les lois du pays et les impôts nationaux',
          why: 'Les lois sont votées au Parlement, pas par le maire.',
        },
      ],
      gap: ['Le maire s’occupe de l’état civil, de l’école et de l’', '.', ['environnement']],
      quote: MAIRE_ROLE,
      explain: 'À la tête de la commune, le maire a un rôle pour l’état civil, l’école et l’environnement.',
    },
    {
      q: 'Qui sont les élus locaux que ta classe peut rencontrer ?',
      a: 'le maire et les conseillers municipaux',
      wrong: [
        {
          label: 'le président et les ministres',
          why: 'Ce sont des élus et responsables nationaux, pas des élus de la commune.',
        },
        {
          label: 'les enseignants et la directrice',
          why: 'Ils travaillent à l’école : ils ne sont pas élus de la commune.',
        },
        {
          label: 'les voisins et les commerçants',
          why: 'Ils habitent la commune, mais ils ne sont pas élus pour la diriger.',
        },
      ],
      gap: ['Dans la commune, les élus locaux sont le maire et les conseillers ', '.', ['municipaux']],
      quote: ELUS_LOCAUX,
      explain:
        'Ce sont des élus locaux : les électeurs choisissent les conseillers municipaux, puis le conseil élit le maire.',
    },
    {
      q: 'Que fait une personne avant d’être élue au conseil municipal ?',
      a: 'elle se présente comme candidate à une élection municipale',
      wrong: [
        {
          label: 'elle attend qu’on la nomme sans élection',
          why: 'Les conseillers municipaux sont choisis par un vote, pas nommés sans élection.',
        },
        { label: 'elle achète le poste', why: 'On ne peut pas acheter un poste d’élu.' },
        {
          label: 'elle tire au sort dans la classe',
          why: 'Les électeurs votent pour choisir les conseillers municipaux : ce n’est pas un tirage au sort.',
        },
      ],
      gap: ['Une personne se porte ', ' à une élection municipale pour être élue.', ['candidate', 'candidat']],
      quote: CANDIDATS,
      explain: 'Les élus de la commune se sont portés candidats à une élection municipale.',
    },
    {
      q: 'À quoi servent les conseillers municipaux juniors ?',
      a: 'à comprendre le rôle d’un citoyen qui participe à la vie de sa commune',
      wrong: [
        { label: 'à remplacer le maire', why: 'Les juniors ne remplacent pas les élus : ils découvrent leur rôle.' },
        { label: 'à voter les lois du pays', why: 'Les lois ne sont pas votées par les conseillers juniors.' },
        { label: 'à gagner de l’argent', why: 'Ce n’est pas un métier : c’est une expérience citoyenne.' },
      ],
      gap: [
        'Les conseillers municipaux ',
        ' permettent de comprendre le rôle du citoyen dans sa commune.',
        ['juniors', 'junior', 'jeunes', 'enfants'],
      ],
      quote: JUNIORS,
      explain: 'Cette expérience aide à comprendre que, par son vote, le citoyen participe à la vie de sa cité.',
    },
  ],
  paires3: [
    ['Maire', 'Élu local, représentant de l’État'],
    ['Conseiller municipal', 'Élu qui participe aux décisions de la commune'],
    ['Candidat', 'Personne qui se présente à une élection'],
  ],
  paires5: [
    ['Maire', 'Élu local, représentant de l’État'],
    ['Conseiller municipal', 'Élu qui participe aux décisions de la commune'],
    ['Candidat', 'Personne qui se présente à une élection'],
    ['État civil', 'Naissances, mariages, décès enregistrés à la mairie'],
    ['Mandat', 'Temps pendant lequel un élu exerce son rôle'],
  ],
  libres: [
    {
      q: 'À la mairie, les naissances et les mariages sont enregistrés par le service de l’état … (un mot).',
      accepted: ['civil', 'état civil', 'etat civil'],
      traps: [
        { text: 'major', why: 'L’état-major est une affaire militaire, pas communale.' },
        { text: 'national', why: 'Le service qui note les naissances porte un autre nom.' },
      ],
      quote: MAIRE_ROLE,
      explain: 'L’état civil enregistre les naissances, les mariages et les décès.',
    },
    {
      q: 'Madame Roux est élue pour un temps donné. Cette durée pendant laquelle elle exerce son rôle est son … (un mot).',
      accepted: ['mandat', 'un mandat', 'le mandat'],
      traps: [
        { text: 'vote', why: 'Le vote sert à élire : cherche le nom du temps passé dans le rôle.' },
        { text: 'métier', why: 'Pour un élu, ce temps porte un nom précis.' },
      ],
      quote: CANDIDATS,
      explain: 'Un élu exerce un mandat : un rôle confié par un vote pour un temps donné.',
    },
    {
      q: 'Après les élections municipales, qui élit le maire ? Le … municipal (un mot).',
      accepted: ['conseil', 'le conseil'],
      traps: [
        { text: 'bulletin', why: 'Le bulletin sert à voter : ce n’est pas lui qui élit le maire.' },
        { text: 'préfet', why: 'Le préfet n’élit pas le maire.' },
      ],
      quote: MAIRE_ELU,
      explain:
        'Les électeurs élisent les conseillers municipaux, puis le conseil municipal élit le maire. Le site public Vie publique écrit : « Le maire est élu parmi les conseillers municipaux ».',
    },
  ],
  docs: [
    {
      title: 'La rencontre avec le maire',
      lines: [
        'La classe de Zoé rencontre le maire de la commune.',
        'Il explique qu’il a été candidat à une élection municipale.',
        'Il dit : « Je m’occupe de l’école, de l’état civil et de l’environnement. »',
        'Zoé demande : « Qui vous a choisi comme maire ? »',
        'Il répond : « Les électeurs ont élu le conseil municipal, puis le conseil m’a élu maire. »',
      ],
      qs: [
        {
          q: 'Qui a élu le maire de la commune ?',
          a: 'le conseil municipal',
          wrong: [
            { label: 'le tirage au sort', why: 'Le maire dit que le conseil municipal l’a élu.' },
            {
              label: 'tous les habitants, directement',
              why: 'Les électeurs élisent le conseil municipal ; c’est le conseil qui élit le maire.',
            },
            { label: 'l’école', why: 'L’école ne choisit pas le maire.' },
          ],
          quote: MAIRE_ELU,
          explain:
            'Le maire est élu par le conseil municipal, lui-même élu par les électeurs. Le site public Vie publique écrit : « Le maire est élu parmi les conseillers municipaux ».',
        },
        {
          q: 'Quel domaine le maire cite-t-il dans son rôle ?',
          a: 'l’école',
          wrong: [
            { label: 'l’armée', why: 'Le maire ne parle pas de l’armée.' },
            { label: 'la monnaie', why: 'La monnaie ne dépend pas du maire.' },
            { label: 'la météo', why: 'Le maire ne décide pas du temps qu’il fait.' },
          ],
          quote: MAIRE_ROLE,
          explain: 'Le maire s’occupe de l’école, de l’état civil et de l’environnement.',
        },
      ],
    },
    {
      title: 'Les conseillers juniors',
      lines: [
        'Dans la commune de Karl, des enfants sont conseillers municipaux juniors.',
        'Ils proposent d’installer un composteur près de l’école.',
        'Un composteur est un bac où les restes de fruits et de légumes deviennent de l’engrais.',
        'Le maire écoute leur idée, puis les élus en discutent ensemble.',
      ],
      qs: [
        {
          q: 'Que font les conseillers juniors ?',
          a: 'ils proposent des idées pour la commune',
          wrong: [
            {
              label: 'ils dirigent la commune seuls',
              why: 'Le maire et les élus continuent de décider. Les juniors proposent.',
            },
            { label: 'ils votent les lois du pays', why: 'Les lois ne sont pas votées par les juniors.' },
            { label: 'ils remplacent les enseignants', why: 'Ce n’est pas leur rôle.' },
          ],
          quote: JUNIORS,
          explain: 'L’expérience des conseillers juniors aide à comprendre le rôle d’un citoyen dans sa commune.',
        },
        {
          q: 'Dans quel domaine le composteur aide-t-il la commune ?',
          a: 'l’environnement',
          wrong: [
            { label: 'l’état civil', why: 'L’état civil enregistre naissances et mariages, pas les déchets.' },
            { label: 'la justice', why: 'Un composteur n’a pas de lien avec la justice.' },
            { label: 'l’armée', why: 'Un composteur n’a pas de lien avec l’armée.' },
          ],
          quote: MAIRE_ROLE,
          explain:
            'Les élus de la commune ont des compétences, par exemple l’environnement. Le composteur réduit les déchets : c’est une action pour l’environnement, domaine du maire.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : le vote ———

const leVote: Notion = {
  id: 'emcm2-vote',
  title: 'Le vote',
  hint: 'Pense à ce que permet le vote : choisir les représentants, donc faire entendre sa voix.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Voter est un **droit** et un **devoir civique**. Par leur **vote**, les électeurs choisissent leurs **représentants** et participent aux décisions.',
    'La Constitution (article 3) dit que la **souveraineté** nationale appartient au peuple. Les électeurs sont à l’origine des lois par leurs représentants élus.',
    'Un citoyen **éligible** peut aussi se présenter à une élection. Voter aide la démocratie à bien fonctionner.',
  ],
  faits: [
    {
      q: 'À qui appartient la souveraineté nationale ?',
      a: 'au peuple',
      wrong: [
        { label: 'au maire seul', why: 'La souveraineté nationale appartient au peuple, pas à une seule personne.' },
        { label: 'au plus riche', why: 'La richesse ne donne pas plus de pouvoir : le peuple est souverain.' },
        { label: 'au plus fort', why: 'En République, la loi, pas la force, décide.' },
      ],
      gap: ['La souveraineté nationale appartient au ', '.', ['peuple']],
      quote: SOUVERAINETE,
      explain:
        'La Constitution (art. 3) dit que la souveraineté nationale appartient au peuple. La DDHC (art. 3), elle, la place dans la Nation.',
    },
    {
      q: 'Que signifie la mention « Voter est un droit, c’est aussi un devoir civique » ?',
      a: 'les électeurs ont le droit de voter, et c’est important de le faire pour la démocratie',
      wrong: [
        { label: 'voter est interdit', why: 'Le vote est un droit : personne ne l’interdit aux électeurs.' },
        {
          label: 'voter ne sert à rien',
          why: 'Par leur vote, les citoyens assurent le bon fonctionnement de la démocratie.',
        },
        { label: 'seul le maire peut voter', why: 'Tous les électeurs peuvent voter, pas seulement le maire.' },
      ],
      gap: ['Voter est un droit, c’est aussi un ', ' civique.', ['devoir']],
      quote: DEVOIR_CIVIQUE,
      explain: 'Le vote est un droit des électeurs et un devoir civique : il aide la démocratie à fonctionner.',
    },
    {
      q: 'Qui est à l’origine des lois par l’intermédiaire de ses représentants ?',
      a: 'les électeurs et les électrices',
      wrong: [
        { label: 'les élèves de la classe', why: 'Les élèves ne votent pas les lois du pays.' },
        {
          label: 'les commerçants',
          why: 'Les commerçants sont des citoyens comme les autres : tous les électeurs comptent.',
        },
        { label: 'les voisins du maire', why: 'Ce sont les électeurs de tout le pays, pas les voisins du maire.' },
      ],
      gap: [
        'Les ',
        ' sont à l’origine des lois par leurs représentants élus.',
        ['électeurs', 'electeurs', 'électrices', 'electrices', 'citoyens', 'citoyennes'],
      ],
      quote: ELECTEURS,
      explain:
        'Les électeurs choisissent leurs représentants, qui élaborent les lois. Chacun doit ensuite les respecter.',
    },
    {
      q: 'Que permet le droit de vote ?',
      a: 'participer aux décisions de la vie publique',
      wrong: [
        {
          label: 'être dispensé de respecter les lois',
          why: 'Tout le monde doit respecter les lois, y compris ceux qui votent.',
        },
        { label: 'choisir le temps qu’il fera', why: 'Le vote n’agit pas sur la météo.' },
        {
          label: 'changer les règles de la classe seul',
          why: 'Le vote sert à décider avec les autres, pas tout seul.',
        },
      ],
      gap: ['Le droit de vote permet de participer aux décisions de la vie ', '.', ['publique', 'politique']],
      quote: POLITIQUES,
      explain: 'Le droit de vote et d’éligibilité permettent de participer aux décisions de la vie publique.',
    },
    {
      q: 'Que font les citoyens quand ils votent ?',
      a: 'ils assurent le bon fonctionnement de la démocratie',
      wrong: [
        { label: 'ils arrêtent la démocratie', why: 'Le vote fait vivre la démocratie.' },
        { label: 'ils paient leurs impôts', why: 'L’impôt est un autre devoir du citoyen, pas un vote.' },
        { label: 'ils changent la devise', why: 'Voter ne change pas la devise de la République.' },
      ],
      gap: ['Par leur vote, les citoyens assurent le bon fonctionnement de la ', '.', ['démocratie', 'democratie']],
      quote: BON_FONCTIONNEMENT,
      explain: 'Voter est un devoir civique : cela aide la démocratie à bien fonctionner.',
    },
  ],
  paires3: [
    ['Électeur', 'Personne qui vote'],
    ['Candidat', 'Personne qui se présente à une élection'],
    ['Droit de vote', 'Droit politique de choisir ses représentants'],
  ],
  paires5: [
    ['Électeur', 'Personne qui vote'],
    ['Candidat', 'Personne qui se présente à une élection'],
    ['Droit de vote', 'Droit politique de choisir ses représentants'],
    ['Éligibilité', 'Droit de se présenter à une élection'],
    ['Souveraineté nationale', 'Pouvoir qui appartient au peuple'],
  ],
  libres: [
    {
      q: 'Les citoyens élisent des personnes qui décident en leur nom : ce sont leurs … (un mot).',
      accepted: ['représentants', 'representants', 'représentant', 'representant', 'élus', 'elus'],
      traps: [
        { text: 'voisins', why: 'Les voisins habitent à côté : ils ne sont pas élus pour décider.' },
        { text: 'candidats', why: 'Avant le vote, ils sont candidats ; une fois élus, ils portent un autre nom.' },
        {
          text: 'députés',
          why: 'Les députés sont des représentants, mais il y en a d’autres : cherche le mot général.',
        },
      ],
      quote: ELECTEURS,
      explain: 'Les représentants sont élus pour décider au nom des électeurs.',
    },
    {
      q: 'Nadia remplit les conditions pour se présenter à une élection : on dit qu’elle est … (un mot).',
      accepted: ['éligible', 'eligible'],
      traps: [
        { text: 'élue', why: 'Elle n’est pas encore élue : elle peut seulement se présenter.' },
        { text: 'mineure', why: 'Les droits politiques s’exercent à la majorité.' },
        { text: 'candidate', why: 'Remplir les conditions ne suffit pas : on est candidate quand on se présente.' },
        { text: 'majeure', why: 'La majorité est un âge : cherche le mot qui veut dire « qui peut être élue ».' },
      ],
      quote: POLITIQUES,
      explain: 'Être éligible, c’est avoir le droit de se présenter à une élection.',
    },
    {
      q: 'Trois élèves se présentent à l’élection des délégués : ils sont … (un mot).',
      accepted: ['candidats', 'candidat', 'candidates'],
      traps: [
        { text: 'élus', why: 'Le vote n’a pas encore eu lieu : ils ne sont pas élus.' },
        { text: 'maires', why: 'Un maire dirige une commune, pas une classe.' },
      ],
      quote: DELEGUE,
      explain: 'Comme tu l’as vu en CE2 avec les délégués, une personne qui se présente à une élection est candidate.',
    },
  ],
  docs: [
    {
      title: 'La carte électorale',
      lines: [
        'Chez Clara, sa mère reçoit une carte électorale.',
        'On peut y lire : « Voter est un droit, c’est aussi un devoir civique. »',
        'Clara demande : « Pourquoi voter ? » Sa mère répond : « Pour choisir ceux qui prennent des décisions pour tous. »',
      ],
      qs: [
        {
          q: 'Pourquoi la mère de Clara vote-t-elle ?',
          a: 'pour choisir ceux qui prennent des décisions pour tous',
          wrong: [
            { label: 'pour gagner un prix', why: 'Voter ne rapporte pas de prix.' },
            { label: 'pour éviter de respecter les lois', why: 'Tout le monde doit respecter les lois.' },
            { label: 'pour choisir ses voisins', why: 'On choisit des représentants, pas ses voisins.' },
          ],
          quote: VOTE_ROLE,
          explain: 'Le vote permet de participer à la vie politique et de choisir les représentants.',
        },
        {
          q: 'Que dit la carte à propos du vote ?',
          a: 'c’est un droit et un devoir civique',
          wrong: [
            {
              label: 'c’est seulement une punition',
              why: 'La carte parle de droit et de devoir civique, pas de punition.',
            },
            { label: 'c’est interdit', why: 'La carte parle d’un droit : voter n’est pas interdit.' },
            { label: 'c’est un jeu', why: 'La carte parle d’un devoir civique, pas d’un jeu.' },
          ],
          quote: DEVOIR_CIVIQUE,
          explain: 'La phrase de la carte électorale dit que voter est un droit et un devoir civique.',
        },
      ],
    },
    {
      title: 'Le délégué de classe',
      lines: [
        'La classe de Théo élit son délégué. Trois élèves sont candidats.',
        'Chaque élève vote avec un bulletin. Le résultat est lu à voix haute.',
        'Le délégué élu portera la parole de la classe au conseil des élèves.',
      ],
      qs: [
        {
          q: 'Comment le délégué est-il choisi ?',
          a: 'par un vote',
          wrong: [
            { label: 'par le tirage au sort', why: 'Le texte dit que chaque élève vote avec un bulletin.' },
            { label: 'par la maîtresse seule', why: 'Chaque élève vote : la maîtresse ne choisit pas seule.' },
            { label: 'par le premier arrivé', why: 'Le texte parle d’un vote, pas d’une course.' },
          ],
          quote: DELEGUE,
          explain: 'Rappel du CE2 : le délégué de classe est choisi par une élection, comme d’autres représentants.',
        },
        {
          q: 'Que fait un élève qui se présente à l’élection ?',
          a: 'il est candidat',
          wrong: [
            {
              label: 'il est électeur seulement',
              why: 'Un électeur vote ; ici, l’élève se présente : c’est un candidat.',
            },
            { label: 'il est maire', why: 'Un maire dirige une commune, pas une classe.' },
            { label: 'il est président', why: 'Un président dirige le pays, pas une classe.' },
          ],
          quote: POLITIQUES,
          explain:
            'Se présenter à une élection, c’est être candidat. Pour les élections de la vie publique, le droit de se présenter s’appelle l’éligibilité.',
        },
      ],
    },
  ],
};

export const VIVRE_REPUBLIQUE_SKILLS: readonly Skill[] = [valeursSymboles, droitsDeTous, communeElus, leVote].map(
  notion,
);
