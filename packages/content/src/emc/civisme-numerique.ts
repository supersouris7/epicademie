import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, « Civisme numérique » (lot em-cm1-02). Chaque fait cite le programme d'EMC du 13 juin 2024
 * (registre `emc-2024`) avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice
 * (personnages inventés). « Protéger ses données » n'est pas au programme de CM1 (données personnelles et traces
 * numériques : sixième) ; « chercher une information » et « sobriété numérique » y sont, et remplacent cette notion.
 * « Signaler » prend ici la forme du programme de CM1 : reconnaître un danger, alerter, se mettre en sécurité.
 */

const CHARTE =
  'Afin de développer un civisme numérique, s’appuyer sur la charte pour l’éducation à la culture et à la citoyenneté numériques';
const ESPACES =
  'travailler sur les espaces de travail accessibles aux élèves (espace numérique de travail, blog de classe, d’école, etc.)';
const HORS_LIGNE =
  'penser cet apprentissage comme une déclinaison en ligne de ce qu’on leur demande de faire hors ligne';
const EN_LIGNE =
  'aborder des exemples de comportement civique dans la classe, l’école, dans la vie quotidienne, en ligne, et en faveur de l’environnement';
const SOURCE_INFO =
  'distinguer émetteur et récepteur, aborder la notion de « source », interroger la notion d’information';
const PRODUIRE = 'produire et diffuser de l’information en classe (initier à la pratique médiatique)';
const IMAGE_TEXTE = 'appréhender le lien entre image et texte';
const CYBER =
  'Aborder le phénomène des cyberviolences ; démontrer que ces actes peuvent entraîner du harcèlement en ligne ; rappeler la règle et le droit';
const CIVILITE = 'connaître et appliquer les règles de civilité en société';
const ALERTER = 'Reconnaitre des situations de danger, alerter et se mettre en sécurité (APS, APER)';
const SOBRIETE =
  'envisager les conséquences en matière environnementale des usages du numérique (par exemple la consommation énergétique des serveurs, des applications, etc.) et souligner l’importance d’une sobriété numérique';
const DECONNEXION =
  'aborder la question du droit à la déconnexion numérique et de son importance pour la santé mentale et physique';

// ——— Notion 1 : règles en ligne ———

const reglesEnLigne: Notion = {
  id: 'emcm1-regles-en-ligne',
  title: 'Les règles en ligne',
  hint: 'Pense à ce qu’on te demande en classe : est-ce que ça change devant un écran ?',
  memo: [
    'Le **civisme numérique**, c’est agir pour le bien de tous sur internet, comme en classe. Les règles de la classe valent **en ligne** !',
    'Une **charte** est un texte qui rappelle les bons comportements. Tu en lis une avant d’utiliser l’**espace numérique de travail** ou le **blog** de ta classe.',
    'Ce qu’on te demande **hors ligne**, on te le demande aussi en ligne : être poli, respecter les autres.',
  ],
  faits: [
    {
      q: 'Sur quel texte s’appuie-t-on pour développer un civisme numérique ?',
      a: 'la charte pour l’éducation à la culture et à la citoyenneté numériques',
      wrong: [
        {
          label: 'une publicité en ligne',
          why: 'Une publicité vend quelque chose. Elle ne dit pas comment bien se comporter.',
        },
        {
          label: 'le mot de passe de ta session',
          why: 'Le mot de passe sert à entrer, pas à apprendre les bons comportements.',
        },
        {
          label: 'le règlement d’un jeu vidéo',
          why: 'Il ne vaut que pour ce jeu. Le programme parle d’une charte pour l’éducation au numérique.',
        },
      ],
      gap: [
        'Pour développer un civisme numérique, on s’appuie sur la ',
        ' pour l’éducation à la culture et à la citoyenneté numériques.',
        ['charte'],
      ],
      quote: CHARTE,
      explain: 'Une charte rappelle les bons comportements : on s’en sert pour apprendre le civisme numérique.',
    },
    {
      q: 'Quel espace de travail en ligne peut utiliser une classe ?',
      a: 'un blog de classe',
      wrong: [
        {
          label: 'un jeu vidéo payant',
          why: 'Un jeu est fait pour s’amuser. Il n’est pas un espace de travail de l’école.',
        },
        { label: 'une boutique en ligne', why: 'Une boutique sert à acheter, pas à travailler en classe.' },
        {
          label: 'un salon de discussion avec des inconnus',
          why: 'Un espace de travail de l’école est réservé à la classe, pas aux inconnus.',
        },
      ],
      gap: [
        'Un blog de classe est un espace de ',
        ' accessible aux élèves, comme l’espace numérique de travail.',
        ['travail'],
      ],
      quote: ESPACES,
      explain:
        'L’espace numérique de travail et le blog de classe sont des espaces de travail en ligne pour les élèves.',
    },
    {
      q: 'Que demande-t-on de faire en ligne ?',
      a: 'ce qu’on te demande déjà de faire hors ligne',
      wrong: [
        { label: 'tout ce que tu veux, sans règle', why: 'Les règles de civilité valent aussi en ligne.' },
        {
          label: 'le contraire de ce qu’on fait à l’école',
          why: 'C’est faux : en ligne, on garde les bons comportements de la classe.',
        },
        { label: 'ce que font les inconnus', why: 'Tu suis les règles de ta classe, pas celles des inconnus.' },
      ],
      gap: [
        'En ligne, on fait ce qu’on te demande de faire ',
        ' : ce sont les mêmes règles que dans la vie de tous les jours.',
        ['hors ligne', 'hors-ligne'],
      ],
      quote: HORS_LIGNE,
      explain: 'Les règles de la classe se retrouvent en ligne : être poli, respecter les autres.',
    },
    {
      q: 'Où peut-on montrer un comportement civique ?',
      a: 'en ligne, comme dans la classe et dans l’école',
      wrong: [
        {
          label: 'seulement dans la cour',
          why: 'Le civisme est partout : classe, école, vie quotidienne et en ligne.',
        },
        { label: 'seulement à la maison', why: 'On est civique aussi à l’école et sur internet.' },
        { label: 'jamais quand personne ne nous voit', why: 'Le civisme vaut même quand personne ne regarde.' },
      ],
      gap: ['On peut avoir un comportement civique dans la classe, l’école, la vie quotidienne et ', '.', ['en ligne']],
      quote: EN_LIGNE,
      explain: 'Être civique, c’est partout : à l’école, dans la vie de tous les jours et en ligne.',
    },
  ],
  paires3: [
    ['Charte', 'Texte qui rappelle les bons comportements'],
    ['Espace numérique de travail', 'Espace de travail en ligne de l’école'],
    ['Hors ligne', 'Dans la vie de tous les jours, sans écran'],
  ],
  paires5: [
    ['Charte', 'Texte qui rappelle les bons comportements'],
    ['Espace numérique de travail', 'Espace de travail en ligne de l’école'],
    ['Hors ligne', 'Dans la vie de tous les jours, sans écran'],
    ['Blog de classe', 'Page web où la classe publie ses textes'],
    ['Civisme numérique', 'Agir pour le bien de tous sur internet'],
  ],
  libres: [
    {
      q: 'Un texte qui rappelle les bons comportements en ligne s’appelle une … (un mot qui commence par « ch »).',
      accepted: ['charte', 'une charte', 'la charte'],
      traps: [
        { text: 'blog', why: 'Un blog publie des textes. Il ne rappelle pas les règles.' },
        { text: 'mot de passe', why: 'Un mot de passe sert à entrer sur un site, pas à rappeler les règles.' },
      ],
      quote: CHARTE,
      explain: 'La charte rappelle les bons comportements à avoir en ligne.',
    },
    {
      q: 'Le blog de classe et l’espace numérique de travail sont des espaces de … en ligne (un mot).',
      accepted: ['travail', 'de travail'],
      traps: [
        { text: 'jeu', why: 'Ces espaces servent à apprendre, pas à jouer.' },
        { text: 'vacances', why: 'Ce sont des espaces pour la classe, pas pour les vacances.' },
      ],
      quote: ESPACES,
      explain: 'Ce sont des espaces de travail accessibles aux élèves.',
    },
  ],
  docs: [
    {
      title: 'Le blog de la classe',
      lines: [
        'La classe de CM1 a un blog pour partager ses exposés.',
        'Noé veut écrire un commentaire moqueur sous le texte d’un camarade.',
        'La maîtresse dit : « En classe, on ne se moque pas. Sur le blog, c’est pareil ! »',
      ],
      qs: [
        {
          q: 'Que veut dire la maîtresse ?',
          a: 'les règles de la classe valent aussi en ligne',
          wrong: [
            {
              label: 'le blog n’a pas de règles',
              why: 'La maîtresse dit que c’est « pareil » : les règles valent aussi sur le blog.',
            },
            {
              label: 'on peut se moquer si on cache son nom',
              why: 'Le texte ne dit rien de tel : on ne se moque pas, ni en classe ni sur le blog.',
            },
            {
              label: 'le blog est réservé aux adultes',
              why: 'Le blog est celui de la classe : les élèves l’utilisent.',
            },
          ],
          quote: HORS_LIGNE,
          explain: 'Ce qu’on demande en classe, on le demande aussi en ligne : ne pas se moquer.',
        },
        {
          q: 'Quel commentaire Noé peut-il écrire pour être civique ?',
          a: 'un commentaire poli et gentil',
          wrong: [
            {
              label: 'un commentaire tout en majuscules',
              why: 'Les majuscules font crier. Ce n’est pas un commentaire poli.',
            },
            {
              label: 'la copie du texte de son camarade',
              why: 'Copier n’est pas commenter, et ce n’est pas ce que la maîtresse demande.',
            },
            {
              label: 'un commentaire pour effacer le blog',
              why: 'Le blog appartient à la classe : on ne l’efface pas.',
            },
          ],
          quote: EN_LIGNE,
          explain: 'En ligne comme en classe, un comportement civique reste poli et respectueux.',
        },
      ],
    },
    {
      title: 'La charte de l’école',
      lines: [
        'Avant d’ouvrir l’espace numérique de travail, Inès lit la charte de son école.',
        'Elle y lit : « Je respecte les autres. Je n’écris que des mots polis. »',
        'Inès se dit : « C’est comme dans la cour ! »',
      ],
      qs: [
        {
          q: 'À quoi sert la charte que lit Inès ?',
          a: 'à rappeler les bons comportements en ligne',
          wrong: [
            { label: 'à donner des notes', why: 'Une charte ne note personne.' },
            { label: 'à vendre des jeux', why: 'Une charte n’est pas une publicité.' },
            {
              label: 'à supprimer les règles de la classe',
              why: 'La charte prolonge les règles de la classe, elle ne les supprime pas.',
            },
          ],
          quote: CHARTE,
          explain: 'La charte rappelle comment bien se comporter en ligne.',
        },
        {
          q: 'Pourquoi Inès dit-elle « C’est comme dans la cour » ?',
          a: 'les règles en ligne ressemblent à celles hors ligne',
          wrong: [
            { label: 'la charte parle de la récréation', why: 'La charte parle du respect, pas de la récréation.' },
            {
              label: 'en ligne il n’y a pas de règles',
              why: 'Le texte lu par Inès est justement une charte de règles.',
            },
            {
              label: 'la cour est un espace numérique',
              why: 'La cour est un lieu de l’école, pas un espace numérique.',
            },
          ],
          quote: HORS_LIGNE,
          explain: 'Respecter les autres dans la cour ou en ligne : c’est la même règle.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : chercher une information ———

const chercherInformation: Notion = {
  id: 'emcm1-chercher-information',
  title: 'Chercher et partager une information en ligne',
  hint: 'Demande-toi qui envoie le message, qui le reçoit, et d’où il vient.',
  memo: [
    'Une **information**, c’est ce que tu apprends en lisant, en écoutant ou en regardant. Avant de la croire, cherche sa **source** : d’où vient-elle ?',
    'Celui qui envoie un message est l’**émetteur**. Celui qui le reçoit est le **récepteur**. Quand tu lis un article, tu es récepteur !',
    'En classe, tu peux aussi produire et partager une information, par exemple dans un journal de classe.',
  ],
  faits: [
    {
      q: 'Comment appelle-t-on l’endroit ou la personne d’où vient une information ?',
      a: 'la source',
      wrong: [
        { label: 'le clavier', why: 'Le clavier sert à écrire. Il ne dit pas d’où vient l’information.' },
        { label: 'l’écran', why: 'L’écran montre l’information, il ne dit pas d’où elle vient.' },
        { label: 'le titre', why: 'Le titre annonce le sujet, mais ce n’est pas toujours la source.' },
      ],
      gap: ['D’où vient une information : c’est sa ', '.', ['source', 'la source']],
      quote: SOURCE_INFO,
      explain: 'La source dit d’où vient l’information. On la cherche avant de croire ce qu’on lit.',
    },
    {
      q: 'Comment appelle-t-on celui qui envoie un message ?',
      a: 'l’émetteur',
      wrong: [
        { label: 'le clavier', why: 'Le clavier est un objet. L’émetteur est une personne ou un site qui envoie.' },
        { label: 'l’écran', why: 'L’écran montre le message, il ne l’envoie pas.' },
        { label: 'le récepteur', why: 'Le récepteur, c’est celui qui reçoit le message, pas celui qui l’envoie.' },
      ],
      gap: ['Celui qui envoie le message est l’', '.', ['émetteur', 'emetteur']],
      quote: SOURCE_INFO,
      explain: 'L’émetteur envoie le message. Le récepteur le reçoit.',
    },
    {
      q: 'Quand tu lis un article sur un site, que deviens-tu ?',
      a: 'le récepteur',
      wrong: [
        { label: 'un virus', why: 'Lire un article ne fait pas de toi un virus.' },
        { label: 'une image', why: 'Tu es une personne qui lit, pas une image.' },
        { label: 'l’émetteur', why: 'L’émetteur est celui qui écrit l’article. Toi, tu le reçois.' },
      ],
      gap: ['Celui qui reçoit le message est le ', '.', ['récepteur', 'recepteur', 'le récepteur']],
      quote: SOURCE_INFO,
      explain: 'Celui qui lit ou écoute le message le reçoit : il est le récepteur.',
    },
    {
      q: 'Que peut faire une classe avec l’information ?',
      a: 'la produire et la diffuser',
      wrong: [
        {
          label: 'seulement la copier sans jamais la lire',
          why: 'Copier sans lire n’apprend rien. En classe, on produit et on diffuse.',
        },
        {
          label: 'la garder secrète pour toujours',
          why: 'Au contraire : on apprend à la partager, par exemple dans un journal de classe.',
        },
        { label: 'l’inventer sans rien vérifier', why: 'On cherche la source et on vérifie : on n’invente pas.' },
      ],
      gap: [
        'En classe, on peut ',
        ' et diffuser de l’information.',
        ['produire', 'créer', 'creer', 'écrire', 'ecrire'],
      ],
      quote: PRODUIRE,
      explain: 'En classe, on s’initie à la pratique médiatique : produire et diffuser de l’information.',
    },
  ],
  paires3: [
    ['Source', 'Endroit ou personne d’où vient l’information'],
    ['Émetteur', 'Celui qui envoie le message'],
    ['Récepteur', 'Celui qui reçoit le message'],
  ],
  paires5: [
    ['Source', 'Endroit ou personne d’où vient l’information'],
    ['Émetteur', 'Celui qui envoie le message'],
    ['Récepteur', 'Celui qui reçoit le message'],
    ['Information', 'Un renseignement qu’on apprend en lisant, en écoutant ou en regardant'],
    ['Pratique médiatique', 'Fabriquer et partager des informations, par exemple un journal de classe'],
  ],
  libres: [
    {
      q: 'Celui qui envoie le message est l’… (un mot).',
      accepted: ['émetteur', 'l’émetteur', 'emetteur'],
      traps: [
        { text: 'récepteur', why: 'Le récepteur reçoit le message. Celui qui l’envoie est l’émetteur.' },
        { text: 'serveur', why: 'Un serveur est un ordinateur, pas la personne qui envoie le message.' },
      ],
      quote: SOURCE_INFO,
      explain: 'L’émetteur envoie, le récepteur reçoit.',
    },
    {
      q: 'D’où vient une information : c’est sa … (un mot).',
      accepted: ['source', 'la source', 'origine', 'l’origine'],
      traps: [
        { text: 'photo', why: 'Une photo peut illustrer l’information, mais elle ne dit pas d’où elle vient.' },
        { text: 'taille', why: 'La taille d’un texte ne dit rien de son origine.' },
      ],
      quote: SOURCE_INFO,
      explain: 'La source, c’est l’endroit ou la personne d’où vient l’information.',
    },
  ],
  docs: [
    {
      title: 'Le journal de la classe',
      lines: [
        'La classe de CM1 écrit un petit journal en ligne.',
        'Zoé trouve un chiffre sur un site. Elle note le nom du site et la date.',
        'Elle écrit à la fin : « Source : le site de la mairie. »',
      ],
      qs: [
        {
          q: 'Pourquoi Zoé note-t-elle le nom du site ?',
          a: 'pour garder la source de l’information',
          wrong: [
            { label: 'pour faire joli', why: 'Noter le site sert à montrer d’où vient l’information, pas à décorer.' },
            {
              label: 'pour cacher d’où vient le chiffre',
              why: 'C’est l’inverse : Zoé écrit « Source » pour dire d’où il vient.',
            },
            { label: 'pour faire un texte plus long', why: 'La longueur n’a aucune importance ici.' },
          ],
          quote: SOURCE_INFO,
          explain: 'La source dit d’où vient le chiffre : on peut alors le vérifier.',
        },
        {
          q: 'Quand la classe publie le journal, qui est l’émetteur ?',
          a: 'la classe qui l’écrit',
          wrong: [
            { label: 'les lecteurs du journal', why: 'Les lecteurs reçoivent le journal : ce sont les récepteurs.' },
            { label: 'l’ordinateur', why: 'L’ordinateur est un outil. L’émetteur est celui qui écrit.' },
            { label: 'la mairie', why: 'La mairie est la source du chiffre, pas l’émetteur du journal.' },
          ],
          quote: PRODUIRE,
          explain: 'Les élèves écrivent et publient le journal : ils sont l’émetteur.',
        },
      ],
    },
    {
      title: 'Une photo et un titre',
      lines: [
        'Sur une page web, une photo de plage est placée sous le titre « La neige arrive ».',
        'Léo se demande : « L’image et le texte disent-ils la même chose ? »',
        'Il cherche qui a publié la page avant de la croire.',
      ],
      qs: [
        {
          q: 'Que fait Léo quand il compare l’image et le texte ?',
          a: 'il regarde le lien entre l’image et le texte',
          wrong: [
            { label: 'il copie la photo', why: 'Léo ne copie rien : il se pose une question.' },
            { label: 'il éteint l’ordinateur', why: 'Léo continue de chercher, il n’éteint rien.' },
            { label: 'il change le titre sans réfléchir', why: 'Léo réfléchit justement avant de croire la page.' },
          ],
          quote: IMAGE_TEXTE,
          explain: 'Comparer l’image et le texte aide à voir si la page est cohérente.',
        },
        {
          q: 'Pourquoi Léo cherche-t-il qui a publié la page ?',
          a: 'pour connaître la source',
          wrong: [
            {
              label: 'pour écrire à tous les lecteurs',
              why: 'Léo veut vérifier l’information, pas écrire aux lecteurs.',
            },
            { label: 'pour acheter la photo', why: 'Il ne veut rien acheter.' },
            {
              label: 'pour effacer la page',
              why: 'On ne peut pas effacer la page d’un autre, et ce n’est pas son but.',
            },
          ],
          quote: SOURCE_INFO,
          explain: 'Savoir qui a publié la page, c’est connaître sa source avant de croire l’information.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : respect en ligne ———

const respectEnLigne: Notion = {
  id: 'emcm1-respect-en-ligne',
  title: 'Le respect en ligne',
  hint: 'Imagine que tu reçois le message : comment te sentirais-tu ?',
  memo: [
    'Une **cyberviolence**, c’est une violence faite avec un écran : un message méchant, une moquerie en ligne.',
    'Si elle se répète contre la même personne, cela peut devenir du **harcèlement en ligne**. La règle et le droit l’interdisent.',
    'Pour bien vivre ensemble, on connaît et on applique les règles de **civilité** : en classe comme sur internet, on reste poli !',
  ],
  faits: [
    {
      q: 'Comment appelle-t-on des violences faites avec le numérique, comme des messages méchants ?',
      a: 'des cyberviolences',
      wrong: [
        { label: 'des devoirs', why: 'Les devoirs se font pour apprendre. Un message méchant fait du mal.' },
        { label: 'des félicitations', why: 'Des félicitations font plaisir. Un message méchant blesse.' },
        { label: 'des règles de civilité', why: 'Les règles de civilité protègent les autres : c’est le contraire.' },
      ],
      gap: [
        'Des violences faites avec un écran sont des ',
        '.',
        ['cyberviolences', 'cyberviolence', 'cyber-violences'],
      ],
      quote: CYBER,
      explain: 'Une cyberviolence est une violence faite avec le numérique.',
    },
    {
      q: 'Des cyberviolences répétées peuvent entraîner quoi ?',
      a: 'du harcèlement en ligne',
      wrong: [
        { label: 'une récompense', why: 'Faire du mal à quelqu’un ne donne pas de récompense.' },
        { label: 'une bonne note', why: 'Ça n’a rien à voir avec les notes.' },
        { label: 'une charte', why: 'Une charte rappelle les règles, elle ne vient pas des cyberviolences.' },
      ],
      gap: ['Des cyberviolences peuvent entraîner du ', ' en ligne.', ['harcèlement', 'harcelement']],
      quote: CYBER,
      explain: 'Des actes de cyberviolence qui se répètent peuvent entraîner du harcèlement en ligne.',
    },
    {
      q: 'Face aux cyberviolences, que rappelle-t-on ?',
      a: 'la règle et le droit',
      wrong: [
        {
          label: 'la dernière blague à la mode',
          why: 'Une blague ne règle rien. On rappelle ce qui est permis ou interdit.',
        },
        { label: 'le score d’un jeu', why: 'Un score n’a aucun rapport avec le respect des autres.' },
        { label: 'le mot de passe', why: 'Un mot de passe ne protège pas du harcèlement.' },
      ],
      gap: ['Face aux cyberviolences, on rappelle la ', ' et le droit.', ['règle', 'regle']],
      quote: CYBER,
      explain: 'On rappelle la règle (ce qui est interdit) et le droit (les lois qui protègent chacun).',
    },
    {
      q: 'Que doit-on connaître et appliquer en société ?',
      a: 'les règles de civilité',
      wrong: [
        { label: 'les astuces pour gagner', why: 'Gagner n’est pas le sujet : on parle du respect des autres.' },
        { label: 'les codes secrets', why: 'Les codes secrets ne sont pas des règles de vie ensemble.' },
        { label: 'les prix des jeux', why: 'Les prix ne disent rien du respect des autres.' },
      ],
      gap: ['On doit connaître et appliquer les règles de ', ' en société.', ['civilité', 'civilite']],
      quote: CIVILITE,
      explain: 'Les règles de civilité, comme la politesse, valent partout : en classe, dans la rue et en ligne.',
    },
  ],
  paires3: [
    ['Cyberviolence', 'Violence faite avec un écran'],
    ['Harcèlement en ligne', 'Violences répétées contre une même personne par écran'],
    ['Civilité', 'Politesse et respect des autres'],
  ],
  paires5: [
    ['Cyberviolence', 'Violence faite avec un écran'],
    ['Harcèlement en ligne', 'Violences répétées contre une même personne par écran'],
    ['Civilité', 'Politesse et respect des autres'],
    ['Incivilité', 'Geste ou parole qui manque de respect aux autres'],
    ['Droit', 'Ensemble des lois qui disent ce qui est permis ou puni'],
  ],
  libres: [
    {
      q: 'Des messages méchants répétés contre une personne, c’est du … en ligne (un mot).',
      accepted: ['harcèlement', 'harcelement', 'du harcèlement'],
      traps: [
        { text: 'jeu', why: 'Ce n’est pas un jeu : la personne en souffre.' },
        { text: 'humour', why: 'Des moqueries répétées ne sont pas de l’humour : elles blessent.' },
      ],
      quote: CYBER,
      explain: 'Des cyberviolences répétées peuvent entraîner du harcèlement en ligne.',
    },
    {
      q: 'Les violences faites avec un écran s’appellent des … (un mot).',
      accepted: ['cyberviolences', 'cyberviolence', 'cyber-violences'],
      traps: [
        {
          text: 'incivilités',
          why: 'Une incivilité est un manque de respect. Une violence faite avec un écran s’appelle une cyberviolence.',
        },
        { text: 'devoirs', why: 'Les devoirs n’ont rien à voir avec la violence.' },
      ],
      quote: CYBER,
      explain: 'Le préfixe « cyber » indique le numérique : cyberviolence = violence par écran.',
    },
  ],
  docs: [
    {
      title: 'Le groupe de la classe',
      lines: [
        'Un groupe de messages réunit les élèves de la classe.',
        'Chaque jour, plusieurs élèves envoient des messages méchants à Sacha.',
        'Sacha n’ose plus ouvrir son écran.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on ces messages méchants envoyés chaque jour ?',
          a: 'du harcèlement en ligne',
          wrong: [
            {
              label: 'un travail de groupe',
              why: 'Un travail de groupe est fait ensemble. Ici, on fait du mal à Sacha.',
            },
            { label: 'de la politesse', why: 'Des messages méchants sont le contraire de la politesse.' },
            { label: 'une charte', why: 'Une charte rappelle les règles, elle n’envoie pas de messages.' },
          ],
          quote: CYBER,
          explain: 'Des messages méchants qui se répètent contre une même personne : c’est du harcèlement en ligne.',
        },
        {
          q: 'Que rappelle-t-on aux élèves qui envoient ces messages ?',
          a: 'la règle et le droit',
          wrong: [
            { label: 'que c’est un jeu', why: 'Ce n’est pas un jeu : Sacha en souffre.' },
            {
              label: 'que c’est permis en ligne',
              why: 'Rien n’est permis parce que c’est en ligne : la règle et le droit valent aussi.',
            },
            { label: 'que le groupe est gratuit', why: 'Le prix du groupe n’a aucun rapport.' },
          ],
          quote: CYBER,
          explain: 'On rappelle la règle (ne pas faire de mal) et le droit (les lois qui protègent Sacha).',
        },
      ],
    },
    {
      title: 'Deux commentaires',
      lines: [
        'Sous un dessin publié sur le blog, un élève écrit : « Nul ! Tu ne sais rien faire ! »',
        'Un autre élève écrit : « J’aime beaucoup les couleurs. Le fond me plaît moins. »',
      ],
      qs: [
        {
          q: 'Quel commentaire respecte les règles de civilité ?',
          a: 'le deuxième',
          wrong: [
            { label: 'le premier', why: 'Le premier est une moquerie : il manque de respect.' },
            { label: 'les deux', why: 'Seul le deuxième reste poli, même en critiquant.' },
            { label: 'aucun', why: 'Le deuxième est poli : il donne un avis sans blesser.' },
          ],
          quote: CIVILITE,
          explain: 'Le deuxième donne son avis poliment, sans blesser : c’est de la civilité.',
        },
        {
          q: 'Si le premier commentaire est envoyé tous les jours à la même personne, que risque-t-on de créer ?',
          a: 'du harcèlement en ligne',
          wrong: [
            { label: 'une charte', why: 'Une charte rappelle les règles, elle ne vient pas de moqueries.' },
            { label: 'un nouveau blog', why: 'Les moqueries ne créent pas de blog.' },
            {
              label: 'de la sobriété numérique',
              why: 'La sobriété numérique, c’est consommer moins d’énergie, pas se moquer.',
            },
          ],
          quote: CYBER,
          explain: 'Des actes qui se répètent peuvent entraîner du harcèlement en ligne.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : alerter (signaler un danger) ———

const alerter: Notion = {
  id: 'emcm1-signaler',
  title: 'Alerter et se mettre en sécurité',
  hint: 'Trois gestes : reconnaître, prévenir, se protéger.',
  memo: [
    'Face à un **danger**, il y a trois gestes : le reconnaître, **alerter** et se mettre en **sécurité**. Exemple : une image qui fait peur sur un écran.',
    '**Alerter**, c’est prévenir quelqu’un qui peut aider, par exemple ton enseignant. C’est aussi **signaler** ce qui n’est pas normal.',
    'Tu n’es jamais obligé de régler un problème tout seul. Alerter est un geste courageux.',
  ],
  faits: [
    {
      q: 'Face à une situation de danger, quel geste est demandé ?',
      a: 'alerter',
      wrong: [
        { label: 'rire', why: 'Rire ne protège personne.' },
        { label: 'faire semblant de ne rien voir', why: 'Ne rien faire laisse le danger continuer. Il faut alerter.' },
        { label: 'attendre que ça passe', why: 'Attendre ne règle pas le danger. Il faut prévenir quelqu’un.' },
      ],
      gap: [
        'Face à un danger, on doit reconnaître la situation, ',
        ' et se mettre en sécurité.',
        ['alerter', 'prévenir', 'prevenir', 'avertir', 'signaler'],
      ],
      quote: ALERTER,
      explain: 'Alerter, c’est prévenir quelqu’un qui peut aider. C’est le deuxième geste face au danger.',
    },
    {
      q: 'Que faut-il d’abord savoir faire devant un danger ?',
      a: 'le reconnaître',
      wrong: [
        { label: 'le filmer pour le montrer', why: 'Filmer n’aide pas. D’abord, on reconnaît le danger pour agir.' },
        { label: 'le cacher', why: 'Cacher le danger ne le fait pas disparaître.' },
        { label: 'l’oublier', why: 'Oublier ne protège pas. Il faut le reconnaître puis alerter.' },
      ],
      gap: ['On doit savoir ', ' une situation de danger.', ['reconnaître', 'reconnaitre']],
      quote: ALERTER,
      explain: 'Reconnaître un danger permet de réagir à temps : on alerte et on se protège.',
    },
    {
      q: 'Que veut dire « alerter » ?',
      a: 'prévenir quelqu’un qui peut aider',
      wrong: [
        { label: 'garder le secret', why: 'Garder le secret laisse le danger : alerter, c’est parler.' },
        { label: 'régler tout seul le problème', why: 'Alerter, c’est justement ne pas rester seul face au danger.' },
        {
          label: 'partager l’image dangereuse à tous ses amis',
          why: 'Partager répand le danger. Alerter, c’est prévenir quelqu’un qui peut aider.',
        },
      ],
      gap: ['Alerter, c’est ', ' quelqu’un qui peut aider.', ['prévenir', 'prevenir', 'avertir']],
      quote: ALERTER,
      explain: 'Alerter, c’est prévenir quelqu’un qui peut aider, comme un adulte de confiance.',
    },
    {
      q: 'Après avoir reconnu le danger et alerté, que fait-on ?',
      a: 'on se met en sécurité',
      wrong: [
        {
          label: 'on continue pour voir',
          why: 'Continuer garde le danger près de soi. Il faut se mettre en sécurité.',
        },
        { label: 'on répond par des insultes', why: 'Les insultes aggravent le problème : on se protège.' },
        { label: 'on donne son mot de passe', why: 'Donner son mot de passe te met en danger, pas en sécurité.' },
      ],
      gap: ['Après avoir alerté, on se met en ', '.', ['sécurité', 'securite']],
      quote: ALERTER,
      explain: 'On s’éloigne du danger : fermer la page, quitter la pièce, aller près d’un adulte.',
    },
  ],
  paires3: [
    ['Alerter', 'Prévenir quelqu’un qui peut aider'],
    ['Danger', 'Ce qui peut te faire du mal'],
    ['Se mettre en sécurité', 'S’éloigner du danger'],
  ],
  paires5: [
    ['Alerter', 'Prévenir quelqu’un qui peut aider'],
    ['Danger', 'Ce qui peut te faire du mal'],
    ['Se mettre en sécurité', 'S’éloigner du danger'],
    ['Signaler', 'Dire que quelque chose n’est pas normal'],
    ['Cyberviolence', 'Violence faite avec un écran'],
  ],
  libres: [
    {
      q: 'Reconnaître le danger, … et se mettre en sécurité : quel verbe manque ? (un mot)',
      accepted: ['alerter', 'prévenir', 'prevenir', 'avertir', 'signaler'],
      traps: [
        { text: 'attendre', why: 'Attendre ne protège pas. Il faut prévenir quelqu’un.' },
        { text: 'jouer', why: 'Jouer ne règle pas le danger.' },
      ],
      quote: ALERTER,
      explain: 'Les trois gestes : reconnaître le danger, alerter, se mettre en sécurité.',
    },
    {
      q: 'Devant un danger, on se met en … (un mot).',
      accepted: ['sécurité', 'securite', 'la sécurité'],
      traps: [
        { text: 'colère', why: 'La colère ne protège pas du danger.' },
        { text: 'retard', why: 'Être en retard n’a aucun rapport avec le danger.' },
      ],
      quote: ALERTER,
      explain: 'Se mettre en sécurité, c’est s’éloigner du danger.',
    },
  ],
  docs: [
    {
      title: 'Un message qui fait peur',
      lines: [
        'Sur le blog de la classe, Ilan lit un commentaire adressé à Tess : « Je vais te faire du mal ! »',
        'Ilan est inquiet. Il montre l’écran à son enseignante.',
      ],
      qs: [
        {
          q: 'Que fait Ilan en montrant l’écran à son enseignante ?',
          a: 'il alerte un adulte',
          wrong: [
            {
              label: 'il répond au message',
              why: 'Répondre peut aggraver la situation. Ilan préfère prévenir un adulte.',
            },
            { label: 'il se moque de Tess', why: 'Ilan est inquiet pour Tess : il ne se moque pas.' },
            { label: 'il efface le blog', why: 'Il ne touche pas au blog : il montre le message à son enseignante.' },
          ],
          quote: ALERTER,
          explain: 'Montrer le message à son enseignante, c’est alerter quelqu’un qui peut aider.',
        },
        {
          q: 'Pourquoi est-il utile d’alerter ?',
          a: 'pour que quelqu’un qui peut aider agisse',
          wrong: [
            { label: 'pour punir Ilan', why: 'Ilan n’a rien fait de mal : il protège Tess.' },
            { label: 'pour gagner un point', why: 'Alerter n’est pas un jeu.' },
            { label: 'pour cacher le message', why: 'On ne cache pas le message : on le montre à un adulte.' },
          ],
          quote: ALERTER,
          explain: 'Un adulte peut protéger Tess et rappeler la règle. Seul, Ilan ne peut pas tout régler.',
        },
      ],
    },
    {
      title: 'Une page qui fait peur',
      lines: [
        'Sur une page inconnue, une image fait peur à Mina.',
        'Elle ferme la page, puis elle va voir son père.',
        'Il l’écoute et ils cherchent ensemble comment éviter cette page.',
      ],
      qs: [
        {
          q: 'Que fait Mina pour se mettre en sécurité ?',
          a: 'elle ferme la page',
          wrong: [
            { label: 'elle clique sur toutes les images', why: 'Cliquer encore la garde devant le danger.' },
            { label: 'elle partage la page à ses amis', why: 'Partager la page fait voir l’image à d’autres.' },
            { label: 'elle continue de regarder', why: 'Continuer de regarder ne la protège pas.' },
          ],
          quote: ALERTER,
          explain: 'Fermer la page éloigne Mina du danger : elle se met en sécurité.',
        },
        {
          q: 'Que fait ensuite Mina en allant voir son père ?',
          a: 'elle alerte un adulte',
          wrong: [
            { label: 'elle garde le secret', why: 'Elle parle à son père : ce n’est pas un secret.' },
            { label: 'elle envoie l’image à ses amis', why: 'Elle ne montre l’image à personne d’autre.' },
            { label: 'elle ne dit rien', why: 'Elle va voir son père pour lui parler.' },
          ],
          quote: ALERTER,
          explain: 'En allant voir son père, Mina prévient un adulte : elle alerte.',
        },
      ],
    },
  ],
};

// ——— Notion 5 : sobriété numérique et déconnexion ———

const sobriete: Notion = {
  id: 'emcm1-sobriete-numerique',
  title: 'La sobriété numérique et la déconnexion',
  hint: 'Pense à ce qu’il faut pour faire marcher un écran, et à ce qu’il te faut pour être en forme.',
  memo: [
    'Un **serveur** est un gros ordinateur qui garde et envoie les pages et les applications. Il consomme de l’énergie, comme ta tablette.',
    'La **sobriété numérique**, c’est utiliser le numérique avec mesure pour consommer moins d’énergie. Exemple : éteindre ta tablette quand tu ne t’en sers pas.',
    'La **déconnexion**, c’est faire une pause sans écran. Tu y as droit : c’est bon pour ta santé !',
  ],
  faits: [
    {
      q: 'Les usages du numérique ont des conséquences sur quoi ?',
      a: 'l’environnement',
      wrong: [
        { label: 'le prix du pain', why: 'Le prix du pain n’a rien à voir avec les usages du numérique.' },
        { label: 'la forme de la Lune', why: 'Le numérique ne change pas la Lune.' },
        { label: 'le nombre de jours dans l’année', why: 'Le calendrier ne dépend pas du numérique.' },
      ],
      gap: ['Les usages du numérique ont des conséquences sur l’', '.', ['environnement']],
      quote: SOBRIETE,
      explain: 'Le numérique consomme de l’énergie : il a des conséquences sur l’environnement.',
    },
    {
      q: 'Que consomment les serveurs et les applications ?',
      a: 'de l’énergie',
      wrong: [
        { label: 'du papier', why: 'Un serveur n’utilise pas de papier : il utilise de l’énergie.' },
        { label: 'de l’eau de pluie', why: 'Un serveur ne marche pas à la pluie.' },
        { label: 'du pain', why: 'Les serveurs ne mangent pas : ils consomment de l’énergie.' },
      ],
      gap: [
        'Les serveurs et les applications consomment de l’',
        '.',
        ['énergie', 'energie', 'électricité', 'electricite'],
      ],
      quote: SOBRIETE,
      explain: 'La consommation énergétique des serveurs et des applications pèse sur l’environnement.',
    },
    {
      q: 'Comment appelle-t-on l’usage du numérique avec mesure, pour moins consommer ?',
      a: 'la sobriété numérique',
      wrong: [
        { label: 'l’excès numérique', why: 'L’excès, c’est le contraire de la mesure.' },
        { label: 'la vitesse numérique', why: 'Aller vite ne veut pas dire consommer moins.' },
        {
          label: 'l’abondance numérique',
          why: 'L’abondance, c’est avoir trop de tout : c’est le contraire de la sobriété.',
        },
      ],
      gap: ['Utiliser le numérique avec mesure, c’est la ', ' numérique.', ['sobriété', 'sobriete']],
      quote: SOBRIETE,
      explain: 'La sobriété numérique est un geste pour l’environnement : consommer moins d’énergie.',
    },
    {
      q: 'À quel droit doit-on penser pour sa santé mentale et physique ?',
      a: 'le droit à la déconnexion numérique',
      wrong: [
        {
          label: 'le droit de rester connecté sans arrêt',
          why: 'Rester connecté sans arrêt fatigue. Le droit protège la pause.',
        },
        { label: 'le droit à un écran plus grand', why: 'La taille d’un écran n’est pas un droit pour la santé.' },
        {
          label: 'le droit de recevoir plus de notifications',
          why: 'Plus de notifications fatiguent. Le droit protège la pause.',
        },
      ],
      gap: [
        'Le droit à la ',
        ' numérique est important pour la santé mentale et physique.',
        ['déconnexion', 'deconnexion'],
      ],
      quote: DECONNEXION,
      explain: 'Faire des pauses sans écran est bon pour le corps et pour la tête.',
    },
  ],
  paires3: [
    ['Sobriété numérique', 'Utiliser le numérique avec mesure pour consommer moins d’énergie'],
    ['Déconnexion', 'Faire une pause sans écran'],
    ['Serveur', 'Gros ordinateur qui garde et envoie les pages et les applications'],
  ],
  paires5: [
    ['Sobriété numérique', 'Utiliser le numérique avec mesure pour consommer moins d’énergie'],
    ['Déconnexion', 'Faire une pause sans écran'],
    ['Serveur', 'Gros ordinateur qui garde et envoie les pages et les applications'],
    ['Application', 'Programme qu’on utilise sur un écran'],
    ['Environnement', 'La nature et les lieux autour de nous'],
  ],
  libres: [
    {
      q: 'Utiliser le numérique avec mesure pour moins consommer d’énergie, c’est la … numérique (un mot).',
      accepted: ['sobriété', 'sobriete', 'la sobriété'],
      traps: [
        { text: 'vitesse', why: 'La vitesse mesure la rapidité, pas la consommation d’énergie.' },
        { text: 'abondance', why: 'L’abondance, c’est trop de tout : le contraire de la sobriété.' },
      ],
      quote: SOBRIETE,
      explain: 'La sobriété numérique consiste à consommer moins d’énergie avec ses appareils.',
    },
    {
      q: 'Faire une pause sans écran, c’est exercer son droit à la … numérique (un mot).',
      accepted: ['déconnexion', 'deconnexion', 'la déconnexion'],
      traps: [
        { text: 'connexion', why: 'La connexion, c’est être relié à internet : le contraire d’une pause.' },
        { text: 'consommation', why: 'La consommation est l’énergie utilisée, pas la pause sans écran.' },
      ],
      quote: DECONNEXION,
      explain: 'Le droit à la déconnexion protège la santé mentale et physique.',
    },
  ],
  docs: [
    {
      title: 'La tablette de Rose',
      lines: [
        'Rose laisse sa tablette allumée toute la nuit, avec des applications ouvertes.',
        'Son grand frère lui dit : « Les serveurs et les applications consomment de l’énergie. Éteins-la ! »',
        'Rose éteint la tablette et lit un livre.',
      ],
      qs: [
        {
          q: 'Que veut montrer le grand frère à Rose ?',
          a: 'que le numérique consomme de l’énergie',
          wrong: [
            { label: 'que la tablette est trop vieille', why: 'Il ne parle pas de l’âge de la tablette.' },
            { label: 'que les livres coûtent cher', why: 'Il ne parle pas du prix des livres.' },
            { label: 'que la nuit est trop courte', why: 'Il parle d’énergie, pas de la durée de la nuit.' },
          ],
          quote: SOBRIETE,
          explain: 'Les serveurs et les applications consomment de l’énergie : c’est la leçon du grand frère.',
        },
        {
          q: 'Quel geste de sobriété numérique fait Rose ?',
          a: 'elle éteint sa tablette',
          wrong: [
            { label: 'elle ouvre plus d’applications', why: 'Plus d’applications, c’est plus d’énergie consommée.' },
            { label: 'elle joue plus longtemps', why: 'Jouer plus longtemps consomme plus.' },
            { label: 'elle laisse tout allumé', why: 'Laisser tout allumé consomme de l’énergie pour rien.' },
          ],
          quote: SOBRIETE,
          explain: 'Éteindre ce qu’on n’utilise pas, c’est consommer moins d’énergie : de la sobriété numérique.',
        },
      ],
    },
    {
      title: 'La pause de Karim',
      lines: [
        'Après l’école, Karim joue trois heures sur sa console.',
        'Il est fatigué et a mal à la tête.',
        'Sa mère lui propose une pause sans écran, puis d’aller jouer dehors.',
      ],
      qs: [
        {
          q: 'Quel droit Karim exerce-t-il avec cette pause ?',
          a: 'le droit à la déconnexion numérique',
          wrong: [
            { label: 'le droit de vote', why: 'Le droit de vote sert à choisir, pas à faire une pause d’écran.' },
            { label: 'le droit à une nouvelle console', why: 'Il ne parle pas d’acheter une console.' },
            { label: 'le droit de crier', why: 'Ce n’est pas un droit et ça n’a pas de rapport avec la pause.' },
          ],
          quote: DECONNEXION,
          explain: 'Faire une pause sans écran, c’est exercer son droit à la déconnexion numérique.',
        },
        {
          q: 'Pourquoi cette pause est-elle importante ?',
          a: 'pour la santé mentale et physique',
          wrong: [
            { label: 'pour gagner plus de points', why: 'La pause n’est pas faite pour jouer mieux.' },
            { label: 'pour consommer plus d’énergie', why: 'Une pause sans écran consomme moins d’énergie.' },
            { label: 'pour effacer la console', why: 'On n’efface pas la console : on se repose.' },
          ],
          quote: DECONNEXION,
          explain: 'Karim est fatigué : la déconnexion aide son corps et sa tête.',
        },
      ],
    },
  ],
};

export const CIVISME_NUMERIQUE_SKILLS: readonly Skill[] = [
  reglesEnLigne,
  chercherInformation,
  respectEnLigne,
  alerter,
  sobriete,
].map(notion);
