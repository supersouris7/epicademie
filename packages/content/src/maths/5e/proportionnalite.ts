import { distinct, num, objective, traps, trueFalse } from '../../build.ts';
import { add, dec, div, fmt, mul, r, type Rational } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Proportionnalité ───────────────────────── */

const reconnaitre: Skill = {
  id: 'm5-propor-reconnaitre',
  title: 'Reconnaître la proportionnalité',
  lesson: {
    memo: [
      'Proportionnel = si on achète 2 fois plus, on paie 2 fois plus. Le prix d’**un** objet est toujours le même.',
      'Dans un tableau : on divise chaque prix par sa quantité. Si on trouve toujours le même nombre, c’est proportionnel.',
      'Sur un graphique : les points sont sur une **droite qui passe par 0**.',
    ],
    source: objective(
      'Reconnaitre une situation de proportionnalité à partir d’un tableau ou d’un graphique. Reconnaitre graphiquement qu’un nuage de points est ou n’est pas associé à une situation de proportionnalité',
    ),
  },
  generate(rng, level) {
    const k = level === 1 ? rng.int(2, 9) : dec(rng.int(12, 45), 1);
    const xs = distinct(rng, 3, () => rng.int(1, 10)).toSorted((a, b) => a - b);
    const isProp = rng.next() < 0.5;
    const ys: Rational[] = xs.map((x) => mul(r(x), typeof k === 'number' ? r(k) : k));
    if (!isProp) {
      const i = rng.int(1, 2);
      ys[i] = add(ys[i] ?? r(0), r(rng.pick([1, 2, -1])));
    }
    if (level === 3) {
      return {
        prompt: 'Ce graphique représente-t-il une situation de proportionnalité ?',
        figure: {
          kind: 'chart',
          xLabel: 'Quantité',
          yLabel: 'Prix (€)',
          points: [
            { x: 0, y: isProp ? 0 : 2 },
            ...xs.map((x, i) => ({ x, y: (ys[i]?.n ?? 0) / (ys[i]?.d ?? 1) + (isProp ? 0 : 2) })),
          ],
          line: true,
        },
        ...trueFalse(
          isProp,
          isProp
            ? 'Les points sont alignés avec l’origine : proportionnel.'
            : 'La droite ne passe pas par l’origine : pas proportionnel.',
        ),
        hint: 'Deux conditions : les points sont-ils alignés ? Et la droite passe-t-elle par 0 (le coin en bas à gauche) ?',
        steps: [
          'Pour être proportionnel, il faut une droite **et** qu’elle passe par 0 (0 objet = 0 €).',
          isProp
            ? 'Ici, les points sont alignés et la droite part de 0.'
            : 'Ici, les points sont alignés, mais la droite ne part pas de 0 : 0 objet ne coûte pas 0 €.',
          isProp ? 'Donc c’est **proportionnel** : vrai.' : 'Donc ce n’est **pas proportionnel** : faux.',
        ],
      };
    }
    const ratios = xs.map((x, i) => div(ys[i] ?? r(0), r(x)));
    return {
      prompt: 'Ce tableau est-il un tableau de proportionnalité ?',
      figure: {
        kind: 'table',
        header: true,
        rows: [
          ['Quantité', ...xs.map(String)],
          ['Prix (€)', ...ys.map((y) => fmt(y))],
        ],
      },
      ...trueFalse(
        isProp,
        isProp ? 'On multiplie toujours par le même nombre.' : 'Les quotients prix ÷ quantité ne sont pas tous égaux.',
      ),
      hint: 'Calcule le prix d’un seul objet dans chaque colonne (prix ÷ quantité). Est-ce toujours le même ?',
      steps: [
        'On calcule le prix d’un seul objet dans chaque colonne : prix ÷ quantité.',
        `${xs.map((x, i) => `${fmt(ys[i] ?? r(0))} ÷ ${x} = ${(ratios[i]?.d ?? 1) <= 1000 && 10 ** 6 % (ratios[i]?.d ?? 1) === 0 ? fmt(ratios[i] ?? r(0)) : '≈ ' + ((ratios[i]?.n ?? 0) / (ratios[i]?.d ?? 1)).toFixed(2).replace('.', ',')}`).join(' ; ')}.`,
        isProp
          ? 'Le prix d’un objet est toujours le même : c’est **proportionnel**.'
          : 'Le prix d’un objet change d’une colonne à l’autre : ce n’est **pas proportionnel**.',
      ],
      targetSeconds: 40,
    };
  },
};

const quatrieme: Skill = {
  id: 'm5-propor-calcul',
  advice: 'calculatrice',
  title: 'Calculer avec la proportionnalité',
  lesson: {
    memo: [
      'Astuce n°1, **passer par 1** : 3 kg coûtent 7,50 € → 1 kg coûte 7,50 ÷ 3 = 2,50 €. Ensuite on multiplie.',
      'Astuce n°2, **couper ou doubler** : recette pour 4 avec 200 g → pour 2, la moitié (100 g) → pour 6 = 4 + 2, 200 + 100 = 300 g.',
    ],
    source: objective(
      'Dans des situations simples, mobiliser une procédure adaptée (propriété de linéarité pour la multiplication ou l’addition, retour à l’unité) pour résoudre un problème lié à la proportionnalité',
    ),
  },
  generate(rng, level) {
    if (level === 3) {
      const unit = dec(rng.int(15, 60) * 5, 2);
      const qty = dec(rng.int(11, 59), 1);
      const price = mul(unit, qty);
      return {
        prompt: `Les tomates coûtent ${fmt(unit)} € le kilogramme. Combien coûtent ${fmt(qty)} kg de tomates (en €) ?`,
        answer: num(price, '€'),
        traps: traps(price, [[add(unit, qty), 'On multiplie le prix d’un kilogramme par la masse.']]),
        hint: `1 kg coûte ${fmt(unit)} €. Pour ${fmt(qty)} kg, on paie ${fmt(qty)} fois ce prix.`,
        steps: [
          `1 kg coûte ${fmt(unit)} €.`,
          `Pour ${fmt(qty)} kg, on paie ${fmt(qty)} fois plus : ${fmt(unit)} × ${fmt(qty)}.`,
          `À la calculatrice : **${fmt(price)}** €`,
        ],
      };
    }
    const people = 4;
    const target = level === 1 ? rng.pick([2, 8, 12]) : rng.pick([6, 10, 3]);
    const q = rng.int(2, 9) * (level === 2 ? 20 : 25);
    const v = mul(r(q), r(target, people));
    const ingr = rng.pick(['g de farine', 'g de sucre', 'mL de lait']);
    return {
      prompt: `Une recette pour ${people} personnes demande ${q} ${ingr}. Combien en faut-il pour ${target} personnes ?`,
      answer: num(v),
      traps: traps(v, [
        [q + (target - people), `Ce n’est pas une addition : la quantité est proportionnelle au nombre de personnes.`],
      ]),
      hint: `Combien faut-il pour 1 personne ? Puis multiplie par ${target}.`,
      steps: [
        target % people === 0
          ? `${target} personnes, c’est ${target / people} fois plus que ${people} : on multiplie par ${target / people}.`
          : `On passe par 1 personne : ${q} ÷ ${people} = ${fmt(r(q, people))}.`,
        target % people === 0
          ? `${q} × ${target / people} = ${fmt(v)}.`
          : `Pour ${target} personnes : ${fmt(r(q, people))} × ${target} = ${fmt(v)}.`,
        `Il en faut **${fmt(v)}** ${ingr.split(' ')[0]}.`,
      ],
    };
  },
};

const pourcentages: Skill = {
  id: 'm5-pourcentages',
  advice: 'calculatrice',
  title: 'Pourcentages',
  lesson: {
    memo: [
      '« Pour cent » veut dire « sur 100 ». 50 % = la moitié, 25 % = le quart, 10 % = un dixième (÷ 10), 1 % = ÷ 100.',
      '20 % de 80 : 10 % de 80 = 8, donc 20 % = 2 × 8 = 16.',
      'Pour trouver un pourcentage : part ÷ total, puis × 100. 6 sur 24 → 0,25 → 25 %.',
    ],
    source:
      objective('Utiliser des proportions, des pourcentages. Calculer, appliquer des proportions, des pourcentages') +
      ' ; automatisme : « Prendre 1 %, 10 % ou 50 % d’un nombre »',
  },
  generate(rng, level) {
    if (level === 3) {
      const total = rng.pick([20, 25, 40, 50]);
      const part = rng.int(1, total - 1);
      const pct = mul(r(part, total), r(100));
      return {
        prompt: `Lors d’une élection, un candidat obtient ${part} voix sur ${total}. Quel pourcentage des voix obtient-il ?`,
        answer: num(pct, '%'),
        traps: traps(pct, [
          [r(part, total), 'C’est la proportion ; en pourcentage on multiplie par 100.'],
          [part, 'C’est le nombre de voix, pas le pourcentage.'],
        ]),
        hint: `Calcule ${part} ÷ ${total}, puis multiplie par 100.`,
        steps: [
          `Il a ${part} voix sur ${total}.`,
          `${part} ÷ ${total} = ${fmt(r(part, total))}.`,
          `« Pour cent » = sur 100 : ${fmt(r(part, total))} × 100 = **${fmt(pct)} %**`,
        ],
      };
    }
    const t = rng.pick(level === 1 ? [10, 50] : [1, 10, 25, 50, 20]);
    const x = rng.int(2, 40) * (level === 1 ? 10 : 4);
    const v = mul(r(x), r(t, 100));
    return {
      prompt: `Calcule ${t} % de ${x}.`,
      answer: num(v),
      traps: traps(v, [
        [r(x, t), `${t} % de ${x} = ${x} × ${t} ÷ 100, pas ${x} ÷ ${t}.`],
        [x - t, 'Un pourcentage n’est pas une soustraction.'],
      ]),
      hint:
        t === 50
          ? '50 %, c’est la moitié.'
          : t === 25
            ? '25 %, c’est le quart.'
            : t === 10
              ? '10 %, c’est diviser par 10.'
              : t === 1
                ? '1 %, c’est diviser par 100.'
                : `${t} %, c’est ${t / 10} fois 10 %. Et 10 %, c’est diviser par 10.`,
      steps:
        t === 50 || t === 25 || t === 10 || t === 1
          ? [
              `${t} %, c’est ${t === 50 ? 'la moitié : on divise par 2' : t === 25 ? 'le quart : on divise par 4' : t === 10 ? 'un dixième : on divise par 10' : 'un centième : on divise par 100'}.`,
              `${x} ÷ ${100 / t} = **${fmt(v)}**`,
            ]
          : [
              `${t} %, c’est ${t / 10} fois 10 %.`,
              `10 % de ${x} = ${x} ÷ 10 = ${fmt(r(x, 10))}.`,
              `${t} % = ${t / 10} × ${fmt(r(x, 10))} = **${fmt(v)}**`,
            ],
      targetSeconds: 15,
    };
  },
};

const coefficient: Skill = {
  id: 'm5-coefficient',
  advice: 'calculatrice',
  title: 'Prix unitaire, vitesse, échelle',
  lesson: {
    memo: [
      '**Prix d’un seul** : on partage le prix total. 4 cahiers à 10 € → 10 ÷ 4 = 2,50 € le cahier.',
      '**Vitesse** en km/h = combien de km en **1 heure** : 150 km en 2 h → 150 ÷ 2 = 75 km/h.',
      '**Échelle** 1/100 000 : 1 cm sur la carte = 100 000 cm en vrai = 1 km.',
    ],
    source: objective(
      'Utiliser un coefficient de proportionnalité dans des contextes concrets (prix unitaire, vitesse moyenne, échelle, etc.)',
    ),
  },
  generate(rng, level) {
    if (level === 1) {
      const unit = dec(rng.int(5, 40) * 5, 2);
      const n = rng.int(2, 8);
      const total = mul(unit, r(n));
      return {
        prompt: `${n} cahiers coûtent ${fmt(total)} €. Quel est le prix d’un cahier (en €) ?`,
        answer: num(unit, '€'),
        traps: traps(unit, [[mul(total, r(n)), 'On cherche le prix pour **un** cahier : on divise.']]),
        hint: `On cherche le prix d’un seul cahier : partage ${fmt(total)} € entre les ${n} cahiers.`,
        steps: [
          `${n} cahiers coûtent ${fmt(total)} €. Pour un seul, on partage : ${fmt(total)} ÷ ${n}.`,
          `${fmt(total)} ÷ ${n} = **${fmt(unit)}** €`,
        ],
      };
    }
    if (level === 2) {
      const v = rng.int(4, 18) * 5;
      const h = rng.pick([2, 3, 4, dec(15, 1), dec(5, 1)] as const);
      const H = typeof h === 'number' ? r(h) : h;
      const d = mul(r(v), H);
      return {
        prompt: `Un car parcourt ${fmt(d)} km en ${fmt(H)} h. Quelle est sa vitesse moyenne (en km/h) ?`,
        answer: num(v, 'km/h'),
        traps: traps(r(v), [[mul(d, H), 'Vitesse = distance ÷ durée.']]),
        hint: `La vitesse en km/h, c’est le nombre de km parcourus en 1 heure. Partage ${fmt(d)} km sur ${fmt(H)} h.`,
        steps: [
          `km/h veut dire : combien de km en 1 heure ?`,
          `${fmt(d)} km en ${fmt(H)} h, donc en 1 h : ${fmt(d)} ÷ ${fmt(H)}.`,
          `${fmt(d)} ÷ ${fmt(H)} = **${v}** km/h`,
        ],
      };
    }
    const scale = rng.pick([25000, 50000, 100000]);
    const cm = dec(rng.int(2, 24), 0);
    const realKm = mul(cm, r(scale, 100000));
    return {
      prompt: `Sur une carte à l’échelle 1/${fmt(scale)}, deux villages sont à ${fmt(cm)} cm. Quelle est la distance réelle (en km) ?`,
      answer: num(realKm, 'km'),
      traps: traps(realKm, [
        [mul(cm, r(scale)), `${fmt(mul(cm, r(scale)))} est en **cm** : il faut convertir en km (÷ 100 000).`],
        [mul(cm, r(scale, 1000)), 'Conversion : 1 km = 100 000 cm.'],
      ]),
      hint: `1 cm sur la carte = ${fmt(scale)} cm en vrai. Calcule en cm, puis convertis en km (1 km = 100 000 cm).`,
      steps: [
        `L’échelle 1/${fmt(scale)} veut dire : 1 cm sur la carte = ${fmt(scale)} cm en vrai.`,
        `${fmt(cm)} cm sur la carte = ${fmt(cm)} × ${fmt(scale)} = ${fmt(mul(cm, r(scale)))} cm en vrai.`,
        `1 km = 100 000 cm, donc on divise par 100 000 : **${fmt(realKm)}** km`,
      ],
    };
  },
};
export const proportionnalite: Chapter = {
  id: 'm5-proportionnalite',
  subject: 'maths',
  grade: '5e',
  domain: 'fonctions',
  title: 'Proportionnalité',
  skills: [reconnaitre, quatrieme, pourcentages, coefficient],
};
