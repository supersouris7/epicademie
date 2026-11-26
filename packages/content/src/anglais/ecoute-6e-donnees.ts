/**
 * Anglais 6e, « Écouter et comprendre » (lot an-6e-08) : messages inventés pour les exercices et repères culturels.
 * Les repères reprennent les faits cités dans `ecoute-6e-faits.ts` ; aucun prénom d'élève réel.
 */
import type { Trap } from '../types.ts';

export const THEMES = [
  'les animaux',
  'un repas',
  'l’école',
  'le sport',
  'le temps qu’il fait',
  'la famille',
  'la maison',
  'les vêtements',
] as const;
export type Theme = (typeof THEMES)[number];

interface Gist {
  readonly context: string;
  readonly lines: readonly string[];
  readonly theme: Theme;
  /** Thèmes à ne pas proposer : le message les touche aussi. */
  readonly not?: readonly Theme[];
  readonly title: string;
  /** Mots-clés qui donnent le thème. */
  readonly keys: string;
}
const gist = (
  context: string,
  theme: Theme,
  [title, keys]: readonly [string, string],
  lines: readonly string[],
  not: readonly Theme[] = [],
): Gist => ({ context, theme, title, keys, lines, not });

export const GISTS: readonly Gist[] = [
  gist(
    'Mia envoie un message depuis une sortie.',
    'les animaux',
    ['Wild animals', '« lion », « giraffes »'],
    ['Look! I can see a lion.', 'There are two giraffes too!'],
  ),
  gist(
    'Leo envoie un message à sa voisine.',
    'les animaux',
    ['My pets', '« dog », « cat »'],
    ['I have a dog and a cat.', 'My dog is black.'],
  ),
  gist(
    'Nina laisse un message à midi.',
    'un repas',
    ['Lunch time', '« lunch », « sandwich », « apple »'],
    ['Lunch is ready.', 'There is a sandwich and an apple.'],
  ),
  gist(
    'Sam téléphone avant de se mettre à table.',
    'un repas',
    ['A good dinner', '« hungry », « dinner », « soup »'],
    ['I am very hungry.', 'What is for dinner? Soup?'],
  ),
  gist(
    'Une élève parle à son correspondant.',
    'l’école',
    ['My school day', '« maths », « English », « teacher »'],
    ['Today I have maths and English.', 'My teacher is nice.'],
  ),
  gist(
    'Un professeur parle à ses élèves.',
    'l’école',
    ['In class', '« books », « page », « listen »'],
    ['Open your books at page ten.', 'Listen, please.'],
  ),
  gist(
    'Hugo annonce une bonne nouvelle.',
    'le sport',
    ['The match', '« football », « match », « team »'],
    ['We have a football match.', 'My team is great!'],
  ),
  gist(
    'Zoé parle de son après-midi.',
    'le sport',
    ['At the pool', '« swim », « swimming pool »'],
    ['I swim every Wednesday.', 'The swimming pool is fun.'],
  ),
  gist(
    'Un homme lit un bulletin à la radio.',
    'le temps qu’il fait',
    ['Rainy weather', '« raining », « cold », « windy »'],
    ['It is raining today.', 'It is cold and windy.'],
  ),
  gist(
    'Une amie écrit de ses vacances.',
    'le temps qu’il fait',
    ['Sunny holidays', '« sunny », « hot »'],
    ['It is sunny here.', 'It is very hot!'],
  ),
  gist(
    'Tom présente une photo.',
    'la famille',
    ['My family', '« mother », « brother », « sister »'],
    ['This is my mother.', 'I have one brother and one sister.'],
  ),
  gist(
    'Lisa décrit l’endroit où elle vit.',
    'la maison',
    ['My house', '« house », « kitchen », « bedroom »'],
    ['My house is small.', 'The kitchen is next to my bedroom.'],
    ['un repas'],
  ),
  gist(
    'Emir se prépare à sortir.',
    'les vêtements',
    ['What I wear', '« pullover », « boots », « wearing »'],
    ['I am wearing a blue pullover.', 'My boots are black.'],
  ),
];

export interface Detail {
  readonly context: string;
  readonly lines: readonly string[];
  readonly question: string;
  readonly good: string;
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  /** Phrase anglaise qui donne la réponse. */
  readonly key: string;
  readonly why: string;
}
const options = (...rows: readonly (readonly [string, string])[]) => rows.map(([label, why]) => ({ label, why }));

export const DETAILS: readonly Detail[] = [
  {
    context: 'Mia appelle son ami.',
    lines: ['I am not at the library.', 'I am in the park, next to the cinema.'],
    question: 'Où se trouve Mia ?',
    good: 'au parc',
    wrong: options(
      ['à la bibliothèque', '« I am not at the library » : elle n’y est pas.'],
      ['au cinéma', '« next to the cinema » : à côté du cinéma, pas dedans.'],
      ['à la piscine', 'La piscine n’est pas dans le message.'],
    ),
    key: 'I am in the park, next to the cinema.',
    why: '« in the park » dit où elle est ; le cinéma sert seulement de repère.',
  },
  {
    context: 'Leo parle de son sport.',
    lines: ['I like football, but I play tennis on Friday.'],
    question: 'Que fait Leo le vendredi ?',
    good: 'du tennis',
    wrong: options(
      ['du football', 'Il aime le football, mais le vendredi il joue au tennis.'],
      ['de la natation', 'La natation n’est pas dans le message.'],
      ['du vélo', 'Le vélo n’est pas dans le message.'],
    ),
    key: 'I play tennis on Friday.',
    why: '« but » annonce l’information qui répond à la question.',
  },
  {
    context: 'Nina commande au café.',
    lines: ['Can I have a sandwich and an orange juice, please?', 'No cake today, thank you.'],
    question: 'Que commande Nina à boire ?',
    good: 'un jus d’orange',
    wrong: options(
      ['de l’eau', 'L’eau n’est pas dans le message.'],
      ['un jus de pomme', 'On entend « orange juice », pas « apple juice ».'],
      ['du lait', 'Le lait n’est pas dans le message.'],
    ),
    key: 'Can I have a sandwich and an orange juice, please?',
    why: '« orange juice » = jus d’orange.',
  },
  {
    context: 'Sam donne un rendez-vous.',
    lines: ['The film is at five o’clock.', 'Let’s meet at half past four.'],
    question: 'À quelle heure Sam veut-il retrouver son ami ?',
    good: '4:30',
    wrong: options(
      ['5:00', '5 h est l’heure du film, pas celle du rendez-vous.'],
      ['5:30', '« half past four » : on a passé 4 heures, pas 5.'],
      ['4:00', '« half past » ajoute une demi-heure.'],
    ),
    key: 'Let’s meet at half past four.',
    why: '« Let’s meet at… » donne l’heure du rendez-vous.',
  },
  {
    context: 'Zoé décrit son cartable.',
    lines: ['In my bag, I have two books and a ruler.', 'I haven’t got a pen today.'],
    question: 'Quel objet manque à Zoé ?',
    good: 'un stylo',
    wrong: options(
      ['une règle', '« I have… a ruler » : elle l’a.'],
      ['des livres', '« I have two books » : elle les a.'],
      ['un cartable', 'Elle parle de ce qui est dans son cartable : elle l’a.'],
    ),
    key: 'I haven’t got a pen today.',
    why: '« haven’t got » = je n’ai pas.',
  },
  {
    context: 'Hugo parle de sa famille.',
    lines: ['My sister is twelve.', 'My brother is only eight.'],
    question: 'Quel âge a le frère de Hugo ?',
    good: '8 ans',
    wrong: options(
      ['12 ans', '12 ans est l’âge de sa sœur.'],
      ['18 ans', '« eight » = 8 ; « eighteen » = 18.'],
      ['2 ans', '« twelve » commence comme « two », mais il vaut 12 et concerne la sœur.'],
    ),
    key: 'My brother is only eight.',
    why: '« brother » = frère, et le nombre qui le suit est « eight ».',
  },
  {
    context: 'Un guide parle au musée.',
    lines: ['You can take photos here, but you mustn’t touch the paintings.'],
    question: 'Qu’est-il interdit de faire ?',
    good: 'toucher les tableaux',
    wrong: options(
      ['prendre des photos', '« You can take photos » : c’est autorisé.'],
      ['parler', 'Parler n’est pas dans le message.'],
      ['manger', 'Manger n’est pas dans le message.'],
    ),
    key: 'You mustn’t touch the paintings.',
    why: '« mustn’t » exprime une interdiction.',
  },
  {
    context: 'Emma parle du week-end.',
    lines: ['On Saturday I visit my aunt.', 'On Sunday I stay at home.'],
    question: 'Que fait Emma le dimanche ?',
    good: 'elle reste à la maison',
    wrong: options(
      ['elle rend visite à sa tante', 'La visite à sa tante a lieu samedi (« Saturday »).'],
      ['elle va à l’école', 'L’école n’est pas dans le message.'],
      ['elle joue un match', 'Aucun match n’est annoncé.'],
    ),
    key: 'On Sunday I stay at home.',
    why: '« Sunday » = dimanche ; « stay at home » = rester à la maison.',
  },
];

interface Info {
  readonly en: string;
  readonly accepted: readonly string[];
}
interface Wrong {
  readonly fr: string;
  readonly why: string;
}
export interface Form {
  readonly from: string;
  readonly topic: string;
  /** Phrase qui contient des informations à écarter. */
  readonly other: string;
  /** Événement, tel qu'il commence la phrase du jour. */
  readonly event: string;
  readonly day: Info;
  readonly place: Info;
  readonly bring: Info;
  readonly traps: Readonly<Record<'day' | 'place' | 'bring', readonly Wrong[]>>;
}
const info = (en: string, ...accepted: string[]): Info => ({ en, accepted });
const wrong = (fr: string, why: string): Wrong => ({ fr, why });
const day = (en: string, fr: string) => info(en, fr, `le ${fr}`);

export const FORMS: readonly Form[] = [
  {
    from: 'Tom',
    topic: 'un match de football',
    other: 'On Monday I am busy.',
    event: 'The football match',
    day: day('Saturday', 'samedi'),
    place: info('at the stadium', 'au stade', 'le stade', 'stade'),
    bring: info(
      'your boots',
      'des bottes',
      'les bottes',
      'tes bottes',
      'bottes',
      'chaussures',
      'tes chaussures',
      'des crampons',
      'crampons',
    ),
    traps: {
      day: [wrong('lundi', '« On Monday I am busy » : lundi, il n’est pas libre.')],
      place: [wrong('à l’école', 'L’école n’est pas citée : le lieu suit « Meet me ».')],
      bring: [wrong('un ballon', 'Le message ne demande pas de ballon : écoute après « bring ».')],
    },
  },
  {
    from: 'Mia',
    topic: 'un pique-nique',
    other: 'I am not free on Friday.',
    event: 'The picnic',
    day: day('Sunday', 'dimanche'),
    place: info('in the park', 'au parc', 'le parc', 'parc', 'dans le parc'),
    bring: info('a cake', 'un gâteau', 'le gâteau', 'gâteau'),
    traps: {
      day: [wrong('vendredi', 'Vendredi, Mia n’est pas libre.')],
      place: [wrong('à la plage', 'La plage n’est pas citée : le lieu suit « Meet me ».')],
      bring: [wrong('un sandwich', 'Aucun sandwich : écoute après « bring ».')],
    },
  },
  {
    from: 'Leo',
    topic: 'un exposé à préparer',
    other: 'On Tuesday I have a music lesson.',
    event: 'Our project day',
    day: day('Thursday', 'jeudi'),
    place: info('at the library', 'à la bibliothèque', 'la bibliothèque', 'bibliothèque'),
    bring: info('your dictionary', 'un dictionnaire', 'le dictionnaire', 'ton dictionnaire', 'dictionnaire'),
    traps: {
      day: [wrong('mardi', '« Tuesday » (mardi) est le jour du cours de musique. « Thursday » = jeudi.')],
      place: [wrong('à la maison', 'La maison n’est pas citée : le lieu suit « Meet me ».')],
      bring: [wrong('un stylo', 'Aucun stylo : écoute après « bring ».')],
    },
  },
  {
    from: 'Nina',
    topic: 'une sortie à la piscine',
    other: 'On Saturday I visit my uncle.',
    event: 'The swimming trip',
    day: day('Wednesday', 'mercredi'),
    place: info('at the swimming pool', 'à la piscine', 'la piscine', 'piscine'),
    bring: info('a towel', 'une serviette', 'la serviette', 'ta serviette', 'serviette'),
    traps: {
      day: [wrong('samedi', 'Samedi, Nina va voir son oncle.')],
      place: [wrong('à la mer', 'La mer n’est pas citée : le lieu suit « Meet me ».')],
      bring: [wrong('un maillot de bain', 'Le message demande « a towel » : une serviette.')],
    },
  },
  {
    from: 'Sam',
    topic: 'une fête d’anniversaire',
    other: 'My birthday is not on Sunday this year.',
    event: 'My party',
    day: day('Friday', 'vendredi'),
    place: info('at my house', 'chez Sam', 'chez lui', 'à sa maison', 'la maison de Sam', 'sa maison'),
    bring: info('some music', 'de la musique', 'la musique', 'musique'),
    traps: {
      day: [wrong('dimanche', '« not on Sunday » : ce n’est pas dimanche.')],
      place: [wrong('à l’école', 'L’école n’est pas citée : « at my house », chez lui.')],
      bring: [wrong('un gâteau', 'Aucun gâteau : écoute après « bring ».')],
    },
  },
  {
    from: 'Zoé',
    topic: 'une promenade avec les chiens',
    other: 'On Thursday it is going to rain.',
    event: 'Our walk',
    day: day('Tuesday', 'mardi'),
    place: info('at the station', 'à la gare', 'la gare', 'gare'),
    bring: info('your cap', 'une casquette', 'la casquette', 'ta casquette', 'casquette'),
    traps: {
      day: [wrong('jeudi', '« Thursday » (jeudi) : il va pleuvoir. « Tuesday » = mardi.')],
      place: [wrong('au parc', 'Le parc n’est pas cité : le lieu suit « Meet me ».')],
      bring: [wrong('un parapluie', 'Aucun parapluie : écoute après « bring ».')],
    },
  },
];

interface Story {
  readonly from: string;
  readonly topic: string;
  readonly lines: readonly string[];
  /** Actions en français, dans l'ordre où elles se passent. */
  readonly actions: readonly string[];
  readonly how: string;
}

export const STORIES: readonly Story[] = [
  {
    from: 'Mia',
    topic: 'son mercredi',
    lines: [
      'This afternoon I am going to the cinema.',
      'But first, I am doing my homework.',
      'Then I am having lunch.',
      'Finally, after the film, I am calling my grandmother.',
    ],
    actions: ['faire ses devoirs', 'déjeuner', 'aller au cinéma', 'appeler sa grand-mère'],
    how: '« But first » place les devoirs avant tout, « Then » le déjeuner, puis le cinéma de l’après-midi ; « after the film » termine.',
  },
  {
    from: 'Leo',
    topic: 'son samedi',
    lines: [
      'I am playing football at ten.',
      'Before that, I am having breakfast.',
      'After the match, I am visiting my uncle.',
      'Finally, I am watching a film.',
    ],
    actions: ['prendre le petit déjeuner', 'jouer au football', 'rendre visite à son oncle', 'regarder un film'],
    how: '« Before that » place le petit déjeuner avant le football ; « After the match » puis « Finally » donnent la suite.',
  },
  {
    from: 'Nina',
    topic: 'sa soirée',
    lines: [
      'First, I am feeding my cat.',
      'I am going to bed at nine.',
      'But before that, I am having dinner and then I am reading a book.',
    ],
    actions: ['nourrir son chat', 'dîner', 'lire un livre', 'se coucher'],
    how: '« First » ouvre la liste ; « before that » ramène le dîner puis la lecture avant le coucher.',
  },
  {
    from: 'Sam',
    topic: 'sa sortie en ville',
    lines: [
      'First, I am taking the bus.',
      'Then I am meeting my friends.',
      'We are eating an ice cream after the museum.',
      'Before the ice cream, we are visiting the museum.',
    ],
    actions: ['prendre le bus', 'retrouver ses amis', 'visiter le musée', 'manger une glace'],
    how: '« First », « Then », puis « after the museum » : le musée précède la glace.',
  },
  {
    from: 'Zoé',
    topic: 'son dimanche',
    lines: [
      'In the evening I am tidying my room.',
      'In the morning I am walking the dog.',
      'At noon I am cooking with my father.',
      'In the afternoon I am drawing.',
    ],
    actions: ['promener le chien', 'cuisiner avec son père', 'dessiner', 'ranger sa chambre'],
    how: 'Les moments de la journée donnent l’ordre : « morning », « noon », « afternoon », « evening ».',
  },
];

export interface Update {
  readonly context: string;
  readonly lines: readonly string[];
  readonly question: string;
  readonly good: string;
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  readonly key: string;
  readonly why: string;
}

export const UPDATES: readonly Update[] = [
  {
    context: 'Tom corrige son invitation.',
    lines: ['Don’t come on Tuesday.', 'The party is on Thursday.', 'Come at six o’clock, not at five.'],
    question: 'Quand faut-il venir ?',
    good: 'jeudi à 6:00',
    wrong: options(
      ['mardi à 6:00', '« Don’t come on Tuesday » : surtout pas mardi.'],
      ['jeudi à 5:00', '« not at five » : l’heure est six heures.'],
      ['mardi à 5:00', 'Le jour et l’heure ont changé tous les deux.'],
    ),
    key: 'The party is on Thursday. Come at six o’clock, not at five.',
    why: '« Don’t… » et « not » écartent l’ancienne information.',
  },
  {
    context: 'Le club de sport laisse un message.',
    lines: ['We are not playing at the stadium today.', 'Meet us at the sports hall, at half past two.'],
    question: 'Où et à quelle heure faut-il se retrouver ?',
    good: 'au gymnase à 2:30',
    wrong: options(
      ['au stade à 2:30', '« not … at the stadium » : le lieu a changé.'],
      ['au gymnase à 3:30', '« half past two » : on a passé 2 heures, pas 3.'],
      ['au stade à 3:30', 'Ni le lieu ni l’heure ne correspondent.'],
    ),
    key: 'Meet us at the sports hall, at half past two.',
    why: '« sports hall » = gymnase ; « half past two » = 2 h 30.',
  },
  {
    context: 'Maman change le menu.',
    lines: ['We are not having pizza tonight.', 'Please buy some bread and some eggs.', 'Don’t buy milk.'],
    question: 'Que faut-il acheter ?',
    good: 'du pain et des œufs',
    wrong: options(
      ['de la pizza', '« We are not having pizza » : pas de pizza ce soir.'],
      ['du pain et du lait', '« Don’t buy milk » : pas de lait.'],
      ['du lait et des œufs', '« Don’t buy milk » : pas de lait.'],
    ),
    key: 'Please buy some bread and some eggs.',
    why: '« Please buy… » donne la liste ; « Don’t buy… » écarte le lait.',
  },
  {
    context: 'La professeure parle de la sortie.',
    lines: ['Don’t bring your books tomorrow.', 'Bring a packed lunch and wear your boots.'],
    question: 'Que faut-il prévoir ?',
    good: 'un pique-nique et des bottes',
    wrong: options(
      ['des livres et des bottes', '« Don’t bring your books » : pas de livres.'],
      ['des livres et un pique-nique', '« Don’t bring your books » : pas de livres.'],
      ['une casquette et un pique-nique', 'La casquette n’est pas dans le message.'],
    ),
    key: 'Bring a packed lunch and wear your boots.',
    why: '« packed lunch » = repas à emporter ; « boots » = bottes.',
  },
  {
    context: 'Le cinéma modifie une séance.',
    lines: ['The film doesn’t start at four.', 'It starts at quarter past four, in room two.'],
    question: 'Quelle est la bonne information ?',
    good: '4:15, salle 2',
    wrong: options(
      ['4:00, salle 2', '« doesn’t start at four » : l’horaire a changé.'],
      ['3:45, salle 2', '« quarter past » = et quart, pas moins le quart.'],
      ['4:15, salle 4', 'La salle est « room two ».'],
    ),
    key: 'It starts at quarter past four, in room two.',
    why: '« quarter past four » = 4 h 15.',
  },
];

export interface Culture {
  readonly id: string;
  readonly theme: 'fête' | 'lieu' | 'histoire';
  readonly question: string;
  readonly answer: string;
  /** Trois propositions fausses (les deux premières servent au niveau 1). */
  readonly wrong: readonly { readonly label: string; readonly why: string }[];
  /** Fait à retenir, en français. */
  readonly fact: string;
  readonly pair: readonly [string, string];
  /** Saisie courte : en français (niveau 3) ou en anglais (`english`, niveau 4). */
  readonly typed?: {
    readonly english?: true;
    readonly prompt: string;
    readonly accepted: readonly string[];
    readonly traps: readonly Trap[];
  };
  readonly document?: {
    readonly title: string;
    readonly lines: readonly string[];
    readonly question: string;
    readonly good: string;
    readonly wrong: readonly { readonly label: string; readonly why: string }[];
    readonly clues: string;
  };
}

const trap = (text: string, why: string): Trap => ({ text, why });
const country = (name: string, article: string) => [name, `${article}${name}`, `en ${name}`];

export const CULTURE: readonly Culture[] = [
  {
    id: 'patrick',
    theme: 'fête',
    question: 'Quelle fête a lieu le 17 mars en Irlande ?',
    answer: 'Saint Patrick’s Day',
    wrong: options(
      ['Thanksgiving', 'Thanksgiving est une fête américaine, en novembre.'],
      ['Bonfire Night', 'Bonfire Night a lieu le 5 novembre.'],
      ['Halloween', 'Halloween a lieu le 31 octobre.'],
    ),
    fact: 'Saint Patrick’s Day, fête nationale irlandaise, a lieu le 17 mars ; on s’habille en vert.',
    pair: ['Saint Patrick’s Day', '17 mars'],
    typed: {
      english: true,
      prompt: 'Écris en anglais le nom de la fête irlandaise du 17 mars.',
      accepted: [
        'Saint Patrick’s Day',
        'St Patrick’s Day',
        'St. Patrick’s Day',
        'Saint Patricks Day',
        'St Patricks Day',
        'Saint Patrick’s',
        'St Patrick’s',
      ],
      traps: [trap('Thanksgiving', 'Thanksgiving est une fête américaine, en novembre.')],
    },
    document: {
      title: 'A festival',
      lines: [
        'Today there is a big parade in Dublin.',
        'People dance to traditional music.',
        'Everyone is dressed in green.',
      ],
      question: 'De quelle fête s’agit-il ?',
      good: 'Saint Patrick’s Day',
      wrong: options(
        ['Bonfire Night', 'Bonfire Night se fête avec des feux, au Royaume-Uni.'],
        ['Thanksgiving', 'Thanksgiving se fête aux États-Unis, autour d’un repas.'],
        ['Pancake Day', 'Pancake Day se fête avec des crêpes.'],
      ),
      clues: '« Dublin », « parade », « green »',
    },
  },
  {
    id: 'vert',
    theme: 'fête',
    question: 'De quelle couleur s’habille-t-on pour Saint Patrick’s Day ?',
    answer: 'en vert',
    wrong: options(
      ['en rouge', 'La couleur de la fête de Saint Patrick n’est pas le rouge.'],
      ['en bleu', 'La couleur de la fête de Saint Patrick n’est pas le bleu.'],
      ['en violet', 'La couleur de la fête de Saint Patrick n’est pas le violet.'],
    ),
    fact: 'Pour Saint Patrick’s Day, tout le monde s’habille en vert (green).',
    pair: ['la couleur de Saint Patrick’s Day', 'le vert'],
    typed: {
      prompt: 'Écris en français la couleur que l’on porte pour Saint Patrick’s Day.',
      accepted: ['vert', 'le vert', 'en vert'],
      traps: [trap('rouge', 'La couleur de cette fête n’est pas le rouge.')],
    },
  },
  {
    id: 'trefle',
    theme: 'fête',
    question: 'Quel est le symbole de l’Irlande porté pour Saint Patrick’s Day (« shamrock ») ?',
    answer: 'le trèfle',
    wrong: options(
      ['la citrouille', 'La citrouille est liée à Halloween.'],
      ['la dinde', 'La dinde est liée à Thanksgiving.'],
      ['la crêpe', 'La crêpe est liée à Pancake Day.'],
    ),
    fact: 'Le « shamrock », le trèfle, est un symbole de l’Irlande.',
    pair: ['shamrock', 'le trèfle'],
    typed: {
      english: true,
      prompt: 'Écris en anglais le nom du trèfle, symbole de l’Irlande.',
      accepted: ['shamrock', 'a shamrock', 'the shamrock'],
      traps: [trap('pumpkin', '« pumpkin » veut dire « citrouille ».')],
    },
  },
  {
    id: 'dublin',
    theme: 'lieu',
    question: 'Quelle est la capitale de l’Irlande ?',
    answer: 'Dublin',
    wrong: options(
      ['Londres', 'Londres n’est pas en Irlande.'],
      ['Nairobi', 'Nairobi est liée au Kenya.'],
      ['Glasgow', 'Glasgow n’est pas la capitale de l’Irlande.'],
    ),
    fact: 'Dublin est la capitale de l’Irlande.',
    pair: ['Dublin', 'capitale de l’Irlande'],
    typed: {
      english: true,
      prompt: 'Écris le nom de la capitale de l’Irlande.',
      accepted: ['Dublin'],
      traps: [trap('London', 'Londres n’est pas en Irlande.')],
    },
  },
  {
    id: 'thanksgiving',
    theme: 'fête',
    question: 'Quelle fête américaine a lieu en novembre, autour d’une dinde ?',
    answer: 'Thanksgiving',
    wrong: options(
      ['Saint Patrick’s Day', 'Saint Patrick’s Day est une fête irlandaise, le 17 mars.'],
      ['Pancake Day', 'Pancake Day tombe en février ou en mars.'],
      ['Halloween', 'Halloween a lieu le 31 octobre.'],
    ),
    fact: 'Thanksgiving, tradition américaine de novembre : on mange traditionnellement de la dinde (turkey).',
    pair: ['Thanksgiving', 'la dinde, aux États-Unis'],
    typed: {
      english: true,
      prompt: 'Écris en anglais le nom de la fête américaine de novembre où l’on mange de la dinde.',
      accepted: ['Thanksgiving', 'Thanksgiving Day', 'Thanks giving'],
      traps: [trap('Halloween', 'Halloween a lieu le 31 octobre.')],
    },
    document: {
      title: 'A family meal',
      lines: [
        'It is a Thursday in November.',
        'My American family has a big meal.',
        'There is turkey and there are pies.',
      ],
      question: 'De quelle fête s’agit-il ?',
      good: 'Thanksgiving',
      wrong: options(
        ['Halloween', 'Halloween a lieu le 31 octobre, avec des déguisements.'],
        ['Saint Patrick’s Day', 'Saint Patrick’s Day a lieu en mars.'],
        ['Pancake Day', 'Pancake Day tombe en février ou en mars, avec des crêpes.'],
      ),
      clues: '« November », « American », « turkey »',
    },
  },
  {
    id: 'halloween',
    theme: 'fête',
    question: 'Quelle fête a lieu le 31 octobre, avec des citrouilles-lanternes ?',
    answer: 'Halloween',
    wrong: options(
      ['Christmas', 'Christmas a lieu le 25 décembre.'],
      ['Bonfire Night', 'Bonfire Night a lieu le 5 novembre.'],
      ['Thanksgiving', 'Thanksgiving a lieu en novembre.'],
    ),
    fact: 'Halloween, le 31 octobre : citrouilles-lanternes, déguisements et bonbons.',
    pair: ['Halloween', '31 octobre'],
    typed: {
      prompt: 'À quelle date a lieu Halloween ? Écris le jour et le mois en français.',
      accepted: ['31 octobre', 'le 31 octobre', '31/10'],
      traps: [trap('5 novembre', 'Le 5 novembre est la date de Bonfire Night.')],
    },
    document: {
      title: 'An autumn evening',
      lines: ['It is the 31st of October.', 'We wear fancy-dress costumes.', 'Children ask for sweets.'],
      question: 'De quelle fête s’agit-il ?',
      good: 'Halloween',
      wrong: options(
        ['Christmas', 'Christmas a lieu le 25 décembre.'],
        ['Bonfire Night', 'Bonfire Night a lieu le 5 novembre.'],
        ['Pancake Day', 'Pancake Day tombe en février ou en mars.'],
      ),
      clues: '« 31st of October », « costumes », « sweets »',
    },
  },
  {
    id: 'bonfire',
    theme: 'fête',
    question: 'Quelle fête du Royaume-Uni a lieu le 5 novembre, avec des feux d’artifice ?',
    answer: 'Bonfire Night',
    wrong: options(
      ['Halloween', 'Halloween a lieu le 31 octobre.'],
      ['Pancake Day', 'Pancake Day tombe en février ou en mars.'],
      ['Saint Patrick’s Day', 'Saint Patrick’s Day a lieu le 17 mars.'],
    ),
    fact: 'Bonfire Night, le 5 novembre au Royaume-Uni : feux de joie et feux d’artifice.',
    pair: ['Bonfire Night', '5 novembre'],
    typed: {
      english: true,
      prompt: 'Écris en anglais le nom de la fête britannique du 5 novembre.',
      accepted: ['Bonfire Night', 'Guy Fawkes Night', 'Fireworks Night'],
      traps: [trap('Halloween', 'Halloween a lieu le 31 octobre.')],
    },
  },
  {
    id: 'pancake',
    theme: 'fête',
    question: 'Pour quelle fête mange-t-on des crêpes, un mardi de février ou de mars ?',
    answer: 'Pancake Day',
    wrong: options(
      ['Christmas', 'Christmas a lieu le 25 décembre.'],
      ['Thanksgiving', 'Thanksgiving a lieu en novembre.'],
      ['Bonfire Night', 'Bonfire Night a lieu le 5 novembre.'],
    ),
    fact: 'Pancake Day tombe un mardi de février ou de mars : on mange des crêpes.',
    pair: ['Pancake Day', 'les crêpes'],
    typed: {
      prompt: 'Écris en français ce que l’on mange pour Pancake Day.',
      accepted: ['des crêpes', 'les crêpes', 'crêpes', 'une crêpe', 'des crepes', 'crepes'],
      traps: [trap('de la dinde', 'La dinde est liée à Thanksgiving.')],
    },
  },
  {
    id: 'highlands',
    theme: 'lieu',
    question: 'Dans quel pays se trouvent les Highlands ?',
    answer: 'en Écosse',
    wrong: options(
      ['en Irlande', 'Les Highlands ne sont pas en Irlande.'],
      ['au Kenya', 'Le Kenya est connu ici pour ses parcs nationaux.'],
      ['aux États-Unis', 'Les Highlands ne sont pas aux États-Unis.'],
    ),
    fact: 'Les Highlands sont en Écosse (Scotland).',
    pair: ['les Highlands', 'l’Écosse'],
    typed: {
      prompt: 'Écris en français le nom du pays où se trouvent les Highlands.',
      accepted: [...country('Écosse', 'l’'), ...country('Ecosse', 'l’')],
      traps: [trap('Irlande', 'Les Highlands ne sont pas en Irlande.')],
    },
  },
  {
    id: 'mississippi',
    theme: 'lieu',
    question: 'Qu’est-ce que le Mississippi ?',
    answer: 'un fleuve',
    wrong: options(
      ['une montagne', 'Le Mississippi est un cours d’eau.'],
      ['un parc national', 'Le parc national de ces repères est celui de Nairobi.'],
      ['une fête', 'Ce n’est pas une fête.'],
    ),
    fact: 'Le Mississippi est un fleuve.',
    pair: ['le Mississippi', 'un fleuve'],
    typed: {
      prompt: 'Qu’est-ce que le Mississippi ? Réponds en français, en complétant : « C’est un … ».',
      accepted: ['fleuve', 'un fleuve', 'le fleuve', 'c’est un fleuve'],
      traps: [trap('rivière', 'Le programme parle d’un fleuve : un grand cours d’eau qui rejoint la mer.')],
    },
  },
  {
    id: 'nairobi',
    theme: 'lieu',
    question: 'Dans quel pays peut-on visiter le parc national de Nairobi ?',
    answer: 'au Kenya',
    wrong: options(
      ['en Écosse', 'L’Écosse est connue ici pour les Highlands.'],
      ['en Irlande', 'Dublin est en Irlande, pas Nairobi.'],
      ['au Canada', 'Le parc national de Nairobi n’est pas au Canada.'],
    ),
    fact: 'Le parc national de Nairobi est au Kenya : on peut y voir des rhinocéros noirs et des girafes.',
    pair: ['Nairobi National Park', 'le Kenya'],
    typed: {
      prompt: 'Écris en français le nom du pays du parc national de Nairobi.',
      accepted: ['Kenya', 'le Kenya', 'au Kenya'],
      traps: [trap('Nairobi', 'Nairobi donne son nom au parc ; on demande le pays.')],
    },
    document: {
      title: 'A postcard',
      lines: ['I am in a national park near Nairobi.', 'I can see black rhinos and giraffes in the wild.'],
      question: 'Dans quel pays est la personne qui écrit ?',
      good: 'au Kenya',
      wrong: options(
        ['en Écosse', 'L’Écosse est connue ici pour les Highlands.'],
        ['en Irlande', 'Nairobi n’est pas en Irlande.'],
        ['au Royaume-Uni', 'Nairobi n’est pas au Royaume-Uni.'],
      ),
      clues: '« Nairobi », « black rhinos », « giraffes »',
    },
  },
  {
    id: 'harry',
    theme: 'histoire',
    question: 'Dans quelle école Harry Potter est-il élève ?',
    answer: 'Hogwarts',
    wrong: options(
      ['Highlands', 'Les Highlands sont une région d’Écosse, pas une école.'],
      ['Dublin', 'Dublin est la capitale de l’Irlande.'],
      ['Mississippi', 'Le Mississippi est un fleuve.'],
    ),
    fact: 'Harry Potter, sorcier britannique, est élève à Hogwarts (Poudlard).',
    pair: ['Harry Potter', 'Hogwarts'],
    typed: {
      english: true,
      prompt: 'Écris en anglais le nom de l’école de Harry Potter.',
      accepted: ['Hogwarts'],
      traps: [trap('Poudlard', '« Poudlard » est le nom français : on demande le nom anglais.')],
    },
    document: {
      title: 'A famous character',
      lines: ['He is a British wizard.', 'He has short black hair and round glasses.', 'He is a pupil of Hogwarts.'],
      question: 'Qui est ce personnage ?',
      good: 'Harry Potter',
      wrong: options(
        ['Finn McCool', 'Finn McCool est un géant d’une légende irlandaise.'],
        ['the Grinch', 'Le Grinch est le personnage qui déteste Noël.'],
        ['Saint Patrick', 'Saint Patrick est le saint patron de l’Irlande.'],
      ),
      clues: '« wizard », « glasses », « Hogwarts »',
    },
  },
  {
    id: 'finn',
    theme: 'histoire',
    question: 'Qui est Finn McCool ?',
    answer: 'un géant d’une légende irlandaise',
    wrong: options(
      ['un élève sorcier', 'L’élève sorcier de ces repères est Harry Potter.'],
      ['un personnage qui déteste Noël', 'Celui qui déteste Noël est le Grinch.'],
      ['un président américain', 'Finn McCool est un héros de légende.'],
    ),
    fact: 'Finn McCool, géant et héros populaire d’Irlande, construit dans la légende la Giant’s Causeway pour aller en Écosse.',
    pair: ['Finn McCool', 'un géant d’Irlande'],
    document: {
      title: 'A legend',
      lines: ['A wise giant lives in Ireland.', 'He builds a causeway to go to Scotland.'],
      question: 'Qui est ce géant ?',
      good: 'Finn McCool',
      wrong: options(
        ['Harry Potter', 'Harry Potter est un jeune sorcier, pas un géant.'],
        ['the Grinch', 'Le Grinch est le personnage qui déteste Noël.'],
        ['Saint Patrick', 'Saint Patrick est le saint patron de l’Irlande, pas un géant.'],
      ),
      clues: '« giant », « Ireland », « causeway »',
    },
  },
  {
    id: 'chaussee',
    theme: 'histoire',
    question: 'Dans la légende, vers quel pays Finn McCool veut-il aller en construisant la Giant’s Causeway ?',
    answer: 'l’Écosse',
    wrong: options(
      ['le Kenya', 'Le Kenya n’est pas dans cette légende.'],
      ['les États-Unis', 'La légende ne parle pas des États-Unis.'],
      ['la France', 'La légende ne parle pas de la France.'],
    ),
    fact: 'Finn McCool construit la Giant’s Causeway (Chaussée des Géants) pour aller en Écosse.',
    pair: ['la Giant’s Causeway', 'un chemin vers l’Écosse'],
    typed: {
      english: true,
      prompt: 'Écris en anglais le nom de la chaussée construite par Finn McCool.',
      accepted: ['Giant’s Causeway', 'the Giant’s Causeway', 'Giants Causeway', 'the Giants Causeway'],
      traps: [trap('Highlands', 'Les Highlands sont une région d’Écosse.')],
    },
  },
  {
    id: 'grinch',
    theme: 'histoire',
    question: 'Quel personnage déteste Noël ?',
    answer: 'the Grinch',
    wrong: options(
      ['Harry Potter', 'Harry Potter est un élève sorcier.'],
      ['Finn McCool', 'Finn McCool est un géant d’Irlande.'],
      ['Saint Patrick', 'Saint Patrick est le saint patron de l’Irlande.'],
    ),
    fact: 'The Grinch can’t stand Christmas : le Grinch déteste Noël.',
    pair: ['the Grinch', 'il déteste Noël'],
  },
];
