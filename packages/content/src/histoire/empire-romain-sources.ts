/**
 * Preuves du chapitre « L'empire romain dans le monde antique » (6e) : chacune cite un identifiant du registre
 * (`sources.ts`) et la citation exacte du texte. Les preuves sans `who` viennent du programme du cycle 3 ; les autres,
 * de la ressource d'accompagnement Éduscol du thème (mars 2016).
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle3-2020', quote });
const eduscol = (quote: string) => ({
  source: 'eduscol-6e-empire-romain',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});

export const PREUVES = {
  // Conquêtes, paix romaine et romanisation
  vaste: programme(
    'L’enchaînement des conquêtes aboutit à la constitution d’un vaste empire marqué par la diversité des sociétés et des cultures qui le composent.',
  ),
  unite: programme('Son unité est assurée par le pouvoir impérial, la romanisation et le mythe prestigieux de l’Urbs.'),
  cesar: programme('Lors de la première année du cycle 3 a été abordée la conquête de la Gaule par César.'),
  auguste: eduscol(
    'Dans la titulature des empereurs romains inaugurée par Octave devenu Auguste (en 27 avant J.-C., par la décision du Sénat)',
  ),
  titre: eduscol(
    'Caesar à l’héritage de Jules César qui mit une première fois fin aux guerres civiles (Octave est son fils adoptif)',
  ),
  rome: eduscol('Cité la plus peuplée de l’empire, siège du pouvoir et ville de l’empereur'),
  romanisation: eduscol(
    'La romanisation n’est pas seulement la diffusion d’un type de plan de ville universel, mais tout autant celle d’un modèle civique.',
  ),
  caracalla: eduscol('jusqu’à l’édit de Caracalla de 212 qui la confère à tous les hommes libres'),
  culte: eduscol(
    'Le maintien de l’unité de l’empire est aussi garanti symboliquement par le prestige de Rome et surtout par le culte impérial.',
  ),
  armee: eduscol('Le pouvoir impérial s’appuie sur l’armée'),
  trajan: eduscol('Trajan, premier empereur non italien à parvenir au principat'),
  monuments: eduscol('monuments caractéristiques de la culture romaine (forum, thermes, théâtres)'),
  culteCite: eduscol('mode de vie, culte de Rome et de l’empereur'),
  pax: eduscol('Ier-IIe siècles : l’empire romain au temps de la pax romana.'),

  // Des chrétiens dans l’empire
  issu: programme('Le christianisme issu du judaïsme se développe dans le monde grec et romain.'),
  jesus: programme('Quels sont les fondements de ce nouveau monothéisme qui se réclame de Jésus ?'),
  imperial: programme(
    'Quelles sont ses relations avec l’empire romain jusqu’à la mise en place d’un christianisme impérial ?',
  ),
  debuts: eduscol('Ier-IVe siècles : les débuts du christianisme.'),
  persecutions: eduscol('des persécutions ont lieu sous Néron, sous Dioclétien'),
  idolatrie: eduscol(
    'Les chrétiens (tout comme les Juifs) se refusent au culte impérial, qu’ils perçoivent comme une idolâtrie.',
  ),
  nicee: eduscol('convoque lui-même le concile de Nicée en 325'),
  thessalonique: eduscol(
    'fait du christianisme la religion officielle et unique de l’Empire d’Orient en 380 par l’édit de Thessalonique',
  ),
  anciens: eduscol('sont dirigées par un conseil d’anciens'),
  eveques: eduscol('Les communautés du IVe siècle sont dirigées par des évêques'),
  paul: eduscol(
    'Les lettres de Paul, juif hellénisé, sont les plus anciens documents écrits qui attestent l’existence de communautés juives se référant à Jésus, appelé aussi Christ.',
  ),
  paulNonJuifs: eduscol('sa prédication touchant des populations non juives'),
  paulCitoyen: eduscol('il n’hésite pas, par ailleurs, à se prévaloir de sa citoyenneté romaine'),
  jerusalem: eduscol('le siège et la prise de Jérusalem par Titus qui s’ensuivirent en 70 et la destruction du Temple'),
  nouveauTestament: eduscol('La formation du Nouveau Testament elle-même a une histoire qui prend place au IIe siècle'),
  ambroise: eduscol('contraint de faire pénitence devant l’évêque de Milan, Ambroise'),
  rapport: eduscol('illustre un nouveau rapport de force'),

  // La route de la soie et la Chine des Han
  soie: programme('La route de la soie témoigne des contacts entre l’empire romain et d’autres mondes anciens.'),
  commerce: programme('Un commerce régulier entre Rome et la Chine existe depuis le IIe siècle avant J.-C.'),
  han: programme('C’est l’occasion de découvrir la civilisation de la Chine des Han.'),
  dynastie: eduscol('la dynastie des Han (de 202 av. J.-C. à 220, avec une interruption de 5 av. J-C à 23)'),
  etat: eduscol('Un État centralisé, héritage de la dynastie Qin, se dote d’une caste mandarinale.'),
  papier: eduscol('La culture y est en plein essor, mieux diffusée grâce au papier.'),
  wudi: eduscol(
    'Le règne de l’empereur Wudi (Wu-Ti) (-140 / -87) est celui du renforcement du pouvoir impérial et de l’expansion territoriale, assurant aux Chinois le contrôle de la route de la soie.',
  ),
  echanges: eduscol(
    'Les échanges concernaient la soie chinoise, mais aussi les verreries, tissus et tapis de l’empire romain.',
  ),
  contacts: eduscol(
    'Même si les contacts directs avec la Chine, surtout connus par des sources chinoises, sont peu nombreux',
  ),
  intermediaires: eduscol('d’intermédiaires entre Rome et la Chine'),
  rapprochements: eduscol(
    'les institutions politiques et administratives, l’extension territoriale, le rôle des villes',
  ),
  versRome: eduscol('Vers elle, sont transportés produits de luxe, esclaves, fauves pour les jeux'),
} satisfies Record<string, Preuve & { readonly source: string }>;
