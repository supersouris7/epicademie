import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, « Faire société » (lot em-cm1-01). Chaque fait cite le programme d'EMC du 13 juin 2024
 * (registre `emc-2024`) avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice
 * (personnages inventés). Les symboles de la République ne sont pas au programme de CM1 (CE1 et CM2) :
 * la notion « fraternité et empathie », au programme de CM1, les remplace.
 */

const CIVISME =
  'Définir le civisme comme l’action d’un individu en fonction du bien public et dans le respect des règles';
const NUANCE =
  'exprimer ses opinions personnelles tout en tenant compte de la sensibilité des autres (nuancer son propos, modérer son attitude)';
const DISCRIMINATION =
  'identifier des situations dans lesquelles l’égalité n’est pas respectée et des situations de discrimination ou d’atteintes à la personne d’autrui';
const TOLERANCE = 'tolérance envers autrui et ses idées en dehors de la camaraderie et de l’amitié';

// ——— Notion 1 : règles et lois ———

const reglesLois: Notion = {
  id: 'emcm1-regles-lois',
  title: 'Règles et lois',
  hint: 'Pense à la classe : qui décide, comment, et pour qui la règle est valable ?',
  memo: [
    'Le **civisme**, c’est agir pour le **bien public** en respectant les **règles**. Exemple : ranger la salle avec ta classe.',
    'Dans une **démocratie**, les **citoyens** participent aux décisions grâce au **vote**. À l’école, le conseil d’élèves te fait vivre ça !',
    'Une **loi** est une règle pour tout le pays. Avec l’**égalité devant la loi**, elle est la même pour tous.',
    'La **DDHC** (Déclaration des droits de l’homme et du citoyen) est un texte sur les droits de chacun : en CM1, on en étudie les articles 3, 6 et 16.',
  ],
  faits: [
    {
      q: 'Le civisme, c’est agir en fonction de quoi ?',
      a: 'du bien public',
      wrong: [
        { label: 'de son seul plaisir', why: 'Le civisme pense à tout le monde, pas seulement à soi.' },
        { label: 'de l’avis du plus fort', why: 'Le civisme ne dépend pas du plus fort : il vise le bien de tous.' },
        { label: 'de la mode', why: 'La mode change tout le temps. Le civisme vise le bien public.' },
      ],
      gap: ['Le civisme, c’est agir en fonction du ', ' et dans le respect des règles.', ['bien public']],
      quote: CIVISME,
      explain: 'Être civique, c’est agir pour le bien de tous (le bien public), en respectant les règles.',
    },
    {
      q: 'Tu agis pour le bien public en respectant les règles. De quoi fais-tu preuve ?',
      a: 'de civisme',
      wrong: [
        { label: 'd’égoïsme', why: 'L’égoïsme, c’est ne penser qu’à soi. Ici, tu penses à tous.' },
        { label: 'd’incivilité', why: 'Une incivilité gêne les autres. Ici, tu les aides : c’est le contraire.' },
        { label: 'de timidité', why: 'La timidité n’a rien à voir avec le bien public.' },
      ],
      gap: [
        'Agir pour le bien public en respectant les règles, c’est faire preuve de ',
        '.',
        ['civisme', 'de civisme'],
      ],
      quote: CIVISME,
      explain: 'Agir pour le bien public dans le respect des règles, c’est le civisme.',
    },
    {
      q: 'Dans une démocratie, comment les citoyens participent-ils aux décisions ?',
      a: 'par le vote',
      wrong: [
        {
          label: 'en obéissant sans rien dire',
          why: 'Dans une démocratie, les citoyens ne font pas qu’obéir : ils votent.',
        },
        { label: 'en laissant le plus fort décider', why: 'La loi du plus fort n’est pas une démocratie.' },
        {
          label: 'en tirant une carte au hasard',
          why: 'Le hasard ne décide pas : les citoyens choisissent par le vote.',
        },
      ],
      gap: ['Dans une démocratie, les citoyens participent aux décisions par le ', '.', ['vote', 'le vote']],
      quote:
        'Exposer les principes généraux de la démocratie en France en abordant les notions de citoyenneté, de vote et de participation aux décisions',
      explain: 'La démocratie, c’est la citoyenneté, le vote et la participation aux décisions.',
    },
    {
      q: 'Quel texte étudie-t-on avec ses articles 3, 6 et 16 pour comprendre la démocratie ?',
      a: 'la Déclaration des droits de l’homme et du citoyen',
      wrong: [
        { label: 'le règlement de la cantine', why: 'Le règlement de la cantine ne parle pas de démocratie.' },
        {
          label: 'la Charte de la laïcité',
          why: 'La Charte de la laïcité est un autre texte. Ici, on étudie la Déclaration des droits de l’homme et du citoyen.',
        },
        {
          label: 'la Convention internationale des droits de l’enfant',
          why: 'Ce texte existe, mais ce sont les articles 3, 6 et 16 de la Déclaration des droits de l’homme et du citoyen qui sont étudiés ici.',
        },
      ],
      gap: ['Les articles 3, 6 et 16 viennent de la Déclaration des ', ' et du citoyen.', ['droits de l’homme']],
      quote: 'Expliciter les articles 3, 6 et 16 de la Déclaration des droits de l’homme et du citoyen (DDHC)',
      explain: 'Les articles 3, 6 et 16 de la DDHC servent à comprendre la démocratie.',
    },
    {
      q: 'La loi s’applique de la même façon à tous. Quelle notion décrit cela ?',
      a: 'l’égalité devant la loi',
      wrong: [
        {
          label: 'la séparation des pouvoirs',
          why: 'La séparation des pouvoirs partage le pouvoir entre plusieurs institutions. Ce n’est pas ce que dit la question.',
        },
        {
          label: 'la souveraineté populaire',
          why: 'La souveraineté populaire veut dire que le pouvoir vient du peuple. Ici, on parle d’une loi identique pour tous.',
        },
        {
          label: 'la loi du plus fort',
          why: 'La loi du plus fort, c’est l’inverse : la loi n’est plus la même pour tous.',
        },
      ],
      gap: ['La loi est la même pour tous : c’est l’', ' devant la loi.', ['égalité']],
      quote:
        'les notions de souveraineté populaire, de volonté générale, d’égalité devant la loi et de séparation des pouvoirs',
      explain: 'Une loi qui s’applique de la même façon à tous, c’est l’égalité devant la loi.',
    },
    {
      q: 'Quel exemple de démocratie à l’école le programme cite-t-il ?',
      a: 'les conseils d’élèves',
      wrong: [
        {
          label: 'la sonnerie de la récréation',
          why: 'La sonnerie ne se vote pas : ce n’est pas un exemple de démocratie.',
        },
        {
          label: 'le menu de la cantine',
          why: 'Le menu n’est pas choisi par un vote en classe : ce n’est pas l’exemple du programme.',
        },
        { label: 'le cahier de textes', why: 'Le cahier de textes sert à noter les devoirs, pas à décider ensemble.' },
      ],
      gap: ['À l’école, la démocratie se vit dans les conseils d’', ' et les conseils de classe.', ['élèves']],
      quote: 'articuler une réflexion sur la démocratie scolaire (conseils d’élèves, conseils de classe, etc.)',
      explain: 'Le programme cite les conseils d’élèves et les conseils de classe comme démocratie scolaire.',
    },
  ],
  paires3: [
    ['civisme', 'agir pour le bien public'],
    ['vote', 'choisir ou décider avec les autres citoyens'],
    ['loi', 'règle commune pour tout le pays'],
  ],
  paires5: [
    ['civisme', 'agir pour le bien public en respectant les règles'],
    ['vote', 'participer à une décision avec les autres citoyens'],
    ['conseil d’élèves', 'exemple de démocratie à l’école'],
    ['égalité devant la loi', 'la loi est la même pour tous'],
    ['DDHC', 'texte dont on étudie les articles 3, 6 et 16'],
  ],
  libres: [
    {
      q: 'quel mot désigne l’action d’un individu en fonction du bien public et dans le respect des règles ?',
      accepted: ['civisme', 'le civisme'],
      traps: [
        { text: 'incivilité', why: 'Une incivilité nuit à la vie en commun : c’est le contraire du civisme.' },
        { text: 'égoïsme', why: 'L’égoïsme, c’est ne penser qu’à soi. Le civisme pense au bien public.' },
      ],
      quote: CIVISME,
      explain: 'L’action d’un individu pour le bien public, dans le respect des règles, s’appelle le civisme.',
    },
    {
      q: 'dans une démocratie, comment appelle-t-on le fait de choisir ou de décider avec les autres citoyens ? (un mot)',
      accepted: ['vote', 'le vote', 'voter', 'élection', 'une élection', 'élire', 'suffrage'],
      traps: [
        { text: 'sondage', why: 'Un sondage demande un avis mais ne décide rien. Le vote, lui, décide.' },
        { text: 'tirage au sort', why: 'Le tirage au sort laisse le hasard décider. Dans notre démocratie, on vote.' },
      ],
      quote:
        'Exposer les principes généraux de la démocratie en France en abordant les notions de citoyenneté, de vote et de participation aux décisions',
      explain: 'Les citoyens participent aux décisions grâce au vote.',
    },
    {
      q: 'quel sigle désigne la Déclaration des droits de l’homme et du citoyen ?',
      accepted: ['DDHC'],
      traps: [
        { text: 'DDH', why: 'Il manque le « C » de « citoyen » : DDHC.' },
        { text: 'CIDE', why: 'CIDE désigne la Convention internationale des droits de l’enfant, un autre texte.' },
      ],
      quote: 'Expliciter les articles 3, 6 et 16 de la Déclaration des droits de l’homme et du citoyen (DDHC)',
      explain: 'Le programme écrit « DDHC » pour la Déclaration des droits de l’homme et du citoyen.',
    },
  ],
  docs: [
    {
      title: 'Le conseil d’élèves de Mila',
      lines: [
        'Mila est déléguée de classe. Ce matin, le conseil d’élèves se réunit.',
        'Il faut décider comment ranger la salle après la peinture.',
        'Chaque élève donne son idée, puis la classe vote à main levée.',
        'Tout le monde respecte le résultat, même ceux qui voulaient autre chose.',
      ],
      qs: [
        {
          q: 'Comment la classe prend-elle sa décision ?',
          a: 'par un vote',
          wrong: [
            {
              label: 'Mila décide seule',
              why: 'Le texte dit que chaque élève donne son idée, puis que la classe vote.',
            },
            { label: 'le plus rapide gagne', why: 'Dans le texte, personne ne gagne en allant vite : la classe vote.' },
            { label: 'on tire au sort', why: 'Le texte ne parle pas de hasard : la classe vote à main levée.' },
          ],
          quote:
            'Exposer les principes généraux de la démocratie en France en abordant les notions de citoyenneté, de vote et de participation aux décisions',
          explain: 'Chacun donne son idée, puis la classe vote : c’est la démocratie à l’école.',
        },
        {
          q: 'Quel geste de civisme voit-on à la fin du texte ?',
          a: 'respecter le résultat du vote',
          wrong: [
            {
              label: 'bouder quand on perd',
              why: 'Bouder n’est pas du civisme : le texte dit que tout le monde respecte le résultat.',
            },
            {
              label: 'refaire le vote jusqu’à gagner',
              why: 'Refaire le vote sans fin ne respecte pas la règle commune.',
            },
            { label: 'quitter la salle', why: 'Quitter la salle ne respecte pas la décision de la classe.' },
          ],
          quote: CIVISME,
          explain: 'Respecter le résultat du vote, c’est agir pour le bien public dans le respect des règles.',
        },
      ],
    },
    {
      title: 'La règle du couloir',
      lines: [
        'Dans l’école de Noé, une règle dit : « On marche dans les couloirs. »',
        'Cette règle est la même pour tous : élèves, maîtres et visiteurs.',
        'Un jour, un grand de CM2 court quand même. Un adulte lui rappelle la règle, comme à n’importe qui.',
      ],
      qs: [
        {
          q: 'Cette règle vaut pour tout le monde. Quelle idée vue avec les lois cela rappelle-t-il ?',
          a: 'l’égalité devant la loi',
          wrong: [
            {
              label: 'la séparation des pouvoirs',
              why: 'La séparation des pouvoirs est une autre notion : ici, la règle est simplement la même pour tous.',
            },
            {
              label: 'la souveraineté populaire',
              why: 'La souveraineté populaire parle du pouvoir du peuple, pas d’une règle identique pour tous.',
            },
            {
              label: 'la loi du plus fort',
              why: 'Ici, même le plus grand doit obéir : ce n’est pas la loi du plus fort.',
            },
          ],
          quote:
            'les notions de souveraineté populaire, de volonté générale, d’égalité devant la loi et de séparation des pouvoirs',
          explain: 'Une règle identique pour tous, c’est l’idée de l’égalité devant la loi.',
        },
        {
          q: 'Pourquoi l’adulte rappelle-t-il la règle au grand de CM2 ?',
          a: 'parce que la règle s’applique à tous',
          wrong: [
            {
              label: 'parce qu’il est le plus grand',
              why: 'La taille ne compte pas : la règle est la même pour tous.',
            },
            { label: 'parce que les CM2 n’ont pas de règles', why: 'Les CM2 ont les mêmes règles que les autres.' },
            {
              label: 'pour le punir sans raison',
              why: 'Il y a une raison : la règle des couloirs, valable pour tous.',
            },
          ],
          quote: CIVISME,
          explain: 'Respecter les règles fait partie du civisme, et elles valent pour tout le monde.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : respect d'autrui ———

const respectAutrui: Notion = {
  id: 'emcm1-respect-autrui',
  title: 'Respect d’autrui',
  hint: 'Demande-toi : est-ce que ce geste gêne les autres ou montre du respect ?',
  memo: [
    'Une **incivilité**, c’est un geste impoli qui gêne les autres : doubler dans la file, jeter un papier par terre.',
    'La **politesse** (les règles de **civilité**) montre du respect : dire bonjour, merci, s’il te plaît. Elle fait partie du civisme.',
    'Respecter autrui, c’est respecter sa **diversité** (chacun est différent) et son **intégrité** : personne n’a le droit de lui faire du mal.',
  ],
  faits: [
    {
      q: 'Doubler dans une file, jeter un papier par terre : comment appelle-t-on ces gestes ?',
      a: 'des incivilités',
      wrong: [
        { label: 'des élections', why: 'Une élection est un vote. Ces gestes gênent simplement les autres.' },
        { label: 'des fêtes', why: 'Ces gestes ne font pas la fête : ils gênent les autres.' },
        {
          label: 'des lois',
          why: 'Une loi est une règle. Ces gestes sont ceux qui ne respectent pas les règles de civilité.',
        },
      ],
      gap: ['Doubler dans une file est une ', ' : un geste qui gêne les autres.', ['incivilité']],
      quote: 'identifier les incivilités et comprendre pourquoi elles nuisent à la vie en commun',
      explain: 'Ces gestes qui gênent les autres sont des incivilités.',
    },
    {
      q: 'Pourquoi les incivilités posent-elles problème ?',
      a: 'elles nuisent à la vie en commun',
      wrong: [
        {
          label: 'elles font gagner du temps à tous',
          why: 'Elles font gagner du temps à un seul, et gênent tous les autres.',
        },
        {
          label: 'elles n’ont aucune conséquence',
          why: 'Au contraire : elles gênent les autres et nuisent à la collectivité.',
        },
        { label: 'elles sont interdites seulement le lundi', why: 'Une règle de civilité vaut tous les jours.' },
      ],
      gap: ['Les incivilités ', ' à la collectivité.', ['nuisent']],
      quote: 'Montrer en s’appuyant sur des exemples pourquoi les incivilités nuisent à la collectivité',
      explain: 'Les incivilités nuisent à la collectivité : elles rendent la vie en commun plus difficile.',
    },
    {
      q: 'La politesse fait partie de quoi, d’après le programme ?',
      a: 'du civisme',
      wrong: [
        { label: 'de la mode', why: 'La politesse ne dépend pas de la mode : elle montre du respect aux autres.' },
        { label: 'de la loi du plus fort', why: 'La politesse respecte tout le monde, même les plus faibles.' },
        { label: 'des jeux de récréation', why: 'La politesse vaut partout, pas seulement dans un jeu.' },
      ],
      gap: ['La politesse fait partie du ', '.', ['civisme']],
      quote:
        'Montrer comment la politesse fait partie du civisme par la connaissance volontaire des règles et le respect des autres qu’elle implique',
      explain: 'La politesse fait partie du civisme : elle montre qu’on respecte les règles et les autres.',
    },
    {
      q: 'Dire bonjour, merci, s’il te plaît : quelles règles respectes-tu ainsi ?',
      a: 'les règles de civilité',
      wrong: [
        {
          label: 'les règles d’un jeu vidéo',
          why: 'Un jeu vidéo a ses règles, mais elles ne servent pas à vivre ensemble en société.',
        },
        {
          label: 'les règles de calcul',
          why: 'Les règles de calcul servent en maths, pas à bien vivre avec les autres.',
        },
        { label: 'les règles d’un sport', why: 'Un sport a ses règles, mais dire bonjour concerne la vie en société.' },
      ],
      gap: ['Dire bonjour et merci, c’est respecter les règles de ', ' en société.', ['civilité']],
      quote: 'connaître et appliquer les règles de civilité en société',
      explain: 'Les règles de civilité sont les règles de politesse pour bien vivre en société.',
    },
    {
      q: 'Dans un groupe, on respecte les autres dans leur…',
      a: 'diversité',
      wrong: [
        { label: 'ressemblance parfaite', why: 'On n’est pas tous pareils : on respecte les différences.' },
        {
          label: 'richesse',
          why: 'On ne respecte pas quelqu’un pour son argent : on respecte ses différences (croyances, convictions…).',
        },
        { label: 'popularité', why: 'On respecte chacun, populaire ou pas.' },
      ],
      gap: ['Dans un groupe, on respecte les autres dans leur ', ' (croyances, convictions…).', ['diversité']],
      quote:
        'développer chez l’élève le respect de son intégrité personnelle et de celle des autres, dans leur diversité (croyances, convictions, etc.)',
      explain: 'On respecte l’intégrité des autres dans leur diversité : chacun a ses croyances et ses convictions.',
    },
    {
      q: 'Respecter autrui, c’est respecter ses choix. Et toi, que dois-tu pouvoir faire de tes choix ?',
      a: 'les assumer',
      wrong: [
        { label: 'les imposer aux autres', why: 'Imposer ses choix ne respecte pas ceux des autres.' },
        { label: 'les cacher', why: 'Assumer, c’est au contraire reconnaître ses choix.' },
        { label: 'les changer à chaque minute', why: 'Assumer un choix, c’est le tenir et en répondre.' },
      ],
      gap: ['Chacun doit pouvoir ', ' ses choix et respecter ceux des autres.', ['assumer']],
      quote: 'permettant à chacun d’assumer ses choix et de respecter ceux des autres',
      explain: 'Le programme veut que chacun assume ses choix et respecte ceux des autres.',
    },
  ],
  paires3: [
    ['incivilité', 'geste qui nuit à la vie en commun'],
    ['politesse', 'règles qui montrent du respect aux autres'],
    ['civisme', 'agir pour le bien public en respectant les règles'],
  ],
  paires5: [
    ['incivilité', 'geste qui nuit à la vie en commun'],
    ['politesse', 'règles qui montrent du respect aux autres'],
    ['civisme', 'agir pour le bien public en respectant les règles'],
    ['diversité', 'les différences : croyances, convictions…'],
    ['intégrité', 'ne subir aucun mal, dans son corps comme dans son esprit'],
  ],
  libres: [
    {
      q: 'quel mot désigne un geste impoli qui gêne les autres et nuit à la vie en commun ?',
      accepted: ['incivilité', 'une incivilité', 'incivilités', 'des incivilités', 'impolitesse', 'une impolitesse'],
      traps: [
        { text: 'civisme', why: 'Le civisme, c’est le contraire : agir pour le bien public.' },
        { text: 'politesse', why: 'La politesse respecte les autres. Ici, le geste les gêne.' },
      ],
      quote: 'identifier les incivilités et comprendre pourquoi elles nuisent à la vie en commun',
      explain: 'Un geste impoli qui nuit à la vie en commun est une incivilité.',
    },
    {
      q: 'quel mot désigne les règles qui montrent du respect aux autres, comme dire merci ? (un mot)',
      accepted: ['politesse', 'la politesse', 'civilité', 'la civilité'],
      traps: [
        { text: 'violence', why: 'La violence est le contraire du respect.' },
        { text: 'incivilité', why: 'Une incivilité gêne les autres. Ici, on cherche ce qui les respecte.' },
      ],
      quote:
        'Montrer comment la politesse fait partie du civisme par la connaissance volontaire des règles et le respect des autres qu’elle implique',
      explain: 'La politesse (ou civilité) rassemble les règles qui montrent du respect aux autres.',
    },
    {
      q: 'dans un groupe, on respecte chacun dans sa… (un mot : le fait de ne pas être tous pareils)',
      accepted: ['diversité', 'la diversité'],
      traps: [
        { text: 'ressemblance', why: 'La ressemblance, c’est être pareils. On cherche le contraire : la diversité.' },
        { text: 'égalité', why: 'L’égalité est une autre notion : ici, on parle des différences entre les personnes.' },
      ],
      quote:
        'développer chez l’élève le respect de son intégrité personnelle et de celle des autres, dans leur diversité (croyances, convictions, etc.)',
      explain: 'On respecte les autres dans leur diversité : croyances, convictions…',
    },
  ],
  docs: [
    {
      title: 'La file de la cantine',
      lines: [
        'À la cantine, Lina arrive en retard. Elle se glisse devant Hugo dans la file, sans rien dire.',
        'Hugo soupire. Un autre élève jette son emballage par terre.',
        'La surveillante rappelle : « Chacun attend son tour et laisse l’endroit propre. »',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on le geste de Lina et celui de l’élève qui jette son emballage ?',
          a: 'des incivilités',
          wrong: [
            { label: 'des actes de civisme', why: 'Ces gestes ne servent pas le bien public : ils gênent les autres.' },
            { label: 'des votes', why: 'Personne ne vote dans ce texte.' },
            { label: 'des conseils', why: 'Ce ne sont pas des conseils, mais des gestes qui gênent.' },
          ],
          quote: 'identifier les incivilités et comprendre pourquoi elles nuisent à la vie en commun',
          explain: 'Doubler dans la file et jeter un emballage gênent les autres : ce sont des incivilités.',
        },
        {
          q: 'Pourquoi la surveillante rappelle-t-elle la règle ?',
          a: 'parce que ces gestes nuisent à la vie en commun',
          wrong: [
            { label: 'parce que la cantine est chère', why: 'Le prix n’est pas le sujet du texte.' },
            { label: 'pour faire gagner le plus rapide', why: 'Au contraire : chacun doit attendre son tour.' },
            { label: 'parce que Hugo l’a demandé', why: 'Le texte dit que Hugo soupire, pas qu’il demande.' },
          ],
          quote: 'Montrer en s’appuyant sur des exemples pourquoi les incivilités nuisent à la collectivité',
          explain: 'Les incivilités nuisent à la collectivité : c’est pour cela qu’on rappelle la règle.',
        },
      ],
    },
    {
      title: 'Une idée différente',
      lines: [
        'En classe, on prépare une fête. Nora propose un jeu. Sam préfère un goûter.',
        'Sam dit : « Ton idée est nulle ! » Nora baisse la tête.',
        'La maîtresse l’invite à dire : « Je préfère le goûter, et toi, pourquoi ce jeu ? »',
      ],
      qs: [
        {
          q: 'Que montre la phrase proposée par la maîtresse ?',
          a: 'une façon polie de donner son avis',
          wrong: [
            { label: 'une façon de se moquer', why: 'La phrase de la maîtresse ne se moque de personne.' },
            { label: 'une façon d’éviter de choisir', why: 'Sam dit bien ce qu’il préfère : le goûter.' },
            {
              label: 'une façon d’imposer son choix',
              why: 'Elle dit « je préfère » et demande l’avis de Nora : ce n’est pas imposer.',
            },
          ],
          quote: NUANCE,
          explain: 'La maîtresse montre comment donner son avis en tenant compte de la sensibilité de l’autre.',
        },
        {
          q: 'Qu’est-ce qui n’est pas respectueux dans la réaction de Sam ?',
          a: 'il juge l’idée de Nora de façon blessante',
          wrong: [
            { label: 'il a donné son avis', why: 'Donner son avis est permis. C’est la façon de le dire qui blesse.' },
            {
              label: 'il a parlé en classe',
              why: 'Parler en classe est normal. C’est ce qu’il dit qui pose problème.',
            },
            {
              label: 'il a proposé un goûter',
              why: 'Proposer un goûter est une bonne idée. C’est « ton idée est nulle ! » qui blesse.',
            },
          ],
          quote: NUANCE,
          explain: 'On peut donner son opinion, mais en tenant compte de la sensibilité des autres.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : égalité dans la dignité ———

const egaliteDignite: Notion = {
  id: 'emcm1-egalite-dignite',
  title: 'Égalité dans la dignité',
  hint: 'Demande-toi : tout le monde est-il traité avec les mêmes droits et le même respect ?',
  memo: [
    'L’**égalité en droit**, c’est avoir les mêmes droits que les autres.',
    'La **dignité**, c’est la valeur de chaque personne humaine : personne ne doit être rabaissé.',
    'Traiter moins bien quelqu’un à cause de ce qu’il est, c’est une **discrimination**. Pour l’éviter, on pratique la **tolérance** : accepter autrui et ses idées.',
  ],
  faits: [
    {
      q: 'Tous les enfants ont les mêmes droits : c’est l’égalité en…',
      a: 'droit',
      wrong: [
        {
          label: 'taille',
          why: 'La taille peut changer d’un enfant à l’autre. Ce sont les droits qui sont les mêmes.',
        },
        { label: 'âge', why: 'On n’a pas tous le même âge. L’égalité dont on parle porte sur les droits.' },
        { label: 'notes', why: 'Les notes peuvent être différentes. L’égalité en droit, c’est autre chose.' },
      ],
      gap: ['L’égalité en ', ' : tous ont les mêmes droits.', ['droit', 'droits']],
      quote: 'Comprendre la notion d’égalité en droit',
      explain: 'L’égalité en droit veut dire que chacun a les mêmes droits.',
    },
    {
      q: 'Le principe de dignité concerne qui ?',
      a: 'la personne humaine',
      wrong: [
        { label: 'seulement les adultes', why: 'La dignité concerne toute personne humaine, enfants compris.' },
        { label: 'seulement les élèves de CM1', why: 'Elle concerne toutes les personnes, pas seulement une classe.' },
        {
          label: 'seulement les gens qu’on aime bien',
          why: 'La dignité ne dépend pas de ce qu’on pense de quelqu’un.',
        },
      ],
      gap: ['Le principe de dignité de la personne ', '.', ['humaine']],
      quote: 'comprendre ce qu’implique le principe de dignité de la personne humaine',
      explain: 'Le principe de dignité concerne toute personne humaine.',
    },
    {
      q: 'Traiter moins bien quelqu’un à cause de ce qu’il est, c’est faire…',
      a: 'une discrimination',
      wrong: [
        {
          label: 'une récompense',
          why: 'Une récompense est un cadeau pour une réussite. Traiter moins bien, ce n’est pas récompenser.',
        },
        { label: 'une élection', why: 'Une élection est un vote : ce n’est pas du tout cela.' },
        { label: 'une coopération', why: 'Coopérer, c’est travailler ensemble. Ici, quelqu’un est mis à l’écart.' },
      ],
      gap: ['Traiter moins bien quelqu’un à cause de ce qu’il est, c’est une ', '.', ['discrimination']],
      quote: DISCRIMINATION,
      explain: 'Quand l’égalité n’est pas respectée, on peut être face à une discrimination.',
    },
    {
      q: 'Si l’égalité n’est pas respectée dans une situation, que sais-tu faire d’après le programme ?',
      a: 'l’identifier',
      wrong: [
        { label: 'l’ignorer', why: 'Ignorer ne règle rien : le programme demande de repérer ces situations.' },
        { label: 'la copier', why: 'Copier une situation injuste, c’est la répéter.' },
        { label: 'la cacher', why: 'Cacher ne règle rien : on commence par la repérer.' },
      ],
      gap: ['Face à un manque d’égalité, je sais l’', '.', ['identifier']],
      quote: DISCRIMINATION,
      explain: 'Le programme demande d’identifier les situations où l’égalité n’est pas respectée.',
    },
    {
      q: 'Quel mot désigne le fait d’accepter autrui et ses idées, même ceux qui ne sont pas tes amis ?',
      a: 'la tolérance',
      wrong: [
        {
          label: 'l’indifférence',
          why: 'Être indifférent, c’est ne pas s’intéresser. La tolérance accepte activement l’autre.',
        },
        { label: 'la rivalité', why: 'La rivalité, c’est la compétition : le contraire de l’acceptation.' },
        { label: 'la moquerie', why: 'Se moquer, c’est rabaisser l’autre. La tolérance l’accepte.' },
      ],
      gap: ['La ', ' envers autrui et ses idées.', ['tolérance']],
      quote: TOLERANCE,
      explain: 'La tolérance envers autrui et ses idées vaut aussi pour ceux qui ne sont pas nos amis.',
    },
  ],
  paires3: [
    ['égalité en droit', 'les mêmes droits pour tous'],
    ['dignité', 'la valeur de chaque personne humaine'],
    ['discrimination', 'traiter moins bien quelqu’un à cause de ce qu’il est'],
  ],
  paires5: [
    ['égalité en droit', 'les mêmes droits pour tous'],
    ['dignité', 'la valeur de chaque personne humaine'],
    ['discrimination', 'traiter moins bien quelqu’un à cause de ce qu’il est'],
    ['tolérance', 'accepter autrui et ses idées'],
    ['atteinte à la personne', 'un acte qui blesse ou rabaisse quelqu’un'],
  ],
  libres: [
    {
      q: 'comment appelle-t-on le fait de traiter moins bien quelqu’un à cause de ce qu’il est ?',
      accepted: ['discrimination', 'une discrimination', 'la discrimination'],
      traps: [
        { text: 'tolérance', why: 'La tolérance accepte les autres. C’est le contraire.' },
        { text: 'égalité', why: 'L’égalité traite tout le monde pareil. Ici, c’est l’inverse.' },
      ],
      quote: DISCRIMINATION,
      explain: 'Traiter moins bien quelqu’un à cause de ce qu’il est, c’est une discrimination.',
    },
    {
      q: 'quel mot désigne le fait d’accepter autrui et ses idées, même si on n’est pas d’accord ?',
      accepted: ['tolérance', 'la tolérance'],
      traps: [
        { text: 'indifférence', why: 'L’indifférence ignore l’autre. La tolérance l’accepte.' },
        { text: 'discrimination', why: 'La discrimination rejette l’autre. C’est le contraire de la tolérance.' },
      ],
      quote: TOLERANCE,
      explain: 'Accepter autrui et ses idées, c’est la tolérance.',
    },
    {
      q: 'tous les enfants ont les mêmes droits : c’est l’égalité en… (un mot)',
      accepted: ['droit', 'droits'],
      traps: [
        { text: 'taille', why: 'On n’a pas tous la même taille. Ce sont les droits qui sont les mêmes.' },
        {
          text: 'dignité',
          why: 'La dignité est une autre notion : la valeur de chaque personne. Ici, on parle des droits.',
        },
      ],
      quote: 'Comprendre la notion d’égalité en droit',
      explain: 'L’égalité en droit, c’est avoir les mêmes droits.',
    },
  ],
  docs: [
    {
      title: 'À la récré',
      lines: [
        'Sur le terrain, un groupe refuse que Tom joue au ballon : il est arrivé en cours d’année et il a un accent.',
        'Tom reste seul. Plus tard, Inès dit : « Tout le monde a le droit de jouer. Viens ! »',
        'Le groupe comprend alors que l’égalité n’était pas respectée.',
      ],
      qs: [
        {
          q: 'Que montre le refus fait à Tom ?',
          a: 'une situation de discrimination',
          wrong: [
            {
              label: 'un jeu avec des règles',
              why: 'Dans le texte, Tom est écarté du jeu : ce n’est pas une règle de jeu.',
            },
            { label: 'un vote de classe', why: 'Personne ne vote : un groupe écarte simplement Tom.' },
            {
              label: 'une marque de politesse',
              why: 'Refuser Tom, ce n’est pas poli : on le met de côté à cause de ce qu’il est.',
            },
          ],
          quote: DISCRIMINATION,
          explain: 'Tom est écarté à cause de ce qu’il est : c’est une situation de discrimination.',
        },
        {
          q: 'Quelle idée Inès défend-elle ?',
          a: 'l’égalité en droit',
          wrong: [
            { label: 'la loi du plus fort', why: 'Inès dit le contraire : tout le monde a le droit de jouer.' },
            { label: 'l’indifférence', why: 'Inès agit : elle invite Tom, elle n’est pas indifférente.' },
            { label: 'la compétition', why: 'Inès ne parle pas de gagner : elle parle du droit de jouer pour tous.' },
          ],
          quote: 'Comprendre la notion d’égalité en droit',
          explain: 'Quand Inès dit que tout le monde a le droit de jouer, elle défend l’égalité en droit.',
        },
      ],
    },
    {
      title: 'Les idées de chacun',
      lines: [
        'En classe, Léo n’est pas d’accord avec Chloé sur un projet. Ils ne sont pas amis.',
        'Pourtant Léo l’écoute jusqu’au bout et ne se moque pas de ses idées.',
        'Il dit : « Je ne pense pas comme toi, mais ton avis compte. »',
      ],
      qs: [
        {
          q: 'Léo et Chloé ne sont pas amis. Que montre Léo ?',
          a: 'de la tolérance envers autrui et ses idées',
          wrong: [
            { label: 'de l’indifférence', why: 'Léo écoute Chloé : il n’est pas indifférent.' },
            { label: 'de la rivalité', why: 'Léo ne cherche pas à gagner contre Chloé : il l’écoute.' },
            { label: 'de la discrimination', why: 'Léo ne rabaisse pas Chloé : c’est le contraire.' },
          ],
          quote: TOLERANCE,
          explain: 'Léo accepte les idées de Chloé même s’ils ne sont pas amis : c’est de la tolérance.',
        },
        {
          q: 'Pourquoi la phrase « ton avis compte » respecte-t-elle la dignité de Chloé ?',
          a: 'elle montre que Chloé compte comme personne',
          wrong: [
            {
              label: 'elle prouve que Léo a raison',
              why: 'La phrase ne dit pas qui a raison : elle dit que l’avis de Chloé compte.',
            },
            { label: 'elle met fin à la discussion', why: 'Elle invite au contraire à continuer d’échanger.' },
            { label: 'elle donne un ordre à Chloé', why: 'Ce n’est pas un ordre : c’est un signe de respect.' },
          ],
          quote: 'comprendre ce qu’implique le principe de dignité de la personne humaine',
          explain: 'Respecter la dignité, c’est traiter l’autre comme une personne dont l’avis compte.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : fraternité et empathie ———

const fraternite: Notion = {
  id: 'emcm1-fraternite-empathie',
  title: 'Fraternité et empathie',
  hint: 'Pense à ce que ressent l’autre, et à ce que tu peux faire pour lui.',
  memo: [
    'La **fraternité** est une valeur de la République : on se soucie des autres comme d’une grande famille.',
    'L’**empathie**, c’est se mettre à la place de l’autre pour comprendre ce qu’il ressent. Elle aide à lutter contre la violence et le harcèlement.',
    'L’**égoïsme**, c’est ne penser qu’à soi ; l’**altruisme**, c’est penser aussi aux autres. En débat, nuance ton propos !',
  ],
  faits: [
    {
      q: 'La fraternité est une valeur et un principe de quoi ?',
      a: 'de la République',
      wrong: [
        { label: 'd’un club sportif', why: 'La fraternité concerne toute la République, pas seulement un club.' },
        {
          label: 'd’une entreprise',
          why: 'Ce n’est pas une entreprise : la fraternité est une valeur de la République.',
        },
        { label: 'd’un jeu vidéo', why: 'Ce n’est pas un jeu : c’est une valeur de la République.' },
      ],
      gap: ['La fraternité est une valeur et un principe de la ', '.', ['République']],
      quote: 'Comprendre la notion de fraternité, valeur et principe de la République',
      explain: 'La fraternité est une valeur et un principe de la République.',
    },
    {
      q: 'Le programme fait de l’empathie un moteur pour lutter contre quoi ?',
      a: 'la violence et le harcèlement',
      wrong: [
        { label: 'les devoirs et les leçons', why: 'L’empathie n’a rien à voir avec les devoirs.' },
        { label: 'la timidité et la fatigue', why: 'L’empathie n’est pas un remède contre la timidité ou la fatigue.' },
        {
          label: 'les règles et les lois',
          why: 'L’empathie ne lutte pas contre les règles : elle aide à lutter contre la violence.',
        },
      ],
      gap: ['L’empathie aide à lutter contre la violence et le ', '.', ['harcèlement', 'harcelement']],
      quote:
        'développer l’empathie comme moteur pour lutter contre les discriminations, la violence physique ou verbale, le harcèlement, les cyberviolences',
      explain:
        'L’empathie est un moteur contre les discriminations, la violence, le harcèlement et les cyberviolences.',
    },
    {
      q: 'En débat, que fais-tu pour exprimer ton opinion en tenant compte des autres ?',
      a: 'je nuance mon propos',
      wrong: [
        { label: 'je crie plus fort', why: 'Crier ne tient pas compte de la sensibilité des autres.' },
        { label: 'je coupe la parole', why: 'Couper la parole, c’est ne pas respecter l’autre.' },
        { label: 'je me tais toujours', why: 'Tu peux donner ton opinion : le but est de le faire avec nuance.' },
      ],
      gap: ['En débat, je nuance mon ', ' et je modère mon attitude.', ['propos']],
      quote: NUANCE,
      explain: 'On exprime son opinion en nuançant son propos et en modérant son attitude.',
    },
    {
      q: 'Comment appelle-t-on le fait de se soucier des autres, à l’opposé de l’égoïsme ?',
      a: 'l’altruisme',
      wrong: [
        { label: 'l’égoïsme', why: 'L’égoïsme, c’est ne penser qu’à soi : c’est le contraire.' },
        { label: 'la rivalité', why: 'La rivalité, c’est la compétition, pas le souci des autres.' },
        { label: 'la timidité', why: 'La timidité n’a rien à voir avec le souci des autres.' },
      ],
      gap: ['Se soucier des autres, c’est l’', '.', ['altruisme']],
      quote: 'amener les élèves à définir égoïsme et altruisme',
      explain: 'L’égoïsme, c’est ne penser qu’à soi ; l’altruisme, c’est se soucier des autres.',
    },
    {
      q: 'Entre élèves, à qui doit-on de la tolérance ?',
      a: 'à tous les élèves, amis ou non',
      wrong: [
        {
          label: 'seulement à ses amis',
          why: 'Le programme dit « en dehors de la camaraderie et de l’amitié » : la tolérance vaut pour tous.',
        },
        {
          label: 'seulement à ceux qui pensent comme nous',
          why: 'Être tolérant, c’est accepter aussi ceux qui pensent autrement.',
        },
        { label: 'seulement aux plus grands', why: 'La tolérance vaut pour tous les élèves, quel que soit leur âge.' },
      ],
      gap: ['La tolérance vaut pour tous les élèves, même en dehors de l’', '.', ['amitié', 'amitie']],
      quote: TOLERANCE,
      explain: 'Entre élèves, la tolérance vaut pour tous, pas seulement pour les amis.',
    },
  ],
  paires3: [
    ['fraternité', 'valeur et principe de la République'],
    ['empathie', 'se mettre à la place de l’autre'],
    ['égoïsme', 'ne penser qu’à soi'],
  ],
  paires5: [
    ['fraternité', 'valeur et principe de la République'],
    ['empathie', 'se mettre à la place de l’autre'],
    ['égoïsme', 'ne penser qu’à soi'],
    ['altruisme', 'se soucier des autres'],
    ['tolérance', 'accepter autrui et ses idées'],
  ],
  libres: [
    {
      q: 'quel mot désigne le fait de ne penser qu’à soi ?',
      accepted: ['égoïsme', 'l’égoïsme', 'egoisme', 'individualisme', 'l’individualisme'],
      traps: [
        { text: 'altruisme', why: 'L’altruisme, c’est se soucier des autres : c’est le contraire.' },
        {
          text: 'empathie',
          why: 'L’empathie, c’est se mettre à la place de l’autre : c’est le contraire de ne penser qu’à soi.',
        },
      ],
      quote: 'amener les élèves à définir égoïsme et altruisme',
      explain: 'Ne penser qu’à soi, c’est de l’égoïsme.',
    },
    {
      q: 'quel mot désigne le fait de se soucier des autres, à l’opposé de l’égoïsme ?',
      accepted: ['altruisme', 'l’altruisme'],
      traps: [
        { text: 'égoïsme', why: 'L’égoïsme, c’est ne penser qu’à soi : c’est le contraire.' },
        { text: 'rivalité', why: 'La rivalité, c’est la compétition, pas le souci des autres.' },
      ],
      quote: 'amener les élèves à définir égoïsme et altruisme',
      explain: 'Se soucier des autres, c’est l’altruisme.',
    },
    {
      q: 'quel mot désigne le fait de se mettre à la place de l’autre pour comprendre ce qu’il ressent ?',
      accepted: ['empathie', 'l’empathie'],
      traps: [
        { text: 'égoïsme', why: 'L’égoïsme, c’est ne penser qu’à soi : c’est le contraire.' },
        { text: 'rivalité', why: 'La rivalité, c’est la compétition. L’empathie, c’est comprendre l’autre.' },
      ],
      quote:
        'développer l’empathie comme moteur pour lutter contre les discriminations, la violence physique ou verbale, le harcèlement, les cyberviolences',
      explain: 'Se mettre à la place de l’autre, c’est l’empathie.',
    },
  ],
  docs: [
    {
      title: 'Un camarade triste',
      lines: [
        'Ce matin, Eliot est triste : sa trottinette est cassée.',
        'Maya le voit seul. Elle se demande : « Et moi, qu’est-ce que je ressentirais ? »',
        'Elle s’assoit près de lui et lui propose de jouer avec elle.',
      ],
      qs: [
        {
          q: 'Que fait Maya quand elle se demande ce qu’elle ressentirait à sa place ?',
          a: 'elle fait preuve d’empathie',
          wrong: [
            { label: 'elle fait preuve d’égoïsme', why: 'Maya pense à Eliot : ce n’est pas de l’égoïsme.' },
            { label: 'elle organise un vote', why: 'Personne ne vote dans ce texte.' },
            { label: 'elle se moque de lui', why: 'Maya s’assoit près de lui pour l’aider.' },
          ],
          quote:
            'développer l’empathie comme moteur pour lutter contre les discriminations, la violence physique ou verbale, le harcèlement, les cyberviolences',
          explain: 'Se mettre à la place d’Eliot pour comprendre ce qu’il ressent, c’est de l’empathie.',
        },
        {
          q: 'Maya se soucie d’Eliot. Quelle valeur de la République cela illustre-t-il ?',
          a: 'la fraternité',
          wrong: [
            { label: 'la rivalité', why: 'Maya ne cherche pas à gagner contre Eliot.' },
            { label: 'l’égoïsme', why: 'Maya pense à un autre élève : ce n’est pas de l’égoïsme.' },
            { label: 'le hasard', why: 'Ce n’est pas un hasard : Maya choisit d’aider Eliot.' },
          ],
          quote: 'Comprendre la notion de fraternité, valeur et principe de la République',
          explain: 'Se soucier des autres, c’est la fraternité, valeur de la République.',
        },
      ],
    },
    {
      title: 'Le débat de la récré',
      lines: [
        'La classe débat : faut-il un jeu de ballon ou un jeu de cartes à la récré ?',
        'Bastien crie : « Votre idée est stupide ! »',
        'Anaïs répond calmement : « Je comprends que le ballon te plaise, mais les cartes aident ceux qui n’aiment pas courir. »',
      ],
      qs: [
        {
          q: 'Que fait Anaïs pour donner son opinion ?',
          a: 'elle nuance son propos et tient compte des autres',
          wrong: [
            { label: 'elle crie plus fort', why: 'Anaïs répond calmement : elle ne crie pas.' },
            {
              label: 'elle change d’avis pour faire plaisir',
              why: 'Anaïs garde son avis : elle l’explique avec respect.',
            },
            { label: 'elle refuse de répondre', why: 'Anaïs répond bel et bien à Bastien.' },
          ],
          quote: NUANCE,
          explain: 'Anaïs comprend le point de vue de Bastien avant de donner le sien : elle nuance son propos.',
        },
        {
          q: 'Que manque-t-il à la réaction de Bastien ?',
          a: 'la prise en compte de la sensibilité des autres',
          wrong: [
            {
              label: 'une meilleure idée de jeu',
              why: 'Le problème n’est pas l’idée de jeu, mais la façon de s’exprimer.',
            },
            { label: 'un ballon', why: 'Le ballon n’a rien à voir avec le problème de Bastien.' },
            { label: 'un vote', why: 'Le vote viendra plus tard : ici, c’est la façon de parler qui pose problème.' },
          ],
          quote: NUANCE,
          explain: 'Bastien donne son opinion sans tenir compte de la sensibilité des autres.',
        },
      ],
    },
  ],
};

export const FAIRE_SOCIETE_SKILLS: readonly Skill[] = [reglesLois, respectAutrui, egaliteDignite, fraternite].map(
  notion,
);
