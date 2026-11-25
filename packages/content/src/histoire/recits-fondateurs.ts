import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './recits-fondateurs-sources.ts';

/**
 * 6e, thème 2 « Récits fondateurs, croyances et citoyenneté dans la Méditerranée antique au Ier millénaire avant J.-C. »
 * (lot hi-6e-02) : le monde des cités grecques, Rome du mythe à l'histoire, la naissance du monothéisme juif, la
 * citoyenneté à Athènes et à Rome. Croyances et récits sont toujours présentés comme tels, distingués des faits
 * attestés. Les preuves sont dans `recits-fondateurs-sources.ts` ; les textes du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

const wrong = (...w: readonly (readonly [string, string])[]) => w.map(([label, why]) => ({ label, why }));
const traps = (...t: readonly (readonly [string, string])[]) => t.map(([text, why]) => ({ text, why }));

// ——— Notion 1 : le monde des cités grecques ———

const cites: Notion = {
  id: 'h6-cites-grecques',
  title: 'Le monde des cités grecques',
  hint: 'Distingue ce qui sépare les Grecs (leurs cités) de ce qu’ils partagent (langue, récits, dieux).',
  memo: [
    'Au Ier millénaire av. J.-C., le monde grec est **morcelé** en **cités** rivales, qui ont pourtant une culture commune : une langue, des dieux et des récits.',
    'L’Iliade et l’Odyssée, deux **épopées** attribuées au poète Homère, chantées par des **aèdes**, font partie de cet univers commun ; l’**alphabet** grec vient de l’alphabet phénicien, auquel les Grecs ajoutent des voyelles.',
    'Les Grecs se retrouvent dans des **sanctuaires** **panhelléniques** : à Olympie (jeux dès 776 av. J.-C.) et à Delphes, où l’on honore Apollon.',
  ],
  faits: [
    {
      q: 'Comment le monde grec est-il organisé sur le plan politique au Ier millénaire av. J.-C. ?',
      a: 'en cités rivales, politiquement morcelé',
      wrong: wrong(
        ['en un seul empire dirigé par un empereur', 'Il n’existe pas d’empereur des Grecs : chaque cité se gouverne.'],
        ['en une seule monarchie avec un roi unique', 'Aucun roi ne gouverne tous les Grecs à cette époque.'],
        [
          'en provinces dirigées depuis Rome',
          'La domination romaine est bien plus tardive : les Grecs ont alors leurs cités.',
        ],
      ),
      gap: ['Le monde grec est politiquement ', ' en cités rivales.', ['morcelé', 'morcele', 'divisé', 'divise']],
      ...P.morcele,
      explain: 'Les Grecs partagent une culture, mais chaque cité se gouverne elle-même.',
    },
    {
      q: 'Quelles œuvres incarnent l’univers culturel commun des Grecs ?',
      a: 'l’Iliade et l’Odyssée',
      wrong: wrong(
        ['l’Énéide', 'L’Énéide est un poème latin de Virgile, lié à Rome.'],
        ['la Torah', 'La Torah est le texte fondateur du judaïsme, étudié avec le monothéisme juif.'],
        ['l’Épopée de Guilgamesh', 'Cette épopée est un récit mésopotamien, pas une œuvre fondatrice des Grecs.'],
      ),
      gap: ['L’univers culturel commun des Grecs est incarné par l’Iliade et l’', '.', ['Odyssée', 'Odyssee']],
      ...P.morcele,
      explain: 'Les deux épopées attribuées à Homère sont connues de tous les Grecs.',
    },
    {
      q: 'Quel poète Platon présente-t-il comme « l’éducateur de la Grèce » ?',
      a: 'Homère',
      wrong: wrong(
        ['Virgile', 'Virgile est un poète romain, auteur de l’Énéide.'],
        ['Tite-Live', 'Tite-Live est un historien romain, à l’époque d’Auguste.'],
        ['Hérodote', 'Hérodote est un historien grec qui décrit les Grecs, pas le poète des épopées.'],
      ),
      gap: ['Platon dit qu’', ' fut l’éducateur de la Grèce.', ['Homère', 'Homere']],
      ...P.educateur,
      explain: 'Les épopées d’Homère servent de modèle aux jeunes Grecs.',
    },
    {
      q: 'Dans quel sanctuaire les jeux olympiques ont-ils été institués ?',
      a: 'à Olympie',
      wrong: wrong(
        ['à Delphes', 'Delphes est le sanctuaire d’Apollon et de la Pythie, pas celui des jeux olympiques.'],
        ['à Troie', 'Troie est la ville assiégée dans l’Iliade, pas un sanctuaire des jeux.'],
        ['sur l’Acropole d’Athènes', 'L’Acropole porte le Parthénon, le temple de la cité d’Athènes.'],
      ),
      gap: ['Les jeux olympiques ont été institués au sanctuaire d’', ' dès 776 av. J.-C.', ['Olympie']],
      ...P.olympie,
      explain: 'Olympie est un grand sanctuaire où tous les Grecs peuvent se retrouver.',
    },
    {
      q: 'Quel dieu est honoré au sanctuaire de Delphes, avec sa prêtresse la Pythie ?',
      a: 'Apollon',
      wrong: wrong(
        ['Mars', 'Mars est un dieu romain, père légendaire de Romulus.'],
        ['Poséidon', 'Poséidon est lié à la mer ; à Delphes, la Pythie sert un autre dieu.'],
        ['Athéna', 'Athéna aide les héros des épopées ; la Pythie est la prêtresse d’un autre dieu.'],
      ),
      gap: ['À Delphes, la Pythie est la prêtresse du dieu ', '.', ['Apollon']],
      ...P.delphes,
      explain: 'Delphes est un sanctuaire panhellénique consacré à Apollon.',
    },
    {
      q: 'D’après Hérodote, qu’est-ce qui rassemble les Grecs ?',
      a: 'un même sang, une même langue et des sanctuaires communs',
      wrong: wrong(
        ['un même roi et une même capitale', 'Les cités sont indépendantes : il n’y a ni roi ni capitale commune.'],
        ['un seul dieu', 'Les Grecs honorent plusieurs dieux.'],
        ['une seule armée permanente', 'Chaque cité a sa propre défense.'],
      ),
      gap: ['Pour Hérodote, les Grecs ont un même sang et une même ', '.', ['langue']],
      ...P.herodote,
      explain: 'La culture commune (langue, dieux, mœurs) fait le monde grec, malgré les cités rivales.',
    },
    {
      q: 'Qu’est-ce qu’un aède dans la Grèce ancienne ?',
      a: 'un poète qui chante souvent lui-même ses œuvres',
      wrong: wrong(
        ['un soldat qui défend les remparts', 'L’aède est un poète, pas un guerrier.'],
        ['un prêtre qui rend les oracles', 'Les oracles sont rendus à Delphes par la Pythie.'],
        ['un athlète des jeux d’Olympie', 'L’aède chante des poèmes : il ne concourt pas comme athlète.'],
      ),
      gap: ['Un poète de la Grèce archaïque qui chante ses œuvres est un ', '.', ['aède', 'aede']],
      ...P.aede,
      explain: 'Les aèdes chantent les exploits des héros : la poésie circule d’abord à l’oral.',
    },
    {
      q: 'À quel alphabet les Grecs empruntent-ils leur écriture, vraisemblablement vers 800 av. J.-C. ?',
      a: 'l’alphabet phénicien',
      wrong: wrong(
        ['l’alphabet latin', 'C’est l’inverse : l’alphabet latin vient plus tard, inspiré du grec.'],
        ['les hiéroglyphes égyptiens', 'Les hiéroglyphes sont des signes égyptiens, pas un alphabet emprunté.'],
        ['l’écriture cunéiforme', 'Le cunéiforme est l’écriture de la Mésopotamie ancienne.'],
      ),
      gap: ['Les Grecs adoptent l’alphabet ', ', puis y ajoutent des voyelles.', ['phénicien', 'phenicien']],
      ...P.alphabet,
      explain: 'Les Grecs adoptent l’alphabet phénicien et y ajoutent les voyelles.',
    },
  ],
  paires3: [
    ['Olympie', 'sanctuaire des jeux olympiques'],
    ['Delphes', 'sanctuaire d’Apollon et de la Pythie'],
    ['Iliade', 'épopée sur le siège de Troie'],
  ],
  paires5: [
    ['Olympie', 'sanctuaire des jeux olympiques'],
    ['Delphes', 'sanctuaire d’Apollon et de la Pythie'],
    ['Iliade', 'dernière année du siège de Troie'],
    ['Odyssée', 'retour d’Ulysse à Ithaque'],
    ['aède', 'poète qui chante ses œuvres'],
  ],
  frise: [
    { ...P.alphabet, label: 'Les Grecs adoptent l’alphabet phénicien', date: 'vers 800 av. J.-C.' },
    { ...P.olympie, label: 'Les jeux olympiques sont institués à Olympie', date: '776 av. J.-C.' },
    { ...P.lois, label: 'L’écrit fait son entrée dans la cité', date: 'vers 650 av. J.-C.' },
    { ...P.pericles, label: 'Athènes au temps de Périclès', date: 'Ve siècle av. J.-C.' },
  ],
  libres: [
    {
      q: 'Dans quel sanctuaire se déroulent les jeux olympiques antiques ?',
      accepted: ['Olympie', 'à Olympie', 'a Olympie'],
      traps: traps(
        ['Delphes', 'Delphes est le sanctuaire d’Apollon et de la Pythie.'],
        ['Athènes', 'Athènes est une cité ; les jeux olympiques sont institués dans un sanctuaire.'],
      ),
      ...P.olympie,
      explain: 'Les jeux sont institués à Olympie.',
    },
    {
      q: 'Comment appelle-t-on la prêtresse d’Apollon à Delphes ? (un mot)',
      accepted: ['Pythie', 'la Pythie'],
      traps: traps(
        ['Athéna', 'Athéna est une déesse, pas la prêtresse de Delphes.'],
        ['aède', 'L’aède est un poète chanteur.'],
      ),
      ...P.delphes,
      explain: 'La prêtresse d’Apollon à Delphes est la Pythie.',
    },
    {
      q: 'Quel poète est présenté comme l’auteur de l’Iliade et de l’Odyssée ?',
      accepted: ['Homère', 'Homere'],
      traps: traps(
        ['Virgile', 'Virgile écrit l’Énéide, en latin, bien plus tard.'],
        ['Hérodote', 'Hérodote est un historien.'],
      ),
      ...P.poemes,
      explain: 'Ces épopées sont attribuées à Homère.',
    },
    {
      q: 'Quel héros de l’Odyssée cherche à rentrer à Ithaque ?',
      accepted: ['Ulysse'],
      traps: traps(
        ['Achille', 'Achille est le grand héros de l’Iliade, le récit de guerre.'],
        ['Énée', 'Énée est un prince troyen, lié à la légende de Rome.'],
      ),
      ...P.ulysse,
      explain: 'L’Odyssée raconte le retour d’Ulysse à Ithaque.',
    },
    {
      q: 'Quelles lettres les Grecs ajoutent-ils à l’alphabet qu’ils empruntent aux Phéniciens ?',
      accepted: ['voyelles', 'les voyelles', 'des voyelles'],
      traps: traps(
        ['consonnes', 'L’alphabet phénicien note déjà des consonnes : la nouveauté est ailleurs.'],
        ['chiffres', 'Les chiffres ne sont pas la nouveauté apportée à l’alphabet.'],
      ),
      ...P.voyelles,
      explain: 'Les Grecs ajoutent les voyelles.',
    },
    {
      q: 'Quel adjectif, qui commence par « pan », qualifie un sanctuaire commun à tous les Grecs ?',
      accepted: ['panhellénique', 'panhellenique', 'panhelléniques', 'panhelleniques'],
      traps: traps(
        ['panathénien', 'Les Panathénées sont la fête de la cité d’Athènes.'],
        ['hellénique', 'Le préfixe « pan » veut dire « tous » : il manque ce préfixe.'],
      ),
      ...P.delphes,
      explain: 'On parle de sanctuaire panhellénique.',
    },
    {
      q: 'Combien d’années le siège de Troie aurait-il duré, d’après le récit ?',
      accepted: ['10', 'dix', '10 ans', 'dix ans'],
      traps: traps(
        ['1', 'L’Iliade raconte la dernière année : le siège entier est bien plus long.'],
        ['100', 'Le récit ne parle pas d’un siège d’un siècle.'],
      ),
      ...P.siege,
      explain: 'Le siège aurait duré dix ans.',
    },
  ],
  docs: [
    {
      title: 'Le récit d’un voyageur à Olympie',
      lines: [
        'J’arrive de ma cité pour les fêtes d’Olympie, dont les jeux existent depuis 776 av. J.-C.',
        'Pendant la fête, une trêve est respectée entre des cités qui sont souvent en conflit.',
        'Pour concourir, il faut prouver que l’on est grec.',
        'Le soir, un aède chante les aventures d’Ulysse.',
      ],
      qs: [
        {
          q: 'Que montre la trêve de la ligne 2 sur le monde grec ?',
          a: 'il est politiquement morcelé en cités qui peuvent se combattre',
          wrong: wrong(
            [
              'il est gouverné par un seul roi',
              'Un monde avec un seul roi n’aurait pas besoin d’une trêve entre cités.',
            ],
            ['il ne connaît jamais de conflits', 'La ligne 2 dit au contraire que les cités sont souvent en conflit.'],
            ['il est dirigé depuis Troie', 'Le récit ne parle pas de Troie comme capitale.'],
          ),
          ...P.treves,
          explain: 'On fait une trêve parce que les cités sont indépendantes et rivales.',
        },
        {
          q: 'D’après la ligne 3, que prouve le fait d’être admis à concourir ?',
          a: 'que l’on appartient au monde grec',
          wrong: wrong(
            [
              'que l’on est le citoyen le plus riche',
              'La ligne 3 parle d’appartenance au monde grec, pas de richesse.',
            ],
            ['que l’on est le roi de sa cité', 'La ligne 3 ne parle pas de roi.'],
            ['que l’on sait écrire', 'La ligne 3 ne parle pas d’écriture.'],
          ),
          ...P.concourir,
          explain: 'Être admis à concourir prouve la « grécité », c’est-à-dire l’appartenance aux Grecs.',
        },
        {
          q: 'Quelle épopée l’aède de la ligne 4 chante-t-il ?',
          a: 'l’Odyssée',
          wrong: wrong(
            [
              'l’Iliade',
              'L’Iliade raconte la fin du siège de Troie ; les aventures d’Ulysse forment une autre épopée.',
            ],
            ['l’Énéide', 'L’Énéide raconte une légende latine, écrite par Virgile.'],
            ['l’Épopée de Guilgamesh', 'Cette épopée est mésopotamienne.'],
          ),
          ...P.ulysse,
          explain: 'Les aventures d’Ulysse qui rentre à Ithaque forment l’Odyssée.',
        },
        {
          q: 'D’après la ligne 4, comment ces récits peuvent-ils circuler ?',
          a: 'à l’oral, chantés par des poètes',
          wrong: wrong(
            ['seulement dans des journaux', 'Les journaux n’existent pas dans l’Antiquité.'],
            ['seulement par la radio', 'La radio est une invention récente.'],
            ['gravés sur des écrans', 'Les écrans n’existent pas dans l’Antiquité.'],
          ),
          ...P.oral,
          explain: 'Les poèmes homériques ont leur origine dans la tradition orale.',
        },
      ],
    },
    {
      title: 'Deux cités, une même culture',
      lines: [
        'Deux jeunes Grecs viennent de cités rivales.',
        'Tous deux parlent grec et connaissent les récits de l’Iliade.',
        'Ils se retrouvent au sanctuaire de Delphes, où la Pythie sert Apollon.',
        'De retour chez eux, chacun obéit aux lois de sa cité.',
      ],
      qs: [
        {
          q: 'Quel élément des lignes 1 et 4 montre que le monde grec est morcelé ?',
          a: 'chaque jeune Grec dépend d’une cité qui a ses propres lois',
          wrong: wrong(
            [
              'les deux jeunes parlent la même langue',
              'La langue commune rapproche les Grecs : elle ne les divise pas.',
            ],
            ['ils connaissent les mêmes récits', 'Les récits communs unissent les Grecs.'],
            ['ils vont au même sanctuaire', 'Le sanctuaire commun rassemble les Grecs.'],
          ),
          ...P.rivales,
          explain: 'Les cités sont distinctes et rivales : chacune a ses lois.',
        },
        {
          q: 'Quel lieu de la ligne 3 est un sanctuaire commun aux Grecs ?',
          a: 'Delphes',
          wrong: wrong(
            ['Olympie', 'Olympie n’est pas cité dans ce texte : la Pythie sert à Delphes.'],
            ['Troie', 'Troie est la ville de l’Iliade.'],
            ['Ithaque', 'Ithaque est l’île d’Ulysse, pas le lieu de ce texte.'],
          ),
          ...P.delphes,
          explain: 'La ligne 3 nomme Delphes et la Pythie, prêtresse d’Apollon.',
        },
        {
          q: 'Quelle idée résume le mieux ce texte ?',
          a: 'des cités rivales partagent une même culture',
          wrong: wrong(
            ['les Grecs forment un seul État', 'La ligne 4 montre que chaque cité garde ses lois.'],
            ['les Grecs n’ont rien en commun', 'La ligne 2 cite une langue et des récits communs.'],
            ['les cités rivales ont des dieux sans aucun lien', 'La ligne 3 montre un sanctuaire partagé.'],
          ),
          ...P.herodote,
          explain: 'Langue, récits et sanctuaires communs unissent des Grecs de cités différentes.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : Rome du mythe à l'histoire ———

const rome: Notion = {
  id: 'h6-rome-mythe-histoire',
  title: 'Rome, du mythe à l’histoire',
  hint: 'Demande-toi toujours si l’information vient d’une légende ou des fouilles des archéologues.',
  memo: [
    'Un **mythe** raconte des faits imaginaires transmis par la tradition ; la **légende** de Rome dit que Romulus, fils du dieu Mars, fonde la ville le 21 avril 753 av. J.-C. et tue son frère jumeau Rémus.',
    'Un autre récit rattache Rome au prince troyen Énée, que Virgile met en scène dans l’**Énéide**.',
    'L’**archéologie** montre que le site de Rome est peuplé dès le Xe siècle av. J.-C. et se transforme au VIIIe siècle : on compare les récits aux traces.',
  ],
  faits: [
    {
      q: 'Selon la légende, qui fonde la ville de Rome ?',
      a: 'Romulus',
      wrong: wrong(
        ['Rémus', 'Rémus est le frère jumeau de Romulus : dans la légende, il est tué.'],
        ['Virgile', 'Virgile est le poète qui écrit l’Énéide, pas un fondateur de la légende.'],
        ['Ulysse', 'Ulysse est le héros grec de l’Odyssée.'],
      ),
      gap: ['Selon la légende, ', ', fils du dieu Mars, fonde Rome.', ['Romulus']],
      ...P.romulus,
      explain: 'Romulus, fils du dieu Mars, est le fondateur légendaire de Rome.',
    },
    {
      q: 'De quel dieu Romulus est-il le fils, selon la légende ?',
      a: 'Mars',
      wrong: wrong(
        ['Apollon', 'Apollon est honoré à Delphes par les Grecs.'],
        ['Zeus', 'Zeus est le roi des dieux grecs ; le récit romain nomme un autre père.'],
        ['Poséidon', 'Poséidon est le dieu de la mer chez les Grecs.'],
      ),
      gap: ['Dans la légende, Romulus est le fils du dieu ', '.', ['Mars']],
      ...P.romulus,
      explain: 'Le récit fait de Romulus le fils du dieu Mars : c’est une croyance, pas un fait attesté.',
    },
    {
      q: 'Selon la légende, à quelle date Romulus fonde-t-il Rome ?',
      a: 'le 21 avril 753 av. J.-C.',
      wrong: wrong(
        ['en 476 apr. J.-C.', 'Cette date est bien postérieure : elle n’appartient pas à la légende de fondation.'],
        ['en 212 apr. J.-C.', '212 est la date de l’édit de Caracalla sur la citoyenneté.'],
        ['en 587 av. J.-C.', '587 av. J.-C. est la prise de Jérusalem par les Babyloniens.'],
      ),
      gap: ['La légende place la fondation de Rome en ', ' av. J.-C.', ['753']],
      ...P.date753,
      explain: 'La date de 753 av. J.-C. vient de la légende.',
    },
    {
      q: 'Dans la légende, qui est le frère jumeau tué par Romulus ?',
      a: 'Rémus',
      wrong: wrong(
        ['Énée', 'Énée est un prince troyen, héros d’un autre récit de fondation.'],
        ['Auguste', 'Auguste est un dirigeant romain bien réel, de l’époque de Tite-Live.'],
        ['Tite-Live', 'Tite-Live est l’historien qui rapporte la légende.'],
      ),
      gap: ['Romulus tue son frère jumeau ', '.', ['Rémus', 'Remus']],
      ...P.remus,
      explain: 'Le récit légendaire oppose les deux jumeaux.',
    },
    {
      q: 'Quel prince troyen est au cœur de l’autre récit sur l’origine de Rome ?',
      a: 'Énée',
      wrong: wrong(
        ['Ulysse', 'Ulysse est un héros grec, pas un prince troyen.'],
        ['Achille', 'Achille combat du côté des Grecs dans l’Iliade.'],
        ['Romulus', 'Romulus appartient à l’autre légende, celle de la fondation par les jumeaux.'],
      ),
      gap: ['Un récit fait descendre Rome du prince troyen ', '.', ['Énée', 'Enée', 'Enee']],
      ...P.enee,
      explain: 'La descendance d’Énée relie Rome à Troie.',
    },
    {
      q: 'Quel poète romain met la légende d’Énée en scène dans l’Énéide ?',
      a: 'Virgile',
      wrong: wrong(
        ['Homère', 'Homère est le poète grec de l’Iliade et de l’Odyssée.'],
        ['Hellanicos de Mytilène', 'Hellanicos est un Grec qui rapporte ce récit, mais pas dans l’Énéide.'],
        ['Tite-Live', 'Tite-Live écrit une histoire de Rome, pas l’Énéide.'],
      ),
      gap: ['L’Énéide est une œuvre de ', '.', ['Virgile']],
      ...P.virgile,
      explain: 'Virgile fait du récit d’Énée un motif littéraire célèbre.',
    },
    {
      q: 'Que montrent les archéologues sur le site de Rome ?',
      a: 'il est peuplé dès le Xe siècle av. J.-C.',
      wrong: wrong(
        ['il était désert jusqu’à l’an 1', 'L’archéologie indique un peuplement bien plus ancien.'],
        ['il est fondé après l’an 476', 'Le site est habité bien avant cette date.'],
        ['il n’a jamais été habité avant 753 av. J.-C.', 'Des habitants sont déjà là avant la date de la légende.'],
      ),
      gap: ['L’archéologie montre un peuplement du site de Rome dès le ', ' siècle av. J.-C.', ['Xe', 'X', '10e']],
      ...P.peuplement,
      explain: 'Les fouilles montrent des habitants avant la date légendaire.',
    },
    {
      q: 'Comment l’historien romain Tite-Live présente-t-il la légende de Romulus ?',
      a: 'avec un scepticisme non dissimulé',
      wrong: wrong(
        ['comme un fait prouvé', 'Tite-Live n’est pas lui-même convaincu de la véracité de la légende.'],
        ['sans jamais en parler', 'Tite-Live rapporte bien la légende.'],
        ['comme un récit grec sans rapport avec Rome', 'La légende concerne la fondation de Rome.'],
      ),
      gap: ['Tite-Live rapporte la légende de Romulus avec un ', ' non dissimulé.', ['scepticisme', 'doute']],
      ...P.titeLive,
      explain: 'Même un auteur antique doute : cela invite à distinguer légende et histoire.',
    },
  ],
  paires3: [
    ['Romulus', 'fondateur de Rome selon la légende'],
    ['Virgile', 'auteur de l’Énéide'],
    ['Tite-Live', 'historien qui doute de la légende'],
  ],
  paires5: [
    ['Romulus', 'fils du dieu Mars selon la légende'],
    ['Rémus', 'frère jumeau tué dans le récit'],
    ['Énée', 'prince troyen lié à l’origine de Rome'],
    ['Virgile', 'auteur de l’Énéide'],
    ['archéologues', 'ceux qui étudient les traces du site'],
  ],
  frise: [
    { ...P.peuplement, label: 'Premiers habitants attestés sur le site de Rome', date: 'dès le Xe siècle av. J.-C.' },
    { ...P.date753, label: 'Fondation de Rome selon la légende', date: '753 av. J.-C.' },
    { ...P.hellanicos, label: 'Hellanicos raconte l’origine troyenne de Rome', date: 'Ve siècle av. J.-C.' },
    { ...P.titeLive, label: 'Tite-Live rapporte la légende de Romulus', date: 'époque d’Auguste' },
    { ...P.muraille, label: 'Une muraille ancienne est découverte par un archéologue', date: '1988' },
  ],
  libres: [
    {
      q: 'Comment s’appelle le fondateur de Rome selon la légende ?',
      accepted: ['Romulus'],
      traps: traps(
        ['Rémus', 'Rémus est le jumeau tué dans la légende.'],
        ['Énée', 'Énée est le prince troyen d’un autre récit.'],
      ),
      ...P.romulus,
      explain: 'C’est Romulus.',
    },
    {
      q: 'En quelle année avant J.-C. la légende place-t-elle la fondation de Rome ?',
      accepted: ['753', '753 av. J.-C.', '753 avant J.-C.'],
      traps: traps(
        ['776', '776 av. J.-C. est la date des jeux olympiques à Olympie.'],
        ['587', '587 av. J.-C. est la prise de Jérusalem.'],
      ),
      ...P.date753,
      explain: 'La légende donne l’année 753 av. J.-C.',
    },
    {
      q: 'Comment s’appelle le récit imaginaire, transmis par la tradition, à ne pas confondre avec l’histoire ? (un mot)',
      accepted: ['mythe', 'un mythe', 'le mythe', 'légende', 'une légende', 'la légende', 'legende'],
      traps: traps(
        ['archéologie', 'L’archéologie étudie des traces réelles.'],
        ['chronologie', 'La chronologie range les événements dans le temps.'],
      ),
      ...P.mythe,
      explain: 'C’est un mythe (ou une légende).',
    },
    {
      q: 'Quel animal, selon la légende, abrite et nourrit les jumeaux Romulus et Rémus ?',
      accepted: ['louve', 'la louve', 'une louve'],
      traps: traps(
        ['aigle', 'L’aigle est un symbole romain, mais la légende parle d’un autre animal.'],
        ['ourse', 'La légende des jumeaux ne parle pas d’une ourse.'],
      ),
      ...P.louve,
      explain: 'La légende parle d’une louve.',
    },
    {
      q: 'Comment s’appelle le poème de Virgile qui raconte l’histoire d’Énée ?',
      accepted: ['Énéide', 'l’Énéide', 'Eneide', 'l’Eneide'],
      traps: traps(
        ['Iliade', 'L’Iliade est l’épopée grecque attribuée à Homère.'],
        ['Odyssée', 'L’Odyssée raconte le retour d’Ulysse.'],
      ),
      ...P.virgile,
      explain: 'C’est l’Énéide.',
    },
    {
      q: 'Quelle science, à partir de fouilles, permet de vérifier les récits sur les origines ? (un mot)',
      accepted: ['archéologie', 'l’archéologie', 'archeologie', 'l’archeologie'],
      traps: traps(
        ['mythologie', 'La mythologie étudie les mythes, pas les traces du sol.'],
        ['poésie', 'La poésie raconte : elle ne fouille pas le sol.'],
      ),
      ...P.recits,
      explain: 'L’archéologie apporte des traces à confronter aux récits.',
    },
  ],
  docs: [
    {
      title: 'La fiche d’une élève sur les débuts de Rome',
      lines: [
        'Récit : la louve aurait nourri les jumeaux Romulus et Rémus.',
        'Récit : Romulus fonde la ville le 21 avril 753 av. J.-C.',
        'Fouilles : des habitants sont présents sur le site dès le Xe siècle av. J.-C.',
        'Fouilles : le site se transforme beaucoup au VIIIe siècle av. J.-C.',
      ],
      qs: [
        {
          q: 'Quelles lignes rapportent des informations venant de l’archéologie ?',
          a: 'les lignes 3 et 4',
          wrong: wrong(
            ['les lignes 1 et 2', 'Ces lignes commencent par « Récit » : elles viennent de la légende.'],
            ['la ligne 1 seulement', 'La ligne 1 raconte la louve : c’est la légende.'],
            ['les lignes 1 et 3', 'La ligne 1 est un récit légendaire.'],
          ),
          ...P.peuplement,
          explain: 'Les lignes marquées « Fouilles » viennent des traces étudiées par les archéologues.',
        },
        {
          q: 'D’après les fouilles, que peut-on dire de la fondation de 753 av. J.-C. ?',
          a: 'des habitants étaient déjà là bien avant cette date',
          wrong: wrong(
            [
              'les fouilles prouvent que Romulus a fondé la ville ce jour-là',
              'La date précise vient de la légende : les fouilles ne la prouvent pas.',
            ],
            ['le site était désert avant 753 av. J.-C.', 'La ligne 3 montre un peuplement plus ancien.'],
            ['Rome est fondée par une louve', 'La louve appartient au récit légendaire.'],
          ),
          ...P.peuplement,
          explain: 'La ligne 3 situe des habitants au Xe siècle av. J.-C., avant la date de la légende.',
        },
        {
          q: 'Pourquoi la ligne 1 ne peut-elle pas être prise comme un fait historique ?',
          a: 'c’est un récit légendaire, à distinguer des traces étudiées',
          wrong: wrong(
            ['les louves n’ont jamais existé', 'Les louves existent ; c’est le récit qui n’est pas un fait attesté.'],
            ['il est daté trop précisément', 'La ligne 1 ne donne pas de date.'],
            ['il vient des archéologues', 'La ligne 1 commence par « Récit », pas par « Fouilles ».'],
          ),
          ...P.mythe,
          explain: 'Un récit transmis par la tradition n’est pas une preuve : on le compare aux traces.',
        },
        {
          q: 'Quel changement les fouilles montrent-elles au VIIIe siècle av. J.-C. ?',
          a: 'une transformation importante du site',
          wrong: wrong(
            ['la disparition de tous les habitants', 'La ligne 4 parle d’une transformation, pas d’un abandon.'],
            ['la naissance de Virgile', 'Virgile n’est pas un résultat de fouilles.'],
            ['le début de l’Empire romain', 'L’Empire commence bien plus tard.'],
          ),
          ...P.peuplement,
          explain: 'La ligne 4 indique une transformation importante.',
        },
      ],
    },
    {
      title: 'Pourquoi raconter ces origines ?',
      lines: [
        'Les Romains aiment se rattacher au prince troyen Énée.',
        'Ce récit relie Rome au monde de l’Iliade, célèbre chez les Grecs.',
        'Il permet à Rome de se présenter comme héritière légitime de la puissance grecque.',
        'La légende des jumeaux annonce aussi la future grandeur de la ville.',
      ],
      qs: [
        {
          q: 'D’après le texte, à quoi sert le récit d’Énée pour Rome ?',
          a: 'à se présenter comme héritière légitime de la puissance grecque',
          wrong: wrong(
            [
              'à prouver que Rome n’a pas d’histoire',
              'Le texte montre au contraire que Rome veut un passé prestigieux.',
            ],
            ['à effacer tout lien avec les Grecs', 'La ligne 2 crée un lien avec le monde grec.'],
            ['à fixer le calendrier des jeux olympiques', 'Les jeux olympiques ne sont pas en question ici.'],
          ),
          ...P.heritiers,
          explain: 'Le récit sert la fierté et le pouvoir de Rome.',
        },
        {
          q: 'Quel autre rôle la ligne 4 donne-t-elle à la légende des jumeaux ?',
          a: 'glorifier l’avenir de la ville de Rome',
          wrong: wrong(
            ['décrire des fouilles archéologiques', 'Les fouilles ne sont pas un récit légendaire.'],
            ['prouver une date par des mesures', 'Aucune mesure ne figure dans le texte.'],
            ['raconter la vie quotidienne', 'La ligne 4 parle de grandeur, pas de quotidien.'],
          ),
          ...P.glorification,
          explain: 'Le récit annonce la domination de Rome sur le monde méditerranéen.',
        },
        {
          q: 'Comment peut-on comprendre la fonction politique de ces récits ?',
          a: 'ils aident Rome à justifier sa domination',
          wrong: wrong(
            ['ils remplacent les fouilles des archéologues', 'Un récit ne remplace pas les traces.'],
            ['ils empêchent Rome de dominer d’autres peuples', 'Ils servent au contraire sa puissance.'],
            ['ils ne servent qu’à amuser les enfants', 'La question du programme porte sur la domination de Rome.'],
          ),
          ...P.dominer,
          explain: 'Le mythe de fondation permet à Rome d’asseoir sa domination.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : la naissance du monothéisme juif ———

const monotheisme: Notion = {
  id: 'h6-monotheisme-juif',
  title: 'La naissance du monothéisme juif',
  hint: 'Sépare ce que disent les textes religieux de ce que les historiens et les archéologues peuvent établir.',
  memo: [
    'Dans un monde **polythéiste**, où l’on honore plusieurs dieux, les Hébreux en viennent au **monothéisme**, la croyance en un seul dieu.',
    'Les historiens situent ce passage de la **monolâtrie** au monothéisme au moment de l’**exil** à Babylone, après la prise de Jérusalem en 587 av. J.-C. ; le retour a lieu en 538 av. J.-C.',
    'La **Bible** hébraïque est rédigée au Ier millénaire av. J.-C. ; son cœur est la **Torah** : les croyants y voient une parole sacrée, les historiens étudient sa rédaction.',
  ],
  faits: [
    {
      q: 'Qu’est-ce que le monothéisme ?',
      a: 'la croyance en un seul dieu créateur du monde',
      wrong: wrong(
        ['la croyance en plusieurs dieux', 'C’est la définition du polythéisme.'],
        [
          'adorer un dieu sans nier que d’autres existent',
          'C’est la monolâtrie : d’autres dieux sont alors jugés réels.',
        ],
        ['l’absence de toute croyance', 'Le monothéisme est une croyance religieuse.'],
      ),
      gap: ['Croire qu’il n’existe qu’un seul dieu, c’est le ', '.', ['monothéisme', 'monotheisme']],
      ...P.monotheisme,
      explain: '« Mono » signifie un seul : un seul dieu.',
    },
    {
      q: 'Qu’est-ce que le polythéisme ?',
      a: 'une religion qui admet plusieurs dieux',
      wrong: wrong(
        ['une religion avec un seul dieu', 'C’est le monothéisme.'],
        ['un livre sacré', 'Le polythéisme est une croyance, pas un livre.'],
        ['un bâtiment pour prier', 'Le mot désigne une croyance en plusieurs dieux.'],
      ),
      gap: ['Admettre l’existence de plusieurs dieux, c’est le ', '.', ['polythéisme', 'polytheisme']],
      ...P.polytheisme,
      explain: '« Poly » signifie plusieurs.',
    },
    {
      q: 'Qu’est-ce que la monolâtrie ?',
      a: 'adorer un seul dieu sans nier l’existence d’autres dieux',
      wrong: wrong(
        ['croire qu’un seul dieu existe', 'C’est le monothéisme : on nie alors les autres dieux.'],
        ['honorer tous les dieux à égalité', 'La monolâtrie préfère un dieu aux autres.'],
        ['ne croire en aucun dieu', 'La monolâtrie est une forme de culte.'],
      ),
      gap: ['Adorer un seul dieu sans nier les autres, c’est la ', '.', ['monolâtrie', 'monolatrie']],
      ...P.monolatrie,
      explain: 'La monolâtrie précède le monothéisme chez les Hébreux, selon les historiens.',
    },
    {
      q: 'Selon les historiens, à quel moment les Hébreux passent-ils au monothéisme ?',
      a: 'au moment de l’exil à Babylone',
      wrong: wrong(
        ['au moment de la fondation de Rome', 'La fondation légendaire de Rome n’a pas de lien avec ce passage.'],
        ['pendant les jeux olympiques', 'Les jeux sont une fête grecque.'],
        ['à l’époque des premiers outils', 'Ce passage a lieu au Ier millénaire av. J.-C., bien plus tard.'],
      ),
      gap: ['Les Hébreux passent au monothéisme au moment de l’exil à ', '.', ['Babylone']],
      ...P.passage,
      explain: 'L’exil à Babylone suit une défaite du royaume de Juda.',
    },
    {
      q: 'En quelle année les Babyloniens prennent-ils Jérusalem ?',
      a: 'en 587 av. J.-C.',
      wrong: wrong(
        ['en 753 av. J.-C.', '753 av. J.-C. est la date légendaire de la fondation de Rome.'],
        ['en 776 av. J.-C.', '776 av. J.-C. est la date des jeux olympiques à Olympie.'],
        ['en 538 av. J.-C.', '538 av. J.-C. est la date du retour à Jérusalem.'],
      ),
      gap: ['Les Babyloniens prennent Jérusalem en ', ' av. J.-C.', ['587']],
      ...P.prise,
      explain: 'La prise de 587 av. J.-C. ouvre l’exil ; le retour a lieu en 538 av. J.-C.',
    },
    {
      q: 'Que désigne la Torah au sens des cinq premiers livres ?',
      a: 'le Pentateuque',
      wrong: wrong(
        ['l’Odyssée', 'L’Odyssée est une épopée grecque.'],
        ['l’Énéide', 'L’Énéide est un poème latin de Virgile.'],
        ['les Prophètes', 'Les Prophètes (Neviim) forment une autre partie de la Bible hébraïque.'],
      ),
      gap: ['La Torah désigne les cinq livres du ', '.', ['Pentateuque']],
      ...P.torah,
      explain: 'La Torah correspond aux cinq livres du Pentateuque.',
    },
    {
      q: 'Quand les livres de la Bible hébraïque ont-ils été rédigés ?',
      a: 'au Ier millénaire av. J.-C.',
      wrong: wrong(
        ['avant l’invention de l’écriture', 'Un livre ne peut pas être rédigé avant l’écriture.'],
        ['au Moyen Âge', 'Les livres existent bien avant le Moyen Âge.'],
        ['au XXe siècle', '1947 est l’année de la découverte de manuscrits, pas de leur rédaction.'],
      ),
      gap: ['La Bible hébraïque est rédigée au ', ' millénaire av. J.-C.', ['Ier', '1er', 'premier']],
      ...P.redaction,
      explain: 'Les historiens datent la rédaction au Ier millénaire av. J.-C.',
    },
    {
      q: 'D’après l’archéologie, quels royaumes des Hébreux sont attestés ?',
      a: 'les royaumes d’Israël et de Juda',
      wrong: wrong(
        ['les royaumes d’Athènes et de Sparte', 'Athènes et Sparte sont des cités grecques.'],
        ['les royaumes de Troie et d’Ithaque', 'Ce sont des lieux des épopées grecques.'],
        ['les royaumes de Rome et de Carthage', 'Rome n’est pas un royaume des Hébreux.'],
      ),
      gap: ['L’archéologie confirme les royaumes d’Israël et de ', '.', ['Juda']],
      ...P.royaumes,
      explain: 'Les fouilles confirment l’existence de ces deux royaumes.',
    },
  ],
  paires3: [
    ['monothéisme', 'croyance en un seul dieu'],
    ['polythéisme', 'croyance en plusieurs dieux'],
    ['Torah', 'les cinq livres du Pentateuque'],
  ],
  paires5: [
    ['monothéisme', 'un seul dieu existe'],
    ['polythéisme', 'plusieurs dieux existent'],
    ['monolâtrie', 'un dieu préféré sans nier les autres'],
    ['exil à Babylone', 'déportation des élites de Juda'],
    ['538 av. J.-C.', 'retour à Jérusalem'],
  ],
  frise: [
    { ...P.royaumes, label: 'Royaumes d’Israël et de Juda attestés par l’archéologie', date: 'VIIIe siècle av. J.-C.' },
    { ...P.prise, label: 'Prise de Jérusalem par les Babyloniens', date: '587 av. J.-C.' },
    { ...P.prise, label: 'Retour à Jérusalem', date: '538 av. J.-C.' },
    { ...P.qumran, label: 'Date d’un manuscrit du livre de Samuel trouvé à Qumran', date: '3e siècle av. J.-C.' },
  ],
  libres: [
    {
      q: 'Comment appelle-t-on la croyance en un seul dieu ? (un mot)',
      accepted: ['monothéisme', 'le monothéisme', 'monotheisme'],
      traps: traps(
        ['polythéisme', 'Le polythéisme admet plusieurs dieux.'],
        ['monolâtrie', 'La monolâtrie ne nie pas l’existence d’autres dieux.'],
      ),
      ...P.monotheisme,
      explain: 'C’est le monothéisme.',
    },
    {
      q: 'Vers quelle ville les élites du royaume de Juda sont-elles déportées ?',
      accepted: ['Babylone', 'à Babylone'],
      traps: traps(
        ['Rome', 'Rome n’est pas la destination de cet exil.'],
        ['Jérusalem', 'Jérusalem est la ville quittée, puis retrouvée.'],
      ),
      ...P.passage,
      explain: 'L’exil a lieu à Babylone.',
    },
    {
      q: 'En quelle année avant J.-C. a lieu le retour à Jérusalem ?',
      accepted: ['538', '538 av. J.-C.', '538 avant J.-C.'],
      traps: traps(
        ['587', '587 av. J.-C. est la prise de la ville.'],
        ['753', '753 av. J.-C. est la date légendaire de Rome.'],
      ),
      ...P.prise,
      explain: 'Le retour est daté de 538 av. J.-C.',
    },
    {
      q: 'Comment s’appelle, en un mot, l’enseignement écrit au cœur du judaïsme, qui désigne les cinq livres du Pentateuque ?',
      accepted: ['Torah', 'la Torah', 'Thora', 'la Thora'],
      traps: traps(
        ['Talmud', 'Le Talmud est le commentaire transmis à l’oral, puis mis par écrit.'],
        ['Iliade', 'L’Iliade est une épopée grecque.'],
      ),
      ...P.torah,
      explain: 'C’est la Torah.',
    },
    {
      q: 'Selon le récit biblique, à qui les « Dix Paroles » sont-elles révélées sur le mont Sinaï ?',
      accepted: ['Moïse', 'à Moïse', 'Moise'],
      traps: traps(
        ['Noé', 'Noé est lié au récit du déluge dans la Genèse.'],
        ['Romulus', 'Romulus appartient à la légende de Rome.'],
      ),
      ...P.tables,
      explain: 'Dans le récit biblique, il s’agit de Moïse.',
    },
    {
      q: 'Comment appelle-t-on une religion qui admet plusieurs dieux ? (un mot)',
      accepted: ['polythéisme', 'le polythéisme', 'polytheisme'],
      traps: traps(
        ['monothéisme', 'Le monothéisme ne reconnaît qu’un seul dieu.'],
        ['judaïsme', 'Le judaïsme est monothéiste.'],
      ),
      ...P.polytheisme,
      explain: 'C’est le polythéisme.',
    },
  ],
  docs: [
    {
      title: 'Le texte et les traces',
      lines: [
        'Selon le récit biblique, Moïse reçoit les « Dix Paroles » sur le mont Sinaï.',
        'La tradition croyante attribue à Moïse la rédaction du Pentateuque.',
        'Les historiens datent ce texte de plusieurs siècles plus tard.',
        'Le plus ancien manuscrit d’un livre de la Bible hébraïque, découvert à Qumran, date du 3e siècle av. J.-C.',
      ],
      qs: [
        {
          q: 'Quelle ligne exprime une croyance rapportée par un récit religieux ?',
          a: 'la ligne 1',
          wrong: wrong(
            ['la ligne 3', 'La ligne 3 présente le travail des historiens.'],
            ['la ligne 4', 'La ligne 4 décrit un manuscrit daté.'],
            ['aucune ligne', 'La ligne 1 commence par « Selon le récit biblique ».'],
          ),
          ...P.tables,
          explain: 'La ligne 1 est annoncée comme un récit : c’est une croyance.',
        },
        {
          q: 'Qu’affirment les historiens d’après la ligne 3, face à la tradition de la ligne 2 ?',
          a: 'que la rédaction est plus tardive que ne le dit la tradition',
          wrong: wrong(
            ['que le Pentateuque n’a jamais été écrit', 'Le texte existe : c’est sa date que l’on discute.'],
            ['que Moïse est l’auteur sans aucun doute', 'La ligne 3 propose au contraire une date plus tardive.'],
            ['que le texte est écrit au XXe siècle', '1947 concerne une découverte, pas la rédaction.'],
          ),
          ...P.moise,
          explain: 'Les historiens rajeunissent la rédaction de plusieurs siècles.',
        },
        {
          q: 'À quoi sert le manuscrit de la ligne 4 pour l’historien ?',
          a: 'c’est une trace matérielle que l’on peut dater',
          wrong: wrong(
            [
              'il prouve tous les récits de la Bible',
              'Un manuscrit montre qu’un texte existe, pas que tout est un fait.',
            ],
            ['il remplace le travail des archéologues', 'Il est lui-même une trace étudiée.'],
            ['il montre que le texte est un poème grec', 'Il s’agit d’un livre de la Bible hébraïque.'],
          ),
          ...P.qumran,
          explain: 'Un manuscrit daté est une preuve matérielle de l’existence d’un texte.',
        },
        {
          q: 'Pourquoi comparer ces textes à des découvertes archéologiques ?',
          a: 'pour distinguer ce qui relève des croyances et ce qui est attesté',
          wrong: wrong(
            ['pour interdire de lire les récits', 'L’histoire étudie les récits, elle ne les interdit pas.'],
            ['pour remplacer les récits par des légendes', 'L’objectif est de vérifier avec des traces.'],
            ['parce que les textes sont tous faux', 'On ne juge pas les croyances : on distingue récit et preuves.'],
          ),
          ...P.recits,
          explain: 'On confronte les récits aux découvertes pour savoir ce que l’histoire peut établir.',
        },
      ],
    },
    {
      title: 'Les grandes dates d’un exil',
      lines: [
        '587 av. J.-C. : les Babyloniens prennent Jérusalem.',
        'Des élites du royaume de Juda sont déportées à Babylone.',
        'Pendant cette époque, selon les historiens, le culte d’un dieu préféré devient la croyance en un dieu unique.',
        '538 av. J.-C. : retour à Jérusalem.',
      ],
      qs: [
        {
          q: 'Combien d’années séparent la prise de Jérusalem du retour ?',
          a: '49 ans',
          wrong: wrong(
            ['1 125 ans', 'Il ne faut pas additionner les deux dates : on les soustrait.'],
            ['538 ans', 'C’est la date du retour, pas une durée.'],
            ['59 ans', 'La soustraction 587 − 538 donne un autre résultat.'],
          ),
          ...P.prise,
          explain: 'Avant J.-C., on soustrait la plus petite date de la plus grande : 587 − 538 = 49.',
        },
        {
          q: 'Quel changement la ligne 3 décrit-elle ?',
          a: 'le passage de la monolâtrie au monothéisme',
          wrong: wrong(
            ['le passage du monothéisme au polythéisme', 'La ligne 3 va vers un dieu unique, pas vers plusieurs.'],
            ['l’invention des jeux olympiques', 'Les jeux sont grecs et ne sont pas en question.'],
            ['la fondation de Rome', 'Rome n’est pas citée dans le texte.'],
          ),
          ...P.passage,
          explain: 'Préférer un dieu (monolâtrie) puis n’en reconnaître qu’un (monothéisme).',
        },
        {
          q: 'Dans quel environnement religieux ce monothéisme apparaît-il ?',
          a: 'un monde polythéiste',
          wrong: wrong(
            ['un monde où personne n’a de religion', 'Les peuples de cette époque ont des croyances.'],
            ['un monde où un seul dieu est honoré partout', 'Le monde voisin honore plusieurs dieux.'],
            ['un monde sans écriture', 'L’écriture existe déjà.'],
          ),
          ...P.contexte,
          explain: 'Le programme étudie la naissance du monothéisme juif dans un monde polythéiste.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : la citoyenneté à Athènes et à Rome ———

const citoyennete: Notion = {
  id: 'h6-citoyennete-athenes-rome',
  title: 'La citoyenneté à Athènes et à Rome',
  hint: 'Demande-toi qui peut participer, qui est exclu, et si l’on parle d’Athènes ou de Rome.',
  memo: [
    'La **citoyenneté** est une invention des cités grecques : le citoyen a le droit de participer aux affaires publiques. À Athènes, la **démocratie** ne concerne qu’une minorité : les femmes, les esclaves et les **métèques** en sont exclus.',
    'Le citoyen athénien participe à la vie politique, défend la cité et prend part à la religion civique, comme à la fête des **Panathénées**.',
    'À Rome, sous la République, des **consuls** élus et le **sénat** dirigent, tandis que la **plèbe** a ses **tribuns** ; Rome étend peu à peu le **droit de cité** : en 212 apr. J.-C., l’édit de Caracalla le donne aux habitants de l’empire.',
  ],
  faits: [
    {
      q: 'Qui invente la qualité de citoyen, dans l’Antiquité ?',
      a: 'les cités grecques',
      wrong: wrong(
        ['les pharaons d’Égypte', 'Le pharaon est un souverain absolu, sans citoyens.'],
        ['les Babyloniens', 'La citoyenneté vient des cités grecques.'],
        ['les chasseurs de la préhistoire', 'La citoyenneté suppose une cité organisée.'],
      ),
      gap: ['La qualité de citoyen est une invention des cités ', '.', ['grecques']],
      ...P.invention,
      explain: 'La citoyenneté naît dans les cités grecques.',
    },
    {
      q: 'Quel droit essentiel le citoyen grec possède-t-il ?',
      a: 'participer à la gestion des affaires publiques',
      wrong: wrong(
        ['gouverner seul, sans les autres', 'Les citoyens décident ensemble, à égalité.'],
        ['ne jamais défendre la cité', 'Défendre la cité fait partie du rôle du citoyen athénien.'],
        ['commander tous les dieux', 'La citoyenneté est un droit politique, pas un pouvoir sur les dieux.'],
      ),
      gap: ['Le citoyen a le droit de participer à la gestion des ', ' publiques.', ['affaires']],
      ...P.droit,
      explain: 'Le citoyen prend part aux décisions de la cité.',
    },
    {
      q: 'À Athènes, qui est exclu de la citoyenneté ?',
      a: 'les femmes, les esclaves et les métèques',
      wrong: wrong(
        ['tous les hommes libres athéniens', 'Les citoyens sont justement des hommes libres.'],
        ['les citoyens qui votent', 'Voter est un droit du citoyen.'],
        ['seulement les soldats', 'Défendre la cité fait partie de la citoyenneté.'],
      ),
      gap: [
        'À Athènes, les femmes, les esclaves et les ',
        ' ne sont pas citoyens.',
        ['métèques', 'metèques', 'meteques'],
      ],
      ...P.exclus,
      explain: 'La citoyenneté athénienne ne concerne qu’une partie des habitants.',
    },
    {
      q: 'Qu’est-ce qu’un métèque à Athènes ?',
      a: 'un étranger installé dans la cité, sans la citoyenneté',
      wrong: wrong(
        ['un magistrat élu pour un an', 'C’est le rôle d’un consul à Rome.'],
        ['un soldat de l’armée romaine', 'Le métèque vit dans une cité grecque et n’est pas défini par l’armée.'],
        ['un citoyen exilé pour dix ans', 'C’est le sort d’un citoyen frappé d’ostracisme.'],
      ),
      gap: ['Un étranger installé dans la cité sans être citoyen est un ', '.', ['métèque', 'meteque', 'metèque']],
      ...P.meteque,
      explain: 'Le métèque est protégé par la loi, mais il n’est pas citoyen.',
    },
    {
      q: 'Quelle fête honore la déesse protectrice d’Athènes ?',
      a: 'les Panathénées',
      wrong: wrong(
        ['les jeux olympiques', 'Les jeux olympiques ont lieu à Olympie.'],
        ['les Comices', 'Les comices sont des assemblées romaines.'],
        ['l’Exode', 'L’Exode est un livre de la Bible hébraïque.'],
      ),
      gap: [
        'La fête des ',
        ' est la principale fête de la déesse protectrice d’Athènes.',
        ['Panathénées', 'Panathenees'],
      ],
      ...P.panathenees,
      explain: 'Le culte civique fait partie de la citoyenneté.',
    },
    {
      q: 'À Rome, sous la République, qui est élu par le peuple pour un an au sommet du pouvoir ?',
      a: 'le consul',
      wrong: wrong(
        ['le pharaon', 'Le pharaon est un souverain d’Égypte.'],
        ['le métèque', 'Le métèque est un étranger à Athènes.'],
        ['le patricien', 'Patricien désigne une classe sociale, pas une charge d’un an.'],
      ),
      gap: ['À Rome, un magistrat élu pour un an qui exerce avec un collègue est le ', '.', ['consul']],
      ...P.consul,
      explain: 'Les consuls sont élus pour un an et exercent à deux.',
    },
    {
      q: 'Quelle assemblée romaine détient l’essentiel du pouvoir politique sous la République ?',
      a: 'le sénat',
      wrong: wrong(
        ['la Pythie', 'La Pythie est la prêtresse de Delphes.'],
        ['les Panathénées', 'C’est une fête athénienne.'],
        ['le Parthénon', 'Le Parthénon est un temple d’Athènes.'],
      ),
      gap: ['Sous la République romaine, l’essentiel du pouvoir appartient au ', '.', ['sénat', 'senat']],
      ...P.senat,
      explain: 'Le sénat, assemblée de patriciens, a un très grand pouvoir.',
    },
    {
      q: 'Qui défend à Rome les droits des plébéiens ?',
      a: 'le tribun de la plèbe',
      wrong: wrong(
        ['le sénat des patriciens', 'Le sénat est une assemblée de patriciens.'],
        ['l’aède', 'L’aède est un poète grec.'],
        ['le métèque', 'Le métèque est un étranger installé à Athènes.'],
      ),
      gap: ['Les droits des plébéiens sont défendus par le ', ' de la plèbe.', ['tribun']],
      ...P.tribun,
      explain: 'Le tribun de la plèbe représente et protège les plébéiens.',
    },
  ],
  paires3: [
    ['citoyen', 'participe aux affaires publiques'],
    ['métèque', 'étranger installé sans la citoyenneté'],
    ['consul', 'magistrat romain élu pour un an'],
  ],
  paires5: [
    ['métèque', 'étranger installé dans la cité grecque'],
    ['consul', 'magistrat élu pour un an à Rome'],
    ['sénat', 'assemblée de patriciens'],
    ['tribun de la plèbe', 'défenseur des plébéiens'],
    ['ostracisme', 'bannissement de dix ans voté par le peuple'],
  ],
  libres: [
    {
      q: 'Quel mot désigne, à Athènes, un étranger installé qui n’est pas citoyen ?',
      accepted: ['métèque', 'un métèque', 'meteque', 'metèque'],
      traps: traps(
        ['esclave', 'L’esclave n’est pas libre : le mot cherché désigne un étranger installé.'],
        ['patricien', 'Le patricien appartient à la société romaine.'],
      ),
      ...P.meteque,
      explain: 'C’est le métèque.',
    },
    {
      q: 'Comment appelle-t-on un régime où le pouvoir est exercé par le peuple, par les citoyens ? (un mot)',
      accepted: ['démocratie', 'la démocratie', 'une démocratie', 'democratie'],
      traps: traps(
        ['monarchie', 'La monarchie donne le pouvoir à un roi.'],
        ['empire', 'Un empire est un vaste territoire dirigé par un empereur.'],
      ),
      ...P.democratie,
      explain: 'C’est la démocratie.',
    },
    {
      q: 'Quel est le nom de la sanction qui bannit pour dix ans un citoyen par un vote du peuple à Athènes ?',
      accepted: ['ostracisme', 'l’ostracisme', 'un ostracisme'],
      traps: traps(
        ['exil à Babylone', 'L’exil à Babylone concerne les élites de Juda.'],
        ['esclavage', 'L’esclavage n’est pas un bannissement voté.'],
      ),
      ...P.ostracisme,
      explain: 'C’est l’ostracisme.',
    },
    {
      q: 'Quel est le nom de la classe sociale la plus élevée parmi les citoyens romains à l’origine ?',
      accepted: ['patriciens', 'les patriciens', 'patricien', 'un patricien'],
      traps: traps(
        ['plébéiens', 'Les plébéiens forment la plèbe, aux droits d’abord très restreints.'],
        ['métèques', 'Les métèques sont des étrangers installés à Athènes.'],
      ),
      ...P.patricien,
      explain: 'Ce sont les patriciens.',
    },
    {
      q: 'En quelle année après J.-C. l’édit de Caracalla accorde-t-il la citoyenneté aux habitants de l’empire ?',
      accepted: ['212', '212 apr. J.-C.', '212 après J.-C.', 'en 212'],
      traps: traps(
        ['753', '753 av. J.-C. est la date légendaire de la fondation de Rome.'],
        ['476', 'Ce n’est pas la date de l’édit de Caracalla.'],
      ),
      ...P.caracalla,
      explain: 'C’est en 212.',
    },
    {
      q: 'Comment appelle-t-on les assemblées du peuple romain qui élisent des magistrats ?',
      accepted: ['comices', 'les comices'],
      traps: traps(
        ['sénat', 'Le sénat est une assemblée de patriciens.'],
        ['consuls', 'Les consuls sont des magistrats élus, pas des assemblées.'],
      ),
      ...P.comices,
      explain: 'Ce sont les comices.',
    },
    {
      q: 'Comment appelle-t-on la partie de la population romaine qui n’a d’abord que des droits très restreints ?',
      accepted: ['plèbe', 'la plèbe', 'plebe', 'plébéiens', 'les plébéiens'],
      traps: traps(
        ['patriciens', 'Les patriciens forment au contraire la classe la plus élevée.'],
        ['métèques', 'Les métèques sont des étrangers installés à Athènes.'],
      ),
      ...P.plebe,
      explain: 'C’est la plèbe.',
    },
  ],
  docs: [
    {
      title: 'Une famille à Athènes au temps de Périclès',
      lines: [
        'Un homme libre athénien participe aux décisions de la cité et peut la défendre.',
        'Son épouse prend part à des fêtes religieuses, mais n’est pas citoyenne.',
        'Leur voisin, venu d’une autre cité, travaille à Athènes et paie des contributions.',
        'Une personne réduite en esclavage vit aussi dans la maison.',
      ],
      qs: [
        {
          q: 'Dans ce texte, qui est citoyen ?',
          a: 'l’homme libre athénien de la ligne 1',
          wrong: wrong(
            ['l’épouse de la ligne 2', 'Les femmes sont exclues de la citoyenneté.'],
            ['le voisin de la ligne 3', 'Un étranger installé est un métèque : il n’est pas citoyen.'],
            ['la personne de la ligne 4', 'Les esclaves sont exclus de la citoyenneté.'],
          ),
          ...P.exclus,
          explain: 'La citoyenneté est réservée ici à l’homme libre athénien.',
        },
        {
          q: 'Comment appelle-t-on le voisin de la ligne 3 ?',
          a: 'un métèque',
          wrong: wrong(
            ['un consul', 'Le consul est un magistrat romain.'],
            ['un plébéien', 'La plèbe appartient à Rome.'],
            ['un patricien', 'Les patriciens appartiennent à Rome.'],
          ),
          ...P.meteque,
          explain: 'Venu d’ailleurs et installé à Athènes, il est métèque.',
        },
        {
          q: 'Quelle conclusion tirer de ce texte sur la démocratie athénienne ?',
          a: 'elle ne concerne qu’une partie des habitants',
          wrong: wrong(
            ['tous les habitants sont citoyens', 'L’épouse, le voisin et la personne esclave ne le sont pas.'],
            ['seuls les étrangers votent', 'Les étrangers sont exclus de la citoyenneté.'],
            ['personne ne participe aux décisions', 'L’homme de la ligne 1 y participe.'],
          ),
          ...P.minorite,
          explain: 'La citoyenneté antique ne concerne qu’une petite minorité.',
        },
        {
          q: 'Quels devoirs du citoyen la ligne 1 évoque-t-elle, avec la religion civique ?',
          a: 'la vie politique et la défense de la cité',
          wrong: wrong(
            ['la rédaction de la Torah', 'La Torah concerne le judaïsme.'],
            ['la pêche et l’élevage', 'Ce sont des activités, pas les devoirs du citoyen.'],
            ['l’élection des consuls romains', 'Les consuls sont élus à Rome.'],
          ),
          ...P.devoirs,
          explain: 'La citoyenneté athénienne : vie politique, défense de la cité, religion civique.',
        },
      ],
    },
    {
      title: 'Rome élargit le droit de cité',
      lines: [
        'Au début, seule une partie des habitants a la citoyenneté romaine.',
        'En agrandissant son empire, Rome accorde le droit de cité à de plus en plus de personnes.',
        'En 212 apr. J.-C., l’édit de Caracalla donne cette qualité aux habitants de l’empire.',
        'À Athènes, au contraire, les étrangers installés restent des métèques.',
      ],
      qs: [
        {
          q: 'Quelle évolution les lignes 1 à 3 décrivent-elles ?',
          a: 'le droit de cité romain s’étend à de plus en plus de personnes',
          wrong: wrong(
            ['la citoyenneté romaine disparaît', 'La ligne 3 montre au contraire une extension.'],
            ['Rome retire la citoyenneté à tous', 'Les lignes décrivent un élargissement.'],
            ['seuls les Athéniens deviennent romains', 'Le texte parle de l’empire romain.'],
          ),
          ...P.extension,
          explain: 'Rome étend le droit de cité au fur et à mesure de son empire.',
        },
        {
          q: 'Qu’est-ce qui change en 212 apr. J.-C. d’après la ligne 3 ?',
          a: 'les habitants de l’empire reçoivent la citoyenneté',
          wrong: wrong(
            ['Rome est fondée', 'La fondation légendaire est bien plus ancienne.'],
            ['Athènes invente la démocratie', 'La démocratie athénienne est beaucoup plus ancienne.'],
            ['les consuls sont remplacés par des pharaons', 'Le texte ne parle pas de pharaons.'],
          ),
          ...P.caracalla,
          explain: 'L’édit de Caracalla étend la qualité de citoyen.',
        },
        {
          q: 'Quelle différence entre Athènes et Rome le texte souligne-t-il ?',
          a: 'Rome élargit le droit de cité, Athènes laisse les étrangers métèques',
          wrong: wrong(
            ['Athènes donne la citoyenneté à tous', 'La ligne 4 dit le contraire.'],
            ['Rome n’a pas de citoyens', 'La ligne 1 parle de la citoyenneté romaine.'],
            [
              'les métèques deviennent consuls à Athènes',
              'Les consuls sont romains et les métèques ne sont pas citoyens.',
            ],
          ),
          ...P.extension,
          explain: 'La ligne 2 montre une ouverture romaine, la ligne 4 une exclusion athénienne.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [cites, rome, monotheisme, citoyennete];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'sixième'));
