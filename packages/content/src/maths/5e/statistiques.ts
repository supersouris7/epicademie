import { choice, distinct, fraction, num, objective, traps } from '../../build.ts';
import { fmt, frac, mul, r } from '../../rational.ts';
import type { Chapter, Skill } from '../../types.ts';

/* ───────────────────────── Statistiques ───────────────────────── */

const SPORTS = ['Foot', 'Basket', 'Danse', 'Natation', 'Judo', 'Tennis'];

const effectifs: Skill = {
  id: 'm5-effectifs-frequences',
  advice: 'calculatrice',
  title: 'Effectifs et fréquences',
  lesson: {
    memo: [
      '**Effectif** = « combien ». 6 élèves font du judo : l’effectif du judo est 6. L’effectif total, c’est tout le monde.',
      '**Fréquence** = « combien sur le total » : 6 sur 24 → {6/24}. En pourcentage : 6 ÷ 24 = 0,25 = 25 %.',
    ],
    source: objective(
      'Calculer des effectifs et des fréquences (exprimées sous forme décimale, fractionnaire ou de pourcentage)',
    ),
  },
  generate(rng, level) {
    const cats = rng.shuffle(SPORTS).slice(0, 4);
    // Effectif total 20, 25 ou 50 pour des pourcentages exacts.
    const total = rng.pick([20, 25, 50]);
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < total; i++) {
      const k = rng.int(0, 3);
      counts[k] = (counts[k] ?? 0) + 1;
    }
    const rows = [
      ['Sport', ...cats],
      ['Effectif', ...counts.map(String)],
    ];
    const k = rng.int(0, 3);
    const c = counts[k] ?? 0;
    const cat = cats[k] ?? '';
    if (level === 1) {
      return {
        prompt: 'Quel est l’effectif total de la classe ?',
        figure: { kind: 'table', rows, header: true },
        answer: num(total),
        traps: traps(r(total), [[Math.max(...counts), 'L’effectif total est la **somme** de tous les effectifs.']]),
        hint: 'L’effectif total, c’est tout le monde : additionne tous les effectifs.',
        steps: [
          'L’effectif total, c’est le nombre d’élèves en tout : on additionne toutes les cases.',
          `${counts.join(' + ')} = **${total}**`,
        ],
        targetSeconds: 20,
      };
    }
    const f = r(c, total);
    if (level === 2) {
      return {
        prompt: `Quelle est la fréquence de « ${cat} » ? (en fraction)`,
        figure: { kind: 'table', rows, header: true },
        answer: fraction(f),
        traps: traps(f, [[r(total, c || 1), 'C’est effectif ÷ total, pas l’inverse.']]),
        hint: `La fréquence, c’est « combien sur le total ». Combien font « ${cat} » ? Et combien d’élèves en tout ?`,
        steps: [
          `« ${cat} » : ${c} élèves. En tout : ${total} élèves.`,
          `Fréquence = ${c} sur ${total}, c’est-à-dire **{${c}/${total}}**${f.d !== total ? ` (ou **${frac(f)}** en simplifiant)` : ''}.`,
        ],
      };
    }
    const pct = mul(f, r(100));
    return {
      prompt: `Quelle est la fréquence de « ${cat} », en pourcentage ?`,
      figure: { kind: 'table', rows, header: true },
      answer: num(pct, '%'),
      traps: traps(pct, [
        [f, 'C’est la fréquence en décimal : en pourcentage on multiplie par 100.'],
        [c, 'C’est l’effectif ; la fréquence se rapporte au total.'],
      ]),
      hint: `Calcule ${c} ÷ ${total}, puis multiplie par 100 pour avoir un pourcentage.`,
      steps: [
        `« ${cat} » : ${c} élèves sur ${total}.`,
        `${c} ÷ ${total} = ${fmt(f)}.`,
        `Un pourcentage, c’est « sur 100 » : ${fmt(f)} × 100 = **${fmt(pct)} %**`,
      ],
    };
  },
};

const moyenne: Skill = {
  id: 'm5-moyenne',
  advice: 'calculatrice',
  title: 'Moyenne',
  lesson: {
    memo: [
      'La moyenne, c’est ce que chacun aurait si on mettait tout en commun et qu’on **partageait équitablement**.',
      'On additionne tout, puis on divise par le nombre de valeurs : 12, 15, 9, 14 → 50 ÷ 4 = 12,5.',
      'Vérifie : la moyenne est toujours entre la plus petite et la plus grande valeur.',
    ],
    source: objective('Calculer et interpréter la moyenne simple d’une série de données'),
  },
  generate(rng, level) {
    const n = level === 1 ? rng.pick([2, 4, 5]) : rng.pick([4, 5]);
    const values = Array.from({ length: n }, () => rng.int(level === 3 ? 0 : 5, 20));
    const sum = values.reduce((s, v) => s + v, 0);
    const mean = r(sum, n);
    const what = rng.pick(['les notes de Jade', 'les points marqués par Sacha', 'les températures relevées (en °C)']);
    return {
      prompt: `Voici ${what} : ${values.join(' ; ')}. Calcule la moyenne.`,
      answer: num(mean),
      traps: traps(mean, [
        [sum, `${sum} est la somme ; il faut la diviser par le nombre de valeurs (${n}).`],
        [r(sum, n + 1), `Il y a ${n} valeurs, pas ${n + 1}.`],
        [r(sum, n - 1), `Il y a ${n} valeurs, pas ${n - 1}.`],
      ]),
      hint: `Additionne toutes les valeurs, puis partage entre les ${n} valeurs.`,
      steps: [
        `On met tout en commun : ${values.join(' + ')} = ${sum}.`,
        `On partage équitablement entre les ${n} valeurs : ${sum} ÷ ${n} = ${fmt(mean)}.`,
        `Vérification : ${fmt(mean)} est bien entre ${Math.min(...values)} et ${Math.max(...values)}. La moyenne est **${fmt(mean)}**.`,
      ],
      targetSeconds: 45,
    };
  },
};

const diagrammes: Skill = {
  id: 'm5-diagrammes',
  title: 'Lire un diagramme',
  lesson: {
    memo: [
      'Avant de lire, regarde le **titre** et l’**axe vertical** : de combien en combien avance-t-il ?',
      'Pour lire une barre, suis le haut de la barre à l’horizontale jusqu’à l’axe, avec ta règle ou ton doigt.',
    ],
    source: objective(
      'Lire et interpréter des informations présentées sous forme de tableaux, de diagrammes et de graphiques',
    ),
  },
  generate(rng, level) {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const values = distinct(rng, 5, () => rng.int(1, 12) * 2);
    const bars = days.map((label, i) => ({ label, value: values[i] ?? 0 }));
    const figure = { kind: 'bars' as const, title: 'Livres empruntés au CDI', bars };
    if (level === 1) {
      const i = rng.int(0, 4);
      const b = bars[i] ?? { label: 'Lun', value: 0 };
      return {
        prompt: `Combien de livres ont été empruntés ${b.label === 'Lun' ? 'lundi' : b.label === 'Mar' ? 'mardi' : b.label === 'Mer' ? 'mercredi' : b.label === 'Jeu' ? 'jeudi' : 'vendredi'} ?`,
        figure,
        answer: num(b.value),
        hint: `Pose ton doigt en haut de la barre « ${b.label} » et glisse à l’horizontale jusqu’à l’axe de gauche.`,
        steps: [
          `On repère la barre « ${b.label} ».`,
          'On suit le haut de la barre à l’horizontale jusqu’à l’axe de gauche.',
          `On lit **${b.value}** livres.`,
        ],
        targetSeconds: 15,
      };
    }
    if (level === 2) {
      const max = bars.reduce((m, b) => (b.value > m.value ? b : m));
      return {
        prompt: 'Quel jour a-t-on emprunté le plus de livres ?',
        figure,
        ...choice(
          rng,
          max.label,
          bars
            .filter((b) => b.label !== max.label)
            .map((b) => ({ label: b.label, why: `La barre la plus haute est celle de ${max.label} (${max.value}).` })),
          true,
        ),
        hint: 'Cherche la barre la plus haute.',
        steps: [
          'Le jour où on a emprunté le plus de livres, c’est celui de la barre la plus haute.',
          `La plus haute est celle de **${max.label}**, avec ${max.value} livres.`,
        ],
      };
    }
    const total = values.reduce((s, v) => s + v, 0);
    return {
      prompt: 'Combien de livres ont été empruntés en tout sur la semaine ?',
      figure,
      answer: num(total),
      traps: traps(r(total), [
        [Math.max(...values), 'C’est seulement la plus grande barre ; il faut additionner toutes les barres.'],
      ]),
      hint: 'Lis chaque barre, puis additionne tout.',
      steps: [
        `On lit chaque barre : ${bars.map((b) => `${b.label} ${b.value}`).join(', ')}.`,
        `On additionne : ${values.join(' + ')} = **${total}**`,
      ],
      targetSeconds: 40,
    };
  },
};

export const statistiques: Chapter = {
  id: 'm5-statistiques',
  subject: 'maths',
  grade: '5e',
  domain: 'donnees',
  title: 'Statistiques',
  skills: [effectifs, moyenne, diagrammes],
};
