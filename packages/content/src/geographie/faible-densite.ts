import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';

/**
 * Sixième, thème 2 « Habiter un espace de faible densité » (lot ge-6e-02). Chaque fait cite une source du registre
 * avec sa citation exacte : programme du cycle 3, ressource Éduscol du thème, INSEE et Trésor de la langue française
 * (CNRTL). Les textes à lire du niveau 5 sont écrits pour l’exercice.
 */

const EDUSCOL = 'eduscol-habiter-faible-densite';
const RURAL = 'insee-territoires-ruraux';
const GRILLE = 'insee-grille-densite';

// Programme du cycle 3.
const P_ADAPTATION =
  'Les sociétés, suivant leurs traditions culturelles et les moyens dont elles disposent, s’y adaptent différemment';
const P_REPRESENTATIONS =
  'On mettra en évidence les représentations dont ces espaces sont parfois l’objet ainsi que les dynamiques qui leur sont propres, notamment en matière de biodiversité';
const P_AGRICOLES =
  'Les espaces de faible densité à vocation agricole recouvrent tout autant des espaces riches intégrés aux dynamiques urbaines que des espaces ruraux en déprise et en voie de désertification';

// Ressource Éduscol « Habiter un espace de faible densité ».
const E_GRENIERS =
  'des espaces très largement et intensément mis en valeur (grands greniers agricoles d’Amérique du Nord, Champagne…)';
const E_RELATIF = 'que l’intensité – voire la réalité – des contraintes dépend de la société';
const E_HETEROGENES = 'que ces espaces de faible densité sont très hétérogènes';
const E_ECOUMENE = 'l’écoumène, l’espace habité par l’humanité, s’étend aujourd’hui à presque toute la planète';
const E_FACTEUR = 'La contrainte doit être entendue comme un facteur limitant que les groupes sociaux subissent';
const E_ATOUT = 'ce qui pouvait être perçu comme une contrainte peut devenir un atout';
const E_CLIMAT =
  'Les contraintes dominantes sont d’ordre climatique (grand froid, sécheresse, chaleur humide…) et de relief (pente, altitude)';
const E_REPONSE = 'L’adaptation, soit la réponse humaine à la contrainte';
const E_AMENAGEMENTS = 'L’adaptation prend la forme d’aménagements et de pratiques qui rendent ces espaces habitables';
const E_INSERTION =
  'Leur insertion est liée à l’exploitation de matières premières, à l’ouverture de fronts pionniers, ou encore à la mise en tourisme du territoire';
const E_REGARD =
  'le résident permanent ne porte pas nécessairement sur la contrainte le même regard que le pratiquant occasionnel';
const E_CONFLITS = 'Elles sont sources de conflits d’usages et d’acteurs';
const E_BIODIVERSITE =
  'un réservoir de ressources à exploiter, dont certaines de manière durable, ou à protéger, dans le cadre de réserves ou de parcs naturels';
const E_OSCILLENT = 'les sociétés oscillent entre préservation et exploitation des ressources de leur territoire';
const E_CAMPAGNES = 'Les campagnes ne sont d’ailleurs jamais seulement agricoles';
const E_CONTRASTES =
  'des espaces agricoles marqués par la baisse démographique, des fronts pionniers en voie de consolidation ou des espaces agricoles dynamiques et intégrés aux espaces urbanisés qu’ils approvisionnent';
const E_COURS = 'pouvant suivre les cours mondiaux des produits agricoles';
const E_EFFICACITE =
  'La faible densité va alors de pair avec l’efficacité agricole liée aux acteurs productifs (voire un productivisme critiqué)';
const E_FLUX =
  'Ces territoires sont reliés à leur espace national et au monde par un ensemble de flux liés à l’activité agricole';
const E_VIVRIERE = 'agriculture peu productive, principalement vivrière, déclin démographique';
const E_SECHERESSES =
  'espace d’agriculture vivrière, fragilisé par les changements ou plus simplement par des sécheresses marquées, comme au Sud du Mali';
const E_NOMADISME =
  'Le nomadisme peut être parfois une réponse et une adaptation à de très fortes contraintes aux marges de l’écoumène';
const E_TRAVAIL = 'le travail humain est à l’origine des produits qu’il trouve dans son assiette';

// INSEE.
const I_ARTIFICIEL =
  'Faiblement artificialisés et relativement peu peuplés, les espaces ruraux ne sont pas pour autant des espaces naturels';
const I_ACTIVITES = 'Les secteurs d’activité agricole et industrielle sont des marqueurs forts du rural';
const I_TOURISME = 'Le tourisme est très présent dans le rural';
// INSEE, « La grille de densité 2025 ».
const I_GRILLE =
  'La grille communale permet de distinguer trois types de communes : les communes densément peuplées ; les communes de densité intermédiaire ; les communes rurales. Les communes densément peuplées et les communes de densité intermédiaire constituent l’espace urbain';

// Trésor de la langue française informatisé (CNRTL).
const C_ARIDE = 'Dépourvu d’humidité, sec. Roche, sable aride';
const C_STEPPE =
  'Formation végétale constituée de plantes xérophiles herbacées ou ligneuses, le plus souvent en touffes espacées, qui croissent sous un climat continental sec en été ou un climat tropical semi-aride';
const C_TOUNDRA = 'Formation végétale de climat froid, composée de mousses, de lichens, de quelques arbres nains';
const C_PERGELISOL = 'Zone du sol ou du sous-sol, gelé en permanence et complètement imperméable';
const C_OASIS = 'Endroit d’un désert qui, grâce à un point d’eau, présente de la végétation et permet la culture';
const C_NOMADE = 'Qui n’a pas de demeure, d’établissement fixe';
const C_INSULARITE = 'État d’un pays, d’un territoire formé d’une ou de plusieurs îles';
const C_VIVRIER = 'Qui est destiné à l’alimentation';
const C_PATURAGE = 'Terrain couvert d’herbe, réservé à l’alimentation du bétail sur place';
const C_EXODE = 'Phénomène continu de dépeuplement des campagnes au profit des villes';
const C_CEREALIER = 'Qui est producteur de céréales';

// ——— Notion 1 : espaces à fortes contraintes et de grande biodiversité ———

const fortesContraintes: Notion = {
  classe: '6e',
  id: 'g6-fortes-contraintes',
  title: 'Les espaces à fortes contraintes',
  hint: 'Demande-toi ce qui gêne l’installation des habitants, comment ils s’y prennent et qui regarde cet espace.',
  memo: [
    'Un espace à forte **contrainte** naturelle gêne l’occupation humaine : grand froid, sécheresse, pente, altitude, île. Il reste pourtant habité.',
    'L’**adaptation** dépend de la société et de ses moyens : aménagements et pratiques rendent l’espace habitable. Exemple : le nomadisme dans une steppe.',
    'Ces espaces changent (tourisme, ressources) et leur **biodiversité** oppose parfois exploitation et protection.',
  ],
  faits: [
    {
      q: 'Dans un espace à fortes contraintes, qu’est-ce qu’une contrainte ?',
      a: 'un facteur qui limite et que les sociétés subissent ou surmontent',
      wrong: [
        {
          label: 'une règle qui interdit définitivement d’habiter',
          why: 'Une contrainte n’interdit pas d’habiter : les sociétés peuvent la surmonter, voire en faire un atout.',
        },
        {
          label: 'une ressource que l’on peut seulement exploiter',
          why: 'C’est l’inverse : une contrainte limite. Elle peut devenir un atout, mais ce n’est pas sa définition.',
        },
        {
          label: 'le nombre d’habitants par kilomètre carré',
          why: 'Ce nombre est la densité. La contrainte est ce qui limite l’occupation humaine.',
        },
      ],
      gap: ['La contrainte est un facteur ', ' que les groupes sociaux subissent ou surmontent.', ['limitant']],
      choix: ['limitant', 'favorisant', 'urbain'],
      quote: E_FACTEUR,
      explain: 'Une contrainte limite : les sociétés la subissent, la surmontent ou la transforment en atout.',
      src: EDUSCOL,
    },
    {
      q: 'Quel exemple est une contrainte d’ordre climatique ?',
      a: 'la sécheresse',
      wrong: [
        { label: 'l’altitude', why: 'L’altitude est une contrainte de relief, pas de climat.' },
        { label: 'l’insularité', why: 'Être une île est une contrainte de situation, pas de climat.' },
        { label: 'la pente', why: 'La pente est une contrainte de relief.' },
      ],
      gap: ['Les contraintes climatiques sont le grand froid, la ', ' ou la chaleur humide.', ['sécheresse']],
      quote: E_CLIMAT,
      explain:
        'Le climat contraint par le grand froid, la sécheresse ou la chaleur humide ; la pente et l’altitude relèvent du relief.',
      src: EDUSCOL,
    },
    {
      q: 'Comment l’intensité des contraintes d’un espace s’explique-t-elle ?',
      a: 'elle dépend aussi de la société qui y est confrontée et de son développement',
      wrong: [
        {
          label: 'elle est la même pour toutes les sociétés',
          why: 'Les sociétés n’ont pas les mêmes moyens : la même contrainte pèse différemment.',
        },
        {
          label: 'elle ne dépend que du climat',
          why: 'C’est l’idée du « milieu qui décide de tout », à éviter : la société et ses moyens comptent.',
        },
        {
          label: 'elle disparaît partout quand le temps passe',
          why: 'La perception change dans le temps, mais les contraintes ne disparaissent pas partout.',
        },
      ],
      gap: ['L’intensité des contraintes dépend de la ', ' qui y est confrontée.', ['société', 'societe']],
      choix: ['société', 'pente', 'saison'],
      quote: E_RELATIF,
      explain: 'La contrainte est relative : elle dépend de la société confrontée et de son niveau de développement.',
      src: EDUSCOL,
    },
    {
      q: 'Que désigne l’adaptation dans l’étude d’un espace contraignant ?',
      a: 'la réponse humaine à la contrainte',
      wrong: [
        {
          label: 'la disparition de la contrainte',
          why: 'S’adapter, ce n’est pas faire disparaître le froid ou la sécheresse : c’est y répondre.',
        },
        {
          label: 'l’abandon de cet espace par tous ses habitants',
          why: 'Partir n’est pas la définition : l’adaptation permet de continuer à habiter.',
        },
        {
          label: 'la contrainte elle-même',
          why: 'La contrainte est le problème ; l’adaptation est la réponse des sociétés.',
        },
      ],
      gap: ['L’adaptation est la réponse ', ' à la contrainte.', ['humaine']],
      choix: ['humaine', 'climatique', 'automatique'],
      quote: E_REPONSE,
      explain: 'Les sociétés répondent à la contrainte par des aménagements et des pratiques.',
      src: EDUSCOL,
    },
    {
      q: 'Selon le programme, comment les sociétés s’adaptent-elles aux contraintes ?',
      a: 'différemment, selon leurs traditions culturelles et leurs moyens',
      wrong: [
        {
          label: 'toutes de la même façon',
          why: 'Les traditions et les moyens varient : les adaptations varient aussi.',
        },
        {
          label: 'sans jamais utiliser de moyens techniques',
          why: 'Les moyens dont disposent les sociétés comptent justement dans l’adaptation.',
        },
        {
          label: 'uniquement selon la taille des villes voisines',
          why: 'Le programme cite les traditions culturelles et les moyens, pas la taille des villes.',
        },
      ],
      gap: ['Les sociétés s’adaptent selon leurs traditions ', ' et leurs moyens.', ['culturelles']],
      choix: ['culturelles', 'climatiques', 'électorales'],
      quote: P_ADAPTATION,
      explain: 'À contrainte égale, deux sociétés peuvent habiter l’espace de manière différente.',
    },
    {
      q: 'Face à une grande biodiversité, entre quels choix les sociétés oscillent-elles ?',
      a: 'préserver ou exploiter les ressources',
      wrong: [
        {
          label: 'construire des métropoles ou des ports',
          why: 'La question posée par la biodiversité est la protection ou l’exploitation des ressources.',
        },
        {
          label: 'augmenter ou réduire la pente',
          why: 'La pente est un relief : elle n’a rien à voir avec ce choix.',
        },
        {
          label: 'choisir l’hiver ou l’été',
          why: 'Les saisons ne se choisissent pas : il s’agit de préserver ou d’exploiter.',
        },
      ],
      gap: ['Les sociétés oscillent entre préservation et ', ' des ressources de leur territoire.', ['exploitation']],
      choix: ['exploitation', 'disparition', 'invention'],
      quote: E_OSCILLENT,
      explain: 'Réserves et parcs naturels protègent ; d’autres acteurs veulent exploiter les mêmes ressources.',
      src: EDUSCOL,
    },
    {
      q: 'Dans un espace de grande biodiversité, à quoi servent les réserves et les parcs naturels ?',
      a: 'à protéger l’espace et ses ressources',
      wrong: [
        {
          label: 'à exploiter toutes les ressources sans limite',
          why: 'C’est le contraire : une réserve encadre les usages pour protéger.',
        },
        {
          label: 'à construire une métropole',
          why: 'Un parc naturel n’est pas un projet de grande ville.',
        },
        {
          label: 'à faire disparaître les contraintes',
          why: 'Un parc ne supprime ni le froid ni la pente : il protège.',
        },
      ],
      gap: [
        'Les réserves et les parcs naturels servent à ',
        ' des espaces de grande biodiversité.',
        ['protéger', 'proteger'],
      ],
      choix: ['protéger', 'bétonner', 'vider'],
      quote: E_BIODIVERSITE,
      explain: 'Certains acteurs voient un réservoir de ressources à exploiter, d’autres un espace à protéger.',
      src: EDUSCOL,
    },
    {
      q: 'Le programme invite à étudier les images que l’on se fait de ces espaces. Comment les appelle-t-il ?',
      a: 'des représentations',
      wrong: [
        { label: 'des densités', why: 'La densité est un nombre d’habitants par unité de surface, pas une image.' },
        { label: 'des adaptations', why: 'L’adaptation est la réponse humaine à la contrainte.' },
        { label: 'des frontières', why: 'Une frontière sépare des territoires : ce n’est pas une image.' },
      ],
      gap: [
        'Les espaces à fortes contraintes sont parfois l’objet de ',
        ', des images que l’on se fait d’eux.',
        ['représentations', 'représentation'],
      ],
      choix: ['représentations', 'élections', 'récoltes'],
      quote: P_REPRESENTATIONS,
      explain:
        'Un même désert peut être vu comme hostile ou comme un paysage à découvrir : ce sont des représentations.',
    },
  ],
  paires3: [
    ['Contrainte', 'Facteur qui limite l’occupation humaine'],
    ['Adaptation', 'Réponse humaine à la contrainte'],
    ['Biodiversité', 'Diversité des êtres vivants'],
  ],
  paires5: [
    ['Contrainte', 'Facteur qui limite l’occupation humaine'],
    ['Adaptation', 'Réponse humaine à la contrainte'],
    ['Parc naturel', 'Cadre qui sert à protéger une ressource'],
    ['Pente', 'Contrainte de relief'],
    ['Sécheresse', 'Contrainte de climat'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la réponse des sociétés à une contrainte ?',
      accepted: ['adaptation', 'l’adaptation'],
      traps: [
        { text: 'contrainte', why: 'La contrainte est le facteur qui limite, pas la réponse.' },
        { text: 'densité', why: 'La densité est le nombre d’habitants par kilomètre carré.' },
      ],
      quote: E_REPONSE,
      explain: 'S’adapter, c’est répondre à la contrainte.',
      src: EDUSCOL,
    },
    {
      q: 'Être formé d’une ou de plusieurs îles : quel nom désigne cette contrainte ?',
      accepted: ['insularité', 'l’insularité'],
      traps: [
        { text: 'enclavement', why: 'L’enclavement désigne un espace mal relié, pas un territoire formé d’îles.' },
        { text: 'altitude', why: 'L’altitude est une hauteur par rapport à la mer.' },
      ],
      quote: C_INSULARITE,
      explain: 'L’insularité est l’état d’un territoire formé d’îles ; c’est une contrainte à prendre en compte.',
      src: 'cnrtl-insularite',
    },
    {
      q: 'Avec le temps, ce qui était perçu comme une contrainte peut devenir un … (un mot).',
      accepted: ['atout', 'un atout', 'avantage', 'un avantage'],
      traps: [
        { text: 'interdit', why: 'Une contrainte ne devient pas un interdit : elle peut devenir un avantage.' },
        { text: 'désert', why: 'Le désert est un type d’espace, pas un avantage.' },
      ],
      quote: E_ATOUT,
      explain: 'Ce qui gênait peut devenir un atout, par exemple pour le tourisme, et l’inverse aussi.',
      src: EDUSCOL,
    },
  ],
  docs: [
    {
      title: 'Dans une vallée de haute montagne',
      lines: [
        'Les pentes sont raides et la neige coupe la route plusieurs semaines en hiver.',
        'Des agriculteurs cultivent des terrasses (des champs en marches sur la pente) et conservent des provisions.',
        'Des visiteurs viennent l’été pour marcher et voient surtout un paysage à admirer.',
      ],
      qs: [
        {
          q: 'Pourquoi le visiteur et l’habitant ne jugent-ils pas la contrainte de la même façon ?',
          a: 'ils n’ont pas le même rapport à cet espace : l’un y vit toute l’année, l’autre y passe',
          wrong: [
            {
              label: 'le relief change quand les visiteurs arrivent',
              why: 'Le relief reste le même : ce sont les regards qui diffèrent.',
            },
            {
              label: 'seul le visiteur peut observer la neige',
              why: 'Le texte montre que les habitants subissent la neige : ils la connaissent bien.',
            },
          ],
          quote: E_REGARD,
          explain:
            'Le résident permanent et le pratiquant occasionnel ne portent pas le même regard sur la contrainte.',
          src: EDUSCOL,
        },
        {
          q: 'Que montrent les terrasses et les provisions ?',
          a: 'une adaptation des habitants à la contrainte',
          wrong: [
            {
              label: 'que la montagne n’a aucune contrainte',
              why: 'La pente et la neige sont des contraintes : les terrasses y répondent.',
            },
            {
              label: 'que la vallée est devenue une métropole',
              why: 'Une métropole est une très grande ville : le texte décrit une vallée peu peuplée.',
            },
          ],
          quote: E_AMENAGEMENTS,
          explain: 'L’adaptation passe par des aménagements et des pratiques qui rendent l’espace habitable.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Un projet près d’une forêt dense',
      lines: [
        'Une forêt dense abrite de nombreuses espèces.',
        'Une entreprise veut y couper du bois ; une association demande une réserve.',
        'Des familles qui vivent là y cueillent des plantes depuis longtemps.',
      ],
      qs: [
        {
          q: 'Quel type de situation ce texte décrit-il ?',
          a: 'un conflit d’usages entre acteurs autour d’un espace de grande biodiversité',
          wrong: [
            {
              label: 'un accord de tous sur un seul usage de la forêt',
              why: 'L’entreprise et l’association veulent des choses opposées : il n’y a pas d’accord.',
            },
            {
              label: 'un espace sans habitants ni activité',
              why: 'Des familles y cueillent et une entreprise veut y travailler.',
            },
          ],
          quote: E_CONFLITS,
          explain: 'Protéger, exploiter, vivre sur place : les acteurs s’opposent sur l’usage du même espace.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Un territoire du Grand Nord',
      lines: [
        'Les hivers sont très froids et les villages sont éloignés les uns des autres.',
        'Une mine ouvre : des travailleurs arrivent pour quelques mois, une piste d’avion est aménagée.',
        'Les habitants permanents découvrent de nouveaux échanges avec le reste du monde.',
      ],
      qs: [
        {
          q: 'Que prouve l’ouverture de la mine sur cet espace de faible densité ?',
          a: 'il change et se relie davantage au reste du monde',
          wrong: [
            {
              label: 'il est figé et coupé de tout',
              why: 'La mine et la piste d’avion montrent un changement et des liens nouveaux.',
            },
            {
              label: 'le froid y a disparu',
              why: 'Le froid reste une contrainte : seuls les usages et les liaisons changent.',
            },
          ],
          quote: E_INSERTION,
          explain: 'Exploiter des matières premières insère ces espaces dans le monde : ils ne sont pas figés.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

// ——— Notion 2 : espaces agricoles de faible densité ———

const espacesAgricoles: Notion = {
  classe: '6e',
  id: 'g6-espaces-agricoles',
  title: 'Les espaces agricoles peu peuplés',
  hint: 'Compare : à qui vend-on la production, avec quels liens vers les villes et le monde ?',
  memo: [
    'Un espace agricole peu peuplé peut être riche, **compétitif** et relié aux villes et au monde, comme une grande plaine céréalière.',
    'Il peut aussi être fragile, en **déprise** : agriculture **vivrière** peu productive, routes rares, habitants qui partent.',
    'Dans les deux cas, la faible densité n’empêche ni les activités ni les flux (marchandises, personnes, informations).',
  ],
  faits: [
    {
      q: 'Les espaces de faible densité à vocation agricole sont-ils tous pauvres ?',
      a: 'non : certains sont riches et intégrés aux dynamiques urbaines',
      wrong: [
        {
          label: 'oui : peu d’habitants veut toujours dire pauvreté',
          why: 'Faible densité ne signifie pas pauvreté : certains espaces sont riches et intégrés.',
        },
        {
          label: 'non : ils sont tous riches',
          why: 'D’autres espaces ruraux sont en déprise : les situations sont différentes.',
        },
        {
          label: 'oui : aucun n’est relié aux villes',
          why: 'Certains approvisionnent les espaces urbanisés et leur sont intégrés.',
        },
      ],
      gap: [
        'Certains espaces agricoles sont riches et ',
        ' aux dynamiques urbaines.',
        ['intégrés', 'intégré', 'integres'],
      ],
      choix: ['intégrés', 'étrangers', 'cachés'],
      quote: P_AGRICOLES,
      explain: 'Le programme distingue des espaces riches intégrés aux villes et des espaces en déprise.',
    },
    {
      q: 'Dans une grande région céréalière peu peuplée et compétitive, qu’est-ce qui accompagne la faible densité ?',
      a: 'une agriculture très efficace, qui produit beaucoup avec peu de personnes',
      wrong: [
        {
          label: 'l’absence totale d’agriculture',
          why: 'La région est céréalière : l’agriculture y est justement très présente.',
        },
        {
          label: 'une agriculture seulement vivrière',
          why: 'Une agriculture vivrière nourrit d’abord la famille : ici la production est compétitive.',
        },
        {
          label: 'une absence de liens avec le reste du monde',
          why: 'Ces territoires sont reliés au monde par des flux et un marché mondial.',
        },
      ],
      gap: [
        'Dans une grande région céréalière compétitive, la faible densité va de pair avec l’',
        ' agricole.',
        ['efficacité', 'efficacite'],
      ],
      choix: ['efficacité', 'absence', 'interdiction'],
      quote: E_EFFICACITE,
      explain:
        'Peu de personnes peuvent produire beaucoup avec des moyens importants ; ce modèle est parfois critiqué.',
      src: EDUSCOL,
    },
    {
      q: 'Par quoi les grandes régions agricoles compétitives sont-elles reliées à leur pays et au monde ?',
      a: 'des flux liés à l’activité agricole',
      wrong: [
        {
          label: 'des frontières fermées',
          why: 'Des frontières fermées empêcheraient les échanges : ces régions sont reliées par des flux.',
        },
        {
          label: 'une absence de routes',
          why: 'Sans voies de transport, la production ne pourrait pas circuler.',
        },
        {
          label: 'la seule consommation des familles sur place',
          why: 'La consommation sur place correspond à une agriculture vivrière, pas à ces régions.',
        },
      ],
      gap: ['Les grandes régions agricoles sont reliées au monde par des ', ' liés à l’activité agricole.', ['flux']],
      choix: ['flux', 'frontières', 'déserts'],
      quote: E_FLUX,
      explain: 'La production part vers les villes et vers l’étranger : ce sont des flux.',
      src: EDUSCOL,
    },
    {
      q: 'Qu’est-ce qui caractérise l’agriculture d’un espace rural fragile ?',
      a: 'une agriculture peu productive qui sert d’abord à nourrir sur place',
      wrong: [
        {
          label: 'une production surtout destinée au marché mondial',
          why: 'Le marché mondial concerne les régions compétitives, pas une agriculture vivrière.',
        },
        {
          label: 'une agriculture très mécanisée et très riche',
          why: 'L’espace fragile se caractérise au contraire par une faible productivité.',
        },
        {
          label: 'une population qui augmente sans cesse grâce aux machines',
          why: 'Ces espaces fragiles connaissent souvent un déclin démographique.',
        },
      ],
      gap: [
        'Dans un espace rural fragile, l’agriculture, peu productive, est principalement ',
        '.',
        ['vivrière', 'vivriere'],
      ],
      choix: ['vivrière', 'industrielle', 'touristique'],
      quote: E_VIVRIERE,
      explain: 'Une agriculture vivrière sert d’abord à nourrir : elle produit peu à vendre.',
      src: EDUSCOL,
    },
    {
      q: 'Dans certains espaces agricoles fragiles comme le sud du Mali, qu’est-ce qui fragilise l’agriculture vivrière ?',
      a: 'des sécheresses marquées',
      wrong: [
        {
          label: 'la construction de gratte-ciel',
          why: 'Les gratte-ciel appartiennent aux métropoles, pas à cet espace agricole.',
        },
        {
          label: 'un surplus de métros',
          why: 'Le métro est un transport urbain : il ne fragilise pas cette agriculture.',
        },
        {
          label: 'l’excès de neige en été',
          why: 'Dans cet exemple, c’est le manque d’eau qui fragilise.',
        },
      ],
      gap: ['Au sud du Mali, des ', ' marquées fragilisent l’agriculture vivrière.', ['sécheresses', 'sécheresse']],
      choix: ['sécheresses', 'constructions', 'récoltes'],
      quote: E_SECHERESSES,
      explain: 'Le manque d’eau pèse lourd quand on vit de ses propres cultures.',
      src: EDUSCOL,
    },
    {
      q: 'Qui peut suivre les cours mondiaux (les prix sur les marchés) des produits agricoles ?',
      a: 'des agriculteurs, comme le céréalier nord-américain ou d’autres avec l’internet mobile',
      wrong: [
        {
          label: 'seulement les habitants des métropoles',
          why: 'Des agriculteurs, loin des villes, peuvent aussi suivre les prix.',
        },
        {
          label: 'personne, car ces prix sont secrets',
          why: 'Les cours se consultent, par exemple avec l’internet mobile.',
        },
        {
          label: 'uniquement les touristes',
          why: 'Les touristes visitent ; ce sont les producteurs qui suivent les prix de leurs produits.',
        },
      ],
      gap: [
        'Certains agriculteurs peuvent suivre les ',
        ' mondiaux, c’est-à-dire les prix des produits agricoles.',
        ['cours'],
      ],
      choix: ['cours', 'récits', 'climats'],
      quote: E_COURS,
      explain: 'Les cours sont les prix qui changent sur les marchés : ces campagnes sont insérées dans le monde.',
      src: EDUSCOL,
    },
    {
      q: 'Les grandes plaines céréalières d’Amérique du Nord et la Champagne sont des exemples d’espaces…',
      a: 'très largement et intensément mis en valeur',
      wrong: [
        {
          label: 'sans aucune activité humaine',
          why: 'Ce sont des greniers agricoles : l’activité y est très forte.',
        },
        {
          label: 'cultivés seulement pour nourrir les familles voisines',
          why: 'Un grenier agricole produit en grande quantité, bien au-delà des besoins locaux.',
        },
        {
          label: 'transformés en grandes forêts protégées',
          why: 'Ces espaces sont consacrés à l’agriculture, pas à une réserve forestière.',
        },
      ],
      gap: ['Les greniers agricoles sont des espaces intensément mis en ', '.', ['valeur']],
      choix: ['valeur', 'sommeil', 'réserve'],
      quote: E_GRENIERS,
      explain: 'On peut avoir peu d’habitants et une agriculture très intense.',
      src: EDUSCOL,
    },
  ],
  paires3: [
    ['Agriculture vivrière', 'Agriculture destinée d’abord à l’alimentation'],
    ['Céréalier', 'Exploitant agricole qui produit des céréales'],
    ['Flux', 'Circulation de produits entre territoires'],
  ],
  paires5: [
    ['Agriculture vivrière', 'Agriculture destinée d’abord à l’alimentation'],
    ['Céréalier', 'Exploitant agricole qui produit des céréales'],
    ['Pâturage', 'Terrain d’herbe qui nourrit le bétail sur place'],
    ['Déclin démographique', 'Baisse du nombre d’habitants'],
    ['Grenier agricole', 'Grande région intensément mise en valeur'],
  ],
  libres: [
    {
      q: 'Quel adjectif, commençant par « v », qualifie une agriculture destinée d’abord à l’alimentation ?',
      accepted: ['vivrière', 'vivrier', 'agriculture vivrière', 'une agriculture vivrière'],
      traps: [
        { text: 'céréalière', why: 'Céréalière précise le produit, pas la destination.' },
        { text: 'urbaine', why: 'Urbaine veut dire « de la ville » : ce n’est pas la destination.' },
      ],
      quote: C_VIVRIER,
      explain: 'Vivrier signifie « destiné à l’alimentation ».',
      src: 'cnrtl-vivrier',
    },
    {
      q: 'Quel nom désigne un exploitant agricole qui produit des céréales ?',
      accepted: ['céréalier', 'un céréalier', 'céréalière', 'une céréalière'],
      traps: [
        { text: 'éleveur', why: 'L’éleveur élève des animaux.' },
        { text: 'forestier', why: 'Le forestier travaille la forêt.' },
      ],
      quote: C_CEREALIER,
      explain: 'Le céréalier cultive des céréales comme le blé.',
      src: 'cnrtl-cerealier',
    },
    {
      q: 'Comment appelle-t-on un terrain couvert d’herbe qui nourrit le bétail sur place ?',
      accepted: ['pâturage', 'un pâturage', 'pâturages', 'des pâturages'],
      traps: [
        { text: 'oasis', why: 'Une oasis est un lieu de végétation dans un désert.' },
        { text: 'toundra', why: 'La toundra est une végétation de climat froid, pas un terrain réservé au bétail.' },
      ],
      quote: C_PATURAGE,
      explain: 'Le pâturage sert à nourrir les animaux là où l’herbe pousse.',
      src: 'cnrtl-paturage',
    },
  ],
  docs: [
    {
      title: 'Une exploitation d’une grande plaine',
      lines: [
        'Une seule famille cultive de très vastes champs de blé avec de grosses machines.',
        'Les voisins habitent à plusieurs kilomètres.',
        'La récolte part par le train vers un port ; l’agricultrice consulte les prix mondiaux sur son téléphone.',
      ],
      qs: [
        {
          q: 'Quel type d’espace agricole ce texte décrit-il ?',
          a: 'un espace peu peuplé mais efficace et relié au monde',
          wrong: [
            {
              label: 'un espace peu peuplé et coupé de tout',
              why: 'Le train, le port et le téléphone montrent des liens nombreux.',
            },
            {
              label: 'un espace d’agriculture vivrière en difficulté',
              why: 'La récolte est vendue au loin : elle ne sert pas d’abord à nourrir la famille.',
            },
          ],
          quote: E_FLUX,
          explain: 'La faible densité va avec une production importante reliée au pays et au monde par des flux.',
          src: EDUSCOL,
        },
        {
          q: 'Pourquoi cet espace approvisionne-t-il d’autres lieux ?',
          a: 'sa récolte circule vers un port et un marché plus vaste',
          wrong: [
            { label: 'il n’a aucun moyen de transport', why: 'Le train transporte justement la récolte.' },
            {
              label: 'les voisins consomment toute la récolte',
              why: 'Le texte dit que la récolte part vers un port.',
            },
          ],
          quote: E_CONTRASTES,
          explain: 'Certaines campagnes dynamiques approvisionnent les espaces urbanisés et le reste du monde.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Un village d’agriculteurs',
      lines: [
        'Les familles cultivent du mil pour se nourrir.',
        'Cette année, la pluie a manqué et la piste vers la ville est difficile.',
        'Plusieurs jeunes sont partis chercher du travail ailleurs.',
      ],
      qs: [
        {
          q: 'Quels indices montrent un espace rural fragile ?',
          a: 'une agriculture pour se nourrir, une sécheresse, une piste difficile et des départs',
          wrong: [
            {
              label: 'des exportations massives et de grandes machines',
              why: 'Le texte ne montre ni machines ni exportations.',
            },
            {
              label: 'une population en forte hausse grâce au tourisme',
              why: 'Des jeunes partent et aucun tourisme n’est cité.',
            },
          ],
          quote: E_VIVRIERE,
          explain: 'Agriculture vivrière et peu productive, sécheresse, liaisons difficiles et déclin démographique.',
          src: EDUSCOL,
        },
      ],
    },
    {
      title: 'Du champ à l’assiette',
      lines: [
        'À midi, un élève mange du pain, des lentilles et un yaourt.',
        'Dans le blé, les lentilles et le lait, il y a le travail d’agriculteurs et d’agricultrices.',
        'Beaucoup travaillent dans des campagnes peu peuplées.',
      ],
      qs: [
        {
          q: 'Qu’est-ce que ce repas permet de comprendre ?',
          a: 'le travail des campagnes est à l’origine de ce que l’on mange',
          wrong: [
            {
              label: 'les aliments apparaissent seuls dans les magasins',
              why: 'Le texte montre un travail humain derrière chaque aliment.',
            },
            {
              label: 'les campagnes peu peuplées ne produisent rien',
              why: 'Elles produisent justement le blé, les lentilles ou le lait.',
            },
          ],
          quote: E_TRAVAIL,
          explain: 'Le travail humain est à l’origine des produits trouvés dans l’assiette.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

// ——— Notion 3 : habiter un espace rural ———

const habiterRural: Notion = {
  classe: '6e',
  id: 'g6-habiter-rural',
  title: 'Habiter un espace rural',
  hint: 'Pense à la densité, aux activités variées et aux liens avec la ville la plus proche.',
  memo: [
    'L’INSEE classe les communes en trois catégories avec sa **grille de densité** : densément peuplées, de densité intermédiaire et rurales. L’**espace rural** réunit les communes rurales.',
    'Le rural n’est pas seulement agricole : on y trouve aussi de l’industrie, du tourisme et des habitants liés à la ville voisine.',
    'Les espaces ruraux sont divers : certains sont riches et liés aux villes, d’autres sont en **déprise**.',
  ],
  faits: [
    {
      q: 'Pour l’INSEE, quelles communes forment l’espace rural ?',
      a: 'les communes ni densément peuplées ni de densité intermédiaire',
      wrong: [
        {
          label: 'les seules communes sans habitants',
          why: 'Les communes rurales sont habitées.',
        },
        {
          label: 'les communes densément peuplées',
          why: 'Elles forment l’espace urbain, comme les communes de densité intermédiaire.',
        },
        {
          label: 'toutes les communes situées en montagne',
          why: 'La grille classe les communes selon la densité, pas selon le relief.',
        },
      ],
      gap: [
        'L’espace rural réunit les communes qui ne sont ni densément peuplées ni de densité ',
        '.',
        ['intermédiaire'],
      ],
      quote: I_GRILLE,
      explain: 'Les deux autres catégories forment l’espace urbain : les communes rurales forment l’espace rural.',
      src: GRILLE,
    },
    {
      q: 'D’après le programme, tous les espaces agricoles de faible densité se ressemblent-ils ?',
      a: 'non : certains sont riches et liés aux villes, d’autres sont en déprise',
      wrong: [
        { label: 'oui : ils sont tous en déprise', why: 'Certains sont au contraire des espaces riches.' },
        {
          label: 'oui : ils sont tous riches et en croissance',
          why: 'Certains sont en déprise et en voie de désertification.',
        },
        {
          label: 'non : aucun d’eux n’a de lien avec les villes',
          why: 'Des espaces riches sont intégrés aux dynamiques urbaines.',
        },
      ],
      gap: ['Certains espaces ruraux perdent des habitants et des activités : ils sont en ', '.', ['déprise']],
      choix: ['déprise', 'croissance', 'ville'],
      quote: P_AGRICOLES,
      explain: 'La faible densité recouvre des situations opposées.',
    },
    {
      q: 'Les espaces ruraux sont-ils des espaces naturels, sans trace des sociétés ?',
      a: 'non : peu artificialisés et peu peuplés, ils portent la marque des sociétés',
      wrong: [
        {
          label: 'oui : personne ne les a jamais transformés',
          why: 'Champs, routes et villages montrent que les sociétés les transforment.',
        },
        {
          label: 'oui : ils sont tous couverts de forêts vierges',
          why: 'Les usages du sol y sont variés.',
        },
        {
          label: 'non : ils sont aussi bétonnés que les grandes villes',
          why: 'Ils sont au contraire faiblement artificialisés.',
        },
      ],
      gap: ['Les espaces ruraux ne sont pas pour autant des espaces ', '.', ['naturels']],
      choix: ['naturels', 'habités', 'français'],
      quote: I_ARTIFICIEL,
      explain: 'Les marques des sociétés y sont plus discrètes qu’en ville, mais bien présentes.',
      src: RURAL,
    },
    {
      q: 'Une campagne est-elle uniquement un espace agricole ?',
      a: 'non : elle n’est jamais seulement agricole',
      wrong: [
        {
          label: 'oui : on y fait seulement de l’agriculture',
          why: 'Industrie, tourisme et logement s’y trouvent aussi.',
        },
        {
          label: 'non : l’agriculture y a disparu partout',
          why: 'L’agriculture reste importante dans le rural.',
        },
        {
          label: 'oui : aucun habitant n’y travaille ailleurs',
          why: 'Des habitants de campagnes travaillent en ville.',
        },
      ],
      gap: ['Les campagnes ne sont jamais ', ' agricoles.', ['seulement', 'uniquement']],
      choix: ['seulement', 'du tout', 'encore'],
      quote: E_CAMPAGNES,
      explain: 'D’autres usages et activités se mêlent à l’agriculture.',
      src: EDUSCOL,
    },
    {
      q: 'Quel lien des espaces agricoles dynamiques peuvent-ils avoir avec les espaces urbanisés ?',
      a: 'ils les approvisionnent',
      wrong: [
        {
          label: 'ils n’ont aucun échange avec eux',
          why: 'Ces espaces agricoles sont intégrés aux espaces urbanisés.',
        },
        {
          label: 'ils les remplacent par des forêts',
          why: 'Le lien décrit est autre : ces campagnes fournissent des produits aux villes.',
        },
        {
          label: 'ils leur interdisent de s’étendre',
          why: 'Le lien décrit est l’approvisionnement, pas une interdiction.',
        },
      ],
      gap: ['Des espaces agricoles dynamiques ', ' les espaces urbanisés.', ['approvisionnent']],
      choix: ['approvisionnent', 'ignorent', 'remplacent'],
      quote: E_CONTRASTES,
      explain: 'La campagne et la ville sont reliées : la première fournit des produits à la seconde.',
      src: EDUSCOL,
    },
    {
      q: 'Quelles activités sont des marqueurs forts du rural en France ?',
      a: 'l’agriculture et l’industrie',
      wrong: [
        {
          label: 'la recherche et les sièges de grandes entreprises',
          why: 'Les cadres et les fonctions métropolitaines se concentrent plutôt dans l’urbain.',
        },
        { label: 'les services aux entreprises surtout', why: 'Ils sont surreprésentés dans l’urbain.' },
        { label: 'la seule pêche en mer', why: 'La pêche ne concerne qu’une partie du littoral.' },
      ],
      gap: ['Agriculture et ', ' sont des marqueurs forts du rural.', ['industrie', 'l’industrie']],
      quote: I_ACTIVITES,
      explain: 'Ces deux secteurs d’activité caractérisent fortement le rural.',
      src: RURAL,
    },
  ],
  paires3: [
    ['Espace rural', 'Communes ni densément peuplées ni de densité intermédiaire'],
    ['Déprise', 'Recul des habitants et des activités'],
    ['Exode rural', 'Départ des campagnes vers les villes'],
  ],
  paires5: [
    ['Espace rural', 'Communes ni densément peuplées ni de densité intermédiaire'],
    ['Déprise', 'Recul des habitants et des activités'],
    ['Exode rural', 'Départ des campagnes vers les villes'],
    ['Tourisme', 'Activité très présente dans les campagnes éloignées de l’influence des villes'],
    ['Espace urbain', 'Communes densément peuplées ou de densité intermédiaire'],
  ],
  libres: [
    {
      q: 'Quel adjectif désigne l’espace des communes ni densément peuplées ni de densité intermédiaire ?',
      accepted: ['rural', 'rurale', 'un espace rural', 'ruraux'],
      traps: [
        { text: 'urbain', why: 'L’espace urbain réunit les communes densément peuplées ou de densité intermédiaire.' },
        { text: 'littoral', why: 'Littoral signifie « du bord de mer » : ce n’est pas la densité.' },
      ],
      quote: I_GRILLE,
      explain: 'Ces communes sont les communes rurales : elles forment l’espace rural.',
      src: GRILLE,
    },
    {
      q: 'Quel nom, en deux mots, désigne le dépeuplement continu des campagnes au profit des villes ?',
      accepted: ['exode rural', 'l’exode rural'],
      traps: [
        { text: 'étalement urbain', why: 'L’étalement urbain est l’extension de la ville sur la campagne.' },
        { text: 'migration pendulaire', why: 'La migration pendulaire est un aller-retour quotidien.' },
      ],
      quote: C_EXODE,
      explain: 'L’exode rural vide les campagnes vers les villes.',
      src: 'cnrtl-exode-rural',
    },
    {
      q: 'Quel secteur d’activité, lié aux séjours des visiteurs, est très présent dans le rural (un mot) ?',
      accepted: ['tourisme', 'le tourisme'],
      traps: [
        { text: 'recherche', why: 'La recherche se concentre plutôt dans l’urbain.' },
        { text: 'banque', why: 'Les services aux entreprises sont surtout dans l’urbain.' },
      ],
      quote: I_TOURISME,
      explain: 'Le tourisme est très présent, notamment dans les campagnes éloignées de l’influence des villes.',
      src: RURAL,
    },
  ],
  docs: [
    {
      title: 'Deux villages',
      lines: [
        'Le village A est à 20 minutes d’une grande ville : des lotissements se construisent et les habitants y vont travailler.',
        'Le village B est très isolé : l’école a fermé et les habitants sont de moins en moins nombreux.',
        'Les deux villages comptent des champs et peu d’habitants au kilomètre carré.',
      ],
      qs: [
        {
          q: 'Que montrent ces deux villages ?',
          a: 'les espaces ruraux sont divers et suivent des dynamiques différentes',
          wrong: [
            {
              label: 'tous les espaces ruraux évoluent de la même façon',
              why: 'L’un attire, l’autre se vide : les évolutions s’opposent.',
            },
            {
              label: 'un espace rural n’a jamais de lien avec la ville',
              why: 'Le village A est lié à la ville par les trajets de travail.',
            },
          ],
          quote: E_HETEROGENES,
          explain: 'Les espaces de faible densité sont très hétérogènes.',
          src: EDUSCOL,
        },
        {
          q: 'Lequel des deux villages est en déprise ?',
          a: 'le village B, qui perd des habitants et des services',
          wrong: [
            {
              label: 'le village A, qui construit des lotissements',
              why: 'Construire pour de nouveaux habitants montre une attraction.',
            },
            { label: 'aucun, car les deux ont des champs', why: 'La présence de champs n’empêche pas le déclin.' },
          ],
          quote: P_AGRICOLES,
          explain: 'Perdre des habitants et des services est le signe d’un espace rural en déprise.',
        },
      ],
    },
    {
      title: 'Un été à la montagne',
      lines: [
        'Une commune très peu dense accueille de nombreux randonneurs en été.',
        'Plusieurs maisons ne sont occupées que quelques semaines par an.',
        'Un éleveur y vit toute l’année et vend des fromages aux visiteurs.',
      ],
      qs: [
        {
          q: 'Comment cet espace rural est-il habité ?',
          a: 'par des habitants permanents et des visiteurs temporaires, avec des activités variées',
          wrong: [
            {
              label: 'uniquement par des agriculteurs',
              why: 'Randonneurs et occupants de maisons secondaires l’habitent aussi.',
            },
            {
              label: 'par personne, car il est très peu dense',
              why: 'Très peu dense ne veut pas dire vide.',
            },
          ],
          quote: I_TOURISME,
          explain: 'Le tourisme et les résidences secondaires s’ajoutent à l’élevage.',
          src: RURAL,
        },
      ],
    },
  ],
};

// ——— Notion 4 : vocabulaire ———

const vocabulaire: Notion = {
  classe: '6e',
  id: 'g6-vocabulaire-faible-densite',
  title: 'Le vocabulaire des espaces peu peuplés',
  hint: 'Repère si le mot décrit un milieu, un mode de vie ou une activité.',
  memo: [
    'L’**écoumène** est l’espace habité par l’humanité. Un espace **aride** manque d’eau ; une **oasis** y offre eau et cultures.',
    '**Steppe** et **toundra** sont des végétations ; le **pergélisol** est un sol gelé en permanence.',
    'Un peuple **nomade** n’a pas d’habitation fixe, à la différence d’un peuple **sédentaire**.',
  ],
  faits: [
    {
      q: 'Que désigne l’écoumène ?',
      a: 'l’espace habité par l’humanité',
      wrong: [
        { label: 'les seules terres désertes', why: 'C’est presque le contraire : l’écoumène est l’espace habité.' },
        { label: 'une forêt de climat froid', why: 'Une végétation froide a un autre nom, comme la toundra.' },
        { label: 'le nombre d’habitants par km²', why: 'Ce nombre est la densité.' },
      ],
      gap: ['L’', ' est l’espace habité par l’humanité.', ['écoumène', 'ecoumene']],
      quote: E_ECOUMENE,
      explain: 'L’écoumène s’étend aujourd’hui à presque toute la planète.',
      src: EDUSCOL,
    },
    {
      q: 'Quel mot qualifie un sol dépourvu d’humidité, sec ?',
      a: 'aride',
      wrong: [
        { label: 'vivrier', why: 'Vivrier signifie « destiné à l’alimentation ».' },
        { label: 'insulaire', why: 'Insulaire concerne les îles.' },
        { label: 'nomade', why: 'Nomade désigne un mode de vie sans habitation fixe.' },
      ],
      gap: ['Un terrain dépourvu d’humidité est un terrain ', '.', ['aride']],
      choix: ['aride', 'insulaire', 'nomade'],
      quote: C_ARIDE,
      explain: 'L’aridité est une contrainte pour la culture et l’élevage.',
      src: 'cnrtl-aride',
    },
    {
      q: 'Qu’est-ce qu’une oasis ?',
      a: 'un endroit d’un désert où un point d’eau permet végétation et culture',
      wrong: [
        {
          label: 'un sol gelé en permanence',
          why: 'Un sol gelé en permanence est un pergélisol.',
        },
        { label: 'une île entourée d’eau salée', why: 'Une oasis est dans un désert, pas dans la mer.' },
        { label: 'une grande ville du désert sans eau', why: 'Une oasis existe grâce à l’eau.' },
      ],
      gap: ['Une ', ' est un endroit d’un désert avec de l’eau et de la végétation.', ['oasis']],
      quote: C_OASIS,
      explain: 'Le point d’eau rend possible la culture dans un milieu sec.',
      src: 'cnrtl-oasis',
    },
    {
      q: 'Qu’est-ce que le pergélisol ?',
      a: 'un sol ou sous-sol gelé en permanence dans les régions froides',
      wrong: [
        { label: 'un sol très chaud et sec', why: 'C’est l’inverse : il est gelé.' },
        { label: 'un terrain d’herbe pour le bétail', why: 'Ce terrain s’appelle un pâturage.' },
        { label: 'un sol inondé chaque été par la mer', why: 'Le pergélisol est défini par le gel permanent.' },
      ],
      gap: ['Un sol gelé en permanence s’appelle le ', '.', ['pergélisol', 'permafrost', 'pergelisol']],
      quote: C_PERGELISOL,
      explain: 'Ce gel permanent est une contrainte pour construire et cultiver.',
      src: 'cnrtl-pergelisol',
    },
    {
      q: 'Que signifie nomade ?',
      a: 'qui n’a pas de demeure fixe',
      wrong: [
        { label: 'qui vit toujours au même endroit', why: 'Vivre au même endroit, c’est être sédentaire.' },
        { label: 'qui produit des céréales', why: 'Celui qui produit des céréales est un céréalier.' },
        { label: 'qui habite une île', why: 'Cela se dit insulaire.' },
      ],
      gap: ['Une personne ', ' n’a pas de demeure fixe.', ['nomade']],
      choix: ['nomade', 'sédentaire', 'insulaire'],
      quote: C_NOMADE,
      explain: 'Le nomadisme peut être une adaptation à de très fortes contraintes.',
      src: 'cnrtl-nomade',
    },
    {
      q: 'Quelle végétation de climat froid est faite surtout de mousses et de lichens ?',
      a: 'la toundra',
      wrong: [
        { label: 'la steppe', why: 'La steppe pousse sous un climat sec en été ou semi-aride (assez sec).' },
        { label: 'l’oasis', why: 'L’oasis est un lieu de végétation dans un désert.' },
        { label: 'la forêt dense', why: 'La forêt dense est faite de nombreux arbres.' },
      ],
      gap: ['Mousses, lichens et arbres nains forment la ', '.', ['toundra']],
      quote: C_TOUNDRA,
      explain: 'La toundra se trouve près du cercle polaire.',
      src: 'cnrtl-toundra',
    },
  ],
  paires3: [
    ['Aride', 'Sec, dépourvu d’humidité'],
    ['Oasis', 'Lieu de culture dans un désert grâce à l’eau'],
    ['Nomade', 'Sans demeure fixe'],
  ],
  paires5: [
    ['Écoumène', 'Terres habitées par l’humanité'],
    ['Steppe', 'Végétation en touffes espacées d’un climat sec'],
    ['Toundra', 'Végétation de climat froid, mousses et lichens'],
    ['Pergélisol', 'Sol gelé en permanence'],
    ['Insularité', 'Fait d’être formé d’îles'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la végétation en touffes espacées des climats secs en été ou semi-arides (assez secs) ?',
      accepted: ['steppe', 'la steppe', 'une steppe'],
      traps: [
        { text: 'toundra', why: 'La toundra est une végétation de climat froid, près des pôles.' },
        { text: 'oasis', why: 'L’oasis est un lieu avec de l’eau dans un désert.' },
      ],
      quote: C_STEPPE,
      explain: 'La steppe est une végétation de milieu sec.',
      src: 'cnrtl-steppe',
    },
    {
      q: 'Quel mot désigne l’espace habité par l’humanité (il commence par « é ») ?',
      accepted: ['écoumène', 'l’écoumène', 'ecoumene', 'œkoumène', 'oekoumène'],
      traps: [
        { text: 'élevage', why: 'L’élevage est l’art d’élever des animaux.' },
        { text: 'écosystème', why: 'Un écosystème réunit des êtres vivants et leur milieu.' },
      ],
      quote: E_ECOUMENE,
      explain: 'Presque toute la planète appartient aujourd’hui à l’écoumène.',
      src: EDUSCOL,
    },
    {
      q: 'Le mode de vie des peuples qui se déplacent sans habitation fixe s’appelle le … (un mot).',
      accepted: ['nomadisme', 'le nomadisme'],
      traps: [
        { text: 'tourisme', why: 'Le tourisme est un voyage de loisir, pas un mode de vie sans habitation fixe.' },
        { text: 'sédentarisme', why: 'Être sédentaire, c’est au contraire rester au même endroit.' },
      ],
      quote: E_NOMADISME,
      explain: 'Le nomadisme peut être une réponse à de très fortes contraintes.',
      src: EDUSCOL,
    },
  ],
  docs: [
    {
      title: 'Carnet d’un voyageur au désert',
      lines: [
        'Pendant des jours, le sol reste sec et la végétation rare.',
        'Puis apparaît un lieu avec un puits, des palmiers et des jardins.',
        'Des familles qui y vivent toute l’année accueillent des éleveurs de passage, sans maison fixe.',
      ],
      qs: [
        {
          q: 'Quel mot de géographie désigne le lieu avec le puits et les jardins ?',
          a: 'une oasis',
          wrong: [
            { label: 'un pergélisol', why: 'Le pergélisol est un sol gelé en permanence.' },
            { label: 'une toundra', why: 'La toundra est une végétation de climat froid.' },
          ],
          quote: C_OASIS,
          explain: 'Un point d’eau permet la végétation et la culture dans le désert.',
          src: 'cnrtl-oasis',
        },
        {
          q: 'Comment qualifier les éleveurs de passage ?',
          a: 'nomades',
          wrong: [
            { label: 'sédentaires', why: 'Les sédentaires restent au même endroit : ce sont les familles de l’oasis.' },
            { label: 'insulaires', why: 'Insulaire concerne les îles.' },
          ],
          quote: C_NOMADE,
          explain: 'Sans demeure fixe, ils sont nomades ; les familles de l’oasis sont sédentaires.',
          src: 'cnrtl-nomade',
        },
      ],
    },
    {
      title: 'Carnet d’une scientifique près du pôle',
      lines: [
        'Le sol dégèle un peu en surface en été mais reste gelé plus bas toute l’année.',
        'Seuls des mousses, des lichens et de petits arbres poussent.',
        'Des villages sont installés malgré le froid.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on le sol gelé en profondeur décrit ici ?',
          a: 'le pergélisol',
          wrong: [
            { label: 'la steppe', why: 'La steppe est une végétation de climat sec.' },
            { label: 'l’écoumène', why: 'L’écoumène désigne l’espace habité.' },
          ],
          quote: C_PERGELISOL,
          explain: 'Un sol gelé en permanence est un pergélisol.',
          src: 'cnrtl-pergelisol',
        },
        {
          q: 'Pourquoi peut-on dire que ce milieu fait partie de l’écoumène ?',
          a: 'des villages y sont installés : il est habité',
          wrong: [
            {
              label: 'il est trop froid pour être habité',
              why: 'Le texte dit que des villages y sont installés.',
            },
            {
              label: 'l’écoumène ne concerne que les déserts chauds',
              why: 'L’écoumène désigne tout l’espace habité.',
            },
          ],
          quote: E_ECOUMENE,
          explain: 'L’écoumène est l’espace habité, même sous de fortes contraintes.',
          src: EDUSCOL,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [fortesContraintes, espacesAgricoles, habiterRural, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
