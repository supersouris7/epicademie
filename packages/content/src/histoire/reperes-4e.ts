import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES } from './reperes-4e-sources.ts';

/**
 * 4e, « Repères de 4e » (lot hi-4e-04) : compétences « Se repérer dans le temps » et lexique spécifique du programme du
 * cycle 4, appliquées aux trois thèmes d'histoire de 4e. Les repères chronologiques sont ceux des rubriques
 * « Principaux repères chronologiques à construire » des ressources Éduscol. Les textes à lire du niveau 5 sont écrits
 * pour l'exercice.
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
  id: 'h4-reperes-chronologiques',
  title: 'Les repères chronologiques de 4e',
  hint: 'Demande-toi d’abord à quel thème appartient le fait : le XVIIIe siècle, l’Europe et le monde au XIXe siècle ou la France du XIXe siècle.',
  memo: [
    'Un **repère** est un fait daté qu’on retient pour situer les autres. XVIIIe siècle : essor de la traite (années 1670-années 1750), Encyclopédie (1751-1772), Révolution (1789), Napoléon au pouvoir (1799-1814/1815).',
    'Europe et monde : **révolution industrielle** en Angleterre (dernier tiers du XVIIIe siècle), « **Printemps des peuples** » (1848), exposition universelle de Paris (1900). France : suffrage universel masculin (1848), Troisième République (1870), école (1882), affaire Dreyfus (1894-1906), Séparation (1905).',
    'Astuce de coach : accroche chaque date à un acteur ou à un lieu (1882, Jules Ferry). Une même année peut porter plusieurs faits : en 1848, la France adopte le suffrage universel et abolit l’esclavage dans ses colonies.',
  ],
  faits: [
    {
      q: 'Quel repère du XVIIIe siècle s’étend de 1751 à 1772 ?',
      a: 'la parution de l’Encyclopédie',
      wrong: [
        { label: 'l’affaire Dreyfus', why: 'L’affaire Dreyfus va de 1894 à 1906, à la fin du XIXe siècle.' },
        {
          label: 'le pouvoir de Napoléon Bonaparte',
          why: 'Napoléon Bonaparte est au pouvoir à partir de 1799, bien après.',
        },
        { label: 'l’essor de la traite', why: 'L’essor de la traite est daté des années 1670 aux années 1750.' },
      ],
      gap: ['De 1751 à 1772 se déroule la parution de l’', '.', ['Encyclopédie']],
      ...PREUVES.parution,
      explain: 'L’Encyclopédie paraît de 1751 à 1772.',
    },
    {
      q: 'Quel événement débute en 1789 ?',
      a: 'la Révolution française',
      wrong: [
        { label: 'la Troisième République', why: 'La Troisième République est proclamée en 1870.' },
        { label: 'l’affaire Dreyfus', why: 'L’affaire Dreyfus commence en 1894.' },
        {
          label: 'la seconde révolution industrielle',
          why: 'La seconde révolution industrielle commence dans les années 1870.',
        },
      ],
      gap: ['En 1789 commence la ', ' française.', ['Révolution']],
      ...PREUVES.debutRevolution,
      explain: '1789 est le repère du début de la Révolution française.',
    },
    {
      q: 'Quel personnage est au pouvoir de 1799 à 1814/1815 ?',
      a: 'Napoléon Bonaparte',
      wrong: [
        { label: 'Jules Ferry', why: 'Jules Ferry agit sous la Troisième République, vers 1882.' },
        { label: 'Louis XIV', why: 'Louis XIV règne de 1661 à 1715, bien avant.' },
        { label: 'Victor Schoelcher', why: 'Schoelcher est l’homme de l’abolition de 1848, pas un chef d’État.' },
      ],
      gap: ['De 1799 à 1814/1815, ', ' Bonaparte est au pouvoir.', ['Napoléon']],
      ...PREUVES.napoleon,
      explain: 'Le repère de 4e : Napoléon Bonaparte au pouvoir de 1799 à 1814/1815.',
    },
    {
      q: 'Quel repère de 4e est daté des années 1670 aux années 1750 ?',
      a: 'l’essor de la traite',
      wrong: [
        { label: 'l’affaire Dreyfus', why: 'L’affaire Dreyfus va de 1894 à 1906.' },
        { label: 'la « seconde mondialisation »', why: 'La seconde mondialisation est datée de 1870 à 1914.' },
        { label: 'la parution de l’Encyclopédie', why: 'L’Encyclopédie paraît de 1751 à 1772.' },
      ],
      gap: ['Des années 1670 aux années 1750 se produit l’essor de la ', '.', ['traite']],
      ...PREUVES.essorTraite,
      explain: 'Des années 1670 aux années 1750 : c’est l’essor de la traite.',
    },
    {
      q: 'Quand la traite atteint-elle son apogée, d’après les repères de 4e ?',
      a: 'à la fin du XVIIIe siècle',
      wrong: [
        { label: 'au début du XXe siècle', why: 'Au XXe siècle, la traite atlantique a disparu.' },
        { label: 'au Moyen Âge', why: 'Le repère concerne le XVIIIe siècle, après le Moyen Âge.' },
        { label: 'dans les années 1670', why: 'Les années 1670 marquent le début de l’essor, pas l’apogée.' },
      ],
      gap: ['L’apogée de la traite se situe à la fin du ', ' siècle.', siecle('XVIII', 18)],
      ...PREUVES.apogeeTraite,
      explain: 'L’apogée de la traite est situé à la fin du XVIIIe siècle.',
    },
    {
      q: 'Où et quand la révolution industrielle débute-t-elle ?',
      a: 'en Angleterre, au dernier tiers du XVIIIe siècle',
      wrong: [
        { label: 'en France, en 1900', why: '1900 est l’année de l’exposition universelle de Paris.' },
        {
          label: 'en Allemagne, au XXe siècle',
          why: 'L’Allemagne s’industrialise dès le milieu du XIXe siècle, après l’Angleterre.',
        },
        {
          label: 'en Angleterre, dans les années 1870',
          why: 'Les années 1870 ouvrent la seconde révolution industrielle, plus tard.',
        },
      ],
      gap: [
        'La révolution industrielle débute au dernier tiers du XVIIIe siècle en ',
        '.',
        ['Angleterre', 'Grande-Bretagne'],
      ],
      ...PREUVES.debutsIndustrie,
      explain: 'La révolution industrielle débute en Angleterre au dernier tiers du XVIIIe siècle.',
    },
    {
      q: 'Quel nom porte le repère de 1848 en Europe ?',
      a: 'le « Printemps des peuples »',
      wrong: [
        { label: 'la « seconde mondialisation »', why: 'La seconde mondialisation est datée de 1870 à 1914.' },
        { label: 'les « Trois Glorieuses »', why: 'Les Trois Glorieuses datent de juillet 1830.' },
        { label: 'la « Belle Époque »', why: 'La Belle Époque est bien plus tardive que 1848.' },
      ],
      gap: ['En 1848 se produit le « Printemps des ', ' » en Europe.', ['peuples']],
      ...PREUVES.printemps,
      explain: '1848 est le repère du « Printemps des peuples ».',
    },
    {
      q: 'Quand la seconde révolution industrielle commence-t-elle ?',
      a: 'dans les années 1870',
      wrong: [
        { label: 'dans les années 1750', why: 'Les années 1750 closent l’essor de la traite, un siècle plus tôt.' },
        { label: 'en 1789', why: '1789 est le début de la Révolution française, un fait politique.' },
        { label: 'dans les années 1820', why: 'Les années 1820 sont l’époque de la première industrialisation.' },
      ],
      gap: ['La seconde révolution industrielle commence dans les années ', '.', ['1870']],
      ...PREUVES.secondeRevolution,
      explain: 'La seconde révolution industrielle débute dans les années 1870.',
    },
    {
      q: 'Quelles dates encadrent la « seconde mondialisation » et la relance de la colonisation ?',
      a: '1870-1914',
      wrong: [
        { label: '1751-1772', why: '1751-1772 est la parution de l’Encyclopédie.' },
        { label: '1799-1815', why: '1799-1815 correspond au pouvoir de Napoléon Bonaparte.' },
        { label: '1894-1906', why: '1894-1906 est l’affaire Dreyfus.' },
      ],
      gap: ['La seconde mondialisation et la relance de la colonisation vont de 1870 à ', '.', ['1914']],
      ...PREUVES.mondialisation,
      explain: 'Éduscol date de 1870 à 1914 la seconde mondialisation et la relance de la colonisation.',
    },
    {
      q: 'Quel droit est adopté en France en 1848 ?',
      a: 'le suffrage universel masculin',
      wrong: [
        { label: 'le droit de vote des femmes', why: 'Les femmes restent exclues du vote au XIXe siècle.' },
        { label: 'la séparation des Églises et de l’État', why: 'La séparation date de 1905.' },
        { label: 'l’école gratuite et obligatoire', why: 'Le repère de l’école de Jules Ferry est 1882.' },
      ],
      gap: ['En 1848, la France adopte le suffrage ', ' (pour les hommes).', ['universel']],
      ...PREUVES.suffrage,
      explain: '1848 : adoption du suffrage universel, réservé aux hommes.',
    },
    {
      q: 'Quel régime est proclamé en 1870 ?',
      a: 'la Troisième République',
      wrong: [
        { label: 'le Second Empire', why: 'Le Second Empire est proclamé en 1852 et s’effondre en 1870.' },
        { label: 'la Première République', why: 'La Première République date de 1792.' },
        { label: 'la monarchie de Juillet', why: 'La monarchie de Juillet commence en 1830.' },
      ],
      gap: ['En 1870 est proclamée la Troisième ', '.', ['République']],
      ...PREUVES.proclamation,
      explain: 'La Troisième République est proclamée en 1870.',
    },
    {
      q: 'Quel repère associe-t-on à Jules Ferry en 1882 ?',
      a: 'l’école gratuite, laïque et obligatoire',
      wrong: [
        { label: 'le suffrage universel masculin', why: 'Le suffrage universel masculin date de 1848.' },
        { label: 'la séparation des Églises et de l’État', why: 'La séparation date de 1905.' },
        { label: 'la proclamation de la République', why: 'La Troisième République est proclamée en 1870.' },
      ],
      gap: ['En 1882, le repère de Jules Ferry est l’école gratuite, ', ' et obligatoire.', ['laïque', 'laique']],
      ...PREUVES.ferryEcole,
      explain: '1882 : Jules Ferry et l’école gratuite, laïque et obligatoire.',
    },
    {
      q: 'Quelle crise politique va de 1894 à 1906 ?',
      a: 'l’affaire Dreyfus',
      wrong: [
        { label: 'la Révolution française', why: 'La Révolution commence en 1789.' },
        { label: 'le « Printemps des peuples »', why: 'Il date de 1848.' },
        { label: 'la Commune de Paris', why: 'La Commune de Paris a lieu en 1871.' },
      ],
      gap: ['De 1894 à 1906 se déroule l’affaire ', '.', ['Dreyfus']],
      ...PREUVES.dreyfus,
      explain: 'L’affaire Dreyfus dure de 1894 à 1906.',
    },
  ],
  paires3: [
    ['1789', 'Début de la Révolution française'],
    ['1848', 'Suffrage universel masculin en France'],
    ['1905', 'Séparation des Églises et de l’État'],
  ],
  paires5: [
    ['1751-1772', 'Parution de l’Encyclopédie'],
    ['1799', 'Début du pouvoir de Napoléon Bonaparte'],
    ['1870', 'Proclamation de la Troisième République'],
    ['1894-1906', 'Affaire Dreyfus'],
    ['1900', 'Exposition universelle de Paris'],
  ],
  frise: [
    { label: 'Le début de la parution de l’Encyclopédie', date: '1751', ...PREUVES.parution },
    { label: 'Le début de la Révolution française', date: '1789', ...PREUVES.debutRevolution },
    { label: 'L’arrivée de Napoléon Bonaparte au pouvoir', date: '1799', ...PREUVES.napoleon },
    { label: 'L’adoption du suffrage universel en France', date: '1848', ...PREUVES.suffrage },
    { label: 'La proclamation de la Troisième République', date: '1870', ...PREUVES.proclamation },
    { label: 'La séparation des Églises et de l’État', date: '1905', ...PREUVES.separation },
  ],
  libres: [
    {
      q: 'En quelle année commence la Révolution française ?',
      accepted: annee('1789'),
      traps: [
        { text: '1799', why: '1799 est l’arrivée de Napoléon Bonaparte au pouvoir.' },
        { text: '1848', why: '1848 est le suffrage universel et le « Printemps des peuples ».' },
      ],
      ...PREUVES.debutRevolution,
      explain: 'La Révolution française débute en 1789.',
    },
    {
      q: 'En quelle année Napoléon Bonaparte arrive-t-il au pouvoir ?',
      accepted: annee('1799'),
      traps: [
        { text: '1789', why: '1789 est le début de la Révolution, dix ans plus tôt.' },
        { text: '1804', why: '1804 est l’établissement de l’Empire : Bonaparte est déjà au pouvoir depuis 1799.' },
      ],
      ...PREUVES.napoleon,
      explain: 'Napoléon Bonaparte est au pouvoir à partir de 1799.',
    },
    {
      q: 'En quelle année la Troisième République est-elle proclamée ?',
      accepted: annee('1870'),
      traps: [
        { text: '1875', why: '1875 est l’adoption des lois constitutionnelles, pas la proclamation.' },
        { text: '1848', why: '1848 est la naissance de la Deuxième République.' },
      ],
      ...PREUVES.proclamation,
      explain: 'La Troisième République est proclamée en 1870.',
    },
    {
      q: 'En quelle année les Églises et l’État sont-ils séparés ?',
      accepted: annee('1905'),
      traps: [
        { text: '1882', why: '1882 est le repère de l’école de Jules Ferry.' },
        { text: '1906', why: '1906 est la fin de l’affaire Dreyfus.' },
      ],
      ...PREUVES.separation,
      explain: 'La séparation des Églises et de l’État date de 1905.',
    },
    {
      q: 'En quelle année se tient l’exposition universelle de Paris retenue comme repère ?',
      accepted: annee('1900'),
      traps: [
        { text: '1889', why: 'Le repère de 4e est l’exposition de 1900, au tournant du siècle.' },
        { text: '1914', why: '1914 ferme la période de la seconde mondialisation.' },
      ],
      ...PREUVES.exposition,
      explain: 'L’exposition universelle de Paris, repère de 4e, se tient en 1900.',
    },
    {
      q: 'En quelle année débute l’affaire Dreyfus ?',
      accepted: annee('1894'),
      traps: [
        { text: '1906', why: '1906 est la fin de l’affaire.' },
        { text: '1898', why: '1898 est l’année de « J’accuse… ! » de Zola : l’affaire a déjà commencé.' },
      ],
      ...PREUVES.dreyfus,
      explain: 'L’affaire Dreyfus commence en 1894.',
    },
  ],
  docs: [
    {
      title: 'Les dates d’un cahier',
      lines: [
        'Un élève recopie trois faits sans leurs dates.',
        'Fait A : « des hommes de lettres et de sciences font paraître une grande Encyclopédie ».',
        'Fait B : « la France adopte le suffrage universel et abolit l’esclavage dans ses colonies ».',
        'Fait C : « un capitaine est condamné, puis la crise divise le pays ».',
      ],
      qs: [
        {
          q: 'Quelle date faut-il écrire à côté du fait B ?',
          a: '1848',
          wrong: [
            { label: '1789', why: '1789 est le début de la Révolution, avant le fait B.' },
            { label: '1870', why: '1870 est la proclamation de la Troisième République.' },
            { label: '1905', why: '1905 est la séparation des Églises et de l’État.' },
          ],
          ...PREUVES.suffrage,
          explain: 'Le suffrage universel et la seconde abolition de l’esclavage datent de 1848.',
        },
        {
          q: 'Quel est l’ordre des trois faits, du plus ancien au plus récent ?',
          a: 'A, B, C',
          wrong: [
            { label: 'B, A, C', why: 'L’Encyclopédie (à partir de 1751) précède 1848.' },
            { label: 'A, C, B', why: 'L’affaire Dreyfus (à partir de 1894) vient après 1848.' },
            { label: 'C, B, A', why: 'C’est l’ordre inverse du temps.' },
          ],
          ...PREUVES.parution,
          explain: 'L’Encyclopédie (1751), le suffrage universel (1848), puis l’affaire Dreyfus (1894).',
        },
      ],
    },
    {
      title: 'Une exposition de fin de siècle',
      lines: [
        'Un guide raconte une promenade à Paris.',
        '« L’exposition universelle attire des foules. C’est la dernière année du XIXe siècle. »',
        'Il ajoute : « La grande crise du capitaine Dreyfus n’est pas encore terminée. »',
      ],
      qs: [
        {
          q: 'En quelle année la scène se passe-t-elle ?',
          a: '1900',
          wrong: [
            { label: '1848', why: 'En 1848, l’affaire Dreyfus n’a pas commencé.' },
            { label: '1870', why: 'L’affaire Dreyfus ne commence qu’en 1894.' },
            { label: '1914', why: 'L’affaire Dreyfus se termine en 1906, avant 1914.' },
          ],
          ...PREUVES.exposition,
          explain: 'L’exposition universelle de Paris a lieu en 1900, pendant l’affaire Dreyfus (1894-1906).',
        },
        {
          q: 'Quel régime gouverne la France pendant cette scène ?',
          a: 'la Troisième République',
          wrong: [
            { label: 'le Second Empire', why: 'Il disparaît en 1870.' },
            { label: 'la monarchie de Juillet', why: 'Elle prend fin en 1848.' },
            { label: 'l’Empire de Napoléon Ier', why: 'Il se termine en 1814/1815.' },
          ],
          ...PREUVES.proclamation,
          explain: 'Proclamée en 1870, la Troisième République gouverne la France en 1900.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la frise ———

const frise: Notion = {
  id: 'h4-frise',
  title: 'La frise de 4e : siècles, périodes et ruptures',
  hint: 'Calcule d’abord le siècle ou la durée à partir des années, puis compare la place sur la frise.',
  memo: [
    'Une **frise chronologique** range les faits dans l’ordre. La 4e va de la mort de Louis XIV à l’installation de la Troisième République, avec un thème sur la France du XIXe siècle qui va jusqu’en 1914.',
    'Un **siècle** commence par une année en 01 et finit par une année en 00 : 1800 est la dernière année du XVIIIe siècle, 1900 celle du XIXe. En 1789 commence l’**époque contemporaine** ; avant, ce sont les **Temps modernes**.',
    'Une **rupture** est un grand changement (1789 rompt avec l’Ancien Régime) ; une **continuité** est ce qui dure malgré les changements. Une **durée** se calcule en soustrayant la première année de la dernière.',
  ],
  faits: [
    {
      q: 'Sur la frise, de quel événement à quel autre la classe de 4e s’étend-elle d’après le programme ?',
      a: 'de la mort de Louis XIV à l’installation de la Troisième République',
      wrong: [
        { label: 'de la préhistoire à l’Antiquité', why: 'C’est la période étudiée en 6e.' },
        { label: 'de la chute de Rome à la prise de Constantinople', why: 'C’est le Moyen Âge, vu en 5e.' },
        {
          label: 'de la Première Guerre mondiale à nos jours',
          why: 'Le XXe siècle est étudié en 3e.',
        },
      ],
      gap: ['La 4e va de la mort de Louis ', ' à l’installation de la Troisième République.', ['XIV', '14']],
      ...PREUVES.couvre,
      explain: 'Le programme situe la 4e de la mort de Louis XIV à l’installation de la Troisième République.',
    },
    {
      q: 'Dans quelle période entre-t-on avec la Révolution française de 1789 ?',
      a: 'l’époque contemporaine',
      wrong: [
        { label: 'le Moyen Âge', why: 'Le Moyen Âge s’achève au XVe siècle.' },
        { label: 'l’Antiquité', why: 'L’Antiquité est bien plus ancienne.' },
        { label: 'les Temps modernes', why: 'Les Temps modernes se terminent à la Révolution.' },
      ],
      gap: ['L’histoire ', ' va de 1789 à nos jours.', ['contemporaine']],
      ...PREUVES.contemporaine,
      explain: 'Le Dictionnaire de l’Académie date l’histoire contemporaine de 1789 à nos jours.',
    },
    {
      q: 'Par quel événement les Temps modernes se terminent-ils ?',
      a: 'la Révolution française',
      wrong: [
        { label: 'la découverte de l’Amérique', why: 'En 1492, les Temps modernes commencent à peine.' },
        { label: 'la mort de Louis XIV', why: 'Louis XIV meurt en 1715, avant la fin de la période.' },
        { label: 'la proclamation de la Troisième République', why: 'En 1870, on est déjà à l’époque contemporaine.' },
      ],
      gap: ['Les Temps modernes se terminent avec la ', ' française.', ['Révolution']],
      ...PREUVES.modernes,
      explain: 'La période moderne se termine à la Révolution française.',
    },
    {
      q: 'L’année 1789 appartient à quel siècle ?',
      a: 'au XVIIIe siècle',
      wrong: [
        { label: 'au XVIIe siècle', why: 'Le XVIIe siècle va de 1601 à 1700.' },
        { label: 'au XIXe siècle', why: 'Le XIXe siècle ne commence qu’en 1801.' },
        { label: 'au XXe siècle', why: 'Le XXe siècle va de 1901 à 2000.' },
      ],
      gap: ['L’année 1789 appartient au ', ' siècle.', siecle('XVIII', 18)],
      ...PREUVES.siecle,
      explain: 'Un siècle dure cent ans : le XVIIIe va de 1701 à 1800, il contient 1789.',
    },
    {
      q: 'L’année 1905 appartient à quel siècle ?',
      a: 'au XXe siècle',
      wrong: [
        { label: 'au XVIIIe siècle', why: 'Le XVIIIe siècle va de 1701 à 1800.' },
        { label: 'au XIXe siècle', why: 'Le XIXe siècle s’achève avec l’année 1900.' },
        { label: 'au XXIe siècle', why: 'Le XXIe siècle commence en 2001.' },
      ],
      gap: ['La loi de séparation de 1905 date du ', ' siècle.', siecle('XX', 20)],
      ...PREUVES.siecle,
      explain: '1905 se place entre 1901 et 2000 : c’est le XXe siècle.',
    },
    {
      q: 'Avec quel ensemble politique la Déclaration des droits de l’homme et du citoyen marque-t-elle une rupture ?',
      a: 'l’Ancien Régime',
      wrong: [
        { label: 'la Troisième République', why: 'La Troisième République naît en 1870, après 1789.' },
        { label: 'l’Empire de Napoléon', why: 'L’Empire vient après 1789.' },
        { label: 'la monarchie de Juillet', why: 'Elle commence en 1830.' },
      ],
      gap: ['Les principes de 1789 rompent avec ce qu’on appelle désormais l’Ancien ', '.', ['Régime', 'regime']],
      ...PREUVES.ruptureAncienRegime,
      explain: 'La Déclaration proclame des principes qui rompent avec l’Ancien Régime.',
    },
    {
      q: 'Quel changement de 1848 la ressource d’Éduscol qualifie-t-elle de rupture « brusque » ?',
      a: 'le passage du suffrage censitaire au suffrage universel',
      wrong: [
        { label: 'le début de la traite atlantique', why: 'La traite commence bien avant 1848.' },
        { label: 'la mise en place de l’école de Jules Ferry', why: 'Elle date de 1882.' },
        { label: 'la loi de séparation', why: 'La séparation date de 1905.' },
      ],
      gap: ['En 1848, on passe du système censitaire au suffrage ', '.', ['universel']],
      ...PREUVES.ruptureVote,
      explain: 'Le passage du système censitaire au suffrage universel est une rupture « brusque ».',
    },
    {
      q: 'Dans le commerce international du XVIIIe siècle, quelle continuité observe-t-on ?',
      a: 'les circuits inaugurés au siècle précédent',
      wrong: [
        {
          label: 'les routes de l’empire romain',
          why: 'La continuité porte sur les circuits du siècle précédent, le XVIIe.',
        },
        { label: 'les chemins de fer', why: 'Le chemin de fer se développe avec l’industrialisation, plus tard.' },
        { label: 'les marchés de la préhistoire', why: 'La préhistoire est bien trop ancienne.' },
      ],
      gap: [
        'Le commerce international du XVIIIe siècle se développe dans la continuité des ',
        ' inaugurés au siècle précédent.',
        ['circuits'],
      ],
      ...PREUVES.continuiteCommerce,
      explain: 'Les circuits commerciaux se prolongent d’un siècle à l’autre : c’est une continuité.',
    },
    {
      q: 'Combien de régimes politiques se succèdent en France de 1815 à 1914 ?',
      a: 'cinq',
      wrong: [
        { label: 'un seul', why: 'La France change plusieurs fois de régime au XIXe siècle.' },
        { label: 'deux', why: 'Il y a bien plus de deux régimes entre 1815 et 1914.' },
        { label: 'douze', why: 'C’est beaucoup trop : Éduscol compte cinq régimes.' },
      ],
      gap: ['De 1815 à 1914, ', ' régimes différents se succèdent en France.', ['cinq', '5']],
      ...PREUVES.regimes,
      explain: 'Restauration, monarchie de Juillet, Deuxième République, Second Empire, Troisième République.',
    },
    {
      q: 'Quel repère termine l’affaire Dreyfus, commencée en 1894 ?',
      a: '1906',
      wrong: [
        { label: '1870', why: '1870 est antérieur au début de l’affaire.' },
        { label: '1898', why: 'En 1898, l’affaire est en plein débat, elle n’est pas finie.' },
        { label: '1914', why: '1914 ferme le thème, mais l’affaire est terminée avant.' },
      ],
      gap: ['L’affaire Dreyfus va de 1894 à ', '.', ['1906']],
      ...PREUVES.dreyfus,
      explain: 'L’affaire Dreyfus se termine en 1906.',
    },
  ],
  paires3: [
    ['XVIIIe siècle', 'de 1701 à 1800'],
    ['XIXe siècle', 'de 1801 à 1900'],
    ['XXe siècle', 'de 1901 à 2000'],
  ],
  paires5: [
    ['1751-1772', 'une durée de 21 ans'],
    ['1894-1906', 'une durée de 12 ans'],
    ['1848-1870', 'une durée de 22 ans'],
    ['1799-1814', 'une durée de 15 ans'],
    ['1870-1914', 'une durée de 44 ans'],
  ],
  frise: [
    { label: 'Le Code noir', date: '1685', ...T1.codeDate },
    { label: 'Le traité de Paris, qui fait perdre le Canada à la France', date: '1763', ...T1.traiteParis },
    { label: 'La promulgation du Code civil', date: '1804', ...T1.codeCivil },
    { label: 'Le début de la conquête de l’Algérie', date: '1830', ...T2.algerie },
    { label: 'La conférence de Berlin sur le partage de l’Afrique', date: '1885', ...T2.berlin },
    { label: 'L’exposition universelle de Paris', date: '1900', ...PREUVES.exposition },
  ],
  libres: [
    {
      q: 'À quel siècle appartient l’année 1800 ? (chiffres romains)',
      accepted: siecle('XVIII', 18),
      traps: [
        { text: 'XIXe', why: 'Le XIXe siècle commence en 1801 : 1800 est la dernière année du XVIIIe.' },
        { text: 'XVIIe', why: 'Le XVIIe siècle s’achève en 1700.' },
      ],
      ...PREUVES.bornes,
      explain: 'Un siècle finit par une année en 00 : 1800 est la dernière année du XVIIIe siècle.',
    },
    {
      q: 'À quel siècle appartient l’année 1900 ? (chiffres romains)',
      accepted: siecle('XIX', 19),
      traps: [
        { text: 'XXe', why: 'Le XXe siècle commence en 1901.' },
        { text: 'XVIIIe', why: 'Le XVIIIe siècle s’achève en 1800.' },
      ],
      ...PREUVES.bornes,
      explain: '1900 est la dernière année du XIXe siècle.',
    },
    {
      q: 'L’Encyclopédie paraît de 1751 à 1772 : combien d’années sa parution dure-t-elle ?',
      accepted: ['21', '21 ans', '21 années'],
      traps: [
        { text: '31', why: 'Refais la soustraction : 1772 − 1751.' },
        { text: '23', why: 'Calcule 1772 − 1751 avec soin.' },
      ],
      ...PREUVES.parution,
      explain: '1772 − 1751 = 21 ans.',
    },
    {
      q: 'Combien d’années séparent le début de la Révolution (1789) de l’arrivée de Napoléon Bonaparte au pouvoir (1799) ?',
      accepted: ['10', '10 ans', 'dix ans', 'dix', '10 années'],
      traps: [
        { text: '9', why: 'Calcule 1799 − 1789.' },
        { text: '15', why: '15 ans séparent 1799 de 1814, pas 1789 de 1799.' },
      ],
      ...PREUVES.napoleon,
      explain: '1799 − 1789 = 10 ans.',
    },
    {
      q: 'L’affaire Dreyfus va de 1894 à 1906 : combien d’années dure-t-elle ?',
      accepted: ['12', '12 ans', 'douze', 'douze ans', '12 années'],
      traps: [
        { text: '22', why: '22 ans séparent 1848 de 1870 : recalcule 1906 − 1894.' },
        { text: '8', why: 'Calcule 1906 − 1894.' },
      ],
      ...PREUVES.dreyfus,
      explain: '1906 − 1894 = 12 ans.',
    },
    {
      q: 'Combien d’années séparent la proclamation de la Troisième République (1870) de la séparation des Églises et de l’État (1905) ?',
      accepted: ['35', '35 ans', '35 années'],
      traps: [
        { text: '25', why: 'Refais la soustraction : 1905 − 1870.' },
        { text: '30', why: 'Calcule 1905 − 1870 sans arrondir.' },
      ],
      ...PREUVES.separation,
      explain: '1905 − 1870 = 35 ans.',
    },
  ],
  docs: [
    {
      title: 'La frise de la classe',
      lines: [
        'La classe trace une frise avec trois bandes.',
        'Bande A : de 1701 à 1800.',
        'Bande B : de 1801 à 1900.',
        'Bande C : de 1901 à 2000.',
        'Un élève doit placer les étiquettes « 1789 », « 1848 » et « 1905 ».',
      ],
      qs: [
        {
          q: 'Sur quelle bande faut-il placer l’étiquette « 1848 » ?',
          a: 'la bande B',
          wrong: [
            { label: 'la bande A', why: 'La bande A s’arrête en 1800.' },
            { label: 'la bande C', why: 'La bande C commence en 1901.' },
            { label: 'sur aucune des trois', why: '1848 est compris dans la bande B.' },
          ],
          ...PREUVES.suffrage,
          explain: '1848 est entre 1801 et 1900 : la bande B.',
        },
        {
          q: 'Quelle étiquette se place sur la bande C ?',
          a: '1905',
          wrong: [
            { label: '1789', why: '1789 se place sur la bande A.' },
            { label: '1848', why: '1848 se place sur la bande B.' },
            { label: 'aucune des trois', why: '1905 est après 1901.' },
          ],
          ...PREUVES.separation,
          explain: '1905 est au XXe siècle, donc sur la bande C.',
        },
      ],
    },
    {
      title: 'Ce qui change, ce qui continue',
      lines: [
        'Au XVIIIe siècle, les marchands utilisent des routes maritimes ouvertes au siècle précédent.',
        'En 1789, des principes nouveaux sont proclamés : égalité devant la loi et souveraineté nationale.',
        'Un nouvel ordre politique rompt avec l’Ancien Régime.',
      ],
      qs: [
        {
          q: 'Quel élément du texte montre une continuité ?',
          a: 'les routes maritimes ouvertes au siècle précédent',
          wrong: [
            { label: 'l’égalité devant la loi', why: 'L’égalité devant la loi est une nouveauté de 1789.' },
            { label: 'la souveraineté nationale', why: 'C’est un principe nouveau.' },
            { label: 'le nouvel ordre politique', why: 'Il marque la rupture.' },
          ],
          ...PREUVES.continuiteCommerce,
          explain: 'Une continuité est ce qui dure : les circuits déjà ouverts continuent à servir.',
        },
        {
          q: 'Quel élément du texte montre une rupture ?',
          a: 'le nouvel ordre politique qui rompt avec l’Ancien Régime',
          wrong: [
            { label: 'les routes maritimes', why: 'Elles continuent : c’est une continuité.' },
            { label: 'le siècle précédent', why: 'Un siècle n’est pas un changement.' },
            { label: 'les marchands du XVIIIe siècle', why: 'Le texte ne les présente pas comme un changement.' },
          ],
          ...PREUVES.ruptureAncienRegime,
          explain: 'Le nouvel ordre rompt avec l’Ancien Régime : c’est une rupture.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : les acteurs ———

const acteurs: Notion = {
  id: 'h4-acteurs',
  title: 'Les acteurs de 4e',
  hint: 'Cherche à quel combat, à quelle idée ou à quelle action se rattache le personnage, puis à quel siècle.',
  memo: [
    'Un **acteur** de l’histoire est une personne ou un groupe qui agit sur son époque : pas seulement les chefs politiques. Exemple : les **quakers** fondent en 1775 la première société pour l’abolition de l’esclavage.',
    'Retiens des couples : Diderot et D’Alembert, l’Encyclopédie ; Olympe de Gouges, les droits de la femme (1791) ; Schoelcher, l’abolition (1848) ; Jules Ferry, l’école ; Zola, la défense de Dreyfus.',
    'Pour bien situer un acteur, ajoute toujours son action et sa date.',
  ],
  faits: [
    {
      q: 'Quel ministre est à l’origine de la Compagnie des Indes orientales, créée en 1664 ?',
      a: 'Colbert',
      wrong: [
        { label: 'Jules Ferry', why: 'Jules Ferry agit au XIXe siècle.' },
        { label: 'Guizot', why: 'Guizot est un ministre de la monarchie de Juillet, au XIXe siècle.' },
        { label: 'Turgot', why: 'Turgot est ministre au début du règne de Louis XVI, au XVIIIe siècle.' },
      ],
      gap: ['La Compagnie des Indes orientales est créée en 1664 par ', '.', ['Colbert']],
      ...T1.colbert,
      explain: 'La Compagnie des Indes orientales est créée par Colbert en 1664.',
    },
    {
      q: 'Quel auteur critique l’esclavage dans « L’Esprit des Lois » (1748) ?',
      a: 'Montesquieu',
      wrong: [
        { label: 'Colbert', why: 'Colbert est un ministre du XVIIe siècle, lié au Code noir.' },
        { label: 'Napoléon Bonaparte', why: 'Bonaparte agit à partir de la Révolution.' },
        { label: 'Voltaire', why: 'L’ouvrage cité est de Montesquieu.' },
      ],
      gap: ['Dans « L’Esprit des Lois » (1748), ', ' critique l’esclavage.', ['Montesquieu']],
      ...T1.montesquieuEsclavage,
      explain: 'Montesquieu critique l’esclavage dans L’Esprit des Lois.',
    },
    {
      q: 'Qui dirige l’Encyclopédie avec D’Alembert ?',
      a: 'Diderot',
      wrong: [
        { label: 'Kant', why: 'Kant est un philosophe allemand qui définit les Lumières.' },
        { label: 'Robespierre', why: 'Robespierre est un acteur de la Révolution.' },
        { label: 'Schoelcher', why: 'Schoelcher agit au XIXe siècle.' },
      ],
      gap: ['L’Encyclopédie est celle de ', ' et D’Alembert.', ['Diderot']],
      ...T1.encyclopedie,
      explain: 'L’Encyclopédie est celle de Diderot et D’Alembert.',
    },
    {
      q: 'Quel souverain de Prusse se dit « philosophe » et se réclame des Lumières ?',
      a: 'Frédéric II',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est un roi de France mort en 1715.' },
        { label: 'Louis-Philippe', why: 'Louis-Philippe est un roi des Français du XIXe siècle.' },
        { label: 'Napoléon III', why: 'Napoléon III est empereur à partir de 1852.' },
      ],
      gap: ['Le souverain de Prusse qui se dit « philosophe » est ', ' II.', ['Frédéric', 'Frederic']],
      ...PREUVES.frederic,
      explain: 'Certains souverains, comme Frédéric II de Prusse, se disent « philosophes ».',
    },
    {
      q: 'Quel groupe religieux fonde en 1775 la première société pour l’abolition de l’esclavage ?',
      a: 'les quakers',
      wrong: [
        { label: 'les négociants', why: 'Les négociants sont des commerçants en gros.' },
        { label: 'les préfets', why: 'Les préfets administrent les départements.' },
        { label: 'les conservateurs de 1877', why: 'Il s’agit d’un camp politique français du XIXe siècle.' },
      ],
      gap: ['En 1775, les ', ' créent la première société pour l’abolition de l’esclavage.', ['quakers']],
      ...PREUVES.quakers,
      explain: 'Les quakers des futurs États-Unis créent la première société abolitionniste en 1775.',
    },
    {
      q: 'Quelle femme publie en 1791 la Déclaration des droits de la femme et de la citoyenne ?',
      a: 'Olympe de Gouges',
      wrong: [
        { label: 'Marguerite Durand', why: 'Marguerite Durand fonde le journal « La Fronde » en 1897.' },
        { label: 'Eugénie Niboyet', why: 'Eugénie Niboyet agit en 1848.' },
        { label: 'Hubertine Auclert', why: 'Hubertine Auclert milite sous la Troisième République.' },
      ],
      gap: [
        'La Déclaration des droits de la femme et de la citoyenne (1791) est publiée par Olympe de ',
        '.',
        ['Gouges'],
      ],
      ...T1.gouges,
      explain: 'En septembre 1791, Olympe de Gouges fait paraître cette Déclaration.',
    },
    {
      q: 'Qui prend le pouvoir pendant la Révolution et instaure un régime de Terreur ?',
      a: 'Robespierre',
      wrong: [
        { label: 'Guizot', why: 'Guizot gouverne au XIXe siècle.' },
        { label: 'Diderot', why: 'Diderot est un auteur des Lumières, qui dirige l’Encyclopédie.' },
        { label: 'Zola', why: 'Zola est un écrivain de la fin du XIXe siècle.' },
      ],
      gap: ['Le régime de Terreur est instauré par ', '.', ['Robespierre']],
      ...T1.terreur,
      explain: 'Robespierre prend le pouvoir et instaure un régime de Terreur.',
    },
    {
      q: 'Quel homme politique est associé à l’abolition de l’esclavage de 1848 ?',
      a: 'Victor Schoelcher',
      wrong: [
        { label: 'Joseph Gallieni', why: 'Gallieni agit à Madagascar, pendant la colonisation.' },
        { label: 'Louis-Napoléon Bonaparte', why: 'Il est élu président en décembre 1848, après le décret.' },
        { label: 'Jules Ferry', why: 'Jules Ferry agit surtout dans les années 1880.' },
      ],
      gap: ['Le décret d’abolition de 1848 doit beaucoup à Victor ', '.', ['Schoelcher', 'Schœlcher']],
      ...T2.decretSenat,
      explain: 'Victor Schoelcher impose le décret d’abolition de l’esclavage en 1848.',
    },
    {
      q: 'Quel homme politique est associé, en 1882, à l’école gratuite, laïque et obligatoire ?',
      a: 'Jules Ferry',
      wrong: [
        { label: 'Colbert', why: 'Colbert est un ministre du XVIIe siècle.' },
        { label: 'Robespierre', why: 'Robespierre est un acteur de la Révolution.' },
        { label: 'Guizot', why: 'Guizot gouverne sous la monarchie de Juillet, avant 1848.' },
      ],
      gap: ['En 1882, l’école gratuite, laïque et obligatoire est associée à Jules ', '.', ['Ferry']],
      ...PREUVES.ferryEcole,
      explain: '1882 : Jules Ferry et l’école gratuite, laïque et obligatoire.',
    },
    {
      q: 'Quel savant fait le voyage à bord du Beagle (1831-1836) puis publie une théorie sur l’origine des espèces ?',
      a: 'Charles Darwin',
      wrong: [
        { label: 'Hubert Lyautey', why: 'Lyautey agit au Maroc, pendant la colonisation.' },
        { label: 'Émile Zola', why: 'Zola est un écrivain.' },
        { label: 'Kant', why: 'Kant est un philosophe du XVIIIe siècle.' },
      ],
      gap: ['Le savant du voyage du Beagle est Charles ', '.', ['Darwin']],
      ...PREUVES.darwin,
      explain: 'Darwin pose les bases de sa théorie lors de cette expédition.',
    },
    {
      q: 'Quel écrivain publie « J’accuse… ! » pour défendre le capitaine Dreyfus ?',
      a: 'Émile Zola',
      wrong: [
        { label: 'Victor Schoelcher', why: 'Schoelcher est lié à l’abolition de l’esclavage.' },
        { label: 'Diderot', why: 'Diderot est un auteur du XVIIIe siècle.' },
        { label: 'Alfred Dreyfus', why: 'Dreyfus est l’accusé, il n’écrit pas ce texte.' },
      ],
      gap: ['« J’accuse… ! » est publié par Émile ', '.', ['Zola']],
      ...T3.jaccuse,
      explain: 'Zola publie « J’accuse… ! » dans L’Aurore.',
    },
    {
      q: 'Quelle journaliste fonde en 1897 le quotidien « La Fronde » ?',
      a: 'Marguerite Durand',
      wrong: [
        { label: 'Olympe de Gouges', why: 'Olympe de Gouges agit pendant la Révolution.' },
        { label: 'Eugénie Niboyet', why: 'Niboyet crée « La voix des femmes » en 1848.' },
        { label: 'Hubertine Auclert', why: 'Auclert lance « La Citoyenne » en 1881.' },
      ],
      gap: ['« La Fronde » est fondé en 1897 par Marguerite ', '.', ['Durand']],
      ...T3.fronde,
      explain: 'Marguerite Durand fonde « La Fronde » en 1897.',
    },
  ],
  paires3: [
    ['Diderot', 'l’Encyclopédie'],
    ['Victor Schoelcher', 'l’abolition de l’esclavage'],
    ['Émile Zola', 'la défense de Dreyfus'],
  ],
  paires5: [
    ['Colbert', 'ministre lié à la Compagnie des Indes orientales'],
    ['Montesquieu', 'auteur de « L’Esprit des Lois »'],
    ['Olympe de Gouges', 'Déclaration des droits de la femme'],
    ['Eugénie Niboyet', '« La voix des femmes » en 1848'],
    ['Joseph Gallieni', 'action coloniale à Madagascar'],
  ],
  frise: [
    { label: 'Colbert crée la Compagnie des Indes orientales', date: '1664', ...T1.colbert },
    { label: 'Montesquieu fait paraître « L’Esprit des Lois »', date: '1748', ...T1.montesquieuEsclavage },
    { label: 'Olympe de Gouges publie sa Déclaration', date: '1791', ...T1.gouges },
    { label: 'Bonaparte prend le pouvoir par un coup d’État', date: '1799', ...T1.brumaire },
    { label: 'Schoelcher fait abolir l’esclavage', date: '1848', ...T2.decret },
    { label: 'Marguerite Durand fonde « La Fronde »', date: '1897', ...T3.fronde },
  ],
  libres: [
    {
      q: 'Quel ministre de Louis XVI, au début de son règne, est lui-même un philosophe des Lumières ?',
      accepted: ['Turgot'],
      traps: [
        { text: 'Colbert', why: 'Colbert est un ministre de Louis XIV.' },
        { text: 'Guizot', why: 'Guizot est un ministre du XIXe siècle.' },
      ],
      ...PREUVES.turgot,
      explain: 'Turgot, principal ministre au début du règne de Louis XVI, est un philosophe des Lumières.',
    },
    {
      q: 'Quel philosophe défend Calas, puis publie le « Traité sur la tolérance » ?',
      accepted: ['Voltaire'],
      traps: [
        { text: 'Montesquieu', why: 'Montesquieu est l’auteur de « L’Esprit des Lois ».' },
        { text: 'Diderot', why: 'Diderot dirige l’Encyclopédie.' },
      ],
      ...T1.tolerance,
      explain: 'Voltaire défend Calas et publie le Traité sur la tolérance.',
    },
    {
      q: 'Quel acteur de la colonisation, cité avec Jules Ferry et Gallieni, agit au Maroc ?',
      accepted: ['Lyautey', 'Hubert Lyautey'],
      traps: [
        { text: 'Gallieni', why: 'Gallieni est associé à Madagascar.' },
        { text: 'Ferry', why: 'Jules Ferry est un ministre associé à l’école et à la colonisation.' },
      ],
      ...T2.acteurs,
      explain: 'Hubert Lyautey agit au Maroc.',
    },
    {
      q: 'Quelle militante, sous la Troisième République, porte la revendication du droit de vote des femmes ?',
      accepted: ['Hubertine Auclert', 'Auclert'],
      traps: [
        { text: 'Olympe de Gouges', why: 'Olympe de Gouges écrit en 1791, sous la Révolution.' },
        { text: 'Marie Curie', why: 'Marie Curie est une savante.' },
      ],
      ...T3.vote,
      explain: 'Hubertine Auclert fait partie des militantes du droit de vote.',
    },
    {
      q: 'Quel ministre de la monarchie de Juillet refuse d’élargir le droit de vote ?',
      accepted: ['Guizot', 'François Guizot', 'Francois Guizot'],
      traps: [
        { text: 'Colbert', why: 'Colbert est un ministre de Louis XIV.' },
        { text: 'Turgot', why: 'Turgot est un ministre du XVIIIe siècle.' },
      ],
      ...T3.guizot,
      explain: 'Guizot refuse toute réforme qui étendrait le droit de suffrage.',
    },
    {
      q: 'Quel neveu de Napoléon Ier est élu président de la République en décembre 1848 ?',
      accepted: [
        'Louis-Napoléon Bonaparte',
        'Louis Napoléon Bonaparte',
        'Louis-Napoléon',
        'Louis Napoleon Bonaparte',
        'Napoléon III',
      ],
      traps: [
        { text: 'Louis-Philippe', why: 'Louis-Philippe abdique en février 1848.' },
        { text: 'Napoléon Bonaparte', why: 'Napoléon Bonaparte est son oncle, au début du siècle.' },
      ],
      ...T3.president,
      explain: 'Louis-Napoléon Bonaparte est élu président en décembre 1848.',
    },
  ],
  docs: [
    {
      title: 'Des idées contre l’esclavage',
      lines: [
        'Au XVIIIe siècle, un auteur critique l’esclavage dans un livre sur les lois.',
        'Plus tard, une société pour l’abolition naît dans les colonies d’Amérique du Nord.',
        'Au siècle suivant, un homme obtient enfin le décret qui abolit l’esclavage dans les colonies françaises.',
      ],
      qs: [
        {
          q: 'Qui est l’homme dont parle la dernière phrase ?',
          a: 'Victor Schoelcher',
          wrong: [
            { label: 'Montesquieu', why: 'Montesquieu est l’auteur du livre sur les lois, au XVIIIe siècle.' },
            { label: 'Joseph Gallieni', why: 'Gallieni agit à Madagascar pendant la colonisation.' },
            { label: 'Colbert', why: 'Colbert est un ministre du XVIIe siècle.' },
          ],
          ...T2.decret,
          explain: 'Le décret du 27 avril 1848 abolit l’esclavage : il est lié à Schoelcher.',
        },
        {
          q: 'Quel type d’acteur désigne la « société pour l’abolition » ?',
          a: 'un acteur collectif',
          wrong: [
            { label: 'un acteur individuel', why: 'Une société réunit plusieurs personnes.' },
            { label: 'un lieu', why: 'Une société agit : ce n’est pas un lieu.' },
            { label: 'une date', why: 'Une société n’est pas une date.' },
          ],
          ...PREUVES.acteursCollectifs,
          explain: 'Les acteurs peuvent être collectifs, comme les membres d’une société.',
        },
      ],
    },
    {
      title: 'Des femmes en action',
      lines: [
        'En 1848, une femme préside un club et crée un journal intitulé « La voix des femmes ».',
        'En 1897, une autre fonde un quotidien : « La Fronde ».',
        'D’autres militantes réclament le droit de vote.',
      ],
      qs: [
        {
          q: 'Qui fonde « La voix des femmes » ?',
          a: 'Eugénie Niboyet',
          wrong: [
            { label: 'Marguerite Durand', why: 'Marguerite Durand fonde « La Fronde ».' },
            { label: 'Olympe de Gouges', why: 'Elle écrit en 1791, avant 1848.' },
            { label: 'Marie Curie', why: 'Marie Curie est une savante de la fin du siècle.' },
          ],
          ...T3.niboyet,
          explain: 'Eugénie Niboyet préside le club des femmes et crée « La voix des femmes ».',
        },
        {
          q: 'Qui fonde « La Fronde » ?',
          a: 'Marguerite Durand',
          wrong: [
            { label: 'Eugénie Niboyet', why: 'Elle crée « La voix des femmes » en 1848.' },
            { label: 'Hubertine Auclert', why: 'Auclert lance « La Citoyenne » en 1881.' },
            { label: 'Olympe de Gouges', why: 'Elle agit pendant la Révolution.' },
          ],
          ...T3.fronde,
          explain: 'Marguerite Durand fonde « La Fronde » en 1897.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : le vocabulaire historique ———

const vocabulaire: Notion = {
  id: 'h4-vocabulaire-historique',
  title: 'Le vocabulaire historique de 4e',
  hint: 'Cherche si le mot désigne une personne, un système, un régime, une doctrine ou un lien entre territoires.',
  memo: [
    'Un mot précis vaut une longue explication. XVIIIe siècle : **négociant**, **armateur**, **despotisme éclairé**. Exemple : un armateur équipe des navires.',
    'XIXe siècle : **salariat**, **socialisme**, **métropole**, **protectorat** ; et pour la France : **suffrage censitaire**, **plébiscite**, **laïcité**, **féminisme**.',
    'Ne confonds pas des mots voisins : le suffrage censitaire réserve le vote à ceux qui paient le **cens** ; le **suffrage universel masculin** de 1848 concerne les hommes, pas les femmes.',
  ],
  faits: [
    {
      q: 'Comment appelle-t-on la personne qui se livre au commerce en gros ?',
      a: 'un négociant',
      wrong: [
        { label: 'un préfet', why: 'Le préfet administre un département.' },
        { label: 'un affranchi', why: 'Un affranchi est libéré de sa servitude.' },
        { label: 'un armateur', why: 'L’armateur équipe des navires.' },
      ],
      gap: ['La personne qui se livre au commerce en gros est un ', '.', ['négociant', 'negociant']],
      ...T1.negociant,
      explain: 'Le négociant fait le commerce en gros.',
    },
    {
      q: 'Comment appelle-t-on celui qui équipe un navire pour le commerce ?',
      a: 'un armateur',
      wrong: [
        { label: 'un salarié', why: 'Le salarié travaille contre un salaire.' },
        { label: 'un colon', why: 'Le colon s’installe dans un territoire conquis.' },
        {
          label: 'un négociant',
          why: 'Le négociant vend et achète en gros : équiper un navire est l’affaire de l’armateur.',
        },
      ],
      gap: ['Celui qui équipe un navire pour le commerce est un ', '.', ['armateur']],
      ...T1.armateur,
      explain: 'L’armateur équipe des navires.',
    },
    {
      q: 'Quel mot désigne le commerce reliant l’Europe, l’Afrique de l’Ouest et l’Amérique ?',
      a: 'le commerce triangulaire',
      wrong: [
        { label: 'le commerce en droiture', why: 'Le commerce en droiture relie directement la colonie, sans traite.' },
        { label: 'le cabotage', why: 'Le cabotage longe les côtes.' },
        { label: 'le salariat', why: 'Le salariat est un régime de travail payé.' },
      ],
      gap: ['Le commerce reliant l’Europe, l’Afrique de l’Ouest et l’Amérique est dit ', '.', ['triangulaire']],
      ...T1.triangle,
      explain: 'Les trois sommets forment le commerce triangulaire.',
    },
    {
      q: 'Quelle idée désigne une nation gouvernée par un monarque au service de son peuple, inspiré par les Lumières ?',
      a: 'le despotisme éclairé',
      wrong: [
        { label: 'le suffrage censitaire', why: 'Le suffrage censitaire est un système électoral.' },
        { label: 'le protectorat', why: 'Le protectorat est une tutelle sur un autre État.' },
        { label: 'le socialisme', why: 'Le socialisme est une doctrine du XIXe siècle.' },
      ],
      gap: [
        'Un souverain inspiré par les Lumières, au service du peuple, pratique le despotisme ',
        '.',
        ['éclairé', 'eclaire'],
      ],
      ...T1.despote,
      explain: 'Le despotisme éclairé : un monarque qui s’inspire des Lumières.',
    },
    {
      q: 'Quel système électoral réserve le vote à ceux qui paient le cens ?',
      a: 'le suffrage censitaire',
      wrong: [
        { label: 'le suffrage universel masculin', why: 'Il ouvre le vote à tous les hommes, sans condition d’impôt.' },
        { label: 'le plébiscite', why: 'Le plébiscite consulte tout le corps électoral.' },
        { label: 'la conscription', why: 'La conscription est un recrutement pour l’armée.' },
      ],
      gap: ['Le suffrage où seuls votent ceux qui paient le cens est le suffrage ', '.', ['censitaire']],
      ...T3.censitaire,
      explain: 'Le suffrage censitaire réserve le vote à ceux qui paient le cens.',
    },
    {
      q: 'Quel nom exact donner au suffrage de 1848, dont les femmes sont exclues ?',
      a: 'le suffrage universel masculin',
      wrong: [
        { label: 'le suffrage censitaire', why: 'Le suffrage censitaire dépend du paiement du cens.' },
        { label: 'le despotisme éclairé', why: 'C’est une conception du pouvoir d’un monarque, pas un suffrage.' },
        { label: 'le suffrage universel des femmes et des hommes', why: 'En 1848, les femmes ne votent pas.' },
      ],
      gap: ['Le « suffrage universel » de 1848 est en réalité un suffrage universel ', '.', ['masculin']],
      ...T3.masculin,
      explain: 'En 1848, seuls les hommes votent : le suffrage universel est masculin.',
    },
    {
      q: 'Quel mot désigne la consultation directe de tout le corps électoral ?',
      a: 'un plébiscite',
      wrong: [
        { label: 'une conscription', why: 'La conscription est un recrutement.' },
        { label: 'un protectorat', why: 'Le protectorat est un régime de tutelle.' },
        { label: 'une grève', why: 'La grève est un arrêt de travail.' },
      ],
      gap: ['La consultation directe de tout le corps électoral est un ', '.', ['plébiscite', 'plebiscite']],
      ...T3.plebisciteMot,
      explain: 'Le plébiscite consulte directement le corps électoral.',
    },
    {
      q: 'Quel mot désigne un État considéré par rapport à ses colonies ?',
      a: 'la métropole',
      wrong: [
        { label: 'le protectorat', why: 'Le protectorat est un régime de tutelle sur un État.' },
        { label: 'la colonie', why: 'La colonie est le territoire conquis.' },
        { label: 'la municipalité', why: 'La municipalité gère une commune.' },
      ],
      gap: ['Un État considéré par rapport à ses colonies est la ', '.', ['métropole', 'metropole']],
      ...T2.metropole,
      explain: 'La métropole est l’État qui possède les colonies.',
    },
    {
      q: 'Comment appelle-t-on la tutelle d’un État puissant sur l’administration et les relations extérieures d’un autre ?',
      a: 'un protectorat',
      wrong: [
        { label: 'une métropole', why: 'La métropole est l’État qui possède des colonies.' },
        { label: 'un plébiscite', why: 'Le plébiscite est une consultation.' },
        { label: 'un salariat', why: 'Le salariat est un régime de travail.' },
      ],
      gap: ['Un État puissant qui contrôle un autre en échange de sa protection établit un ', '.', ['protectorat']],
      ...T2.protectorat,
      explain: 'Le protectorat est un régime de tutelle.',
    },
    {
      q: 'Quel mot désigne le régime économique où le travail est payé par un salaire ?',
      a: 'le salariat',
      wrong: [
        { label: 'le socialisme', why: 'Le socialisme est une doctrine.' },
        { label: 'le servage', why: 'Le servage est une condition paysanne du Moyen Âge.' },
        { label: 'l’abolitionnisme', why: 'C’est la doctrine favorable à l’abolition de l’esclavage.' },
      ],
      gap: ['Le régime où le travail est rémunéré par un salaire est le ', '.', ['salariat']],
      ...T2.salariat,
      explain: 'Le salariat rémunère le travail par un salaire.',
    },
    {
      q: 'Quel mot désigne la neutralité religieuse et l’indépendance à l’égard des Églises ?',
      a: 'la laïcité',
      wrong: [
        { label: 'la conscription', why: 'La conscription est un recrutement.' },
        { label: 'le féminisme', why: 'Le féminisme réclame l’extension des droits des femmes.' },
        {
          label: 'la tolérance',
          why: 'La tolérance est le respect des croyances ; le mot demandé désigne la neutralité de l’État.',
        },
      ],
      gap: ['La neutralité religieuse de l’État s’appelle la ', '.', ['laïcité', 'laicite']],
      ...T3.laicite,
      explain: 'La laïcité est la neutralité religieuse.',
    },
    {
      q: 'Quel mouvement réclame la reconnaissance ou l’extension des droits de la femme ?',
      a: 'le féminisme',
      wrong: [
        {
          label: 'le socialisme',
          why: 'Le socialisme vise une société plus égalitaire, à partir de la critique du capitalisme.',
        },
        { label: 'l’abolitionnisme', why: 'Il vise l’abolition de l’esclavage.' },
        { label: 'le despotisme', why: 'C’est une forme de pouvoir.' },
      ],
      gap: ['Le mouvement pour les droits des femmes est le ', '.', ['féminisme', 'feminisme']],
      ...T3.feminisme,
      explain: 'Le féminisme réclame l’extension des droits de la femme.',
    },
  ],
  paires3: [
    ['Armateur', 'Personne qui équipe un navire'],
    ['Plébiscite', 'Consultation directe de tout le corps électoral'],
    ['Métropole', 'État considéré par rapport à ses colonies'],
  ],
  paires5: [
    ['Salariat', 'Travail rémunéré par un salaire'],
    ['Protectorat', 'Tutelle d’un État puissant sur un autre'],
    ['Abolitionnisme', 'Doctrine favorable à la fin de l’esclavage'],
    ['Laïcité', 'Neutralité religieuse'],
    ['Conscription', 'Enrôlement, recrutement de soldats'],
  ],
  libres: [
    {
      q: 'Quel mot désigne la personne libérée de sa servitude ?',
      accepted: [...mot('affranchi', 'un ', 'l’', "l'"), 'affranchie'],
      traps: [
        { text: 'colon', why: 'Le colon s’installe dans une colonie.' },
        { text: 'salarié', why: 'Le salarié est payé pour son travail ; il n’est pas question de servitude.' },
      ],
      ...T2.affranchi,
      explain: 'Un affranchi est libéré de sa servitude.',
    },
    {
      q: 'Quel mot en « -isme » désigne la doctrine favorable à l’abolition de l’esclavage ?',
      accepted: mot('abolitionnisme', 'l’', "l'"),
      traps: [
        { text: 'socialisme', why: 'Le socialisme vise une société plus égalitaire.' },
        { text: 'féminisme', why: 'Le féminisme concerne les droits des femmes.' },
      ],
      ...T2.abolitionnisme,
      explain: 'C’est l’abolitionnisme.',
    },
    {
      q: 'Dans le suffrage censitaire, comment appelle-t-on ce que les électeurs doivent payer ?',
      accepted: mot('cens', 'le ', 'un '),
      traps: [
        { text: 'plébiscite', why: 'Le plébiscite est une consultation électorale.' },
        { text: 'conscription', why: 'La conscription est un recrutement militaire.' },
      ],
      ...T3.censitaire,
      explain: 'Seuls ceux qui paient le cens sont électeurs.',
    },
    {
      q: 'Quel mot désigne l’enrôlement des jeunes hommes pour l’armée ?',
      accepted: mot('conscription', 'la '),
      traps: [
        { text: 'plébiscite', why: 'Le plébiscite est une consultation.' },
        { text: 'salariat', why: 'Le salariat concerne le travail payé.' },
      ],
      ...T3.conscriptionMot,
      explain: 'La conscription est un recrutement.',
    },
    {
      q: 'Quel mot préfère-t-on à « révolution industrielle » pour la montée de l’industrie hors d’Angleterre ?',
      accepted: [...mot('industrialisation', 'l’', "l'")],
      traps: [
        { text: 'mondialisation', why: 'La mondialisation désigne les échanges à l’échelle du monde.' },
        { text: 'colonisation', why: 'La colonisation est la conquête de territoires.' },
      ],
      ...PREUVES.industrialisation,
      explain: 'On parle d’industrialisation, mot plus neutre sur le rythme des changements.',
    },
    {
      q: 'Quel mot désigne le régime économique où le travail est payé par un salaire ?',
      accepted: mot('salariat', 'le '),
      traps: [
        { text: 'salaire', why: 'Le salaire est la paie ; le mot demandé désigne le régime tout entier.' },
        { text: 'socialisme', why: 'Le socialisme est une doctrine.' },
      ],
      ...T2.salariat,
      explain: 'Le salariat rémunère le travail par un salaire.',
    },
  ],
  docs: [
    {
      title: 'Un port au XVIIIe siècle',
      lines: [
        'Dans un port atlantique, un homme équipe des navires.',
        'Les bateaux relient l’Europe, l’Afrique de l’Ouest et l’Amérique ; des êtres humains y sont déportés en esclavage.',
        'Un autre homme vend en gros le sucre rapporté des colonies.',
      ],
      qs: [
        {
          q: 'Comment appelle-t-on l’homme qui équipe les navires ?',
          a: 'un armateur',
          wrong: [
            { label: 'un affranchi', why: 'L’affranchi est libéré de sa servitude.' },
            { label: 'un préfet', why: 'Le préfet est un administrateur.' },
            {
              label: 'un négociant',
              why: 'Le négociant vend en gros : la question porte sur celui qui équipe les navires.',
            },
          ],
          ...T1.armateur,
          explain: 'Équiper un navire est le rôle de l’armateur.',
        },
        {
          q: 'Quel est le nom du circuit que suivent les bateaux ?',
          a: 'le commerce triangulaire',
          wrong: [
            { label: 'le commerce en droiture', why: 'La droiture relie directement la colonie, sans traite.' },
            { label: 'le cabotage', why: 'Le cabotage longe les côtes.' },
            { label: 'la seconde mondialisation', why: 'Elle date de 1870 à 1914.' },
          ],
          ...T1.triangle,
          explain: 'Les trois étapes forment le commerce triangulaire.',
        },
      ],
    },
    {
      title: 'Des mots du XIXe siècle',
      lines: [
        'Un État puissant installe sa tutelle sur un autre, en échange de sa protection.',
        'Ailleurs, des ouvriers travaillent pour un salaire.',
        'Des penseurs veulent une société plus égalitaire, en critiquant le capitalisme.',
      ],
      qs: [
        {
          q: 'Quel mot correspond à la première phrase ?',
          a: 'un protectorat',
          wrong: [
            {
              label: 'une métropole',
              why: 'La métropole est l’État qui possède les colonies, pas la tutelle elle-même.',
            },
            { label: 'un plébiscite', why: 'C’est une consultation électorale.' },
            { label: 'une abolition', why: 'C’est la suppression d’une loi ou d’une institution.' },
          ],
          ...T2.protectorat,
          explain: 'Le protectorat est un régime de tutelle en échange d’une protection.',
        },
        {
          q: 'Quelle doctrine correspond à la dernière phrase ?',
          a: 'le socialisme',
          wrong: [
            { label: 'le salariat', why: 'Le salariat est un régime de travail, pas une doctrine critique.' },
            { label: 'le despotisme éclairé', why: 'Il concerne un monarque du XVIIIe siècle.' },
            { label: 'l’abolitionnisme', why: 'Il vise l’abolition de l’esclavage.' },
          ],
          ...T2.socialisme,
          explain: 'Le socialisme critique le capitalisme et vise plus d’égalité.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [reperes, frise, acteurs, vocabulaire];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'quatrième'));
