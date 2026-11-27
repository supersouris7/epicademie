import type { Skill } from '../../types.ts';
import { avecFiches, communs, compter, fiches, Maj } from './classification-kit.ts';
import { ARBRE, CLASSER } from './donnees-classification.ts';
import { PROGRAMME } from './donnees.ts';
import { qcm } from './kit.ts';
import { associer, choisir, completer, ecrire, generer, type Modele } from './nutrition-kit.ts';

// ——— Parentés : ancêtres communs, arbre du vivant, place de l'espèce humaine ———

const NIVEAU1: readonly Modele[] = [
  choisir(
    'Que montre un arbre du vivant ?',
    'Les liens de parenté entre des groupes d’êtres vivants',
    [
      ['La taille des êtres vivants', 'Les branches ne mesurent pas la taille.'],
      ['Les lieux où vivent les êtres vivants', 'Ce n’est pas une carte.'],
    ],
    'Pense à un arbre de famille.',
    'L’arbre du vivant sert à montrer les relations de parenté.',
  ),
  choisir(
    'Les êtres vivants ont-ils un lien de parenté entre eux ?',
    'Oui, tous les êtres vivants sont apparentés',
    [
      ['Non, seuls les membres d’une même espèce le sont', 'La parenté dépasse l’espèce.'],
      ['Non, les plantes et les animaux n’ont aucun lien', 'Tous les êtres vivants proviennent d’un ancêtre commun.'],
    ],
    'Remonte très loin dans le temps.',
    'Tous les êtres vivants proviennent d’un même ancêtre : ils sont parents.',
  ),
  choisir(
    'Comment appelle-t-on un être vivant du passé dont deux espèces descendent toutes les deux ?',
    'Un ancêtre commun',
    [
      ['Un descendant commun', 'Un descendant vient après ; ici, on remonte le temps.'],
      ['Une espèce voisine', 'Le voisinage ne parle pas de la descendance.'],
    ],
    'Il vit « avant » les deux espèces.',
    'Un ancêtre commun est à l’origine des deux lignées.',
  ),
  choisir(
    'Les humains et les chimpanzés sont-ils parents ?',
    'Oui, ils ont un ancêtre commun',
    [
      ['Non, ils n’ont rien en commun', 'Ils partagent de nombreux caractères.'],
      ['Oui, le chimpanzé est le père des humains', 'Les chimpanzés actuels ne sont pas nos ancêtres.'],
    ],
    'Ils sont plutôt « cousins ».',
    'Humains et chimpanzés ont un ancêtre commun : ce sont des cousins.',
  ),
];

const NIVEAU2: readonly Modele[] = [
  choisir(
    'Quelle phrase décrit correctement le lien entre l’être humain et le chimpanzé ?',
    'Ils descendent d’un ancêtre commun, puis leurs lignées ont évolué séparément',
    [
      ['L’être humain descend du chimpanzé actuel', 'Le chimpanzé actuel n’est pas notre ancêtre.'],
      ['Le chimpanzé descend de l’être humain', 'Aucun des deux ne descend de l’autre.'],
      ['Ils n’ont aucun ancêtre commun', 'Ils ont un ancêtre commun vieux de plusieurs millions d’années.'],
    ],
    'Pense à deux cousins.',
    'Depuis leur ancêtre commun, les lignées des deux espèces ont suivi des chemins différents.',
  ),
  choisir(
    'D’après l’arbre du vivant, de quel animal l’araignée est-elle le plus proche parente ?',
    'Le crabe',
    [
      ['L’escargot', 'L’arbre place l’araignée plus près du crabe que de l’escargot.'],
      ['Le crocodile', 'Le crocodile est un vertébré, une branche éloignée de l’araignée.'],
      ['La mésange', 'La mésange est un vertébré, une branche éloignée de l’araignée.'],
    ],
    'Cherche un animal qui a aussi un squelette externe articulé.',
    'L’araignée et le crabe sont des arthropodes, plus apparentés entre eux qu’avec l’escargot.',
  ),
  choisir(
    'De quel animal le crocodile est-il le plus proche parent : le lézard ou la mésange ?',
    'La mésange',
    [
      ['Le lézard', 'Ils se ressemblent, mais la ressemblance globale est parfois trompeuse.'],
      ['Les deux de la même façon', 'L’arbre montre des degrés de parenté différents.'],
      ['Aucun, il n’a pas de parents', 'Tous les êtres vivants ont des liens de parenté.'],
    ],
    'Méfie-toi de l’apparence.',
    'Le crocodile est plus apparenté à la mésange qu’au lézard.',
  ),
  choisir(
    'De qui les champignons sont-ils les plus proches parents ?',
    'Des animaux',
    [
      [
        'Des plantes',
        'Les champignons ont longtemps été rangés près des plantes, mais ils sont plus proches des animaux.',
      ],
      ['Des pierres', 'Les pierres ne sont pas des êtres vivants.'],
      ['D’aucun autre être vivant', 'Tous les êtres vivants sont apparentés.'],
    ],
    'L’apparence peut tromper.',
    'Des études montrent que les champignons sont plus proches des animaux que des plantes.',
  ),
  associer(
    'Associe chaque mot à sa signification',
    [
      ['Parenté', 'lien dû à des ancêtres communs'],
      ['Ancêtre commun', 'être du passé dont plusieurs espèces descendent'],
      ['Arbre du vivant', 'schéma en branches des liens de parenté'],
    ],
    'Commence par le mot le plus facile.',
    'Parenté, ancêtre commun et arbre du vivant vont ensemble.',
  ),
];

const NIVEAU3: readonly Modele[] = [
  completer(
    'Complète la phrase.',
    ['Humains et chimpanzés ont un ', ' commun : ce sont des ', ' et non père et fils.'],
    [['ancêtre', 'ancetre'], ['cousins']],
    'Pense aux mots de la famille.',
    'Un ancêtre commun fait des deux espèces des cousins.',
  ),
  ecrire(
    'Écris le nom du groupe de mammifères auquel appartiennent les humains, les chimpanzés et les babouins.',
    ['primates', 'les primates', 'primate'],
    [
      ['hominidés', 'Les babouins ne sont pas des hominidés : cherche le groupe plus large.'],
      ['carnivores', 'Les carnivores sont un autre ordre de mammifères.'],
      ['mammifères', 'C’est le groupe encore plus large ; on cherche celui du pouce opposable.'],
    ],
    'Ses membres ont un pouce opposable.',
    'Les humains sont des primates, comme les babouins et les chimpanzés.',
  ),
  choisir(
    'Plusieurs espèces possèdent le même caractère. Comment appelle-t-on ce caractère ?',
    'Un caractère partagé',
    [
      ['Un caractère unique', 'Un caractère unique ne permet pas de relier deux espèces.'],
      ['Un caractère absent', 'On compare ce que les espèces possèdent.'],
    ],
    'Plusieurs espèces le possèdent.',
    'Les caractères partagés servent à établir des degrés de parenté.',
  ),
  completer(
    'Complète la phrase avec ces deux animaux : escargot et crabe.',
    ['Entre ces deux animaux, le plus proche parent de l’araignée est : ', '. Le plus éloigné est : ', '.'],
    [
      ['crabe', 'le crabe'],
      ['escargot', 'l’escargot'],
    ],
    'Un des deux animaux a une coquille.',
    'L’araignée est plus apparentée au crabe qu’à l’escargot.',
  ),
];

const NIVEAU4: readonly Modele[] = [
  choisir(
    'La truite et le requin nagent tous les deux. De qui la truite est-elle la plus proche parente ?',
    'De l’être humain',
    [
      ['Du requin, parce qu’ils vivent dans l’eau', 'Le milieu de vie ne montre pas la parenté.'],
      ['Autant de l’être humain que du requin', 'L’arbre du vivant donne un lien plus proche avec l’un.'],
      ['D’aucun des deux', 'Tous les êtres vivants sont apparentés.'],
      ['Des algues, qui vivent aussi dans l’eau', 'Les algues sont bien plus éloignées.'],
    ],
    'La ressemblance liée au milieu de vie est trompeuse.',
    'La truite est plus apparentée à l’être humain qu’au requin.',
  ),
  choisir(
    'Peut-on dire que l’espèce humaine est « plus évoluée » que les autres et se trouve au sommet du vivant ?',
    'Non, l’arbre du vivant n’a pas de sommet : on y lit qui partage quoi avec qui',
    [
      ['Oui, car elle est la plus récente de toutes', 'L’arbre ne classe pas les espèces selon un niveau.'],
      ['Oui, car elle fabrique des outils', 'Un caractère particulier ne place pas une espèce au sommet.'],
      ['Non, car l’être humain ne fait pas partie du vivant', 'L’être humain est une espèce parmi les êtres vivants.'],
      ['Oui, c’est écrit dans l’arbre du vivant', 'L’idée d’une échelle avec l’humain en haut est reconnue fausse.'],
    ],
    'Un arbre n’est pas une échelle.',
    'La classification en arbre ne place pas l’être humain au-dessus des autres espèces.',
  ),
  associer(
    'Associe chaque être vivant à son plus proche parent dans la liste de droite',
    [
      ['Araignée', 'le crabe'],
      ['Crocodile', 'la mésange'],
      ['Truite', 'l’être humain'],
      ['Champignons', 'les animaux'],
    ],
    'Méfie-toi des ressemblances liées au milieu de vie.',
    'L’arbre du vivant montre des degrés de parenté, qui ne suivent pas toujours l’apparence.',
  ),
  ecrire(
    'Un caractère semblable chez plusieurs espèces actuelles a probablement été transmis par un… (deux mots).',
    [
      'ancêtre commun',
      'un ancêtre commun',
      'ancetre commun',
      'un ancetre commun',
      'ancêtres communs',
      'ancetres communs',
    ],
    [
      ['milieu commun', 'Le milieu ne transmet pas de caractère.'],
      ['descendant commun', 'Les caractères se transmettent des ancêtres vers les descendants.'],
    ],
    'La transmission va du passé vers le présent.',
    'Les caractères partagés sont hérités d’un ancêtre commun.',
  ),
  choisir(
    'Deux animaux se ressemblent beaucoup. Que peut-on en conclure avec certitude ?',
    'Rien de certain : il faut comparer précisément leurs caractères',
    [
      ['Ils sont forcément de très proches parents', 'Les ressemblances globales sont parfois trompeuses.'],
      ['Ils appartiennent à la même espèce', 'Se ressembler ne suffit pas pour former une espèce.'],
      ['L’un descend de l’autre', 'Une ressemblance n’indique pas une descendance.'],
      ['Ils vivent dans le même milieu', 'Les ressemblances ne renseignent pas à coup sûr sur le milieu.'],
    ],
    'Pense au crocodile et au lézard.',
    'La parenté se juge sur des caractères partagés, pas sur l’apparence générale.',
  ),
];

const PROFILS = ['primate', 'mammifere', 'oiseau', 'insecte', 'arachnide'] as const;

/** Le plus proche parent d'un animal : celui qui partage le plus de caractères avec lui. */
const procheParent: Modele = (rng) => {
  const liste = fiches(rng, PROFILS);
  const [p, m, o, i, a] = liste;
  const cas = rng.pick([
    { de: p, bon: m, autres: [o, i, a] },
    { de: m, bon: p, autres: [o, i, a] },
    { de: i, bon: a, autres: [p, m, o] },
  ]);
  const q = qcm(
    rng,
    {
      prompt: `D’après ces seuls caractères, quel est le plus proche parent ${cas.de.nom.replace(/^le /, 'du ')} ?`,
      bonne: Maj(cas.bon.nom),
      fausses: cas.autres.map((x) => [
        Maj(x.nom),
        `Nombre de caractères que cet animal partage avec ${cas.de.nom} : ${communs(cas.de.profil, x.profil).length}. Un autre en partage davantage.`,
      ]),
      indice: 'Compte les caractères que chaque animal partage avec lui.',
      explication: [
        `Caractères que ${cas.bon.nom} partage avec ${cas.de.nom} : ${communs(cas.de.profil, cas.bon.profil).join(' et ')}.`,
        'Plus deux animaux partagent de caractères hérités, plus leur parenté est proche.',
      ],
    },
    60,
  );
  return avecFiches(rng, liste, q);
};

const compterParente: Modele = (rng) => {
  const vertebres = rng.shuffle(['mammifere', 'oiseau', 'vertebre'] as const).slice(0, rng.int(1, 3));
  const liste = fiches(rng, ['primate', 'insecte', 'arachnide', ...vertebres] as const);
  const p = liste[0];
  const n = vertebres.length;
  return avecFiches(
    rng,
    liste,
    compter(
      `Combien d’autres animaux de ces fiches partagent au moins un caractère avec ${p.nom} ?`,
      n,
      [
        [n + 2, 'Les animaux à squelette externe ne partagent aucun de ces caractères avec lui.'],
        [n + 1, 'Ne compte pas l’animal cité lui-même, ni un animal sans caractère commun.'],
      ],
      'Un seul caractère commun suffit pour compter un animal.',
      [
        'Les vertèbres sont partagées avec les autres vertébrés.',
        'On ne compte pas les animaux sans caractère commun.',
      ],
    ),
  );
};

const NIVEAU5: readonly Modele[] = [procheParent, compterParente];

export const parentes: Skill = {
  id: 'v5-parentes',
  title: 'Les liens de parenté',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Tous les êtres vivants ont des liens de **parenté** : ils descendent d’**ancêtres communs**. Un **arbre de parenté** montre qui est le plus proche de qui, grâce aux caractères partagés hérités.',
      'Exemple : humains et chimpanzés, des **primates**, sont cousins : aucun ne descend de l’autre. L’apparence peut tromper : le crocodile est plus proche de la mésange que du lézard.',
    ],
    source: `Programme du cycle 4 (BOEN n° 31 du 30 juillet 2020) : « Relier l’étude des relations de parenté entre les êtres vivants, et l’évolution. » ; Muséum national d’Histoire naturelle.`,
    sources: [
      PROGRAMME,
      ARBRE,
      CLASSER,
      'mnhn-homme-singe',
      'mnhn-tous-parents',
      'mnhn-humain',
      'mnhn-arthropode',
      'cnrtl-primate',
    ],
  },
  generate: generer([NIVEAU1, NIVEAU2, NIVEAU3, NIVEAU4, NIVEAU5]),
};
