/**
 * Données du chapitre « Culture littéraire » (CM2). Faits cités : identifiant de source (registre `sources.ts`) et
 * citation exacte. Les textes à lire sont écrits pour l'exercice ; les deux morales de La Fontaine (domaine public)
 * sont reprises des articles cités.
 */
import type { Choix, Saisie, Suite } from './lecture-cm2.donnees.ts';
import type { TexteLong, Trou } from './lecture.donnees.ts';
import type { Fait } from './phrases.donnees.ts';

const PROGRAMME = 'francais-cycle3-2025';

const faits = new Map<string, Fait>();
const fait = (id: string, source: string, citation: string): string => {
  faits.set(id, { id: `cl2-${id}`, source, citation });
  return `cl2-${id}`;
};
/** Article du Dictionnaire de l'Académie française, 9e édition (identifiant `academie-…`). */
const acad = (id: string, article: string, citation: string) => fait(id, `academie-${article}`, citation);
/** Article du Trésor de la langue française informatisé (identifiant `cnrtl-…`). */
const tlf = (id: string, article: string, citation: string) => fait(id, `cnrtl-${article}`, citation);

// ───────────────────────── Programme (cycle 3) ─────────────────────────

fait(
  'prog-genres',
  PROGRAMME,
  'Reconnaître et nommer les principaux genres littéraires à l’aide de critères travaillés en classe',
);
fait(
  'prog-forme',
  PROGRAMME,
  'Distinguer, par la mise en page et les caractéristiques d’écriture spécifiques, un extrait de théâtre, un poème, un texte narratif',
);
fait('prog-heros', PROGRAMME, '(épopée, roman, fable, conte, nouvelle, pièce de théâtre)');
fait(
  'prog-poesie',
  PROGRAMME,
  'Par l’écoute et la lecture d’un recueil de poèmes et de textes poétiques de siècles différents',
);
fait('prog-morale', PROGRAMME, 'Il apprend à comprendre les valeurs morales portées par les');
fait('prog-merveilleux', PROGRAMME, 'Découvrir des mondes imaginaires et éveiller la sensibilité à l’inconnu');

// ───────────────────────── Définitions ─────────────────────────

const RECIT = [
  acad('recit', 'recit', "Relation, narration, orale ou écrite, d'un évènement."),
  acad('recit-personne', 'recit', 'Énoncé, le plus souvent à la troisième personne'),
  acad('narrateur', 'narrateur', 'Celui, celle qui narre, qui raconte quelque chose.'),
  acad('narrateur-je', 'narrateur', 'celui ou celle qui mène le récit à la première personne'),
  acad('auteur', 'auteur', 'Personne qui a composé et réalisé une œuvre littéraire, scientifique ou artistique.'),
  acad('personnage', 'personnage', "Être fictif d'une œuvre littéraire quelle qu'elle soit"),
  acad('heros', 'heros', "Principal personnage d'une œuvre d'imagination"),
  acad(
    'denouement',
    'denouement',
    "Ce qui termine une pièce de théâtre, un roman, un film, en démêlant le nœud de l'action",
  ),
];
const THEATRE = [
  acad('replique', 'replique', 'partie du texte que doit prononcer un acteur dans un dialogue'),
  tlf(
    'didascalie',
    'didascalie',
    "Instructions données par un auteur dramatique aux acteurs sur la manière d'interpréter leur rôle",
  ),
  tlf(
    'indication',
    'indication',
    "[Dans une pièce de théâtre] Précisions que fournit l'auteur sur le décor, les jeux de scène",
  ),
  tlf(
    'tirade',
    'tirade',
    "Longue suite de phrases ou de vers débitée par un personnage sans qu'il soit interrompu par un de ses interlocuteurs.",
  ),
  acad(
    'aparte',
    'aparte',
    "Ce qu'un acteur dit à part soi et que les personnages en scène sont censés ne pas entendre",
  ),
  acad('scene', 'scene', 'Chacune des parties constituant un acte dans une pièce de théâtre'),
  acad('acte', 'acte', "Chacune des grandes divisions d'une pièce, d'un opéra"),
  acad('scene-lieu', 'scene', 'Partie du théâtre où les acteurs jouent devant le public'),
  acad('personnage-theatre', 'personnage', "Être fictif d'une œuvre théâtrale, incarné sur scène par un acteur"),
  acad('comedie', 'comedie', 'Œuvre théâtrale en prose ou en vers, qui a pour objet de divertir'),
];
const POESIE = [
  acad('poesie', 'poesie', 'Art du langage en vers, de ses rythmes et figures, par opposition à la prose'),
  acad('poeme', 'poeme', 'pièce en vers'),
  tlf('vers', 'vers', 'disposition unilinéaire'),
  tlf('strophe', 'strophe', "Unité structurelle du discours versifié formée d'un nombre déterminé de vers"),
  acad('rime', 'rime', "Retour d'un ou plusieurs phonèmes à la fin de deux ou plusieurs vers"),
  acad('quatrain', 'quatrain', 'Pièce de poésie ou strophe de quatre vers.'),
  acad('rimes-plates', 'rime', 'les vers qui se suivent riment deux par deux, selon le schéma AABBCC'),
  acad('rimes-croisees', 'rime', 'le premier vers rime avec le troisième, le deuxième avec le quatrième'),
  acad('rimes-embrassees', 'rime', 'deux rimes masculines sont intercalées entre deux rimes féminines, ou inversement'),
];
const FABLE = [
  acad(
    'fable',
    'fable',
    'court récit en prose ou en vers par lequel on exprime une vérité générale, le plus souvent morale, sous le voile de la fiction',
  ),
  acad('fabulistes', 'fable', "Les fables d'Ésope, de Phèdre, de La Fontaine, de Florian."),
  acad('morale', 'morale', "La morale d'un ouvrage, la leçon morale qui s'en dégage"),
  acad('moralite-place', 'moralite', 'La moralité peut être placée avant le récit'),
  acad(
    'moralite-lievre',
    'moralite',
    '« Rien ne sert de courir, il faut partir à point », dans « Le Lièvre et la Tortue »',
  ),
  acad('moralite-bouc', 'moralite', '« En toute chose il faut considérer la fin », dans « Le Renard et le Bouc »'),
];
const CONTE = [
  acad('conte', 'conte', "Court récit d'aventures imaginaires, de caractère souvent merveilleux."),
  acad('perrault', 'conte', "Contes de ma mère l'Oye, de Perrault (1697)"),
  acad('merveilleux', 'merveilleux', "intervention d'êtres ou d'éléments surnaturels"),
  acad('fee', 'fee', 'Être féminin imaginaire à qui sont attribués des pouvoirs magiques.'),
  acad('ogre', 'ogre', 'Personnage des contes et légendes, sorte de géant'),
  acad(
    'metamorphose',
    'metamorphose',
    "Changement de forme, de nature ou d'état qui, dans la légende ou les récits merveilleux, s'opère par quelque cause surnaturelle.",
  ),
  acad('fois', 'fois', 'La plupart des anciens contes commencent par : « Il était une fois »'),
];

/** Faits cités par chaque notion. */
export const DEFINITIONS_CULTURE = {
  recit: ['cl2-prog-genres', 'cl2-prog-heros', ...RECIT],
  theatre: ['cl2-prog-forme', 'cl2-prog-heros', ...THEATRE],
  poesie: ['cl2-prog-poesie', 'cl2-prog-forme', ...POESIE],
  fable: ['cl2-prog-morale', 'cl2-prog-heros', ...FABLE],
  conte: ['cl2-prog-merveilleux', 'cl2-prog-heros', ...CONTE],
} as const;

export const FAITS_CULTURE_CM2: readonly Fait[] = [...faits.values()];

export const faitCultureCm2 = (id: string): Fait => {
  const f = FAITS_CULTURE_CM2.find((x) => x.id === id);
  if (!f) throw new RangeError(`fait inconnu : ${id}`);
  return f;
};

/** Identifiants de sources distincts des faits donnés. */
export const sourcesCultureCm2 = (ids: readonly string[]): string[] => [
  ...new Set([PROGRAMME, ...ids.map((id) => faitCultureCm2(id).source)]),
];

// ───────────────────────── Formes ─────────────────────────

/** Les cinq niveaux d'une notion. */
export interface Banque {
  /** N1 : QCM à 3 propositions. */
  readonly decouvrir: readonly Choix[];
  /** N2 : QCM à 4 propositions ou association de 3 paires. */
  readonly reconnaitre: readonly Choix[];
  readonly paires: readonly (readonly [string, string])[];
  /** N3 : saisie ou remise en ordre. */
  readonly ecrire: readonly Saisie[];
  readonly suites: readonly Suite[];
  /** N4 : saisie piégée ou association de 5 paires. */
  readonly pieges: readonly Saisie[];
  readonly cinq: readonly (readonly [string, string])[];
  /** N5 : texte long à quatre trous. */
  readonly longs: readonly TexteLong[];
}

type Faux = readonly [string, string];
const qc = (
  [titre = '', ...lignes]: string[],
  question: string,
  bon: string,
  preuve: string,
  ...faux: Faux[]
): Choix => ({
  titre,
  lignes,
  question,
  bon,
  faux,
  preuve,
});
const sa = (
  [titre = '', ...lignes]: string[],
  question: string,
  accepted: string[],
  preuve: string,
  ...pieges: Faux[]
): Saisie => ({ titre, lignes, question, accepted, pieges, preuve });
const suite = (titre: string, ordre: string[], preuve: string): Suite => ({ titre, lignes: [], ordre, preuve });
const trou = (etiquette: string, bon: string, faux: readonly [string, string], preuve: string): Trou => ({
  etiquette,
  bon,
  faux,
  preuve,
});
const long = (titre: string, lignes: string[], ...trous: Trou[]): TexteLong => ({ titre, lignes, trous });

// ───────────────────────── 1. Récit, personnage, narrateur ─────────────────────────

const BANQUE_RECIT: Banque = {
  decouvrir: [
    qc(
      ['La barque', 'Un matin, Zélie détacha la barque.', 'Le courant l’emporta loin du village.'],
      'Qui est le personnage de ce récit ?',
      'Zélie',
      '« Zélie détacha la barque » : c’est elle qui agit.',
      ['La barque', 'La barque est un objet : elle ne décide rien.'],
      ['Le village', 'Le village est un lieu, pas un personnage.'],
    ),
    qc(
      ['Le robot', 'Bip le robot ouvrit les yeux.', 'Il partit chercher son ami dans la ville.'],
      'Qui est le héros de ce récit ?',
      'Bip',
      'Tout le texte suit « Bip » : c’est le personnage principal.',
      ['La ville', 'La ville est le lieu de l’histoire.'],
      ['L’ami', 'L’ami est cherché, mais l’histoire suit un autre personnage.'],
    ),
    qc(
      ['La clé', 'Je trouvai une clé sous la mousse.', 'Je la glissai dans ma poche.'],
      'Comment le narrateur raconte-t-il ?',
      'Avec « je »',
      'Le texte dit « Je trouvai » : le narrateur raconte à la première personne.',
      ['Avec « il »', 'Relis le premier mot : ce n’est pas « il ».'],
      ['Avec « tu »', 'Personne ne s’adresse à « tu » dans ce texte.'],
    ),
    qc(
      [
        'La couverture',
        'Sur la couverture du livre, on lit :',
        '« Le Phare endormi, une histoire écrite par Rosa Brun. »',
      ],
      'Qui est Rosa Brun ?',
      'L’autrice du livre',
      '« écrite par Rosa Brun » : elle a composé l’œuvre.',
      ['Un personnage', 'Rien ne dit qu’elle agit dans l’histoire.'],
      ['Le titre du livre', 'Le titre est « Le Phare endormi ».'],
    ),
    qc(
      ['La forêt', 'Noé marchait dans la forêt.', 'Il entendit un hibou et se cacha.'],
      'Qu’est-ce que ce texte ?',
      'Un récit',
      'Il raconte des événements vécus par « Noé ».',
      ['Une liste de courses', 'Une liste ne raconte pas d’événements.'],
      ['Une recette', 'Une recette explique comment préparer un plat.'],
    ),
  ],
  reconnaitre: [
    qc(
      ['Le grenier', 'Marius monta au grenier.', 'Il ouvrit un vieux coffre et resta muet.'],
      'Qui raconte cette histoire ?',
      'Un narrateur qui n’est pas dans l’histoire',
      'Le texte dit « Marius » et « Il » : le narrateur ne dit jamais « je ».',
      ['Marius, qui dit « je »', 'Marius ne dit jamais « je » ici.'],
      ['Le coffre', 'Un objet muet ne raconte rien dans ce texte.'],
      ['Un narrateur qui parle à Marius avec « tu »', 'Le mot « tu » n’apparaît pas.'],
    ),
    qc(
      ['La course', 'Ma sœur Lison courait devant.', 'Moi, je soufflais comme un vieux moteur.'],
      'Qui raconte cette histoire ?',
      'Un personnage de l’histoire',
      '« Moi, je soufflais » : celui qui raconte participe à la course.',
      ['Lison', 'Lison est désignée par « Ma sœur » : un autre parle d’elle.'],
      ['Un narrateur absent de l’histoire', 'Le narrateur dit « Moi, je » : il est dans l’histoire.'],
      ['Le moteur', 'Le moteur sert seulement de comparaison.'],
    ),
    qc(
      [
        'La fin',
        'Le trésor était perdu depuis des jours.',
        'Enfin, Maya le retrouva sous le pont.',
        'Toute l’équipe rentra, ravie.',
      ],
      'Comment s’appelle ce qui termine ce récit ?',
      'Le dénouement',
      '« Enfin, Maya le retrouva » : le problème se règle.',
      ['Le titre', 'Un titre annonce l’histoire, au début.'],
      ['Le tout début', 'Au début, le trésor n’est pas encore retrouvé.'],
      ['La liste des personnages', 'Ces phrases racontent, elles ne dressent pas de liste.'],
    ),
    qc(
      ['Le dragon', 'Dans ce roman, Olga Pierre invente un dragon timide.', 'Ce dragon, Brume, a peur des chandelles.'],
      'Qui est Brume ?',
      'Un personnage',
      '« Ce dragon, Brume » est un être inventé qui vit dans le roman.',
      ['L’autrice', 'L’autrice est Olga Pierre.'],
      ['Le lecteur', 'Le lecteur lit le livre : il n’y est pas inventé.'],
      ['Le titre du roman', 'Aucun titre n’est donné ici.'],
    ),
  ],
  paires: [
    ['la personne qui écrit le livre', 'l’auteur'],
    ['celui qui raconte l’histoire', 'le narrateur'],
    ['un être inventé qui agit', 'le personnage'],
    ['le personnage principal', 'le héros'],
    ['ce qui termine l’histoire', 'le dénouement'],
    ['la narration d’un événement', 'le récit'],
  ],
  ecrire: [
    sa(
      ['La lettre', 'Sur la plage, je vis une bouteille.', 'Je tirai le bouchon avec les dents.'],
      'Quel petit mot montre que le narrateur est dans l’histoire ?',
      ['je'],
      '« je vis », « Je tirai » : la première personne.',
      ['la', '« la » désigne une plage : cherche qui agit.'],
      ['il', 'Le texte n’emploie pas « il ».'],
    ),
    sa(
      ['Le métier', 'Camille imagine une histoire de pirates.', 'Elle l’écrit et la signe.'],
      'Camille a composé l’œuvre. On dit qu’elle est son… (un mot)',
      ['autrice', 'auteur', 'auteure', 'l’autrice', 'son autrice', 'son auteur'],
      '« Elle l’écrit et la signe ».',
      ['narratrice', 'Le narrateur raconte dans le texte. Ici, on parle de la personne qui écrit.'],
      ['héroïne', 'L’héroïne est un personnage inventé.'],
    ),
    sa(
      ['L’exploit', 'Tout le roman suit Aïcha.', 'C’est elle qui sauve le village, du premier au dernier chapitre.'],
      'Aïcha est le personnage principal. Quel autre nom lui donne-t-on ?',
      ['héroïne', 'l’héroïne', 'une héroïne', 'héros'],
      '« Tout le roman suit Aïcha ».',
      ['narratrice', 'Rien ne dit qu’Aïcha raconte.'],
      ['autrice', 'L’autrice écrit le livre. Aïcha est inventée.'],
    ),
    sa(
      [
        'La voix',
        'Une voix te raconte l’histoire d’un chat perdu.',
        'Elle te dit ce qu’il fait, puis ce qu’il ressent.',
      ],
      'Comment s’appelle celui qui raconte ?',
      ['le narrateur', 'narrateur', 'la narratrice', 'narratrice', 'un narrateur'],
      'La « voix » raconte : c’est son rôle.',
      ['l’auteur', 'L’auteur écrit le livre. La voix qui raconte porte un autre nom.'],
      ['le héros', 'Le héros est le chat : il vit l’aventure.'],
    ),
    sa(
      [
        'La grotte',
        'Pia et son chien entrent dans la grotte.',
        'La lampe s’éteint.',
        'Ils trouvent la sortie à tâtons.',
      ],
      'Ce texte raconte des événements. C’est un… (un mot)',
      ['récit', 'un récit', 'texte narratif', 'un texte narratif'],
      'Des personnages « entrent », puis « trouvent la sortie ».',
      ['poème', 'Le texte n’est pas écrit pour ses vers ou ses rimes : il raconte.'],
      ['dialogue', 'Personne ne parle dans ces phrases.'],
    ),
  ],
  suites: [
    suite(
      'Le cerf-volant',
      [
        'Un jour de vent, Nino sort son cerf-volant.',
        'Soudain, la ficelle casse.',
        'Alors, Nino court après le cerf-volant jusqu’au verger.',
        'Enfin, il le décroche d’un pommier.',
      ],
      '« Un jour », « Soudain », « Alors », « Enfin » donnent l’ordre.',
    ),
    suite(
      'Le phare',
      [
        'Depuis toujours, le phare guide les bateaux.',
        'Mais une nuit, sa lampe s’éteint.',
        'Aussitôt, la gardienne grimpe l’escalier.',
        'Elle change l’ampoule et la lumière revient.',
      ],
      'La panne arrive après « Depuis toujours » ; la réparation la suit.',
    ),
    suite(
      'La graine',
      [
        'Au printemps, Ilyes plante une graine.',
        'Quelques jours plus tard, une pousse sort de terre.',
        'En été, la pousse devient un grand tournesol.',
        'À l’automne, Ilyes récolte les graines de la fleur.',
      ],
      'Les saisons et « plus tard » rangent les faits.',
    ),
  ],
  pieges: [
    sa(
      [
        'Le journal',
        '« Je m’appelle Biscotte et je ronge les chaussons. »',
        'Ce livre a été écrit par Hélène Vasseur.',
      ],
      'Qui est le narrateur de ce livre ?',
      ['Biscotte'],
      '« Je m’appelle Biscotte » : le « je » qui raconte.',
      ['Hélène Vasseur', 'Elle est l’autrice : elle écrit, mais le « je » qui raconte est un autre.'],
      ['Hélène', 'Hélène écrit le livre. Cherche qui dit « je ».'],
    ),
    sa(
      [
        'Le sauvetage',
        'Je regardais Bastien grimper à l’arbre.',
        'C’est lui, le héros : il a sauvé le chaton, pas moi.',
      ],
      'D’après le texte, qui est le héros ?',
      ['Bastien'],
      '« C’est lui, le héros » renvoie à « Bastien ».',
      ['le narrateur', 'Le narrateur dit « pas moi ».'],
      ['le chaton', 'Le chaton est sauvé : il n’est pas appelé héros.'],
    ),
    sa(
      ['Le témoin', 'La reine ferma les volets.', 'Elle ne voulait voir personne.', 'Dehors, le peuple attendait.'],
      'Ce narrateur est-il « dans » l’histoire ou « hors » de l’histoire ? (dans ou hors)',
      ['hors', 'hors de l’histoire', 'en dehors', 'en dehors de l’histoire'],
      'Aucun « je » : « La reine », « Elle », « le peuple ».',
      ['dans', 'Cherche un « je » ou un « nous » : il n’y en a pas.'],
      ['dans l’histoire', 'Le narrateur ne participe à aucune action.'],
    ),
    sa(
      [
        'La visite',
        'Dans le récit, Mamie Rose dit : « Je pars. »',
        'Le narrateur ajoute : elle prit son parapluie et sortit.',
      ],
      'À quelle personne le narrateur raconte-t-il la fin : la première ou la troisième ?',
      ['troisième', 'la troisième', 'la troisième personne', 'troisième personne', '3e', '3e personne'],
      '« elle prit » : la troisième personne. Le « Je » est dans les paroles de Mamie Rose.',
      ['première', 'Le « Je » appartient aux paroles du personnage, pas au narrateur.'],
      ['la première', 'Regarde le verbe après les paroles : qui est le sujet ?'],
    ),
  ],
  cinq: [
    ['la personne qui écrit le livre', 'l’auteur'],
    ['la voix qui dit l’histoire', 'le narrateur'],
    ['un être inventé qui agit', 'le personnage'],
    ['le personnage principal', 'le héros'],
    ['ce qui termine l’histoire', 'le dénouement'],
    ['un narrateur qui dit « je »', 'la première personne'],
    ['un narrateur qui dit « il » ou « elle »', 'la troisième personne'],
  ],
  longs: [
    long(
      'La traversée',
      [
        'Roman écrit par Julie Mercier.',
        'Je m’appelle Timéo et je déteste l’eau.',
        'Pourtant, ce matin-là, mon chien tomba dans le canal.',
        'Je sautai sans réfléchir.',
        'Le soir, nous séchions tous les deux près du poêle.',
      ],
      trou('L’autrice est', 'Julie Mercier', ['Timéo', 'le chien'], '« Roman écrit par Julie Mercier ».'),
      trou('Le narrateur est', 'Timéo', ['Julie Mercier', 'le chien'], '« Je m’appelle Timéo ».'),
      trou('Il raconte à la', 'première personne', ['deuxième personne', 'troisième personne'], 'Il dit « je ».'),
      trou(
        'Le dénouement est',
        'le soir au sec près du poêle',
        ['la chute dans le canal', 'la présentation de Timéo'],
        'C’est ce qui termine : « Le soir, nous séchions ».',
      ),
    ),
    long(
      'La boulangère',
      [
        'Conte écrit par Paul Aubert.',
        'Il était une fois une boulangère nommée Ondine.',
        'Une nuit, son four refusa de chauffer.',
        'Ondine chercha du bois dans toute la vallée.',
        'Au matin, le pain doré embaumait le village.',
      ],
      trou('Le personnage principal est', 'Ondine', ['Paul Aubert', 'le four'], 'L’histoire suit « Ondine ».'),
      trou('Paul Aubert est', 'l’auteur', ['le héros', 'le village'], '« Conte écrit par Paul Aubert ».'),
      trou(
        'Le narrateur raconte à la',
        'troisième personne',
        ['première personne', 'deuxième personne'],
        '« Ondine chercha » : aucun « je ».',
      ),
      trou(
        'Le problème de départ est',
        'le four qui ne chauffe pas',
        ['le pain doré', 'la vallée trop petite'],
        '« son four refusa de chauffer ».',
      ),
    ),
  ],
};

// ───────────────────────── 2. Théâtre ─────────────────────────

const BANQUE_THEATRE: Banque = {
  decouvrir: [
    qc(
      ['Au parc', 'LOU. — Tu viens jouer ?', 'SAM (en bâillant). — J’arrive.'],
      'Que signifie « (en bâillant) » ?',
      'Une didascalie : elle dit comment jouer',
      'La parenthèse indique à l’acteur de bâiller.',
      ['Une réplique de Lou', 'Lou dit « Tu viens jouer ? ».'],
      ['Le titre de la pièce', 'Un titre ne se glisse pas devant une réplique.'],
    ),
    qc(
      ['La cuisine', 'MAX. — Qui a mangé la tarte ?', 'NINA. — Pas moi !'],
      'Que lis-tu après « NINA. — » ?',
      'Une réplique',
      '« Pas moi ! » : c’est le texte que dit Nina.',
      ['Une didascalie', 'La didascalie n’est pas prononcée : « Pas moi ! » l’est.'],
      ['Le nom d’un lieu', '« Pas moi ! » n’est pas un lieu.'],
    ),
    qc(
      ['La porte', 'LE GARDE. — Halte !', 'LE VOYAGEUR. — Je viens en ami.'],
      'À quoi servent les noms en majuscules ?',
      'Ils disent quel personnage parle',
      'Chaque nom précède les paroles de ce personnage.',
      ['Ils sont criés par les acteurs', 'Les noms ne sont pas prononcés.'],
      ['Ils annoncent la fin', 'Ils ouvrent chaque prise de parole.'],
    ),
    qc(
      ['Le marché', '(La scène se passe sur une place. Il pleut.)', 'ROSE. — Quel temps !'],
      'Que donne la première ligne ?',
      'Des indications sur le décor',
      'La parenthèse précise le lieu et la météo.',
      ['La réplique de Rose', 'La réplique de Rose est « Quel temps ! ».'],
      ['Une rime', 'Aucun vers ne répond à un autre.'],
    ),
    qc(
      ['Le bus', 'INÈS. — Il est parti !', 'HUGO. — Courons !'],
      'De quel genre est ce texte ?',
      'Du théâtre',
      'Les noms des personnages précèdent leurs paroles.',
      ['Un poème', 'Le texte n’est pas écrit en vers.'],
      ['Un documentaire', 'Il ne donne pas d’informations sur le réel.'],
    ),
  ],
  reconnaitre: [
    qc(
      ['Le coffre', 'PIRATE (à voix basse, au public). — Il ne sait pas que la clé est dans ma botte !'],
      'Comment appelle-t-on ces paroles que les autres personnages n’entendent pas ?',
      'Un aparté',
      '« au public » : les autres personnages sont censés ne pas entendre.',
      ['Une didascalie', 'La didascalie est la parenthèse, pas la phrase prononcée.'],
      ['Un titre', 'Un titre nomme la pièce.'],
      ['Une strophe', 'La strophe appartient à la poésie.'],
    ),
    qc(
      [
        'Le discours',
        'LE MAIRE. — Chers amis, notre fontaine est sèche. J’ai cherché partout, interrogé les anciens, creusé le jardin.',
        'Et ce matin, enfin, j’ai une idée. Écoutez-moi jusqu’au bout.',
      ],
      'Cette longue prise de parole, sans interruption, s’appelle…',
      'Une tirade',
      'Un seul personnage parle longtemps sans être coupé.',
      ['Un aparté', 'Le maire parle à tous : ce n’est pas caché.'],
      ['Une didascalie', 'La didascalie n’est pas dite par le personnage.'],
      ['Une rime', 'La rime est un son répété en fin de vers.'],
    ),
    qc(
      ['Les parties', 'ACTE I', 'Scène 1', 'Scène 2', 'ACTE II'],
      'Quelle partie est la plus grande ?',
      'L’acte',
      '« ACTE I » contient « Scène 1 » et « Scène 2 ».',
      ['La scène', 'Les scènes sont rangées à l’intérieur d’un acte.'],
      ['La réplique', 'Une réplique est seulement une prise de parole.'],
      ['La didascalie', 'La didascalie donne une indication de jeu.'],
    ),
    qc(
      ['La lettre', 'JULES (déchirant l’enveloppe). — Enfin !'],
      'Quel mot Jules doit-il prononcer ?',
      'Enfin !',
      'La parenthèse est une indication : seul « Enfin ! » est dit.',
      ['Déchirant l’enveloppe', 'C’est une didascalie : on la joue, on ne la dit pas.'],
      ['Jules', 'Le nom indique qui parle : il n’est pas dit.'],
      ['Tout, du début à la fin', 'Le nom et la parenthèse ne se prononcent pas.'],
    ),
  ],
  paires: [
    ['les paroles dites par un acteur', 'la réplique'],
    ['une indication de jeu non prononcée', 'la didascalie'],
    ['une longue prise de parole sans interruption', 'la tirade'],
    ['des mots que les autres ne sont pas censés entendre', 'l’aparté'],
    ['une grande division de la pièce', 'l’acte'],
    ['l’endroit où jouent les acteurs', 'la scène'],
  ],
  ecrire: [
    sa(
      ['La nuit', 'MILA (tremblant). — Il y a quelqu’un ?'],
      'Quel mot de ce texte est une didascalie ?',
      ['tremblant'],
      '« (tremblant) » indique comment jouer : on ne le dit pas.',
      ['Mila', 'C’est le nom du personnage qui parle.'],
      ['quelqu’un', 'Ce mot est prononcé : il fait partie de la réplique.'],
    ),
    sa(
      ['Le goûter', 'PAUL. — J’ai faim.', 'ZOÉ. — Déjà ?', 'PAUL. — Toujours !'],
      'Combien de répliques lis-tu ? (en chiffres ou en lettres)',
      ['3', 'trois'],
      'Il y a trois prises de parole : Paul, Zoé, puis Paul.',
      ['2', 'Il y a deux personnages, mais Paul parle deux fois.'],
      ['deux', 'Compte les prises de parole, pas les personnages.'],
    ),
    sa(
      ['Les mots du jeu', 'LÉON (en chuchotant). — Cache-toi !'],
      'Comment appelle-t-on l’indication « (en chuchotant) » ?',
      ['didascalie', 'la didascalie', 'une didascalie', 'indication scénique', 'une indication scénique'],
      'Elle précise le jeu et ne se prononce pas.',
      ['réplique', 'La réplique, c’est « Cache-toi ! ».'],
      ['aparté', 'Un aparté est une parole dite : ici, c’est une indication.'],
    ),
    sa(
      ['La réponse', 'LA REINE. — Où est mon chapeau ?', 'LE VALET. — Sur votre tête, Madame.'],
      'La phrase « Sur votre tête, Madame » est une… (un mot)',
      ['réplique', 'une réplique', 'la réplique'],
      'Le valet la prononce pour répondre à la reine.',
      ['didascalie', 'Cette phrase est dite sur scène : ce n’est pas une indication.'],
      ['rime', 'La rime est un son en fin de vers.'],
    ),
    sa(
      ['Qui parle ?', 'LE CHAT. — Ouvre la porte.', 'LA SOURIS. — Jamais de la vie !'],
      'Quel personnage dit « Jamais de la vie » ?',
      ['la souris', 'souris'],
      'Le nom placé avant les paroles dit qui parle.',
      ['le chat', 'Le chat demande d’ouvrir la porte.'],
      ['le narrateur', 'Ici, chaque personnage parle lui-même.'],
    ),
  ],
  suites: [],
  pieges: [
    sa(
      ['La farce', 'NOAH. — Je ne dirai rien.', '(Il sort en sifflant.)', 'EVA. — Quel menteur !'],
      'Combien de répliques lis-tu ? (en chiffres ou en lettres)',
      ['2', 'deux'],
      'La ligne entre parenthèses est une didascalie : elle ne compte pas.',
      ['3', 'La ligne entre parenthèses n’est pas dite : ne la compte pas.'],
      ['trois', 'Une didascalie n’est pas une réplique.'],
    ),
    sa(
      ['La surprise', 'ALBA (à part). — S’il savait ce qu’il y a dans ce sac !', 'TOM. — Tu disais ?'],
      'La première réplique est cachée à Tom. C’est un… (un mot)',
      ['aparté', 'un aparté'],
      '« (à part) » : Tom est censé ne pas entendre.',
      ['didascalie', '« (à part) » en est une, mais on demande le nom de la parole cachée.'],
      ['tirade', 'La phrase est courte : une tirade est longue.'],
    ),
    sa(
      ['Les divisions', 'Une pièce comporte deux grandes parties.', 'Chacune est découpée en plusieurs scènes.'],
      'Comment s’appelle une grande partie ?',
      ['acte', 'un acte', 'l’acte'],
      'Les scènes se rangent dans un acte.',
      ['chapitre', 'Le chapitre découpe un roman, pas une pièce.'],
      ['strophe', 'La strophe découpe un poème.'],
    ),
    sa(
      [
        'Le long récit du berger',
        'LE BERGER. — Je marchais depuis l’aube, mes brebis suivaient, le brouillard montait.',
        'Soudain, plus rien ! Ni chien, ni cloche. J’ai appelé, couru, pleuré presque.',
      ],
      'Le berger parle longtemps sans être coupé. Quel est le nom de cette prise de parole ?',
      ['tirade', 'une tirade', 'la tirade'],
      'Une seule voix, longtemps, sans interruption.',
      ['aparté', 'Rien ne dit que les autres n’entendent pas.'],
      ['didascalie', 'Ces phrases sont dites par le berger.'],
    ),
  ],
  cinq: [
    ['les paroles dites par un acteur', 'la réplique'],
    ['une indication de jeu non prononcée', 'la didascalie'],
    ['une longue prise de parole sans interruption', 'la tirade'],
    ['des mots que les autres ne sont pas censés entendre', 'l’aparté'],
    ['une grande division de la pièce', 'l’acte'],
    ['une partie d’un acte', 'la scène'],
    ['une pièce faite pour divertir', 'la comédie'],
  ],
  longs: [
    long(
      'Le gâteau disparu',
      [
        'ACTE I, scène 1',
        '(Une cuisine. Une assiette vide sur la table.)',
        'MAMAN. — Qui a pris le gâteau ?',
        'LILI (cachant ses mains). — Pas moi.',
        'MAMAN. — Montre-moi tes doigts !',
      ],
      trou(
        'La ligne entre parenthèses sur la cuisine est',
        'une didascalie',
        ['une réplique', 'un titre'],
        'Elle décrit le décor.',
      ),
      trou(
        'Le nombre de répliques est',
        'trois',
        ['deux', 'cinq'],
        'Maman, Lili, puis Maman : trois prises de parole.',
      ),
      trou(
        'Lili doit',
        'cacher ses mains',
        ['dire « cachant ses mains »', 'quitter la scène'],
        'C’est « (cachant ses mains) ».',
      ),
      trou(
        'Le texte est',
        'une pièce de théâtre',
        ['un poème', 'un documentaire'],
        'Les noms précèdent les paroles, avec des indications de jeu.',
      ),
    ),
    long(
      'Le dragon enrhumé',
      [
        'Scène 2',
        'CHEVALIER (brandissant son épée). — Sors de là, monstre !',
        'DRAGON. — Atchoum !',
        'CHEVALIER (à part). — Il est malade, je suis sauvé.',
        '(Le dragon se mouche bruyamment.)',
      ],
      trou('« brandissant son épée » est', 'une didascalie', ['une réplique', 'une tirade'], 'Une indication de jeu.'),
      trou('« Il est malade, je suis sauvé » est', 'un aparté', ['un titre', 'une tirade'], 'C’est dit « à part ».'),
      trou(
        'Celui qui dit « Atchoum » est',
        'le dragon',
        ['le chevalier', 'le narrateur'],
        'Le nom « DRAGON » le précède.',
      ),
      trou(
        'La dernière ligne est',
        'jouée sans être dite',
        ['criée par le chevalier', 'dite par le dragon'],
        'La ligne entre parenthèses est une didascalie.',
      ),
    ),
  ],
};

// ───────────────────────── 3. Poésie ─────────────────────────

const BANQUE_POESIE: Banque = {
  decouvrir: [
    qc(
      ['Le matin', 'Le soleil sur le chemin', 'Réveille tout le jardin.'],
      'Comment appelle-t-on chacune de ces deux lignes ?',
      'Un vers',
      'Dans un poème, chaque ligne est un vers.',
      ['Une strophe', 'La strophe regroupe plusieurs vers.'],
      ['Une réplique', 'La réplique appartient au théâtre.'],
    ),
    qc(
      ['La lune', 'Dans le ciel monte la lune,', 'Ronde et douce comme une prune.'],
      'Quels mots riment ?',
      '« lune » et « prune »',
      'Les deux vers finissent par le même son : « -une ».',
      ['« ciel » et « douce »', 'Ces mots ne finissent pas par le même son.'],
      ['« monte » et « ronde »', 'La rime se trouve à la fin des vers.'],
    ),
    qc(
      ['Deux groupes', 'Le vent chante', 'Dans la plaine.', '* * *', 'L’eau dormante', 'Se promène.'],
      'La ligne « * * * » marque un blanc. Il sépare deux…',
      'strophes',
      'Chaque groupe de vers forme une strophe.',
      ['rimes', 'La rime est un son, pas un groupe de lignes.'],
      ['didascalies', 'La didascalie appartient au théâtre.'],
    ),
    qc(
      ['La forme', 'Petit nuage blanc,', 'Où vas-tu en courant ?'],
      'Qu’est-ce qui montre que c’est un poème ?',
      'Il est écrit en vers qui riment',
      '« blanc » et « courant » riment à la fin des vers.',
      ['Il donne des chiffres', 'Aucun nombre dans ces lignes.'],
      ['Des noms précèdent les paroles', 'C’est la forme du théâtre.'],
    ),
    qc(
      ['Le son', 'Au bord de l’eau, un bateau', 'Attend le chant d’un oiseau.'],
      'Quel son revient à la fin des deux vers ?',
      '« o »',
      '« bateau » et « oiseau » finissent par le son « o ».',
      ['« an »', '« chant » est au milieu du vers.'],
      ['« a »', 'Écoute les derniers mots : « bateau », « oiseau ».'],
    ),
  ],
  reconnaitre: [
    qc(
      [
        'La pluie',
        'La pluie tombe sur le toit,',
        'Elle tapote sans un bruit,',
        'Je l’écoute près de toi,',
        'Blotti au fond de mon lit.',
      ],
      'Comment appelle-t-on une strophe de ces quatre vers ?',
      'Un quatrain',
      'Quatre vers forment un quatrain.',
      ['Une rime', 'La rime est un son qui revient.'],
      ['Une réplique', 'La réplique appartient au théâtre.'],
      ['Un acte', 'L’acte divise une pièce de théâtre.'],
    ),
    qc(
      ['La chasse aux rimes', 'Le renard sort le soir,', 'Il se glisse dans le …'],
      'Quel mot fait rimer les deux vers ?',
      'noir',
      '« soir » et « noir » finissent par le même son.',
      ['pré', '« pré » ne finit pas comme « soir ».'],
      ['buisson', '« buisson » finit par le son « on ».'],
      ['jardin', '« jardin » finit par le son « in ».'],
    ),
    qc(
      ['La fleur', 'J’ai cueilli une fleur', 'Que je porte sur mon …'],
      'Quel mot fait rimer les deux vers ?',
      'cœur',
      '« fleur » et « cœur » finissent par le même son.',
      ['sac', '« sac » ne finit pas comme « fleur ».'],
      ['chapeau', '« chapeau » finit par le son « o ».'],
      ['vélo', '« vélo » finit par le son « o ».'],
    ),
    qc(
      ['La strophe', 'Le feu danse', 'En cadence,', 'La nuit brune', 'Boit la lune.'],
      'Combien de vers compte cette strophe ?',
      'Quatre',
      'Il y a quatre lignes : quatre vers.',
      ['Deux', 'Deux est le nombre de sons qui riment.'],
      ['Un', 'Chaque ligne est un vers.'],
      ['Huit', 'Compte les lignes, pas les mots.'],
    ),
  ],
  paires: [
    ['une ligne d’un poème', 'un vers'],
    ['un groupe de vers', 'une strophe'],
    ['le même son à la fin de plusieurs vers', 'une rime'],
    ['une strophe de quatre vers', 'un quatrain'],
    ['un texte en vers', 'un poème'],
    ['l’art du langage en vers', 'la poésie'],
  ],
  ecrire: [
    sa(
      ['L’étoile', 'Une étoile dans la nuit', 'Brille au-dessus de la pluie.'],
      'Avec quel mot « nuit » rime-t-il ?',
      ['pluie', 'la pluie'],
      '« nuit » et « pluie » finissent par le même son.',
      ['étoile', '« étoile » ne finit pas comme « nuit ».'],
      ['brille', '« brille » est au début du second vers.'],
    ),
    sa(
      ['Le nom du groupe', 'Un poète saute une ligne', 'entre deux groupes de vers.'],
      'Comment s’appelle un groupe de vers ?',
      ['strophe', 'une strophe', 'la strophe'],
      'Les vers sont réunis en strophes.',
      ['paragraphe', 'Le paragraphe découpe un texte en prose.'],
      ['rime', 'La rime est un son, pas un groupe.'],
    ),
    sa(
      ['La ligne', 'Dans un poème, le poète choisit', 'où chaque ligne s’arrête.'],
      'Comment s’appelle une ligne d’un poème ?',
      ['vers', 'un vers', 'le vers'],
      'Chaque ligne d’un poème est un vers.',
      ['phrase', 'Une phrase peut courir sur plusieurs lignes d’un poème.'],
      ['strophe', 'La strophe contient plusieurs de ces lignes.'],
    ),
    sa(
      ['Le son commun', 'Le chat guette sur le mur', 'Il attend un fruit bien …'],
      'Écris le mot qui complète la rime : « mûr » ou « sucré » ?',
      ['mûr', 'mur'],
      '« mur » et « mûr » finissent par le même son.',
      ['sucré', '« sucré » finit par le son « é ».'],
      ['fruit', '« fruit » ne finit pas comme « mur ».'],
    ),
    sa(
      ['Le son répété', 'Les vers finissent par « matin » puis « jardin ».'],
      'Ce son répété à la fin des vers s’appelle une… (un mot)',
      ['rime', 'une rime', 'la rime'],
      'Le même son revient à la fin des deux vers.',
      ['strophe', 'La strophe est un groupe de vers.'],
      ['réplique', 'La réplique appartient au théâtre.'],
    ),
  ],
  suites: [],
  pieges: [
    sa(
      [
        'Rimes suivies',
        'Le vent siffle sur la mer (A)',
        'Il fait froid, c’est l’hiver (A)',
        'Un marin tient la barre (B)',
        'Il cherche son phare (B)',
      ],
      'Les vers riment deux par deux (AABB). Ces rimes sont-elles plates, croisées ou embrassées ?',
      ['plates', 'plate', 'rimes plates', 'des rimes plates', 'suivies'],
      'Deux vers qui se suivent riment ensemble : AABB.',
      ['croisées', 'Croisées, ce serait A B A B.'],
      ['embrassées', 'Embrassées, ce serait A B B A.'],
    ),
    sa(
      [
        'Rimes alternées',
        'La rivière court au matin (A)',
        'Sous le grand pont de pierre (B)',
        'Elle salue le vieux moulin (A)',
        'Et caresse le lierre (B)',
      ],
      'Le 1er vers rime avec le 3e, le 2e avec le 4e. Ces rimes sont-elles plates, croisées ou embrassées ?',
      ['croisées', 'croisée', 'rimes croisées', 'des rimes croisées', 'alternées'],
      '« matin » / « moulin », « pierre » / « lierre » : A B A B.',
      ['plates', 'Plates, les vers qui se suivent rimeraient : A A B B.'],
      ['embrassées', 'Embrassées, la rime A entourerait la rime B.'],
    ),
    sa(
      [
        'Rimes qui entourent',
        'Le hibou veille dans le soir (A)',
        'Il fixe la lune ronde (B)',
        'Qui doucement luit sur le monde (B)',
        'Et disparaît dans le noir (A)',
      ],
      'La rime A entoure la rime B (ABBA). Ces rimes sont-elles plates, croisées ou embrassées ?',
      ['embrassées', 'embrassée', 'rimes embrassées', 'des rimes embrassées'],
      '« soir » et « noir » entourent « ronde » et « monde ».',
      ['plates', 'Plates : A A B B. Ici, les deux « A » sont séparés.'],
      ['croisées', 'Croisées : A B A B. Ici, les deux « B » se suivent.'],
    ),
    sa(
      ['Compter', 'La mer monte,', 'Le sable fond,', '* * *', 'Un crabe compte', 'Les vagues du fond.'],
      'La ligne « * * * » marque un blanc. Combien de strophes lis-tu ? (en chiffres ou en lettres)',
      ['2', 'deux'],
      'Le blanc « * * * » sépare deux groupes de vers.',
      ['4', 'Quatre est le nombre de vers.'],
      ['quatre', 'Compte les groupes, pas les vers.'],
    ),
  ],
  cinq: [
    ['une ligne d’un poème', 'un vers'],
    ['un groupe de vers', 'une strophe'],
    ['le même son à la fin de plusieurs vers', 'une rime'],
    ['une strophe de quatre vers', 'un quatrain'],
    ['des rimes en A A B B', 'des rimes plates'],
    ['des rimes en A B A B', 'des rimes croisées'],
    ['des rimes en A B B A', 'des rimes embrassées'],
  ],
  longs: [
    long(
      'Le verger',
      [
        'Au verger, quand vient le soir,',
        'Les pommiers parlent tout bas,',
        'La chouette ouvre son œil noir,',
        'Le hérisson traîne ses pas.',
      ],
      trou('Chaque ligne est', 'un vers', ['une strophe', 'une réplique'], 'Une ligne d’un poème est un vers.'),
      trou('La strophe est', 'un quatrain', ['une rime', 'un acte'], 'Elle compte quatre vers.'),
      trou('« soir » rime avec', 'noir', ['bas', 'pas'], '« soir » et « noir » finissent pareil.'),
      trou('Les rimes sont', 'croisées', ['plates', 'embrassées'], 'Le 1er vers rime avec le 3e, le 2e avec le 4e.'),
    ),
    long(
      'La bougie',
      [
        'Petite flamme sur la table,',
        'Tu danses comme une fée aimable,',
        'Quand le vent frappe à la maison,',
        'Tu trembles et perds la raison.',
      ],
      trou('Ce texte est', 'un poème', ['une pièce de théâtre', 'un documentaire'], 'Il est écrit en vers qui riment.'),
      trou('Le nombre de vers est', 'quatre', ['deux', 'huit'], 'Quatre lignes.'),
      trou('« maison » rime avec', 'raison', ['table', 'aimable'], '« maison » et « raison » finissent pareil.'),
      trou('Les rimes sont', 'plates', ['croisées', 'embrassées'], 'Les vers qui se suivent riment deux par deux.'),
    ),
  ],
};

// ───────────────────────── 4. Fable et morale ─────────────────────────

const BANQUE_FABLE: Banque = {
  decouvrir: [
    qc(
      [
        'La fourmi et le merle',
        'Un merle riait d’une fourmi qui portait des graines.',
        'L’hiver venu, la fourmi eut de quoi manger.',
        'Qui prépare demain ne craint pas l’hiver.',
      ],
      'Quelle ligne donne la morale ?',
      'Qui prépare demain ne craint pas l’hiver.',
      'La dernière ligne tire la leçon de l’histoire.',
      ['Un merle riait d’une fourmi qui portait des graines.', 'Cette ligne raconte le début.'],
      ['L’hiver venu, la fourmi eut de quoi manger.', 'Cette ligne raconte la fin de l’histoire.'],
    ),
    qc(
      [
        'Le lion et la mésange',
        'Un lion se moquait d’une petite mésange.',
        'Un jour, elle le prévint du feu et le sauva.',
      ],
      'Quels sont les personnages ?',
      'Un lion et une mésange',
      'Ce sont eux qui agissent dans le récit.',
      ['Un roi et un paysan', 'Aucun être humain dans cette histoire.'],
      ['Le feu et le jour', 'Ils ne sont pas des personnages ici.'],
    ),
    qc(
      ['Le genre', 'Un court récit met en scène des animaux.', 'Il se termine par une leçon.'],
      'De quel genre s’agit-il ?',
      'Une fable',
      'Un court récit avec une leçon : c’est une fable.',
      ['Une recette', 'Une recette explique comment cuisiner.'],
      ['Un journal', 'Un journal donne les nouvelles.'],
    ),
    qc(
      ['Le mot', 'Une fable se termine souvent par une leçon.'],
      'Comment s’appelle cette leçon ?',
      'La morale',
      'La leçon qui se dégage d’une fable est sa morale.',
      ['La rime', 'La rime est un son répété.'],
      ['La didascalie', 'La didascalie appartient au théâtre.'],
    ),
    qc(
      ['L’auteur', 'Des fables célèbres portent le nom de Jean de La Fontaine.'],
      'Quel autre nom est aussi un auteur de fables ?',
      'Ésope',
      'Les fables d’Ésope sont célèbres.',
      ['La Tortue', 'La Tortue est un personnage.'],
      ['Le Lièvre', 'Le Lièvre est un personnage.'],
    ),
  ],
  reconnaitre: [
    qc(
      [
        'La grenouille vantarde',
        'Une grenouille se vantait de sauter plus haut que tous.',
        'Elle sauta devant ses amis et tomba dans la boue.',
      ],
      'Quelle morale va avec cette histoire ?',
      'Qui se vante trop finit par tomber.',
      'La grenouille « se vantait » puis « tomba ».',
      ['Il faut toujours dire merci.', 'Personne n’a rendu service dans ce récit.'],
      ['L’union fait la force.', 'La grenouille agit seule.'],
      ['La nuit porte conseil.', 'Rien ne se passe la nuit.'],
    ),
    qc(
      ['Les trois mulots', 'Un seul mulot ne pouvait pas pousser la pierre.', 'À trois, ils la firent rouler.'],
      'Quelle morale va avec cette histoire ?',
      'Ensemble, on est plus forts.',
      '« À trois, ils la firent rouler ».',
      ['Qui ment perd ses amis.', 'Personne ne ment.'],
      ['Il ne faut pas voler.', 'Aucun vol ici.'],
      ['Chacun doit rester seul.', 'L’histoire montre le contraire.'],
    ),
    qc(
      ['La pie menteuse', 'La pie criait « Au loup ! » pour rire.', 'Le jour où le loup vint, personne ne la crut.'],
      'Quelle morale va avec cette histoire ?',
      'On ne croit plus celui qui a menti.',
      '« personne ne la crut » après ses mensonges.',
      ['Mieux vaut courir très vite.', 'Personne ne fait la course.'],
      ['Un travail bien fait récompense.', 'La pie n’a fait aucun travail.'],
      ['Les petits sont toujours les plus forts.', 'L’histoire ne compare pas les tailles.'],
    ),
    qc(
      ['La place', 'Rien ne sert de courir, il faut partir à point.', 'Un lièvre et une tortue faisaient la course…'],
      'Où est placée la morale ?',
      'Avant le récit',
      'La leçon ouvre le texte, puis l’histoire commence.',
      ['Après le récit', 'La leçon est ici la première phrase.'],
      ['Au milieu du récit', 'Le récit n’a pas encore commencé quand on la lit.'],
      ['Il n’y en a pas', '« Il faut partir à point » est une leçon.'],
    ),
  ],
  paires: [
    ['Un renard complimente le corbeau, qui lâche son fromage.', 'Méfie-toi des flatteurs.'],
    ['La fourmi range des graines avant l’hiver.', 'Prépare-toi à l’avance.'],
    ['Deux ânes tirent ensemble la charrette.', 'À deux, on porte plus lourd.'],
    ['Le chat prétend savoir nager et boit la tasse.', 'Ne te vante pas.'],
    ['La souris libère le lion pris dans un filet.', 'Un petit peut aider un grand.'],
    ['Le coq garde tout le grain et mange seul.', 'Partager vaut mieux que tout garder.'],
  ],
  ecrire: [
    sa(
      ['Le mot clé', 'À la fin d’une fable, on lit souvent une leçon sur la conduite à tenir.'],
      'Comment appelle-t-on cette leçon ?',
      ['morale', 'la morale', 'une morale', 'moralité', 'la moralité'],
      'La leçon qui se dégage d’une fable est sa morale ou moralité.',
      ['rime', 'La rime est un son répété.'],
      ['dénouement', 'Le dénouement termine l’action ; la leçon est autre chose.'],
    ),
    sa(
      [
        'La course célèbre',
        '« Rien ne sert de courir, il faut partir à point. »',
        'C’est la morale de « Le Lièvre et la … ».',
      ],
      'Écris le mot manquant.',
      ['tortue', 'la tortue'],
      'Cette morale vient de « Le Lièvre et la Tortue ».',
      ['cigale', 'La Cigale apparaît dans une autre fable.'],
      ['grenouille', 'La Grenouille apparaît dans une autre fable.'],
    ),
    sa(
      ['Le genre', 'Un court récit avec des animaux qui parlent donne une leçon.'],
      'Quel est le nom de ce genre ?',
      ['fable', 'une fable', 'la fable'],
      'Un court récit qui exprime une vérité : c’est une fable.',
      ['poème', 'Un poème est un texte en vers ; la leçon est ici le signe d’un autre genre.'],
      ['pièce de théâtre', 'Le théâtre fait parler des personnages sur scène.'],
    ),
    sa(
      ['Le renard', '« En toute chose il faut considérer la fin. »', 'C’est la morale de « Le Renard et le … ».'],
      'Écris le mot manquant.',
      ['bouc', 'le bouc'],
      'Cette morale vient de « Le Renard et le Bouc ».',
      ['corbeau', 'Le Corbeau apparaît dans une autre fable.'],
      ['lion', 'Le Lion apparaît dans d’autres fables.'],
    ),
    sa(
      [
        'Le héros de l’histoire',
        'Un hérisson patient attend la pluie.',
        'Il boit, tandis que le geai impatient part et se perd.',
        'Patience vaut mieux que hâte.',
      ],
      'Quel animal donne l’exemple à suivre ?',
      ['hérisson', 'le hérisson', 'un hérisson'],
      'La morale vante la patience, qualité du hérisson.',
      ['geai', 'Le geai est impatient : la morale le critique.'],
      ['pluie', 'La pluie n’est pas un animal.'],
    ),
  ],
  suites: [
    suite(
      'La corneille et la cruche',
      [
        'Une corneille a soif et trouve une cruche presque vide.',
        'Son bec ne peut pas atteindre l’eau.',
        'Alors, elle jette des cailloux dans la cruche.',
        'L’eau monte et la corneille boit enfin.',
      ],
      'La soif, le problème, l’idée, puis la réussite.',
    ),
    suite(
      'La fourmi et la colombe',
      [
        'Une fourmi tombe dans le ruisseau.',
        'Une colombe lui jette une brindille pour la sauver.',
        'Plus tard, un chasseur vise la colombe.',
        'La fourmi le pique au pied et la colombe s’envole.',
      ],
      'Le sauvetage d’abord, puis, « plus tard », la fourmi rend le service.',
    ),
  ],
  pieges: [
    sa(
      [
        'La double leçon',
        'Un écureuil entasse des noisettes et ne les partage jamais.',
        'Une nuit, la neige cache sa réserve.',
        'Ses voisins, qu’il avait ignorés, ne viennent pas l’aider.',
      ],
      'Complète la morale avec « aide », « neige » ou « noisettes » : « Qui ne partage rien ne reçoit pas d’… »',
      ['aide', 'l’aide', 'd’aide'],
      'Les voisins « ne viennent pas l’aider ».',
      ['noisettes', 'L’écureuil avait déjà des noisettes. La leçon parle de ce qu’on lui refuse.'],
      ['neige', 'La neige tombe pour tous : ce n’est pas la conséquence de son égoïsme.'],
    ),
    sa(
      ['Animal ou humain ?', 'Dans une fable, un loup parle, raisonne et ruse.'],
      'Les animaux des fables se comportent comme des… (un mot)',
      ['humains', 'des humains', 'hommes', 'des hommes', 'personnes', 'des personnes', 'gens', 'des gens'],
      'Ils parlent et raisonnent : par la fiction, la fable parle de nous.',
      ['plantes', 'Une plante ne parle pas ni ne ruse.'],
      ['pierres', 'Une pierre ne raisonne pas.'],
    ),
    sa(
      [
        'Où est la leçon ?',
        'Un moineau refuse d’écouter les anciens.',
        'Il vole sous l’orage et revient trempé.',
        'Écoute le conseil de ceux qui savent.',
      ],
      'Écris le premier mot de la ligne qui donne la morale.',
      ['Écoute'],
      'La dernière ligne est la leçon : « Écoute le conseil… ».',
      ['Un', 'La première ligne raconte, elle ne donne pas de leçon.'],
      ['Il', 'La deuxième ligne raconte ce qui arrive.'],
    ),
    sa(
      [
        'Le début',
        'Mieux vaut prévenir que regretter.',
        'Un castor, un jour, vit monter la rivière près de son barrage.',
      ],
      'La morale est-elle placée avant ou après le récit ?',
      ['avant', 'avant le récit'],
      'La leçon est la première phrase, puis l’histoire commence.',
      ['après', 'Relis l’ordre : l’histoire vient ensuite.'],
      ['au milieu', 'La leçon précède tout le récit.'],
    ),
  ],
  cinq: [
    ['Un renard complimente le corbeau, qui lâche son fromage.', 'Méfie-toi des flatteurs.'],
    ['La fourmi range des graines avant l’hiver.', 'Prépare-toi à l’avance.'],
    ['Deux ânes tirent ensemble la charrette.', 'À deux, on porte plus lourd.'],
    ['Le chat prétend savoir nager et boit la tasse.', 'Ne te vante pas.'],
    ['La souris libère le lion pris dans un filet.', 'Un petit peut aider un grand.'],
    ['Le coq garde tout le grain et mange seul.', 'Partager vaut mieux que tout garder.'],
    ['Le geai crie « au feu » pour rire et plus personne ne le croit.', 'Le mensonge fait perdre la confiance.'],
  ],
  longs: [
    long(
      'La chèvre et la montagne',
      [
        'Une jeune chèvre voulait grimper plus haut que toutes.',
        'Sa mère lui dit de regarder où elle posait les pattes.',
        'La chèvre rit et sauta sans regarder.',
        'Elle glissa dans un trou et dut attendre le berger.',
        'Qui n’écoute pas les conseils apprend à ses dépens.',
      ],
      trou('Le genre est', 'une fable', ['un documentaire', 'une recette'], 'Un court récit qui donne une leçon.'),
      trou(
        'La morale est dans',
        'la dernière ligne',
        ['la première ligne', 'la deuxième ligne'],
        'Elle tire la leçon.',
      ),
      trou(
        'La chèvre a eu tort de',
        'ne pas écouter sa mère',
        ['attendre le berger', 'vouloir manger'],
        '« La chèvre rit et sauta sans regarder ».',
      ),
      trou(
        'La leçon conseille',
        'd’écouter les conseils',
        ['de grimper vite', 'de rire souvent'],
        '« Qui n’écoute pas les conseils… ».',
      ),
    ),
    long(
      'Le héron difficile',
      [
        'Un héron trouvait les petits poissons trop maigres.',
        'Il attendit un gros brochet toute la matinée.',
        'Le soir, la rivière était vide.',
        'Il dut se contenter d’un têtard.',
        'Qui veut trop choisir risque de tout perdre.',
      ],
      trou('Le personnage principal est', 'le héron', ['le brochet', 'le têtard'], 'L’histoire suit le héron.'),
      trou(
        'Il refuse d’abord',
        'les petits poissons',
        ['les brochets', 'la rivière'],
        'Il les trouve « trop maigres ».',
      ),
      trou('À la fin, il mange', 'un têtard', ['un brochet', 'rien du tout'], '« Il dut se contenter d’un têtard ».'),
      trou(
        'La morale conseille de',
        'ne pas être trop difficile',
        ['manger le matin', 'pêcher la nuit'],
        '« Qui veut trop choisir risque de tout perdre ».',
      ),
    ),
  ],
};

// ───────────────────────── 5. Conte merveilleux ─────────────────────────

const BANQUE_CONTE: Banque = {
  decouvrir: [
    qc(
      ['Le début', 'Il était une fois une princesse qui vivait près d’un étang.'],
      'Quelle formule ouvre ce conte ?',
      'Il était une fois',
      'Beaucoup de contes anciens commencent ainsi.',
      ['Cher journal', 'Cette formule ouvre un journal intime.'],
      ['Mode d’emploi', 'Cette formule annonce une notice.'],
    ),
    qc(
      ['La fée', 'La fée toucha la citrouille de sa baguette.', 'Elle devint un carrosse.'],
      'Qu’est-ce qui est merveilleux ici ?',
      'La citrouille devient un carrosse',
      'Une chose change de forme par magie.',
      ['La citrouille est un légume', 'C’est vrai dans la réalité : rien de magique.'],
      ['Un carrosse a des roues', 'C’est normal pour un carrosse.'],
    ),
    qc(
      ['Qui est magique ?', 'Au village vivaient un boulanger, une fée et un facteur.'],
      'Quel personnage a des pouvoirs magiques ?',
      'La fée',
      'La fée est un être imaginaire aux pouvoirs magiques.',
      ['Le boulanger', 'Un boulanger fait du pain : métier réel.'],
      ['Le facteur', 'Un facteur porte le courrier : métier réel.'],
    ),
    qc(
      ['Le géant', 'Un géant affamé flairait les enfants cachés dans sa maison.'],
      'Comment appelle-t-on ce personnage de conte ?',
      'Un ogre',
      'L’ogre est un géant des contes qui dévore les enfants.',
      ['Un nain', 'Un nain est petit, pas géant.'],
      ['Un lutin', 'Un lutin est un petit être.'],
    ),
    qc(
      ['Le genre', 'Un tapis vole, un loup parle, une fée surgit.'],
      'Dans quel genre trouve-t-on souvent tout cela ?',
      'Le conte merveilleux',
      'Le merveilleux fait intervenir des êtres ou des choses surnaturels.',
      ['Le documentaire', 'Un documentaire parle du réel.'],
      ['La recette', 'Une recette explique comment cuisiner.'],
    ),
  ],
  reconnaitre: [
    qc(
      ['La grenouille', 'Le prince, changé en grenouille, attendait au bord du puits.'],
      'Comment s’appelle ce changement de forme magique ?',
      'Une métamorphose',
      '« changé en grenouille » : sa forme change par magie.',
      ['Une rime', 'La rime est un son en fin de vers.'],
      ['Un aparté', 'L’aparté appartient au théâtre.'],
      ['Un dénouement', 'Le dénouement termine l’histoire.'],
    ),
    qc(
      ['Les objets', 'Sam reçut des bottes qui couraient sept fois plus vite que le vent.'],
      'Quel objet est magique ?',
      'Les bottes',
      'Elles courent bien plus vite qu’aucun objet réel.',
      ['Le vent', 'Le vent est un phénomène réel.'],
      ['Sam', 'Sam est un personnage, pas un objet.'],
      ['La maison', 'Aucune maison n’est citée.'],
    ),
    qc(
      ['Réel ou merveilleux', 'Plusieurs phrases d’une histoire sont proposées.'],
      'Laquelle est merveilleuse ?',
      'Le miroir répondit à la reine.',
      'Un miroir qui parle n’existe pas dans la réalité.',
      ['La reine se regarda dans le miroir.', 'C’est possible dans la réalité.'],
      ['La reine posa le miroir sur la table.', 'C’est une action ordinaire.'],
      ['Le miroir tomba et se cassa.', 'Un miroir peut vraiment se casser.'],
    ),
    qc(
      ['La fin', 'La méchante sorcière s’enfuit, le sort se brise.', 'Les enfants rentrent chez eux, heureux.'],
      'Quelle partie du conte est-ce ?',
      'Le dénouement',
      'Le problème se règle : l’histoire se termine.',
      ['Le début', 'Au début, le problème n’existe pas encore.'],
      ['Le titre', 'Un titre annonce l’histoire.'],
      ['Une didascalie', 'La didascalie appartient au théâtre.'],
    ),
  ],
  paires: [
    ['un être féminin aux pouvoirs magiques', 'la fée'],
    ['un géant qui dévore les enfants', 'l’ogre'],
    ['un changement de forme par magie', 'la métamorphose'],
    ['l’intervention de choses surnaturelles', 'le merveilleux'],
    ['la formule « Il était une fois »', 'le début du conte'],
    ['un court récit d’aventures imaginaires', 'le conte'],
  ],
  ecrire: [
    sa(
      ['Il manque un mot', '« Il était une … , un roi qui avait trois filles. »'],
      'Complète la formule du début.',
      ['fois'],
      'La formule est « Il était une fois ».',
      ['nuit', 'La formule parle d’une « fois ».'],
      ['histoire', 'Relis la formule célèbre des contes.'],
    ),
    sa(
      ['La baguette', 'Une dame lève sa baguette : la souris devient cheval.'],
      'Quel personnage de conte agit souvent ainsi ? (un mot)',
      ['fée', 'une fée', 'la fée'],
      'La fée a des pouvoirs magiques, souvent avec une baguette.',
      ['ogre', 'L’ogre dévore les enfants : il ne manie pas la baguette ici.'],
      ['reine', 'Une reine règne : le texte parle d’un pouvoir magique.'],
    ),
    sa(
      ['La transformation', 'La citrouille se change en carrosse.'],
      'Comment s’appelle ce changement magique ? (un mot)',
      ['métamorphose', 'une métamorphose', 'la métamorphose', 'transformation', 'une transformation'],
      'La chose change de forme par une cause surnaturelle.',
      ['dénouement', 'Le dénouement est la fin de l’histoire.'],
      ['morale', 'La morale est une leçon.'],
    ),
    sa(
      ['Les recueils', 'En 1697 paraissent les « Contes de ma mère l’Oye ».'],
      'Quel auteur les a écrits ?',
      ['Perrault', 'Charles Perrault'],
      'Les « Contes de ma mère l’Oye » (1697) sont de Perrault.',
      ['La Fontaine', 'La Fontaine est connu pour ses fables.'],
      ['Molière', 'Molière est connu pour ses comédies.'],
    ),
    sa(
      ['Le genre', 'Un récit court, des fées, un sortilège, une fin heureuse.'],
      'Écris le nom du genre : un … merveilleux.',
      ['conte', 'un conte'],
      'Un court récit d’aventures imaginaires : un conte.',
      ['poème', 'Un poème se reconnaît à ses vers.'],
      ['documentaire', 'Un documentaire parle du réel.'],
    ),
  ],
  suites: [
    suite(
      'Le sort de la tour',
      [
        'Il était une fois une princesse dans un royaume paisible.',
        'Un jour, une sorcière l’enferme dans une tour.',
        'Alors, un oiseau magique lui apporte une clé.',
        'Enfin, la princesse rentre chez elle, libre.',
      ],
      '« Il était une fois », « Un jour », « Alors », « Enfin ».',
    ),
    suite(
      'La graine d’or',
      [
        'Il était une fois un jardinier très pauvre.',
        'Un matin, une fée lui offre une graine dorée.',
        'Il la plante, et un arbre d’or pousse aussitôt.',
        'Depuis ce jour, le village ne manque plus de rien.',
      ],
      'La graine arrive, il la plante, puis « Depuis ce jour » conclut.',
    ),
  ],
  pieges: [
    sa(
      [
        'Un seul est magique',
        'Un renard court dans la neige.',
        'Il croise une louve, puis une poule qui pond des perles.',
      ],
      'Quel animal rend l’histoire merveilleuse ?',
      ['poule', 'la poule', 'une poule'],
      'Une poule qui pond des perles : c’est surnaturel.',
      ['renard', 'Un renard qui court, c’est réel.'],
      ['louve', 'Croiser une louve est possible.'],
    ),
    sa(
      ['L’intrus', 'Fée, ogre, dragon, boulangère.'],
      'Quel mot ne désigne pas un être surnaturel ?',
      ['boulangère', 'la boulangère', 'une boulangère'],
      'La boulangère exerce un métier réel.',
      ['dragon', 'Un dragon n’existe pas dans la réalité.'],
      ['ogre', 'L’ogre est un géant de conte.'],
    ),
    sa(
      ['Le sort', 'Depuis le sortilège, le roi est devenu un chêne.', 'Seule une larme pourra lui rendre sa forme.'],
      'Comment appelle-t-on ce que subit le roi ? (un mot)',
      ['métamorphose', 'une métamorphose', 'la métamorphose', 'transformation', 'une transformation'],
      'Le roi change de forme par une cause surnaturelle.',
      ['rime', 'La rime concerne les sons des vers.'],
      ['morale', 'La morale est une leçon.'],
    ),
    sa(
      ['Le merveilleux', 'Dans un conte, des fées, des sorts et des animaux parlants surgissent.'],
      'Tous ces éléments surnaturels forment le… (un mot)',
      ['merveilleux', 'le merveilleux'],
      'Des êtres ou des éléments surnaturels : c’est le merveilleux.',
      ['dénouement', 'Le dénouement termine l’histoire.'],
      ['réel', 'Des fées et des sorts n’appartiennent pas au réel.'],
    ),
  ],
  cinq: [
    ['un être féminin aux pouvoirs magiques', 'la fée'],
    ['un géant qui dévore les enfants', 'l’ogre'],
    ['un changement de forme par magie', 'la métamorphose'],
    ['l’intervention de choses surnaturelles', 'le merveilleux'],
    ['la formule « Il était une fois »', 'le début du conte'],
    ['ce qui termine l’histoire', 'le dénouement'],
    ['le personnage principal', 'le héros'],
  ],
  longs: [
    long(
      'La clé de cristal',
      [
        'Il était une fois une fille de bûcheron nommée Aube.',
        'Un soir, un ogre emporta son petit frère.',
        'Une vieille fée lui donna une clé de cristal.',
        'La clé ouvrit la cage, et l’ogre se changea en rocher.',
        'Aube et son frère rentrèrent enfin chez eux.',
      ],
      trou('L’héroïne est', 'Aube', ['la fée', 'l’ogre'], 'L’histoire suit « Aube ».'),
      trou('L’objet magique est', 'la clé de cristal', ['la cage', 'le rocher'], '« La clé ouvrit la cage ».'),
      trou('La métamorphose touche', 'l’ogre', ['la fée', 'le frère'], '« l’ogre se changea en rocher ».'),
      trou(
        'Le dénouement est',
        'le retour à la maison',
        ['l’enlèvement du frère', 'le don de la clé'],
        '« rentrèrent enfin chez eux ».',
      ),
    ),
    long(
      'Le puits qui parle',
      [
        'Il était une fois un berger nommé Silvère.',
        'Un jour, son puits se mit à parler.',
        'Il lui demanda de retrouver une étoile tombée.',
        'Silvère traversa la forêt et rapporta l’étoile.',
        'Depuis, l’eau du puits brille chaque nuit.',
      ],
      trou(
        'Le conte commence par',
        'Il était une fois',
        ['Cher journal', 'Scène première'],
        'C’est la première ligne.',
      ),
      trou(
        'Le premier fait merveilleux est',
        'le puits qui parle',
        ['le berger qui marche', 'la forêt traversée'],
        'Un puits ne parle pas dans la réalité.',
      ),
      trou('Le héros est', 'Silvère', ['le puits', 'l’étoile'], 'C’est lui qui agit et réussit.'),
      trou(
        'À la fin,',
        'l’eau du puits brille',
        ['le puits disparaît', 'Silvère se perd'],
        '« Depuis, l’eau du puits brille ».',
      ),
    ),
  ],
};

export const BANQUES = {
  recit: BANQUE_RECIT,
  theatre: BANQUE_THEATRE,
  poesie: BANQUE_POESIE,
  fable: BANQUE_FABLE,
  conte: BANQUE_CONTE,
} as const;
