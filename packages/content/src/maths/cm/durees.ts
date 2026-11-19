import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { hm } from './outils.ts';

export function buildDurees({ S, C, cm2, id }: Contexte): Chapter {
  // ——— Durées ———

  const convertirDurees = S(
    id('durees'),
    'Heures, minutes' + (cm2 ? ', secondes' : ''),
    cm2
      ? 'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge (instants et durées sont exprimés en heure, minute et seconde)'
      : 'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge (instants et durées sont exprimés en heure et minute)',
    ['1 h = 60 min' + (cm2 ? ' ; 1 min = 60 s.' : '.'), 'Une demi-heure = 30 min ; un quart d’heure = 15 min.'],
    (rng, level) => {
      if (level === 1) {
        const q = rng.pick([
          { p: 'une demi-heure', a: 30 },
          { p: 'un quart d’heure', a: 15 },
          { p: 'trois quarts d’heure', a: 45 },
          { p: '2 heures', a: 120 },
          { p: '1 h 30', a: 90 },
        ]);
        return {
          prompt: `Combien de minutes dans ${q.p} ?`,
          answer: num(q.a, 'min'),
          traps: traps(r(q.a), [[q.a === 30 ? 50 : q.a === 90 ? 130 : q.a + 10, '1 h = 60 min.']]),
          hint: '1 heure = 60 minutes.',
          steps: ['1 h = 60 min.', `${q.p} = **${q.a} min**.`],
          targetSeconds: 12,
        };
      }
      if (cm2 && level === 3) {
        const m = rng.int(2, 9);
        const s = rng.int(5, 55);
        return {
          prompt: `Combien de secondes dans ${m} min ${s} s ?`,
          answer: num(m * 60 + s, 's'),
          traps: traps(r(m * 60 + s), [[m * 100 + s, '1 min = 60 s, pas 100.']]),
          hint: '1 min = 60 s.',
          steps: [`${m} min = ${m * 60} s.`, `${m * 60} + ${s} = **${m * 60 + s} s**.`],
          targetSeconds: 25,
        };
      }
      const start = rng.int(8 * 12, 17 * 12) * 5;
      const dur = rng.int(3, 20) * 5;
      return {
        prompt: `Un film commence à ${hm(start)} et finit à ${hm(start + dur)}. Combien de minutes dure-t-il ?`,
        answer: num(dur, 'min'),
        traps: traps(r(dur), [
          [
            Math.floor((start + dur) / 60) * 100 + ((start + dur) % 60) - (Math.floor(start / 60) * 100 + (start % 60)),
            'Une heure, c’est 60 min : passe par l’heure ronde.',
          ],
        ]),
        hint: 'Compte jusqu’à l’heure ronde, puis le reste.',
        steps: [`De ${hm(start)} à ${hm(start + dur)}.`, `Le film dure **${dur} min**.`],
        targetSeconds: 30,
      };
    },
    { mental: true },
  );

  const horaire = S(
    id('horaire'),
    'Calculer une heure d’arrivée',
    cm2
      ? 'Résoudre des problèmes à une ou plusieurs étapes impliquant des durées'
      : 'Résoudre des problèmes à une ou deux étapes impliquant des durées',
    ['Heure d’arrivée = heure de départ + durée. 9 h 45 + 30 min : 9 h 45 + 15 min = 10 h, + 15 min = 10 h 15.'],
    (rng) => {
      const start = rng.int(8 * 12, 18 * 12) * 5;
      const dur = rng.int(2, 18) * 5;
      const end = start + dur;
      const h = Math.floor(end / 60);
      const m = String(end % 60).padStart(2, '0');
      return {
        prompt: `Le bus part à ${hm(start)}. Le trajet dure ${dur} min. À quelle heure arrive-t-il ? (écris par exemple 10 h 05)`,
        answer: {
          kind: 'text',
          accepted: [`${h} h ${m}`, `${h}h${m}`, `${h} h${m}`, `${h}h ${m}`, `${h}:${m}`, `${h} h ${m} min`],
        },
        traps: [],
        hint: `Ajoute d’abord ce qu’il faut pour arriver à l’heure ronde après ${hm(start)}.`,
        steps: [`${hm(start)} + ${dur} min.`, `Il arrive à **${h} h ${m}**.`],
        targetSeconds: 35,
      };
    },
  );

  const durees = C(
    id('durees'),
    'grandeurs',
    'Heures et durées',
    [convertirDurees, horaire],
    bossOf(
      [
        S(
          id('boss-durees-recette'),
          'Problème : la recette',
          'Résoudre des problèmes à une ou deux étapes impliquant des durées',
          ['Additionne les durées, puis convertis : 75 min = 1 h 15.'],
          (rng) => {
            const a = rng.int(2, 6) * 5;
            const b = rng.int(6, 12) * 5;
            return {
              prompt: `Une recette demande ${a} min de préparation et ${b} min de cuisson. Combien de minutes en tout ?`,
              answer: num(a + b, 'min'),
              traps: traps(r(a + b), [[b - a, 'On additionne les deux durées.']]),
              hint: 'Additionne les deux durées.',
              steps: [`${a} + ${b}.`, `= **${a + b} min**${a + b >= 60 ? ` (${hm(a + b)})` : ''}.`],
              targetSeconds: 25,
            };
          },
        ),
        S(
          id('boss-durees-ecole'),
          'Problème : la journée d’école',
          'Résoudre des problèmes à une ou deux étapes impliquant des durées',
          ['Matin + après-midi : on additionne les durées de chaque partie.'],
          (rng) => {
            const morning = rng.pick([180, 165, 195]);
            const afternoon = rng.pick([150, 165, 180]);
            return {
              prompt: `Le matin dure ${hm(morning)} et l’après-midi ${hm(afternoon)}. Combien de minutes de classe par jour ?`,
              answer: num(morning + afternoon, 'min'),
              traps: traps(r(morning + afternoon), [
                [morning + afternoon - 60, 'Convertis bien chaque durée en minutes.'],
              ]),
              hint: 'Convertis chaque durée en minutes, puis additionne.',
              steps: [
                `${hm(morning)} = ${morning} min ; ${hm(afternoon)} = ${afternoon} min.`,
                `= **${morning + afternoon} min**.`,
              ],
              targetSeconds: 45,
            };
          },
        ),
      ],
      [
        S(
          id('boss-durees-piege'),
          'Piège : 1 h 50 ou 1 h 30 ?',
          'Comparer et mesurer des durées écoulées entre deux instants affichés sur une horloge',
          ['1,5 h = 1 h 30 (une demi-heure = 30 min), pas 1 h 50.'],
          (rng) => {
            const h = rng.int(1, 3);
            return {
              prompt: `Combien de minutes dans ${h} heure${h > 1 ? 's' : ''} et demie ?`,
              answer: num(h * 60 + 30, 'min'),
              traps: traps(r(h * 60 + 30), [[h * 60 + 50, 'Une demi-heure = 30 min.']]),
              hint: 'Une demi-heure, c’est la moitié de 60 min.',
              steps: [`${h} h = ${h * 60} min, une demi-heure = 30 min.`, `= **${h * 60 + 30} min**.`],
              targetSeconds: 20,
            };
          },
        ),
      ],
    ),
  );

  return durees;
}
