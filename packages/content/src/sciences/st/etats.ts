import { choice } from '../../build.ts';
import type { Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { maj, saisie } from './outils.ts';

// ——— États solide, liquide, gazeux (programme du cycle 3, « Propriétés de la matière ») ———

type Etat = 'solide' | 'liquide' | 'gazeux';
const ETATS: readonly Etat[] = ['solide', 'liquide', 'gazeux'];

/** Exemples du quotidien (illustrations, pas des faits du programme). */
const EXEMPLES: Record<Etat, readonly string[]> = {
  solide: ['un caillou', 'une pièce de monnaie', 'une règle en bois', 'un livre', 'un crayon'],
  liquide: ['l’eau du robinet', 'le lait', 'l’huile de cuisine', 'le jus d’orange', 'le sirop'],
  gazeux: ['l’air d’un pneu', 'l’air d’un ballon gonflé', 'l’hélium d’un ballon de fête', 'le gaz d’une gazinière'],
};

/** Cas qui trompent : le sable coule, mais chaque grain est un solide… */
const PIEGES: readonly { item: string; etat: Etat; why: string }[] = [
  {
    item: 'le sable',
    etat: 'solide',
    why: 'Le sable coule, mais chaque grain garde sa forme et son volume : chaque grain est un solide.',
  },
  {
    item: 'la farine',
    etat: 'solide',
    why: 'La farine s’écoule comme un liquide, mais ses grains minuscules sont des solides.',
  },
  {
    item: 'le sel fin',
    etat: 'solide',
    why: 'Le sel fin coule, mais chaque petit cristal garde sa forme : c’est un solide.',
  },
  { item: 'le sucre en poudre', etat: 'solide', why: 'Le sucre en poudre se verse, mais ses grains sont des solides.' },
  {
    item: 'le miel',
    etat: 'liquide',
    why: 'Le miel coule lentement, mais il prend la forme de son pot : c’est un liquide.',
  },
  {
    item: 'l’air autour de toi',
    etat: 'gazeux',
    why: 'On ne voit pas l’air, mais il remplit toute la pièce : c’est un gaz.',
  },
  { item: 'les bulles d’une boisson pétillante', etat: 'gazeux', why: 'Les bulles sont remplies de gaz.' },
];

/** Ce que fait le corps (sujet à ajouter devant : « ça », « un corps »…). */
const PROP: Record<Etat, string> = {
  solide: 'garde sa forme et son volume',
  liquide: 'garde son volume, mais prend la forme de son récipient',
  gazeux: 'n’a ni forme propre ni volume propre et remplit tout l’espace disponible',
};

/** Pourquoi la proposition `choisi` ne convient pas quand l'état exact est `vrai`. */
const POURQUOI: Record<Etat, Record<Etat, string>> = {
  solide: {
    solide: '',
    liquide: 'Un liquide coule et prend la forme de son récipient. Un solide, lui, garde sa forme.',
    gazeux: 'Un gaz remplit tout le récipient. Un solide garde sa forme et son volume.',
  },
  liquide: {
    solide: 'Un solide garde sa forme. Un liquide coule et prend la forme de son récipient.',
    liquide: '',
    gazeux: 'Un gaz remplit tout le récipient. Un liquide garde son volume : 1 L d’eau reste 1 L.',
  },
  gazeux: {
    solide: 'Un solide garde sa forme. Un gaz s’étale partout.',
    liquide: 'Un liquide garde son volume. Un gaz remplit tout l’espace qu’on lui laisse.',
    gazeux: '',
  },
};

const PHRASE: Record<Etat | 'faux', string> = {
  solide: 'Il a une forme propre et un volume propre',
  liquide: 'Il a un volume propre, mais pas de forme propre',
  gazeux: 'Il n’a ni forme propre ni volume propre',
  faux: 'Il a une forme propre, mais pas de volume propre',
};

const etatDe = (e: Etat) => (e === 'gazeux' ? ['gazeux', 'gaz'] : [e]);

export const etats: Skill = {
  id: 'pcm1-etats',
  title: 'Solide, liquide ou gaz ?',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Un **solide** garde sa forme et son volume. Un **liquide** garde son volume, mais prend la forme de son récipient (l’eau dans un verre).',
      'Un **gaz** n’a ni forme ni volume propres : il remplit tout l’espace (l’air dans un ballon). Ce sont les trois **états physiques** de la matière.',
    ],
    source: `${PROGRAMME} : « Différencier les états physiques solide (forme et volume propres), liquide (volume propre et absence de forme propre) et gazeux (ni forme propre ni volume propre). »`,
    sources: [PROGRAMME],
  },
  generate: (rng, level) => {
    const vrai = rng.pick(ETATS);
    const item = rng.pick(EXEMPLES[vrai]);
    if (level === 1) {
      const { answer, traps } = choice(
        rng,
        vrai,
        ETATS.filter((e) => e !== vrai).map((e) => ({ label: e, why: POURQUOI[vrai][e] })),
      );
      return {
        prompt: `Quel est l’état physique, dans une pièce normale, de « ${item} » ?`,
        answer,
        traps,
        hint: 'Demande-toi : est-ce que ça garde sa forme ? Est-ce que ça garde son volume ?',
        steps: [
          'On teste deux choses : la forme et le volume.',
          `${maj(item)} : ça ${PROP[vrai]}.`,
          `État physique : **${vrai}**.`,
        ],
        targetSeconds: 15,
      };
    }
    if (level === 2) {
      const bonne = PHRASE[vrai];
      const { answer, traps } = choice(rng, bonne, [
        ...ETATS.filter((e) => e !== vrai).map((e) => ({
          label: PHRASE[e],
          why: `Cette phrase décrit ${e === 'solide' ? 'un solide' : e === 'liquide' ? 'un liquide' : 'un gaz'}, pas « ${item} ».`,
        })),
        {
          label: PHRASE.faux,
          why: 'Si un corps garde sa forme, il garde aussi son volume : c’est un solide. Cette phrase ne décrit aucun des trois états.',
        },
      ]);
      return {
        prompt: `Quelle phrase décrit « ${item} » ?`,
        answer,
        traps,
        hint: 'Pense à ce qui se passe quand tu le changes de récipient.',
        steps: [
          'Pour chaque état, on regarde la forme puis le volume.',
          `${maj(item)} : ça ${PROP[vrai]}.`,
          `Bonne phrase : **${bonne}**.`,
        ],
        targetSeconds: 20,
      };
    }
    if (level === 3) {
      const { answer, traps } = saisie(
        etatDe(vrai),
        ETATS.filter((e) => e !== vrai).map((e) => [e, POURQUOI[vrai][e]] as const),
      );
      return {
        prompt: `Écris l’état physique de « ${item} » : solide, liquide ou gazeux ?`,
        answer,
        traps,
        hint: 'Garde-t-il sa forme quand tu le changes de récipient ?',
        steps: [
          'Un solide garde sa forme, un liquide prend celle de son récipient, un gaz remplit tout.',
          `${maj(item)} : ça ${PROP[vrai]}.`,
          `État physique : **${vrai}**.`,
        ],
        targetSeconds: 25,
      };
    }
    if (level === 4) {
      if (rng.int(0, 1) === 0) {
        const p = rng.pick(PIEGES);
        const { answer, traps } = saisie(
          etatDe(p.etat),
          ETATS.filter((e) => e !== p.etat).map((e) => [e, p.why] as const),
        );
        return {
          prompt: `Attention, piège ! Écris l’état physique de « ${p.item} ».`,
          answer,
          traps,
          hint: 'Regarde ce qui compose la matière : un grain, une goutte, un gaz qui s’étale ?',
          steps: [
            'Ça peut ressembler à un autre état : on regarde chaque petit morceau.',
            p.why,
            `État physique : **${p.etat}**.`,
          ],
          targetSeconds: 30,
        };
      }
      const { answer, traps } = saisie(
        etatDe(vrai),
        ETATS.filter((e) => e !== vrai).map(
          (e) => [e, `C’est la description d’un ${e === 'gazeux' ? 'gaz' : e}, pas de celui-ci.`] as const,
        ),
      );
      return {
        prompt: `Un corps ${PROP[vrai]}. Écris son état physique.`,
        answer,
        traps,
        hint: 'Retrouve l’état qui a exactement cette description.',
        steps: [
          'On lit les deux informations : la forme, puis le volume.',
          `« ${maj(PROP[vrai])} » : cela correspond à un seul état.`,
          `État physique : **${vrai}**.`,
        ],
        targetSeconds: 30,
      };
    }
    // Niveau 5 : lire des observations et conclure.
    const OBS: Record<Etat, readonly string[]> = {
      solide: [
        'On place le corps dans une boîte, puis dans une autre boîte plus grande.',
        'Sa forme ne change pas.',
        'Son volume ne change pas non plus.',
      ],
      liquide: [
        'On place le corps dans une boîte, puis dans une autre boîte plus grande.',
        'Il prend la forme de chaque boîte.',
        'Son volume reste le même.',
      ],
      gazeux: [
        'On place le corps dans une boîte, puis dans une autre boîte plus grande.',
        'Il se répand dans toute la boîte.',
        'Son volume change : il occupe toute la place disponible.',
      ],
    };
    const inconnu = 'On ne peut pas savoir avec ces observations';
    const { answer, traps } = choice(rng, vrai, [
      ...ETATS.filter((e) => e !== vrai).map((e) => ({ label: e, why: POURQUOI[vrai][e] })),
      { label: inconnu, why: 'Si : la forme et le volume suffisent pour reconnaître l’état.' },
    ]);
    return {
      prompt: 'Lis les observations. Dans quel état physique est le corps mystère ?',
      figure: { kind: 'document', title: 'Observations du corps mystère', lines: OBS[vrai] },
      answer,
      traps,
      hint: 'Compare ce qui change et ce qui ne change pas : la forme, puis le volume.',
      steps: [
        'On repère ce qui change (la forme ? le volume ?) quand on change de boîte.',
        `Ici, le corps ${PROP[vrai]}.`,
        `Le corps mystère est **${vrai}**.`,
      ],
      targetSeconds: 40,
    };
  },
};
