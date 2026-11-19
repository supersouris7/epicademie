import { num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import { bossOf, NAMES } from '../kit.ts';
import { S, C } from './commun.ts';

/** Heures et minutes écrites « 2 h 05 » / « 45 min ». */
const hm = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${String(m).padStart(2, '0')}`;
};
/** Variantes acceptées pour un horaire écrit au clavier. */
const clockAnswers = (min: number) => {
  const h = Math.floor(min / 60) % 24;
  const m = String(min % 60).padStart(2, '0');
  return [`${h} h ${m}`, `${h}h${m}`, `${h} h ${m} min`, `${h}h${m}min`, `${h}:${m}`, `${h} h${m}`, `${h}h ${m}`];
};

// ——— Durées ———

const convertirDurees = S(
  'm6-convertir-durees',
  'Convertir des durées',
  'Convertir des durées',
  [
    '1 h = 60 min ; 1 min = 60 s ; 1 jour = 24 h. Attention : ce n’est **pas** 100 !',
    'Une demi-heure = 30 min ; un quart d’heure = 15 min ; trois quarts d’heure = 45 min.',
  ],
  (rng, level) => {
    if (level === 1) {
      const h = rng.int(2, 9);
      return {
        prompt: `Combien de minutes dans ${h} h ?`,
        answer: num(h * 60, 'min'),
        traps: traps(r(h * 60), [[h * 100, '1 h = 60 min, pas 100.']]),
        hint: '1 h = 60 min.',
        steps: [`1 h = 60 min, donc ${h} h = ${h} × 60.`, `= **${h * 60} min**.`],
        targetSeconds: 12,
      };
    }
    if (level === 2) {
      const h = rng.int(1, 5);
      const m = rng.int(5, 55);
      return {
        prompt: `Convertis ${h} h ${String(m).padStart(2, '0')} en minutes.`,
        answer: num(h * 60 + m, 'min'),
        traps: traps(r(h * 60 + m), [[h * 100 + m, '1 h = 60 min, pas 100.']]),
        hint: 'Convertis les heures en minutes, puis ajoute les minutes.',
        steps: [`${h} h = ${h * 60} min.`, `${h * 60} + ${m} = **${h * 60 + m} min**.`],
        targetSeconds: 20,
      };
    }
    const total = rng.int(70, 400);
    return {
      prompt: `${total} min, c’est combien d’heures **complètes** ?`,
      answer: num(Math.floor(total / 60), 'h'),
      traps: traps(r(Math.floor(total / 60)), [[Math.floor(total / 100), '1 h = 60 min : divise par 60.']]),
      hint: `Combien de fois 60 dans ${total} ?`,
      steps: [
        `${total} = 60 × ${Math.floor(total / 60)} + ${total % 60}.`,
        `${total} min = ${hm(total)} : **${Math.floor(total / 60)} h** complètes.`,
      ],
      targetSeconds: 20,
    };
  },
  { mental: true },
);

const calculerHoraires = S(
  'm6-horaires',
  'Calculer un horaire ou une durée',
  'Effectuer des calculs sur des horaires et des durées',
  [
    'Pour trouver l’heure d’arrivée : heure de départ + durée. Passe par l’heure « ronde » : 14 h 45 + 30 min = 15 h 15.',
    'Pour une durée entre deux horaires, compte d’abord jusqu’à l’heure ronde.',
  ],
  (rng, level) => {
    const startR = rng.int(7 * 12, 19 * 12) * 5;
    const durR = level === 1 ? rng.int(1, 11) * 5 : rng.int(5, 30) * 5;
    if (level === 3) {
      const end = startR + durR;
      return {
        prompt: `Un film commence à ${hm(startR)} et finit à ${hm(end)}. Combien dure-t-il, en minutes ?`,
        answer: num(durR, 'min'),
        traps: traps(r(durR), [
          [
            Math.floor(end / 60) * 100 + (end % 60) - (Math.floor(startR / 60) * 100 + (startR % 60)),
            'Il y a 60 min dans une heure, pas 100 : passe par l’heure ronde.',
          ],
        ]),
        hint: `Compte de ${hm(startR)} jusqu’à l’heure ronde, puis jusqu’à ${hm(end)}.`,
        steps: [
          `De ${hm(startR)} à ${hm(end)} : on compte heure par heure, puis les minutes.`,
          `Le film dure ${hm(durR)}, soit **${durR} min**.`,
        ],
        targetSeconds: 40,
      };
    }
    const end = startR + durR;
    return {
      prompt: `Le bus part à ${hm(startR)}. Le trajet dure ${hm(durR)}. À quelle heure arrive-t-il ? (écris par exemple 14 h 05)`,
      answer: { kind: 'text', accepted: clockAnswers(end) },
      traps: [],
      hint: `Ajoute d’abord ce qu’il faut pour arriver à l’heure ronde après ${hm(startR)}.`,
      steps: [
        `${hm(startR)} + ${hm(durR)} : on ajoute les heures, puis les minutes (60 min = 1 h).`,
        `Le bus arrive à **${clockAnswers(end)[0]}**.`,
      ],
      targetSeconds: 35,
    };
  },
);

const problemesDurees = S(
  'm6-problemes-durees',
  'Jours, années, siècles',
  'Résoudre des problèmes impliquant des horaires et des durées',
  [
    '1 année = 365 jours (366 si elle est bissextile) ; 1 siècle = 100 ans ; 1 millénaire = 1 000 ans.',
    '1 semaine = 7 jours ; 1 jour = 24 h.',
  ],
  (rng) => {
    const q = rng.pick([
      () => {
        const n = rng.int(2, 9);
        return {
          prompt: `Combien d’heures dans ${n} jours ?`,
          a: n * 24,
          u: 'h',
          wrong: n * 12,
          why: '1 jour = 24 h.',
          step: `${n} × 24`,
        };
      },
      () => {
        const n = rng.int(2, 12);
        return {
          prompt: `Combien de jours dans ${n} semaines ?`,
          a: n * 7,
          u: 'jours',
          wrong: n * 5,
          why: '1 semaine = 7 jours.',
          step: `${n} × 7`,
        };
      },
      () => {
        const n = rng.int(2, 20);
        return {
          prompt: `Combien d’années dans ${n} siècles ?`,
          a: n * 100,
          u: 'ans',
          wrong: n * 1000,
          why: '1 siècle = 100 ans.',
          step: `${n} × 100`,
        };
      },
      () => {
        const n = rng.int(2, 5);
        return {
          prompt: `Combien de secondes dans ${n} min ?`,
          a: n * 60,
          u: 's',
          wrong: n * 100,
          why: '1 min = 60 s.',
          step: `${n} × 60`,
        };
      },
    ])();
    return {
      prompt: q.prompt,
      answer: num(q.a, q.u),
      traps: traps(r(q.a), [[q.wrong, q.why]]),
      hint: q.why,
      steps: [q.why, `${q.step} = **${q.a} ${q.u}**.`],
      targetSeconds: 15,
    };
  },
  { mental: true },
);

export const durees = C(
  'm6-durees',
  'grandeurs',
  'Horaires et durées',
  [convertirDurees, calculerHoraires, problemesDurees],
  bossOf(
    [
      S(
        'm6-boss-durees-entrainement',
        'Problème : l’entraînement',
        'Résoudre des problèmes impliquant des horaires et des durées',
        ['Total = durée d’une séance × nombre de séances, puis on convertit en heures et minutes.'],
        (rng) => {
          const per = rng.pick([45, 50, 75, 90]);
          const n = rng.int(2, 5);
          const total = per * n;
          return {
            prompt: `${rng.pick(NAMES)} s’entraîne ${n} fois par semaine, ${per} min à chaque fois. Combien de minutes par semaine ?`,
            answer: num(total, 'min'),
            traps: traps(r(total), [[per + n, 'C’est une multiplication : la même durée plusieurs fois.']]),
            hint: `${per} min, ${n} fois.`,
            steps: [`${per} × ${n} = ${total} min.`, `Soit ${hm(total)} : **${total} min**.`],
            targetSeconds: 35,
          };
        },
      ),
      S(
        'm6-boss-durees-train',
        'Problème : le train',
        'Effectuer des calculs sur des horaires et des durées',
        ['Pour une durée qui passe une heure ronde : compte jusqu’à l’heure ronde, puis le reste.'],
        (rng) => {
          const dep = rng.int(8, 16) * 60 + rng.int(7, 11) * 5;
          const dur = rng.int(5, 20) * 5 + 60;
          const arr = dep + dur;
          return {
            prompt: `Un train part à ${hm(dep)} et arrive à ${hm(arr)}. Combien de minutes dure le trajet ?`,
            answer: num(dur, 'min'),
            traps: traps(r(dur), [
              [
                Math.floor(arr / 60) * 100 + (arr % 60) - Math.floor(dep / 60) * 100 - (dep % 60),
                'Une heure, c’est 60 min, pas 100.',
              ],
            ]),
            hint: `De ${hm(dep)} à ${hm(Math.ceil(dep / 60) * 60)}, puis jusqu’à ${hm(arr)}.`,
            steps: [
              `De ${hm(dep)} à ${hm(Math.ceil(dep / 60) * 60)} : ${Math.ceil(dep / 60) * 60 - dep} min. Puis jusqu’à ${hm(arr)} : ${arr - Math.ceil(dep / 60) * 60} min.`,
              `En tout : **${dur} min** (${hm(dur)}).`,
            ],
            targetSeconds: 50,
          };
        },
      ),
    ],
    [
      S(
        'm6-boss-durees-piege',
        'Piège : 1,5 h',
        'Convertir des durées',
        ['1,5 h, c’est 1 h et une **demi**-heure : 1 h 30, pas 1 h 50 !'],
        (rng) => {
          const h = rng.int(1, 4);
          return {
            prompt: `Combien de minutes dans ${h},5 h ?`,
            answer: num(h * 60 + 30, 'min'),
            traps: traps(r(h * 60 + 30), [
              [h * 60 + 50, '0,5 h, c’est une demi-heure : 30 min.'],
              [h * 100 + 50, '1 h = 60 min, et 0,5 h = 30 min.'],
            ]),
            hint: '0,5 h, c’est la moitié d’une heure.',
            steps: [`${h} h = ${h * 60} min et 0,5 h = 30 min.`, `${h * 60} + 30 = **${h * 60 + 30} min**.`],
            targetSeconds: 20,
          };
        },
      ),
    ],
  ),
);
