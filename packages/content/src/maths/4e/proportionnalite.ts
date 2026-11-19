import { choice, distinct, num, traps } from '../../build.ts';
import { fmt, mul, r } from '../../rational.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C } from './commun.ts';

// ——— Proportionnalité ———

const quatriemeProportionnelle = S(
  'm4-quatrieme-proportionnelle',
  'Quatrième proportionnelle',
  'Déterminer une quatrième proportionnelle',
  ['Si 3 kg coûtent 7,50 €, 5 kg coûtent 7,50 × 5 ÷ 3 = 12,50 € (produit en croix ou retour à l’unité).'],
  (rng) => {
    const a = rng.int(2, 9);
    let b = rng.int(2, 15);
    if (b === a) b++;
    const u = r(rng.int(5, 40), rng.pick([1, 2, 4, 5, 10]));
    const ya = mul(u, r(a));
    const yb = mul(u, r(b));
    return {
      prompt: `Le prix est proportionnel à la masse. ${a} kg coûtent ${fmt(ya)} €. Combien coûtent ${b} kg ?`,
      answer: num(yb, '€'),
      traps: traps(yb, [[mul(ya, r(a, b)), 'Attention à l’ordre : prix × nouvelle masse ÷ ancienne masse.']]),
      hint: `Calcule d’abord le prix d’un seul kilo : ${fmt(ya)} ÷ ${a}.`,
      steps: [`Prix d’un kg : ${fmt(ya)} ÷ ${a} = ${fmt(u)} €.`, `${b} kg : ${b} × ${fmt(u)} = **${fmt(yb)} €**.`],
      targetSeconds: 40,
    };
  },
  { advice: 'calculatrice' },
);

const coefficientMultiplicateur = S(
  'm4-coefficient-multiplicateur',
  'Augmentation, diminution en pourcentage',
  'Rendre compte d’une augmentation ou une diminution exprimée en pourcentages au moyen d’un coefficient multiplicateur',
  [
    'Augmenter de t % : multiplier par **1 + t/100** (+20 % → × 1,2). Diminuer de t % : multiplier par **1 − t/100** (−20 % → × 0,8).',
  ],
  (rng, level) => {
    const t = rng.pick([5, 10, 15, 20, 25, 30, 40, 50]);
    const up = rng.int(0, 1) === 1;
    const k = r(100 + (up ? t : -t), 100);
    if (level === 1) {
      return {
        prompt: `${up ? 'Augmenter' : 'Diminuer'} de ${t} %, c’est multiplier par quel nombre ?`,
        answer: num(k),
        traps: traps(k, [
          [r(t, 100), `Il faut garder le prix de départ (100 %) ${up ? 'et ajouter' : 'et enlever'} ${t} %.`],
          [
            r(100 + (up ? -t : t), 100),
            up
              ? 'Une augmentation : le coefficient est plus grand que 1.'
              : 'Une diminution : le coefficient est plus petit que 1.',
          ],
        ]),
        hint: `100 % ${up ? '+' : '−'} ${t} % = ${100 + (up ? t : -t)} %.`,
        steps: [`100 % ${up ? '+' : '−'} ${t} % = ${100 + (up ? t : -t)} %.`, `Coefficient : **${fmt(k)}**.`],
        targetSeconds: 20,
      };
    }
    const price = rng.int(2, 40) * 10;
    const res = mul(r(price), k);
    return {
      prompt: `Un article à ${price} € ${up ? 'augmente' : 'baisse'} de ${t} %. Quel est son nouveau prix ?`,
      answer: num(res, '€'),
      traps: traps(res, [
        [mul(r(price), r(100 + (up ? -t : t), 100)), up ? 'C’est une augmentation.' : 'C’est une baisse.'],
        [r(price + (up ? t : -t)), `On ${up ? 'n’ajoute' : 'n’enlève'} pas ${t} €, mais ${t} %.`],
      ]),
      hint: `Multiplie ${price} par ${fmt(k)}.`,
      steps: [`Coefficient : ${fmt(k)}.`, `${price} × ${fmt(k)} = **${fmt(res)} €**.`],
      targetSeconds: 35,
    };
  },
  { advice: 'calculatrice' },
);

const partage = S(
  'm4-partage-proportionnel',
  'Partage proportionnel, ratio',
  'Résoudre des problèmes de partage proportionnel',
  ['Partager 60 € dans le ratio 1 : 2 → 3 parts égales de 20 € ; l’un reçoit 1 part (20 €), l’autre 2 parts (40 €).'],
  (rng) => {
    const p = rng.int(1, 4);
    const q = rng.int(p + 1, 6);
    const part = rng.int(3, 20);
    const total = (p + q) * part;
    const [a, b] = distinct(rng, 2, () => rng.pick(NAMES));
    return {
      prompt: `${a} et ${b} se partagent ${total} € dans le ratio ${p} : ${q}. Combien reçoit ${b} ?`,
      answer: num(q * part, '€'),
      traps: traps(r(q * part), [
        [p * part, `Ça, c’est la part de ${a}.`],
        [r(total, 2), 'Le partage n’est pas équitable : il suit le ratio.'],
      ]),
      hint: `Le ratio ${p} : ${q} fait ${p + q} parts égales.`,
      steps: [
        `${p} + ${q} = ${p + q} parts : une part vaut ${total} ÷ ${p + q} = ${part} €.`,
        `${b} reçoit ${q} parts : **${q * part} €**.`,
      ],
      targetSeconds: 40,
    };
  },
);

const grandeursQuotients = S(
  'm4-grandeurs-quotients',
  'Vitesse moyenne',
  'Utiliser des grandeurs quotients, avec ou sans unités',
  ['Vitesse = distance ÷ durée. 150 km en 2 h → 75 km/h. Distance = vitesse × durée.'],
  (rng, level) => {
    const v = rng.int(4, 13) * 10;
    const h = level === 1 ? rng.int(2, 5) : rng.pick([r(1, 2), r(3, 2), r(5, 2), r(1, 4), r(3, 4)]);
    const hR = typeof h === 'number' ? r(h) : h;
    const d = mul(r(v), hR);
    const durText = typeof h === 'number' ? `${h} h` : `${fmt(hR)} h`;
    return {
      prompt: `Une voiture parcourt ${fmt(d)} km en ${durText}. Quelle est sa vitesse moyenne, en km/h ?`,
      answer: num(v, 'km/h'),
      traps: traps(r(v), [[mul(d, hR), 'Vitesse = distance **÷** durée.']]),
      hint: 'Vitesse = distance ÷ durée (en heures).',
      steps: [`${fmt(d)} ÷ ${fmt(hR)}.`, `= **${v} km/h**.`],
      targetSeconds: 30,
    };
  },
  { advice: 'calculatrice' },
);

export const proportionnalite = C(
  'm4-proportionnalite',
  'fonctions',
  'Proportionnalité et pourcentages',
  [quatriemeProportionnelle, coefficientMultiplicateur, partage, grandeursQuotients],
  bossOf(
    [
      S(
        'm4-boss-propor-trajet',
        'Problème : le trajet en vélo',
        'Utiliser des grandeurs quotients, avec ou sans unités',
        ['Durée = distance ÷ vitesse. 30 km à 20 km/h → 1,5 h = 1 h 30.'],
        (rng) => {
          const v = rng.pick([12, 15, 20]);
          const minutes = rng.pick([15, 30, 45, 90]);
          const d = (v * minutes) / 60;
          return {
            prompt: `${rng.pick(NAMES)} roule à ${v} km/h pour aller au collège, à ${fmt(r(Math.round(d * 100), 100))} km. Combien de minutes dure le trajet ?`,
            answer: num(minutes, 'min'),
            traps: traps(r(minutes), [
              [r(Math.round((d / v) * 100), 100), 'Ça, c’est en heures : convertis en minutes (× 60).'],
            ]),
            hint: 'Durée en heures = distance ÷ vitesse, puis × 60.',
            steps: [
              `${fmt(r(Math.round(d * 100), 100))} ÷ ${v} = ${fmt(r(minutes, 60))} h.`,
              `${fmt(r(minutes, 60))} × 60 = **${minutes} min**.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
      S(
        'm4-boss-propor-hausse-baisse',
        'Problème : hausse puis baisse',
        'Rendre compte d’une augmentation ou une diminution exprimée en pourcentages au moyen d’un coefficient multiplicateur',
        ['+ 10 % puis − 10 % : × 1,1 × 0,9 = × 0,99. On ne revient pas au prix de départ !'],
        (rng) => {
          const t = rng.pick([10, 20, 50]);
          const p = rng.int(2, 10) * 100;
          const res = mul(mul(r(p), r(100 + t, 100)), r(100 - t, 100));
          return {
            prompt: `Un vélo à ${p} € augmente de ${t} %, puis le nouveau prix baisse de ${t} %. Quel est le prix final ?`,
            answer: num(res, '€'),
            traps: traps(res, [[p, 'La baisse porte sur le **nouveau** prix, plus grand.']]),
            hint: `Multiplie par ${fmt(r(100 + t, 100))}, puis par ${fmt(r(100 - t, 100))}.`,
            steps: [
              `${p} × ${fmt(r(100 + t, 100))} = ${fmt(mul(r(p), r(100 + t, 100)))} €.`,
              `× ${fmt(r(100 - t, 100))} = **${fmt(res)} €**.`,
            ],
            targetSeconds: 60,
          };
        },
        { advice: 'calculatrice' },
      ),
    ],
    [
      S(
        'm4-boss-propor-piege',
        'Piège : la moyenne des vitesses',
        'Utiliser des grandeurs quotients, avec ou sans unités',
        ['Vitesse moyenne = distance totale ÷ durée totale, pas la moyenne des vitesses.'],
        (rng) => {
          const d = 60;
          const v1 = 30;
          const v2 = rng.pick([60, 20]);
          const t = d / v1 + d / v2;
          const vm = r(2 * d * 10, Math.round(t * 10));
          return {
            prompt: `Un cycliste fait ${d} km à ${v1} km/h, puis revient (${d} km) à ${v2} km/h. Sa vitesse moyenne sur l’aller-retour est-elle ${(v1 + v2) / 2} km/h ?`,
            ...choice(rng, `Non : ${fmt(vm)} km/h`, [
              { label: `Oui : ${(v1 + v2) / 2} km/h`, why: 'Il passe plus de temps à la vitesse la plus lente.' },
            ]),
            hint: 'Calcule la durée totale et la distance totale.',
            steps: [
              `Durées : ${d / v1} h + ${fmt(r(d, v2))} h = ${fmt(r(Math.round(t * 10), 10))} h pour ${2 * d} km.`,
              `Vitesse moyenne : ${2 * d} ÷ ${fmt(r(Math.round(t * 10), 10))} = **${fmt(vm)} km/h**, donc non.`,
            ],
            targetSeconds: 60,
          };
        },
      ),
    ],
  ),
);
