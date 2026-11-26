import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees-reproduction.ts';
import { generer, saisieur } from './reproduction-kit.ts';

// ——— La puberté : organes reproducteurs, cellules reproductrices, contrôle hormonal ———

const DEFS = {
  puberté: 'la période de transformations au cours de laquelle les organes génitaux deviennent aptes à la reproduction',
  testicule: 'la glande génitale mâle, qui produit les spermatozoïdes et des hormones comme la testostérone',
  ovaire: 'la glande génitale femelle, où se forment les ovules et qui produit des hormones sexuelles',
  hormone: 'une substance produite par une glande et transportée par le sang jusqu’à un organe qu’elle régule',
  testostérone: 'une hormone produite par les testicules, responsable de caractères sexuels masculins',
  hypophyse: 'une petite glande, reliée au cerveau, qui libère des hormones commandant d’autres glandes',
  ovulation: 'la libération périodique, par l’ovaire, d’un ovule arrivé à maturité',
  règles: 'l’écoulement de sang périodique dû à l’élimination de la muqueuse de l’utérus',
} as const;
type Terme = keyof typeof DEFS;

const REPERES: Readonly<Record<Terme, string>> = {
  puberté: 'Repère : c’est une période de la vie, dont l’âge varie d’une personne à l’autre.',
  testicule: 'Repère : spermatozoïdes et testostérone viennent de cette glande.',
  ovaire: 'Repère : c’est là que se forment les ovules.',
  hormone: 'Repère : elle voyage par le sang et agit à distance.',
  testostérone: 'Repère : c’est l’hormone produite par les testicules.',
  hypophyse: 'Repère : cette glande commande d’autres glandes.',
  ovulation: 'Repère : un ovule quitte l’ovaire ; ce n’est pas encore une fécondation.',
  règles: 'Repère : elles marquent le début d’un cycle.',
};

const INDICE = 'Demande-toi s’il s’agit d’une période, d’un organe, d’une substance ou d’un événement du cycle.';

const saisie = saisieur(DEFS, INDICE);

export const puberte: Skill = {
  id: 'v4-puberte',
  title: 'La puberté et le contrôle hormonal',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'À la **puberté**, les organes reproducteurs deviennent fonctionnels : les **testicules** produisent des spermatozoïdes, les **ovaires** libèrent des ovules ; l’âge varie d’une personne à l’autre.',
      'Des **hormones** transportées par le sang commandent ces changements : par exemple, l’**hypophyse** agit sur les testicules et les ovaires, qui produisent à leur tour des hormones.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Puberté, organes reproducteurs, production de cellules reproductrices, contrôles hormonaux ».`,
    sources: [
      PROGRAMME,
      'academie-puberte',
      'academie-ovaire',
      'academie-ovule',
      'academie-oestrogene',
      'academie-hormone',
      'academie-hypophyse',
      'academie-ovulation',
      'academie-menstruation',
      'cnrtl-testicule',
      'cnrtl-testosterone',
      'inserm-infertilite',
      'inserm-menopause',
    ],
  },
  generate: generer<Terme>({
    defs: DEFS,
    reperes: REPERES,
    indice: INDICE,
    simples: ['puberté', 'testicule', 'ovaire'],
    cas: [
      {
        prompt: 'Quel signe marque la puberté chez les filles ?',
        bonne: 'l’apparition des règles',
        fausses: [
          ['la production de spermatozoïdes', 'Elle concerne les testicules.'],
          ['la naissance', 'La puberté survient bien après la naissance.'],
          ['la disparition des ovaires', 'Les ovaires deviennent au contraire fonctionnels.'],
        ],
        indice: 'Pense à un événement qui revient à chaque cycle.',
        explication: ['La puberté se marque chez les filles par les règles et l’émission d’un ovule à chaque cycle.'],
      },
      {
        prompt: 'Qu’est-ce qui débute à la puberté chez les garçons ?',
        bonne: 'la production de spermatozoïdes',
        fausses: [
          ['l’ovulation', 'L’ovulation concerne les ovaires.'],
          ['les règles', 'Les règles viennent de l’utérus.'],
          ['la formation du stock d’ovocytes', 'Ce stock existe chez la fille dès la naissance.'],
        ],
        indice: 'Quelles cellules reproductrices sont mâles ?',
        explication: ['À la puberté, les testicules se mettent à fabriquer des spermatozoïdes.'],
      },
      {
        prompt: 'Comment une hormone parvient-elle à l’organe sur lequel elle agit ?',
        bonne: 'par le sang',
        fausses: [
          ['par le tube digestif', 'Une hormone n’emprunte pas le trajet des aliments.'],
          ['par les voies respiratoires', 'L’air n’achemine pas les hormones.'],
          ['uniquement par contact entre deux organes voisins', 'Une hormone agit à distance.'],
        ],
        indice: 'Pense au liquide qui circule dans tout le corps.',
        explication: ['Les hormones sont déversées dans le sang, qui les transporte vers l’organe régulé.'],
      },
      {
        prompt: 'L’âge de la puberté est-il le même pour tout le monde ?',
        bonne: 'non, il varie d’un individu à l’autre',
        fausses: [
          ['oui, exactement au même anniversaire', 'Chaque personne a son propre rythme.'],
          ['oui, il est fixé à la naissance pour tous au même âge', 'L’âge varie selon les individus.'],
          ['la puberté n’a pas d’âge car elle dure toute la vie', 'La puberté est une période de passage.'],
        ],
        indice: 'Tout le monde grandit-il à la même vitesse ?',
        explication: ['La puberté est un passage dont le calendrier est propre à chaque personne.'],
      },
    ],
    rangements: [
      {
        prompt: 'Range les étapes du contrôle hormonal des testicules.',
        suite: [
          'l’hypothalamus et l’hypophyse libèrent des hormones dans le sang',
          'le sang transporte ces hormones jusqu’aux testicules',
          'les testicules produisent de la testostérone',
          'la testostérone agit sur des organes du corps',
        ],
        indice: 'La commande part du cerveau.',
        explication: 'La commande suit un chemin : cerveau, sang, testicules, puis effets de la testostérone.',
      },
      {
        prompt: 'Range les événements d’un cycle menstruel, à partir de son premier jour.',
        suite: [
          'les règles commencent (premier jour du cycle)',
          'l’ovaire libère un ovule vers le milieu du cycle',
          'un nouveau cycle commence avec de nouvelles règles',
        ],
        indice: 'Le premier jour des règles ouvre le cycle.',
        explication:
          'D’après l’Inserm, le cycle débute le premier jour des règles et l’ovulation a lieu vers le 14e jour.',
      },
    ],
    trous: [
      {
        prompt: 'Complète : qui produit quoi ?',
        parts: ['Les ', ' produisent les spermatozoïdes ; les ', ' forment les ovules.'],
        choix: [
          [['testicules', 'ovaires', 'poumons'], 0],
          [['testicules', 'ovaires', 'reins'], 1],
        ],
        indice: 'Associe chaque cellule reproductrice à sa glande.',
        explication: 'Chaque glande génitale produit un type de cellule reproductrice.',
      },
      {
        prompt: 'Complète la commande hormonale.',
        parts: ['Le cerveau commande les glandes génitales par des ', ' qui circulent dans le ', '.'],
        choix: [
          [['hormones', 'gamètes', 'nutriments'], 0],
          [['nerf', 'sang', 'sperme'], 1],
        ],
        indice: 'Une substance voyage dans un liquide.',
        explication: 'La commande est hormonale : des substances sont transportées par le sang.',
      },
      {
        prompt: 'Complète : la production de cellules reproductrices.',
        parts: [
          'Chez l’homme, la production de spermatozoïdes débute à la ',
          ' ; chez la femme, le stock d’ovocytes (ou ovules) est présent dès la ',
          '.',
        ],
        choix: [
          [['puberté', 'naissance', 'ménopause'], 0],
          [['naissance', 'puberté', 'ménopause'], 0],
        ],
        indice: 'Les deux calendriers ne sont pas les mêmes.',
        explication:
          'Les spermatozoïdes se fabriquent à partir de la puberté ; la fille naît avec son stock d’ovocytes (ou ovules).',
      },
    ],
    faciles: [
      saisie('puberté', ['la'], ['ovulation', 'hormone']),
      saisie('testicule', ['le'], ['ovaire', 'hypophyse'], ['testicules', 'les testicules']),
      saisie('ovaire', ['l’'], ['testicule', 'hypophyse'], ['ovaires', 'les ovaires']),
    ],
    saisies: [
      saisie('hormone', ['une', 'l’'], ['testostérone', 'hypophyse'], ['hormones', 'les hormones']),
      saisie('testostérone', ['la'], ['hormone', 'testicule']),
      saisie('hypophyse', ['l’'], ['testicule', 'ovaire']),
      saisie('ovulation', ['l’'], ['règles', 'puberté']),
      saisie(
        'règles',
        ['les'],
        ['ovulation', 'puberté'],
        ['menstruation', 'la menstruation', 'menstruations', 'les menstruations'],
      ),
    ],
    series: [
      [
        ['puberté', DEFS['puberté']],
        ['hormone', DEFS.hormone],
        ['hypophyse', DEFS.hypophyse],
        ['ovulation', DEFS.ovulation],
        ['règles', DEFS['règles']],
      ],
      [
        ['testicules', 'produisent les spermatozoïdes et la testostérone'],
        ['ovaires', 'libèrent les ovules'],
        ['hypophyse', 'envoie des hormones qui commandent d’autres glandes'],
        ['sang', 'transporte les hormones'],
        ['muqueuse de l’utérus', 'est éliminée au moment des règles'],
      ],
    ],
    pieges: [
      {
        prompt: 'Quelle affirmation sur les cellules reproductrices est correcte ?',
        bonne:
          'les spermatozoïdes sont fabriqués à partir de la puberté, alors que la fille naît avec un stock d’ovocytes (ou ovules)',
        fausses: [
          [
            'les deux stocks sont constitués entièrement à la naissance',
            'La production de spermatozoïdes débute à la puberté.',
          ],
          [
            'les ovocytes sont fabriqués en continu à partir de la puberté',
            'La fille naît avec un stock complet d’ovocytes.',
          ],
          ['les spermatozoïdes sont produits par les ovaires', 'Les ovaires forment les ovules.'],
        ],
        indice: 'Compare le moment où chaque réserve se met en place.',
        explication: [
          'Les calendriers diffèrent : production à partir de la puberté d’un côté, stock présent dès la naissance de l’autre.',
        ],
      },
      {
        prompt: 'Vers quel moment d’un cycle l’Inserm situe-t-il habituellement l’ovulation ?',
        bonne: 'vers le 14e jour, compté depuis le premier jour des règles',
        fausses: [
          ['le premier jour des règles', 'Ce jour ouvre le cycle, il n’est pas celui de l’ovulation.'],
          ['vers le 14e jour après la fin des règles', 'Le compte débute au premier jour des règles.'],
          ['uniquement après une fécondation', 'L’ovulation précède la fécondation éventuelle.'],
        ],
        indice: 'Repère le jour qui ouvre le cycle.',
        explication: [
          'Le cycle débute le premier jour des règles ; l’ovulation a lieu vers le 14e jour, un repère qui varie.',
        ],
      },
      {
        prompt: 'La testostérone est produite par les testicules. Comment est-elle contrôlée ?',
        bonne: 'le cerveau libère des hormones dans le sang, qui agissent sur les testicules',
        fausses: [
          ['les testicules agissent sans aucune commande', 'La production est contrôlée par le cerveau.'],
          ['le cerveau envoie les spermatozoïdes aux testicules', 'Les spermatozoïdes naissent dans les testicules.'],
          ['les poumons donnent l’ordre par l’air', 'La commande passe par des hormones dans le sang.'],
        ],
        indice: 'Qui commande, et par quel moyen ?',
        explication: ['Le complexe hypothalamus-hypophyse libère des hormones (FSH et LH) dans le sang.'],
      },
    ],
    dossiers: [
      {
        titre: 'Calendrier d’un cycle « Lilas »',
        lignes: [
          'Calendrier (inventé) d’un cycle suivi en cours de SVT.',
          'Jour 1 : début des règles.',
          'Jour 5 : fin des règles. Jour 29 : début des règles suivantes.',
        ],
        questions: [
          {
            prompt: 'D’après le repère donné par l’Inserm, vers quel jour de ce calendrier attend-on l’ovulation ?',
            bonne: 'vers le jour 14',
            fausses: [
              ['le jour 1', 'Le jour 1 est le début des règles.'],
              ['le jour 5', 'La fin des règles ne correspond pas à l’ovulation.'],
              ['le jour 29', 'Le jour 29 ouvre le cycle suivant.'],
            ],
            indice: 'Le repère se compte depuis le premier jour des règles.',
            explication: [
              'Vers le 14e jour : ce n’est qu’un repère, qui varie d’une personne et d’un cycle à l’autre.',
            ],
          },
          {
            prompt: 'Combien de jours dure ce cycle, des règles du jour 1 à la veille des règles suivantes ?',
            bonne: '28 jours',
            fausses: [
              ['5 jours', 'Cinq jours correspondent à la durée des règles seulement.'],
              ['29 jours', 'Le jour 29 est le premier jour du cycle suivant.'],
              ['14 jours', 'Quatorze est le repère de l’ovulation, pas la durée du cycle.'],
            ],
            indice: 'Le jour 29 appartient déjà au cycle suivant.',
            explication: ['Du jour 1 au jour 28 inclus, ce cycle dure 28 jours.'],
          },
        ],
      },
      {
        titre: 'Dossier médical fictif « patient K »',
        lignes: [
          'Dossier (inventé) pour exercice.',
          'Une personne ne produit presque aucune hormone FSH ni LH, à cause d’un trouble de l’hypophyse.',
          'Ses testicules sont présents, mais la production de spermatozoïdes est très faible.',
        ],
        questions: [
          {
            prompt: 'Quelle explication est cohérente avec ce dossier ?',
            bonne: 'sans ces hormones, les testicules ne sont pas stimulés',
            fausses: [
              ['les spermatozoïdes sont fabriqués par l’hypophyse', 'Les spermatozoïdes naissent dans les testicules.'],
              ['les testicules commandent seuls leur activité', 'Le cerveau les contrôle par des hormones.'],
              ['FSH et LH sont des gamètes', 'Ce sont des hormones, pas des cellules reproductrices.'],
            ],
            indice: 'Qui commande les testicules ?',
            explication: [
              'La production est contrôlée par le complexe hypothalamus-hypophyse, grâce à FSH et LH dans le sang.',
            ],
          },
          {
            prompt: 'Par quelle voie FSH et LH atteignent-elles les testicules ?',
            bonne: 'par le sang',
            fausses: [
              ['par le sperme', 'Le sperme transporte les spermatozoïdes hors du corps.'],
              ['par les voies urinaires', 'Les urines évacuent des déchets, elles ne commandent pas les glandes.'],
              ['par le tube digestif', 'Les aliments suivent ce trajet, pas les commandes hormonales.'],
            ],
            indice: 'Une hormone voyage dans un liquide qui irrigue tous les organes.',
            explication: ['Les hormones sont libérées dans le sang, qui les distribue aux organes.'],
          },
        ],
      },
    ],
  }),
};
