import type { Skill } from '../types.ts';
import { notion, PROGRAMME_C4, type Notion } from './kit.ts';

/**
 * Cinquième, thème 3 « L’environnement, du local au planétaire » (lot ge-5e-03) : changement global climatique,
 * risques, adaptation et prévention. Chaque fait cite une source du registre avec sa citation exacte : programme
 * du cycle 4, glossaire de Géoconfluences (ENS de Lyon, DGESCO) et ministère de la Transition écologique. Les
 * textes à lire du niveau 5 sont écrits pour l’exercice (territoires fictifs).
 */

const C4 = PROGRAMME_C4;
const CLIMAT = 'geoconfluences-changement-climatique';
const GLOBAL = 'geoconfluences-changement-global';
const GES = 'geoconfluences-ges';
const PARIS = 'geoconfluences-paris-accord';
const CHALEUR = 'geoconfluences-vague-de-chaleur';
const PERGELISOL = 'geoconfluences-pergelisol';
const RISQUE = 'geoconfluences-risque';
const ALEA = 'geoconfluences-alea';
const ENJEUX = 'geoconfluences-enjeux';
const VULNERABILITE = 'geoconfluences-vulnerabilite';
const CATASTROPHE = 'geoconfluences-catastrophe';
const TECHNO = 'geoconfluences-risque-technologique';
const SEVESO = 'geoconfluences-seveso';
const SANITAIRE = 'geoconfluences-risque-sanitaire';
const ADAPTATION = 'geoconfluences-adaptation';
const POLITIQUES = 'geoconfluences-politiques-climatiques';
const RESILIENCE = 'geoconfluences-resilience';
const ICU = 'geoconfluences-ilot-de-chaleur';
const FRAICHEUR = 'geoconfluences-ilot-de-fraicheur';
const PREVENTION = 'geoconfluences-prevention';
const PREVISION = 'geoconfluences-prevision';
const PRECAUTION = 'geoconfluences-precaution';
const PPR = 'geoconfluences-ppr';
const CULTURE = 'geoconfluences-culture-du-risque';
const EDUCATION = 'geoconfluences-education-risques';
const ECOLOGIE = 'ecologie-prevention-risques-naturels';

// Programme du cycle 4, géographie, classe de 5e, thème 3.
const P_ETUDE_CLIMAT =
  'des effets observés ou potentiels d’un changement climatique et d’une politique locale, régionale ou nationale, pour les éviter, les modérer ou s’y adapter';
const P_ODD13 =
  'prendre d’urgence des mesures pour lutter contre les changements climatiques et leurs répercussions (ODD 13)';
const P_ODD9 =
  'mettre en place une infrastructure résiliente, promouvoir une industrialisation durable qui profite à tous et encourager l’innovation (ODD 9)';

// Changement climatique.
const G_DEREGLEMENT =
  "le changement climatique n'est pas qu'un réchauffement : certaines régions peuvent connaître des saisons froides plus marquées, et les régimes de précipitation également sont modifiés";
const G_CLIMAT = 'Le climat est une moyenne météorologique sur une période d’au moins trente ans';
const G_CONSENSUS =
  "les émissions de gaz à effet de serre par les activités humaines sont en grande partie responsable du réchauffement de l'atmosphère terrestre";
const G_GIEC =
  'Organisme scientifique intergouvernemental, il collecte et interprète les données scientifiques mais ne les produit pas';
const G_KYOTO = 'La réussite du protocole de Kyoto, adopté en 1997';
const G_CO2 =
  'En quantité et du fait de sa longue durée de vie dans l’atmosphère, le gaz carbonique est le principal gaz à effet de serre';
const G_ACCORD = 'L’Accord de Paris sur le climat a été adopté, le samedi 12 décembre 2015, lors de la COP21';
const G_DEUX_DEGRES =
  'maintenir le seuil d’augmentation de la température au-dessous de 2°C par rapport à l’ère pré-industrielle';
const G_ILES = 'la sauvegarde des États insulaires, les plus menacés par la montée des eaux';
const G_VAGUES =
  'En France et en Europe, les vagues de chaleur sont les principales manifestations des conséquences du changement climatique actuellement observé';
const G_PERGELISOL =
  'sous l’effet du dérèglement climatique global, la fonte du pergélisol sur d’immenses superficies et à grande profondeur est un changement majeur';
const G_DIFFERENCIES =
  "les changements dont il s'agit sont nécessairement différenciés selon les espaces et les sociétés qui les habitent";

// Risques.
const G_RISQUE = "un risque est la possibilité qu'un aléa se produise et touche une population vulnérable à cet aléa";
const G_FORMULE = '« risque = aléa × vulnérabilité »';
const G_ATOLL = "un typhon sur un atoll désert de l'océan Pacifique n'est pas un risque";
const G_ENJEUX =
  "les enjeux recouvrent les personnes, biens, équipements, environnements, susceptibles d'être affectés par un phénomène d'origine naturelle ou anthropique";
const G_VULN = "La vulnérabilité exprime le niveau d'effet prévisible d'un phénomène naturel (un aléa) sur des enjeux";
const G_PAUVRETE =
  'Les principaux facteurs socio-spatiaux de la vulnérabilité sont, pour la plupart, liés à la pauvreté';
const G_MAJEUR =
  "est dit majeur lorsqu'il peut faire de très nombreuses victimes et occasionner des dommages considérables";
const G_CATASTROPHE = "La catastrophe est la réalisation d'un risque";
const G_TECHNO =
  "Le risque technologique est la possibilité qu'un aléa d'origine technologique (c'est-à-dire lié à des activités humaines) se produise et touche une population vulnérable à ce risque";
const G_INDUSTRIEL = "le risque industriel se limite aux aléas liés aux activités d'une usine";
const G_VICTIMES =
  "Les premières victimes du risque technologique et du risque industriel sont fréquemment les employés de l'entreprise qui travaillent sur le site";
const G_CLASSEMENT =
  'impose aux États-membres le classement des sites industriels en fonction des substances toxiques qui y sont stockées';
const G_SANITAIRE =
  "Le risque sanitaire correspond à la probabilité que survienne un événement nuisible à la santé d'un individu ou d'un groupe d'individus";
const G_COVID =
  'La crise sanitaire résultant de la pandémie de covid 19 montre, depuis la fin 2019, que les risques sanitaires peuvent être d’ampleur mondiale';
const G_AGENTS = 'd’agents infectieux (virus, bacilles)';

// Adaptation.
const G_ADAPTABILITE =
  "la faculté d'un système, par exemple économique, d’un territoire ou d’une population, à ajuster ses mécanismes et sa structure pour tenir compte des changements environnementaux réels, potentiels ou supposés";
const G_ATTENUATION =
  'agir sur les causes en réduisant les émissions – c’est l’atténuation – et sur les impacts en limitant l’exposition, la sensibilité physique et en développant les capacités de réponse – c’est l’adaptation';
const G_RESILIENCE = 'La résilience est la capacité d’un système à revenir à son état initial après avoir été perturbé';
const G_RESISTANCE =
  'La résistance cherche, par des travaux de correction, comme un paravalanche ou une digue, à s’opposer à l’aléa, tandis que la résilience vise à en réduire au maximum les effets';
const G_ICU = 'sorte de dôme d’air plus chaud couvrant la ville';
const G_NUIT = 'L’ICU est plus important la nuit';
const G_VILLES =
  'Les villes doivent adapter leur planification urbaine et leurs infrastructures pour mieux s’adapter aux variations à venir';
const G_LEVIERS = 'végétalisation, espaces aquatiques, matériaux réfléchissants';
const G_FRAICHEUR =
  'Les îlots de fraîcheur sont des zones urbaines ou périurbaines qui offrent des températures plus fraîches que le reste de la ville environnante';
const G_DIFFERENTES = "des facultés de résilience et d'adaptation qui sont variables";

// Prévention.
const G_PREVENTION =
  'La prévention a pour but d’anticiper la manifestation éventuelle d’un risque en limitant ses effets destructeurs';
const G_TROIS_P = 'réduire la vulnérabilité face aux aléas : prévision, prévention, protection';
const G_PREVISION =
  'La prévision a pour but de mieux connaître les aléas, leur fréquence, leur intensité et les lieux où ils sont susceptibles de se manifester';
const G_AVERE = 'la prévention correspond à des risques connus dont on connaît le périmètre et les effets potentiels';
const G_PRECAUTION =
  "la précaution se situe dans un domaine où subsiste d'importantes incertitudes quant à l'existence et à l'ampleur d'un risque dont les effets pourraient être graves et irréversibles";
const G_PPR =
  'Un plan de prévention des risques (PPR) est un document d’urbanisme cartographiant, à l’échelle communale ou intercommunale, l’intensité d’un aléa donné et la réponse réglementaire apportée';
const G_ZONAGE = 'allant de l’absence de restriction à l’inconstructibilité';
const G_PPRT =
  "un outil de maîtrise de l'urbanisation aux abords de certaines installations industrielles à haut risque : les plans de prévention des risques technologiques (PPRT)";
const G_CULTURE =
  "La culture du risque désigne la place occupée par le risque dans les représentations mentales collectives d'une population";
const G_INFORMATION =
  'tout élève bénéficie, dans le cadre de sa scolarité, d’une sensibilisation à la prévention des risques et aux missions des services de secours';
const E_CITOYEN = 'Le citoyen doit être le premier acteur de sa sécurité et de celle de ses proches';
const E_REPERES =
  'Depuis 2003, la pose de repères de crue normalisés est obligatoire dans les communes soumises aux inondations';
const E_PREFET = 'Le Plan de Prévention des Risques Naturels (PPRN) est élaboré sous l’autorité du préfet';

// ——— Notion 1 : le changement climatique ———

const climat: Notion = {
  classe: '5e',
  id: 'g5-changement-climatique',
  title: 'Le changement climatique et ses effets régionaux',
  hint: 'Distingue le temps qu’il fait un jour et le climat, calculé sur de longues années ; puis cherche la cause et le lieu touché.',
  memo: [
    'Le **changement climatique** modifie la moyenne du temps qu’il fait sur au moins trente ans. Aujourd’hui, il vient surtout des **gaz à effet de serre** émis par les activités humaines.',
    'Ses effets changent d’une région à l’autre : vagues de chaleur en Europe, fonte du **pergélisol** dans l’Arctique, montée des eaux qui menace des îles.',
    'Le **GIEC** fait le point sur les connaissances ; l’**Accord de Paris** (2015) vise à limiter le réchauffement sous 2 °C.',
  ],
  faits: [
    {
      q: 'Quelle est la principale cause du changement climatique actuel ?',
      a: 'les émissions de gaz à effet de serre dues aux activités humaines',
      wrong: [
        {
          label: 'les éruptions volcaniques de ces dernières années',
          why: 'Le réchauffement actuel est attribué en grande partie aux activités humaines, pas aux volcans.',
        },
        {
          label: 'le changement des saisons au cours de l’année',
          why: 'Les saisons se répètent chaque année : elles ne modifient pas la moyenne sur trente ans.',
        },
        {
          label: 'la fonte du pergélisol, seule cause du réchauffement',
          why: 'Elle peut accentuer le réchauffement, mais elle en est d’abord une conséquence.',
        },
      ],
      gap: [
        'Les activités humaines émettent des gaz à effet de ',
        ', en grande partie responsables du réchauffement.',
        ['serre'],
      ],
      choix: ['serre', 'ombre', 'pluie'],
      quote: G_CONSENSUS,
      explain: 'Il existe un consensus scientifique : les gaz émis par les sociétés réchauffent l’atmosphère.',
      src: CLIMAT,
    },
    {
      q: 'Sur quelle durée au moins calcule-t-on la moyenne météorologique qui définit un climat ?',
      a: 'trente ans',
      wrong: [
        { label: 'un jour', why: 'Sur un jour, on parle du temps qu’il fait, pas du climat.' },
        { label: 'une saison', why: 'Une saison est trop courte pour définir un climat.' },
        { label: 'un an', why: 'Une année peut être exceptionnelle : il faut au moins trente ans.' },
      ],
      gap: ['Le climat est une moyenne météorologique sur au moins ', ' ans.', ['trente']],
      choix: ['trente', 'trois', 'deux'],
      quote: G_CLIMAT,
      explain: 'Un été chaud ne suffit pas : seule la moyenne sur de longues années montre un changement de climat.',
      src: CLIMAT,
    },
    {
      q: 'Quel est le principal gaz à effet de serre dont on suit les émissions ?',
      a: 'le dioxyde de carbone (CO₂)',
      wrong: [
        { label: 'le dioxygène', why: 'Le dioxygène que nous respirons n’est pas ce gaz à effet de serre.' },
        { label: 'le diazote', why: 'Le diazote, très abondant dans l’air, n’est pas un gaz à effet de serre.' },
        { label: 'l’hélium', why: 'L’hélium n’intervient pas dans le réchauffement.' },
      ],
      gap: ['Les émissions de gaz à effet de serre sont calculées en équivalent ', '.', ['CO₂']],
      choix: ['CO₂', 'O₂', 'N₂'],
      quote: G_CO2,
      explain: 'Le gaz carbonique reste longtemps dans l’atmosphère : il sert d’unité de référence.',
      src: GES,
    },
    {
      q: 'Quel objectif de température l’Accord de Paris de 2015 confirme-t-il ?',
      a: 'rester sous + 2 °C par rapport à l’ère préindustrielle',
      wrong: [
        {
          label: 'rester sous + 10 °C par rapport à l’ère préindustrielle',
          why: 'Le seuil retenu est bien plus bas : 2 °C.',
        },
        { label: 'refroidir la planète de 5 °C', why: 'L’Accord limite la hausse, il ne vise pas un refroidissement.' },
        {
          label: 'garder la même température chaque jour',
          why: 'Il porte sur la moyenne mondiale, pas sur la température d’un jour.',
        },
      ],
      gap: ['L’Accord de Paris vise à rester au-dessous de ', ' °C de hausse.', ['2']],
      choix: ['2', '8', '15'],
      quote: G_DEUX_DEGRES,
      explain: 'Les pays veulent rester sous 2 °C et tendre vers 1,5 °C.',
      src: PARIS,
    },
    {
      q: 'Dans les régions arctiques, quel effet du dérèglement climatique touche les sols gelés ?',
      a: 'la fonte du pergélisol',
      wrong: [
        { label: 'la formation d’oasis', why: 'Les oasis se trouvent dans les déserts, pas dans l’Arctique gelé.' },
        {
          label: 'le gel permanent de nouveaux déserts',
          why: 'Le réchauffement fait fondre les sols gelés, il n’en crée pas.',
        },
        {
          label: 'la salinisation des lacs de montagne',
          why: 'Ce n’est pas l’effet en cause : ici, ce sont les sols gelés qui fondent.',
        },
      ],
      gap: ['Dans l’Arctique, le dérèglement climatique provoque la fonte du ', '.', ['pergélisol']],
      choix: ['pergélisol', 'sable', 'béton'],
      quote: G_PERGELISOL,
      explain: 'Le pergélisol est un sol gelé en permanence : en fondant, il peut aussi libérer des gaz.',
      src: PERGELISOL,
    },
    {
      q: 'En France et en Europe, quelle est la principale manifestation actuelle du changement climatique ?',
      a: 'les vagues de chaleur',
      wrong: [
        { label: 'les éruptions volcaniques', why: 'Les volcans ne dépendent pas du climat.' },
        { label: 'les tremblements de terre', why: 'Les séismes viennent des mouvements de la Terre, pas du climat.' },
        {
          label: 'la disparition des saisons',
          why: 'Les saisons existent toujours ; les périodes très chaudes augmentent.',
        },
      ],
      gap: ['En Europe, les vagues de ', ' sont la principale manifestation observée.', ['chaleur']],
      choix: ['chaleur', 'froid', 'brouillard'],
      quote: G_VAGUES,
      explain: 'Des périodes de plusieurs jours bien plus chaudes que la normale, plus fréquentes qu’autrefois.',
      src: CHALEUR,
    },
  ],
  paires3: [
    ['Climat', 'Moyenne du temps sur au moins trente ans'],
    ['GIEC', 'Groupe qui évalue les connaissances sur le climat'],
    ['Accord de Paris', 'Traité de 2015 pour limiter le réchauffement'],
  ],
  paires5: [
    ['Climat', 'Moyenne du temps sur au moins trente ans'],
    ['GIEC', 'Groupe qui évalue les connaissances sur le climat'],
    ['Accord de Paris', 'Traité de 2015 pour limiter le réchauffement'],
    ['Effet de serre', 'Phénomène naturel amplifié par les rejets humains'],
    ['Pergélisol', 'Sol gelé en permanence qui fond avec le réchauffement'],
  ],
  ordre: [
    'Création du GIEC',
    'Adoption du protocole de Kyoto',
    'Adoption de l’Accord de Paris',
    'Entrée en vigueur de l’Accord de Paris',
  ],
  consigne: {
    prompt: 'Remets ces étapes de l’action internationale dans l’ordre, de la plus ancienne à la plus récente.',
    hint: 'Commence par le groupe d’experts, créé à la fin des années 1980.',
    why: 'GIEC : 1988 ; protocole de Kyoto : 1997 ; Accord de Paris : 2015 ; entrée en vigueur : 2016.',
    fin: 'La plus ancienne est',
    quote: G_KYOTO,
    src: CLIMAT,
  },
  sources: [PARIS],
  libres: [
    {
      q: 'Quel sigle désigne le groupe d’experts intergouvernemental sur l’évolution du climat ?',
      accepted: ['GIEC', 'le GIEC', 'IPCC'],
      traps: [
        { text: 'PNUD', why: 'Le PNUD est le programme de l’ONU pour le développement (il calcule l’IDH).' },
        { text: 'ODD', why: 'Les ODD sont les objectifs de développement durable, pas un groupe d’experts.' },
      ],
      quote: G_GIEC,
      explain: 'GIEC : il rassemble et évalue les connaissances scientifiques sans les produire lui-même.',
      src: CLIMAT,
    },
    {
      q: 'Dans quelle ville l’accord sur le climat de 2015 a-t-il été adopté ?',
      accepted: ['Paris', 'à Paris'],
      traps: [
        { text: 'Kyoto', why: 'Le protocole de Kyoto date de 1997 ; l’accord de 2015 est celui de Paris.' },
        { text: 'Glasgow', why: 'La COP de Glasgow a eu lieu en 2021, après l’accord de Paris.' },
      ],
      quote: G_ACCORD,
      explain: 'Adopté le 12 décembre 2015 lors de la COP21 : c’est l’Accord de Paris.',
      src: PARIS,
    },
    {
      q: 'Quelle menace liée au réchauffement pèse surtout sur les États insulaires ? Complète : la montée des…',
      accepted: ['eaux', 'des eaux', 'la montée des eaux', 'montée des eaux', 'océans', 'mers'],
      traps: [
        {
          text: 'températures',
          why: 'Les températures montent partout ; la menace propre aux îles basses est la montée des eaux.',
        },
        { text: 'montagnes', why: 'Les montagnes ne montent pas à cause du climat.' },
      ],
      quote: G_ILES,
      explain: 'La montée du niveau de la mer menace les terres basses de ces États.',
      src: PARIS,
    },
    {
      q: 'Quel objectif de développement durable (ODD) porte sur la lutte contre les changements climatiques ? Donne son numéro.',
      accepted: ['13', 'ODD 13', 'ODD13', 'l’ODD 13'],
      traps: [
        { text: '6', why: 'L’ODD 6 porte sur l’eau salubre et l’assainissement.' },
        { text: '9', why: 'L’ODD 9 porte sur l’infrastructure et l’industrie.' },
      ],
      quote: P_ODD13,
      explain: 'L’ODD 13 demande de prendre d’urgence des mesures contre les changements climatiques.',
    },
  ],
  docs: [
    {
      title: 'Les effets selon les régions (cas fictifs)',
      lines: [
        'Région A, près du pôle Nord : des maisons s’affaissent car le sol gelé en profondeur dégèle.',
        'Région B, un archipel de terres basses au milieu d’un océan : la mer avance sur les côtes.',
        'Région C, une grande ville d’Europe : les périodes de plusieurs jours très chauds sont plus fréquentes.',
      ],
      qs: [
        {
          q: 'D’après la ligne 1, quel phénomène explique les dégâts dans la région A ?',
          a: 'la fonte du pergélisol',
          wrong: [
            { label: 'la montée des eaux', why: 'La montée des eaux est décrite dans la région B (ligne 2).' },
            { label: 'une vague de chaleur en ville', why: 'La ligne 1 parle du sol gelé qui dégèle, près du pôle.' },
          ],
          quote: G_PERGELISOL,
          explain: 'Le sol gelé en permanence dégèle : c’est la fonte du pergélisol.',
          src: PERGELISOL,
        },
        {
          q: 'Pourquoi les trois lignes montrent-elles des effets différents ?',
          a: 'le changement global se traduit différemment selon les espaces et les sociétés',
          wrong: [
            { label: 'le climat ne change que dans une seule région', why: 'Les trois régions sont touchées.' },
            {
              label: 'ces effets n’ont aucun rapport avec le climat',
              why: 'Chaque ligne décrit un effet géographique du changement climatique.',
            },
          ],
          quote: G_DIFFERENCIES,
          explain: 'Un même phénomène mondial a des effets géographiques régionaux différents.',
          src: GLOBAL,
        },
      ],
    },
    {
      title: 'Météo ou climat ?',
      lines: [
        'Nino : « Il a neigé hier, donc le climat ne se réchauffe pas. »',
        'Aïko : « Une journée ne dit rien du climat : il faut regarder les moyennes sur de longues périodes. »',
        'La professeure : « Et le réchauffement peut s’accompagner de saisons froides plus marquées dans certaines régions. »',
      ],
      qs: [
        {
          q: 'Pourquoi Aïko a-t-elle raison ?',
          a: 'le climat se définit sur au moins trente ans, pas sur un jour',
          wrong: [
            {
              label: 'la neige n’existe plus aujourd’hui',
              why: 'La neige existe toujours : le problème est la durée observée.',
            },
            { label: 'le climat se mesure chaque matin', why: 'Chaque matin, on observe le temps qu’il fait.' },
          ],
          quote: G_CLIMAT,
          explain: 'Il faut une moyenne sur au moins trente ans pour parler de climat.',
          src: CLIMAT,
        },
        {
          q: 'D’après la ligne 3, pourquoi parle-t-on aussi de « dérèglement » climatique ?',
          a: 'le changement ne se limite pas au réchauffement : froid et pluies sont aussi modifiés',
          wrong: [
            {
              label: 'parce que la température moyenne baisse partout',
              why: 'La moyenne mondiale monte ; seules certaines saisons ou régions diffèrent.',
            },
            { label: 'parce que le climat n’est plus mesuré', why: 'Le climat continue d’être mesuré.' },
          ],
          quote: G_DEREGLEMENT,
          explain: 'Le mot « dérèglement » rappelle que les précipitations et les saisons sont aussi touchées.',
          src: CLIMAT,
        },
      ],
    },
    {
      title: 'Une politique face au réchauffement (cas fictif)',
      lines: [
        'Un pays décide de produire moins de gaz à effet de serre en rénovant ses bâtiments.',
        'Il aide aussi ses villes côtières à se préparer à la montée de la mer.',
        'Il rappelle qu’un traité signé par de nombreux États en 2015 fixe un seuil de température.',
      ],
      qs: [
        {
          q: 'Quel est le traité évoqué à la ligne 3 ?',
          a: 'l’Accord de Paris',
          wrong: [
            { label: 'le protocole de Kyoto', why: 'Il date de 1997, pas de 2015.' },
            { label: 'le traité de l’Antarctique', why: 'Il ne porte pas sur un seuil de température.' },
          ],
          quote: G_ACCORD,
          explain: 'L’Accord de Paris, adopté en 2015, fixe le seuil des 2 °C.',
          src: PARIS,
        },
        {
          q: 'D’après le programme, à quoi peut servir une politique comme celle décrite aux lignes 1 et 2 ?',
          a: 'éviter, modérer les effets du changement climatique ou s’y adapter',
          wrong: [
            { label: 'faire disparaître les saisons', why: 'Aucune politique ne vise cela.' },
            { label: 'faire augmenter les émissions de gaz', why: 'La ligne 1 veut au contraire les réduire.' },
          ],
          quote: P_ETUDE_CLIMAT,
          explain: 'Ligne 1 : on modère le réchauffement ; ligne 2 : on s’adapte à ses effets.',
          src: C4,
        },
      ],
    },
  ],
};

// ——— Notion 2 : les risques ———

const risques: Notion = {
  classe: '5e',
  id: 'g5-risques',
  title: 'Les risques : naturels, technologiques et sanitaires',
  hint: 'Un risque réunit un phénomène possible (aléa) et des personnes ou des biens fragiles : cherche les deux.',
  memo: [
    'Un **risque** réunit un **aléa**, des **enjeux** (personnes, biens) et leur **vulnérabilité** : sans personne exposée, un cyclone n’est pas un risque.',
    'On distingue des risques liés à des processus naturels, des **risques technologiques** (usine, barrage) et des **risques sanitaires** (virus, pollution) ; certains sont liés au changement climatique.',
    'Quand un risque se réalise avec de lourds dommages, c’est une **catastrophe**. La directive **Seveso** classe les sites industriels dangereux.',
  ],
  faits: [
    {
      q: 'En géographie, qu’est-ce qu’un risque ?',
      a: 'la possibilité qu’un aléa touche une population vulnérable',
      wrong: [
        {
          label: 'un événement qui s’est forcément déjà produit',
          why: 'Un risque est une possibilité ; l’événement réalisé est une catastrophe.',
        },
        {
          label: 'un phénomène naturel qui touche un lieu désert',
          why: 'Sans enjeux exposés, il n’y a pas de risque.',
        },
        {
          label: 'le nom donné à toutes les pluies',
          why: 'Une pluie est un phénomène ; le risque suppose des personnes ou des biens exposés.',
        },
      ],
      gap: ['Un risque naît quand un ', ' peut toucher une population vulnérable.', ['aléa']],
      choix: ['aléa', 'atlas', 'relief'],
      quote: G_RISQUE,
      explain: 'Aléa et population vulnérable : les deux sont nécessaires.',
      src: RISQUE,
    },
    {
      q: 'Un typhon passe sur un atoll désert du Pacifique. Pourquoi n’est-ce pas un risque ?',
      a: 'aucun enjeu humain n’y est exposé',
      wrong: [
        {
          label: 'un typhon n’est pas un aléa',
          why: 'Le typhon est bien un aléa ; c’est la présence d’enjeux qui manque.',
        },
        { label: 'le Pacifique ne connaît pas de typhons', why: 'La phrase dit justement qu’un typhon y passe.' },
        {
          label: 'les atolls sont protégés par des barrages',
          why: 'Un atoll désert n’a ni habitants ni barrages à protéger.',
        },
      ],
      gap: ['L’aléa ne devient un risque qu’en présence d’', ' vulnérables.', ['enjeux']],
      choix: ['enjeux', 'objectifs', 'îles'],
      quote: G_ATOLL,
      explain: 'Sans personnes ni biens exposés, le phénomène existe mais le risque non.',
      src: ALEA,
    },
    {
      q: 'Comment appelle-t-on un risque devenu réalité, avec de lourds dommages ?',
      a: 'une catastrophe',
      wrong: [
        { label: 'une prévision', why: 'La prévision cherche à connaître à l’avance les aléas.' },
        { label: 'une précaution', why: 'La précaution est une attitude de prudence face à un doute.' },
        { label: 'un aléa', why: 'L’aléa est le phénomène possible ; la catastrophe est le risque réalisé.' },
      ],
      gap: ['La ', ' est la réalisation d’un risque.', ['catastrophe']],
      choix: ['catastrophe', 'prévision', 'vulnérabilité'],
      quote: G_CATASTROPHE,
      explain: 'La catastrophe est un risque devenu réalité qui interrompt gravement la vie d’une société.',
      src: CATASTROPHE,
    },
    {
      q: 'Quelle est la particularité d’un risque technologique ?',
      a: 'son aléa est lié à des activités humaines',
      wrong: [
        { label: 'son aléa vient forcément du sous-sol', why: 'Un aléa du sous-sol, comme un séisme, est naturel.' },
        { label: 'il n’a aucune victime possible', why: 'Les employés et les riverains peuvent être touchés.' },
        { label: 'il ne concerne que les ordinateurs', why: 'Le mot désigne les usines, l’énergie, les transports…' },
      ],
      gap: ['Le risque technologique vient d’un aléa lié à des activités ', '.', ['humaines']],
      choix: ['humaines', 'naturelles', 'volcaniques'],
      quote: G_TECHNO,
      explain: 'Une usine, un barrage ou un forage peuvent créer un aléa technologique.',
      src: TECHNO,
    },
    {
      q: 'Quel type de risque correspond à la probabilité d’un événement nuisible à la santé ?',
      a: 'le risque sanitaire',
      wrong: [
        { label: 'le risque sismique', why: 'Le risque sismique est lié aux tremblements de terre.' },
        { label: 'le risque industriel', why: 'Le risque industriel concerne les activités d’une usine.' },
        { label: 'le risque littoral', why: 'Le risque littoral concerne les côtes, par exemple les submersions.' },
      ],
      gap: ['Un événement nuisible à la santé relève du risque ', '.', ['sanitaire']],
      choix: ['sanitaire', 'sismique', 'littoral'],
      quote: G_SANITAIRE,
      explain: 'Sanitaire : ce qui concerne la santé.',
      src: SANITAIRE,
    },
    {
      q: 'D’après le glossaire Géoconfluences, à quoi sont surtout liés les facteurs sociaux de la vulnérabilité ?',
      a: 'à la pauvreté',
      wrong: [
        { label: 'au relief des océans', why: 'Il s’agit de facteurs liés aux sociétés.' },
        {
          label: 'à la couleur des bâtiments',
          why: 'La vulnérabilité sociale vient surtout des moyens des populations.',
        },
        { label: 'au nombre de musées', why: 'Les musées ne déterminent pas la fragilité face aux aléas.' },
      ],
      gap: ['Les principaux facteurs de vulnérabilité sont souvent liés à la ', '.', ['pauvreté']],
      choix: ['pauvreté', 'latitude', 'marée'],
      quote: G_PAUVRETE,
      explain: 'Des familles pauvres s’installent parfois sur des pentes ou des zones inondables.',
      src: VULNERABILITE,
    },
  ],
  paires3: [
    ['Aléa', 'Phénomène possible qui perturbe un milieu'],
    ['Enjeux', 'Personnes et biens susceptibles d’être touchés'],
    ['Catastrophe', 'Risque devenu réalité, avec de lourds dommages'],
  ],
  paires5: [
    ['Aléa', 'Phénomène possible qui perturbe un milieu'],
    ['Enjeux', 'Personnes et biens susceptibles d’être touchés'],
    ['Catastrophe', 'Risque devenu réalité, avec de lourds dommages'],
    ['Vulnérabilité', 'Fragilité face à un phénomène'],
    ['Risque sanitaire', 'Possibilité d’un événement nuisible à la santé'],
  ],
  libres: [
    {
      q: 'Comment qualifie-t-on un risque qui peut faire de très nombreuses victimes et d’énormes dégâts ? Un risque…',
      accepted: ['majeur', 'un risque majeur', 'risque majeur'],
      traps: [
        { text: 'sanitaire', why: 'Sanitaire désigne un risque pour la santé, quelle que soit son ampleur.' },
        { text: 'naturel', why: 'Naturel désigne l’origine de l’aléa, pas la gravité des conséquences.' },
      ],
      quote: G_MAJEUR,
      explain: 'Le risque majeur est rare mais ses conséquences sont énormes.',
      src: RISQUE,
    },
    {
      q: 'Comment appelle-t-on, en géographie des risques, les personnes et les biens susceptibles d’être touchés ?',
      accepted: ['enjeux', 'les enjeux', 'des enjeux', 'les enjeux exposés'],
      traps: [
        { text: 'aléa', why: 'L’aléa est le phénomène, pas ce qu’il peut toucher.' },
        { text: 'catastrophe', why: 'La catastrophe est le risque réalisé.' },
      ],
      quote: G_ENJEUX,
      explain: 'Les enjeux : personnes, biens, équipements et environnements exposés.',
      src: ENJEUX,
    },
    {
      q: 'Quel nom porte la directive européenne qui classe les sites industriels dangereux ?',
      accepted: ['Seveso', 'la directive Seveso', 'directive Seveso'],
      traps: [
        { text: 'Kyoto', why: 'Le protocole de Kyoto porte sur le climat.' },
        { text: 'GIEC', why: 'Le GIEC évalue les connaissances sur le climat.' },
      ],
      quote: G_CLASSEMENT,
      explain: 'La directive Seveso porte le nom d’une commune italienne frappée par un accident en 1976.',
      src: SEVESO,
    },
    {
      q: 'Quelle pandémie, apparue fin 2019, montre que les risques sanitaires peuvent être mondiaux ?',
      accepted: [
        'covid-19',
        'la covid-19',
        'covid 19',
        'la covid 19',
        'covid',
        'la covid',
        'le covid',
        'le covid-19',
        'covid19',
      ],
      traps: [
        { text: 'la peste noire', why: 'La peste noire date du XIVe siècle.' },
        { text: 'la grippe espagnole', why: 'La grippe espagnole a sévi de 1918 à 1920.' },
      ],
      quote: G_COVID,
      explain: 'La covid-19 a montré qu’un risque sanitaire peut toucher la planète entière.',
      src: SANITAIRE,
    },
    {
      q: 'Complète la formule qui résume le risque : risque = aléa × … ?',
      accepted: ['vulnérabilité', 'la vulnérabilité', 'vulnerabilite'],
      traps: [
        { text: 'catastrophe', why: 'La catastrophe est le résultat, pas un facteur du risque.' },
        { text: 'prévention', why: 'La prévention réduit le risque ; elle n’entre pas dans la formule.' },
      ],
      quote: G_FORMULE,
      explain: 'Le risque combine un aléa et la vulnérabilité de ce qui est exposé.',
      src: RISQUE,
    },
  ],
  docs: [
    {
      title: 'Un accident dans une vallée industrielle (cas fictif)',
      lines: [
        'Dans la ville de Valbrun, une usine chimique est construite à côté d’un quartier d’habitations.',
        'Une fuite de produit toxique se produit : les ouvriers et les habitants sont exposés.',
        'Après l’accident, les pompiers interviennent et la zone est évacuée.',
      ],
      qs: [
        {
          q: 'Quel type de risque est en cause à Valbrun ?',
          a: 'un risque industriel',
          wrong: [
            { label: 'un risque sismique', why: 'Aucune ligne ne parle d’un tremblement de terre.' },
            { label: 'un risque d’avalanche', why: 'Aucune montagne ni neige ne sont mentionnées.' },
          ],
          quote: G_INDUSTRIEL,
          explain: 'L’aléa vient de l’activité d’une usine : c’est un risque industriel.',
          src: TECHNO,
        },
        {
          q: 'D’après les lignes 1 et 2, pourquoi les habitants sont-ils concernés ?',
          a: 'des quartiers proches du site exposent des enjeux humains',
          wrong: [
            {
              label: 'ils fabriquent tous les produits toxiques',
              why: 'La ligne 1 dit seulement que les habitations sont à côté.',
            },
            {
              label: 'le risque ne touche jamais les employés',
              why: 'La ligne 2 cite les ouvriers parmi les personnes exposées.',
            },
          ],
          quote: G_VICTIMES,
          explain: 'Employés et riverains sont des enjeux : leur proximité les rend vulnérables.',
          src: TECHNO,
        },
      ],
    },
    {
      title: 'Deux quartiers face à la même pluie (cas fictif)',
      lines: [
        'Une forte pluie touche deux quartiers voisins.',
        'Quartier A : des maisons solides, construites loin du cours d’eau.',
        'Quartier B : des logements fragiles, construits au bord de l’eau par des familles pauvres.',
        'Le quartier B subit des dégâts bien plus lourds.',
      ],
      qs: [
        {
          q: 'Quelle idée explique la différence entre les deux quartiers ?',
          a: 'la vulnérabilité n’est pas la même',
          wrong: [
            { label: 'l’aléa n’est pas le même', why: 'Ligne 1 : la même pluie touche les deux quartiers.' },
            { label: 'la pluie est un risque technologique', why: 'La pluie est un phénomène naturel.' },
          ],
          quote: G_VULN,
          explain: 'Même aléa, vulnérabilité différente : les effets diffèrent.',
          src: VULNERABILITE,
        },
        {
          q: 'D’après la ligne 3, quel facteur social aggrave la vulnérabilité du quartier B ?',
          a: 'la pauvreté des familles',
          wrong: [
            { label: 'la distance au cours d’eau, trop grande', why: 'Les logements sont au bord de l’eau, pas loin.' },
            { label: 'la solidité des maisons', why: 'Ligne 3 : les logements sont fragiles.' },
          ],
          quote: G_PAUVRETE,
          explain: 'La pauvreté pousse à habiter des lieux exposés et des logements fragiles.',
          src: VULNERABILITE,
        },
      ],
    },
    {
      title: 'Les grandes familles de risques',
      lines: [
        'Séisme : le sol tremble sous une ville.',
        'Explosion dans une usine qui stocke des produits dangereux.',
        'Épidémie : une maladie se répand très vite dans une population.',
        'Vague de chaleur plus fréquente à cause du changement climatique.',
      ],
      qs: [
        {
          q: 'Quelle ligne décrit un risque sanitaire lié à une maladie ?',
          a: 'la ligne 3',
          wrong: [
            { label: 'la ligne 1', why: 'La ligne 1 décrit un séisme, un risque naturel.' },
            { label: 'la ligne 2', why: 'La ligne 2 décrit un risque industriel.' },
          ],
          quote: G_AGENTS,
          explain: 'Un virus ou un bacille menace la santé : c’est un risque sanitaire.',
          src: SANITAIRE,
        },
        {
          q: 'Quel type de risque est décrit à la ligne 2 ?',
          a: 'un risque industriel et technologique',
          wrong: [
            { label: 'un risque climatique', why: 'La ligne 4 est liée au climat, pas la ligne 2.' },
            { label: 'un risque naturel sismique', why: 'La ligne 1 décrit le séisme.' },
          ],
          quote: G_CLASSEMENT,
          explain: 'Stocker des produits dangereux dans une usine crée un risque industriel et technologique.',
          src: SEVESO,
        },
      ],
    },
  ],
};

// ——— Notion 3 : s’adapter ———

const adapter: Notion = {
  classe: '5e',
  id: 'g5-adaptation',
  title: 'S’adapter au changement global',
  hint: 'Demande-toi : l’action réduit-elle la cause (les émissions) ou protège-t-elle contre les effets déjà là ?',
  memo: [
    'S’adapter, c’est ajuster ses activités et son territoire aux changements : l’**adaptation** se distingue de l’**atténuation**, qui réduit les émissions de gaz à effet de serre.',
    'La **résilience** est la capacité d’une société à se relever après un choc. En ville, des arbres et de l’eau créent des **îlots de fraîcheur** contre la chaleur.',
    'Tous les territoires n’ont pas les mêmes moyens de s’adapter : la prospective aide à préparer l’avenir sans catastrophisme.',
  ],
  faits: [
    {
      q: 'Que désigne l’adaptation au changement climatique ?',
      a: 'ajuster un territoire ou une activité aux changements, présents ou attendus',
      wrong: [
        {
          label: 'empêcher la Terre de tourner',
          why: 'L’adaptation concerne les sociétés, pas la rotation de la Terre.',
        },
        { label: 'nier que le climat change', why: 'S’adapter suppose au contraire de tenir compte du changement.' },
        { label: 'réduire les émissions de gaz à effet de serre', why: 'C’est l’atténuation, qui agit sur la cause.' },
      ],
      gap: ['S’adapter, c’est ajuster ses mécanismes pour tenir compte des changements ', '.', ['environnementaux']],
      choix: ['environnementaux', 'électoraux', 'sportifs'],
      quote: G_ADAPTABILITE,
      explain: 'On ajuste les territoires et les activités à ce qui change ou va changer.',
      src: ADAPTATION,
    },
    {
      q: 'Quelle action relève de l’atténuation plutôt que de l’adaptation ?',
      a: 'réduire les émissions de gaz à effet de serre',
      wrong: [
        {
          label: 'planter des arbres pour rafraîchir les rues',
          why: 'Ici, on se protège de la chaleur : c’est de l’adaptation.',
        },
        { label: 'rehausser une digue face à la mer', why: 'On se protège d’un effet : c’est de l’adaptation.' },
        { label: 'installer des fontaines contre la chaleur', why: 'C’est une adaptation à la chaleur.' },
      ],
      gap: ['L’adaptation se distingue de l’', ', qui agit sur les causes.', ['atténuation']],
      choix: ['atténuation', 'accélération', 'alimentation'],
      quote: G_ATTENUATION,
      explain: 'Atténuer : agir sur les causes ; s’adapter : faire avec les effets.',
      src: POLITIQUES,
    },
    {
      q: 'Qu’est-ce que la résilience ?',
      a: 'la capacité à revenir à son état initial après une perturbation',
      wrong: [
        { label: 'le refus de reconstruire après un choc', why: 'La résilience consiste à se relever.' },
        { label: 'la disparition définitive d’un aléa', why: 'La résilience ne supprime pas les aléas.' },
        { label: 'le nom d’un gaz à effet de serre', why: 'La résilience n’est pas un gaz.' },
      ],
      gap: ['La ', ' est la capacité à se relever après un choc.', ['résilience']],
      choix: ['résilience', 'résidence', 'ressource'],
      quote: G_RESILIENCE,
      explain: 'Après une inondation, un quartier résilient retrouve vite son fonctionnement.',
      src: RESILIENCE,
    },
    {
      q: 'Quel phénomène rend certaines villes plus chaudes que leurs environs ?',
      a: 'l’îlot de chaleur urbain',
      wrong: [
        { label: 'la submersion marine', why: 'La submersion est une inondation du littoral par la mer.' },
        { label: 'le pergélisol', why: 'Le pergélisol est un sol gelé en permanence.' },
        { label: 'le typhon', why: 'Un typhon est une tempête tropicale.' },
      ],
      gap: ['L’îlot de chaleur ', ' est un dôme d’air plus chaud au-dessus de la ville.', ['urbain']],
      choix: ['urbain', 'marin', 'polaire'],
      quote: G_ICU,
      explain: 'Béton, bitume et absence de végétation retiennent la chaleur en ville.',
      src: ICU,
    },
    {
      q: 'Quel aménagement aide une ville à s’adapter aux fortes chaleurs ?',
      a: 'végétaliser et ajouter des espaces aquatiques',
      wrong: [
        { label: 'bitumer toutes les places', why: 'Le bitume emmagasine la chaleur : il aggrave le problème.' },
        { label: 'supprimer les parcs', why: 'Les parcs rafraîchissent la ville.' },
        {
          label: 'multiplier les immeubles serrés sans arbres',
          why: 'Les bâtiments serrés bloquent l’air et chauffent la ville.',
        },
      ],
      gap: ['Pour rafraîchir une ville, on favorise la ', ' et les plans d’eau.', ['végétalisation']],
      choix: ['végétalisation', 'bétonisation', 'pollution'],
      quote: G_LEVIERS,
      explain: 'Arbres, eau et matériaux réfléchissants créent des îlots de fraîcheur.',
      src: ICU,
    },
    {
      q: 'Tous les territoires ont-ils la même capacité de résilience et d’adaptation ?',
      a: 'non, elle varie selon les espaces et les sociétés',
      wrong: [
        {
          label: 'oui, elle est identique partout',
          why: 'Les moyens et les situations diffèrent d’un territoire à l’autre.',
        },
        { label: 'oui, car tous les pays ont les mêmes revenus', why: 'Les revenus des pays sont très inégaux.' },
        {
          label: 'non, seuls les pays du pôle Nord peuvent s’adapter',
          why: 'Tous les territoires cherchent des solutions, avec des moyens différents.',
        },
      ],
      gap: ['Les capacités de résilience et d’adaptation sont ', ' selon les sociétés.', ['variables']],
      choix: ['variables', 'identiques', 'nulles'],
      quote: G_DIFFERENTES,
      explain: 'Les moyens financiers, techniques et la situation géographique changent tout.',
      src: GLOBAL,
    },
  ],
  paires3: [
    ['Adaptation', 'Ajuster les activités aux changements'],
    ['Atténuation', 'Réduire les causes du réchauffement'],
    ['Résilience', 'Se relever après un choc'],
  ],
  paires5: [
    ['Adaptation', 'Ajuster les activités aux changements'],
    ['Atténuation', 'Réduire les causes du réchauffement'],
    ['Résilience', 'Se relever après un choc'],
    ['Îlot de chaleur urbain', 'Dôme d’air plus chaud au-dessus d’une ville'],
    ['Îlot de fraîcheur', 'Zone de la ville plus fraîche, avec arbres ou eau'],
  ],
  libres: [
    {
      q: 'Quel objectif de développement durable (ODD) vise une infrastructure résiliente ? Donne son numéro.',
      accepted: ['9', 'ODD 9', 'ODD9', 'l’ODD 9'],
      traps: [
        { text: '13', why: 'L’ODD 13 porte sur la lutte contre les changements climatiques.' },
        { text: '15', why: 'L’ODD 15 porte sur les écosystèmes terrestres.' },
      ],
      quote: P_ODD9,
      explain: 'L’ODD 9 vise des infrastructures résilientes et une industrialisation durable.',
    },
    {
      q: 'Quel mot désigne la réponse qui ajuste un territoire aux changements du climat ?',
      accepted: ['adaptation', 'l’adaptation', 'une adaptation'],
      traps: [
        { text: 'atténuation', why: 'L’atténuation réduit les causes ; elle n’ajuste pas le territoire aux effets.' },
        { text: 'aléa', why: 'L’aléa est un phénomène possible, pas une réponse.' },
      ],
      quote: G_ADAPTABILITE,
      explain: 'L’adaptation consiste à ajuster un territoire ou une activité aux changements.',
      src: ADAPTATION,
    },
    {
      q: 'Comment appelle-t-on la capacité d’un système à revenir à son état initial après une perturbation ?',
      accepted: ['résilience', 'la résilience', 'resilience'],
      traps: [
        {
          text: 'résistance',
          why: 'La résistance s’oppose à l’aléa ; la résilience vise à en réduire les effets et à se relever.',
        },
        { text: 'atténuation', why: 'L’atténuation agit sur les causes du réchauffement.' },
      ],
      quote: G_RESILIENCE,
      explain: 'C’est la résilience, mot clé du programme sur les risques.',
      src: RESILIENCE,
    },
    {
      q: 'Quel nom donne-t-on à un espace de la ville plus frais que le reste, grâce à des arbres ou à de l’eau ?',
      accepted: [
        'îlot de fraîcheur',
        'un îlot de fraîcheur',
        'l’îlot de fraîcheur',
        'ilot de fraicheur',
        'îlots de fraîcheur',
      ],
      traps: [
        { text: 'îlot de chaleur', why: 'L’îlot de chaleur est au contraire l’espace plus chaud.' },
        { text: 'oasis', why: 'En ville, on parle d’îlot de fraîcheur ; l’oasis est un lieu cultivé du désert.' },
      ],
      quote: G_FRAICHEUR,
      explain: 'Parcs, jardins et plans d’eau créent des îlots de fraîcheur.',
      src: FRAICHEUR,
    },
    {
      q: 'À quel moment de la journée l’îlot de chaleur urbain est-il le plus fort ?',
      accepted: ['la nuit', 'nuit', 'pendant la nuit', 'durant la nuit'],
      traps: [
        { text: 'le matin', why: 'C’est la nuit que les bâtiments rendent la chaleur stockée.' },
        { text: 'à midi', why: 'L’écart avec la campagne est surtout nocturne.' },
      ],
      quote: G_NUIT,
      explain: 'La nuit, la campagne se refroidit mais la ville rend la chaleur emmagasinée.',
      src: ICU,
    },
  ],
  docs: [
    {
      title: 'Un village face à la sécheresse (cas fictif)',
      lines: [
        'Dans un village, les étés deviennent plus secs et les récoltes diminuent.',
        'Les agriculteurs choisissent des cultures qui demandent moins d’eau.',
        'La commune installe un réseau d’eau plus économe.',
        'Elle encourage aussi le vélo pour rejeter moins de gaz à effet de serre.',
      ],
      qs: [
        {
          q: 'Quelles lignes décrivent surtout une adaptation ?',
          a: 'les lignes 2 et 3',
          wrong: [
            { label: 'la ligne 4 seule', why: 'La ligne 4 réduit les émissions : c’est de l’atténuation.' },
            { label: 'la ligne 1 seule', why: 'La ligne 1 décrit le problème, pas une réponse.' },
          ],
          quote: G_ADAPTABILITE,
          explain: 'Changer les cultures et économiser l’eau, c’est ajuster les activités aux nouvelles conditions.',
          src: ADAPTATION,
        },
        {
          q: 'Pourquoi la mesure de la ligne 4 relève-t-elle de l’atténuation ?',
          a: 'elle réduit les émissions qui causent le réchauffement',
          wrong: [
            { label: 'elle protège les cultures du soleil', why: 'Le vélo ne protège pas les champs.' },
            { label: 'elle augmente la consommation d’eau', why: 'La ligne 4 parle des émissions de gaz.' },
          ],
          quote: G_ATTENUATION,
          explain: 'Rejeter moins de gaz, c’est agir sur la cause : l’atténuation.',
          src: POLITIQUES,
        },
      ],
    },
    {
      title: 'Une place transformée (cas fictif)',
      lines: [
        'Une grande place goudronnée devient brûlante en été.',
        'La ville y plante des arbres et crée un bassin.',
        'Les nuits y sont désormais moins chaudes.',
      ],
      qs: [
        {
          q: 'Quel phénomène la ligne 2 cherche-t-elle à combattre ?',
          a: 'l’îlot de chaleur urbain',
          wrong: [
            { label: 'la submersion marine', why: 'Aucune mer n’est mentionnée.' },
            { label: 'la fonte du pergélisol', why: 'Aucun sol gelé n’est mentionné.' },
          ],
          quote: G_VILLES,
          explain: 'Arbres et eau rafraîchissent un espace très chaud : la ville s’adapte.',
          src: ICU,
        },
        {
          q: 'Comment appeler la place après les travaux (lignes 2 et 3) ?',
          a: 'un îlot de fraîcheur',
          wrong: [
            { label: 'un îlot de chaleur', why: 'Les nuits y sont moins chaudes : c’est l’inverse.' },
            { label: 'une zone industrielle', why: 'On n’y installe aucune usine.' },
          ],
          quote: G_FRAICHEUR,
          explain: 'Un espace plus frais que le reste de la ville est un îlot de fraîcheur.',
          src: FRAICHEUR,
        },
      ],
    },
    {
      title: 'Après la crue (cas fictif)',
      lines: [
        'Une crue envahit une petite ville.',
        'Quelques semaines plus tard, les écoles et les commerces rouvrent.',
        'La ville modifie ses bâtiments pour que la prochaine crue fasse moins de dégâts.',
      ],
      qs: [
        {
          q: 'Quelle qualité de la ville la ligne 2 montre-t-elle ?',
          a: 'sa résilience',
          wrong: [
            { label: 'son enclavement', why: 'L’enclavement est la difficulté d’accès, sans rapport ici.' },
            { label: 'sa densité', why: 'La densité compte les habitants par km².' },
          ],
          quote: G_RESILIENCE,
          explain: 'La ville retrouve son fonctionnement après le choc : elle est résiliente.',
          src: RESILIENCE,
        },
        {
          q: 'Quelle différence y a-t-il entre une digue et la résilience ?',
          a: 'la digue s’oppose à l’aléa, la résilience cherche à en réduire les effets',
          wrong: [
            {
              label: 'la digue réduit les émissions, la résilience les augmente',
              why: 'Ni la digue ni la résilience ne concernent d’abord les émissions.',
            },
            {
              label: 'il n’y a aucune différence',
              why: 'La résistance et la résilience sont deux approches distinctes.',
            },
          ],
          quote: G_RESISTANCE,
          explain:
            'La résistance cherche à bloquer l’aléa ; la résilience admet qu’il faut vivre avec et limiter les dommages.',
          src: RESILIENCE,
        },
      ],
    },
  ],
};

// ——— Notion 4 : prévenir ———

const prevenir: Notion = {
  classe: '5e',
  id: 'g5-prevention',
  title: 'Prévenir les risques',
  hint: 'Cherche si le risque est déjà connu (prévention) ou encore incertain (précaution), et qui agit.',
  memo: [
    'La **prévention** anticipe un risque connu pour en limiter les dégâts ; elle va avec la **prévision** et la protection.',
    'Le **principe de précaution** s’applique quand un danger grave est encore incertain. Un **PPR** cartographie les zones exposées et fixe des règles de construction.',
    'La **culture du risque** passe par l’information : chaque citoyen a un rôle pour sa sécurité.',
  ],
  faits: [
    {
      q: 'Quel est le but de la prévention des risques ?',
      a: 'anticiper un risque pour limiter ses effets destructeurs',
      wrong: [
        { label: 'attendre la catastrophe avant d’agir', why: 'La prévention agit à l’avance.' },
        {
          label: 'supprimer tous les phénomènes naturels',
          why: 'On ne supprime pas les aléas ; on limite leurs effets.',
        },
        {
          label: 'indemniser seulement après les dégâts',
          why: 'L’indemnisation vient après ; la prévention vient avant.',
        },
      ],
      gap: ['La prévention a pour but d’anticiper un risque en limitant ses effets ', '.', ['destructeurs']],
      choix: ['destructeurs', 'bénéfiques', 'saisonniers'],
      quote: G_PREVENTION,
      explain: 'Prévenir : agir avant, pour réduire les dommages.',
      src: PREVENTION,
    },
    {
      q: 'Quels sont les « trois P » qui réduisent la vulnérabilité face aux aléas ?',
      a: 'prévision, prévention, protection',
      wrong: [
        { label: 'production, pollution, profit', why: 'Ces mots décrivent l’économie, pas la gestion des risques.' },
        {
          label: 'population, paysage, patrimoine',
          why: 'Ces mots sont géographiques mais ne forment pas les trois P des risques.',
        },
        { label: 'pluie, plaine, plage', why: 'Ce sont des mots de géographie, sans lien avec les trois P.' },
      ],
      gap: ['Les trois P : prévision, prévention et ', '.', ['protection']],
      choix: ['protection', 'production', 'promenade'],
      quote: G_TROIS_P,
      explain: 'Connaître l’aléa, anticiper ses effets, protéger les personnes et les biens.',
      src: PREVENTION,
    },
    {
      q: 'Quand applique-t-on le principe de précaution ?',
      a: 'quand un risque aux effets graves reste scientifiquement incertain',
      wrong: [
        { label: 'quand le risque est parfaitement connu', why: 'Pour un risque connu, on parle de prévention.' },
        {
          label: 'uniquement après une catastrophe',
          why: 'La précaution permet de décider avant d’avoir toutes les informations.',
        },
        {
          label: 'quand il n’existe aucun doute ni aucun danger',
          why: 'Sans doute ni danger, aucune précaution particulière ne s’impose.',
        },
      ],
      gap: [
        'La précaution concerne des risques encore ',
        ', aux effets possibles graves et irréversibles.',
        ['incertains'],
      ],
      choix: ['incertains', 'certains', 'inexistants'],
      quote: G_PRECAUTION,
      explain: 'Le doute n’empêche pas la prudence quand les effets pourraient être irréversibles.',
      src: PRECAUTION,
    },
    {
      q: 'Que cartographie un plan de prévention des risques (PPR) ?',
      a: 'l’intensité d’un aléa et les règles à appliquer dans chaque zone',
      wrong: [
        { label: 'les meilleurs restaurants d’une commune', why: 'Un PPR porte sur les risques.' },
        { label: 'les résultats des élections', why: 'Un PPR est un document d’urbanisme sur les risques.' },
        { label: 'le trajet des transports scolaires', why: 'Un PPR ne sert pas à organiser les transports.' },
      ],
      gap: ['Un PPR est un document d’', ' qui cartographie un aléa.', ['urbanisme']],
      choix: ['urbanisme', 'identité', 'histoire'],
      quote: G_PPR,
      explain: 'Selon la zone, construire est libre, limité ou interdit.',
      src: PPR,
    },
    {
      q: 'Qui doit être le premier acteur de sa sécurité face aux risques ?',
      a: 'le citoyen',
      wrong: [
        { label: 'le seul assureur', why: 'L’assureur indemnise ; il ne protège pas à lui seul.' },
        { label: 'les touristes étrangers', why: 'Chaque habitant est concerné, pas seulement les visiteurs.' },
        {
          label: 'personne, car rien ne peut être fait',
          why: 'De nombreux moyens d’information et de prévention existent.',
        },
      ],
      gap: ['Le ', ' doit être le premier acteur de sa sécurité.', ['citoyen']],
      choix: ['citoyen', 'volcan', 'barrage'],
      quote: E_CITOYEN,
      explain: 'S’informer en mairie, connaître les consignes : chacun a un rôle.',
      src: ECOLOGIE,
    },
    {
      q: 'Depuis 2003, quels repères sont obligatoires dans les communes exposées aux inondations ?',
      a: 'des repères de crue',
      wrong: [
        { label: 'des repères de marée', why: 'Les repères obligatoires concernent les crues.' },
        { label: 'des panneaux publicitaires', why: 'Ils n’ont aucun rapport avec les inondations.' },
        { label: 'des bornes kilométriques', why: 'Les bornes indiquent des distances.' },
      ],
      gap: ['Les communes inondables doivent poser des repères de ', '.', ['crue']],
      choix: ['crue', 'sécheresse', 'neige'],
      quote: E_REPERES,
      explain: 'Les repères de crue entretiennent la mémoire des inondations passées.',
      src: ECOLOGIE,
    },
  ],
  paires3: [
    ['Prévision', 'Mieux connaître les aléas et leurs lieux'],
    ['Prévention', 'Anticiper pour limiter les dommages'],
    ['Précaution', 'Prudence face à un danger encore incertain'],
  ],
  paires5: [
    ['Prévision', 'Mieux connaître les aléas et leurs lieux'],
    ['Prévention', 'Anticiper pour limiter les dommages'],
    ['Précaution', 'Prudence face à un danger encore incertain'],
    ['PPR', 'Document qui zone les espaces exposés à un aléa'],
    ['Culture du risque', 'Place du risque dans les représentations d’une population'],
  ],
  libres: [
    {
      q: 'Quel principe s’applique quand un danger grave est encore incertain ? Le principe de…',
      accepted: ['précaution', 'la précaution', 'principe de précaution', 'le principe de précaution', 'precaution'],
      traps: [
        { text: 'prévention', why: 'La prévention vise un risque connu.' },
        { text: 'prévision', why: 'La prévision cherche à connaître les aléas.' },
      ],
      quote: G_PRECAUTION,
      explain: 'C’est le principe de précaution.',
      src: PRECAUTION,
    },
    {
      q: 'Quel sigle désigne le plan de prévention des risques technologiques ?',
      accepted: ['PPRT', 'le PPRT', 'les PPRT'],
      traps: [
        { text: 'PPRN', why: 'Le PPRN concerne les risques naturels prévisibles.' },
        { text: 'PNUD', why: 'Le PNUD est un programme de l’ONU pour le développement.' },
      ],
      quote: G_PPRT,
      explain: 'PPRT : il limite la construction près d’installations industrielles à haut risque.',
      src: TECHNO,
    },
    {
      q: 'Sous l’autorité de qui élabore-t-on le plan de prévention des risques naturels (PPRN) ?',
      accepted: ['le préfet', 'préfet', 'la préfète', 'préfète', 'du préfet', 'sous l’autorité du préfet'],
      traps: [
        { text: 'le maire', why: 'Les communes sont associées, mais c’est le préfet qui pilote le PPRN.' },
        { text: 'le professeur', why: 'Un PPRN est un document de l’État.' },
      ],
      quote: E_PREFET,
      explain: 'Le préfet élabore le PPRN en associant les collectivités locales.',
      src: ECOLOGIE,
    },
    {
      q: 'Quelle expression désigne la place du risque dans les représentations d’une population ? La culture du…',
      accepted: ['risque', 'la culture du risque', 'culture du risque', 'des risques'],
      traps: [
        { text: 'danger', why: 'L’expression utilisée est « culture du risque ».' },
        { text: 'climat', why: 'La culture du risque concerne tous les risques.' },
      ],
      quote: G_CULTURE,
      explain: 'La culture du risque repose sur la mémoire et sur la connaissance du risque.',
      src: CULTURE,
    },
  ],
  docs: [
    {
      title: 'Une commune au bord d’une rivière (cas fictif)',
      lines: [
        'La carte de la commune montre une zone basse inondable et une zone haute.',
        'Dans la zone basse, il est interdit de construire de nouvelles maisons.',
        'La mairie affiche les consignes à suivre et pose des repères des anciennes crues.',
      ],
      qs: [
        {
          q: 'Quel document peut fixer les règles de la ligne 2 ?',
          a: 'un plan de prévention des risques',
          wrong: [
            { label: 'un atlas des océans', why: 'Il ne fixe aucune règle de construction.' },
            { label: 'un bulletin scolaire', why: 'Il ne porte pas sur l’urbanisme.' },
          ],
          quote: G_ZONAGE,
          explain: 'Le PPR établit un zonage, jusqu’à rendre une zone inconstructible.',
          src: PPR,
        },
        {
          q: 'À quoi servent surtout les actions de la ligne 3 ?',
          a: 'à développer la culture du risque chez les habitants',
          wrong: [
            { label: 'à provoquer de nouvelles crues', why: 'Les repères rappellent les crues passées.' },
            { label: 'à vendre plus de maisons inondables', why: 'La mairie informe les habitants.' },
          ],
          quote: E_REPERES,
          explain: 'Informer et garder la mémoire des crues aide la population à réagir.',
          src: ECOLOGIE,
        },
      ],
    },
    {
      title: 'Un nouveau produit (cas fictif)',
      lines: [
        'Des scientifiques se demandent si un nouveau produit peut nuire durablement à la santé.',
        'Les preuves manquent encore, mais les effets pourraient être graves et difficiles à réparer.',
        'Les autorités suspendent sa vente en attendant de nouvelles études.',
      ],
      qs: [
        {
          q: 'Quel principe la décision de la ligne 3 illustre-t-elle ?',
          a: 'le principe de précaution',
          wrong: [
            {
              label: 'la prévention d’un risque déjà connu',
              why: 'Ligne 2 : les preuves manquent, le risque est incertain.',
            },
            { label: 'la résilience après un séisme', why: 'Aucune catastrophe ne s’est produite.' },
          ],
          quote: G_PRECAUTION,
          explain: 'Face à un doute et à des effets potentiellement graves, on agit avec prudence.',
          src: PRECAUTION,
        },
        {
          q: 'En quoi cette situation diffère-t-elle d’un risque d’inondation bien connu ?',
          a: 'le danger n’est pas encore établi, alors que la prévention vise des risques connus',
          wrong: [
            { label: 'l’inondation n’a aucune victime possible', why: 'Une inondation peut faire des victimes.' },
            { label: 'le produit est forcément sans danger', why: 'Personne ne l’affirme : le doute demeure.' },
          ],
          quote: G_AVERE,
          explain: 'La prévention porte sur des risques avérés ; la précaution sur des risques potentiels.',
          src: PREVENTION,
        },
      ],
    },
    {
      title: 'Se préparer dans une île tropicale (cas fictif)',
      lines: [
        'Un service météo suit un cyclone et annonce son intensité et sa trajectoire possible.',
        'Les écoles apprennent aux élèves les consignes à suivre.',
        'Les habitants renforcent leurs toits avant la saison des cyclones.',
      ],
      qs: [
        {
          q: 'Quel « P » correspond surtout à la ligne 1 ?',
          a: 'la prévision',
          wrong: [
            {
              label: 'la précaution',
              why: 'La précaution concerne un danger incertain ; ici, on suit un phénomène identifié.',
            },
            { label: 'la réparation', why: 'La réparation viendrait après le passage.' },
          ],
          quote: G_PREVISION,
          explain: 'Connaître l’aléa, son intensité et son lieu probable, c’est la prévision.',
          src: PREVISION,
        },
        {
          q: 'D’après la ligne 2, pourquoi l’école est-elle utile ?',
          a: 'l’éducation à la prévention aide les élèves à adopter les bons comportements',
          wrong: [
            { label: 'elle empêche le cyclone de se former', why: 'Aucune leçon ne supprime un aléa.' },
            { label: 'elle remplace la météo', why: 'La météo prévoit l’aléa, l’école prépare les personnes.' },
          ],
          quote: G_INFORMATION,
          explain: 'En France, chaque élève est sensibilisé à la prévention des risques pendant sa scolarité.',
          src: EDUCATION,
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [climat, risques, adapter, prevenir];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n));
