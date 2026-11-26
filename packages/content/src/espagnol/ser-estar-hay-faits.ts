/**
 * Espagnol 5e, « Ser, estar, hay » (lot es-5e-03) : données citées. Chaque fait porte l'identifiant de sa source
 * (registre `sources.ts`) et une citation exacte du texte consulté le 26/11/2026 (copies d'archive
 * web.archive.org : Real Academia Española, pages de 2023 et 2024 ; Instituto Cervantes ; programme : annexe 9 de
 * l'arrêté du 5 mai 2025).
 */
import type { Fait } from './se-presenter-faits.ts';

/** Début des lignes du tableau « Presente » du dictionnaire, dans l'ordre des personnes. */
const ROWS = ['yo', 'tú / vos', 'él, ella', 'nosotros, nosotras', 'vosotros, vosotras', 'ellos, ellas'] as const;

/** Présent relevé sur les articles « ser » et « estar » (yo, tú, él, nosotros, vosotros, ellos). */
export const PRESENT_SER_ESTAR = {
  ser: 'soy eres es somos sois son',
  estar: 'estoy estás está estamos estáis están',
} as const;

const fait = (id: string, sourceId: string, claim: string, quote: string): Fait => ({ id, sourceId, quote, claim });
const PROGRAMME = 'espagnol-college-2025';
const DPD_SER = 'rae-dpd-ser';
const DPD_ESTAR = 'rae-dpd-estar';
const DPD_HABER = 'rae-dpd-haber';
const PCIC = 'cervantes-pcic-gramatica-a1-a2';

const formFacts: Fait[] = (['ser', 'estar'] as const).flatMap((v) =>
  PRESENT_SER_ESTAR[v].split(' ').map((form, i) =>
    fait(
      `${v}-${i}`,
      `rae-dle-${v}`,
      `présent de « ${v} » : ligne « ${ROWS[i]} »`,
      // La 2e ligne du dictionnaire donne aussi la forme du voseo pour « ser ».
      `${ROWS[i]} | ${v === 'ser' && i === 1 ? 'eres / sos' : form}`,
    ),
  ),
);

export const FAITS_SER_ESTAR_HAY: readonly Fait[] = [
  ...formFacts,
  fait(
    'programme-irreguliers',
    PROGRAMME,
    'présent de « ser » et « estar » au programme',
    'des verbes irréguliers : ser, estar, ir, tener',
  ),
  fait('programme-gerondif', PROGRAMME, '« estar » + gérondif au programme', 'Estar + gérondif'),
  fait('programme-hay-que', PROGRAMME, '« hay que » : obligation impersonnelle', 'Obligation impersonnelle (hay que).'),
  fait('programme-hay-que-ex', PROGRAMME, 'exemple de « hay que »', 'Hay que salir antes de las dos.'),
  fait('programme-heure', PROGRAMME, 'l’heure se dit avec « ser »', 'Es la una y media. Son las doce en punto.'),
  fait('programme-date', PROGRAMME, '« estamos a » pour la date', 'Hoy estamos a lunes, 22 de octubre.'),

  fait(
    'ser-attribut',
    DPD_SER,
    '« ser » relie le sujet à son attribut',
    'afirmar del sujeto lo que significa el atributo',
  ),
  fait(
    'ser-exemples',
    DPD_SER,
    '« ser » : qualité, profession, origine',
    'Luisa es alta; Su padre es médico; Soy de Madrid.',
  ),
  fait(
    'ser-accord',
    DPD_SER,
    '« ser » s’accorde avec son sujet',
    'ser debe concordar con el sujeto en número y persona',
  ),
  fait('ser-temps', 'rae-dle-ser', '« ser » indique le temps', 'Indica tiempo. Son las tres.'),
  fait('ser-origine', 'rae-dle-ser', '« ser de » : origine', 'Antonio es de Madrid.'),
  fait(
    'ser-possession',
    'rae-dle-ser',
    '« ser de » : possession',
    'Indica relación de posesión. Este jardín es de la reina.',
  ),
  fait(
    'ser-evenement',
    'rae-dle-ser',
    '« ser » : un événement a lieu',
    'Suceder, acontecer, tener lugar. ¿Dónde fue la boda?',
  ),
  fait('ser-identite', PCIC, '« ser » pour s’identifier', 'Soy Elena.'),
  fait('ser-classe', PCIC, '« ser » : origine, profession', 'Soy español. Soy estudiante.'),
  fait('ser-seul', PCIC, 'des adjectifs ne vont qu’avec « ser »', 'Adjetivos que solo pueden ir con ser'),

  fait(
    'estar-attribut',
    DPD_ESTAR,
    '« estar » attribue une qualité ou un état, comme « ser »',
    'atribuir al sujeto una determinada cualidad o estado',
  ),
  fait(
    'estar-resultat',
    DPD_ESTAR,
    '« estar » : état résultant d’un changement ou non permanent',
    'como el resultado de una acción, transformación o cambio, real o supuesto, o se considera como no permanente',
  ),
  fait(
    'ser-stable',
    DPD_ESTAR,
    '« ser » : caractéristique propre ou stable',
    'es considerada inherente a este o estable',
  ),
  fait('origine-ser', DPD_ESTAR, 'l’origine se dit avec « ser »', 'Soy cacereña, y no *Estoy cacereña'),
  fait('casse', DPD_ESTAR, 'état résultant : « estar »', 'El jarrón está roto, y no *El jarrón es roto'),
  fait('satisfait', DPD_ESTAR, '« satisfecho » avec « estar »', 'Estoy muy satisfecho, y no *Soy muy satisfecho'),
  fait(
    'listo',
    DPD_ESTAR,
    '« ser listo » et « estar listo » n’ont pas le même sens',
    'Juan es listo [= inteligente] que Juan está listo [= preparado]',
  ),
  fait(
    'lieu',
    DPD_ESTAR,
    '« estar » : se trouver quelque part ou dans une situation',
    'hallarse en un determinado lugar, tiempo, situación o circunstancia',
  ),
  fait('lieu-ex', DPD_ESTAR, 'exemple de lieu', 'María está en el cine'),
  fait('date', DPD_ESTAR, '« estamos a » : jour', 'Estamos a lunes; Estamos a 24 de julio'),
  fait('saison', DPD_ESTAR, '« estamos en » : mois, saison, année', 'Estamos en marzo; Estamos en primavera'),
  fait(
    'gerondif',
    DPD_ESTAR,
    '« estar » + gérondif : action en cours',
    'presenta la acción en el curso de su desarrollo',
  ),
  fait('gerondif-ex', DPD_ESTAR, 'exemple de gérondif', 'Mi padre está durmiendo todavía'),
  fait('estar-lieu-pcic', PCIC, '« estar » sans adjectif : localisation', 'Localización espacial'),
  fait('contento', PCIC, '« contento » avec « estar »', 'Está contento.'),

  fait(
    'hay-forme',
    DPD_HABER,
    'au présent impersonnel, « haber » prend la forme « hay »',
    'adopta la forma especial hay',
  ),
  fait(
    'hay-existence',
    DPD_HABER,
    '« haber » impersonnel : présence ou existence',
    'denotar la presencia o existencia de lo designado por el sustantivo que lo acompaña',
  ),
  fait(
    'hay-pluriel',
    DPD_HABER,
    'un nom pluriel ne met pas le verbe au pluriel',
    'el hecho de que dicho sustantivo sea plural no supone que el verbo haya de ir también en plural',
  ),
  fait('hay-exemple', 'rae-dle-haber', '« hay » : il existe', 'Hay hombres sin caridad.'),
  fait('hay-que-dle', 'rae-dle-haber', '« hay que » : il faut', 'Hay que tener paciencia.'),
  fait('hay-article', PCIC, 'pas d’article défini après « hay »', 'Incompatibilidad general con el verbo haber'),
  fait('estar-defini', PCIC, 'avec un article défini, « estar » situe', 'Ahí está la mesa.'),
  fait('hay-possessif', PCIC, 'pas de possessif après « hay »', '*Hay mis amigos.'),
  fait('hay-quantite', PCIC, '« hay » et un mot de quantité', 'Hay mucha gente.'),
  fait(
    'hay-sans-article',
    PCIC,
    '« hay » et un nom sans article',
    'Hay árboles en la plaza. No hay leche en la nevera',
  ),
  fait('hay-nombre', PCIC, '« hay » et un nombre', 'Hay tres personas.'),
];
