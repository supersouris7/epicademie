/**
 * Preuves du chapitre CM1 « Révolution et Empire » : chacune cite un identifiant du registre (`sources.ts`) et la
 * citation exacte (programme du cycle 3, ressource Éduscol « Le temps de la Révolution et de l’Empire »).
 */
import type { Preuve } from './kit.ts';

const preuve =
  (source: string) =>
  (quote: string): Preuve & { readonly source: string } => ({ source, quote });

const programme = preuve('cycle3-2020');
const eduscol = preuve('eduscol-cm1-revolution-empire');

export const PREUVES = {
  // Programme
  theme: programme('De l’année 1789 à l’exécution du roi : Louis XVI, la Révolution, la Nation'),
  rupture: programme(
    'La Révolution française marque une rupture fondamentale dans l’ordre monarchique établi et on présente bien Louis XVI comme le dernier roi de l’Ancien Régime',
  ),
  origines: programme(
    'quelques grandes explications des origines économiques, sociales, intellectuelles et politiques de la Révolution',
  ),
  pouvoir: programme(
    'Napoléon Bonaparte, général dans les armées républicaines, prend le pouvoir par la force et est proclamé empereur des Français en 1804',
  ),
  acquis: programme('il conserve certains des acquis révolutionnaires'),

  // De 1789 à l’exécution du roi
  etats: eduscol('Louis XVI perd rapidement le contrôle des États généraux réunis au printemps 1789.'),
  revolte: eduscol('La révolte du peuple parisien, le 14 juillet 1789'),
  bastille: eduscol('la prise de la Bastille (que l’on racontera) le 14 juillet 1789'),
  privileges: eduscol('l’abolition des privilèges qui pose l’égalité des citoyens devant la loi (nuit du 4 août 1789)'),
  declaration: eduscol('l’adoption de la Déclaration des droits de l’homme et du citoyen (26 août 1789)'),
  federation: eduscol(
    'la Fête de la Fédération du 14 juillet 1790, sur le Champ de Mars, permettra d’aborder la nouvelle conception de la nation qui surgit alors : des citoyens libres et égaux en droit qui s’associent volontairement, et de montrer l’origine de la fête nationale du 14 juillet.',
  ),
  chute: eduscol('Le 10 août 1792, une journée parisienne aboutit à la chute de la monarchie.'),
  republique: eduscol('La Première République est mise en place en septembre 1792'),
  execution: eduscol('Le roi est jugé par la Convention et exécuté le 21 janvier 1793.'),

  // La Nation
  nation: eduscol('des citoyens libres et égaux en droit qui s’associent volontairement'),
  finances: eduscol(
    'Le projet de la monarchie d’opérer une réforme fiscale pour redresser sa situation financière se heurte à l’opposition de la noblesse de robe',
  ),
  dessin: eduscol('Des caricatures classiques montrant le tiers-état portant sur son dos la noblesse et le clergé'),

  // Napoléon et les héritages
  brumaire: eduscol(
    'Quand Napoléon Bonaparte prend le pouvoir, lors du coup d’État du 18 brumaire an VIII (9 novembre 1799)',
  ),
  empire: eduscol('en établissant l’Empire en 1804'),
  libertes: eduscol('Le régime napoléonien a respecté de moins en moins les libertés publiques'),
  prefets: eduscol(
    'il a réorganisé l’État dans le cadre départemental hérité de la Révolution, avec la mise en place des préfets.',
  ),
  code: eduscol(
    'Avec la promulgation du Code civil, en 1804, il a unifié le droit français selon le principe de l’égalité des citoyens devant la loi.',
  ),
  banque: eduscol('appuyé la création de la Banque de France'),
  cocarde: eduscol(
    'les symboles révolutionnaires (cocarde tricolore par exemple) et de montrer qu’ils sont toujours présents dans la symbolique républicaine actuelle',
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
