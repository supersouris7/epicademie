/**
 * Anglais CM1, « Goûts et capacités » (lot an-cm1-05) : données citées.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et une citation exacte du texte consulté
 * le 25/11/2026 (copies d'archive web.archive.org des pages et fiches PDF du British Council ; programme du
 * cycle 3). Les espaces et retours à la ligne des fiches PDF et du programme sont réduits à une espace.
 */
import type { Fait } from './presentation-faits.ts';
import type { Word } from './temps-faits.ts';

/** Les sports : fiche « Sports flashcards ». */
export const SPORTS: readonly Word[] = [
  { en: 'football', fr: 'le football', alt: ['soccer'], typo: 'footbal' },
  { en: 'tennis', fr: 'le tennis', typo: 'tenis' },
  { en: 'basketball', fr: 'le basket', typo: 'basquetball' },
  { en: 'swimming', fr: 'la natation', typo: 'swiming' },
  { en: 'rugby', fr: 'le rugby', typo: 'rugbi' },
  { en: 'badminton', fr: 'le badminton', typo: 'badmington' },
  { en: 'volleyball', fr: 'le volley', typo: 'voleyball' },
  { en: 'hockey', fr: 'le hockey', typo: 'hocky' },
  { en: 'handball', fr: 'le handball', typo: 'handbal' },
  { en: 'cycling', fr: 'le cyclisme', typo: 'cicling' },
  { en: 'judo', fr: 'le judo', typo: 'judoo' },
  { en: 'golf', fr: 'le golf', typo: 'golfe' },
  { en: 'table tennis', fr: 'le tennis de table', alt: ['ping-pong', 'ping pong'], typo: 'tabel tennis' },
  { en: 'horse riding', fr: 'l’équitation', alt: ['horse-riding', 'horseriding'], typo: 'horse ridding' },
  { en: 'sailing', fr: 'la voile', typo: 'saling' },
  { en: 'rowing', fr: 'l’aviron', typo: 'rowwing' },
];

/** Les loisirs : fiche « Free time activities flashcards ». */
export const HOBBIES: readonly Word[] = [
  { en: 'watch TV', fr: 'regarder la télé', alt: ['watch television', 'watch the TV'], typo: 'wach TV' },
  { en: 'read a book', fr: 'lire un livre', typo: 'read a bouk' },
  { en: 'listen to music', fr: 'écouter de la musique', typo: 'lissen to music' },
  { en: 'write an email', fr: 'écrire un e-mail', alt: ['write an e-mail'], typo: 'write an emale' },
  { en: 'ride a bike', fr: 'faire du vélo', typo: 'ride a bik' },
  { en: 'go rollerblading', fr: 'faire du roller', typo: 'go rolerblading' },
  { en: 'go skateboarding', fr: 'faire du skate', typo: 'go skatebording' },
  { en: 'go fishing', fr: 'aller à la pêche', typo: 'go fising' },
  { en: 'play on the computer', fr: 'jouer sur l’ordinateur', typo: 'play on the computeur' },
  { en: 'play a board game', fr: 'jouer à un jeu de société', typo: 'play a bord game' },
  { en: 'play an instrument', fr: 'jouer d’un instrument', typo: 'play an instrumant' },
  { en: 'paint a picture', fr: 'peindre un tableau', typo: 'paint a pictur' },
];

/** Animaux de compagnie : fiche « Pets flashcards ». */
export const PETS: readonly Word[] = [
  { en: 'cat', fr: 'le chat', typo: 'catt' },
  { en: 'dog', fr: 'le chien', typo: 'dogg' },
  { en: 'rabbit', fr: 'le lapin', alt: ['bunny'], typo: 'rabit' },
  { en: 'hamster', fr: 'le hamster', typo: 'hamstar' },
  { en: 'guinea pig', fr: 'le cochon d’Inde', typo: 'guinee pig' },
  { en: 'mouse', fr: 'la souris', typo: 'mouce' },
  { en: 'budgie', fr: 'la perruche', alt: ['budgerigar'], typo: 'budgy' },
  { en: 'goldfish', fr: 'le poisson rouge', alt: ['gold fish'], typo: 'goldfich' },
  { en: 'parrot', fr: 'le perroquet', typo: 'parot' },
  { en: 'lizard', fr: 'le lézard', typo: 'lizzard' },
  { en: 'snake', fr: 'le serpent', typo: 'snak' },
];

/** Animaux de la ferme : fiche « Farm animals flashcards ». */
export const FARM: readonly Word[] = [
  { en: 'chicken', fr: 'la poule', alt: ['hen'], typo: 'chiken' },
  { en: 'pig', fr: 'le cochon', typo: 'pigg' },
  { en: 'goat', fr: 'la chèvre', typo: 'gote' },
  { en: 'cow', fr: 'la vache', typo: 'caw' },
  { en: 'horse', fr: 'le cheval', typo: 'hourse' },
  { en: 'sheep', fr: 'le mouton', typo: 'shep' },
];

/** Animaux sauvages et marins : fiches « Wild animals » (série 1) et « Sea animals ». */
export const WILD: readonly Word[] = [
  { en: 'lion', fr: 'le lion', typo: 'lyon' },
  { en: 'tiger', fr: 'le tigre', typo: 'tigre' },
  { en: 'elephant', fr: 'l’éléphant', typo: 'elefant' },
  { en: 'giraffe', fr: 'la girafe', typo: 'girafe' },
  { en: 'zebra', fr: 'le zèbre', typo: 'zebre' },
  { en: 'hippo', fr: 'l’hippopotame', alt: ['hippopotamus'], typo: 'hipo' },
  { en: 'crocodile', fr: 'le crocodile', typo: 'crocodil' },
  { en: 'monkey', fr: 'le singe', typo: 'monky' },
  { en: 'camel', fr: 'le chameau', typo: 'camal' },
  { en: 'kangaroo', fr: 'le kangourou', typo: 'kangourou' },
  { en: 'penguin', fr: 'le manchot', typo: 'pinguin' },
  { en: 'polar bear', fr: 'l’ours polaire', typo: 'polar bare' },
  { en: 'fox', fr: 'le renard', typo: 'foxe' },
  { en: 'tortoise', fr: 'la tortue', alt: ['turtle'], typo: 'tortuse' },
  { en: 'crab', fr: 'le crabe', typo: 'crabe' },
  { en: 'octopus', fr: 'la pieuvre', typo: 'octopuss' },
  { en: 'shark', fr: 'le requin', typo: 'sharc' },
  { en: 'dolphin', fr: 'le dauphin', typo: 'dolfin' },
  { en: 'whale', fr: 'la baleine', typo: 'wale' },
];

export const FAITS: readonly Fait[] = [
  {
    id: 'programme-gouts',
    sourceId: 'cycle3-2020',
    quote: 'exprimer ses goûts et ses sentiments',
    claim: 'Dire ses goûts est un objectif du cycle 3.',
  },
  {
    id: 'programme-loisirs',
    sourceId: 'cycle3-2020',
    quote: 'Dialoguer sur des sujets familiers (école, loisirs, maison, etc.).',
    claim: 'Les loisirs sont un sujet de dialogue du cycle 3.',
  },
  {
    id: 'programme-negation',
    sourceId: 'cycle3-2020',
    quote: 'Type et forme de phrase : déclarative, interrogative, exclamative, impérative, affirmative, négative.',
    claim: 'Dire non et poser une question sont au programme de grammaire.',
  },
  {
    id: 'programme-environnement',
    sourceId: 'cycle3-2020',
    quote: 'sa famille, son environnement concret et immédiat',
    claim: 'Les mots de l’environnement proche (dont les animaux) sont à comprendre.',
  },
  {
    id: 'programme-biodiversite',
    sourceId: 'cycle3-2020',
    quote: 'notamment les spécificités liées à la biodiversité des pays concernés',
    claim: 'Les animaux relèvent des repères sur la biodiversité.',
  },
  {
    id: 'like-usage',
    sourceId: 'bck-like',
    quote: "We can use like and don't like to say things are good or bad.",
    claim: 'like et don’t like disent ce qu’on aime ou non.',
  },
  {
    id: 'like-personnes',
    sourceId: 'bck-like',
    quote: "Use like and don't like for I, you, we and they.",
    claim: 'like, don’t like avec I, you, we, they.',
  },
  {
    id: 'like-troisieme',
    sourceId: 'bck-like',
    quote: "Use likes and doesn't like for he, she and it.",
    claim: 'likes, doesn’t like avec he, she, it.',
  },
  {
    id: 'like-exemple',
    sourceId: 'bck-like',
    quote: "We don't like vegetables.",
    claim: 'Forme négative : We don’t like…',
  },
  {
    id: 'like-question',
    sourceId: 'bck-like',
    quote: 'Do you like bananas? Yes, I do.',
    claim: 'Question avec do ; réponse courte avec do.',
  },
  {
    id: 'like-question-troisieme',
    sourceId: 'bck-like',
    quote: "Does he like the beach? No, he doesn't.",
    claim: 'Question avec does ; réponse courte avec doesn’t.',
  },
  {
    id: 'like-ing',
    sourceId: 'bck-like-ing',
    quote: "After love, like, don't mind, don't like and hate we usually use the verb with ing.",
    claim: 'Après like, le verbe prend -ing.',
  },
  {
    id: 'like-ing-exemple',
    sourceId: 'bck-like-ing',
    quote: 'I like going to the park.',
    claim: 'Exemple de like + verbe en -ing.',
  },
  {
    id: 'can-usage',
    sourceId: 'bck-can',
    quote: "We can use can and can't to talk about abilities in the present.",
    claim: 'can et can’t disent ce qu’on sait faire ou non.',
  },
  {
    id: 'can-infinitif',
    sourceId: 'bck-can',
    quote: "Use the infinitive without to after can and can't.",
    claim: 'Après can et can’t : le verbe sans to.',
  },
  {
    id: 'can-question',
    sourceId: 'bck-can',
    quote: 'For questions, change the order of can and the person.',
    claim: 'Question : Can you…?',
  },
  {
    id: 'can-reponse',
    sourceId: 'bck-can',
    quote: "Can she play the piano? No, she can't.",
    claim: 'Réponse courte : No, she can’t.',
  },
  {
    id: 'can-exemples',
    sourceId: 'bck-can',
    quote: "He can't ride a bike.",
    claim: 'can’t ne change pas avec he.',
  },
  {
    id: 'can-guitare',
    sourceId: 'bck-can',
    quote: "They can't play the guitar.",
    claim: 'play the guitar = jouer de la guitare.',
  },
  {
    id: 'can-parler',
    sourceId: 'bck-can',
    quote: 'They can speak English.',
    claim: 'speak English = parler anglais.',
  },
  {
    id: 'can-courir',
    sourceId: 'bck-can',
    quote: 'You can run fast.',
    claim: 'run fast = courir vite.',
  },
  {
    id: 'can-cannot',
    sourceId: 'bc-can-could',
    quote: "We use can't or cannot to say that something is impossible",
    claim: '« cannot » est l’autre écriture de « can’t ».',
  },
  {
    id: 'can-danser',
    sourceId: 'bc-can-could',
    quote: "They can't dance very well.",
    claim: 'dance = danser.',
  },
  {
    id: 'sports-1',
    sourceId: 'bck-flashcards-sports',
    quote: 'football tennis basketball swimming',
    claim: 'football, tennis, basketball (basket), swimming (natation).',
  },
  {
    id: 'sports-2',
    sourceId: 'bck-flashcards-sports',
    quote: 'rugby badminton volleyball hockey',
    claim: 'rugby, badminton, volleyball, hockey.',
  },
  {
    id: 'sports-3',
    sourceId: 'bck-flashcards-sports',
    quote: 'handball cycling judo golf',
    claim: 'handball, cycling (cyclisme), judo, golf.',
  },
  {
    id: 'sports-4',
    sourceId: 'bck-flashcards-sports',
    quote: 'table tennis horse riding sailing rowing',
    claim: 'table tennis, horse riding (équitation), sailing (voile), rowing (aviron).',
  },
  {
    id: 'loisirs-1',
    sourceId: 'bck-flashcards-free-time',
    quote: 'watch TV read a book listen to music write an email',
    claim: 'regarder la télé, lire, écouter de la musique, écrire un e-mail.',
  },
  {
    id: 'loisirs-2',
    sourceId: 'bck-flashcards-free-time',
    quote: 'ride a bike go rollerblading go skateboarding go fishing',
    claim: 'vélo, roller, skate, pêche.',
  },
  {
    id: 'loisirs-3',
    sourceId: 'bck-flashcards-free-time',
    quote: 'play on the computer play a board game play an instrument paint a picture',
    claim: 'ordinateur, jeu de société, instrument, peinture.',
  },
  {
    id: 'animaux-compagnie-1',
    sourceId: 'bck-flashcards-pets',
    quote: 'cat dog rabbit hamster',
    claim: 'chat, chien, lapin, hamster.',
  },
  {
    id: 'animaux-compagnie-2',
    sourceId: 'bck-flashcards-pets',
    quote: 'guinea pig mouse budgie goldfish',
    claim: 'cochon d’Inde, souris, perruche, poisson rouge.',
  },
  {
    id: 'animaux-compagnie-3',
    sourceId: 'bck-flashcards-pets',
    quote: 'parrot turtle lizard snake',
    claim: 'perroquet, lézard, serpent.',
  },
  {
    id: 'animaux-ferme-1',
    sourceId: 'bck-flashcards-farm',
    quote: 'chicken rooster turkey goose',
    claim: 'chicken = poule ou poulet.',
  },
  {
    id: 'animaux-ferme-2',
    sourceId: 'bck-flashcards-farm',
    quote: 'pig goat cow ox',
    claim: 'cochon, chèvre, vache.',
  },
  {
    id: 'animaux-ferme-3',
    sourceId: 'bck-flashcards-farm',
    quote: 'horse sheep ram lamb',
    claim: 'cheval, mouton.',
  },
  {
    id: 'animaux-sauvages-1',
    sourceId: 'bck-flashcards-wild',
    quote: 'lion tiger elephant giraffe',
    claim: 'lion, tigre, éléphant, girafe.',
  },
  {
    id: 'animaux-sauvages-2',
    sourceId: 'bck-flashcards-wild',
    quote: 'zebra hippo rhino crocodile',
    claim: 'zèbre, hippopotame, crocodile.',
  },
  {
    id: 'animaux-sauvages-3',
    sourceId: 'bck-flashcards-wild',
    quote: 'monkey chimpanzee camel kangaroo',
    claim: 'singe, chameau, kangourou.',
  },
  {
    id: 'animaux-sauvages-4',
    sourceId: 'bck-flashcards-wild',
    quote: 'penguin polar bear fox tortoise',
    claim: 'manchot, ours polaire, renard, tortue.',
  },
  {
    id: 'animaux-marins-1',
    sourceId: 'bck-flashcards-sea',
    quote: 'crab lobster octopus squid',
    claim: 'crabe, pieuvre.',
  },
  {
    id: 'animaux-marins-2',
    sourceId: 'bck-flashcards-sea',
    quote: 'shark dolphin whale dugong',
    claim: 'requin, dauphin, baleine.',
  },
];
