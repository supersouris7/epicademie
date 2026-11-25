import type { Skill } from '../types.ts';
import { notion, type Notion, type Preuve } from './kit.ts';
import { PREUVES } from './se-reperer-sources.ts';

/**
 * 6e, « Se repérer dans le temps » (lot hi-6e-04) : compétence « Se repérer dans le temps : construire des repères
 * historiques » du programme du cycle 3, appliquée aux repères annuels de 6e. Les faits historiques citent le
 * programme (registre `cycle3-2020`) ; les règles de calcul des siècles et des millénaires citent les dictionnaires
 * déjà enregistrés (Académie française, TLFi). Les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle3-2020';

const ACADEMIE = 'Le Dictionnaire de l’Académie française';
const TLFI = 'Le Trésor de la langue française';

const P_SIECLE: Preuve = { ...PREUVES.siecle, who: ACADEMIE };
const P_BORNES: Preuve = { ...PREUVES.bornes, who: ACADEMIE };
const P_ERE: Preuve = { ...PREUVES.ere, who: ACADEMIE };
const P_CHRONOLOGIE: Preuve = { ...PREUVES.chronologie, who: ACADEMIE };
const P_MILLENAIRE: Preuve = { ...PREUVES.millenaire, who: TLFI };
const P_JC: Preuve = { ...PREUVES.jc, who: TLFI };

// Citations exactes du programme du cycle 3 (repères annuels de 6e et compétences d'histoire).
const Q_THEME1 =
  'Thème 1 - La longue histoire de l’humanité et des migrations - Les débuts de l’humanité. - La « révolution » néolithique. - Premiers États, premières écritures.';
const Q_THEME2 = 'Récits fondateurs, croyances et citoyenneté dans la Méditerranée antique au Ier millénaire avant J-C';
const Q_THEME3 = 'Thème 3 - L’empire romain dans le monde antique';
const Q_ETATS =
  'L’étude des premiers États et des premières écritures se place dans le cadre de l’Orient ancien et peut concerner l’Égypte ou la Mésopotamie.';
const Q_ATHENES = 'Dans quelles conditions la démocratie naît-elle à Athènes ?';
const Q_CESAR = 'Lors de la première année du cycle 3 a été abordée la conquête de la Gaule par César.';
const Q_UNITE = 'Son unité est assurée par le pouvoir impérial, la romanisation et le mythe prestigieux de l’Urbs.';
const Q_SOIE = 'Un commerce régulier entre Rome et la Chine existe depuis le IIe siècle avant J.-C.';
const Q_HAN =
  'Les relations de l’empire romain avec les autres mondes anciens : l’ancienne route de la soie et la Chine des Han.';
const Q_FIN = PREUVES.migrations.quote;
const Q_FRISE = PREUVES.frise.quote;

/** Écritures acceptées d'un rang en chiffres romains (« Ve », « 5e »…), seul ou suivi d'un mot (« siècle »). */
function rang(roman: string, arabe: number, mots: readonly string[] = []): string[] {
  const bases =
    arabe === 1
      ? ['Ier', '1er', 'I', 'premier']
      : [`${roman}e`, `${arabe}e`, roman, `${roman}ème`, `${arabe}ème`, `${roman}eme`, `${arabe}eme`];
  const out = bases.flatMap((b) => [b, ...mots.map((m) => `${b} ${m}`)]);
  return [...new Set(out.map((x) => x.toLowerCase()))].map((x) => out.find((o) => o.toLowerCase() === x) ?? x);
}

/** Écritures acceptées de « avant » et « après J.-C. ». */
const AV = ['av. J.-C.', 'av J.-C.', 'av. JC', 'av JC', 'avant J.-C.', 'avant JC', 'avant Jésus-Christ'];
const APR = [
  'apr. J.-C.',
  'apr J.-C.',
  'apr. JC',
  'apr JC',
  'après J.-C.',
  'apres J.-C.',
  'après JC',
  'après Jésus-Christ',
];

/** Rang d'un siècle ou d'un millénaire, avec ou sans le mot et le côté du repère. */
const rangDate = (roman: string, arabe: number, mot: 'siècle' | 'millénaire', cote: readonly string[]) => {
  const mots = [mot, mot.replace('è', 'e').replace('é', 'e')];
  return rang(roman, arabe, [...mots, ...mots.flatMap((m) => cote.map((c) => `${m} ${c}`))]);
};

// ——— Notion 1 : la frise de l'Antiquité ———

const frise: Notion = {
  id: 'h6-frise-antiquite',
  title: 'La frise de l’Antiquité',
  hint: 'Place d’abord le repère le plus ancien, puis avance vers le plus récent.',
  memo: [
    'Une **frise chronologique** représente le temps : on y range les faits du plus ancien au plus récent.',
    'La frise de 6e commence par la **préhistoire** (les débuts de l’humanité, puis le néolithique) ; l’**Antiquité** vient ensuite, des premiers États et des premières écritures jusqu’à la fin de l’empire romain d’Occident, vers la fin du Ve siècle (vu en CM1).',
    'Choisis la bonne **échelle** : selon la durée à montrer, une graduation peut valoir un siècle ou un millénaire.',
  ],
  faits: [
    {
      q: 'Quel repère se place au début de la frise d’histoire de 6e ?',
      a: 'les débuts de l’humanité',
      wrong: [
        {
          label: 'la fin de l’empire romain d’Occident',
          why: 'C’est le repère le plus récent de l’Antiquité : il se place au bout de la frise, pas au début.',
        },
        {
          label: 'la route de la soie',
          why: 'La route de la soie appartient au thème 3, sur l’empire romain : elle vient bien après.',
        },
        {
          label: 'la conquête de la Gaule par César',
          why: 'La conquête de la Gaule se rattache à l’empire romain (thème 3), pas au début de la frise.',
        },
      ],
      gap: ['La frise de 6e commence par les débuts de l’', '.', ['humanité', 'humanite']],
      quote: Q_THEME1,
      explain: 'Le thème 1 s’ouvre sur « Les débuts de l’humanité » : c’est le début de la frise.',
    },
    {
      q: 'Selon le programme, quand se situent les récits fondateurs, croyances et citoyenneté de la Méditerranée antique ?',
      a: 'au Ier millénaire av. J.-C.',
      wrong: [
        {
          label: 'au XXe siècle',
          why: 'Le XXe siècle est très récent : la Méditerranée antique est bien plus ancienne.',
        },
        {
          label: 'au IIIe millénaire apr. J.-C.',
          why: 'Le IIIe millénaire apr. J.-C. est le nôtre (il a commencé en 2001) : ce n’est pas l’Antiquité.',
        },
        {
          label: 'au Ier millénaire apr. J.-C.',
          why: 'Le bon millénaire, mais pas le bon côté du repère : le programme dit « avant J-C ».',
        },
      ],
      gap: [
        'Les récits fondateurs de la Méditerranée antique se situent au Ier millénaire ',
        ' J.-C.',
        ['av.', 'avant', 'av'],
      ],
      quote: Q_THEME2,
      explain: 'Le titre du thème 2 situe ces récits « au Ier millénaire avant J-C ».',
    },
    {
      q: 'Depuis quand existe un commerce régulier entre Rome et la Chine ?',
      a: 'depuis le IIe siècle av. J.-C.',
      wrong: [
        { label: 'depuis le XXe siècle', why: 'Le XXe siècle est très récent : ce commerce date de l’Antiquité.' },
        {
          label: 'depuis le XIIe siècle apr. J.-C.',
          why: 'Attention aux chiffres romains : XII n’est pas II. Le programme dit IIe siècle avant J.-C.',
        },
        {
          label: 'depuis le IIe siècle apr. J.-C.',
          why: 'Le bon siècle, mais du mauvais côté du repère : c’est « avant J.-C. ».',
        },
      ],
      gap: [
        'Un commerce régulier relie Rome et la Chine depuis le ',
        ' siècle av. J.-C.',
        ['IIe', '2e', 'II', 'IIème', '2ème'],
      ],
      quote: Q_SOIE,
      explain: 'Le programme date ce commerce du IIe siècle avant J.-C.',
    },
    {
      q: 'Vers quand l’empire romain d’Occident s’effondre-t-il définitivement ?',
      a: 'vers la fin du Ve siècle',
      wrong: [
        {
          label: 'vers la fin du XVe siècle',
          why: 'Attention aux chiffres romains : XV n’est pas V. L’empire romain d’Occident s’effondre vers la fin du Ve siècle.',
        },
        {
          label: 'au IIe siècle av. J.-C.',
          why: 'Au IIe siècle av. J.-C., Rome commence à commercer avec la Chine : l’empire n’est pas effondré.',
        },
        {
          label: 'vers la fin du Ve siècle av. J.-C.',
          why: 'C’est après J.-C. : le programme parle de la fin du Ve siècle de notre ère, après l’installation de peuples à partir du IVe siècle.',
        },
      ],
      gap: [
        'L’empire romain d’Occident s’effondre définitivement vers la fin du ',
        ' siècle.',
        ['Ve', '5e', 'V', 'Vème', '5ème'],
      ],
      quote: Q_FIN,
      explain:
        'Le programme indique que l’empire romain d’Occident « s’effondre définitivement vers la fin du Ve siècle ».',
    },
    {
      q: 'À quoi sert une frise chronologique ?',
      a: 'à représenter le temps',
      wrong: [
        { label: 'à localiser une ville', why: 'Pour localiser un lieu, on utilise une carte, pas une frise.' },
        {
          label: 'à compter les habitants',
          why: 'Compter les habitants, c’est un recensement : la frise représente le temps.',
        },
        {
          label: 'à mesurer une distance',
          why: 'Une distance se mesure sur une carte avec une échelle de longueur ; la frise représente le temps.',
        },
      ],
      gap: ['Une frise chronologique est une représentation du ', '.', ['temps']],
      quote: Q_FRISE,
      explain:
        'Le programme range les frises chronologiques parmi les documents qui donnent « à voir une représentation du temps ».',
    },
  ],
  paires3: [
    ['Ier millénaire av. J.-C.', 'Récits fondateurs de la Méditerranée antique'],
    ['IIe siècle av. J.-C.', 'Début du commerce régulier entre Rome et la Chine'],
    ['Fin du Ve siècle', 'Effondrement de l’empire romain d’Occident'],
  ],
  paires5: [
    ['Ier millénaire av. J.-C.', 'Récits fondateurs de la Méditerranée antique'],
    ['IIe siècle av. J.-C.', 'Début du commerce régulier entre Rome et la Chine'],
    ['Fin du Ve siècle', 'Effondrement de l’empire romain d’Occident'],
    ['À partir du IVe siècle', 'Installation des Francs et des Wisigoths dans l’empire'],
    ['Frise chronologique', 'Représentation du temps'],
  ],
  ordre: [
    'Les débuts de l’humanité',
    'Les premiers États et les premières écritures',
    'Le début du commerce régulier entre Rome et la Chine',
    'L’installation des Francs et des Wisigoths dans l’empire',
    'L’effondrement de l’empire romain d’Occident',
  ],
  libres: [
    {
      q: 'Vers la fin de quel siècle l’empire romain d’Occident s’effondre-t-il ? (chiffres romains)',
      accepted: rangDate('V', 5, 'siècle', APR),
      traps: [
        {
          text: 'IVe',
          why: 'Le IVe siècle marque le début de l’installation de peuples venus de l’est, pas l’effondrement.',
        },
        { text: 'XVe', why: 'XV n’est pas V : le XVe siècle est bien plus tardif.' },
      ],
      quote: Q_FIN,
      explain: 'L’empire romain d’Occident s’effondre vers la fin du Ve siècle.',
    },
    {
      q: 'Les récits fondateurs de la Méditerranée antique se situent au … millénaire av. J.-C. (chiffres romains)',
      accepted: rangDate('I', 1, 'millénaire', AV),
      traps: [
        { text: 'IIe', why: 'Le programme dit « Ier millénaire avant J-C », pas le IIe.' },
        { text: 'IIIe', why: 'Le IIIe millénaire est celui où nous vivons, après J.-C.' },
      ],
      quote: Q_THEME2,
      explain: 'Ils se situent au Ier millénaire avant J.-C.',
    },
    {
      q: 'Sur une frise, on range les faits du plus ancien au plus … (un mot).',
      accepted: ['récent', 'recent'],
      traps: [
        { text: 'ancien', why: 'On part du plus ancien : on va donc vers le plus récent.' },
        { text: 'important', why: 'Une frise suit l’ordre du temps, pas l’importance des faits.' },
      ],
      ...P_CHRONOLOGIE,
      explain: 'Une chronologie présente les faits dans l’ordre de leur succession : du plus ancien au plus récent.',
    },
  ],
  docs: [
    {
      title: 'La frise du couloir',
      lines: [
        'Sur la frise du couloir, le premier repère est « débuts de l’humanité ».',
        'Plus loin viennent « premiers États, premières écritures », puis « cités grecques ».',
        'Tout au bout, on lit « effondrement de l’empire romain d’Occident ».',
      ],
      qs: [
        {
          q: 'Quel repère de cette frise est le plus récent ?',
          a: 'l’effondrement de l’empire romain d’Occident',
          wrong: [
            { label: 'les débuts de l’humanité', why: 'C’est le premier repère : le plus ancien.' },
            { label: 'les cités grecques', why: 'Les cités grecques sont avant le dernier repère de la frise.' },
          ],
          quote: Q_FIN,
          explain:
            'Le repère placé tout au bout de la frise est le plus récent : la fin de l’empire romain d’Occident.',
        },
        {
          q: 'Quel repère vient juste après les débuts de l’humanité sur cette frise ?',
          a: 'les premiers États et les premières écritures',
          wrong: [
            { label: 'les cités grecques', why: 'Les cités grecques viennent après les premiers États.' },
            {
              label: 'l’effondrement de l’empire romain d’Occident',
              why: 'C’est le dernier repère de la frise, pas le deuxième.',
            },
          ],
          quote: Q_THEME1,
          explain: 'Le thème 1 va des débuts de l’humanité aux premiers États et aux premières écritures.',
        },
      ],
    },
    {
      title: 'Deux frises',
      lines: [
        'Frise 1 : une graduation tous les 100 000 ans, pour les débuts de l’humanité.',
        'Frise 2 : une graduation tous les 100 ans, pour l’empire romain.',
      ],
      qs: [
        {
          q: 'Sur quelle frise une graduation représente-t-elle la plus longue durée ?',
          a: 'la frise 1',
          wrong: [
            { label: 'la frise 2', why: 'Sur la frise 2, une graduation vaut 100 ans, bien moins que 100 000 ans.' },
            {
              label: 'les deux, c’est la même durée',
              why: 'Non : 100 000 ans et 100 ans sont deux durées différentes.',
            },
          ],
          quote: Q_FRISE,
          explain: 'Une graduation vaut 100 000 ans sur la frise 1 et 100 ans sur la frise 2 : les échelles diffèrent.',
        },
        {
          q: 'Combien de temps représente une graduation de la frise 2 ?',
          a: 'un siècle',
          wrong: [
            { label: 'un millénaire', why: 'Un millénaire dure mille ans ; ici, la graduation vaut 100 ans.' },
            { label: 'une année', why: 'La graduation vaut 100 ans, pas un an.' },
          ],
          ...P_SIECLE,
          explain: 'Cent ans, c’est un siècle.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : avant et après J.-C. ———

const avantApres: Notion = {
  id: 'h6-avant-apres-jc',
  title: 'Avant et après J.-C.',
  hint: 'Repère d’abord si la date est avant ou après J.-C. ; avant J.-C., on compte à rebours.',
  memo: [
    'Les années se comptent à partir de la naissance présumée du Christ : c’est l’**ère chrétienne**, aussi appelée **notre ère**.',
    'Avant ce repère, on écrit **av. J.-C.** et on compte à rebours : plus le nombre est grand, plus la date est ancienne. Exemple : 500 av. J.-C. est plus ancien que 200 av. J.-C.',
    'Après ce repère, on écrit apr. J.-C. et on compte dans l’ordre habituel : le commerce entre Rome et la Chine (IIe siècle av. J.-C.) est plus ancien que la fin de l’empire romain d’Occident (fin du Ve siècle apr. J.-C.).',
  ],
  faits: [
    {
      q: 'À partir de quel repère compte-t-on les années de l’ère chrétienne ?',
      a: 'la date présumée de la naissance du Christ',
      wrong: [
        { label: 'l’an 2000', why: 'L’an 2000 est une date récente de notre ère, pas son point de départ.' },
        {
          label: 'la fin de l’empire romain d’Occident',
          why: 'Cette fin date du Ve siècle de notre ère : elle se place après le point de départ.',
        },
        {
          label: 'la conquête de la Gaule par César',
          why: 'C’est un événement de l’Antiquité romaine, pas le repère de l’ère chrétienne.',
        },
      ],
      gap: [
        'L’ère chrétienne commence à la date présumée de la naissance du ',
        '.',
        ['Christ', 'Jésus-Christ', 'Jesus-Christ'],
      ],
      ...P_ERE,
      explain: 'L’ère chrétienne se compte à partir de la date présumée de la naissance du Christ.',
    },
    {
      q: 'Laquelle de ces dates est la plus ancienne ?',
      a: '500 av. J.-C.',
      wrong: [
        { label: '1500 apr. J.-C.', why: 'Une date après J.-C. est toujours plus récente qu’une date avant J.-C.' },
        { label: '500 apr. J.-C.', why: '« apr. » veut dire après : 500 apr. J.-C. est plus récent que 500 av. J.-C.' },
        {
          label: '200 av. J.-C.',
          why: 'Avant J.-C., on compte à rebours : 500 av. J.-C. est plus ancien que 200 av. J.-C.',
        },
      ],
      gap: ['Avant J.-C., plus le nombre est grand, plus la date est ', '.', ['ancienne', 'éloignée', 'eloignee']],
      ...P_ERE,
      explain:
        'Avant J.-C., on compte à rebours depuis le repère : plus le nombre est grand, plus la date est ancienne.',
    },
    {
      q: 'Que signifie l’abréviation « av. J.-C. » ?',
      a: 'avant Jésus-Christ',
      wrong: [
        { label: 'avant Jules César', why: 'Piège classique : J.-C. désigne Jésus-Christ, pas Jules César.' },
        {
          label: 'à la fin de l’empire romain',
          why: 'L’abréviation n’a rien à voir avec l’empire : J.-C. = Jésus-Christ.',
        },
        { label: 'après Jésus-Christ', why: '« av. » veut dire avant ; « après » s’abrège « apr. ».' },
      ],
      gap: ['« av. J.-C. » signifie avant ', '.', ['Jésus-Christ', 'Jesus-Christ', 'Jésus Christ', 'Jesus Christ']],
      ...P_JC,
      explain: 'J.-C. est l’abréviation de Jésus-Christ ; « av. » veut dire avant.',
    },
    {
      q: 'Quelle expression a le même sens que « avant J.-C. » ?',
      a: 'avant notre ère',
      wrong: [
        { label: 'au Moyen Âge', why: 'Le Moyen Âge est une période bien plus tardive, après J.-C.' },
        {
          label: 'avant la préhistoire',
          why: 'La préhistoire commence bien avant la naissance présumée du Christ : « avant J.-C. » ne veut pas dire « avant la préhistoire », mais « avant notre ère ».',
        },
        { label: 'après notre ère', why: '« avant J.-C. » correspond à « avant notre ère », pas « après ».' },
      ],
      gap: ['« Avant J.-C. » a le même sens que « avant notre ', ' ».', ['ère', 'ere']],
      ...P_JC,
      explain: 'Le dictionnaire donne « avant notre ère » comme équivalent de « avant Jésus-Christ ».',
    },
    {
      q: 'Le commerce régulier entre Rome et la Chine existe depuis le IIe siècle av. J.-C. Est-ce avant ou après la naissance présumée du Christ ?',
      a: 'avant',
      wrong: [
        { label: 'après', why: '« av. J.-C. » veut dire avant Jésus-Christ.' },
        {
          label: 'la même année',
          why: 'Un siècle entier sépare au moins ce commerce du repère : ce n’est pas la même année.',
        },
        { label: 'on ne peut pas savoir', why: 'L’abréviation « av. J.-C. » suffit : c’est avant.' },
      ],
      gap: ['Le IIe siècle av. J.-C. se situe ', ' la naissance présumée du Christ.', ['avant']],
      quote: Q_SOIE,
      explain: 'Le programme dit « depuis le IIe siècle avant J.-C. » : c’est avant le repère.',
    },
    {
      q: 'Quel fait est le plus récent ?',
      a: 'l’effondrement de l’empire romain d’Occident',
      wrong: [
        {
          label: 'les récits fondateurs de la Méditerranée antique',
          why: 'Ils se situent au Ier millénaire av. J.-C. : bien avant la fin du Ve siècle.',
        },
        {
          label: 'les débuts de l’humanité',
          why: 'C’est le point de départ de la frise : le plus ancien de tous.',
        },
        {
          label: 'le début du commerce régulier entre Rome et la Chine',
          why: 'Il date du IIe siècle av. J.-C. : avant J.-C., donc plus ancien que la fin du Ve siècle apr. J.-C.',
        },
      ],
      gap: [
        'L’effondrement de l’empire romain d’Occident a lieu vers la fin du Ve siècle ',
        ' J.-C.',
        ['apr.', 'après', 'apres', 'apr'],
      ],
      quote: Q_FIN,
      explain: 'La fin du Ve siècle se place après J.-C. : c’est le plus récent de ces faits.',
    },
  ],
  paires3: [
    ['av. J.-C.', 'avant Jésus-Christ'],
    ['apr. J.-C.', 'après Jésus-Christ'],
    ['ère chrétienne', 'années comptées depuis la naissance présumée du Christ'],
  ],
  paires5: [
    ['av. J.-C.', 'avant Jésus-Christ'],
    ['apr. J.-C.', 'après Jésus-Christ'],
    ['ère chrétienne', 'années comptées depuis la naissance présumée du Christ'],
    ['IIe siècle av. J.-C.', 'début du commerce régulier entre Rome et la Chine'],
    ['fin du Ve siècle', 'effondrement de l’empire romain d’Occident'],
  ],
  ordre: ['600 av. J.-C.', '150 av. J.-C.', '50 apr. J.-C.', '400 apr. J.-C.'],
  libres: [
    {
      q: 'Écris en toutes lettres ce que signifie « apr. J.-C. ».',
      accepted: ['après Jésus-Christ', 'apres Jesus-Christ', 'après Jésus Christ', 'apres Jesus Christ'],
      traps: [
        { text: 'avant Jésus-Christ', why: '« apr. » veut dire après ; « avant » s’abrège « av. ».' },
        { text: 'après Jules César', why: 'J.-C. désigne Jésus-Christ, pas Jules César.' },
      ],
      ...P_JC,
      explain: '« apr. J.-C. » se lit « après Jésus-Christ ».',
    },
    {
      q: 'Quelle date est la plus ancienne : 300 av. J.-C. ou 100 av. J.-C. ? (écris le nombre)',
      accepted: ['300', ...AV.map((c) => `300 ${c}`)],
      traps: [
        {
          text: '100',
          why: 'Avant J.-C., on compte à rebours : 300 av. J.-C. est plus loin du repère, donc plus ancien.',
        },
        { text: '100 av. J.-C.', why: 'Avant J.-C., plus le nombre est grand, plus la date est ancienne.' },
      ],
      ...P_ERE,
      explain:
        '300 av. J.-C. est plus éloigné de la naissance présumée du Christ que 100 av. J.-C. : il est plus ancien.',
    },
    {
      q: 'Le commerce régulier entre Rome et la Chine existe depuis le IIe siècle … J.-C. (écris le mot qui manque)',
      accepted: ['avant', 'av.', 'av'],
      traps: [
        { text: 'après', why: 'Le programme dit « avant J.-C. ».' },
        { text: 'apr.', why: '« apr. » veut dire après ; ici c’est avant J.-C.' },
      ],
      quote: Q_SOIE,
      explain: 'Ce commerce existe depuis le IIe siècle avant J.-C.',
    },
    {
      q: 'Les années de l’ère chrétienne se comptent depuis la naissance présumée de … (un nom).',
      accepted: [
        'Jésus-Christ',
        'Jesus-Christ',
        'Jésus Christ',
        'Jesus Christ',
        'Jésus',
        'Jesus',
        'Christ',
        'le Christ',
      ],
      traps: [
        { text: 'Jules César', why: 'J.-C. ne désigne pas Jules César, mais Jésus-Christ.' },
        {
          text: 'César',
          why: 'César conquiert la Gaule ; le repère de l’ère chrétienne est la naissance présumée du Christ.',
        },
      ],
      ...P_ERE,
      explain: 'L’ère chrétienne commence à la date présumée de la naissance du Christ.',
    },
  ],
  docs: [
    {
      title: 'Une frise de la classe',
      lines: [
        'Sur la frise de la classe, un trait marque la naissance présumée du Christ.',
        'À gauche du trait : le début du commerce régulier entre Rome et la Chine, au IIe siècle av. J.-C.',
        'À droite du trait : la fin de l’empire romain d’Occident, vers la fin du Ve siècle.',
      ],
      qs: [
        {
          q: 'De quel côté du trait sont placées les dates av. J.-C. sur cette frise ?',
          a: 'à gauche',
          wrong: [
            { label: 'à droite', why: 'À droite du trait, le texte place la fin du Ve siècle, après J.-C.' },
            { label: 'sur le trait', why: 'Le trait marque seulement le repère : la naissance présumée du Christ.' },
          ],
          ...P_ERE,
          explain: 'Le texte place le IIe siècle av. J.-C. à gauche du trait : les dates av. J.-C. sont à gauche.',
        },
        {
          q: 'Quel événement du texte est le plus ancien ?',
          a: 'le début du commerce entre Rome et la Chine',
          wrong: [
            { label: 'la fin de l’empire romain d’Occident', why: 'Elle date de la fin du Ve siècle, après J.-C.' },
            { label: 'la naissance présumée du Christ', why: 'Le IIe siècle av. J.-C. est avant ce repère.' },
          ],
          quote: Q_SOIE,
          explain: 'Le IIe siècle av. J.-C. est avant le repère : c’est l’événement le plus ancien du texte.',
        },
      ],
    },
    {
      title: 'Deux dates',
      lines: [
        'Léa lit deux dates dans son manuel : 450 av. J.-C. et 250 av. J.-C.',
        'Elle pense que 250 av. J.-C. est la plus ancienne, car 250 est plus petit que 450.',
      ],
      qs: [
        {
          q: 'Léa a-t-elle raison ?',
          a: 'non : 450 av. J.-C. est plus ancien',
          wrong: [
            {
              label: 'oui : 250 est plus petit que 450',
              why: 'Avant J.-C., on compte à rebours : le plus grand nombre est le plus ancien.',
            },
            { label: 'on ne peut pas comparer ces dates', why: 'On peut : elles sont toutes deux avant J.-C.' },
          ],
          ...P_ERE,
          explain: 'Avant J.-C., plus le nombre est grand, plus la date est ancienne : 450 av. J.-C. est plus ancien.',
        },
        {
          q: 'Quelle date est la plus proche de la naissance présumée du Christ ?',
          a: '250 av. J.-C.',
          wrong: [
            { label: '450 av. J.-C.', why: '450 ans avant le repère, c’est plus loin que 250 ans.' },
            { label: 'aucune des deux', why: 'L’une est forcément plus proche : 250 av. J.-C.' },
          ],
          ...P_ERE,
          explain: '250 av. J.-C. est à 250 ans environ du repère, 450 av. J.-C. à 450 ans environ.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : millénaires et siècles ———

const siecles: Notion = {
  id: 'h6-millenaires-siecles',
  title: 'Millénaires et siècles',
  hint: 'Demande-toi d’abord si l’on parle d’un siècle ou d’un millénaire, puis de quel côté du repère on se trouve ; attention aux années rondes.',
  memo: [
    'Un **siècle** dure cent ans ; un **millénaire** dure mille ans, soit dix siècles.',
    'Le XXIe siècle a commencé en 2001 et finira en 2100. Avant J.-C., on compte à rebours : le IIe siècle av. J.-C. va de 200 à 101 av. J.-C.',
    'Astuce : 450 → 4 centaines + 1 = Ve siècle (écrit en **chiffres romains**). Attention aux années rondes : 1900 appartient encore au XIXe siècle.',
  ],
  faits: [
    {
      q: 'Combien de temps dure un millénaire ?',
      a: 'mille ans',
      wrong: [
        { label: 'dix ans', why: 'Dix ans, c’est une décennie, pas un millénaire.' },
        { label: 'un million d’années', why: 'Bien trop long : un millénaire dure mille ans.' },
        { label: 'cent ans', why: 'Cent ans, c’est un siècle. Un millénaire en vaut dix.' },
      ],
      gap: ['Un millénaire est une période de ', ' ans.', ['mille', '1000', '1 000']],
      ...P_MILLENAIRE,
      explain: 'Un millénaire est une période de mille ans.',
    },
    {
      q: 'Combien de siècles compte un millénaire ?',
      a: 'dix',
      wrong: [
        { label: 'mille', why: 'Mille, c’est le nombre d’années d’un millénaire, pas de siècles.' },
        { label: 'deux', why: 'Deux siècles font deux cents ans : il en faut dix pour mille ans.' },
        { label: 'cent', why: 'Cent, c’est le nombre d’années d’un siècle. 1 000 ÷ 100 = 10.' },
      ],
      gap: ['Un millénaire compte ', ' siècles.', ['dix', '10']],
      ...P_MILLENAIRE,
      explain: 'Mille ans divisés par cent ans : un millénaire compte dix siècles.',
    },
    {
      q: 'Le XXIe siècle a commencé le premier jour de quelle année ?',
      a: '2001',
      wrong: [
        { label: '1901', why: '1901 est le début du XXe siècle, pas du XXIe.' },
        { label: '2100', why: '2100 est la dernière année du XXIe siècle.' },
        { label: '2000', why: 'Piège classique : un siècle commence par une année en 1 ; 2000 termine le XXe siècle.' },
      ],
      gap: ['Le XXIe siècle a commencé le premier jour de l’année ', '.', ['2001']],
      ...P_BORNES,
      explain: 'Le siècle actuel a commencé le premier jour de l’année 2001.',
    },
    {
      q: 'Dans quel siècle se situe l’année 150 av. J.-C. ?',
      a: 'IIe siècle av. J.-C.',
      wrong: [
        {
          label: 'XVe siècle av. J.-C.',
          why: '150 compte une centaine, pas quinze : on n’utilise pas les deux premiers chiffres.',
        },
        { label: 'IIe siècle apr. J.-C.', why: 'Bon siècle, mauvais côté du repère : l’année est av. J.-C.' },
        { label: 'Ier siècle av. J.-C.', why: 'On ajoute 1 aux centaines : 1 centaine + 1 = IIe siècle.' },
      ],
      gap: ['L’année 150 av. J.-C. se situe au ', ' siècle av. J.-C.', ['IIe', '2e', 'II', 'IIème', '2ème']],
      ...P_SIECLE,
      explain: 'Le IIe siècle av. J.-C. va de 200 à 101 av. J.-C. : 150 av. J.-C. en fait partie.',
    },
    {
      q: 'Dans quel millénaire se situent les récits fondateurs de la Méditerranée antique étudiés en 6e ?',
      a: 'Ier millénaire av. J.-C.',
      wrong: [
        { label: 'IIIe millénaire apr. J.-C.', why: 'C’est notre millénaire, commencé en 2001.' },
        { label: 'IIe millénaire apr. J.-C.', why: 'Ce millénaire va de 1001 à 2000 : bien après l’Antiquité.' },
        { label: 'Ier millénaire apr. J.-C.', why: 'Le programme dit « avant J-C ».' },
      ],
      gap: [
        'Les récits fondateurs de la Méditerranée antique se situent au ',
        ' millénaire av. J.-C.',
        ['Ier', '1er', 'I', 'premier'],
      ],
      quote: Q_THEME2,
      explain: 'Le thème 2 se situe « au Ier millénaire avant J-C ».',
    },
    {
      q: 'Dans quel siècle se situe l’année 2026 ?',
      a: 'XXIe siècle',
      wrong: [
        {
          label: 'IIIe siècle',
          why: 'Le IIIe siècle est dans l’Antiquité ; 2026 est dans le IIIe millénaire, pas le IIIe siècle.',
        },
        { label: 'XIXe siècle', why: 'Le XIXe siècle va de 1801 à 1900.' },
        { label: 'XXe siècle', why: 'Piège classique : 20 centaines + 1 = XXIe siècle.' },
      ],
      gap: ['L’année 2026 se situe au ', ' siècle.', ['XXIe', '21e', 'XXI', 'XXIème', '21ème']],
      ...P_BORNES,
      explain: 'Le XXIe siècle va de 2001 à 2100 : 2026 en fait partie.',
    },
  ],
  paires3: [
    ['Siècle', '100 ans'],
    ['Millénaire', '1 000 ans'],
    ['XXIe siècle', 'De 2001 à 2100'],
  ],
  paires5: [
    ['Siècle', '100 ans'],
    ['Millénaire', '1 000 ans'],
    ['XXIe siècle', 'De 2001 à 2100'],
    ['IIe siècle av. J.-C.', 'De 200 à 101 av. J.-C.'],
    ['Ier siècle apr. J.-C.', 'De l’an 1 à l’an 100'],
  ],
  ordre: ['IIe siècle av. J.-C.', 'Ier siècle av. J.-C.', 'Ier siècle apr. J.-C.', 'Ve siècle apr. J.-C.'],
  libres: [
    {
      q: 'Dans quel siècle se situe l’année 450 av. J.-C. ? (chiffres romains)',
      accepted: rangDate('V', 5, 'siècle', AV),
      traps: [
        { text: 'IVe', why: 'On ajoute 1 aux centaines : 4 + 1 = Ve siècle.' },
        { text: 'IVe siècle', why: 'Le IVe siècle av. J.-C. va de 400 à 301 av. J.-C. : 450 est avant.' },
      ],
      ...P_SIECLE,
      explain: 'Le Ve siècle av. J.-C. va de 500 à 401 av. J.-C. : 450 av. J.-C. en fait partie.',
    },
    {
      q: 'Dans quel siècle se situe l’année 1900 ? (chiffres romains)',
      accepted: rangDate('XIX', 19, 'siècle', APR),
      traps: [
        { text: 'XXe', why: 'Année ronde : 1900 est la dernière année du XIXe siècle (1801-1900).' },
        { text: 'XXe siècle', why: 'Le XXe siècle commence en 1901 : 1900 appartient encore au XIXe.' },
      ],
      ...P_BORNES,
      explain: 'Comme le XXIe siècle va de 2001 à 2100, le XIXe va de 1801 à 1900.',
    },
    {
      q: 'Combien d’années compte un millénaire ? (en chiffres)',
      accepted: ['1000', '1 000', 'mille', '1000 ans', '1 000 ans', 'mille ans'],
      traps: [
        { text: '100', why: '100 ans, c’est un siècle.' },
        { text: '10', why: '10, c’est le nombre de siècles dans un millénaire.' },
      ],
      ...P_MILLENAIRE,
      explain: 'Un millénaire est une période de mille ans.',
    },
    {
      q: 'Le IIe siècle av. J.-C. commence en quelle année av. J.-C. ? (le nombre)',
      accepted: ['200', ...AV.map((c) => `200 ${c}`)],
      traps: [
        { text: '101', why: '101 av. J.-C. est la dernière année de ce siècle : on compte à rebours.' },
        { text: '100', why: '100 av. J.-C. appartient au Ier siècle av. J.-C.' },
      ],
      ...P_SIECLE,
      explain: 'Avant J.-C., on compte à rebours : le IIe siècle av. J.-C. va de 200 à 101 av. J.-C.',
    },
  ],
  docs: [
    {
      title: 'Un exposé sur la Chine des Han',
      lines: [
        'Un élève prépare un exposé.',
        'Il écrit : « Un commerce régulier relie Rome et la Chine depuis le IIe siècle av. J.-C. »',
        'Il ajoute : « Ce siècle correspond aux années 200 à 101 av. J.-C. »',
      ],
      qs: [
        {
          q: 'Dans quel millénaire se situe ce début de commerce ?',
          a: 'le Ier millénaire av. J.-C.',
          wrong: [
            { label: 'le IIe millénaire av. J.-C.', why: 'Le IIe millénaire av. J.-C. va de 2000 à 1001 av. J.-C.' },
            { label: 'le Ier millénaire apr. J.-C.', why: 'Le texte dit « av. J.-C. ».' },
          ],
          ...P_MILLENAIRE,
          explain: 'Les années 200 à 101 av. J.-C. font partie du Ier millénaire av. J.-C. (de 1000 à 1 av. J.-C.).',
        },
        {
          q: 'Combien de temps dure le siècle cité par l’élève ?',
          a: 'cent ans',
          wrong: [
            { label: 'mille ans', why: 'Mille ans, c’est un millénaire.' },
            { label: 'dix ans', why: 'Dix ans, c’est une décennie.' },
          ],
          ...P_SIECLE,
          explain: 'Un siècle est une durée de cent ans.',
        },
      ],
    },
    {
      title: 'Le calendrier de la classe',
      lines: [
        'Sur une affiche faite en 2026, on lit l’année : « 2026 ».',
        'Un camarade affirme : « Cette année est au XXe siècle, car 2026 commence par 20. »',
      ],
      qs: [
        {
          q: 'Le camarade a-t-il raison ?',
          a: 'non : 2026 est au XXIe siècle',
          wrong: [
            { label: 'oui : 2026 commence par 20', why: 'On ajoute 1 aux centaines : 20 + 1 = XXIe siècle.' },
            { label: 'non : 2026 est au XIXe siècle', why: 'Le XIXe siècle s’arrête en 1900.' },
          ],
          ...P_BORNES,
          explain: 'Le XXIe siècle va de 2001 à 2100 : 2026 en fait partie.',
        },
        {
          q: 'Dans quel millénaire se situe l’année 2026 ?',
          a: 'le IIIe millénaire',
          wrong: [
            { label: 'le IIe millénaire', why: 'Le IIe millénaire s’arrête en 2000.' },
            {
              label: 'le XXIe millénaire',
              why: 'XXIe, c’est le siècle ; notre ère n’en est qu’à son troisième millénaire.',
            },
          ],
          ...P_MILLENAIRE,
          explain:
            'Un millénaire dure mille ans : le IIIe millénaire de notre ère commence en 2001, comme le XXIe siècle.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : repères annuels de 6e ———

const reperes: Notion = {
  id: 'h6-reperes-annuels',
  title: 'Les repères annuels de 6e',
  hint: 'Demande-toi de quel thème de l’année il s’agit : le plus ancien, celui des cités, ou le dernier.',
  memo: [
    'L’histoire de 6e suit trois thèmes : la longue histoire de l’humanité et des migrations ; récits fondateurs, croyances et citoyenneté dans la Méditerranée antique ; l’empire romain dans le monde antique.',
    'Chaque thème a ses **repères** : premiers États et premières écritures dans l’Orient ancien (Égypte ou Mésopotamie), naissance de la démocratie à Athènes, route de la soie et Chine des Han.',
    'Dates à retenir : le thème 2 se situe au Ier millénaire av. J.-C. ; le commerce régulier entre Rome et la Chine existe depuis le IIe siècle av. J.-C.',
  ],
  faits: [
    {
      q: 'Dans quel thème de 6e étudie-t-on la « révolution » néolithique ?',
      a: 'la longue histoire de l’humanité et des migrations',
      wrong: [
        { label: 'le temps des rois', why: 'Le temps des rois est un thème de CM1, bien plus tardif.' },
        {
          label: 'l’empire romain dans le monde antique',
          why: 'L’empire romain est le thème 3, bien après le néolithique.',
        },
        {
          label: 'récits fondateurs, croyances et citoyenneté',
          why: 'Ce thème 2 porte sur la Méditerranée antique au Ier millénaire av. J.-C. ; le néolithique est au thème 1.',
        },
      ],
      gap: [
        'La « révolution » néolithique appartient au thème « La longue histoire de l’',
        ' et des migrations ».',
        ['humanité', 'humanite'],
      ],
      quote: Q_THEME1,
      explain:
        'Le thème 1, « La longue histoire de l’humanité et des migrations », contient la « révolution » néolithique.',
    },
    {
      q: 'Dans quel cadre se place l’étude des premiers États et des premières écritures ?',
      a: 'l’Orient ancien',
      wrong: [
        { label: 'la Gaule romaine', why: 'La Gaule est conquise par César bien plus tard.' },
        { label: 'la Chine des Han', why: 'La Chine des Han est étudiée au thème 3, avec la route de la soie.' },
        { label: 'les cités grecques', why: 'Les cités grecques appartiennent au thème 2, plus tardif.' },
      ],
      gap: ['Les premiers États et les premières écritures s’étudient dans le cadre de l’Orient ', '.', ['ancien']],
      quote: Q_ETATS,
      explain: 'Le programme place cette étude dans l’Orient ancien : l’Égypte ou la Mésopotamie.',
    },
    {
      q: 'Dans quelle cité naît la démocratie étudiée en 6e ?',
      a: 'Athènes',
      wrong: [
        { label: 'Paris', why: 'Paris n’est pas une cité grecque de l’Antiquité.' },
        {
          label: 'Jérusalem',
          why: 'Jérusalem est étudiée pour la naissance du monothéisme juif, pas pour la démocratie.',
        },
        { label: 'Rome', why: 'Rome est étudiée pour son mythe de fondation ; la démocratie naît à Athènes.' },
      ],
      gap: ['La démocratie naît à ', ', une cité grecque.', ['Athènes', 'Athenes']],
      quote: Q_ATHENES,
      explain: 'Le programme pose la question : « Dans quelles conditions la démocratie naît-elle à Athènes ? »',
    },
    {
      q: 'Par la route de la soie, l’empire romain est en contact avec quelle civilisation ?',
      a: 'la Chine des Han',
      wrong: [
        { label: 'les Gaulois', why: 'Les Gaulois sont conquis par César ; la route de la soie mène en Chine.' },
        {
          label: 'les Francs',
          why: 'Les Francs s’installent dans l’empire à partir du IVe siècle ; ils ne sont pas au bout de la route de la soie.',
        },
        {
          label: 'les cités grecques',
          why: 'Les cités grecques sont en Méditerranée ; la route de la soie relie Rome à la Chine des Han.',
        },
      ],
      gap: ['La route de la soie relie l’empire romain à la Chine des ', '.', ['Han']],
      quote: Q_HAN,
      explain: 'Le programme associe « l’ancienne route de la soie et la Chine des Han ».',
    },
    {
      q: 'Quel personnage, déjà étudié en CM1, a conquis la Gaule ?',
      a: 'César',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil, au XVIIe siècle : bien après l’Antiquité.' },
        {
          label: 'Charlemagne',
          why: 'Charlemagne est couronné empereur en 800, longtemps après la conquête de la Gaule.',
        },
        { label: 'Clovis', why: 'Clovis est roi des Francs, après la conquête romaine de la Gaule.' },
      ],
      gap: ['La Gaule est conquise par ', '.', ['César', 'Cesar', 'Jules César', 'Jules Cesar']],
      quote: Q_CESAR,
      explain: 'Le programme rappelle que la conquête de la Gaule par César a été abordée au CM1.',
    },
    {
      q: 'Selon le programme, qu’est-ce qui assure l’unité de l’empire romain ?',
      a: 'le pouvoir impérial, la romanisation et le mythe de l’Urbs',
      wrong: [
        {
          label: 'l’élection d’un président',
          why: 'L’empire romain est dirigé par un empereur, pas par un président élu.',
        },
        {
          label: 'la route de la soie',
          why: 'La route de la soie relie Rome à la Chine : elle n’assure pas l’unité de l’empire.',
        },
        {
          label: 'la démocratie athénienne',
          why: 'La démocratie naît à Athènes, dans le thème 2 ; l’empire repose sur le pouvoir impérial.',
        },
      ],
      gap: [
        'L’unité de l’empire romain est assurée par le pouvoir ',
        ', la romanisation et le mythe de l’Urbs.',
        ['impérial', 'imperial'],
      ],
      quote: Q_UNITE,
      explain: 'Le programme cite le pouvoir impérial, la romanisation et le mythe prestigieux de l’Urbs.',
    },
  ],
  paires3: [
    ['Thème 1', 'La longue histoire de l’humanité et des migrations'],
    ['Thème 2', 'Récits fondateurs, croyances et citoyenneté'],
    ['Thème 3', 'L’empire romain dans le monde antique'],
  ],
  paires5: [
    ['Athènes', 'Naissance de la démocratie'],
    ['Égypte ou Mésopotamie', 'Premiers États, premières écritures'],
    ['Chine des Han', 'Route de la soie'],
    ['César', 'Conquête de la Gaule'],
    ['Ier millénaire av. J.-C.', 'Récits fondateurs de la Méditerranée antique'],
  ],
  ordre: [
    'La « révolution » néolithique',
    'Les premiers États et les premières écritures',
    'Le début du commerce régulier entre Rome et la Chine (IIe siècle av. J.-C.)',
    'La fin de l’empire romain d’Occident (fin du Ve siècle)',
  ],
  libres: [
    {
      q: 'Dans quelle cité grecque naît la démocratie ?',
      accepted: ['Athènes', 'Athenes', 'à Athènes', 'a Athenes'],
      traps: [
        { text: 'Rome', why: 'Rome n’est pas une cité grecque ; la démocratie naît à Athènes.' },
        { text: 'Sparte', why: 'Sparte est une autre cité grecque : le programme étudie la démocratie à Athènes.' },
      ],
      quote: Q_ATHENES,
      explain: 'La démocratie naît à Athènes.',
    },
    {
      q: 'Avec la route de la soie, on découvre la civilisation de la Chine des … (un nom).',
      accepted: ['Han', 'des Han'],
      traps: [
        { text: 'Romains', why: 'Les Romains sont à l’autre bout de la route : en Chine, ce sont les Han.' },
        { text: 'Grecs', why: 'Les Grecs vivent en Méditerranée ; le programme cite la Chine des Han.' },
      ],
      quote: Q_HAN,
      explain: 'Le programme parle de « la Chine des Han ».',
    },
    {
      q: 'Les premiers États et les premières écritures s’étudient dans le cadre de l’Orient … (un mot).',
      accepted: ['ancien'],
      traps: [
        { text: 'romain', why: 'L’empire romain vient bien plus tard : le programme dit « Orient ancien ».' },
        { text: 'moderne', why: 'Les premiers États sont très anciens : le programme dit « Orient ancien ».' },
      ],
      quote: Q_ETATS,
      explain: 'Le programme dit « dans le cadre de l’Orient ancien ».',
    },
    {
      q: 'Quel est le titre du thème 3 d’histoire de 6e ? L’empire romain dans le monde … (un mot)',
      accepted: ['antique'],
      traps: [
        { text: 'moderne', why: 'L’empire romain appartient à l’Antiquité : le monde antique.' },
        { text: 'grec', why: 'Le monde grec est au thème 2 ; le thème 3 parle du monde antique.' },
      ],
      quote: Q_THEME3,
      explain: 'Le thème 3 s’intitule « L’empire romain dans le monde antique ».',
    },
  ],
  docs: [
    {
      title: 'Le cahier de Sami',
      lines: [
        'Thème 1 : des débuts de l’humanité aux premiers États.',
        'Thème 2 : Athènes, Rome et Jérusalem, au Ier millénaire av. J.-C.',
        'Thème 3 : l’empire romain, ses conquêtes et ses contacts avec la Chine.',
      ],
      qs: [
        {
          q: 'Dans quel thème du cahier se place la naissance de la démocratie à Athènes ?',
          a: 'le thème 2',
          wrong: [
            { label: 'le thème 1', why: 'Le thème 1 s’arrête aux premiers États, avant les cités grecques.' },
            { label: 'le thème 3', why: 'Le thème 3 porte sur l’empire romain.' },
          ],
          quote: Q_ATHENES,
          explain: 'Athènes est citée au thème 2, avec Rome et Jérusalem : c’est là que naît la démocratie.',
        },
        {
          q: 'Quel thème du cahier évoque le commerce avec la Chine des Han ?',
          a: 'le thème 3',
          wrong: [
            { label: 'le thème 1', why: 'Le thème 1 porte sur les débuts de l’humanité et les premiers États.' },
            { label: 'le thème 2', why: 'Le thème 2 porte sur Athènes, Rome et Jérusalem.' },
          ],
          quote: Q_HAN,
          explain: 'Les contacts de l’empire romain avec la Chine des Han appartiennent au thème 3.',
        },
      ],
    },
    {
      title: 'Une affiche de repères',
      lines: [
        'Repère A : premiers États, premières écritures (Égypte ou Mésopotamie).',
        'Repère B : commerce régulier entre Rome et la Chine, depuis le IIe siècle av. J.-C.',
        'Repère C : conquête de la Gaule par César.',
      ],
      qs: [
        {
          q: 'Quel repère de l’affiche se rattache à l’Orient ancien ?',
          a: 'le repère A',
          wrong: [
            { label: 'le repère B', why: 'Le repère B relie Rome et la Chine.' },
            { label: 'le repère C', why: 'Le repère C concerne la Gaule.' },
          ],
          quote: Q_ETATS,
          explain: 'L’Égypte et la Mésopotamie appartiennent à l’Orient ancien : c’est le repère A.',
        },
        {
          q: 'Quel repère de l’affiche a déjà été abordé au CM1 ?',
          a: 'le repère C',
          wrong: [
            { label: 'le repère A', why: 'Les premiers États sont étudiés en 6e.' },
            { label: 'le repère B', why: 'La route de la soie est étudiée en 6e.' },
          ],
          quote: Q_CESAR,
          explain: 'La conquête de la Gaule par César a été abordée lors de la première année du cycle 3.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [frise, avantApres, siecles, reperes];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'sixième'));
