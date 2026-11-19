import { choice, num, traps } from '../../build.ts';
import { fmt, r, rawFrac } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { BossContent, Level, QuestionDraft, Rich, Skill } from '../../types.ts';
import { NAMES } from '../kit.ts';

/**
 * Boss des chapitres de 5e qui n'en avaient pas (18/11/2026) : 2 problèmes en contexte puis 1 piège,
 * comme les autres classes (docs/SPEC.md §6.2 bis). Chaque question cite l'objectif officiel de la
 * notion du chapitre qu'elle mobilise (même texte du BO que la notion d'entraînement).
 */

/** Objectif officiel d'une notion de 5e (texte déjà cité par la notion d'entraînement). */
type Source = (skillId: string) => string;
type Make = (src: Source) => Skill;

const B =
  (
    id: string,
    title: string,
    from: string,
    memo: readonly Rich[],
    generate: (rng: Rng, level: Level) => QuestionDraft,
  ): Make =>
  (src) => ({ id, title, lesson: { memo, source: src(from) }, generate });

const boss =
  (problems: readonly Make[], trapSkills: readonly Make[]) =>
  (src: Source): BossContent => ({
    problems: problems.map((m) => m(src)),
    traps: trapSkills.map((m) => m(src)),
  });

const euros = (cents: number) => `${fmt(r(cents, 100))} €`;

// ——— Calcul mental ———

const calcul = boss(
  [
    B(
      'm5-boss-calcul-courses',
      'Problème : les courses',
      'm5-produits-decimaux',
      ['7 × 0,6 : on calcule 7 × 6 = 42, puis on remet un chiffre après la virgule : 4,2.'],
      (rng) => {
        const who = rng.pick(NAMES);
        const n = rng.int(3, 9);
        const c = rng.pick([20, 30, 40, 60, 70, 80, 90]);
        const total = n * c;
        const item = rng.pick(['stylos', 'gommes', 'cahiers de brouillon', 'bonbons']);
        return {
          prompt: `${who} achète ${n} ${item} à ${euros(c)} l’un. Combien cela coûte-t-il en tout (en €) ?`,
          answer: num(r(total, 100), '€'),
          traps: traps(r(total, 100), [
            [total, `Le prix est en euros : ${n} × ${fmt(r(c, 100))} n’est pas ${total}.`],
            [r(total, 10), 'Attention à la place de la virgule.'],
          ]),
          hint: `Calcule d’abord ${n} × ${c / 10}, puis place la virgule.`,
          steps: [
            `${n} × ${c / 10} = ${(n * c) / 10}.`,
            `${fmt(r(c, 100))} a un chiffre après la virgule : ${n} × ${fmt(r(c, 100))} = **${euros(total)}**.`,
          ],
          targetSeconds: 40,
        };
      },
    ),
    B(
      'm5-boss-calcul-partage',
      'Problème : le partage des bonbons',
      'm5-euclide',
      ['Division euclidienne : dividende = diviseur × quotient + reste, avec reste < diviseur.'],
      (rng) => {
        const k = rng.int(3, 9);
        const q = rng.int(4, 12);
        const rest = rng.int(1, k - 1);
        const total = k * q + rest;
        return {
          prompt: `On partage ${total} bonbons entre ${k} enfants, chacun en reçoit le même nombre, le plus possible. Combien de bonbons restera-t-il ?`,
          answer: num(rest),
          traps: traps(r(rest), [
            [q, `${q}, c’est ce que reçoit **chaque** enfant (le quotient). On demande le reste.`],
            [k * q, 'Ce sont les bonbons distribués, pas ceux qui restent.'],
          ]),
          hint: `Cherche le plus grand multiple de ${k} qui ne dépasse pas ${total}.`,
          steps: [
            `${k} × ${q} = ${k * q}, et ${k} × ${q + 1} = ${k * (q + 1)} dépasse ${total}.`,
            `Reste : ${total} − ${k * q} = **${rest}**.`,
          ],
          targetSeconds: 40,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-calcul-piege',
      'Piège : décimal fois décimal',
      'm5-produits-decimaux',
      ['0,3 × 0,2 : 3 × 2 = 6, et il faut **deux** chiffres après la virgule (un par facteur) : 0,06.'],
      (rng) => {
        const a = rng.int(2, 9);
        const b = rng.int(2, 9);
        const res = r(a * b, 100);
        return {
          prompt: `Calcule 0,${a} × 0,${b}.`,
          answer: num(res),
          traps: traps(res, [
            [r(a * b, 10), 'Chaque facteur a un chiffre après la virgule : le produit en a **deux**.'],
            [a * b, 'Tu as oublié les virgules.'],
          ]),
          hint: 'Compte les chiffres après la virgule dans les deux facteurs.',
          steps: [`${a} × ${b} = ${a * b}.`, `Deux chiffres après la virgule en tout : **${fmt(res)}**.`],
          targetSeconds: 20,
        };
      },
    ),
  ],
);

// ——— Opérations et priorités ———

const operations = boss(
  [
    B(
      'm5-boss-operations-cinema',
      'Problème : la sortie au cinéma',
      'm5-traduire',
      ['Pour un groupe : ce que paie une personne, puis × le nombre de personnes : n × (place + pop-corn).'],
      (rng) => {
        const n = rng.int(3, 8);
        const place = rng.int(6, 11);
        const pop = rng.int(3, 6);
        const res = n * (place + pop);
        return {
          prompt: `${rng.pick(NAMES)} va au cinéma avec des amis : ils sont ${n} en tout. Chacun paie sa place ${place} € et un pop-corn ${pop} €. Combien paie le groupe (en €) ?`,
          answer: num(res, '€'),
          traps: traps(r(res), [
            [n * place + pop, 'Chacun prend un pop-corn : il y en a ' + `${n}, pas un seul.`],
            [place + pop, 'C’est ce que paie **une** personne.'],
          ]),
          hint: 'Combien paie une seule personne ?',
          steps: [
            `Une personne : ${place} + ${pop} = ${place + pop} €.`,
            `${n} personnes : ${n} × ${place + pop} = **${res} €**.`,
          ],
          targetSeconds: 45,
        };
      },
    ),
    B(
      'm5-boss-operations-paquets',
      'Problème : partager en 3',
      'm5-divisibilite',
      ['Un nombre est divisible par 3 si la somme de ses chiffres est divisible par 3.'],
      (rng) => {
        const n = rng.int(101, 998);
        const digits = String(n).split('').map(Number);
        const sum = digits.reduce((a, b) => a + b, 0);
        const ok = n % 3 === 0;
        return {
          prompt: `Un paquet contient ${n} biscuits. Peut-on les partager entre 3 amis, sans en casser et sans qu’il en reste ?`,
          ...choice(rng, ok ? 'Oui' : 'Non', [
            {
              label: ok ? 'Non' : 'Oui',
              why: `Somme des chiffres : ${digits.join(' + ')} = ${sum}${ok ? ', divisible par 3.' : ', pas divisible par 3.'}`,
            },
          ]),
          hint: 'Additionne les chiffres du nombre de biscuits.',
          steps: [
            `${digits.join(' + ')} = ${sum}.`,
            ok
              ? `${sum} est divisible par 3 : **oui**, chacun aura ${n / 3} biscuits.`
              : `${sum} n’est pas divisible par 3 : **non**.`,
          ],
          targetSeconds: 30,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-operations-piege',
      'Piège : de gauche à droite ?',
      'm5-priorites',
      ['La multiplication passe **avant** l’addition, même si elle est écrite après : 2 + 3 × 4 = 2 + 12 = 14.'],
      (rng) => {
        const a = rng.int(2, 9);
        const b = rng.int(2, 9);
        const c = rng.int(2, 9);
        const res = a + b * c;
        return {
          prompt: `Calcule ${a} + ${b} × ${c}.`,
          answer: num(res),
          traps: traps(r(res), [
            [(a + b) * c, 'On ne calcule pas de gauche à droite : la multiplication est prioritaire.'],
          ]),
          hint: 'Quelle opération est prioritaire ?',
          steps: [`D’abord ${b} × ${c} = ${b * c}.`, `Puis ${a} + ${b * c} = **${res}**.`],
          targetSeconds: 20,
        };
      },
    ),
  ],
);

// ——— Puissances ———

const puissances = boss(
  [
    B(
      'm5-boss-puissances-terrasse',
      'Problème : la terrasse carrée',
      'm5-carres',
      ['Un carré de c dalles de côté contient c × c = c^2 dalles.'],
      (rng) => {
        const c = rng.int(5, 12);
        return {
          prompt: `Une terrasse carrée mesure ${c} dalles de côté. Combien de dalles faut-il pour la couvrir entièrement ?`,
          answer: num(c * c),
          traps: traps(r(c * c), [
            [4 * c, 'Tu as compté le tour de la terrasse, pas sa surface.'],
            [2 * c, `${c}^2, c’est ${c} × ${c}, pas ${c} × 2.`],
          ]),
          hint: 'Combien de rangées, et combien de dalles par rangée ?',
          steps: [`${c} rangées de ${c} dalles.`, `${c}^2 = ${c} × ${c} = **${c * c}**.`],
          targetSeconds: 30,
        };
      },
    ),
    B(
      'm5-boss-puissances-cube',
      'Problème : le cube géant',
      'm5-puissances-notation',
      ['Un cube de n petits cubes d’arête contient n × n × n = n^3 petits cubes.'],
      (rng) => {
        const n = rng.int(3, 6);
        return {
          prompt: `Un cube géant est fait de petits cubes : ${n} petits cubes sur chaque arête. Combien de petits cubes en tout ?`,
          answer: num(n ** 3),
          traps: traps(r(n ** 3), [
            [n * n, 'Ça, c’est une seule couche. Il y a ' + `${n} couches.`],
            [3 * n, `${n}^3, c’est ${n} × ${n} × ${n}, pas ${n} × 3.`],
          ]),
          hint: 'Compte les petits cubes d’une couche, puis le nombre de couches.',
          steps: [`Une couche : ${n} × ${n} = ${n * n}.`, `${n} couches : ${n}^3 = **${n ** 3}**.`],
          targetSeconds: 40,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-puissances-piege',
      'Piège : le carré n’est pas le double',
      'm5-puissances-notation',
      ['a^2 = a × a. Le petit 2 ne veut pas dire « fois 2 » : 6^2 = 36, pas 12.'],
      (rng) => {
        const a = rng.int(3, 9);
        return {
          prompt: `Calcule ${a}^2.`,
          answer: num(a * a),
          traps: traps(r(a * a), [[2 * a, `${a}^2 = ${a} × ${a}, pas ${a} × 2.`]]),
          hint: 'Le petit 2 dit combien de fois on écrit le nombre dans la multiplication.',
          steps: [`${a}^2 = ${a} × ${a}.`, `= **${a * a}**.`],
          targetSeconds: 15,
        };
      },
    ),
  ],
);

// ——— Calcul littéral ———

const litteral = boss(
  [
    B(
      'm5-boss-litteral-taxi',
      'Problème : le taxi',
      'm5-substitution',
      ['Prix = prise en charge + prix au km × nombre de km. On remplace la lettre par sa valeur.'],
      (rng) => {
        const p = rng.int(3, 6);
        const k = rng.int(2, 3);
        const x = rng.int(4, 15);
        const res = p + k * x;
        return {
          prompt: `Un taxi coûte ${p} € de prise en charge, puis ${k} € par kilomètre : prix = ${p} + ${k} × x, où x est le nombre de km. Combien coûte un trajet de ${x} km (en €) ?`,
          answer: num(res, '€'),
          traps: traps(r(res), [
            [(p + k) * x, 'La prise en charge ne se paie qu’une fois : la multiplication passe d’abord.'],
            [k * x, `N’oublie pas les ${p} € de prise en charge.`],
          ]),
          hint: `Remplace x par ${x}, puis respecte les priorités.`,
          steps: [`${k} × ${x} = ${k * x}.`, `${p} + ${k * x} = **${res} €**.`],
          targetSeconds: 40,
        };
      },
    ),
    B(
      'm5-boss-litteral-devinette',
      'Problème : le nombre mystère',
      'm5-equations',
      ['a × x = c : on retrouve x en divisant c par a.'],
      (rng) => {
        const a = rng.int(3, 9);
        const x = rng.int(3, 12);
        const c = a * x;
        const who = rng.pick(NAMES);
        return {
          prompt: `${who} pense à un nombre, le multiplie par ${a} et trouve ${c}. Quel est ce nombre ?`,
          answer: num(x),
          traps: traps(r(x), [
            [c - a, 'Il a **multiplié** par ' + `${a} : on défait avec une division, pas une soustraction.`],
            [c * a, 'On doit défaire la multiplication, pas la refaire.'],
          ]),
          hint: `Quel nombre, multiplié par ${a}, donne ${c} ?`,
          steps: [`${a} × x = ${c}.`, `x = ${c} ÷ ${a} = **${x}**.`],
          targetSeconds: 30,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-litteral-piege',
      'Piège : 3x, ce n’est pas 34',
      'm5-substitution',
      ['3x veut dire 3 × x : pour x = 4, 3x = 3 × 4 = 12 (et pas 34).'],
      (rng) => {
        const a = rng.int(2, 9);
        const x = rng.int(2, 9);
        return {
          prompt: `Pour x = ${x}, combien vaut ${a}x ?`,
          answer: num(a * x),
          traps: traps(r(a * x), [
            [Number(`${a}${x}`), `${a}x veut dire ${a} × x : on ne colle pas les chiffres.`],
            [a + x, 'Entre le nombre et la lettre, il y a un signe × caché.'],
          ]),
          hint: 'Entre le nombre et la lettre, quel signe est caché ?',
          steps: [`${a}x = ${a} × x.`, `${a} × ${x} = **${a * x}**.`],
          targetSeconds: 15,
        };
      },
    ),
  ],
);

// ——— Repérage ———

const reperage = boss(
  [
    B(
      'm5-boss-reperage-saut',
      'Problème : le saut de la grenouille',
      'm5-droite-decimaux',
      ['Avancer de d sur une droite graduée : on ajoute d à l’abscisse de départ.'],
      (rng) => {
        const a = rng.int(10, 50);
        const d = rng.int(3, 9);
        const res = r(a + d, 10);
        return {
          prompt: `Sur une droite graduée, une grenouille est au point d’abscisse ${fmt(r(a, 10))}. Elle saute de ${fmt(r(d, 10))} vers la droite. Quelle est sa nouvelle abscisse ?`,
          answer: num(res),
          traps: traps(res, [
            [r(a - d, 10), 'Vers la droite, l’abscisse **augmente**.'],
            [r(a * 10 + d, 100), 'Additionne les dixièmes avec les dixièmes.'],
          ]),
          hint: `Ajoute ${fmt(r(d, 10))} à l’abscisse de départ.`,
          steps: [`${fmt(r(a, 10))} + ${fmt(r(d, 10))}`, `= **${fmt(res)}**.`],
          targetSeconds: 30,
        };
      },
    ),
    B(
      'm5-boss-reperage-tresor',
      'Problème : la carte au trésor',
      'm5-coordonnees',
      ['Coordonnées (abscisse ; ordonnée) : d’abord l’horizontale, ensuite la verticale.'],
      (rng) => {
        const x = rng.int(1, 6);
        const y = rng.int(1, 6);
        let dx = rng.int(1, 4);
        const dy = rng.int(1, 4);
        if (x + dx === y + dy) dx += 1;
        const ok = `(${x + dx} ; ${y + dy})`;
        return {
          prompt: `Sur la carte, le pirate est au point (${x} ; ${y}). Il avance de ${dx} carreaux vers la droite et de ${dy} vers le haut. Où arrive-t-il ?`,
          ...choice(rng, ok, [
            { label: `(${y + dy} ; ${x + dx})`, why: 'L’abscisse (droite-gauche) s’écrit en **premier**.' },
            {
              label: `(${x + dy} ; ${y + dx})`,
              why: 'Vers la droite, c’est l’abscisse qui change ; vers le haut, l’ordonnée.',
            },
            { label: `(${dx} ; ${dy})`, why: 'Il faut partir de sa position, pas de l’origine.' },
          ]),
          hint: 'Vers la droite change l’abscisse, vers le haut change l’ordonnée.',
          steps: [
            `Abscisse : ${x} + ${dx} = ${x + dx}. Ordonnée : ${y} + ${dy} = ${y + dy}.`,
            `Il arrive en **${ok}**.`,
          ],
          targetSeconds: 35,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-reperage-piege',
      'Piège : abscisse ou ordonnée ?',
      'm5-coordonnees',
      ['Dans (3 ; 5), 3 est l’abscisse (en premier), 5 est l’ordonnée (en second).'],
      (rng) => {
        const a = rng.int(1, 9);
        let b = rng.int(1, 9);
        if (b === a) b = a === 9 ? 1 : a + 1;
        return {
          prompt: `Le point M a pour coordonnées (${a} ; ${b}). Quelle est son ordonnée ?`,
          answer: num(b),
          traps: traps(r(b), [[a, `${a} est l’abscisse : elle s’écrit en premier.`]]),
          hint: 'L’ordonnée s’écrit en second.',
          steps: ['(abscisse ; ordonnée).', `L’ordonnée de M est **${b}**.`],
          targetSeconds: 15,
        };
      },
    ),
  ],
);

// ——— Solides et volumes ———

const espace = boss(
  [
    B(
      'm5-boss-espace-aquarium',
      'Problème : l’aquarium',
      'm5-conversions-volume',
      ['Volume du pavé = L × l × h. Puis 1 L = 1 dm^3 = 1 000 cm^3.'],
      (rng) => {
        const L = rng.pick([40, 50, 60, 80, 100]);
        const l = rng.pick([20, 25, 30, 40]);
        const h = rng.pick([20, 30, 40, 50]);
        const v = L * l * h;
        const res = r(v, 1000);
        return {
          prompt: `Un aquarium en forme de pavé mesure ${L} cm de long, ${l} cm de large et ${h} cm de haut. Combien de litres d’eau peut-il contenir ?`,
          answer: num(res, 'L'),
          traps: traps(res, [
            [v, `${fmt(r(v))} cm^3 : il faut encore convertir en litres.`],
            [r(v, 100), '1 L = 1 000 cm^3 (et pas 100).'],
          ]),
          hint: 'Calcule le volume en cm^3, puis convertis : 1 L = 1 000 cm^3.',
          steps: [`${L} × ${l} × ${h} = ${fmt(r(v))} cm^3.`, `${fmt(r(v))} ÷ 1 000 = **${fmt(res)} L**.`],
          targetSeconds: 60,
        };
      },
    ),
    B(
      'm5-boss-espace-boite',
      'Problème : la boîte de cubes',
      'm5-volumes',
      ['Remplir un pavé de cubes de 1 cm : longueur × largeur × hauteur cubes.'],
      (rng) => {
        const a = rng.int(3, 8);
        const b = rng.int(2, 6);
        const c = rng.int(2, 5);
        const res = a * b * c;
        return {
          prompt: `Combien de cubes de 1 cm d’arête faut-il pour remplir une boîte de ${a} cm sur ${b} cm sur ${c} cm ?`,
          answer: num(res),
          traps: traps(r(res), [
            [a + b + c, 'On multiplie les trois dimensions, on ne les additionne pas.'],
            [a * b, 'Ça, c’est seulement le fond : il y a ' + `${c} couches.`],
          ]),
          hint: 'Combien de cubes dans le fond, et combien de couches ?',
          steps: [`Fond : ${a} × ${b} = ${a * b} cubes ; ${c} couches.`, `${a * b} × ${c} = **${res}**.`],
          targetSeconds: 40,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-espace-piege',
      'Piège : dm^3 en cm^3',
      'm5-conversions-volume',
      ['1 dm = 10 cm, donc 1 dm^3 = 10 × 10 × 10 cm^3 = 1 000 cm^3 (et pas 10).'],
      (rng) => {
        const n = rng.int(2, 9);
        return {
          prompt: `Combien de cm^3 y a-t-il dans ${n} dm^3 ?`,
          answer: num(n * 1000, 'cm^3'),
          traps: traps(r(n * 1000), [
            [n * 10, 'C’est vrai pour les longueurs : pour les volumes, il y a trois dimensions.'],
            [n * 100, 'C’est vrai pour les aires : pour les volumes, il y a trois dimensions.'],
          ]),
          hint: '1 dm = 10 cm, et un volume a trois dimensions.',
          steps: ['1 dm^3 = 10 × 10 × 10 cm^3 = 1 000 cm^3.', `${n} dm^3 = **${fmt(r(n * 1000))} cm^3**.`],
          targetSeconds: 20,
        };
      },
    ),
  ],
);

// ——— Symétries ———

const symetries = boss(
  [
    B(
      'm5-boss-symetries-droite',
      'Problème : le demi-tour sur la droite',
      'm5-symetrie-centrale',
      ['Dans un demi-tour de centre O, O est le milieu du point et de son image.'],
      (rng) => {
        const c = rng.int(6, 15);
        const d = rng.int(2, 5);
        const a = c - d;
        return {
          prompt: `Sur une droite graduée, A a pour abscisse ${a}. On fait un demi-tour de centre le point d’abscisse ${c}. Quelle est l’abscisse de l’image de A ?`,
          answer: num(c + d),
          traps: traps(r(c + d), [
            [d, `${d}, c’est la distance entre A et le centre, pas l’abscisse de l’image.`],
            [c, 'Le centre ne bouge pas, mais A n’est pas le centre.'],
          ]),
          hint: 'Le centre est au milieu de A et de son image.',
          steps: [
            `A est à ${c} − ${a} = ${d} à gauche du centre.`,
            `L’image est à ${d} à droite : ${c} + ${d} = **${c + d}**.`,
          ],
          targetSeconds: 40,
        };
      },
    ),
    B(
      'm5-boss-symetries-longueur',
      'Problème : la figure retournée',
      'm5-symetrie-proprietes',
      ['Le demi-tour conserve les longueurs, les angles et les aires.'],
      (rng) => {
        const x = rng.int(3, 12);
        return {
          prompt: `Le triangle A′B′C′ est l’image du triangle ABC par un demi-tour de centre O. AB = ${x} cm. Combien mesure A′B′ (en cm) ?`,
          answer: num(x, 'cm'),
          traps: traps(r(x), [
            [2 * x, 'Le demi-tour retourne la figure sans l’agrandir : les longueurs sont conservées.'],
          ]),
          hint: 'Un demi-tour change-t-il la taille de la figure ?',
          steps: ['Le demi-tour conserve les longueurs.', `A′B′ = AB = **${x} cm**.`],
          targetSeconds: 20,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-symetries-piege',
      'Piège : l’angle retourné',
      'm5-symetrie-proprietes',
      ['Un demi-tour tourne la figure de 180°, mais chaque angle garde sa mesure.'],
      (rng) => {
        const a = rng.int(25, 80);
        return {
          prompt: `Par un demi-tour, un angle de ${a}° a pour image un angle de combien de degrés ?`,
          answer: num(a, '°'),
          traps: traps(r(a), [
            [180 - a, 'On tourne la figure de 180°, mais l’angle, lui, garde sa mesure.'],
            [180 + a, 'Le demi-tour conserve les angles.'],
          ]),
          hint: 'Le demi-tour conserve-t-il les angles ?',
          steps: ['Le demi-tour conserve les angles.', `L’image mesure **${a}°**.`],
          targetSeconds: 15,
        };
      },
    ),
  ],
);

// ——— Angles ———

const angles = boss(
  [
    B(
      'm5-boss-angles-ciseaux',
      'Problème : les ciseaux ouverts',
      'm5-angles-vocab',
      ['Deux angles adjacents qui forment un angle plat sont supplémentaires : leur somme fait 180°.'],
      (rng) => {
        const a = rng.int(25, 75);
        return {
          prompt: `Les lames de ciseaux ouverts forment deux droites sécantes. Un des angles mesure ${a}°. Combien mesure l’angle juste à côté de lui ?`,
          answer: num(180 - a, '°'),
          traps: traps(r(180 - a), [
            [a, `L’angle **opposé** mesure ${a}°, mais l’angle à côté complète jusqu’à 180°.`],
            [90 - a, 'Les deux angles côte à côte forment un angle plat (180°), pas droit.'],
          ]),
          hint: 'Les deux angles côte à côte forment un angle plat.',
          steps: ['Les deux angles forment un angle plat : 180°.', `180 − ${a} = **${180 - a}°**.`],
          targetSeconds: 30,
        };
      },
    ),
    B(
      'm5-boss-angles-rails',
      'Problème : les rails',
      'm5-angles-paralleles',
      ['Deux droites parallèles coupées par une sécante : les angles alternes-internes sont égaux.'],
      (rng) => {
        const a = rng.int(35, 80);
        return {
          prompt: `Deux rails parallèles sont coupés par une route. Un angle alterne-interne mesure ${a}°. Combien mesure l’autre angle alterne-interne ?`,
          answer: num(a, '°'),
          traps: traps(r(a), [[180 - a, 'Avec des droites parallèles, les angles alternes-internes sont **égaux**.']]),
          hint: 'Que sait-on des angles alternes-internes quand les droites sont parallèles ?',
          steps: ['Les rails sont parallèles : les angles alternes-internes sont égaux.', `L’autre mesure **${a}°**.`],
          targetSeconds: 25,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-angles-piege',
      'Piège : aigu ou obtus ?',
      'm5-angles-vocab',
      ['Aigu : moins de 90°. Droit : 90°. Obtus : entre 90° et 180°. Plat : 180°.'],
      (rng) => {
        const obtus = rng.int(0, 1) === 1;
        const a = obtus ? rng.int(91, 120) : rng.int(60, 89);
        const ok = obtus ? 'Obtus' : 'Aigu';
        return {
          prompt: `Un angle mesure ${a}°. Comment s’appelle cet angle ?`,
          ...choice(
            rng,
            ok,
            ['Aigu', 'Obtus', 'Droit', 'Plat']
              .filter((x) => x !== ok)
              .map((x) => ({ label: x, why: `${a}° est ${obtus ? 'plus' : 'moins'} grand que l’angle droit (90°).` })),
          ),
          hint: 'Compare avec l’angle droit : 90°.',
          steps: [
            `${a}° est ${obtus ? 'plus grand' : 'plus petit'} que 90°.`,
            `C’est un angle **${ok.toLowerCase()}**.`,
          ],
          targetSeconds: 15,
        };
      },
    ),
  ],
);

// ——— Triangles ———

const triangles = boss(
  [
    B(
      'm5-boss-triangles-voile',
      'Problème : la voile du bateau',
      'm5-triangle-aire',
      ['Aire du triangle = base × hauteur ÷ 2.'],
      (rng) => {
        const b = rng.int(2, 6);
        const h = 2 * rng.int(2, 5);
        const res = (b * h) / 2;
        return {
          prompt: `La voile d’un bateau est un triangle de ${b} m de base et ${h} m de hauteur. Quelle est son aire (en m^2) ?`,
          answer: num(res, 'm^2'),
          traps: traps(r(res), [[b * h, 'Tu as calculé l’aire du rectangle : le triangle en est la moitié.']]),
          hint: 'Un triangle, c’est la moitié d’un rectangle.',
          steps: [`${b} × ${h} = ${b * h}.`, `${b * h} ÷ 2 = **${res} m^2**.`],
          targetSeconds: 30,
        };
      },
    ),
    B(
      'm5-boss-triangles-toit',
      'Problème : le pignon du toit',
      'm5-triangle-angles',
      ['La somme des angles d’un triangle fait 180°. Dans un triangle isocèle, les angles à la base sont égaux.'],
      (rng) => {
        const top = 2 * rng.int(20, 50);
        const res = (180 - top) / 2;
        return {
          prompt: `Le pignon d’une maison est un triangle isocèle. L’angle du sommet mesure ${top}°. Combien mesure chacun des deux autres angles ?`,
          answer: num(res, '°'),
          traps: traps(r(res), [
            [180 - top, 'Il y a **deux** angles à la base : on partage ce qui reste en deux.'],
            [top, 'Ce sont les angles à la base qui sont égaux entre eux.'],
          ]),
          hint: 'Ce qui reste de 180° se partage entre deux angles égaux.',
          steps: [`180 − ${top} = ${180 - top}°.`, `${180 - top} ÷ 2 = **${res}°**.`],
          targetSeconds: 40,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-triangles-piege',
      'Piège : 180°, pas 360°',
      'm5-triangle-angles',
      ['Triangle : 180° en tout. (C’est le quadrilatère qui fait 360°.)'],
      (rng) => {
        const a = rng.int(30, 80);
        const b = rng.int(30, 70);
        return {
          prompt: `Un triangle a un angle de ${a}° et un angle de ${b}°. Combien mesure le troisième angle ?`,
          answer: num(180 - a - b, '°'),
          traps: traps(r(180 - a - b), [
            [360 - a - b, 'Dans un triangle, la somme des angles fait 180°, pas 360°.'],
            [a + b, 'On cherche ce qui manque pour arriver à 180°.'],
          ]),
          hint: 'Quelle est la somme des angles d’un triangle ?',
          steps: [`${a} + ${b} = ${a + b}°.`, `180 − ${a + b} = **${180 - a - b}°**.`],
          targetSeconds: 25,
        };
      },
    ),
  ],
);

// ——— Parallélogrammes ———

const parallelogrammes = boss(
  [
    B(
      'm5-boss-para-jardin',
      'Problème : le jardin penché',
      'm5-para-aire',
      ['Aire du parallélogramme = base × hauteur (la hauteur, pas le côté penché).'],
      (rng) => {
        const b = rng.int(5, 12);
        const h = rng.int(3, 8);
        const c = h + rng.int(1, 3);
        return {
          prompt: `Un jardin a la forme d’un parallélogramme : une base de ${b} m, un côté penché de ${c} m et une hauteur de ${h} m. Quelle est son aire (en m^2) ?`,
          answer: num(b * h, 'm^2'),
          traps: traps(r(b * h), [
            [b * c, 'Le côté penché n’est pas la hauteur : la hauteur est perpendiculaire à la base.'],
            [r(b * h, 2), 'Ce n’est pas un triangle : pas de division par 2.'],
          ]),
          hint: 'Base × hauteur : laquelle des deux longueurs est la hauteur ?',
          steps: [`Base ${b} m, hauteur ${h} m.`, `${b} × ${h} = **${b * h} m^2**.`],
          targetSeconds: 35,
        };
      },
    ),
    B(
      'm5-boss-para-affiche',
      'Problème : l’affiche',
      'm5-conversions-longueur-aire',
      ['1 m = 10 dm, donc 1 m^2 = 10 × 10 dm^2 = 100 dm^2.'],
      (rng) => {
        const n = rng.int(2, 9);
        return {
          prompt: `Une affiche a une aire de ${n} m^2. Combien cela fait-il de dm^2 ?`,
          answer: num(n * 100, 'dm^2'),
          traps: traps(r(n * 100), [
            [n * 10, 'Pour les aires, il y a deux dimensions : 1 m^2 = 100 dm^2.'],
            [n * 1000, 'C’est pour les volumes qu’on multiplie par 1 000.'],
          ]),
          hint: '1 m = 10 dm, et une aire a deux dimensions.',
          steps: ['1 m^2 = 10 × 10 dm^2 = 100 dm^2.', `${n} m^2 = **${n * 100} dm^2**.`],
          targetSeconds: 25,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-para-piege',
      'Piège : la moitié de la diagonale',
      'm5-para-proprietes',
      ['Les diagonales d’un parallélogramme se coupent en leur milieu.'],
      (rng) => {
        const k = rng.int(3, 9);
        return {
          prompt: `ABCD est un parallélogramme. Ses diagonales se coupent en O. AC = ${2 * k} cm. Combien mesure AO (en cm) ?`,
          answer: num(k, 'cm'),
          traps: traps(r(k), [[2 * k, 'O est le **milieu** de [AC] : AO est la moitié de AC.']]),
          hint: 'Où se coupent les diagonales d’un parallélogramme ?',
          steps: ['Les diagonales se coupent en leur milieu.', `AO = ${2 * k} ÷ 2 = **${k} cm**.`],
          targetSeconds: 25,
        };
      },
    ),
  ],
);

// ——— Statistiques ———

const statistiques = boss(
  [
    B(
      'm5-boss-stats-notes',
      'Problème : la moyenne du trimestre',
      'm5-moyenne',
      ['Moyenne = somme des valeurs ÷ nombre de valeurs.'],
      (rng) => {
        const m = rng.int(9, 15);
        const d = rng.int(1, 3);
        const e = rng.int(1, 3);
        const notes = rng.shuffle([m - d, m + d, m - e, m + e]);
        const sum = notes.reduce((a, b) => a + b, 0);
        return {
          prompt: `${rng.pick(NAMES)} a eu ces notes : ${notes.join(' ; ')}. Quelle est sa moyenne ?`,
          answer: num(m),
          traps: traps(r(m), [
            [sum, 'C’est la somme : il faut encore la diviser par le nombre de notes.'],
            [r(sum, 3), 'Il y a 4 notes, pas 3.'],
          ]),
          hint: 'Additionne les notes, puis divise par le nombre de notes.',
          steps: [`${notes.join(' + ')} = ${sum}.`, `${sum} ÷ 4 = **${m}**.`],
          targetSeconds: 45,
        };
      },
    ),
    B(
      'm5-boss-stats-chats',
      'Problème : le sondage',
      'm5-effectifs-frequences',
      ['Fréquence = effectif ÷ effectif total. En pourcentage : × 100.'],
      (rng) => {
        const total = rng.pick([20, 25, 50]);
        const step = 100 / total;
        const k = rng.int(2, total - 2);
        const pct = k * step;
        return {
          prompt: `Dans un collège, on a interrogé ${total} élèves : ${k} ont un chat. Quel pourcentage des élèves interrogés a un chat ?`,
          answer: num(pct, '%'),
          traps: traps(r(pct), [
            [k, `${k}, c’est l’effectif : on demande un pourcentage (sur 100).`],
            [total - k, 'Ce sont les élèves **sans** chat.'],
          ]),
          hint: `Combien d’élèves y aurait-il sur 100 ? (${total} × ${step} = 100)`,
          steps: [`Fréquence : ${k} ÷ ${total}.`, `Sur 100 : ${k} × ${step} = **${pct} %**.`],
          targetSeconds: 45,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-stats-piege',
      'Piège : le zéro compte',
      'm5-moyenne',
      ['Une note de 0 compte dans la moyenne : elle fait partie des valeurs.'],
      (rng) => {
        const s = 6 * rng.int(3, 5);
        const a = rng.int(Math.max(6, s - 20), Math.min(20, s - 6));
        const b = s - a;
        return {
          prompt: `Les trois notes de ${rng.pick(NAMES)} sont ${a}, 0 et ${b}. Quelle est sa moyenne ?`,
          answer: num(s / 3),
          traps: traps(r(s / 3), [[s / 2, 'Le 0 est une vraie note : on divise par 3, pas par 2.']]),
          hint: 'Combien y a-t-il de notes, en comptant le 0 ?',
          steps: [`${a} + 0 + ${b} = ${s}.`, `${s} ÷ 3 = **${s / 3}**.`],
          targetSeconds: 30,
        };
      },
    ),
  ],
);

// ——— Probabilités ———

const probabilites = boss(
  [
    B(
      'm5-boss-probas-sac',
      'Problème : le sac de billes',
      'm5-probas-calcul',
      ['Probabilité = nombre de cas favorables ÷ nombre total de cas (tous aussi probables).'],
      (rng) => {
        const red = rng.int(2, 7);
        let blue = rng.int(2, 7);
        if (blue === red) blue += 1;
        const total = red + blue;
        const ok = rawFrac(red, total);
        return {
          prompt: `Un sac contient ${red} billes rouges et ${blue} billes bleues. On tire une bille au hasard. Quelle est la probabilité qu’elle soit rouge ?`,
          ...choice(rng, ok, [
            { label: rawFrac(red, blue), why: 'On compare au **total** des billes, pas aux billes bleues.' },
            { label: rawFrac(blue, total), why: 'Ça, c’est la probabilité de tirer une bleue.' },
            { label: rawFrac(1, total), why: `Il y a ${red} billes rouges, donc ${red} cas favorables.` },
          ]),
          hint: 'Combien de billes rouges, et combien de billes en tout ?',
          steps: [`${red} billes rouges sur ${total} billes.`, `Probabilité : **${ok}**.`],
          targetSeconds: 35,
        };
      },
    ),
    B(
      'm5-boss-probas-de',
      'Problème : le lancer de dé',
      'm5-probas-calcul',
      ['Dé à 6 faces équilibré : chaque face a la probabilité {1/6}.'],
      (rng) => {
        const k = rng.int(2, 4);
        const fav = 6 - k;
        const ok = rawFrac(fav, 6);
        return {
          prompt: `On lance un dé équilibré à 6 faces. Quelle est la probabilité d’obtenir un nombre strictement plus grand que ${k} ?`,
          ...choice(rng, ok, [
            { label: rawFrac(k, 6), why: `Les nombres plus grands que ${k} : de ${k + 1} à 6, il y en a ${fav}.` },
            { label: rawFrac(fav + 1, 6), why: `« Strictement plus grand » : ${k} ne compte pas.` },
            { label: rawFrac(1, fav), why: 'On divise par le nombre total de faces : 6.' },
          ]),
          hint: `Écris les faces plus grandes que ${k}.`,
          steps: [
            `Faces favorables : ${Array.from({ length: fav }, (_, i) => k + 1 + i).join(', ')} (${fav} faces).`,
            `Probabilité : **${ok}**.`,
          ],
          targetSeconds: 35,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-probas-piege',
      'Piège : la pièce n’a pas de mémoire',
      'm5-probas-frequences',
      [
        'Chaque lancer d’une pièce équilibrée est indépendant : Pile et Face restent à {1/2}, quoi qu’il soit sorti avant.',
      ],
      (rng) => {
        const n = rng.int(4, 7);
        const side = rng.pick(['Pile', 'Face']);
        const other = side === 'Pile' ? 'Face' : 'Pile';
        return {
          prompt: `Une pièce équilibrée est tombée ${n} fois de suite sur ${side}. Au lancer suivant, ${other} est…`,
          ...choice(rng, `Aussi probable que ${side}`, [
            {
              label: `Plus probable que ${side}`,
              why: 'La pièce ne se souvient pas des lancers précédents : c’est toujours {1/2}.',
            },
            {
              label: `Moins probable que ${side}`,
              why: 'Une série ne change pas les chances : la pièce est équilibrée.',
            },
          ]),
          hint: 'La pièce se souvient-elle des lancers d’avant ?',
          steps: [
            'Chaque lancer est indépendant des précédents.',
            `${other} reste **aussi probable** que ${side} : {1/2}.`,
          ],
          targetSeconds: 20,
        };
      },
    ),
  ],
);

// ——— Fonctions ———

const fonctions = boss(
  [
    B(
      'm5-boss-fonctions-bougie',
      'Problème : la bougie',
      'm5-fonctions-formule',
      ['Hauteur en fonction du temps : hauteur de départ − perte par heure × nombre d’heures.'],
      (rng) => {
        const k = rng.int(2, 4);
        const t = rng.int(2, 5);
        const H = k * t + rng.int(4, 12);
        const res = H - k * t;
        return {
          prompt: `Une bougie mesure ${H} cm. En brûlant, elle perd ${k} cm par heure. Quelle est sa hauteur après ${t} heures (en cm) ?`,
          answer: num(res, 'cm'),
          traps: traps(r(res), [
            [H - k, `Elle perd ${k} cm **chaque** heure, pendant ${t} heures.`],
            [H + k * t, 'La bougie **raccourcit** en brûlant.'],
          ]),
          hint: `Combien de centimètres perd-elle en ${t} heures ?`,
          steps: [`Perte : ${k} × ${t} = ${k * t} cm.`, `${H} − ${k * t} = **${res} cm**.`],
          targetSeconds: 40,
        };
      },
    ),
    B(
      'm5-boss-fonctions-velo',
      'Problème : la location de vélo',
      'm5-fonctions-formule',
      ['Prix = forfait + prix par heure × nombre d’heures : ce n’est pas proportionnel au temps.'],
      (rng) => {
        const fixed = rng.int(2, 6);
        const perH = rng.int(2, 5);
        const p1 = fixed + perH;
        const p2 = fixed + 2 * perH;
        const res = fixed + 4 * perH;
        return {
          prompt: `Louer un vélo coûte ${p1} € pour 1 heure et ${p2} € pour 2 heures (un forfait, plus un prix par heure). Combien coûtent 4 heures (en €) ?`,
          answer: num(res, '€'),
          traps: traps(r(res), [
            [2 * p2, 'Le prix n’est pas proportionnel : le forfait ne se paie qu’une fois.'],
            [4 * p1, 'Le forfait ne se paie qu’une fois, pas à chaque heure.'],
          ]),
          hint: 'Combien coûte une heure de plus ? Et le forfait ?',
          steps: [
            `Une heure de plus coûte ${p2} − ${p1} = ${perH} €, donc le forfait vaut ${p1} − ${perH} = ${fixed} €.`,
            `4 heures : ${fixed} + 4 × ${perH} = **${res} €**.`,
          ],
          targetSeconds: 60,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-fonctions-piege',
      'Piège : quel axe ?',
      'm5-fonctions-graphique',
      ['« La distance en fonction du temps » : le temps sur l’axe horizontal, la distance sur l’axe vertical.'],
      (rng) => {
        // [grandeur, « en fonction de … », grandeur de l'axe horizontal]
        const [a, de, b] = rng.pick([
          ['la distance', 'du temps', 'le temps'],
          ['le prix', 'de la masse', 'la masse'],
          ['la température', 'de l’heure', 'l’heure'],
        ] as const);
        const ok = b.charAt(0).toUpperCase() + b.slice(1);
        const wrong = a.charAt(0).toUpperCase() + a.slice(1);
        return {
          prompt: `On trace le graphique de ${a} en fonction ${de}. Quelle grandeur est sur l’axe horizontal ?`,
          ...choice(rng, ok, [{ label: wrong, why: `« ${a} en fonction ${de} » : ${b} est sur l’axe horizontal.` }]),
          hint: '« … en fonction de … » : la grandeur après « de » va sur l’axe horizontal.',
          steps: [`${a} dépend de ${b}.`, `Sur l’axe horizontal : **${b}**.`],
          targetSeconds: 20,
        };
      },
    ),
  ],
);

// ——— Programmation ———

const algorithmique = boss(
  [
    B(
      'm5-boss-algo-score',
      'Problème : le compteur de points',
      'm5-blocs-boucle',
      ['« Répéter n fois : ajouter b » ajoute n × b à la variable.'],
      (rng) => {
        const a = rng.int(0, 10);
        const n = rng.int(3, 8);
        const b = rng.int(2, 5);
        const res = a + n * b;
        return {
          prompt: `Programme : score prend la valeur ${a}. Répéter ${n} fois : ajouter ${b} à score. Que vaut score à la fin ?`,
          answer: num(res),
          traps: traps(r(res), [
            [a + b, `La boucle tourne ${n} fois, pas une seule.`],
            [n * b, `N’oublie pas la valeur de départ : ${a}.`],
          ]),
          hint: `Combien ajoute-t-on en tout pendant les ${n} tours ?`,
          steps: [`${n} tours de +${b} : ${n} × ${b} = ${n * b}.`, `${a} + ${n * b} = **${res}**.`],
          targetSeconds: 35,
        };
      },
    ),
    B(
      'm5-boss-algo-lutin',
      'Problème : le lutin qui avance',
      'm5-blocs-boucle',
      ['Seules les instructions **dans** la boucle sont répétées ; celles d’après ne s’exécutent qu’une fois.'],
      (rng) => {
        const x0 = rng.int(0, 20);
        const n = rng.int(3, 6);
        const d = rng.int(5, 10);
        const e = rng.int(2, d - 1);
        const res = x0 + n * d - e;
        return {
          prompt: `Le lutin est à l’abscisse ${x0}. Programme : répéter ${n} fois [avancer de ${d}], puis, après la boucle, reculer de ${e}. Quelle est son abscisse à la fin ?`,
          answer: num(res),
          traps: traps(r(res), [
            [x0 + n * (d - e), `« Reculer de ${e} » est **après** la boucle : il ne s’exécute qu’une fois.`],
            [x0 + n * d, `N’oublie pas de reculer de ${e} à la fin.`],
          ]),
          hint: 'Qu’est-ce qui est répété, et qu’est-ce qui ne se fait qu’une fois ?',
          steps: [
            `Boucle : ${n} × ${d} = ${n * d}, le lutin arrive en ${x0 + n * d}.`,
            `Puis ${x0 + n * d} − ${e} = **${res}**.`,
          ],
          targetSeconds: 45,
        };
      },
    ),
  ],
  [
    B(
      'm5-boss-algo-piege',
      'Piège : la variable copiée',
      'm5-blocs-valeur',
      ['« b prend la valeur a » copie la valeur de a à cet instant ; si a change ensuite, b ne change pas.'],
      (rng) => {
        const a1 = rng.int(2, 9);
        let a2 = rng.int(2, 9);
        if (a2 === a1) a2 = a1 === 9 ? 2 : a1 + 1;
        return {
          prompt: `Programme : a prend la valeur ${a1}. b prend la valeur a. a prend la valeur ${a2}. Que vaut b à la fin ?`,
          answer: num(a1),
          traps: traps(r(a1), [
            [a2, `b a reçu la valeur de a **au moment** de la copie : ${a1}. Changer a ensuite ne change pas b.`],
          ]),
          hint: 'Que vaut a au moment où on le copie dans b ?',
          steps: [
            `Quand on copie, a vaut ${a1}, donc b = ${a1}.`,
            `Ensuite seul a change : b vaut toujours **${a1}**.`,
          ],
          targetSeconds: 20,
        };
      },
    ),
  ],
);

/** Boss à ajouter aux chapitres de 5e, à partir de la source officielle de chaque notion. */
export const BOSS_5E_EXTRA: Record<string, (src: Source) => BossContent> = {
  'm5-calcul': calcul,
  'm5-operations': operations,
  'm5-puissances': puissances,
  'm5-litteral': litteral,
  'm5-reperage': reperage,
  'm5-espace': espace,
  'm5-symetries': symetries,
  'm5-angles': angles,
  'm5-triangles': triangles,
  'm5-parallelogrammes': parallelogrammes,
  'm5-statistiques': statistiques,
  'm5-probabilites': probabilites,
  'm5-fonctions': fonctions,
  'm5-algorithmique': algorithmique,
};
