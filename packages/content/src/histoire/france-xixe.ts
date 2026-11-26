import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './france-xixe-sources.ts';

/**
 * 4e, thème 3 « Société, culture et politique dans la France du XIXe siècle » (lot hi-4e-03). Les faits sont dans
 * `france-xixe-sources.ts` avec leur citation exacte ; les textes à lire du niveau 5 sont écrits pour l'exercice.
 */

// ——— Notion 1 : voter de 1815 à 1870 ———

const vote: Notion = {
  id: 'h4-voter-1815-1870',
  title: 'Une difficile conquête : voter de 1815 à 1870',
  hint: 'Relis le mémo : cherche qui a le droit de voter, sous quel régime et à quelle date.',
  memo: [
    'De 1815 à 1848, sous la Restauration puis la monarchie de Juillet, le **suffrage censitaire** réserve le vote aux hommes qui paient le **cens**, un montant d’impôt : le peuple est exclu de la vie politique. La Restauration compte environ 100 000 électeurs, des propriétaires, des bourgeois et des paysans riches ; la loi de 1820 fait voter deux fois les plus imposés. En juillet 1830, les Trois Glorieuses font tomber Charles X ; en 1831, le cens passe de 300 à 200 francs, mais on ne compte que 246 000 électeurs en 1846 et le ministre Guizot refuse tout élargissement.',
    'Le 24 février 1848, Louis-Philippe abdique et la Deuxième République est proclamée. Le décret du 5 mars 1848 instaure le **suffrage universel masculin**, direct : tous les Français (des hommes) d’au moins 21 ans, résidant depuis six mois dans leur commune et jouissant de leurs droits civiques, votent ; le 23 avril, les électeurs se déplacent en masse, et le 10 décembre Louis-Napoléon Bonaparte est élu président. En 1850, une loi exige trois ans de résidence au même endroit : le corps électoral passe de près de 10 millions à moins de 7 millions, et beaucoup d’ouvriers sont écartés.',
    'Lors de son **coup d’État** du 2 décembre 1851, Louis-Napoléon Bonaparte rétablit le suffrage universel masculin ; le Second Empire est proclamé le 2 décembre 1852. Mais le pouvoir soutient des **candidats officiels** et recourt au **plébiscite**.',
  ],
  faits: [
    {
      ...P.censitaire,
      q: 'Dans le suffrage censitaire, qui a le droit de voter ?',
      a: 'seuls les hommes qui paient le cens',
      wrong: [
        {
          label: 'tous les adultes, hommes et femmes',
          why: 'Le suffrage censitaire réserve le vote à ceux qui paient assez d’impôt.',
        },
        { label: 'seuls les soldats', why: 'La condition porte sur l’impôt payé, pas sur le service dans l’armée.' },
        { label: 'tous les hommes de plus de 21 ans', why: 'Cela correspond au suffrage universel masculin de 1848.' },
      ],
      gap: ['Dans le suffrage censitaire, seuls ceux qui paient le ', ' sont électeurs.', ['cens']],
      explain: 'Le droit de vote dépend de l’impôt payé : c’est le principe du cens.',
    },
    {
      ...P.restauration,
      q: 'Sous la Restauration, environ combien y a-t-il d’électeurs ?',
      a: 'environ 100 000',
      wrong: [
        {
          label: 'environ 10 millions',
          why: 'Ce nombre correspond au suffrage universel masculin de la Deuxième République.',
        },
        { label: 'aucun', why: 'On vote sous la Restauration, mais seule une petite minorité en a le droit.' },
        { label: 'environ 1 million', why: 'Le corps électoral est bien plus réduit.' },
      ],
      gap: ['Sous la Restauration, il y a environ ', ' électeurs.', ['100 000', '100000', 'cent mille']],
      explain: 'Seuls les plus riches votent : le corps électoral est très réduit.',
    },
    {
      ...P.glorieuses,
      q: 'Quel événement de juillet 1830 contraint Charles X à abdiquer ?',
      a: 'les Trois Glorieuses',
      wrong: [
        { label: 'les journées de juin', why: 'Les journées de juin ont lieu en 1848.' },
        {
          label: 'le coup d’État du 2 décembre',
          why: 'Ce coup d’État date de 1851 et vient de Louis-Napoléon Bonaparte.',
        },
        { label: 'la Commune de Paris', why: 'La Commune date de 1871.' },
      ],
      gap: ['Le soulèvement de Paris des 27, 28 et 29 juillet 1830 s’appelle les Trois ', '.', ['Glorieuses']],
      explain: 'Les ordonnances du 25 juillet 1830, qui restreignaient notamment le vote, précèdent le soulèvement.',
    },
    {
      ...P.loi1831,
      q: 'En 1831, que devient le cens exigé pour élire les députés ?',
      a: 'il baisse de 300 à 200 francs',
      wrong: [
        { label: 'il est supprimé', why: 'Le suffrage reste censitaire jusqu’en 1848.' },
        { label: 'il monte à 1 000 francs', why: 'La loi de 1831 abaisse le cens au lieu de le relever.' },
        { label: 'il passe de 200 à 300 francs', why: 'C’est l’inverse : le montant diminue.' },
      ],
      gap: ['En 1831, le cens pour élire les députés passe de 300 à ', ' francs.', ['200', 'deux cents']],
      explain: 'La loi assouplit le système, sans donner le vote au plus grand nombre.',
    },
    {
      ...P.guizot,
      q: 'Quelle est la position de Guizot, ministre de la monarchie de Juillet, sur l’élargissement du vote ?',
      a: 'il la refuse catégoriquement',
      wrong: [
        {
          label: 'il instaure le suffrage universel',
          why: 'Le suffrage universel est instauré en 1848, après sa chute.',
        },
        { label: 'il donne le vote aux femmes', why: 'Les femmes restent exclues du vote.' },
        {
          label: 'il la soutient avec enthousiasme',
          why: 'Guizot qualifie le suffrage universel de « principe absurde ».',
        },
      ],
      gap: ['Sous la monarchie de Juillet, le ministre ', ' refuse tout élargissement du droit de vote.', ['Guizot']],
      explain: 'Ce blocage nourrit les demandes de réforme à la veille de 1848.',
    },
    {
      ...P.decretUniversel,
      q: 'Quel type de suffrage le décret du 5 mars 1848 instaure-t-il pour élire l’Assemblée constituante ?',
      a: 'un suffrage universel et direct',
      wrong: [
        { label: 'un suffrage censitaire', why: 'Le décret met fin au vote réservé à ceux qui paient le cens.' },
        { label: 'un tirage au sort', why: 'Les électeurs votent pour choisir leurs représentants.' },
        {
          label: 'un suffrage réservé aux notables',
          why: 'Le décret ouvre au contraire le vote au plus grand nombre d’hommes.',
        },
      ],
      gap: ['Le décret de 1848 prévoit que « le suffrage sera universel et ', ' ».', ['direct']],
      explain: 'Direct signifie que les électeurs choisissent eux-mêmes leurs représentants.',
    },
    {
      ...P.masculin,
      q: 'En 1848, qui est concerné par le « suffrage universel » ?',
      a: 'les hommes seulement',
      wrong: [
        {
          label: 'les hommes et les femmes',
          why: 'À cette époque, « Français » désigne les hommes : les femmes ne votent pas.',
        },
        { label: 'les femmes seulement', why: 'Ce sont au contraire les femmes qui sont écartées.' },
        { label: 'les propriétaires seulement', why: 'La condition de fortune est supprimée en 1848.' },
      ],
      gap: ['En 1848, le suffrage universel est en réalité un suffrage universel ', '.', ['masculin']],
      explain: 'Le mot « universel » ne comprend pas encore les femmes.',
    },
    {
      ...P.conditions1848,
      q: 'À partir de quel âge les Français sont-ils électeurs d’après le décret de 1848 ?',
      a: '21 ans',
      wrong: [
        { label: '18 ans', why: 'Le décret fixe un âge plus élevé.' },
        { label: '30 ans', why: '30 ans était l’âge demandé pour être éligible après 1830.' },
        { label: '25 ans', why: '25 ans était l’âge exigé des électeurs par la loi de 1831.' },
      ],
      gap: ['En 1848, sont électeurs tous les Français âgés de ', ' ans.', ['21', 'vingt et un', 'vingt-et-un']],
      explain: 'Le décret demande aussi de résider depuis six mois dans la commune.',
    },
    {
      ...P.president,
      q: 'Qui est élu président de la République le 10 décembre 1848 ?',
      a: 'Louis-Napoléon Bonaparte',
      wrong: [
        { label: 'Louis-Philippe', why: 'Louis-Philippe est le roi qui abdique en février 1848.' },
        { label: 'Guizot', why: 'Guizot est un ministre de la monarchie de Juillet, écarté en 1848.' },
        { label: 'Napoléon Ier', why: 'Le président élu en 1848 est son neveu.' },
      ],
      gap: ['Le 10 décembre 1848, Louis-Napoléon ', ' est élu président de la République.', ['Bonaparte']],
      explain: 'C’est le neveu de Napoléon Ier.',
    },
    {
      ...P.ouvriers1850,
      q: 'Quelle catégorie la loi électorale de 1850 écarte-t-elle surtout du vote ?',
      a: 'une bonne partie des ouvriers',
      wrong: [
        { label: 'les grands propriétaires', why: 'Ceux qui restent longtemps au même endroit ne sont pas visés.' },
        {
          label: 'tous les paysans',
          why: 'La condition de résidence touche surtout ceux qui changent souvent de domicile.',
        },
        { label: 'les femmes, jusque-là électrices', why: 'Les femmes ne votaient pas avant 1850.' },
      ],
      gap: ['La loi de 1850 exige trois ans de résidence : elle exclut beaucoup d’', '.', ['ouvriers', 'ouvrier']],
      explain: 'Beaucoup d’ouvriers changent d’emploi et de domicile : ils ne remplissent pas la condition.',
    },
    {
      ...P.candidats,
      q: 'Sous le Second Empire, comment le gouvernement pèse-t-il sur les élections des députés ?',
      a: 'en soutenant des candidats officiels',
      wrong: [
        { label: 'en rétablissant le cens', why: 'Le suffrage universel masculin est maintenu.' },
        { label: 'en donnant le vote aux femmes', why: 'Les femmes ne votent pas sous le Second Empire.' },
        { label: 'en supprimant toutes les élections', why: 'On continue d’élire les députés.' },
      ],
      gap: ['Sous l’Empire, les préfets soutiennent ouvertement les candidats ', '.', ['officiels']],
      explain: 'Le vote existe, mais il est encadré par le pouvoir, surtout de 1852 à 1860.',
    },
    {
      ...P.plebiscite,
      q: 'Comment l’empereur établit-il un lien direct avec le peuple ?',
      a: 'par le plébiscite',
      wrong: [
        { label: 'par le cens', why: 'Le cens limite le nombre d’électeurs ; il ne consulte pas le peuple.' },
        { label: 'par la Commune de Paris', why: 'La Commune apparaît après la chute de l’Empire, en 1871.' },
        { label: 'par les Trois Glorieuses', why: 'Il s’agit du soulèvement de 1830.' },
      ],
      gap: ['L’empereur consulte directement le peuple par le ', '.', ['plébiscite', 'plebiscite']],
      explain: 'Le plébiscite passe par-dessus les assemblées.',
    },
    {
      ...P.fevrier1848,
      q: 'Quel roi abdique le 24 février 1848 ?',
      a: 'Louis-Philippe',
      wrong: [
        { label: 'Charles X', why: 'Charles X abdique en 1830, après les Trois Glorieuses.' },
        { label: 'Napoléon III', why: 'Napoléon III arrive au pouvoir après 1848.' },
        { label: 'Louis XVI', why: 'Louis XVI est le roi de la Révolution française.' },
      ],
      gap: ['Le 24 février 1848, le roi Louis-', ' abdique.', ['Philippe']],
      explain: 'Sa chute ouvre la voie à la Deuxième République.',
    },
  ],
  paires3: [
    ['Suffrage censitaire', 'Vote réservé à ceux qui paient le cens'],
    ['Suffrage universel masculin', 'Vote ouvert aux hommes sans condition de fortune'],
    ['Plébiscite', 'Consultation directe du peuple par le pouvoir'],
  ],
  paires5: [
    ['Restauration', 'Environ 100 000 électeurs'],
    ['Monarchie de Juillet', 'Cens abaissé à 200 francs en 1831'],
    ['Deuxième République', 'Suffrage universel masculin instauré'],
    ['Second Empire', 'Candidats officiels soutenus par les préfets'],
    ['Loi de 1850', 'Corps électoral réduit'],
  ],
  frise: [
    { ...P.glorieuses, label: 'Les Trois Glorieuses font tomber Charles X', date: '1830' },
    { ...P.loi1831, label: 'Une loi abaisse le cens à 200 francs', date: '1831' },
    { ...P.decretUniversel, label: 'Le suffrage universel masculin est instauré', date: '1848' },
    { ...P.restriction1850, label: 'Une loi réduit le nombre d’électeurs', date: '1850' },
    { ...P.coupDEtat, label: 'Coup d’État de Louis-Napoléon Bonaparte', date: '1851' },
    { ...P.empire1852, label: 'Le Second Empire est proclamé', date: '1852' },
  ],
  libres: [
    {
      ...P.censitaire,
      q: 'comment appelle-t-on le suffrage réservé à ceux qui paient le cens ?',
      accepted: ['censitaire', 'suffrage censitaire', 'le suffrage censitaire'],
      traps: [
        { text: 'universel', why: 'Le suffrage universel ne demande pas de condition de fortune.' },
        { text: 'suffrage universel', why: 'Le suffrage universel ne demande pas de condition de fortune.' },
      ],
      explain: 'Le mot vient de « cens », l’impôt qu’il fallait payer pour voter.',
    },
    {
      ...P.cens,
      q: 'comment appelle-t-on le montant d’impôt qu’il fallait payer pour voter sous la Restauration et la monarchie de Juillet ?',
      accepted: ['cens', 'le cens', 'cens électoral', 'le cens électoral'],
      traps: [
        { text: 'dîme', why: 'La dîme est un impôt d’Ancien Régime versé à l’Église.' },
        { text: 'plébiscite', why: 'Le plébiscite est une consultation du peuple, pas un impôt.' },
      ],
      explain: 'Le cens électoral fixe qui peut voter ou être élu.',
    },
    {
      ...P.decretUniversel,
      q: 'en quelle année le suffrage universel masculin est-il instauré par la Deuxième République ?',
      accepted: ['1848', 'en 1848'],
      traps: [
        { text: '1830', why: '1830 est l’année des Trois Glorieuses : le suffrage reste censitaire.' },
        { text: '1852', why: '1852 est l’année où le Second Empire est proclamé.' },
      ],
      explain: 'Le décret du 5 mars 1848 suit la proclamation de la République, après l’abdication de Louis-Philippe.',
    },
    {
      ...P.plebiscite,
      q: 'quel nom désigne la consultation directe du peuple à laquelle Napoléon III recourt souvent ?',
      accepted: ['plébiscite', 'le plébiscite', 'un plébiscite', 'plebiscite', 'le plebiscite'],
      traps: [
        { text: 'cens', why: 'Le cens est un montant d’impôt lié au vote censitaire.' },
        { text: 'ordonnance', why: 'Une ordonnance est un texte pris par le pouvoir, sans consulter le peuple.' },
      ],
      explain: 'Par le plébiscite, l’empereur s’adresse au peuple par-dessus les assemblées.',
    },
  ],
  docs: [
    {
      title: 'Le registre d’un maire en 1840',
      lines: [
        'Un texte fictif décrit un village sous la monarchie de Juillet.',
        '« Seuls Monsieur le notaire et deux gros propriétaires voteront pour le député. »',
        '« Le charron, qui paie trop peu d’impôt, n’a pas ce droit. »',
      ],
      qs: [
        {
          ...P.censitaire,
          q: 'Quel mode de suffrage ce texte décrit-il ?',
          a: 'le suffrage censitaire',
          wrong: [
            { label: 'le suffrage universel masculin', why: 'Avec lui, le charron voterait quel que soit son impôt.' },
            {
              label: 'le plébiscite',
              why: 'Le texte parle de l’élection d’un député selon l’impôt, pas d’une consultation du peuple.',
            },
          ],
          explain: 'Seuls ceux qui paient assez d’impôt votent : c’est le suffrage censitaire.',
        },
        {
          ...P.exclu,
          q: 'Que montre ce texte sur la place du peuple dans la vie politique avant 1848 ?',
          a: 'la plupart des habitants sont écartés du vote',
          wrong: [
            { label: 'tous les habitants participent à l’élection', why: 'Trois personnes seulement votent.' },
            { label: 'les femmes dirigent le scrutin', why: 'Le texte ne montre aucune femme votant.' },
          ],
          explain: 'De 1815 à 1848, le peuple est officiellement exclu de la vie politique.',
        },
      ],
    },
    {
      title: 'La lettre d’un ouvrier en mai 1848',
      lines: [
        'Une lettre fictive est écrite par un ouvrier français de 30 ans.',
        '« Le 23 avril, j’ai voté pour la première fois, avec tous les hommes de ma rue. »',
        '« Ma sœur, elle, est restée à la maison : le droit de vote ne lui est pas reconnu. »',
      ],
      qs: [
        {
          ...P.decretUniversel,
          q: 'Quelle réforme récente permet à cet homme de voter ?',
          a: 'le décret instaurant le suffrage universel masculin',
          wrong: [
            { label: 'la loi de 1831 sur le cens', why: 'Cette loi gardait un suffrage censitaire.' },
            { label: 'la loi électorale de 1850', why: 'Elle restreint le vote et date d’après la lettre.' },
          ],
          explain: 'Le décret du 5 mars 1848 ouvre le vote aux hommes de 21 ans au moins, sans condition de fortune.',
        },
        {
          ...P.masculin,
          q: 'Quelle limite du suffrage de 1848 la dernière phrase révèle-t-elle ?',
          a: 'les femmes ne votent pas',
          wrong: [
            { label: 'les ouvriers ne votent pas', why: 'L’auteur, un ouvrier, vient de voter.' },
            { label: 'seuls les riches votent', why: 'La condition de fortune est supprimée.' },
          ],
          explain: 'Le suffrage de 1848 est universel mais seulement masculin.',
        },
      ],
    },
    {
      title: 'Les élections sous l’Empire',
      lines: [
        'Un récit fictif d’un électeur en 1857.',
        '« L’affiche du préfet désigne clairement le candidat que le gouvernement soutient. »',
        '« Les adversaires ont bien du mal à se faire entendre. »',
      ],
      qs: [
        {
          ...P.candidats,
          q: 'Quelle pratique du Second Empire ce récit montre-t-il ?',
          a: 'la candidature officielle',
          wrong: [
            { label: 'le suffrage censitaire', why: 'Le texte ne parle pas d’impôt à payer.' },
            {
              label: 'le tirage au sort des députés',
              why: 'Les députés sont élus, mais le pouvoir favorise un candidat.',
            },
          ],
          explain: 'Les préfets désignent et soutiennent ouvertement des candidats officiels.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la Troisième République ———

const republique: Notion = {
  id: 'h4-troisieme-republique',
  title: 'La Troisième République',
  hint: 'Relis le mémo : suis les dates depuis 1870, puis les grandes lois et les crises.',
  memo: [
    'La République est proclamée le 4 septembre 1870, deux jours après la défaite de Sedan. Au printemps 1871, la **Commune de Paris**, insurrection du 18 mars au 28 mai, est réprimée. L’avenir du régime est incertain ; les **lois constitutionnelles** de 1875 (l’amendement Wallon est voté à une seule voix) l’affermissent, et la crise du 16 mai 1877 oppose le président Mac-Mahon à la majorité républicaine de la Chambre.',
    'Il s’agit d’unir la nation autour de la République, par l’école, la mairie et la caserne : la Marseillaise devient hymne national en 1879 et le 14 juillet fête nationale en 1880 ; avec les lois de Jules Ferry, l’école devient gratuite (1881), obligatoire et laïque (1882) ; les conseils municipaux élisent leur maire (loi de 1884), la loi de 1889 sur la **conscription** obligatoire renforce le service militaire et des lois accordent des libertés, dont les opposants peuvent aussi se servir : presse (1881), syndicats (1884), associations (1901). L’**isoloir** arrive en 1903.',
    'La République reste discutée. L’**affaire Dreyfus** (1894-1906) divise le pays : le capitaine Alfred Dreyfus, officier juif, est injustement accusé de trahison et condamné en 1894 ; Émile Zola publie « J’accuse…! » dans le journal L’Aurore le 13 janvier 1898 ; Dreyfus est réhabilité en 1906. La loi du 9 décembre 1905, de **Séparation des Églises et de l’État**, assure la liberté de conscience, ne reconnaît, ne salarie ni ne subventionne aucun culte, et met fin au Concordat de 1802 : c’est un pas majeur de la **laïcité**.',
  ],
  faits: [
    {
      ...P.septembre1870,
      q: 'Quand la République est-elle proclamée après la défaite de Sedan ?',
      a: 'le 4 septembre 1870',
      wrong: [
        { label: 'le 14 juillet 1789', why: 'Cette date est celle de la prise de la Bastille.' },
        { label: 'le 9 décembre 1905', why: 'C’est la date de la loi de Séparation.' },
        { label: 'le 2 décembre 1852', why: 'Ce jour-là, le Second Empire est proclamé.' },
      ],
      gap: ['La République est proclamée le 4 septembre ', ', après Sedan.', ['1870']],
      explain: 'La défaite de l’Empire à Sedan ouvre la voie à la République.',
    },
    {
      ...P.commune,
      q: 'Quel mouvement insurrectionnel secoue Paris de mars à mai 1871 ?',
      a: 'la Commune de Paris',
      wrong: [
        { label: 'les Trois Glorieuses', why: 'Elles ont lieu en juillet 1830.' },
        { label: 'les journées de juin', why: 'Elles datent de 1848.' },
        { label: 'la prise de la Bastille', why: 'Elle date de 1789.' },
      ],
      gap: ['De mars à mai 1871, Paris connaît l’insurrection de la ', ' de Paris.', ['Commune']],
      explain: 'Ce mouvement social et politique est réprimé par le gouvernement de Thiers.',
    },
    {
      ...P.lois1875,
      q: 'Quels textes de 1875 affirment la Troisième République ?',
      a: 'les trois lois constitutionnelles',
      wrong: [
        { label: 'le Code civil', why: 'Le Code civil date de 1804.' },
        { label: 'les ordonnances de Charles X', why: 'Elles datent de 1830.' },
        { label: 'le décret du 5 mars', why: 'Ce décret de 1848 concerne le suffrage universel.' },
      ],
      gap: ['En 1875, la République s’affirme par trois lois ', '.', ['constitutionnelles']],
      explain: 'Ces lois organisent les pouvoirs publics, avec deux assemblées et un président.',
    },
    {
      ...P.crise1877,
      q: 'Lors de la crise du 16 mai 1877, à qui le président Mac-Mahon s’oppose-t-il ?',
      a: 'à la majorité républicaine de la Chambre',
      wrong: [
        { label: 'à la Commune de Paris', why: 'La Commune est réprimée en 1871.' },
        { label: 'à Louis-Philippe', why: 'Louis-Philippe a quitté le pouvoir en 1848.' },
        { label: 'à l’armée', why: 'Le conflit de 1877 oppose le président à la majorité de la Chambre.' },
      ],
      gap: ['En 1877, Mac-Mahon s’oppose à la majorité ', ' de la Chambre.', ['républicaine', 'republicaine']],
      explain: 'Après cette crise, les ministres ne sont plus responsables que devant les chambres.',
    },
    {
      ...P.marseillaise,
      q: 'Quel chant devient l’hymne national en 1879 ?',
      a: 'la Marseillaise',
      wrong: [
        { label: 'la Marianne', why: 'Marianne est une figure qui représente la République, pas un chant.' },
        { label: 'la devise', why: 'La devise « Liberté, Égalité, Fraternité » n’est pas un hymne.' },
        { label: 'le drapeau tricolore', why: 'Le drapeau est un emblème, pas un chant.' },
      ],
      gap: ['En 1879, la ', ' devient l’hymne national.', ['Marseillaise']],
      explain: 'Les symboles servent à unir la nation autour de la République.',
    },
    {
      ...P.ecole,
      q: 'Que prévoient les lois de Jules Ferry en 1881 et 1882 pour l’école ?',
      a: 'la gratuité, l’obligation et la laïcité',
      wrong: [
        {
          label: 'l’école réservée aux garçons',
          why: 'L’instruction obligatoire concerne les enfants des deux sexes.',
        },
        { label: 'la fermeture des écoles publiques', why: 'La République développe au contraire l’école.' },
        { label: 'un enseignement payant et religieux', why: 'Les lois rendent l’école gratuite et laïque.' },
      ],
      gap: ['Les lois Ferry rendent l’école gratuite, obligatoire et ', '.', ['laïque', 'laique']],
      explain: 'La gratuité est votée en 1881, l’obligation et la laïcité en 1882.',
    },
    {
      ...P.maires,
      q: 'Depuis la loi de 1884, qui élit le maire de la commune ?',
      a: 'le conseil municipal',
      wrong: [
        { label: 'le préfet', why: 'La loi de 1884 confie ce choix au conseil municipal.' },
        { label: 'le président de la République', why: 'Le président ne choisit pas les maires.' },
        { label: 'les sénateurs', why: 'Les sénateurs siègent au Parlement ; ils n’élisent pas le maire.' },
      ],
      gap: ['Depuis 1884, les conseils ', ' élisent leur maire.', ['municipaux']],
      explain: 'La mairie devient un lieu de la démocratie locale.',
    },
    {
      ...P.conscription,
      q: 'Quelle loi de 1889 fait de la caserne un lieu de la culture républicaine ?',
      a: 'la conscription obligatoire',
      wrong: [
        { label: 'la liberté de la presse', why: 'Cette loi date de 1881 et ne concerne pas l’armée.' },
        { label: 'l’autorisation des syndicats', why: 'Elle date de 1884.' },
        { label: 'la liberté d’association', why: 'Elle date de 1901.' },
      ],
      gap: ['En 1889, une loi porte sur la ', ' obligatoire.', ['conscription']],
      explain: 'Le service militaire réunit les jeunes hommes autour de la nation.',
    },
    {
      ...P.injustement,
      q: 'De quoi le capitaine Alfred Dreyfus est-il injustement accusé ?',
      a: 'de trahison',
      wrong: [
        { label: 'de refus de voter', why: 'L’affaire ne porte pas sur le vote.' },
        {
          label: 'd’avoir publié un journal',
          why: 'C’est Zola qui publie un article dans un journal, pour le défendre.',
        },
        { label: 'de vol', why: 'L’accusation est bien plus grave : elle touche à la trahison.' },
      ],
      gap: ['Alfred Dreyfus est injustement accusé de ', '.', ['trahison']],
      explain: 'Cette erreur judiciaire déclenche une crise politique qui divise la France.',
    },
    {
      ...P.jaccuse,
      q: 'Qui défend Dreyfus en publiant « J’accuse…! » en 1898 ?',
      a: 'Émile Zola',
      wrong: [
        { label: 'Jules Ferry', why: 'Jules Ferry est connu pour ses lois scolaires.' },
        { label: 'Adolphe Thiers', why: 'Thiers dirige le gouvernement en 1871.' },
        { label: 'Mac-Mahon', why: 'Mac-Mahon est le président de la crise de 1877.' },
      ],
      gap: ['« J’accuse…! » est publié par Émile ', ' en 1898.', ['Zola']],
      explain: 'L’écrivain Zola prend la défense de Dreyfus dans le journal L’Aurore.',
    },
    {
      ...P.separation,
      q: 'Que dit la loi de 1905 au sujet des cultes ?',
      a: 'la République ne reconnaît, ne salarie ni ne subventionne aucun culte',
      wrong: [
        {
          label: 'la République choisit une religion d’État',
          why: 'La loi sépare au contraire les Églises et l’État.',
        },
        { label: 'la pratique d’une religion est interdite', why: 'La loi assure la liberté de conscience.' },
        { label: 'l’État paie les ministres du culte', why: 'C’était le cas avant 1905, sous le régime du Concordat.' },
      ],
      gap: ['La loi de 1905 sépare les Églises et l’', '.', ['État', 'Etat']],
      explain: 'L’État se veut neutre envers les religions.',
    },
  ],
  paires3: [
    ['Commune de Paris', 'Insurrection réprimée en 1871'],
    ['Affaire Dreyfus', 'Erreur judiciaire qui divise la France'],
    ['Loi de 1905', 'Séparation des Églises et de l’État'],
  ],
  paires5: [
    ['1879', 'La Marseillaise devient hymne national'],
    ['1880', 'Le 14 juillet devient fête nationale'],
    ['1884', 'Les syndicats sont autorisés'],
    ['1889', 'Une loi sur la conscription obligatoire est votée'],
    ['1901', 'La liberté d’association est reconnue'],
  ],
  frise: [
    { ...P.septembre1870, label: 'La République est proclamée', date: '1870' },
    { ...P.commune, label: 'La Commune de Paris est réprimée', date: '1871' },
    { ...P.crise1877, label: 'Crise entre Mac-Mahon et les républicains', date: '1877' },
    { ...P.maires, label: 'Les conseils municipaux élisent leur maire', date: '1884' },
    { ...P.condamnation, label: 'Condamnation du capitaine Dreyfus', date: '1894' },
    { ...P.separation, label: 'Loi de Séparation des Églises et de l’État', date: '1905' },
  ],
  libres: [
    {
      ...P.jaccuse,
      q: 'quel écrivain publie « J’accuse…! » pour défendre Dreyfus ?',
      accepted: ['Zola', 'Émile Zola', 'Emile Zola'],
      traps: [
        { text: 'Clemenceau', why: 'Clemenceau dirige le journal et trouve le titre, mais Zola écrit l’article.' },
        { text: 'Jules Ferry', why: 'Jules Ferry est connu pour ses lois sur l’école.' },
      ],
      explain: 'La publication de 1898 fait de la condamnation une affaire nationale.',
    },
    {
      ...P.separation,
      q: 'en quelle année la loi de Séparation des Églises et de l’État est-elle adoptée ?',
      accepted: ['1905', 'en 1905'],
      traps: [
        { text: '1882', why: '1882 est l’année de l’école obligatoire et laïque.' },
        { text: '1901', why: '1901 est l’année de la loi sur la liberté d’association.' },
      ],
      explain: 'La loi du 9 décembre 1905 organise la séparation.',
    },
    {
      ...P.commune,
      q: 'comment s’appelle l’insurrection parisienne réprimée au printemps 1871 ?',
      accepted: ['Commune', 'la Commune', 'Commune de Paris', 'la Commune de Paris'],
      traps: [
        { text: 'Trois Glorieuses', why: 'Elles datent de juillet 1830.' },
        { text: 'journées de juin', why: 'Les journées de juin datent de 1848.' },
      ],
      explain: 'La Commune dure du 18 mars au 28 mai 1871.',
    },
    {
      ...P.laicite,
      q: 'quel principe désigne la neutralité religieuse et l’indépendance à l’égard des Églises ?',
      accepted: ['laïcité', 'la laïcité', 'laicite', 'la laicite'],
      traps: [
        { text: 'conscription', why: 'La conscription concerne le service dans l’armée.' },
        { text: 'plébiscite', why: 'Le plébiscite est une consultation du peuple.' },
      ],
      explain: 'La loi de 1905 est un texte majeur de ce principe.',
    },
  ],
  docs: [
    {
      title: 'Le journal d’une institutrice',
      lines: [
        'Un texte fictif de 1883.',
        '« Dans ma classe, les familles ne paient plus et tous les enfants doivent venir. »',
        '« On n’y enseigne plus de leçon de religion. »',
      ],
      qs: [
        {
          ...P.ecole,
          q: 'Quelles caractéristiques de l’école républicaine le texte montre-t-il ?',
          a: 'gratuité, obligation et laïcité',
          wrong: [
            { label: 'école payante et facultative', why: 'Les familles ne paient plus et les enfants doivent venir.' },
            { label: 'école réservée aux garçons riches', why: 'Le texte dit que tous les enfants doivent venir.' },
          ],
          explain: 'Les lois de 1881 et 1882 instaurent ces trois principes.',
        },
        {
          ...P.lieux,
          q: 'Pourquoi la République accorde-t-elle tant d’importance à l’école ?',
          a: 'pour construire une culture républicaine commune',
          wrong: [
            { label: 'pour rétablir la monarchie', why: 'La République cherche à s’affermir, pas à disparaître.' },
            { label: 'pour rendre le vote censitaire', why: 'Le suffrage universel masculin est conservé.' },
          ],
          explain: 'L’école, la mairie et la caserne sont des lieux où se construit la culture républicaine.',
        },
      ],
    },
    {
      title: 'Une famille divisée',
      lines: [
        'Un récit fictif de 1898.',
        '« À table, mon oncle assure que le capitaine est coupable ; ma tante soutient l’écrivain. »',
        '« Depuis l’article paru dans le journal, on se dispute chaque soir. »',
      ],
      qs: [
        {
          ...P.dreyfus,
          q: 'De quelle affaire cette famille parle-t-elle ?',
          a: 'l’affaire Dreyfus',
          wrong: [
            { label: 'la crise du 16 mai 1877', why: 'Le texte date de 1898 et parle d’un capitaine accusé.' },
            { label: 'la loi de Séparation', why: 'La Séparation date de 1905 et ne juge pas un officier.' },
          ],
          explain: 'L’affaire Dreyfus remet en jeu les principes de la République et divise la société.',
        },
        {
          ...P.rehabilite,
          q: 'Comment cette affaire se termine-t-elle pour le capitaine ?',
          a: 'il est réhabilité en 1906',
          wrong: [
            { label: 'il est condamné définitivement', why: 'Son innocence finit par être reconnue.' },
            {
              label: 'il devient président de la République',
              why: 'Il réintègre l’armée ; il ne devient pas président.',
            },
          ],
          explain: 'Dreyfus est réintégré dans l’armée en 1906.',
        },
      ],
    },
    {
      title: 'Le débat de 1905',
      lines: [
        'Un résumé fictif d’une discussion à la mairie.',
        '« Chacun pourra croire ou ne pas croire librement. »',
        '« En revanche, l’argent public ne paiera plus les ministres des cultes. »',
      ],
      qs: [
        {
          ...P.conscience,
          q: 'À quelle loi ce débat se rapporte-t-il ?',
          a: 'la loi de Séparation des Églises et de l’État',
          wrong: [
            { label: 'la loi sur la liberté de la presse', why: 'Elle concerne les journaux et l’affichage.' },
            { label: 'la loi sur la conscription', why: 'Elle concerne le service dans l’armée.' },
          ],
          explain: 'La loi de 1905 assure la liberté de conscience et ne salarie aucun culte.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : conditions féminines ———

const femmes: Notion = {
  id: 'h4-conditions-feminines',
  title: 'Conditions féminines dans une société en mutation',
  hint: 'Relis le mémo : cherche les droits refusés ou obtenus, le travail des femmes et leurs revendications.',
  memo: [
    'En 1804, le Code civil consacre l’**incapacité juridique** de la femme mariée, soumise à l’autorité de son mari, alors que les filles majeures et les veuves peuvent gérer leurs biens. Au XIXe siècle, les femmes restent exclues de la vie politique.',
    'Elles travaillent pourtant beaucoup : 6,2 millions de femmes sont actives en 1866, soit un tiers de la population active, un chiffre sans doute sous-évalué (femmes d’agriculteurs, d’artisans, de commerçants). Ouvrières, paysannes, **ménagères** ou bourgeoises, leurs conditions diffèrent ; les femmes forment un tiers des ouvriers. Elles participent aux grèves, notamment dans le textile. Des femmes aisées fondent des associations pour aider celles qui travaillent.',
    'Elles gagnent peu à peu des droits : première **bachelière** en 1861, enseignement secondaire féminin en 1867 et 1880, première femme à l’externat de médecine en 1881, droit de plaider comme avocates en 1900, libre disposition de leur salaire et droit d’élire et d’être élues aux **prud’hommes** en 1907, congé de maternité de 8 semaines non payé en 1909. Le **féminisme** revendique le droit de vote dès 1848, avec Eugénie Niboyet (journal « La voix des femmes »), puis Hubertine Auclert (« La Citoyenne », 1881), Marguerite Durand (« La Fronde », 1897) et l’Union française pour le suffrage des femmes (1909) : le droit de vote n’est pas obtenu avant la Première Guerre mondiale (les femmes l’obtiendront en 1944).',
  ],
  faits: [
    {
      ...P.codeCivil,
      q: 'Quel texte de 1804 consacre l’infériorité juridique de la femme mariée ?',
      a: 'le Code civil',
      wrong: [
        { label: 'la loi de 1905', why: 'La loi de 1905 sépare les Églises et l’État.' },
        { label: 'le décret du 5 mars 1848', why: 'Ce décret porte sur le suffrage universel masculin.' },
        { label: 'les lois Ferry', why: 'Elles organisent l’école gratuite, obligatoire et laïque.' },
      ],
      gap: ['En 1804, le ', ' civil consacre l’infériorité de la femme mariée.', ['Code', 'code']],
      explain: 'On l’appelle aussi code napoléonien : il place la femme mariée sous l’autorité du mari.',
    },
    {
      ...P.autorite,
      q: 'À l’autorité de qui la femme mariée est-elle soumise d’après le Code civil ?',
      a: 'de son mari',
      wrong: [
        { label: 'de son fils aîné', why: 'Le Code place la femme mariée sous l’autorité de l’époux.' },
        { label: 'du maire seul', why: 'La dépendance est d’abord familiale, envers le mari.' },
        { label: 'de personne', why: 'La femme mariée est juridiquement dépendante.' },
      ],
      gap: ['Les femmes mariées sont soumises à l’autorité du ', '.', ['mari', 'époux', 'epoux']],
      explain: 'Au nom de la famille, le Code civil fait de l’époux le chef.',
    },
    {
      ...P.exclues,
      q: 'Quelle est la situation politique des femmes au XIXe siècle ?',
      a: 'elles sont exclues de la vie politique',
      wrong: [
        { label: 'elles votent à toutes les élections', why: 'Le suffrage « universel » est masculin.' },
        { label: 'elles dirigent les communes', why: 'Elles ne sont ni électrices ni élues aux élections politiques.' },
        { label: 'elles votent depuis 1848', why: 'En 1848, seuls les hommes obtiennent le vote.' },
      ],
      gap: ['Au XIXe siècle, les femmes restent ', ' de la vie politique.', ['exclues', 'écartées']],
      explain: 'Cette exclusion dure plus longtemps en France que dans certains pays.',
    },
    {
      ...P.actives,
      q: 'En 1866, quelle part de la population active les femmes représentent-elles environ ?',
      a: 'un tiers',
      wrong: [
        { label: 'aucune', why: 'Les femmes sont 6,2 millions à être actives.' },
        { label: 'les neuf dixièmes', why: 'Cette part est bien trop grande.' },
        { label: 'un dixième', why: 'La part est bien plus importante.' },
      ],
      gap: ['En 1866, les femmes forment un ', ' de la population active.', ['tiers', '1/3']],
      explain: 'Le travail féminin est une réalité ancienne et massive.',
    },
    {
      ...P.textile,
      q: 'Dans quel secteur, où les femmes sont nombreuses, des grèves se produisent-elles ?',
      a: 'le textile',
      wrong: [
        {
          label: 'les mines',
          why: 'Le travail dans les mines est surtout masculin ; cherche un secteur où les ouvrières dominent.',
        },
        { label: 'l’armée', why: 'L’armée n’emploie pas les femmes comme ouvrières.' },
        {
          label: 'la métallurgie',
          why: 'La métallurgie emploie surtout des hommes ; cherche un secteur où les ouvrières dominent.',
        },
      ],
      gap: ['Des grèves se produisent là où le travail féminin domine, comme dans le ', '.', ['textile']],
      explain: 'Les ouvrières se mobilisent, même si elles sont moins syndiquées que les hommes.',
    },
    {
      ...P.salaire,
      q: 'Quel droit les femmes obtiennent-elles en 1907 ?',
      a: 'la libre disposition de leur salaire',
      wrong: [
        {
          label: 'le droit de vote aux élections législatives',
          why: 'Ce droit n’est pas obtenu au XIXe siècle ni en 1907.',
        },
        { label: 'l’égalité complète avec les hommes', why: 'La femme mariée reste soumise au Code civil.' },
        {
          label: 'la suppression du travail des femmes',
          why: 'La loi leur donne au contraire la maîtrise de leur salaire.',
        },
      ],
      gap: ['En 1907, les femmes obtiennent la libre disposition de leur ', '.', ['salaire']],
      explain: 'Une femme peut désormais disposer elle-même de l’argent qu’elle gagne.',
    },
    {
      ...P.prudhommes,
      q: 'En 1907, à quelles élections les femmes deviennent-elles électrices et éligibles ?',
      a: 'aux tribunaux des prud’hommes',
      wrong: [
        { label: 'à la Chambre des députés', why: 'La Chambre reste élue par les seuls hommes.' },
        { label: 'au Sénat', why: 'Les femmes ne sont pas électrices du Sénat.' },
        { label: 'à la présidence de la République', why: 'Les femmes ne votent pas à cette élection.' },
      ],
      gap: ['En 1907, les femmes votent aux tribunaux des ', '.', ['prud’hommes', "prud'hommes", 'prudhommes']],
      explain: 'Les prud’hommes jugent les conflits du travail.',
    },
    {
      ...P.bacheliere,
      q: 'En quelle année la première bachelière est-elle diplômée ?',
      a: '1861',
      wrong: [
        { label: '1804', why: '1804 est l’année du Code civil.' },
        { label: '1907', why: '1907 est l’année de la libre disposition du salaire.' },
        { label: '1944', why: '1944 est l’année où les femmes obtiennent le droit de vote.' },
      ],
      gap: ['La première bachelière est diplômée en ', '.', ['1861']],
      explain: 'Les femmes rattrapent peu à peu leur retard d’instruction.',
    },
    {
      ...P.avocates,
      q: 'En 1900, quel métier de la justice s’ouvre aux femmes, avec le droit de plaider ?',
      a: 'celui d’avocate',
      wrong: [
        { label: 'celui de députée', why: 'Les femmes restent exclues de la vie politique.' },
        {
          label: 'celui de préfète',
          why: 'Un préfet représente le gouvernement ; il ne plaide pas devant les tribunaux.',
        },
        {
          label: 'celui d’officier',
          why: 'Un officier sert dans l’armée ; plaider, c’est défendre quelqu’un devant un tribunal.',
        },
      ],
      gap: ['En 1900, les femmes ont le droit de plaider comme ', '.', ['avocates', 'avocate']],
      explain: 'C’est une des avancées de la fin du siècle.',
    },
    {
      ...P.vote,
      q: 'Quelle revendication, présente dès 1848, n’aboutit pas avant la Première Guerre mondiale ?',
      a: 'le droit de vote',
      wrong: [
        { label: 'le droit de travailler', why: 'Les femmes travaillent déjà en grand nombre.' },
        { label: 'le droit de passer le baccalauréat', why: 'La première bachelière date de 1861.' },
        { label: 'le droit de plaider comme avocates', why: 'Les femmes l’obtiennent en 1900.' },
      ],
      gap: ['Dès 1848, des femmes réclament le droit de ', ', sans l’obtenir.', ['vote', 'voter']],
      explain: 'Des militantes comme Hubertine Auclert portent cette demande.',
    },
    {
      ...P.fronde,
      q: 'Quel journal quotidien Marguerite Durand crée-t-elle en 1897 ?',
      a: 'La Fronde',
      wrong: [
        { label: 'L’Aurore', why: 'L’Aurore publie « J’accuse…! » en 1898.' },
        { label: 'La voix des femmes', why: 'Ce journal est lié à Eugénie Niboyet, en 1848.' },
        { label: 'La Citoyenne', why: 'La Citoyenne est lancée par Hubertine Auclert en 1881.' },
      ],
      gap: ['En 1897, Marguerite Durand crée le journal La ', '.', ['Fronde']],
      explain: 'Les féministes fondent des journaux pour défendre leur cause.',
    },
    {
      ...P.niboyet,
      q: 'Quel journal Eugénie Niboyet crée-t-elle en 1848 ?',
      a: 'La voix des femmes',
      wrong: [
        { label: 'L’Aurore', why: 'L’Aurore publie « J’accuse…! » en 1898.' },
        { label: 'La Fronde', why: 'La Fronde est créée par Marguerite Durand en 1897.' },
        { label: 'La Citoyenne', why: 'La Citoyenne est lancée par Hubertine Auclert en 1881.' },
      ],
      gap: ['En 1848, Eugénie Niboyet crée « La voix des ', ' ».', ['femmes']],
      explain: 'En 1848, des femmes réclament leur place dans la nouvelle République.',
    },
    {
      ...P.ufsf,
      q: 'Quelle association, créée en 1909, réclame le droit de vote des femmes ?',
      a: 'l’Union française pour le suffrage des femmes',
      wrong: [
        { label: 'la Commune de Paris', why: 'La Commune est une insurrection de 1871.' },
        { label: 'le Sénat', why: 'Le Sénat est une assemblée élue par des hommes.' },
        { label: 'le conseil des prud’hommes', why: 'Les prud’hommes jugent les conflits du travail.' },
      ],
      gap: ['En 1909 est créée l’Union française pour le ', ' des femmes.', ['suffrage']],
      explain: 'Les militantes s’organisent en associations.',
    },
    {
      ...P.ouvrieres,
      q: 'En France, au XIXe siècle, quelle part des ouvriers les femmes représentent-elles ?',
      a: 'le tiers',
      wrong: [
        { label: 'aucune', why: 'De nombreuses femmes travaillent comme ouvrières.' },
        { label: 'la totalité', why: 'Les hommes sont aussi nombreux dans les usines.' },
        { label: 'un centième', why: 'La part est bien plus importante.' },
      ],
      gap: ['En France, les femmes représentent le ', ' des ouvriers.', ['tiers', '1/3']],
      explain: 'Les ouvrières sont une part importante du monde industriel.',
    },
    {
      ...P.bourgeoises,
      q: 'Que font certaines femmes des élites ou de la moyenne bourgeoisie ?',
      a: 'elles agissent dans des associations pour les femmes qui travaillent',
      wrong: [
        { label: 'elles siègent à la Chambre des députés', why: 'Les femmes sont exclues de la vie politique.' },
        { label: 'elles votent à la place des ouvrières', why: 'Aucune femme ne vote aux élections politiques.' },
        {
          label: 'elles interdisent à toutes les femmes de s’instruire',
          why: 'Les associations visent au contraire à améliorer les conditions des femmes.',
        },
      ],
      gap: [
        'Des femmes aisées fondent des ',
        ' pour aider les femmes qui travaillent.',
        ['associations', 'association'],
      ],
      explain: 'Les conditions diffèrent d’un milieu à l’autre, mais certaines femmes aisées s’engagent.',
    },
  ],
  paires3: [
    ['Code civil (1804)', 'Infériorité juridique de la femme mariée'],
    ['Loi de 1907', 'Libre disposition du salaire'],
    ['Féminisme', 'Mouvement qui réclame des droits pour les femmes'],
  ],
  paires5: [
    ['Eugénie Niboyet', 'La voix des femmes, 1848'],
    ['Hubertine Auclert', 'La Citoyenne, 1881'],
    ['Marguerite Durand', 'La Fronde, 1897'],
    ['1861', 'Première bachelière diplômée'],
    ['1909', 'Congé de maternité de 8 semaines'],
  ],
  frise: [
    { ...P.codeCivil, label: 'Le Code civil est publié', date: '1804' },
    { ...P.bacheliere, label: 'La première bachelière est diplômée', date: '1861' },
    { ...P.auclert, label: 'Hubertine Auclert lance La Citoyenne', date: '1881' },
    { ...P.avocates, label: 'Les femmes peuvent plaider comme avocates', date: '1900' },
    { ...P.salaire, label: 'Les femmes disposent librement de leur salaire', date: '1907' },
    { ...P.maternite, label: 'Un congé de maternité non payé est créé', date: '1909' },
  ],
  libres: [
    {
      ...P.codeCivil,
      q: 'quel texte de 1804 place la femme mariée dans une situation d’infériorité ?',
      accepted: [
        'Code civil',
        'le Code civil',
        'Code civil de 1804',
        'le Code civil de 1804',
        'code napoléonien',
        'le code napoléonien',
        'code Napoléon',
        'le code Napoléon',
      ],
      traps: [
        { text: 'Constitution', why: 'La question porte sur le texte de droit qui règle la famille.' },
        { text: 'loi de 1905', why: 'La loi de 1905 concerne les cultes.' },
      ],
      explain: 'Le Code civil organise une famille dirigée par le mari.',
    },
    {
      ...P.auclert,
      q: 'quelle militante lance le journal La Citoyenne en 1881 ?',
      accepted: ['Hubertine Auclert', 'Auclert'],
      traps: [
        { text: 'Marguerite Durand', why: 'Marguerite Durand crée La Fronde en 1897.' },
        { text: 'Eugénie Niboyet', why: 'Eugénie Niboyet crée La voix des femmes en 1848.' },
      ],
      explain: 'Hubertine Auclert porte la revendication du droit de vote.',
    },
    {
      ...P.feminisme,
      q: 'quel nom désigne le mouvement qui réclame la reconnaissance ou l’extension des droits des femmes ?',
      accepted: ['féminisme', 'le féminisme', 'feminisme', 'le feminisme'],
      traps: [
        { text: 'socialisme', why: 'Le socialisme critique le capitalisme et veut plus d’égalité entre classes.' },
        { text: 'laïcité', why: 'La laïcité concerne les religions et l’État.' },
      ],
      explain: 'Les féministes fondent des associations et des journaux.',
    },
    {
      ...P.salaire,
      q: 'en quelle année les femmes obtiennent-elles la libre disposition de leur salaire ?',
      accepted: ['1907', 'en 1907'],
      traps: [
        { text: '1804', why: '1804 est l’année du Code civil, qui limite leurs droits.' },
        { text: '1909', why: '1909 est l’année du congé de maternité.' },
      ],
      explain: 'La même année, elles votent aux prud’hommes.',
    },
  ],
  docs: [
    {
      title: 'La demande d’une commerçante',
      lines: [
        'Un récit fictif de 1866.',
        '« Je tiens la boutique du matin au soir. »',
        '« Pourtant, mariée, je dois obtenir l’accord de mon époux pour gérer mes affaires. »',
      ],
      qs: [
        {
          ...P.codeCivil,
          q: 'Quel texte explique la situation de cette femme ?',
          a: 'le Code civil de 1804',
          wrong: [
            { label: 'la loi de 1907 sur le salaire', why: 'Elle date d’après le récit et élargit les droits.' },
            { label: 'la loi de Séparation de 1905', why: 'Elle concerne les cultes.' },
          ],
          explain: 'Le Code civil consacre l’incapacité juridique de la femme mariée.',
        },
        {
          ...P.sousEvalue,
          q: 'Le nombre de femmes actives de 1866 compte-t-il sûrement tout le travail de femmes comme elle ?',
          a: 'non, ce nombre est probablement sous-évalué',
          wrong: [
            {
              label: 'non, car aucune femme ne travaille',
              why: 'La narratrice tient la boutique toute la journée.',
            },
            {
              label: 'non, ce nombre est probablement trop élevé',
              why: 'Le risque est au contraire d’oublier une partie du travail des femmes.',
            },
          ],
          explain: 'L’activité des femmes d’agriculteurs, d’artisans et de commerçants est sans doute mal comptée.',
        },
      ],
    },
    {
      title: 'Devant l’urne',
      lines: [
        'Un récit fictif de 1885.',
        '« Les hommes de la rue votent aujourd’hui. Nous, les femmes, restons sur le trottoir. »',
        '« Une amie me tend un journal qui réclame l’égalité des droits politiques. »',
      ],
      qs: [
        {
          ...P.vote,
          q: 'Quelle revendication ce journal soutient-il ?',
          a: 'le droit de vote des femmes',
          wrong: [
            {
              label: 'le rétablissement du cens',
              why: 'La revendication porte sur l’égalité politique, pas sur l’impôt.',
            },
            { label: 'la fin de l’école laïque', why: 'Le texte ne parle pas d’école.' },
          ],
          explain: 'Dès 1848 des militantes réclament le droit de vote, sans l’obtenir avant la guerre.',
        },
        {
          ...P.exclues,
          q: 'Que montre la scène sur la vie politique ?',
          a: 'les femmes en sont exclues',
          wrong: [
            { label: 'les femmes votent séparément', why: 'Elles n’ont pas le droit de vote.' },
            { label: 'personne ne peut voter', why: 'Les hommes votent.' },
          ],
          explain: 'Le suffrage de l’époque est masculin.',
        },
      ],
    },
    {
      title: 'L’usine textile',
      lines: [
        'Un récit fictif de 1905.',
        '« Dans notre filature, presque toutes les ouvrières ont cessé le travail. »',
        '« Nous demandons un meilleur salaire. »',
      ],
      qs: [
        {
          ...P.greves,
          q: 'Quelle forme d’action les femmes utilisent-elles dans ce récit ?',
          a: 'la grève',
          wrong: [
            { label: 'le vote d’une loi', why: 'Les femmes n’élisent pas les députés.' },
            { label: 'le plébiscite', why: 'Le plébiscite est une consultation organisée par le pouvoir.' },
          ],
          explain: 'Les femmes participent aux grèves, surtout dans les secteurs où elles sont nombreuses.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [vote, republique, femmes];

export const SOURCE_PROGRAMME = 'cycle4-2020';
export const SOURCE_RESSOURCE = 'eduscol-4e-france-xixe';

export const SKILLS: readonly Skill[] = NOTIONS.map((n) => {
  const s = notion(n, SOURCE_PROGRAMME, 'quatrième');
  return { ...s, lesson: { ...s.lesson, sources: [...new Set([...(s.lesson.sources ?? []), SOURCE_RESSOURCE])] } };
});
