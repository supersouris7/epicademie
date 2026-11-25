import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import {
  ACCORDS_GN,
  ADJECTIFS,
  DEUX_ADJECTIFS,
  EPITHETES_APRES_VERBE,
  GROUPES_ENRICHIS,
  PHRASES_COMPLEMENT,
  VERBES_ATTRIBUTIFS,
  accorder,
  adjectifGe,
  determinant,
  faitGnCm2,
  nomAu,
  phrase,
  phraseAttribut,
  phraseEpithete,
  sourcesGnCm2,
  texteComplement,
  texteGroupe,
  type Accord,
  type Genre,
  type GroupeEnrichi,
  type Nombre,
  type PhraseComplement,
} from './groupe-nominal-cm2.donnees.ts';
import { at, document, pickN, same, textTrap } from './outils.ts';

/**
 * Chapitre « Le groupe nominal enrichi » (CM2). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Analyser le groupe nominal ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM2 — « ${faitGnCm2(id).citation} »`;

const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Pièges écrits, sans doublon ni écriture vide ou juste. */
function textTraps(accepted: readonly string[], list: readonly (readonly [string, Rich])[]): Trap[] {
  const out: Trap[] = [];
  const seen = [...accepted];
  for (const [text, why] of list) {
    if (!text || seen.some((s) => same(s, text))) continue;
    seen.push(text);
    out.push(textTrap(text, why));
  }
  return out;
}

const DEF_EXPANSION = 'Une expansion du nom enrichit le groupe nominal : un adjectif ou un groupe avec préposition.';
const DEF_COMPLEMENT =
  'Le complément du nom complète un nom, le plus souvent avec une préposition : de, à, en, sans, avec…';
const DEF_EPITHETE = 'L’épithète est dans le groupe nominal : elle touche le nom sans préposition ni verbe.';
const DEF_ATTRIBUT = 'L’attribut du sujet est relié au sujet par un verbe comme être, sembler, rester ou devenir.';
const DEF_ACCORD = 'Le déterminant et l’adjectif prennent le genre et le nombre du nom qu’ils accompagnent.';

const whyDet = (det: string) => `« ${det} » est le déterminant : il n’est pas une expansion.`;
const whyNoyau = (nom: string) => `« ${nom} » est le nom noyau : les expansions s’ajoutent à lui.`;
const whyAdjSansPrep = (a: string) =>
  `« ${a} » est un adjectif épithète : il touche le nom sans préposition. Ce n’est pas un complément du nom.`;

// ───────────────────────── 1. Les expansions du nom ─────────────────────────

function expansionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const g = rng.pick(GROUPES_ENRICHIS);
      const avecAdj = rng.int(0, 1) === 0;
      const groupe = texteGroupe(g, avecAdj, !avecAdj);
      const expansion = avecAdj ? adjectifGe(g) : g.complement;
      const { answer, traps } = choice(rng, expansion, [
        { label: g.det, why: whyDet(g.det) },
        { label: g.nom, why: whyNoyau(g.nom) },
      ]);
      return {
        prompt: `Dans « ${groupe} », quelle est l’expansion du nom « ${g.nom} » ?`,
        answer,
        traps,
        hint: 'Cherche ce qui ajoute un détail sur le nom. Le petit mot du début ne compte pas.',
        steps: [
          DEF_EXPANSION,
          `Le nom noyau est « ${g.nom} ». Le détail ajouté est « ${expansion} ».`,
          `C’est **${expansion}**.`,
        ],
      };
    }
    case 2: {
      const g = rng.pick(GROUPES_ENRICHIS);
      const a = adjectifGe(g);
      const bon = `« ${a} » et « ${g.complement} »`;
      const { answer, traps } = choice(rng, bon, [
        { label: `seulement « ${a} »`, why: `Tu oublies « ${g.complement} » : il complète aussi « ${g.nom} ».` },
        { label: `seulement « ${g.complement} »`, why: `Tu oublies « ${a} » : il dit comment est « ${g.nom} ».` },
        { label: `« ${g.det} » et « ${a} »`, why: whyDet(g.det) },
      ]);
      return {
        prompt: `Quelles sont toutes les expansions du nom « ${g.nom} » dans « ${texteGroupe(g)} » ?`,
        answer,
        traps,
        hint: 'Il peut y avoir une expansion de chaque côté du nom. Regarde jusqu’au bout.',
        steps: [
          DEF_EXPANSION,
          `Adjectif : « ${a} ». Groupe avec préposition : « ${g.complement} ».`,
          `C’est **${bon}**.`,
        ],
      };
    }
    case 3: {
      const g = rng.pick(GROUPES_ENRICHIS);
      const reste = texteGroupe(g, false, false);
      const accepted = [reste];
      return {
        prompt: `Supprime toutes les expansions. Écris le groupe qui reste : « ${texteGroupe(g)} ».`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [texteGroupe(g, true, false), `Il reste l’adjectif « ${adjectifGe(g)} » : c’est aussi une expansion.`],
          [texteGroupe(g, false, true), `Il reste « ${g.complement} » : c’est aussi une expansion.`],
          [g.nom, 'Garde le déterminant : il n’est pas une expansion.'],
          [texteGroupe(g), 'Tu as tout gardé. Enlève les détails ajoutés au nom.'],
        ]),
        hint: 'Garde le déterminant et le nom noyau. Efface le reste.',
        steps: [
          'Une expansion est facultative : le groupe reste correct sans elle.',
          `J’efface « ${adjectifGe(g)} » et « ${g.complement} ».`,
          `Il reste **${reste}**.`,
        ],
      };
    }
    case 4: {
      const g = rng.pick(GROUPES_ENRICHIS);
      const a = adjectifGe(g);
      return {
        prompt: `Analyse le groupe « ${texteGroupe(g)} ». Écris ce qui convient dans chaque trou.`,
        answer: {
          kind: 'cloze',
          parts: ['Nom noyau : ', '. Adjectif : ', '. Groupe avec préposition : ', '.'],
          blanks: [g.nom, a, g.complement].map((mot) => ({ mode: 'text' as const, accepted: [mot] })),
        },
        hint: 'Trouve d’abord le nom principal. La préposition ouvre le dernier groupe.',
        steps: [
          DEF_EXPANSION,
          `« ${g.complement} » commence par une préposition.`,
          `Réponses : **${g.nom}**, **${a}**, **${g.complement}**.`,
        ],
      };
    }
    default: {
      const choisis = pickN(rng, GROUPES_ENRICHIS, 3);
      const formes = rng.shuffle([
        [true, true],
        [rng.int(0, 1) === 0, false],
        rng.int(0, 1) === 0 ? [false, true] : [false, false],
      ] as const);
      const lignes = choisis.map((g: GroupeEnrichi, i) => {
        const [avecAdj, avecComp] = at(formes, i);
        const trouvees = [avecAdj ? adjectifGe(g) : '', avecComp ? g.complement : ''].filter(Boolean);
        return {
          texte: phrase(texteGroupe(g, avecAdj, avecComp), g.verbe),
          detail: `« ${g.nom} » : ${trouvees.map((t) => `« ${t} »`).join(' et ') || 'aucune expansion'}`,
          adjectifs: avecAdj ? 1 : 0,
          complements: avecComp ? 1 : 0,
        };
      });
      const nbAdj = lignes.reduce((s, l) => s + l.adjectifs, 0);
      const nbComp = lignes.reduce((s, l) => s + l.complements, 0);
      const total = nbAdj + nbComp;
      return {
        prompt:
          'Chaque phrase commence par un groupe nominal. Combien ces groupes ont-ils d’expansions du nom, en tout ?',
        figure: document(
          'Carnet de la maison',
          lignes.map((l) => l.texte),
        ),
        answer: num(total),
        traps: numTraps(r(total), [
          [nbAdj, 'Tu as compté seulement les adjectifs. Compte aussi les groupes avec préposition.'],
          [nbComp, 'Tu as compté seulement les groupes avec préposition. Compte aussi les adjectifs.'],
          [total + 3, 'Tu as sans doute compté les déterminants : ils ne sont pas des expansions.'],
        ]),
        hint: 'Ligne par ligne : trouve le nom, puis les détails ajoutés avant et après lui.',
        steps: [
          DEF_EXPANSION,
          `Ligne par ligne : ${lignes.map((l) => l.detail).join(' ; ')}.`,
          `En tout : **${total}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Le complément du nom ─────────────────────────

const whyLeurre = (p: PhraseComplement) =>
  `« ${p.leurre} » dit où ou quand cela se passe : il ne complète pas le nom « ${p.nom} ».`;

function complementDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const g = rng.pick(GROUPES_ENRICHIS);
      const groupe = texteGroupe(g, false, true);
      const { answer, traps } = choice(rng, g.complement, [
        { label: g.det, why: `« ${g.det} » est le déterminant : il annonce le nom.` },
        { label: g.nom, why: `« ${g.nom} » est le nom que l’on complète.` },
      ]);
      return {
        prompt: `Dans « ${groupe} », quel est le complément du nom « ${g.nom} » ?`,
        answer,
        traps,
        hint: 'Il commence par une préposition et donne un détail sur le nom.',
        steps: [DEF_COMPLEMENT, `Après « ${g.nom} », je lis « ${g.complement} ».`, `C’est **${g.complement}**.`],
      };
    }
    case 2: {
      const choisis = pickN(rng, GROUPES_ENRICHIS, 4);
      const bon = texteGroupe(at(choisis, 0), false, true);
      const { answer, traps } = choice(
        rng,
        bon,
        choisis.slice(1).map((x) => ({ label: texteGroupe(x, true, false), why: whyAdjSansPrep(adjectifGe(x)) })),
      );
      return {
        prompt: 'Dans quel groupe le nom a-t-il un complément du nom ?',
        answer,
        traps,
        hint: 'Cherche une préposition placée après le nom.',
        steps: [DEF_COMPLEMENT, 'Un adjectif seul n’a pas de préposition.', `C’est **${bon}**.`],
      };
    }
    case 3: {
      const g = rng.pick(GROUPES_ENRICHIS);
      const accepted = [g.complement];
      const [, ...suite] = g.complement.split(' ');
      return {
        prompt: `Écris le complément du nom « ${g.nom} » : « ${phrase(texteGroupe(g), g.verbe)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [suite.join(' '), 'Il manque la préposition : elle fait partie du complément du nom.'],
          [adjectifGe(g), whyAdjSansPrep(adjectifGe(g))],
          [g.nom, `« ${g.nom} » est le nom complété : écris ce qui le complète.`],
          [g.verbe, `« ${g.verbe} » est dans le groupe du verbe.`],
          [texteGroupe(g), 'Tu as écrit tout le groupe nominal. Garde seulement le complément.'],
        ]),
        hint: 'Repère la préposition, puis écris-la avec les mots qui la suivent.',
        steps: [DEF_COMPLEMENT, `Le groupe est « ${texteGroupe(g)} ».`, `La réponse est **${g.complement}**.`],
      };
    }
    case 4: {
      const p = rng.pick(PHRASES_COMPLEMENT);
      const accepted = [p.complement];
      const [, ...suite] = p.complement.split(' ');
      return {
        prompt: `Attention au piège ! Écris le complément du nom « ${p.nom} » : « ${texteComplement(p)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.leurre, whyLeurre(p)],
          [suite.join(' '), 'Il manque la préposition : elle fait partie du complément du nom.'],
          [`${p.det} ${p.nom}`, 'C’est le nom complété : écris ce qui le complète.'],
          [`${p.det} ${p.nom} ${p.complement}`, 'Tu as écrit tout le groupe sujet. Garde seulement le complément.'],
        ]),
        hint: 'Un groupe dit où ou quand. L’autre donne un détail sur le nom : lequel ?',
        steps: [DEF_COMPLEMENT, whyLeurre(p), `La réponse est **${p.complement}**.`],
      };
    }
    default: {
      const lignes = pickN(rng, PHRASES_COMPLEMENT, 3);
      return {
        prompt: 'Lis le texte. Pour chaque ligne, écris le complément du nom indiqué.',
        figure: document('Journal du village', lignes.map(texteComplement)),
        answer: {
          kind: 'cloze',
          parts: [
            `Ligne 1, « ${at(lignes, 0).nom} » : `,
            `. Ligne 2, « ${at(lignes, 1).nom} » : `,
            `. Ligne 3, « ${at(lignes, 2).nom} » : `,
            '.',
          ],
          blanks: lignes.map((p) => ({ mode: 'text' as const, accepted: [p.complement] })),
        },
        hint: 'Le premier groupe de chaque ligne dit où ou quand. Regarde juste après le nom.',
        steps: [
          DEF_COMPLEMENT,
          'Les groupes du début disent où ou quand : ils ne complètent pas le nom.',
          `Réponses : **${lignes.map((p) => p.complement).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. Épithète ou attribut du sujet ─────────────────────────

type Fonction = 'épithète' | 'attribut du sujet';
const FONCTIONS: readonly Fonction[] = ['épithète', 'attribut du sujet'];
const DEF_FONCTION: Record<Fonction, string> = { épithète: DEF_EPITHETE, 'attribut du sujet': DEF_ATTRIBUT };

function epitheteAttributDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const a = rng.pick(ADJECTIFS);
      const fonction = rng.pick(FONCTIONS);
      const texte = fonction === 'épithète' ? phraseEpithete(a) : phraseAttribut(a, 'est');
      const autre: Fonction = fonction === 'épithète' ? 'attribut du sujet' : 'épithète';
      const { answer, traps } = choice(rng, fonction, [
        {
          label: autre,
          why:
            fonction === 'épithète'
              ? `« ${a.adjectif} » touche « ${a.nom} » : aucun verbe ne les sépare.`
              : `Le verbe « est » relie « ${a.adjectif} » au sujet.`,
        },
        {
          label: 'complément du nom',
          why: `« ${a.adjectif} » est un adjectif sans préposition : ce n’est pas un complément du nom.`,
        },
      ]);
      return {
        prompt: `Dans « ${texte} », l’adjectif « ${a.adjectif} » est…`,
        answer,
        traps,
        hint: 'Y a-t-il un verbe entre le nom et l’adjectif ?',
        steps: [DEF_EPITHETE, DEF_ATTRIBUT, `Ici, « ${a.adjectif} » est **${fonction}**.`],
      };
    }
    case 2: {
      const a = rng.pick(ADJECTIFS);
      const fonction = rng.pick(FONCTIONS);
      const avecVerbes = VERBES_ATTRIBUTIFS.map((v) => phraseAttribut(a, v));
      const epithetes = [
        phraseEpithete(a),
        `Voici ${a.sujet.toLowerCase().replace(/^le /, 'un ').replace(/^la /, 'une ')} ${a.adjectif}.`,
        `Je regarde ${a.sujet.toLowerCase()} ${a.adjectif}.`,
      ];
      const bon = rng.pick(fonction === 'épithète' ? epithetes : avecVerbes);
      const faux = pickN(rng, fonction === 'épithète' ? avecVerbes : epithetes, 3);
      const why =
        fonction === 'épithète'
          ? `Un verbe relie « ${a.adjectif} » au sujet : ici, il est attribut du sujet.`
          : `« ${a.adjectif} » est dans le même groupe que « ${a.nom} » : ici, il est épithète.`;
      const { answer, traps } = choice(
        rng,
        bon,
        faux.map((label) => ({ label, why })),
      );
      return {
        prompt: `Dans quelle phrase l’adjectif « ${a.adjectif} » est-il ${fonction} ?`,
        answer,
        traps,
        hint: 'Regarde ce qu’il y a juste avant l’adjectif : le nom ou un verbe ?',
        steps: [DEF_FONCTION[fonction], `La bonne phrase est : **${bon}**`],
      };
    }
    case 3: {
      const d = rng.pick(DEUX_ADJECTIFS);
      const fonction = rng.pick(FONCTIONS);
      const [bon, autre] = fonction === 'épithète' ? [d.epithete, d.attribut] : [d.attribut, d.epithete];
      const accepted = [bon];
      return {
        prompt: `Écris l’adjectif ${fonction === 'épithète' ? 'épithète' : 'attribut du sujet'} : « ${d.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [autre, `« ${autre} » a l’autre fonction. ${DEF_FONCTION[fonction]}`],
          [d.nom, `« ${d.nom} » est le nom, pas un adjectif.`],
          [d.verbe, `« ${d.verbe} » est le verbe qui relie le sujet à son attribut.`],
        ]),
        hint: 'Coupe la phrase au verbe : un adjectif est avec le nom, l’autre est après le verbe.',
        steps: [DEF_FONCTION[fonction], `Le verbe est « ${d.verbe} ».`, `La réponse est **${bon}**.`],
      };
    }
    case 4: {
      const d = rng.pick(DEUX_ADJECTIFS);
      return {
        prompt: `Analyse la phrase « ${d.texte} ». Écris le mot qui convient dans chaque trou.`,
        answer: {
          kind: 'cloze',
          parts: ['Épithète : ', '. Verbe qui relie : ', '. Attribut du sujet : ', '.'],
          blanks: [d.epithete, d.verbe, d.attribut].map((mot) => ({ mode: 'text' as const, accepted: [mot] })),
        },
        hint: 'Commence par le verbe. Puis regarde l’adjectif de chaque côté.',
        steps: [
          DEF_EPITHETE,
          DEF_ATTRIBUT,
          `« ${d.epithete} » touche le nom « ${d.nom} ». Le verbe « ${d.verbe} » relie « ${d.attribut} » au sujet.`,
          `Réponses : **${d.epithete}**, **${d.verbe}**, **${d.attribut}**.`,
        ],
      };
    }
    default: {
      const epithete = rng.pick(EPITHETES_APRES_VERBE);
      const attribut = rng.pick(DEUX_ADJECTIFS);
      const autre = rng.pick(DEUX_ADJECTIFS.filter((d) => d !== attribut));
      const troisieme: Fonction = rng.pick(FONCTIONS);
      const touche = (adjectif: string, nom: string) => `« ${adjectif} » touche le nom « ${nom} »`;
      const relie = (d: { verbe: string; attribut: string }) => `« ${d.verbe} » relie « ${d.attribut} » au sujet`;
      const lignes = rng.shuffle<{ texte: string; adjectif: string; fonction: Fonction; pourquoi: string }>([
        {
          texte: epithete.texte,
          adjectif: epithete.adjectif,
          fonction: 'épithète',
          pourquoi: touche(epithete.adjectif, epithete.nom),
        },
        {
          texte: attribut.texte,
          adjectif: attribut.attribut,
          fonction: 'attribut du sujet',
          pourquoi: relie(attribut),
        },
        {
          texte: autre.texte,
          adjectif: troisieme === 'épithète' ? autre.epithete : autre.attribut,
          fonction: troisieme,
          pourquoi: troisieme === 'épithète' ? touche(autre.epithete, autre.nom) : relie(autre),
        },
      ]);
      return {
        prompt: `Lis le texte. Donne la fonction de chaque adjectif : ${lignes.map((l) => `« ${l.adjectif} »`).join(', ')}.`,
        figure: document(
          'Trois phrases',
          lignes.map((l) => l.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: [
            `Ligne 1, « ${at(lignes, 0).adjectif} » : `,
            `. Ligne 2, « ${at(lignes, 1).adjectif} » : `,
            `. Ligne 3, « ${at(lignes, 2).adjectif} » : `,
            '.',
          ],
          blanks: lignes.map((l) => ({
            mode: 'list' as const,
            options: [...FONCTIONS],
            correct: FONCTIONS.indexOf(l.fonction),
          })),
        },
        hint: 'Après un verbe, un adjectif peut aussi toucher un autre nom. Cherche avec qui il va.',
        steps: [
          DEF_EPITHETE,
          DEF_ATTRIBUT,
          `${lignes.map((l) => l.pourquoi).join(' ; ')}.`,
          `Réponses : **${lignes.map((l) => `${l.adjectif} : ${l.fonction}`).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. La chaîne d'accord avec plusieurs expansions ─────────────────────────

const NOMBRES: readonly Nombre[] = ['sg', 'pl'];
const autreNombre = (n: Nombre): Nombre => (n === 'sg' ? 'pl' : 'sg');

/** « les petites roues noires du vélo » */
const groupeAccorde = (a: Accord, n: Nombre): string =>
  [determinant(a.genre, n), accorder(a.avant, a.genre, n), nomAu(a, n), accorder(a.apres, a.genre, n), a.complement]
    .filter(Boolean)
    .join(' ');

/** Les formes écrites d'un adjectif, avec la raison de l'erreur. */
const formesFausses = (a: Accord, base: string, n: Nombre): (readonly [string, Rich])[] => {
  const c = a.nomComplement;
  const surComplement = accorder(base, c.genre, c.nombre);
  return [
    [surComplement, `Tu as suivi « ${c.nom} ». L’adjectif s’accorde avec le nom noyau « ${nomAu(a, n)} ».`],
    [accorder(base, a.genre, autreNombre(n)), `Regarde le nombre du nom « ${nomAu(a, n)} » : un seul ou plusieurs ?`],
    [accorder(base, a.genre === 'm' ? 'f' : 'm', n), `Regarde le genre du nom « ${a.nom} » : masculin ou féminin ?`],
    [base, `Il manque une marque : « ${nomAu(a, n)} » commande l’accord.`],
  ];
};

/** Cas où le nom du complément n'a pas le même genre ou le même nombre que le nom noyau. */
const CAS_PIEGES: readonly { readonly a: Accord; readonly n: Nombre }[] = ACCORDS_GN.flatMap((a) =>
  NOMBRES.filter((n) => a.genre !== a.nomComplement.genre || n !== a.nomComplement.nombre).map((n) => ({ a, n })),
);

const justification = (a: Accord, n: Nombre) =>
  `Le nom noyau est « ${nomAu(a, n)} » : ${a.genre === 'f' ? 'féminin' : 'masculin'} ${
    n === 'pl' ? 'pluriel' : 'singulier'
  }.`;

/** Nouveau nom noyau d'une ligne, avec le genre et le nombre qu'il impose à la chaîne. */
interface Remplacement {
  readonly a: Accord;
  readonly nom: string;
  readonly genre: Genre;
  readonly n: Nombre;
}

/**
 * Deux lignes dans un ordre tiré au sort : l'une passe au pluriel avec un nom de l'autre genre, l'autre passe au
 * singulier. Le nom du complément garde toujours un genre ou un nombre différent du nouveau nom noyau.
 */
function remplacements(rng: Rng): Remplacement[] {
  const { a, nom } = rng.pick(
    ACCORDS_GN.flatMap((x) => {
      const autre = x.remplacants.autreGenre;
      return autre && x.nomComplement.nombre === 'sg' ? [{ a: x, nom: autre }] : [];
    }),
  );
  const b = rng.pick(ACCORDS_GN.filter((x) => x !== a && x.nom !== nom && x.remplacants.memeGenre !== a.nom));
  return rng.shuffle<Remplacement>([
    { a, nom: nomAu({ ...a, nom }, 'pl'), genre: a.genre === 'm' ? 'f' : 'm', n: 'pl' },
    { a: b, nom: b.remplacants.memeGenre, genre: b.genre, n: 'sg' },
  ]);
}

function accordDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const a = rng.pick(ACCORDS_GN);
      const n = rng.pick(NOMBRES);
      const bon = accorder(a.apres, a.genre, n);
      const fausses = (['m', 'f'] as const)
        .flatMap((g) => NOMBRES.map((x) => ({ g, x, label: accorder(a.apres, g, x) })))
        .filter((f) => f.label !== bon);
      const { answer, traps } = choice(
        rng,
        bon,
        pickN(rng, fausses, 2).map(({ g, x, label }) => {
          const erreurs = [g === a.genre ? '' : 'le bon genre', x === n ? '' : 'le bon nombre'].filter(Boolean);
          return { label, why: `« ${label} » n’a pas ${erreurs.join(' ni ')}. ${justification(a, n)}` };
        }),
      );
      return {
        prompt: `Complète : « ${determinant(a.genre, n)} ${nomAu(a, n)} … ${a.complement} » (${a.apres}).`,
        answer,
        traps,
        hint: 'Le nom noyau est juste après le déterminant. Quel est son genre ? Son nombre ?',
        steps: [DEF_ACCORD, justification(a, n), `J’écris **${bon}**.`],
      };
    }
    case 2: {
      const a = rng.pick(ACCORDS_GN);
      const n: Nombre = 'pl';
      const bon = groupeAccorde(a, n);
      const forme = (avant: Nombre, apres: Nombre) =>
        `les ${accorder(a.avant, a.genre, avant)} ${nomAu(a, n)} ${accorder(a.apres, a.genre, apres)} ${a.complement}`;
      const autreGenre = a.genre === 'm' ? 'f' : 'm';
      const { answer, traps } = choice(rng, bon, [
        { label: forme('sg', 'pl'), why: 'L’adjectif placé avant le nom s’accorde aussi.' },
        { label: forme('pl', 'sg'), why: 'L’adjectif placé après le nom s’accorde aussi.' },
        {
          label: `les ${accorder(a.avant, a.genre, n)} ${nomAu(a, n)} ${accorder(a.apres, autreGenre, n)} ${a.complement}`,
          why: `Le genre est celui du nom noyau « ${a.nom} », pas d’un autre nom.`,
        },
      ]);
      return {
        prompt: `Avec le nom « ${nomAu(a, n)} », quel groupe nominal est bien accordé ?`,
        answer,
        traps,
        hint: 'Vérifie chaque adjectif : avant le nom, puis après le nom.',
        steps: [DEF_ACCORD, justification(a, n), `La bonne écriture est **${bon}**.`],
      };
    }
    case 3: {
      const { a, n } = rng.pick(CAS_PIEGES);
      const base = rng.pick([a.avant, a.apres]);
      const bon = accorder(base, a.genre, n);
      const accepted = [bon];
      const trou = (mot: string) => (mot === base ? '…' : accorder(mot, a.genre, n));
      return {
        prompt: `Écris « ${base} » bien accordé : « ${determinant(a.genre, n)} ${trou(a.avant)} ${nomAu(a, n)} ${trou(
          a.apres,
        )} ${a.complement} ».`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, formesFausses(a, base, n)),
        hint: 'Trouve le nom noyau. Ne te laisse pas tromper par le nom du complément.',
        steps: [DEF_ACCORD, justification(a, n), `J’écris **${bon}**.`],
      };
    }
    case 4: {
      const { a, n } = rng.pick(CAS_PIEGES);
      const formes = [accorder(a.avant, a.genre, n), accorder(a.apres, a.genre, n)];
      return {
        prompt: `Accorde « ${a.avant} » et « ${a.apres} » avec le nom « ${nomAu(a, n)} ».`,
        answer: {
          kind: 'cloze',
          parts: [
            `${maj(determinant(a.genre, n))} `,
            ` ${nomAu(a, n)} `,
            ` ${a.complement} ${a.verbe[n === 'sg' ? 0 : 1]}.`,
          ],
          blanks: formes.map((f) => ({ mode: 'text' as const, accepted: [f] })),
        },
        hint: 'Les deux adjectifs suivent le même chef : le nom noyau.',
        steps: [DEF_ACCORD, justification(a, n), `Réponses : **${formes.join(', ')}**.`],
      };
    }
    default: {
      const lignes = remplacements(rng);
      const formes = lignes.map(({ a, genre, n }) => [
        maj(determinant(genre, n)),
        accorder(a.avant, genre, n),
        accorder(a.apres, genre, n),
        a.verbe[n === 'sg' ? 0 : 1],
      ]);
      const parts = lignes.flatMap(({ a, nom }, i) => [
        `${i === 0 ? '' : '. '}Ligne ${i + 1} : `,
        ' ',
        ` ${nom} `,
        ` ${a.complement} `,
      ]);
      return {
        prompt: `Lis le texte. Remplace le nom noyau : ${lignes
          .map((l, i) => `ligne ${i + 1}, « ${nomAu(l.a, autreNombre(l.n))} » devient « ${l.nom} »`)
          .join(' ; ')}. Réécris chaque phrase avec toute sa chaîne d’accord.`,
        figure: document(
          'Carnet d’observation',
          lignes.map(({ a, n }) => {
            const avant = autreNombre(n);
            return phrase(groupeAccorde(a, avant), a.verbe[avant === 'sg' ? 0 : 1]);
          }),
        ),
        answer: {
          kind: 'cloze',
          parts: [...parts, '.'],
          blanks: formes.flat().map((f) => ({ mode: 'text' as const, accepted: [f] })),
        },
        hint: 'Trouve le genre et le nombre du nouveau nom. Le déterminant, les adjectifs et le verbe le suivent.',
        steps: [
          DEF_ACCORD,
          `${lignes
            .map(
              (l) =>
                `« ${l.nom} » est ${l.genre === 'f' ? 'féminin' : 'masculin'} ${l.n === 'pl' ? 'pluriel' : 'singulier'}`,
            )
            .join(' ; ')}. Le complément du nom ne change pas.`,
          `Réponses : **${formes.flat().join(', ')}**.`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesGnCm2(n.factId, ...n.faits) },
  generate: n.generate,
});

export const FCM2_GROUPE_NOMINAL: readonly Skill[] = [
  skill({
    id: 'fcm2-gn-expansions',
    title: 'Les expansions du nom',
    memo: [
      'Enrichis un nom avec une **expansion** : un **adjectif** ou un **groupe nominal prépositionnel**.',
      'Exemple : le petit chat de ma tante. « petit » et « de ma tante » complètent « chat ».',
      'Tu peux les effacer : « le chat » reste correct.',
    ],
    factId: 'expansion-programme',
    faits: ['formule', 'expansion', 'facultative', 'gnp'],
    generate: expansionDraft,
  }),
  skill({
    id: 'fcm2-complement-du-nom',
    title: 'Le complément du nom',
    memo: [
      'Le **complément du nom** complète un nom, le plus souvent avec une **préposition** : le chien du berger.',
      'Autres exemples : une malle en bois, un bateau à voiles.',
      'Attention : dans « Dans le jardin, le chat dort. », « Dans le jardin » dit où. Ici, il ne complète pas un nom !',
    ],
    factId: 'complement-programme',
    faits: ['complement-gp', 'gnp', 'preposition', 'relations'],
    generate: complementDraft,
  }),
  skill({
    id: 'fcm2-epithete-attribut',
    title: 'Épithète ou attribut du sujet',
    memo: [
      '**Épithète** : l’adjectif touche le nom, dans son groupe. « Le lac calme brille. »',
      '**Attribut du sujet** : un **verbe attributif** le relie au sujet. « Le lac est calme. »',
      'Ces verbes : être, sembler, paraître, rester, devenir…',
    ],
    factId: 'epithete-attribut',
    faits: ['relations', 'sans-preposition', 'attribut', 'attributifs-rester', 'attributifs-sembler'],
    generate: epitheteAttributDraft,
  }),
  skill({
    id: 'fcm2-chaine-accord-expansions',
    title: 'La chaîne d’accord avec plusieurs expansions',
    memo: [
      'Le **nom noyau** commande la **chaîne d’accord** : déterminant et adjectifs, avant comme après.',
      'Les petites roues noires du vélo : « petites » et « noires » suivent « roues », pas « vélo ».',
    ],
    factId: 'chaine',
    faits: ['accord-adjectif', 'accord-determinant', 'formule'],
    generate: accordDraft,
  }),
];
