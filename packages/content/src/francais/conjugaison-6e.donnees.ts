/**
 * Données du chapitre « Conjugaison » (6e) : faits cités, formes relevées sur les pages de conjugaison du CNRTL et
 * phrases écrites pour l'exercice. Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation
 * exacte.
 */
import type { Fait } from './phrases.donnees.ts';
import { PERSONNES, avecSujet, forme, sourceDe, type Personne, type Verbe } from './present.donnees.ts';
import { conjugue1, type Verbe1 } from './temps-composes.donnees.ts';
import { conjugue, participe, type VerbeTemps } from './temps.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';
const GRAMMAIRE = 'eduscol-grammaire-francais';

const fait =
  (source: string) =>
  (id: string, citation: string): Fait => ({ id, source, citation });
const prog = fait(PROGRAMME);
const gram = fait(GRAMMAIRE);
/** Fait tiré d'un article du Dictionnaire de l'Académie française (`article` : identifiant sans accent). */
const acad = (id: string, article: string, citation: string): Fait => fait(`academie-${article}`)(id, citation);

const REGLES: readonly Fait[] = [
  prog(
    'c6-a-memoriser',
    'Conjugaisons à mémoriser et à maîtriser : impératif présent, conditionnel présent des verbes être et avoir, des verbes des premier et deuxième groupes, des verbes irréguliers du troisième groupe : faire, aller, dire, venir, pouvoir, voir, vouloir, prendre',
  ),
  prog(
    'c6-composition',
    'Consolider la maîtrise de la conjugaison des temps composés (passé composé et plus-que-parfait). Connaître leur composition en deux parties (auxiliaire + participe passé)',
  ),
  prog('c6-accord-etre', 'Maîtriser l’accord du participe passé employé avec l’auxiliaire être'),
  prog('c6-marques', 'Connaître les marques des temps étudiés au CM1 et CM2'),
  prog('c6-marques-nouvelles', 'Identifier les marques de temps pour le conditionnel présent et l’impératif présent'),
  prog('c6-variations', 'Maîtriser les variations du radical pour certains verbes du 1er groupe'),
  prog('c6-marques-cm1', 'Savoir isoler et connaître les marques de temps de l’imparfait (-ai-, -i-) ; du futur (-r-)'),
  prog(
    'c6-variations-cm1',
    'Mettre en évidence les variations du radical pour certains verbes du premier groupe (verbes dont l’avant-dernière syllabe contient un e muet ou un é, les verbes en -yer, en -eler et -eter, en -cer, -ger)',
  ),
  prog(
    'c6-negation',
    'Effectuer la transformation à la forme négative d’un verbe aux temps composés en plaçant les adverbes de négation au bon emplacement',
  ),
  gram('c6-imp-ordre', 'L’impératif est le mode utilisé pour donner un ordre.'),
  gram('c6-imp-non-temporel', 'il s’agit donc d’un mode personnel mais non temporel'),
  gram('c6-imp-trois', 'l’impératif est un mode défectif qui ne comporte que trois personnes'),
  gram('c6-imp-sans-pronom', 'L’impératif se conjugue sans pronom personnel mais varie selon la personne.'),
  gram(
    'c6-imp-s',
    'Une erreur fréquemment commise en français consiste à ajouter un -s à la deuxième personne du singulier des verbes du premier groupe conjugués à l’impératif.',
  ),
  gram('c6-defense', 'un ordre négatif (Ne dis rien ! Ne reviens pas !) est aussi appelé défense'),
  gram(
    'c6-cond-indicatif',
    'le conditionnel, en dépit d’une tradition encore vivace, doit bien être considéré comme un temps de l’indicatif',
  ),
  gram(
    'c6-cond-hypothese',
    'alors que le conditionnel s’emploie pour indiquer la conséquence d’une hypothèse exclue dans le présent',
  ),
  gram('c6-cond-symetrie', 'le conditionnel est au futur ce que l’imparfait est au passé simple'),
  gram('c6-forme-composee', 'formé au moyen de l’auxiliaire être ou avoir et du participe passé'),
  gram('c6-pc', 'Passé composé : j’ai parlé ; je suis sorti(e)'),
  gram('c6-pqp', 'Plus-que-parfait : j’avais parlé ; j’étais sorti(e)'),
  gram('c6-accompli', 'les temps composés signifient l’aspect accompli des temps simples'),
  gram(
    'c6-desinence',
    'la désinence du verbe conjugué se décompose elle-même en plusieurs morphèmes flexionnels nommés « marques » : marque de temps et marque de personne',
  ),
  gram('c6-marque-temps', 'Marque de temps : -ai- marque de l’imparfait dans chantaient'),
  gram('c6-marque-personne', 'Marque de personne : -ent marque de troisième personne du pluriel dans chantaient'),
  gram(
    'c6-groupe-1',
    'Les verbes du premier groupe sont ceux qui présentent un infinitif en -er. Ils se conjuguent à partir d’un seul radical, sur le modèle de chanter.',
  ),
  acad(
    'c6-en-s',
    'en',
    "Pour les verbes de la première conjugaison, ainsi que pour avoir et savoir, il s'ajoute un s final à la forme impérative",
  ),
  acad('c6-vas-y', 'aller', '« Je vais à la cuisine. - Vas-y. »'),
  acad(
    'c6-ne-auxiliaire',
    'ne',
    "Si le verbe est à un mode personnel, ce verbe ou, dans les formes composées, son auxiliaire, s'intercale entre ne et pas, ne et point, ne et guère",
  ),
  acad('c6-cedille', 'cedille', 'pour indiquer qu’elle se prononce comme un s sourd'),
  acad(
    'c6-g-doux',
    'g',
    'Pour obtenir la même prononciation devant les voyelles a, o, u, on intercale un e entre le g et cette voyelle',
  ),
  acad('c6-appeler', 'appeler', "j'appelle, nous appelons"),
  acad('c6-jeter', 'jeter', 'je jette, nous jetons'),
  acad('c6-acheter', 'acheter', "j'achète, nous achetons"),
  acad('c6-ceder', 'ceder', 'je cède, nous cédons'),
  acad('c6-broyer', 'broyer', 'je broie, nous broyons'),
];

// ───────────────────────── Formes relevées (CNRTL) ─────────────────────────

/**
 * Conditionnel présent (je, tu, il, nous, vous, ils) relevé sur la page de conjugaison de chaque verbe ; « | » sépare
 * deux écritures données par la page.
 */
const CONDITIONNEL = {
  chanter: 'chanterais chanterais chanterait chanterions chanteriez chanteraient',
  jouer: 'jouerais jouerais jouerait jouerions joueriez joueraient',
  parler: 'parlerais parlerais parlerait parlerions parleriez parleraient',
  danser: 'danserais danserais danserait danserions danseriez danseraient',
  marcher: 'marcherais marcherais marcherait marcherions marcheriez marcheraient',
  sauter: 'sauterais sauterais sauterait sauterions sauteriez sauteraient',
  regarder: 'regarderais regarderais regarderait regarderions regarderiez regarderaient',
  écouter: 'écouterais écouterais écouterait écouterions écouteriez écouteraient',
  dessiner: 'dessinerais dessinerais dessinerait dessinerions dessineriez dessineraient',
  porter: 'porterais porterais porterait porterions porteriez porteraient',
  trouver: 'trouverais trouverais trouverait trouverions trouveriez trouveraient',
  aimer: 'aimerais aimerais aimerait aimerions aimeriez aimeraient',
  finir: 'finirais finirais finirait finirions finiriez finiraient',
  choisir: 'choisirais choisirais choisirait choisirions choisiriez choisiraient',
  remplir: 'remplirais remplirais remplirait remplirions rempliriez rempliraient',
  rougir: 'rougirais rougirais rougirait rougirions rougiriez rougiraient',
  réussir: 'réussirais réussirais réussirait réussirions réussiriez réussiraient',
  applaudir: 'applaudirais applaudirais applaudirait applaudirions applaudiriez applaudiraient',
  bondir: 'bondirais bondirais bondirait bondirions bondiriez bondiraient',
  obéir: 'obéirais obéirais obéirait obéirions obéiriez obéiraient',
  être: 'serais serais serait serions seriez seraient',
  avoir: 'aurais aurais aurait aurions auriez auraient',
  faire: 'ferais ferais ferait ferions feriez feraient',
  aller: 'irais irais irait irions iriez iraient',
  dire: 'dirais dirais dirait dirions diriez diraient',
  venir: 'viendrais viendrais viendrait viendrions viendriez viendraient',
  pouvoir: 'pourrais pourrais pourrait pourrions pourriez pourraient',
  voir: 'verrais verrais verrait verrions verriez verraient',
  vouloir: 'voudrais voudrais voudrait voudrions voudriez voudraient',
  prendre: 'prendrais prendrais prendrait prendrions prendriez prendraient',
  manger: 'mangerais mangerais mangerait mangerions mangeriez mangeraient',
  avancer: 'avancerais avancerais avancerait avancerions avanceriez avanceraient',
  commencer: 'commencerais commencerais commencerait commencerions commenceriez commenceraient',
  lancer: 'lancerais lancerais lancerait lancerions lanceriez lanceraient',
  placer: 'placerais placerais placerait placerions placeriez placeraient',
  nager: 'nagerais nagerais nagerait nagerions nageriez nageraient',
  ranger: 'rangerais rangerais rangerait rangerions rangeriez rangeraient',
  bouger: 'bougerais bougerais bougerait bougerions bougeriez bougeraient',
  appeler: 'appellerais appellerais appellerait appellerions appelleriez appelleraient',
  jeter: 'jetterais jetterais jetterait jetterions jetteriez jetteraient',
  acheter: 'achèterais achèterais achèterait achèterions achèteriez achèteraient',
  lever: 'lèverais lèverais lèverait lèverions lèveriez lèveraient',
  mener: 'mènerais mènerais mènerait mènerions mèneriez mèneraient',
  semer: 'sèmerais sèmerais sèmerait sèmerions sèmeriez sèmeraient',
  peser: 'pèserais pèserais pèserait pèserions pèseriez pèseraient',
  peler: 'pèlerais pèlerais pèlerait pèlerions pèleriez pèleraient',
  essuyer: 'essuierais essuierais essuierait essuierions essuieriez essuieraient',
  nettoyer: 'nettoierais nettoierais nettoierait nettoierions nettoieriez nettoieraient',
  employer: 'emploierais emploierais emploierait emploierions emploieriez emploieraient',
  appuyer: 'appuierais appuierais appuierait appuierions appuieriez appuieraient',
  répéter:
    'répéterais|répèterais répéterais|répèterais répéterait|répèterait répéterions|répèterions répéteriez|répèteriez répéteraient|répèteraient',
  espérer:
    'espérerais|espèrerais espérerais|espèrerais espérerait|espèrerait espérerions|espèrerions espéreriez|espèreriez espéreraient|espèreraient',
  préférer:
    'préférerais|préfèrerais préférerais|préfèrerais préférerait|préfèrerait préférerions|préfèrerions préféreriez|préfèreriez préféreraient|préfèreraient',
  céder:
    'céderais|cèderais céderais|cèderais céderait|cèderait céderions|cèderions céderiez|cèderiez céderaient|cèderaient',
  envoyer: 'enverrais enverrais enverrait enverrions enverriez enverraient',
} as const satisfies Partial<Record<Verbe, string>>;

/** Impératif présent : 2e personne du singulier, 1re et 2e du pluriel. « pouvoir » n’a pas d’impératif sur sa page. */
const IMPERATIF = {
  chanter: 'chante chantons chantez',
  jouer: 'joue jouons jouez',
  parler: 'parle parlons parlez',
  danser: 'danse dansons dansez',
  marcher: 'marche marchons marchez',
  sauter: 'saute sautons sautez',
  regarder: 'regarde regardons regardez',
  écouter: 'écoute écoutons écoutez',
  dessiner: 'dessine dessinons dessinez',
  porter: 'porte portons portez',
  trouver: 'trouve trouvons trouvez',
  aimer: 'aime aimons aimez',
  finir: 'finis finissons finissez',
  choisir: 'choisis choisissons choisissez',
  remplir: 'remplis remplissons remplissez',
  rougir: 'rougis rougissons rougissez',
  réussir: 'réussis réussissons réussissez',
  applaudir: 'applaudis applaudissons applaudissez',
  bondir: 'bondis bondissons bondissez',
  obéir: 'obéis obéissons obéissez',
  être: 'sois soyons soyez',
  avoir: 'aie ayons ayez',
  faire: 'fais faisons faites',
  aller: 'va allons allez',
  dire: 'dis disons dites',
  venir: 'viens venons venez',
  voir: 'vois voyons voyez',
  vouloir: 'veux|veuille voulons|veuillons voulez|veuillez',
  prendre: 'prends prenons prenez',
  manger: 'mange mangeons mangez',
  avancer: 'avance avançons avancez',
  commencer: 'commence commençons commencez',
  lancer: 'lance lançons lancez',
  placer: 'place plaçons placez',
  nager: 'nage nageons nagez',
  ranger: 'range rangeons rangez',
  bouger: 'bouge bougeons bougez',
  appeler: 'appelle appelons appelez',
  jeter: 'jette jetons jetez',
  acheter: 'achète achetons achetez',
  lever: 'lève levons levez',
  mener: 'mène menons menez',
  semer: 'sème semons semez',
  peser: 'pèse pesons pesez',
  peler: 'pèle pelons pelez',
  essuyer: 'essuie essuyons essuyez',
  nettoyer: 'nettoie nettoyons nettoyez',
  employer: 'emploie employons employez',
  appuyer: 'appuie appuyons appuyez',
  répéter: 'répète répétons répétez',
  espérer: 'espère espérons espérez',
  préférer: 'préfère préférons préférez',
  céder: 'cède cédons cédez',
  envoyer: 'envoie envoyons envoyez',
} as const satisfies Partial<Record<Verbe, string>>;

const COMPOSES_ETRE = {
  aller: 'allé',
  venir: 'venu',
  partir: 'parti',
  arriver: 'arrivé',
  tomber: 'tombé',
  rester: 'resté',
} as const;

export type VerbeC = keyof typeof CONDITIONNEL;
export type VerbeImp = keyof typeof IMPERATIF;

/** Écritures justes au conditionnel présent (la première est affichée). */
export const conditionnels = (v: VerbeC, p: Personne): string[] =>
  (CONDITIONNEL[v].split(' ')[PERSONNES.indexOf(p)] ?? '').split('|');
export const conditionnel = (v: VerbeC, p: Personne): string => conditionnels(v, p)[0] ?? '';

/** Personnes de l'impératif. */
export type PersonneImp = 'tu' | 'nous' | 'vous';
export const PERSONNES_IMP: readonly PersonneImp[] = ['tu', 'nous', 'vous'];

export const imperatifs = (v: VerbeImp, p: PersonneImp): string[] =>
  (IMPERATIF[v].split(' ')[PERSONNES_IMP.indexOf(p)] ?? '').split('|');
export const imperatif = (v: VerbeImp, p: PersonneImp): string => imperatifs(v, p)[0] ?? '';

// ───────────────────────── Temps composés ─────────────────────────

export type VerbeEtre = keyof typeof COMPOSES_ETRE;
export const VERBES_ETRE = Object.keys(COMPOSES_ETRE) as VerbeEtre[];
export type VerbeAvoir = Exclude<VerbeTemps, 'aller' | 'venir'>;
export type VerbeCompose = VerbeEtre | VerbeAvoir;
export type Compose = 'passé composé' | 'plus-que-parfait';
export const COMPOSES: readonly Compose[] = ['passé composé', 'plus-que-parfait'];

export const avecEtre = (v: VerbeCompose): v is VerbeEtre => Object.hasOwn(COMPOSES_ETRE, v);
export const auxiliaireDe6 = (v: VerbeCompose): 'être' | 'avoir' => (avecEtre(v) ? 'être' : 'avoir');
export const participeSeul = (v: VerbeCompose): string => (avecEtre(v) ? COMPOSES_ETRE[v] : participe(v));

export interface SujetC {
  readonly texte: string;
  readonly personne: Personne;
  readonly genre: 'm' | 'f';
}

/** Participe passé accordé avec le sujet (auxiliaire être), invariable avec avoir (complément placé après). */
export const accorde = (v: VerbeCompose, s: SujetC): string => {
  if (!avecEtre(v)) return participeSeul(v);
  const pluriel = s.personne === 'nous' || s.personne === 'vous' || s.personne === 'ils';
  return `${participeSeul(v)}${s.genre === 'f' ? 'e' : ''}${pluriel ? 's' : ''}`;
};

export const auxiliaireAu = (t: Compose, v: VerbeCompose, p: Personne): string =>
  t === 'passé composé' ? forme(auxiliaireDe6(v), p) : conjugue('imparfait', auxiliaireDe6(v), p);

/** Groupe verbal d'un temps composé : « avais chanté », « sont parties ». */
export const composeAu = (t: Compose, v: VerbeCompose, s: SujetC): string =>
  `${auxiliaireAu(t, v, s.personne)} ${accorde(v, s)}`;

const sujetC = (texte: string, personne: Personne, genre: 'm' | 'f' = 'm'): SujetC => ({ texte, personne, genre });

export const SUJETS_C: readonly SujetC[] = [
  sujetC('Il', 'il'),
  sujetC('Elle', 'il', 'f'),
  sujetC('La voyageuse', 'il', 'f'),
  sujetC('Le gardien', 'il'),
  sujetC('Nous', 'nous'),
  sujetC('Vous', 'vous'),
  sujetC('Ils', 'ils'),
  sujetC('Elles', 'ils', 'f'),
  sujetC('Les randonneurs', 'ils'),
  sujetC('Les cousines', 'ils', 'f'),
];
/** Sujets sans « nous » ni « vous » : le genre du participe passé s'y lit sur le sujet. */
export const SUJETS_TIERS: readonly SujetC[] = SUJETS_C.filter((s) => s.personne === 'il' || s.personne === 'ils');

/** Complément de chaque verbe conjugué avec « être » (sans complément d'objet direct). */
export const FINS_ETRE: Record<VerbeEtre, string> = {
  aller: 'au marché',
  venir: 'à la bibliothèque',
  partir: 'en voyage',
  arriver: 'à la gare',
  tomber: 'dans la neige',
  rester: 'à la maison',
};

// ───────────────────────── Impératif : compléments ─────────────────────────

/** Complément d'un ordre, correct au singulier comme au pluriel. */
export const ORDRES = {
  chanter: 'la chanson',
  jouer: 'au ballon',
  parler: 'à voix basse',
  danser: 'en rythme',
  marcher: 'vers la sortie',
  sauter: 'par-dessus la flaque',
  regarder: 'le tableau',
  écouter: 'la consigne',
  dessiner: 'le plan',
  porter: 'ce carton',
  trouver: 'la réponse',
  aimer: 'la lecture',
  finir: 'cet exercice',
  choisir: 'un livre',
  remplir: 'la fiche',
  rougir: 'sans honte',
  réussir: 'ce défi',
  applaudir: 'les artistes',
  bondir: 'de joie',
  obéir: 'au signal',
  être: 'à l’heure',
  avoir: 'confiance',
  faire: 'attention',
  aller: 'au tableau',
  dire: 'la vérité',
  venir: 'avec le matériel',
  voir: 'ce documentaire',
  vouloir: 'patienter',
  prendre: 'ce chemin',
} as const satisfies Partial<Record<VerbeImp, string>>;
export type VerbeOrdre = keyof typeof ORDRES;

export const REG_ER: readonly VerbeOrdre[] = [
  'chanter',
  'jouer',
  'parler',
  'danser',
  'marcher',
  'sauter',
  'regarder',
  'écouter',
  'dessiner',
  'porter',
  'trouver',
  'aimer',
];
export const REG_IR: readonly VerbeOrdre[] = [
  'finir',
  'choisir',
  'remplir',
  'rougir',
  'réussir',
  'applaudir',
  'bondir',
  'obéir',
];
export const REGULIERS_6: readonly VerbeOrdre[] = [...REG_ER, ...REG_IR];
/** Verbes irréguliers du programme (avec être et avoir) dont l'impératif se saisit sans ambiguïté. */
export const IRR_IMP: readonly VerbeOrdre[] = ['être', 'avoir', 'faire', 'aller', 'dire', 'venir', 'voir', 'prendre'];
export const IRR_COND: readonly (VerbeC & VerbeTemps)[] = [
  'être',
  'avoir',
  'faire',
  'aller',
  'dire',
  'venir',
  'pouvoir',
  'voir',
  'vouloir',
  'prendre',
];

// ───────────────────────── Premier groupe : radical qui varie ─────────────────────────

export type Famille6 = 'cer' | 'ger' | 'yer' | 'double' | 'accent-e' | 'accent-é' | 'envoyer';

export const VARIABLES = {
  commencer: 'cer',
  lancer: 'cer',
  placer: 'cer',
  avancer: 'cer',
  manger: 'ger',
  nager: 'ger',
  ranger: 'ger',
  bouger: 'ger',
  essuyer: 'yer',
  nettoyer: 'yer',
  employer: 'yer',
  appuyer: 'yer',
  appeler: 'double',
  jeter: 'double',
  acheter: 'accent-e',
  lever: 'accent-e',
  mener: 'accent-e',
  semer: 'accent-e',
  peser: 'accent-e',
  peler: 'accent-e',
  répéter: 'accent-é',
  espérer: 'accent-é',
  préférer: 'accent-é',
  céder: 'accent-é',
  envoyer: 'envoyer',
} as const satisfies Partial<Record<VerbeImp, Famille6>>;
export type VerbeVar = keyof typeof VARIABLES;
export const VERBES_VAR = Object.keys(VARIABLES) as VerbeVar[];
export const familleDe = (v: VerbeVar): Famille6 => VARIABLES[v];
export const deFamille = (...f: readonly Famille6[]): VerbeVar[] => VERBES_VAR.filter((v) => f.includes(familleDe(v)));

/** Fait (programme ou Académie) qui montre la variation de chaque famille. */
export const FAIT_FAMILLE_6: Record<Famille6, string> = {
  cer: 'c6-cedille',
  ger: 'c6-g-doux',
  yer: 'c6-broyer',
  double: 'c6-appeler',
  'accent-e': 'c6-acheter',
  'accent-é': 'c6-ceder',
  envoyer: 'c6-variations',
};

/** Verbes dont l'imparfait est relevé dans les chapitres du primaire. */
export type VerbeImparfait = Verbe1 | 'manger' | 'avancer';
export const VERBES_IMPARFAIT_VAR: readonly VerbeImparfait[] = [
  'commencer',
  'lancer',
  'avancer',
  'manger',
  'nager',
  'ranger',
  'essuyer',
  'nettoyer',
  'employer',
  'appuyer',
  'appeler',
  'jeter',
  'acheter',
  'lever',
  'mener',
];
export const imparfaitVar = (v: VerbeImparfait, p: Personne): string =>
  v === 'manger' || v === 'avancer' ? conjugue('imparfait', v, p) : conjugue1('imparfait', v, p);

// ───────────────────────── Faits des formes ─────────────────────────

export const TOUS_C = Object.keys(CONDITIONNEL) as VerbeC[];

const SUJETS_PAGE: Record<Personne, string> = {
  je: 'je',
  tu: 'tu',
  il: 'il/elle/on',
  nous: 'nous',
  vous: 'vous',
  ils: 'ils/elles',
};

const CONJUGAISONS: readonly Fait[] = [
  ...TOUS_C.map((v) => ({
    id: `c6-cond-${v}`,
    source: sourceDe(v),
    citation: PERSONNES.map((p) => avecSujet(SUJETS_PAGE[p], conditionnels(v, p).join(' ou '))).join(' … '),
  })),
  ...(Object.keys(IMPERATIF) as VerbeImp[]).map((v) => ({
    id: `c6-imp-${v}`,
    source: sourceDe(v),
    citation: PERSONNES_IMP.map((p) => imperatifs(v, p).join(' ou ')).join(' … '),
  })),
  ...VERBES_ETRE.flatMap((v) =>
    COMPOSES.map((t) => ({
      id: `c6-${t === 'passé composé' ? 'pc' : 'pqp'}-${v}`,
      source: sourceDe(v as Verbe),
      citation: PERSONNES.map((p) => avecSujet(SUJETS_PAGE[p], composeAu(t, v, sujetC(p, p)))).join(' … '),
    })),
  ),
];

export const FAITS_CONJUGAISON_6E: readonly Fait[] = [...REGLES, ...CONJUGAISONS];

export const faitConjugaison6e = (id: string): Fait => {
  const x = FAITS_CONJUGAISON_6E.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + documents officiels) des faits cités et des verbes travaillés par une notion. */
export const sourcesConjugaison6e = (faits: readonly string[], verbes: readonly string[]): string[] => [
  ...new Set([
    PROGRAMME,
    ...faits.map((id) => faitConjugaison6e(id).source),
    ...verbes.map((v) => sourceDe(v as Verbe)),
  ]),
];
