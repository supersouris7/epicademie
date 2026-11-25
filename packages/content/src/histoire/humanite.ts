import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './humanite-sources.ts';

/**
 * 6e, thème 1 « La longue histoire de l'humanité et des migrations » (lot hi-6e-01) : les débuts de l'humanité, la
 * « révolution » néolithique, les premiers États et les premières écritures. Les preuves sont dans
 * `humanite-sources.ts` ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

const wrong = (...w: readonly (readonly [string, string])[]) => w.map(([label, why]) => ({ label, why }));
const traps = (...t: readonly (readonly [string, string])[]) => t.map(([text, why]) => ({ text, why }));

// ——— Notion 1 : les débuts de l'humanité ———

const debuts: Notion = {
  id: 'h6-debuts-humanite',
  title: 'Les débuts de l’humanité',
  hint: 'Demande-toi d’abord de quand et d’où vient la trace, puis place-la dans la très longue durée.',
  memo: [
    'La **préhistoire** est la période d’avant l’écriture : on la connaît grâce aux **fossiles** et aux outils trouvés sur des **sites de fouilles**.',
    'Notre espèce, **Homo sapiens**, apparaît en Afrique il y a environ 300 000 ans ; d’autres représentants de l’humanité sont bien plus anciens, comme au Tchad il y a environ 7 millions d’années.',
    'Les groupes humains s’adaptent aux changements du **climat** et leurs **migrations** peuplent peu à peu le monde : par exemple, Homo sapiens est au nord de la Chine il y a environ 45 000 ans.',
  ],
  faits: [
    {
      q: 'Sur quel continent notre espèce, Homo sapiens, est-elle apparue ?',
      a: 'en Afrique',
      wrong: wrong(
        ['en Europe', 'Des humains ont vécu très tôt en Europe, mais notre espèce n’y est pas apparue.'],
        ['en Amérique', 'L’Amérique n’est pas le berceau d’Homo sapiens : notre espèce vient d’Afrique.'],
        ['en Asie', 'Homo sapiens arrive en Asie par migration, après être apparu en Afrique.'],
      ),
      gap: ['Notre espèce, Homo sapiens, est apparue en ', '.', ['Afrique']],
      ...P.sapiens,
      explain: 'Les fossiles montrent qu’Homo sapiens est apparu en Afrique, puis a migré vers d’autres continents.',
    },
    {
      q: 'Il y a environ combien de temps Homo sapiens apparaît-il ?',
      a: 'environ 300 000 ans',
      wrong: wrong(
        [
          'environ 3 000 ans',
          'Il y a 3 000 ans, on écrit déjà depuis longtemps : notre espèce est bien plus ancienne.',
        ],
        [
          'environ 7 millions d’années',
          'C’est l’âge d’un représentant de l’humanité bien plus ancien, découvert au Tchad, pas d’Homo sapiens.',
        ],
        [
          'environ 10 000 ans',
          'Vers cette époque, des animaux sont déjà domestiqués : notre espèce existe depuis bien plus longtemps.',
        ],
      ),
      gap: ['Homo sapiens apparaît en Afrique il y a environ ', ' ans.', ['300 000', '300000', 'trois cent mille']],
      ...P.sapiens,
      explain: 'Le CNRS date l’apparition d’Homo sapiens d’environ 300 000 ans.',
    },
    {
      q: 'Quel changement les débuts de l’humanité ont-ils connu, selon le programme ?',
      a: 'de fortes oscillations climatiques',
      wrong: wrong(
        ['l’invention de l’écriture', 'L’écriture apparaît bien plus tard, avec les premiers États.'],
        ['la construction des premières villes', 'Les villes arrivent bien après les débuts de l’humanité.'],
        ['un climat toujours identique', 'Au contraire : le climat a beaucoup varié et l’environnement a changé.'],
      ),
      gap: ['Les débuts de l’humanité ont connu de fortes ', ' climatiques.', ['oscillations', 'variations']],
      ...P.oscillations,
      explain: 'Les fortes variations du climat ont transformé l’environnement des groupes humains.',
    },
    {
      q: 'Comment les groupes humains réagissent-ils aux transformations de leur environnement ?',
      a: 'ils adaptent leurs modes de vie',
      wrong: wrong(
        [
          'ils inventent aussitôt l’écriture',
          'L’écriture n’est pas une réponse au climat : elle apparaît bien plus tard.',
        ],
        ['ils ne changent rien', 'Le programme dit au contraire que ces transformations les amènent à s’adapter.'],
        [
          'ils deviennent tous agriculteurs immédiatement',
          'L’agriculture apparaît bien plus tard, au néolithique, et pas partout en même temps.',
        ],
      ),
      gap: ['Les groupes humains doivent ', ' leurs modes de vie quand l’environnement change.', ['adapter']],
      ...P.oscillations,
      explain: 'Le climat transforme l’environnement ; les groupes humains adaptent leurs modes de vie.',
    },
    {
      q: 'Dans quel pays ont été découverts les restes de Sahelanthropus, très ancien représentant de l’humanité ?',
      a: 'au Tchad',
      wrong: wrong(
        ['en France', 'En France, dans la Somme, on trouve des silex taillés bien plus récents.'],
        ['en Chine', 'Au nord de la Chine, on trouve des traces d’Homo sapiens, beaucoup plus récentes.'],
        ['en Tanzanie', 'En Tanzanie, on a trouvé des outils en os, pas ce crâne.'],
      ),
      gap: ['Les restes de Sahelanthropus ont été découverts au ', ', dans le désert du Djourab.', ['Tchad']],
      ...P.tchad,
      explain: 'Sahelanthropus a été découvert au Tchad, en Afrique.',
    },
    {
      q: 'Qu’est-ce qu’une migration ?',
      a: 'un déplacement de personnes d’un lieu dans un autre',
      wrong: wrong(
        [
          'une installation définitive des habitants',
          'C’est l’inverse d’un déplacement : on parle alors de sédentarité.',
        ],
        ['un changement de climat', 'Le climat peut pousser à partir, mais la migration est le déplacement lui-même.'],
        ['une fouille archéologique', 'La fouille sert à retrouver des traces ; la migration est un déplacement.'],
      ),
      gap: ['Un déplacement de personnes d’un lieu dans un autre est une ', '.', ['migration']],
      ...P.migration,
      explain: 'Les premières grandes migrations expliquent le peuplement progressif du monde.',
    },
    {
      q: 'Quel événement marque la fin de la préhistoire, d’après la définition du dictionnaire ?',
      a: 'l’apparition de l’écriture (et l’emploi des métaux)',
      wrong: wrong(
        ['l’apparition d’Homo sapiens', 'Homo sapiens apparaît pendant la préhistoire, pas à sa fin.'],
        ['la découverte de l’Afrique', 'L’Afrique est le berceau de notre espèce : ce n’est pas un repère de fin.'],
        ['les premiers outils en pierre', 'Les outils en pierre sont des traces de la préhistoire elle-même.'],
      ),
      gap: ['La préhistoire précède l’apparition de l’', '.', ['écriture', 'ecriture']],
      ...P.prehistoire,
      explain: 'La préhistoire comprend les événements antérieurs à l’écriture et à l’emploi des métaux.',
    },
    {
      q: 'Avec quels documents peut-on étudier les premières grandes migrations de l’humanité ?',
      a: 'des cartes et des sites de fouilles',
      wrong: wrong(
        ['des journaux de l’époque', 'Aucun journal n’existe : l’écriture n’est pas encore inventée.'],
        ['des photographies anciennes', 'La photographie est une invention bien plus tardive.'],
        ['des lettres écrites par les migrants', 'Ces groupes ne connaissaient pas l’écriture.'],
      ),
      gap: ['On étudie les premières migrations avec des cartes et des sites de ', '.', ['fouilles', 'fouille']],
      ...P.migrations,
      explain: 'Le programme propose d’observer des cartes et de mentionner quelques sites de fouilles.',
    },
  ],
  paires3: [
    ['Tchad', 'Restes de Sahelanthropus (environ 7 millions d’années)'],
    ['Somme', 'Silex taillés (650 000 à 670 000 ans)'],
    ['Nord de la Chine', 'Présence d’Homo sapiens (environ 45 000 ans)'],
  ],
  paires5: [
    ['Tchad', 'Restes de Sahelanthropus (environ 7 millions d’années)'],
    ['Tanzanie', 'Outils en os de plus de 1,5 million d’années'],
    ['Somme', 'Silex taillés (650 000 à 670 000 ans)'],
    ['Afrique, il y a 300 000 ans', 'Apparition d’Homo sapiens'],
    ['Nord de la Chine', 'Présence d’Homo sapiens (environ 45 000 ans)'],
  ],
  frise: [
    { ...P.sahel, label: 'Sahelanthropus, au Tchad', date: 'environ 7 millions d’années' },
    { ...P.outils, label: 'Outils en os en Tanzanie', date: 'plus de 1,5 million d’années' },
    { ...P.somme, label: 'Silex taillés dans la Somme', date: '650 000 à 670 000 ans' },
    { ...P.sapiens, label: 'Apparition d’Homo sapiens en Afrique', date: 'environ 300 000 ans' },
    { ...P.chine, label: 'Homo sapiens au nord de la Chine', date: 'environ 45 000 ans' },
  ],
  libres: [
    {
      q: 'Sur quel continent Homo sapiens est-il apparu ?',
      accepted: ['Afrique', 'en Afrique', 'l’Afrique'],
      traps: traps(
        ['Europe', 'L’Europe a été peuplée par migration : l’espèce est apparue ailleurs.'],
        ['Asie', 'L’Asie est atteinte plus tard par migration.'],
      ),
      ...P.sapiens,
      explain: 'Homo sapiens est apparu en Afrique.',
    },
    {
      q: 'Quel est le nom (en latin, deux mots) de notre espèce ?',
      accepted: ['Homo sapiens', 'homo sapiens', 'Homo Sapiens'],
      traps: traps(
        ['Sahelanthropus', 'Sahelanthropus est un représentant bien plus ancien, pas notre espèce.'],
        ['Homo', 'Il manque le second mot du nom de notre espèce.'],
      ),
      ...P.sapiens,
      explain: 'Notre espèce s’appelle Homo sapiens.',
    },
    {
      q: 'Comment appelle-t-on le déplacement de personnes d’un lieu dans un autre ? (un mot)',
      accepted: ['migration', 'une migration', 'la migration'],
      traps: traps(
        ['peuplement', 'Le peuplement est la présence d’habitants ; ici, on cherche le déplacement.'],
        ['sédentarisation', 'La sédentarisation est l’installation durable : c’est l’inverse d’un déplacement.'],
      ),
      ...P.migration,
      explain: 'On parle de migration.',
    },
    {
      q: 'Dans quel pays d’Afrique Sahelanthropus a-t-il été découvert ?',
      accepted: ['Tchad', 'le Tchad', 'au Tchad'],
      traps: traps(
        ['Tanzanie', 'En Tanzanie, on a découvert des outils en os, pas Sahelanthropus.'],
        ['Maroc', 'Les restes de Sahelanthropus viennent du désert du Djourab, au Tchad.'],
      ),
      ...P.tchad,
      explain: 'Il a été découvert au Tchad.',
    },
  ],
  docs: [
    {
      title: 'Le carnet d’une équipe de fouilles',
      lines: [
        'Au Tchad : un crâne d’un représentant de l’humanité, environ 7 millions d’années.',
        'En Tanzanie : des outils en os de plus de 1,5 million d’années.',
        'Au nord de la Chine : des traces d’Homo sapiens d’environ 45 000 ans.',
        'Rappel : Homo sapiens est apparu en Afrique il y a environ 300 000 ans.',
      ],
      qs: [
        {
          q: 'Que montrent les traces trouvées au nord de la Chine, en les comparant à la ligne 4 ?',
          a: 'Homo sapiens a migré hors d’Afrique',
          wrong: wrong(
            ['Homo sapiens est apparu en Chine', 'La ligne 4 dit qu’il est apparu en Afrique ; la Chine vient après.'],
            ['Les Chinois ont inventé les premiers outils', 'Le carnet cite des outils plus anciens, en Tanzanie.'],
            ['Sahelanthropus vivait en Chine', 'La ligne 1 le situe au Tchad.'],
          ),
          ...P.chine,
          explain: 'Né en Afrique, Homo sapiens se trouve en Chine bien plus tard : il y est arrivé par migration.',
        },
        {
          q: 'Quelle découverte du carnet est la plus ancienne ?',
          a: 'le crâne du Tchad',
          wrong: wrong(
            ['les outils en os de Tanzanie', 'Plus de 1,5 million d’années, c’est moins que 7 millions.'],
            ['les traces du nord de la Chine', '45 000 ans : c’est la plus récente des trois découvertes.'],
            ['Homo sapiens en Afrique', '300 000 ans est bien plus récent que 7 millions d’années.'],
          ),
          ...P.sahel,
          explain: 'Plus le nombre d’années est grand, plus la trace est ancienne : 7 millions d’années ici.',
        },
      ],
    },
    {
      title: 'Un paysage qui change',
      lines: [
        'Il y a environ 200 000 ans, au centre de l’Afrique du Sud, il pleuvait de façon plus régulière toute l’année.',
        'Aujourd’hui, cette région est dominée par des prairies arides.',
        'Les chercheurs pensent que les premiers Homo sapiens adaptaient leurs pratiques à ce milieu changeant.',
      ],
      qs: [
        {
          q: 'Quelle idée du texte rejoint la phrase du programme sur les oscillations climatiques ?',
          a: 'les humains s’adaptent à un environnement qui change',
          wrong: wrong(
            ['le climat est resté le même depuis 200 000 ans', 'La ligne 2 montre au contraire un paysage différent.'],
            ['les premiers Homo sapiens vivaient dans des villes', 'Le texte ne parle pas de villes.'],
            ['les prairies arides existaient déjà partout', 'La ligne 1 décrit des pluies plus régulières à l’époque.'],
          ),
          ...P.paysages,
          explain: 'Le milieu change et les groupes humains adaptent leurs pratiques : c’est l’idée du programme.',
        },
        {
          q: 'D’après le texte, comment étaient les pluies il y a environ 200 000 ans ?',
          a: 'mieux réparties au cours de l’année',
          wrong: wrong(
            ['absentes toute l’année', 'La ligne 1 dit qu’il pleuvait de façon plus régulière.'],
            ['concentrées sur une seule journée', 'La ligne 1 parle de pluies régulières toute l’année.'],
            ['identiques à celles d’aujourd’hui', 'La région est aujourd’hui aride : les pluies ont changé.'],
          ),
          ...P.pluies,
          explain: 'Les précipitations étaient plus régulièrement réparties : le climat a donc changé.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la « révolution » néolithique ———

const neolithique: Notion = {
  id: 'h6-revolution-neolithique',
  title: 'La « révolution » néolithique',
  hint: 'Cherche ce qui change dans la vie des groupes : où ils habitent et comment ils se nourrissent.',
  memo: [
    'Au **néolithique**, des groupes humains se fixent : la **sédentarisation** remplace peu à peu la vie **nomade**.',
    'Ils pratiquent l’**agriculture** et l’**élevage**, ce qui montre leur action sur l’environnement ; par exemple, des chèvres sont domestiquées au Proche et au Moyen-Orient il y a 10 500 ans.',
    'Ces changements ne se produisent pas au même moment partout : c’est une « révolution » très étalée dans le temps.',
  ],
  faits: [
    {
      q: 'Comment appelle-t-on un groupe qui s’installe de façon durable au même endroit ?',
      a: 'un groupe sédentaire',
      wrong: wrong(
        ['un groupe nomade', 'Nomade veut dire le contraire : sans établissement fixe.'],
        ['un groupe migrant', 'Migrer, c’est se déplacer d’un lieu à un autre.'],
        ['un groupe préhistorique', 'La préhistoire est une période ; elle ne dit pas si l’on reste sur place.'],
      ),
      gap: ['Un peuple attaché de manière fixe à un lieu est ', '.', ['sédentaire', 'sedentaire']],
      ...P.sedentaire,
      explain: 'Sédentaire signifie attaché de manière fixe à un lieu.',
    },
    {
      q: 'Que signifie « nomade » ?',
      a: 'sans demeure fixe',
      wrong: wrong(
        ['installé dans un village', 'C’est la définition d’un sédentaire.'],
        ['qui cultive la terre', 'Cultiver la terre, c’est faire de l’agriculture.'],
        ['qui élève des animaux', 'C’est l’élevage ; on peut même élever des animaux en se déplaçant.'],
      ),
      gap: ['Un groupe sans demeure fixe est un groupe ', '.', ['nomade']],
      ...P.nomade,
      explain: 'Le nomade n’a pas de demeure ni d’établissement fixe.',
    },
    {
      q: 'Qu’est-ce que l’élevage ?',
      a: 'l’art d’élever des animaux domestiques',
      wrong: wrong(
        ['la chasse d’animaux sauvages', 'Chasser, c’est capturer des animaux sauvages, pas les élever.'],
        ['la culture des céréales', 'C’est de l’agriculture.'],
        ['la cueillette des fruits', 'La cueillette ramasse ce qui pousse tout seul, sans élever d’animaux.'],
      ),
      gap: ['L’art d’élever des animaux domestiques s’appelle l’', '.', ['élevage', 'elevage']],
      ...P.elevage,
      explain: 'L’élevage concerne les animaux domestiques.',
    },
    {
      q: 'Selon le programme, comment la sédentarisation, l’agriculture et l’élevage apparaissent-ils selon les régions ?',
      a: 'à des moments différents',
      wrong: wrong(
        ['partout le même jour', 'Aucun changement de ce genre ne se fait au même instant partout.'],
        ['seulement en Europe', 'Ils concernent différents espaces, dont le Proche-Orient et l’Afrique.'],
        ['uniquement après l’écriture', 'Le néolithique est antérieur à l’écriture.'],
      ),
      gap: [
        'La sédentarisation, l’agriculture et l’élevage apparaissent à des moments ',
        ' selon les espaces.',
        ['différents', 'differents', 'divers'],
      ],
      ...P.moments,
      explain: 'Chaque espace géographique connaît ces changements à son rythme.',
    },
    {
      q: 'Où se trouvaient les foyers de domestication des chèvres étudiés par les chercheurs ?',
      a: 'dans le Croissant fertile',
      wrong: wrong(
        ['en Amérique du Sud', 'Les foyers étudiés sont au Proche et au Moyen-Orient, pas en Amérique.'],
        ['au nord de la Chine', 'La Chine est citée pour Homo sapiens, pas pour ces chèvres.'],
        ['en Afrique du Sud', 'En Afrique, l’étude citée concerne l’âne ; les chèvres viennent du Croissant fertile.'],
      ),
      gap: ['Les chèvres sont domestiquées dans le Croissant ', '.', ['fertile']],
      ...P.croissant,
      explain: 'Plusieurs foyers de domestication de chèvres coexistent dans le Croissant fertile.',
    },
    {
      q: 'Comment l’agriculture arrive-t-elle sur le territoire de la France actuelle ?',
      a: 'avec des populations venues de loin',
      wrong: wrong(
        [
          'elle y est inventée il y a 300 000 ans',
          'Il y a 300 000 ans, c’est la date d’apparition d’Homo sapiens, pas de l’agriculture.',
        ],
        ['par les Romains', 'Les Romains arrivent bien plus tard, à l’Antiquité.'],
        ['grâce à l’écriture', 'L’agriculture est plus ancienne que l’écriture.'],
      ),
      gap: ['Les premiers paysans français sont des pionniers venus de ', '.', ['loin']],
      ...P.paysans,
      explain:
        'Le CNRS parle de pionniers venus de loin, qui implantent l’agriculture et bâtissent les premiers villages.',
    },
    {
      q: 'Qu’étudie-t-on à propos du néolithique, selon le programme ?',
      a: 'l’action des femmes et des hommes sur leur environnement',
      wrong: wrong(
        ['la naissance de la démocratie', 'La démocratie à Athènes relève d’un autre thème de 6e.'],
        ['la chute de l’empire romain', 'Cet événement est bien plus tardif.'],
        ['l’apparition d’Homo sapiens', 'Homo sapiens existe bien avant le néolithique.'],
      ),
      gap: ['Le néolithique interroge l’action des humains sur leur ', '.', ['environnement']],
      ...P.environnement,
      explain: 'En cultivant et en élevant, les humains modifient leur environnement.',
    },
    {
      q: 'Que désigne la domestication ?',
      a: 'l’apprivoisement des animaux',
      wrong: wrong(
        ['la construction de maisons', 'Construire un habitat ne dit rien des animaux.'],
        ['la chasse au grand gibier', 'La chasse capture des animaux sauvages sans les apprivoiser.'],
        ['la disparition d’une espèce', 'Domestiquer un animal, ce n’est pas le faire disparaître.'],
      ),
      gap: ['La ', ' est l’apprivoisement des animaux.', ['domestication']],
      ...P.domestication,
      explain: 'La domestication est l’action d’apprivoiser des animaux.',
    },
  ],
  paires3: [
    ['sédentaire', 'attaché de manière fixe à un lieu'],
    ['élevage', 'art d’élever des animaux domestiques'],
    ['agriculture', 'culture des terres'],
  ],
  paires5: [
    ['sédentaire', 'attaché de manière fixe à un lieu'],
    ['nomade', 'sans demeure fixe'],
    ['agriculture', 'culture des terres'],
    ['domestication', 'apprivoisement des animaux'],
    ['néolithique', 'époque de la pierre polie'],
  ],
  frise: [
    { ...P.sapiens, label: 'Apparition d’Homo sapiens en Afrique', date: 'environ 300 000 ans' },
    { ...P.chevres, label: 'Chèvres domestiquées au Proche-Orient', date: 'il y a 10 500 ans' },
    { ...P.paysans, label: 'Premiers paysans sur le territoire français', date: 'il y a 7 500 ans' },
    { ...P.invention, label: 'Invention de l’écriture en Mésopotamie', date: 'entre 3500 et 3300 av. J.-C.' },
  ],
  libres: [
    {
      q: 'Comment appelle-t-on l’activité de culture des terres pour produire des végétaux utiles ? (un mot)',
      accepted: ['agriculture', 'l’agriculture'],
      traps: traps(
        ['élevage', 'L’élevage concerne les animaux, pas la culture des terres.'],
        ['cueillette', 'La cueillette ramasse sans cultiver.'],
      ),
      ...P.agriculture,
      explain: 'La culture des terres, c’est l’agriculture.',
    },
    {
      q: 'Comment appelle-t-on l’art d’élever des animaux domestiques ? (un mot)',
      accepted: ['élevage', 'elevage', 'l’élevage'],
      traps: traps(
        [
          'agriculture',
          'Le mot précis pour élever des animaux est un autre ; l’agriculture désigne d’abord la culture.',
        ],
        ['chasse', 'La chasse capture des animaux sauvages.'],
      ),
      ...P.elevage,
      explain: 'C’est l’élevage.',
    },
    {
      q: 'Quel adjectif désigne un groupe sans demeure fixe ?',
      accepted: ['nomade', 'nomades'],
      traps: traps(
        ['sédentaire', 'Sédentaire est le contraire.'],
        ['paysan', 'Un paysan cultive la terre et vit en général sur place.'],
      ),
      ...P.nomade,
      explain: 'Un groupe sans demeure fixe est nomade.',
    },
    {
      q: 'Comment s’appelle la période de la préhistoire marquée par la pierre polie ?',
      accepted: ['néolithique', 'neolithique', 'le néolithique', 'âge néolithique'],
      traps: traps(
        ['paléolithique', 'Le paléolithique est une période plus ancienne de la préhistoire, avant le néolithique.'],
        ['Antiquité', 'L’Antiquité commence après la préhistoire, avec les premiers États et les écritures.'],
      ),
      ...P.neolithique,
      explain: 'La période de la pierre polie est le néolithique.',
    },
  ],
  docs: [
    {
      title: 'Récit d’un village (texte imaginé)',
      lines: [
        'Autrefois, nos ancêtres suivaient les animaux et changeaient souvent de campement.',
        'Aujourd’hui, nos maisons restent au même endroit toute l’année.',
        'Nous semons du blé et nous gardons des chèvres près des maisons.',
        'Pour agrandir nos champs, nous avons coupé des arbres.',
      ],
      qs: [
        {
          q: 'Quelle ligne montre la sédentarisation ?',
          a: 'la ligne 2',
          wrong: wrong(
            ['la ligne 1', 'La ligne 1 décrit une vie nomade, avec des campements qui changent.'],
            ['la ligne 3', 'La ligne 3 montre l’agriculture et l’élevage.'],
            ['la ligne 4', 'La ligne 4 montre une action sur l’environnement.'],
          ),
          ...P.sedentaire,
          explain: 'Des maisons qui restent au même endroit : le groupe est devenu sédentaire.',
        },
        {
          q: 'Quelle ligne montre le mieux l’action des humains sur leur environnement ?',
          a: 'la ligne 4',
          wrong: wrong(
            ['la ligne 1', 'La ligne 1 parle de déplacements, pas d’une transformation du milieu.'],
            ['la ligne 2', 'La ligne 2 dit où l’on habite, sans transformer le milieu.'],
          ),
          ...P.environnement,
          explain: 'Couper des arbres pour agrandir les champs transforme le milieu.',
        },
      ],
    },
    {
      title: 'Trois dates de domestication et d’agriculture',
      lines: [
        'Proche et Moyen-Orient : des chèvres domestiquées depuis 10 500 ans.',
        'Territoire de la France actuelle : premiers paysans il y a 7 500 ans.',
        'Afrique : l’âne aurait été domestiqué 5000 ans avant notre ère.',
      ],
      qs: [
        {
          q: 'Quelle conclusion peut-on tirer de ces trois lignes ?',
          a: 'ces changements se produisent à des moments différents selon les régions',
          wrong: wrong(
            ['tout commence le même jour dans le monde', 'Les trois lignes donnent des dates différentes.'],
            ['l’élevage n’existe qu’en Europe', 'Les lignes 1 et 3 parlent du Proche-Orient et de l’Afrique.'],
            ['l’agriculture est inventée par les Romains', 'Ces dates sont bien plus anciennes que les Romains.'],
          ),
          ...P.moments,
          explain: 'Dates et lieux différents : le néolithique ne se produit pas partout en même temps.',
        },
        {
          q: 'Dans quel ensemble de régions la date citée est-elle la plus ancienne ?',
          a: 'au Proche et au Moyen-Orient',
          wrong: wrong(
            ['sur le territoire de la France actuelle', 'Il y a 7 500 ans est plus récent que 10 500 ans.'],
            ['en Afrique', '5000 ans avant notre ère, soit environ 7 000 ans : c’est plus récent que 10 500 ans.'],
          ),
          ...P.chevres,
          explain: 'La ligne 1 donne la plus grande ancienneté : 10 500 ans.',
        },
        {
          q: 'Quelle information est présentée avec prudence, grâce au verbe « aurait » ?',
          a: 'la domestication de l’âne en Afrique',
          wrong: wrong(
            ['les chèvres du Proche et Moyen-Orient', 'La ligne 1 ne contient aucun verbe au conditionnel.'],
            ['les premiers paysans en France', 'La ligne 2 donne une date sans employer « aurait ».'],
          ),
          ...P.ane,
          explain:
            'Le conditionnel « aurait été domestiqué » signale un résultat que les chercheurs avancent avec prudence.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : premiers États, premières écritures ———

const etats: Notion = {
  id: 'h6-premiers-etats-ecritures',
  title: 'Premiers États, premières écritures',
  hint: 'Sépare bien la Mésopotamie et l’Égypte : chacune a son support, ses signes et ses dates.',
  memo: [
    'Les premiers **États** et les premières écritures s’étudient dans l’**Orient ancien** : en Mésopotamie et en Égypte.',
    'En Mésopotamie, l’écriture apparaît dans des **cités-États** comme Uruk, sur des **tablettes d’argile** : les signes deviennent **cunéiformes**.',
    'En Égypte, gouvernée par un **pharaon**, les **scribes** peuvent écrire avec des **hiéroglyphes** : par exemple, pour noter des informations administratives.',
  ],
  faits: [
    {
      q: 'Quand l’écriture apparaît-elle en Mésopotamie ?',
      a: 'entre 3500 et 3300 avant notre ère',
      wrong: wrong(
        ['entre 3500 et 3300 après J.-C.', 'Attention au côté du repère : c’est avant notre ère.'],
        ['il y a 300 000 ans', 'C’est la date d’apparition d’Homo sapiens, bien avant l’écriture.'],
        ['vers l’an 400 de notre ère', 'C’est vers cette date que les hiéroglyphes cessent d’être utilisés.'],
      ),
      gap: ['L’écriture apparaît en Mésopotamie entre 3500 et ', ' avant notre ère.', ['3300', '3 300']],
      ...P.invention,
      explain: 'Elle est inventée dans la seconde moitié du IVe millénaire avant notre ère.',
    },
    {
      q: 'Dans quel type de lieux l’écriture apparaît-elle en Mésopotamie ?',
      a: 'dans des cités-États',
      wrong: wrong(
        ['dans des campements de chasseurs', 'L’écriture est liée au développement des villes, pas à des campements.'],
        ['dans l’empire romain', 'L’empire romain est bien plus tardif.'],
        ['dans des grottes préhistoriques', 'On y trouve des dessins, pas ce système d’écriture.'],
      ),
      gap: ['L’écriture apparaît dans plusieurs ', ' de Mésopotamie.', ['cités-États', 'cités-etats', 'cités États']],
      ...P.citesEtats,
      explain: 'Uruk, au pays de Sumer, est l’une de ces cités-États.',
    },
    {
      q: 'Dans quel pays actuel se trouve le site d’Uruk ?',
      a: 'en Irak',
      wrong: wrong(
        ['en Égypte', 'L’Égypte a ses propres écritures ; Uruk est en Mésopotamie.'],
        ['en France', 'La France n’appartient pas à l’Orient ancien.'],
        ['en Chine', 'La Chine est hors de la Mésopotamie.'],
      ),
      gap: ['Le site d’Uruk se trouve aujourd’hui en ', '.', ['Irak', 'Iraq']],
      ...P.citesEtats,
      explain: 'Uruk (actuelle Warka) est en Irak, dans le sud de la Mésopotamie.',
    },
    {
      q: 'Sur quel support écrit-on le plus en Mésopotamie ?',
      a: 'sur des tablettes d’argile',
      wrong: wrong(
        ['sur des rouleaux de papyrus', 'Le papyrus est le support typique de l’Égypte.'],
        ['sur des feuilles de papier imprimées', 'L’imprimerie est une invention bien plus tardive.'],
        ['sur des écrans', 'Les écrans sont modernes.'],
      ),
      gap: ['En Mésopotamie, on écrit surtout sur des tablettes d’', '.', ['argile']],
      ...P.argile,
      explain: 'L’argile est le support privilégié de l’écriture cunéiforme.',
    },
    {
      q: 'Qu’est-ce qui donne aux signes la forme de coins de l’écriture cunéiforme ?',
      a: 'un calame de roseau appuyé dans l’argile',
      wrong: wrong(
        [
          'une plume trempée dans l’encre',
          'Les signes cunéiformes sont imprimés dans l’argile, non écrits à la plume.',
        ],
        ['un burin sur du bois', 'La source décrit un calame de roseau sur de l’argile.'],
        ['une machine à imprimer', 'Aucune machine n’existe à cette époque.'],
      ),
      gap: ['L’écriture cunéiforme est tracée avec un ', ' de roseau.', ['calame']],
      ...P.calame,
      explain: 'Le calame à bout triangulaire laisse des impressions en forme de coins.',
    },
    {
      q: 'Comment s’appellent les signes de base de l’écriture égyptienne ?',
      a: 'les hiéroglyphes',
      wrong: wrong(
        ['les signes cunéiformes', 'Le cunéiforme est l’écriture de la Mésopotamie.'],
        ['les lettres latines', 'L’alphabet latin est bien plus tardif.'],
        ['les chiffres arabes', 'Les chiffres arabes ne sont pas une écriture égyptienne.'],
      ),
      gap: ['En Égypte, les signes de base de l’écriture sont les ', '.', ['hiéroglyphes', 'hieroglyphes']],
      ...P.egypte,
      explain: 'L’écriture égyptienne a pour signes de base les hiéroglyphes.',
    },
    {
      q: 'Quel titre portent les souverains de l’Égypte ancienne ?',
      a: 'pharaon',
      wrong: wrong(
        ['empereur romain', 'L’empereur gouverne Rome, pas l’Égypte ancienne.'],
        ['consul', 'Le consul est un magistrat romain.'],
        ['scribe', 'Le scribe écrit les textes : il ne règne pas.'],
      ),
      gap: ['Le souverain de l’Égypte ancienne porte le titre de ', '.', ['pharaon']],
      ...P.pharaon,
      explain: 'Pharaon est le titre des souverains de l’Égypte ancienne.',
    },
    {
      q: 'Que représentent les milliers de tablettes inscrites trouvées à Uruk ?',
      a: 'des archives administratives',
      wrong: wrong(
        ['des romans', 'Les premiers documents sont des notes et des comptes, pas des romans.'],
        ['des cartes postales', 'La poste moderne n’existe pas.'],
        ['de simples décorations', 'Les tablettes sont des documents de gestion.'],
      ),
      gap: ['Les tablettes d’Uruk sont des archives ', '.', ['administratives', 'administrative']],
      ...P.archives,
      explain: 'Les tablettes d’Uruk représentent des archives administratives : l’écriture sert à gérer.',
    },
    {
      q: 'Dans quel cadre le programme place-t-il l’étude des premiers États et des premières écritures ?',
      a: 'l’Orient ancien',
      wrong: wrong(
        ['l’empire romain', 'L’empire romain est étudié dans un autre thème de 6e.'],
        ['la Gaule', 'La Gaule n’est pas le cadre de cette étude.'],
        ['la Chine des Han', 'La Chine des Han est étudiée avec la route de la soie.'],
      ),
      gap: ['Les premiers États et les premières écritures s’étudient dans l’', ' ancien.', ['Orient']],
      ...P.orient,
      explain: 'L’étude se place dans l’Orient ancien : Égypte ou Mésopotamie.',
    },
    {
      q: 'Quel support reste essentiel pour le livre en Égypte ?',
      a: 'le papyrus',
      wrong: wrong(
        ['la tablette d’argile', 'L’argile est le grand support de la Mésopotamie.'],
        ['le papier imprimé', 'L’imprimerie est bien plus tardive.'],
        ['l’écran', 'Les écrans sont modernes.'],
      ),
      gap: ['En Égypte, le support essentiel du livre est le ', '.', ['papyrus']],
      ...P.papyrus,
      explain: 'Le papyrus resta le support essentiel du livre en Égypte.',
    },
    {
      q: 'Quelles informations les premiers hiéroglyphes gravés sur des tablettes et des poteries livrent-ils ?',
      a: 'des dates et des informations administratives',
      wrong: wrong(
        ['des romans d’aventures', 'La source ne parle pas de récits d’aventures.'],
        ['des recettes de cuisine modernes', 'Rien de moderne à cette époque.'],
        ['des cartes du monde entier', 'Les Égyptiens ne notent pas là une carte du monde.'],
      ),
      gap: ['Ces inscriptions livrent des dates et des informations ', '.', ['administratives', 'administrative']],
      ...P.administratif,
      explain: 'Comme en Mésopotamie, l’écriture sert à gérer.',
    },
    {
      q: 'D’après la BnF, à l’émergence de quelle notion l’invention de l’écriture est-elle liée ?',
      a: 'la notion d’État',
      wrong: wrong(
        ['la notion de nomadisme', 'L’écriture naît dans des villes, pas de la vie nomade.'],
        ['la notion de préhistoire', 'La préhistoire désigne justement la période d’avant l’écriture.'],
        ['la notion de cueillette', 'La cueillette existait bien avant l’écriture.'],
      ),
      gap: ['L’invention de l’écriture est liée à l’émergence de la notion d’', '.', ['État', 'Etat']],
      ...P.etat,
      explain: 'L’écriture apparaît quand des villes s’organisent et que la notion d’État émerge.',
    },
  ],
  paires3: [
    ['Mésopotamie', 'écriture cunéiforme'],
    ['Égypte', 'hiéroglyphes'],
    ['pharaon', 'souverain de l’Égypte ancienne'],
  ],
  paires5: [
    ['Uruk', 'cité du pays de Sumer, en Irak actuel'],
    ['calame', 'roseau qui imprime des coins dans l’argile'],
    ['hiéroglyphes', 'signes de base de l’écriture égyptienne'],
    ['scribe', 'rédacteur ou copiste de textes'],
    ['pharaon', 'souverain de l’Égypte ancienne'],
  ],
  frise: [
    { ...P.chevres, label: 'Chèvres domestiquées au Proche-Orient', date: 'il y a 10 500 ans' },
    { ...P.invention, label: 'Invention de l’écriture en Mésopotamie', date: 'entre 3500 et 3300 av. J.-C.' },
    { ...P.egypte, label: 'Apparition de l’écriture en Égypte', date: 'vers 3200-3150 av. J.-C.' },
    { ...P.fin, label: 'Derniers usages des hiéroglyphes', date: 'vers 400 apr. J.-C.' },
  ],
  libres: [
    {
      q: 'Comment s’appelle l’écriture en forme de coins de la Mésopotamie ?',
      accepted: ['cunéiforme', 'cuneiforme', 'l’écriture cunéiforme', 'écriture cunéiforme'],
      traps: traps(
        ['hiéroglyphes', 'Les hiéroglyphes sont les signes de l’Égypte.'],
        ['alphabet', 'Le cunéiforme n’est pas l’alphabet.'],
      ),
      ...P.calame,
      explain: 'C’est l’écriture cunéiforme.',
    },
    {
      q: 'Comment s’appellent les signes de base de l’écriture égyptienne ?',
      accepted: ['hiéroglyphes', 'hieroglyphes', 'les hiéroglyphes', 'hiéroglyphe'],
      traps: traps(
        ['cunéiforme', 'Le cunéiforme est mésopotamien.'],
        ['papyrus', 'Le papyrus est un support, pas un signe.'],
      ),
      ...P.egypte,
      explain: 'Ce sont les hiéroglyphes.',
    },
    {
      q: 'Quel titre particulier, autre que « roi », désigne le souverain de l’Égypte ancienne ?',
      accepted: ['pharaon', 'le pharaon'],
      traps: traps(
        ['roi de Sumer', 'Sumer est en Mésopotamie.'],
        ['empereur', 'Ce n’est pas le titre donné aux souverains de l’Égypte ancienne.'],
      ),
      ...P.pharaon,
      explain: 'C’est le pharaon.',
    },
    {
      q: 'Comment appelle-t-on celui qui rédige ou copie des textes dans l’Égypte et la Mésopotamie antiques ?',
      accepted: ['scribe', 'un scribe', 'le scribe'],
      traps: traps(['pharaon', 'Le pharaon est le souverain.'], ['marchand', 'Le marchand fait du commerce.']),
      ...P.scribe,
      explain: 'C’est le scribe.',
    },
  ],
  docs: [
    {
      title: 'La tablette du magasin (texte imaginé)',
      lines: [
        'À Uruk, un homme appuie un roseau taillé dans une tablette d’argile fraîche.',
        'Il note le nombre de sacs de grain apportés au grand temple.',
        'La tablette est ensuite rangée avec d’autres pour être consultée plus tard.',
      ],
      qs: [
        {
          q: 'Quel est le principal rôle de l’écriture dans ce texte ?',
          a: 'garder la trace d’une gestion',
          wrong: wrong(
            ['raconter un mythe', 'Le texte ne parle que de comptes de grain.'],
            ['décorer le temple', 'La tablette est rangée pour être consultée, pas exposée.'],
            ['apprendre à chasser', 'Il n’est pas question de chasse.'],
          ),
          ...P.memoire,
          explain: 'La tablette sert d’aide-mémoire pour les comptes : l’écriture aide à gérer.',
        },
        {
          q: 'Dans quelle région cette scène se passe-t-elle ?',
          a: 'en Mésopotamie',
          wrong: wrong(
            ['en Égypte', 'Uruk est une cité de Mésopotamie, pas d’Égypte.'],
            ['en Chine', 'Uruk est en Irak actuel.'],
          ),
          ...P.citesEtats,
          explain: 'Uruk est une cité-État de Mésopotamie.',
        },
      ],
    },
    {
      title: 'Deux écritures (texte imaginé)',
      lines: [
        'Ahmès, en Égypte, copie un texte avec des signes qui représentent souvent des êtres ou des objets.',
        'Il travaille sur un rouleau de papyrus.',
        'Ibni, en Mésopotamie, imprime des signes en forme de coins dans l’argile.',
      ],
      qs: [
        {
          q: 'Quelle écriture Ahmès emploie-t-il probablement ?',
          a: 'les hiéroglyphes',
          wrong: wrong(
            ['le cunéiforme', 'Le cunéiforme est celui d’Ibni, en Mésopotamie.'],
            ['l’alphabet latin', 'L’alphabet latin n’est pas l’écriture de l’Égypte ancienne.'],
          ),
          ...P.egypte,
          explain: 'En Égypte, les signes de base sont les hiéroglyphes.',
        },
        {
          q: 'Quel indice de la ligne 3 désigne l’écriture cunéiforme ?',
          a: 'les signes en forme de coins',
          wrong: wrong(
            ['le rouleau de papyrus', 'Le papyrus est cité à la ligne 2, pour l’Égypte.'],
            ['le nom d’Ahmès', 'Un prénom n’indique pas le type d’écriture.'],
          ),
          ...P.calame,
          explain: 'Cunéiforme désigne une écriture aux signes en forme de coins.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [debuts, neolithique, etats];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'sixième'));
