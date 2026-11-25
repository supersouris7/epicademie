import type { Skill } from '../types.ts';
import { notion, type Citation, type Notion } from './kit.ts';

/**
 * 6e, « Vie privée et vie publique » (lot em-6e-02), partie « Avoir des droits en tant que personne et respecter
 * ceux des autres : l’exemple du droit à la vie privée » du programme d'EMC du 13 juin 2024, qui rattache le
 * harcèlement en ligne à ce chapitre (cyberharcèlement). Chaque fait cite le programme (registre `emc-2024`) ou
 * un texte du registre, avec sa citation exacte. La loi du 7 juillet 2023 n'a pas été appliquée et une loi du
 * 24 août 2026 est intervenue : les questions sur la majorité numérique datent chaque fait et ne décrivent pas
 * les conditions d'inscription en vigueur. Les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 6e : « Apprendre à vivre dans une société démocratique », droit à la vie privée';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 6e.';

/** Citation d'un texte du registre des sources. */
const cite =
  (id: string, label: string) =>
  (quote: string): Citation => ({ quote, from: { id, label } });
const prog = (quote: string): Citation => ({ quote });

const vp = cite('vie-publique-vie-privee', 'le site Vie publique');
const majorite = cite('vie-publique-majorite-numerique', 'le site Vie publique');
const loi2026 = cite('senat-reseaux-mineurs-2026', 'le site du Sénat');
const charte = cite('ue-charte-droits', 'la Charte des droits fondamentaux de l’Union européenne');
const rgpd = cite('rgpd-2016-679', 'le règlement général sur la protection des données');
const loiHarcelement = cite('an-loi-harcelement-2022', 'la loi du 2 mars 2022');
const vpHarcelement = cite('vie-publique-harcelement-scolaire', 'le site Vie publique');
const senat = cite('senat-rapport-harcelement', 'un rapport du Sénat');

// ——— Citations exactes ———

const POUR_TOUS = prog(
  'L’enfant comme l’adulte a droit au respect de sa vie privée (CIDE, DDHC et Charte des droits fondamentaux de l’Union européenne)',
);
const COMPREND = prog(
  'le droit au respect de la vie privée comprend le droit à l’intimité et la protection du droit à l’image',
);
const INTIMITE_AFFECTIVE = prog('l’intimité d’une personne recouvre la vie affective et sexuelle de cette personne');
const NUMERIQUE = prog(
  'ce droit doit être également respecté dans l’univers numérique et les réseaux sociaux (majorité numérique, données personnelles, traces numériques, réputation numérique)',
);
const TRACES = prog(
  'faire réfléchir à ce que sont des traces numériques, à la nécessité de les protéger (contre des usages commerciaux, mais aussi à des fins politiques) et à leur incidence sur la réputation d’une personne',
);
const OUBLI_TENSION = prog('tension entre droit à l’oubli et difficulté à le faire effectivement valoir');

const MAJORITE_DEF = majorite(
  'La majorité numérique désigne l’âge à partir duquel un mineur peut s’inscrire seul sur un réseau social, sans autorisation parentale',
);
const MAJORITE_15 = majorite('Depuis juillet 2023, une loi établit la majorité numérique à 15 ans en France');
const LOI_2026 = loi2026(
  "Loi visant à protéger les mineurs des risques auxquels les expose l'utilisation des réseaux sociaux (n° 2026-813 du 24 août 2026)",
);

const ARTICLE_7 = charte(
  'Toute personne a droit au respect de sa vie privée et familiale, de son domicile et de ses communications.',
);
const SECRET_MEDICAL = vp(
  'un médecin ne peut révéler les éléments du dossier médical d’une personne sans son consentement',
);
const IMAGE = vp('Il est interdit de capter l’image d’une personne sans son autorisation');
const IMAGE_TOUS = vp('Cette règle vaut pour tout un chacun et pas seulement les "personnes publiques"');
const DISTINCTS = vp('le droit à la vie privée et le droit à l’image sont des droits distincts mais étroitement liés');
const JUGE = vp('Le juge judiciaire est chargé de faire respecter le droit à la vie privée');
const CNIL = vp('la loi du 6 janvier 1978 a créé la Commission nationale de l’informatique et des libertés (CNIL)');
const DEPUIS_2018 = vp(
  'Depuis le 25 mai 2018, le Règlement général sur la protection des données (RGPD) pose un nouveau cadre juridique',
);

const DONNEE = rgpd('toute information se rapportant à une personne physique identifiée ou identifiable');
const IDENTIFIANTS = rgpd(
  "tel qu'un nom, un numéro d'identification, des données de localisation, un identifiant en ligne",
);
const TRAITEMENT = rgpd("telles que la collecte, l'enregistrement, l'organisation");
const CONSENTEMENT = rgpd('toute manifestation de volonté, libre, spécifique, éclairée et univoque');
const RECTIFICATION = rgpd(
  "La personne concernée a le droit d'obtenir du responsable du traitement, dans les meilleurs délais, la rectification des données à caractère personnel la concernant qui sont inexactes",
);
const EFFACEMENT = rgpd("Droit à l'effacement («droit à l'oubli»)");
const PROTECTION = charte('Toute personne a droit à la protection des données à caractère personnel la concernant.');
const ACCES = charte(
  "Toute personne a le droit d'accéder aux données collectées la concernant et d'en obtenir la rectification.",
);
const AUTORITE = charte("Le respect de ces règles est soumis au contrôle d'une autorité indépendante.");

const AUCUN_ELEVE = loiHarcelement('Aucun élève ou étudiant ne doit subir de faits de harcèlement');
const ATTEINTES = loiHarcelement(
  'ayant pour objet ou pour effet de porter atteinte à sa dignité, d’altérer sa santé physique ou mentale ou de dégrader ses conditions d’apprentissage',
);
const LIEUX = loiHarcelement('commis au sein de l’établissement d’enseignement ou en marge de la vie scolaire');
const INFORMATION = loiHarcelement(
  'Une information sur les risques liés au harcèlement scolaire, notamment au cyberharcèlement, est délivrée chaque année aux élèves et parents d’élèves',
);
const REPETEE = senat('Le harcèlement scolaire constitue une agression répétée, délibérée');
const TRIANGLE = senat('une relation triangulaire entre harcelé, harceleur et témoins passifs');
const AGIR_TEMOINS = senat('Agir sur les témoins est important afin de désamorcer une situation de harcèlement');
const PROLONGE = senat('cyberharcèlement qui constitue désormais une prolongation permanente du harcèlement scolaire');
const DELIT = vpHarcelement('La loi crée un délit de harcèlement scolaire');
const NUMERO = vpHarcelement(
  "le numéro national d'assistance 3018 pour les jeunes victimes de cyberviolence et de cyberharcèlement et leurs parents",
);
const PREUVES = vpHarcelement(
  "stockage sécurisé des preuves du harcèlement vécu (captures d'écran, photos, liens url, etc.)",
);

// ——— Notion 1 : la vie privée en ligne ———

const viePriveeEnLigne: Notion = {
  id: 'em6-vie-privee-en-ligne',
  title: 'La vie privée en ligne : traces, réputation, majorité numérique',
  hint: 'Repense au mémo : ce que tu fais en ligne laisse des marques, et tes droits te suivent sur les réseaux.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Le droit à la **vie privée** vaut aussi en ligne et sur les **réseaux sociaux**.',
    'Tes recherches, messages ou photos laissent des **traces numériques** qui agissent sur ta **réputation numérique** ; le **droit à l’oubli** est difficile à faire valoir.',
    'La loi du 7 juillet 2023 a fixé la **majorité numérique** à 15 ans ; une loi d’août 2026 protège aussi les mineurs. Exemple : avant de publier une photo, demande-toi qui pourra la voir demain.',
  ],
  faits: [
    {
      ...NUMERIQUE,
      q: 'Où le droit à la vie privée doit-il aussi être respecté ?',
      a: 'dans l’univers numérique et sur les réseaux sociaux',
      wrong: [
        { label: 'seulement à l’intérieur de la maison', why: 'Ce droit ne s’arrête pas à la porte de la maison.' },
        { label: 'nulle part dès qu’un écran est allumé', why: 'L’écran ne supprime aucun droit.' },
        {
          label: 'seulement dans les lettres envoyées par la poste',
          why: 'Les messages en ligne sont aussi concernés.',
        },
      ],
      gap: [
        'Le droit à la vie privée doit être respecté dans l’univers ',
        ' et sur les réseaux sociaux.',
        ['numérique', 'numerique'],
      ],
      explain: 'Le programme étend ce droit à l’univers numérique : les règles ne disparaissent pas en ligne.',
    },
    {
      ...TRACES,
      q: 'Sur quoi les traces numériques d’une personne peuvent-elles avoir un effet ?',
      a: 'sur sa réputation',
      wrong: [
        { label: 'sur sa taille', why: 'Des informations en ligne ne changent pas le corps.' },
        { label: 'sur sa date de naissance', why: 'Une date de naissance ne change pas.' },
        { label: 'sur la couleur de ses yeux', why: 'Les traces numériques ne modifient pas l’apparence physique.' },
      ],
      gap: [
        'Les traces numériques peuvent avoir une incidence sur la ',
        ' d’une personne.',
        ['réputation', 'reputation'],
      ],
      explain: 'Ce que les autres trouvent sur toi peut changer l’image qu’ils ont de toi.',
    },
    {
      ...TRACES,
      q: 'Contre quels usages faut-il, entre autres, protéger ses traces numériques ?',
      a: 'des usages commerciaux ou à des fins politiques',
      wrong: [
        { label: 'la lecture d’un livre emprunté au CDI', why: 'Ce n’est pas un usage de tes traces numériques.' },
        { label: 'la pratique d’un sport en plein air', why: 'Ce n’est pas un usage de données en ligne.' },
        {
          label: 'le calcul d’une moyenne de maths à la main',
          why: 'Ce calcul n’exploite pas tes traces en ligne.',
        },
      ],
      gap: [
        'Il faut protéger ses traces contre des usages ',
        ', mais aussi à des fins politiques.',
        ['commerciaux', 'commercial'],
      ],
      explain: 'Des entreprises ou des acteurs politiques peuvent chercher à exploiter ces traces pour t’influencer.',
    },
    {
      ...OUBLI_TENSION,
      avance: true,
      q: 'Que remarque le programme à propos du droit à l’oubli ?',
      a: 'il est difficile à faire effectivement valoir',
      wrong: [
        {
          label: 'il efface tout, tout de suite et sans démarche',
          why: 'Il faut agir, et le résultat n’est pas automatique.',
        },
        {
          label: 'il ne concerne que les oublis de leçons',
          why: 'Il porte sur des informations personnelles conservées.',
        },
        { label: 'il interdit d’utiliser Internet', why: 'Il ne ferme pas l’accès à Internet.' },
      ],
      gap: ['Le droit à l’', ' est difficile à faire effectivement valoir.', ['oubli', 'effacement']],
      explain: 'Un contenu copié ou partagé peut réapparaître : mieux vaut réfléchir avant de publier.',
    },
    {
      ...MAJORITE_DEF,
      q: 'Selon Vie publique, que désigne la majorité numérique ?',
      a: 'l’âge à partir duquel un mineur peut s’inscrire seul sur un réseau social',
      wrong: [
        { label: 'l’âge à partir duquel on a le droit de voter', why: 'Voter relève de la majorité civile, à 18 ans.' },
        {
          label: 'le nombre le plus grand d’abonnés d’un compte',
          why: 'Il s’agit d’un âge, pas d’un nombre d’abonnés.',
        },
        {
          label: 'l’âge à partir duquel on peut allumer un ordinateur',
          why: 'La définition porte sur l’inscription seul à un réseau social.',
        },
      ],
      gap: [
        'La majorité ',
        ' désigne l’âge à partir duquel un mineur peut s’inscrire seul sur un réseau social.',
        ['numérique', 'numerique'],
      ],
      explain: 'La majorité numérique concerne l’inscription sans autorisation parentale à un réseau social.',
    },
    {
      ...MAJORITE_15,
      q: 'À quel âge la loi de juillet 2023 a-t-elle établi la majorité numérique en France ?',
      a: '15 ans',
      wrong: [
        { label: '8 ans', why: 'C’est bien trop jeune : la loi retient un âge plus élevé.' },
        { label: '18 ans', why: '18 ans est l’âge de la majorité civile.' },
        { label: '12 ans', why: 'La loi de 2023 n’a pas retenu cet âge.' },
      ],
      gap: ['La loi de juillet 2023 a établi la majorité numérique à ', ' ans.', ['15', 'quinze']],
      explain: 'Le législateur a retenu quinze ans pour protéger les plus jeunes des risques en ligne.',
    },
    {
      ...LOI_2026,
      avance: true,
      q: 'Quel est le but annoncé par le titre de la loi du 24 août 2026 sur les réseaux sociaux ?',
      a: 'protéger les mineurs des risques liés à leur utilisation',
      wrong: [
        { label: 'obliger chaque élève à ouvrir un compte', why: 'La loi vise à protéger, pas à obliger.' },
        { label: 'vendre les données des mineurs', why: 'C’est le contraire d’une protection.' },
        { label: 'supprimer Internet dans les collèges', why: 'Le titre parle des risques des réseaux sociaux.' },
      ],
      gap: [
        'La loi du 24 août 2026 vise à protéger les ',
        ' des risques liés aux réseaux sociaux.',
        ['mineurs', 'mineures', 'enfants', 'jeunes'],
      ],
      explain: 'Le titre de la loi désigne les personnes protégées : les mineurs, c’est-à-dire les moins de 18 ans.',
    },
  ],
  paires3: [
    ['Traces numériques', 'Informations laissées en ligne'],
    ['Réputation numérique', 'Image qu’on se fait de quelqu’un d’après le web'],
    ['Majorité numérique (loi de 2023)', '15 ans'],
  ],
  paires5: [
    ['Traces numériques', 'Informations laissées en ligne'],
    ['Réputation numérique', 'Image qu’on se fait de quelqu’un d’après le web'],
    ['Majorité numérique (loi de 2023)', '15 ans'],
    ['Droit à l’oubli', 'Demander l’effacement d’informations sur soi'],
    ['Loi d’août 2026', 'Protection des mineurs sur les réseaux sociaux'],
  ],
  libres: [
    {
      ...MAJORITE_15,
      q: 'Quel âge la loi de 2023 a-t-elle fixé pour la majorité numérique ? (un nombre)',
      accepted: ['15', '15 ans', 'quinze', 'quinze ans'],
      traps: [
        { text: '18', why: '18 ans est la majorité civile, pas la majorité numérique.' },
        { text: '13', why: 'La loi de 2023 retient 15 ans.' },
      ],
      explain: 'La majorité numérique a été établie à quinze ans en juillet 2023.',
    },
    {
      ...TRACES,
      q: 'Comment nomme-t-on les informations qu’on laisse en utilisant Internet : des … numériques ?',
      accepted: ['traces', 'des traces', 'traces numériques', 'des traces numériques', 'trace'],
      traps: [
        { text: 'lois', why: 'Les lois sont des règles votées, pas les informations que tu laisses.' },
        { text: 'virus', why: 'Un virus est un programme nuisible, pas ce que tu laisses derrière toi.' },
      ],
      explain: 'Recherches, messages et photos laissent des traces numériques.',
    },
    {
      ...OUBLI_TENSION,
      q: 'Comment appelle-t-on le droit de demander que des informations sur soi soient effacées : le droit à l’… ?',
      accepted: ['oubli', 'à l’oubli', 'droit à l’oubli', 'effacement', 'droit à l’effacement'],
      traps: [
        { text: 'image', why: 'Le droit à l’image porte sur la prise et l’usage de ton image.' },
        { text: 'information', why: 'Le droit à l’information permet de s’informer, pas d’effacer.' },
      ],
      explain: 'On parle de droit à l’oubli, difficile cependant à faire valoir.',
    },
  ],
  docs: [
    {
      title: 'Le commentaire d’hier',
      lines: [
        'Il y a un an, un collégien a publié un commentaire moqueur sous une vidéo.',
        'Il l’a supprimé, mais un camarade en avait déjà fait une capture d’écran.',
        'Aujourd’hui, l’image circule de nouveau dans plusieurs groupes.',
        'Des élèves jugent le collégien sur cette seule phrase.',
      ],
      qs: [
        {
          ...OUBLI_TENSION,
          q: 'Pourquoi la suppression n’a-t-elle pas suffi ?',
          a: 'une copie existait : faire oublier un contenu est difficile',
          wrong: [
            {
              label: 'supprimer un message le rend plus visible à coup sûr',
              why: 'Ici, c’est la capture d’écran qui pose problème.',
            },
            {
              label: 'les commentaires moqueurs sont toujours effacés d’office',
              why: 'Le texte montre qu’il en reste une copie.',
            },
            {
              label: 'le droit à la vie privée n’existe pas en ligne',
              why: 'Ce droit vaut aussi dans l’univers numérique.',
            },
          ],
          explain: 'Une fois copié, un contenu échappe à son auteur : l’oubli devient difficile.',
        },
        {
          ...TRACES,
          q: 'Qu’est-ce qui est touché quand les élèves le jugent sur cette phrase ?',
          a: 'sa réputation',
          wrong: [
            { label: 'sa nationalité', why: 'Sa nationalité ne change pas.' },
            { label: 'son droit de vote', why: 'Un collégien ne vote pas encore et ce n’est pas le sujet.' },
            { label: 'son âge', why: 'L’âge n’est pas modifié par une publication.' },
          ],
          explain: 'La trace numérique influence l’image que les autres ont de lui.',
        },
      ],
    },
    {
      title: 'Une inscription à onze ans',
      lines: [
        'Une élève de 11 ans veut s’inscrire seule sur un réseau social.',
        'Pour cela, elle pense indiquer une fausse date de naissance.',
        'Son frère lui rappelle que la loi de 2023 a fixé un âge pour s’inscrire seul.',
        'Il lui propose d’en parler d’abord à un adulte de la famille.',
      ],
      qs: [
        {
          ...MAJORITE_15,
          q: 'Quel âge la loi de 2023 rappelée par le frère a-t-elle fixé ?',
          a: '15 ans',
          wrong: [
            { label: '11 ans', why: 'C’est l’âge de l’élève, pas celui de la loi.' },
            { label: '18 ans', why: 'C’est la majorité civile.' },
            { label: '6 ans', why: 'La loi retient un âge bien plus élevé.' },
          ],
          explain: 'La loi de 2023 établit la majorité numérique à 15 ans.',
        },
        {
          ...LOI_2026,
          q: 'Quel est l’intérêt des lois qui encadrent les réseaux sociaux pour une élève de son âge ?',
          a: 'la protéger des risques liés à ces réseaux',
          wrong: [
            { label: 'l’obliger à publier chaque jour', why: 'Aucune obligation de publier n’est en jeu.' },
            {
              label: 'lui retirer tout droit à la vie privée',
              why: 'La loi vise au contraire à protéger les mineurs.',
            },
            {
              label: 'rendre sa fausse date de naissance obligatoire',
              why: 'Mentir sur son âge n’est pas une protection.',
            },
          ],
          explain: 'La loi de 2026 s’annonce comme une loi de protection des mineurs face aux risques des réseaux.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : le droit à l’intimité ———

const droitIntimite: Notion = {
  id: 'em6-droit-intimite',
  title: 'Le droit à l’intimité : vie privée, secret et droit à l’image',
  hint: 'Repense au mémo : ce qui appartient à la vie privée, et ce qu’il faut obtenir avant de prendre ou montrer.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'L’enfant comme l’adulte a droit au respect de sa **vie privée**, qui comprend le droit à l’**intimité** et le **droit à l’image**.',
    'Elle couvre aussi le domicile, les communications et le **secret médical** ; l’intimité recouvre la vie affective et sexuelle.',
    'Capter l’image d’une personne sans son **autorisation** est interdit. Exemple : avant de photographier un camarade, demande-lui son accord ; un **juge** fait respecter ces droits.',
  ],
  faits: [
    {
      ...POUR_TOUS,
      q: 'Qui a droit au respect de sa vie privée ?',
      a: 'l’enfant comme l’adulte',
      wrong: [
        { label: 'seulement les personnes célèbres', why: 'La célébrité ne donne pas ce droit à quelques-uns.' },
        { label: 'seulement les adultes', why: 'L’enfant a lui aussi ce droit.' },
        { label: 'seulement les élus', why: 'Ce droit n’est pas réservé à une fonction.' },
      ],
      gap: ['L’enfant comme l’adulte a droit au respect de sa vie ', '.', ['privée', 'privee']],
      explain: 'Ce droit est reconnu à toute personne, quel que soit son âge.',
    },
    {
      ...COMPREND,
      q: 'Que comprend le droit au respect de la vie privée ?',
      a: 'le droit à l’intimité et la protection du droit à l’image',
      wrong: [
        {
          label: 'le droit de tout savoir sur ses voisins',
          why: 'La vie privée limite au contraire la curiosité des autres.',
        },
        { label: 'le droit de conduire une voiture', why: 'Cela ne concerne pas la vie privée.' },
        { label: 'le droit de publier les photos de tout le monde', why: 'Le droit à l’image l’interdit sans accord.' },
      ],
      gap: [
        'Le droit à la vie privée comprend le droit à l’',
        ' et la protection du droit à l’image.',
        ['intimité', 'intimite'],
      ],
      explain: 'Intimité et image sont deux protections comprises dans le droit à la vie privée.',
    },
    {
      ...INTIMITE_AFFECTIVE,
      avance: true,
      q: 'Selon le programme, que recouvre l’intimité d’une personne ?',
      a: 'sa vie affective et sexuelle',
      wrong: [
        { label: 'son emploi du temps affiché au collège', why: 'Un horaire affiché n’a rien d’intime.' },
        { label: 'les lois votées par le Parlement', why: 'Les lois sont publiques.' },
        { label: 'le nom de sa commune affiché à l’entrée de la ville', why: 'C’est une information publique.' },
      ],
      gap: ['L’intimité d’une personne recouvre sa vie ', ' et sexuelle.', ['affective', 'amoureuse', 'sentimentale']],
      explain: 'Les sentiments et la vie amoureuse relèvent de l’intimité : personne ne peut les exposer à ta place.',
    },
    {
      ...ARTICLE_7,
      q: 'Selon la Charte de l’Union européenne, qu’a-t-on le droit de voir respecté, avec sa vie privée et familiale ?',
      a: 'son domicile et ses communications',
      wrong: [
        { label: 'ses notes affichées pour tous', why: 'L’article protège la personne, il n’affiche rien.' },
        { label: 'sa place préférée dans le bus', why: 'La Charte ne parle pas de cela.' },
        {
          label: 'son droit de lire le courrier des autres',
          why: 'Les communications des autres sont protégées aussi.',
        },
      ],
      gap: [
        'Toute personne a droit au respect de sa vie privée et familiale, de son ',
        ' et de ses communications.',
        ['domicile'],
      ],
      explain: 'Chez soi et dans ses messages, on a droit à la tranquillité.',
    },
    {
      ...SECRET_MEDICAL,
      q: 'Que dit Vie publique sur le dossier médical d’une personne ?',
      a: 'un médecin ne peut le révéler sans le consentement de la personne',
      wrong: [
        { label: 'tout le monde peut le consulter librement', why: 'Le dossier médical est couvert par le secret.' },
        { label: 'le médecin doit le publier sur Internet', why: 'Ce serait violer le secret médical.' },
        { label: 'les voisins en décident', why: 'Seule la personne concernée donne son accord.' },
      ],
      gap: ['Un médecin ne peut révéler le dossier médical d’une personne sans son ', '.', ['consentement', 'accord']],
      explain: 'La santé relève de la vie privée : le secret professionnel et médical la protège.',
    },
    {
      ...IMAGE,
      q: 'Que faut-il avoir pour capter l’image d’une personne ?',
      a: 'son autorisation',
      wrong: [
        { label: 'un téléphone récent', why: 'L’appareil ne donne aucun droit.' },
        { label: 'beaucoup d’abonnés', why: 'La popularité ne remplace pas l’accord.' },
        { label: 'une bonne lumière', why: 'La qualité de la photo n’y change rien.' },
      ],
      gap: [
        'Il est interdit de capter l’image d’une personne sans son ',
        '.',
        ['autorisation', 'accord', 'consentement'],
      ],
      explain: 'Le droit à l’image permet à chacun de refuser d’être photographié ou filmé.',
    },
    {
      ...IMAGE_TOUS,
      avance: true,
      q: 'À qui s’applique la règle sur l’autorisation pour capter une image ?',
      a: 'à chacun, pas seulement aux personnes publiques',
      wrong: [
        { label: 'uniquement aux personnes publiques', why: 'La règle vaut pour tout un chacun.' },
        { label: 'uniquement aux professeurs', why: 'Les élèves sont aussi protégés.' },
        { label: 'uniquement aux personnes âgées', why: 'Aucune limite d’âge de ce genre.' },
      ],
      gap: [
        'La règle vaut pour tout un chacun et pas seulement pour les personnes ',
        '.',
        ['publiques', 'publique', 'célèbres', 'celebres', 'connues'],
      ],
      explain: 'Un camarade inconnu a autant de droits sur son image qu’une personne connue.',
    },
    {
      ...JUGE,
      avance: true,
      q: 'Qui est chargé de faire respecter le droit à la vie privée ?',
      a: 'le juge judiciaire',
      wrong: [
        { label: 'le délégué de classe', why: 'Il représente les élèves, il ne juge pas.' },
        { label: 'la personne qui a le plus d’abonnés', why: 'La popularité ne fait pas la justice.' },
        { label: 'le gérant d’un magasin', why: 'Il n’a pas cette mission.' },
      ],
      gap: ['Le ', ' judiciaire est chargé de faire respecter le droit à la vie privée.', ['juge']],
      explain: 'Quand ce droit est violé, la justice peut intervenir.',
    },
  ],
  paires3: [
    ['Droit à l’image', 'Refuser d’être filmé sans accord'],
    ['Secret médical', 'Dossier de santé non révélé sans consentement'],
    ['Domicile', 'Le lieu où l’on habite'],
  ],
  paires5: [
    ['Droit à l’image', 'Refuser d’être filmé sans accord'],
    ['Secret médical', 'Dossier de santé non révélé sans consentement'],
    ['Domicile', 'Le lieu où l’on habite'],
    ['Juge judiciaire', 'Fait respecter la vie privée'],
    ['Intimité', 'Ce qu’on a de plus personnel'],
  ],
  libres: [
    {
      ...IMAGE,
      q: 'Comment appelle-t-on le droit qui protège contre la prise de sa photo sans accord : le droit à l’… ?',
      accepted: ['image', 'l’image', 'droit à l’image', 'le droit à l’image', 'à l’image'],
      traps: [
        { text: 'oubli', why: 'Le droit à l’oubli concerne l’effacement d’informations.' },
        { text: 'éducation', why: 'Le droit à l’éducation permet d’apprendre.' },
        {
          text: 'intimité',
          why: 'L’intimité est protégée aussi, mais le droit qui porte précisément sur les photos est le droit à l’image.',
        },
      ],
      explain: 'C’est le droit à l’image, lié au droit à la vie privée.',
    },
    {
      ...DISTINCTS,
      q: 'Vie privée et droit à l’image sont distincts, mais étroitement … (un adjectif).',
      accepted: ['liés', 'lies', 'lié', 'liées'],
      traps: [
        { text: 'opposés', why: 'Ils ne s’opposent pas : ils se complètent.' },
        { text: 'confondus', why: 'Ils sont distincts : ce n’est pas le même droit.' },
      ],
      explain: 'Ce sont deux droits différents mais étroitement liés.',
    },
    {
      ...SECRET_MEDICAL,
      q: 'Comment appelle-t-on le secret qui protège le dossier de santé : le secret … ?',
      accepted: ['médical', 'medical', 'secret médical', 'le secret médical', 'professionnel', 'secret professionnel'],
      traps: [
        { text: 'scolaire', why: 'Le dossier de santé relève du médecin.' },
        { text: 'bancaire', why: 'Le secret bancaire concerne les comptes d’argent.' },
      ],
      explain: 'Le secret médical interdit au médecin de révéler le dossier sans consentement.',
    },
  ],
  docs: [
    {
      title: 'La photo dans les vestiaires',
      lines: [
        'Après le cours de sport, un élève sort son téléphone dans les vestiaires.',
        'Il photographie un camarade qui se change, sans rien lui demander.',
        'Le camarade proteste et demande que la photo soit supprimée.',
        'L’élève répond : « Ce n’est rien, il n’est même pas célèbre. »',
      ],
      qs: [
        {
          ...IMAGE_TOUS,
          q: 'Pourquoi la réponse de l’élève est-elle fausse ?',
          a: 'le droit à l’image protège chacun, célèbre ou non',
          wrong: [
            {
              label: 'seules les photos de célébrités sont autorisées',
              why: 'La règle n’autorise personne sans accord.',
            },
            {
              label: 'une photo prise au collège est toujours publique',
              why: 'Le lieu ne supprime pas le droit à l’image.',
            },
            { label: 'le camarade n’a aucun droit avant 18 ans', why: 'L’enfant a droit au respect de sa vie privée.' },
          ],
          explain:
            'La règle vaut pour tout un chacun : on ne photographie pas quelqu’un sans son autorisation, encore moins quand il se change. Il faut prévenir un adulte.',
        },
        {
          ...COMPREND,
          q: 'Quels droits du camarade sont en cause ?',
          a: 'son droit à l’intimité et son droit à l’image',
          wrong: [
            { label: 'son droit de vote et de candidature', why: 'Aucune élection n’est en jeu.' },
            { label: 'son droit à une nationalité', why: 'Ce droit n’est pas concerné.' },
            { label: 'son droit aux loisirs seulement', why: 'La photo touche à sa vie privée.' },
          ],
          explain: 'Être photographié en se changeant, sans accord, atteint l’intimité et le droit à l’image.',
        },
      ],
    },
    {
      title: 'Le rendez-vous chez le médecin',
      lines: [
        'Un élève revient au collège après un rendez-vous chez le médecin.',
        'Une camarade veut savoir ce que le médecin a noté dans son dossier.',
        'Elle propose d’appeler le cabinet pour le demander.',
        'L’élève répond que cela ne regarde que lui et sa famille.',
      ],
      qs: [
        {
          ...SECRET_MEDICAL,
          q: 'Pourquoi le médecin ne donnera-t-il pas ces informations à la camarade ?',
          a: 'il ne peut les révéler sans consentement',
          wrong: [
            { label: 'il n’a pas son numéro de classe', why: 'La raison est le secret médical.' },
            { label: 'les camarades doivent attendre une semaine', why: 'Aucun délai ne lève le secret.' },
            { label: 'seul le délégué peut les obtenir', why: 'Le délégué n’a pas accès au dossier de santé.' },
          ],
          explain: 'Le dossier médical est protégé par le secret : le consentement est nécessaire.',
        },
        {
          ...POUR_TOUS,
          q: 'L’élève a-t-il le droit de refuser de répondre à sa camarade ?',
          a: 'oui, un enfant a aussi droit au respect de sa vie privée',
          wrong: [
            { label: 'non, seuls les adultes ont une vie privée', why: 'L’enfant comme l’adulte a ce droit.' },
            { label: 'non, entre camarades il n’y a pas de secret', why: 'L’amitié ne supprime pas la vie privée.' },
            { label: 'oui, mais uniquement s’il est célèbre', why: 'Ce droit ne dépend pas de la célébrité.' },
          ],
          explain: 'Sa santé fait partie de sa vie privée, et ce droit vaut aussi pour les enfants.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : les données personnelles ———

const donneesPersonnelles: Notion = {
  id: 'em6-donnees-personnelles',
  title: 'Les données personnelles : les reconnaître et les protéger',
  hint: 'Repense au mémo : ce qui permet de reconnaître une personne, et les droits qu’elle garde sur ces informations.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Une **donnée personnelle** est une information qui se rapporte à une personne **identifiée** ou **identifiable** : nom, localisation, identifiant en ligne.',
    'La collecter ou l’enregistrer, c’est un **traitement**. Le **consentement** doit être libre et éclairé.',
    'Tu peux demander à accéder à tes données, à les **rectifier** ou à les effacer. En France, la **CNIL** veille sur l’informatique et les libertés. Exemple : un pseudonyme peut suffire à te reconnaître.',
  ],
  faits: [
    {
      ...DONNEE,
      q: 'Qu’est-ce qu’une donnée à caractère personnel ?',
      a: 'une information sur une personne identifiée ou identifiable',
      wrong: [
        { label: 'la température moyenne d’un océan', why: 'Elle ne se rapporte à aucune personne.' },
        { label: 'la règle d’un jeu de société', why: 'Elle ne permet de reconnaître personne.' },
        { label: 'la hauteur d’une montagne', why: 'C’est une information sur un lieu.' },
      ],
      gap: ['Une donnée personnelle se rapporte à une personne identifiée ou ', '.', ['identifiable']],
      explain: 'Si l’information permet, directement ou non, de reconnaître quelqu’un, c’est une donnée personnelle.',
    },
    {
      ...IDENTIFIANTS,
      q: 'Parmi ces éléments, lequel peut permettre d’identifier une personne ?',
      a: 'ses données de localisation',
      wrong: [
        { label: 'le résultat d’une addition', why: 'Il ne désigne personne.' },
        { label: 'le nom d’une planète', why: 'Il ne désigne aucune personne.' },
        { label: 'la couleur du ciel', why: 'Elle n’identifie personne.' },
      ],
      gap: [
        'Un nom, des données de ',
        ' ou un identifiant en ligne peuvent identifier une personne.',
        ['localisation', 'géolocalisation'],
      ],
      explain: 'Savoir où se trouve quelqu’un permet de le reconnaître : la localisation est une donnée à protéger.',
    },
    {
      ...TRAITEMENT,
      avance: true,
      q: 'La collecte et l’enregistrement de données personnelles sont des exemples de quoi ?',
      a: 'un traitement de données',
      wrong: [
        { label: 'une élection', why: 'Aucun vote n’est organisé.' },
        { label: 'une récréation', why: 'Il s’agit d’une opération sur des données.' },
        { label: 'un secret médical', why: 'Le secret médical protège un dossier de santé.' },
      ],
      gap: ['La collecte et l’enregistrement sont des exemples de ', ' de données.', ['traitement', 'traitements']],
      explain: 'Le mot traitement désigne les opérations faites sur des données : les recueillir en est déjà une.',
    },
    {
      ...CONSENTEMENT,
      q: 'Comment doit être le consentement donné pour utiliser ses données ?',
      a: 'libre et éclairé',
      wrong: [
        { label: 'forcé et caché', why: 'Un accord forcé n’est pas un consentement.' },
        { label: 'deviné par l’entreprise', why: 'La personne doit manifester elle-même sa volonté.' },
        { label: 'obtenu en trompant la personne', why: 'Elle doit comprendre ce qu’elle accepte.' },
      ],
      gap: [
        'Le consentement doit être une manifestation de volonté libre et ',
        '.',
        ['éclairée', 'éclairé', 'eclairee', 'eclaire', 'spécifique', 'univoque'],
      ],
      explain: 'Consentir, c’est accepter sans contrainte et en sachant à quoi l’on dit oui.',
    },
    {
      ...PROTECTION,
      q: 'Qui a droit à la protection de ses données à caractère personnel ?',
      a: 'toute personne',
      wrong: [
        {
          label: 'seulement les entreprises',
          why: 'Les entreprises traitent des données ; le droit protège les personnes.',
        },
        { label: 'seulement les adultes qui paient', why: 'Aucun paiement n’est exigé.' },
        { label: 'personne', why: 'La Charte garantit ce droit.' },
      ],
      gap: [
        'Toute personne a droit à la protection des ',
        ' à caractère personnel la concernant.',
        ['données', 'donnees'],
      ],
      explain: 'La Charte des droits fondamentaux en fait un droit reconnu à toute personne.',
    },
    {
      ...ACCES,
      q: 'Que peut-on faire à propos des données collectées sur soi ?',
      a: 'y accéder et obtenir leur correction',
      wrong: [
        { label: 'consulter celles de tous les autres', why: 'Le droit porte sur les données qui te concernent.' },
        { label: 'rien du tout une fois collectées', why: 'Tu gardes des droits après la collecte.' },
        { label: 'les vendre à la place de l’autorité', why: 'La Charte parle d’accès et de rectification.' },
      ],
      gap: [
        'Toute personne a le droit d’',
        ' aux données collectées la concernant.',
        ['accéder', 'acceder', 'avoir accès'],
      ],
      explain: 'Accéder à ses données permet de vérifier ce qui est conservé et de faire corriger les erreurs.',
    },
    {
      ...RECTIFICATION,
      avance: true,
      q: 'Comment appelle-t-on le droit de faire corriger des données inexactes sur soi ?',
      a: 'le droit de rectification',
      wrong: [
        { label: 'le droit de vote', why: 'Il permet d’élire des représentants.' },
        { label: 'le droit à l’image', why: 'Il porte sur la prise et l’usage de ton image.' },
        { label: 'le droit de propriété', why: 'Il concerne les biens possédés.' },
      ],
      gap: [
        'La personne a le droit d’obtenir la ',
        ' des données inexactes.',
        ['rectification', 'correction', 'modification'],
      ],
      explain: 'Rectifier, c’est corriger une information fausse.',
    },
    {
      ...AUTORITE,
      avance: true,
      q: 'Qui contrôle le respect des règles de protection des données, selon la Charte ?',
      a: 'une autorité indépendante',
      wrong: [
        { label: 'chaque entreprise pour elle seule', why: 'Le contrôle doit venir d’une autorité indépendante.' },
        { label: 'le premier utilisateur venu', why: 'La Charte désigne une autorité.' },
        { label: 'personne', why: 'Un contrôle est prévu.' },
      ],
      gap: ['Le respect de ces règles est soumis au contrôle d’une autorité ', '.', ['indépendante', 'independante']],
      explain: 'Une autorité indépendante peut vérifier sans dépendre de ceux qu’elle contrôle.',
    },
    {
      ...CNIL,
      avance: true,
      q: 'Quelle commission la loi du 6 janvier 1978 a-t-elle créée ?',
      a: 'la Commission nationale de l’informatique et des libertés (CNIL)',
      wrong: [
        { label: 'l’Assemblée nationale', why: 'C’est une assemblée du Parlement, bien plus ancienne.' },
        { label: 'le conseil de la vie collégienne', why: 'C’est une instance du collège.' },
        { label: 'le conseil municipal', why: 'C’est l’assemblée des élus d’une commune.' },
      ],
      gap: ['La loi du 6 janvier 1978 a créé la ', ' (quatre lettres).', ['CNIL', 'la CNIL']],
      explain: 'La CNIL a été créée pour protéger les libertés et la vie privée face aux fichiers informatiques.',
    },
    {
      ...DEPUIS_2018,
      avance: true,
      q: 'Quel texte pose, depuis le 25 mai 2018, un nouveau cadre pour protéger les données personnelles ?',
      a: 'le règlement général sur la protection des données (RGPD)',
      wrong: [
        { label: 'la loi de 1905', why: 'Elle sépare les Églises et l’État.' },
        { label: 'la loi du 15 mars 2004', why: 'Elle porte sur les signes religieux à l’école.' },
        { label: 'la loi de 1881 sur la presse', why: 'Elle porte sur la liberté de la presse.' },
      ],
      gap: [
        'Depuis le 25 mai 2018, le ',
        ' pose un nouveau cadre de protection des données.',
        ['RGPD', 'règlement général sur la protection des données'],
      ],
      explain: 'Le RGPD est le règlement européen qui encadre l’usage des données personnelles.',
    },
  ],
  paires3: [
    ['Donnée personnelle', 'Information permettant de reconnaître quelqu’un'],
    ['Consentement', 'Accord libre et éclairé'],
    ['Rectification', 'Correction d’une erreur'],
  ],
  paires5: [
    ['Donnée personnelle', 'Information permettant de reconnaître quelqu’un'],
    ['Consentement', 'Accord libre et éclairé'],
    ['Rectification', 'Correction d’une erreur'],
    ['Effacement', 'Suppression de données'],
    ['CNIL', 'Commission créée par la loi de 1978'],
  ],
  libres: [
    {
      ...CONSENTEMENT,
      q: 'Quel mot désigne l’accord libre et éclairé pour l’utilisation de ses données ?',
      accepted: ['consentement', 'le consentement'],
      traps: [
        { text: 'collecte', why: 'La collecte est le recueil des données, pas l’accord.' },
        { text: 'règlement', why: 'Le règlement fixe les règles ; ce n’est pas ton accord.' },
      ],
      explain: 'Cet accord s’appelle le consentement.',
    },
    {
      ...EFFACEMENT,
      q: 'Le droit à l’effacement est aussi appelé droit à l’… ?',
      accepted: ['oubli', 'l’oubli', 'droit à l’oubli', 'à l’oubli'],
      traps: [
        { text: 'image', why: 'Le droit à l’image est un autre droit.' },
        { text: 'accès', why: 'Le droit d’accès permet de consulter ses données.' },
      ],
      explain: 'Le règlement l’appelle droit à l’effacement, ou « droit à l’oubli ».',
    },
    {
      ...CNIL,
      q: 'Quel sigle désigne la Commission nationale de l’informatique et des libertés ?',
      accepted: ['CNIL', 'la CNIL', 'C.N.I.L.'],
      traps: [
        { text: 'CIDE', why: 'La CIDE est la Convention internationale des droits de l’enfant.' },
        { text: 'RGPD', why: 'Le RGPD est un règlement, pas une commission.' },
      ],
      explain: 'La Commission nationale de l’informatique et des libertés se note CNIL.',
    },
  ],
  docs: [
    {
      title: 'Le formulaire du jeu',
      lines: [
        'Un jeu en ligne demande un nom, un prénom et l’autorisation de suivre la position.',
        'Une case est déjà cochée pour accepter l’envoi de ces informations à d’autres sociétés.',
        'Le texte qui explique cette case est caché tout en bas de la page.',
        'Un joueur se demande quelles informations il donne vraiment.',
      ],
      qs: [
        {
          ...IDENTIFIANTS,
          q: 'Pourquoi faut-il protéger la position du joueur ?',
          a: 'les données de localisation peuvent permettre de l’identifier',
          wrong: [
            { label: 'elle indique seulement la météo', why: 'La position concerne la personne.' },
            { label: 'elle n’a aucun lien avec une personne', why: 'Elle dit où se trouve le joueur.' },
            {
              label: 'elle sert uniquement à dessiner le jeu',
              why: 'Rien ne le dit ; elle reste une donnée personnelle.',
            },
          ],
          explain: 'La localisation fait partie des éléments qui identifient une personne.',
        },
        {
          ...CONSENTEMENT,
          q: 'Quel défaut présente la case déjà cochée avec son explication cachée ?',
          a: 'le joueur ne donne pas un accord clair et éclairé',
          wrong: [
            { label: 'le jeu est trop lent à démarrer', why: 'Le texte ne parle pas de vitesse.' },
            { label: 'le joueur doit voter pour la case', why: 'Il ne s’agit pas d’une élection.' },
            {
              label: 'la case protège mieux les données',
              why: 'Elle accepte au contraire un envoi à d’autres sociétés.',
            },
          ],
          explain: 'Consentir suppose de manifester sa volonté et de comprendre ce que l’on accepte.',
        },
      ],
    },
    {
      title: 'Une erreur dans le fichier',
      lines: [
        'Un club de sport conserve une fiche sur chaque adhérent.',
        'Une adhérente apprend que sa date de naissance y est fausse.',
        'Elle demande à voir sa fiche, puis à faire corriger l’erreur.',
        'Le responsable répond d’abord qu’une fiche enregistrée ne se modifie plus.',
      ],
      qs: [
        {
          ...ACCES,
          q: 'Quels droits l’adhérente fait-elle valoir ?',
          a: 'le droit d’accès et le droit de rectification',
          wrong: [
            { label: 'le droit de vote et le droit de grève', why: 'Ces droits n’ont pas de lien avec une fiche.' },
            {
              label: 'le droit à l’image et le droit aux loisirs',
              why: 'Il s’agit de consulter et corriger des données.',
            },
            {
              label: 'aucun droit, la fiche appartient au club seul',
              why: 'La personne garde des droits sur ses données.',
            },
          ],
          explain: 'Voir sa fiche relève de l’accès ; faire corriger la date, de la rectification.',
        },
        {
          ...RECTIFICATION,
          q: 'Que doit faire le responsable quand la donnée est inexacte ?',
          a: 'la corriger dans les meilleurs délais',
          wrong: [
            { label: 'la garder fausse pour toujours', why: 'La rectification des données inexactes est un droit.' },
            { label: 'la publier pour que tout le monde vérifie', why: 'Cela exposerait la vie privée.' },
            { label: 'exiger un vote des autres adhérents', why: 'Le droit appartient à la personne concernée.' },
          ],
          explain: 'La personne peut obtenir la rectification dans les meilleurs délais.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : le harcèlement ———

const harcelement: Notion = {
  id: 'em6-harcelement',
  title: 'Le harcèlement scolaire et le cyberharcèlement : reconnaître et alerter',
  hint: 'Repense au mémo : ce qui distingue le harcèlement d’une dispute, les trois places et à qui demander de l’aide.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Le **harcèlement scolaire** est une agression répétée et délibérée ; en ligne, le **cyberharcèlement** le prolonge.',
    'Il atteint la **dignité**, la santé ou les conditions d’apprentissage ; depuis 2022, c’est un **délit**.',
    'Harcelé, harceleur et **témoins** : le témoin peut aider. Exemple : garde les preuves, préviens un adulte ou appelle le **3018**.',
  ],
  faits: [
    {
      ...REPETEE,
      q: 'Qu’est-ce qui caractérise le harcèlement scolaire ?',
      a: 'une agression répétée et délibérée',
      wrong: [
        { label: 'un désaccord unique réglé aussitôt', why: 'Un désaccord isolé et réglé n’est pas du harcèlement.' },
        { label: 'une note difficile en contrôle', why: 'Une note n’est pas une agression.' },
        { label: 'une règle du collège rappelée par un adulte', why: 'Rappeler une règle n’est pas agresser.' },
      ],
      gap: ['Le harcèlement scolaire est une agression ', ' et délibérée.', ['répétée', 'repetee', 'répété']],
      explain: 'La répétition et la volonté de nuire distinguent le harcèlement d’une dispute isolée.',
    },
    {
      ...ATTEINTES,
      q: 'À quoi le harcèlement peut-il porter atteinte chez un élève ?',
      a: 'à sa dignité, à sa santé ou à ses conditions d’apprentissage',
      wrong: [
        { label: 'à la hauteur du bâtiment du collège', why: 'Il s’agit des effets sur la personne.' },
        { label: 'à la date des vacances', why: 'Le calendrier n’est pas concerné.' },
        { label: 'à la couleur de son cartable', why: 'La loi parle de dignité, de santé et d’apprentissage.' },
      ],
      gap: [
        'Le harcèlement peut porter atteinte à sa ',
        ', altérer sa santé ou dégrader ses conditions d’apprentissage.',
        ['dignité', 'dignite'],
      ],
      explain: 'La loi regarde l’effet sur la personne : respect, santé, possibilité d’apprendre.',
    },
    {
      ...AUCUN_ELEVE,
      q: 'Que dit la loi à propos du harcèlement et des élèves ?',
      a: 'aucun élève ne doit le subir',
      wrong: [
        { label: 'les nouveaux élèves doivent l’accepter', why: 'Aucun élève n’a à le subir.' },
        { label: 'il est permis hors de la classe', why: 'La loi protège tous les élèves.' },
        { label: 'il ne regarde que les adultes', why: 'La loi parle des élèves et des étudiants.' },
      ],
      gap: ['Aucun élève ou étudiant ne doit ', ' de faits de harcèlement.', ['subir']],
      explain: 'La protection vaut pour chaque élève, sans exception.',
    },
    {
      ...LIEUX,
      avance: true,
      q: 'Où doivent avoir lieu les faits visés par la définition du code de l’éducation ?',
      a: 'au collège ou en marge de la vie scolaire',
      wrong: [
        { label: 'uniquement pendant le cours de mathématiques', why: 'La définition est bien plus large.' },
        { label: 'uniquement devant le principal', why: 'La définition n’exige pas que le principal soit présent.' },
        { label: 'uniquement pendant les grandes vacances', why: 'La définition vise la vie scolaire.' },
      ],
      gap: ['Les faits sont commis au sein de l’établissement ou en ', ' de la vie scolaire.', ['marge']],
      explain:
        '« En marge » veut dire à côté : des faits liés à la vie scolaire comptent aussi hors de l’établissement.',
    },
    {
      ...DELIT,
      q: 'Depuis 2022, comment la loi qualifie-t-elle le harcèlement scolaire ?',
      a: 'comme un délit',
      wrong: [
        { label: 'comme un jeu autorisé', why: 'La loi le punit.' },
        { label: 'comme une simple habitude', why: 'C’est une infraction prévue par la loi.' },
        { label: 'comme un droit des élèves', why: 'Personne n’a le droit de harceler.' },
      ],
      gap: ['La loi de 2022 crée un ', ' de harcèlement scolaire.', ['délit', 'delit']],
      explain: 'Un délit est une infraction jugée par un tribunal : le harcèlement est puni par la loi.',
    },
    {
      ...PROLONGE,
      q: 'Quel lien un rapport du Sénat établit-il entre cyberharcèlement et harcèlement scolaire ?',
      a: 'le cyberharcèlement en est une prolongation permanente',
      wrong: [
        { label: 'le cyberharcèlement le fait toujours cesser', why: 'Il le prolonge au contraire.' },
        { label: 'ils n’ont aucun rapport', why: 'Le rapport les relie.' },
        { label: 'le cyberharcèlement est un cours d’informatique', why: 'C’est une forme de harcèlement en ligne.' },
      ],
      gap: [
        'Le ',
        ' prolonge en ligne le harcèlement scolaire.',
        ['cyberharcèlement', 'cyberharcelement', 'cyber-harcèlement'],
      ],
      explain: 'Avec les écrans, la victime peut être atteinte même chez elle, à toute heure.',
    },
    {
      ...TRIANGLE,
      q: 'Entre qui se construit très souvent la situation de harcèlement scolaire ?',
      a: 'le harcelé, le harceleur et les témoins',
      wrong: [
        { label: 'le maire, le préfet et le député', why: 'Ce sont des autorités publiques.' },
        { label: 'les trois délégués de la classe', why: 'La relation ne dépend pas de ce rôle.' },
        { label: 'le harcelé seul', why: 'D’autres personnes participent ou regardent.' },
      ],
      gap: [
        'La relation réunit souvent le harcelé, le harceleur et les ',
        ' passifs.',
        ['témoins', 'temoins', 'témoin'],
      ],
      explain: 'Ceux qui regardent sans réagir font partie de la situation.',
    },
    {
      ...AGIR_TEMOINS,
      avance: true,
      q: 'Pourquoi est-il important d’agir sur les témoins ?',
      a: 'cela aide à désamorcer la situation de harcèlement',
      wrong: [
        { label: 'cela augmente le nombre de moqueries', why: 'L’action vise à les arrêter.' },
        { label: 'cela remplace toute aide à la victime', why: 'La victime doit aussi être aidée.' },
        { label: 'cela permet de ne rien dire aux adultes', why: 'Alerter un adulte reste utile.' },
      ],
      gap: [
        'Agir sur les témoins permet de ',
        ' une situation de harcèlement.',
        ['désamorcer', 'desamorcer', 'arrêter', 'stopper', 'calmer', 'apaiser'],
      ],
      explain:
        'Désamorcer, c’est calmer une situation avant qu’elle s’aggrave : face à des témoins qui réagissent, le harceleur perd de sa force.',
    },
    {
      ...NUMERO,
      q: 'Quel numéro national aide les jeunes victimes de cyberharcèlement ?',
      a: '3018',
      wrong: [
        { label: '1789', why: 'C’est l’année de la Déclaration des droits de l’homme et du citoyen.' },
        { label: '1905', why: 'C’est l’année de la loi de séparation des Églises et de l’État.' },
        { label: '2024', why: 'C’est une année, pas ce numéro d’aide.' },
      ],
      gap: ['Le numéro national d’assistance contre le cyberharcèlement est le ', '.', ['3018', '30 18']],
      explain: 'Le 3018 s’adresse aux jeunes victimes et à leurs parents.',
    },
    {
      ...INFORMATION,
      avance: true,
      q: 'À quel rythme les élèves reçoivent-ils une information sur les risques du harcèlement scolaire ?',
      a: 'chaque année',
      wrong: [
        { label: 'une seule fois dans la vie', why: 'La loi prévoit une information annuelle.' },
        { label: 'seulement après un procès', why: 'L’information sert d’abord à prévenir.' },
        { label: 'tous les dix ans', why: 'Le rythme prévu est bien plus rapproché.' },
      ],
      gap: ['Une information sur les risques liés au harcèlement est délivrée chaque ', '.', ['année', 'annee', 'an']],
      explain: 'La loi demande d’informer chaque année élèves et parents.',
    },
  ],
  paires3: [
    ['Harceleur', 'Celui qui agresse de façon répétée'],
    ['Témoin', 'Celui qui voit et peut alerter'],
    ['3018', 'Numéro d’aide contre le cyberharcèlement'],
  ],
  paires5: [
    ['Harceleur', 'Celui qui agresse de façon répétée'],
    ['Témoin', 'Celui qui voit et peut alerter'],
    ['3018', 'Numéro d’aide contre le cyberharcèlement'],
    ['Harcelé', 'Celui qui subit les agressions'],
    ['Cyberharcèlement', 'Harcèlement par les outils numériques'],
  ],
  libres: [
    {
      ...NUMERO,
      q: 'Quel numéro appeler en cas de cyberharcèlement ? (quatre chiffres)',
      accepted: ['3018', 'le 3018', '30 18'],
      traps: [
        { text: '1905', why: '1905 est l’année de la loi de séparation des Églises et de l’État.' },
        { text: '1989', why: '1989 est l’année d’adoption de la CIDE.' },
      ],
      explain: 'Le 3018 est le numéro national d’assistance.',
    },
    {
      ...TRIANGLE,
      q: 'Comment appelle-t-on la personne qui voit le harcèlement sans en être l’auteur ni la cible ?',
      accepted: ['témoin', 'un témoin', 'le témoin', 'temoin', 'témoins'],
      traps: [
        { text: 'harceleur', why: 'Le harceleur est l’auteur des agressions.' },
        { text: 'victime', why: 'La victime est la personne qui subit.' },
      ],
      explain: 'C’est un témoin : il peut aider en alertant.',
    },
    {
      ...DELIT,
      q: 'En droit, depuis 2022, le harcèlement scolaire est un … (un mot).',
      accepted: ['délit', 'delit', 'un délit'],
      traps: [
        { text: 'devoir', why: 'Un devoir est ce qu’on doit faire.' },
        { text: 'droit', why: 'Personne n’a le droit de harceler.' },
      ],
      explain: 'La loi du 2 mars 2022 en fait un délit.',
    },
  ],
  docs: [
    {
      title: 'Les messages du soir',
      lines: [
        'Depuis trois semaines, un élève reçoit chaque soir des insultes dans un groupe de discussion.',
        'Les mêmes camarades recommencent le lendemain au collège.',
        'Il dort mal et n’arrive plus à suivre en classe.',
        'Une élève du groupe lit les messages et hésite à réagir.',
      ],
      qs: [
        {
          ...REPETEE,
          q: 'Quel indice du texte montre qu’il ne s’agit pas d’une dispute isolée ?',
          a: 'les insultes se répètent depuis trois semaines',
          wrong: [
            { label: 'les messages arrivent sur un téléphone', why: 'L’appareil seul ne dit rien de la répétition.' },
            { label: 'l’élève va au collège', why: 'Aller au collège n’est pas un indice.' },
            { label: 'le groupe a un nom', why: 'Le nom du groupe ne prouve rien.' },
          ],
          explain: 'Une agression répétée est la marque du harcèlement.',
        },
        {
          ...AGIR_TEMOINS,
          q: 'Quelle action de l’élève témoin est la plus utile ?',
          a: 'prévenir un adulte et soutenir la victime',
          wrong: [
            { label: 'partager les messages à d’autres groupes', why: 'Diffuser les insultes aggrave la situation.' },
            { label: 'ajouter un rire sous les insultes', why: 'Elle encouragerait les auteurs.' },
            { label: 'attendre sans rien dire', why: 'Un témoin passif laisse la situation durer.' },
          ],
          explain: 'Agir comme témoin aide à désamorcer le harcèlement.',
        },
      ],
    },
    {
      title: 'Avant d’effacer',
      lines: [
        'Une élève découvre un faux compte qui se moque d’elle avec ses photos.',
        'Elle veut tout supprimer de son téléphone pour ne plus voir ces images.',
        'Sa sœur lui conseille d’abord de faire des captures d’écran.',
        'Elles cherchent ensuite à qui demander de l’aide.',
      ],
      qs: [
        {
          ...PREUVES,
          q: 'Pourquoi faire des captures d’écran ?',
          a: 'pour garder des preuves du harcèlement',
          wrong: [
            { label: 'pour republier les moqueries', why: 'Les diffuser aggraverait les choses.' },
            { label: 'pour décorer sa page', why: 'Les captures servent à prouver les faits.' },
            { label: 'pour effacer le faux compte tout seul', why: 'Une capture ne supprime rien.' },
          ],
          explain: 'Les preuves conservées aident les adultes et les services d’aide à agir.',
        },
        {
          ...NUMERO,
          q: 'Quel numéro les deux sœurs peuvent-elles appeler ?',
          a: 'le 3018',
          wrong: [
            { label: 'le 1789', why: '1789 est une date historique.' },
            { label: 'le 1905', why: '1905 est une date de loi.' },
            { label: 'le 2022', why: '2022 est l’année de la loi contre le harcèlement scolaire.' },
          ],
          explain:
            'Le 3018 aide les jeunes victimes de cyberharcèlement et leurs parents. Il faut aussi prévenir un adulte.',
        },
      ],
    },
  ],
};

export const VIE_PRIVEE_SKILLS: readonly Skill[] = [
  viePriveeEnLigne,
  droitIntimite,
  donneesPersonnelles,
  harcelement,
].map(notion);
