/**
 * Données du chapitre « Conjuguer au présent » (CM1) : faits cités, formes du présent de l'indicatif et phrases écrites
 * pour l'exercice. Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);
/** Fait tiré d'un article du Dictionnaire de l'Académie française (`source` : identifiant sans accent). */
const acad = (id: string, source: string, citation: string): Fait => fait(`academie-${source}`)(id, citation);

const REGLES: readonly Fait[] = [
  prog(
    'radicaux-terminaisons',
    'L’enseignement de la conjugaison s’attache à l’identification des radicaux verbaux et de leurs terminaisons (marques de temps et de personne).',
  ),
  prog('marques-personne', 'Connaître les marques de personne pour le présent de l’indicatif, l’imparfait et le futur'),
  prog(
    'variations-radical',
    'Mettre en évidence les variations du radical pour certains verbes du premier groupe (verbes dont l’avant-dernière syllabe contient un e muet ou un é, les verbes en -yer, en -eler et -eter, en -cer, -ger)',
  ),
  prog(
    'a-memoriser',
    'Conjugaisons à mémoriser et à maîtriser : présent de l’indicatif, imparfait, futur, passé composé des verbes être et avoir, des verbes du premier et du deuxième groupe et des verbes irréguliers du troisième groupe (faire, aller, dire, venir, pouvoir, voir, vouloir, prendre)',
  ),
  gram('radical', 'le radical contient le sens lexical stable du verbe'),
  gram('terminaison', 'Dans la pratique de classe, le terme « désinence » peut être remplacé par « terminaison ».'),
  gram(
    'groupe-1',
    'Les verbes du premier groupe sont ceux qui présentent un infinitif en -er. Ils se conjuguent à partir d’un seul radical, sur le modèle de chanter.',
  ),
  gram('aller', 'le verbe aller n’est pas classé dans ce groupe, en dépit de sa forme d’infinitif'),
  gram(
    'groupe-2',
    'Les verbes du deuxième groupe présentent un infinitif en -ir et plusieurs formes de leur radical en -iss-',
  ),
  gram(
    'partir',
    'à la différence de partir, dont l’infinitif est en -ir mais qui ne forme pas son participe présent au moyen de la désinence -issant',
  ),
  gram('etre-avoir', 'On y rattache aussi les verbes être, avoir et aller.'),
  gram('plusieurs-radicaux', 'verbes à plus de trois radicaux : auxiliaires être et avoir ; savoir, pouvoir, aller'),
  acad('avancer', 'avancer', "j'avance, nous avançons"),
  acad('cedille', 'cedille', 'pour indiquer qu’elle se prononce comme un s sourd'),
  acad('bouger', 'bouger', 'je bouge, nous bougeons'),
  acad(
    'g-doux',
    'g',
    'Pour obtenir la même prononciation devant les voyelles a, o, u, on intercale un e entre le g et cette voyelle',
  ),
  acad('broyer', 'broyer', 'je broie, nous broyons'),
  acad('balayer', 'balayer', 'je balaye ou je balaie, nous balayons'),
  acad('appeler', 'appeler', "j'appelle, nous appelons"),
  acad('jeter', 'jeter', 'je jette, nous jetons'),
  acad('celer', 'celer', 'je cèle, nous celons'),
  acad('acheter', 'acheter', "j'achète, nous achetons"),
  acad('ceder', 'ceder', 'je cède, nous cédons'),
  acad('header-etre', 'etre', 'je suis, tu es, il est, nous sommes, vous êtes, ils sont'),
  acad('header-avoir', 'avoir', "j'ai, tu as, il a, nous avons, vous avez, ils ont"),
  acad('header-faire', 'faire', 'je fais, tu fais, il fait, nous faisons, vous faites, ils font'),
  acad('header-aller', 'aller', 'je vais, tu vas, il va, nous allons, vous allez, ils vont'),
];

// ───────────────────────── Formes du présent ─────────────────────────

export const PERSONNES = ['je', 'tu', 'il', 'nous', 'vous', 'ils'] as const;
export type Personne = (typeof PERSONNES)[number];

/**
 * Présent de l'indicatif relevé sur la page de conjugaison du CNRTL de chaque verbe, dans l'ordre
 * je, tu, il, nous, vous, ils. Pour « payer », la page donne aussi « paye » (`AUTRES_FORMES`).
 */
const PRESENT = {
  chanter: 'chante chantes chante chantons chantez chantent',
  jouer: 'joue joues joue jouons jouez jouent',
  parler: 'parle parles parle parlons parlez parlent',
  danser: 'danse danses danse dansons dansez dansent',
  marcher: 'marche marches marche marchons marchez marchent',
  sauter: 'saute sautes saute sautons sautez sautent',
  regarder: 'regarde regardes regarde regardons regardez regardent',
  écouter: 'écoute écoutes écoute écoutons écoutez écoutent',
  dessiner: 'dessine dessines dessine dessinons dessinez dessinent',
  aimer: 'aime aimes aime aimons aimez aiment',
  porter: 'porte portes porte portons portez portent',
  trouver: 'trouve trouves trouve trouvons trouvez trouvent',
  finir: 'finis finis finit finissons finissez finissent',
  choisir: 'choisis choisis choisit choisissons choisissez choisissent',
  grandir: 'grandis grandis grandit grandissons grandissez grandissent',
  remplir: 'remplis remplis remplit remplissons remplissez remplissent',
  rougir: 'rougis rougis rougit rougissons rougissez rougissent',
  réussir: 'réussis réussis réussit réussissons réussissez réussissent',
  applaudir: 'applaudis applaudis applaudit applaudissons applaudissez applaudissent',
  bondir: 'bondis bondis bondit bondissons bondissez bondissent',
  obéir: 'obéis obéis obéit obéissons obéissez obéissent',
  partir: 'pars pars part partons partez partent',
  dormir: 'dors dors dort dormons dormez dorment',
  sortir: 'sors sors sort sortons sortez sortent',
  être: 'suis es est sommes êtes sont',
  avoir: 'ai as a avons avez ont',
  faire: 'fais fais fait faisons faites font',
  aller: 'vais vas va allons allez vont',
  dire: 'dis dis dit disons dites disent',
  venir: 'viens viens vient venons venez viennent',
  pouvoir: 'peux peux peut pouvons pouvez peuvent',
  voir: 'vois vois voit voyons voyez voient',
  vouloir: 'veux veux veut voulons voulez veulent',
  prendre: 'prends prends prend prenons prenez prennent',
  avancer: 'avance avances avance avançons avancez avancent',
  commencer: 'commence commences commence commençons commencez commencent',
  placer: 'place places place plaçons placez placent',
  lancer: 'lance lances lance lançons lancez lancent',
  tracer: 'trace traces trace traçons tracez tracent',
  bouger: 'bouge bouges bouge bougeons bougez bougent',
  manger: 'mange manges mange mangeons mangez mangent',
  nager: 'nage nages nage nageons nagez nagent',
  ranger: 'range ranges range rangeons rangez rangent',
  changer: 'change changes change changeons changez changent',
  payer: 'paie paies paie payons payez paient',
  essuyer: 'essuie essuies essuie essuyons essuyez essuient',
  appuyer: 'appuie appuies appuie appuyons appuyez appuient',
  employer: 'emploie emploies emploie employons employez emploient',
  nettoyer: 'nettoie nettoies nettoie nettoyons nettoyez nettoient',
  envoyer: 'envoie envoies envoie envoyons envoyez envoient',
  appeler: 'appelle appelles appelle appelons appelez appellent',
  peler: 'pèle pèles pèle pelons pelez pèlent',
  jeter: 'jette jettes jette jetons jetez jettent',
  acheter: 'achète achètes achète achetons achetez achètent',
  lever: 'lève lèves lève levons levez lèvent',
  mener: 'mène mènes mène menons menez mènent',
  semer: 'sème sèmes sème semons semez sèment',
  peser: 'pèse pèses pèse pesons pesez pèsent',
  répéter: 'répète répètes répète répétons répétez répètent',
  espérer: 'espère espères espère espérons espérez espèrent',
  préférer: 'préfère préfères préfère préférons préférez préfèrent',
  céder: 'cède cèdes cède cédons cédez cèdent',
} as const;

export type Verbe = keyof typeof PRESENT;
export const VERBES = Object.keys(PRESENT) as Verbe[];

export const AUTRES_FORMES: Partial<Record<Verbe, Partial<Record<Personne, string>>>> = {
  payer: { je: 'paye', tu: 'payes', il: 'paye', ils: 'payent' },
};

export const forme = (v: Verbe, p: Personne): string => PRESENT[v].split(' ')[PERSONNES.indexOf(p)] ?? '';

/** Formes justes d'un verbe à une personne (la première est celle affichée). */
export const formes = (v: Verbe, p: Personne): string[] => {
  const autre = AUTRES_FORMES[v]?.[p];
  return autre ? [forme(v, p), autre] : [forme(v, p)];
};

const SANS_ACCENT: Record<string, string> = { é: 'e', è: 'e', ê: 'e', ç: 'c' };
/** Identifiant de la source « conjugaison » d'un verbe. */
export const sourceDe = (v: Verbe): string => `cnrtl-conj-${v.replace(/[éèêç]/g, (c) => SANS_ACCENT[c] ?? c)}`;

const voyelle = /^[aàâeéèêiîoôuûh]/;
/** « je » s'écrit « j’ » devant une voyelle : « j’écoute ». */
export const avecSujet = (sujet: string, verbe: string): string =>
  sujet.toLowerCase() === 'je' && voyelle.test(verbe) ? `${sujet.charAt(0)}’${verbe}` : `${sujet} ${verbe}`;

/**
 * Une ligne par verbe : les formes telles qu'elles se lisent sur la page (les « … » remplacent la prononciation
 * écrite entre les formes).
 */
const CONJUGAISONS: readonly Fait[] = VERBES.map((v) => ({
  id: `present-${v}`,
  source: sourceDe(v),
  citation: PERSONNES.map((p) => {
    const sujet = p === 'il' ? 'il/elle/on' : p === 'ils' ? 'ils/elles' : p;
    return avecSujet(sujet, forme(v, p));
  }).join(' … '),
}));

export const FAITS_PRESENT: readonly Fait[] = [...REGLES, ...CONJUGAISONS];

export const faitPresent = (id: string): Fait => {
  const x = FAITS_PRESENT.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités et des verbes travaillés par une notion. */
export const sourcesPresent = (faits: readonly string[], verbes: readonly Verbe[]): string[] => [
  ...new Set([PROGRAMME, ...faits.map((id) => faitPresent(id).source), ...verbes.map(sourceDe)]),
];

// ───────────────────────── Sujets ─────────────────────────

export interface Sujet {
  readonly texte: string;
  readonly personne: Personne;
}

const sujets = (personne: Personne, liste: readonly string[]): Sujet[] => liste.map((texte) => ({ texte, personne }));

/** Aucun prénom. */
export const SUJETS: readonly Sujet[] = [
  ...sujets('je', ['Je']),
  ...sujets('tu', ['Tu']),
  ...sujets('il', ['Il', 'Elle', 'Mon voisin', 'La fille']),
  ...sujets('nous', ['Nous']),
  ...sujets('vous', ['Vous']),
  ...sujets('ils', ['Ils', 'Elles', 'Les enfants', 'Mes copains']),
];

/** Groupes nominaux et sujets à plusieurs noms : il faut les remplacer par un pronom (niveaux 4 et 5). */
export const SUJETS_GROUPES: readonly (Sujet & { readonly pronom: string })[] = [
  { texte: 'Le fils des voisins', personne: 'il', pronom: 'il' },
  { texte: 'La sœur de mes copains', personne: 'il', pronom: 'elle' },
  { texte: 'Le garçon et la fille', personne: 'ils', pronom: 'ils' },
  { texte: 'Mon frère et moi', personne: 'nous', pronom: 'nous' },
  { texte: 'Ta sœur et toi', personne: 'vous', pronom: 'vous' },
  { texte: 'Les amis de ma sœur', personne: 'ils', pronom: 'ils' },
];

// ───────────────────────── Verbes par notion ─────────────────────────

/** Verbe et fin de phrase, valable avec tous les sujets. */
export type Emploi = readonly [Verbe, string];

export const EMPLOIS_ER: readonly Emploi[] = [
  ['chanter', 'une chanson'],
  ['jouer', 'au ballon'],
  ['parler', 'à voix basse'],
  ['danser', 'dans la cour'],
  ['marcher', 'vers l’école'],
  ['sauter', 'très haut'],
  ['regarder', 'le ciel'],
  ['dessiner', 'un dragon'],
  ['porter', 'un sac'],
  ['trouver', 'la réponse'],
  ['écouter', 'une histoire'],
  ['aimer', 'les devinettes'],
];

export const EMPLOIS_IR: readonly Emploi[] = [
  ['finir', 'le puzzle'],
  ['choisir', 'un livre'],
  ['grandir', 'très vite'],
  ['remplir', 'la gourde'],
  ['rougir', 'de plaisir'],
  ['réussir', 'le tour de magie'],
  ['applaudir', 'les artistes'],
  ['bondir', 'de joie'],
  ['obéir', 'à la consigne'],
];

/** Verbes en -ir qui ne sont pas du 2e groupe. */
export const IR_AUTRES: readonly Verbe[] = ['partir', 'dormir', 'sortir'];

export const IRREGULIERS: readonly Verbe[] = [
  'faire',
  'aller',
  'dire',
  'venir',
  'pouvoir',
  'voir',
  'vouloir',
  'prendre',
];

/** Phrases à compléter avec un verbe irrégulier (niveaux 3 à 5). */
export const EMPLOIS_IRREGULIERS: readonly Emploi[] = [
  ['faire', 'un gâteau'],
  ['aller', 'à la piscine'],
  ['dire', 'bonjour'],
  ['venir', 'à la fête'],
  ['pouvoir', 'entrer'],
  ['voir', 'la mer'],
  ['vouloir', 'un conseil'],
  ['prendre', 'le bus'],
];

/** Formes qui piègent souvent, avec l'écriture fautive tentante. */
export const PIEGES_IRREGULIERS: readonly (readonly [Verbe, Personne, string])[] = [
  ['faire', 'vous', 'faisez'],
  ['faire', 'ils', 'faisent'],
  ['dire', 'vous', 'disez'],
  ['aller', 'ils', 'allent'],
  ['aller', 'je', 'alle'],
  ['venir', 'ils', 'venent'],
  ['prendre', 'ils', 'prendent'],
  ['prendre', 'nous', 'prendons'],
  ['pouvoir', 'je', 'peus'],
  ['pouvoir', 'ils', 'pouvent'],
  ['vouloir', 'tu', 'veus'],
  ['vouloir', 'ils', 'voulent'],
  ['voir', 'nous', 'voions'],
  ['voir', 'vous', 'voiez'],
];

/** Phrases où un seul des deux verbes, être ou avoir, convient. */
export interface PhraseEtreAvoir {
  readonly sujet: Sujet;
  readonly verbe: 'être' | 'avoir';
  readonly fin: string;
}

const phrase = (texte: string, personne: Personne, verbe: 'être' | 'avoir', fin: string): PhraseEtreAvoir => ({
  sujet: { texte, personne },
  verbe,
  fin,
});

export const PHRASES_ETRE_AVOIR: readonly PhraseEtreAvoir[] = [
  phrase('Tu', 'tu', 'avoir', 'dix ans'),
  phrase('Tu', 'tu', 'être', 'sûr de ta réponse'),
  phrase('Il', 'il', 'avoir', 'très soif'),
  phrase('Mon frère', 'il', 'avoir', 'peur du noir'),
  phrase('La porte', 'il', 'être', 'ouverte'),
  phrase('Nous', 'nous', 'avoir', 'faim'),
  phrase('Nous', 'nous', 'être', 'dans la cour'),
  phrase('Vous', 'vous', 'avoir', 'de la chance'),
  phrase('Vous', 'vous', 'être', 'en retard'),
  phrase('Les enfants', 'ils', 'être', 'très contents'),
  phrase('Elles', 'ils', 'être', 'à la piscine'),
  phrase('Mes copains', 'ils', 'avoir', 'une idée'),
  phrase('Je', 'je', 'être', 'dans ma chambre'),
  phrase('Je', 'je', 'avoir', 'un vélo bleu'),
];

/** Familles de variations du radical (premier groupe). */
export type Famille = 'cer' | 'ger' | 'yer' | 'double' | 'accent';

export interface Variation {
  readonly verbe: Verbe;
  readonly fin: string;
  readonly famille: Famille;
  /** Fait (Académie ou programme) qui montre la variation. */
  readonly fait: string;
}

const variations = (famille: Famille, fait: string, liste: readonly Emploi[]): Variation[] =>
  liste.map(([verbe, fin]) => ({ verbe, fin, famille, fait }));

export const VARIATIONS: readonly Variation[] = [
  ...variations('cer', 'avancer', [
    ['avancer', 'un pion'],
    ['commencer', 'un dessin'],
    ['placer', 'les cartes'],
    ['lancer', 'la balle'],
    ['tracer', 'un trait'],
  ]),
  ...variations('ger', 'bouger', [
    ['bouger', 'la tête'],
    ['manger', 'une pomme'],
    ['nager', 'dans la piscine'],
    ['ranger', 'les livres'],
    ['changer', 'de place'],
  ]),
  ...variations('yer', 'broyer', [
    ['essuyer', 'les verres'],
    ['appuyer', 'sur le bouton'],
    ['employer', 'une règle'],
    ['nettoyer', 'la table'],
    ['envoyer', 'une lettre'],
  ]),
  ...variations('yer', 'balayer', [['payer', 'le pain']]),
  ...variations('double', 'appeler', [['appeler', 'le chien']]),
  ...variations('double', 'jeter', [['jeter', 'les dés']]),
  ...variations('accent', 'celer', [['peler', 'une orange']]),
  ...variations('accent', 'acheter', [['acheter', 'un cahier']]),
  ...variations('accent', 'variations-radical', [
    ['lever', 'la main'],
    ['mener', 'le jeu'],
    ['semer', 'des graines'],
    ['peser', 'les pommes'],
  ]),
  ...variations('accent', 'ceder', [
    ['répéter', 'la leçon'],
    ['espérer', 'une surprise'],
    ['préférer', 'la glace'],
    ['céder', 'la place'],
  ]),
];
