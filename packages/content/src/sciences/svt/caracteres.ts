import type { Skill } from '../../types.ts';
import { qcm } from './kit.ts';
import { avecFiches, CARACTERES, communs, compter, fiches, Maj } from './classification-kit.ts';
import { ARBRE, CLASSER } from './donnees-classification.ts';
import { PROGRAMME } from './donnees.ts';
import { associer, choisir, completer, ecrire, generer, type Modele } from './nutrition-kit.ts';

// ——— Caractères partagés : ce que les êtres vivants possèdent en commun ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Sur quoi se fonde-t-on pour réunir des êtres vivants dans un même groupe de la classification ?',
    'Sur les caractères qu’ils possèdent en commun',
    [
      ['Sur le lieu où ils vivent', 'Vivre au même endroit ne dit pas ce que les êtres vivants possèdent.'],
      [
        'Sur leur utilité pour les humains',
        'L’utilité sert à d’autres rangements, pas à la classification scientifique.',
      ],
    ],
    'Pense à ce que chaque être vivant « possède ».',
    'On réunit les êtres vivants en fonction des caractères qu’ils ont en commun.',
  ),
  choisir(
    'Quel caractère partagent tous les mammifères ?',
    'Des mamelles',
    [
      ['Des plumes', 'Les plumes sont le caractère des oiseaux.'],
      ['Six pattes', 'Six pattes, c’est le caractère des insectes.'],
    ],
    'Pense à la façon dont les petits sont nourris.',
    'Les mammifères sont les animaux à mamelles.',
  ),
  choisir(
    'Quel caractère partagent tous les vertébrés ?',
    'Des vertèbres',
    [
      ['Des mamelles', 'Seuls les mammifères ont des mamelles.'],
      ['Un squelette externe', 'Le squelette externe est un caractère des arthropodes.'],
    ],
    'Le nom du groupe t’aide.',
    'Les vertébrés sont les animaux avec des vertèbres.',
  ),
  choisir(
    'Parmi ces animaux actuels, lesquels possèdent des plumes ?',
    'Les oiseaux',
    [
      ['Les mammifères', 'Les mammifères ont des mamelles, pas des plumes.'],
      ['Les insectes', 'Les insectes ont six pattes et un squelette externe, pas de plumes.'],
    ],
    'Pense aux animaux qui ont un bec.',
    'Les oiseaux ont hérité la plume d’ancêtres communs : aujourd’hui, ils sont les seuls à la porter.',
  ),
  choisir(
    'Combien de pattes un insecte possède-t-il ?',
    'Six',
    [
      ['Huit', 'Huit pattes, c’est le cas des araignées, qui sont des arachnides.'],
      ['Quatre', 'Quatre membres caractérisent d’autres animaux, pas les insectes.'],
    ],
    'Trois paires de pattes.',
    'Un insecte possède trois paires de pattes.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Le loup et la baleine ne vivent pas au même endroit. Quel caractère permet pourtant de les réunir chez les mammifères ?',
    'Ils allaitent leurs petits avec des mamelles',
    [
      ['Ils vivent dans l’eau', 'Le loup ne vit pas dans l’eau, et le milieu de vie ne définit pas un groupe.'],
      ['Ils ont des plumes', 'Aucun des deux n’a de plumes.'],
      ['Ils chassent pour manger', 'Une façon de se nourrir ne définit pas le groupe des mammifères.'],
    ],
    'Cherche ce que leurs petits reçoivent.',
    'La baleine est un cétacé : comme tous les mammifères, elle allaite ses petits.',
  ),
  choisir(
    'Pourquoi une araignée n’est-elle pas un insecte ?',
    'Elle a huit pattes, alors qu’un insecte en a six',
    [
      ['Elle vit sur sa toile', 'Le lieu de vie ne permet pas de classer.'],
      ['Elle a un squelette externe', 'Les insectes en ont un aussi : ce caractère les réunit chez les arthropodes.'],
      ['Elle ne vole pas', 'Certains insectes ne volent pas : ce n’est pas le bon critère.'],
    ],
    'Compte les pattes.',
    'Les arachnides ont huit pattes locomotrices, les insectes trois paires.',
  ),
  choisir(
    'Un insecte et une araignée sont tous deux des arthropodes. Quel caractère partagent-ils ?',
    'Un squelette externe articulé',
    [
      ['Six pattes', 'L’araignée en a huit.'],
      ['Des vertèbres', 'Ni l’insecte ni l’araignée n’ont de vertèbres.'],
      ['Des mamelles', 'Les mamelles concernent les mammifères.'],
    ],
    'Leur partie dure est à l’extérieur du corps.',
    'Les arthropodes partagent un squelette externe articulé.',
  ),
  choisir(
    'Dans quel cas décrit-on un caractère qui peut servir à classer ?',
    'Cet animal possède des plumes',
    [
      ['Cet animal n’a pas de plumes', 'Une absence ne dit pas ce que les animaux possèdent en commun.'],
      ['Cet animal est dangereux', 'C’est un jugement utile, pas un caractère de classification.'],
      ['Cet animal vit dans une forêt', 'C’est son milieu de vie, pas un caractère qu’il possède.'],
    ],
    'Seul ce qu’un être vivant possède compte.',
    'Dans une classification, seules les présences de caractères ont du sens.',
  ),
  associer(
    'Associe chaque groupe à un caractère que ses membres partagent',
    [
      ['Les mammifères', 'des mamelles'],
      ['Les oiseaux', 'des plumes'],
      ['Les insectes', 'six pattes'],
    ],
    'Commence par le groupe dont le caractère t’est le plus familier.',
    'Chaque groupe est défini par un caractère que ses membres possèdent.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète : les caractères de deux groupes.',
    ['Les vertébrés possèdent des ', '. Les mammifères possèdent en plus des ', '.'],
    [['vertèbres', 'vertebres'], ['mamelles']],
    'Les deux mots ressemblent au nom des groupes.',
    'Les vertébrés ont des vertèbres, les mammifères des mamelles.',
  ),
  ecrire(
    'Écris le nom du groupe des animaux à mamelles (au pluriel).',
    ['mammifères', 'les mammifères', 'mammifere', 'mammiferes', 'mammifère', 'les mammiferes'],
    [
      ['vertébrés', 'Les vertébrés sont définis par les vertèbres ; ce groupe est plus large.'],
      ['primates', 'Les primates sont un groupe de mammifères défini par le pouce opposable.'],
    ],
    'Pense au groupe qui réunit le loup et la baleine.',
    'Les mammifères sont les animaux à mamelles.',
  ),
  ecrire(
    'Humains et chimpanzés partagent un pouce qui peut venir toucher les autres doigts. Écris l’adjectif : un pouce…',
    ['opposable', 'opposables', 'pouce opposable'],
    [
      ['mobile', 'Un doigt peut être mobile sans venir en face des autres : cherche le mot précis.'],
      ['palmé', 'Palmé décrit des doigts reliés par une peau.'],
    ],
    'Ce pouce se place « en face » des autres doigts.',
    'Le pouce opposable est un caractère commun aux primates.',
  ),
  completer(
    'Complète : trier n’est pas classer.',
    ['Pour classer, on regroupe les êtres vivants selon les caractères qu’ils ', ' en ', '.'],
    [['possèdent', 'possedent', 'ont', 'partagent'], ['commun']],
    'On cherche ce qui réunit, pas ce qui sépare.',
    'Classer, c’est regrouper selon des caractères possédés en commun.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  associer(
    'Associe chaque groupe à son caractère',
    [
      ['Vertébrés', 'des vertèbres'],
      ['Mammifères', 'des mamelles'],
      ['Primates', 'un pouce opposable'],
      ['Oiseaux', 'des plumes'],
      ['Arachnides', 'huit pattes'],
    ],
    'Fais d’abord les associations dont tu es sûr.',
    'Chaque groupe se reconnaît à un caractère que ses membres possèdent.',
  ),
  choisir(
    'Pourquoi « les invertébrés » n’est-il pas un bon groupe de la classification ?',
    'Il réunit des animaux sur une absence, sans dire ce qu’ils possèdent en commun',
    [
      ['Il contient trop peu d’animaux', 'Le nombre d’animaux n’est pas le problème.'],
      ['Les animaux sans vertèbres ne sont pas des êtres vivants', 'Ce sont bien des êtres vivants.'],
      ['Aucun animal n’a de vertèbres', 'De nombreux animaux en ont : les vertébrés.'],
      ['Ses animaux vivent tous au même endroit', 'Le milieu de vie ne joue aucun rôle ici.'],
    ],
    'Regarde le début du mot : « in- ».',
    'L’absence de vertèbres ne dit rien de ce que ces animaux ont : pierres et nuages n’en ont pas non plus.',
  ),
  choisir(
    'Une clé de détermination pose des questions pour trouver le nom d’une espèce. Quel est son rôle ?',
    'Identifier un être vivant, sans construire la classification',
    [
      ['Construire la classification à elle seule', 'La clé aide à trouver un nom, elle ne construit pas les groupes.'],
      ['Mesurer l’âge d’un fossile', 'Elle ne sert pas à dater.'],
      ['Prouver que deux animaux sont de la même famille', 'Pour cela, on compare les caractères partagés.'],
      ['Compter les individus d’un milieu', 'Compter, c’est faire un inventaire.'],
    ],
    'Trier et classer sont deux gestes différents.',
    'Une clé d’identification sert à trouver un nom ; elle ne construit pas la classification.',
  ),
  ecrire(
    'Un animal possède huit pattes locomotrices et un squelette externe. Écris le nom de son groupe (au pluriel).',
    ['arachnides', 'les arachnides', 'arachnide', 'un arachnide'],
    [
      ['insectes', 'Les insectes ont six pattes, pas huit.'],
      ['crustacés', 'Les crustacés sont un autre groupe d’arthropodes, comme le crabe.'],
      ['vertébrés', 'Un squelette externe n’est pas fait de vertèbres.'],
    ],
    'L’araignée en fait partie.',
    'Les arachnides sont des arthropodes à huit pattes.',
  ),
  ecrire(
    'Un attribut possédé à l’identique par plusieurs espèces leur a probablement été transmis par un… (deux mots).',
    [
      'ancêtre commun',
      'un ancêtre commun',
      'ancetre commun',
      'un ancetre commun',
      'ancêtres communs',
      'ancetres communs',
    ],
    [
      ['milieu de vie', 'Un milieu ne transmet pas de caractère.'],
      ['hasard', 'La transmission passe par la descendance : cherche de qui ces espèces descendent.'],
    ],
    'Pense à la descendance.',
    'Un caractère partagé a probablement été légué par un ancêtre commun.',
  ),
];

const PROFILS = ['primate', 'mammifere', 'oiseau', 'insecte', 'arachnide'] as const;

/** Combien de caractères partagent deux animaux imaginaires. */
const compterCommuns: Modele = (rng) => {
  const liste = fiches(rng, PROFILS);
  const [p, m, o, i, a] = liste;
  const [x, y] = rng.pick([
    [p, m],
    [p, o],
    [m, o],
    [i, a],
  ] as const);
  const partages = communs(x.profil, y.profil);
  const n = partages.length;
  return avecFiches(
    rng,
    liste,
    compter(
      `Combien de caractères ${x.nom} et ${y.nom} partagent-ils ?`,
      n,
      [
        [n + 1, 'Tu as compté un caractère que les deux animaux ne possèdent pas tous les deux.'],
        [n - 1, 'Il en manque un : compare toute la liste des deux fiches.'],
      ],
      'Cherche dans les deux fiches les caractères identiques.',
      ['Un caractère partagé figure sur les deux fiches.', `Caractères communs : ${partages.join(' et ')}.`],
    ),
  );
};

const groupeParCaractere: Modele = (rng) => {
  const liste = fiches(rng, ['primate', 'mammifere', 'oiseau', 'vertebre', 'insecte']);
  const caractere = rng.pick(['des vertèbres', 'des mamelles'] as const);
  const n = liste.filter((x) => CARACTERES[x.profil].includes(caractere)).length;
  return avecFiches(
    rng,
    liste,
    compter(
      `Combien d’animaux entrent dans le groupe défini par « ${caractere} » ?`,
      n,
      [
        [5, 'Tous les animaux ne possèdent pas ce caractère : relis chaque fiche.'],
        [n - 1, 'Il en manque un : vérifie aussi les animaux qui ont d’autres caractères en plus.'],
      ],
      'Un animal peut avoir ce caractère et d’autres encore.',
      ['On garde les fiches qui mentionnent ce caractère.', `Elles sont ${n}.`],
    ),
  );
};

const partageSaufUn: Modele = (rng) => {
  const liste = fiches(rng, PROFILS);
  const [p, m, o, i, a] = liste;
  const cas = rng.pick([
    { x: p, y: m, sauf: o, bonne: 'Des mamelles' },
    { x: m, y: o, sauf: i, bonne: 'Des vertèbres' },
    { x: i, y: a, sauf: m, bonne: 'Un squelette externe articulé' },
  ]);
  const tous = [
    ['Des vertèbres', 'des vertèbres'],
    ['Des mamelles', 'des mamelles'],
    ['Un pouce opposable', 'un pouce opposable'],
    ['Un squelette externe articulé', 'un squelette externe articulé'],
  ] as const;
  const pourquoi = (c: string) => {
    const sans = [cas.x, cas.y].find((f) => !CARACTERES[f.profil].includes(c));
    return sans
      ? `La fiche montre que ${sans.nom} n’a pas ce caractère.`
      : `${Maj(cas.sauf.nom)} possède aussi ce caractère : il ne le distingue pas des deux autres.`;
  };
  const q = qcm(
    rng,
    {
      prompt: `Quel caractère ${cas.x.nom} et ${cas.y.nom} partagent-ils, alors que ${cas.sauf.nom} ne l’a pas ?`,
      bonne: cas.bonne,
      fausses: tous.filter(([label]) => label !== cas.bonne).map(([label, c]) => [label, pourquoi(c)]),
      indice: 'Le caractère doit figurer sur les deux premières fiches citées, mais pas sur la troisième.',
      explication: ['On cherche ce qui réunit deux animaux et les distingue du troisième.'],
    },
    60,
  );
  return avecFiches(rng, liste, q);
};

const NIVEAU5: readonly Modele[] = [compterCommuns, groupeParCaractere, partageSaufUn];

export const caracteresPartages: Skill = {
  id: 'v5-caracteres-partages',
  title: 'Les caractères partagés',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **caractère** est ce qu’un être vivant possède : des vertèbres, des mamelles, des plumes. La classification réunit ceux qui ont des **caractères partagés** : le loup et la baleine ont des mamelles, ce sont des mammifères.',
      'On classe selon ce que l’on possède, pas selon le milieu de vie, ni selon ce qui manque : voler, nager ou « ne pas avoir de vertèbres » ne suffit pas.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Caractères partagés et classification. » ; Muséum national d’Histoire naturelle.`,
    sources: [
      PROGRAMME,
      CLASSER,
      ARBRE,
      'mnhn-cetace',
      'mnhn-arthropode',
      'mnhn-insecte',
      'mnhn-araignee',
      'cnrtl-primate',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
