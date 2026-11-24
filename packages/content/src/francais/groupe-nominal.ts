import { choice, num, traps as numTraps } from '../build.ts';
import { r } from '../rational.ts';
import type { Rng } from '../rng.ts';
import type { Level, QuestionDraft, Rich, Skill, Trap } from '../types.ts';
import {
  CONTRASTES,
  EPITHETES,
  EPITHETES_PIEGES,
  GROUPES_LONGS,
  GROUPES_PAR_CONSTRUCTION,
  LIGNES_CONSTRUCTIONS,
  NOM_CONSTRUCTION,
  OBJETS_PRONOMS,
  OBJETS_SIMPLES,
  PRONOMS_OBJETS_GN,
  PRONOMS_SUJETS,
  REPRISES,
  SUJETS_DOUBLES,
  SUJETS_PRONOMS,
  SUJETS_SIMPLES,
  faitGn,
  groupeSujet,
  phraseAvecGroupe,
  phraseAvecPronom,
  sourcesGn,
  texteDe,
  texteGn,
  type Construction,
  type ObjetPronom,
  type PhraseGn,
} from './groupe-nominal.donnees.ts';
import { at, document, pickN, same, textTrap } from './outils.ts';

/**
 * Chapitre « Le groupe nominal » (CM1). Programme de français du cycle 3 (BO du 17 avril 2025),
 * enseignement de la langue : « Analyser le groupe nominal ».
 */
const programme = (id: string) =>
  `Programme de français du cycle 3 (BO du 17 avril 2025), CM1 — « ${faitGn(id).citation} »`;

const maj = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Une réponse écrite avec ou sans point final. */
const avecOuSansPoint = (s: string) => [s, s.replace(/\.$/, '')];

/** Pièges écrits, sans doublon ni écriture qui serait une réponse juste. */
function textTraps(accepted: readonly string[], list: readonly (readonly [string, Rich])[]): Trap[] {
  const out: Trap[] = [];
  const seen = [...accepted];
  for (const [text, why] of list) {
    if (seen.some((s) => same(s, text))) continue;
    seen.push(text);
    out.push(textTrap(text, why));
  }
  return out;
}

const DEF_GN = 'Un groupe nominal réunit un nom et les mots qui vont avec lui : déterminant, adjectif.';
const DEF_NOYAU = 'Le nom noyau est le nom principal du groupe : les autres mots l’accompagnent.';
const DEF_DET = 'Le déterminant est le petit mot placé au début du groupe : le, une, ce, mon…';
const DEF_NOM = 'Le nom désigne une personne, un animal ou une chose.';
const DEF_ADJ = 'L’adjectif dit comment est le nom. Il change avec lui en genre et en nombre.';
const DEF_EPITHETE = 'L’adjectif épithète est collé au nom, dans le groupe nominal, sans verbe entre eux.';

const WHY_DET_NOM = 'Le déterminant ne fait pas partie du nom noyau : écris le nom seul.';

const whyDet = (det: string) => `« ${det} » est le déterminant : il accompagne le nom.`;
const whyAdj = (adj: string) => `« ${adj} » est un adjectif : il dit comment est le nom.`;
const whyNom = (nom: string) => `« ${nom} » est le nom : il désigne la personne, l’animal ou la chose.`;

const adjectifDe = (p: PhraseGn): string => p.avant ?? p.apres ?? '';

// ───────────────────────── 1. Groupe nominal et nom noyau ─────────────────────────

function noyauDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick([...SUJETS_SIMPLES, ...OBJETS_SIMPLES]);
      const adj = adjectifDe(p);
      const { answer, traps } = choice(rng, p.nom, [
        { label: p.det, why: whyDet(p.det) },
        { label: adj, why: whyAdj(adj) },
      ]);
      return {
        prompt: `Dans le groupe « ${texteGn(p)} », quel mot est le nom noyau ?`,
        answer,
        traps,
        hint: 'Cherche le mot qui dit de qui ou de quoi on parle.',
        steps: [DEF_NOYAU, `Le groupe parle de « ${p.nom} ».`, `Le nom noyau est **${p.nom}**.`],
      };
    }
    case 2: {
      const p = rng.pick(SUJETS_SIMPLES);
      const groupe = maj(texteGn(p));
      const sansDet = [p.avant, p.nom, p.apres].filter(Boolean).join(' ');
      const verbe = p.fin.split(' ')[0] ?? p.fin;
      const court = p.avant ? `${maj(p.det)} ${p.avant}` : `${maj(p.det)} ${p.nom}`;
      const { answer, traps } = choice(rng, groupe, [
        { label: sansDet, why: `Il manque le déterminant « ${p.det} » : il fait partie du groupe.` },
        {
          label: court,
          why: p.avant
            ? `Il manque le nom « ${p.nom} » : sans nom, pas de groupe nominal.`
            : `Il manque « ${p.apres} », qui dit comment est le nom.`,
        },
        { label: `${sansDet} ${verbe}`, why: `« ${verbe} » est le verbe : il n’entre pas dans le groupe nominal.` },
      ]);
      return {
        prompt: `Dans « ${texteDe(p)} », quel est le groupe nominal en entier ?`,
        answer,
        traps,
        hint: 'Trouve le nom, puis prends tous les mots qui vont avec lui. Laisse le verbe dehors.',
        steps: [DEF_GN, `Autour de « ${p.nom} », je prends les mots qui le complètent.`, `C’est **${groupe}**.`],
      };
    }
    case 3: {
      const p = rng.pick(OBJETS_SIMPLES);
      const adj = adjectifDe(p);
      const accepted = [p.nom];
      const verbe = p.debut.split(' ')[1] ?? '';
      return {
        prompt: `Écris le nom noyau du groupe nominal dans : « ${texteDe(p)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [adj, whyAdj(adj)],
          [p.det, whyDet(p.det)],
          [verbe, `« ${verbe} » est le verbe : il dit ce qu’on fait.`],
          [`${p.det} ${p.nom}`, WHY_DET_NOM],
          [texteGn(p), 'Tu as écrit tout le groupe. Garde seulement le nom principal.'],
        ]),
        hint: 'Repère le groupe après le verbe, puis demande-toi de quoi il parle.',
        steps: [DEF_GN, `Le groupe est « ${texteGn(p)} ».`, `Son nom noyau est **${p.nom}**.`],
      };
    }
    case 4: {
      const p = rng.pick(GROUPES_LONGS);
      const accepted = [p.nom];
      const autre: (readonly [string, Rich])[] = p.autre
        ? [p.autre.nom, `${p.autre.det} ${p.autre.nom}`].map((t) => [
            t,
            `« ${p.autre?.det} ${p.autre?.nom} » est un autre groupe nominal, sans adjectif : cherche celui qui en a deux.`,
          ])
        : [];
      return {
        prompt: `Écris le nom noyau du groupe nominal qui a deux adjectifs : « ${texteDe(p)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [p.avant ?? '', whyAdj(p.avant ?? '')],
          [p.apres ?? '', whyAdj(p.apres ?? '')],
          [p.det, whyDet(p.det)],
          [`${p.det} ${p.nom}`, WHY_DET_NOM],
          ...autre,
        ]),
        hint: 'Trouve les deux mots qui disent comment c’est. Quel nom décrivent-ils ?',
        steps: [
          DEF_NOYAU,
          `Le groupe qui a deux adjectifs est « ${texteGn(p)} ».`,
          `Je retire « ${p.avant} » et « ${p.apres} » : il reste « ${p.det} ${p.nom} », et le nom est « ${p.nom} ».`,
          `Le nom noyau est **${p.nom}**.`,
        ],
      };
    }
    default: {
      const lignes = [rng.pick(SUJETS_SIMPLES), rng.pick(OBJETS_SIMPLES), rng.pick(GROUPES_LONGS)];
      const melange = rng.shuffle(lignes);
      return {
        prompt:
          'Lis le texte. Sur chaque ligne, trouve le groupe nominal qui a un adjectif ou deux. Écris son nom noyau.',
        figure: document('Trois phrases', melange.map(texteDe)),
        answer: {
          kind: 'cloze',
          parts: ['Ligne 1 : ', '. Ligne 2 : ', '. Ligne 3 : ', '.'],
          blanks: melange.map((p) => ({ mode: 'text' as const, accepted: [p.nom] })),
        },
        hint: 'Cherche d’abord l’adjectif de la ligne, puis le nom qu’il décrit.',
        steps: [
          DEF_NOYAU,
          melange.map((p) => `« ${texteGn(p)} »`).join(', ') + ' : voilà les groupes.',
          `Les noms noyaux sont : **${melange.map((p) => p.nom).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 2. Déterminant + nom + adjectif ─────────────────────────

type Place = 'déterminant' | 'nom' | 'adjectif';
const DEF_PLACE: Record<Place, string> = { déterminant: DEF_DET, nom: DEF_NOM, adjectif: DEF_ADJ };
const AVEC_ARTICLE: Record<Place, string> = {
  déterminant: 'le déterminant',
  nom: 'le nom',
  adjectif: 'l’adjectif',
};
const PLACES: readonly Place[] = ['déterminant', 'nom', 'adjectif'];

/** « un » : déterminant, « cahier » : nom… pour un groupe d’une construction donnée. */
const natures = (groupe: string, c: Construction): string => {
  const places = NOM_CONSTRUCTION[c].split(' + ');
  return `${groupe
    .split(' ')
    .map((mot, i) => `« ${mot} » : ${at(places, i)}`)
    .join(', ')}.`;
};

const motDe = (p: PhraseGn, place: Place): string =>
  place === 'déterminant' ? p.det : place === 'nom' ? p.nom : adjectifDe(p);

function compositionDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const p = rng.pick([...SUJETS_SIMPLES, ...OBJETS_SIMPLES]);
      const place = rng.pick(PLACES);
      const mot = motDe(p, place);
      const { answer, traps } = choice(
        rng,
        place,
        PLACES.filter((x) => x !== place).map((x) => ({
          label: x,
          why: `${DEF_PLACE[x]} Ce n’est pas le cas de « ${mot} ».`,
        })),
      );
      return {
        prompt: `Dans le groupe « ${texteGn(p)} », le mot « ${mot} » est…`,
        answer,
        traps,
        hint: 'Ce mot annonce le nom, désigne la chose ou dit comment elle est ?',
        steps: [DEF_DET, DEF_NOM, DEF_ADJ, `« ${mot} » est **${place}**.`],
      };
    }
    case 2: {
      const toutes: readonly Construction[] = ['dn', 'dan', 'dna', 'dana'];
      const voulue = rng.pick(toutes);
      const bon = rng.pick(GROUPES_PAR_CONSTRUCTION[voulue]);
      const { answer, traps } = choice(
        rng,
        bon,
        toutes
          .filter((c) => c !== voulue)
          .map((c) => ({
            label: rng.pick(GROUPES_PAR_CONSTRUCTION[c]),
            why: `Ce groupe est construit ainsi : ${NOM_CONSTRUCTION[c]}.`,
          })),
      );
      return {
        prompt: `Quel groupe est construit ainsi : ${NOM_CONSTRUCTION[voulue]} ?`,
        answer,
        traps,
        hint: 'Compte les mots, puis regarde où se place l’adjectif : avant ou après le nom.',
        steps: [
          'Je donne sa nature à chaque mot, dans l’ordre.',
          natures(bon, voulue),
          `C’est **${bon}** : ${NOM_CONSTRUCTION[voulue]}.`,
        ],
      };
    }
    case 3: {
      const p = rng.pick([...OBJETS_SIMPLES, ...SUJETS_SIMPLES]);
      const place = rng.pick(PLACES);
      const mot = motDe(p, place);
      const accepted = [mot];
      return {
        prompt: `Dans « ${texteDe(p)} », écris ${AVEC_ARTICLE[place]} du groupe nominal.`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          PLACES.filter((x) => x !== place).map((x) => [motDe(p, x), `${DEF_PLACE[x]} On te demande autre chose.`]),
        ),
        hint: 'Trouve le groupe nominal, puis donne sa nature à chaque mot.',
        steps: [`Le groupe est « ${texteGn(p)} ».`, DEF_PLACE[place], `C’est **${mot}**.`],
      };
    }
    case 4: {
      const p = rng.pick(GROUPES_LONGS);
      const adj1 = p.avant ?? '';
      const adj2 = p.apres ?? '';
      return {
        prompt: `Analyse le groupe « ${texteGn(p)} ». Écris le mot qui convient dans chaque trou.`,
        answer: {
          kind: 'cloze',
          parts: ['Déterminant : ', '. Nom : ', '. Adjectif avant le nom : ', '. Adjectif après le nom : ', '.'],
          blanks: [p.det, p.nom, adj1, adj2].map((mot) => ({ mode: 'text' as const, accepted: [mot] })),
        },
        hint: 'Commence par le nom : quel mot désigne la chose ou l’animal ?',
        steps: [
          DEF_DET,
          DEF_ADJ,
          `Réponses : **${p.det}** (déterminant), **${p.nom}** (nom), **${adj1}** et **${adj2}** (adjectifs).`,
        ],
      };
    }
    default: {
      const voulue = rng.pick<Construction>(['dn', 'dan', 'dna']);
      const bonnes = LIGNES_CONSTRUCTIONS.filter(([, c]) => c === voulue);
      const autres = LIGNES_CONSTRUCTIONS.filter(([, c]) => c !== voulue);
      const k = rng.int(1, 3);
      const lignes = rng.shuffle([...pickN(rng, bonnes, k), ...pickN(rng, autres, 5 - k)]);
      return {
        prompt: `Lis le texte. Combien de groupes nominaux sont construits ainsi : ${NOM_CONSTRUCTION[voulue]} ?`,
        figure: document(
          'Cinq phrases',
          lignes.map(([t]) => t),
        ),
        answer: num(k),
        traps: numTraps(r(k), [
          [5, 'Tu as compté tous les groupes nominaux. Garde seulement la construction demandée.'],
          [5 - k, 'Tu as compté les autres groupes. Relis la construction demandée.'],
          [k + 1, 'Tu en as un de trop : vérifie la place de chaque adjectif.'],
        ]),
        hint: 'Repère le groupe nominal de chaque ligne, puis donne la nature de ses mots.',
        steps: [
          DEF_GN,
          `Je garde seulement : ${NOM_CONSTRUCTION[voulue]}.`,
          `Les phrases qui conviennent : ${lignes
            .filter(([, c]) => c === voulue)
            .map(([t]) => `« ${t} »`)
            .join(', ')}. Il y en a **${k}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 3. L'adjectif épithète ─────────────────────────

function epitheteDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const e = rng.pick(EPITHETES);
      const { answer, traps } = choice(rng, e.adjectif, [
        { label: e.nom, why: whyNom(e.nom) },
        { label: e.verbe, why: `« ${e.verbe} » est le verbe : il change avec le temps.` },
      ]);
      return {
        prompt: `Dans « ${e.texte} », quel mot est l’adjectif épithète ?`,
        answer,
        traps,
        hint: 'Cherche le mot qui dit comment est un nom, juste à côté de lui.',
        steps: [DEF_EPITHETE, `Il décrit « ${e.nom} ».`, `L’adjectif épithète est **${e.adjectif}**.`],
      };
    }
    case 2: {
      const c = rng.pick(CONTRASTES);
      const { answer, traps } = choice(
        rng,
        c.epithete,
        c.separes.map((s) => ({
          label: s,
          why: `Ici, un verbe sépare « ${c.nom} » et « ${c.adjectif} » : l’adjectif n’est pas épithète.`,
        })),
      );
      return {
        prompt: `Dans quelle phrase l’adjectif « ${c.adjectif} » est-il épithète ?`,
        answer,
        traps,
        hint: 'Regarde ce qu’il y a entre le nom et l’adjectif.',
        steps: [DEF_EPITHETE, `Je cherche « ${c.nom} ${c.adjectif} » sans verbe au milieu.`, `C’est **${c.epithete}**`],
      };
    }
    case 3: {
      const e = rng.pick(EPITHETES);
      const accepted = [e.adjectif];
      return {
        prompt: `Écris l’adjectif épithète du nom « ${e.nom} » dans : « ${e.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [e.nom, whyNom(e.nom)],
          [e.verbe, `« ${e.verbe} » est le verbe : il change avec le temps.`],
          [`${e.adjectif} ${e.nom}`, 'Écris seulement l’adjectif, sans le nom.'],
          [`${e.nom} ${e.adjectif}`, 'Écris seulement l’adjectif, sans le nom.'],
        ]),
        hint: `Quel mot dit comment est « ${e.nom} » ?`,
        steps: [DEF_EPITHETE, `Je regarde les mots autour de « ${e.nom} ».`, `L’épithète est **${e.adjectif}**.`],
      };
    }
    case 4: {
      const e = rng.pick(EPITHETES_PIEGES);
      const accepted = [e.adjectif];
      return {
        prompt: `Il y a deux adjectifs. Écris seulement l’adjectif épithète : « ${e.texte} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(accepted, [
          [e.separe, `Le verbe « ${e.verbe} » sépare « ${e.separe} » de « ${e.nomSepare} » : il n’est pas épithète.`],
          [e.nom, whyNom(e.nom)],
          [e.nomSepare, whyNom(e.nomSepare)],
          [e.verbe, `« ${e.verbe} » est le verbe, pas un adjectif.`],
        ]),
        hint: 'Barre l’adjectif qui est de l’autre côté du verbe par rapport à son nom.',
        steps: [
          DEF_EPITHETE,
          `Le verbe « ${e.verbe} » sépare « ${e.separe} » de son nom « ${e.nomSepare} » : je l’écarte.`,
          `« ${e.adjectif} » est dans le même groupe que « ${e.nom} » : l’épithète est **${e.adjectif}**.`,
        ],
      };
    }
    default: {
      // Au moins une ligne de chaque forme : épithète avant le verbe, puis après lui.
      const avant = rng.pick(EPITHETES_PIEGES.filter((e) => e.place === 'avant'));
      const apres = rng.pick(EPITHETES_PIEGES.filter((e) => e.place === 'apres'));
      const reste = EPITHETES_PIEGES.filter((e) => e !== avant && e !== apres);
      const lignes = rng.shuffle([avant, apres, rng.pick(reste)]);
      return {
        prompt: 'Lis le texte. Pour chaque ligne, écris l’adjectif épithète du nom indiqué.',
        figure: document(
          'Trois phrases',
          lignes.map((e) => e.texte),
        ),
        answer: {
          kind: 'cloze',
          parts: [
            `Ligne 1, « ${at(lignes, 0).nom} » : `,
            `. Ligne 2, « ${at(lignes, 1).nom} » : `,
            `. Ligne 3, « ${at(lignes, 2).nom} » : `,
            '.',
          ],
          blanks: lignes.map((e) => ({ mode: 'text' as const, accepted: [e.adjectif] })),
        },
        hint: 'Sur chaque ligne, cherche l’adjectif dans le même groupe que le nom indiqué, sans verbe entre eux.',
        steps: [
          DEF_EPITHETE,
          'Un adjectif séparé de son nom par un verbe n’est pas épithète.',
          'Placé après le verbe, il peut l’être s’il est dans le même groupe que son nom.',
          `Les épithètes sont : **${lignes.map((e) => e.adjectif).join(', ')}**.`,
        ],
      };
    }
  }
}

// ───────────────────────── 4. Remplacer un groupe nominal par un pronom ─────────────────────────

const DEF_PRONOM_SUJET = 'Le pronom prend la place de tout le groupe nominal, avec son genre et son nombre.';

const whyObjet = (o: Pick<ObjetPronom, 'groupe'>) =>
  /^(à|au|aux) /.test(o.groupe)
    ? `« ${o.groupe} » désigne des personnes et commence par « à », « au » ou « aux » : on le remplace par « lui » (une seule personne) ou « leur » (plusieurs).`
    : `« ${o.groupe} » complète le verbe sans « à » : on le remplace par « le », « la » ou « les ».`;

/** Bonne famille (« le, la, les ») mais mauvais genre ou nombre : on le dit ; sinon, on rappelle la règle. */
const whyMauvaisObjet = (o: ObjetPronom, p: string): string => {
  const directs = ['le', 'la', 'les'];
  return directs.includes(o.pronom) && directs.includes(p)
    ? `« ${p} » n’a pas le bon genre ou le bon nombre : regarde le nom dans « ${o.groupe} ».`
    : whyObjet(o);
};

/** Chaque piège écrit vaut avec et sans point final. */
const pieges = (list: readonly (readonly [string, Rich])[]): (readonly [string, Rich])[] =>
  list.flatMap(([text, why]) => avecOuSansPoint(text).map((t) => [t, why] as const));

function pronomDraft(rng: Rng, level: Level): QuestionDraft {
  switch (level) {
    case 1: {
      const s = rng.pick(SUJETS_PRONOMS);
      const groupe = groupeSujet(s);
      const { answer, traps } = choice(
        rng,
        s.pronom,
        pickN(
          rng,
          PRONOMS_SUJETS.filter((x) => x !== s.pronom),
          2,
        ).map((x) => ({ label: x, why: `« ${x} » n’a pas le même genre ou le même nombre que « ${groupe} ».` })),
      );
      return {
        prompt: `Quel pronom peut remplacer « ${groupe} » dans « ${groupe} ${s.suite}. » ?`,
        answer,
        traps,
        hint: 'Le groupe est-il masculin ou féminin ? Y en a-t-il un ou plusieurs ?',
        steps: [DEF_PRONOM_SUJET, `Je regarde le nom noyau « ${s.nom} ».`, `Le pronom est **${s.pronom}**.`],
      };
    }
    case 2: {
      const s = rng.pick(SUJETS_PRONOMS);
      const groupe = groupeSujet(s);
      const bon = `${maj(s.pronom)} ${s.suite}.`;
      const autreGenre = ({ il: 'elle', elle: 'il', ils: 'elles', elles: 'ils' } as const)[s.pronom];
      const autreNombre = ({ il: 'ils', ils: 'il', elle: 'elles', elles: 'elle' } as const)[s.pronom];
      const { answer, traps } = choice(rng, bon, [
        {
          label: `${s.debut} ${s.pronom} ${s.suite}.`,
          why: 'Le pronom remplace tout le groupe : le déterminant et l’adjectif partent aussi.',
        },
        { label: `${maj(autreGenre)} ${s.suite}.`, why: `Regarde le genre du nom « ${s.nom} ».` },
        { label: `${maj(autreNombre)} ${s.autreNombre}.`, why: `Regarde le nombre du nom « ${s.nom} ».` },
      ]);
      return {
        prompt: `Quelle phrase remplace bien « ${groupe} » dans « ${groupe} ${s.suite}. » ?`,
        answer,
        traps,
        hint: 'Le pronom prend la place du groupe entier. Garde le même genre et le même nombre.',
        steps: [DEF_PRONOM_SUJET, `Je retire « ${groupe} » en entier.`, `La phrase est : **${bon}**`],
      };
    }
    case 3: {
      const double = rng.int(0, 3) === 0;
      const s = rng.pick(SUJETS_PRONOMS);
      const d = rng.pick(SUJETS_DOUBLES);
      const { groupe, suite, pronom } = double ? d : { groupe: groupeSujet(s), suite: s.suite, pronom: s.pronom };
      const bon = `${maj(pronom)} ${suite}.`;
      const accepted = avecOuSansPoint(bon);
      const faux = PRONOMS_SUJETS.map(
        (x) => [`${maj(x)} ${suite}.`, `« ${x} » n’a pas le bon genre ou le bon nombre.`] as const,
      );
      return {
        prompt: `Réécris la phrase en remplaçant « ${groupe} » par un pronom : « ${groupe} ${suite}. »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          pieges([
            ...faux,
            [`${groupe} ${pronom} ${suite}.`, 'Tu as gardé le groupe et ajouté un pronom. Le pronom prend sa place.'],
          ]),
        ),
        hint: 'Compte les personnes ou les choses, regarde leur genre, puis retire tout le groupe.',
        steps: [
          DEF_PRONOM_SUJET,
          double
            ? 'Deux personnes réunies par « et » : pluriel. Deux féminins : « elles ». Au moins un masculin : « ils ».'
            : `Je remplace « ${groupe} » en entier.`,
          `La phrase est : **${bon}**`,
        ],
      };
    }
    case 4: {
      const o = rng.pick(OBJETS_PRONOMS);
      const bon = phraseAvecPronom(o);
      const accepted = avecOuSansPoint(bon);
      return {
        prompt: `Réécris la phrase en remplaçant « ${o.groupe} » par un pronom : « ${phraseAvecGroupe(o)} »`,
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          pieges([
            [`${o.sujet} ${o.verbe} ${o.pronom}.`, 'Ici, le pronom complément se place avant le verbe.'],
            ...PRONOMS_OBJETS_GN.map((p) => [phraseAvecPronom(o, p), whyMauvaisObjet(o, p)] as const),
          ]),
        ),
        hint: 'Regarde si le groupe commence par « à ». Puis place le pronom près du verbe.',
        steps: [whyObjet(o), 'Le pronom se place devant le verbe.', `La phrase est : **${bon}**`],
      };
    }
    default: {
      const x = rng.pick(REPRISES);
      const ligne1 = `${x.sujet} ${x.premier} ${x.groupe}.`;
      const ligne2 = `${x.sujet} ${x.verbe} ${x.reprise}.`;
      const bon = `${maj(x.pronomSujet)} ${x.pronom} ${x.verbe}.`;
      const accepted = avecOuSansPoint(bon);
      return {
        prompt: 'Le texte se répète. Réécris la ligne 2 avec deux pronoms.',
        figure: document('Un petit récit', [ligne1, ligne2]),
        answer: { kind: 'text', accepted },
        traps: textTraps(
          accepted,
          pieges([
            [`${maj(x.pronomSujet)} ${x.verbe} ${x.reprise}.`, 'Le groupe sujet est remplacé, mais pas le complément.'],
            [`${x.sujet} ${x.pronom} ${x.verbe}.`, 'Le complément est remplacé, mais pas le groupe sujet.'],
            [`${maj(x.pronomSujet)} ${x.verbe} ${x.pronom}.`, 'Le pronom complément se place avant le verbe.'],
          ]),
        ),
        hint: 'Remplace d’abord le groupe du début, puis le groupe après le verbe.',
        steps: [
          `« ${x.sujet} » devient « ${x.pronomSujet} ».`,
          `« ${x.reprise} » devient « ${x.pronom} », devant le verbe.`,
          `La ligne 2 devient : **${bon}**`,
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
  lesson: { memo: n.memo, source: programme(n.factId), sources: sourcesGn(n.factId, ...n.faits) },
  generate: n.generate,
});

export const FCM1_GROUPE_NOMINAL: readonly Skill[] = [
  skill({
    id: 'fcm1-gn-noyau',
    title: 'Le groupe nominal et son nom noyau',
    memo: [
      'Un **groupe nominal**, c’est une équipe autour d’un nom : le petit chien.',
      'Le chef de l’équipe est le **nom noyau** : ici, « chien ». Il dit de qui ou de quoi on parle.',
      'Astuce : retire les mots qui décrivent. Il reste « le chien » : le noyau, c’est le nom « chien ».',
    ],
    factId: 'noyau',
    faits: ['elements', 'groupe-nominal'],
    generate: noyauDraft,
  }),
  skill({
    id: 'fcm1-gn-composition',
    title: 'Déterminant, nom et adjectif',
    memo: [
      'Dans le groupe nominal, trouve le **déterminant** (un), le **nom** (chat) et parfois l’**adjectif** (noir).',
      'L’adjectif se place après le nom (un chat noir) ou avant (un petit chat). Il peut y en avoir deux !',
    ],
    factId: 'elements',
    faits: ['groupe-nominal', 'determinant', 'adjectif'],
    generate: compositionDraft,
  }),
  skill({
    id: 'fcm1-adjectif-epithete',
    title: 'L’adjectif épithète',
    memo: [
      'L’**adjectif épithète** est collé au nom, dans le même groupe : un chien noir, un petit chien.',
      'Aucun verbe entre eux ! Dans « Le chien est noir. », « est » les sépare : « noir » n’est pas épithète.',
    ],
    factId: 'epithete',
    faits: ['joint', 'adjectif'],
    generate: epitheteDraft,
  }),
  skill({
    id: 'fcm1-gn-pronom',
    title: 'Remplacer un groupe nominal par un pronom',
    memo: [
      'Un **pronom** prend la place de tout un groupe nominal : « La petite fille chante. » → « Elle chante. »',
      'Sujet : il, elle, ils, elles (masculin et féminin ensemble : ils).',
      'Complément : le, la, les, devant le verbe. Pour des personnes après « à » : lui, leur.',
      'Bonus : le pronom évite de répéter le même groupe dans ton texte.',
    ],
    factId: 'remplacer-sujet',
    faits: ['remplacer-objet', 'pronom', 'ils', 'le', 'lui'],
    generate: pronomDraft,
  }),
];
