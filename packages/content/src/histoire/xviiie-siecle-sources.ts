/**
 * Preuves du chapitre « Le XVIIIe siècle : expansions, Lumières et révolutions » (4e) : chacune cite un identifiant du
 * registre (`sources.ts`) et la citation exacte du texte. Sources : les ressources d'accompagnement Éduscol, des
 * articles de BnF Essentiels et le Dictionnaire de l'Académie française.
 */
import type { Preuve } from './kit.ts';

const eduscol = (quote: string) => ({
  source: 'eduscol-4e-xviiie',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});
const eduscolCm1 = (quote: string) => ({
  source: 'eduscol-cm1-revolution-empire',
  who: 'La ressource d’Éduscol sur la Révolution et l’Empire',
  quote,
});
const bnf = (source: string, quote: string) => ({ source, who: 'La Bibliothèque nationale de France', quote });
const academie = (word: string, quote: string) => ({
  source: `academie-${word}`,
  who: 'Le Dictionnaire de l’Académie française',
  quote,
});

export const PREUVES = {
  // Bourgeoisies marchandes, négoces, traites négrières et esclavage
  bourgeoisie: academie(
    'bourgeoisie',
    'Classe sociale qui différait de la noblesse et du clergé, mais ne vivait pas non plus du travail de ses mains.',
  ),
  negociant: academie(
    'negociant',
    'Personne qui fait du négoce, qui se livre au commerce en gros de certains produits, de certaines denrées.',
  ),
  negoce: academie('negoce', 'Activité commerciale d’une certaine importance et, en particulier, commerce de gros.'),
  armateur: academie(
    'armateur',
    'Personne physique ou morale qui équipe un ou plusieurs navires pour le commerce, la pêche ou les compétitions.',
  ),
  ports: eduscol('l’enrichissement et le développement des ports de Nantes, Bordeaux, La Rochelle et Rouen'),
  colbert: eduscol('la Compagnie des Indes Orientales créée par Colbert en 1664'),
  droiture: eduscol(
    'La majorité des échanges avec les colonies se fait par le commerce maritime « en droiture », qui ne comporte pas de traite',
  ),
  plantation: eduscol(
    'L’économie de plantation pour le sucre, le cacao, le café, le tabac connaît à la fin du XVIIe siècle un essor considérable, aux Amériques et dans l’Océan Indien.',
  ),
  triangle: bnf(
    'bnf-compagnies-indes',
    'le tristement célèbre commerce triangulaire, qui reliait l’Europe, l’Afrique de l’ouest et l’Amérique',
  ),
  retour: eduscol(
    'ils font ensuite voile vers les Amériques ou vers les îles de l’Océan Indien avant de revenir chargés de denrées coloniales',
  ),
  deplacement: eduscol('un phénomène massif qui engendre le déplacement forcé d’au moins 11 millions de personnes'),
  orientale: eduscol(
    'La traite occidentale se superpose à une traite orientale plus ancienne qui a commencé au VIIe siècle',
  ),
  canne: bnf(
    'bnf-lumieres-ordre',
    'la culture de la canne à sucre, implantée dans toutes les Caraïbes, est grande consommatrice de main-d’œuvre',
  ),
  codeNoir: bnf(
    'bnf-lumieres-ordre',
    'le Code noir fait de l’esclave un être « meuble » susceptible d’être acquis par un maître au même titre qu’un bien',
  ),
  codeDate: bnf(
    'bnf-lumieres-ordre',
    'Depuis 1685, à l’initiative de Colbert, les Antilles sont soumises à « l’édit du Roy touchant la police des Isles d’Amérique française », autrement dit le Code noir.',
  ),
  montesquieuEsclavage: eduscol('Montesquieu critique l’esclavage dans L’Esprit des Lois (1748)'),
  traiteParis: bnf(
    'bnf-compagnies-indes',
    'Au traité de Paris, en 1763, rappelons-le, la France abandonnait le Canada, la Louisiane occidentale et l’Inde.',
  ),
  societe: eduscol(
    'les quakers des futurs États-Unis d’Amérique créent, dès 1775, la première société pour l’abolition de l’esclavage, exemple suivi en Angleterre en 1787 et en France en 1788',
  ),
  saintDomingue: eduscol('En 1791, a lieu la révolte des esclaves de Saint-Domingue.'),

  // L'Europe des Lumières
  raison: eduscol('on cherche désormais avant tout ce qui est conforme à la raison'),
  critique: eduscol(
    'Kant, dans son célèbre article Qu’est-ce que les Lumières? (1784), insiste sur cet avènement de la raison individuelle, qui doit permettre à chacun de critiquer les idées reçues.',
  ),
  europe: eduscol('Les Lumières sont un phénomène européen'),
  lieux: eduscol(
    'par le biais du livre et des sociétés de pensée (Académies diverses, loges maçonniques, mais aussi salons)',
  ),
  encyclopedie: eduscol('l’Encyclopédie de Diderot et D’Alembert, en même temps qu’elle diffuse de nouvelles idées'),
  premierVolume: bnf('bnf-encyclopedie-lumieres', 'Le premier volume paraît en 1751 avec privilège.'),
  interdiction: bnf(
    'bnf-encyclopedie-lumieres',
    'Au début de 1752, le Conseil du roi interdit la diffusion des deux premiers volumes.',
  ),
  planches: bnf('bnf-encyclopedie-lumieres', 'Les onze volumes de planches paraissent quant à eux jusqu’en 1772.'),
  montesquieuPouvoir: bnf(
    'bnf-lumieres-ordre',
    'Montesquieu esquisse une nouvelle typologie des régimes politiques, à la base de laquelle se trouve l’opposition entre tyrannie et modération, celle-ci étant définie par le maintien du pluralisme : « Il faut que, par la disposition des choses, le pouvoir arrête le pouvoir. »',
  ),
  despote: bnf(
    'bnf-lumieres-esprit',
    'l’idée d’une nation gouvernée par un despote éclairé, au service des intérêts de son peuple : Frédéric II à Berlin, Catherine II à Saint-Pétersbourg ou Joseph II à Vienne',
  ),
  limite: bnf(
    'bnf-lumieres-esprit',
    'ce despotisme éclairé, qui cultive l’autonomie de la raison chez le monarque mais préserve la soumission du peuple',
  ),
  despotisme: academie(
    'despotisme',
    'Despotisme éclairé, conception du pouvoir inspirée par les despotes éclairés du XVIIIe siècle.',
  ),
  souverainete: bnf(
    'bnf-lumieres-esprit',
    'la source de tout pouvoir est dans le peuple, et rien n’est supérieur à la volonté générale',
  ),
  calas: bnf(
    'bnf-lumieres-religions',
    'Voltaire acquiert la certitude de l’innocence de Calas et porte l’affaire devant l’opinion pour obtenir la révision du procès.',
  ),
  tolerance: bnf(
    'bnf-lumieres-religions',
    'Voltaire acquiert la certitude de l’innocence de Calas et porte l’affaire devant l’opinion pour obtenir la révision du procès. Il obtient un premier arrêt en faveur de Calas et en profite pour stigmatiser le fanatisme dans le Traité sur la tolérance (1763).',
  ),
  kant: eduscol('Kant, dans son célèbre article Qu’est-ce que les Lumières? (1784)'),
  salons: bnf('bnf-lumieres-ville', 'Les salons aristocratiques parisiens diffusent leur modèle dans toute l’Europe.'),

  // La Révolution française et l'Empire
  bastille: eduscolCm1('La révolte du peuple parisien, le 14 juillet 1789'),
  privileges: eduscolCm1(
    'l’abolition des privilèges qui pose l’égalité des citoyens devant la loi (nuit du 4 août 1789)',
  ),
  declaration: eduscol('La déclaration des droits de l’homme et du citoyen adoptée le 26 août'),
  principes: eduscol(
    'abolition des privilèges, libertés individuelles, égalité des citoyens devant la loi et souveraineté nationale',
  ),
  republique: eduscolCm1('La Première République est mise en place en septembre 1792'),
  execution: eduscolCm1('Le roi est jugé par la Convention et exécuté le 21 janvier 1793.'),
  terreur: bnf(
    'bnf-histoire-revolution',
    'Robespierre prend le pouvoir et instaure un régime de Terreur en faisant prononcer de multiples condamnations à mort.',
  ),
  esclavage: bnf(
    'bnf-lumieres-ordre',
    'Abrogé par la Convention, en 1794, rétabli sous Napoléon, en 1802, l’esclavage dans les colonies françaises est définitivement aboli, sous la IIe République, grâce à Victor Schoelcher, en 1848.',
  ),
  gouges: bnf(
    'bnf-olympe-gouges',
    'En septembre 1791, elle fait paraître la Déclaration des droits de la femme et de la citoyenne',
  ),
  brumaire: eduscolCm1('lors du coup d’État du 18 brumaire an VIII (9 novembre 1799)'),
  consul: eduscolCm1(
    'Le retour à l’ordre et la paix d’Amiens avec l’Angleterre (1802) valent à Bonaparte d’être « Consul à vie »',
  ),
  empire: eduscolCm1('Il tente de fonder une nouvelle dynastie en établissant l’Empire en 1804'),
  codeCivil: eduscolCm1(
    'Avec la promulgation du Code civil, en 1804, il a unifié le droit français selon le principe de l’égalité des citoyens devant la loi.',
  ),
  prefets: eduscolCm1(
    'il a réorganisé l’État dans le cadre départemental hérité de la Révolution, avec la mise en place des préfets',
  ),
  libertes: eduscolCm1('Le régime napoléonien a respecté de moins en moins les libertés publiques'),
  rayonnement: eduscol(
    'Les réformes révolutionnaires puis napoléoniennes (Code civil de 1804, réorganisation de l’administration…) ont un rayonnement européen incontestable',
  ),
  domination: eduscol(
    'la domination militaire et diplomatique du Premier Consul, puis de l’Empereur sur l’Europe, est instable, contestée et finalement mise à bas en 1814 et 1815',
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
