import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES } from './reperes-5e-sources.ts';

/**
 * 5e, « Repères de 5e » (lot hi-5e-04) : compétences « Se repérer dans le temps », « Se repérer dans l'espace » et
 * lexique spécifique du programme du cycle 4, appliquées aux trois thèmes d'histoire de 5e. Les repères chronologiques
 * sont ceux des rubriques « Principaux repères chronologiques à construire » des ressources Éduscol (complétés par la
 * prise de Bagdad, citée par le programme). Les textes à lire du niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle4-2020';

const { theme1: T1, theme2: T2, theme3: T3 } = PREUVES;

/** Une année seule ou précédée de « en ». */
const annee = (a: string) => [a, `en ${a}`, `l’an ${a}`, `l’année ${a}`];

/** Écritures acceptées d'un siècle donné en chiffres romains. */
function siecle(roman: string, arabe: number): string[] {
  const rangs = [
    roman,
    `${roman}e`,
    `${roman}ème`,
    `${roman}eme`,
    `${arabe}`,
    `${arabe}e`,
    `${arabe}ème`,
    `${arabe}eme`,
  ];
  return [`${roman}e`, ...rangs.flatMap((r) => [`${r} siècle`, `${r} siecle`, `au ${r} siècle`]), ...rangs];
}

/** Un mot du vocabulaire, avec ou sans article. */
const mot = (word: string, ...articles: string[]) => [word, ...articles.map((a) => `${a}${word}`)];

// ——— Notion 1 : les repères chronologiques ———

const reperes: Notion = {
  id: 'h5-reperes-chronologiques',
  title: 'Les repères chronologiques de 5e',
  hint: 'Demande-toi d’abord à quel thème appartient le fait : les empires, l’Occident féodal ou les temps modernes.',
  memo: [
    'Un **repère** est un fait daté qu’on retient pour situer les autres. Chrétientés et islam (thème 1) : 622, 800, 1054, 1204, puis 1258, la fin de la période.',
    'L’Occident féodal (thème 2) : 987, 1214, 1337-1453, et la population européenne qui double du XIe au XIVe siècle. Les transformations de l’Europe (thème 3) : 1453, 1492, 1517, 1598, 1661-1715.',
    'Astuce de coach : accroche chaque date à un acteur ou à un lieu (800, Charlemagne). Attention aux dates voisines : 1204 (sac de Constantinople) n’est pas 1214 (bataille de Bouvines), et 1453 marque deux faits.',
  ],
  faits: [
    {
      q: 'Quel événement date de 622 ?',
      a: 'l’Hégire, début de l’ère musulmane',
      wrong: [
        { label: 'les 95 thèses de Luther', why: 'Les 95 thèses datent de 1517, bien plus tard.' },
        { label: 'la bataille de Bouvines', why: 'Bouvines date de 1214, dans l’Occident féodal.' },
        {
          label: 'le couronnement impérial de Charlemagne',
          why: 'Charlemagne est couronné empereur en 800, après l’Hégire.',
        },
      ],
      gap: ['L’Hégire, début de l’ère musulmane, date de l’année ', '.', ['622']],
      ...T1.hegire,
      explain: '622 est la date de l’Hégire, qui ouvre l’ère musulmane.',
    },
    {
      q: 'En quelle année Charlemagne se fait-il couronner empereur ?',
      a: '800',
      wrong: [
        { label: '1453', why: '1453 est un repère de la fin du Moyen Âge, plus de six siècles après.' },
        { label: '1204', why: '1204 est le sac de Constantinople par les croisés.' },
        { label: '987', why: '987 est le sacre d’Hugues Capet, qui devient roi, pas empereur.' },
      ],
      gap: ['Charlemagne se fait couronner empereur en ', '.', ['800']],
      ...T1.couronnement,
      explain: 'Le couronnement impérial de Charlemagne a lieu en 800.',
    },
    {
      q: 'Que se passe-t-il en 1054 entre le pape et le patriarche de Constantinople ?',
      a: 'une excommunication mutuelle',
      wrong: [
        { label: 'un couronnement impérial', why: 'Le couronnement impérial de Charlemagne date de 800.' },
        { label: 'une bataille à Bouvines', why: 'Bouvines (1214) oppose des armées, pas le pape et le patriarche.' },
        {
          label: 'le pillage de Constantinople',
          why: 'Le sac de Constantinople par les croisés date de 1204 : 150 ans plus tard.',
        },
      ],
      gap: [
        'En 1054, le pape et le patriarche de Constantinople s’excluent : c’est une ',
        ' mutuelle.',
        ['excommunication'],
      ],
      ...T1.schisme,
      explain: 'En 1054, chacun excommunie l’autre : les deux Églises s’éloignent.',
    },
    {
      q: 'Quel événement date de 1204 ?',
      a: 'le sac de Constantinople par les croisés',
      wrong: [
        { label: 'la bataille de Bouvines', why: 'Bouvines date de 1214, dix ans plus tard.' },
        {
          label: 'la prise de Bagdad par les Mongols',
          why: 'La prise de Bagdad par les Mongols date de 1258.',
        },
        {
          label: 'la prise de Constantinople par les Turcs',
          why: 'Cette prise date de 1453 : en 1204, ce sont les croisés qui pillent la ville.',
        },
      ],
      gap: ['En 1204, les croisés mettent à sac la ville de ', '.', ['Constantinople']],
      ...T1.sac,
      explain:
        'En 1204, les croisés pillent Constantinople : la rupture entre les deux chrétientés devient définitive.',
    },
    {
      q: 'Quel événement date de 987 ?',
      a: 'le couronnement et le sacre d’Hugues Capet',
      wrong: [
        { label: 'la révocation de l’Édit de Nantes', why: 'La révocation date de 1685, sous Louis XIV.' },
        { label: 'la découverte de l’Amérique', why: 'La découverte de l’Amérique date de 1492.' },
        { label: 'la bataille de Bouvines', why: 'Bouvines (1214) concerne un Capétien bien plus tardif.' },
      ],
      gap: ['Hugues Capet est couronné et sacré en ', '.', ['987']],
      ...T2.repere987,
      explain: 'En 987, Hugues Capet est couronné et sacré roi : la dynastie capétienne commence.',
    },
    {
      q: 'Quelle bataille est un repère de l’année 1214 ?',
      a: 'la bataille de Bouvines',
      wrong: [
        { label: 'la bataille de Lépante', why: 'Lépante est une défaite navale ottomane de 1571.' },
        { label: 'la bataille de Poitiers', why: 'La bataille dite de Poitiers date de 732 ou 733.' },
        { label: 'la bataille de Marignan', why: 'Marignan date de 1515, sous François Ier.' },
      ],
      gap: ['En 1214 a lieu la bataille de ', '.', ['Bouvines']],
      ...PREUVES.repereBouvines,
      explain: '1214 est la date de la bataille de Bouvines.',
    },
    {
      q: 'Entre quelles années la guerre de Cent Ans se déroule-t-elle ?',
      a: '1337-1453',
      wrong: [
        { label: '1661-1715', why: '1661-1715 est le repère du règne de Louis XIV.' },
        { label: '1545-1563', why: '1545-1563 correspond au concile de Trente.' },
        { label: '1347-1352', why: '1347-1352 correspond à la peste noire, pendant ces années de guerre.' },
      ],
      gap: ['La guerre de Cent Ans commence en 1337 et se termine en ', '.', ['1453']],
      ...T2.centAns,
      explain: 'La guerre de Cent Ans va de 1337 à 1453.',
    },
    {
      q: 'Quel événement date de 1492 ?',
      a: 'la découverte de l’Amérique',
      wrong: [
        { label: 'les 95 thèses de Luther', why: 'Les 95 thèses datent de 1517.' },
        { label: 'l’Édit de Nantes', why: 'L’Édit de Nantes date de 1598.' },
        { label: 'la prise de Constantinople', why: 'La prise de Constantinople par les Turcs date de 1453.' },
      ],
      gap: ['La découverte de l’Amérique date de ', '.', ['1492']],
      ...T3.amerique,
      explain: '1492 est le repère de la découverte de l’Amérique.',
    },
    {
      q: 'Que fait Luther en 1517 ?',
      a: 'il publie ses 95 thèses',
      wrong: [
        {
          label: 'il impose l’Édit de Nantes',
          why: 'L’Édit de Nantes (1598) est imposé par le pouvoir royal français.',
        },
        {
          label: 'il découvre l’Amérique',
          why: 'La découverte de l’Amérique date de 1492 et revient à des navigateurs.',
        },
        {
          label: 'il se fait couronner empereur',
          why: 'Luther est un réformateur religieux, pas un empereur : le couronnement à retenir est celui de Charlemagne, en 800.',
        },
      ],
      gap: ['En 1517, Luther publie ses ', ' thèses.', ['95', 'quatre-vingt-quinze']],
      ...T3.theses,
      explain: 'En 1517, Luther publie ses 95 thèses.',
    },
    {
      q: 'Quel texte est un repère de l’année 1598 ?',
      a: 'l’Édit de Nantes',
      wrong: [
        {
          label: 'l’ordonnance de Villers-Cotterêts',
          why: 'L’ordonnance de Villers-Cotterêts date de 1539, sous François Ier.',
        },
        { label: 'le traité de Tordesillas', why: 'Le traité de Tordesillas date de 1494.' },
        { label: 'le traité de Verdun', why: 'Le traité de Verdun date de 843.' },
      ],
      gap: ['En 1598, le pouvoir royal impose l’Édit de ', '.', ['Nantes']],
      ...T3.repereNantes,
      explain: '1598 est la date de l’Édit de Nantes.',
    },
    {
      q: 'À qui correspond le repère 1661-1715 ?',
      a: 'au règne de Louis XIV',
      wrong: [
        { label: 'au règne de François Ier', why: 'François Ier est sacré en 1515, au XVIe siècle.' },
        { label: 'au règne de Louis IX', why: 'Louis IX règne au XIIIe siècle (1226-1270).' },
        { label: 'au règne de Philippe Auguste', why: 'Philippe Auguste règne de 1180 à 1223.' },
      ],
      gap: ['Le repère 1661-1715 correspond au règne de ', '.', ['Louis XIV', 'Louis 14']],
      ...T3.regne,
      explain: 'La ressource d’Éduscol retient 1661-1715 comme repère du règne de Louis XIV.',
    },
    {
      q: 'Quel événement de 1258 met fin à la puissance du califat abbasside ?',
      a: 'la prise de Bagdad par les Mongols',
      wrong: [
        { label: 'le sac de Constantinople', why: 'Le sac de Constantinople par les croisés date de 1204.' },
        { label: 'l’Hégire', why: 'L’Hégire (622) marque le début de l’ère musulmane, pas la fin d’un califat.' },
        { label: 'la bataille de Lépante', why: 'Lépante (1571) concerne les Ottomans, bien plus tard.' },
      ],
      gap: ['En 1258, les Mongols prennent la ville de ', '.', ['Bagdad']],
      ...T1.bagdad,
      explain: 'En 1258, les Mongols prennent Bagdad, capitale du califat abbasside.',
    },
  ],
  paires3: [
    ['800', 'Couronnement impérial de Charlemagne'],
    ['1492', 'Découverte de l’Amérique'],
    ['1214', 'Bataille de Bouvines'],
  ],
  paires5: [
    ['622', 'Hégire'],
    ['1054', 'Excommunication mutuelle du pape et du patriarche'],
    ['1204', 'Sac de Constantinople par les croisés'],
    ['1517', 'Les 95 thèses de Luther'],
    ['1598', 'Édit de Nantes'],
  ],
  frise: [
    { label: 'L’Hégire', date: '622', ...T1.hegire },
    { label: 'Le couronnement impérial de Charlemagne', date: '800', ...T1.couronnement },
    { label: 'Le sacre d’Hugues Capet', date: '987', ...T2.repere987 },
    { label: 'La bataille de Bouvines', date: '1214', ...PREUVES.repereBouvines },
    { label: 'La découverte de l’Amérique', date: '1492', ...T3.amerique },
    { label: 'L’Édit de Nantes', date: '1598', ...T3.repereNantes },
  ],
  libres: [
    {
      q: 'En quelle année a lieu l’Hégire ?',
      accepted: annee('622'),
      traps: [
        { text: '800', why: '800 est le couronnement impérial de Charlemagne.' },
        { text: '1054', why: '1054 est l’excommunication mutuelle du pape et du patriarche.' },
      ],
      ...T1.hegire,
      explain: 'L’Hégire date de 622.',
    },
    {
      q: 'En quelle année Hugues Capet est-il sacré roi ?',
      accepted: annee('987'),
      traps: [
        { text: '800', why: '800 concerne Charlemagne, couronné empereur.' },
        { text: '1214', why: '1214 est la bataille de Bouvines, sous un autre Capétien.' },
      ],
      ...T2.repere987,
      explain: 'Hugues Capet est couronné et sacré en 987.',
    },
    {
      q: 'En quelle année a lieu la bataille de Bouvines ?',
      accepted: annee('1214'),
      traps: [
        { text: '1204', why: '1204 est le sac de Constantinople : dix ans trop tôt.' },
        { text: '1515', why: '1515 est la bataille de Marignan.' },
      ],
      ...PREUVES.repereBouvines,
      explain: 'La bataille de Bouvines date de 1214.',
    },
    {
      q: 'En quelle année les Turcs prennent-ils Constantinople ?',
      accepted: annee('1453'),
      traps: [
        { text: '1204', why: 'En 1204, ce sont les croisés qui mettent la ville à sac.' },
        { text: '1492', why: '1492 est la découverte de l’Amérique.' },
      ],
      ...T3.constantinople,
      explain: 'La prise de Constantinople par les Turcs date de 1453.',
    },
    {
      q: 'En quelle année Luther publie-t-il ses 95 thèses ?',
      accepted: annee('1517'),
      traps: [
        { text: '1598', why: '1598 est l’Édit de Nantes.' },
        { text: '1492', why: '1492 est la découverte de l’Amérique.' },
      ],
      ...T3.theses,
      explain: 'Les 95 thèses datent de 1517.',
    },
  ],
  docs: [
    {
      title: 'Des cartes de révision',
      lines: [
        'Deux élèves classent leurs dates sur des cartes.',
        'Carte A : « les croisés pillent une grande ville chrétienne d’Orient ».',
        'Carte B : « une bataille renforce le pouvoir d’un roi de France », dix ans après la carte A.',
        'Carte C : « Hugues Capet est sacré roi ».',
      ],
      qs: [
        {
          q: 'Quelle date faut-il écrire sur la carte A ?',
          a: '1204',
          wrong: [
            { label: '1214', why: '1214 est la bataille de Bouvines : c’est la carte B.' },
            { label: '1453', why: 'En 1453, ce sont les Turcs, et non les croisés, qui prennent Constantinople.' },
            { label: '1054', why: '1054 est l’excommunication mutuelle, sans pillage.' },
          ],
          ...T1.sac,
          explain: 'La carte A décrit le sac de Constantinople par les croisés, en 1204.',
        },
        {
          q: 'Quel est l’ordre des cartes, de la plus ancienne à la plus récente ?',
          a: 'C, A, B',
          wrong: [
            { label: 'A, B, C', why: 'La carte C (987) est la plus ancienne : elle ne peut pas finir.' },
            { label: 'C, B, A', why: 'La carte B vient dix ans après la carte A, donc après elle.' },
            { label: 'B, A, C', why: 'C’est l’ordre inverse du temps.' },
          ],
          ...T2.repere987,
          explain: 'Le sacre d’Hugues Capet (987) précède le sac de Constantinople (1204), puis Bouvines (1214).',
        },
      ],
    },
    {
      title: 'Une année, deux événements',
      lines: [
        'Un professeur écrit au tableau une seule année.',
        'En Orient, les Turcs prennent Constantinople.',
        'En Occident, la longue guerre entre les rois de France et d’Angleterre, commencée en 1337, se termine.',
      ],
      qs: [
        {
          q: 'Quelle année le professeur a-t-il écrite ?',
          a: '1453',
          wrong: [
            { label: '1337', why: '1337 est le début de la guerre, pas sa fin.' },
            { label: '1492', why: '1492 est la découverte de l’Amérique.' },
            { label: '1204', why: 'En 1204, Constantinople est pillée par les croisés.' },
          ],
          ...T3.constantinople,
          explain: '1453 : la prise de Constantinople, et aussi la fin de la guerre de Cent Ans.',
        },
        {
          q: 'Quelle guerre se termine cette année-là ?',
          a: 'la guerre de Cent Ans',
          wrong: [
            { label: 'les guerres de religion', why: 'Les guerres de religion vont de 1562 à 1598.' },
            { label: 'la Fronde', why: 'La Fronde dure de 1648 à 1653.' },
            {
              label: 'les croisades',
              why: 'Les croisades ne sont pas une guerre entre rois de France et d’Angleterre.',
            },
          ],
          ...T2.centAns,
          explain: 'La guerre de Cent Ans va de 1337 à 1453.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la frise ———

const frise: Notion = {
  id: 'h5-frise',
  title: 'La frise de 5e : siècles, périodes et ruptures',
  hint: 'Calcule d’abord le siècle de chaque date, puis compare la durée ou la place sur la frise.',
  memo: [
    'Une **frise chronologique** range les faits du plus ancien au plus récent. La 5e va du **Moyen Âge** à la Renaissance, avec trois thèmes qui se chevauchent (ont des siècles en commun) en partie : thème 1, Chrétientés et islam (VIe-XIIIe siècles) ; thème 2, l’Occident féodal (XIe-XVe) ; thème 3, les transformations de l’Europe (XVIe-XVIIe).',
    'Un **siècle** dure cent ans et commence par une année finissant par 01 : le XIIIe siècle va de 1201 à 1300. Exemple : 800 appartient au VIIIe siècle.',
    'Avec le thème 3, on entre dans les **Temps modernes**. Une **rupture** est un grand changement par rapport à l’époque précédente ; une **continuité** est ce qui dure malgré les changements.',
  ],
  faits: [
    {
      q: 'Quelles périodes la classe de 5e couvre-t-elle sur la frise ?',
      a: 'du Moyen Âge à la Renaissance',
      wrong: [
        { label: 'de la préhistoire à l’Antiquité', why: 'C’est la période vue en 6e.' },
        { label: 'du XIXe au XXIe siècle', why: 'Ces siècles sont étudiés plus tard au collège.' },
        { label: 'de l’Antiquité au Moyen Âge', why: 'L’Antiquité a été vue en 6e : la 5e commence après.' },
      ],
      gap: ['La classe de 5e couvre une vaste période, du Moyen Âge à la ', '.', ['Renaissance']],
      ...PREUVES.couvre,
      explain: 'Le programme situe la 5e du Moyen Âge à la Renaissance.',
    },
    {
      q: 'Combien de siècles couvre le thème « Chrétientés et islam » (VIe-XIIIe siècles) ?',
      a: 'huit siècles',
      wrong: [
        { label: 'treize siècles', why: 'XIIIe donne le dernier siècle, pas le nombre de siècles.' },
        { label: 'deux siècles', why: 'Du VIe au XIIIe siècle, la durée est bien plus longue.' },
        { label: 'sept siècles', why: 'Compte aussi le VIe siècle : 13 − 6 + 1 = 8.' },
      ],
      gap: ['Le thème « Chrétientés et islam » couvre ', ' siècles.', ['huit', '8']],
      ...PREUVES.huitSiecles,
      explain: 'Du VIe au XIIIe siècle inclus, on compte huit siècles.',
    },
    {
      q: 'Combien de siècles couvre le thème sur l’Occident féodal (XIe-XVe siècles) ?',
      a: 'cinq siècles',
      wrong: [
        { label: 'quinze siècles', why: 'XVe désigne le dernier siècle, pas la durée.' },
        { label: 'huit siècles', why: 'Huit siècles est la durée de « Chrétientés et islam ».' },
        { label: 'quatre siècles', why: 'Il faut compter le XIe siècle : 15 − 11 + 1 = 5.' },
      ],
      gap: ['Le thème sur l’Occident féodal couvre ', ' siècles.', ['cinq', '5']],
      ...PREUVES.cinqSiecles,
      explain: 'Du XIe au XVe siècle inclus, on compte cinq siècles.',
    },
    {
      q: 'Dans quelle période entre-t-on avec le thème des XVIe et XVIIe siècles ?',
      a: 'les Temps modernes',
      wrong: [
        { label: 'l’Antiquité', why: 'L’Antiquité précède le Moyen Âge : elle est bien plus ancienne.' },
        {
          label: 'la préhistoire',
          why: 'La préhistoire s’achève avec l’invention de l’écriture, des milliers d’années plus tôt.',
        },
        { label: 'le Moyen Âge', why: 'Le Moyen Âge est la période qui précède ce thème.' },
      ],
      gap: ['Avec le thème des XVIe et XVIIe siècles, on entre dans les ', ' modernes.', ['temps']],
      ...PREUVES.tempsModernes,
      explain: 'La ressource d’Éduscol indique qu’avec ce thème on entre dans les « temps modernes ».',
    },
    {
      q: 'Quelle année peut-on choisir pour faire commencer le thème sur les XVIe et XVIIe siècles ?',
      a: '1453',
      wrong: [
        { label: '987', why: '987 est le sacre d’Hugues Capet, à l’époque de l’Occident féodal.' },
        { label: '1204', why: '1204 appartient à la période « Chrétientés et islam ».' },
        { label: '1598', why: '1598, date de l’Édit de Nantes, se situe déjà au cœur du thème.' },
      ],
      gap: [
        'On peut faire commencer le thème sur les XVIe et XVIIe siècles en ',
        ', avec la prise de Constantinople.',
        ['1453'],
      ],
      ...PREUVES.debutTheme3,
      explain: 'La ressource d’Éduscol propose l’année 1453.',
    },
    {
      q: 'La fin de quel règne termine le thème sur les XVIe et XVIIe siècles ?',
      a: 'celui de Louis XIV',
      wrong: [
        { label: 'celui de François Ier', why: 'François Ier règne au XVIe siècle, au milieu du thème.' },
        { label: 'celui d’Henri IV', why: 'Henri IV vient avant Louis XIV.' },
        { label: 'celui de Louis IX', why: 'Louis IX règne au XIIIe siècle, dans le thème 2.' },
      ],
      gap: [
        'Le thème sur les XVIe et XVIIe siècles se termine avec la fin du règne de ',
        '.',
        ['Louis XIV', 'Louis 14'],
      ],
      ...PREUVES.debutTheme3,
      explain: 'Le thème 3 se termine avec la fin du règne de Louis XIV, dont le repère est 1661-1715.',
    },
    {
      q: 'L’année 622 appartient à quel siècle ?',
      a: 'au VIIe siècle',
      wrong: [
        { label: 'au VIe siècle', why: 'Le VIe siècle va de 501 à 600.' },
        { label: 'au XVIIe siècle', why: 'Le XVIIe siècle va de 1601 à 1700.' },
        { label: 'au VIIIe siècle', why: 'Le VIIIe siècle ne commence qu’en 701.' },
      ],
      gap: ['L’année 622 appartient au ', ' siècle.', siecle('VII', 7)],
      ...PREUVES.siecle,
      explain: 'Un siècle dure cent ans : le VIIe va de 601 à 700, il contient 622.',
    },
    {
      q: 'Dans l’Occident féodal (XIe-XVe siècles), quels siècles sont marqués par les crises ?',
      a: 'les deux derniers de la période',
      wrong: [
        { label: 'les trois premiers de la période', why: 'Les premiers siècles sont ceux de la forte croissance.' },
        { label: 'aucun siècle', why: 'La ressource d’Éduscol signale bien des crises.' },
        { label: 'seulement le XIe siècle', why: 'Le XIe siècle ouvre la période de croissance.' },
      ],
      gap: [
        'Dans l’Occident féodal, après trois siècles de croissance, les deux derniers siècles sont marqués par des ',
        '.',
        ['crises', 'crise'],
      ],
      ...PREUVES.ruptureCrises,
      explain: 'La rupture sépare la croissance (XIe-début XIVe siècle) et le temps des crises (XIVe-XVe siècles).',
    },
  ],
  paires3: [
    ['VIe-XIIIe siècles', 'Chrétientés et islam'],
    ['XIe-XVe siècles', 'L’Occident féodal'],
    ['XVIe-XVIIe siècles', 'Les transformations de l’Europe'],
  ],
  paires5: [
    ['622', 'VIIe siècle'],
    ['800', 'VIIIe siècle'],
    ['987', 'Xe siècle'],
    ['1214', 'XIIIe siècle'],
    ['1517', 'XVIe siècle'],
  ],
  frise: [
    { label: 'Le début du règne de Justinien', date: '527', ...T1.justinien },
    { label: 'Le traité de Verdun', date: '843', ...T1.verdun },
    { label: 'La prise de Bagdad par les Mongols', date: '1258', ...T1.bagdad },
    { label: 'Le début de la guerre de Cent Ans', date: '1337', ...T2.centAns },
    { label: 'Le traité de Tordesillas', date: '1494', ...T3.tordesillas },
    { label: 'La révocation de l’Édit de Nantes', date: '1685', ...T3.revocation },
  ],
  libres: [
    {
      q: 'À quel siècle appartient l’année 800 ? (chiffres romains)',
      accepted: siecle('VIII', 8),
      traps: [
        { text: 'IXe', why: 'Le IXe siècle commence en 801 : 800 est la dernière année du VIIIe.' },
        { text: 'VIIe', why: 'Le VIIe siècle s’arrête en 700.' },
      ],
      ...PREUVES.bornes,
      explain: 'Un siècle finit par une année en 00 : 800 est la dernière année du VIIIe siècle.',
    },
    {
      q: 'À quel siècle appartient l’année 1453 ? (chiffres romains)',
      accepted: siecle('XV', 15),
      traps: [
        { text: 'XIVe', why: 'Le XIVe siècle va de 1301 à 1400.' },
        { text: 'XVIe', why: 'Le XVIe siècle ne commence qu’en 1501.' },
      ],
      ...PREUVES.siecle,
      explain: '1453 se place entre 1401 et 1500 : c’est le XVe siècle.',
    },
    {
      q: 'La guerre de Cent Ans va de 1337 à 1453 : combien d’années dure-t-elle ?',
      accepted: ['116', '116 ans', '116 années'],
      traps: [
        { text: '100', why: '« Cent Ans » est un nom : calcule 1453 − 1337.' },
        { text: '126', why: 'Refais la soustraction : 1453 − 1337.' },
      ],
      ...T2.centAns,
      explain: '1453 − 1337 = 116 : la guerre dure 116 ans.',
    },
    {
      q: 'Le thème 1 (VIe-XIIIe siècles) et le thème 2 (XIe-XVe siècles) ont des siècles en commun, à partir du XIe. Quel est le dernier siècle commun ? (chiffres romains)',
      accepted: siecle('XIII', 13),
      traps: [
        { text: 'XVe', why: 'Le XVe siècle appartient au thème 2 seul : le thème 1 s’arrête plus tôt.' },
        { text: 'VIe', why: 'Le VIe siècle ouvre le thème 1, avant le début du thème 2.' },
      ],
      ...T1.periode,
      explain: 'Le thème 1 s’arrête au XIIIe siècle : les deux thèmes ont en commun les XIe, XIIe et XIIIe siècles.',
    },
    {
      q: 'Combien d’années séparent la prise de Constantinople (1453) de la découverte de l’Amérique (1492) ?',
      accepted: ['39', '39 ans', '39 années'],
      traps: [
        { text: '49', why: 'Refais la soustraction : 1492 − 1453.' },
        { text: '45', why: 'Calcule année par année : de 1453 à 1492.' },
      ],
      ...T3.amerique,
      explain: '1492 − 1453 = 39 ans.',
    },
  ],
  docs: [
    {
      title: 'La frise de la classe',
      lines: [
        'La classe trace une frise avec trois bandes, nommées A, B et C.',
        'Bande A : du VIe au XIIIe siècle.',
        'Bande B : du XIe au XVe siècle.',
        'Bande C : du XVIe au XVIIe siècle.',
        'Un élève colle une étiquette « 1258 : prise de Bagdad par les Mongols ».',
      ],
      qs: [
        {
          q: 'Sur quelles bandes l’année 1258 apparaît-elle à la fois ?',
          a: 'les bandes A et B',
          wrong: [
            { label: 'la bande A seulement', why: '1258 est au XIIIe siècle, qui figure aussi sur la bande B.' },
            { label: 'les bandes B et C', why: 'La bande C commence au XVIe siècle.' },
            { label: 'la bande C seulement', why: '1258 est bien plus ancien que le XVIe siècle.' },
          ],
          ...T1.bagdad,
          explain: '1258 est au XIIIe siècle, commun aux bandes A et B.',
        },
        {
          q: 'Quelle bande se termine par le règne de Louis XIV ?',
          a: 'la bande C',
          wrong: [
            { label: 'la bande A', why: 'La bande A s’achève au XIIIe siècle.' },
            { label: 'la bande B', why: 'La bande B s’achève au XVe siècle.' },
            { label: 'aucune des trois', why: 'La bande C, XVIe-XVIIe siècles, contient ce règne.' },
          ],
          ...PREUVES.debutTheme3,
          explain: 'Le thème 3, ici la bande C, se termine avec la fin du règne de Louis XIV.',
        },
      ],
    },
    {
      title: 'Ce qui change, ce qui continue',
      lines: [
        'Du XIe siècle au début du XIVe siècle, les campagnes s’étendent et la population augmente.',
        'Ensuite viennent des crises, dont la peste noire (1347-1352).',
        'Pourtant, l’expansion de la chrétienté latine n’est pas remise en cause.',
      ],
      qs: [
        {
          q: 'Quelle rupture ce texte décrit-il ?',
          a: 'le passage de la croissance aux crises',
          wrong: [
            {
              label: 'le passage de l’Antiquité au Moyen Âge',
              why: 'Le texte commence au XIe siècle, déjà au Moyen Âge.',
            },
            { label: 'la division entre catholiques et protestants', why: 'Elle appartient au XVIe siècle.' },
            { label: 'la découverte de l’Amérique', why: 'Elle date de 1492, hors de ce texte.' },
          ],
          ...PREUVES.ruptureCrises,
          explain: 'Le texte oppose la croissance (jusqu’au début du XIVe siècle) au temps des crises.',
        },
        {
          q: 'Quel élément montre une continuité dans ce texte ?',
          a: 'l’expansion n’est pas remise en cause',
          wrong: [
            { label: 'la peste noire', why: 'La peste noire est une crise : elle marque la rupture.' },
            { label: 'la fin de la croissance démographique', why: 'C’est le changement, pas ce qui continue.' },
            { label: 'l’arrivée des crises', why: 'Les crises sont la nouveauté.' },
          ],
          ...PREUVES.ruptureCrises,
          explain: 'Une continuité est ce qui dure malgré les changements : ici, le mouvement d’expansion.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : acteurs et lieux ———

const acteurs: Notion = {
  id: 'h5-acteurs-lieux',
  title: 'Les acteurs et les lieux de 5e',
  hint: 'Associe d’abord le personnage à son thème, puis à la ville, au titre ou à l’action qui lui revient.',
  memo: [
    'Un **acteur** de l’histoire est une personne ou un groupe qui agit ; un lieu situe son action. Exemple : Charlemagne gouverne depuis son palais d’Aix.',
    'Retiens des couples : Omeyyades et Damas, Abbassides et Bagdad, Suger et Saint-Denis, Calvin et Genève.',
    'Un même lieu change d’histoire : Constantinople est la ville du **basileus**, pillée en 1204 puis prise en 1453.',
  ],
  faits: [
    {
      q: 'Quel empereur ouvre la période « Chrétientés et islam », en tentant de reconstituer l’unité de l’empire romain ?',
      a: 'Justinien',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est un roi de France du XVIIe siècle.' },
        { label: 'Soliman le Magnifique', why: 'Soliman règne sur l’empire ottoman au XVIe siècle.' },
        { label: 'Otton Ier', why: 'Otton Ier restaure la dignité impériale en 962, bien après.' },
      ],
      gap: ['La période « Chrétientés et islam » s’ouvre avec le règne de l’empereur ', '.', ['Justinien']],
      ...T1.justinien,
      explain: 'Le règne de Justinien (527-565) ouvre la période.',
    },
    {
      q: 'Depuis quelle capitale les Omeyyades dominent-ils le monde musulman jusqu’en 750 ?',
      a: 'Damas',
      wrong: [
        { label: 'Genève', why: 'Genève est la ville de Calvin, au XVIe siècle.' },
        { label: 'Aix-la-Chapelle', why: 'Aix-la-Chapelle est la ville du palais de Charlemagne.' },
        {
          label: 'Cordoue',
          why: 'Cordoue accueille un Omeyyade rescapé après 750 : ce n’est pas la capitale d’avant.',
        },
      ],
      gap: ['Jusqu’en 750, la capitale des Omeyyades est ', '.', ['Damas']],
      ...T1.omeyyades,
      explain: 'Les Omeyyades gouvernent depuis Damas jusqu’en 750.',
    },
    {
      q: 'Quelle dynastie a pour capitale Bagdad ?',
      a: 'les Abbassides',
      wrong: [
        { label: 'les Capétiens', why: 'Les Capétiens sont les rois de France.' },
        { label: 'les Valois', why: 'Les Valois sont aussi des rois de France.' },
        { label: 'les Omeyyades', why: 'La capitale des Omeyyades est Damas.' },
      ],
      gap: ['Bagdad est la capitale des ', '.', ['Abbassides', 'Abassides']],
      ...T1.capitaleAbbassides,
      explain: 'Bagdad est la capitale des Abbassides.',
    },
    {
      q: 'Dans quelle ville un Omeyyade rescapé fonde-t-il un nouvel État ?',
      a: 'Cordoue',
      wrong: [
        { label: 'Calicut', why: 'Calicut est le port indien atteint par Vasco de Gama.' },
        { label: 'Reims', why: 'Reims est la ville du sacre des rois de France.' },
        { label: 'Bagdad', why: 'Bagdad est la capitale des Abbassides, ses adversaires.' },
      ],
      gap: ['Un Omeyyade rescapé fonde un nouvel État à ', '.', ['Cordoue']],
      ...T1.cordoue,
      explain: 'C’est à Cordoue qu’un Omeyyade rescapé fonde un nouvel État.',
    },
    {
      q: 'Avec quel calife de Bagdad Charlemagne noue-t-il des relations diplomatiques ?',
      a: 'Haroun al-Rachid',
      wrong: [
        { label: 'Soliman le Magnifique', why: 'Soliman est un sultan ottoman du XVIe siècle.' },
        { label: 'Saladin', why: 'Saladin échange des lettres avec Richard Cœur de Lion, bien plus tard.' },
        { label: 'Ali', why: 'Ali est le quatrième calife, aux débuts de l’islam, avant l’époque de Charlemagne.' },
      ],
      gap: ['Charlemagne noue des relations avec le calife Haroun al-', '.', ['Rachid']],
      ...T1.haroun,
      explain: 'Charlemagne entretient des relations diplomatiques avec Haroun al-Rachid.',
    },
    {
      q: 'Quel « duc de France » devient roi en 987 ?',
      a: 'Hugues Capet',
      wrong: [
        { label: 'Louis IX', why: 'Louis IX règne au XIIIe siècle.' },
        { label: 'Charles VII', why: 'Charles VII agit pendant la guerre de Cent Ans.' },
        { label: 'Philippe le Bel', why: 'Philippe IV le Bel règne de 1285 à 1314.' },
      ],
      gap: ['Le « duc de France » devenu roi en 987 est Hugues ', '.', ['Capet']],
      ...T2.hugues,
      explain: 'Hugues Capet, duc de France, devient roi en 987.',
    },
    {
      q: 'Quel roi de France est canonisé et devient saint Louis en 1297 ?',
      a: 'Louis IX',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV règne au XVIIe siècle.' },
        { label: 'Louis VI', why: 'Louis VI est le roi conseillé par l’abbé Suger.' },
        { label: 'Philippe Auguste', why: 'Philippe Auguste (1180-1223) n’est pas saint Louis.' },
      ],
      gap: ['Le roi canonisé en 1297 est Louis ', '.', ['IX', '9']],
      ...T2.louisIX,
      explain: 'Louis IX (1226-1270) est canonisé en 1297.',
    },
    {
      q: 'Quel abbé de Saint-Denis conseille le roi Louis VI ?',
      a: 'Suger',
      wrong: [
        { label: 'Luther', why: 'Luther est un réformateur du XVIe siècle.' },
        { label: 'Calvin', why: 'Calvin enseigne à Genève au XVIe siècle.' },
        { label: 'Érasme', why: 'Érasme est un humaniste, pas un abbé conseiller d’un roi capétien.' },
      ],
      gap: ['L’abbé de Saint-Denis conseiller de Louis VI est ', '.', ['Suger']],
      ...T2.suger,
      explain: 'L’abbé Suger conseille Louis VI et construit la basilique gothique.',
    },
    {
      q: 'Quel réformateur est associé à la ville de Genève ?',
      a: 'Jean Calvin',
      wrong: [
        { label: 'Christophe Colomb', why: 'Colomb est un navigateur.' },
        { label: 'Soliman le Magnifique', why: 'Soliman est un souverain ottoman.' },
        { label: 'Martin Luther', why: 'Luther publie ses 95 thèses en 1517 ; la ville de Calvin est Genève.' },
      ],
      gap: ['À Genève, le réformateur est Jean ', '.', ['Calvin']],
      ...T3.calvin,
      explain: 'Jean Calvin est le réformateur de Genève.',
    },
    {
      q: 'Quel souverain porte son empire ottoman à son apogée au XVIe siècle ?',
      a: 'Soliman le Magnifique',
      wrong: [
        { label: 'Justinien', why: 'Justinien est un empereur du VIe siècle.' },
        { label: 'François Ier', why: 'François Ier est un roi de France, allié de ce souverain.' },
        { label: 'Charles Quint', why: 'Charles Quint, son rival, est à la tête du Saint-Empire.' },
      ],
      gap: ['L’empire ottoman est à son apogée sous ', ' le Magnifique.', ['Soliman']],
      ...T3.soliman,
      explain: 'L’empire ottoman atteint son apogée sous Soliman le Magnifique.',
    },
    {
      q: 'En 1498, près de quel port la flotte de Vasco de Gama touche-t-elle la côte indienne ?',
      a: 'Calicut',
      wrong: [
        { label: 'Istanbul', why: 'Istanbul est la capitale ottomane, pas un port des Indes.' },
        { label: 'Cordoue', why: 'Cordoue est une ville d’Espagne.' },
        { label: 'Genève', why: 'Genève est la ville de Calvin, en Europe.' },
      ],
      gap: ['Vasco de Gama touche la côte indienne près de ', ' en 1498.', ['Calicut']],
      ...T3.gama,
      explain: 'En 1498, la flotte de Vasco de Gama touche la côte indienne près de Calicut.',
    },
  ],
  paires3: [
    ['Justinien', 'Empereur du VIe siècle qui ouvre la période « Chrétientés et islam »'],
    ['Hugues Capet', 'Roi de France sacré en 987'],
    ['Soliman le Magnifique', 'Souverain de l’empire ottoman'],
  ],
  paires5: [
    ['Damas', 'Capitale des Omeyyades'],
    ['Bagdad', 'Capitale des Abbassides'],
    ['Saint-Denis', 'Abbaye de Suger, nécropole des rois de France'],
    ['Genève', 'Ville de Jean Calvin'],
    ['Aix-la-Chapelle', 'Palais de Charlemagne'],
  ],
  frise: [
    { label: 'Justinien', date: 'début de règne en 527', ...T1.justinien },
    { label: 'Charlemagne', date: 'couronné en 800', ...T1.couronnement },
    { label: 'Hugues Capet', date: 'roi en 987', ...T2.hugues },
    { label: 'Philippe Auguste', date: 'règne à partir de 1180', ...T2.philippeAuguste },
    { label: 'Louis IX', date: 'règne à partir de 1226', ...T2.louisIX },
    { label: 'Luther', date: '95 thèses en 1517', ...T3.theses },
  ],
  libres: [
    {
      q: 'Quel empereur est associé au palais d’Aix ?',
      accepted: ['Charlemagne'],
      traps: [
        { text: 'Justinien', why: 'Justinien est un empereur d’Orient, antérieur à Charlemagne.' },
        { text: 'Charles Quint', why: 'Charles Quint vit au XVIe siècle.' },
      ],
      ...T1.aix,
      explain: 'Le palais d’Aix est celui de Charlemagne.',
    },
    {
      q: 'Quelle ville est la capitale des Omeyyades jusqu’en 750 ?',
      accepted: ['Damas'],
      traps: [
        { text: 'Bagdad', why: 'Bagdad est la capitale des Abbassides.' },
        { text: 'Cordoue', why: 'Cordoue accueille un État omeyyade fondé après la chute de la dynastie à Damas.' },
      ],
      ...T1.omeyyades,
      explain: 'La capitale des Omeyyades est Damas.',
    },
    {
      q: 'Quel roi de France est associé à la bataille de Bouvines (1214) ?',
      accepted: ['Philippe Auguste', 'Philippe-Auguste', 'Philippe II', 'Philippe II Auguste'],
      traps: [
        { text: 'Philippe le Bel', why: 'Philippe le Bel règne de 1285 à 1314, après Bouvines.' },
        { text: 'Louis IX', why: 'Louis IX devient roi en 1226, après la bataille.' },
      ],
      ...PREUVES.philippeBouvines,
      explain: 'La figure de Philippe Auguste est liée à la bataille de Bouvines.',
    },
    {
      q: 'Quel navigateur Isabelle de Castille et Ferdinand d’Aragon soutiennent-ils ?',
      accepted: ['Christophe Colomb', 'Colomb'],
      traps: [
        { text: 'Magellan', why: 'Le retour d’un navire de Magellan date de 1522 et achève les Grandes Découvertes.' },
        { text: 'Vasco de Gama', why: 'Vasco de Gama gagne l’Inde par la mer en 1498.' },
      ],
      ...T3.colomb,
      explain: 'Isabelle et Ferdinand soutiennent le projet de Christophe Colomb.',
    },
    {
      q: 'Quel artiste et savant passe ses dernières années auprès de François Ier ?',
      accepted: ['Léonard de Vinci', 'Leonard de Vinci', 'De Vinci', 'Vinci', 'Léonard'],
      traps: [
        { text: 'Érasme', why: 'Érasme est un humaniste, il n’est pas présenté près de François Ier.' },
        { text: 'Luther', why: 'Luther est un réformateur religieux.' },
      ],
      ...T3.vinci,
      explain: 'Léonard de Vinci passe ses dernières années auprès de François Ier.',
    },
  ],
  docs: [
    {
      title: 'Un récit de la première croisade',
      lines: [
        'Dans son palais, l’empereur byzantin reçoit les principaux chefs francs de la première croisade.',
        'Sa fille décrit ces visiteurs dans un livre appelé l’Alexiade.',
      ],
      qs: [
        {
          q: 'Quel empereur reçoit les chefs francs dans ce récit ?',
          a: 'Alexis Comnène',
          wrong: [
            { label: 'Justinien', why: 'Justinien règne au VIe siècle, bien avant la première croisade.' },
            { label: 'Charlemagne', why: 'Charlemagne règne vers 800, en Occident.' },
            { label: 'Soliman le Magnifique', why: 'Soliman est un souverain ottoman du XVIe siècle.' },
          ],
          ...T1.alexiade,
          explain: 'Alexis Comnène voit défiler les chefs francs, décrits par sa fille Anne dans l’Alexiade.',
        },
        {
          q: 'Dans quelle ville la scène se passe-t-elle ?',
          a: 'Constantinople',
          wrong: [
            { label: 'Damas', why: 'Damas est l’ancienne capitale des Omeyyades.' },
            { label: 'Cordoue', why: 'Cordoue est en Espagne.' },
            { label: 'Aix-la-Chapelle', why: 'C’est le palais de Charlemagne.' },
          ],
          ...T1.alexiade,
          explain: 'Alexis Comnène, empereur byzantin, reçoit les chefs francs dans son palais de Constantinople.',
        },
      ],
    },
    {
      title: 'Une grande abbaye',
      lines: [
        'Un abbé, conseiller du roi Louis VI, fait bâtir une grande église gothique.',
        'C’est là que sont enterrés les rois de France.',
        'L’abbaye contrôle aussi une foire qui lui rapporte de l’argent.',
      ],
      qs: [
        {
          q: 'De quel lieu s’agit-il ?',
          a: 'l’abbaye de Saint-Denis',
          wrong: [
            {
              label: 'le palais d’Aix-la-Chapelle',
              why: 'Aix est le palais de Charlemagne, pas la nécropole des rois de France.',
            },
            { label: 'la Grande mosquée de Damas', why: 'C’est un lieu de culte musulman à Damas.' },
            { label: 'la ville de Genève', why: 'Genève est la ville de Calvin.' },
          ],
          ...T2.necropole,
          explain: 'La basilique de Saint-Denis est la nécropole des rois de France.',
        },
        {
          q: 'Quel est l’abbé décrit ?',
          a: 'Suger',
          wrong: [
            { label: 'Calvin', why: 'Calvin est un réformateur du XVIe siècle.' },
            { label: 'Érasme', why: 'Érasme est un humaniste.' },
            { label: 'Luther', why: 'Luther critique l’Église au XVIe siècle.' },
          ],
          ...T2.suger,
          explain: 'Suger, abbé de Saint-Denis, conseille Louis VI.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : le vocabulaire historique ———

const vocabulaire: Notion = {
  id: 'h5-vocabulaire-historique',
  title: 'Le vocabulaire historique de 5e',
  hint: 'Cherche si le mot désigne une personne, un pouvoir, un texte ou une idée.',
  memo: [
    'Un mot d’histoire précis vaut une longue explication : un **empire** réunit des peuples et des territoires divers sous un pouvoir central.',
    'Classe les mots par thème : **calife** et **basileus** (empires), **seigneurie** et **commune** (Occident féodal), **humanisme** et **indulgences** (temps modernes).',
    'Mini-exemple : une **charte de franchises** fixe les droits et les obligations face au seigneur.',
  ],
  faits: [
    {
      q: 'Quel mot désigne un pouvoir central exercé sur des peuples et des territoires divers ?',
      a: 'un empire',
      wrong: [
        { label: 'une paroisse', why: 'La paroisse est le cadre de vie religieux d’un village.' },
        { label: 'une corporation', why: 'La corporation réunit les gens d’un même métier.' },
        { label: 'une seigneurie', why: 'La seigneurie est le domaine d’un seigneur, à échelle locale.' },
      ],
      gap: ['Un pouvoir central qui s’exerce sur des peuples et des territoires divers s’appelle un ', '.', ['empire']],
      ...PREUVES.empire,
      explain: 'C’est la définition d’un empire.',
    },
    {
      q: 'Quel titre signifie « successeur » et désigne celui qui se réclame de l’héritage de Muhammad ?',
      a: 'le calife',
      wrong: [
        { label: 'le basileus', why: 'Le basileus est l’empereur byzantin.' },
        { label: 'le pape', why: 'Le pape dirige l’Église d’Occident.' },
        { label: 'le patriarche', why: 'Le patriarche de Constantinople est un chef religieux chrétien.' },
      ],
      gap: ['Le « successeur » qui se réclame de l’héritage de Muhammad est le ', '.', ['calife', 'khalife']],
      ...T1.calife,
      explain: 'Calife veut dire « successeur ».',
    },
    {
      q: 'Quel titre porte l’empereur à Constantinople ?',
      a: 'le basileus',
      wrong: [
        { label: 'le calife', why: 'Le calife est un chef du monde musulman.' },
        { label: 'le légiste', why: 'Le légiste est un juriste au service du roi.' },
        { label: 'le vilain', why: 'Le vilain est un paysan.' },
      ],
      gap: ['À Constantinople, l’empereur porte le titre de ', '.', ['basileus', 'basiléus']],
      ...T1.basileus,
      explain: 'Le titre d’Auguste devient à Constantinople celui de basileus.',
    },
    {
      q: 'Quel mot désigne tous les paysans du territoire d’une seigneurie ?',
      a: 'les vilains',
      wrong: [
        { label: 'les légistes', why: 'Les légistes sont des juristes.' },
        { label: 'les conquistadors', why: 'Les conquistadors conquièrent l’Amérique au XVIe siècle.' },
        { label: 'les bourgeois', why: 'La bourgeoisie commerçante s’affirme dans les villes.' },
      ],
      gap: ['Les paysans du territoire d’une seigneurie sont les ', '.', ['vilains', 'vilain']],
      ...T2.vilains,
      explain: 'Les paysans du territoire de la seigneurie sont appelés « vilains ».',
    },
    {
      q: 'Quel mot désigne une terre confiée de façon héréditaire à des paysans par le seigneur ?',
      a: 'une tenure',
      wrong: [
        { label: 'une foire', why: 'Une foire est un grand rassemblement de commerce.' },
        { label: 'une nécropole', why: 'Une nécropole est un lieu de sépultures.' },
        { label: 'un domaine royal', why: 'Le domaine royal est gouverné directement par le roi.' },
      ],
      gap: ['La terre confiée en héritage aux paysans par le seigneur est une ', '.', ['tenure']],
      ...T2.tenures,
      explain: 'Les terres confiées en héritage aux paysans sont des tenures.',
    },
    {
      q: 'Quel texte fixe les droits et les obligations des paysans face au seigneur ?',
      a: 'une charte de franchises',
      wrong: [
        { label: 'une indulgence', why: 'L’indulgence concerne le salut de l’âme, dans l’Église.' },
        { label: 'une excommunication', why: 'C’est l’exclusion d’un fidèle de l’Église.' },
        { label: 'une jacquerie', why: 'La jacquerie est une révolte paysanne.' },
      ],
      gap: [
        'Le texte qui fixe les droits et obligations face au seigneur est une charte de ',
        '.',
        ['franchises', 'franchise'],
      ],
      ...T2.chartesPaysans,
      explain: 'La charte de franchises fixe droits et obligations.',
    },
    {
      q: 'Comment appelle-t-on une ville qui s’administre elle-même au Moyen Âge ?',
      a: 'une commune',
      wrong: [
        { label: 'une paroisse', why: 'La paroisse est une unité religieuse.' },
        { label: 'une tenure', why: 'La tenure est une terre confiée à un paysan.' },
        { label: 'un comptoir', why: 'Un comptoir est un établissement de commerce.' },
      ],
      gap: ['Une ville qui s’administre elle-même est une ', '.', ['commune']],
      ...T2.commune,
      explain: 'La ville qui s’administre elle-même est une commune.',
    },
    {
      q: 'Quel mot désigne les juristes qui entourent Philippe le Bel ?',
      a: 'les légistes',
      wrong: [
        { label: 'les vilains', why: 'Les vilains sont des paysans.' },
        { label: 'les humanistes', why: 'Les humanistes sont des savants du XIVe au XVIe siècle.' },
        { label: 'les chevaliers', why: 'Les chevaliers sont des guerriers.' },
      ],
      gap: ['Les juristes qui entourent Philippe le Bel sont les ', '.', ['légistes', 'legistes', 'légiste']],
      ...T2.legistes,
      explain: 'Les légistes sont des juristes au service du roi.',
    },
    {
      q: 'Comment appelle-t-on ce que certains achètent pour le salut de leur âme et que Luther condamne ?',
      a: 'les indulgences',
      wrong: [
        { label: 'les banalités', why: 'Les banalités sont des obligations envers le seigneur.' },
        { label: 'les tenures', why: 'Les tenures sont des terres.' },
        { label: 'les franchises', why: 'Les franchises sont des libertés écrites dans une charte.' },
      ],
      gap: ['Luther condamne l’achat du salut grâce aux ', '.', ['indulgences', 'indulgence']],
      ...T3.indulgences,
      explain: 'Luther condamne les indulgences.',
    },
    {
      q: 'Quel mouvement aspire à un renouveau de l’Antiquité par l’étude des textes anciens ?',
      a: 'l’humanisme',
      wrong: [
        { label: 'la féodalité', why: 'La féodalité est une organisation de la société médiévale.' },
        { label: 'le servage', why: 'Le servage est une condition paysanne.' },
        { label: 'l’absolutisme', why: 'L’absolutisme est une idée sur le pouvoir du roi.' },
      ],
      gap: ['Le renouveau de l’Antiquité par l’étude des textes s’appelle l’', '.', ['humanisme']],
      ...T3.humanisme,
      explain: 'L’humanisme veut faire renaître l’Antiquité par l’étude des textes.',
    },
  ],
  paires3: [
    ['Calife', 'Le « successeur » qui se réclame de Muhammad'],
    ['Commune', 'Ville qui s’administre elle-même'],
    ['Humanisme', 'Renouveau de l’Antiquité par l’étude des textes'],
  ],
  paires5: [
    ['Basileus', 'Titre de l’empereur à Constantinople'],
    ['Tenure', 'Terre confiée en héritage à des paysans'],
    ['Légiste', 'Juriste au service du roi'],
    ['Indulgence', 'Ce que certains achètent pour le salut de leur âme, condamné par Luther'],
    ['Hégire', 'Événement de 622 qui ouvre l’ère musulmane'],
  ],
  libres: [
    {
      q: 'Quel mot désigne l’événement de 622 qui marque le début de l’ère musulmane ?',
      accepted: [...mot('hégire', 'l’', "l'"), ...mot('hegire', 'l’', "l'")],
      traps: [
        { text: 'califat', why: 'Le califat est la fonction du calife, pas le début de l’ère.' },
        { text: 'excommunication', why: 'C’est une exclusion de l’Église, en 1054 par exemple.' },
      ],
      ...T1.hegire,
      explain: 'L’Hégire marque le début de l’ère musulmane.',
    },
    {
      q: 'Comment appelle-t-on les terres que le roi capétien possède et gouverne lui-même ? (deux mots)',
      accepted: [...mot('domaine royal', 'le ', 'un ')],
      traps: [
        { text: 'royaume', why: 'Le royaume est plus vaste : de grands princes y gouvernent leurs propres terres.' },
        { text: 'empire', why: 'Hugues Capet est roi, pas empereur.' },
      ],
      ...T2.hugues,
      explain: 'Les terres du roi forment le domaine royal.',
    },
    {
      q: 'Quel mot désigne les paysans d’une seigneurie, qu’ils soient serfs ou non ?',
      accepted: [...mot('vilains', 'les '), 'vilain', 'un vilain'],
      traps: [
        { text: 'serfs', why: 'Le servage est minoritaire : tous les paysans de la seigneurie ne sont pas des serfs.' },
        { text: 'vassaux', why: 'Les vassaux sont des guerriers liés à un seigneur plus puissant, pas des paysans.' },
      ],
      ...T2.vilains,
      explain: 'Les paysans de la seigneurie sont appelés vilains.',
    },
    {
      q: 'Quel mot en « -isme » désigne le mouvement des savants qui étudient les textes anciens pour faire renaître l’Antiquité ?',
      accepted: mot('humanisme', 'l’', "l'", 'le '),
      traps: [
        { text: 'christianisme', why: 'Le christianisme est une religion.' },
        {
          text: 'Renaissance',
          why: 'La Renaissance est le nom de la période ; le mouvement des savants finit en « -isme ».',
        },
        { text: 'protestantisme', why: 'C’est un courant religieux né de la Réforme.' },
      ],
      ...T3.humanisme,
      explain: 'L’humanisme veut un renouveau de l’Antiquité.',
    },
    {
      q: 'Quel titre signifie « successeur » dans le monde musulman ?',
      accepted: [...mot('calife', 'le ', 'un '), ...mot('khalife', 'le ')],
      traps: [
        { text: 'imam', why: 'Pour les chiites, Ali est le premier imam ; « successeur » désigne un autre titre.' },
        { text: 'basileus', why: 'Le basileus est l’empereur byzantin.' },
      ],
      ...T1.calife,
      explain: 'Le calife est le « successeur ».',
    },
  ],
  docs: [
    {
      title: 'Une ville négocie',
      lines: [
        'Les habitants d’une ville obtiennent de leur seigneur un texte qui fixe leurs libertés.',
        'La ville s’administre désormais elle-même.',
        'Des marchands y prennent une place importante.',
      ],
      qs: [
        {
          q: 'Quel mot désigne cette ville qui s’administre elle-même ?',
          a: 'une commune',
          wrong: [
            { label: 'un empire', why: 'Un empire réunit des peuples et des territoires divers.' },
            { label: 'une tenure', why: 'Une tenure est une terre paysanne.' },
            { label: 'une paroisse', why: 'La paroisse est une unité religieuse.' },
          ],
          ...T2.commune,
          explain: 'Une ville qui s’administre elle-même est une commune.',
        },
        {
          q: 'Comment appelle-t-on le texte qui fixe les libertés ?',
          a: 'une charte de franchises',
          wrong: [
            { label: 'une indulgence', why: 'L’indulgence concerne le salut de l’âme.' },
            { label: 'une jacquerie', why: 'La jacquerie est une révolte.' },
            { label: 'une nécropole', why: 'La nécropole est un lieu de sépultures.' },
          ],
          ...T2.chartesVilles,
          explain: 'Les villes négocient avec le seigneur des chartes de franchises.',
        },
      ],
    },
    {
      title: 'Les mots de l’historien',
      lines: [
        'En 1469, un évêque humaniste emploie pour la première fois un nom pour désigner une époque.',
        'Au XVIIe siècle, ce nom se répand : il oppose cette époque à celle d’avant, l’Antiquité, et à celle d’après, la Renaissance.',
      ],
      qs: [
        {
          q: 'Quel est ce nom ?',
          a: 'le « Moyen Âge »',
          wrong: [
            { label: 'la « préhistoire »', why: 'La préhistoire précède l’Antiquité.' },
            { label: 'les « Temps modernes »', why: 'Les Temps modernes viennent après le Moyen Âge.' },
            { label: 'l’« Antiquité »', why: 'Le texte dit que ce nom s’oppose à l’Antiquité.' },
          ],
          ...PREUVES.moyenAge,
          explain: 'Bussi emploie pour la première fois en 1469 le terme de « Moyen Âge ».',
        },
        {
          q: 'Entre quelles périodes l’époque désignée par ce nom se place-t-elle ?',
          a: 'entre l’Antiquité et la Renaissance',
          wrong: [
            {
              label: 'entre la préhistoire et l’Antiquité',
              why: 'L’Antiquité vient avant cette époque, pas après.',
            },
            {
              label: 'après la Renaissance',
              why: 'La Renaissance est la période d’après, selon le texte.',
            },
            { label: 'avant l’Antiquité', why: 'L’Antiquité est la période d’avant, selon le texte.' },
          ],
          ...PREUVES.opposition,
          explain: 'Le « Moyen Âge » s’oppose en amont à l’Antiquité et en aval à la Renaissance.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [reperes, frise, acteurs, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'cinquième'));
