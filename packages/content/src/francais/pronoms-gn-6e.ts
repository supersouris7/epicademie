import { choice } from '../build.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Skill } from '../types.ts';
import {
  COMPLEMENTS_DU_NOM,
  COMPLETS,
  DEUX_FONCTIONS,
  DOUBLES_REPRISES,
  EPITHETES,
  GROUPES_NOMINAUX,
  GROUPES_PREPOSITIONNELS,
  MARQUES,
  OBJETS_PRONOMS,
  RECITS,
  REMPLACEMENTS,
  REPRISES,
  SUJETS_PRONOMS,
  faitPronomsGn6e,
  sourcesPronomsGn6e,
  type AvecExpansion,
  type Expansion,
  type FonctionGn,
  type FonctionPronom,
  type GroupeNom,
  type PronomPhrase,
  type Reprise,
} from './pronoms-gn-6e.donnees.ts';
import { at, document, listes, pickN, saisies, segments, textTraps } from './outils.ts';

/**
 * Chapitre « Pronoms et groupe nominal » (6e). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue, 6e : « Identifier les mots, un groupe de mots selon leur nature » et
 * « Analyser le groupe nominal ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), 6e — « ${faitPronomsGn6e(id).citation} »`;

// ───────────────────────── 1. Le pronom personnel et sa fonction ─────────────────────────

const FONCTIONS_PRONOM: readonly FonctionPronom[] = [
  'sujet',
  'complément d’objet direct',
  'complément d’objet indirect',
];
const DEF_PRONOM =
  'La forme et la fonction du pronom personnel vont ensemble : le sujet commande le verbe, le COD complète le verbe sans préposition, le COI correspond souvent à un complément avec « à ».';
const whyFonction = (p: PronomPhrase, choisie: string): string =>
  choisie === 'attribut du sujet'
    ? `« ${p.verbe} » n’est pas un verbe attributif : « ${p.pronom} » ne dit pas ce qu’est le sujet. ${p.preuve}`
    : `Ici, « ${p.pronom} » n’est pas ${choisie}. ${p.preuve}`;

function pronomFonctionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick(SUJETS_PRONOMS);
      const { answer, traps } = choice(rng, p.pronom, [
        { label: p.verbe, why: `« ${p.verbe} » est le verbe : il change avec le temps et la personne.` },
        { label: p.nom, why: `« ${p.nom} » est un nom : un déterminant le précède.` },
      ]);
      return {
        prompt: `Dans « ${p.phrase} », quel mot est un pronom personnel ?`,
        answer,
        traps,
        hint: 'Cherche le petit mot qui indique la personne : qui parle, à qui, ou de qui.',
        steps: [
          'Les pronoms personnels varient selon la personne, le genre, le nombre et la fonction.',
          p.preuve,
          `Le pronom personnel est **${p.pronom}**.`,
        ],
      };
    }
    case 2: {
      const p = rng.pick([...OBJETS_PRONOMS, ...SUJETS_PRONOMS]);
      const { answer, traps } = choice(
        rng,
        p.fonction,
        [...FONCTIONS_PRONOM, 'attribut du sujet']
          .filter((f) => f !== p.fonction)
          .map((f) => ({ label: f, why: whyFonction(p, f) })),
      );
      return {
        prompt: `Dans « ${p.phrase} », quelle est la fonction du pronom « ${p.pronom} » ?`,
        answer,
        traps,
        hint: 'Trouve d’abord qui commande le verbe. Sinon, construis le verbe avec « quelqu’un » : faut-il « à » ?',
        steps: [DEF_PRONOM, p.preuve, `« ${p.pronom} » est **${p.fonction}**.`],
      };
    }
    case 3: {
      const r = rng.pick(REMPLACEMENTS);
      const accepted = [r.pronom];
      const candidats: readonly (readonly [string, string])[] =
        r.fonction === 'sujet'
          ? (['Il', 'Elle', 'Ils', 'Elles'] as const).map((c) => [
              c,
              `« ${c} » ne convient pas : « ${r.groupe} » est au ${r.accord}.`,
            ])
          : (['le', 'la', 'les', 'lui', 'leur'] as const).map((c) => [
              c,
              `« ${c} » ne convient pas : « ${r.groupe} » est ${r.fonction} (${r.accord}).`,
            ]);
      return {
        prompt: `Remplace « ${r.groupe} » par un pronom personnel : « ${r.phrase} » devient « ${r.trou} » Écris le pronom.`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, candidats),
        hint: 'Cherche d’abord la fonction du groupe, puis son genre et son nombre.',
        steps: [
          DEF_PRONOM,
          `« ${r.groupe} » est ${r.fonction} (${r.accord}) : le pronom doit avoir la même fonction.`,
          `Le pronom est **${r.pronom}**.`,
        ],
      };
    }
    case 4: {
      const d = rng.pick(DEUX_FONCTIONS);
      return {
        prompt: `Analyse les deux pronoms de la phrase « ${d.phrase} »`,
        answer: {
          kind: 'cloze',
          parts: segments(['Pronom sujet : ', 'Pronom complément : ', 'Fonction du pronom complément : ']),
          blanks: [...saisies([d.sujet, d.complement]), ...listes(FONCTIONS_PRONOM.slice(1), [d.fonction])],
        },
        hint: 'La place ne suffit pas : repère le pronom qui commande le verbe, puis construis le verbe avec « quelqu’un ».',
        steps: [
          'Les pronoms « nous » et « vous » peuvent être sujet, COD ou COI ; « me » et « te » peuvent être COD ou COI.',
          `« ${d.sujet} » commande le verbe : c’est le sujet. On dit « ${d.construction} » : « ${d.complement} » est donc ${d.fonction}.`,
          `Réponses : **${d.sujet}** ; **${d.complement}** ; **${d.fonction}**.`,
        ],
      };
    }
    default: {
      const lignes = rng.shuffle([
        rng.pick(SUJETS_PRONOMS),
        rng.pick(OBJETS_PRONOMS.filter((o) => o.fonction === 'complément d’objet direct')),
        rng.pick(OBJETS_PRONOMS.filter((o) => o.fonction === 'complément d’objet indirect')),
      ]);
      const r = rng.pick(REMPLACEMENTS);
      return {
        prompt: `Lis le texte. Donne la fonction du pronom indiqué aux lignes 1 à 3. À la ligne 4, remplace « ${r.groupe} » par un pronom.`,
        figure: document('Carnet de bord', [...lignes.map((l) => l.phrase), r.phrase]),
        answer: {
          kind: 'cloze',
          parts: segments([
            ...lignes.map((l, i) => `Ligne ${i + 1}, « ${l.pronom} » : `),
            'Ligne 4, pronom de remplacement : ',
          ]),
          blanks: [
            ...listes(
              FONCTIONS_PRONOM,
              lignes.map((l) => l.fonction),
            ),
            ...saisies([r.pronom]),
          ],
        },
        hint: 'Analyse chaque verbe séparément. Pour la ligne 4, la fonction du groupe décide de la forme du pronom.',
        steps: [
          DEF_PRONOM,
          `${lignes.map((l, i) => `Ligne ${i + 1}, « ${l.pronom} » : ${l.preuve}`).join(' ')} Ligne 4 : « ${r.groupe} » est ${r.fonction} (${r.accord}).`,
          `Réponses : **${lignes.map((l) => l.fonction).join(' ; ')}** ; **${r.pronom}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Le pronom et son antécédent ─────────────────────────

const DEF_ANTECEDENT =
  'L’antécédent est le groupe nominal dont le pronom tient lieu. Le pronom de la troisième personne en prend le genre et le nombre.';
const texte = (r: Reprise) => `${r.premiere} ${r.pronom} ${r.suite}`;
const preuveReprise = (r: Reprise) =>
  `« ${r.pronom} » est au ${MARQUES[r.pronom]}, comme « ${r.antecedent} », et la phrase garde son sens.`;
const whyAutre = (r: Reprise) =>
  `« ${r.autre} » n’est pas au ${MARQUES[r.pronom]} : « ${r.pronom} » ne peut pas le reprendre.`;
const sansDeterminant = (gn: string) => gn.slice(gn.indexOf(' ') + 1);

function antecedentDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const r = rng.pick(REPRISES);
      const { answer, traps } = choice(rng, r.antecedent, [
        { label: r.autre, why: whyAutre(r) },
        {
          label: r.verbe,
          why: `« ${r.verbe} » est un verbe : un antécédent de pronom personnel est un groupe nominal.`,
        },
      ]);
      return {
        prompt: `« ${texte(r)} » Quel est l’antécédent du pronom « ${r.pronom} » ?`,
        answer,
        traps,
        hint: 'Observe si le pronom est masculin ou féminin, singulier ou pluriel.',
        steps: [DEF_ANTECEDENT, preuveReprise(r), `L’antécédent est **${r.antecedent}**.`],
      };
    }
    case 2: {
      const r = rng.pick(REPRISES);
      const pronoms = ['Il', 'Elle', 'Ils', 'Elles'] as const;
      const { answer, traps } = choice(
        rng,
        r.pronom,
        pronoms
          .filter((p) => p !== r.pronom)
          .map((p) => ({
            label: p,
            why: `« ${p} » est au ${MARQUES[p]}, alors que « ${r.antecedent} » est au ${MARQUES[r.pronom]}.`,
          })),
        true,
      );
      return {
        prompt: `Quel pronom reprend « ${r.antecedent} » ? « ${r.premiere} … ${r.suite} »`,
        answer,
        traps,
        hint: 'Cherche le genre et le nombre du nom principal du groupe à reprendre.',
        steps: [DEF_ANTECEDENT, preuveReprise(r), `Le pronom est **${r.pronom}**.`],
      };
    }
    case 3: {
      const r = rng.pick(REPRISES);
      const accepted = [r.antecedent];
      return {
        prompt: `Écris en entier l’antécédent de « ${r.pronom} » : « ${texte(r)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [r.autre, whyAutre(r)],
          [
            sansDeterminant(r.antecedent),
            `L’antécédent est le groupe nominal entier : n’oublie aucun mot de « ${r.antecedent} ».`,
          ],
          [r.pronom, `« ${r.pronom} » est le pronom : cherche le groupe nominal qu’il reprend.`],
        ]),
        hint: 'Relis la première phrase : quel groupe nominal a le même genre et le même nombre que le pronom ?',
        steps: [DEF_ANTECEDENT, preuveReprise(r), `L’antécédent est **${r.antecedent}**.`],
      };
    }
    case 4: {
      const d = rng.pick(DOUBLES_REPRISES);
      const { sujet, complement } = d;
      return {
        prompt: `« ${d.premiere} ${d.seconde} » Écris l’antécédent de chaque pronom, en entier.`,
        answer: {
          kind: 'cloze',
          parts: segments([`Antécédent de « ${sujet.pronom} » : `, `Antécédent de « ${complement.pronom} » : `]),
          blanks: saisies([sujet.antecedent, complement.antecedent]),
        },
        hint: 'Demande-toi qui fait l’action, puis qui la reçoit. Vérifie le genre et le nombre.',
        steps: [
          DEF_ANTECEDENT,
          `Le sujet « ${sujet.pronom} » reprend « ${sujet.antecedent} », qui fait l’action ; « ${complement.pronom} » est un pronom complément qui reprend l’autre groupe.`,
          `Réponses : **${sujet.antecedent}** ; **${complement.antecedent}**.`,
        ],
      };
    }
    default: {
      const r = rng.pick(RECITS);
      const { milieu, sujet, complement } = r;
      return {
        prompt: `Lis le récit « ${r.titre} ». Retrouve les antécédents (groupes nominaux entiers) et la fonction demandée.`,
        figure: document(r.titre, r.lignes),
        answer: {
          kind: 'cloze',
          parts: segments([
            `Ligne 2, antécédent de « ${milieu.pronom} » : `,
            `Ligne 2, fonction de « ${milieu.pronom} » : `,
            `Ligne 4, antécédent de « ${sujet.pronom} » : `,
            `Ligne 4, antécédent de « ${complement.pronom} » : `,
          ]),
          blanks: [
            ...saisies([milieu.antecedent]),
            ...listes(FONCTIONS_PRONOM, [milieu.fonction]),
            ...saisies([sujet.antecedent, complement.antecedent]),
          ],
        },
        hint: 'Remonte dans le texte à partir de chaque pronom, puis remplace-le par le groupe trouvé : la phrase doit garder son sens.',
        steps: [
          DEF_ANTECEDENT,
          `« ${milieu.pronom} » complète le verbe de la ligne 2 : ${milieu.fonction === 'complément d’objet direct' ? 'sans préposition, c’est un COD' : 'il remplace un complément avec « à », c’est un COI'}. À la ligne 4, on cherche qui agit, puis sur quoi porte l’action.`,
          `Réponses : **${milieu.antecedent}** ; **${milieu.fonction}** ; **${sujet.antecedent}** ; **${complement.antecedent}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Le groupe nominal ─────────────────────────

const DEF_GN =
  'Le groupe nominal a pour noyau un nom, le plus souvent avec un déterminant et parfois une expansion. Il peut avoir plusieurs fonctions.';
const FONCTIONS_GN: readonly FonctionGn[] = [
  'sujet',
  'complément d’objet direct',
  'attribut du sujet',
  'complément circonstanciel',
];
const PREUVES_GN: Readonly<Record<FonctionGn, string>> = {
  sujet: 'il commande l’accord du verbe et se remplace par « il », « elle », « ils » ou « elles »',
  'complément d’objet direct': 'il complète le verbe sans préposition et ne peut pas être déplacé',
  'attribut du sujet': 'il suit un verbe attributif et dit ce qu’est le sujet',
  'complément circonstanciel': 'il précise les circonstances et peut se supprimer',
};
const preuveGn = (g: GroupeNom) => `« ${g.gn} » est ${g.fonction} : ${PREUVES_GN[g.fonction]}.`;
const consigneGn = (f: FonctionGn) => `le groupe nominal ${f}`;

function groupeNominalDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const g = rng.pick(GROUPES_NOMINAUX);
      const { answer, traps } = choice(rng, g.gn, [
        { label: g.verbe, why: `« ${g.verbe} » est un verbe : il ne peut pas être le noyau d’un groupe nominal.` },
        { label: g.coupe, why: `« ${g.coupe} » mélange des mots de deux groupes différents.` },
      ]);
      return {
        prompt: `Dans « ${g.phrase} », quelle suite de mots est un groupe nominal ?`,
        answer,
        traps,
        hint: 'Cherche un groupe construit autour d’un nom, qui ne contient pas le verbe conjugué.',
        steps: [DEF_GN, `Dans « ${g.gn} », le noyau est le nom « ${g.noyau} ».`, `Le groupe nominal est **${g.gn}**.`],
      };
    }
    case 2: {
      const g = rng.pick(GROUPES_NOMINAUX);
      const { answer, traps } = choice(
        rng,
        g.noyau,
        g.autres.map((mot) => ({
          label: mot,
          why: g.gn.split(/[ ’]/).includes(mot)
            ? `« ${mot} » dépend du nom principal : on ne peut pas réduire le groupe à ce mot.`
            : `« ${mot} » n’appartient pas au groupe « ${g.gn} ».`,
        })),
      );
      return {
        prompt: `Quel est le nom noyau du groupe nominal « ${g.gn} » dans la phrase « ${g.phrase} » ?`,
        answer,
        traps,
        hint: 'Retire les mots qui ajoutent des précisions : quel nom reste indispensable ?',
        steps: [
          DEF_GN,
          `Les autres mots du groupe déterminent ou précisent le nom « ${g.noyau} ».`,
          `Le noyau est **${g.noyau}**.`,
        ],
      };
    }
    case 3: {
      const g = rng.pick(GROUPES_NOMINAUX);
      const accepted = [g.gn];
      return {
        prompt: `Écris en entier ${consigneGn(g.fonction)} : « ${g.phrase} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [g.noyau, `« ${g.noyau} » n’est que le noyau : écris le groupe avec tous les mots qui en dépendent.`],
          [g.verbe, `« ${g.verbe} » est le verbe, pas un groupe nominal.`],
          [g.coupe, `« ${g.coupe} » mélange des mots de deux groupes.`],
        ]),
        hint: 'Repère le verbe, puis le groupe qui a la fonction demandée. N’oublie ni le déterminant ni les expansions.',
        steps: [DEF_GN, preuveGn(g), `Le groupe est **${g.gn}**.`],
      };
    }
    case 4: {
      const g = rng.pick(GROUPES_PREPOSITIONNELS);
      return {
        prompt: `Analyse le groupe introduit par la préposition « ${g.prep} » : « ${g.phrase} »`,
        answer: {
          kind: 'cloze',
          parts: segments([
            'Groupe nominal placé après la préposition : ',
            'Nom noyau : ',
            'Fonction du groupe prépositionnel : ',
          ]),
          blanks: [
            ...saisies([g.gn, g.noyau]),
            ...listes(['complément d’objet indirect', 'complément circonstanciel'], [g.fonction]),
          ],
        },
        hint: 'Écris le groupe sans la préposition. Puis demande-toi : le verbe réclame-t-il cette préposition, ou le groupe indique-t-il une circonstance (où, quand…) ?',
        steps: [
          'Un groupe nominal prépositionnel est un groupe nominal introduit par une préposition.',
          g.fonction === 'complément d’objet indirect'
            ? 'Ici, le verbe se construit avec cette préposition : le groupe complète le verbe.'
            : 'Ici, le verbe n’impose pas cette préposition : le groupe précise une circonstance (où, quand, malgré quoi) et peut se supprimer.',
          `Réponses : **${g.gn}** ; **${g.noyau}** ; **${g.fonction}**.`,
        ],
      };
    }
    default: {
      const [a, b, c] = pickN(rng, GROUPES_NOMINAUX, 3);
      if (!a || !b || !c) throw new Error('banque vide');
      return {
        prompt: `Lis le texte. Écris ${consigneGn(a.fonction)} de la ligne 1, donne la fonction de « ${b.gn} » et le noyau de « ${c.gn} ».`,
        figure: document('Phrases à analyser', [a.phrase, b.phrase, c.phrase]),
        answer: {
          kind: 'cloze',
          parts: segments(['Ligne 1, groupe nominal : ', 'Ligne 2, fonction : ', 'Ligne 3, nom noyau : ']),
          blanks: [...saisies([a.gn]), ...listes(FONCTIONS_GN, [b.fonction]), ...saisies([c.noyau])],
        },
        hint: 'Repère chaque verbe. Pour le noyau, cherche le nom dont dépendent les autres mots du groupe.',
        steps: [
          DEF_GN,
          `${preuveGn(a)} ${preuveGn(b)} Dans « ${c.gn} », les autres mots déterminent ou précisent le nom « ${c.noyau} ».`,
          `Réponses : **${a.gn}** ; **${b.fonction}** ; **${c.noyau}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Épithète ou complément du nom ─────────────────────────

const EXPANSIONS: readonly Expansion[] = ['épithète', 'complément du nom'];
const DEF_EXPANSION =
  'L’épithète (adjectif ou groupe adjectival) se rattache au nom directement. Le complément du nom étudié ici se rattache au nom par une préposition.';
const preuveExp = (e: AvecExpansion, f: Expansion) =>
  f === 'épithète'
    ? `« ${e.expansion} » complète le nom « ${e.noyau} » directement, sans préposition, et s’accorde avec lui.${e.gn.startsWith('de ') ? ' Ici, « de » est un déterminant (il remplace « des » devant l’adjectif), pas une préposition.' : ''}`
    : `« ${e.expansion} » complète le nom « ${e.noyau} » par l’intermédiaire d’une préposition.`;
const phraseExp = (e: AvecExpansion) => `${e.avant} ${e.gn}.`;
const banque = (f: Expansion) => (f === 'épithète' ? EPITHETES : COMPLEMENTS_DU_NOM);
const autreFonction = (f: Expansion): Expansion => (f === 'épithète' ? 'complément du nom' : 'épithète');
const designe = (f: Expansion) => (f === 'épithète' ? 'l’épithète' : 'le complément du nom');

function expansionDraft(rng: Rng, level: Level): QuestionDraft {
  const cible = rng.pick(EXPANSIONS);
  switch (level) {
    case 1: {
      const e = rng.pick(banque(cible));
      const { answer, traps } = choice(rng, cible, [
        { label: autreFonction(cible), why: preuveExp(e, cible) },
        {
          label: 'nom noyau',
          why: `Le nom noyau est « ${e.noyau} » : « ${e.expansion} » lui ajoute une précision.`,
        },
      ]);
      return {
        prompt: `Dans « ${e.gn} », quelle est la fonction de « ${e.expansion} » ?`,
        answer,
        traps,
        hint: 'Regarde comment ces mots sont reliés au nom : directement ou par une préposition ?',
        steps: [DEF_EXPANSION, preuveExp(e, cible), `« ${e.expansion} » est **${cible}**.`],
      };
    }
    case 2: {
      const bonne = rng.pick(banque(cible));
      const autres = pickN(
        rng,
        banque(autreFonction(cible)).filter((e) => e.noyau !== bonne.noyau),
        3,
      );
      const { answer, traps } = choice(
        rng,
        bonne.gn,
        autres.map((e) => ({ label: e.gn, why: preuveExp(e, autreFonction(cible)) })),
      );
      return {
        prompt: `Quel groupe nominal contient ${cible === 'épithète' ? 'une épithète' : 'un complément du nom'} ?`,
        answer,
        traps,
        hint: 'Dans chaque groupe, trouve le nom noyau puis cherche s’il y a une préposition avant l’expansion.',
        steps: [DEF_EXPANSION, preuveExp(bonne, cible), `La réponse est **${bonne.gn}**.`],
      };
    }
    case 3: {
      const e = rng.pick(banque(cible));
      const accepted = [e.expansion];
      return {
        prompt: `Écris en entier ${designe(cible)} qui précise « ${e.noyau} » : « ${phraseExp(e)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [e.noyau, `« ${e.noyau} » est le nom noyau : écris les mots qui le complètent.`],
          [e.gn, `« ${e.gn} » est le groupe nominal entier : isole seulement l’expansion.`],
          [
            e.expansion.slice(e.expansion.search(/[ ’]/) + 1),
            cible === 'épithète'
              ? `Écris le groupe adjectival entier : « ${e.expansion} ».`
              : `La préposition fait partie du complément du nom : « ${e.expansion} ».`,
          ],
        ]),
        hint: 'Retire du groupe nominal le déterminant et le nom noyau : observe ce qui reste.',
        steps: [DEF_EXPANSION, preuveExp(e, cible), `La réponse est **${e.expansion}**.`],
      };
    }
    case 4: {
      const g = rng.pick(COMPLETS);
      return {
        prompt: `Analyse le groupe nominal « ${g.gn} ». Il contient deux expansions.`,
        answer: {
          kind: 'cloze',
          parts: segments(['Nom noyau : ', 'Épithète (en entier) : ', 'Complément du nom (en entier) : ']),
          blanks: saisies([g.noyau, g.epithete, g.complement]),
        },
        hint: 'Les deux expansions ne sont pas forcément placées après le nom. Vérifie avec quel nom l’adjectif s’accorde.',
        steps: [
          DEF_EXPANSION,
          `Le noyau est « ${g.noyau} ». « ${g.epithete} » s’y rattache sans préposition ; « ${g.complement} » commence par une préposition.`,
          `Réponses : **${g.noyau}** ; **${g.epithete}** ; **${g.complement}**.`,
        ],
      };
    }
    default: {
      const eps = pickN(rng, EPITHETES, 2).map((e) => ({ ...e, fonction: 'épithète' as const }));
      const cdns = pickN(
        rng,
        COMPLEMENTS_DU_NOM.filter((c) => eps.every((e) => e.noyau !== c.noyau && e.avant !== c.avant)),
        2,
      ).map((c) => ({ ...c, fonction: 'complément du nom' as const }));
      const lignes = rng.shuffle([...eps, ...cdns]);
      const rang = rng.int(0, lignes.length - 1);
      const vise = at(lignes, rang);
      return {
        prompt: `Lis le texte. Donne la fonction de chaque expansion citée, puis écris le nom que complète « ${vise.expansion} ».`,
        figure: document('Extrait à analyser', lignes.map(phraseExp)),
        answer: {
          kind: 'cloze',
          parts: segments([
            ...lignes.map((l, i) => `Ligne ${i + 1}, « ${l.expansion} » : `),
            `Nom complété à la ligne ${rang + 1} : `,
          ]),
          blanks: [
            ...listes(
              EXPANSIONS,
              lignes.map((l) => l.fonction),
            ),
            ...saisies([vise.noyau]),
          ],
        },
        hint: 'Pour chaque ligne, repère le nom complété et la présence ou non d’une préposition.',
        steps: [
          DEF_EXPANSION,
          lignes.map((l) => preuveExp(l, l.fonction)).join(' '),
          `Réponses : **${lignes.map((l) => l.fonction).join(' ; ')}** ; **${vise.noyau}**.`,
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
  readonly faits: readonly string[];
  readonly generate: Skill['generate'];
}

const skill = (n: Notion): Skill => ({
  id: n.id,
  title: n.title,
  levels: 5,
  version: 1,
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesPronomsGn6e(n.factId, ...n.faits) },
  generate: n.generate,
});

export const F6_PRONOMS_GN: readonly Skill[] = [
  skill({
    id: 'f6-pronom-fonction',
    title: 'Le pronom personnel et sa fonction',
    memo: [
      'Un **pronom personnel** change de forme selon sa **fonction** : « Il » est sujet dans « Il chante. »',
      '« Le, la, les » devant un verbe sont **COD** (« Je les vois. ») ; « lui » et « leur » sont **COI** dans « Je leur parle. »',
      'Piège : « nous » et « vous » peuvent être sujet, COD ou COI. Construis le verbe avec « quelqu’un ».',
    ],
    factId: 'pronom-fonction-programme',
    faits: ['pronom-formes', 'pronoms-sujets', 'nous-vous', 'me-te', 'pronoms-cod', 'pronoms-coi', 'gn-sujet'],
    generate: pronomFonctionDraft,
  }),
  skill({
    id: 'f6-pronom-antecedent',
    title: 'Le pronom et son antécédent',
    memo: [
      'L’**antécédent** est le **groupe nominal** dont le pronom tient lieu.',
      'Exemple : « Les marins voient une île. Elle est déserte. » « Elle » a pour antécédent « une île ».',
      'Vérifie le genre, le nombre et le sens de la phrase.',
    ],
    factId: 'antecedent-programme',
    faits: ['antecedent', 'tient-lieu', 'pronom-formes', 'pronoms-cod', 'pronoms-coi'],
    generate: antecedentDraft,
  }),
  skill({
    id: 'f6-groupe-nominal',
    title: 'Le groupe nominal et ses fonctions',
    memo: [
      'Le **groupe nominal** a un **nom noyau** ; une **expansion** peut le préciser : « un vieux port ».',
      'Il peut être sujet, **COD**, **attribut du sujet** ou **complément circonstanciel**.',
      'Après une **préposition**, il forme un **groupe nominal prépositionnel** : « à mon voisin ».',
    ],
    factId: 'gn-programme',
    faits: ['gn-noyau', 'gn-formule', 'gn-sujet', 'gn-cod', 'gn-attribut', 'gn-circonstanciel', 'gnp'],
    generate: groupeNominalDraft,
  }),
  skill({
    id: 'f6-epithete-complement-nom',
    title: 'Épithète ou complément du nom',
    memo: [
      'L’**épithète** se rattache au nom directement : « un coffre ancien » (adjectif) ou « un très vieux coffre » (**groupe adjectival**).',
      'Le **complément du nom** passe le plus souvent par une préposition : « un coffre en bois ».',
      'Les deux sont des **expansions** du nom.',
    ],
    factId: 'expansions-programme',
    faits: ['expansion', 'epithete-directe', 'groupe-adjectival', 'cdn-gp', 'cdn-indirecte', 'adjectif-accord'],
    generate: expansionDraft,
  }),
];
