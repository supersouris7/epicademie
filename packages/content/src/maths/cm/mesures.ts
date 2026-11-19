import { choice, num, traps } from '../../build.ts';
import { fmt, mul, r, type Rational } from '../../rational.ts';
import type { Chapter } from '../../types.ts';
import { big, bossOf } from '../kit.ts';
import type { Contexte } from './contexte.ts';
import { exactDecimal } from './outils.ts';

export function buildMesures({ S, C, id }: Contexte): Chapter {
  // ——— Grandeurs : longueurs, masses, contenances ———

  const LEN = ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'];
  const MASS = ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'];
  const CAP = ['hL', 'daL', 'L', 'dL', 'cL', 'mL'];
  const convert = (x: Rational, from: number, to: number) =>
    to >= from ? mul(x, r(10 ** (to - from))) : mul(x, r(1, 10 ** (from - to)));

  const conversion = (
    key: string,
    title: string,
    objective: string,
    units: string[],
    table: 'longueur' | 'masse' | 'volume',
    memo: string,
  ) =>
    S(
      id(key),
      title,
      objective,
      [memo, 'D’une unité à la suivante, on multiplie ou on divise par **10**.'],
      (rng, level) => {
        const from = rng.int(0, units.length - 1);
        let to = rng.int(
          Math.max(0, from - (level === 1 ? 1 : 3)),
          Math.min(units.length - 1, from + (level === 1 ? 1 : 3)),
        );
        if (to === from) to = from < units.length - 1 ? from + 1 : from - 1;
        const x = level === 3 ? exactDecimal(rng, 1, 99, 1) : r(rng.int(2, 99));
        const res = convert(x, from, to);
        const uf = units[from] ?? '';
        const ut = units[to] ?? '';
        return {
          prompt: `Complète : ${fmt(x)} ${uf} = … ${ut}`,
          answer: num(res, ut),
          traps: traps(res, [
            [
              convert(x, to, from),
              `${ut} est une unité plus ${to > from ? 'petite' : 'grande'} : le nombre doit devenir plus ${to > from ? 'grand' : 'petit'}.`,
            ],
          ]),
          hint: `Place le chiffre des unités de ${fmt(x)} sous ${uf} dans le tableau, puis lis jusqu’à ${ut}.`,
          demo: { kind: 'conversion', table, value: x, from: uf, to: ut },
          steps: [
            `De ${uf} à ${ut} : ${Math.abs(to - from)} rang${Math.abs(to - from) > 1 ? 's' : ''}, on ${to > from ? 'multiplie' : 'divise'} par ${big(10 ** Math.abs(to - from))}.`,
            `${fmt(x)} ${uf} = **${fmt(res)} ${ut}**.`,
          ],
          targetSeconds: 25,
        };
      },
      {
        tools: [
          table === 'longueur' ? 'conversion-longueur' : table === 'masse' ? 'conversion-masse' : 'conversion-volume',
        ],
      },
    );

  const longueurs = conversion(
    'conversions-longueur',
    'Convertir des longueurs',
    'Connaître les relations entre les unités de longueur',
    LEN,
    'longueur',
    '1 km = 1 000 m ; 1 m = 100 cm ; 1 cm = 10 mm.',
  );
  const masses = conversion(
    'conversions-masse',
    'Convertir des masses',
    'Connaître les relations entre les unités de masse',
    MASS,
    'masse',
    '1 kg = 1 000 g ; 1 g = 1 000 mg. (Et 1 tonne = 1 000 kg.)',
  );
  const contenances = conversion(
    'conversions-contenance',
    'Convertir des contenances',
    'Connaître les relations entre les unités de contenance',
    CAP,
    'volume',
    '1 L = 10 dL = 100 cL = 1 000 mL ; 1 hL = 100 L.',
  );

  const uniteAdaptee = S(
    id('unite-adaptee'),
    'Choisir l’unité adaptée',
    'Choisir une unité adaptée pour exprimer une longueur',
    [
      'Une fourmi : quelques mm. Une porte : environ 2 m. Une ville à l’autre : des km. Un œuf : environ 60 g. Une voiture : environ 1 tonne.',
    ],
    (rng) => {
      const q = rng.pick([
        { p: 'la longueur d’une fourmi', a: 'mm', w: ['m', 'km'] },
        { p: 'la distance entre deux villes', a: 'km', w: ['m', 'cm'] },
        { p: 'la hauteur d’une porte', a: 'm', w: ['km', 'mm'] },
        { p: 'la masse d’un œuf', a: 'g', w: ['kg', 't'] },
        { p: 'la masse d’un camion', a: 't', w: ['g', 'kg'] },
        { p: 'la contenance d’une cuillère', a: 'mL', w: ['L', 'hL'] },
        { p: 'la contenance d’une baignoire', a: 'L', w: ['mL', 'cL'] },
      ]);
      return {
        prompt: `Quelle unité choisir pour mesurer ${q.p} ?`,
        ...choice(
          rng,
          q.a,
          q.w.map((w) => ({ label: w, why: 'Imagine la mesure : le nombre serait-il raisonnable ?' })),
        ),
        hint: 'Imagine l’objet : est-il tout petit, moyen, ou très grand ?',
        steps: [`Pour ${q.p}, un nombre raisonnable s’écrit en ${q.a}.`, `L’unité adaptée est **${q.a}**.`],
        targetSeconds: 15,
      };
    },
  );

  const mesures = C(
    id('mesures'),
    'grandeurs',
    'Longueurs, masses, contenances',
    [longueurs, masses, contenances, uniteAdaptee],
    bossOf(
      [
        S(
          id('boss-mesures-randonnee'),
          'Problème : la randonnée',
          'Connaître les relations entre les unités de longueur',
          ['Pour additionner des longueurs, mets-les dans la même unité : 2 km 300 m = 2 300 m.'],
          (rng) => {
            const a = rng.int(1, 5);
            const b = rng.int(100, 900);
            return {
              prompt: `Le matin, on marche ${a} km ; l’après-midi, ${b} m. Combien de mètres en tout ?`,
              answer: num(a * 1000 + b, 'm'),
              traps: traps(r(a * 1000 + b), [[a + b, `${a} km = ${a * 1000} m : convertis d’abord.`]]),
              hint: '1 km = 1 000 m.',
              steps: [`${a} km = ${big(a * 1000)} m.`, `${big(a * 1000)} + ${b} = **${big(a * 1000 + b)} m**.`],
              targetSeconds: 40,
            };
          },
          { tools: ['conversion-longueur'] },
        ),
        S(
          id('boss-mesures-confiture'),
          'Problème : la confiture',
          'Connaître les relations entre les unités de masse',
          ['1 kg = 1 000 g : 3 pots de 250 g font 750 g.'],
          (rng) => {
            const pot = rng.pick([125, 250, 500]);
            const n = rng.int(2, 8);
            return {
              prompt: `On remplit ${n} pots de ${pot} g de confiture. Combien de grammes de confiture faut-il ?`,
              answer: num(n * pot, 'g'),
              traps: traps(r(n * pot), [[n + pot, 'C’est une multiplication.']]),
              hint: `${n} fois ${pot} g.`,
              steps: [`${n} × ${pot}.`, `= **${big(n * pot)} g**.`],
              targetSeconds: 30,
            };
          },
        ),
      ],
      [
        S(
          id('boss-mesures-piege'),
          'Piège : 1 L = 100 cL',
          'Connaître les relations entre les unités de contenance',
          ['1 L = 100 cL (et pas 10) : une canette de 33 cL fait 0,33 L.'],
          (rng) => {
            const cl = rng.int(15, 95);
            return {
              prompt: `Une bouteille contient ${cl} cL. Combien de litres ?`,
              answer: num(r(cl, 100), 'L'),
              traps: traps(r(cl, 100), [[r(cl, 10), '1 L = 100 cL, pas 10.']]),
              hint: '1 L = 100 cL.',
              demo: { kind: 'conversion', table: 'volume', value: r(cl), from: 'cL', to: 'L' },
              steps: [`${cl} cL = ${cl} ÷ 100 L.`, `= **${fmt(r(cl, 100))} L**.`],
              targetSeconds: 20,
            };
          },
          { tools: ['conversion-volume'] },
        ),
      ],
    ),
  );

  return mesures;
}
