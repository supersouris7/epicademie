import type { Skill } from '../types.ts';
import { notion, type Citation, type DocQuestion, type Fait, type Libre, type Notion } from './kit.ts';

/**
 * 5e, « Discours de haine » (lot em-5e-02) : partie « discriminations » du chapitre « Égalité, fraternité et
 * solidarité » du programme d'EMC du 13 juin 2024 (discours haineux en ligne, cadre législatif, adaptation du
 * droit). Chaque fait cite le programme (registre `emc-2024`) ou un texte du registre, avec sa citation exacte.
 * Réagir et signaler s'appuient aussi sur le programme de CM2 (rediffusion, témoin). Aucun propos haineux n'est
 * reproduit ; les textes à lire du niveau 5 sont écrits pour l'exercice (personnages inventés).
 */

const PROGRAMME =
  'Programme d’enseignement moral et civique (13 juin 2024), classe de 5e : « Égalité, fraternité et solidarité », discours de haine';
const CREDIT = 'Texte écrit pour l’exercice, d’après le programme de 5e.';

/** Citation d'un texte du registre des sources. */
const cite =
  (id: string, label: string) =>
  (quote: string): Citation => ({ quote, from: { id, label } });
const prog = (quote: string): Citation => ({ quote });

const cm2 = cite('emc-2024', 'le programme d’EMC de CM2');
const presse = cite('loi-presse-1881', 'la loi du 29 juillet 1881');
const penal = cite('code-penal-222-33-2-2', 'le Code pénal (article 222-33-2-2)');
const vpLoi2020 = cite('vie-publique-loi-haine-2020', 'le site Vie publique');
const tlfi = cite('cnrtl-xenophobie', 'le dictionnaire du CNRTL');
const dsa = cite('ue-dsa-2022-2065', 'le règlement européen sur les services numériques');
const vpDsa = cite('vie-publique-dsa', 'le site Vie publique');
const vpHarcelement = cite('vie-publique-harcelement-scolaire', 'le site Vie publique');
const senatHaine = cite('senat-rapport-haine-2019', 'un rapport du Sénat');
const senatHarcelement = cite('senat-rapport-harcelement', 'un rapport du Sénat');
const education = cite('education-politique-harcelement', 'le ministère de l’Éducation nationale');

type Wrong = readonly [label: string, why: string];
const wrongs = (list: readonly Wrong[]) => list.map(([label, why]) => ({ label, why }));

/** Fait cité : citation, question et réponse, trois erreurs, phrase à trou, explication. */
const fait = (
  citation: Citation,
  [q, a]: readonly [string, string],
  wrong: readonly [Wrong, Wrong, Wrong],
  gap: Fait['gap'],
  explain: string,
): Fait => ({ ...citation, q, a, wrong: wrongs(wrong), gap, explain });

/** Fait exigeant : non proposé au niveau 1. */
const expert = (f: Fait): Fait => ({ ...f, avance: true });

const libre = (
  citation: Citation,
  q: string,
  accepted: readonly string[],
  traps: readonly Wrong[],
  explain: string,
): Libre => ({ ...citation, q, accepted, traps: traps.map(([text, why]) => ({ text, why })), explain });

const lecture = (
  citation: Citation,
  q: string,
  a: string,
  wrong: readonly [Wrong, Wrong, Wrong],
  explain: string,
): DocQuestion => ({ ...citation, q, a, wrong: wrongs(wrong), explain });

// ——— Citations exactes ———

const ORAL_ECRIT = prog(
  'En abordant des discours haineux en ligne, qu’ils soient oraux ou écrits, faire émerger les mécanismes d’exclusion et de harcèlement qui s’appuient sur des stéréotypes et des préjugés posés sur une identité',
);
const REDUIRE = prog(
  'à la racine des agissements discriminatoires se trouvent des mécanismes d’exclusion (stéréotypes, préjugés, etc.) qui réduisent l’identité d’un individu à son appartenance à un groupe que l’on stigmatise',
);
const FORMES = prog('On retrouve ces stéréotypes dans le racisme, l’antisémitisme et la xénophobie, punis par la loi');
const AGISSEMENTS = prog(
  'des mécanismes d’exclusion, parmi d’autres, qui peuvent être à l’origine d’agissements à caractère discriminatoire (injures, harcèlements, violences, etc.) punis par la loi',
);
const DELIT_SCOLAIRE = prog('depuis 2022, le harcèlement scolaire est reconnu comme un délit');
const OBSERVATOIRE = prog(
  'création de l’Observatoire de la haine en ligne rattaché à l’ARCOM créé par l’article 16 de la loi contre les discours haineux en ligne du 24 juin 2020',
);

const ATTEINTE = cm2(
  'faire comprendre que la diffusion et la rediffusion de ces contenus constituent des manières de porter atteinte à la dignité et à la sécurité des personnes',
);
const TEMOIN = cm2(
  'Les élèves comprennent le rôle du témoin de situations de discriminations ou de harcèlement et l’importance de signaler celles-ci',
);
const ALERTER = cite(
  'emc-2024',
  'le programme d’EMC de CM1',
)('Reconnaitre des situations de danger, alerter et se mettre en sécurité');

const ELECTRONIQUE = presse('soit par tout moyen de communication au public par voie électronique');
const PROVOCATION = presse(
  'auront provoqué à la discrimination, à la haine ou à la violence à l’égard d’une personne ou d’un groupe de personnes à raison de leur origine ou de leur appartenance ou de leur non-appartenance à une ethnie, une nation, une race ou une religion déterminée, seront punis d’un an d’emprisonnement et de 45 000 euros d’amende ou de l’une de ces deux peines seulement',
);
const AUTRES_CRITERES = presse(
  'auront provoqué à la haine ou à la violence à l’égard d’une personne ou d’un groupe de personnes à raison de leur sexe, de leur orientation sexuelle ou identité de genre ou de leur handicap',
);
const INJURE = presse(
  'Toute expression outrageante, termes de mépris ou invective qui ne renferme l’imputation d’aucun fait est une injure.',
);
const INJURE_PEINE = presse(
  'Sera punie d’un an d’emprisonnement et de 45 000 euros d’amende l’injure commise par les mêmes moyens envers une personne ou un groupe de personnes à raison de leur origine',
);
const GROUPE = penal(
  'L’infraction est également constituée : a) Lorsque ces propos ou comportements sont imposés à une même victime par plusieurs personnes, de manière concertée ou à l’instigation de l’une d’elles, alors même que chacune de ces personnes n’a pas agi de façon répétée',
);
const EN_LIGNE_AGGRAVANT = penal(
  'sont punis de deux ans d’emprisonnement et de 30 000 € d’amende : […] Lorsqu’ils ont été commis par l’utilisation d’un service de communication au public en ligne ou par le biais d’un support numérique ou électronique',
);

const OBSERVE = vpLoi2020(
  'La loi crée un observatoire de la haine en ligne, chargé du suivi et de l’analyse de l’évolution des contenus haineux',
);

const HORS_LIGNE = vpDsa('ce qui est illégal hors ligne est illégal en ligne');
const OUTIL = vpDsa(
  'Les plateformes en ligne doivent proposer aux internautes un outil leur permettant de signaler facilement les contenus illicites.',
);
const RETRAIT = vpDsa(
  'Une fois le signalement effectué, elles doivent rapidement retirer ou bloquer l’accès au contenu illégal.',
);
const PRIORITE = vpDsa('Leurs notifications sont traitées en priorité.');
const ARCOM = vpDsa('En France, le coordinateur national est l’Arcom');

const FACILES = dsa(
  'Ces mécanismes sont faciles d’accès et d’utilisation et permettent la soumission de notifications exclusivement par voie électronique.',
);
const EXPLICATION = dsa(
  'une explication suffisamment étayée des raisons pour lesquelles le particulier ou l’entité allègue que les informations en question sont du contenu illicite',
);
const ADRESSE = dsa(
  'une indication claire de l’emplacement électronique exact de ces informations, comme l’URL ou les URL exact(s)',
);
const BONNE_FOI = dsa(
  'une déclaration confirmant que le particulier ou l’entité soumettant la notification pense, de bonne foi, que les informations et les allégations qu’elle contient sont exactes et complètes',
);
const ACCUSE = dsa('un accusé de réception de la notification à ce particulier ou cette entité');
const DECISION = dsa(
  'Le fournisseur notifie également, dans les meilleurs délais, à ce particulier ou cette entité sa décision concernant les informations auxquelles la notification se rapporte, tout en fournissant des informations sur les possibilités de recours',
);

const PHAROS = senatHaine(
  'la plateforme d’harmonisation, d’analyse, de recoupement et d’orientation des signalements (Pharos)',
);

const AGIR_TEMOINS = senatHarcelement(
  'Agir sur les témoins est important afin de désamorcer une situation de harcèlement',
);
const UNIQUE = education(
  'Le numéro d’alerte 3018, opéré par l’association e-Enfance, est le numéro national unique pour alerter en cas de situation de harcèlement et de cyberharcèlement.',
);
const NUMERO = vpHarcelement(
  'le numéro national d’assistance 3018 pour les jeunes victimes de cyberviolence et de cyberharcèlement et leurs parents',
);
const GRATUITE = vpHarcelement('Cette application gratuite et confidentielle');
const PREUVES = vpHarcelement(
  'le stockage sécurisé des preuves du harcèlement vécu (captures d’écran, photos, liens url, etc.)',
);
const ACCELERE = vpHarcelement(
  'Le 3018 dispose de procédures de signalement accélérées pour faire supprimer les comptes ou les contenus en quelques heures sur les réseaux.',
);

const XENOPHOBIE = tlfi('Hostilité manifestée à l’égard des étrangers, de ce qui est étranger.');
const SIGLE_DSA = vpDsa('La législation sur les services numériques (DSA)');

// ——— Notion 1 : le discours de haine en ligne ———

const discoursHaine: Notion = {
  id: 'em5-discours-haine-en-ligne',
  title: 'Le discours de haine en ligne : le reconnaître, comprendre ses mécanismes',
  hint: 'Repense au mémo : sur quoi s’appuie la haine, qui elle vise et ce que sa diffusion provoque.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Un **discours de haine** peut être dit ou écrit. Il s’appuie sur des **stéréotypes** et des **préjugés** posés sur une identité.',
    'Il **réduit** une personne à son appartenance à un groupe que l’on **stigmatise** : c’est le cas du **racisme**, de l’**antisémitisme** et de la **xénophobie**.',
    'Il peut mener à des injures, à du harcèlement ou à des violences, punis par la loi. Depuis 2022, le harcèlement scolaire est un délit.',
    'Diffuser ou **rediffuser** un tel contenu porte atteinte à la **dignité** et à la sécurité des personnes. Exemple : relayer une moquerie sur l’origine de quelqu’un.',
  ],
  faits: [
    fait(
      ORAL_ECRIT,
      ['Sous quelles formes un discours haineux en ligne peut-il se présenter ?', 'à l’oral comme à l’écrit'],
      [
        ['seulement à l’écrit', 'Une vidéo ou un message vocal peut aussi porter un discours haineux.'],
        ['seulement dans une vidéo', 'Un message écrit peut aussi être haineux.'],
        ['uniquement dans les journaux imprimés', 'On parle ici de la haine en ligne.'],
      ],
      ['Un discours haineux en ligne peut être oral ou ', '.', ['écrit', 'ecrit']],
      'Texte, image commentée ou vidéo : la forme ne change pas le problème.',
    ),
    fait(
      ORAL_ECRIT,
      ['Sur quoi les mécanismes d’exclusion d’un discours haineux s’appuient-ils ?', 'des stéréotypes et des préjugés'],
      [
        ['des preuves vérifiées sur chaque personne', 'Un préjugé juge justement sans avoir vérifié.'],
        ['les résultats scolaires de chacun', 'La haine vise une identité, pas des résultats.'],
        ['les règles de politesse', 'Les règles de politesse servent à respecter autrui.'],
      ],
      [
        'La haine s’appuie sur des stéréotypes et des ',
        ' posés sur une identité.',
        ['préjugés', 'prejugés', 'prejuges', 'préjugé', 'clichés', 'cliches'],
      ],
      'Stéréotypes et préjugés collent une idée toute faite sur des personnes.',
    ),
    fait(
      REDUIRE,
      [
        'Que fait un mécanisme d’exclusion à l’identité d’une personne ?',
        'il la réduit à son appartenance à un groupe stigmatisé',
      ],
      [
        ['il reconnaît toutes ses qualités', 'Au contraire, il efface la personne derrière un groupe.'],
        ['il protège sa dignité', 'Stigmatiser porte atteinte à la dignité.'],
        ['il lui donne de nouveaux droits', 'L’exclusion prive de respect, elle n’ajoute aucun droit.'],
      ],
      [
        'La personne est réduite à son appartenance à un groupe que l’on ',
        '.',
        ['stigmatise', 'stigmatisé', 'rejette', 'discrimine'],
      ],
      'La personne n’est plus vue comme un individu, mais comme un membre d’un groupe rejeté.',
    ),
    fait(
      FORMES,
      [
        'Dans quelles haines, punies par la loi, retrouve-t-on ces stéréotypes ?',
        'le racisme, l’antisémitisme et la xénophobie',
      ],
      [
        ['la politesse, la civilité et l’entraide', 'Ces attitudes respectent les personnes.'],
        ['le vote, le débat et l’engagement', 'Ce sont des formes de participation citoyenne.'],
        ['la curiosité, la critique d’un film et le désaccord', 'Critiquer une œuvre ou débattre n’est pas haïr.'],
      ],
      [
        'On retrouve ces stéréotypes dans le racisme, l’antisémitisme et la ',
        ', punis par la loi.',
        ['xénophobie', 'xenophobie'],
      ],
      'Ces trois formes de haine sont punies par la loi.',
    ),
    fait(
      AGISSEMENTS,
      [
        'À quels agissements discriminatoires les mécanismes d’exclusion peuvent-ils conduire ?',
        'des injures, des harcèlements, des violences',
      ],
      [
        ['des votes et des débats', 'Ce sont des pratiques démocratiques, pas des agissements discriminatoires.'],
        ['des collectes et des dons', 'Ces gestes sont solidaires.'],
        ['des révisions et des exposés', 'Aucun rapport avec l’exclusion.'],
      ],
      [
        'Les mécanismes d’exclusion peuvent être à l’origine d’',
        ', de harcèlements ou de violences.',
        ['injures', 'injure', 'insultes', 'insulte'],
      ],
      'Les mots peuvent mener aux actes : injures, harcèlements, violences sont punis par la loi.',
    ),
    expert(
      fait(
        ATTEINTE,
        [
          'La diffusion et la rediffusion de contenus irrespectueux portent atteinte à quoi ?',
          'à la dignité et à la sécurité des personnes',
        ],
        [
          ['seulement à la qualité du réseau', 'Le problème touche des personnes, pas la connexion.'],
          ['à rien, si l’on n’est pas l’auteur', 'Rediffuser est déjà une manière de porter atteinte.'],
          ['uniquement au droit de vote', 'Ce sont la dignité et la sécurité qui sont citées.'],
        ],
        [
          'Rediffuser un contenu haineux porte atteinte à la ',
          ' et à la sécurité des personnes.',
          ['dignité', 'dignite'],
        ],
        'Même sans avoir créé le contenu, le relayer fait du tort.',
      ),
    ),
    expert(
      fait(
        DELIT_SCOLAIRE,
        ['Depuis 2022, comment la loi considère-t-elle le harcèlement scolaire ?', 'comme un délit'],
        [
          ['comme une simple dispute', 'Depuis 2022, c’est une infraction.'],
          ['comme un jeu entre élèves', 'Le harcèlement n’est pas un jeu.'],
          ['comme une opinion libre', 'Harceler n’est pas exprimer une opinion.'],
        ],
        ['Depuis 2022, le harcèlement scolaire est reconnu comme un ', '.', ['délit', 'delit']],
        'Le harcèlement, y compris en ligne, peut naître de la discrimination ; à l’école, c’est un délit.',
      ),
    ),
  ],
  paires3: [
    ['Racisme, antisémitisme, xénophobie', 'Formes de haine punies par la loi'],
    ['Stéréotype et préjugé', 'Idées toutes faites sur lesquelles la haine s’appuie'],
    ['Rediffusion', 'Relayer un contenu déjà publié'],
  ],
  paires5: [
    ['Préjugé', 'Jugement porté sans avoir vérifié'],
    ['Stéréotype', 'Image toute faite collée à un groupe'],
    ['Stigmatiser', 'Désigner un groupe pour le rejeter'],
    ['Xénophobie', 'Rejet des personnes étrangères'],
    ['Rediffuser', 'Relayer et porter atteinte à la dignité'],
  ],
  libres: [
    libre(
      REDUIRE,
      'quel verbe manque : « les personnes sont réduites à leur appartenance à un groupe que l’on … » ? (il commence par « stig »)',
      ['stigmatise', 'stigmatiser'],
      [
        ['signale', 'Signaler, c’est informer d’un problème.'],
        ['respecte', 'Respecter est le contraire de rejeter.'],
      ],
      'Stigmatiser, c’est désigner un groupe pour le rejeter.',
    ),
    libre(
      XENOPHOBIE,
      'comment appelle-t-on l’hostilité envers les étrangers ?',
      ['xénophobie', 'la xénophobie', 'xenophobie', 'la xenophobie'],
      [
        ['antisémitisme', 'L’antisémitisme vise les Juifs.'],
        ['harcèlement', 'Le harcèlement désigne des agissements répétés.'],
      ],
      'La xénophobie vise des personnes parce qu’elles sont étrangères.',
    ),
    libre(
      DELIT_SCOLAIRE,
      'depuis 2022, comment la loi qualifie-t-elle le harcèlement scolaire ? C’est un …',
      ['délit', 'un délit', 'delit', 'un delit'],
      [
        ['jeu', 'Le harcèlement n’est pas un jeu.'],
        ['débat', 'Un débat respecte les personnes.'],
      ],
      'Un délit est une infraction à la loi : harceler à l’école peut être puni par la justice.',
    ),
  ],
  docs: [
    {
      title: 'Un message dans un groupe',
      lines: [
        'Dans un groupe de messagerie, un élève écrit que « les gens de tel pays sont tous des voleurs ».',
        'Il ne parle d’aucun fait précis ni d’aucune personne qu’il connaît.',
        'Deux camarades ajoutent un emoji qui rit.',
        'Un troisième transfère le message à un autre groupe.',
      ],
      qs: [
        lecture(
          REDUIRE,
          'Que fait la première phrase aux personnes visées ?',
          'elle les réduit à leur appartenance à un groupe',
          [
            ['elle décrit un fait vérifié sur une personne', 'Aucun fait précis n’est cité.'],
            ['elle défend leur dignité', 'Elle les accuse en bloc.'],
            ['elle donne un avis sur un film', 'La phrase vise des personnes, pas une œuvre.'],
          ],
          '« Tous » colle la même image à des personnes à cause de leur pays : c’est un stéréotype.',
        ),
        lecture(
          ATTEINTE,
          'Que fait l’élève qui transfère le message ?',
          'il porte lui aussi atteinte à la dignité des personnes visées',
          [
            ['rien, puisqu’il n’a pas écrit le message', 'La rediffusion est aussi une atteinte.'],
            ['il supprime le message', 'Au contraire, il le fait circuler.'],
            ['il signale le message', 'Un signalement s’adresse à la plateforme ou à un service compétent.'],
          ],
          'Rediffuser agrandit le public du message et l’atteinte faite aux personnes.',
        ),
      ],
    },
    {
      title: 'Débat ou haine ?',
      lines: [
        'Sous une vidéo de match, Nora écrit : « Je trouve que l’arbitre s’est trompé sur ce but. »',
        'Un autre compte répond qu’une joueuse « ne devrait pas jouer à cause de sa religion ».',
        'La joueuse n’a rien dit de sa religion dans la vidéo.',
      ],
      qs: [
        lecture(
          REDUIRE,
          'Quel message relève d’un mécanisme d’exclusion ?',
          'la réponse qui veut écarter la joueuse à cause de sa religion',
          [
            ['la critique de Nora sur l’arbitrage', 'Nora critique une décision, sans viser une identité.'],
            ['les deux messages au même degré', 'Seul le second vise une identité.'],
            ['aucun des deux', 'Le second écarte une personne à cause de son groupe.'],
          ],
          'La différence : le désaccord porte sur un acte, l’exclusion vise ce que la personne est.',
        ),
        lecture(
          ORAL_ECRIT,
          'Si le compte avait dit la même phrase dans une vidéo, qu’est-ce que cela changerait à sa nature ?',
          'rien : un discours haineux peut être oral ou écrit',
          [
            ['ce n’est plus haineux, car c’est oral', 'La forme orale est aussi concernée.'],
            ['cela devient une simple opinion sportive', 'La phrase vise toujours une religion.'],
            ['seul un écrit peut poser problème', 'Les discours oraux comptent aussi.'],
          ],
          'La haine en ligne peut passer par la parole comme par l’écrit.',
        ),
      ],
    },
  ],
};

// ——— Notion 2 : ce que dit la loi ———

const loi: Notion = {
  id: 'em5-haine-loi',
  title: 'Discours de haine : ce que dit la loi',
  hint: 'Repense au mémo : injure, provocation à la haine, harcèlement, et les textes qui adaptent le droit à Internet.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'La loi de 1881 punit la **provocation à la haine** et l’**injure** visant une origine, une religion, un sexe ou un handicap, aussi sur Internet.',
    'L’injure méprise sans imputer (attribuer) de fait précis.',
    'Un harcèlement en ligne est puni plus sévèrement. Un groupe qui se concerte peut harceler, même si chacun n’agit qu’une fois.',
    'Depuis 2022, le harcèlement scolaire est un délit.',
    'Le droit s’adapte : **Observatoire de la haine en ligne** (loi de 2020) et règlement européen **DSA**. Idée clé : l’illégal hors ligne l’est aussi en ligne.',
  ],
  faits: [
    fait(
      HORS_LIGNE,
      [
        'Quel principe le règlement européen sur les services numériques veut-il mettre en pratique ?',
        'ce qui est illégal hors ligne est illégal en ligne',
      ],
      [
        ['tout est permis sur Internet', 'Internet n’est pas une zone sans droit.'],
        ['la loi ne vaut que dans la rue', 'Le principe étend justement la règle au monde en ligne.'],
        ['chaque plateforme invente sa propre loi', 'La loi s’impose aux plateformes.'],
      ],
      ['Ce qui est illégal hors ligne est illégal en ', '.', ['ligne']],
      'Passer par un écran ne rend pas légal ce qui est interdit ailleurs.',
    ),
    fait(
      INJURE,
      [
        'Comment la loi de 1881 nomme-t-elle une expression outrageante ou méprisante qui n’impute (n’attribue) aucun fait ?',
        'une injure',
      ],
      [
        ['une opinion protégée sans limite', 'La loi la définit comme une injure.'],
        ['une information', 'Une information porte sur des faits.'],
        ['un signalement', 'Un signalement informe d’un problème.'],
      ],
      ['Une expression outrageante qui ne renferme l’imputation d’aucun fait est une ', '.', ['injure']],
      'L’injure méprise sans rien affirmer de précis ; la diffamation, elle, impute un fait.',
    ),
    fait(
      PROVOCATION,
      [
        'Selon la loi de 1881, quel appel visant des personnes à cause de leur religion ou de leur origine est puni ?',
        'la provocation à la discrimination, à la haine ou à la violence',
      ],
      [
        ['la critique d’un film', 'Critiquer une œuvre ne vise pas des personnes pour leur religion ou leur origine.'],
        ['un désaccord sur un résultat sportif', 'Un désaccord n’est pas un appel à la haine.'],
        ['la publication d’un emploi du temps', 'Aucun appel à la haine n’est en jeu.'],
      ],
      ['La loi punit la provocation à la discrimination, à la ', ' ou à la violence.', ['haine']],
      'Pousser les autres à haïr, discriminer ou frapper à cause d’une origine ou d’une religion est puni.',
    ),
    expert(
      fait(
        PROVOCATION,
        [
          'Quelle peine la loi prévoit-elle pour la provocation à la haine liée à l’origine ou à la religion ?',
          'un an d’emprisonnement et 45 000 euros d’amende, ou l’une de ces deux peines',
        ],
        [
          ['un simple rappel du règlement', 'C’est un délit puni par la loi.'],
          ['aucune peine si le message est en ligne', 'La voie électronique est concernée.'],
          ['un an d’emprisonnement et 45 euros d’amende', 'L’amende prévue est de 45 000 euros.'],
        ],
        [
          'La provocation à la haine liée à l’origine est punie d’un an d’emprisonnement et de 45 000 euros d’',
          '.',
          ['amende'],
        ],
        'La loi prévoit prison et amende : ce ne sont pas de simples paroles sans conséquence.',
      ),
    ),
    fait(
      AUTRES_CRITERES,
      [
        'Outre l’origine et la religion, quels critères la loi protège-t-elle contre la provocation à la haine ?',
        'le sexe, l’orientation sexuelle, l’identité de genre et le handicap',
      ],
      [
        ['les goûts musicaux et sportifs', 'Ces critères ne sont pas ceux que cite la loi.'],
        ['les notes et le niveau scolaire', 'La loi ne cite pas les résultats scolaires.'],
        ['la marque du téléphone', 'Aucun texte cité ne vise ce critère.'],
      ],
      [
        'La loi punit aussi la haine à raison du sexe, de l’orientation sexuelle, de l’identité de genre ou du ',
        '.',
        ['handicap'],
      ],
      'La protection ne se limite pas à l’origine et à la religion.',
    ),
    expert(
      fait(
        INJURE_PEINE,
        [
          'Comment est punie une injure publique visant une personne à raison de son origine ?',
          'un an d’emprisonnement et 45 000 euros d’amende',
        ],
        [
          ['elle n’est jamais punie', 'La loi prévoit une peine précise.'],
          ['par une exclusion automatique de tous les réseaux', 'Le texte prévoit prison et amende.'],
          ['par un simple avertissement du site', 'La loi, et pas seulement le site, la punit.'],
        ],
        ['L’injure visant une origine est punie d’un an d’emprisonnement et de 45 000 euros d’', '.', ['amende']],
        'Une injure qui vise l’origine est punie plus lourdement qu’une injure ordinaire.',
      ),
    ),
    fait(
      GROUPE,
      [
        'Plusieurs personnes se concertent et envoient chacune un seul message blessant à la même victime. Peut-il s’agir de harcèlement ?',
        'oui, même si chacune n’a pas agi de façon répétée',
      ],
      [
        ['non, il faut que chaque personne recommence', 'La loi prévoit justement le cas du groupe.'],
        ['non, le harcèlement vient toujours d’une seule personne', 'Plusieurs auteurs peuvent harceler.'],
        ['seulement si les messages sont envoyés par courrier', 'Le moyen n’a pas à être le courrier.'],
      ],
      [
        'Le harcèlement peut venir de plusieurs personnes, même si chacune n’a pas agi de façon ',
        '.',
        ['répétée', 'repetee', 'répété', 'répétitive'],
      ],
      'La répétition peut venir de l’addition des messages de tout un groupe.',
    ),
    expert(
      fait(
        EN_LIGNE_AGGRAVANT,
        [
          'Pour le harcèlement puni par le Code pénal, que change le fait qu’il passe par un service en ligne ?',
          'la peine est aggravée',
        ],
        [
          ['la peine disparaît', 'Le numérique n’efface pas l’infraction.'],
          ['rien n’est puni sans rencontre physique', 'La loi vise expressément les supports numériques.'],
          ['seule la plateforme peut être concernée', 'Le texte vise les auteurs des faits.'],
        ],
        [
          'Un harcèlement commis par un support numérique est puni plus ',
          '.',
          ['sévèrement', 'severement', 'lourdement', 'fortement', 'durement', 'gravement'],
        ],
        'L’utilisation d’un service en ligne ou d’un support numérique fait partie des circonstances aggravantes.',
      ),
    ),
    fait(
      OBSERVATOIRE,
      [
        'Quel organisme la loi du 24 juin 2020 contre les discours haineux en ligne a-t-elle créé ?',
        'l’Observatoire de la haine en ligne',
      ],
      [
        ['un conseil municipal de jeunes', 'Ce conseil agit pour une commune.'],
        ['la Sécurité sociale', 'Elle relève de la solidarité face aux risques.'],
        ['le Conseil constitutionnel', 'Il existait bien avant 2020.'],
      ],
      ['La loi du 24 juin 2020 a créé l’', ' de la haine en ligne.', ['Observatoire', 'observatoire']],
      'Cet observatoire est un exemple de la façon dont le droit s’adapte.',
    ),
    expert(
      fait(
        OBSERVE,
        [
          'Quelle est la mission de l’Observatoire de la haine en ligne ?',
          'suivre et analyser l’évolution des contenus haineux',
        ],
        [
          ['juger les auteurs de messages', 'Juger est le rôle des tribunaux.'],
          ['rédiger seul les lois', 'Les lois sont votées par le Parlement.'],
          ['vendre des abonnements', 'Ce n’est pas une mission publique de ce type.'],
        ],
        ['L’observatoire assure le suivi et l’', ' de l’évolution des contenus.', ['analyse', 'étude', 'etude']],
        'Il observe et analyse : il ne juge pas.',
      ),
    ),
  ],
  paires3: [
    ['Injure', 'Expression de mépris sans fait précis'],
    ['Provocation à la haine', 'Pousser à haïr un groupe'],
    ['Observatoire de la haine en ligne', 'Suit l’évolution des contenus haineux'],
  ],
  paires5: [
    ['Loi de 1881', 'Punit l’injure et la provocation à la haine'],
    ['Code pénal', 'Punit le harcèlement, plus sévèrement en ligne'],
    ['Loi de 2020', 'Crée l’Observatoire de la haine en ligne'],
    ['DSA', 'Règlement européen sur les services numériques'],
    ['Loi de 2022', 'Reconnaît le délit de harcèlement scolaire'],
  ],
  libres: [
    libre(
      INJURE,
      'comment la loi nomme-t-elle une invective (une parole violente) ou un terme de mépris qui n’impute (n’attribue) aucun fait ?',
      ['injure', 'une injure', 'l’injure', 'des injures'],
      [
        ['diffamation', 'La diffamation impute un fait qui porte atteinte à l’honneur.'],
        ['signalement', 'Un signalement sert à informer d’un contenu.'],
      ],
      'L’injure méprise sans rien reprocher de précis ; accuser d’un fait serait une diffamation.',
    ),
    libre(
      OBSERVATOIRE,
      'en quelle année a été votée la loi contre les discours haineux en ligne qui crée l’Observatoire ? (en chiffres)',
      ['2020', 'en 2020'],
      [
        ['1881', '1881 est l’année de la loi sur la liberté de la presse.'],
        ['2022', '2022 est l’année à partir de laquelle le harcèlement scolaire est un délit.'],
      ],
      'La loi du 24 juin 2020 montre que le droit s’adapte à la haine en ligne.',
    ),
    libre(
      SIGLE_DSA,
      'quel sigle de trois lettres désigne le règlement européen sur les services numériques ?',
      ['DSA', 'le DSA'],
      [
        ['ODD', 'ODD signifie objectif de développement durable.'],
        ['DDHC', 'La DDHC est la Déclaration des droits de l’homme et du citoyen.'],
      ],
      'DSA reprend les initiales de son nom anglais, Digital Services Act.',
    ),
  ],
  docs: [
    {
      title: 'La conversation de classe',
      lines: [
        'Dans une conversation de classe, cinq élèves se mettent d’accord pour viser Sami.',
        'Chacun envoie un seul message moqueur, le même soir.',
        'Les jours suivants, Sami dort mal et ne veut plus venir au collège.',
        'L’un des cinq affirme : « Je n’ai écrit qu’une fois, je ne risque rien. »',
      ],
      qs: [
        lecture(
          GROUPE,
          'Que penser de la phrase « Je n’ai écrit qu’une fois, je ne risque rien » ?',
          'elle est fausse : un harcèlement en groupe concerté est prévu par la loi',
          [
            ['elle est juste : un seul message ne compte jamais', 'La loi vise le cas de plusieurs auteurs concertés.'],
            ['elle est juste car les faits ont lieu le soir', 'L’heure ne change rien.'],
            ['elle est fausse seulement si Sami est adulte', 'Le texte ne réserve pas la règle aux adultes.'],
          ],
          'Les messages concertés s’additionnent : chacun participe au harcèlement.',
        ),
        lecture(
          EN_LIGNE_AGGRAVANT,
          'Quel élément du texte peut aggraver la peine prévue par le Code pénal ?',
          'les messages passent par un support numérique',
          [
            ['la conversation porte le nom de la classe', 'Le nom du groupe est sans effet.'],
            ['les messages sont courts', 'La longueur n’est pas une circonstance citée.'],
            ['les faits ont commencé un soir', 'Le moment de la journée n’est pas cité.'],
          ],
          'L’usage d’un service en ligne ou d’un support numérique aggrave la peine.',
        ),
      ],
    },
    {
      title: 'Un appel à rejeter des voisins',
      lines: [
        'Une page publique appelle ses abonnés à rejeter et à menacer les fidèles d’une religion.',
        'L’auteur pense que la loi de 1881 ne concerne que les journaux sur papier.',
      ],
      qs: [
        lecture(
          ELECTRONIQUE,
          'Pourquoi l’auteur se trompe-t-il ?',
          'la loi vise aussi la communication au public par voie électronique',
          [
            ['la loi de 1881 ne parle que des affiches', 'Elle cite plusieurs moyens, dont la voie électronique.'],
            ['une page publique est une conversation privée', 'Elle s’adresse au public.'],
            ['la religion n’est pas un critère protégé', 'La religion est citée par la loi.'],
          ],
          'La loi, ancienne, a été modifiée pour s’appliquer aussi à Internet.',
        ),
        lecture(
          PROVOCATION,
          'À quelle infraction prévue par la loi les faits décrits correspondent-ils ?',
          'à la provocation à la haine ou à la violence en raison de la religion',
          [
            ['à une simple critique d’un film', 'Aucune œuvre n’est critiquée.'],
            ['à un oubli de signaler un contenu', 'La page publie elle-même l’appel.'],
            ['à aucune, car la cible est un groupe', 'La loi protège aussi les groupes de personnes.'],
          ],
          'Appeler à rejeter et menacer un groupe religieux correspond à la provocation punie par la loi.',
        ),
      ],
    },
  ],
};

// ——— Notion 3 : réagir ———

const reagir: Notion = {
  id: 'em5-haine-reagir',
  title: 'Face à la haine en ligne : réagir sans rester seul',
  hint: 'Repense au mémo : ce qu’il ne faut pas relayer, le rôle du témoin, les preuves et le numéro d’aide.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Face à un contenu haineux, ne le **rediffuse** pas : le relayer porte aussi atteinte aux personnes.',
    'Un **témoin** peut aider : alerter, **signaler**, soutenir la victime. Garde des preuves, par exemple une capture d’écran et l’adresse de la page. Agir sur les témoins aide à **désamorcer** un harcèlement, c’est-à-dire à faire retomber la tension.',
    'Le **3018** est le numéro national unique pour alerter en cas de harcèlement et de cyberharcèlement ; il aide les jeunes victimes de **cyberviolence** et leurs parents. Parle aussi à un adulte de confiance.',
  ],
  faits: [
    fait(
      ATTEINTE,
      [
        'Tu reçois un message haineux visant un camarade. Quel geste évite d’aggraver l’atteinte qu’il subit ?',
        'ne pas le rediffuser',
      ],
      [
        ['le transférer à tous tes contacts', 'La rediffusion porte atteinte à la dignité et à la sécurité.'],
        ['le republier avec un commentaire moqueur', 'Le republier le fait encore circuler.'],
        ['l’envoyer à un autre groupe pour rire', 'Chaque partage élargit l’atteinte.'],
      ],
      ['La diffusion et la ', ' d’un contenu irrespectueux portent atteinte aux personnes.', ['rediffusion']],
      'Relayer, même pour s’indigner ou rire, agrandit le public du message.',
    ),
    fait(
      TEMOIN,
      ['Quelle attitude du témoin d’une discrimination est présentée comme importante ?', 'signaler la situation'],
      [
        ['faire comme s’il n’avait rien vu', 'Le témoin a un rôle : se taire laisse la situation durer.'],
        ['encourager l’auteur', 'Encourager aggrave les faits.'],
        ['filmer pour amuser les autres', 'Diffuser fait du tort à la victime.'],
      ],
      [
        'Le témoin comprend l’importance de ',
        ' une situation de discrimination.',
        ['signaler', 'dénoncer', 'denoncer'],
      ],
      'Signaler permet à des personnes compétentes d’intervenir.',
    ),
    fait(
      AGIR_TEMOINS,
      ['Pourquoi est-il important d’agir sur les témoins d’un harcèlement ?', 'pour désamorcer la situation'],
      [
        ['pour punir la victime', 'La victime doit être protégée.'],
        ['pour que plus de personnes regardent', 'Il s’agit de faire cesser, pas d’agrandir le public.'],
        ['pour garder les faits secrets', 'Le secret laisse le harcèlement continuer.'],
      ],
      [
        'Agir sur les témoins aide à ',
        ' une situation de harcèlement.',
        [
          'désamorcer',
          'desamorcer',
          'arrêter',
          'arreter',
          'stopper',
          'faire cesser',
          'calmer',
          'apaiser',
          'résoudre',
          'resoudre',
        ],
      ],
      'Quand les témoins cessent d’approuver ou de se taire, le harcèlement perd son public.',
    ),
    fait(
      NUMERO,
      ['Quel numéro national aide les jeunes victimes de cyberharcèlement et leurs parents ?', 'le 3018'],
      [
        ['le 15', 'Ce n’est pas le numéro consacré aux violences numériques.'],
        ['le 18', 'Ce numéro n’est pas consacré au cyberharcèlement.'],
        ['le 17', 'Le numéro d’aide cité ici comporte quatre chiffres.'],
      ],
      ['Contre le cyberharcèlement, on peut appeler le ', '.', ['3018', '30 18']],
      'Le 3018 s’adresse aux jeunes victimes et à leurs parents.',
    ),
    expert(
      fait(
        UNIQUE,
        [
          'Pour quelles situations le 3018, numéro national unique, permet-il d’alerter ?',
          'le harcèlement et le cyberharcèlement',
        ],
        [
          ['seulement les violences en ligne', 'Le 3018 concerne aussi le harcèlement hors ligne.'],
          ['les incendies', 'Le 3018 est consacré au harcèlement, pas au feu.'],
          ['les pannes de connexion', 'Une panne n’est pas une situation de harcèlement.'],
        ],
        [
          'Le 3018 permet d’alerter en cas de harcèlement et de ',
          '.',
          ['cyberharcèlement', 'cyberharcelement', 'cyber-harcèlement', 'cyber-harcelement'],
        ],
        'Un seul numéro à retenir, que le harcèlement ait lieu en ligne ou non.',
      ),
    ),
    fait(
      PREUVES,
      [
        'Parmi ces éléments, lesquels sont des preuves d’un harcèlement en ligne à conserver ?',
        'des captures d’écran et des adresses de pages',
      ],
      [
        ['une réponse insultante envoyée à l’auteur', 'Répondre par des insultes n’est pas une preuve utile.'],
        ['la suppression de tous les messages', 'Supprimer fait disparaître les traces.'],
        ['des rumeurs entendues sans les noter', 'Une rumeur ne montre pas ce qui a été publié.'],
      ],
      ['Parmi les preuves à conserver, il y a les ', ' d’écran.', ['captures', 'capture']],
      'Une capture d’écran garde la trace d’un contenu avant sa disparition.',
    ),
    expert(
      fait(
        ACCELERE,
        [
          'Que permettent les procédures de signalement accélérées du 3018 ?',
          'faire supprimer des comptes ou des contenus en quelques heures',
        ],
        [
          ['juger l’auteur en quelques heures', 'Juger est le rôle d’un tribunal.'],
          ['retrouver un mot de passe', 'Le texte parle de suppression de comptes ou de contenus.'],
          ['interdire Internet à toute une classe', 'Aucune mesure de ce genre n’est prévue.'],
        ],
        ['Le 3018 peut faire supprimer des comptes ou des contenus en quelques ', '.', ['heures', 'heure']],
        'La rapidité compte : plus vite le contenu est retiré, moins il circule.',
      ),
    ),
    expert(
      fait(
        GRATUITE,
        ['Comment est présentée l’application mobile 3018 ?', 'gratuite et confidentielle'],
        [
          ['payante et publique', 'Elle est gratuite et confidentielle.'],
          ['réservée aux adultes', 'Le 3018 vise les jeunes victimes et leurs parents.'],
          ['un réseau social ouvert à tous', 'C’est un outil d’aide, pas un réseau social.'],
        ],
        ['L’application 3018 est gratuite et ', '.', ['confidentielle']],
        'On peut demander de l’aide sans payer et en confiance.',
      ),
    ),
  ],
  paires3: [
    ['Témoin', 'Voit les faits et peut alerter'],
    ['Capture d’écran', 'Garde une preuve'],
    ['3018', 'Aide face au harcèlement et aux violences numériques'],
  ],
  paires5: [
    ['3018', 'Numéro contre le harcèlement et les violences numériques'],
    ['Désamorcer', 'Faire retomber la tension'],
    ['Capture d’écran', 'Trace d’un contenu publié'],
    ['Rediffusion', 'Geste qui aggrave l’atteinte'],
    ['Témoin', 'Personne qui voit et peut signaler'],
  ],
  libres: [
    libre(
      UNIQUE,
      'quel numéro à quatre chiffres permet d’alerter en cas de harcèlement et de cyberharcèlement ?',
      ['3018', 'le 3018', '30 18'],
      [
        ['119', 'Le numéro cherché a quatre chiffres : ce n’est pas le 119.'],
        ['2018', '2018 ressemble au bon numéro, mais il commence par un autre chiffre.'],
      ],
      'C’est le 3018 : un seul numéro national, que le harcèlement ait lieu en ligne ou non.',
    ),
    libre(
      TEMOIN,
      'comment appelle-t-on une personne qui voit une situation de harcèlement sans en être l’auteur ni la victime ?',
      ['témoin', 'un témoin', 'le témoin', 'temoin', 'un temoin', 'le temoin'],
      [
        ['victime', 'La victime est la personne visée.'],
        ['auteur', 'L’auteur commet les faits.'],
      ],
      'C’est un témoin : il a un rôle à jouer.',
    ),
    libre(
      ALERTER,
      'quel verbe signifie prévenir d’un danger quelqu’un qui peut aider ? (à l’infinitif, il commence par « al »)',
      ['alerter'],
      [
        ['allumer', 'Allumer ne prévient personne.'],
        ['aller', 'Aller ne signifie pas prévenir d’un danger.'],
      ],
      'Alerter : reconnaître le danger, prévenir, se mettre en sécurité.',
    ),
  ],
  docs: [
    {
      title: 'Ce qu’a fait Lina',
      lines: [
        'Lina découvre une page qui se moque d’un élève à cause de son handicap.',
        'Elle fait une capture d’écran et note l’adresse de la page.',
        'Elle ne partage pas la page.',
        'Elle envoie un message de soutien à l’élève, puis en parle à la conseillère principale d’éducation.',
      ],
      qs: [
        lecture(
          ATTEINTE,
          'Pourquoi Lina a-t-elle raison de ne pas partager la page ?',
          'la rediffuser porterait aussi atteinte à la dignité de l’élève',
          [
            ['partager supprimerait automatiquement la page', 'Partager fait circuler, cela ne supprime pas.'],
            ['un partage est impossible sur Internet', 'Il est possible, mais nuisible ici.'],
            ['la page ne vise personne', 'Elle vise un élève.'],
          ],
          'Ne pas relayer limite le nombre de personnes qui voient l’attaque.',
        ),
        lecture(
          PREUVES,
          'À quoi servent la capture d’écran et l’adresse notée ?',
          'à conserver la preuve de ce qui a été publié',
          [
            ['à faire connaître la page à toute la classe', 'Lina les garde, elle ne les diffuse pas.'],
            ['à répondre à la moquerie par une autre', 'Ce n’est pas ce que fait Lina.'],
            ['à punir elle-même l’auteur', 'Elle s’adresse à un adulte.'],
          ],
          'La preuve reste disponible même si la page disparaît.',
        ),
      ],
    },
    {
      title: 'Le silence du groupe',
      lines: [
        'Dans un jeu en ligne, un joueur est insulté à cause de son origine.',
        'Les autres joueurs lisent et ne disent rien.',
        'Yanis hésite : « Ce n’est pas moi qui écris ces messages. »',
        'Son grand frère lui explique qu’un témoin peut aider, en signalant et en soutenant le joueur.',
      ],
      qs: [
        lecture(
          TEMOIN,
          'Quel rôle Yanis peut-il jouer ?',
          'un témoin qui signale la situation',
          [
            ['un auteur obligé de continuer', 'Il n’écrit aucun message et rien ne l’y oblige.'],
            ['un spectateur qui n’a rien à faire', 'Le témoin a un rôle important.'],
            ['un juge qui fixe la peine', 'Juger revient à la justice.'],
          ],
          'Le témoin n’est ni auteur ni juge, mais il peut alerter et signaler.',
        ),
        lecture(
          AGIR_TEMOINS,
          'Pourquoi la réaction des autres joueurs compte-t-elle ?',
          'agir du côté des témoins aide à désamorcer le harcèlement',
          [
            ['leur silence protège toujours la victime', 'Le silence laisse les faits continuer.'],
            ['seul l’auteur peut changer quelque chose', 'Les témoins comptent aussi.'],
            ['réagir oblige à insulter l’auteur', 'On peut signaler et soutenir sans insulter.'],
          ],
          'Des témoins qui signalent et soutiennent isolent l’auteur au lieu d’isoler la victime.',
        ),
      ],
    },
  ],
};

// ——— Notion 4 : signaler ———

const signaler: Notion = {
  id: 'em5-haine-signaler',
  title: 'Signaler un contenu haineux : à qui, comment, avec quelles suites',
  sources: ['ue-dsa-2022-2065'],
  hint: 'Repense au mémo : l’outil de la plateforme, ce qu’il faut indiquer, les suites et les services d’aide.',
  programme: PROGRAMME,
  credit: CREDIT,
  memo: [
    'Chaque **plateforme** doit offrir un outil simple pour **signaler** un **contenu illicite**, puis agir rapidement quand il est illégal.',
    'Un signalement (ou notification) dit pourquoi, donne l’adresse exacte (URL) et se fait de **bonne foi**.',
    'L’**hébergeur**, qui garde les contenus en ligne, envoie un accusé de réception, puis sa décision et les **recours** (moyens de la contester).',
    'Hors de la plateforme : **Pharos** reçoit des signalements ; les signalements des **signaleurs de confiance** passent en priorité ; l’**Arcom** veille au **DSA** en France.',
  ],
  faits: [
    fait(
      OUTIL,
      [
        'Que doivent proposer les plateformes en ligne aux internautes face aux contenus illicites ?',
        'un outil pour les signaler facilement',
      ],
      [
        ['un abonnement payant pour se plaindre', 'L’outil doit permettre de signaler facilement.'],
        ['rien : elles ne sont pas concernées', 'Le règlement européen leur impose des obligations.'],
        ['un moyen de les partager plus vite', 'Il s’agit de signaler, pas de diffuser.'],
      ],
      [
        'Les plateformes doivent proposer un outil pour ',
        ' facilement les contenus illicites.',
        ['signaler', 'notifier'],
      ],
      'Le bouton ou formulaire de signalement est une obligation des plateformes.',
    ),
    fait(
      RETRAIT,
      [
        'Après un signalement, que doit faire la plateforme d’un contenu illégal ?',
        'le retirer ou en bloquer rapidement l’accès',
      ],
      [
        ['le mettre en avant', 'Un contenu illégal doit être retiré ou bloqué.'],
        ['attendre indéfiniment', 'Le retrait doit être rapide.'],
        ['l’envoyer à tous les abonnés', 'Cela élargirait l’atteinte.'],
      ],
      [
        'Elle doit rapidement retirer ou ',
        ' l’accès au contenu illégal.',
        ['bloquer', 'couper', 'fermer', 'supprimer', 'interdire'],
      ],
      'La plateforme doit agir vite sur un contenu illégal.',
    ),
    expert(
      fait(
        FACILES,
        [
          'Par quelle voie les notifications prévues par le règlement européen sont-elles envoyées à l’hébergeur ?',
          'par voie électronique',
        ],
        [
          ['par courrier postal uniquement', 'Le texte prévoit la voie électronique.'],
          ['de vive voix au siège de l’entreprise', 'Aucun déplacement n’est demandé.'],
          ['par une annonce dans un journal', 'Un journal ne sert pas à notifier un contenu.'],
        ],
        [
          'Les notifications se font exclusivement par voie ',
          '.',
          ['électronique', 'electronique', 'numérique', 'numerique'],
        ],
        'On signale directement en ligne, avec un mécanisme facile à utiliser.',
      ),
    ),
    fait(
      ADRESSE,
      ['Que faut-il indiquer pour que l’on retrouve le contenu signalé ?', 'son adresse exacte (URL)'],
      [
        ['seulement le nom du réseau social', 'Cela ne permet pas de retrouver le contenu précis.'],
        ['la couleur de la page', 'La couleur n’identifie rien.'],
        ['son propre mot de passe', 'Un mot de passe ne doit jamais être communiqué.'],
      ],
      ['Le signalement indique l’emplacement exact, par exemple l’', ' de la page.', ['URL', 'url', 'adresse']],
      'L’URL est l’adresse précise d’un contenu en ligne.',
    ),
    fait(
      EXPLICATION,
      ['Qu’est-ce qu’un signalement doit expliquer ?', 'pourquoi le contenu paraît illicite'],
      [
        ['pourquoi on aime l’application', 'Ce n’est pas l’objet d’un signalement.'],
        ['la note obtenue au dernier devoir', 'Aucun rapport avec le contenu.'],
        ['la liste de tous ses amis', 'Ces données n’ont pas à être données.'],
      ],
      [
        'Il faut expliquer pour quelles raisons le contenu paraît ',
        '.',
        ['illicite', 'illégal', 'illegal', 'interdit'],
      ],
      'Des raisons claires aident la plateforme à décider.',
    ),
    expert(
      fait(
        BONNE_FOI,
        [
          'Que confirme la personne qui envoie une notification ?',
          'qu’elle pense, de bonne foi, que ses informations sont exactes et complètes',
        ],
        [
          ['qu’elle a déjà été jugée', 'Aucun jugement préalable n’est demandé.'],
          ['qu’elle est l’auteur du contenu', 'Elle le signale, elle ne l’a pas forcément créé.'],
          ['qu’elle accepte de rediffuser le contenu', 'Signaler n’est pas diffuser.'],
        ],
        ['La personne déclare penser, de bonne ', ', que ses informations sont exactes.', ['foi']],
        'Signaler engage à être honnête : on ne signale pas pour nuire.',
      ),
    ),
    fait(
      DECISION,
      [
        'Après examen d’une notification, qu’envoie l’hébergeur à la personne qui l’a faite, s’il a ses coordonnées ?',
        'sa décision et les possibilités de recours',
      ],
      [
        ['la facture du traitement', 'Aucun paiement n’est prévu dans ce texte.'],
        ['le mot de passe de l’auteur', 'Un mot de passe ne se communique pas.'],
        ['l’obligation de retirer sa plainte', 'La décision ouvre au contraire des recours.'],
      ],
      ['L’hébergeur communique sa décision et les possibilités de ', '.', ['recours', 'contestation']],
      'On sait ce qui a été décidé et on peut le contester.',
    ),
    expert(
      fait(
        PRIORITE,
        ['Comment sont traitées les notifications des signaleurs de confiance ?', 'en priorité'],
        [
          ['après toutes les autres', 'Elles passent au contraire en premier.'],
          ['jamais', 'Elles sont bien traitées.'],
          ['seulement une fois par an', 'Une fois par an, ils publient des rapports, sans retarder le traitement.'],
        ],
        ['Les notifications des signaleurs de confiance sont traitées en ', '.', ['priorité', 'priorite', 'premier']],
        'Leur expertise explique ce traitement prioritaire.',
      ),
    ),
    fait(
      PHAROS,
      ['Quel est le nom de la plateforme publique d’orientation des signalements ?', 'Pharos'],
      [
        ['Marianne', 'Marianne est un symbole de la République.'],
        ['Parcoursup', 'Ce n’est pas une plateforme de signalement.'],
        ['Pronote', 'Ce nom ne désigne pas une plateforme de signalement.'],
      ],
      ['La plateforme publique de signalement s’appelle ', '.', ['Pharos', 'pharos', 'PHAROS']],
      'Pharos reçoit des signalements, dont une partie concerne la haine en ligne.',
    ),
    expert(
      fait(
        ARCOM,
        [
          'En France, quelle autorité est le coordinateur national chargé du règlement européen sur les services numériques ?',
          'l’Arcom',
        ],
        [
          ['le conseil municipal', 'Il gère les affaires d’une commune.'],
          ['le conseil d’administration d’un collège', 'Il ne contrôle pas les plateformes.'],
          ['une plateforme privée', 'Un coordinateur est une autorité, pas une entreprise contrôlée.'],
        ],
        ['En France, le coordinateur pour les services numériques est l’', '.', ['Arcom', 'ARCOM', 'arcom']],
        'L’Arcom contrôle le respect du règlement en France.',
      ),
    ),
  ],
  paires3: [
    ['Pharos', 'Plateforme publique de signalement'],
    ['URL', 'Adresse exacte d’un contenu'],
    ['Signaleur de confiance', 'Notifications traitées en priorité'],
  ],
  paires5: [
    ['Arcom', 'Coordinateur national du règlement européen'],
    ['Pharos', 'Orientation des signalements'],
    ['3018', 'Aide aux jeunes victimes de cyberviolence'],
    ['Recours', 'Moyen de contester une décision'],
    ['Accusé de réception', 'Preuve que la notification est arrivée'],
  ],
  libres: [
    libre(
      PHAROS,
      'quel est le nom de la plateforme publique qui recueille et oriente les signalements ? (6 lettres)',
      ['Pharos', 'la plateforme Pharos'],
      [
        ['Arcom', 'L’Arcom est une autorité de contrôle.'],
        ['Phare', 'pHARe est un programme contre le harcèlement à l’école.'],
      ],
      'Pharos recueille les signalements et les oriente ; l’Arcom, elle, contrôle les plateformes.',
    ),
    libre(
      ADRESSE,
      'quel sigle de trois lettres désigne l’adresse exacte d’un contenu en ligne ?',
      ['URL', 'une URL', 'l’URL'],
      [
        ['DSA', 'Le DSA est le règlement européen sur les services numériques.'],
        ['ONG', 'Une ONG est une organisation non gouvernementale.'],
      ],
      'L’URL permet de retrouver sans erreur le contenu visé.',
    ),
    libre(
      ACCUSE,
      'quel message l’hébergeur envoie-t-il pour confirmer qu’il a bien reçu une notification ? Un accusé de …',
      ['réception', 'reception', 'accusé de réception', 'accusé de reception'],
      [
        ['rediffusion', 'Rediffuser, c’est relayer un contenu.'],
        ['recours', 'Un recours sert à contester une décision.'],
      ],
      'L’accusé de réception prouve que la notification est arrivée ; la décision vient ensuite.',
    ),
  ],
  docs: [
    {
      title: 'Le formulaire d’Adam',
      lines: [
        'Adam, avec l’aide de sa mère, signale une publication qui appelle à la violence contre des personnes handicapées.',
        'Il copie l’adresse exacte de la publication dans le formulaire.',
        'Il explique pourquoi elle lui paraît illégale.',
        'Il indique les coordonnées demandées et reçoit un message : sa notification est bien arrivée.',
      ],
      qs: [
        lecture(
          ADRESSE,
          'Pourquoi Adam copie-t-il l’adresse exacte ?',
          'pour que le contenu visé soit identifié sans erreur',
          [
            ['pour le faire connaître à d’autres élèves', 'Il la transmet à la plateforme, pas aux élèves.'],
            ['pour devenir l’auteur de la publication', 'Copier une adresse ne change pas l’auteur.'],
            ['pour obtenir un mot de passe', 'L’adresse ne donne aucun mot de passe.'],
          ],
          'La notification doit indiquer clairement l’emplacement du contenu.',
        ),
        lecture(
          ACCUSE,
          'Comment s’appelle le message qu’Adam reçoit ?',
          'un accusé de réception',
          [
            ['un jugement', 'La plateforme n’est pas un tribunal.'],
            ['une amende', 'Aucune amende n’est envoyée à celui qui signale de bonne foi.'],
            ['une injure', 'Le message confirme seulement la réception.'],
          ],
          'L’accusé de réception confirme que la notification est arrivée ; la décision suit.',
        ),
      ],
    },
    {
      title: 'Une réponse décevante',
      lines: [
        'Une association signale une publication haineuse à une plateforme.',
        'La plateforme répond qu’elle la laisse en ligne et indique comment contester.',
        'L’association n’est pas d’accord et pense que la publication est illégale.',
      ],
      qs: [
        lecture(
          DECISION,
          'Que peut faire l’association à partir de cette réponse ?',
          'utiliser les possibilités de recours indiquées',
          [
            ['publier à son tour des messages haineux', 'Cela serait illégal et n’est pas un recours.'],
            ['pirater la plateforme', 'C’est interdit et sans rapport avec un recours.'],
            ['rien, une décision ne se conteste jamais', 'La décision s’accompagne de possibilités de recours.'],
          ],
          'La plateforme doit informer des recours : la décision peut être contestée.',
        ),
        lecture(
          HORS_LIGNE,
          'Pourquoi la loi peut-elle s’appliquer à cette publication ?',
          'ce qui est illégal hors ligne est illégal en ligne',
          [
            ['les publications échappent à la loi', 'Internet n’est pas une zone sans droit.'],
            ['seule la plateforme décide de ce qui est légal', 'La loi s’impose à elle aussi.'],
            ['une association peut inventer une loi', 'Elle signale, elle ne fait pas la loi.'],
          ],
          'Le droit s’applique aussi sur Internet.',
        ),
      ],
    },
  ],
};

export const DISCOURS_HAINE_SKILLS: readonly Skill[] = [discoursHaine, loi, reagir, signaler].map(notion);
