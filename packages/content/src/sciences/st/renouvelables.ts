import { choice, num, traps } from '../../build.ts';
import { r } from '../../rational.ts';
import type { Rng } from '../../rng.ts';
import type { QuestionDraft, Skill } from '../../types.ts';
import { PROGRAMME } from './donnees.ts';
import { association, saisie } from './outils.ts';

// ——— Ressources en énergie renouvelables ou non, à l'échelle de la vie humaine (programme du cycle 3) ———

interface Ressource {
  readonly nom: string;
  readonly renouvelable: boolean;
}

const OUI: readonly Ressource[] = [
  'le Soleil',
  'le vent',
  'une chute d’eau',
  'les marées',
  'la chaleur de la Terre',
  'le bois',
].map((nom) => ({ nom, renouvelable: true }));
const nonRenouvelable = (nom: string): Ressource => ({ nom, renouvelable: false });
const NON = [nonRenouvelable('le charbon'), nonRenouvelable('le pétrole'), nonRenouvelable('la houille')] as const;

const POURQUOI_OUI =
  'C’est une ressource renouvelable : on la considère comme inépuisable à l’échelle d’une vie humaine.';
const POURQUOI_NON = 'C’est un combustible fossile : ses stocks diminuent, il n’est pas renouvelable.';
const POURQUOI_BOIS = `${POURQUOI_OUI} Pour le bois, il faut que la forêt soit gérée de façon durable.`;
const pourquoi = (x: Ressource) => {
  if (!x.renouvelable) return POURQUOI_NON;
  return x.nom === 'le bois' ? POURQUOI_BOIS : POURQUOI_OUI;
};
const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/** Le charbon et la houille désignent la même famille : jamais les deux dans une même question. */
const deuxFossiles = (rng: Rng): Ressource[] => [rng.pick([NON[0], NON[2]]), NON[1]];

const niveau1 = (rng: Rng): QuestionDraft => {
  const chercheOui = rng.int(0, 1) === 0;
  const bon = rng.pick(chercheOui ? OUI.slice(0, 2) : NON.slice(0, 2));
  const faux = chercheOui ? deuxFossiles(rng) : rng.shuffle(OUI.slice(0, 3)).slice(0, 2);
  const { answer, traps: tr } = choice(
    rng,
    bon.nom,
    faux.map((f) => ({ label: f.nom, why: `${maj(f.nom)} ? ${pourquoi(f)}` })),
  );
  return {
    prompt: `Quelle ressource en énergie ${chercheOui ? 'est renouvelable' : 'n’est pas renouvelable'} ?`,
    answer,
    traps: tr,
    hint: 'Demande-toi : peut-on en manquer un jour, à force de l’utiliser ?',
    steps: [
      'Renouvelable : on la considère comme inépuisable à l’échelle d’une vie humaine.',
      pourquoi(bon),
      `Réponse : **${bon.nom}**.`,
    ],
    targetSeconds: 20,
  };
};

const RAISONS = [
  {
    q: 'Pourquoi dit-on que le vent est une ressource renouvelable ?',
    bon: 'on le considère comme inépuisable à l’échelle d’une vie humaine',
    faux: [
      ['il est invisible', 'Voir ou ne pas voir une ressource ne dit rien sur la quantité disponible.'],
      ['il ne sert qu’à une seule personne', 'Le nombre d’utilisateurs ne rend pas une ressource renouvelable.'],
      ['ses stocks diminuent sous la terre', 'Des stocks qui diminuent, c’est le cas des énergies fossiles.'],
    ],
    why: 'Une ressource est renouvelable quand on la considère comme inépuisable à l’échelle d’une vie humaine.',
  },
  {
    q: 'Pourquoi dit-on que le pétrole n’est pas renouvelable ?',
    bon: 'ses stocks diminuent',
    faux: [
      ['il est liquide', 'L’eau d’une chute est liquide aussi, et elle est renouvelable.'],
      ['il sert aux transports', 'L’usage d’une ressource ne dit pas si elle peut manquer.'],
      [
        'il vient du sous-sol, donc il revient chaque jour',
        'Le pétrole ne revient pas chaque jour : ses stocks diminuent.',
      ],
    ],
    why: 'Le pétrole est une énergie fossile : ses stocks diminuent.',
  },
] as const;

const niveau2 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 1) === 0) {
    const bon = rng.pick(NON);
    const autres = rng.shuffle(OUI).slice(0, 3);
    const { answer, traps: tr } = choice(
      rng,
      bon.nom,
      autres.map((f) => ({ label: f.nom, why: `${maj(f.nom)} : ${pourquoi(f)}` })),
    );
    return {
      prompt: 'Parmi ces quatre ressources, laquelle est un combustible fossile ?',
      answer,
      traps: tr,
      hint: 'Un combustible fossile s’est formé sous terre, il y a très longtemps.',
      steps: [
        'Les combustibles fossiles viennent de matières enfouies dans la terre.',
        POURQUOI_NON,
        `C’est **${bon.nom}**.`,
      ],
      targetSeconds: 30,
    };
  }
  const x = rng.pick(RAISONS);
  const { answer, traps: tr } = choice(
    rng,
    x.bon,
    x.faux.map(([label, erreur]) => ({ label, why: `${erreur} ${x.why}` })),
  );
  return {
    prompt: x.q,
    answer,
    traps: tr,
    hint: 'La bonne raison parle de la quantité disponible avec le temps.',
    steps: ['On regarde si la ressource peut manquer à l’échelle d’une vie.', x.why, `Réponse : **${x.bon}**.`],
    targetSeconds: 35,
  };
};

const niveau3 = (rng: Rng): QuestionDraft => {
  const x = rng.pick([...OUI, ...NON]);
  if (rng.int(0, 1) === 0) {
    const bon = x.renouvelable ? 'oui' : 'non';
    const { answer, traps: tr } = saisie([bon], [[x.renouvelable ? 'non' : 'oui', pourquoi(x)]]);
    return {
      prompt: `Voici une ressource : ${x.nom}. Est-elle renouvelable ? Réponds par oui ou non.`,
      answer,
      traps: tr,
      hint: 'Pense à ce qui se passe à l’échelle d’une vie humaine.',
      steps: ['On pense à la quantité disponible avec le temps.', pourquoi(x), `Réponse : **${bon}**.`],
      targetSeconds: 25,
    };
  }
  const mot = x.renouvelable ? 'renouvelable' : 'fossile';
  const { answer, traps: tr } = saisie(x.renouvelable ? ['renouvelable'] : ['fossile'], [
    [x.renouvelable ? 'fossile' : 'renouvelable', pourquoi(x)],
  ]);
  return {
    prompt: `Complète avec « renouvelable » ou « fossile » : ${x.nom}, c’est une énergie …`,
    answer,
    traps: tr,
    hint: 'Les énergies fossiles viennent de matières enfouies sous terre.',
    steps: ['On choisit entre les deux familles.', pourquoi(x), `C’est une énergie **${mot}**.`],
    targetSeconds: 30,
  };
};

const OPTIONS = ['renouvelable', 'non renouvelable'];

const niveau4 = (rng: Rng): QuestionDraft => {
  if (rng.int(0, 2) === 0) {
    // Cinq ressources à relier à cinq indices.
    return {
      prompt: 'Relie chaque ressource à ce qui la décrit.',
      answer: association(rng, [
        ['le vent', 'de l’air qui se déplace'],
        ['les marées', 'la mer qui monte et descend'],
        ['la chaleur de la Terre', 'elle vient de l’intérieur de notre planète'],
        ['le charbon', 'une roche fossile issue de débris végétaux'],
        ['le pétrole', 'une huile issue de matière organique'],
      ]),
      hint: 'Commence par les deux combustibles fossiles : l’un est une roche, l’autre un liquide.',
      steps: [
        'Chaque ressource a un indice précis.',
        'Le charbon est une roche, le pétrole une huile.',
        'Chaque ressource est reliée à **son** indice.',
      ],
      targetSeconds: 60,
    };
  }
  const choix = rng.shuffle([...rng.shuffle(OUI).slice(0, 2), rng.pick(deuxFossiles(rng)), rng.pick(OUI.slice(4))]);
  const uniques = [...new Map(choix.map((c) => [c.nom, c])).values()].sort((a, b) => a.nom.localeCompare(b.nom));
  const noms = uniques.map((c) => c.nom);
  return {
    prompt: `Classe chaque ressource : ${noms.join(', ')}.`,
    answer: {
      kind: 'cloze',
      parts: [...uniques.map((c, i) => `${i === 0 ? '' : ' ; '}${maj(c.nom)} : `), '.'],
      blanks: uniques.map((c) => ({ mode: 'list' as const, options: OPTIONS, correct: c.renouvelable ? 0 : 1 })),
    },
    hint: 'Cherche d’abord les combustibles fossiles, formés sous terre. Les autres viennent ensuite.',
    steps: [
      'Renouvelable : considérée comme inépuisable à l’échelle d’une vie humaine.',
      'Charbon, houille et pétrole sont des combustibles fossiles : non renouvelables.',
      `Classement : **${uniques.map((c) => `${c.nom} (${OPTIONS[c.renouvelable ? 0 : 1]})`).join(', ')}**.`,
    ],
    targetSeconds: 60,
  };
};

const USAGES: Record<string, string> = {
  'le Soleil': 'Sur le toit de l’école, des panneaux utilisent le Soleil.',
  'le vent': 'Sur la colline, une éolienne utilise le vent.',
  'une chute d’eau': 'Au barrage, une turbine utilise une chute d’eau.',
  'les marées': 'Au bord de la mer, une usine utilise les marées.',
  'la chaleur de la Terre': 'Un réseau chauffe des maisons avec la chaleur de la Terre.',
  'le bois': 'Au chalet, un poêle brûle le bois.',
  'le charbon': 'Une ancienne chaudière brûle le charbon.',
  'le pétrole': 'Le bus du village roule avec un carburant tiré du pétrole.',
  'la houille': 'Au musée, une vieille machine à vapeur brûle encore de la houille.',
};

const niveau5 = (rng: Rng): QuestionDraft => {
  const renouv = rng.shuffle(OUI).slice(0, rng.int(2, 3));
  const fossile = rng.pick(deuxFossiles(rng));
  const tout = rng.shuffle([...renouv, fossile]);
  const figure = {
    kind: 'document' as const,
    title: 'L’énergie dans la vallée',
    lines: tout.map((x) => USAGES[x.nom] ?? ''),
  };
  if (rng.int(0, 1) === 0) {
    const n = renouv.length;
    return {
      prompt: 'Lis le texte. Combien de ressources renouvelables sont utilisées ?',
      figure,
      answer: num(n),
      traps: traps(r(n), [
        [tout.length, 'Tu as tout compté. Une des ressources est un combustible fossile.'],
        [1, 'C’est le nombre de ressources fossiles. On demande les renouvelables.'],
      ]),
      hint: 'Repère d’abord le combustible fossile, puis compte les autres.',
      steps: [
        `Le combustible fossile est ${fossile.nom} : il ne compte pas.`,
        `Les renouvelables : ${renouv.map((x) => x.nom).join(', ')}.`,
        `Il y en a **${n}**.`,
      ],
      targetSeconds: 55,
    };
  }
  const court = fossile.nom.replace(/^l[ea] /, '');
  const { answer, traps: tr } = saisie(
    court === 'houille' ? [court, fossile.nom, 'charbon', 'le charbon'] : [court, fossile.nom],
    renouv.flatMap((x) =>
      [x.nom, x.nom.replace(/^(le |la |les |une )/, '')].map((n) => [n, `${maj(x.nom)} : ${pourquoi(x)}`] as const),
    ),
  );
  return {
    prompt: 'Lis le texte. Quelle ressource utilisée n’est pas renouvelable ? Écris son nom.',
    figure,
    answer,
    traps: tr,
    hint: 'Cherche la ressource formée sous terre, dont les stocks diminuent.',
    steps: ['On cherche le combustible fossile dans le texte.', POURQUOI_NON, `C’est **${fossile.nom}**.`],
    targetSeconds: 50,
  };
};

const NIVEAUX = [niveau1, niveau2, niveau3, niveau4, niveau5] as const;

export const renouvelables: Skill = {
  id: 'pcm2-renouvelables',
  title: 'Énergies renouvelables ou non',
  levels: 5,
  version: 1,
  lesson: {
    memo: [
      'Une ressource **renouvelable** est considérée comme inépuisable à l’échelle d’une vie humaine : le Soleil, le vent, les chutes d’eau, les **marées**, la chaleur de la Terre, le bois d’une forêt gérée de façon durable.',
      'Le charbon et le pétrole sont des combustibles **fossiles** : leurs stocks diminuent. Ils ne sont pas renouvelables.',
    ],
    source: `${PROGRAMME} : « sensibilisés au caractère renouvelable ou non, à l’échelle temporelle de la vie humaine, des ressources en énergie ». Ministère de la Transition écologique : « alimentées par le soleil, le vent, la chaleur de la terre, les chutes d’eau, les marées » ; « considérées comme inépuisables à l’échelle du temps humain » ; « énergies fossiles […] dont les stocks diminuent » ; « Le chauffage individuel au bois représente la première source d’énergie renouvelable en France » ; bois : « considérée comme renouvelable, dans la mesure où la forêt est gérée de façon durable ». CNRTL : vent, « Déplacement d’air » ; marée, « Mouvement alternatif, périodique et journalier du niveau de la mer ». Ministère, géothermie : « exploitent toutes la chaleur de la croûte terrestre ». Académie française : « La houille, le pétrole sont des combustibles fossiles » ; « Le charbon est une roche fossile » ; « Huile minérale d’origine naturelle, issue de l’accumulation et de la transformation de matière organique » (pétrole).`,
    sources: [
      PROGRAMME,
      'ecologie-energies-renouvelables',
      'ecologie-biomasse',
      'academie-fossile',
      'academie-charbon',
      'academie-petrole',
      'cnrtl-vent',
      'cnrtl-maree',
    ],
  },
  generate: (rng, level) => (NIVEAUX[level - 1] ?? niveau1)(rng),
};
