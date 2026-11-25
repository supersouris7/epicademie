import type { Skill } from '../types.ts';
import { notion, type Notion } from './kit.ts';
import { PREUVES as P } from './occident-feodal-sources.ts';

/**
 * 5e, thème 2 « Société, Église et pouvoir politique dans l'occident féodal (XIe-XVe siècles) » (lot hi-5e-02).
 * Chaque fait cite le programme du cycle 4 ou la ressource d'accompagnement Éduscol du thème ; les textes à lire du
 * niveau 5 sont écrits pour l'exercice.
 */
export const SOURCE = 'cycle4-2020';

// ——— Notion 1 : l'ordre seigneurial ———

const seigneurial: Notion = {
  id: 'h5-ordre-seigneurial',
  title: 'L’ordre seigneurial : la formation et la domination des campagnes',
  hint: 'Demande-toi qui est concerné : le seigneur (la terre et le pouvoir) ou les paysans (tenures, chartes) ? Puis situe le moment : croissance (XIe-XIIIe siècles) ou crises (XIVe siècle).',
  memo: [
    'Dans l’Occident féodal, la société, marquée par le christianisme, vit sous la domination des **seigneurs**, laïcs ou religieux. Le seigneur possède la terre, qu’il confie aux paysans en **tenures** héréditaires, et il détient le pouvoir : c’est son double pouvoir, sur la terre et sur les hommes (**banalités**, justice).',
    'Ce pouvoir naît de la décomposition de l’autorité carolingienne, dès la seconde moitié du IXe siècle. Les paysans de la **seigneurie** sont appelés **vilains** ; le **servage** ne concerne qu’une minorité, puis disparaît peu à peu.',
    'Du XIe au XIVe siècle, la population européenne double : grâce aux **défrichements** et à des innovations (cheval, moulin), on cultive bien plus de terres. Les paysans négocient parfois des **chartes de franchises** (Prisches, 1158). La **peste noire** (1347-1352) brise cet élan ; la **jacquerie** de 1358 montre que la domination seigneuriale peut provoquer de violentes confrontations.',
  ],
  faits: [
    {
      ...P.tenures,
      q: 'Comment appelle-t-on la terre que le seigneur confie, de façon héréditaire, à un paysan ?',
      a: 'une tenure',
      wrong: [
        { label: 'une commune', why: 'Une commune est une ville qui s’administre elle-même, pas une terre de paysan.' },
        { label: 'une paroisse', why: 'La paroisse est le cadre de vie religieux des paysans, pas une terre confiée.' },
        {
          label: 'un fief',
          why: 'Le fief (ou bénéfice) est accordé à un vassal, un guerrier ; la terre confiée au paysan est une tenure.',
        },
      ],
      gap: ['Le seigneur confie la terre aux paysans en ', ' héréditaires.', ['tenures']],
      explain: 'Le seigneur possède la terre et la confie aux paysans en tenures, qu’ils transmettent à leurs enfants.',
    },
    {
      ...P.servage,
      q: 'Au début de la période, quelle part des paysans est soumise au servage ?',
      a: 'une minorité',
      wrong: [
        {
          label: 'la totalité',
          why: 'La domination seigneuriale ne se réduit pas au servage : les serfs ne sont qu’une minorité.',
        },
        { label: 'aucun paysan', why: 'Le servage existe bien : il est minoritaire, puis en voie d’extinction.' },
        {
          label: 'la grande majorité',
          why: 'C’est le piège classique : la plupart des paysans sont des vilains, pas des serfs.',
        },
      ],
      gap: ['Au début de la période, le servage est ', ', puis en voie d’extinction.', ['minoritaire']],
      explain: 'Le servage est minoritaire au début de la période, puis en voie d’extinction.',
    },
    {
      ...P.tenures,
      q: 'En quoi consiste le double pouvoir du seigneur ?',
      a: 'il possède la terre et détient le pouvoir sur les hommes',
      wrong: [
        {
          label: 'il est élu par les paysans',
          why: 'Le seigneur n’est pas élu : son pouvoir vient de la terre et de la décomposition de l’autorité carolingienne.',
        },
        {
          label: 'il obéit au maire de la commune',
          why: 'La commune est une ville ; dans la seigneurie, c’est le seigneur qui commande.',
        },
        {
          label: 'il prie pour les paysans mais ne possède rien',
          why: 'Même un seigneur religieux possède des terres : l’Église est riche en terres.',
        },
      ],
      gap: ['Le seigneur est à la fois le possesseur de la ', ' et le détenteur du pouvoir.', ['terre']],
      explain: 'Le seigneur est à la fois le possesseur de la terre et le détenteur du pouvoir (justice, banalités).',
    },
    {
      ...P.carolingien,
      q: 'De quoi naît le pouvoir des seigneurs, dès la seconde moitié du IXe siècle ?',
      a: 'de la décomposition de l’autorité carolingienne',
      wrong: [
        {
          label: 'de la prise de Bagdad par les Mongols',
          why: 'La prise de Bagdad (1258) concerne le monde musulman, et elle est bien plus tardive.',
        },
        {
          label: 'de la peste noire',
          why: 'La peste noire date de 1347-1352 : elle vient bien après la formation des seigneuries.',
        },
        {
          label: 'de la naissance des communes',
          why: 'Les communes naissent dans les villes à partir du XIIe siècle, après la formation des seigneuries.',
        },
      ],
      gap: [
        'Le pouvoir des seigneurs naît de la décomposition de l’autorité ',
        ', dès la seconde moitié du IXe siècle.',
        ['carolingienne'],
      ],
      explain:
        'L’autorité carolingienne se décompose dès la seconde moitié du IXe siècle : les seigneurs prennent le pouvoir localement.',
    },
    {
      ...P.defrichements,
      q: 'Comment les paysans gagnent-ils de nouvelles terres à cultiver ?',
      a: 'par des défrichements et l’assèchement des marais',
      wrong: [
        {
          label: 'en construisant des usines',
          why: 'Les usines appartiennent à l’âge industriel, au XIXe siècle, pas au Moyen Âge.',
        },
        {
          label: 'en abandonnant les villages',
          why: 'Au contraire, la population augmente et les espaces cultivés s’étendent autour des villages.',
        },
        {
          label: 'en recevant des terres du calife',
          why: 'Le calife gouverne le monde musulman ; les terres nouvelles sont gagnées sur place, par défrichement.',
        },
      ],
      gap: [
        'On gagne de nouvelles terres par des ',
        ' et l’assèchement des marais.',
        ['défrichements', 'defrichements'],
      ],
      explain: 'Défricher, c’est enlever les arbres et les buissons pour cultiver : les espaces cultivés augmentent.',
    },
    {
      ...P.chartesPaysans,
      q: 'Quel document fixe les droits et les obligations des paysans face au seigneur ?',
      a: 'une charte de franchises',
      wrong: [
        {
          label: 'un traité de paix',
          why: 'Un traité est un accord entre souverains, pas entre un seigneur et ses paysans.',
        },
        { label: 'une tenure', why: 'La tenure est la terre confiée au paysan, pas un document qui fixe ses droits.' },
        {
          label: 'une banalité',
          why: 'Une banalité est une obligation imposée par le seigneur, pas un accord négocié par les paysans.',
        },
      ],
      gap: [
        'Les paysans négocient parfois des chartes de ',
        ' qui fixent leurs droits et obligations.',
        ['franchises'],
      ],
      explain:
        'Les chartes de franchises, négociées avec le seigneur, fixent par écrit les droits et obligations des paysans.',
    },
    {
      ...P.prisches,
      q: 'Quelle charte de franchises, accordée en 1158, est la plus célèbre ?',
      a: 'celle de Prisches',
      wrong: [
        { label: 'celle de Verdun', why: 'Verdun est le traité de 843 qui partage l’empire carolingien.' },
        { label: 'celle de Bouvines', why: 'Bouvines est une bataille, en 1214, sous Philippe Auguste.' },
        { label: 'celle de Saint-Denis', why: 'Saint-Denis est une abbaye, nécropole des rois de France.' },
      ],
      gap: ['La charte de franchises la plus célèbre est celle de ', ', en 1158.', ['Prisches']],
      explain: 'La plus célèbre des chartes de franchises est celle de Prisches (Nord), en 1158.',
    },
    {
      ...P.peste,
      q: 'Quel événement brise la croissance de la population en 1347-1352 ?',
      a: 'la peste noire',
      wrong: [
        { label: 'la bataille de Bouvines', why: 'Bouvines est une bataille de 1214, qui renforce le pouvoir du roi.' },
        { label: 'la jacquerie', why: 'La jacquerie est une violente confrontation de 1358, après l’épidémie.' },
        { label: 'les défrichements', why: 'Les défrichements font au contraire augmenter les terres cultivées.' },
      ],
      gap: ['De 1347 à 1352, la ', ' brise la croissance de la population.', ['peste noire']],
      explain: 'La peste noire (1347-1352) brise la dynamique démographique des siècles précédents.',
    },
  ],
  paires3: [
    ['Le seigneur', 'Possède la terre et détient le pouvoir'],
    ['Le vilain', 'Paysan du territoire de la seigneurie'],
    ['La tenure', 'Terre confiée de façon héréditaire à un paysan'],
  ],
  paires5: [
    ['Les défrichements', 'Gagner de nouvelles terres à cultiver'],
    ['La charte de franchises', 'Fixe les droits et obligations des paysans'],
    ['Le servage', 'Minoritaire, puis en voie d’extinction'],
    ['La peste noire', 'Brise la croissance de la population (1347-1352)'],
    ['La jacquerie', 'Violente confrontation de 1358'],
  ],
  frise: [
    {
      ...P.carolingien,
      label: 'Début de la décomposition de l’autorité carolingienne',
      date: 'seconde moitié du IXe siècle',
    },
    { ...P.prisches, label: 'Charte de franchises de Prisches', date: '1158' },
    { ...P.peste, label: 'Peste noire', date: '1347-1352' },
    { ...P.jacquerie, label: 'Jacquerie', date: '1358' },
  ],
  libres: [
    {
      ...P.vilains,
      q: 'Comment appelle-t-on les paysans du territoire d’une seigneurie ? (un mot)',
      accepted: ['vilains', 'les vilains', 'vilain', 'un vilain'],
      traps: [
        {
          text: 'serfs',
          why: 'Le servage ne concerne qu’une minorité : le mot qui désigne les paysans de la seigneurie est « vilains ».',
        },
        {
          text: 'vassaux',
          why: 'Les vassaux reçoivent des bénéfices de leur seigneur : ce sont des guerriers, pas les paysans.',
        },
      ],
      explain: 'Le seigneur, laïc ou religieux, domine directement les paysans, appelés « vilains », de sa seigneurie.',
    },
    {
      ...P.tenures,
      q: 'Quel nom porte la terre confiée de façon héréditaire à un paysan par le seigneur ? (un mot)',
      accepted: ['tenure', 'une tenure', 'la tenure', 'tenures'],
      traps: [
        { text: 'fief', why: 'Le fief (ou bénéfice) est accordé à un vassal, pas à un paysan.' },
        {
          text: 'seigneurie',
          why: 'La seigneurie est tout le territoire du seigneur ; la part confiée au paysan est la tenure.',
        },
      ],
      explain: 'La terre du seigneur est confiée en tenures héréditaires aux paysans.',
    },
    {
      ...P.prisches,
      q: 'En quelle année est accordée la charte de franchises de Prisches ?',
      accepted: ['1158', 'en 1158'],
      traps: [
        { text: '1358', why: '1358 est l’année de la jacquerie, deux siècles plus tard.' },
        { text: '1214', why: '1214 est l’année de la bataille de Bouvines.' },
      ],
      explain: 'La plus célèbre des chartes de franchises est celle de Prisches, en 1158.',
    },
    {
      ...P.peste,
      q: 'Quelle épidémie brise la croissance de la population en 1347-1352 ? (deux mots)',
      accepted: ['peste noire', 'la peste noire', 'la peste', 'peste'],
      traps: [
        { text: 'jacquerie', why: 'La jacquerie (1358) est une violente confrontation, pas une épidémie.' },
        {
          text: 'guerre de Cent Ans',
          why: 'La guerre de Cent Ans (1337-1453) est une guerre, pas une épidémie.',
        },
      ],
      explain: 'La peste noire (1347-1352) brise la croissance démographique.',
    },
  ],
  docs: [
    {
      title: 'Une seigneurie au XIIe siècle',
      lines: [
        'Le seigneur, laïc ou religieux, domine les paysans de sa seigneurie.',
        'Il possède la terre : il la confie aux paysans en tenures, qu’ils transmettent à leurs enfants.',
        'Il détient aussi le pouvoir : il rend la justice et impose les banalités.',
        'Les paysans, appelés vilains, défrichent les bois pour cultiver de nouvelles terres.',
        'En négociant une charte de franchises, ils font fixer par écrit leurs droits et leurs obligations.',
      ],
      qs: [
        {
          ...P.tenures,
          q: 'D’après le texte, à qui appartient la terre de la seigneurie ?',
          a: 'au seigneur',
          wrong: [
            {
              label: 'aux paysans',
              why: 'Ligne 2 : le seigneur possède la terre ; il la confie seulement aux paysans.',
            },
            { label: 'au roi', why: 'Le texte ne parle pas du roi : c’est le seigneur qui possède la terre.' },
          ],
          explain: 'Ligne 2 : le seigneur possède la terre et la confie en tenures aux paysans.',
        },
        {
          ...P.doublePouvoir,
          q: 'Quels sont, d’après les lignes 2 et 3, les deux pouvoirs du seigneur ?',
          a: 'il possède la terre et il commande les hommes',
          wrong: [
            {
              label: 'il fabrique des objets et il les vend',
              why: 'Le texte ne parle pas d’artisanat : relis les lignes 2 et 3.',
            },
            {
              label: 'il étudie le droit à l’université',
              why: 'Le texte présente un seigneur qui possède la terre et rend la justice, pas un étudiant.',
            },
          ],
          explain: 'Lignes 2 et 3 : le seigneur possède la terre et détient le pouvoir (justice, banalités).',
        },
        {
          ...P.chartesPaysans,
          q: 'Qu’obtiennent les paysans grâce à la charte de franchises ?',
          a: 'que leurs droits et obligations soient fixés',
          wrong: [
            {
              label: 'la fin de toutes leurs obligations',
              why: 'La charte fixe les obligations ; elle ne les supprime pas (ligne 5).',
            },
            { label: 'la propriété de toute la seigneurie', why: 'La terre reste au seigneur : relis la ligne 2.' },
          ],
          explain: 'Ligne 5 : la charte de franchises fixe par écrit les droits et les obligations des paysans.',
        },
      ],
    },
    {
      title: 'Des campagnes qui changent (XIe-XIVe siècles)',
      lines: [
        'Du XIe au XIVe siècle, la population européenne double.',
        'Pour la nourrir, on défriche les forêts et on assèche les marais.',
        'Le cheval, les céréales de printemps et le moulin aident les paysans.',
        'Des noms de lieux comme Villeneuve ou Les Essarts gardent la trace de ces terres nouvelles.',
        'Au milieu du XIVe siècle, la peste noire brise cette croissance.',
      ],
      qs: [
        {
          ...P.doublement,
          q: 'Que devient la population européenne du XIe au XIVe siècle ?',
          a: 'elle double',
          wrong: [
            { label: 'elle diminue de moitié', why: 'Ligne 1 : la population double, elle ne diminue pas.' },
            { label: 'elle reste la même', why: 'Ligne 1 : la population double ; le Moyen Âge n’est pas immobile.' },
          ],
          explain: 'Ligne 1 : du XIe au XIVe siècle, la population européenne double.',
        },
        {
          ...P.toponymie,
          q: 'Que montrent des noms de lieux comme Villeneuve ou Les Essarts ?',
          a: 'l’extension des terres cultivées',
          wrong: [
            {
              label: 'les batailles de la guerre de Cent Ans',
              why: 'Ligne 4 : ces noms gardent la trace des terres nouvelles, pas de batailles.',
            },
            {
              label: 'le recul des cultures',
              why: 'Au contraire, ces noms témoignent de terres nouvellement mises en culture.',
            },
          ],
          explain: 'Ligne 4 : la toponymie (les noms de lieux) témoigne encore de l’extension des terres cultivées.',
        },
        {
          ...P.innovations,
          q: 'Selon le texte, quelles innovations aident les paysans ?',
          a: 'le cheval, les céréales de printemps et le moulin',
          wrong: [
            {
              label: 'la machine à vapeur et le charbon',
              why: 'La machine à vapeur appartient à l’âge industriel, au XIXe siècle.',
            },
            {
              label: 'les engrais chimiques et le tracteur',
              why: 'Ces techniques ne figurent pas dans le texte (ligne 3).',
            },
          ],
          explain:
            'Ligne 3 : plusieurs innovations combinées (cheval, céréales de printemps, moulin) aident les paysans.',
        },
      ],
    },
  ],
};

// ——— Notion 2 : la société urbaine ———

const urbaine: Notion = {
  id: 'h5-societe-urbaine',
  title: 'L’émergence d’une nouvelle société urbaine',
  hint: 'Pense à la ville : qui y vit (bourgeois, artisans), comment elle obtient ses libertés (charte, commune) et pourquoi elle grandit (commerce, centres religieux, universités).',
  memo: [
    'Le mouvement urbain s’amorce surtout au XIIe siècle : les villes croissent aux XIIe et XIIIe siècles et desserrent les liens de la domination féodale. Il s’explique par l’essor du commerce, des centres religieux, des **universités** et des lieux de pouvoir.',
    'Le plus souvent, les villes négocient avec le seigneur des **chartes de franchises** ; parfois, elles deviennent une **commune** qui s’administre elle-même, où s’affirme la **bourgeoisie** commerçante.',
    'De nouveaux modes de vie apparaissent : pain frais et viande de bœuf, avec la naissance des **corporations** de boulangers et de bouchers. L’économie marchande se développe : l’abbaye de Saint-Denis tire des profits d’une **foire**. À la fin du Moyen Âge, environ 20 % des Européens vivent en ville.',
  ],
  faits: [
    {
      ...P.mouvementUrbain,
      q: 'À partir de quel siècle le mouvement urbain s’amorce-t-il principalement ?',
      a: 'le XIIe siècle',
      wrong: [
        {
          label: 'le VIe siècle',
          why: 'Le VIe siècle est celui de Justinien, bien avant l’essor des villes féodales.',
        },
        { label: 'le XIXe siècle', why: 'Le XIXe siècle est celui de l’âge industriel.' },
        {
          label: 'le XVe siècle',
          why: 'Au XVe siècle, à la fin de la période, les villes ont déjà grandi : le mouvement a commencé au XIIe.',
        },
      ],
      gap: ['Le mouvement urbain s’amorce principalement au ', ' siècle.', ['XIIe', '12e', 'douzième', 'XII']],
      explain: 'Le programme le dit : le mouvement urbain s’amorce principalement au XIIe siècle.',
    },
    {
      ...P.commune,
      q: 'Comment appelle-t-on une ville qui s’administre elle-même ?',
      a: 'une commune',
      wrong: [
        { label: 'une paroisse', why: 'La paroisse est un cadre religieux, celui de la vie des fidèles.' },
        { label: 'une tenure', why: 'La tenure est la terre confiée à un paysan par le seigneur.' },
        {
          label: 'une seigneurie',
          why: 'La seigneurie est le territoire dominé par un seigneur, pas une ville libre.',
        },
      ],
      gap: ['Une ville qui s’administre elle-même est une ', '.', ['commune']],
      explain: 'Parfois, une ville devient une « commune » : elle s’administre elle-même.',
    },
    {
      ...P.commune,
      q: 'Quel groupe social s’affirme dans les communes ?',
      a: 'la bourgeoisie commerçante',
      wrong: [
        { label: 'les vilains', why: 'Les vilains sont les paysans de la seigneurie, à la campagne.' },
        { label: 'les moines', why: 'Les moines sont des religieux ; le texte parle d’un groupe de marchands.' },
        { label: 'les serfs', why: 'Les serfs, peu nombreux, vivent à la campagne sous la domination du seigneur.' },
      ],
      gap: ['Dans la commune s’affirme le groupe social de la ', ' commerçante.', ['bourgeoisie']],
      explain: 'Dans la commune s’affirme le groupe social de la bourgeoisie commerçante.',
    },
    {
      ...P.corporations,
      q: 'Quelle nouveauté accompagne la consommation de pain frais en ville ?',
      a: 'la naissance de la corporation des boulangers',
      wrong: [
        { label: 'la naissance des usines', why: 'Les usines appartiennent à l’âge industriel, au XIXe siècle.' },
        { label: 'la fin du commerce', why: 'Au contraire, le commerce et l’économie marchande se développent.' },
        { label: 'l’apparition des tenures', why: 'Les tenures sont des terres de paysans, à la campagne.' },
      ],
      gap: ['La consommation de pain frais accompagne la naissance de la ', ' des boulangers.', ['corporation']],
      explain: 'Les nouveaux modes de vie urbains font naître des corporations, comme celle des boulangers.',
    },
    {
      ...P.libertes,
      q: 'Le plus souvent, comment les villes obtiennent-elles leurs libertés ?',
      a: 'en les négociant avec le seigneur',
      wrong: [
        {
          label: 'par une révolte victorieuse',
          why: 'Les révoltes urbaines existent, mais le plus souvent les libertés sont négociées avec le seigneur.',
        },
        {
          label: 'par une décision du pape',
          why: 'Le pape dirige l’Église ; ce sont les seigneurs qui négocient les chartes avec les villes.',
        },
        { label: 'grâce au calife de Bagdad', why: 'Le calife gouverne le monde musulman, pas les villes d’Occident.' },
      ],
      gap: ['Les libertés des villes sont le plus souvent ', ' avec le seigneur.', ['négociées', 'negociees']],
      explain:
        'Une charte de ville montre que les libertés des villes sont le plus souvent négociées avec le seigneur.',
    },
    {
      ...P.urbains,
      q: 'À la fin de la période, quelle part de la population européenne vit en ville ?',
      a: 'environ 20 %',
      wrong: [
        {
          label: 'environ 90 %',
          why: 'La grande majorité vit encore à la campagne : les campagnes restent la ressource principale.',
        },
        { label: 'personne', why: 'Les villes croissent aux XIIe et XIIIe siècles : elles sont bien habitées.' },
        { label: 'environ 50 %', why: 'C’est trop : on estime que les urbains représentent 20 % de la population.' },
      ],
      gap: ['À la fin du Moyen Âge, les urbains représentent environ ', ' % de la population européenne.', ['20']],
      explain: 'À la fin de la période, on estime que les urbains représentent 20 % de la population européenne.',
    },
    {
      ...P.regions,
      q: 'Dans quelles régions les citadins sont-ils surtout regroupés ?',
      a: 'en Italie du Nord, en Flandre, dans l’axe rhénan et en France',
      wrong: [
        {
          label: 'en Scandinavie et en Russie',
          why: 'Ces régions ne font pas partie des grands foyers urbains cités.',
        },
        {
          label: 'en Syrie et en Égypte',
          why: 'Ces régions appartiennent au monde musulman, hors de l’Occident féodal.',
        },
        { label: 'en Islande et en Irlande', why: 'Ces îles ne font pas partie des grands foyers urbains cités.' },
      ],
      gap: [
        'Les urbains sont regroupés surtout en Italie du Nord, en ',
        ', dans l’axe rhénan et dans le royaume de France.',
        ['Flandre', 'Flandres'],
      ],
      explain: 'Les urbains se regroupent surtout en Italie du Nord, en Flandre, dans l’axe rhénan et en France.',
    },
    {
      ...P.causes,
      q: 'Parmi ces éléments, lequel est une cause de l’essor des villes ?',
      a: 'l’essor du commerce',
      wrong: [
        { label: 'la peste noire', why: 'La peste noire (1347-1352) brise la croissance de la population.' },
        { label: 'la jacquerie', why: 'La jacquerie (1358) est une confrontation violente dans les campagnes.' },
        { label: 'le servage', why: 'Le servage concerne des paysans, à la campagne ; il recule.' },
      ],
      gap: [
        'L’urbanisation s’explique par l’essor du ',
        ', les centres religieux, les universités et les lieux de pouvoir.',
        ['commerce'],
      ],
      explain: 'Les causes de l’urbanisation : essor du commerce, centres religieux, universités, lieux de pouvoir.',
    },
  ],
  paires3: [
    ['La commune', 'Ville qui s’administre elle-même'],
    ['La corporation', 'Groupe des gens d’un même métier'],
    ['La bourgeoisie', 'Groupe social des marchands des villes'],
  ],
  paires5: [
    ['Le XIIe siècle', 'Le mouvement urbain s’amorce'],
    ['20 %', 'Part des urbains à la fin de la période'],
    ['La charte de franchises', 'Libertés négociées avec le seigneur'],
    ['La foire', 'Grand marché qui procure des profits'],
    ['La Flandre', 'Région où se regroupent beaucoup d’urbains'],
  ],
  libres: [
    {
      ...P.commune,
      q: 'Quel nom porte une ville qui s’administre elle-même ? (un mot)',
      accepted: ['commune', 'une commune', 'la commune'],
      traps: [
        { text: 'seigneurie', why: 'La seigneurie est le territoire dominé par un seigneur.' },
        { text: 'paroisse', why: 'La paroisse est le cadre religieux de la vie des fidèles.' },
      ],
      explain: 'Une ville qui s’administre elle-même est une commune.',
    },
    {
      ...P.commune,
      q: 'Quel groupe social, formé de marchands, s’affirme dans les communes ? (un mot)',
      accepted: ['bourgeoisie', 'la bourgeoisie', 'bourgeois', 'les bourgeois'],
      traps: [
        { text: 'vilains', why: 'Les vilains sont les paysans de la seigneurie.' },
        { text: 'clergé', why: 'Le clergé réunit les hommes d’Église, pas les marchands.' },
      ],
      explain: 'Dans les communes s’affirme la bourgeoisie commerçante.',
    },
    {
      ...P.corporations,
      q: 'Comment appelle-t-on le groupe qui réunit les boulangers, ou les bouchers, d’une ville ? (un mot)',
      accepted: ['corporation', 'une corporation', 'la corporation', 'corporations'],
      traps: [
        { text: 'commune', why: 'La commune, c’est toute la ville qui s’administre elle-même, pas un métier.' },
        { text: 'paroisse', why: 'La paroisse est un cadre religieux, pas un groupe de métier.' },
      ],
      explain: 'Les boulangers et les bouchers se regroupent en corporations.',
    },
    {
      ...P.urbains,
      q: 'Quel pourcentage de la population européenne vit en ville à la fin de la période ? (un nombre)',
      accepted: ['20', '20 %', '20%', 'environ 20', 'environ 20 %', 'environ 20%'],
      traps: [
        { text: '50', why: 'C’est trop : la majorité vit encore à la campagne.' },
        { text: '90', why: 'C’est presque l’inverse : la grande majorité vit à la campagne.' },
      ],
      explain: 'À la fin de la période, on estime que les urbains représentent 20 % de la population européenne.',
    },
  ],
  docs: [
    {
      title: 'Une ville obtient ses libertés',
      lines: [
        'Au XIIe siècle, une ville marchande grandit autour de son marché.',
        'Ses habitants, les bourgeois, vivent surtout du commerce et de l’artisanat.',
        'Ils négocient avec le seigneur une charte de franchises qui fixe leurs libertés.',
        'Plus tard, la ville devient une commune : elle s’administre elle-même.',
        'Les boulangers et les bouchers s’organisent en corporations.',
      ],
      qs: [
        {
          ...P.libertes,
          q: 'Comment la ville obtient-elle ses libertés ?',
          a: 'en négociant une charte avec le seigneur',
          wrong: [
            {
              label: 'en chassant le seigneur par les armes',
              why: 'Ligne 3 : les bourgeois négocient avec le seigneur, ils ne le chassent pas.',
            },
            {
              label: 'en recevant un ordre du basileus',
              why: 'Le basileus règne à Constantinople ; le texte parle d’une négociation avec le seigneur.',
            },
          ],
          explain: 'Ligne 3 : les libertés sont négociées avec le seigneur, dans une charte de franchises.',
        },
        {
          ...P.commune,
          q: 'Que signifie, d’après la ligne 4, devenir une commune ?',
          a: 's’administrer soi-même',
          wrong: [
            {
              label: 'appartenir au domaine royal',
              why: 'La ligne 4 ne parle pas du roi : la commune s’administre elle-même.',
            },
            {
              label: 'devenir une seigneurie d’Église',
              why: 'La ligne 4 décrit une ville qui s’administre elle-même, pas une terre d’Église.',
            },
          ],
          explain: 'Ligne 4 : une commune est une ville qui s’administre elle-même.',
        },
        {
          ...P.commune,
          q: 'De quoi vivent surtout les bourgeois de cette ville ?',
          a: 'du commerce et de l’artisanat',
          wrong: [
            {
              label: 'de la culture de leurs tenures',
              why: 'Les tenures sont des terres de paysans ; relis la ligne 2.',
            },
            { label: 'de la guerre', why: 'Ligne 2 : les bourgeois vivent du commerce et de l’artisanat.' },
          ],
          explain: 'Ligne 2 : la bourgeoisie des villes est d’abord commerçante.',
        },
      ],
    },
    {
      title: 'Une foire près de Paris',
      lines: [
        'Au début du XIIe siècle, l’abbaye de Saint-Denis, près de Paris, contrôle une grande foire.',
        'Des marchands venus de loin y échangent leurs marchandises.',
        'L’abbaye tire de cette foire des profits importants.',
        'Les échanges avec l’Orient s’accroissent, grâce à des comptoirs.',
        'Les villes grandissent et desserrent les liens de la domination féodale.',
      ],
      qs: [
        {
          ...P.foire,
          q: 'Qui contrôle la foire présentée dans le texte ?',
          a: 'l’abbaye de Saint-Denis',
          wrong: [
            { label: 'le roi d’Angleterre', why: 'Ligne 1 : c’est l’abbaye de Saint-Denis qui contrôle la foire.' },
            {
              label: 'les paysans de Prisches',
              why: 'Prisches est connue pour sa charte de 1158, pas pour cette foire.',
            },
          ],
          explain: 'Lignes 1 et 3 : l’abbaye de Saint-Denis contrôle la foire, qui lui procure des profits.',
        },
        {
          ...P.comptoirs,
          q: 'D’après la ligne 4, avec quelle région les échanges s’accroissent-ils ?',
          a: 'avec l’Orient',
          wrong: [
            { label: 'avec l’Amérique', why: 'La ligne 4 parle de l’Orient, pas de l’Amérique.' },
            { label: 'avec l’Australie', why: 'La ligne 4 parle de l’Orient, pas de l’Australie.' },
          ],
          explain: 'Ligne 4 : des comptoirs permettent des échanges accrus avec l’Orient.',
        },
        {
          ...P.villes,
          q: 'Quel effet la croissance des villes a-t-elle sur la domination féodale ?',
          a: 'elle desserre ses liens',
          wrong: [
            { label: 'elle la renforce', why: 'Ligne 5 : les villes desserrent les liens de la domination féodale.' },
            { label: 'elle n’a aucun effet', why: 'Ligne 5 : la croissance des villes desserre ces liens.' },
          ],
          explain: 'Ligne 5 : les villes croissent et desserrent les liens de la domination féodale.',
        },
      ],
    },
  ],
};

// ——— Notion 3 : l'Église ———

const eglise: Notion = {
  id: 'h5-eglise-feodale',
  title: 'L’Église dans l’Occident féodal',
  hint: 'Repère le rôle de l’Église : dans le monde féodal (terres, paroisse), dans la société (paix de Dieu, universités) ou auprès du roi (sacre, Saint-Denis).',
  memo: [
    'L’Église est à la fois plongée dans le monde féodal, par sa richesse **foncière** (il existe des seigneuries religieuses), et porteuse de valeurs différentes. La **paroisse** est le cadre de vie des paysans : l’Église encadre la vie quotidienne des fidèles.',
    'Au début de la période, la **réforme grégorienne** la rend plus cohérente et soudée. Aux Xe et XIe siècles, elle lance la **paix de Dieu** pour protéger ses biens et les populations, puis bénit la **chevalerie**, qu’elle entraîne dans les croisades.',
    'Grâce à son quasi-monopole de l’écrit, elle contrôle les **universités**. Elle **sacre** les rois. Au XIIIe siècle naissent les **ordres mendiants**. L’**abbé** Suger, conseiller du roi Louis VI, construit la basilique gothique de Saint-Denis, **nécropole** des rois de France.',
  ],
  faits: [
    {
      ...P.immergee,
      q: 'Pourquoi dit-on que l’Église est plongée dans le monde féodal ?',
      a: 'par sa richesse en terres',
      wrong: [
        {
          label: 'parce qu’elle refuse de posséder des terres',
          why: 'C’est l’inverse : l’Église est riche en terres.',
        },
        {
          label: 'parce qu’elle élit les seigneurs',
          why: 'Les seigneurs ne sont pas élus ; l’Église possède elle-même des terres.',
        },
        {
          label: 'parce qu’elle dirige toutes les communes',
          why: 'Les communes s’administrent elles-mêmes ; l’Église est féodale par ses terres.',
        },
      ],
      gap: ['L’Église est plongée dans le monde féodal par sa richesse ', '.', ['foncière', 'fonciere']],
      explain: 'Par sa richesse foncière (ses terres), l’Église fait partie du monde féodal.',
    },
    {
      ...P.paroisse,
      q: 'Quel est le cadre de vie religieux des paysans ?',
      a: 'la paroisse',
      wrong: [
        { label: 'la commune', why: 'La commune est une ville qui s’administre elle-même.' },
        { label: 'l’université', why: 'L’université est un lieu d’étude du droit, en ville.' },
        { label: 'la corporation', why: 'La corporation regroupe les gens d’un même métier, en ville.' },
      ],
      gap: ['La ', ' est le cadre de vie des paysans.', ['paroisse']],
      explain: 'La paroisse est le cadre de vie des paysans : l’Église y encadre leur vie quotidienne.',
    },
    {
      ...P.gregorienne,
      q: 'Quelle réforme rend l’Église plus cohérente et soudée au début de la période ?',
      a: 'la réforme grégorienne',
      wrong: [
        {
          label: 'la Réforme protestante',
          why: 'Les réformes protestantes appartiennent au XVIe siècle, au thème suivant du programme.',
        },
        {
          label: 'la paix de Dieu',
          why: 'La paix de Dieu est un mouvement de protection, pas une réforme de l’Église.',
        },
        { label: 'le traité de Verdun', why: 'Le traité de Verdun (843) partage l’empire carolingien.' },
      ],
      gap: ['La réforme ', ' rend l’Église plus cohérente et soudée.', ['grégorienne', 'gregorienne']],
      explain: 'Au début de la période, la réforme grégorienne rend l’Église plus cohérente et soudée.',
    },
    {
      ...P.paixDieu,
      q: 'Pourquoi l’Église lance-t-elle la paix de Dieu aux Xe et XIe siècles ?',
      a: 'pour protéger ses biens et les populations',
      wrong: [
        {
          label: 'pour déclencher la guerre de Cent Ans',
          why: 'La guerre de Cent Ans commence en 1337, bien plus tard, et la paix de Dieu vise à protéger.',
        },
        { label: 'pour fonder des universités', why: 'Les universités sont un autre sujet : la paix de Dieu protège.' },
        {
          label: 'pour supprimer la chevalerie',
          why: 'L’Église ne supprime pas la chevalerie : elle la bénit ensuite et l’entraîne dans les croisades.',
        },
      ],
      gap: ['Avec la paix de ', ', l’Église protège ses biens et les populations.', ['Dieu']],
      explain: 'La paix de Dieu protège les biens d’Église et les populations contre les violences.',
    },
    {
      ...P.universites,
      q: 'Qu’apprend-on dans les universités, contrôlées par l’Église ?',
      a: 'le droit canon et le droit romain',
      wrong: [
        { label: 'la machine à vapeur', why: 'La machine à vapeur appartient à l’âge industriel, au XIXe siècle.' },
        {
          label: 'le métier de boulanger',
          why: 'Les boulangers se forment dans leur corporation, pas à l’université.',
        },
        { label: 'seulement l’art de la guerre', why: 'On y apprend le droit : le droit canon et le droit romain.' },
      ],
      gap: ['Dans les universités, on apprend le droit ', ' et le droit romain.', ['canon']],
      explain: 'Dans les universités, l’Église fait enseigner le droit canon (celui de l’Église) et le droit romain.',
    },
    {
      ...P.sacre,
      q: 'Que fait l’Église pour les rois de France, d’Angleterre et d’Aragon ?',
      a: 'elle les sacre',
      wrong: [
        { label: 'elle les élit', why: 'L’Église n’élit pas les rois : elle les sacre.' },
        { label: 'elle leur interdit de régner', why: 'Au contraire, en les sacrant, elle soutient leur pouvoir.' },
        {
          label: 'elle les choisit parmi les bourgeois',
          why: 'Les rois ne sont pas choisis parmi les bourgeois ; l’Église les sacre.',
        },
      ],
      gap: ['L’Église ', ' les rois de France, d’Angleterre et d’Aragon.', ['sacre']],
      explain: 'L’Église sacre les rois d’Aragon, de France, d’Angleterre et les empereurs romains germaniques.',
    },
    {
      ...P.mendiants,
      q: 'Quels ordres religieux apparaissent au XIIIe siècle ?',
      a: 'les ordres mendiants',
      wrong: [
        {
          label: 'les corporations',
          why: 'Les corporations regroupent des métiers, en ville ; ce ne sont pas des ordres religieux.',
        },
        {
          label: 'les états généraux',
          why: 'Les états généraux sont des assemblées convoquées par le roi, à partir de 1302.',
        },
        { label: 'les communes', why: 'Les communes sont des villes qui s’administrent elles-mêmes.' },
      ],
      gap: ['Au XIIIe siècle apparaissent les ordres ', '.', ['mendiants']],
      explain: 'Les ordres mendiants naissent au XIIIe siècle ; l’Église parvient à les intégrer.',
    },
    {
      ...P.suger,
      q: 'Qui est l’abbé Suger ?',
      a: 'le conseiller du roi Louis VI',
      wrong: [
        { label: 'un calife de Bagdad', why: 'Les califes gouvernent le monde musulman ; Suger est un abbé chrétien.' },
        { label: 'un chef de la jacquerie', why: 'La jacquerie date de 1358 ; Suger vit au XIIe siècle.' },
        { label: 'un bourgeois de Flandre', why: 'Suger est un homme d’Église, abbé de Saint-Denis.' },
      ],
      gap: ['L’abbé Suger est le conseiller du roi Louis ', '.', ['VI', '6']],
      explain: 'Homme de la réforme grégorienne, l’abbé Suger est le conseiller du roi Louis VI.',
    },
    {
      ...P.necropole,
      q: 'Quel rôle joue la basilique de Saint-Denis pour les rois de France ?',
      a: 'elle est leur nécropole',
      wrong: [
        { label: 'elle est leur palais', why: 'La basilique est un édifice religieux où les rois sont enterrés.' },
        {
          label: 'elle est le lieu de leur élection',
          why: 'Les rois ne sont pas élus ; à Saint-Denis, ils sont enterrés.',
        },
        {
          label: 'elle est une université',
          why: 'Une université est un lieu d’étude ; la basilique est la nécropole royale.',
        },
      ],
      gap: ['La basilique de Saint-Denis est la ', ' des rois de France.', ['nécropole', 'necropole']],
      explain: 'La basilique de Saint-Denis est la nécropole des rois de France : ils y sont enterrés.',
    },
  ],
  paires3: [
    ['La paroisse', 'Cadre de vie des paysans'],
    ['La paix de Dieu', 'Protège les biens d’Église et les populations'],
    ['L’université', 'Lieu où l’on apprend le droit'],
  ],
  paires5: [
    ['La réforme grégorienne', 'Rend l’Église plus cohérente et soudée'],
    ['Les ordres mendiants', 'Nés au XIIIe siècle'],
    ['L’abbé Suger', 'Conseiller du roi Louis VI'],
    ['Le sacre', 'Cérémonie religieuse où l’Église consacre le roi'],
    ['La basilique de Saint-Denis', 'Nécropole des rois de France'],
  ],
  libres: [
    {
      ...P.paroisse,
      q: 'Dans quel cadre religieux vivent les paysans ? (un mot)',
      accepted: ['paroisse', 'la paroisse', 'une paroisse'],
      traps: [
        { text: 'commune', why: 'La commune est une ville qui s’administre elle-même.' },
        {
          text: 'seigneurie',
          why: 'La seigneurie est le territoire du seigneur ; le cadre de vie religieux est la paroisse.',
        },
      ],
      explain: 'La paroisse est le cadre de vie religieux des paysans.',
    },
    {
      ...P.mendiants,
      q: 'Comment appelle-t-on les ordres religieux nés au XIIIe siècle ? (deux mots)',
      accepted: ['ordres mendiants', 'les ordres mendiants', 'ordre mendiant', 'mendiants'],
      traps: [
        { text: 'corporations', why: 'Les corporations regroupent des gens de métier, en ville.' },
        {
          text: 'croisés',
          why: 'Les croisés sont des combattants des croisades, pas un ordre religieux du XIIIe siècle.',
        },
      ],
      explain: 'Les ordres mendiants naissent au XIIIe siècle.',
    },
    {
      ...P.paixDieu,
      q: 'Quel mouvement l’Église lance-t-elle aux Xe et XIe siècles pour protéger ses biens et les populations ?',
      accepted: ['paix de Dieu', 'la paix de Dieu'],
      traps: [
        {
          text: 'croisade',
          why: 'L’Église entraîne ensuite la chevalerie dans les croisades, mais le mouvement de protection est la paix de Dieu.',
        },
        {
          text: 'réforme grégorienne',
          why: 'La réforme grégorienne rend l’Église plus soudée ; elle ne vise pas à protéger les populations.',
        },
      ],
      explain: 'La paix de Dieu, lancée aux Xe et XIe siècles, protège les biens d’Église et les populations.',
    },
    {
      ...P.necropole,
      q: 'Quelle basilique, construite par l’abbé Suger, sert de nécropole aux rois de France ? (un nom)',
      accepted: ['Saint-Denis', 'Saint Denis', 'basilique de Saint-Denis', 'la basilique de Saint-Denis'],
      traps: [
        { text: 'Aix-la-Chapelle', why: 'Aix-la-Chapelle est la ville du palais de Charlemagne.' },
        { text: 'Prisches', why: 'Prisches est connue pour sa charte de franchises de 1158.' },
      ],
      explain: 'La basilique de Saint-Denis, construite par Suger dans le style gothique, est la nécropole des rois.',
    },
  ],
  docs: [
    {
      title: 'Une paroisse de campagne',
      lines: [
        'Au centre du village se dresse l’église de la paroisse.',
        'Le prêtre baptise les enfants, marie les fidèles et enterre les morts.',
        'Le dimanche, les paysans viennent écouter la messe.',
        'Le seigneur du lieu est un abbé : la terre appartient à une abbaye.',
        'L’Église est ainsi riche en terres, tout en enseignant des valeurs chrétiennes.',
      ],
      qs: [
        {
          ...P.paroisse,
          q: 'Quel cadre de vie l’église du village organise-t-elle pour les paysans ?',
          a: 'la paroisse',
          wrong: [
            { label: 'la commune', why: 'Le texte décrit un village rural et son église, pas une ville libre.' },
            {
              label: 'la corporation',
              why: 'La corporation regroupe un métier en ville ; ligne 1, il s’agit de la paroisse.',
            },
          ],
          explain: 'Ligne 1 : l’église du village est celle de la paroisse, cadre de vie des paysans.',
        },
        {
          ...P.encadre,
          q: 'Que montre la ligne 2 sur le rôle de l’Église ?',
          a: 'elle encadre la vie quotidienne des fidèles',
          wrong: [
            {
              label: 'elle s’occupe seulement du commerce',
              why: 'La ligne 2 parle de baptêmes, mariages et enterrements.',
            },
            {
              label: 'elle n’intervient jamais dans la vie des paysans',
              why: 'Au contraire, elle accompagne chaque étape de la vie (ligne 2).',
            },
          ],
          explain: 'Ligne 2 : de la naissance à la mort, l’Église encadre la vie quotidienne des fidèles.',
        },
        {
          ...P.paroisse,
          q: 'D’après la ligne 4, qui est le seigneur du lieu ?',
          a: 'un abbé, seigneur religieux',
          wrong: [
            { label: 'un bourgeois de la commune', why: 'Ligne 4 : le seigneur est un abbé, un homme d’Église.' },
            { label: 'le basileus', why: 'Le basileus règne à Constantinople ; ligne 4, le seigneur est un abbé.' },
          ],
          explain: 'Ligne 4 : il existe des seigneuries ecclésiastiques, dont le seigneur est un homme d’Église.',
        },
      ],
    },
    {
      title: 'Suger et l’abbaye de Saint-Denis',
      lines: [
        'Au XIIe siècle, l’abbé Suger dirige l’abbaye de Saint-Denis, près de Paris.',
        'Homme de la réforme grégorienne, il est aussi le conseiller du roi Louis VI.',
        'Il est le constructeur de la basilique gothique.',
        'Les rois de France y sont enterrés : c’est leur nécropole.',
        'Le roi, sacré par l’Église, trouve en elle son principal soutien.',
      ],
      qs: [
        {
          ...P.suger,
          q: 'Quel lien unit Suger au pouvoir royal ?',
          a: 'il est le conseiller du roi Louis VI',
          wrong: [
            { label: 'il est le fils du roi', why: 'Ligne 2 : Suger est le conseiller du roi, pas son fils.' },
            { label: 'il est l’ennemi du roi', why: 'Ligne 2 : il conseille le roi, il ne le combat pas.' },
          ],
          explain: 'Ligne 2 : homme d’Église, Suger conseille le roi Louis VI.',
        },
        {
          ...P.necropole,
          q: 'Pourquoi la basilique de Saint-Denis compte-t-elle pour la monarchie ?',
          a: 'les rois de France y sont enterrés',
          wrong: [
            { label: 'les rois y sont élus', why: 'Ligne 4 : les rois y sont enterrés ; ils ne sont pas élus.' },
            {
              label: 'les états généraux y siègent',
              why: 'Le texte ne parle pas des états généraux : relis la ligne 4.',
            },
          ],
          explain: 'Ligne 4 : la basilique est la nécropole des rois de France.',
        },
        {
          ...P.soutien,
          q: 'Que montre la ligne 5 des relations entre l’Église et la monarchie ?',
          a: 'l’Église soutient la monarchie',
          wrong: [
            {
              label: 'l’Église combat la monarchie',
              why: 'Ligne 5 : le roi trouve dans l’Église son principal soutien.',
            },
            { label: 'l’Église ignore le roi', why: 'Ligne 5 : l’Église sacre le roi et le soutient.' },
          ],
          explain: 'L’Église apparaît comme le principal soutien de la monarchie capétienne.',
        },
      ],
    },
  ],
};

// ——— Notion 4 : l'affirmation de l'État monarchique ———

const etat: Notion = {
  id: 'h5-etat-monarchique',
  title: 'L’affirmation de l’État monarchique (Capétiens et Valois)',
  hint: 'Situe d’abord le roi dans le temps (987, 1214, 1302, 1337-1453), puis demande-toi comment il renforce son pouvoir : Église, territoire, administration ou impôt.',
  memo: [
    'En 987, **Hugues Capet**, « duc de France », est couronné et sacré roi : son domaine, en Île-de-France et dans l’Orléanais, devient le **domaine royal**. Les rois **capétiens** construisent leur domination à partir de la féodalité et de l’appui de l’Église : le **sacre** donne au roi un caractère sacré.',
    'D’abord roi faible, **suzerain** de puissants princes, le roi devient peu à peu **souverain**. Le règne de Philippe Auguste (1180-1223) est un tournant, avec la bataille de Bouvines (1214). Louis IX (1226-1270), canonisé en 1297, porte le prestige religieux de la monarchie à son apogée.',
    'Philippe IV le Bel s’entoure de **légistes** et convoque des **états généraux** à partir de 1302. Le programme nomme deux dynasties : les Capétiens et les **Valois**. La **guerre de Cent Ans** (1337-1453) transforme le royaume en royaume national ; l’**impôt permanent** est levé à partir de 1360.',
  ],
  faits: [
    {
      ...P.repere987,
      q: 'Qui est couronné et sacré roi en 987 ?',
      a: 'Hugues Capet',
      wrong: [
        { label: 'Charlemagne', why: 'Charlemagne est couronné empereur en 800, pas roi en 987.' },
        { label: 'Philippe Auguste', why: 'Philippe Auguste règne de 1180 à 1223.' },
        { label: 'Louis IX', why: 'Louis IX règne de 1226 à 1270.' },
      ],
      gap: ['En 987, ', ' est couronné et sacré roi.', ['Hugues Capet']],
      explain: 'En 987, Hugues Capet, « duc de France », est couronné et sacré roi.',
    },
    {
      ...P.hugues,
      q: 'Que devient le domaine d’Hugues Capet quand il devient roi ?',
      a: 'le domaine royal',
      wrong: [
        { label: 'une commune', why: 'Une commune est une ville qui s’administre elle-même.' },
        {
          label: 'le Saint-Empire romain germanique',
          why: 'Le Saint-Empire naît en 962 avec Otton Ier, hors du royaume de France.',
        },
        { label: 'une seigneurie d’Église', why: 'Le domaine d’Hugues Capet devient celui du roi.' },
      ],
      gap: ['Le domaine d’Hugues Capet devient le domaine ', '.', ['royal']],
      explain: 'Le domaine d’Hugues Capet, en Île-de-France et dans l’Orléanais, devient le « domaine royal ».',
    },
    {
      ...P.bouvines,
      q: 'En quelle année a lieu la bataille de Bouvines ?',
      a: '1214',
      wrong: [
        { label: '987', why: '987 est l’année du sacre d’Hugues Capet.' },
        { label: '1453', why: '1453 marque la fin de la guerre de Cent Ans.' },
        { label: '1302', why: '1302 est l’année où Philippe IV le Bel commence à convoquer des états généraux.' },
      ],
      gap: ['La bataille de Bouvines a lieu en ', '.', ['1214']],
      explain: 'La bataille de Bouvines (1214) renforce le pouvoir de Philippe Auguste.',
    },
    {
      ...P.louisIX,
      q: 'Sous quel roi le prestige religieux de la monarchie atteint-il son apogée ?',
      a: 'Louis IX',
      wrong: [
        { label: 'Hugues Capet', why: 'Hugues Capet ouvre la dynastie, quand le roi est encore faible.' },
        { label: 'Philippe IV le Bel', why: 'Philippe IV le Bel est connu pour ses légistes et les états généraux.' },
        { label: 'Charles VII', why: 'Charles VII est un acteur de la guerre de Cent Ans.' },
      ],
      gap: ['Le roi ', ', canonisé en 1297, devient saint Louis.', ['Louis IX', 'Louis 9']],
      explain: 'Le prestige religieux de la monarchie est à son apogée sous Louis IX, canonisé en 1297.',
    },
    {
      ...P.legistes,
      q: 'De qui Philippe IV le Bel s’entoure-t-il pour gouverner ?',
      a: 'de légistes, des juristes',
      wrong: [
        { label: 'de califes', why: 'Les califes gouvernent le monde musulman.' },
        { label: 'de vilains', why: 'Les vilains sont les paysans des seigneuries.' },
        { label: 'de moines mendiants', why: 'Les ordres mendiants sont religieux ; le roi s’entoure de juristes.' },
      ],
      gap: ['Philippe IV le Bel s’entoure de ', ', c’est-à-dire de juristes.', ['légistes', 'legistes']],
      explain: 'Philippe IV le Bel s’entoure de « légistes », des juristes.',
    },
    {
      ...P.legistes,
      q: 'Quelle assemblée Philippe IV le Bel convoque-t-il à partir de 1302 ?',
      a: 'les états généraux',
      wrong: [
        { label: 'le concile de Nicée', why: 'Le concile de Nicée réunit des évêques en 325.' },
        { label: 'la paix de Dieu', why: 'La paix de Dieu est un mouvement lancé par l’Église, pas une assemblée.' },
        { label: 'le Sénat romain', why: 'Le Sénat appartient à Rome, dans l’Antiquité.' },
      ],
      gap: ['À partir de 1302, Philippe IV le Bel convoque des ', '.', ['états généraux', 'etats generaux']],
      explain: 'Philippe IV le Bel convoque à partir de 1302 des états généraux.',
    },
    {
      ...P.impot,
      q: 'À partir de quelle année l’impôt permanent est-il levé ?',
      a: '1360',
      wrong: [
        { label: '987', why: '987 est l’année du sacre d’Hugues Capet.' },
        { label: '1214', why: '1214 est l’année de la bataille de Bouvines.' },
        { label: '1453', why: '1453 marque la fin de la guerre de Cent Ans.' },
      ],
      gap: ['L’impôt permanent est levé à partir de ', '.', ['1360']],
      explain: 'L’appareil administratif se renforce, notamment avec l’impôt permanent levé à partir de 1360.',
    },
    {
      ...P.centAns,
      q: 'Quelles sont les dates de la guerre de Cent Ans ?',
      a: '1337-1453',
      wrong: [
        { label: '1180-1223', why: 'Ce sont les dates du règne de Philippe Auguste.' },
        { label: '1347-1352', why: 'Ce sont les dates de la peste noire.' },
        { label: '1226-1270', why: 'Ce sont les dates du règne de Louis IX.' },
      ],
      gap: ['La guerre de Cent Ans dure de 1337 à ', '.', ['1453']],
      explain: 'La guerre de Cent Ans dure de 1337 à 1453.',
    },
    {
      ...P.capetiensValois,
      q: 'Quelles dynasties le programme nomme-t-il pour le royaume de France ?',
      a: 'les Capétiens et les Valois',
      wrong: [
        { label: 'les Omeyyades et les Abbassides', why: 'Ce sont des dynasties de califes, dans le monde musulman.' },
        {
          label: 'les Mérovingiens et les Carolingiens',
          why: 'Ces dynasties franques règnent avant la période (avant 987).',
        },
        { label: 'les Han', why: 'Les Han sont une dynastie chinoise de l’Antiquité.' },
      ],
      gap: ['Le programme étudie le royaume des Capétiens et des ', '.', ['Valois']],
      explain: 'Le programme étudie l’affirmation de l’État monarchique dans le royaume des Capétiens et des Valois.',
    },
    {
      ...P.suzerain,
      q: 'Aux XIe et XIIe siècles, que représente le roi pour les puissants princes ?',
      a: 'leur suzerain, encore faible',
      wrong: [
        { label: 'leur calife', why: 'Le calife est le successeur de Muhammad, dans le monde musulman.' },
        {
          label: 'leur souverain tout-puissant',
          why: 'Aux XIe et XIIe siècles, le roi est encore faible ; il ne devient souverain que plus tard.',
        },
        { label: 'leur serf', why: 'Le roi n’est pas un serf : il est au sommet de la hiérarchie féodale.' },
      ],
      gap: ['Aux XIe et XIIe siècles, le roi est le ', ' de puissants princes.', ['suzerain']],
      explain: 'Le roi faible, suzerain de puissants princes, laisse place peu à peu au roi souverain.',
    },
  ],
  paires3: [
    ['Hugues Capet', 'Couronné et sacré roi en 987'],
    ['Philippe Auguste', 'Son règne (1180-1223) est un tournant'],
    ['Louis IX', 'Canonisé en 1297'],
  ],
  paires5: [
    ['Les légistes', 'Juristes de Philippe IV le Bel'],
    ['Les états généraux', 'Convoqués à partir de 1302'],
    ['L’impôt permanent', 'Levé à partir de 1360'],
    ['Bouvines', 'Bataille de 1214'],
    ['Le domaine royal', 'Terres du roi, d’abord en Île-de-France et dans l’Orléanais'],
  ],
  frise: [
    { ...P.repere987, label: 'Couronnement et sacre d’Hugues Capet', date: '987' },
    { ...P.bouvines, label: 'Bataille de Bouvines', date: '1214' },
    { ...P.louisIX, label: 'Louis IX est canonisé et devient saint Louis', date: '1297' },
    { ...P.legistes, label: 'Premiers états généraux convoqués par Philippe IV le Bel', date: '1302' },
    { ...P.centAns, label: 'Guerre de Cent Ans', date: '1337-1453' },
  ],
  libres: [
    {
      ...P.repere987,
      q: 'Quel roi est couronné et sacré en 987 ? (prénom et nom)',
      accepted: ['Hugues Capet'],
      traps: [
        { text: 'Philippe Auguste', why: 'Philippe Auguste règne de 1180 à 1223.' },
        { text: 'Charlemagne', why: 'Charlemagne est couronné empereur en 800.' },
      ],
      explain: '987 : couronnement et sacre d’Hugues Capet.',
    },
    {
      ...P.bouvines,
      q: 'Quelle bataille de 1214 renforce le pouvoir de Philippe Auguste ? (un nom)',
      accepted: ['Bouvines', 'la bataille de Bouvines', 'bataille de Bouvines'],
      traps: [
        { text: 'Verdun', why: 'Verdun est le traité de 843 qui partage l’empire carolingien.' },
        { text: 'Prisches', why: 'Prisches est connue pour sa charte de franchises de 1158.' },
      ],
      explain: 'La bataille de Bouvines (1214) renforce le pouvoir de Philippe Auguste.',
    },
    {
      ...P.legistes,
      q: 'Comment appelle-t-on les juristes dont s’entoure Philippe IV le Bel ? (un mot)',
      accepted: ['légistes', 'les légistes', 'legistes', 'les legistes', 'légiste'],
      traps: [
        { text: 'vassaux', why: 'Les vassaux sont des guerriers liés à un seigneur, pas des juristes.' },
        { text: 'bourgeois', why: 'Les bourgeois sont les marchands des villes.' },
      ],
      explain: 'Philippe IV le Bel s’entoure de « légistes », des juristes.',
    },
    {
      ...P.impot,
      q: 'Quel impôt royal est levé à partir de 1360 ? (deux mots)',
      accepted: ['impôt permanent', 'l’impôt permanent', 'impot permanent', 'l’impot permanent'],
      traps: [
        { text: 'banalités', why: 'Les banalités sont des obligations dues au seigneur, pas un impôt royal.' },
        { text: 'charte de franchises', why: 'Une charte de franchises fixe des droits ; ce n’est pas un impôt.' },
      ],
      explain: 'L’impôt permanent est levé à partir de 1360 : l’appareil administratif du roi se renforce.',
    },
  ],
  docs: [
    {
      title: 'Le roi capétien, de 987 à Bouvines',
      lines: [
        'En 987, Hugues Capet, duc de France, est couronné et sacré roi.',
        'Son domaine, en Île-de-France et dans l’Orléanais, devient le domaine royal.',
        'Le sacre lui donne un caractère sacré, mais les grands seigneurs restent puissants.',
        'En 1214, la bataille de Bouvines renforce le pouvoir de Philippe Auguste.',
        'Le roi prend le contrôle de riches fiefs du nord du royaume.',
      ],
      qs: [
        {
          ...P.hugues,
          q: 'Où se trouve le domaine d’Hugues Capet ?',
          a: 'en Île-de-France et dans l’Orléanais',
          wrong: [
            {
              label: 'en Bretagne et en Bourgogne',
              why: 'Ligne 2 : le domaine est en Île-de-France et dans l’Orléanais ; la Bretagne et la Bourgogne restent longtemps autonomes.',
            },
            { label: 'en Flandre et en Italie du Nord', why: 'Ligne 2 : relis le nom des régions du domaine.' },
          ],
          explain: 'Ligne 2 : le domaine d’Hugues Capet s’étend en Île-de-France et dans l’Orléanais.',
        },
        {
          ...P.caractereSacre,
          q: 'Quelle ressource le sacre apporte-t-il au roi ?',
          a: 'un caractère sacré',
          wrong: [
            { label: 'une armée permanente', why: 'Ligne 3 : le sacre donne un caractère sacré, pas une armée.' },
            { label: 'l’impôt permanent', why: 'L’impôt permanent n’est levé qu’à partir de 1360.' },
          ],
          explain: 'Ligne 3 : le caractère sacré du roi est une ressource, même si les grands restent puissants.',
        },
        {
          ...P.bouvines,
          q: 'Que gagne le roi après Bouvines ?',
          a: 'le contrôle de riches fiefs du nord du royaume',
          wrong: [
            { label: 'l’empire byzantin', why: 'L’empire byzantin a pour capitale Constantinople ; relis la ligne 5.' },
            { label: 'la Bretagne et la Bourgogne', why: 'Ligne 5 : il s’agit des fiefs du nord du royaume.' },
          ],
          explain: 'Ligne 5 : après Bouvines, le roi prend le contrôle de riches fiefs du nord du royaume.',
        },
      ],
    },
    {
      title: 'Un État qui se renforce (XIVe-XVe siècles)',
      lines: [
        'Philippe IV le Bel s’entoure de légistes, des spécialistes du droit.',
        'À partir de 1302, il convoque des états généraux.',
        'Pendant la guerre de Cent Ans (1337-1453), l’impôt permanent est levé à partir de 1360.',
        'Charles VII et Jeanne d’Arc sont des acteurs importants de cette guerre.',
        'Le royaume de France en sort transformé en royaume national.',
      ],
      qs: [
        {
          ...P.impot,
          q: 'D’après le texte, quelle ressource nouvelle le roi obtient-il à partir de 1360 ?',
          a: 'l’impôt permanent',
          wrong: [
            { label: 'le butin des croisades', why: 'Ligne 3 : la ressource nouvelle est l’impôt permanent.' },
            {
              label: 'les profits de la foire de Saint-Denis',
              why: 'Cette foire profite à l’abbaye de Saint-Denis ; ligne 3, il s’agit de l’impôt permanent.',
            },
          ],
          explain: 'Ligne 3 : l’impôt permanent, levé à partir de 1360, renforce l’appareil administratif.',
        },
        {
          ...P.acteurs,
          q: 'Quels acteurs importants de la guerre de Cent Ans le texte cite-t-il ?',
          a: 'Charles VII et Jeanne d’Arc',
          wrong: [
            { label: 'Hugues Capet et Suger', why: 'Ils vivent bien avant la guerre de Cent Ans ; relis la ligne 4.' },
            { label: 'Philippe Auguste et Louis IX', why: 'Ils règnent aux XIIe et XIIIe siècles ; relis la ligne 4.' },
          ],
          explain: 'Ligne 4 : Charles VII et Jeanne d’Arc sont des acteurs importants de la guerre de Cent Ans.',
        },
        {
          ...P.royaumeNational,
          q: 'Que devient le royaume de France avec la guerre de Cent Ans ?',
          a: 'un royaume national',
          wrong: [
            { label: 'une commune', why: 'Une commune est une ville qui s’administre elle-même.' },
            { label: 'un califat', why: 'Le califat est le pouvoir du calife, dans le monde musulman.' },
          ],
          explain: 'Ligne 5 : la guerre de Cent Ans transforme le royaume de France en royaume national.',
        },
      ],
    },
  ],
};

export const NOTIONS: readonly Notion[] = [seigneurial, urbaine, eglise, etat];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notion(n, SOURCE, 'cinquième'));
