/**
 * Faits du chapitre « Météo, climat et géologie » (5e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte du texte consulté (programme du cycle 4, BRGM, ministère chargé de la
 * transition écologique, Météo-France, Géoconfluences, CNRTL). Les situations, villes et relevés des exercices
 * sont inventés : ils illustrent ces faits, ils ne sont pas des faits.
 */
export interface Fait {
  readonly id: string;
  /** Identifiant dans le registre des sources. */
  readonly source: string;
  /** Citation exacte. */
  readonly citation: string;
}

export const PROGRAMME = 'cycle4-2020';
export const MF_METEO = 'meteofrance-meteo-climat';
export const MF_VENT = 'meteofrance-vent';
export const MF_SYSTEME = 'meteofrance-systeme-climatique';
export const MF_HEXAGONE = 'meteofrance-climat-hexagone';
export const MF_OUTREMER = 'meteofrance-climats-outre-mer';
export const ECO_CLIMAT = 'ecologie-changement-climatique';
export const ECO_SEISMES = 'ecologie-seismes';
export const ECO_NATURELS = 'ecologie-risques-naturels';
export const ECO_MAJEURS = 'ecologie-risques-majeurs';
export const BRGM_SEISME = 'brgm-seisme-9-questions';
export const GEO_VOLCAN = 'geoconfluences-volcan';
export const GEO_ALEA = 'geoconfluences-alea';
export const GEO_VULNERABILITE = 'geoconfluences-vulnerabilite';
export const GEO_PREVENTION = 'geoconfluences-prevention';
export const TLF_VOLCAN = 'cnrtl-volcan';
export const TLF_LAVE = 'cnrtl-lave';
export const TLF_SISMOGRAPHE = 'cnrtl-sismographe';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const FAITS: readonly Fait[] = [
  // Programme.
  f('programme-meteo-climat', PROGRAMME, 'Différence entre météo et climat'),
  f('programme-seismes', PROGRAMME, 'séismes,'),
  f('programme-risques', PROGRAMME, 'Notions d’aléas, de vulnérabilité et de'),
  // Météo et climat.
  f(
    'meteo-definition',
    MF_METEO,
    "La météo, c'est ce que vous pouvez voir quand vous sortez le nez dehors, le temps qu’il fait à un instant et à un endroit donné",
  ),
  f(
    'climat-definition',
    MF_METEO,
    'Le climat est une moyenne des conditions météorologiques sur une longue période, plusieurs décennies.',
  ),
  f(
    'climat-30-ans',
    MF_METEO,
    'Par convention, les climatologues utilisent des périodes dites de référence de 30 ans.',
  ),
  f('vague-de-froid', MF_METEO, 'Observer une vague de froid ne remet pas en cause le changement climatique.'),
  f('vent-definition', MF_VENT, "En météorologie, le vent désigne le mouvement horizontal de l'air."),
  f(
    'vent-pression',
    MF_VENT,
    "l'air s'écoule dans l'atmosphère des zones de hautes pressions (anticyclones) vers les zones de basses pressions (dépressions)",
  ),
  f(
    'chaleur-redistribuee',
    MF_SYSTEME,
    'Une partie de cette chaleur est redistribuée par les vents et les courants marins, des tropiques vers les pôles.',
  ),
  f('hexagone-tempere', MF_HEXAGONE, 'L’Hexagone bénéficie d’un climat tempéré.'),
  f('martinique-tropical', MF_OUTREMER, 'Le climat de la Martinique est de type tropical'),
  f('guyane-equatorial', MF_OUTREMER, 'Le climat de la Guyane est de type équatorial et humide.'),
  f('serre-naturel', ECO_CLIMAT, 'Sans eux, la température moyenne sur Terre serait de -18 °C au lieu de +14 °C'),
  f(
    'serre-activites',
    ECO_CLIMAT,
    'Une augmentation des gaz à effet de serre suite aux activités de l’homme piège une partie de ce rayonnement, ce qui provoque une hausse de la température des surfaces',
  ),
  f(
    'co2-combustion',
    ECO_CLIMAT,
    'L’accumulation du dioxyde de carbone (CO2) dans l’atmosphère contribue pour 2/3 de l’augmentation de l’effet de serre induite par les activités humaines (combustion de gaz, de pétrole, déforestation, cimenteries, etc.).',
  ),
  f('niveau-mer', ECO_CLIMAT, 'comme la montée du niveau de la mer ou encore la fonte des calottes glaciaires'),
  f(
    'attenuation',
    ECO_CLIMAT,
    'en maîtrisant les émissions nettes de gaz à effet de serre (GES), c’est ce qu’on appelle l’atténuation.',
  ),
  f(
    'adaptation',
    ECO_CLIMAT,
    'L’adaptation au changement climatique est donc nécessaire pour en limiter les conséquences',
  ),
  // Séismes.
  f(
    'seisme-rupture',
    BRGM_SEISME,
    'Un séisme, c’est d’abord une rupture le long d’une faille à des kilomètres sous nos pieds.',
  ),
  f(
    'seisme-ondes',
    BRGM_SEISME,
    'Ce mouvement soudain génère des ondes sismiques qui se propagent et sont ressenties.',
  ),
  f(
    'seisme-contraintes',
    BRGM_SEISME,
    'Les tensions créées par les mouvements des plaques donnent lieu au chargement de contraintes le long de failles, qui se relâchent lorsque le point de rupture est atteint.',
  ),
  f(
    'foyer',
    BRGM_SEISME,
    'L’endroit où s’initie la rupture, sous nos pieds, est appelé le foyer. La projection en surface constitue l’épicentre.',
  ),
  f('magnitude', BRGM_SEISME, 'La magnitude caractérise la puissance libérée au moment du séisme.'),
  f('intensite', BRGM_SEISME, 'elle caractérise la sévérité de la secousse en un endroit donné.'),
  f('intensite-distance', BRGM_SEISME, 'elle s’atténue avec la distance'),
  f('sismometres', BRGM_SEISME, 'Les séismes étant mesurés à la surface à l’aide de sismomètres'),
  f(
    'sismographe',
    TLF_SISMOGRAPHE,
    "Appareil destiné à enregistrer les séismes, les vibrations de l'écorce terrestre ou lunaire",
  ),
  f(
    'frontieres-plaques',
    BRGM_SEISME,
    'ils se concentrent d’abord aux frontières entre les grandes plaques tectoniques.',
  ),
  f(
    'ondes-p',
    BRGM_SEISME,
    'Les premières ondes ressenties, celles qui vont le plus vite, sont les ondes P, les ondes premières.',
  ),
  f('ondes-s', BRGM_SEISME, 'Elles sont plus lentes, on les appelle les ondes S, comme secondes.'),
  f(
    'ondes-surface',
    BRGM_SEISME,
    'Plus tard viennent d’autres ondes qui ne se propagent qu’à la surface. Elles sont plus énergétiques, et peuvent donc causer plus de dommages.',
  ),
  f('seisme-imprevisible', BRGM_SEISME, 'On n’est pas en mesure de dire où et quand aura lieu un séisme'),
  f(
    'seisme-probabilite',
    BRGM_SEISME,
    'on est capable de dresser des cartes d’aléas qui caractérisent à un endroit donné la probabilité d’occurrence, sur des temps longs',
  ),
  f(
    'antilles-plaques',
    ECO_SEISMES,
    'l’accumulation des contraintes au niveau du contact des plaques tectoniques Amérique et Caraïbes',
  ),
  f('antilles', ECO_SEISMES, 'le risque de tremblement de terre est fort aux Antilles.'),
  f(
    'constructions',
    ECO_SEISMES,
    'Ce n’est pas le séisme qui tue, mais les constructions mal bâties qui s’effondrent sur leurs occupants.',
  ),
  f(
    'parasismique',
    ECO_SEISMES,
    'Le moyen de prévention le plus efficace contre le risque sismique est donc la construction parasismique.',
  ),
  // Volcans.
  f(
    'volcan-definition',
    TLF_VOLCAN,
    "Orifice naturel par lequel un réservoir de magma à haute température d'origine profonde communique avec la surface de la terre et s'y répand",
  ),
  f('volcan-cratere', TLF_VOLCAN, "montés par la cheminée dans le cratère au cours d'éruptions"),
  f('lave-definition', TLF_LAVE, "Matière en fusion qui s'écoule des volcans au moment des éruptions."),
  f('magma-fusion', GEO_VOLCAN, 'lesquels sont produits en profondeur par fusion partielle du manteau supérieur'),
  f('volcans-plaques', GEO_VOLCAN, 'Les magmas se formant principalement aux limites des plaques tectoniques'),
  f(
    'effusive',
    GEO_VOLCAN,
    'Les magmas émis de manière fluide pendant les éruptions effusives donnent des laves, qui s’épanchent en coulées fluides',
  ),
  f(
    'explosive',
    GEO_VOLCAN,
    'Les éruptions explosives, au contraire, se produisent lorsque le magma qui remonte est enrichi en gaz.',
  ),
  f(
    'fragments',
    GEO_VOLCAN,
    'Il est alors propulsé en fragments qui se refroidissent et durcissent plus ou moins instantanément',
  ),
  f('cendres', GEO_VOLCAN, 'Les cendres constituent les pyroclastes les plus fins (< 2 mm)'),
  f('nuees', GEO_VOLCAN, 'les dépôts mal triés de coulées pyroclastiques (autrefois appelées nuées ardentes)'),
  f(
    'volcan-previsible',
    ECO_NATURELS,
    'Bien que généralement prévisible, ce phénomène n’en reste pas moins particulièrement dangereux et destructeur.',
  ),
  f('volcan-surveille', ECO_MAJEURS, 'les phénomènes volcaniques sont, eux aussi, surveillés en permanence'),
  // Risques et prévention.
  f(
    'alea-definition',
    GEO_ALEA,
    "L'aléa (hazard en anglais) est la possibilité que se produise un événement impliquant une perturbation de l'équilibre d'un milieu.",
  ),
  f(
    'alea-risque',
    GEO_ALEA,
    "L'aléa ne devient un risque qu'en présence d'enjeux humains, économiques et environnementaux, possédant une certaine vulnérabilité (fragilité).",
  ),
  f(
    'vulnerabilite',
    GEO_VULNERABILITE,
    "La vulnérabilité exprime le niveau d'effet prévisible d'un phénomène naturel (un aléa) sur des enjeux",
  ),
  f('risque-majeur', ECO_MAJEURS, 'Le risque majeur est donc la confrontation d’un aléa avec des enjeux.'),
  f(
    'prevention',
    GEO_PREVENTION,
    'La prévention a pour but d’anticiper la manifestation éventuelle d’un risque en limitant ses effets destructeurs.',
  ),
  f(
    'trois-p',
    GEO_PREVENTION,
    '« trois P » visant à réduire la vulnérabilité face aux aléas : prévision, prévention, protection.',
  ),
  f(
    'information',
    GEO_PREVENTION,
    'Elle relève surtout de la sensibilisation, de l’information et de l’éducation de la population',
  ),
  f('digue', ECO_MAJEURS, 'Une digue ne réduit pas l’ampleur d’une inondation mais vise à constituer un bouclier'),
  f('surveillance', ECO_MAJEURS, 'La surveillance permet d’alerter les populations d’un danger'),
  f('amenagement', ECO_MAJEURS, 'en évitant d’augmenter les enjeux dans les zones à risques'),
  f('exercices', ECO_MAJEURS, 'Des exercices réguliers de simulation sont ensuite réalisés.'),
];
