import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildProbabilites({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Probabilités ———

  const issues = S(
    id('issues'),
    'Les issues possibles',
    'Identifier toutes les issues possibles lors d’une expérience aléatoire simple',
    ['Un dé à 6 faces : 6 issues possibles (1, 2, 3, 4, 5, 6). Une pièce : 2 issues (pile, face).'],
    (rng) => {
      const q = rng.pick([
        { p: 'Combien d’issues possibles quand on lance un dé à 6 faces ?', a: 6, w: 1 },
        { p: 'Combien d’issues possibles quand on lance une pièce ?', a: 2, w: 1 },
        {
          p: 'On tire une carte parmi les 4 couleurs (cœur, carreau, trèfle, pique). Combien d’issues pour la couleur ?',
          a: 4,
          w: 2,
        },
        { p: 'Une roue a 8 secteurs numérotés de 1 à 8. Combien d’issues possibles ?', a: 8, w: 4 },
      ]);
      return {
        prompt: q.p,
        answer: num(q.a),
        traps: traps(r(q.a), [[q.w, 'Compte tous les résultats possibles.']]),
        hint: 'Liste tous les résultats possibles.',
        steps: ['On liste tous les résultats possibles.', `Il y en a **${q.a}**.`],
        targetSeconds: 15,
      };
    },
  );

  const chances = S(
    id('chances'),
    cm2 ? 'a chances sur b' : 'Certain, possible, impossible',
    cm2
      ? 'Dans une situation d’équiprobabilité, lors d’une expérience aléatoire simple, exprimer la probabilité d’un évènement sous la forme « a chances sur b »'
      : 'Comparer des issues d’expériences aléatoires ou des évènements selon leur probabilité de réalisation',
    [
      cm2
        ? 'Obtenir un nombre pair avec un dé : 3 chances sur 6 (2, 4 ou 6).'
        : '« Obtenir 7 avec un dé » est **impossible**. « Obtenir un nombre de 1 à 6 » est **certain**.',
      'Ce n’est pas parce qu’il y a deux issues qu’elles ont chacune une chance sur deux !',
    ],
    (rng) => {
      if (cm2) {
        const q = rng.pick([
          { p: 'un nombre pair avec un dé à 6 faces', a: 3, b: 6 },
          { p: 'un 6 avec un dé à 6 faces', a: 1, b: 6 },
          { p: 'un nombre plus grand que 4 avec un dé à 6 faces', a: 2, b: 6 },
          { p: 'une boule rouge dans un sac de 3 rouges et 5 bleues', a: 3, b: 8 },
        ]);
        return {
          prompt: `Combien de chances sur ${q.b} d’obtenir ${q.p} ?`,
          answer: num(q.a),
          traps: traps(r(q.a), [[q.b - q.a, 'Compte les issues **favorables**.']]),
          hint: 'Compte les issues qui conviennent.',
          steps: [`Issues favorables : ${q.a} sur ${q.b}.`, `**${q.a}** chances sur ${q.b}.`],
          targetSeconds: 20,
        };
      }
      const q = rng.pick([
        { p: 'obtenir 7 en lançant un dé à 6 faces', a: 'Impossible' },
        { p: 'obtenir un nombre entre 1 et 6 en lançant un dé à 6 faces', a: 'Certain' },
        { p: 'obtenir 3 en lançant un dé à 6 faces', a: 'Possible' },
        { p: 'tirer une boule bleue d’un sac qui ne contient que des boules rouges', a: 'Impossible' },
      ]);
      return {
        prompt: `Cet évènement est-il certain, possible ou impossible : ${q.p} ?`,
        ...choice(
          rng,
          q.a,
          ['Certain', 'Possible', 'Impossible']
            .filter((x) => x !== q.a)
            .map((x) => ({ label: x, why: 'Certain : ça arrive à coup sûr ; impossible : jamais.' })),
          true,
        ),
        hint: 'Est-ce que ça peut arriver ? À coup sûr ?',
        steps: [`${q.p.charAt(0).toUpperCase() + q.p.slice(1)}.`, `C’est **${q.a.toLowerCase()}**.`],
        targetSeconds: 15,
      };
    },
  );

  const comparerChances = S(
    id('comparer-chances'),
    'Comparer des chances',
    cm2
      ? 'Comparer des probabilités dans des cas simples'
      : 'Comprendre que ce n’est pas parce qu’il y a deux issues possibles que chacune a une chance sur deux de se réaliser',
    ['Plus il y a de boules d’une couleur, plus on a de chances de la tirer.'],
    (rng) => {
      const red = rng.int(1, 9);
      let blue = rng.int(1, 9);
      if (blue === red) blue++;
      const best = red > blue ? 'Rouge' : 'Bleue';
      return {
        prompt: `Un sac contient ${red} boules rouges et ${blue} boules bleues. Quelle couleur a le plus de chances d’être tirée ?`,
        ...choice(rng, best, [
          {
            label: best === 'Rouge' ? 'Bleue' : 'Rouge',
            why: 'La couleur qui a le plus de boules a le plus de chances.',
          },
          { label: 'Autant de chances', why: 'Il n’y a pas le même nombre de boules de chaque couleur.' },
        ]),
        hint: 'Quelle couleur a le plus de boules ?',
        steps: [`${red} rouges contre ${blue} bleues.`, `**${best}**.`],
        targetSeconds: 15,
      };
    },
  );

  const probabilites = C(
    id('probabilites'),
    'donnees',
    'Le hasard et les chances',
    [issues, chances, comparerChances],
    bossOf(
      [
        S(
          id('boss-probas-roue'),
          'Problème : la roue de la kermesse',
          'Comparer des issues d’expériences aléatoires ou des évènements selon leur probabilité de réalisation',
          ['Une roue de 10 secteurs égaux dont 3 gagnants : 3 chances sur 10.'],
          (rng) => {
            const n = rng.pick([6, 8, 10]);
            const win = rng.int(1, n - 1);
            return {
              prompt: `Une roue a ${n} secteurs égaux, dont ${win} gagnant${win > 1 ? 's' : ''}. Combien de chances sur ${n} de gagner ?`,
              answer: num(win),
              traps: traps(r(win), [[n - win, 'Ça, ce sont les chances de **perdre**.']]),
              hint: 'Compte les secteurs gagnants.',
              steps: [
                `${win} secteur${win > 1 ? 's' : ''} gagnant${win > 1 ? 's' : ''} sur ${n}.`,
                `**${win}** chances sur ${n}.`,
              ],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-probas-billes'),
          'Problème : quel sac ?',
          'Comparer des issues d’expériences aléatoires ou des évènements selon leur probabilité de réalisation',
          ['Pour comparer deux sacs, regarde la part de boules gagnantes.'],
          (rng) => {
            const a = rng.int(1, 3);
            return {
              prompt: `Sac A : ${a} boule${a > 1 ? 's' : ''} rouge${a > 1 ? 's' : ''} et ${a * 3} noires. Sac B : ${a} boule${a > 1 ? 's' : ''} rouge${a > 1 ? 's' : ''} et ${a} noire${a > 1 ? 's' : ''}. On gagne en tirant une rouge. Quel sac choisir ?`,
              ...choice(rng, 'Le sac B', [
                { label: 'Le sac A', why: 'Le sac A a beaucoup plus de boules noires.' },
                { label: 'C’est pareil', why: 'Même nombre de rouges, mais pas le même nombre de noires.' },
              ]),
              hint: 'Dans quel sac les rouges sont-elles le moins « noyées » ?',
              steps: [
                `Sac A : ${a} chance${a > 1 ? 's' : ''} sur ${4 * a}. Sac B : ${a} sur ${2 * a}.`,
                'On choisit **le sac B**.',
              ],
              targetSeconds: 40,
            };
          },
        ),
      ],
      [
        S(
          id('boss-probas-piege'),
          'Piège : deux issues, une chance sur deux ?',
          'Comprendre que ce n’est pas parce qu’il y a deux issues possibles que chacune a une chance sur deux de se réaliser',
          ['Gagner ou perdre au loto : deux issues, mais pas du tout une chance sur deux !'],
          (rng) => ({
            prompt:
              'Une roue a 1 secteur gagnant et 9 perdants (tous égaux). Il y a deux issues : gagner ou perdre. A-t-on une chance sur deux de gagner ?',
            ...choice(rng, 'Non', [{ label: 'Oui', why: '1 secteur sur 10 seulement est gagnant.' }], true),
            hint: 'Compte les secteurs.',
            steps: ['1 secteur gagnant sur 10.', '**Non** : 1 chance sur 10.'],
            targetSeconds: 20,
          }),
        ),
      ],
    ),
  );

  return probabilites;
}
