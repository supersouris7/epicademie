/**
 * Faits du chapitre « Système nerveux et santé » (4e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte du texte consulté (programme du cycle 4, Académie française et CNRTL, Inserm,
 * Santé publique France). Les carnets, fiches et mesures des exercices de niveau 5 sont inventés : ils illustrent ces
 * faits, ils ne sont pas des faits.
 */
import type { Fait } from './donnees.ts';

export const PROGRAMME = 'cycle4-2020';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const FAITS_NERVEUX: readonly Fait[] = [
  // Programme.
  f('programme-cerveau', PROGRAMME, 'réception et l’intégration d’informations multiples.'),
  f('programme-message', PROGRAMME, 'Message nerveux, centres nerveux, nerfs, cellules'),
  f('programme-hygiene', PROGRAMME, 'Activité cérébrale ; hygiène de vie : conditions'),
  f('programme-perturbations', PROGRAMME, 'perturbations par certaines situations ou'),
  f('programme-dopage', PROGRAMME, 'consommations (seuils, excès, dopage, limites et'),

  // Message nerveux.
  f(
    'neurone',
    'academie-neurone',
    "Cellule élémentaire constitutive du tissu nerveux, formée d'un corps cellulaire, d'un prolongement long, l'axone, et de prolongements courts, les dendrites.",
  ),
  f(
    'neurone-messages',
    'academie-neurone',
    "Les neurones assurent l'émission, la conduction et la réception des messages nerveux.",
  ),
  f(
    'nerf',
    'academie-nerf',
    'Ensemble constitué de fibres, qui mettent en relation les différents organes avec le cerveau ou la moelle épinière.',
  ),
  f(
    'nerf-sensitif',
    'academie-nerf',
    'Nerfs sensitifs, qui transmettent les sensations de la périphérie aux centres nerveux.',
  ),
  f('nerf-moteur', 'academie-nerf', 'Nerfs moteurs, commandant un muscle ou un viscère.'),
  f('influx', 'academie-influx', 'Influx nerveux, onde de nature électrique qui parcourt le nerf'),
  f('centre', 'academie-centre', "Centres nerveux, territoires neuraux responsables d'importantes régulations"),
  f('systeme-central', 'academie-nerveux', "Système nerveux central, comprenant l'encéphale et la moelle épinière"),
  f(
    'recepteur',
    'academie-recepteur',
    "en réponse à une stimulation spécifique, donne naissance à un message électrique se propageant jusqu'au système nerveux central",
  ),
  f('cerveau', 'academie-cerveau', "logé dans la cavité du crâne, constitué d'une masse de substance nerveuse"),
  f(
    'moelle',
    'academie-moelle',
    "Moelle épinière, partie du système nerveux central logée dans le canal rachidien et d'où partent les nerfs rachidiens.",
  ),
  f(
    'synapse',
    'cnrtl-synapse',
    "Structure histologique par laquelle l'axone d'un neurone s'articule avec les dendrites d'un autre neurone",
  ),
  f(
    'transmission',
    'inserm-epilepsie',
    'la communication entre deux neurones a lieu grâce au cheminement du message nerveux le long de l’axone',
  ),
  f(
    'neurotransmetteur',
    'inserm-epilepsie',
    'Petite molécule qui assure la transmission des messages d’un neurone à l’autre, au niveau des synapses.',
  ),
  f(
    'myeline',
    'inserm-sclerose-plaques',
    'Elle joue aussi un rôle d’accélérateur de la vitesse de propagation de l’influx nerveux',
  ),
  f(
    'motoneurone',
    'inserm-sla',
    'Les motoneurones sont les cellules nerveuses de la moelle épinière qui provoquent la contraction des muscles.',
  ),
  f('cortex-moteur', 'inserm-sla', 'étend son axone jusque dans la moelle épinière ou au tronc cérébral.'),
  f(
    'perception',
    'inserm-douleur',
    'L’information chemine ainsi via la moelle épinière, puis jusqu’au cerveau : c’est alors seulement que le signal est identifié et perçu comme étant douloureux.',
  ),

  f('axone', 'academie-neurone', "d'un prolongement long, l'axone"),

  // Réflexe.
  f(
    'reflexe',
    'academie-reflexe',
    "Réponse involontaire, immédiate et prévisible d'un organe ou d'un organisme à un stimulus déterminé.",
  ),
  f(
    'arc-reflexe',
    'academie-reflexe',
    "trajet que suit l'influx nerveux depuis le récepteur jusqu'au centre nerveux puis de celui-ci jusqu'à l'organe effecteur par les nerfs sensitif et moteur.",
  ),
  f('reflexe-acquis', 'academie-reflexe', 'Les réflexes conditionnés ou conditionnels sont acquis par apprentissage.'),
  f(
    'reflexe-archaique',
    'academie-reflexe',
    'qui est observable chez le nouveau-né et disparaît dans les premiers mois de la vie',
  ),
  f('reflexe-medullaire', 'academie-reflexe', 'dont la réalisation fait intervenir la moelle épinière, le cervelet'),
  f(
    'stimulus',
    'cnrtl-stimulus',
    'capable de provoquer une réponse motrice ou glandulaire dans un système organique excitable',
  ),
  f(
    'retrait-main',
    'inserm-douleur',
    'la main a été dégagée de la source de chaleur avant même ce décryptage, grâce à un arc réflexe situé au sein de la moelle épinière.',
  ),

  f('reflexe-succion', 'academie-reflexe', "Les réflexes de succion ou d'agrippement sont des réflexes archaïques."),

  // Sommeil et écrans.
  f(
    'sommeil',
    'inserm-sommeil',
    'Le sommeil correspond à une baisse de l’état de conscience qui sépare deux périodes d’éveil.',
  ),
  f('cycles', 'inserm-sommeil', 'le sommeil correspond à une succession de 3 à 6 cycles de 60 à 120 minutes'),
  f('sommeil-lent', 'inserm-sommeil', 'Le sommeil lent est caractérisé par des ondes lentes.'),
  f(
    'paradoxal',
    'inserm-sommeil',
    'Le sommeil paradoxal correspond à une période durant laquelle l’activité cérébrale est proche de celle de la phase d’éveil.',
  ),
  f('tonus', 'inserm-sommeil', 'le tonus musculaire est totalement aboli durant cette phase'),
  f(
    'debut-fin-nuit',
    'inserm-sommeil',
    'les premiers cycles sont essentiellement constitués de sommeil lent profond, tandis que la fin de nuit fait la part belle aux sommeils lent léger et paradoxal',
  ),
  f('melatonine', 'inserm-sommeil', 'cette substance est produite en situation d’obscurité par la glande pinéale'),
  f(
    'melatonine-lumiere',
    'inserm-sommeil',
    'Sa synthèse est à l’inverse inhibée lorsque les cellules rétiniennes perçoivent la lumière.',
  ),
  f(
    'ecrans-lumiere',
    'inserm-sommeil',
    'l’usage tardif d’écrans ou de lumière LED, riches en lumière bleue, stimule ces cellules et retarde l’endormissement.',
  ),
  f(
    'manque-sommeil',
    'inserm-sommeil',
    'une mauvaise qualité/quantité de sommeil accentue le risque d’irritabilité, de symptômes dépressifs, mais aussi de prise de poids',
  ),
  f(
    'horloge',
    'inserm-chronobiologie',
    'C’est une horloge interne, nichée au cœur du cerveau, qui impose le rythme circadien à l’organisme',
  ),
  f('circadien', 'inserm-chronobiologie', 'à des rythmes circadiens, c’est-à-dire à des cycles d’environ 24 heures.'),
  f(
    'lumiere-synchroniseur',
    'inserm-chronobiologie',
    'Le plus puissant est la lumière, mais la prise des repas, l’activité physique et la température extérieure jouent aussi un rôle, plus modeste.',
  ),
  f(
    'lumiere-soir',
    'inserm-chronobiologie',
    'L’exposition à la lumière le soir retarde l’horloge biologique, et donc la production de mélatonine et l’endormissement. Une exposition lumineuse le matin va au contraire avancer l’horloge.',
  ),
  f('besoin-ado', 'inserm-chronobiologie', 'ils ont encore besoin de 9–10 h de sommeil par nuit.'),
  f('decalage-ado', 'inserm-chronobiologie', 'à partir de 10 ans, leurs horloges se décalent de 2–3 h'),
  f(
    'ecrans-avant',
    'inserm-chronobiologie',
    'les sortir de la chambre à coucher et interrompre leur l’utilisation au moins 1 h avant d’aller dormir.',
  ),
  f('memoire-sommeil', 'spf-sommeil-enjeux', 'Il consolide, réorganise et trie les informations apprises.'),
  f('besoin-lyceen', 'spf-sommeil-enjeux', '14-17 ans (collège, lycée) : de 9 à 10 heures.'),
  f(
    'telephone-nuit',
    'spf-sommeil-enjeux',
    'La lumière bleue limite la production de mélatonine, l’hormone liée au sommeil.',
  ),

  f(
    'decalage-puberte',
    'spf-sommeil-enjeux',
    'en raison du décalage naturel des rythmes biologiques associés à la puberté',
  ),
  f(
    'filtres',
    'inserm-chronobiologie',
    'ces dispositifs n’ont pas été évalués scientifiquement et leur intérêt reste à vérifier.',
  ),

  // Substances et santé.
  f(
    'addiction',
    'inserm-addictions',
    'caractérisées par une perte progressive de contrôle face à une substance ou un comportement.',
  ),
  f(
    'psychotropes',
    'inserm-addictions',
    'Tous provoquent un effet immédiat sur les perceptions, l’humeur et le comportement',
  ),
  f('psychotrope', 'cnrtl-psychotrope', 'qui modifie le psychisme et le comportement'),
  f('craving', 'inserm-addictions', 'des envies intenses et difficiles à contrôler, appelées craving'),
  f(
    'recompense',
    'inserm-addictions',
    'Le premier stade résulte de l’activation du circuit cérébral de la récompense par la drogue consommée',
  ),
  f(
    'tolerance',
    'inserm-addictions',
    'Une augmentation de la quantité de substance consommée, ou du temps consacré au comportement addictif, devient alors nécessaire pour activer suffisamment le circuit de la récompense',
  ),
  f('sevrage', 'inserm-addictions', 'Le sevrage, c’est-à-dire l’arrêt de la consommation ou de la pratique addictive'),
  f('initiation', 'inserm-addictions', 'L’initiation précoce constitue un facteur de risque majeur.'),
  f(
    'addiction-sans-produit',
    'inserm-addictions',
    'la pratique répétée d’un comportement (jeux de hasard et d’argent, pratique sportive, usage du numérique…)',
  ),
  f(
    'accident-cumul',
    'inserm-addictions',
    'Si le conducteur a également consommé du cannabis, ce risque est multiplié par 15.',
  ),
  f('nicotine', 'spf-tabac-sante', 'La nicotine est la substance (un alcaloïde puissant) qui entraîne la dépendance.'),
  f(
    'nicotine-vite',
    'spf-tabac-sante',
    'elle apparaît dès les premières semaines d’exposition et pour une faible consommation de tabac.',
  ),
  f('tabac-moitie', 'spf-tabac-sante', 'un fumeur régulier sur deux meurt de son tabagisme.'),
  f('tabac-seuil', 'spf-tabac-sante', 'Il n’existe pas de seuil au-dessous duquel fumer ne représente pas de risque.'),
  f(
    'tabac-passif',
    'spf-tabac-sante',
    'Le tabagisme passif est le fait d’inhaler la fumée dégagée par un ou plusieurs fumeurs',
  ),
  f(
    'alcool-reaction',
    'spf-alcool-risques',
    'L’alcool augmente le temps de réaction. Il diminue les réflexes, la vigilance et la résistance à la fatigue.',
  ),
  f('alcool-verre', 'spf-alcool-risques', 'chaque verre standard contient 10g d’alcool pur.'),
  f('alcool-cancer', 'spf-alcool-risques', 'Il n’y a pas de consommation d’alcool sans risque pour la santé.'),
  f(
    'alcool-ado',
    'inserm-alcool-sante',
    'pendant l’enfance et l’adolescence, si l’on va conduire, lorsqu’on prend certains médicaments ou encore lorsqu’on est atteint de certaines maladies, l’option la plus sûre est de ne pas consommer d’alcool.',
  ),
  f('alcool-repere', 'inserm-alcool-sante', 'ne pas consommer plus de 10 verres standards par semaine'),
  f('alcool-cerveau-ado', 'inserm-alcool-sante', 'l’adolescence constitue une période de vulnérabilité particulière.'),
  f(
    'drogues-risques',
    'spf-drogues-enjeux',
    'L’usage de drogues augmente les risques de maladie, d’accident et de décès prématuré.',
  ),
  f('cannabis', 'spf-drogues-enjeux', 'Le cannabis est la drogue illicite la plus utilisée.'),
  f(
    'dopage',
    'academie-dopage',
    "Action d'administrer ou de prendre un produit stimulant avant une épreuve, une compétition sportive",
  ),
  f(
    'recompense-moins-sensible',
    'inserm-addictions',
    'le système de récompense devient progressivement moins sensible aux plaisirs naturels.',
  ),
  f('alcool-sang', 'inserm-alcool-sante', 'cette molécule passe rapidement dans le sang via le tube digestif.'),
  f(
    'alcool-cerveau',
    'spf-alcool-risques',
    'vers les organes très vascularisés comme le cerveau, les poumons et le foie.',
  ),
  f(
    'accident-alcool',
    'inserm-addictions',
    'la conduite après une prise excessive d’alcool multiplie par 8,5 le risque d’être responsable d’un accident mortel.',
  ),
  f('psychotropes-exemples', 'inserm-addictions', 'aux psychotropes licites (tabac, alcool...)'),
];
