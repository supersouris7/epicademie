import type { Chapter, Skill } from '../types.ts';
import { choice, trueFalse } from '../build.ts';
import { SKILLS as LIEUX } from './lieux.ts';
import { SKILLS as VIE } from './vie.ts';
import { SKILLS as TRANSPORTS } from './transports.ts';
import { SKILLS as INTERNET } from './internet.ts';
import { SKILLS as MIEUX_HABITER } from './habiter.ts';
import { SKILLS as METROPOLE } from './metropole.ts';
import { SKILLS as FAIBLE_DENSITE } from './faible-densite.ts';
import { SKILLS as LITTORAUX } from './littoraux.ts';
import { SKILLS as REPERES } from './reperes.ts';
import { SKILLS as MONDE_HABITE } from './monde-habite.ts';
import { SKILLS as REPERES_MONDE } from './reperes-monde.ts';
import { SKILLS as DEMOGRAPHIE } from './demographie.ts';
import { SKILLS as CHANGEMENT_GLOBAL } from './changement-global.ts';
import { SKILLS as RESSOURCES } from './ressources.ts';
import { SKILLS as REPERES_5E } from './reperes-5e.ts';
import { SKILLS as URBANISATION } from './urbanisation.ts';
import { SKILLS as MOBILITES } from './mobilites.ts';
import { SKILLS as MONDIALISATION } from './mondialisation.ts';
import { SKILLS as REPERES_4E } from './reperes-4e.ts';
import { GEO_FETCHED_ON, PAYS_UE, REGIONS } from './donnees.generated.ts';

/**
 * Géographie (docs/adr/0024-contenus-hors-maths.md) : repères sur la France et l'Union
 * européenne. Sources institutionnelles seulement (21/11/2026) :
 * - INSEE, Code officiel géographique au 1er janvier 2025 (régions, chefs-lieux, départements,
 *   préfectures) ;
 * - Union européenne, « Pays de l'UE » (capitales, monnaie) ;
 * récupérées par apps/web/scripts/geo.ts.
 */

const INSEE = `INSEE, Code officiel géographique au 1er janvier 2025 (relevé du ${GEO_FETCHED_ON})`;
const UE = `Union européenne, european-union.europa.eu, « Pays de l’UE » (relevé du ${GEO_FETCHED_ON})`;

type Rng = { pick<T>(l: readonly T[]): T; shuffle<T>(l: readonly T[]): T[] };

/** Régions de l'Hexagone et de Corse (codes 11 à 94) ; l'outre-mer s'ajoute au niveau 2. */
const HEXAGONE = REGIONS.filter((r) => Number(r.code) >= 11);
/** Trois autres réponses, tirées sans doublon. */
const others = <T>(rng: Rng, list: readonly T[], skip: T, n = 3) =>
  rng.shuffle(list.filter((x) => x !== skip)).slice(0, n);

const regions: Skill = {
  id: 'gcm1-regions',
  title: 'Les régions et leur chef-lieu',
  lesson: {
    memo: [
      'La France compte 18 régions : 13 dans l’Hexagone et en Corse, 5 en outre-mer.',
      'Chaque région a un chef-lieu : Bretagne → Rennes, Occitanie → Toulouse, Grand Est → Strasbourg.',
    ],
    source: `Géographie : les régions françaises. ${INSEE}.`,
  },
  generate: (rng, level) => {
    const pool = level === 1 ? HEXAGONE : REGIONS;
    const r = rng.pick(pool);
    const { answer, traps } = choice(
      rng,
      r.chefLieu,
      others(rng, pool, r).map((o) => ({
        label: o.chefLieu,
        why: `${o.chefLieu} est le chef-lieu de la région ${o.name}.`,
      })),
    );
    return {
      prompt: `Quel est le chef-lieu de la région **${r.name}** ?`,
      answer,
      traps,
      hint: 'C’est souvent la plus grande ville de la région.',
      steps: [`La région ${r.name} a pour chef-lieu ${r.chefLieu}.`, `Réponse : **${r.chefLieu}**.`],
    };
  },
};

/** « Amsterdam; le Parlement… » : la capitale, puis la précision donnée par la source. */
const capitalOf = (c: (typeof PAYS_UE)[number]) => c.capital.split(';')[0]?.trim() ?? c.capital;
const noteOf = (c: (typeof PAYS_UE)[number]) => c.capital.split(';')[1]?.trim();

const euCapitals: Skill = {
  id: 'g3-ue-capitales',
  title: 'Les capitales de l’Union européenne',
  lesson: {
    memo: [
      'L’Union européenne compte 27 États membres. Exemples : Allemagne → Berlin, Espagne → Madrid, Pologne → Varsovie.',
    ],
    source: `Géographie : la France et l’Union européenne. ${UE}.`,
  },
  generate: (rng) => {
    const c = rng.pick(PAYS_UE);
    const right = capitalOf(c);
    const { answer, traps } = choice(
      rng,
      right,
      others(rng, PAYS_UE, c).map((o) => ({
        label: capitalOf(o),
        why: `${capitalOf(o)} est la capitale : ${o.name}.`,
      })),
    );
    const note = noteOf(c);
    return {
      prompt: `Quelle est la capitale de ce pays de l’Union européenne : **${c.name}** ?`,
      answer,
      traps,
      hint: 'C’est souvent la plus grande ville du pays.',
      steps: [`${c.name} : capitale ${right}.${note ? ` Précision : ${note}` : ''}`, `Réponse : **${right}**.`],
    };
  },
};

const euro: Skill = {
  id: 'g3-ue-euro',
  title: 'Les pays de la zone euro',
  lesson: {
    memo: ['Tous les pays de l’Union européenne n’utilisent pas l’euro : certains gardent leur propre monnaie.'],
    source: `Géographie : l’Union européenne. ${UE}.`,
  },
  generate: (rng) => {
    const c = rng.pick(PAYS_UE);
    const { answer, traps } = trueFalse(
      c.euro,
      c.euro ? `${c.name} utilise bien l’euro.` : `${c.name} est dans l’Union européenne mais n’utilise pas l’euro.`,
    );
    return {
      prompt: `Vrai ou faux : **${c.name}** utilise l’euro.`,
      answer,
      traps,
      hint: 'Être dans l’Union européenne ne veut pas toujours dire utiliser l’euro.',
      steps: [
        'Les 27 pays de l’Union européenne n’ont pas tous adopté l’euro.',
        `${c.name} : **${c.euro ? 'Vrai' : 'Faux'}**, ${c.euro ? 'il utilise l’euro' : 'il garde sa propre monnaie'}.`,
      ],
    };
  },
};

const chapter = (id: string, grade: Chapter['grade'], title: string, skills: readonly Skill[]): Chapter => ({
  id,
  subject: 'geographie',
  grade,
  domain: 'reperes',
  title,
  skills,
});

export const GEOGRAPHIE_CHAPTERS: readonly Chapter[] = [
  chapter('gcm1-regions', 'cm1', 'Les régions de France', [regions]),
  chapter('gcm1-lieux', 'cm1', 'Les lieux où j’habite', LIEUX),
  chapter('gcm1-se-loger', 'cm1', 'Se loger, travailler, avoir des loisirs', VIE),
  chapter('gcm2-se-deplacer', 'cm2', 'Se déplacer', TRANSPORTS),
  chapter('gcm2-internet', 'cm2', 'Communiquer grâce à Internet', INTERNET),
  chapter('gcm2-mieux-habiter', 'cm2', 'Mieux habiter', MIEUX_HABITER),
  chapter('gcm2-departements', 'cm2', 'Repères : France et Europe', REPERES),
  chapter('g6-habiter-metropole', '6e', 'Habiter une métropole', METROPOLE),
  chapter('g6-faible-densite', '6e', 'Habiter un espace de faible densité', FAIBLE_DENSITE),
  chapter('g6-littoraux', '6e', 'Habiter les littoraux', LITTORAUX),
  chapter('g6-monde-habite', '6e', 'Le monde habité', MONDE_HABITE),
  chapter('g6-prefectures', '6e', 'Repères : la France et le monde', REPERES_MONDE),
  chapter('g5-demographie-developpement', '5e', 'Démographie et développement', DEMOGRAPHIE),
  chapter('g5-ressources-limitees', '5e', 'Des ressources limitées, à gérer et à renouveler', RESSOURCES),
  chapter('g5-changement-global', '5e', 'Changement global et risques', CHANGEMENT_GLOBAL),
  chapter('g5-reperes', '5e', 'Repères de 5e', REPERES_5E),
  chapter('g4-urbanisation-monde', '4e', 'L’urbanisation du monde', URBANISATION),
  chapter('g4-mobilites-transnationales', '4e', 'Les mobilités humaines transnationales', MOBILITES),
  chapter('g4-espaces-mondialisation', '4e', 'Des espaces transformés par la mondialisation', MONDIALISATION),
  chapter('g4-reperes', '4e', 'Repères de 4e', REPERES_4E),
  chapter('g3-union-europeenne', '3e', 'L’Union européenne', [euCapitals, euro]),
];
