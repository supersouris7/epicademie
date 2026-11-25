/**
 * Données du chapitre « Orthographe des mots » (CM1) : faits cités et banques de phrases écrites pour l'exercice.
 * Chaque fait porte l'identifiant de sa source (registre `sources.ts`) et sa citation exacte.
 * Dans les phrases, « … » marque la place d'un mot à écrire.
 */
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });
const prog = (id: string, citation: string) => f(id, PROGRAMME, citation);
const tlfi = (id: string, citation: string) => f(id, `cnrtl-${id}`, citation);

export const FAITS_ORTHOGRAPHE: readonly Fait[] = [
  prog(
    'mots-frequents',
    'Écrire correctement les mots les plus fréquents de la langue en s’appuyant sur les régularités et la formation',
  ),
  prog('substitution', 'substitution (ou remplacement)'),
  prog(
    'etre-avoir',
    'Conjugaisons à mémoriser et à maîtriser : présent de l’indicatif, imparfait, futur, passé composé des verbes être et avoir',
  ),
  prog('conjonctions', 'Identifier et nommer les conjonctions de coordination'),
  prog(
    'determinants',
    'Identifier et nommer les déterminants suivants : articles définis, indéfinis, déterminants possessifs et démonstratifs',
  ),
  prog('pronoms', 'Distinguer les pronoms personnels sujets des pronoms personnels compléments'),
  prog('adverbes', 'Identifier et nommer les adverbes les plus fréquents'),
  prog('invariable', 'caractère invariable est souligné'),
  f('avoir', 'academie-avoir', "j'ai, tu as, il a, nous avons, vous avez, ils ont ; j'avais, nous avions"),
  f('etre', 'academie-etre', "je suis, tu es, il est, nous sommes, vous êtes, ils sont ; j'étais"),
  f(
    'preposition-a',
    'academie-a',
    'La préposition À introduit un complément rattaché à un verbe, à un nom, à un adjectif ou à un adverbe',
  ),
  tlfi('et', 'servant à coordonner des termes, des groupes de termes et des phrases, et exprimant une addition'),
  tlfi('son', "il s'accorde en genre (son, sa) et en nombre (ses) avec le subst. du groupe nom."),
  tlfi(
    'on',
    "Pronom personnel de troisième personne, exprimant l'idée d'animé humain et fonctionnant toujours comme sujet",
  ),
  tlfi('ce', 'ces devant un subst. plur.'),
  tlfi('preposition', 'Partie du discours invariable qui, placée devant un élément à valeur nominale'),
  tlfi(
    'adverbe',
    'Partie du discours neutre et invariable qui peut être rapportée à un verbe, à un adjectif, à une préposition ou à un autre adverbe',
  ),
  // Mots invariables : la citation est l'en-tête de l'article (le mot et sa classe).
  tlfi('toujours', 'TOUJOURSadverbe'),
  tlfi('souvent', 'SOUVENTadverbe'),
  tlfi('jamais', 'JAMAISadverbe'),
  tlfi('alors', 'ALORSadverbe'),
  tlfi('encore', 'ENCOREadverbe'),
  tlfi('deja', 'DÉJÀadverbe de temps'),
  tlfi('assez', 'ASSEZadverbe'),
  tlfi('longtemps', 'LONGTEMPSadverbe'),
  tlfi('maintenant', 'MAINTENANTadverbe'),
  tlfi('bientot', 'BIENTÔTadverbe de temps'),
  tlfi('enfin', 'ENFINadverbe'),
  tlfi(
    'beaucoup',
    'Adverbe exprimant, selon le terme auquel il se rapporte une grande quantité ou une forte intensité',
  ),
  tlfi('demain', 'DEMAINadverbe et substantif masculin'),
  tlfi('aujourdhui', 'Adverbe de temps signifiant'),
  tlfi('chez', 'CHEZpréposition'),
  tlfi('sans', 'SANSpréposition'),
  tlfi('sous', 'SOUSpréposition'),
  tlfi('pour', 'POURpréposition'),
  tlfi('entre', 'ENTREpréposition'),
];

export const faitOrthographe = (id: string): Fait => {
  const x = FAITS_ORTHOGRAPHE.find((y) => y.id === id);
  if (!x) throw new Error(`fait inconnu : ${id}`);
  return x;
};

/** Sources (programme + articles de dictionnaire) des faits cités par une notion. */
export const sourcesOrthographe = (...ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitOrthographe(id).source)]),
];

// Aucun prénom dans les phrases.

// ───────────────────────── Mots qui se prononcent pareil ─────────────────────────

/** Une phrase à un ou plusieurs trous, avec les mots attendus dans l'ordre. */
export interface Phrase {
  readonly texte: string;
  readonly mots: readonly string[];
}

export interface Emploi {
  readonly mot: string;
  /** Qui est ce mot, en une phrase courte. */
  readonly role: string;
  /** Comment vérifier que c'est bien lui. */
  readonly essai: string;
}

export interface Paire {
  readonly emplois: readonly [Emploi, Emploi];
  /** Troisième proposition, nettement différente, du niveau 1. */
  readonly intrus: { readonly mot: string; readonly why: string };
  /** Indice commun aux deux mots (ne donne pas la réponse). */
  readonly indice: string;
  /** Un seul trou : niveaux 1 à 3. */
  readonly simples: readonly Phrase[];
  /** Deux trous, un pour chaque mot : niveaux 4 et 5. */
  readonly doubles: readonly Phrase[];
}

const p = (texte: string, ...mots: string[]): Phrase => ({ texte, mots });

export const A_A: Paire = {
  emplois: [
    {
      mot: 'a',
      role: '« a » est le verbe avoir : il a, elle a.',
      essai: 'On peut dire « avait » à la place.',
    },
    {
      mot: 'à',
      role: '« à » est une préposition : un petit mot qui ne change jamais.',
      essai: 'On ne peut pas dire « avait » à la place.',
    },
  ],
  intrus: { mot: 'as', why: '« as » va seulement avec « tu » : tu as.' },
  indice: 'Essaie de dire « avait » à la place du mot qui manque.',
  simples: [
    p('Mon frère … un vélo rouge.', 'a'),
    p('Le chat … faim.', 'a'),
    p('La voisine … deux chiens.', 'a'),
    p('Ce livre … cent pages.', 'a'),
    p('Il … très froid ce matin.', 'a'),
    p('Nous allons … la piscine.', 'à'),
    p('Elle joue … la balle.', 'à'),
    p('Je rentre … la maison.', 'à'),
    p('Le train part … midi.', 'à'),
    p('Tu penses … tes vacances.', 'à'),
  ],
  doubles: [
    p('Ma sœur … un billet pour aller … Paris.', 'a', 'à'),
    p('Le chien … une niche … côté du garage.', 'a', 'à'),
    p('Il … appris … nager cet été.', 'a', 'à'),
    p('Grâce … sa lampe, elle … trouvé la clé.', 'à', 'a'),
    p('Le boulanger … du pain chaud … vendre.', 'a', 'à'),
    p('À la fin du match, l’équipe … le sourire grâce … son but.', 'a', 'à'),
    p('La maîtresse … demandé un dessin … chaque élève.', 'a', 'à'),
  ],
};

export const ET_EST: Paire = {
  emplois: [
    {
      mot: 'et',
      role: '« et » est une conjonction de coordination : il ajoute une chose à une autre.',
      essai: 'On peut dire « et aussi » à la place.',
    },
    {
      mot: 'est',
      role: '« est » est le verbe être : il est, elle est.',
      essai: 'On peut dire « était » à la place.',
    },
  ],
  intrus: { mot: 'es', why: '« es » va seulement avec « tu » : tu es.' },
  indice: 'Essaie de dire « était » à la place du mot qui manque.',
  simples: [
    p('J’aime les pommes … les poires.', 'et'),
    p('Le chien … le chat jouent ensemble.', 'et'),
    p('Il prend son sac … son manteau.', 'et'),
    p('Ma robe est bleue … blanche.', 'et'),
    p('Les filles … les garçons chantent.', 'et'),
    p('La soupe … trop chaude.', 'est'),
    p('Mon cartable … sous la table.', 'est'),
    p('Ce gâteau … délicieux.', 'est'),
    p('Le ciel … gris ce matin.', 'est'),
    p('Ma cousine … partie en train.', 'est'),
  ],
  doubles: [
    p('Le lion … grand … il rugit fort.', 'est', 'et'),
    p('Mon père … ma mère disent que la mer … calme.', 'et', 'est'),
    p('La classe … prête … le car arrive.', 'est', 'et'),
    p('Le jardin … fleuri … parfumé.', 'est', 'et'),
    p('Il prend le pain … le fromage avec un couteau qui … propre.', 'et', 'est'),
    p('Son vélo … neuf … très rapide.', 'est', 'et'),
    p('Les crayons … les gommes sont là, mais la règle … cassée.', 'et', 'est'),
  ],
};

export const SON_SONT: Paire = {
  emplois: [
    {
      mot: 'son',
      role: '« son » est un déterminant possessif : la chose est à quelqu’un.',
      essai: 'On peut dire « mon » à la place.',
    },
    {
      mot: 'sont',
      role: '« sont » est le verbe être au pluriel : ils sont, elles sont.',
      essai: 'On peut dire « étaient » à la place.',
    },
  ],
  intrus: { mot: 'sons', why: '« sons » veut dire des bruits : des sons.' },
  indice: 'Essaie de dire « étaient », puis « mon », à la place du mot qui manque.',
  simples: [
    p('Il range … cartable.', 'son'),
    p('La fille appelle … chien.', 'son'),
    p('Le peintre lave … pinceau.', 'son'),
    p('Elle ferme … livre.', 'son'),
    p('Mon cousin répare … vélo.', 'son'),
    p('Les enfants … contents.', 'sont'),
    p('Mes chaussures … mouillées.', 'sont'),
    p('Les portes … fermées.', 'sont'),
    p('Où … les ciseaux ?', 'sont'),
    p('Ces fraises … sucrées.', 'sont'),
  ],
  doubles: [
    p('Les amis de … frère … arrivés.', 'son', 'sont'),
    p('Le chien et … maître … au parc.', 'son', 'sont'),
    p('Dans … sac, les billes … rangées.', 'son', 'sont'),
    p('Les voisins … partis avec … chat.', 'sont', 'son'),
    p('Les feutres de … ami … neufs.', 'son', 'sont'),
    p('Elle dit que … gâteau et sa tarte … prêts.', 'son', 'sont'),
    p('Quand les élèves … là, le maître ouvre … cahier.', 'sont', 'son'),
  ],
};

export const ON_ONT: Paire = {
  emplois: [
    {
      mot: 'on',
      role: '« on » est un pronom personnel : il est toujours sujet, comme « il ».',
      essai: 'On peut dire « il » à la place.',
    },
    {
      mot: 'ont',
      role: '« ont » est le verbe avoir au pluriel : ils ont, elles ont.',
      essai: 'On peut dire « avaient » à la place.',
    },
  ],
  intrus: { mot: 'ou', why: '« ou » sert à choisir : le lait ou le jus.' },
  indice: 'Essaie de dire « avaient », puis « il », à la place du mot qui manque.',
  simples: [
    p('Dans la cour, … joue au ballon.', 'on'),
    p('Ce soir, … mange des crêpes.', 'on'),
    p('Quand … court, il faut respirer.', 'on'),
    p('En hiver, … met un bonnet.', 'on'),
    p('Demain, … part à la montagne.', 'on'),
    p('Les élèves … un nouveau cahier.', 'ont'),
    p('Mes voisins … trois poules.', 'ont'),
    p('Les oiseaux … des plumes.', 'ont'),
    p('Ils … très soif.', 'ont'),
    p('Les enfants … fini le puzzle.', 'ont'),
  ],
  doubles: [
    p('Quand … arrive, les joueurs … déjà commencé.', 'on', 'ont'),
    p('Mes parents … dit qu’… irait au cinéma.', 'ont', 'on'),
    p('Les cousins … un jeu et … y joue tous ensemble.', 'ont', 'on'),
    p('Ce matin, … voit que les arbres … des bourgeons.', 'on', 'ont'),
    p('Les voisins … un chien : … l’entend aboyer.', 'ont', 'on'),
    p('Si … cherche bien, les lunettes … sûrement une cachette.', 'on', 'ont'),
    p('Les pirates … une carte, mais … ne la voit pas.', 'ont', 'on'),
  ],
};

export const CES_SES: Paire = {
  emplois: [
    {
      mot: 'ces',
      role: '« ces » est un déterminant démonstratif : il montre des choses.',
      essai: 'Au singulier, on dit « ce », « cet » ou « cette ».',
    },
    {
      mot: 'ses',
      role: '« ses » est un déterminant possessif : les choses sont à quelqu’un.',
      essai: 'Au singulier, on dit « son » ou « sa ».',
    },
  ],
  intrus: { mot: 'c’est', why: '« c’est » veut dire « cela est » : c’est joli.' },
  indice: 'Demande-toi : montre-t-on les choses, ou sont-elles à quelqu’un ?',
  // La parenthèse ou la fin de phrase dit si on montre (-là) ou si la chose est à quelqu'un (à lui, à elle).
  simples: [
    p('Regarde … nuages-là !', 'ces'),
    p('Tu vois … deux oiseaux, là-bas ?', 'ces'),
    p('Je voudrais goûter … gâteaux-ci.', 'ces'),
    p('Qui a posé … cartons-là ?', 'ces'),
    p('Admire … fleurs que je te montre.', 'ces'),
    p('Le garçon lace … chaussures à lui.', 'ses'),
    p('La fillette range … affaires à elle.', 'ses'),
    p('Le chat lèche … propres pattes.', 'ses'),
    p('Mon voisin arrose … salades à lui.', 'ses'),
    p('La reine cherche … propres bijoux.', 'ses'),
  ],
  doubles: [
    p('Regarde … bottes-là : le pêcheur préfère … bottes à lui.', 'ces', 'ses'),
    p('Le peintre prend … pinceaux à lui et peint … arbres-là.', 'ses', 'ces'),
    p('Dans … cages-là, la poule retrouve … propres poussins.', 'ces', 'ses'),
    p('La dame montre … photos à elle à … enfants-là.', 'ses', 'ces'),
    p('Tu vois … deux coureurs, là-bas ? Chacun noue … propres lacets.', 'ces', 'ses'),
    p('Le clown sort de … poches à lui … trois balles que tu vois.', 'ses', 'ces'),
  ],
};

export const PAIRES: readonly Paire[] = [A_A, ET_EST, SON_SONT, ON_ONT, CES_SES];

// ───────────────────────── Mots invariables fréquents ─────────────────────────

export interface MotInvariable {
  readonly mot: string;
  readonly classe: 'adverbe' | 'préposition';
  readonly fait: string;
  /** Niveaux 1 à 3 (courant) ou 4 et 5 (difficile à écrire). */
  readonly niveau: 'courant' | 'difficile';
  /** Phrase à un trou. */
  readonly phrase: string;
  /** Début du mot, à compléter (niveau 3). */
  readonly debut: string;
  /** Erreurs typiques d'écriture. */
  readonly fautes: readonly [string, string];
}

/** Un mot : sa classe, le début donné au niveau 3 et les deux fautes typiques. */
const mi = (
  niveau: MotInvariable['niveau'],
  classe: MotInvariable['classe'],
  [mot, fait, debut]: readonly [mot: string, fait: string, debut: string],
  fautes: MotInvariable['fautes'],
  phrase: string,
): MotInvariable => ({ niveau, classe, mot, fait, debut, fautes, phrase });

export const MOTS_INVARIABLES: readonly MotInvariable[] = [
  mi('courant', 'adverbe', ['toujours', 'toujours', 'touj'], ['toujour', 'toujourt'], 'Il arrive … à l’heure.'),
  mi('courant', 'adverbe', ['souvent', 'souvent', 'souv'], ['souvant', 'souven'], 'Nous allons … à la bibliothèque.'),
  mi('courant', 'adverbe', ['jamais', 'jamais', 'jam'], ['jamai', 'jamet'], 'Mon chat ne mord … personne.'),
  mi('courant', 'adverbe', ['alors', 'alors', 'al'], ['alor', 'allors'], 'La pluie tombe, … on rentre.'),
  mi('courant', 'adverbe', ['encore', 'encore', 'enc'], ['encor', 'ancore'], 'Tu veux … un peu de soupe ?'),
  mi('courant', 'adverbe', ['assez', 'assez', 'ass'], ['asser', 'assé'], 'J’ai … mangé, merci.'),
  mi('courant', 'adverbe', ['demain', 'demain', 'dem'], ['demin', 'deumain'], 'Nous partirons … matin.'),
  mi('courant', 'préposition', ['chez', 'chez', 'ch'], ['ché', 'chés'], 'Je dors … ma tante.'),
  mi('courant', 'préposition', ['sans', 'sans', 'sa'], ['sant', 'sens'], 'Il sort … son manteau.'),
  mi('courant', 'préposition', ['sous', 'sous', 'so'], ['sou', 'souz'], 'Le chien se cache … le lit.'),
  mi('courant', 'préposition', ['pour', 'pour', 'po'], ['pourt', 'poure'], 'Ce cadeau est … toi.'),
  mi('courant', 'préposition', ['entre', 'entre', 'ent'], ['antre', 'entr'], 'La gomme est … la règle et le stylo.'),
  mi(
    'difficile',
    'adverbe',
    ['aujourd’hui', 'aujourdhui', 'aujourd'],
    ['aujourdui', 'aujourd’ui'],
    'Hier il pleuvait, mais … il fait beau.',
  ),
  mi(
    'difficile',
    'adverbe',
    ['longtemps', 'longtemps', 'longt'],
    ['lontemps', 'longtemp'],
    'Nous avons attendu … sous la pluie.',
  ),
  mi(
    'difficile',
    'adverbe',
    ['maintenant', 'maintenant', 'maint'],
    ['maintenan', 'mintenant'],
    'Assez joué : il faut … travailler !',
  ),
  mi('difficile', 'adverbe', ['beaucoup', 'beaucoup', 'beauc'], ['beaucou', 'bocoup'], 'Il a neigé … cette nuit.'),
  mi('difficile', 'adverbe', ['bientôt', 'bientot', 'bient'], ['bientot', 'bientaux'], 'Nous serons … en vacances.'),
  mi('difficile', 'adverbe', ['déjà', 'deja', 'dé'], ['déja', 'dejà'], 'Tu as … fini ton dessin ?'),
  mi(
    'difficile',
    'adverbe',
    ['enfin', 'enfin', 'enf'],
    ['enfain', 'anfin'],
    'Après une heure d’attente, voilà … le bus !',
  ),
];

/** Mots qui changent d'écriture, avec une autre de leurs formes (intrus du niveau 2). */
export const MOTS_VARIABLES: readonly (readonly [string, string])[] = [
  ['petit', 'des petites'],
  ['cheval', 'des chevaux'],
  ['chanter', 'nous chantons'],
  ['joli', 'des jolies'],
  ['table', 'des tables'],
  ['finir', 'ils finissent'],
  ['vert', 'des feuilles vertes'],
  ['ami', 'des amies'],
  ['grand', 'une grande'],
  ['jouer', 'tu joues'],
];
