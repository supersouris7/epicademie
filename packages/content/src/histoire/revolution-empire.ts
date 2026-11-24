import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * CM1, thème 3 « Le temps de la Révolution et de l’Empire » (lot hi-cm1-03). Chaque fait cite le programme du
 * cycle 3 (registre `cycle3-2020`) avec sa citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

const Q_THEME = 'De l’année 1789 à l’exécution du roi : Louis XVI, la Révolution, la Nation';
const Q_RUPTURE =
  'La Révolution française marque une rupture fondamentale dans l’ordre monarchique établi et on présente bien Louis XVI comme le dernier roi de l’Ancien Régime';
const Q_ETAPES =
  'quelques étapes clés (année 1789, abolition de la royauté, proclamation de la première République et exécution du roi)';
const Q_ORIGINES =
  'quelques grandes explications des origines économiques, sociales, intellectuelles et politiques de la Révolution';
const Q_NAPOLEON = 'Napoléon Bonaparte, du général à l’Empereur, de la Révolution à l’Empire';
const Q_POUVOIR =
  'Napoléon Bonaparte, général dans les armées républicaines, prend le pouvoir par la force et est proclamé empereur des Français en 1804';
const Q_ACQUIS = 'il conserve certains des acquis révolutionnaires';

// ——— Notion 1 : 1789 à l'exécution du roi ———

const etapes: Notion = {
  id: 'hcm1-1789-execution',
  title: '1789 à l’exécution du roi',
  hint: 'Relis le mémo : cherche l’année du début et les trois étapes qui suivent.',
  memo: [
    'La **Révolution** française commence avec l’année 1789. Le pays change de façon très profonde !',
    'Le programme retient des étapes clés : l’abolition de la **royauté**, la proclamation de la première **République**, puis l’exécution du roi.',
    'Le roi dont on parle est Louis XVI. Il n’y a plus de roi : la République prend sa place.',
  ],
  faits: [
    {
      q: 'Quelle année marque le début de la Révolution française ?',
      a: '1789',
      wrong: [
        { label: '1804', why: '1804 est l’année où Napoléon est proclamé empereur des Français.' },
        { label: '1492', why: 'Cette date n’est pas au programme du CM1 : l’année clé de la Révolution est 1789.' },
        { label: '1715', why: 'Cette date n’est pas au programme du CM1 : l’année clé de la Révolution est 1789.' },
      ],
      gap: ['La Révolution commence avec l’année ', '.', ['1789']],
      quote: Q_THEME,
      explain: 'Le programme part de l’année 1789.',
    },
    {
      q: 'Quel roi est exécuté pendant la Révolution ?',
      a: 'Louis XVI',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil, qui règne à Versailles bien avant la Révolution.' },
        { label: 'Henri IV', why: 'Henri IV est lié à l’édit de Nantes, bien avant la Révolution.' },
        { label: 'Louis IX', why: 'Louis IX est le « roi chrétien » du XIIIe siècle.' },
      ],
      gap: ['Le roi exécuté est ', '.', ['Louis XVI', 'Louis 16', 'Louis seize']],
      quote: Q_THEME,
      explain: 'La période va de 1789 à l’exécution du roi Louis XVI.',
    },
    {
      q: 'Quelle étape clé met fin à la monarchie pendant la Révolution ?',
      a: 'l’abolition de la royauté',
      wrong: [
        {
          label: 'le couronnement d’un empereur',
          why: 'Le couronnement d’un empereur vient plus tard, avec Napoléon.',
        },
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes est lié à Henri IV, bien avant la Révolution.' },
        { label: 'la construction de Versailles', why: 'Versailles est le château de Louis XIV, bien avant.' },
      ],
      gap: ['Parmi les étapes clés : l’abolition de la ', '.', ['royauté', 'royaute']],
      quote: Q_ETAPES,
      explain: 'L’abolition de la royauté est une étape clé : il n’y a plus de roi.',
    },
    {
      q: 'Quel régime est proclamé après l’abolition de la royauté ?',
      a: 'la première République',
      wrong: [
        { label: 'l’Empire', why: 'L’Empire est proclamé en 1804, après la Révolution.' },
        { label: 'la monarchie', why: 'La monarchie est le régime du roi : elle vient d’être abolie.' },
        { label: 'l’empire romain', why: 'L’empire romain est bien plus ancien : il appartient à l’Antiquité.' },
      ],
      gap: ['On proclame la première ', '.', ['République', 'république', 'republique']],
      quote: Q_ETAPES,
      explain: 'La proclamation de la première République est une étape clé.',
    },
  ],
  paires3: [
    ['1789', 'Année du début de la Révolution'],
    ['Louis XVI', 'Roi exécuté pendant la Révolution'],
    ['Abolition de la royauté', 'Fin du pouvoir du roi'],
  ],
  paires5: [
    ['1789', 'Année du début de la Révolution'],
    ['Louis XVI', 'Roi exécuté pendant la Révolution'],
    ['Abolition de la royauté', 'Fin du pouvoir du roi'],
    ['Première République', 'Régime proclamé après la royauté'],
    ['Étape clé', 'Moment important du changement'],
  ],
  ordre: ['Année 1789', 'Abolition de la royauté', 'Proclamation de la première République', 'Exécution du roi'],
  libres: [
    {
      q: 'La Révolution commence avec l’année … (quatre chiffres).',
      accepted: ['1789'],
      traps: [
        { text: '1804', why: '1804 est l’année où Napoléon devient empereur des Français.' },
        { text: '1792', why: 'Cette date n’est pas celle que retient le programme : c’est l’année 1789.' },
      ],
      quote: Q_THEME,
      explain: 'Le programme part de l’année 1789.',
    },
    {
      q: 'Quel est le nom du roi exécuté ? (nom et numéro, par exemple Louis XIV).',
      accepted: ['Louis XVI', 'Louis 16', 'Louis seize'],
      traps: [
        { text: 'Louis XIV', why: 'Louis XIV est le roi Soleil, mort bien avant la Révolution.' },
        { text: 'Napoléon', why: 'Napoléon n’est pas un roi : il devient empereur après la Révolution.' },
      ],
      quote: Q_THEME,
      explain: 'Le roi dont parle le programme est Louis XVI.',
    },
    {
      q: 'Après l’abolition de la royauté, on proclame la première … (un mot).',
      accepted: ['République', 'république', 'republique'],
      traps: [
        { text: 'monarchie', why: 'La monarchie est le régime du roi : elle est abolie.' },
        { text: 'empire', why: 'L’Empire arrive plus tard, avec Napoléon.' },
      ],
      quote: Q_ETAPES,
      explain: 'La proclamation de la première République est une étape clé.',
    },
  ],
  docs: [
    {
      title: 'Une frise de classe',
      lines: [
        'Sur la frise, la maîtresse a écrit : « Année 1789 ».',
        'Plus loin, elle a ajouté : « Abolition de la royauté », puis « Proclamation de la première République ».',
        'La dernière étape est l’exécution du roi.',
      ],
      qs: [
        {
          q: 'Quelle étape de la frise vient en dernier ?',
          a: 'l’exécution du roi',
          wrong: [
            { label: 'l’année 1789', why: 'L’année 1789 ouvre la frise : c’est le début.' },
            {
              label: 'la proclamation de la première République',
              why: 'Elle vient avant la dernière étape, d’après le texte.',
            },
          ],
          quote: Q_ETAPES,
          explain: 'Le texte dit que la dernière étape est l’exécution du roi.',
        },
      ],
    },
    {
      title: 'Plus de roi',
      lines: [
        'Un élève lit son livre : « La royauté est abolie. »',
        'Il en conclut qu’il n’y a plus de roi en France.',
        'On proclame alors un nouveau régime : la première République.',
      ],
      qs: [
        {
          q: 'Quel nouveau régime le texte annonce-t-il ?',
          a: 'la première République',
          wrong: [
            { label: 'la royauté', why: 'La royauté vient d’être abolie, dit le texte.' },
            { label: 'l’Empire', why: 'L’Empire vient en 1804, bien plus tard.' },
          ],
          quote: Q_ETAPES,
          explain: 'Après l’abolition de la royauté, on proclame la première République.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la Nation ———

const nation: Notion = {
  id: 'hcm1-nation',
  title: 'La Nation et la Révolution',
  hint: 'Relis le mémo : cherche l’ancien monde, la rupture et les origines du changement.',
  memo: [
    'Avant la Révolution, le roi gouverne : c’est l’**Ancien Régime**. Louis XVI en est le dernier roi.',
    'La Révolution est une **rupture** fondamentale : elle casse l’ordre monarchique établi. Au centre du programme, il y a la **Nation**, le peuple d’un pays.',
    'Pourquoi tout change ? Le programme donne des origines économiques, sociales, intellectuelles et politiques.',
  ],
  faits: [
    {
      q: 'Louis XVI est présenté comme le dernier roi de quoi ?',
      a: 'de l’Ancien Régime',
      wrong: [
        { label: 'de l’Empire', why: 'L’Empire est celui de Napoléon : ce n’est pas un roi qui le dirige.' },
        { label: 'de la République', why: 'La République n’a pas de roi : elle remplace la royauté.' },
        { label: 'de la préhistoire', why: 'La préhistoire est bien avant l’écriture : aucun roi de France.' },
      ],
      gap: ['Louis XVI est le dernier roi de l’', ' Régime.', ['Ancien']],
      quote: Q_RUPTURE,
      explain: 'On présente Louis XVI comme le dernier roi de l’Ancien Régime.',
    },
    {
      q: 'Que marque la Révolution française dans l’ordre monarchique établi ?',
      a: 'une rupture fondamentale',
      wrong: [
        { label: 'une simple continuité', why: 'Le programme parle d’une rupture : l’ordre ancien est cassé.' },
        { label: 'un petit ajustement', why: 'Le programme dit « rupture fondamentale », pas un petit changement.' },
        { label: 'un retour à l’Antiquité', why: 'Ce n’est pas ce que dit le programme : il parle de rupture.' },
      ],
      gap: ['La Révolution marque une ', ' fondamentale.', ['rupture']],
      quote: Q_RUPTURE,
      explain: 'La Révolution marque une rupture fondamentale dans l’ordre monarchique.',
    },
    {
      q: 'Quel mot, avec Louis XVI et la Révolution, complète le titre du thème de 1789 à l’exécution du roi ?',
      a: 'la Nation',
      wrong: [
        { label: 'l’Empereur', why: 'L’Empereur est le sujet du deuxième point, avec Napoléon Bonaparte.' },
        { label: 'les croisades', why: 'Les croisades sont citées pour le temps des rois, pas pour la Révolution.' },
        { label: 'le roi Soleil', why: 'Le roi Soleil est Louis XIV, au temps des rois.' },
      ],
      gap: [
        'Le peuple d’un pays, au centre du programme, s’appelle la ',
        '.',
        ['Nation', 'nation', 'la Nation', 'la nation'],
      ],
      quote: Q_THEME,
      explain: 'Le programme cite Louis XVI, la Révolution et la Nation.',
    },
    {
      q: 'Parmi ces mots, lequel est une origine de la Révolution citée par le programme ?',
      a: 'des origines économiques',
      wrong: [
        {
          label: 'des origines volcaniques',
          why: 'Ce mot n’est pas dans le programme : il parle d’origines économiques, sociales…',
        },
        {
          label: 'des origines musicales',
          why: 'Ce mot n’est pas dans le programme : il parle d’origines économiques, sociales…',
        },
        {
          label: 'des origines sportives',
          why: 'Ce mot n’est pas dans le programme : il parle d’origines économiques, sociales…',
        },
      ],
      gap: ['Les origines sont économiques, ', ', intellectuelles et politiques.', ['sociales', 'sociale']],
      quote: Q_ORIGINES,
      explain: 'Les origines sont économiques, sociales, intellectuelles et politiques.',
    },
  ],
  paires3: [
    ['Ancien Régime', 'Temps où le roi gouverne'],
    ['Rupture', 'Grand changement qui casse l’ordre ancien'],
    ['Louis XVI', 'Dernier roi de l’Ancien Régime'],
  ],
  paires5: [
    ['Ancien Régime', 'Temps où le roi gouverne'],
    ['Rupture', 'Grand changement qui casse l’ordre ancien'],
    ['Louis XVI', 'Dernier roi de l’Ancien Régime'],
    ['Nation', 'Le peuple d’un pays'],
    ['Origines', 'Causes qui expliquent le début d’un événement'],
  ],
  libres: [
    {
      q: 'Louis XVI est le dernier roi de l’… Régime (un mot).',
      accepted: ['Ancien', 'ancien', 'l’Ancien', 'Ancien Régime', 'ancien régime'],
      traps: [
        { text: 'Nouveau', why: 'Le nouveau régime est la République, qui vient après le roi.' },
        { text: 'Moderne', why: 'Ce n’est pas le nom du régime des rois : on dit l’Ancien Régime.' },
      ],
      quote: Q_RUPTURE,
      explain: 'Louis XVI est le dernier roi de l’Ancien Régime.',
    },
    {
      q: 'La Révolution est une … fondamentale dans l’ordre monarchique (un mot).',
      accepted: ['rupture', 'une rupture'],
      traps: [
        { text: 'continuité', why: 'La continuité, c’est quand rien ne casse. Ici, l’ordre ancien est cassé.' },
        { text: 'fête', why: 'Le programme ne parle pas de fête : il parle de rupture.' },
      ],
      quote: Q_RUPTURE,
      explain: 'Le programme parle d’une rupture fondamentale.',
    },
    {
      q: 'Les origines de la Révolution sont économiques, …, intellectuelles et politiques (un mot).',
      accepted: ['sociales', 'sociale'],
      traps: [
        { text: 'sportives', why: 'Le programme ne cite pas d’origines sportives.' },
        { text: 'musicales', why: 'Le programme ne cite pas d’origines musicales.' },
      ],
      quote: Q_ORIGINES,
      explain: 'Les origines sont économiques, sociales, intellectuelles et politiques.',
    },
  ],
  docs: [
    {
      title: 'Un livre d’histoire',
      lines: [
        'Un livre explique : « Louis XVI est le dernier roi de l’Ancien Régime. »',
        'Il ajoute que la Révolution casse l’ordre monarchique établi.',
      ],
      qs: [
        {
          q: 'Comment le livre décrit-il le changement ?',
          a: 'une rupture',
          wrong: [
            { label: 'une continuité', why: 'Le texte dit que l’ordre monarchique est cassé : c’est le contraire.' },
            { label: 'une fête', why: 'Le texte ne parle pas de fête, mais d’un ordre qui est cassé.' },
          ],
          quote: Q_RUPTURE,
          explain: 'Casser l’ordre établi, c’est une rupture.',
        },
      ],
    },
    {
      title: 'Pourquoi la Révolution ?',
      lines: [
        'Une maîtresse demande : « Pourquoi la Révolution a-t-elle lieu ? »',
        'Un élève répond : « Il y a des causes économiques, sociales, intellectuelles et politiques. »',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on ces causes qui expliquent le début de la Révolution ?',
          a: 'les origines',
          wrong: [
            {
              label: 'les étapes',
              why: 'Les étapes sont les moments clés qui suivent, comme 1789 ou l’exécution du roi.',
            },
            { label: 'les héritages', why: 'Les héritages sont ce qui reste après, pas ce qui explique le début.' },
          ],
          quote: Q_ORIGINES,
          explain: 'Les causes qui expliquent le début sont les origines.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : Napoléon Bonaparte ———

const napoleon: Notion = {
  id: 'hcm1-napoleon',
  title: 'Napoléon Bonaparte, du général à l’Empereur',
  hint: 'Relis le mémo : cherche son premier métier, la façon de prendre le pouvoir et l’année.',
  memo: [
    'Napoléon Bonaparte est d’abord **général** dans les armées républicaines.',
    'Il prend le pouvoir **par la force**, puis il est proclamé **empereur** des Français en 1804.',
    'Il passe donc de la Révolution à l’**Empire** : un seul homme dirige le pays.',
  ],
  faits: [
    {
      q: 'Quel est le premier rôle de Napoléon Bonaparte dans le programme ?',
      a: 'général dans les armées républicaines',
      wrong: [
        { label: 'roi de France', why: 'Napoléon n’est pas roi : il devient empereur.' },
        { label: 'ministre du roi Soleil', why: 'Le roi Soleil est Louis XIV, bien avant Napoléon.' },
        { label: 'chef gaulois', why: 'Les Gaulois vivent dans l’Antiquité, bien avant.' },
      ],
      gap: ['Napoléon est d’abord ', ' dans les armées républicaines.', ['général', 'general']],
      quote: Q_POUVOIR,
      explain: 'Napoléon Bonaparte est général dans les armées républicaines.',
    },
    {
      q: 'Comment Napoléon Bonaparte prend-il le pouvoir ?',
      a: 'par la force',
      wrong: [
        {
          label: 'par héritage de son père',
          why: 'Il n’est pas fils de roi : le programme dit qu’il prend le pouvoir par la force.',
        },
        { label: 'par un tirage au sort', why: 'Le programme dit qu’il prend le pouvoir par la force.' },
        { label: 'par un mariage royal', why: 'Le programme dit qu’il prend le pouvoir par la force.' },
      ],
      gap: ['Napoléon prend le pouvoir par la ', '.', ['force']],
      quote: Q_POUVOIR,
      explain: 'Napoléon prend le pouvoir par la force.',
    },
    {
      q: 'En quelle année Napoléon est-il proclamé empereur des Français ?',
      a: '1804',
      wrong: [
        { label: '1789', why: '1789 est l’année du début de la Révolution.' },
        { label: '800', why: '800 est l’année où Charlemagne est couronné empereur.' },
        { label: '1715', why: 'Cette date n’est pas au programme : Napoléon est proclamé empereur en 1804.' },
      ],
      gap: ['Napoléon est proclamé empereur des Français en ', '.', ['1804']],
      quote: Q_POUVOIR,
      explain: 'Napoléon est proclamé empereur des Français en 1804.',
    },
    {
      q: 'Quel titre reçoit Napoléon Bonaparte en 1804 ?',
      a: 'empereur des Français',
      wrong: [
        { label: 'roi des Francs', why: 'Roi des Francs, c’est Clovis, bien plus ancien.' },
        { label: 'roi Soleil', why: 'Le roi Soleil est Louis XIV.' },
        { label: 'roi chrétien', why: 'Le roi chrétien est Louis IX.' },
      ],
      gap: ['En 1804, Napoléon est proclamé ', ' des Français.', ['empereur']],
      quote: Q_POUVOIR,
      explain: 'Napoléon est proclamé empereur des Français.',
    },
  ],
  paires3: [
    ['Napoléon Bonaparte', 'Général devenu empereur'],
    ['1804', 'Année où il est proclamé empereur'],
    ['Par la force', 'Façon dont il prend le pouvoir'],
  ],
  paires5: [
    ['Napoléon Bonaparte', 'Général devenu empereur'],
    ['1804', 'Année où il est proclamé empereur'],
    ['Par la force', 'Façon dont il prend le pouvoir'],
    ['Armées républicaines', 'Armées où il est général'],
    ['Empire', 'Régime où règne un empereur'],
  ],
  ordre: [
    'Année 1789 : début de la Révolution',
    'Napoléon, général dans les armées républicaines',
    'Napoléon prend le pouvoir par la force',
    'Napoléon proclamé empereur des Français en 1804',
  ],
  libres: [
    {
      q: 'Napoléon Bonaparte est proclamé empereur des Français en … (quatre chiffres).',
      accepted: ['1804'],
      traps: [
        { text: '1789', why: '1789 est l’année du début de la Révolution.' },
        { text: '800', why: '800 est l’année où Charlemagne est couronné empereur.' },
      ],
      quote: Q_POUVOIR,
      explain: 'Napoléon est proclamé empereur des Français en 1804.',
    },
    {
      q: 'Napoléon Bonaparte est d’abord … dans les armées républicaines (un mot).',
      accepted: ['général', 'general', 'un général'],
      traps: [
        { text: 'roi', why: 'Napoléon n’est jamais roi de France : il devient empereur.' },
        { text: 'empereur', why: 'Il devient empereur plus tard : au début, il est général.' },
      ],
      quote: Q_POUVOIR,
      explain: 'Napoléon est d’abord général.',
    },
    {
      q: 'Napoléon prend le pouvoir par la … (un mot).',
      accepted: ['force', 'la force'],
      traps: [
        { text: 'loterie', why: 'Le programme ne parle pas de loterie : il dit « par la force ».' },
        { text: 'musique', why: 'Le programme ne parle pas de musique : il dit « par la force ».' },
      ],
      quote: Q_POUVOIR,
      explain: 'Napoléon prend le pouvoir par la force.',
    },
  ],
  docs: [
    {
      title: 'Une carte de visite du passé',
      lines: [
        'Je suis général dans les armées républicaines.',
        'Je prends le pouvoir par la force.',
        'En 1804, on me proclame empereur des Français.',
      ],
      qs: [
        {
          q: 'Qui parle dans ce texte ?',
          a: 'Napoléon Bonaparte',
          wrong: [
            { label: 'Louis XVI', why: 'Louis XVI est un roi : il est exécuté pendant la Révolution.' },
            { label: 'Charlemagne', why: 'Charlemagne est couronné empereur en 800, pas en 1804.' },
          ],
          quote: Q_POUVOIR,
          explain: 'Général devenu empereur des Français en 1804 : c’est Napoléon Bonaparte.',
        },
      ],
    },
    {
      title: 'Deux empereurs',
      lines: [
        'Léa regarde la frise de la classe.',
        'Un empereur est couronné en 800. Un autre est proclamé empereur des Français en 1804.',
      ],
      qs: [
        {
          q: 'Lequel des deux empereurs est le plus récent ?',
          a: 'celui de 1804, Napoléon',
          wrong: [
            { label: 'celui de 800, Charlemagne', why: '800 est bien plus ancien que 1804.' },
            { label: 'ils sont du même siècle', why: '800 et 1804 sont séparés par mille ans.' },
          ],
          quote: Q_POUVOIR,
          explain: '1804 vient après 800 : l’empereur de 1804, Napoléon, est le plus récent.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : héritages de la période ———

const heritages: Notion = {
  id: 'hcm1-heritages-revolution',
  title: 'Héritages de la période',
  hint: 'Relis le mémo : cherche ce qui change et ce que Napoléon garde de la Révolution.',
  memo: [
    'Le passage de la Révolution à l’Empire mélange **rupture** et **continuité**.',
    'Napoléon prend le pouvoir par la force, mais il conserve certains des **acquis** de la Révolution : ce que la Révolution a gagné et qui reste.',
    'Ces acquis sont un **héritage** : ce que le passé nous a laissé.',
  ],
  faits: [
    {
      q: 'Que fait Napoléon de certains acquis de la Révolution ?',
      a: 'il les conserve',
      wrong: [
        { label: 'il les efface tous', why: 'Le programme dit qu’il conserve certains acquis révolutionnaires.' },
        { label: 'il les ignore', why: 'Le programme dit qu’il les conserve.' },
        {
          label: 'il les donne au roi',
          why: 'Il n’y a plus de roi : Napoléon est empereur et il conserve ces acquis.',
        },
      ],
      gap: ['Napoléon ', ' certains des acquis révolutionnaires.', ['conserve']],
      quote: Q_ACQUIS,
      explain: 'Napoléon conserve certains des acquis révolutionnaires.',
    },
    {
      q: 'Quelle période vient juste après la Révolution dans le parcours de Napoléon ?',
      a: 'l’Empire',
      wrong: [
        { label: 'l’Ancien Régime', why: 'L’Ancien Régime est avant la Révolution : le roi gouvernait encore.' },
        { label: 'l’Antiquité', why: 'L’Antiquité est bien plus ancienne : le programme part de la Révolution.' },
        { label: 'la préhistoire', why: 'La préhistoire n’est pas dans ce thème.' },
      ],
      gap: ['Napoléon va de la Révolution à ', '.', ['l’Empire', 'l’empire', 'Empire', 'empire', 'lempire']],
      quote: Q_NAPOLEON,
      explain: 'La Révolution vient d’abord, puis l’Empire.',
    },
    {
      q: 'Dans le programme, qui conserve certains des acquis révolutionnaires ?',
      a: 'Napoléon Bonaparte',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV règne avant la Révolution : il ne peut pas conserver ses acquis.' },
        { label: 'Clovis', why: 'Clovis vit à l’époque des Francs, bien avant la Révolution.' },
        { label: 'François Ier', why: 'François Ier vit à la Renaissance, bien avant la Révolution.' },
      ],
      gap: [
        '',
        ' conserve certains des acquis révolutionnaires.',
        ['Napoléon', 'Napoléon Bonaparte', 'Bonaparte', 'napoléon'],
      ],
      quote: Q_POUVOIR + ', mais ' + Q_ACQUIS,
      explain: 'C’est Napoléon qui conserve certains acquis de la Révolution.',
    },
    {
      q: 'Napoléon conserve des acquis de la Révolution. Que montre cela entre la Révolution et l’Empire ?',
      a: 'une part de continuité',
      wrong: [
        {
          label: 'une rupture totale',
          why: 'Une rupture totale ne garderait rien : or Napoléon conserve certains acquis.',
        },
        { label: 'un retour à l’Ancien Régime', why: 'Napoléon n’est pas roi : il garde des acquis de la Révolution.' },
        { label: 'un oubli complet', why: 'Napoléon n’oublie pas tout : le programme dit qu’il conserve des acquis.' },
      ],
      gap: ['Garder des acquis, c’est une part de ', ' entre Révolution et Empire.', ['continuité', 'continuite']],
      quote: Q_ACQUIS,
      explain: 'Napoléon conserve certains acquis : il y a une part de continuité.',
    },
  ],
  paires3: [
    ['Rupture', 'Grand changement qui casse l’ordre ancien'],
    ['Acquis', 'Ce que la Révolution a gagné'],
    ['Héritage', 'Ce que le passé nous a laissé'],
  ],
  paires5: [
    ['Rupture', 'Grand changement qui casse l’ordre ancien'],
    ['Acquis', 'Ce que la Révolution a gagné'],
    ['Héritage', 'Ce que le passé nous a laissé'],
    ['Empire', 'Régime de Napoléon'],
    ['Ancien Régime', 'Temps où le roi gouverne'],
  ],
  ordre: [
    'Année 1789',
    'Exécution du roi',
    'Napoléon prend le pouvoir par la force',
    'Napoléon proclamé empereur des Français en 1804',
  ],
  libres: [
    {
      q: 'Napoléon … certains des acquis de la Révolution (un verbe, au présent).',
      accepted: ['conserve', 'garde', 'maintient', 'préserve', 'preserve'],
      traps: [
        { text: 'détruit', why: 'Le programme dit l’inverse : il conserve certains acquis.' },
        { text: 'oublie', why: 'Le programme dit qu’il conserve certains acquis.' },
      ],
      quote: Q_ACQUIS,
      explain: 'Napoléon conserve certains des acquis révolutionnaires.',
    },
    {
      q: 'Ce que la Révolution a gagné et qui reste s’appelle ses … (un mot, au pluriel).',
      accepted: ['acquis'],
      traps: [
        { text: 'défaites', why: 'Une défaite est un échec : ici, c’est ce qui a été gagné.' },
        { text: 'erreurs', why: 'Ce mot ne correspond pas : on parle de ce qui a été gagné.' },
      ],
      quote: Q_ACQUIS,
      explain: 'Les acquis sont ce que la Révolution a gagné.',
    },
    {
      q: 'On passe de la Révolution à l’… (un mot).',
      accepted: ['Empire', 'empire', 'l’Empire', 'l’empire'],
      traps: [
        { text: 'Antiquité', why: 'L’Antiquité est bien plus ancienne que la Révolution.' },
        { text: 'préhistoire', why: 'La préhistoire est bien plus ancienne que la Révolution.' },
      ],
      quote: Q_NAPOLEON,
      explain: 'Le thème va de la Révolution à l’Empire.',
    },
  ],
  docs: [
    {
      title: 'Un devoir sur la période',
      lines: [
        'Alex écrit : « Napoléon prend le pouvoir par la force. »',
        'Il ajoute : « Pourtant, il conserve certains des acquis de la Révolution. »',
      ],
      qs: [
        {
          q: 'Que veut dire « conserver des acquis » ?',
          a: 'garder une partie de ce que la Révolution a gagné',
          wrong: [
            { label: 'tout effacer pour revenir au roi', why: 'Conserver, c’est garder : ce n’est pas effacer.' },
            { label: 'partir dans un autre pays', why: 'Conserver, c’est garder, pas partir.' },
          ],
          quote: Q_ACQUIS,
          explain: 'Conserver des acquis, c’est garder une partie de ce que la Révolution a gagné.',
        },
      ],
    },
    {
      title: 'Du général à l’Empereur',
      lines: [
        'Un guide de musée explique le parcours d’un homme.',
        '« Il est général dans les armées républicaines, puis empereur. Il passe de la Révolution à l’Empire. »',
      ],
      qs: [
        {
          q: 'Quelle période vient en premier dans ce parcours ?',
          a: 'la Révolution',
          wrong: [
            { label: 'l’Empire', why: 'L’Empire vient après la Révolution, d’après le guide.' },
            { label: 'l’Antiquité', why: 'L’Antiquité n’apparaît pas dans le texte et elle est bien plus ancienne.' },
          ],
          quote: Q_NAPOLEON,
          explain: 'Le parcours va de la Révolution à l’Empire : la Révolution vient d’abord.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [etapes, nation, napoleon, heritages];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE));
