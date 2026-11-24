import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill } from '../types.ts';
import {
  CONSTAT,
  DEFINITION,
  EN_FAISANT,
  ENTREES,
  MANIPS,
  NOM_MANIP,
  base,
  consigne,
  deux,
  devant,
  ecritures,
  faitCompl,
  manipsDe,
  resultat,
  sansCirc,
  type Entree,
  type Manip,
} from './complements.donnees.ts';
import { document, lowerFirst, pickN, textTrap } from './outils.ts';

/**
 * Chapitre « Les compléments » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Analyser une phrase simple ».
 */
const PROGRAMME = 'francais-cycle3-2025';
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitCompl(id).citation} »`;

const cods = ENTREES.filter((e) => e.type === 'cod');
const cois = ENTREES.filter((e) => e.type === 'coi');
/** Les phrases dont le groupe circonstanciel dit où : on peut leur ajouter un repère de temps ou « souvent ». */
const deLieu = ENTREES.flatMap((e) => (e.avant ? [{ ...e, avant: e.avant }] : []));
/** Le groupe circonstanciel à la fin ou déplacé au début (tirage). */
const avecCirc = (rng: Rng, e: Entree): string => (rng.int(0, 1) === 0 ? base(e) : devant(e));

const whyObjet = (e: Entree) =>
  `« ${e.obj} » complète le verbe : on ne peut pas le déplacer. Ce n’est pas un groupe circonstanciel.`;
const whyCirc = (e: Entree) => `« ${e.circ} » se déplace (« ${devant(e)} ») : ce n’est pas un complément d’objet.`;
const whySujet = (e: Entree) => `« ${e.gs} » est le sujet : il dit qui fait l’action. Ce n’est pas ce groupe-là.`;

/** COI écrit sans sa préposition (« son chien » au lieu de « à son chien »). */
const sansPrep = (e: Entree) =>
  e.prep
    ? [textTrap(e.obj.slice(e.prep.length + 1), `Il manque « ${e.prep} » : cette préposition fait partie du COI.`)]
    : [];

// ───────────────────────── 1. Complément d'objet ou circonstanciel ─────────────────────────

const TEST_DEPLACER = 'Je teste : je déplace le groupe au début de la phrase.';

function objetCircDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const e = rng.pick(ENTREES);
      const estObjet = rng.int(0, 1) === 0;
      const g = estObjet ? e.obj : e.circ;
      const OBJET = 'un complément d’objet';
      const CIRC = 'un groupe circonstanciel';
      const { answer, traps } = choice(rng, estObjet ? OBJET : CIRC, [
        { label: estObjet ? CIRC : OBJET, why: estObjet ? whyObjet(e) : whyCirc(e) },
        {
          label: 'le sujet',
          why: `Le sujet dit qui fait l’action : ici, c’est « ${e.gs} ». « ${g} » n’est pas le sujet.`,
        },
      ]);
      return {
        prompt: `Dans « ${base(e)} », quel est le rôle du groupe « ${g} » ?`,
        answer,
        traps,
        hint: 'Essaie de déplacer le groupe au début de la phrase. Si la phrase devient bizarre, il est collé au verbe.',
        steps: estObjet
          ? [TEST_DEPLACER, `« ${g} » ne peut pas bouger : il complète le verbe.`, `C’est **${OBJET}**.`]
          : [TEST_DEPLACER, `« ${devant(e)} » : la phrase est toujours correcte.`, `C’est **${CIRC}**.`],
      };
    }
    case 2: {
      const e = rng.pick(ENTREES);
      const { answer, traps } = choice(rng, e.circ, [
        { label: e.gs, why: `« ${e.gs} » est le sujet : il reste devant le verbe.` },
        { label: e.verbe, why: `« ${e.verbe} » est le verbe : sans lui, il n’y a plus de phrase.` },
        { label: e.obj, why: `« ${e.obj} » complète le verbe : si on le déplace, la phrase devient bizarre.` },
      ]);
      return {
        prompt: `Dans « ${base(e)} », quel groupe peut être déplacé au début de la phrase ?`,
        answer,
        traps,
        hint: 'Teste chaque groupe : un seul peut changer de place sans casser la phrase.',
        steps: [
          'Un groupe circonstanciel peut changer de place. Le sujet, le verbe et le complément d’objet, non.',
          `Je déplace « ${e.circ} » : « ${devant(e)} » La phrase marche.`,
          `Le groupe qui se déplace est **${e.circ}**.`,
        ],
      };
    }
    case 3: {
      const e = rng.pick(ENTREES);
      return {
        prompt: `Écris le groupe qu’on peut à la fois déplacer et supprimer : « ${base(e)} »`,
        answer: { kind: 'text', accepted: [e.circ] },
        traps: [textTrap(e.obj, whyObjet(e)), textTrap(e.gs, whySujet(e))],
        hint: 'Cherche le groupe qui peut aller au début de la phrase et aussi disparaître, sans casser la phrase.',
        steps: [
          TEST_DEPLACER,
          `« ${devant(e)} » est correcte. Et sans lui : « ${sansCirc(e)} » l’est aussi.`,
          `Le groupe est **${e.circ}**.`,
        ],
      };
    }
    case 4: {
      const e = rng.pick(ENTREES);
      const s = avecCirc(rng, e);
      return {
        prompt: `Écris le complément d’objet de cette phrase : « ${s} »`,
        answer: { kind: 'text', accepted: [e.obj] },
        traps: [
          textTrap(e.circ, `« ${e.circ} » peut se déplacer et se supprimer : c’est un groupe circonstanciel.`),
          textTrap(e.gs, whySujet(e)),
          ...sansPrep(e).map((t) => ({
            ...t,
            why: `Il manque « ${e.prep} » : ce petit mot fait partie du complément.`,
          })),
        ],
        hint: 'Cherche le groupe qui reste collé au verbe, même quand on essaie de déplacer les autres.',
        steps: [
          `Je cherche le groupe circonstanciel : « ${e.circ} » se déplace et se supprime.`,
          `Il reste après le verbe : « ${e.verbe} ${e.obj} ». Ce groupe ne peut pas bouger.`,
          `Le complément d’objet est **${e.obj}**.`,
        ],
      };
    }
    default: {
      const lines = pickN(rng, ENTREES, 4);
      const k = rng.int(1, 3);
      const texte = lines.map((e, i) => (i < k ? avecCirc(rng, e) : sansCirc(e)));
      return {
        prompt: 'Lis ce texte. Combien de phrases contiennent un groupe circonstanciel ?',
        figure: document('Quelques phrases', rng.shuffle(texte)),
        answer: num(k),
        traps: numTraps(r(k), [
          [4 - k, 'Tu as compté les phrases qui n’en ont pas. Cherche celles où un groupe se déplace.'],
          [k + 1, 'Tu en as compté un de trop : un complément d’objet ne se déplace pas.'],
          [k - 1, 'Il t’en manque un : cherche aussi les groupes placés au début, avant la virgule.'],
        ]),
        hint: 'Dans chaque phrase, cherche un groupe qui peut être déplacé et supprimé.',
        steps: [
          'Pour chaque phrase, je cherche un groupe qui peut être déplacé et supprimé.',
          'Je ne compte pas les compléments d’objet : ils restent collés au verbe.',
          `Je compte les phrases avec un groupe circonstanciel : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. COD ou COI ─────────────────────────

const COD = 'un COD (complément d’objet direct)';
const COI = 'un COI (complément d’objet indirect)';
const CIRC = 'un groupe circonstanciel';
const whyCod = (e: Entree) =>
  `Il n’y a pas de petit mot (à, de) entre « ${e.verbe} » et « ${e.obj} » : c’est un COD, pas un COI.`;
const whyCoi = (e: Entree) =>
  `« ${e.obj} » est relié au verbe par « ${e.prep ?? 'à'} » : c’est un COI. Un COD n’a ni « à » ni « de » pour le relier au verbe.`;
const whyType = (e: Entree) => (e.type === 'cod' ? whyCod(e) : whyCoi(e));

const stepsCodCoi = (e: Entree) => [
  `Je pose la question après le verbe : « ${e.gs} ${e.q} ? » — ${e.obj}.`,
  e.type === 'cod'
    ? `Entre « ${e.verbe} » et « ${e.obj} », il n’y a ni « à » ni « de » : c’est un COD.`
    : `Entre « ${e.verbe} » et le nom, il y a « ${e.prep ?? 'à'} » : c’est un COI.`,
  `Le groupe « ${e.obj} » est **${e.type === 'cod' ? 'un COD' : 'un COI'}**.`,
];

function codCoiDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const e = rng.pick(ENTREES);
      const bon = e.type === 'cod' ? COD : COI;
      const { answer, traps } = choice(rng, bon, [
        { label: e.type === 'cod' ? COI : COD, why: whyType(e) },
        {
          label: CIRC,
          why: `« ${e.obj} » répond à la question « ${e.gs} ${e.q} ? » et ne se déplace pas : c’est un complément d’objet.`,
        },
      ]);
      return {
        prompt: `Dans « ${sansCirc(e)} », le groupe « ${e.obj} » est…`,
        answer,
        traps,
        hint: 'Regarde s’il y a un petit mot (à, de) entre le verbe et le complément.',
        steps: stepsCodCoi(e),
      };
    }
    case 2: {
      const cible = rng.pick(['cod', 'coi'] as const);
      const bon = rng.pick(cible === 'cod' ? cods : cois);
      const faux = pickN(rng, cible === 'cod' ? cois : cods, 3);
      const options = rng.shuffle([bon, ...faux]);
      return {
        prompt: `Dans quelle phrase y a-t-il un ${cible === 'cod' ? 'COD' : 'COI'} ?`,
        answer: { kind: 'choice', options: options.map(sansCirc), correct: options.indexOf(bon) },
        traps: options.flatMap((e, i) =>
          e === bon
            ? []
            : [
                {
                  option: i,
                  why:
                    cible === 'cod'
                      ? `Dans cette phrase, « ${e.obj} » est relié au verbe par « ${e.prep ?? 'à'} » : c’est un COI.`
                      : `Dans cette phrase, « ${e.obj} » suit le verbe sans « à » ni « de » : c’est un COD.`,
                },
              ],
        ),
        hint: 'Pour chaque phrase, regarde ce qui suit le verbe : un petit mot (à, de) ou rien.',
        steps: [
          'Dans chaque phrase, je cherche ce qui suit le verbe.',
          'Un COD suit le verbe sans « à » ni « de ». Un COI est relié au verbe par « à » ou « de ».',
          `La bonne phrase est : **${sansCirc(bon)}**`,
        ],
      };
    }
    case 3: {
      const e = rng.pick(ENTREES);
      const s = avecCirc(rng, e);
      const [bon, autre] = e.type === 'cod' ? ['COD', 'COI'] : ['COI', 'COD'];
      const whyHorsVerbe = `« ${e.circ} » peut se déplacer et se supprimer : c’est un groupe circonstanciel, pas un complément d’objet.`;
      const { answer, traps } = choice(rng, `« ${e.obj} » : ${bon}`, [
        { label: `« ${e.obj} » : ${autre}`, why: whyType(e) },
        { label: `« ${e.circ} » : ${bon}`, why: whyHorsVerbe },
        { label: `« ${e.circ} » : ${autre}`, why: whyHorsVerbe },
      ]);
      return {
        prompt: `Dans « ${s} », quel est le complément d’objet, et de quel type est-il ?`,
        answer,
        traps,
        hint: 'Mets d’abord de côté le groupe qui se déplace. Regarde ensuite s’il y a « à » ou « de » après le verbe.',
        steps: [`Je mets de côté « ${e.circ} » : il se déplace, c’est un groupe circonstanciel.`, ...stepsCodCoi(e)],
      };
    }
    case 4: {
      const type = rng.pick(['cod', 'coi'] as const);
      const e = rng.pick(type === 'cod' ? cods : cois);
      const s = avecCirc(rng, e);
      return {
        prompt: `Écris le ${type === 'cod' ? 'COD' : 'COI'} de cette phrase : « ${s} »`,
        answer: { kind: 'text', accepted: [e.obj] },
        traps: [
          textTrap(
            e.circ,
            `« ${e.circ} » peut se déplacer et se supprimer : c’est un groupe circonstanciel, pas un complément d’objet.`,
          ),
          textTrap(e.gs, whySujet(e)),
          ...sansPrep(e),
        ],
        hint: 'Mets de côté le groupe qui peut se déplacer. Pose ensuite la question après le verbe.',
        steps: [
          `Je mets de côté « ${e.circ} » : il se déplace, c’est un groupe circonstanciel.`,
          `Je pose la question : « ${e.gs} ${e.q} ? » — ${e.obj}.`,
          `Le ${type === 'cod' ? 'COD' : 'COI'} est **${e.obj}**.`,
        ],
      };
    }
    default: {
      const k = rng.int(1, 2);
      const lines = rng.shuffle([...pickN(rng, cois, k), ...pickN(rng, cods, 3 - k)]);
      return {
        prompt: 'Lis ce texte. Dans combien de phrases le complément d’objet est-il un COI ?',
        figure: document(
          'Quelques phrases',
          lines.map((e) => base(e)),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [3 - k, 'Tu as compté les COD. Un COI est relié au verbe par « à » ou « de ».'],
          [
            k + 1,
            'Tu en as compté un de trop : un groupe circonstanciel peut commencer par « à », ce n’est pas un COI.',
          ],
          [k - 1, 'Il t’en manque un : cherche « à » ou « de » juste après le verbe.'],
        ]),
        hint: 'Ignore le groupe qui peut se déplacer. Regarde ce qui suit le verbe.',
        steps: [
          'Dans chaque phrase, je mets de côté le groupe circonstanciel.',
          'Je regarde ce qui suit le verbe : « à » ou « de » devant le complément, c’est un COI.',
          `Je compte les COI : **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Repérer les groupes circonstanciels ─────────────────────────

const NOMBRE = ['aucun', 'un', 'deux', 'trois'] as const;

const whyNombre = (w: number, juste: number): string =>
  w === 0
    ? 'Il y en a : un groupe qui dit où ou quand se déplace et se supprime.'
    : w < juste
      ? 'Tu en as oublié un : relis le début et la fin de la phrase.'
      : 'Tu en as compté trop : le complément d’objet ne se déplace pas, ce n’est pas un groupe circonstanciel.';

function circonstancielsDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const e = rng.pick(ENTREES);
      const { answer, traps } = choice(rng, e.circ, [
        { label: e.obj, why: whyObjet(e) },
        { label: e.gs, why: whySujet(e) },
      ]);
      return {
        prompt: `Quel groupe est un groupe circonstanciel dans « ${base(e)} » ?`,
        answer,
        traps,
        hint: 'Il donne un détail : où ou quand. On peut le déplacer et le supprimer.',
        steps: [
          'Un groupe circonstanciel donne un détail (où ? quand ?). On peut le déplacer et le supprimer.',
          `« ${devant(e)} » et « ${sansCirc(e)} » restent correctes.`,
          `Le groupe circonstanciel est **${e.circ}**.`,
        ],
      };
    }
    case 2: {
      const e = rng.pick(ENTREES);
      const avant = e.avant && rng.int(0, 1) === 1 ? rng.pick(e.avant) : undefined;
      const juste = avant ? 2 : 1;
      const s = avant ? deux(e, avant) : base(e);
      const { answer, traps } = choice(
        rng,
        NOMBRE[juste],
        NOMBRE.map((label, w) => ({ label, why: whyNombre(w, juste) })),
      );
      return {
        prompt: `Combien de groupes circonstanciels cette phrase contient-elle ? « ${s} »`,
        answer,
        traps,
        hint: 'Cherche les groupes qui donnent un détail et que tu peux déplacer et supprimer. Regarde le début et la fin.',
        steps: [
          'Je cherche les groupes qui disent où ou quand, et qu’on peut déplacer et supprimer.',
          avant
            ? `Il y en a un au début, « ${avant} », et un à la fin, « ${e.circ} ».`
            : `Il y en a un seul : « ${e.circ} ». « ${e.obj} » complète le verbe, il ne compte pas.`,
          `Il y en a **${NOMBRE[juste]}**.`,
        ],
      };
    }
    case 3: {
      const e = rng.pick(deLieu);
      const avant = rng.pick(e.avant);
      return {
        prompt: `Écris le groupe circonstanciel qui est à la fin de cette phrase : « ${deux(e, avant)} »`,
        answer: { kind: 'text', accepted: [e.circ] },
        traps: [
          textTrap(avant, `« ${avant} » est aussi un groupe circonstanciel, mais il est au début de la phrase.`),
          textTrap(e.obj, whyObjet(e)),
          textTrap(
            `${e.obj} ${e.circ}`,
            `Tu as pris deux groupes : « ${e.obj} » complète le verbe, il ne fait pas partie du groupe circonstanciel.`,
          ),
        ],
        hint: 'Regarde la fin de la phrase : où s’arrête le complément d’objet ? Ce qui suit peut se déplacer.',
        steps: [
          `Le complément d’objet est « ${e.obj} » : il reste avec le verbe.`,
          `Après lui, « ${e.circ} » peut se déplacer et se supprimer.`,
          `Le groupe de la fin est **${e.circ}**.`,
        ],
      };
    }
    case 4: {
      const e = rng.pick(ENTREES);
      const s = avecCirc(rng, e);
      return {
        prompt: `Écris le groupe circonstanciel de cette phrase : « ${s} »`,
        answer: { kind: 'text', accepted: [e.circ] },
        traps: [
          textTrap(
            e.obj,
            e.type === 'coi'
              ? `« ${e.obj} » commence par « ${e.prep ?? 'à'} », mais il ne se déplace pas : c’est un complément d’objet.`
              : whyObjet(e),
          ),
          textTrap(e.gs, whySujet(e)),
        ],
        hint: 'Un petit mot comme « à » ou « dans » ne suffit pas. Teste : quel groupe peut se déplacer et disparaître ?',
        steps: [
          'Je teste chaque groupe : lequel peut se déplacer et se supprimer ?',
          `« ${e.circ} » peut : « ${devant(e)} » et « ${sansCirc(e)} » restent correctes.`,
          `Le groupe circonstanciel est **${e.circ}**.`,
        ],
      };
    }
    default: {
      // Au moins une phrase à deux groupes : sinon, compter les phrases suffirait.
      const double = rng.pick(deLieu);
      const autres = pickN(
        rng,
        ENTREES.filter((e) => e.gs !== double.gs || e.obj !== double.obj),
        2,
      ).map((e) => {
        const avant = e.avant && rng.int(0, 1) === 1 ? rng.pick(e.avant) : undefined;
        return { texte: avant ? deux(e, avant) : avecCirc(rng, e), n: avant ? 2 : 1 };
      });
      const lignes = rng.shuffle([{ texte: deux(double, rng.pick(double.avant)), n: 2 }, ...autres]);
      const total = lignes.reduce((n, l) => n + l.n, 0);
      return {
        prompt: 'Lis ce texte. Combien de groupes circonstanciels contient-il en tout ?',
        figure: document(
          'Quelques phrases',
          lignes.map((l) => l.texte),
        ),
        answer: num(total),
        traps: numTraps(r(total), [
          [total - 1, 'Il t’en manque un : relis chaque phrase, au début comme à la fin.'],
          [total + 1, 'Tu en as compté un de trop : un complément d’objet reste collé au verbe, il ne compte pas.'],
          [3, 'Tu as compté un groupe par phrase. Certaines phrases en ont deux.'],
        ]),
        hint: 'Phrase par phrase, cherche les groupes qu’on peut déplacer et supprimer, au début comme à la fin.',
        steps: [
          'Pour chaque phrase, je cherche les groupes qu’on peut déplacer et supprimer.',
          'Je ne compte pas le complément d’objet, collé au verbe.',
          `Je compte : **${total}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Les manipulations ─────────────────────────

const phraseDe = (e: Entree, m: Manip) => resultat(e, m);
/** Deux manipulations enchaînées (niveau 5). */
const ENCHAINEMENTS: readonly (readonly [Manip, Manip])[] = [
  ['remplacer', 'deplacer'],
  ['remplacer', 'encadrer'],
  ['ajouter', 'deplacer'],
  ['ajouter', 'supprimer'],
];

function manipulationsDraft(rng: Rng, level: Level): QuestionDraft {
  // « ajouter » peut apparaître aux niveaux 2, 4 et 5 : seules les phrases qui acceptent « souvent » y servent.
  const e = rng.pick(level === 1 || level === 3 ? ENTREES : deLieu);
  const depart = base(e);
  switch (level) {
    case 1: {
      const m = rng.pick(['deplacer', 'supprimer', 'encadrer'] as const);
      const autres = (['deplacer', 'supprimer', 'encadrer'] as const).filter((x) => x !== m);
      const { answer, traps } = choice(
        rng,
        NOM_MANIP[m],
        autres.map((x) => ({ label: NOM_MANIP[x], why: `${DEFINITION[x]} Ici, ${CONSTAT[m]}.` })),
      );
      return {
        prompt: `On part de « ${depart} ». On obtient « ${phraseDe(e, m)} » Quelle manipulation a-t-on faite ?`,
        answer,
        traps,
        hint: 'Compare les deux phrases : qu’est-ce qui a changé ? Un groupe a-t-il disparu, bougé, ou est-il entouré ?',
        steps: ['Je compare les deux phrases mot à mot.', `Ici, ${CONSTAT[m]}.`, `On a fait : **${NOM_MANIP[m]}**.`],
      };
    }
    case 2: {
      const m = rng.pick(MANIPS);
      const faux = pickN(
        rng,
        MANIPS.filter((x) => x !== m),
        3,
      );
      const options = rng.shuffle([m, ...faux]);
      return {
        prompt: `Phrase de départ : « ${depart} » Consigne : ${consigne(e, m)}. Quelle phrase obtient-on ?`,
        answer: { kind: 'choice', options: options.map((x) => phraseDe(e, x)), correct: options.indexOf(m) },
        traps: options.flatMap((x, i) =>
          x === m
            ? []
            : [
                {
                  option: i,
                  why: `Cette phrase est obtenue ${EN_FAISANT[x]}. La consigne demande de ${NOM_MANIP[m]}.`,
                },
              ],
        ),
        hint: 'Applique la consigne à la phrase de départ, puis cherche la phrase qui correspond.',
        steps: [
          `Je lis la consigne : ${consigne(e, m)}.`,
          `Je l’applique à la phrase de départ : ${DEFINITION[m]}`,
          `La bonne phrase est : **${phraseDe(e, m)}**`,
        ],
      };
    }
    case 3: {
      const m = rng.pick(['deplacer', 'supprimer', 'remplacer'] as const);
      const autres = pickN(
        rng,
        manipsDe(e).filter((x) => x !== m),
        2,
      );
      return {
        prompt: `Phrase de départ : « ${depart} » Consigne : ${consigne(e, m)}. Écris la nouvelle phrase.`,
        answer: { kind: 'text', accepted: ecritures(phraseDe(e, m)) },
        traps: autres.flatMap((x) =>
          ecritures(phraseDe(e, x)).map((t) =>
            textTrap(t, `Cette phrase est obtenue ${EN_FAISANT[x]}. La consigne demande de ${NOM_MANIP[m]}.`),
          ),
        ),
        hint: 'Recopie la phrase en changeant seulement ce que la consigne demande.',
        steps: [
          `Je lis la consigne : ${consigne(e, m)}.`,
          DEFINITION[m],
          `La nouvelle phrase est : **${phraseDe(e, m)}**`,
        ],
      };
    }
    case 4: {
      const m = rng.pick(['encadrer', 'ajouter'] as const);
      const pieges =
        m === 'encadrer'
          ? [
              ...ecritures(phraseDe(e, 'deplacer')).map((t) =>
                textTrap(
                  t,
                  'Tu as déplacé le groupe, mais tu n’as pas écrit « C’est… que » : ce n’est pas un encadrement.',
                ),
              ),
              textTrap(
                `C’est ${e.circ} ${lowerFirst(e.gs)} ${e.verbe} ${e.obj}.`,
                'Il manque « que » : on encadre le groupe avec « C’est… que ».',
              ),
            ]
          : [
              textTrap(depart, 'Tu as recopié la phrase de départ : il fallait ajouter « souvent ».'),
              textTrap(
                `${e.gs} ${e.verbe} ${e.obj} ${e.circ} souvent.`,
                'Le mot est ajouté, mais pas au bon endroit : la consigne dit « juste après le verbe ».',
              ),
            ];
      return {
        prompt: `Phrase de départ : « ${depart} » Consigne : ${consigne(e, m)}. Écris la nouvelle phrase.`,
        answer: { kind: 'text', accepted: ecritures(phraseDe(e, m)) },
        traps: pieges,
        hint:
          m === 'encadrer'
            ? 'Le groupe encadré se place entre « C’est » et « que ». Le reste de la phrase suit.'
            : 'Le mot vient s’intercaler. Le reste de la phrase ne change pas.',
        steps: [
          `Je lis la consigne : ${consigne(e, m)}.`,
          DEFINITION[m],
          `La nouvelle phrase est : **${phraseDe(e, m)}**`,
        ],
      };
    }
    default: {
      const [m1, m2] = rng.pick(ENCHAINEMENTS);
      // La seconde manipulation porte sur la phrase déjà transformée.
      const apres = m1 === 'remplacer' ? { ...e, circ: e.autre } : e;
      const milieu = phraseDe(e, m1);
      const fin = m1 === 'remplacer' ? phraseDe(apres, m2) : phraseDe(e, m2).replace(e.verbe, `${e.verbe} souvent`);
      const attendu = ecritures(fin);
      return {
        prompt: `Phrase de départ : « ${depart} » Fais les deux consignes, l’une après l’autre : 1) ${consigne(e, m1)} ; 2) ${consigne(apres, m2)}. Écris la phrase obtenue à la fin.`,
        answer: { kind: 'text', accepted: attendu },
        traps: [
          ...ecritures(milieu).map((t) =>
            textTrap(t, 'Tu as suivi la première consigne seulement : fais aussi la seconde.'),
          ),
          ...ecritures(phraseDe(e, m2)).map((t) =>
            textTrap(t, 'Tu as suivi la seconde consigne seulement : commence par la première.'),
          ),
        ],
        hint: 'Écris au brouillon la phrase après la première consigne, puis transforme cette nouvelle phrase.',
        steps: [
          `Première consigne : « ${milieu} »`,
          `Seconde consigne, sur cette nouvelle phrase : ${DEFINITION[m2]}`,
          `La phrase obtenue est : **${fin}**`,
        ],
      };
    }
  }
}

// ───────────────────────── Notions du chapitre ─────────────────────────

interface Notion {
  readonly id: string;
  readonly title: string;
  readonly memo: readonly string[];
  readonly factId: string;
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: { memo: n.memo, source: programme(n.factId), sources: [PROGRAMME] },
  generate: n.generate,
});

export const FCM1_COMPLEMENTS: readonly Skill[] = [
  skill({
    id: 'fcm1-objet-circonstanciel',
    title: 'Complément d’objet ou groupe circonstanciel',
    memo: [
      'Un **complément d’objet** complète le verbe : il reste collé à lui. Un **groupe circonstanciel** donne un détail (où ? quand ?) : il se déplace.',
      'Teste en déplaçant : « Dans le jardin, ma cousine mange une pomme. » marche. Mais « Une pomme, ma cousine mange » ne marche pas.',
      'Supprimer ne suffit pas : certains compléments d’objet se suppriment aussi (« Ma voisine parle à son chien. » → « Ma voisine parle. »), mais ils ne se déplacent pas.',
    ],
    factId: 'objet-circ',
    generate: objetCircDraft,
  }),
  skill({
    id: 'fcm1-cod-coi',
    title: 'COD ou COI dans des phrases simples',
    memo: [
      'Le **COD** suit le verbe sans « à » ni « de ». Pose « qui ? » ou « quoi ? » après le verbe : « Ma cousine mange quoi ? Une pomme. »',
      'Le **COI** est relié au verbe par une **préposition**, souvent « à » ou « de ». Pose « à qui ? », « à quoi ? », « de qui ? » ou « de quoi ? » : « Ma voisine parle à son chien. »',
      'Méthode : trouve le verbe, pose la question, puis regarde s’il y a « à » ou « de » devant la réponse.',
    ],
    factId: 'cod-coi',
    generate: codCoiDraft,
  }),
  skill({
    id: 'fcm1-groupes-circonstanciels',
    title: 'Repérer les groupes circonstanciels',
    memo: [
      'Un **groupe circonstanciel** donne un détail sur l’action, par exemple où elle se passe, ou quand. On peut le déplacer et le supprimer, la phrase reste correcte.',
      'Supprimer ne suffit pas : certains compléments d’objet se suppriment aussi (« Ma voisine parle à son chien. » → « Ma voisine parle. »), mais ils ne se déplacent pas.',
      'Au début de la phrase, on met souvent une virgule après lui. Une phrase peut en avoir plusieurs : « Ce matin, ma cousine mange une pomme dans le jardin. »',
    ],
    factId: 'circonstanciels',
    generate: circonstancielsDraft,
  }),
  skill({
    id: 'fcm1-manipulations',
    title: 'Manipuler une phrase : déplacer, supprimer, remplacer, ajouter, encadrer',
    memo: [
      'Une **manipulation** est un petit test pour mieux comprendre une phrase. Il y en a cinq : déplacer, supprimer, remplacer, ajouter, **encadrer**.',
      'Exemples : déplacer → « Dans le jardin, ma cousine mange une pomme. » ; supprimer → « Ma cousine mange une pomme. » ; remplacer → « Ma cousine mange une pomme sur la terrasse. » ; ajouter → « Ma cousine mange souvent une pomme dans le jardin. »',
      'Encadrer : on entoure le groupe avec « C’est… que » : « C’est dans le jardin que ma cousine mange une pomme. »',
    ],
    factId: 'manipulations',
    generate: manipulationsDraft,
  }),
];
