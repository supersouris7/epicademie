import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';

export function buildProportionnalite({ S, C, id }: Contexte): Chapter {
  // ——— Proportionnalité ———

  const identifier = S(
    id('propor-identifier'),
    'Est-ce proportionnel ?',
    'Identifier une situation de proportionnalité',
    ['Deux grandeurs sont proportionnelles si « 2 fois plus de l’une » donne toujours « 2 fois plus de l’autre ».'],
    (rng) => {
      const q = rng.pick([
        { s: 'le prix payé et le nombre de baguettes (même prix pour chaque baguette)', yes: true },
        { s: 'l’âge d’un enfant et sa taille', yes: false },
        { s: 'le nombre de tours de piste et la distance parcourue', yes: true },
        { s: 'le nombre de joueurs d’une équipe et le nombre de buts marqués', yes: false },
      ]);
      return {
        prompt: `Ces deux grandeurs sont-elles proportionnelles : ${q.s} ?`,
        ...choice(
          rng,
          q.yes ? 'Oui' : 'Non',
          [
            {
              label: q.yes ? 'Non' : 'Oui',
              why: q.yes
                ? 'Si on double l’une, l’autre double aussi.'
                : 'Doubler l’une ne double pas forcément l’autre.',
            },
          ],
          true,
        ),
        hint: 'Si on double la première, la seconde double-t-elle forcément ?',
        steps: [
          q.yes
            ? 'Si on double la première, la seconde double aussi.'
            : 'Doubler la première ne double pas forcément la seconde.',
          `**${q.yes ? 'Oui' : 'Non'}**.`,
        ],
        targetSeconds: 20,
      };
    },
  );

  const foisPlus = S(
    id('propor-fois-plus'),
    'Fois plus, fois moins',
    'Savoir résoudre un problème de proportionnalité',
    ['« 4 pains coûtent 7 € ; 12 pains, c’est 3 fois plus de pains, donc 3 fois plus cher : 21 €. »'],
    (rng) => {
      const a = rng.int(2, 5);
      const k = rng.int(2, 5);
      const p = rng.int(3, 12);
      const item = rng.pick(['pains aux raisins', 'bouteilles de jus', 'cahiers', 'tickets de bus']);
      return {
        prompt: `${a} ${item} coûtent ${p} €. Combien coûtent ${a * k} ${item} ?`,
        answer: num(p * k, '€'),
        traps: traps(r(p * k), [[p + (a * k - a), `Il y a ${k} fois plus de ${item}, donc on paie ${k} fois plus.`]]),
        hint: `${a * k}, c’est combien de fois ${a} ?`,
        steps: [
          `${a * k} = ${k} × ${a} : ${k} fois plus de ${item}.`,
          `Donc ${k} fois plus cher : ${k} × ${p} = **${p * k} €**.`,
        ],
        targetSeconds: 25,
      };
    },
  );

  const additivite = S(
    id('propor-additivite'),
    'Proportionnalité en additionnant',
    'Savoir résoudre un problème de proportionnalité',
    ['Si 3 kg coûtent 6 € et 2 kg coûtent 4 €, alors 5 kg (3 + 2) coûtent 6 + 4 = 10 €.'],
    (rng) => {
      const u = rng.int(2, 6);
      const a = rng.int(2, 5);
      let b = rng.int(2, 5);
      if (a === b) b++;
      return {
        prompt: `${a} kg de cerises coûtent ${a * u} € et ${b} kg coûtent ${b * u} €. Combien coûtent ${a + b} kg ?`,
        answer: num((a + b) * u, '€'),
        traps: traps(r((a + b) * u), [
          [a * u * b * u, 'On additionne : ' + String(a + b) + ' kg = ' + String(a) + ' kg + ' + String(b) + ' kg.'],
        ]),
        hint: `${a + b} kg = ${a} kg + ${b} kg.`,
        steps: [`${a + b} kg = ${a} kg + ${b} kg.`, `${a * u} + ${b * u} = **${(a + b) * u} €**.`],
        targetSeconds: 25,
      };
    },
  );

  const proportionnalite = C(
    id('proportionnalite'),
    'fonctions',
    'Proportionnalité',
    [identifier, foisPlus, additivite],
    bossOf(
      [
        S(
          id('boss-propor-crepes'),
          'Problème : les crêpes',
          'Savoir résoudre un problème de proportionnalité',
          ['Pour 2 fois plus de crêpes, il faut 2 fois plus de chaque ingrédient.'],
          (rng) => {
            const eggs = rng.int(2, 4);
            const k = rng.int(2, 4);
            return {
              prompt: `Pour 10 crêpes, il faut ${eggs} œufs. Combien d’œufs pour ${10 * k} crêpes ?`,
              answer: num(eggs * k),
              traps: traps(r(eggs * k), [
                [eggs + 10 * (k - 1), 'On ne fait pas une addition : c’est ' + String(k) + ' fois plus de crêpes.'],
              ]),
              hint: `${10 * k} crêpes, c’est combien de fois 10 crêpes ?`,
              steps: [`${10 * k} = ${k} × 10.`, `${k} × ${eggs} = **${eggs * k}** œufs.`],
              targetSeconds: 30,
            };
          },
        ),
        S(
          id('boss-propor-essence'),
          'Problème : le jardinier',
          'Savoir résoudre un problème de proportionnalité',
          ['Si 4 rangées demandent 20 plants, 2 rangées (la moitié) en demandent 10.'],
          (rng) => {
            const plants = rng.int(3, 9);
            const rows = rng.pick([4, 6, 8]);
            return {
              prompt: `Pour ${rows} rangées, le jardinier plante ${plants * rows} salades. Combien pour ${rows / 2} rangées ?`,
              answer: num((plants * rows) / 2),
              traps: traps(r((plants * rows) / 2), [
                [plants * rows - rows / 2, 'C’est 2 fois moins de rangées : 2 fois moins de salades.'],
              ]),
              hint: `${rows / 2}, c’est la moitié de ${rows}.`,
              steps: [
                `${rows / 2} rangées = la moitié de ${rows}.`,
                `${plants * rows} ÷ 2 = **${(plants * rows) / 2}** salades.`,
              ],
              targetSeconds: 30,
            };
          },
        ),
      ],
      [
        S(
          id('boss-propor-piege'),
          'Piège : tout n’est pas proportionnel',
          'Identifier une situation de proportionnalité',
          ['À 10 ans, on ne mesure pas 2 fois plus qu’à 5 ans !'],
          (rng) => {
            const h = rng.int(105, 115);
            return {
              prompt: `À 5 ans, Noah mesurait ${h} cm. Mesurera-t-il ${2 * h} cm à 10 ans ?`,
              ...choice(rng, 'Non', [{ label: 'Oui', why: 'La taille n’est pas proportionnelle à l’âge.' }], true),
              hint: 'La taille double-t-elle quand l’âge double ?',
              steps: [
                `${2 * h} cm, ce serait plus de 2 m à 10 ans !`,
                '**Non** : la taille n’est pas proportionnelle à l’âge.',
              ],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  return proportionnalite;
}
