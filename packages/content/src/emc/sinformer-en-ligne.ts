import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM2, « S’informer en ligne » (lot em-cm2-02) : les contenus du programme d'EMC du 13 juin 2024 sur la liberté
 * d'expression et l'information (classe de CM2, « Libertés et droits fondamentaux »). Chaque fait cite le programme
 * (registre `emc-2024`) ou, avec `from`, le texte officiel nommé. Les textes à lire du niveau 5 sont écrits pour
 * l'exercice (personnages inventés).
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de CM2 : liberté d’expression et information';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de CM2.';

// ——— Textes cités hors programme d'EMC ———

const DDHC = { id: 'ddhc-1789', label: 'la Déclaration des droits de l’homme et du citoyen' };
const LOI_1881 = { id: 'loi-presse-1881', label: 'la loi de 1881 sur la liberté de la presse' };
const VP_EXPRESSION = { id: 'vie-publique-expression', label: 'le site officiel Vie publique' };
const VP_PRESSE = { id: 'vie-publique-presse', label: 'le site officiel Vie publique' };
const VP_INFOX = { id: 'vie-publique-infox', label: 'le site officiel Vie publique' };
const CYCLE3 = { id: 'cycle3-2020', label: 'le programme du CM1 à la 6e' };
const CYCLE4 = { id: 'cycle4-2020', label: 'le programme de français du collège' };

// ——— Citations exactes ———

const LIMITES = 'ces libertés comportent aussi des limites pour que la liberté des uns n’entrave pas celle des autres';
const ENCADRE =
  'la loi du 29 juillet 1881 sur la liberté de la presse, de l’imprimerie et de la librairie, encadrant cette liberté';
const RESEAUX = 'réseaux sociaux (qui ne sont pas un espace de non-droit)';
const PSEUDO = 'Aborder la notion de pseudonymes et d’anonymat';
const PRESSE_MONDE =
  'Aborder la question de la liberté d’expression par l’exemple de la liberté de la presse à travers le monde';
const FIABLE = 'l’accès à une information fiable et vérifiée est essentiel en démocratie';
const DESINFO = 'Appréhender la notion de « désinformation » avec les élèves (et ses possibles conséquences)';
const BONNES =
  'Consolider les bonnes pratiques face à l’information (évoquer par exemple les lois de 2018 relatives à la manipulation de l’information)';
const CIDE =
  'liberté d’expression (art. 13), liberté d’association et de réunion (art. 15), liberté d’information (art. 17)';
const PILIERS =
  'La liberté de la presse et la liberté de s’informer constituent deux piliers fondamentaux de la démocratie';

const ART4 = 'La liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui';
const ART11 = 'tout Citoyen peut donc parler, écrire, imprimer librement, sauf à répondre de l’abus de cette liberté';
const ART11_DEBUT = 'La libre communication des pensées et des opinions est un des droits les plus précieux de l’homme';

const EXPRIMER = 'le droit d’exprimer ses opinions (sous la forme écrite, orale, audiovisuelle...)';
const RECEVOIR = 'la liberté de recevoir ou de communiquer des informations ou des idées';

const PRINCIPE_PRESSE = 'Principe fondamental des systèmes démocratiques, la liberté de la presse';
const IMPRIMERIE = 'L’imprimerie et la librairie sont libres';
const SECRET =
  'Le secret des sources des journalistes est protégé dans l’exercice de leur mission d’information du public';
const JOURNALISTE = 'le recueil d’informations et leur diffusion au public';
const NOUVELLES_FAUSSES =
  'La publication, la diffusion ou la reproduction, par quelque moyen que ce soit, de nouvelles fausses';

const CIRCULENT = 'Ces infox ou "fake news" circulent très facilement grâce aux réseaux sociaux';
const VERIFICATEURS = 'le soutien à un réseau indépendant de vérificateurs de faits';
const DIVERSITE = 'accéder à des informations correctes ainsi qu’à une diversité de points de vue';
const DEFINITION =
  'Toute allégation ou imputation d’un fait dépourvu d’éléments vérifiables de nature à la rendre vraisemblable';

const ORIGINE =
  'apprennent à chercher des informations et à interroger l’origine et la pertinence de ces informations dans l’univers du numérique';
const DOCUMENTS = 'les élèves se familiarisent avec différentes sources documentaires';
const SOURCES_FIABLES = 'Identifier des sources d’informations fiables';
const RECOUPEMENT = 'comprendre l’importance de la vérification et du recoupement des sources';

const w = (label: string, why: string) => ({ label, why });

// ——— Notion 1 : la liberté d'expression ———

const libreExpression: Notion = {
  id: 'emcm2-liberte-expression',
  title: 'La liberté d’expression',
  hint: 'Pense à deux choses : ce qu’on a le droit de dire, et ce qui protège les autres.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La **liberté d’expression**, c’est ton droit de donner ton **opinion** : parler, écrire, dessiner. La **DDHC** la protège à l’article 11.',
    'Elle a des limites fixées par la **loi** : tu ne peux pas nuire aux autres. Une loi de 1881 encadre aussi la **liberté de la presse**.',
    'Sur un **réseau social**, même avec un **pseudonyme**, la loi reste : internet n’est pas un espace de **non-droit**, c’est-à-dire sans loi !',
  ],
  faits: [
    {
      q: 'Qu’est-ce que la liberté d’expression te permet de faire ?',
      a: 'donner ton opinion, en respectant la loi',
      wrong: [
        w('insulter qui tu veux', 'La liberté a des limites : tu n’as pas le droit de nuire aux autres.'),
        w('obliger les autres à penser comme toi', 'Chacun garde sa liberté d’opinion.'),
        w('dire n’importe quoi sans aucune limite', 'La loi fixe des limites à la liberté d’expression.'),
      ],
      gap: ['Dire ou écrire ton avis, c’est utiliser ta liberté d’', ' (le mot commence par « ex »).', ['expression']],
      quote: EXPRIMER,
      from: VP_EXPRESSION,
      explain: 'Tu peux exprimer tes opinions à l’oral, à l’écrit ou en images, dans le cadre de la loi.',
    },
    {
      avance: true,
      q: 'Quel article de la DDHC protège la libre communication des pensées et des opinions ?',
      a: 'l’article 11',
      wrong: [
        w('l’article 4', 'L’article 4 définit la liberté et ses limites en général.'),
        w('l’article 10', 'L’article 10 protège les opinions ; leur libre communication est à l’article suivant.'),
        w('l’article 1', 'L’article 1 parle de l’égalité en droits dès la naissance.'),
      ],
      gap: [
        'La libre communication des opinions est protégée par l’article ',
        ' de la DDHC (en chiffres).',
        ['11', 'onze'],
      ],
      quote: ART11_DEBUT,
      from: DDHC,
      explain: 'C’est l’article 11 : communiquer ses pensées est un droit très précieux.',
    },
    {
      q: 'D’après la DDHC, la liberté consiste à pouvoir faire tout ce qui…',
      a: 'ne nuit pas à autrui',
      wrong: [
        w('plaît au plus fort', 'La force ne donne pas plus de liberté : chacun a les mêmes droits.'),
        w('n’est pas vu par les adultes', 'Se cacher ne rend pas une action permise.'),
        w('fait rire ses amis', 'Une moquerie qui fait rire peut blesser quelqu’un.'),
      ],
      gap: [
        'La liberté consiste à pouvoir faire tout ce qui ne nuit pas à ',
        '.',
        ['autrui', 'autres', 'les autres', 'aux autres'],
      ],
      quote: ART4,
      from: DDHC,
      explain: '« Autrui » veut dire les autres. Ta liberté s’arrête quand elle leur fait du tort.',
    },
    {
      q: 'Pourquoi la liberté d’expression a-t-elle des limites ?',
      a: 'pour que la liberté des uns respecte celle des autres',
      wrong: [
        w('pour que personne ne puisse parler', 'Les limites ne suppriment pas la liberté : elles protègent chacun.'),
        w('pour que seuls les adultes aient un avis', 'Les enfants aussi ont la liberté d’expression.'),
        w('pour que tout le monde pense pareil', 'La liberté d’opinion permet de penser différemment.'),
      ],
      gap: [
        'Les libertés ont des ',
        ' pour protéger la liberté des autres.',
        ['limites', 'limite', 'bornes', 'règles', 'regles', 'lois'],
      ],
      quote: LIMITES,
      explain: 'Les limites évitent que la liberté d’une personne écrase celle d’une autre.',
    },
    {
      q: 'Sur un réseau social, que vaut la loi ?',
      a: 'elle s’applique aussi',
      wrong: [
        w('elle disparaît derrière l’écran', 'Un écran ne supprime pas la loi.'),
        w('elle ne concerne que les messages sur papier', 'La loi concerne aussi ce qu’on publie en ligne.'),
        w('elle s’arrête si on utilise un pseudonyme', 'Un faux nom ne donne pas le droit de nuire.'),
      ],
      gap: ['Les réseaux sociaux ne sont pas un espace de ', ' : la loi s’y applique.', ['non-droit', 'non droit']],
      quote: RESEAUX,
      explain: '« Non-droit » voudrait dire sans loi. Les réseaux sociaux ne sont pas comme ça.',
    },
  ],
  paires3: [
    ['Opinion', 'Ce que tu penses'],
    ['Pseudonyme', 'Faux nom que l’on choisit'],
    ['Limite', 'Ce que la loi interdit de dépasser'],
  ],
  paires5: [
    ['Opinion', 'Ce que tu penses'],
    ['Pseudonyme', 'Faux nom que l’on choisit'],
    ['Article 11 de la DDHC', 'Libre communication des opinions'],
    ['Article 4 de la DDHC', 'Ne pas nuire à autrui'],
    ['Loi de 1881', 'Liberté de la presse'],
  ],
  libres: [
    {
      q: 'Sur un jeu en ligne, Noa se fait appeler « Comète » au lieu de son vrai nom. « Comète » est un … (un mot).',
      accepted: ['pseudonyme', 'un pseudonyme', 'pseudo', 'un pseudo'],
      traps: [
        { text: 'anonymat', why: 'L’anonymat, c’est ne pas dire qui l’on est. Ici, on cherche le faux nom lui-même.' },
        { text: 'opinion', why: 'Une opinion est un avis, pas un nom.' },
      ],
      quote: PSEUDO,
      explain: 'Un faux nom choisi s’appelle un pseudonyme. La loi s’applique quand même à celui qui l’utilise.',
    },
    {
      q: 'La loi qui encadre la liberté de la presse date du 29 juillet de quelle année ? (en chiffres)',
      accepted: ['1881'],
      traps: [
        { text: '1789', why: '1789 est l’année de la DDHC. La loi sur la presse est plus récente.' },
        { text: '2018', why: 'En 2018, d’autres lois ont visé la manipulation de l’information.' },
      ],
      quote: ENCADRE,
      explain: 'La loi du 29 juillet 1881 sur la liberté de la presse encadre cette liberté.',
    },
    {
      q: 'La DDHC dit que « tout citoyen peut donc parler, écrire, imprimer… ». Quel mot vient ensuite ?',
      accepted: ['librement'],
      traps: [
        { text: 'toujours', why: 'La liberté a des limites : le texte ne dit pas « toujours ».' },
        { text: 'seulement', why: 'Le texte donne une liberté, il ne la réduit pas avec « seulement ».' },
      ],
      quote: ART11,
      from: DDHC,
      explain: 'Le mot est « librement ». La suite rappelle qu’on répond des abus prévus par la loi.',
    },
  ],
  docs: [
    {
      title: 'Le journal de la classe',
      lines: [
        'Pour le journal de la classe, Zélie écrit : « Je trouve la nouvelle cantine trop bruyante. »',
        'Elle explique pourquoi et propose une idée pour faire moins de bruit.',
        'Timéo veut ajouter une moquerie sur le surveillant.',
        'La maîtresse dit : « L’avis de Zélie, oui. La moquerie, non. »',
      ],
      qs: [
        {
          q: 'Pourquoi le texte de Zélie peut-il être publié ?',
          a: 'il donne son opinion sans nuire à personne',
          wrong: [
            w('il est plus long que les autres', 'La longueur ne dit pas si un texte respecte les autres.'),
            w('un avis est toujours une vérité', 'Un avis est ce que pense une personne : on peut en discuter.'),
            w('il se moque d’un adulte', 'C’est le texte de Timéo qui contient la moquerie.'),
          ],
          quote: ART4,
          from: DDHC,
          explain: 'Zélie dit ce qu’elle pense et ne fait de tort à personne.',
        },
        {
          q: 'Que rappelle la maîtresse à Timéo ?',
          a: 'la liberté d’expression a des limites',
          wrong: [
            w('les élèves n’ont pas le droit d’avoir un avis', 'La maîtresse accepte l’avis de Zélie.'),
            w('on ne doit jamais critiquer la cantine', 'Zélie critique la cantine et son texte est accepté.'),
            w('seul le surveillant peut écrire', 'Le texte ne dit pas cela : les élèves écrivent le journal.'),
          ],
          quote: LIMITES,
          explain: 'Critiquer une chose est possible. Se moquer de quelqu’un lui fait du tort.',
        },
      ],
    },
    {
      title: 'Un message sous pseudonyme',
      lines: [
        'Sur un forum, un message signé « Ombre42 » traite un élève de nul.',
        'Maël dit : « On ne sait pas qui c’est, donc tout est permis. »',
        'Sa grande sœur répond : « Non. La loi existe aussi sur internet. »',
        'Elle lui conseille de montrer le message à un adulte.',
      ],
      qs: [
        {
          q: 'Pourquoi Maël se trompe-t-il ?',
          a: 'un pseudonyme ne permet pas de nuire aux autres',
          wrong: [
            w('un pseudonyme est interdit sur internet', 'Choisir un faux nom est possible ; insulter ne l’est pas.'),
            w('les insultes sont permises le soir', 'L’heure ne change rien.'),
            w('seul Maël doit respecter la loi', 'La loi s’applique à tout le monde.'),
          ],
          quote: RESEAUX,
          explain: 'Les réseaux ne sont pas un espace sans loi, même quand on cache son nom.',
        },
        {
          q: 'Qu’est-ce qu’« Ombre42 » ?',
          a: 'un pseudonyme',
          wrong: [
            w('une loi', 'Une loi est une règle du pays, pas un nom.'),
            w('une opinion', 'Une opinion est un avis, pas une signature.'),
            w('un journal', 'Le texte parle d’une signature sur un forum.'),
          ],
          quote: PSEUDO,
          explain: '« Ombre42 » est un faux nom choisi pour signer : un pseudonyme.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la liberté de l'information ———

const libreInformation: Notion = {
  id: 'emcm2-liberte-information',
  title: 'La liberté de l’information',
  hint: 'Pense à ce que les journalistes publient et à ce que chacun peut lire.',
  programme: PROGRAMME,
  credit: CREDIT,
  sources: [VP_PRESSE.id],
  memo: [
    'La **liberté de l’information**, c’est pouvoir recevoir et partager des **informations**. La **Convention des droits de l’enfant** parle d’information à l’article 17.',
    'La **liberté de la presse** permet aux **journalistes** de publier, dans le cadre de la loi de 1881. Cette liberté est très importante en **démocratie**.',
    'En démocratie, chacun doit pouvoir accéder à une information **fiable** et **vérifiée**.',
  ],
  faits: [
    {
      q: 'La liberté de l’information permet de…',
      a: 'recevoir et partager des informations et des idées',
      wrong: [
        w('lire les messages privés des autres', 'La vie privée est protégée : ce n’est pas s’informer.'),
        w('inventer des nouvelles et les faire croire', 'Tromper les gens n’est pas les informer.'),
        w(
          'empêcher les autres de lire un journal',
          'Cette liberté ouvre l’accès aux informations, elle ne le ferme pas.',
        ),
      ],
      gap: [
        'On a la liberté de recevoir ou de communiquer des ',
        ' ou des idées.',
        ['informations', 'information', 'infos'],
      ],
      quote: RECEVOIR,
      from: VP_EXPRESSION,
      explain: 'S’informer, c’est recevoir des informations. Informer, c’est en communiquer.',
    },
    {
      q: 'Dans quel type de société la liberté de la presse est-elle un principe fondamental ?',
      a: 'une démocratie',
      wrong: [
        w(
          'une société où un seul chef choisit les nouvelles',
          'Si un seul choisit tout, les journaux ne sont pas libres.',
        ),
        w('une société sans aucune loi', 'La liberté de la presse est protégée par la loi.'),
        w('une société sans journaux', 'Sans journaux, la presse ne peut pas exister.'),
      ],
      gap: [
        'La liberté de la presse est un principe fondamental des systèmes ',
        '.',
        ['démocratiques', 'democratiques', 'démocratique', 'democratique'],
      ],
      quote: PRINCIPE_PRESSE,
      from: VP_PRESSE,
      explain: 'En démocratie, les citoyens ont besoin de s’informer pour se faire un avis.',
    },
    {
      q: 'Quel métier consiste à recueillir des informations et à les diffuser au public ?',
      a: 'journaliste',
      wrong: [
        w('boulanger', 'Le boulanger fabrique du pain : ce n’est pas son métier d’informer.'),
        w('pompier', 'Le pompier secourt les personnes.'),
        w('jardinier', 'Le jardinier s’occupe des plantes.'),
      ],
      gap: [
        'La personne dont le métier est de recueillir et de diffuser des informations est un ',
        '.',
        ['journaliste', 'reporter'],
      ],
      quote: JOURNALISTE,
      from: LOI_1881,
      explain: 'La loi décrit le travail du journaliste : recueillir des informations et les diffuser au public.',
    },
    {
      avance: true,
      q: 'D’après le premier article de la loi de 1881, qu’est-ce qui est libre ?',
      a: 'l’imprimerie et la librairie',
      wrong: [
        w('le vol et la triche', 'Aucune loi ne rend le vol libre.'),
        w('la vitesse sur les routes', 'Cette loi parle de la presse, pas de la route.'),
        w('le prix du pain', 'Cette loi parle d’imprimer et de diffuser des écrits.'),
      ],
      gap: ['D’après la loi de 1881, l’imprimerie et la ', ' sont libres.', ['librairie', 'la librairie']],
      quote: IMPRIMERIE,
      from: LOI_1881,
      explain: 'Imprimer et vendre des écrits est libre. La même loi fixe aussi des limites.',
    },
    {
      q: 'Quelle liberté, partout dans le monde, concerne les journaux qui publient des informations ?',
      a: 'la liberté de la presse',
      wrong: [
        w('la liberté de circuler à vélo', 'Le vélo ne concerne pas les journaux.'),
        w('le droit de choisir sa cantine', 'La cantine ne concerne pas les journaux.'),
        w('le droit de ne pas aller à l’école', 'Ce droit n’existe pas et ne concerne pas la presse.'),
      ],
      gap: ['La liberté des journaux s’appelle la liberté de la ', '.', ['presse']],
      quote: PRESSE_MONDE,
      explain: 'La liberté de la presse montre la liberté d’expression à travers le monde.',
    },
  ],
  paires3: [
    ['Presse', 'Les journaux et les magazines'],
    ['Journaliste', 'Recueille et diffuse des informations'],
    ['Démocratie', 'Les citoyens participent aux décisions'],
  ],
  paires5: [
    ['Presse', 'Les journaux et les magazines'],
    ['Journaliste', 'Recueille et diffuse des informations'],
    ['Loi de 1881', 'Liberté de la presse'],
    ['Article 17 de la Convention des droits de l’enfant', 'L’information'],
    ['Article 13 de la Convention des droits de l’enfant', 'La liberté d’expression'],
  ],
  libres: [
    {
      q: 'La liberté de la presse et la liberté de s’informer sont deux piliers de la … (un mot).',
      accepted: ['démocratie', 'democratie', 'la démocratie', 'la democratie'],
      traps: [
        { text: 'publicité', why: 'La publicité cherche à vendre : elle ne porte pas ces libertés.' },
        { text: 'cantine', why: 'Pense à la façon de gouverner où les citoyens participent.' },
      ],
      quote: PILIERS,
      explain: 'Un pilier soutient un bâtiment. Ces deux libertés soutiennent la démocratie.',
    },
    {
      q: 'Convention des droits de l’enfant : l’article 13 protège l’expression. Quel article protège la liberté d’information ? (en chiffres)',
      accepted: ['17', 'article 17', 'l’article 17'],
      traps: [
        { text: '11', why: 'L’article 11 est celui de la DDHC sur les opinions.' },
        { text: '7', why: 'L’article 7 de la Convention parle de la nationalité.' },
      ],
      quote: CIDE,
      explain:
        'Le programme de 4e précise : article 13 l’expression, article 15 l’association, article 17 l’information.',
    },
    {
      q: 'Les journalistes cherchent des informations et les diffusent au … (un mot).',
      accepted: ['public', 'au public'],
      traps: [
        { text: 'maire', why: 'Ils informent tout le monde, pas une seule personne.' },
        { text: 'coffre', why: 'Diffuser, c’est faire connaître, pas enfermer.' },
      ],
      quote: JOURNALISTE,
      from: LOI_1881,
      explain: 'Le public, c’est l’ensemble des personnes qui peuvent lire, écouter ou regarder.',
    },
  ],
  docs: [
    {
      title: 'Deux journaux, deux titres',
      lines: [
        'Au kiosque, Lison compare deux journaux sur le futur parc de la ville.',
        'Le premier titre dit que le projet est une bonne idée.',
        'Le second journal explique pourquoi des habitants ne sont pas d’accord.',
        'Son grand-père dit : « Tu peux lire les deux, puis te faire ton avis. »',
      ],
      qs: [
        {
          q: 'Qu’est-ce que Lison peut faire grâce à ces deux journaux ?',
          a: 'découvrir des points de vue différents',
          wrong: [
            w('être obligée de croire le premier', 'Rien ne l’oblige : elle peut comparer.'),
            w('apprendre qu’un seul avis est permis', 'Les deux journaux donnent des avis différents.'),
            w('voter à la place des habitants', 'Lire un journal n’est pas voter.'),
          ],
          quote: DIVERSITE,
          from: VP_INFOX,
          explain: 'Lire plusieurs journaux donne accès à plusieurs points de vue.',
        },
        {
          q: 'Quelle liberté permet au second journal de présenter les désaccords ?',
          a: 'la liberté de la presse',
          wrong: [
            w('le droit à la cantine', 'La cantine ne concerne pas les journaux.'),
            w('le droit d’avoir une nationalité', 'La nationalité ne permet pas de publier un journal.'),
            w('le devoir de payer l’impôt', 'C’est un devoir, pas la liberté de publier.'),
          ],
          quote: PRINCIPE_PRESSE,
          from: VP_PRESSE,
          explain: 'La presse libre peut montrer aussi les désaccords, dans le cadre de la loi.',
        },
      ],
    },
    {
      title: 'Le reportage de Nina',
      lines: [
        'Nina est journaliste dans une radio.',
        'Elle interroge des commerçants et la mairie au sujet de travaux dans une rue.',
        'Puis elle raconte à l’antenne ce qu’elle a appris.',
        'Un auditeur peut ainsi comprendre ce qui se passe dans sa ville.',
      ],
      qs: [
        {
          q: 'Quel est le travail de Nina dans ce texte ?',
          a: 'recueillir des informations et les diffuser au public',
          wrong: [
            w('réparer la rue', 'Elle parle des travaux, elle ne les fait pas.'),
            w('vendre les produits des commerçants', 'Elle les interroge, elle ne vend rien.'),
            w('décider à la place de la mairie', 'Un journaliste informe, il ne gouverne pas.'),
          ],
          quote: JOURNALISTE,
          from: LOI_1881,
          explain: 'Nina interroge, puis raconte à la radio : elle recueille et diffuse.',
        },
        {
          q: 'Pour l’auditeur, que permet ce reportage ?',
          a: 'recevoir une information sur sa ville',
          wrong: [
            w('arrêter les travaux tout seul', 'Écouter un reportage ne donne pas ce pouvoir.'),
            w('lire le courrier des commerçants', 'Le reportage ne donne pas accès à leur courrier.'),
            w('interdire à Nina de parler', 'La liberté de la presse permet à Nina de s’exprimer.'),
          ],
          quote: RECEVOIR,
          from: VP_EXPRESSION,
          explain: 'La liberté de recevoir des informations concerne aussi les auditeurs.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : vérifier une information ———

const verifierInformation: Notion = {
  id: 'emcm2-verifier-information',
  title: 'Vérifier une information',
  hint: 'Pose-toi la question : qu’est-ce qui prouve que c’est vrai ?',
  programme: PROGRAMME,
  credit: CREDIT,
  sources: [VP_PRESSE.id],
  memo: [
    'Une **infox** est une fausse information. La **désinformation** peut tromper beaucoup de monde, surtout quand elle circule vite sur un **réseau social**.',
    'Avant de croire ou de partager, tu vas **vérifier** : y a-t-il des preuves ? Pense à **recouper**, c’est-à-dire comparer plusieurs **sources**.',
    'En 2018, des lois ont été votées contre la manipulation de l’information, autour des élections. Elles ne remplacent pas ton esprit critique !',
  ],
  faits: [
    {
      q: 'Tu lis une nouvelle surprenante en ligne. Quel est le bon réflexe ?',
      a: 'la comparer avec d’autres sources avant de la croire',
      wrong: [
        w('la partager vite à tout le monde', 'Si elle est fausse, tu l’aides à se répandre.'),
        w('la croire parce que le titre est écrit en gros', 'La taille des lettres ne prouve rien.'),
        w('la croire parce qu’elle est amusante', 'Ce qui amuse n’est pas forcément vrai.'),
      ],
      gap: ['Comparer plusieurs sources pour vérifier une nouvelle, c’est les ', '.', ['recouper', 'croiser']],
      quote: RECOUPEMENT,
      from: CYCLE4,
      explain: 'Recouper, c’est regarder si plusieurs sources disent la même chose.',
    },
    {
      q: 'Comment appelle-t-on des informations fausses ou trompeuses qui circulent ?',
      a: 'la désinformation',
      wrong: [
        w('la documentation', 'La documentation aide à apprendre avec des documents.'),
        w('la démocratie', 'La démocratie est une façon de gouverner.'),
        w('la politesse', 'La politesse est le respect dans les gestes et les mots.'),
      ],
      gap: [
        'Des informations fausses ou trompeuses qui circulent, c’est de la ',
        '.',
        ['désinformation', 'desinformation'],
      ],
      quote: DESINFO,
      explain: 'La désinformation peut avoir des conséquences : les gens se trompent à cause d’elle.',
    },
    {
      q: 'Pourquoi les infox circulent-elles très facilement ?',
      a: 'à cause du partage sur les réseaux sociaux',
      wrong: [
        w('parce qu’elles sont toujours vraies', 'Une infox est justement une fausse information.'),
        w('parce que la loi oblige à les partager', 'Aucune loi n’oblige à partager.'),
        w('parce qu’elles sont écrites à la main', 'En ligne, les messages ne sont pas écrits à la main.'),
      ],
      gap: ['Les infox circulent très facilement grâce aux réseaux ', '.', ['sociaux']],
      quote: CIRCULENT,
      from: VP_INFOX,
      explain: 'Un clic suffit pour envoyer un message à beaucoup de personnes.',
    },
    {
      q: 'Pour vérifier une information, qu’est-ce qui compte le plus ?',
      a: 'des éléments qu’on peut vérifier',
      wrong: [
        w('le nombre de points d’exclamation', 'La ponctuation n’est pas une preuve.'),
        w('la couleur des images', 'La couleur ne prouve rien.'),
        w('le nombre d’amis qui la répètent', 'Une erreur répétée reste une erreur.'),
      ],
      gap: [
        'Une information sans éléments ',
        ' pour la rendre crédible doit te faire douter.',
        ['vérifiables', 'verifiables', 'vérifiable', 'verifiable'],
      ],
      quote: DEFINITION,
      from: VP_INFOX,
      explain: 'Un texte officiel a proposé cette idée : une fausse information n’a pas de preuves vérifiables.',
    },
    {
      avance: true,
      q: 'En quelle année des lois ont-elles été votées contre la manipulation de l’information ?',
      a: 'en 2018',
      wrong: [
        w('en 1789', '1789 est l’année de la DDHC.'),
        w('en 1881', '1881 est l’année de la loi sur la liberté de la presse.'),
        w('en 1958', '1958 est l’année de la Constitution de la Ve République.'),
      ],
      gap: ['Des lois contre la manipulation de l’information ont été votées en ', ' (en chiffres).', ['2018']],
      quote: BONNES,
      explain: 'Les lois de 2018 visent la manipulation de l’information.',
    },
  ],
  paires3: [
    ['Infox', 'Fausse information'],
    ['Recouper', 'Comparer plusieurs sources'],
    ['Vérifier', 'Contrôler que c’est vrai'],
  ],
  paires5: [
    ['Infox', 'Fausse information'],
    ['Recouper', 'Comparer plusieurs sources'],
    ['Désinformation', 'Informations trompeuses qui circulent'],
    ['Fiable', 'En qui on peut avoir confiance'],
    ['Lois de 2018', 'Contre la manipulation de l’information'],
  ],
  libres: [
    {
      q: 'Un message annonce que l’école fermera demain, sans aucune preuve. C’est faux. Quel mot court désigne cette fausse nouvelle ?',
      accepted: ['infox', 'une infox', 'fake news', 'une fake news', 'intox', 'une intox'],
      traps: [
        { text: 'source', why: 'La source dit d’où vient l’information. Ici, on nomme la fausse nouvelle.' },
        { text: 'opinion', why: 'Une opinion est un avis. Ici, on présente un faux fait.' },
      ],
      quote: CIRCULENT,
      from: VP_INFOX,
      explain: 'Une fausse nouvelle qui circule s’appelle une infox.',
    },
    {
      q: 'Une information en qui l’on peut avoir confiance est une information … (un mot).',
      accepted: ['fiable', 'vérifiée', 'verifiee', 'sûre', 'sure'],
      traps: [
        { text: 'amusante', why: 'Amusante ne veut pas dire vraie.' },
        { text: 'rapide', why: 'La vitesse ne prouve rien.' },
        { text: 'populaire', why: 'Beaucoup de partages ne prouvent pas qu’elle est vraie.' },
      ],
      quote: FIABLE,
      explain: 'Le programme parle d’information fiable et vérifiée : elle est essentielle en démocratie.',
    },
    {
      q: 'Des spécialistes contrôlent si des nouvelles sont vraies. On les appelle des … de faits (un mot).',
      accepted: ['vérificateurs', 'verificateurs', 'vérificateur', 'verificateur', 'vérificatrices', 'verificatrices'],
      traps: [
        { text: 'vendeurs', why: 'Un vendeur vend : il ne contrôle pas les nouvelles.' },
        { text: 'inventeurs', why: 'Inventer des faits, c’est le contraire de les contrôler.' },
      ],
      quote: VERIFICATEURS,
      from: VP_INFOX,
      explain: 'Les vérificateurs de faits contrôlent les informations qui circulent.',
    },
  ],
  docs: [
    {
      title: 'La photo du requin',
      lines: [
        'Aïda reçoit une photo : un requin nagerait dans la rivière de son village.',
        'Le message dit : « Partage vite à tous tes contacts ! »',
        'Aucun nom, aucun lieu précis, aucune preuve.',
        'Le journal local et la mairie n’en parlent pas.',
      ],
      qs: [
        {
          q: 'Que doit faire Aïda avant de croire ce message ?',
          a: 'chercher d’autres sources qui le confirment',
          wrong: [
            w('partager tout de suite', 'Partager sans vérifier aide une fausse nouvelle à circuler.'),
            w('croire la photo parce qu’elle est nette', 'Une photo nette peut montrer autre chose, ou être truquée.'),
            w('inventer un nom pour la source', 'Inventer une source n’apporte aucune preuve.'),
          ],
          quote: RECOUPEMENT,
          from: CYCLE4,
          explain: 'Recouper les sources permet de savoir si l’histoire est confirmée.',
        },
        {
          q: 'Quel indice du texte doit faire douter ?',
          a: 'il n’y a aucune preuve vérifiable',
          wrong: [
            w('la photo montre un animal', 'Une photo d’animal n’est pas suspecte en soi.'),
            w('Aïda habite dans un village', 'Le lieu où elle habite ne dit rien sur la nouvelle.'),
            w('le message est arrivé sur un écran', 'Beaucoup de vraies informations arrivent aussi sur un écran.'),
          ],
          quote: DEFINITION,
          from: VP_INFOX,
          explain: 'Sans éléments vérifiables, on ne peut pas savoir si la nouvelle est vraie.',
        },
      ],
    },
    {
      title: 'La rumeur de la cantine',
      lines: [
        'Un message dit que la cantine servira des insectes lundi.',
        'Plusieurs élèves le répètent dans la cour.',
        'Robin lit le menu affiché par l’école : il n’en parle pas.',
        'Il demande aussi à la directrice, qui répond que c’est faux.',
      ],
      qs: [
        {
          q: 'Comment Robin a-t-il vérifié la nouvelle ?',
          a: 'il a comparé avec d’autres sources',
          wrong: [
            w('il a compté les élèves qui la répètent', 'Il ne compte pas les élèves : il cherche des preuves.'),
            w('il a attendu qu’elle devienne vraie', 'Attendre ne vérifie rien.'),
            w('il l’a partagée plus largement', 'Il n’a rien partagé : il a contrôlé.'),
          ],
          quote: RECOUPEMENT,
          from: CYCLE4,
          explain: 'Le menu de l’école et la directrice sont deux sources à comparer avec la rumeur.',
        },
        {
          q: 'Pourquoi les répétitions des élèves ne prouvent-elles rien ?',
          a: 'ils répètent la même rumeur sans preuve',
          wrong: [
            w(
              'les élèves n’ont pas le droit de parler',
              'Ils ont la liberté d’expression ; répéter n’est pas prouver.',
            ),
            w('les élèves se trompent toujours', 'Les élèves ne se trompent pas toujours.'),
            w('le message parle de la cantine', 'Le sujet n’est pas le problème : il manque une preuve.'),
          ],
          quote: DEFINITION,
          from: VP_INFOX,
          explain: 'Beaucoup de personnes peuvent répéter la même erreur.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : les sources ———

const lesSources: Notion = {
  id: 'emcm2-sources',
  title: 'Interroger ses sources',
  hint: 'Demande-toi d’où vient l’information et qui l’a recueillie.',
  programme: PROGRAMME,
  credit: CREDIT,
  sources: [CYCLE3.id],
  memo: [
    'La **source**, c’est d’où vient une **information** : une personne, un journal, un livre, un site. Cherche son **origine** avant de la croire.',
    'Compare des sources **fiables** et variées. Un **journaliste** recueille des informations pour le public.',
    'La loi protège le **secret des sources** des journalistes : ils peuvent garder pour eux qui leur a parlé.',
  ],
  faits: [
    {
      q: 'Face à une information trouvée en ligne, que dois-tu te demander à son sujet ?',
      a: 'quelle est son origine',
      wrong: [
        w('quelle est sa couleur préférée', 'La couleur d’une page ne dit pas d’où vient l’information.'),
        w('combien elle a de smileys', 'Les smileys ne disent rien sur l’origine.'),
        w('quelle musique l’accompagne', 'La musique n’apprend rien sur la provenance.'),
      ],
      gap: ['Interroger l’', ' d’une information, c’est chercher d’où elle vient.', ['origine']],
      quote: ORIGINE,
      from: CYCLE3,
      explain: 'Connaître l’origine aide à savoir si on peut faire confiance.',
    },
    {
      q: 'Pour un exposé, quelle façon de chercher est la meilleure ?',
      a: 'utiliser différentes sources documentaires',
      wrong: [
        w('recopier le premier message trouvé', 'Un seul message ne suffit pas : on compare.'),
        w('ne lire que des publicités', 'Une publicité cherche à vendre.'),
        w('inventer les informations manquantes', 'Inventer n’est pas chercher.'),
      ],
      gap: ['Pour apprendre, on se familiarise avec différentes sources ', '.', ['documentaires', 'documentaire']],
      quote: DOCUMENTS,
      from: CYCLE3,
      explain: 'Livres, sites ou documents variés permettent de comparer.',
    },
    {
      q: 'Quelles sources d’informations faut-il apprendre à reconnaître ?',
      a: 'les sources fiables',
      wrong: [
        w('les sources les plus colorées', 'Les couleurs ne disent pas si on peut faire confiance.'),
        w('les sources les plus longues', 'Un texte long peut contenir des erreurs.'),
        w('les sources qui disent ce qu’on veut entendre', 'Une information peut être vraie même si elle te déplaît.'),
      ],
      gap: ['Une source en qui on peut avoir confiance est une source ', '.', ['fiable', 'sûre', 'sure']],
      quote: SOURCES_FIABLES,
      from: CYCLE3,
      explain: '« Fiable » veut dire qu’on peut lui faire confiance.',
    },
    {
      q: 'Que protège la loi de 1881 pour les journalistes ?',
      a: 'le secret de leurs sources',
      wrong: [
        w('le droit de mentir', 'La loi ne protège pas le mensonge : elle le punit dans certains cas.'),
        w('le droit de voler des documents', 'La loi ne permet pas de voler.'),
        w('l’obligation de dire qui leur a parlé', 'C’est le contraire : ils peuvent garder ce secret.'),
      ],
      gap: ['La loi protège le ', ' des sources des journalistes.', ['secret']],
      quote: SECRET,
      from: LOI_1881,
      explain: 'Une personne peut parler à un journaliste sans que son nom soit forcément révélé.',
    },
    {
      avance: true,
      q: 'Que dit la loi de 1881 de la diffusion de fausses nouvelles faite de mauvaise foi qui trouble la paix publique ?',
      a: 'elle est punie',
      wrong: [
        w('elle est récompensée', 'Une loi ne récompense pas ce qu’elle interdit.'),
        w('elle est obligatoire', 'Personne n’est obligé de diffuser de fausses nouvelles.'),
        w('elle est toujours permise', 'La loi prévoit une punition dans ce cas.'),
      ],
      gap: [
        'Diffuser exprès de fausses nouvelles qui troublent la paix publique est ',
        ' par la loi.',
        ['puni', 'punie', 'interdit', 'sanctionné', 'sanctionne'],
      ],
      quote: NOUVELLES_FAUSSES,
      from: LOI_1881,
      explain: '« De mauvaise foi » veut dire exprès, en sachant que c’est faux. La loi punit alors d’une amende.',
    },
  ],
  paires3: [
    ['Source', 'D’où vient l’information'],
    ['Origine', 'Endroit de départ'],
    ['Secret des sources', 'Le journaliste peut taire qui lui a parlé'],
  ],
  paires5: [
    ['Source', 'D’où vient l’information'],
    ['Fiable', 'En qui on peut avoir confiance'],
    ['Journaliste', 'Informe le public'],
    ['Recouper', 'Comparer plusieurs sources'],
    ['Secret des sources', 'Le journaliste peut taire qui lui a parlé'],
  ],
  libres: [
    {
      q: 'Tu cherches d’où vient une photo. Tu cherches son … (un mot).',
      accepted: ['origine', 'source', 'son origine', 'sa source'],
      traps: [
        { text: 'titre', why: 'Le titre annonce le sujet, pas forcément d’où vient la photo.' },
        { text: 'couleur', why: 'La couleur ne dit rien sur la provenance.' },
      ],
      quote: ORIGINE,
      from: CYCLE3,
      explain: 'Chercher l’origine, c’est retrouver la source.',
    },
    {
      q: 'Les journalistes peuvent garder cachée la personne qui les a informés : c’est le … des sources (un mot).',
      accepted: ['secret', 'le secret'],
      traps: [
        { text: 'partage', why: 'Partager, c’est le contraire de garder caché.' },
        { text: 'nombre', why: 'Le nombre de sources ne dit pas qu’elles restent cachées.' },
      ],
      quote: SECRET,
      from: LOI_1881,
      explain: 'On parle du secret des sources, protégé par la loi.',
    },
    {
      q: 'Comment appelle-t-on la personne dont le métier est de recueillir des informations pour le public ? (un mot)',
      accepted: ['journaliste', 'un journaliste', 'une journaliste', 'reporter', 'un reporter'],
      traps: [
        { text: 'lecteur', why: 'Le lecteur reçoit l’information, il ne la recueille pas pour le public.' },
        { text: 'imprimeur', why: 'L’imprimeur imprime les journaux, il n’enquête pas.' },
      ],
      quote: JOURNALISTE,
      from: LOI_1881,
      explain: 'Le journaliste recueille des informations et les diffuse au public.',
    },
  ],
  docs: [
    {
      title: 'L’exposé sur les loups',
      lines: [
        'Pour son exposé sur les loups, Jules consulte un livre de la bibliothèque.',
        'Il regarde aussi le site d’un parc naturel, qui donne le nom de ses auteurs.',
        'Enfin, il tombe sur un message sans nom : « Les loups savent parler ! »',
        'Il décide de ne pas recopier ce message.',
      ],
      qs: [
        {
          q: 'Pourquoi Jules peut-il se méfier du message ?',
          a: 'on ne sait pas d’où il vient',
          wrong: [
            w('il est trop court', 'Un message court peut être vrai : le souci est son origine.'),
            w('il parle d’un animal', 'Parler d’animaux n’est pas suspect.'),
            w('il n’est pas dans un livre', 'Une information peut être juste hors d’un livre.'),
          ],
          quote: ORIGINE,
          from: CYCLE3,
          explain: 'Sans nom ni origine, difficile de savoir qui affirme cela.',
        },
        {
          q: 'Qu’a fait Jules de bien pour son exposé ?',
          a: 'il a consulté des sources différentes',
          wrong: [
            w('il a recopié le premier message', 'Il ne recopie pas le message sans nom.'),
            w('il a inventé des détails', 'Le texte ne dit pas qu’il invente.'),
            w('il a cru tout ce qu’il lisait', 'Il écarte le message douteux.'),
          ],
          quote: DOCUMENTS,
          from: CYCLE3,
          explain: 'Un livre et un site avec des auteurs : deux sources à comparer.',
        },
      ],
    },
    {
      title: 'La journaliste discrète',
      lines: [
        'Inès, journaliste, apprend par une habitante que l’eau d’un lac est sale.',
        'L’habitante ne veut pas que son nom soit publié.',
        'Inès vérifie en regardant les résultats d’analyses de l’eau.',
        'Elle publie l’information sans dire qui lui a parlé.',
      ],
      qs: [
        {
          q: 'Qu’est-ce que la loi protège quand Inès tait le nom de l’habitante ?',
          a: 'le secret des sources',
          wrong: [
            w('le droit d’inventer des faits', 'Inès vérifie les faits : elle n’invente rien.'),
            w('la publicité des analyses', 'La question porte sur le nom gardé caché.'),
            w('le droit de salir le lac', 'Aucune loi ne donne ce droit.'),
          ],
          quote: SECRET,
          from: LOI_1881,
          explain: 'Les journalistes peuvent garder secrète l’origine d’une information.',
        },
        {
          q: 'Pourquoi Inès regarde-t-elle les analyses de l’eau ?',
          a: 'pour vérifier avec une autre source',
          wrong: [
            w('pour nettoyer le lac', 'Lire des analyses ne nettoie pas le lac.'),
            w('pour révéler le nom de l’habitante', 'Les analyses portent sur l’eau, pas sur le nom.'),
            w('pour écrire une publicité', 'Inès informe le public, elle ne vend rien.'),
          ],
          quote: RECOUPEMENT,
          from: CYCLE4,
          explain: 'Comparer un témoignage avec des analyses, c’est recouper les sources.',
        },
      ],
    },
  ],
};

export const SINFORMER_SKILLS: readonly Skill[] = [
  libreExpression,
  libreInformation,
  verifierInformation,
  lesSources,
].map(notion);
