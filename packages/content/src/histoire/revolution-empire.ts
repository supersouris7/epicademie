import type { Skill } from '../types.ts';
import { notionGuidee, type NotionGuidee } from './avant-la-france-guide.ts';
import { PREUVES as P } from './revolution-empire-sources.ts';

/**
 * CM1, thème 3 « Le temps de la Révolution et de l’Empire » (lot hi-cm1-03, repassé par rp-hi-cm1-03). Chaque fait
 * cite sa source et la citation exacte (`revolution-empire-sources.ts`) ; les textes à lire du niveau 5 sont écrits
 * pour l’exercice.
 */
export const SOURCE = 'cycle3-2020';

const CREDIT = 'Texte écrit pour l’exercice, d’après les sources de la leçon.';

/** Écritures acceptées d'un mot, avec ou sans article. */
const avec = (articles: readonly string[], ...mots: string[]) => [
  ...mots,
  ...articles.flatMap((a) => mots.map((m) => a + m)),
];

const LOUIS_XVI = [...avec(['le roi '], 'Louis XVI', 'Louis 16', 'Louis seize'), 'Louis XVI (seize)', 'Louis XVI (16)'];
const NAPOLEON = [
  ...avec(['l’empereur ', 'le général '], 'Napoléon', 'Napoleon', 'Bonaparte'),
  'Napoléon Bonaparte',
  'Napoleon Bonaparte',
  'Napoléon Ier',
  'Napoleon Ier',
  'Napoléon 1er',
  'Napoleon 1er',
];
const PREFETS = [...avec(['les ', 'des '], 'préfets', 'prefets'), ...avec(['le ', 'un '], 'préfet', 'prefet')];
const BASTILLE = avec(['la ', 'la prison de la ', 'la forteresse de la '], 'Bastille');
const PRIVILEGES = avec(['les ', 'des '], 'privilèges', 'privileges', 'privilège', 'privilege');
const REPUBLIQUE = avec(
  ['la ', 'une '],
  'République',
  'Republique',
  'Première République',
  'Premiere Republique',
  '1re République',
  'Ire République',
);

const etapes: NotionGuidee = {
  id: 'hcm1-1789-execution',
  title: '1789 à l’exécution du roi',
  memo: [
    'La **Révolution** commence en 1789, avec la prise de la Bastille.',
    'En 1792, la **royauté** tombe et la **République** commence.',
    'L’**exécution** du roi Louis XVI a lieu en 1793.',
  ],
  sens: {
    type: 'savais-tu',
    text: 'La fête nationale du 14 juillet vient de l’époque de la Révolution.',
    source: P.federation.source,
    citation: P.federation.quote,
  },
  faits: [
    {
      ...P.theme,
      q: 'En quelle année commence la Révolution française ?',
      a: '1789',
      wrong: [
        { label: '1515', why: 'En 1515, François Ier commence à régner.' },
        { label: '1804', why: 'En 1804, Napoléon devient empereur.' },
        { label: '1792', why: 'En 1792, la royauté tombe : la Révolution a déjà commencé.' },
      ],
      gap: ['La Révolution française commence en ', ' (écris l’année).', ['1789']],
      indice: 'Pense à l’année de la prise de la Bastille.',
      etapes: ['Cherche la première date de la leçon.', 'Élimine les dates des rois et de l’Empire.'],
    },
    {
      ...P.bastille,
      q: 'Quel événement a lieu à Paris le 14 juillet 1789 ?',
      a: 'la prise de la Bastille',
      wrong: [
        { label: 'l’exécution du roi', why: 'Le roi est exécuté plus tard, en 1793.' },
        { label: 'le début de l’Empire', why: 'L’Empire commence en 1804.' },
        { label: 'la fin des privilèges', why: 'Les privilèges sont abolis la nuit du 4 août.' },
      ],
      gap: ['Le 14 juillet 1789, c’est la prise de la ', '.', ['Bastille']],
      indice: 'Le peuple de Paris se révolte ce jour-là.',
      etapes: ['Pense à la révolte du peuple de Paris.', 'Repère le mois : juillet, au début de la Révolution.'],
    },
    {
      ...P.privileges,
      q: 'Qu’est-ce qui est aboli pendant la nuit du 4 août 1789 ?',
      a: 'les privilèges',
      wrong: [
        { label: 'la République', why: 'La République n’existe pas encore : elle commence en 1792.' },
        { label: 'le Code civil', why: 'Le Code civil paraît en 1804.' },
        { label: 'l’édit de Nantes', why: 'Louis XIV annule cet édit en 1685.' },
      ],
      gap: [
        'La nuit du 4 août 1789, on abolit les ',
        ' (avantages réservés à certains).',
        ['privilèges', 'privileges'],
      ],
      indice: 'Ce sont des avantages réservés à certaines personnes.',
      etapes: [
        'Pense à ce que seuls quelques groupes avaient.',
        'Souviens-toi : ensuite, tous sont égaux devant la loi.',
      ],
    },
    {
      ...P.declaration,
      q: 'Quel texte est adopté le 26 août 1789 ?',
      a: 'la Déclaration des droits de l’homme et du citoyen',
      wrong: [
        { label: 'le Code civil', why: 'Le Code civil paraît en 1804, avec Napoléon.' },
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes date de 1598.' },
        { label: 'l’ordonnance de Villers-Cotterêts', why: 'Ce texte de 1539 vient de François Ier.' },
      ],
      gap: ['En 1789, on adopte la Déclaration des droits de l’homme et du ', '.', ['citoyen']],
      indice: 'Son titre parle de droits.',
      etapes: ['Cherche un texte de l’année 1789.', 'Élimine les textes des rois et de Napoléon.'],
    },
    {
      ...P.chute,
      q: 'Qu’arrive-t-il à la monarchie le 10 août 1792 ?',
      a: 'elle tombe',
      wrong: [
        { label: 'elle commence', why: 'La monarchie existe depuis longtemps avant 1792.' },
        { label: 'elle devient un empire', why: 'L’Empire arrive seulement en 1804.' },
        { label: 'elle devient plus forte', why: 'Ce jour-là, le roi perd son pouvoir.' },
      ],
      gap: ['En 1792, c’est la chute de la ', ' : le roi ne gouverne plus.', ['monarchie', 'royauté', 'royaute']],
      indice: 'Ce jour-là, le roi perd son pouvoir.',
      etapes: ['Pense à la journée du 10 août à Paris.', 'Imagine le roi privé de son pouvoir.'],
    },
    {
      ...P.republique,
      q: 'Quel régime est mis en place en septembre 1792 ?',
      a: 'la Première République',
      wrong: [
        { label: 'l’Empire', why: 'L’Empire commence en 1804.' },
        { label: 'l’Ancien Régime', why: 'L’Ancien Régime est le temps d’avant la Révolution.' },
        { label: 'une nouvelle monarchie', why: 'Le roi vient justement de perdre son pouvoir.' },
      ],
      gap: ['En septembre 1792 commence la Première ', '.', ['République', 'Republique']],
      indice: 'C’est un régime sans roi.',
      etapes: ['Souviens-toi : le roi ne gouverne plus.', 'Cherche le régime sans roi ni empereur.'],
    },
    {
      ...P.execution,
      q: 'Quel roi est exécuté le 21 janvier 1793 ?',
      a: 'Louis XVI',
      wrong: [
        { label: 'Louis XIV', why: 'Louis XIV est le roi Soleil, mort bien avant.' },
        { label: 'Louis IX', why: 'Louis IX vit au XIIIe siècle.' },
        { label: 'Henri IV', why: 'Henri IV est mort en 1610.' },
      ],
      gap: ['Le roi exécuté en 1793 est Louis ', ' (en chiffres romains).', ['XVI', '16', 'seize']],
      indice: 'C’est le dernier roi de l’Ancien Régime.',
      etapes: ['Cherche le roi du temps de la Révolution.', 'Compare bien les numéros des rois appelés Louis.'],
    },
  ],
  paires3: [
    ['14 juillet 1789', 'prise de la Bastille'],
    ['4 août 1789', 'fin des privilèges'],
    ['21 janvier 1793', 'exécution du roi'],
  ],
  paires5: [
    ['14 juillet 1789', 'prise de la Bastille'],
    ['4 août 1789', 'fin des privilèges'],
    ['26 août 1789', 'Déclaration des droits'],
    ['septembre 1792', 'Première République'],
    ['21 janvier 1793', 'exécution du roi'],
  ],
  ordre: {
    reperes: ['Prise de la Bastille', 'Chute de la monarchie', 'Début de la Première République', 'Exécution du roi'],
    reponse: 'Bastille, chute, République, puis exécution',
    indice: 'Le roi perd son pouvoir avant d’être jugé.',
    etapes: ['Commence par l’été 1789.', 'Place ensuite août 1792, septembre 1792, puis 1793.'],
  },
  libres: [
    {
      ...P.bastille,
      q: 'Écris l’année de la prise de la Bastille.',
      accepted: ['1789', 'en 1789'],
      traps: [
        { text: '1792', why: 'En 1792, la royauté tombe.' },
        { text: '1804', why: 'En 1804, Napoléon devient empereur.' },
      ],
      indice: 'La Révolution commence cette année-là.',
      etapes: ['Pense au premier 14 juillet célèbre.', 'Écris les quatre chiffres de l’année.'],
    },
    {
      ...P.execution,
      q: 'Écris le nom et le numéro du roi exécuté en 1793.',
      accepted: LOUIS_XVI,
      traps: [
        { text: 'Louis XIV', why: 'Louis XIV est le roi Soleil.' },
        { text: 'Louis XV', why: 'Ce roi règne avant celui de la Révolution.' },
      ],
      indice: 'Il est le dernier roi de l’Ancien Régime.',
      etapes: ['Pense au roi du temps de la Révolution.', 'Écris son prénom, puis son numéro.'],
    },
    {
      ...P.bastille,
      q: 'Écris le nom du lieu pris à Paris le 14 juillet 1789.',
      accepted: BASTILLE,
      traps: [
        { text: 'Versailles', why: 'Versailles est le château du roi, hors de Paris.' },
        { text: 'la Sainte-Chapelle', why: 'La Sainte-Chapelle est bâtie par Louis IX.' },
      ],
      indice: 'Son nom commence par un B.',
      etapes: ['Pense à la révolte du peuple de Paris.', 'Écris le nom de ce lieu célèbre.'],
    },
    {
      ...P.privileges,
      q: 'Écris le nom des avantages réservés, abolis la nuit du 4 août 1789.',
      accepted: PRIVILEGES,
      traps: [
        { text: 'impôts', why: 'Un impôt est une somme à payer, pas un avantage.' },
        { text: 'libertés', why: 'La Révolution veut justement des citoyens libres.' },
      ],
      indice: 'Ce mot commence par « pri ».',
      etapes: ['Pense aux avantages de la noblesse et du clergé.', 'Écris le mot qui nomme ces avantages.'],
    },
    {
      ...P.republique,
      q: 'Écris le nom du régime sans roi qui commence en 1792.',
      accepted: REPUBLIQUE,
      traps: [
        { text: 'Empire', why: 'Un empire a un empereur : il arrive en 1804.' },
        { text: 'monarchie', why: 'La monarchie est le régime du roi.' },
      ],
      indice: 'Ce régime existe encore en France.',
      etapes: ['Pense à ce qui remplace le roi.', 'Écris le nom de ce régime.'],
    },
  ],
  docs: [
    {
      title: 'Un été à Paris',
      lines: [
        'En juillet, le peuple de Paris se révolte.',
        'Une nuit d’août, des avantages réservés sont supprimés.',
        'Ces événements ouvrent la Révolution française.',
      ],
      qs: [
        {
          ...P.theme,
          q: 'Écris l’année de ces événements.',
          accepted: ['1789', 'en 1789'],
          traps: [
            { text: '1792', why: 'En 1792, la royauté tombe.' },
            { text: '1799', why: 'En 1799, Bonaparte prend le pouvoir.' },
          ],
          indice: 'Cherche la date du début de la Révolution.',
          etapes: ['Relis la ligne 3 : la Révolution s’ouvre.', 'Retrouve l’année de ce début.'],
        },
        {
          ...P.privileges,
          q: 'Écris le nom des avantages dont parle la ligne 2.',
          accepted: PRIVILEGES,
          traps: [
            { text: 'impôts', why: 'Un impôt est une somme à payer.' },
            { text: 'libertés', why: 'Les libertés ne sont pas supprimées cette nuit-là.' },
          ],
          indice: 'Ce mot commence par « pri ».',
          etapes: ['Relis la ligne 2 : une nuit d’août.', 'Pense à ce qui est aboli le 4 août.'],
        },
      ],
    },
    {
      title: 'Un régime change',
      lines: [
        'En août 1792, le roi perd son pouvoir.',
        'En septembre, un nouveau régime commence, sans roi.',
        'Quelques mois plus tard, le roi est jugé.',
      ],
      qs: [
        {
          ...P.republique,
          q: 'Écris le nom du régime de la ligne 2.',
          accepted: REPUBLIQUE,
          traps: [
            { text: 'Empire', why: 'Un empire a un empereur.' },
            { text: 'monarchie', why: 'La monarchie a un roi.' },
          ],
          indice: 'Ce régime existe encore en France.',
          etapes: ['Relis la ligne 2 : il n’y a pas de roi.', 'Écris le nom de ce régime.'],
        },
        {
          ...P.execution,
          q: 'Écris le nom et le numéro du roi de ce texte.',
          accepted: LOUIS_XVI,
          traps: [
            { text: 'Louis XIV', why: 'Louis XIV est mort bien avant 1792.' },
            { text: 'Louis XV', why: 'Ce roi règne avant la Révolution.' },
          ],
          indice: 'Cherche le roi du temps de la Révolution.',
          etapes: ['Relis la ligne 1 : repère l’année.', 'Écris le prénom et le numéro du roi.'],
        },
      ],
    },
    {
      title: 'Un grand texte',
      lines: [
        'En juillet 1789, le peuple de Paris se révolte.',
        'Fin août, un grand texte est adopté.',
        'Il parle des droits de l’homme.',
      ],
      qs: [
        {
          ...P.bastille,
          q: 'Écris le nom du lieu pris pendant la révolte de la ligne 1.',
          accepted: BASTILLE,
          traps: [
            { text: 'Versailles', why: 'Versailles est le château du roi.' },
            { text: 'la Sainte-Chapelle', why: 'Ce monument vient de Louis IX.' },
          ],
          indice: 'Son nom commence par un B.',
          etapes: ['Relis la ligne 1 : juillet, à Paris.', 'Pense au lieu pris le 14 juillet.'],
        },
        {
          ...P.declaration,
          q: 'Écris le premier mot du titre de ce texte.',
          accepted: avec(['la '], 'Déclaration', 'Declaration', 'Déclaration des droits de l’homme et du citoyen'),
          traps: [
            { text: 'Code', why: 'Le Code civil paraît en 1804.' },
            { text: 'Édit', why: 'Un édit est un texte décidé par un roi.' },
          ],
          indice: 'Ce mot commence par un D.',
          etapes: ['Relis les lignes 2 et 3.', 'Souviens-toi du titre adopté le 26 août.'],
        },
      ],
    },
  ],
};

const nation: NotionGuidee = {
  id: 'hcm1-nation',
  title: 'La Nation et la Révolution',
  memo: [
    'Avant la Révolution, c’est l’**Ancien Régime** : le roi gouverne.',
    'La Révolution est une **rupture** avec cet ordre.',
    'La **Nation** réunit alors des **citoyens** libres et égaux en droit.',
  ],
  sens: {
    type: 'histoire',
    text: 'Pendant la Révolution, une idée neuve : la nation réunit des citoyens libres et égaux en droit.',
    source: P.federation.source,
    citation: P.federation.quote,
  },
  faits: [
    {
      ...P.rupture,
      q: 'Louis XVI est le dernier roi de quelle époque ?',
      a: 'de l’Ancien Régime',
      wrong: [
        { label: 'de l’Empire', why: 'L’Empire est dirigé par un empereur : Napoléon.' },
        { label: 'de l’Antiquité', why: 'L’Antiquité est bien plus ancienne.' },
        { label: 'de la Renaissance', why: 'La Renaissance est le temps de François Ier.' },
      ],
      gap: ['Louis XVI est le dernier roi de l’', ' Régime.', ['Ancien']],
      indice: 'C’est le temps d’avant la Révolution.',
      etapes: ['Pense au monde d’avant 1789.', 'Élimine les époques trop anciennes ou plus récentes.'],
    },
    {
      ...P.rupture,
      q: 'La Révolution casse l’ordre du roi. Comment appelle-t-on ce grand changement ?',
      a: 'une rupture',
      wrong: [
        { label: 'une continuité', why: 'Une continuité garde les choses comme avant.' },
        { label: 'un héritage', why: 'Un héritage est ce que le passé laisse.' },
        { label: 'une alliance', why: 'Une alliance est un accord entre deux groupes.' },
      ],
      gap: ['La Révolution est une ', ' avec l’ordre du roi.', ['rupture', 'cassure']],
      indice: 'Pense à une corde qui casse.',
      etapes: ['Imagine l’ordre du roi qui se casse.', 'Cherche le mot qui dit que tout s’arrête net.'],
    },
    {
      ...P.nation,
      q: 'Pendant la Révolution, qui forme la nation ?',
      a: 'des citoyens libres et égaux en droit',
      wrong: [
        { label: 'le roi tout seul', why: 'La nation réunit des citoyens, pas une seule personne.' },
        { label: 'seulement les nobles', why: 'Les nobles ne sont qu’une petite partie du pays.' },
        { label: 'seulement le clergé', why: 'Le clergé n’est qu’un groupe du pays.' },
      ],
      gap: ['Des citoyens libres et égaux en droit forment la ', ' (mot en n).', ['Nation']],
      indice: 'Pense à tous ceux qui s’associent.',
      etapes: ['Pense à un grand groupe qui s’associe.', 'Élimine les réponses avec un seul petit groupe.'],
    },
    {
      ...P.privileges,
      q: 'La fin des privilèges rend les citoyens égaux devant quoi ?',
      a: 'devant la loi',
      wrong: [
        { label: 'devant le roi seulement', why: 'Il s’agit d’une règle pour tous, pas du roi.' },
        { label: 'devant l’argent', why: 'Certains restent plus riches que d’autres.' },
        { label: 'devant les nobles', why: 'Les nobles perdent justement leurs avantages.' },
      ],
      gap: ['La fin des privilèges rend les citoyens égaux devant la ', '.', ['loi']],
      indice: 'C’est la règle que chacun doit suivre.',
      etapes: ['Pense à la règle commune à tous.', 'Compare : un noble et un paysan la suivent.'],
    },
    {
      ...P.dessin,
      q: 'Sur un dessin de l’époque, le tiers état porte deux groupes sur son dos. Lesquels ?',
      a: 'la noblesse et le clergé',
      wrong: [
        { label: 'le roi et la reine', why: 'Le dessin montre deux groupes entiers de la société.' },
        { label: 'les paysans et les artisans', why: 'Ils font partie du tiers état : ils portent.' },
        { label: 'les soldats et les marins', why: 'Le dessin parle des groupes qui ont des privilèges.' },
      ],
      gap: ['Sur ce dessin, le tiers état porte la noblesse et le ', '.', ['clergé', 'clerge']],
      indice: 'Pense aux deux groupes qui ont des privilèges.',
      etapes: ['Pense aux groupes avantagés de la société.', 'Cherche les nobles et les gens d’Église.'],
    },
    {
      ...P.finances,
      q: 'Avant 1789, quel genre de problème la monarchie veut-elle régler ?',
      a: 'un problème d’argent',
      wrong: [
        { label: 'un problème de climat', why: 'La monarchie veut redresser ses comptes.' },
        { label: 'un manque d’écoles', why: 'Le projet vise les comptes du royaume, pas les écoles.' },
        { label: 'une invasion romaine', why: 'Les Romains vivent dans l’Antiquité.' },
      ],
      gap: ['Avant 1789, la monarchie veut régler un problème d’', '.', ['argent']],
      indice: 'Pense à ce qui sert à payer.',
      etapes: ['Imagine un royaume qui doit payer.', 'Cherche ce qui sert à payer.'],
    },
    {
      ...P.origines,
      q: 'Qu’appelle-t-on les origines de la Révolution ?',
      a: 'les causes qui l’expliquent',
      wrong: [
        { label: 'les étapes qui la suivent', why: 'Les étapes viennent après le début.' },
        { label: 'les héritages qu’elle laisse', why: 'Un héritage reste après l’événement.' },
        { label: 'les fêtes qui la rappellent', why: 'Une fête célèbre un événement passé.' },
      ],
      gap: ['Les causes qui expliquent la Révolution sont ses ', ' (mot en o).', ['origines', 'origine']],
      indice: 'Pense au point de départ.',
      etapes: ['Pense à la question « pourquoi ? ».', 'Cherche ce qui vient avant le début.'],
    },
  ],
  paires3: [
    ['Ancien Régime', 'le roi gouverne'],
    ['Rupture', 'l’ordre ancien casse'],
    ['Nation', 'citoyens libres et égaux'],
  ],
  paires5: [
    ['Ancien Régime', 'le roi gouverne'],
    ['Rupture', 'l’ordre ancien casse'],
    ['Nation', 'citoyens libres et égaux'],
    ['Tiers état', 'il porte les autres'],
    ['Origines', 'causes d’un événement'],
  ],
  ordre: {
    reperes: ['Réunion des états généraux', 'Prise de la Bastille', 'Fin des privilèges', 'Fête de la Fédération'],
    reponse: 'états généraux, Bastille, privilèges, puis fête',
    indice: 'La fête a lieu un an après la Bastille.',
    etapes: ['Commence par le printemps 1789.', 'Place ensuite juillet, août, puis l’année 1790.'],
  },
  libres: [
    {
      ...P.rupture,
      q: 'Écris le mot qui manque : avant la Révolution, c’est l’… Régime.',
      accepted: ['Ancien', 'l’Ancien', ...avec(['l’'], 'Ancien Régime', 'Ancien Regime')],
      traps: [
        { text: 'Nouveau', why: 'Le nouveau commence avec la Révolution.' },
        { text: 'Premier', why: 'Ce n’est pas le nom du temps des rois.' },
      ],
      indice: 'Pense au monde qui existait avant.',
      etapes: ['Pense au monde d’avant 1789.', 'Écris le mot qui complète son nom.'],
    },
    {
      ...P.rupture,
      q: 'Écris le contraire du mot « continuité ».',
      accepted: avec(['la ', 'une '], 'rupture', 'cassure'),
      traps: [
        { text: 'héritage', why: 'Un héritage montre au contraire un lien avec le passé.' },
        { text: 'alliance', why: 'Une alliance unit : elle ne casse rien.' },
      ],
      indice: 'Pense à quelque chose qui casse.',
      etapes: ['Pense : la continuité, rien ne casse.', 'Écris le mot qui dit le contraire.'],
    },
    {
      ...P.nation,
      q: 'Écris le mot en n : des citoyens libres et égaux qui s’associent.',
      accepted: avec(['la ', 'une '], 'Nation'),
      traps: [
        { text: 'noblesse', why: 'La noblesse est un groupe avantagé.' },
        { text: 'royauté', why: 'La royauté est le régime du roi.' },
      ],
      indice: 'Ce mot est dans le titre de la leçon.',
      etapes: ['Pense à tous les citoyens réunis.', 'Écris le mot qui commence par n.'],
    },
    {
      ...P.dessin,
      q: 'Sur le dessin, quel groupe porte la noblesse et le clergé ? Écris son nom.',
      accepted: avec(['le '], 'tiers état', 'tiers-état', 'tiers etat', 'tiers-etat'),
      traps: [
        { text: 'la noblesse', why: 'La noblesse est portée sur le dos.' },
        { text: 'le clergé', why: 'Le clergé est porté sur le dos.' },
      ],
      indice: 'Son nom a deux mots.',
      etapes: ['Pense à ceux qui n’ont pas ces avantages.', 'Écris le nom de ce groupe.'],
    },
    {
      ...P.privileges,
      q: 'La fin des privilèges rend les citoyens … devant la loi. Écris le mot.',
      accepted: ['égaux', 'egaux'],
      traps: [
        { text: 'libres', why: 'Être libre est important, mais devant la loi on parle d’égalité.' },
        { text: 'riches', why: 'La loi ne rend pas riche.' },
      ],
      indice: 'Pense à : « pareils pour tous ».',
      etapes: ['Imagine la même règle pour chacun.', 'Écris le mot au pluriel.'],
    },
  ],
  docs: [
    {
      title: 'Deux mondes',
      lines: [
        'Avant 1789, le roi gouverne le pays.',
        'Louis XVI est le dernier roi de ce monde-là.',
        'La Révolution casse cet ordre.',
      ],
      qs: [
        {
          ...P.rupture,
          q: 'Écris le nom donné à ce monde d’avant.',
          accepted: [...avec(['l’'], 'Ancien Régime', 'Ancien Regime')],
          traps: [
            { text: 'Empire', why: 'L’Empire vient après la Révolution.' },
            { text: 'République', why: 'La République n’a pas de roi.' },
          ],
          indice: 'Son nom a deux mots.',
          etapes: ['Relis les lignes 1 et 2.', 'Écris le nom du temps des rois d’avant 1789.'],
        },
        {
          ...P.rupture,
          q: 'Nomme le changement de la ligne 3 : écris le contraire de « continuité ».',
          accepted: avec(['la ', 'une '], 'rupture'),
          traps: [
            { text: 'royauté', why: 'La royauté est l’ordre qui est cassé.' },
            { text: 'réunion', why: 'Une réunion rassemble : ici, un ordre casse.' },
          ],
          indice: 'Pense à quelque chose qui casse.',
          etapes: ['Relis la ligne 3 : un ordre casse.', 'Cherche le mot proche de « rompre ».'],
        },
      ],
    },
    {
      title: 'Un dessin',
      lines: [
        'Sur un dessin, un homme avance, le dos courbé.',
        'Il porte un noble et un homme d’Église.',
        'Il représente un groupe de la société.',
      ],
      qs: [
        {
          ...P.dessin,
          q: 'Écris le nom du groupe que représente cet homme.',
          accepted: avec(['le '], 'tiers état', 'tiers-état', 'tiers etat', 'tiers-etat'),
          traps: [
            { text: 'la noblesse', why: 'Le noble est porté : ce n’est pas lui.' },
            { text: 'le clergé', why: 'L’homme d’Église est porté.' },
          ],
          indice: 'Son nom a deux mots.',
          etapes: ['Relis les lignes 1 et 2.', 'Cherche le groupe qui porte les autres.'],
        },
        {
          ...P.dessin,
          q: 'Écris le nom du groupe des hommes d’Église.',
          accepted: avec(['le '], 'clergé', 'clerge'),
          traps: [
            { text: 'noblesse', why: 'La noblesse est le groupe des nobles.' },
            { text: 'tiers état', why: 'Le tiers état est le groupe qui porte.' },
          ],
          indice: 'Ce mot commence par « cl ».',
          etapes: ['Relis la ligne 2 : qui est porté ?', 'Écris le nom du groupe religieux.'],
        },
      ],
    },
    {
      title: 'Ensemble',
      lines: [
        'Des habitants d’un pays se réunissent.',
        'Ils sont libres et ont les mêmes droits.',
        'Ils choisissent de s’associer.',
      ],
      qs: [
        {
          ...P.nation,
          q: 'Pendant la Révolution, que forment-ils ensemble ? Écris le mot en n.',
          accepted: avec(['la ', 'une '], 'Nation'),
          traps: [
            { text: 'noblesse', why: 'La noblesse est un petit groupe avantagé.' },
            { text: 'nature', why: 'La nature ne désigne pas un groupe de personnes.' },
          ],
          indice: 'Ce mot parle de tout un peuple.',
          etapes: ['Relis les trois lignes.', 'Écris le mot qui nomme leur groupe.'],
        },
        {
          ...P.nation,
          q: 'Écris le mot qui nomme ces personnes qui ont des droits.',
          accepted: avec(['des ', 'les ', 'un '], 'citoyens', 'citoyen'),
          traps: [
            { text: 'sujets', why: 'Un sujet obéit à un roi.' },
            { text: 'nobles', why: 'Les nobles ne sont qu’une partie des habitants.' },
          ],
          indice: 'Ce mot commence par « ci ».',
          etapes: ['Relis la ligne 2 : droits et liberté.', 'Écris le nom de ces membres de la nation.'],
        },
      ],
    },
  ],
};

const napoleon: NotionGuidee = {
  id: 'hcm1-napoleon',
  title: 'Napoléon Bonaparte, du général à l’Empereur',
  memo: [
    'Napoléon Bonaparte est d’abord un **général**.',
    'En 1799, il prend le pouvoir par un **coup d’État**.',
    'En 1804, il est proclamé **empereur** des Français.',
  ],
  sens: {
    type: 'histoire',
    text: 'Napoléon a mis en place les préfets pour réorganiser l’État.',
    source: P.prefets.source,
    citation: P.prefets.quote,
  },
  faits: [
    {
      ...P.pouvoir,
      q: 'Que fait Napoléon Bonaparte avant de diriger le pays ?',
      a: 'il est général dans l’armée',
      wrong: [
        { label: 'il est roi de France', why: 'Napoléon n’est pas roi : il devient empereur.' },
        { label: 'il est peintre à la cour', why: 'Bonaparte est un militaire, pas un artiste.' },
        { label: 'il est ministre du roi Soleil', why: 'Le roi Soleil vit bien avant lui.' },
      ],
      gap: ['Avant de diriger le pays, Bonaparte est ', ' dans l’armée.', ['général', 'general']],
      indice: 'Il commande des soldats.',
      etapes: ['Pense à un chef qui commande des soldats.', 'Élimine les métiers sans lien avec l’armée.'],
    },
    {
      ...P.pouvoir,
      q: 'Comment Napoléon Bonaparte prend-il le pouvoir ?',
      a: 'par la force',
      wrong: [
        { label: 'par héritage de son père', why: 'Son père n’est pas roi : il n’hérite pas du pouvoir.' },
        { label: 'par un tirage au sort', why: 'Le pouvoir ne se tire pas au sort ici.' },
        { label: 'par un mariage royal', why: 'Bonaparte ne devient pas chef grâce à un mariage.' },
      ],
      gap: ['Napoléon prend le pouvoir par la ', '.', ['force']],
      indice: 'Un général s’appuie sur son armée.',
      etapes: ['Pense à son métier de militaire.', 'Imagine comment un chef d’armée peut s’imposer.'],
    },
    {
      ...P.brumaire,
      q: 'Comment appelle-t-on la prise du pouvoir par Bonaparte en 1799 ?',
      a: 'un coup d’État',
      wrong: [
        { label: 'un couronnement', why: 'En 1799, Bonaparte n’est pas encore empereur.' },
        { label: 'un traité de paix', why: 'Un traité de paix arrête une guerre.' },
        { label: 'un édit', why: 'Un édit est un texte décidé par un roi.' },
      ],
      gap: ['En 1799, Bonaparte fait un coup d’', '.', ['État', 'Etat']],
      indice: 'C’est une prise du pouvoir hors des règles.',
      etapes: ['Pense à un pouvoir pris par la force.', 'Cherche l’expression en trois mots.'],
    },
    {
      ...P.brumaire,
      q: 'En quelle année Bonaparte fait-il son coup d’État ?',
      a: '1799',
      wrong: [
        { label: '1789', why: 'En 1789, la Révolution commence.' },
        { label: '1804', why: 'En 1804, il devient empereur.' },
        { label: '1793', why: 'En 1793, le roi est exécuté.' },
      ],
      gap: ['Le coup d’État de Bonaparte a lieu en ', ' (écris l’année).', ['1799']],
      indice: 'C’est dix ans après le début de la Révolution.',
      etapes: ['Pars de l’année 1789.', 'Ajoute dix ans.'],
    },
    {
      ...P.pouvoir,
      q: 'En quelle année Napoléon est-il proclamé empereur des Français ?',
      a: '1804',
      wrong: [
        { label: '800', why: 'En 800, Charlemagne est couronné empereur.' },
        { label: '1789', why: 'En 1789, la Révolution commence.' },
        { label: '1799', why: 'En 1799, il prend le pouvoir, sans être encore empereur.' },
      ],
      gap: ['Napoléon est proclamé empereur des Français en ', ' (écris l’année).', ['1804']],
      indice: 'C’est cinq ans après son coup d’État.',
      etapes: ['Pars de l’année 1799.', 'Ajoute cinq ans.'],
    },
    {
      ...P.pouvoir,
      q: 'Quel titre Napoléon reçoit-il en 1804 ?',
      a: 'empereur des Français',
      wrong: [
        { label: 'roi des Francs', why: 'Clovis est roi des Francs, bien plus tôt.' },
        { label: 'roi Soleil', why: 'Le roi Soleil est Louis XIV.' },
        { label: 'roi chrétien', why: 'Le roi chrétien est Louis IX.' },
      ],
      gap: ['En 1804, Napoléon est proclamé ', ' des Français.', ['empereur']],
      indice: 'Ce chef dirige un Empire.',
      etapes: ['Pense au nom du nouveau régime : l’Empire.', 'Cherche le titre de son chef.'],
    },
    {
      ...P.empire,
      q: 'Quel régime Bonaparte établit-il en 1804 ?',
      a: 'l’Empire',
      wrong: [
        { label: 'la monarchie absolue', why: 'C’est le régime des rois avant la Révolution.' },
        { label: 'la Première République', why: 'Elle est mise en place en 1792.' },
        { label: 'l’Ancien Régime', why: 'L’Ancien Régime est avant 1789.' },
      ],
      gap: ['En 1804, Bonaparte établit l’', '.', ['Empire']],
      indice: 'Son chef porte le titre d’empereur.',
      etapes: ['Pense au titre reçu en 1804.', 'Cherche le régime dirigé par ce chef.'],
    },
  ],
  paires3: [
    ['Général', 'chef dans l’armée'],
    ['1799', 'coup d’État'],
    ['1804', 'il devient empereur'],
  ],
  paires5: [
    ['1789', 'début de la Révolution'],
    ['1799', 'coup d’État'],
    ['1804', 'il devient empereur'],
    ['Général', 'chef dans l’armée'],
    ['Empire', 'régime d’un empereur'],
  ],
  ordre: {
    reperes: ['Début de la Révolution', 'Exécution du roi', 'Coup d’État de Bonaparte', 'Bonaparte devient empereur'],
    reponse: 'Révolution, exécution, coup d’État, puis empereur',
    indice: 'Bonaparte prend le pouvoir avant d’être empereur.',
    etapes: ['Commence par 1789, puis 1793.', 'Place ensuite 1799, puis 1804.'],
  },
  libres: [
    {
      ...P.pouvoir,
      q: 'Écris l’année où Napoléon est proclamé empereur.',
      accepted: ['1804', 'en 1804'],
      traps: [
        { text: '1799', why: 'En 1799, il fait son coup d’État.' },
        { text: '800', why: 'En 800, Charlemagne est couronné.' },
      ],
      indice: 'C’est après le coup d’État.',
      etapes: ['Pense à la fin de son parcours.', 'Écris les quatre chiffres.'],
    },
    {
      ...P.brumaire,
      q: 'Écris l’année du coup d’État de Bonaparte.',
      accepted: ['1799', 'en 1799'],
      traps: [
        { text: '1789', why: 'En 1789, la Révolution commence.' },
        { text: '1804', why: 'En 1804, il devient empereur.' },
      ],
      indice: 'C’est dix ans après la prise de la Bastille.',
      etapes: ['Pars du début de la Révolution.', 'Ajoute dix ans et écris l’année.'],
    },
    {
      ...P.pouvoir,
      q: 'Écris le grade de Bonaparte, chef dans l’armée.',
      accepted: avec(['un '], 'général', 'general'),
      traps: [
        { text: 'soldat', why: 'Bonaparte commande : il est plus qu’un simple soldat.' },
        { text: 'empereur', why: 'Il devient empereur seulement en 1804.' },
      ],
      indice: 'Ce mot commence par un g.',
      etapes: ['Pense à son métier avant le pouvoir.', 'Écris ce grade militaire.'],
    },
    {
      ...P.pouvoir,
      q: 'Écris le titre que Napoléon reçoit en 1804.',
      accepted: [
        'empereur',
        'l’empereur',
        'empereur des Français',
        'empereur des Francais',
        'l’empereur des Français',
        'l’empereur des Francais',
      ],
      traps: [
        { text: 'roi', why: 'Napoléon n’est jamais roi de France.' },
        { text: 'consul', why: 'Il est consul avant 1804.' },
      ],
      indice: 'Ce titre va avec le mot « Empire ».',
      etapes: ['Pense au nouveau régime de 1804.', 'Écris le titre de son chef.'],
    },
    {
      ...P.brumaire,
      q: 'Écris le nom d’une prise du pouvoir par la force, hors des règles.',
      accepted: avec(['un ', 'le '], 'coup d’État', 'coup d’Etat'),
      traps: [
        { text: 'couronnement', why: 'Un couronnement est une cérémonie.' },
        { text: 'élection', why: 'Une élection suit des règles et un vote.' },
      ],
      indice: 'L’expression commence par « coup ».',
      etapes: ['Pense à ce que fait Bonaparte en 1799.', 'Écris l’expression en entier.'],
    },
  ],
  docs: [
    {
      title: 'Je me présente',
      lines: [
        'Je commande des armées de la République.',
        'En novembre 1799, je prends le pouvoir.',
        'En 1804, je reçois un nouveau titre.',
      ],
      qs: [
        {
          ...P.brumaire,
          q: 'Écris le nom de celui qui parle.',
          accepted: NAPOLEON,
          traps: [
            { text: 'Louis XVI', why: 'Ce roi est exécuté en 1793.' },
            { text: 'Charlemagne', why: 'Charlemagne devient empereur en 800.' },
          ],
          indice: 'Cherche le chef de 1799.',
          etapes: ['Relis les trois lignes : armée, pouvoir, titre.', 'Écris le nom de ce personnage.'],
        },
        {
          ...P.pouvoir,
          q: 'Écris le titre dont parle la ligne 3.',
          accepted: ['empereur', 'l’empereur', 'empereur des Français', 'empereur des Francais'],
          traps: [
            { text: 'roi', why: 'Napoléon ne devient pas roi.' },
            { text: 'général', why: 'Il a ce grade avant de prendre le pouvoir.' },
          ],
          indice: 'Pense au régime de 1804.',
          etapes: ['Relis la ligne 3 : repère l’année.', 'Retrouve le titre reçu cette année-là.'],
        },
      ],
    },
    {
      title: 'La frise de Léa',
      lines: [
        'Léa note d’abord le début de la Révolution.',
        'Dix ans plus tard, un général prend le pouvoir.',
        'Cinq ans après, un Empire commence.',
      ],
      qs: [
        {
          ...P.brumaire,
          q: 'Écris l’année de la ligne 2.',
          accepted: ['1799', 'en 1799'],
          traps: [
            { text: '1789', why: 'C’est l’année de la ligne 1.' },
            { text: '1804', why: 'C’est l’année de la ligne 3.' },
          ],
          indice: 'Calcule à partir du début de la Révolution.',
          etapes: ['Trouve l’année de la ligne 1.', 'Ajoute dix ans.'],
        },
        {
          ...P.empire,
          q: 'Écris l’année de la ligne 3.',
          accepted: ['1804', 'en 1804'],
          traps: [
            { text: '1799', why: 'C’est l’année de la ligne 2.' },
            { text: '1794', why: 'Ajoute les années au lieu de reculer.' },
          ],
          indice: 'Calcule ligne après ligne.',
          etapes: ['Trouve les années des lignes 1 et 2.', 'Ajoute cinq ans à la deuxième.'],
        },
      ],
    },
    {
      title: 'Un chef nouveau',
      lines: [
        'Un chef de l’armée prend le pouvoir par la force.',
        'Il agit sans suivre les règles prévues.',
        'En 1804, la France devient un Empire.',
      ],
      qs: [
        {
          ...P.pouvoir,
          q: 'Écris le nom de ce chef.',
          accepted: NAPOLEON,
          traps: [
            { text: 'Louis XIV', why: 'Louis XIV est un roi, bien plus tôt.' },
            { text: 'Clovis', why: 'Clovis est un roi des Francs.' },
          ],
          indice: 'Il est lié à l’année 1804.',
          etapes: ['Relis les lignes 1 et 3.', 'Pense au général devenu empereur.'],
        },
        {
          ...P.brumaire,
          q: 'Écris l’expression qui nomme l’action des lignes 1 et 2.',
          accepted: avec(['un ', 'le '], 'coup d’État', 'coup d’Etat'),
          traps: [
            { text: 'couronnement', why: 'Un couronnement est une cérémonie.' },
            { text: 'élection', why: 'Une élection suit des règles.' },
          ],
          indice: 'L’expression commence par « coup ».',
          etapes: ['Relis : force, hors des règles.', 'Écris l’expression en trois mots.'],
        },
      ],
    },
  ],
};

const heritages: NotionGuidee = {
  id: 'hcm1-heritages-revolution',
  title: 'Héritages de la période',
  memo: [
    'Napoléon garde certains **acquis** de la Révolution.',
    'Son **Code civil** pose l’égalité des citoyens devant la loi.',
    'Mais il respecte de moins en moins les libertés.',
  ],
  sens: {
    type: 'savais-tu',
    text: 'La cocarde tricolore, symbole de la Révolution, fait encore partie des symboles de la République.',
    source: P.cocarde.source,
    citation: P.cocarde.quote,
  },
  faits: [
    {
      ...P.acquis,
      q: 'Que fait Napoléon de certains acquis de la Révolution ?',
      a: 'il les garde',
      wrong: [
        { label: 'il les efface tous', why: 'Napoléon garde une partie de ce qui a été gagné.' },
        { label: 'il les rend au roi', why: 'Il n’y a plus de roi sous l’Empire.' },
        {
          label: 'il les remplace par les privilèges',
          why: 'Les privilèges sont abolis : Napoléon garde l’égalité devant la loi.',
        },
      ],
      gap: [
        'Napoléon ',
        ' certains acquis de la Révolution (verbe au présent).',
        ['conserve', 'garde', 'maintient', 'préserve', 'preserve', 'respecte', 'sauvegarde', 'reprend'],
      ],
      indice: 'Un acquis est gagné : que devient-il ici ?',
      etapes: ['Pense à l’égalité devant la loi.', 'Remarque qu’elle reste sous Napoléon.'],
    },
    {
      ...P.code,
      q: 'Quel texte de 1804 unifie le droit français ?',
      a: 'le Code civil',
      wrong: [
        { label: 'la Déclaration des droits de l’homme', why: 'La Déclaration date de 1789.' },
        { label: 'l’édit de Nantes', why: 'L’édit de Nantes date de 1598.' },
        { label: 'l’ordonnance de Villers-Cotterêts', why: 'Ce texte de 1539 vient de François Ier.' },
      ],
      gap: ['En 1804 paraît le Code ', ' de Napoléon.', ['civil']],
      indice: 'Compare les dates des textes.',
      etapes: ['Cherche le texte de l’année 1804.', 'Élimine les textes plus anciens.'],
    },
    {
      ...P.code,
      q: 'Quel principe le Code civil suit-il ?',
      a: 'l’égalité des citoyens devant la loi',
      wrong: [
        { label: 'les privilèges des nobles', why: 'Les privilèges sont abolis en 1789.' },
        { label: 'le pouvoir d’un roi', why: 'Le Code civil vient après la fin de la royauté.' },
        { label: 'les droits féodaux', why: 'La Révolution combat ces droits des seigneurs.' },
      ],
      gap: ['Le Code civil suit l’', ' des citoyens devant la loi.', ['égalité', 'egalite']],
      indice: 'Pense à la fin des privilèges.',
      etapes: ['Souviens-toi de la nuit du 4 août.', 'Cherche ce qui est resté ensuite.'],
    },
    {
      ...P.prefets,
      q: 'Qui Napoléon met-il en place dans les départements ?',
      a: 'des préfets',
      wrong: [
        { label: 'des seigneurs', why: 'Les seigneurs appartiennent à l’ordre ancien.' },
        { label: 'des consuls', why: 'Bonaparte est consul au sommet de l’État, avant 1804.' },
        { label: 'des chevaliers', why: 'Les chevaliers sont des combattants du Moyen Âge.' },
      ],
      gap: ['Dans les départements, Napoléon met en place des ', '.', ['préfets', 'prefets']],
      indice: 'Ils représentent l’État.',
      etapes: ['Pense à un représentant de l’État.', 'Cherche un mot encore utilisé aujourd’hui.'],
    },
    {
      ...P.banque,
      q: 'Napoléon aide à créer une banque. Laquelle ?',
      a: 'la Banque de France',
      wrong: [
        { label: 'la Banque de Rome', why: 'Napoléon agit ici pour l’État français.' },
        { label: 'la Banque du roi', why: 'Il n’y a plus de roi sous l’Empire.' },
        { label: 'la Banque des seigneurs', why: 'Les seigneurs appartiennent à l’ordre ancien.' },
      ],
      gap: ['Napoléon aide à créer la Banque de ', '.', ['France']],
      indice: 'Elle porte le nom d’un pays.',
      etapes: ['Pense au pays que Napoléon dirige.', 'Élimine les noms liés aux rois et aux seigneurs.'],
    },
    {
      ...P.cocarde,
      q: 'Quel symbole de la Révolution est encore présent aujourd’hui ?',
      a: 'la cocarde tricolore',
      wrong: [
        { label: 'la couronne du roi', why: 'La couronne est un signe de la royauté.' },
        { label: 'le soleil de Louis XIV', why: 'Le soleil est le signe du roi Soleil.' },
        { label: 'l’épée du chevalier', why: 'Le chevalier appartient au Moyen Âge.' },
      ],
      gap: ['La ', ' tricolore est un symbole de la Révolution.', ['cocarde']],
      indice: 'Il a trois couleurs.',
      etapes: ['Pense aux symboles à trois couleurs.', 'Élimine les signes des rois et des chevaliers.'],
    },
    {
      ...P.acquis,
      q: 'Napoléon garde des acquis. Que montre ce choix entre la Révolution et l’Empire ?',
      a: 'une part de continuité',
      wrong: [
        { label: 'une rupture totale', why: 'Une rupture totale ne garderait rien.' },
        { label: 'un retour à l’Ancien Régime', why: 'Napoléon n’est pas un roi de l’ordre ancien.' },
        { label: 'aucun lien entre les deux', why: 'Garder des acquis crée justement un lien.' },
      ],
      gap: ['Garder des acquis crée une part de ', ' (contraire de « rupture »).', ['continuité', 'continuite']],
      indice: 'Pense à ce qui ne casse pas.',
      etapes: ['Compare avant et après Napoléon.', 'Repère ce qui continue.'],
    },
  ],
  paires3: [
    ['Code civil', 'droit unifié en 1804'],
    ['Préfets', 'l’État dans les départements'],
    ['Cocarde', 'symbole à trois couleurs'],
  ],
  paires5: [
    ['Code civil', 'droit unifié en 1804'],
    ['Préfets', 'l’État dans les départements'],
    ['Cocarde', 'symbole à trois couleurs'],
    ['Acquis', 'ce qu’on gagne et garde'],
    ['Rupture', 'un ordre qui casse'],
  ],
  ordre: {
    reperes: [
      'Fin des privilèges',
      'Début de la Première République',
      'Coup d’État de Bonaparte',
      'Parution du Code civil',
    ],
    reponse: 'privilèges, République, coup d’État, puis Code civil',
    indice: 'Le Code civil arrive après le coup d’État.',
    etapes: ['Commence par 1789, puis 1792.', 'Place ensuite 1799, puis 1804.'],
  },
  libres: [
    {
      ...P.code,
      q: 'Écris le nom du texte de 1804 qui unifie le droit français.',
      accepted: [
        ...avec(['le '], 'Code civil'),
        'Code Napoléon',
        'le Code Napoléon',
        'Code Napoleon',
        'le Code Napoleon',
      ],
      traps: [
        { text: 'Déclaration des droits de l’homme et du citoyen', why: 'Ce texte date de 1789.' },
        { text: 'édit de Nantes', why: 'Ce texte date de 1598.' },
      ],
      indice: 'Son nom commence par « Code ».',
      etapes: ['Pense au grand texte de Napoléon.', 'Écris les deux mots de son nom.'],
    },
    {
      ...P.prefets,
      q: 'Qui Napoléon met-il en place dans les départements ? Écris le mot.',
      accepted: PREFETS,
      traps: [
        { text: 'seigneurs', why: 'Les seigneurs appartiennent à l’ordre ancien.' },
        { text: 'rois', why: 'Il n’y a plus de roi sous l’Empire.' },
      ],
      indice: 'Ce mot commence par « pr ».',
      etapes: ['Pense au représentant de l’État.', 'Écris son nom.'],
    },
    {
      ...P.code,
      q: 'Le Code civil veut des citoyens égaux devant la… Écris le mot.',
      accepted: avec(['la '], 'loi'),
      traps: [
        { text: 'force', why: 'La force sert à Napoléon pour prendre le pouvoir.' },
        { text: 'royauté', why: 'La royauté est abolie.' },
      ],
      indice: 'C’est la règle commune à tous.',
      etapes: ['Pense au principe du Code civil.', 'Écris le mot qui manque.'],
    },
    {
      ...P.acquis,
      q: 'Écris le mot en a : ce que la Révolution a gagné et qui reste.',
      accepted: avec(['les ', 'des ', 'un ', 'l’'], 'acquis'),
      traps: [
        { text: 'alliances', why: 'Une alliance est un accord entre deux groupes.' },
        { text: 'abolitions', why: 'Une abolition supprime quelque chose.' },
      ],
      indice: 'On le dit de ce qu’on a obtenu.',
      etapes: ['Pense au titre de la leçon : des héritages.', 'Écris le mot qui commence par a.'],
    },
    {
      ...P.acquis,
      q: 'Écris le mot en c qui est le contraire de « rupture ».',
      accepted: avec(['la ', 'une '], 'continuité', 'continuite'),
      traps: [
        { text: 'cassure', why: 'Une cassure veut dire presque la même chose que rupture.' },
        { text: 'conquête', why: 'Une conquête est la prise d’un territoire.' },
      ],
      indice: 'Pense au verbe « continuer ».',
      etapes: ['Pense à ce qui ne s’arrête pas.', 'Écris le nom qui va avec ce verbe.'],
    },
    {
      ...P.cocarde,
      q: 'Écris le nom du symbole tricolore de la Révolution, en c.',
      accepted: avec(['la ', 'une '], 'cocarde', 'cocarde tricolore'),
      traps: [
        { text: 'couronne', why: 'La couronne est le signe du roi.' },
        { text: 'croix', why: 'La croix est un signe religieux.' },
      ],
      indice: 'Ce mot commence par « co ».',
      etapes: ['Pense aux symboles à trois couleurs.', 'Écris son nom.'],
    },
  ],
  docs: [
    {
      title: 'Un droit commun',
      lines: [
        'En 1804, un grand recueil de règles paraît.',
        'Il unifie le droit dans le pays.',
        'Il suit l’égalité des citoyens devant la loi.',
      ],
      qs: [
        {
          ...P.code,
          q: 'Écris le nom de ce recueil.',
          accepted: [
            ...avec(['le '], 'Code civil'),
            'Code Napoléon',
            'le Code Napoléon',
            'Code Napoleon',
            'le Code Napoleon',
          ],
          traps: [
            { text: 'édit de Nantes', why: 'Ce texte date de 1598.' },
            { text: 'Déclaration des droits de l’homme et du citoyen', why: 'Ce texte date de 1789.' },
          ],
          indice: 'Son nom commence par « Code ».',
          etapes: ['Relis la ligne 1 : repère l’année.', 'Pense au texte paru cette année-là.'],
        },
        {
          ...P.code,
          q: 'Écris le nom du dirigeant qui fait paraître ce recueil.',
          accepted: NAPOLEON,
          traps: [
            { text: 'Louis XVI', why: 'Ce roi est mort en 1793.' },
            { text: 'Louis XIV', why: 'Ce roi vit bien avant 1804.' },
          ],
          indice: 'Il devient empereur la même année.',
          etapes: ['Relis la ligne 1 : repère l’année.', 'Cherche qui dirige alors la France.'],
        },
      ],
    },
    {
      title: 'Dans les départements',
      lines: [
        'Napoléon réorganise l’État.',
        'Il utilise les départements, venus de la Révolution.',
        'Dans ce cadre, il place des représentants de l’État.',
      ],
      qs: [
        {
          ...P.prefets,
          q: 'Écris le nom de ces représentants.',
          accepted: PREFETS,
          traps: [
            { text: 'seigneurs', why: 'Les seigneurs appartiennent à l’ordre ancien.' },
            { text: 'chevaliers', why: 'Les chevaliers sont des combattants.' },
          ],
          indice: 'Ce mot commence par « pr ».',
          etapes: ['Relis la ligne 3.', 'Pense à ceux qui représentent l’État.'],
        },
        {
          ...P.acquis,
          q: 'Les départements restent. Écris le mot en a pour ce genre de gain.',
          accepted: avec(['les ', 'des ', 'un ', 'l’'], 'acquis'),
          traps: [
            { text: 'alliances', why: 'Une alliance est un accord.' },
            { text: 'abolitions', why: 'Une abolition supprime quelque chose.' },
          ],
          indice: 'On le dit de ce qu’on a obtenu et qu’on garde.',
          etapes: [
            'Relis la ligne 2 : d’où viennent les départements ?',
            'Écris le mot de la leçon qui commence par a.',
          ],
        },
      ],
    },
    {
      title: 'Avant et après',
      lines: [
        'Un général prend le pouvoir par la force en 1799.',
        'Il respecte de moins en moins les libertés.',
        'Pourtant, il garde l’égalité devant la loi.',
      ],
      qs: [
        {
          ...P.acquis,
          q: 'Écris le mot en c : le lien avec la Révolution, à la ligne 3.',
          accepted: avec(['la ', 'une '], 'continuité', 'continuite'),
          traps: [
            { text: 'cassure', why: 'La ligne 3 montre au contraire que quelque chose reste.' },
            { text: 'conquête', why: 'Une conquête est la prise d’un territoire.' },
          ],
          indice: 'C’est le contraire de « rupture ».',
          etapes: ['Relis la ligne 3 : repère ce qui reste.', 'Pense au verbe « continuer ».'],
        },
        {
          ...P.brumaire,
          q: 'Écris le nom de l’homme dont parle ce texte.',
          accepted: NAPOLEON,
          traps: [
            { text: 'Louis XVI', why: 'Ce roi est mort en 1793.' },
            { text: 'Henri IV', why: 'Ce roi est mort en 1610.' },
          ],
          indice: 'Pense au général de 1799.',
          etapes: ['Relis la ligne 1 : repère l’année.', 'Cherche qui prend le pouvoir à cette date.'],
        },
      ],
    },
  ],
};

export const NOTIONS: readonly NotionGuidee[] = [etapes, nation, napoleon, heritages];
export const SKILLS: readonly Skill[] = NOTIONS.map((n) => notionGuidee(n, SOURCE, CREDIT));
