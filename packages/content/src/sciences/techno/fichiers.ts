import type { Rng } from '../../rng.ts';
import type { QuestionDraft } from '../../types.ts';
import { association, formes, maj, notion, ordre, qcm, saisie } from './outils.ts';

// ——— Les données : descripteurs, types, fichiers, arborescence, unités ———

type TypeFichier = 'fichier texte' | 'fichier image' | 'fichier de type tableur';
const TYPES_FICHIER: readonly TypeFichier[] = ['fichier texte', 'fichier image', 'fichier de type tableur'];

const CONTENU: Record<TypeFichier, string> = {
  'fichier texte': 'des mots et des phrases',
  'fichier image': 'une photo ou un dessin',
  'fichier de type tableur': 'des données rangées en lignes et en colonnes',
};

const ENREGISTREMENTS: readonly { texte: string; type: TypeFichier }[] = [
  { texte: 'On enregistre la photo d’une maquette.', type: 'fichier image' },
  { texte: 'On enregistre le dessin numérisé d’un croquis.', type: 'fichier image' },
  {
    texte: 'On enregistre le compte rendu rédigé d’une expérience, fait uniquement de phrases.',
    type: 'fichier texte',
  },
  {
    texte: 'On enregistre les consignes de sécurité de l’atelier, écrites en quelques phrases.',
    type: 'fichier texte',
  },
  {
    texte: 'On enregistre des températures relevées chaque heure, en lignes et en colonnes, pour les calculer.',
    type: 'fichier de type tableur',
  },
  {
    texte: 'On enregistre la liste du matériel avec, en colonnes, le nom, la quantité et la masse de chaque objet.',
    type: 'fichier de type tableur',
  },
];

const niveau1 = (rng: Rng): QuestionDraft => {
  const e = rng.pick(ENREGISTREMENTS);
  return {
    prompt: `${e.texte} Quel type de fichier convient ?`,
    ...qcm(
      rng,
      e.type,
      TYPES_FICHIER.filter((t) => t !== e.type).map((t) => ({
        label: t,
        why: `Un ${t} sert à conserver ${CONTENU[t]}, ce qui ne correspond pas ici.`,
      })),
    ),
    hint: 'Regarde ce qui est conservé : des phrases, une image ou un tableau ?',
    steps: [
      'On regarde la nature des données à conserver.',
      `Ici, on conserve ${CONTENU[e.type]}.`,
      `La réponse est **${e.type}**.`,
    ],
    targetSeconds: 25,
  };
};

type TypeDonnee = 'chaîne de caractères' | 'nombre' | 'booléen';

const SENS_TYPE: Record<TypeDonnee, string> = {
  'chaîne de caractères': 'une suite de lettres, de chiffres ou de signes, comme un mot',
  nombre: 'une quantité avec laquelle on peut calculer',
  booléen: 'une valeur qui ne peut être que vrai ou faux',
};

const DESCRIPTEURS: readonly { objet: string; descripteur: string; valeur: string; type: TypeDonnee }[] = [
  { objet: 'un livre', descripteur: 'titre', valeur: '« Voyage au centre de la Terre »', type: 'chaîne de caractères' },
  { objet: 'un livre', descripteur: 'nombre de pages', valeur: '372', type: 'nombre' },
  { objet: 'un livre', descripteur: 'disponible au prêt', valeur: 'vrai', type: 'booléen' },
  { objet: 'un vélo', descripteur: 'couleur', valeur: '« bleu »', type: 'chaîne de caractères' },
  { objet: 'un vélo', descripteur: 'masse en kilogrammes', valeur: '14', type: 'nombre' },
  { objet: 'un vélo', descripteur: 'éclairage présent', valeur: 'faux', type: 'booléen' },
  { objet: 'une salle', descripteur: 'nom de la salle', valeur: '« atelier »', type: 'chaîne de caractères' },
  { objet: 'une salle', descripteur: 'nombre de postes', valeur: '15', type: 'nombre' },
  { objet: 'une salle', descripteur: 'vidéoprojecteur installé', valeur: 'vrai', type: 'booléen' },
];

const VOCABULAIRE: readonly (readonly [string, string])[] = [
  ['fichier', 'ensemble de données enregistré sur un support informatique'],
  ['dossier', 'emplacement qui regroupe des fichiers et d’autres dossiers'],
  ['arborescence', 'organisation des dossiers et des fichiers en forme d’arbre'],
  ['extension', 'fin du nom d’un fichier, après le point, liée à son format'],
  ['droit de lecture', 'permission de consulter le contenu d’un fichier'],
  ['droit d’écriture', 'permission de modifier le contenu d’un fichier'],
  ['descripteur', 'caractéristique qui sert à décrire un objet par des données'],
];

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const trois = (['chaîne de caractères', 'nombre', 'booléen'] as const).map((t) =>
      rng.pick(DESCRIPTEURS.filter((d) => d.type === t)),
    );
    const paires = trois.map((d) => [`${d.descripteur} : ${d.valeur}`, d.type] as const);
    return {
      prompt: `Associe chaque donnée à son type : ${paires.map((p) => p[0]).join(' ; ')}.`,
      answer: association(rng, paires),
      hint: 'Peut-on calculer avec la valeur ? N’a-t-elle que deux possibilités ?',
      steps: [
        'Le type indique la nature de la valeur d’un descripteur.',
        `${trois.map((d) => `« ${maj(d.type)} » : ${SENS_TYPE[d.type]}`).join(' ; ')}.`,
        `Réponse : **${paires.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
      ],
      targetSeconds: 45,
    };
  }
  const cible = rng.pick(VOCABULAIRE);
  const autres = rng.shuffle(VOCABULAIRE.filter((v) => v !== cible)).slice(0, 3);
  return {
    prompt: `Quel mot correspond à cette définition : « ${cible[1]} » ?`,
    ...qcm(
      rng,
      cible[0],
      autres.map(([mot, sens]) => ({ label: mot, why: `« ${maj(mot)} » désigne : ${sens}.` })),
    ),
    hint: 'Repère le mot clé de la définition : contenant, contenu, permission ou organisation ?',
    steps: [
      'On cherche le mot du vocabulaire des fichiers.',
      `La définition est : ${cible[1]}.`,
      `La réponse est **${cible[0]}**.`,
    ],
    targetSeconds: 30,
  };
};

const UNITES = ['octet', 'kilooctet (ko)', 'mégaoctet (Mo)', 'gigaoctet (Go)', 'téraoctet (To)'] as const;

const niveau3 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const n = rng.int(2, 12);
    return {
      prompt: `Combien de bits contiennent ${n} octets ?`,
      ...saisie(
        [String(n * 8)],
        [
          [String(n), 'Un octet ne vaut pas un bit : il en réunit huit.'],
          [String(n + 8), 'Il faut multiplier le nombre d’octets par 8, pas ajouter 8.'],
          [String(n * 10), 'Un octet est composé de 8 bits, et non de 10.'],
        ],
      ),
      hint: 'Rappelle-toi combien de bits composent un seul octet.',
      steps: ['Un octet est composé de 8 bits.', `On calcule ${n} × 8.`, `La réponse est **${n * 8}** bits.`],
      targetSeconds: 35,
    };
  }
  if (sorte === 1) {
    const taille = rng.int(3, 5);
    const choisies = rng
      .shuffle(UNITES)
      .slice(0, taille)
      .sort((a, b) => UNITES.indexOf(a) - UNITES.indexOf(b));
    const alphabetique = [...choisies].sort((a, b) => a.localeCompare(b, 'fr'));
    // L'énoncé ne doit jamais lister les unités déjà rangées.
    const listees = alphabetique.every((u, k) => u === choisies[k]) ? alphabetique.reverse() : alphabetique;
    return {
      prompt: `Range ces unités de la plus petite à la plus grande : ${listees.join(', ')}.`,
      answer: ordre(rng, choisies),
      hint: 'Les préfixes kilo, méga, giga et téra désignent des quantités de plus en plus grandes.',
      steps: [
        'On part de l’octet, puis on suit les préfixes kilo, méga, giga et téra.',
        'Chaque préfixe vaut mille fois le précédent.',
        `L’ordre est : **${choisies.join(' < ')}**.`,
      ],
      targetSeconds: 40,
    };
  }
  const mot = rng.pick([
    {
      definition: 'l’unité élémentaire d’information, notée 0 ou 1',
      reponse: 'bit',
      article: 'le' as const,
      indefini: 'un bit',
      erreurs: [
        ['octet', 'Un octet réunit huit bits : ce n’est pas l’unité élémentaire.'],
        ['fichier', 'Un fichier est un ensemble de données enregistré : ce n’est pas une unité.'],
      ] as const,
    },
    {
      definition: 'l’unité d’information composée de huit bits',
      reponse: 'octet',
      article: 'l’' as const,
      indefini: 'un octet',
      erreurs: [
        ['bit', 'Le bit est l’unité élémentaire : il en faut huit pour faire l’unité demandée.'],
        ['fichier', 'Un fichier est un ensemble de données enregistré : ce n’est pas une unité.'],
      ] as const,
    },
    {
      definition: 'l’organisation des dossiers et des fichiers en forme d’arbre',
      reponse: 'arborescence',
      article: 'l’' as const,
      indefini: 'une arborescence',
      erreurs: [
        ['dossier', 'Un dossier regroupe des fichiers : ce n’est qu’une partie de l’organisation.'],
        ['fichier', 'Un fichier est un ensemble de données enregistré, pas une organisation.'],
      ] as const,
    },
  ]);
  return {
    prompt: `Écris le mot qui désigne ${mot.definition}.`,
    ...saisie([...formes(mot.reponse, mot.article), mot.indefini], mot.erreurs),
    hint: 'C’est un mot du vocabulaire des données : unité ou organisation ?',
    steps: [
      'On retrouve le mot à partir de sa définition.',
      `Il s’agit de ${mot.definition}.`,
      `La réponse est **${mot.reponse}**.`,
    ],
    targetSeconds: 35,
  };
};

const niveau4 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 2);
  if (sorte === 0) {
    const n = rng.int(2, 15);
    return {
      prompt: `Une information occupe ${n * 8} bits. Combien d’octets cela représente-t-il ?`,
      ...saisie(
        [String(n)],
        [
          [String(n * 64), 'Tu as multiplié par 8 : pour passer des bits aux octets, on divise par 8.'],
          [String(n * 8), 'C’est le nombre de bits : il faut le convertir en octets.'],
        ],
      ),
      hint: 'Un octet regroupe plusieurs bits : faut-il multiplier ou diviser ?',
      steps: ['Un octet est composé de 8 bits.', `On calcule ${n * 8} ÷ 8.`, `La réponse est **${n}** octets.`],
      targetSeconds: 40,
    };
  }
  if (sorte === 1) {
    const [petit, grand] = rng.pick([
      ['ko', 'Mo'],
      ['Mo', 'Go'],
      ['Go', 'To'],
    ] as const);
    const n = rng.int(2, 9);
    return {
      prompt: `Avec les préfixes du Système international, combien de ${petit} représentent ${n} ${grand} ?`,
      ...saisie(
        [`${n * 1000}`, `${n} 000`],
        [
          [`${n * 100}`, 'D’un préfixe au suivant (kilo, méga, giga, téra), on multiplie par 1 000, et non par 100.'],
          [`${n * 8}`, 'Le facteur 8 sert à passer des octets aux bits, pas d’un multiple à l’autre.'],
          [
            `${n * 1024}`,
            'Le facteur 1 024 est un usage informatique ; les préfixes du Système international valent 1 000.',
          ],
        ],
      ),
      hint: 'Passer d’un préfixe au suivant multiplie toujours par le même nombre.',
      steps: [
        `Un ${grand} vaut 1 000 ${petit} avec les préfixes du Système international.`,
        `On calcule ${n} × 1 000.`,
        `La réponse est **${n * 1000}** ${petit}.`,
      ],
      targetSeconds: 45,
    };
  }
  const cinq = rng.shuffle(VOCABULAIRE).slice(0, 5);
  return {
    prompt: `Associe chaque mot à sa définition : ${cinq.map((v) => v[0]).join(', ')}.`,
    answer: association(rng, cinq),
    hint: 'Commence par les mots dont tu es sûr, puis compare les définitions restantes.',
    steps: [
      'Chaque mot a une définition précise : contenant, contenu, permission ou organisation.',
      `Réponse : **${cinq.map(([a, b]) => `${a} → ${b}`).join(' ; ')}**.`,
    ],
    targetSeconds: 75,
  };
};

const NOMS = ['mesures', 'maquette', 'notice', 'sortie', 'atelier', 'plan'] as const;

const niveau5 = (rng: Rng): QuestionDraft => {
  const sorte = rng.int(0, 1);
  if (sorte === 0) {
    const [a, b, c] = rng.shuffle(NOMS);
    const dossiers = ['Technologie', 'Sciences', 'Histoire'] as const;
    const fichiers = [`${a}.csv`, `${b}.jpg`, `${c}.txt`];
    const places = rng.shuffle(dossiers);
    const i = rng.int(0, 2);
    const bon = `Documents > ${places[i]} > ${fichiers[i]}`;
    return {
      prompt: `Observe l’arborescence. Quel est le chemin qui mène au fichier « ${fichiers[i]} » ?`,
      figure: {
        kind: 'document',
        title: 'Arborescence (le retrait indique « est contenu dans »)',
        lines: ['Documents', ...places.flatMap((d, k) => [`— ${d}`, `—— ${fichiers[k]}`])],
      },
      ...qcm(rng, bon, [
        ...[0, 1, 2]
          .filter((k) => k !== i)
          .map((k) => ({
            label: `Documents > ${places[k]} > ${fichiers[i]}`,
            why: `Le dossier « ${places[k]} » contient « ${fichiers[k]} », pas « ${fichiers[i]} ».`,
          })),
        {
          label: `${places[i]} > Documents > ${fichiers[i]}`,
          why: 'L’ordre est inversé : on part du dossier le plus général, « Documents ».',
        },
      ]),
      hint: 'Pars du dossier le plus général et descends d’un niveau à la fois.',
      steps: [
        'Un chemin énumère les dossiers traversés, du plus général jusqu’au fichier.',
        `Le fichier est rangé dans « ${places[i]} », lui-même dans « Documents ».`,
        `La réponse est **${bon}**.`,
      ],
      targetSeconds: 50,
    };
  }
  const libre = rng.pick([200, 400, 500, 700]);
  const [x, y, z] = rng.shuffle(NOMS);
  const [n1, n2, n3] = [`${x}.mp4`, `${y}.jpg`, `${z}.csv`];
  const petits = rng.int(2, 8);
  const gros = libre + rng.int(1, 5) * 100;
  const bonne = n2;
  const tailles = rng.shuffle([
    { nom: n1, texte: `${gros} Mo` },
    { nom: n2, texte: `${petits} Mo` },
    { nom: n3, texte: `${(libre + 1000) / 1000} Go`.replace('.', ',') },
  ]);
  const converti = (nom: string) => (nom === n3 ? `, soit ${libre + 1000} Mo` : '');
  return {
    prompt: `Une clé USB a ${libre} Mo d’espace libre. D’après la liste, quel fichier peut y être copié ?`,
    figure: {
      kind: 'document',
      title: 'Taille des fichiers (préfixes du Système international)',
      lines: tailles.map((t) => `${t.nom} : ${t.texte}`),
    },
    ...qcm(
      rng,
      bonne,
      tailles
        .filter((t) => t.nom !== bonne)
        .map((t) => ({
          label: t.nom,
          why: `« ${t.nom} » pèse ${t.texte}${converti(t.nom)} : c’est plus que les ${libre} Mo disponibles.`,
        })),
    ),
    hint: 'Exprime toutes les tailles dans la même unité avant de comparer.',
    steps: [
      'On convertit les tailles en mégaoctets : 1 Go = 1 000 Mo.',
      `Il faut une taille inférieure ou égale à ${libre} Mo.`,
      `La réponse est **${bonne}**.`,
    ],
    targetSeconds: 60,
  };
};

export const donnees = notion(
  {
    id: 't5-donnees',
    title: 'Données, fichiers et arborescence',
    memo: [
      'On décrit un objet par des **descripteurs** : leur type est nombre, **chaîne de caractères** ou **booléen** (vrai ou faux). Les données sont stockées dans des **fichiers**, rangés dans des **dossiers** : c’est l’**arborescence**.',
      'Le **bit** vaut 0 ou 1 ; 1 **octet** = 8 bits. Avec les préfixes du Système international, 1 Mo = 1 000 ko.',
    ],
    attendu:
      'Recenser des données, les identifier, les classer, les représenter, les stocker dans des fichiers, les retrouver dans une arborescence',
    sources: [
      'academie-fichier',
      'academie-bit',
      'academie-octet',
      'academie-kilo',
      'academie-giga',
      'bipm-prefixes-si',
    ],
  },
  [niveau1, niveau2, niveau3, niveau4, niveau5],
);
