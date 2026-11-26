import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-reproduction.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— Maîtrise de la reproduction : contraception, prévention des IST, aide à la procréation ———

const DEFS = {
  contraception: 'l’ensemble des moyens qui visent à empêcher la fécondation lors des rapports sexuels',
  préservatif: 'l’étui placé lors d’un rapport sexuel, qui sert de contraceptif et protège des IST',
  pilule: 'le comprimé hormonal pris régulièrement, qui empêche la fécondation en bloquant notamment l’ovulation',
  implant: 'le petit bâtonnet inséré sous la peau du bras, qui libère une hormone bloquant l’ovulation',
  dépistage: 'la recherche d’une infection, même sans symptôme, grâce à un test',
  vaccination: 'le fait de recevoir un vaccin, qui permet par exemple d’éviter un cancer dû au papillomavirus',
  'contraception d’urgence':
    'une méthode de rattrapage après un rapport non protégé, pour éviter une grossesse non souhaitée',
  'fécondation in vitro': 'la technique qui provoque la rencontre d’un ovule et d’un spermatozoïde en laboratoire',
  'insémination artificielle': 'la technique qui dépose des spermatozoïdes préparés directement dans l’utérus',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  contraception: 'Repère : le but est d’empêcher une grossesse non souhaitée.',
  préservatif: 'Repère : c’est le moyen qui protège aussi des IST.',
  pilule: 'Repère : c’est un comprimé hormonal qui se prend régulièrement.',
  implant: 'Repère : il reste sous la peau et agit sur la durée.',
  dépistage: 'Repère : il permet de savoir si l’on est infecté.',
  vaccination: 'Repère : il s’agit de recevoir un vaccin.',
  'contraception d’urgence': 'Repère : elle intervient après le rapport, le plus tôt possible.',
  'fécondation in vitro': 'Repère : « in vitro » signifie hors du corps.',
  'insémination artificielle': 'Repère : la fécondation a ensuite lieu dans le corps.',
};

const INDICE =
  'Demande-toi à quoi sert la technique : éviter une grossesse, prévenir une infection ou aider à concevoir.';

const saisie = saisieur(DEFS, INDICE);

export const maitriseReproduction: Skill = {
  id: 'v4-maitrise-reproduction',
  title: 'La maîtrise de la reproduction',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'La **contraception** évite une grossesse non souhaitée (**pilule**, **implant**, **préservatif**) ; une **contraception d’urgence** existe après un rapport non protégé.',
      'Contre les **IST**, le **préservatif** et le **dépistage** sont des moyens de prévention ; la **procréation médicalement assistée** aide, au contraire, des personnes à avoir un enfant.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « fertilité, grossesse, respect de l’autre, choix raisonné de la procréation, contraception, prévention des infections sexuellement transmissibles ».`,
    sources: [
      PROGRAMME,
      'academie-contraception',
      'academie-preservatif',
      'academie-pilule',
      'inserm-contraception',
      'inserm-amp',
      'spf-ist',
      'spf-vih',
      'spf-papillomavirus',
      'spf-chlamydiae',
    ],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['contraception', 'dépistage', 'fécondation in vitro'],
    cas: [
      {
        prompt: 'Quel moyen de contraception protège aussi des infections sexuellement transmissibles ?',
        bonne: 'le préservatif',
        fausses: [
          ['la pilule', 'La pilule agit sur les hormones : elle ne fait pas barrière aux infections.'],
          ['l’implant', 'L’implant agit sur l’ovulation, pas sur la transmission des infections.'],
          [
            'le dispositif intra-utérin au cuivre',
            'Placé dans l’utérus, il vise à éviter une grossesse, pas à empêcher une infection.',
          ],
        ],
        indice: 'Quel moyen forme une barrière lors du rapport ?',
        explication: ['Le préservatif protège à la fois contre une grossesse et contre les IST.'],
      },
      {
        prompt: 'Comment agit surtout une pilule contraceptive combinée ?',
        bonne: 'elle bloque notamment l’ovulation',
        fausses: [
          ['elle forme une barrière physique', 'C’est le principe du préservatif.'],
          ['elle détruit les infections', 'Un contraceptif hormonal n’agit pas contre les infections.'],
          ['elle déclenche l’accouchement', 'Un contraceptif sert à éviter une grossesse.'],
        ],
        indice: 'Que fait une hormone de contraception sur l’ovaire ?',
        explication: ['La pilule empêche la fécondation en bloquant notamment l’ovulation.'],
      },
      {
        prompt: 'Après un rapport non protégé, quelle conduite est responsable pour éviter une grossesse ?',
        bonne: 'recourir sans attendre à une contraception d’urgence',
        fausses: [
          [
            'attendre plusieurs semaines avant d’agir',
            'Plus la contraception d’urgence est rapide, plus elle est efficace.',
          ],
          ['commencer la pilule le mois suivant', 'Cela ne rattrape pas le rapport déjà eu.'],
          ['ne rien faire car le risque est nul', 'Un rapport non protégé expose à une grossesse.'],
        ],
        indice: 'Le temps compte.',
        explication: [
          'La contraception d’urgence s’utilise vite ; elle est accessible aux mineures, notamment à l’infirmerie scolaire et en pharmacie.',
        ],
      },
      {
        prompt: 'Dans un couple, une personne refuse un rapport sexuel. Quel comportement est responsable ?',
        bonne: 'respecter son refus',
        fausses: [
          ['insister jusqu’à obtenir un accord', 'Insister ne respecte pas le choix de l’autre.'],
          ['décider à sa place', 'Chacun décide pour soi-même.'],
          ['la menacer de mettre fin à la relation', 'Une menace n’est pas un respect de l’autre.'],
        ],
        indice: 'Le programme associe la sexualité au respect de l’autre.',
        explication: ['Un comportement responsable repose d’abord sur le respect de l’autre et de son choix.'],
      },
      {
        prompt: 'Comment les IST se transmettent-elles principalement ?',
        bonne: 'lors de rapports sexuels',
        fausses: [
          ['en se serrant la main', 'Ce geste n’est pas la voie principale de transmission.'],
          ['en regardant une personne infectée', 'Une infection ne se transmet pas par le regard.'],
          ['en partageant une salle de classe', 'Être dans la même pièce ne suffit pas.'],
        ],
        indice: 'Relis ce que signifient les trois lettres du sigle.',
        explication: [
          'IST signifie infections sexuellement transmissibles : les rapports sexuels en sont la voie principale.',
        ],
      },
    ],
    rangements: [
      {
        prompt: 'Range les étapes d’une fécondation in vitro.',
        suite: [
          'on prélève les gamètes',
          'on met l’ovule et les spermatozoïdes en contact en laboratoire',
          'un embryon se développe',
          'l’embryon est transféré dans l’utérus',
        ],
        indice: 'Les gamètes doivent être recueillis avant de se rencontrer.',
        explication: 'La rencontre se fait en laboratoire, puis l’embryon rejoint l’utérus.',
      },
      {
        prompt: 'Range les actions responsables après un rapport non protégé.',
        suite: [
          'consulter rapidement (pharmacie, infirmerie, centre de santé sexuelle)',
          'prendre la contraception d’urgence le plus tôt possible',
          'faire un dépistage des IST selon les conseils d’un professionnel',
        ],
        indice: 'On cherche d’abord une aide, puis on agit contre la grossesse, puis on vérifie les infections.',
        explication:
          'La rapidité compte pour la contraception d’urgence ; le dépistage recherche ensuite une éventuelle infection.',
      },
    ],
    trous: [
      {
        prompt: 'Complète la prévention des IST.',
        parts: ['Le ', ' et le ', ' sont des moyens de prévention des IST.'],
        choix: [
          [['préservatif', 'implant', 'dispositif au cuivre'], 0],
          [['dépistage', 'sommeil', 'jeûne'], 0],
        ],
        indice: 'L’un forme une barrière, l’autre recherche l’infection.',
        explication: 'Prévenir, c’est à la fois se protéger et se faire tester.',
      },
      {
        prompt: 'Complète le rôle des aides à la procréation.',
        parts: [
          'En ',
          ', la rencontre des gamètes a lieu en laboratoire ; l’embryon est ensuite transféré dans l’',
          '.',
        ],
        choix: [
          [['fécondation in vitro', 'contraception', 'dépistage'], 0],
          [['estomac', 'utérus', 'hypophyse'], 1],
        ],
        indice: '« Hors du corps » : quelle technique ?',
        explication: 'La technique hors du corps aboutit au transfert d’un embryon dans l’organe de la gestation.',
      },
      {
        prompt: 'Complète à propos du VIH.',
        parts: ['Le VIH affaiblit le système ', ' ; sans traitement, il est responsable du ', '.'],
        choix: [
          [['immunitaire', 'digestif', 'osseux'], 0],
          [['rhume', 'sida', 'diabète'], 1],
        ],
        indice: 'Le VIH touche les défenses du corps.',
        explication: 'Le VIH est un virus qui s’attaque aux défenses de l’organisme.',
      },
    ],
    faciles: [
      saisie('contraception', ['la'], ['dépistage', 'vaccination']),
      saisie('préservatif', ['le'], ['implant', 'pilule']),
      saisie('pilule', ['la'], ['implant', 'préservatif'], ['pilule contraceptive', 'la pilule contraceptive']),
    ],
    saisies: [
      saisie('implant', ['l’', 'un'], ['pilule', 'préservatif'], ['implant contraceptif', 'l’implant contraceptif']),
      saisie('dépistage', ['le'], ['vaccination', 'contraception']),
      saisie('fécondation in vitro', ['la'], ['insémination artificielle', 'contraception'], ['FIV', 'la FIV']),
      saisie(
        'insémination artificielle',
        ['l’', 'une'],
        ['fécondation in vitro', 'implant'],
        ['insémination', 'l’insémination'],
      ),
    ],
    series: [
      [
        ['préservatif', 'fait barrière et protège aussi des IST'],
        ['pilule', 'comprimé hormonal à prendre régulièrement'],
        ['implant', 'bâtonnet sous la peau du bras'],
        ['dispositif intra-utérin au cuivre', 'placé dans l’utérus, le cuivre agit sur les spermatozoïdes'],
        ['contraception d’urgence', 'rattrapage après un rapport non protégé'],
      ],
      [
        ['VIH', 'affaiblit le système immunitaire'],
        ['papillomavirus', 'un vaccin permet d’éviter des cancers qu’il peut provoquer'],
        ['chlamydia', 'bactérie : préservatif et dépistage limitent les contaminations'],
        ['insémination artificielle', 'spermatozoïdes déposés dans l’utérus'],
        ['fécondation in vitro', 'rencontre des gamètes en laboratoire'],
      ],
    ],
    pieges: [
      {
        prompt: 'Une personne prend la pilule. Est-elle protégée contre les IST ?',
        bonne: 'non, la pilule ne protège pas des IST ; le préservatif reste nécessaire',
        fausses: [
          [
            'oui, tout contraceptif protège des IST',
            'Éviter une grossesse ne suffit pas à protéger : c’est le préservatif qui fait barrière aux infections.',
          ],
          ['oui, mais seulement contre le VIH', 'La pilule agit sur les hormones, pas sur les virus.'],
          ['oui, si elle est prise tous les jours', 'La régularité sert à éviter une grossesse, pas une infection.'],
        ],
        indice: 'La pilule agit-elle comme une barrière ?',
        explication: ['Contraception et protection contre les IST sont deux buts distincts.'],
      },
      {
        prompt: 'Une infection comme le VIH peut-elle passer inaperçue ?',
        bonne: 'oui, elle peut rester sans symptôme pendant plusieurs années : seul un test renseigne',
        fausses: [
          [
            'non, elle provoque toujours des signes immédiats',
            'L’infection peut rester asymptomatique plusieurs années.',
          ],
          ['oui, mais seulement quelques heures', 'La période sans signes peut durer des années.'],
          ['non, car le préservatif la rend visible', 'Le préservatif sert à se protéger, pas à diagnostiquer.'],
        ],
        indice: 'Pourquoi recommande-t-on le dépistage ?',
        explication: ['Sans symptôme, seul un test permet de savoir : c’est l’intérêt du dépistage.'],
      },
      {
        prompt: 'À quoi sert la procréation médicalement assistée ?',
        bonne: 'aider à obtenir une grossesse quand la conception est difficile',
        fausses: [
          ['empêcher une grossesse', 'C’est le but de la contraception.'],
          ['soigner une IST', 'Cette technique concerne la conception d’un enfant, pas les infections.'],
          ['déclencher la puberté', 'La puberté dépend des hormones de la personne.'],
        ],
        indice: 'Que signifie « assistée » ?',
        explication: [
          'Cette aide médicale manipule ovule ou spermatozoïde pour favoriser l’obtention d’une grossesse.',
        ],
      },
    ],
    dossiers: [
      {
        titre: 'Fiche conseil fictive « centre Les Pins »',
        lignes: [
          'Fiche (inventée) d’un centre de santé sexuelle.',
          'Une personne ne souhaite pas de grossesse et veut aussi se protéger des IST avec un nouveau partenaire.',
          'Elle demande quels moyens associer.',
        ],
        questions: [
          {
            prompt: 'Quelle réponse correspond à ses deux objectifs ?',
            bonne: 'utiliser un préservatif et réaliser un dépistage des IST',
            fausses: [
              ['prendre seulement la pilule', 'La pilule ne protège pas des IST.'],
              ['poser seulement un implant', 'L’implant agit sur l’ovulation, pas sur la transmission des infections.'],
              ['faire seulement un dépistage', 'Un test informe mais n’empêche ni une grossesse ni une contamination.'],
            ],
            indice: 'Il faut répondre à la grossesse et aux infections.',
            explication: [
              'Le préservatif couvre les deux buts ; le dépistage vérifie qu’aucune infection n’est déjà présente.',
            ],
          },
          {
            prompt: 'Pourquoi le centre conseille-t-il un dépistage même sans symptôme ?',
            bonne: 'certaines infections peuvent rester sans signe pendant longtemps',
            fausses: [
              ['le dépistage remplace le préservatif', 'Il informe, il ne protège pas pendant le rapport.'],
              ['le dépistage évite une grossesse', 'Ce n’est pas un moyen de contraception.'],
              ['les IST se voient toujours à l’œil nu', 'Certaines infections restent silencieuses.'],
            ],
            indice: 'Pense au VIH.',
            explication: ['Une infection peut rester asymptomatique : seul un test la révèle.'],
          },
        ],
      },
      {
        titre: 'Consultation fictive « couple M »',
        lignes: [
          'Compte rendu (inventé) d’une consultation.',
          'Un couple souhaite un enfant ; les spermatozoïdes sont peu mobiles.',
          'Le médecin propose de réaliser la rencontre des gamètes en laboratoire puis de transférer un embryon.',
        ],
        questions: [
          {
            prompt: 'Quelle technique le compte rendu décrit-il ?',
            bonne: 'la fécondation in vitro',
            fausses: [
              [
                'l’insémination artificielle',
                'Elle dépose les spermatozoïdes dans l’utérus : la fécondation a lieu dans le corps.',
              ],
              ['la contraception d’urgence', 'Elle sert à éviter une grossesse.'],
              ['le dépistage', 'Il recherche une infection.'],
            ],
            indice: 'Où se déroule la rencontre des gamètes ?',
            explication: ['La rencontre en laboratoire suivie d’un transfert d’embryon est la fécondation in vitro.'],
          },
          {
            prompt: 'Après le transfert, où l’embryon doit-il s’installer pour que la grossesse se poursuive ?',
            bonne: 'dans l’utérus',
            fausses: [
              ['dans l’ovaire', 'L’ovaire forme les ovules, la grossesse n’y a pas lieu.'],
              ['dans la vessie', 'La vessie contient l’urine.'],
              ['dans l’hypophyse', 'Cette glande est dans la tête et produit des hormones.'],
            ],
            indice: 'C’est l’organe de la gestation.',
            explication: ['La grossesse se déroule dans l’utérus, où l’embryon est transféré.'],
          },
        ],
      },
    ],
  }),
};
