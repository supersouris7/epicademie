import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './transformations-europe-sources.ts';

/**
 * 5e, thème 3 « Transformations de l'Europe et ouverture sur le monde aux XVIe et XVIIe siècles » (lot hi-5e-03).
 * Chaque fait cite la ressource d'accompagnement Éduscol du thème ou un article de BnF Essentiels ; les textes à lire
 * du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle4-2020';

// ——— Notion 1 : les grandes découvertes et les premiers empires ———

const decouvertes: Notion = {
  id: 'h5-grandes-decouvertes',
  title: 'Les grandes découvertes et les premiers empires (XVe-XVIe siècles)',
  hint: 'Cherche si on demande un peuple, une personne, une date, un lieu ou un titre, puis situe la question sur la frise des XVe et XVIe siècles.',
  memo: [
    'Les **grandes découvertes** sont d’abord le fait des Portugais et des Espagnols, qui cherchent le plus souvent de nouvelles routes maritimes vers les Indes, car l’**empire ottoman** contrôle les routes terrestres. Le prince portugais Henri le Navigateur fait explorer la côte ouest de l’Afrique ; Christophe Colomb, soutenu par Isabelle de Castille et Ferdinand d’Aragon, atteint l’Amérique en 1492 ; Vasco de Gama touche l’Inde en 1498.',
    'En 1494, le traité de Tordesillas partage entre l’Espagne et le Portugal les terres découvertes et à découvrir ; le retour d’un navire de Magellan (1522) clôt les grandes découvertes. En Amérique, les **conquistadors**, attirés par l’or, conquièrent les territoires avec brutalité ; l’or et l’argent partent vers l’Espagne et la traite des esclaves noirs commence.',
    'Deux grands souverains dominent ce monde. Charles Quint, à la tête du **Saint-Empire** à partir de 1519, est le souverain le plus puissant de la chrétienté. Soliman le Magnifique, qui porte le titre de **calife**, dirige l’empire ottoman à son apogée ; la défaite navale de Lépante (1571) marque souvent le début d’un lent déclin.',
  ],
  faits: [
    {
      ...P.iberiques,
      q: 'Quels sont les deux peuples d’abord à l’origine des grandes découvertes ?',
      a: 'les Portugais et les Espagnols',
      wrong: [
        {
          label: 'les Français et les Anglais',
          why: 'Les voyages français et anglais viennent ensuite, au XVIe siècle.',
        },
        {
          label: 'les Russes et les Chinois',
          why: 'Ce ne sont pas eux qui mènent les grandes découvertes européennes.',
        },
        {
          label: 'les Ottomans et les Vénitiens',
          why: 'L’empire ottoman contrôle les routes terrestres vers les Indes : ce sont d’autres peuples qui cherchent la voie de mer.',
        },
      ],
      gap: ['Les grandes découvertes sont d’abord le fait des Portugais et des ', '.', ['Espagnols']],
      explain: 'Portugais et Espagnols ouvrent les premières grandes routes maritimes.',
    },
    {
      ...P.routes,
      q: 'Pourquoi les Européens cherchent-ils le plus souvent à ouvrir de nouvelles routes par la mer vers les Indes ?',
      a: 'l’empire ottoman contrôle les routes terrestres',
      wrong: [
        {
          label: 'les routes terrestres n’ont jamais existé',
          why: 'Des routes terrestres existent, mais elles sont contrôlées par l’empire ottoman.',
        },
        {
          label: 'l’Amérique est déjà connue et conquise',
          why: 'Au moment où l’on cherche ces routes, l’Amérique n’est pas encore connue des Européens.',
        },
        {
          label: 'le traité de Tordesillas interdit de naviguer',
          why: 'Le traité de Tordesillas partage les terres entre Espagne et Portugal, il n’interdit pas la navigation.',
        },
      ],
      gap: [
        'Les voyageurs veulent ouvrir de nouvelles routes maritimes vers les Indes, car l’empire ',
        ' contrôle les routes terrestres.',
        ['ottoman'],
      ],
      explain: 'Pour atteindre les Indes sans passer par les terres contrôlées par les Ottomans, on passe par la mer.',
    },
    {
      ...P.henri,
      q: 'Quelle côte est explorée sous l’impulsion du prince Henri le Navigateur ?',
      a: 'la côte ouest de l’Afrique',
      wrong: [
        {
          label: 'la côte nord de l’Amérique',
          why: 'L’Amérique n’est atteinte qu’en 1492, après la mort d’Henri le Navigateur (1460).',
        },
        { label: 'la côte sud de l’Australie', why: 'Henri le Navigateur ne fait pas explorer l’Australie.' },
        { label: 'la côte est de l’Inde', why: 'Les Portugais n’atteignent l’Inde qu’avec Vasco de Gama, en 1498.' },
      ],
      gap: ['Sous l’impulsion d’Henri le Navigateur, les Portugais explorent la côte ouest de l’', '.', ['Afrique']],
      explain: 'Les Portugais longent peu à peu la côte ouest de l’Afrique.',
    },
    {
      ...P.colomb,
      q: 'Qui soutient le projet de Christophe Colomb ?',
      a: 'Isabelle de Castille et Ferdinand d’Aragon',
      wrong: [
        {
          label: 'Soliman le Magnifique et Sélim Ier',
          why: 'Ce sont des souverains ottomans, qui ne soutiennent pas Colomb.',
        },
        { label: 'François Ier et Henri IV', why: 'Ce sont des rois de France plus tardifs.' },
        {
          label: 'le prince Henri le Navigateur',
          why: 'Henri le Navigateur meurt en 1460, bien avant le voyage de Colomb.',
        },
      ],
      gap: [
        'Christophe Colomb, soutenu par Isabelle de Castille et Ferdinand d’Aragon, cherche une nouvelle route pour les ',
        ' orientales.',
        ['Indes'],
      ],
      explain: 'Les souverains de Castille et d’Aragon soutiennent Colomb, qui croit pouvoir gagner les Indes.',
    },
    {
      ...P.gama,
      q: 'Quel navigateur portugais atteint la côte de l’Inde en 1498 ?',
      a: 'Vasco de Gama',
      wrong: [
        { label: 'Christophe Colomb', why: 'Colomb atteint l’Amérique en 1492, en cherchant les Indes par l’ouest.' },
        { label: 'Hernando Cortés', why: 'Cortés est un conquistador espagnol qui conquiert le Mexique.' },
        { label: 'Magellan', why: 'Magellan mène plus tard l’expédition dont un navire revient en 1522.' },
      ],
      gap: ['En 1498, la flotte de Vasco de ', ' touche la côte indienne, près de Calicut.', ['Gama']],
      explain: 'Parti du Portugal, Vasco de Gama touche l’Inde près de Calicut le 20 mai 1498.',
    },
    {
      ...P.tordesillas,
      q: 'Que fait le traité de Tordesillas, signé en 1494 ?',
      a: 'il partage entre l’Espagne et le Portugal les terres découvertes et à découvrir',
      wrong: [
        {
          label: 'il met fin à la guerre entre la France et l’Angleterre',
          why: 'Le traité de Tordesillas concerne les terres découvertes, pas la France et l’Angleterre.',
        },
        { label: 'il donne l’Amérique à l’empire ottoman', why: 'L’empire ottoman ne participe pas à ce partage.' },
        {
          label: 'il partage les terres entre la France et l’Angleterre',
          why: 'Ce sont l’Espagne et le Portugal qui se partagent les terres.',
        },
      ],
      gap: ['En 1494, le traité de ', ' partage les terres entre l’Espagne et le Portugal.', ['Tordesillas']],
      explain:
        'Les deux puissances ibériques (Espagne et Portugal) se partagent les terres découvertes et à découvrir.',
    },
    {
      ...P.magellan,
      q: 'En quelle année un navire de l’expédition de Magellan revient-il en Europe, ce qui clôt les grandes découvertes ?',
      a: '1522',
      wrong: [
        { label: '1453', why: '1453 est l’année de la prise de Constantinople.' },
        { label: '1598', why: '1598 est l’année de l’Édit de Nantes.' },
        { label: '1492', why: '1492 est l’année de la découverte de l’Amérique.' },
      ],
      gap: ['Les grandes découvertes s’achèvent avec le retour d’un navire de Magellan en ', '.', ['1522']],
      explain: 'Le retour d’un des navires de Magellan, en 1522, termine les grandes découvertes.',
    },
    {
      ...P.traite,
      q: 'Quel commerce d’êtres humains commence dès la conquête de l’Amérique ?',
      a: 'la traite des esclaves noirs',
      wrong: [
        {
          label: 'le commerce des indulgences',
          why: 'Les indulgences sont un sujet religieux, lié à la critique de Luther.',
        },
        { label: 'le commerce des épices vers l’Inde', why: 'Les épices ne sont pas des êtres humains.' },
        {
          label: 'l’envoi d’ambassadeurs à Istanbul',
          why: 'Un ambassadeur représente un roi : ce n’est pas un commerce.',
        },
      ],
      gap: ['Dès la conquête commence la ', ' des esclaves noirs.', ['traite']],
      explain: 'La conquête s’accompagne dès le début de la traite des esclaves noirs, un commerce d’êtres humains.',
    },
    {
      ...P.soliman,
      q: 'Sous quel souverain l’empire ottoman est-il à son apogée ?',
      a: 'Soliman le Magnifique',
      wrong: [
        {
          label: 'Charles Quint',
          why: 'Charles Quint est à la tête du Saint-Empire et de l’Espagne, pas de l’empire ottoman.',
        },
        { label: 'Louis XIV', why: 'Louis XIV est un roi de France du XVIIe siècle.' },
        { label: 'Sélim Ier', why: 'Sélim Ier précède Soliman, qui règne ensuite à l’apogée de l’empire.' },
      ],
      gap: ['L’empire ottoman est à son apogée sous le règne de ', ' le Magnifique.', ['Soliman']],
      explain: 'Soliman le Magnifique règne au moment où l’empire ottoman est le plus puissant.',
    },
  ],
  paires3: [
    ['Christophe Colomb', 'Atteint l’Amérique en 1492'],
    ['Vasco de Gama', 'Touche la côte de l’Inde en 1498'],
    ['Soliman le Magnifique', 'Dirige l’empire ottoman à son apogée'],
  ],
  paires5: [
    ['Henri le Navigateur', 'Fait explorer la côte ouest de l’Afrique'],
    ['Le traité de Tordesillas', 'Partage les terres entre l’Espagne et le Portugal'],
    ['La bataille de Lépante', 'Défaite navale ottomane en 1571'],
    ['Les conquistadors', 'Conquérants espagnols attirés par l’or'],
    ['Charles Quint', 'Succède à son grand-père à la tête du Saint-Empire en 1519'],
  ],
  frise: [
    { ...P.constantinople, label: 'Prise de Constantinople', date: '1453' },
    { ...P.amerique, label: 'Découverte de l’Amérique', date: '1492' },
    { ...P.tordesillas, label: 'Traité de Tordesillas', date: '1494' },
    { ...P.gama, label: 'Vasco de Gama touche la côte de l’Inde', date: '1498' },
    { ...P.magellan, label: 'Retour en Europe d’un navire de Magellan', date: '1522' },
    { ...P.lepante, label: 'Défaite navale de Lépante', date: '1571' },
  ],
  libres: [
    {
      ...P.colomb,
      q: 'quel navigateur, soutenu par Isabelle de Castille et Ferdinand d’Aragon, cherche une nouvelle route vers les Indes ?',
      accepted: ['Christophe Colomb', 'Colomb'],
      traps: [
        { text: 'Vasco de Gama', why: 'Vasco de Gama est portugais et contourne l’Afrique.' },
        { text: 'Magellan', why: 'L’expédition de Magellan est plus tardive.' },
      ],
      explain: 'C’est Christophe Colomb que soutiennent Isabelle et Ferdinand.',
    },
    {
      ...P.tordesillas,
      q: 'en quelle année le traité de Tordesillas partage-t-il les terres entre l’Espagne et le Portugal ?',
      accepted: ['1494', 'en 1494'],
      traps: [
        { text: '1492', why: '1492 est l’année où Colomb atteint l’Amérique ; le traité vient deux ans après.' },
        { text: '1522', why: '1522 est l’année du retour d’un navire de Magellan.' },
      ],
      explain: 'Le traité de Tordesillas est signé en 1494.',
    },
    {
      ...P.calife,
      q: 'quel titre, qui fait de lui le successeur de Muhammad, Soliman porte-t-il ? (un mot)',
      accepted: ['calife', 'le calife', 'khalife'],
      traps: [
        { text: 'empereur', why: 'Le titre cherché désigne le successeur de Muhammad.' },
        { text: 'pape', why: 'Le pape est le chef de l’Église catholique.' },
      ],
      explain: 'Soliman porte le titre de calife, successeur de Muhammad et « commandeur des croyants ».',
    },
    {
      ...P.conquistadors,
      q: 'comment appelle-t-on les conquérants espagnols attirés par l’or de l’Amérique ? (un mot)',
      accepted: ['conquistadors', 'conquistador', 'les conquistadors', 'des conquistadors'],
      traps: [
        { text: 'croisés', why: 'Les croisés sont les combattants des croisades, au Moyen Âge.' },
        {
          text: 'navigateurs',
          why: 'Un navigateur explore la mer ; le mot cherché est espagnol et désigne un conquérant.',
        },
      ],
      explain: 'On les appelle les conquistadors.',
    },
  ],
  docs: [
    {
      title: 'Vers les Indes par la mer',
      lines: [
        'Les Européens veulent de nouvelles routes vers les Indes.',
        'L’empire ottoman contrôle les routes terrestres.',
        'Les Portugais explorent la côte ouest de l’Afrique.',
        'En 1498, Vasco de Gama touche la côte indienne.',
        'Christophe Colomb, soutenu par Isabelle de Castille et Ferdinand d’Aragon, cherche une nouvelle route pour les Indes orientales.',
      ],
      qs: [
        {
          ...P.routes,
          q: 'D’après les deux premières lignes, quel obstacle pousse les Européens vers la mer ?',
          a: 'le contrôle des routes terrestres par les Ottomans',
          wrong: [
            { label: 'le traité de Tordesillas', why: 'Ligne 2 : l’obstacle est l’empire ottoman, pas un traité.' },
            { label: 'la traite des esclaves', why: 'Ligne 2 : relis qui contrôle les routes terrestres.' },
          ],
          explain: 'Ligne 2 : l’empire ottoman contrôle les routes terrestres.',
        },
        {
          ...P.gama,
          q: 'En lisant les lignes 4 et 5, quel navigateur arrive sur la côte indienne ?',
          a: 'Vasco de Gama, en 1498',
          wrong: [
            {
              label: 'Christophe Colomb, en 1492',
              why: 'Ligne 5 : Colomb cherche une route ; en 1492, c’est l’Amérique qui est découverte.',
            },
            {
              label: 'Henri le Navigateur, en 1460',
              why: 'Henri le Navigateur fait explorer l’Afrique, sans atteindre l’Inde.',
            },
          ],
          explain: 'Ligne 4 : en 1498, Vasco de Gama touche la côte indienne.',
        },
        {
          ...P.colomb,
          q: 'D’après la ligne 5, que cherche Christophe Colomb ?',
          a: 'une nouvelle route pour les Indes orientales',
          wrong: [
            { label: 'des mines d’argent en Afrique', why: 'Ligne 5 : Colomb cherche une route.' },
            {
              label: 'un passage terrestre à travers l’empire ottoman',
              why: 'Ligne 2 : les routes terrestres sont contrôlées par les Ottomans.',
            },
          ],
          explain: 'Ligne 5 : Colomb cherche une nouvelle route pour les Indes orientales.',
        },
      ],
    },
    {
      title: 'Deux souverains face à face',
      lines: [
        'En 1519, Charles Quint succède à son grand-père à la tête du Saint-Empire.',
        'Il est le souverain le plus puissant de la chrétienté.',
        'Face à lui, Soliman le Magnifique dirige l’empire ottoman à son apogée.',
        'Soliman porte le titre de calife.',
        'En 1571, la défaite navale de Lépante marque souvent le début d’un lent déclin ottoman.',
      ],
      qs: [
        {
          ...P.calife,
          q: 'Quel titre religieux le texte attribue-t-il à Soliman ?',
          a: 'calife',
          wrong: [
            { label: 'pape', why: 'Le pape est le chef de l’Église catholique ; relis la ligne 4.' },
            { label: 'empereur du Saint-Empire', why: 'C’est Charles Quint qui dirige le Saint-Empire (ligne 1).' },
          ],
          explain: 'Ligne 4 : Soliman porte le titre de calife.',
        },
        {
          ...P.charlesQuint,
          q: 'Dans quel monde Charles Quint est-il le souverain le plus puissant ?',
          a: 'la chrétienté',
          wrong: [
            { label: 'le monde musulman', why: 'Le monde musulman est uni sous Soliman.' },
            { label: 'les Amériques des peuples autochtones', why: 'Ligne 2 : le texte parle de la chrétienté.' },
          ],
          explain: 'Ligne 2 : Charles Quint est le souverain le plus puissant de la chrétienté.',
        },
        {
          ...P.lepante,
          q: 'Quelle conséquence la ligne 5 donne-t-elle à Lépante ?',
          a: 'le début d’un lent déclin ottoman',
          wrong: [
            {
              label: 'la fin immédiate de l’empire ottoman',
              why: 'Ligne 5 : il s’agit d’un lent déclin, pas d’une fin immédiate.',
            },
            {
              label: 'la prise de Constantinople par les Turcs',
              why: 'La prise de Constantinople date de 1453, avant Lépante.',
            },
          ],
          explain: 'Ligne 5 : Lépante marque souvent le début d’un lent déclin.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : Humanisme, réformes et conflits religieux ———

const humanisme: Notion = {
  id: 'h5-humanisme-reformes',
  title: 'Humanisme, réformes et conflits religieux',
  hint: 'Cherche si on parle d’une idée, d’un objet technique, d’un homme ou d’une date, puis demande-toi si cela touche les savoirs ou la religion.',
  memo: [
    'L’**humanisme** naît dans les milieux savants italiens au XIVe siècle : il veut faire renaître l’**Antiquité** en recherchant les manuscrits et en étudiant les textes, et, avec la Renaissance, il place l’homme au centre. L’**imprimerie** à caractères mobiles (en plomb) de Gutenberg, dont le premier livre est une Bible au milieu du XVe siècle, permet de diffuser les idées nouvelles.',
    'Érasme voudrait réformer l’Église sans rupture. En 1517, Luther publie ses 95 thèses et condamne les **indulgences** ; la **Réforme** aboutit à de nouvelles Églises (luthériennes, réformées, anglicane) ; Calvin est un autre grand réformateur, installé à Genève. Au concile de Trente (1545-1563), l’Église catholique se réforme en gardant le lien avec la tradition et le pape : l’unité de la chrétienté est rompue.',
    'En France, les **guerres de religion** déstabilisent le pouvoir royal de 1562 à 1598. Le pouvoir royal impose alors l’**édit de Nantes** (1598) pour rétablir la paix.',
  ],
  faits: [
    {
      ...P.humanisme,
      q: 'Quel est le principe directeur de l’humanisme ?',
      a: 'faire renaître l’Antiquité en étudiant ses textes et ses vestiges',
      wrong: [
        {
          label: 'refuser de lire les textes anciens',
          why: 'Au contraire, les humanistes cherchent à lire les textes anciens.',
        },
        {
          label: 'conquérir de nouvelles terres au-delà des mers',
          why: 'Cela concerne les grandes découvertes, pas l’humanisme.',
        },
        {
          label: 'rétablir le pouvoir des seigneurs sur les paysans',
          why: 'L’ordre seigneurial est un autre thème, du Moyen Âge.',
        },
      ],
      gap: [
        'L’humanisme veut un renouveau de l’',
        ', par l’étude des textes et des vestiges.',
        ['Antiquité', 'Antiquite'],
      ],
      explain: 'Les humanistes veulent retrouver l’Antiquité par la quête et l’étude de ses textes.',
    },
    {
      ...P.italie,
      q: 'Dans quel pays l’humanisme est-il né, au XIVe siècle ?',
      a: 'en Italie',
      wrong: [
        { label: 'en Angleterre', why: 'L’humanisme gagne l’Europe, mais naît chez des savants italiens.' },
        {
          label: 'dans l’empire ottoman',
          why: 'L’humanisme est un mouvement qui naît en Europe, chez des savants italiens.',
        },
        { label: 'en Amérique', why: 'L’Amérique n’est pas encore connue des Européens au XIVe siècle.' },
      ],
      gap: ['L’humanisme est né dans les milieux savants d’', ', au XIVe siècle.', ['Italie']],
      explain: 'Des juristes et des notaires italiens passionnés d’Antiquité lancent le mouvement.',
    },
    {
      ...P.bible,
      q: 'Quel est le premier livre imprimé par Gutenberg, au milieu du XVe siècle ?',
      a: 'une Bible',
      wrong: [
        { label: 'un atlas des nouveaux mondes', why: 'Le premier livre de Gutenberg n’est pas un livre de cartes.' },
        { label: 'un recueil des 95 thèses de Luther', why: 'Les 95 thèses datent de 1517, bien après Gutenberg.' },
        {
          label: 'un roman de chevalerie',
          why: 'Ce type de livre existe, mais ce n’est pas le premier imprimé par Gutenberg.',
        },
      ],
      gap: ['Le premier livre qu’imprime Gutenberg est une ', ' monumentale.', ['Bible']],
      explain: 'Gutenberg imprime d’abord une grande Bible, au milieu du XVe siècle.',
    },
    {
      ...P.diffusion,
      q: 'Quel effet l’imprimerie a-t-elle sur les idées nouvelles ?',
      a: 'elle permet de les diffuser',
      wrong: [
        { label: 'elle les fait disparaître', why: 'L’imprimerie aide au contraire à les faire circuler.' },
        {
          label: 'elle les réserve aux seuls rois',
          why: 'L’imprimerie multiplie les exemplaires : les idées circulent plus largement.',
        },
        {
          label: 'elle les remplace par des manuscrits copiés à la main',
          why: 'Les manuscrits copiés à la main existaient avant ; l’imprimerie multiplie les exemplaires.',
        },
      ],
      gap: ['L’imprimerie permet la ', ' des idées nouvelles.', ['diffusion', 'circulation', 'propagation']],
      explain: 'En multipliant les exemplaires, l’imprimerie fait circuler les idées.',
    },
    {
      ...P.theses,
      q: 'En quelle année Luther publie-t-il ses 95 thèses ?',
      a: '1517',
      wrong: [
        { label: '1598', why: '1598 est l’année de l’édit de Nantes.' },
        { label: '1453', why: '1453 est l’année de la prise de Constantinople.' },
        { label: '1562', why: '1562 marque le début des guerres de religion en France.' },
      ],
      gap: ['En ', ', Luther publie ses 95 thèses.', ['1517']],
      explain: '1517 est un repère du programme : Luther publie ses 95 thèses.',
    },
    {
      ...P.indulgences,
      q: 'Quelle pratique de l’Église Luther condamne-t-il ?',
      a: 'la vente des indulgences',
      wrong: [
        { label: 'l’exploration de la côte africaine', why: 'L’exploration n’est pas une pratique de l’Église.' },
        { label: 'l’impression de la Bible', why: 'Luther ne condamne pas le fait d’imprimer la Bible.' },
        { label: 'le partage de Tordesillas', why: 'Ce traité partage des terres entre l’Espagne et le Portugal.' },
      ],
      gap: [
        'Luther condamne la pratique qui permet d’acheter le salut de son âme grâce aux ',
        '.',
        ['indulgences', 'indulgence'],
      ],
      explain: 'Luther refuse qu’on puisse acheter le salut de son âme par des indulgences.',
    },
    {
      ...P.erasme,
      q: 'Quelle position Érasme adopte-t-il ?',
      a: 'il veut réformer l’Église sans rupture',
      wrong: [
        { label: 'il refuse toute réforme de l’Église', why: 'Érasme souhaite une réforme.' },
        { label: 'il fonde une Église nouvelle à Genève', why: 'C’est Calvin qui agit à Genève.' },
        { label: 'il dirige les armées contre Luther', why: 'Érasme est un savant humaniste, pas un chef de guerre.' },
      ],
      gap: ['Érasme voudrait une réforme de l’Église sans ', '.', ['rupture', 'schisme', 'division']],
      explain: 'Érasme souhaite corriger l’Église en gardant son unité.',
    },
    {
      ...P.trente,
      q: 'Quel concile permet à l’Église catholique de se réformer entre 1545 et 1563 ?',
      a: 'le concile de Trente',
      wrong: [
        { label: 'le concile de Nicée', why: 'Le concile de Nicée date du IVe siècle.' },
        {
          label: 'la diète de Worms',
          why: 'La diète de Worms est une assemblée où Luther fait face à Charles Quint : ce n’est pas un concile.',
        },
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes est un texte du roi de France, en 1598.' },
      ],
      gap: ['De 1545 à 1563, l’Église catholique se réforme au concile de ', '.', ['Trente']],
      explain: 'Le concile de Trente réforme le catholicisme en gardant la tradition et la papauté.',
    },
    {
      ...P.unite,
      q: 'Quel résultat la Réforme a-t-elle pour l’unité religieuse de l’Europe chrétienne ?',
      a: 'l’unité est rompue',
      wrong: [
        {
          label: 'l’unité est renforcée autour du pape',
          why: 'De nouvelles Églises naissent, hors de l’autorité du pape.',
        },
        { label: 'toute religion disparaît', why: 'Les croyances continuent : plusieurs Églises coexistent.' },
        {
          label: 'tous les Européens deviennent musulmans',
          why: 'La Réforme se produit à l’intérieur du christianisme.',
        },
      ],
      gap: ['Avec la Réforme, on assiste à la ', ' de l’unité religieuse de l’Europe.', ['rupture', 'fin']],
      explain: 'Plusieurs Églises coexistent désormais : c’est la rupture de l’unité religieuse.',
    },
  ],
  paires3: [
    ['Luther', 'Publie les 95 thèses en 1517'],
    ['Gutenberg', 'Imprime une Bible au milieu du XVe siècle'],
    ['Érasme', 'Veut réformer l’Église sans rupture'],
  ],
  paires5: [
    ['L’humanisme', 'Renouveau de l’Antiquité par l’étude des textes'],
    ['Calvin', 'Réformateur à Genève'],
    ['Le concile de Trente', 'Réforme de l’Église catholique (1545-1563)'],
    ['Les guerres de religion', 'Déstabilisent le pouvoir royal en France (1562-1598)'],
    ['L’édit de Nantes', 'Imposé par le pouvoir royal en 1598'],
  ],
  frise: [
    { ...P.bible, label: 'Gutenberg imprime une Bible', date: 'milieu du XVe siècle' },
    { ...P.theses, label: 'Luther publie ses 95 thèses', date: '1517' },
    { ...P.trente, label: 'Ouverture du concile de Trente', date: '1545-1563' },
    { ...P.guerres, label: 'Début des guerres de religion en France', date: '1562-1598' },
    { ...P.repereNantes, label: 'Édit de Nantes', date: '1598' },
  ],
  libres: [
    {
      ...P.theses,
      q: 'qui publie 95 thèses en 1517 ?',
      accepted: ['Luther', 'Martin Luther'],
      traps: [
        { text: 'Calvin', why: 'Calvin agit à Genève, après les débuts de Luther.' },
        { text: 'Érasme', why: 'Érasme veut une réforme sans rupture.' },
      ],
      explain: 'Martin Luther publie ses 95 thèses en 1517.',
    },
    {
      ...P.repereNantes,
      q: 'en quelle année l’édit de Nantes est-il imposé par le pouvoir royal ?',
      accepted: ['1598', 'en 1598'],
      traps: [
        { text: '1517', why: '1517 est l’année des 95 thèses.' },
        { text: '1685', why: '1685 est l’année de la révocation de l’édit de Nantes.' },
      ],
      explain: 'L’édit de Nantes date de 1598.',
    },
    {
      ...P.trente,
      q: 'quel concile, réuni de 1545 à 1563, réforme l’Église catholique ? (concile de …)',
      accepted: ['Trente', 'concile de Trente', 'le concile de Trente', 'de Trente'],
      traps: [
        { text: 'Nicée', why: 'Le concile de Nicée date du IVe siècle.' },
        { text: 'Latran', why: 'Ce n’est pas le concile réuni de 1545 à 1563.' },
      ],
      explain: 'C’est le concile de Trente.',
    },
    {
      ...P.bible,
      q: 'quel inventeur imprime une Bible au milieu du XVe siècle ? (un nom)',
      accepted: ['Gutenberg', 'Johannes Gutenberg', 'Johann Gutenberg'],
      traps: [
        { text: 'Luther', why: 'Luther est le réformateur des 95 thèses.' },
        { text: 'Calvin', why: 'Calvin est un réformateur à Genève.' },
      ],
      explain: 'Gutenberg imprime la première grande Bible.',
    },
  ],
  docs: [
    {
      title: 'Des livres et des idées',
      lines: [
        'Au XVe siècle, Gutenberg met au point l’imprimerie à caractères mobiles.',
        'Son premier livre est une Bible.',
        'L’imprimerie permet la diffusion des idées nouvelles.',
        'Les humanistes cherchent des manuscrits pour retrouver les textes de l’Antiquité.',
        'Érasme, humaniste, souhaite une réforme de l’Église sans rupture.',
      ],
      qs: [
        {
          ...P.manuscrits,
          q: 'D’après la ligne 4, pourquoi les humanistes cherchent-ils des manuscrits ?',
          a: 'pour retrouver les textes de l’Antiquité',
          wrong: [
            {
              label: 'pour les vendre comme indulgences',
              why: 'Les indulgences n’ont rien à voir avec la recherche de manuscrits.',
            },
            { label: 'pour empêcher la diffusion des idées', why: 'La ligne 4 parle de retrouver des textes.' },
          ],
          explain: 'Ligne 4 : les manuscrits permettent de reconstituer les œuvres du passé.',
        },
        {
          ...P.diffusion,
          q: 'En réunissant les lignes 1 et 3, qu’apporte l’imprimerie ?',
          a: 'une circulation plus large des idées nouvelles',
          wrong: [
            {
              label: 'la fin de la lecture des textes anciens',
              why: 'La ligne 3 dit au contraire que les idées se diffusent.',
            },
            {
              label: 'le partage des terres lointaines',
              why: 'Cela concerne le traité de Tordesillas, pas l’imprimerie.',
            },
          ],
          explain: 'Lignes 1 et 3 : l’imprimerie permet de diffuser les idées nouvelles.',
        },
        {
          ...P.erasme,
          q: 'Quelle limite Érasme met-il à la réforme qu’il souhaite (ligne 5) ?',
          a: 'elle ne doit pas rompre l’unité de l’Église',
          wrong: [
            { label: 'elle doit créer une nouvelle Église', why: 'Ligne 5 : Érasme veut éviter la rupture.' },
            { label: 'elle doit supprimer la Bible', why: 'Le texte ne parle pas de supprimer la Bible.' },
          ],
          explain: 'Ligne 5 : Érasme souhaite une réforme sans rupture.',
        },
      ],
    },
    {
      title: 'De la rupture à la paix imposée',
      lines: [
        'En 1517, Luther publie ses 95 thèses.',
        'De nouvelles Églises se constituent, luthériennes, réformées et anglicane.',
        'Au concile de Trente (1545-1563), l’Église catholique se réforme.',
        'De 1562 à 1598, les guerres de religion déstabilisent le pouvoir royal en France.',
        'En 1598, le pouvoir royal impose l’édit de Nantes.',
      ],
      qs: [
        {
          ...P.eglises,
          q: 'D’après la ligne 2, qu’apparaît-il à la suite de la Réforme ?',
          a: 'de nouvelles Églises',
          wrong: [
            { label: 'une seule Église unie', why: 'Ligne 2 : plusieurs Églises se constituent.' },
            { label: 'un nouveau continent', why: 'Ce n’est pas ce que dit la ligne 2.' },
          ],
          explain: 'Ligne 2 : des Églises luthériennes, réformées et anglicane se constituent.',
        },
        {
          ...P.trente,
          q: 'Comment le catholicisme réagit-il, d’après la ligne 3 ?',
          a: 'il se réforme lui aussi, au concile de Trente',
          wrong: [
            { label: 'il disparaît', why: 'Ligne 3 : l’Église catholique se réforme.' },
            {
              label: 'il fonde l’Église anglicane',
              why: 'L’Église anglicane est l’une des nouvelles Églises de la ligne 2.',
            },
          ],
          explain: 'Ligne 3 : au concile de Trente, l’Église catholique se réforme.',
        },
        {
          ...P.nantes,
          q: 'En rapprochant les lignes 4 et 5, qui met fin à la période de troubles ?',
          a: 'le pouvoir royal',
          wrong: [
            { label: 'le pape à Rome', why: 'Ligne 5 : c’est le pouvoir royal qui impose l’édit.' },
            { label: 'Calvin à Genève', why: 'Ligne 5 : relis qui impose l’édit de Nantes.' },
          ],
          explain: 'Lignes 4 et 5 : après les guerres de religion, le pouvoir royal impose l’édit de Nantes.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : du Prince de la Renaissance au roi absolu ———

const roi: Notion = {
  id: 'h5-prince-roi-absolu',
  title: 'Du Prince de la Renaissance au roi absolu (François Ier, Henri IV, Louis XIV)',
  hint: 'Repère d’abord de quel roi il est question, puis demande-toi si l’on parle de combats, d’arts, de lois, de croyances ou de fêtes.',
  memo: [
    'En 1515, à Reims, le nouveau roi François Ier jure sur la Bible de maintenir la paix du peuple chrétien. C’est un roi guerrier (victoire de Marignan en 1515, défaite de Pavie en 1525 qui le mène en captivité en Espagne) et un **Prince de la Renaissance**, protecteur des arts, qui accueille Léonard de Vinci. En 1539, l’**ordonnance** de Villers-Cotterêts impose le français pour certains textes juridiques ; contre Charles Quint, il s’allie à Soliman.',
    'Après les guerres de religion, le pouvoir royal impose l’édit de Nantes (1598), associé à Henri IV, « roi de consensus contre les factions », qui est ensuite assassiné. L’État est désormais seul à garantir l’ordre et un enjeu majeur est de mettre la **noblesse** sous tutelle, malgré la **Fronde** (1648-1653).',
    'Louis XIV (repère : 1661-1715), « roi guerrier maître de la noblesse », se sert des fêtes de cour à Versailles pour contrôler les **courtisans** ; en 1685, il révoque l’édit de Nantes. Le pouvoir dit **absolu** est une idée : il faut le distinguer de la pratique réelle.',
  ],
  faits: [
    {
      ...P.marignan,
      q: 'Quelle bataille de 1525 conduit François Ier en captivité en Espagne ?',
      a: 'la bataille de Pavie',
      wrong: [
        { label: 'la bataille de Lépante', why: 'Lépante (1571) est une défaite navale ottomane.' },
        { label: 'la bataille de Bouvines', why: 'Bouvines (1214) est une victoire de Philippe Auguste.' },
        { label: 'la bataille de Marignan', why: 'Marignan (1515) est une victoire de François Ier.' },
      ],
      gap: ['En 1525, la bataille de ', ' vaut au roi plus d’un an de captivité en Espagne.', ['Pavie']],
      explain: 'Après la défaite de Pavie, François Ier est prisonnier plus d’un an en Espagne.',
    },
    {
      ...P.villers,
      q: 'Qu’impose l’ordonnance de Villers-Cotterêts en 1539 ?',
      a: 'l’usage du français pour certains textes juridiques',
      wrong: [
        {
          label: 'l’usage du latin pour tous les livres',
          why: 'L’ordonnance fait l’inverse : elle impose le français pour certains textes.',
        },
        { label: 'la liberté religieuse des protestants', why: 'C’est le sujet de l’édit de Nantes, en 1598.' },
        {
          label: 'un impôt permanent sur les nobles',
          why: 'L’impôt permanent est une création médiévale, sans lien avec cette ordonnance.',
        },
      ],
      gap: ['En 1539, François Ier impose l’usage du ', ' pour certains textes juridiques.', ['français', 'francais']],
      explain: 'En 1539, le français devient obligatoire pour certains textes à caractère juridique.',
    },
    {
      ...P.vinci,
      q: 'Quel artiste et savant passe ses dernières années auprès de François Ier ?',
      a: 'Léonard de Vinci',
      wrong: [
        { label: 'Christophe Colomb', why: 'Colomb est un navigateur.' },
        { label: 'Johannes Gutenberg', why: 'Gutenberg est lié à l’imprimerie.' },
        { label: 'Martin Luther', why: 'Luther est un réformateur religieux.' },
      ],
      gap: ['Léonard de ', ' passe ses dernières années auprès de François Ier.', ['Vinci']],
      explain: 'François Ier, prince de la Renaissance, accueille Léonard de Vinci.',
    },
    {
      ...P.alliance,
      q: 'Avec quel souverain François Ier s’allie-t-il contre son rival Charles Quint ?',
      a: 'Soliman le Magnifique',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV règne bien plus tard.' },
        { label: 'Ferdinand d’Aragon', why: 'Ferdinand soutient Colomb, il ne s’allie pas ici contre Charles Quint.' },
        {
          label: 'Isabelle de Castille',
          why: 'Isabelle de Castille est une souveraine espagnole d’une génération antérieure.',
        },
      ],
      gap: ['Contre son rival, François Ier s’allie à ', ' le Magnifique.', ['Soliman']],
      explain: 'Contre son rival Charles Quint, François Ier s’allie à Soliman.',
    },
    {
      ...P.consensus,
      q: 'Quelle image du roi est associée à Henri IV ?',
      a: 'un roi de consensus contre les factions',
      wrong: [
        { label: 'un empereur de la chrétienté', why: 'Henri IV est roi de France, pas empereur.' },
        { label: 'un roi guerrier maître de la noblesse', why: 'C’est la formule qui caractérise Louis XIV.' },
        { label: 'un roi humaniste parmi les nobles', why: 'C’est la formule qui caractérise François Ier.' },
      ],
      gap: [
        'Henri IV est présenté comme un roi de ',
        ' (la recherche d’un accord) contre les factions.',
        ['consensus'],
      ],
      explain: 'Après les troubles, Henri IV cherche l’accord entre les groupes.',
    },
    {
      ...P.nantes,
      q: 'Qui impose l’édit de Nantes ?',
      a: 'le pouvoir royal',
      wrong: [
        { label: 'le pape', why: 'L’édit de Nantes est un texte du pouvoir royal.' },
        { label: 'les nobles réunis en Fronde', why: 'La Fronde date de 1648-1653, après l’édit.' },
        { label: 'l’empire ottoman', why: 'Les Ottomans ne gouvernent pas la France.' },
      ],
      gap: [
        'La religion ne peut plus garantir la paix : c’est le pouvoir ',
        ' qui impose l’édit de Nantes.',
        ['royal', 'du roi'],
      ],
      explain: 'Le pouvoir royal impose l’édit de Nantes : l’État garantit désormais l’ordre.',
    },
    {
      ...P.revocation,
      q: 'En quelle année Louis XIV révoque-t-il l’édit de Nantes ?',
      a: '1685',
      wrong: [
        { label: '1598', why: '1598 est l’année de l’édit lui-même.' },
        { label: '1715', why: '1715 est la fin du règne de Louis XIV.' },
        { label: '1661', why: '1661 ouvre le repère du règne de Louis XIV, mais la révocation est plus tardive.' },
      ],
      gap: ['Louis XIV révoque l’édit de Nantes en ', '.', ['1685']],
      explain: 'La révocation de 1685 revient sur l’édit de 1598.',
    },
    {
      ...P.fronde,
      q: 'Comment appelle-t-on la révolte de 1648-1653 qui s’oppose à la mise sous tutelle de la noblesse ?',
      a: 'la Fronde',
      wrong: [
        { label: 'la jacquerie', why: 'La jacquerie est une révolte paysanne du XIVe siècle.' },
        { label: 'la Réforme', why: 'La Réforme est un mouvement religieux du XVIe siècle.' },
        { label: 'la Renaissance', why: 'La Renaissance est un mouvement culturel.' },
      ],
      gap: ['De 1648 à 1653, la ', ' est une réaction à la mise sous tutelle de la noblesse.', ['Fronde']],
      explain: 'La Fronde (1648-1653) est une réaction de la noblesse face au pouvoir royal.',
    },
    {
      ...P.fetes,
      q: 'À quoi servent les fêtes de cour que Louis XIV organise, notamment à Versailles ?',
      a: 'à exercer un contrôle sur les courtisans',
      wrong: [
        { label: 'à élire un nouveau roi', why: 'Le roi n’est pas élu.' },
        { label: 'à financer les voyages de Colomb', why: 'Colomb vit deux siècles plus tôt.' },
        { label: 'à convoquer un concile', why: 'Un concile est une réunion d’évêques.' },
      ],
      gap: [
        'Les fêtes de cour permettent à Louis XIV d’exercer un contrôle sur les ',
        '.',
        ['courtisans', 'courtisan', 'nobles'],
      ],
      explain: 'La fête est un instrument du pouvoir : elle permet de surveiller les courtisans.',
    },
  ],
  paires3: [
    ['François Ier', 'Roi humaniste, allié de Soliman'],
    ['Henri IV', 'Roi de consensus contre les factions'],
    ['Louis XIV', 'Roi guerrier maître de la noblesse'],
  ],
  paires5: [
    ['Marignan', 'Victoire de 1515'],
    ['Pavie', 'Défaite de 1525 et captivité du roi'],
    ['Villers-Cotterêts', 'Le français pour certains textes juridiques (1539)'],
    ['La Fronde', 'Réaction de la noblesse (1648-1653)'],
    ['La révocation', 'Retour sur l’édit de Nantes en 1685'],
  ],
  frise: [
    { ...P.sacre, label: 'Serment du nouveau roi François Ier à Reims', date: '1515' },
    { ...P.villers, label: 'Ordonnance de Villers-Cotterêts', date: '1539' },
    { ...P.repereNantes, label: 'Édit de Nantes', date: '1598' },
    { ...P.fronde, label: 'La Fronde', date: '1648-1653' },
    { ...P.revocation, label: 'Révocation de l’édit de Nantes', date: '1685' },
  ],
  libres: [
    {
      ...P.victoire,
      q: 'quelle victoire de François Ier date de 1515 ? (un nom)',
      accepted: ['Marignan', 'bataille de Marignan', 'la bataille de Marignan'],
      traps: [
        { text: 'Pavie', why: 'Pavie (1525) est une défaite.' },
        { text: 'Lépante', why: 'Lépante (1571) oppose les Ottomans à leurs adversaires en mer.' },
      ],
      explain: 'La victoire de Marignan date de 1515.',
    },
    {
      ...P.villers,
      q: 'quel est le nom de l’ordonnance de 1539 qui impose le français pour certains textes juridiques ? (ordonnance de …)',
      accepted: [
        'Villers-Cotterêts',
        'Villers Cotterêts',
        'Villers-Cotterets',
        'Villers Cotterets',
        'ordonnance de Villers-Cotterêts',
      ],
      traps: [
        { text: 'Nantes', why: 'Nantes donne son nom à l’édit de 1598.' },
        { text: 'Montpellier', why: 'Ce n’est pas le nom de l’ordonnance de 1539 sur le français.' },
      ],
      explain: 'C’est l’ordonnance de Villers-Cotterêts.',
    },
    {
      ...P.revocation,
      q: 'quel roi révoque l’édit de Nantes en 1685 ?',
      accepted: ['Louis XIV', 'Louis 14'],
      traps: [
        { text: 'Henri IV', why: 'Henri IV est associé à l’édit de 1598, que l’on révoque plus tard.' },
        { text: 'François Ier', why: 'François Ier meurt avant les guerres de religion.' },
      ],
      explain: 'Louis XIV révoque l’édit de Nantes en 1685.',
    },
    {
      ...P.fronde,
      q: 'quel nom porte la révolte de 1648-1653 ? (un mot)',
      accepted: ['Fronde', 'la Fronde'],
      traps: [
        { text: 'jacquerie', why: 'La jacquerie est une révolte paysanne médiévale.' },
        { text: 'Réforme', why: 'La Réforme est religieuse et commence au XVIe siècle.' },
      ],
      explain: 'C’est la Fronde.',
    },
  ],
  docs: [
    {
      title: 'Trois rois, trois manières de gouverner',
      lines: [
        'François Ier est un roi humaniste parmi les nobles.',
        'Henri IV est un roi de consensus contre les factions.',
        'Louis XIV est un roi guerrier, maître de la noblesse.',
        'Après les guerres de religion, l’État est seul à garantir l’ordre.',
        'Un enjeu essentiel est alors la mise sous tutelle de la noblesse.',
      ],
      qs: [
        {
          ...P.maitre,
          q: 'Quel roi du texte est présenté comme le maître de la noblesse ?',
          a: 'Louis XIV',
          wrong: [
            { label: 'François Ier', why: 'Ligne 1 : il est un roi humaniste parmi les nobles.' },
            { label: 'Henri IV', why: 'Ligne 2 : il est un roi de consensus.' },
          ],
          explain: 'Ligne 3 : Louis XIV est un roi guerrier, maître de la noblesse.',
        },
        {
          ...P.noblesse,
          q: 'En rapprochant les lignes 4 et 5, que cherche à faire le pouvoir royal après les guerres de religion ?',
          a: 'placer la noblesse sous sa tutelle',
          wrong: [
            {
              label: 'confier l’ordre aux grandes familles nobles',
              why: 'Ligne 4 : l’État est seul à garantir l’ordre.',
            },
            { label: 'laisser la religion garantir la paix', why: 'Ligne 4 : c’est l’État qui garantit l’ordre.' },
          ],
          explain: 'Lignes 4 et 5 : l’État garantit l’ordre et met la noblesse sous tutelle.',
        },
        {
          ...P.consensus,
          q: 'Contre quoi Henri IV cherche-t-il un consensus, d’après la ligne 2 ?',
          a: 'contre les factions',
          wrong: [
            { label: 'contre l’imprimerie', why: 'La ligne 2 parle des factions.' },
            { label: 'contre les navigateurs', why: 'La ligne 2 parle des factions, des groupes rivaux.' },
          ],
          explain: 'Ligne 2 : Henri IV est un roi de consensus contre les factions.',
        },
      ],
    },
    {
      title: 'Un chemin fait de crises',
      lines: [
        'En 1598, le pouvoir royal impose l’édit de Nantes.',
        'Henri IV est ensuite assassiné.',
        'De 1648 à 1653, la Fronde s’oppose au pouvoir royal.',
        'En 1685, Louis XIV révoque l’édit de Nantes.',
        'Le pouvoir « absolu » est une idée : la pratique réelle ne s’y réduit pas.',
      ],
      qs: [
        {
          ...P.assassinat,
          q: 'Que montrent les lignes 2 et 4 sur l’évolution du pouvoir royal ?',
          a: 'elle connaît des crises et des retours en arrière',
          wrong: [
            { label: 'elle avance sans aucun obstacle', why: 'L’assassinat et la révocation montrent des ruptures.' },
            { label: 'elle s’arrête dès 1598', why: 'Les lignes suivantes montrent que l’histoire continue.' },
          ],
          explain:
            'L’assassinat d’Henri IV et la révocation de l’édit montrent que l’évolution ne se fait pas sans crises ni retours en arrière.',
        },
        {
          ...P.pratique,
          q: 'Que faut-il distinguer, d’après la ligne 5 ?',
          a: 'l’idée d’un pouvoir absolu et la façon dont le roi gouverne réellement',
          wrong: [
            {
              label: 'le roi de France et l’empereur ottoman',
              why: 'Ligne 5 : il s’agit de l’idée et de la pratique du pouvoir.',
            },
            { label: 'la Fronde et la Réforme', why: 'Ligne 5 : le texte parle du pouvoir dit absolu.' },
          ],
          explain: 'Ligne 5 : l’idéologie du pouvoir absolu ne dit pas tout de sa pratique.',
        },
        {
          ...P.revocation,
          q: 'Quel texte de la ligne 1 est annulé à la ligne 4 ?',
          a: 'l’édit de Nantes',
          wrong: [
            { label: 'le traité de Tordesillas', why: 'Il partage des terres lointaines en 1494.' },
            { label: 'l’ordonnance de Villers-Cotterêts', why: 'Elle date de 1539 et concerne le français.' },
          ],
          explain: 'En 1685, Louis XIV révoque l’édit de Nantes imposé en 1598.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [decouvertes, humanisme, roi];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'cinquième'));
