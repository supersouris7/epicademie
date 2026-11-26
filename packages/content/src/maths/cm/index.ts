import type { Chapter } from '../../types.ts';
import { contexte } from './contexte.ts';
import type { CM } from './outils.ts';
import { buildNombres } from './nombres.ts';
import { buildFractions } from './fractions.ts';
import { buildDecimaux } from './decimaux.ts';
import { buildCalculMental } from './calculMental.ts';
import { buildOperations } from './operations.ts';
import { buildProblemes } from './problemes.ts';
import { buildAlgebre } from './algebre.ts';
import { buildMesures } from './mesures.ts';
import { buildAires } from './aires.ts';
import { buildDurees } from './durees.ts';
import { buildGeometrie } from './geometrie.ts';
import { buildAngles } from './angles.ts';
import { buildDonnees } from './donnees.ts';
import { buildProbabilites } from './probabilites.ts';
import { buildProportionnalite } from './proportionnalite.ts';
import { buildComplements } from './complements.ts';
import { nombresCm1 } from './nombresCm1.ts';
import { fractionsCm1 } from './fractionsCm1.ts';

/**
 * Programmes du CM1 et du CM2 (cycle 3, BO n°16 du 17 avril 2025). Les deux années ont la même structure ;
 * les bornes changent : nombres jusqu'à 999 999 (CM1) ou 999 999 999 (CM2), décimaux jusqu'aux centièmes
 * (CM1) ou millièmes (CM2), fractions de dénominateur ≤ 20 (CM1) ou ≤ 60 (CM2)…
 */
function build(g: CM): Chapter[] {
  const k = contexte(g);
  const extra = buildComplements(k);
  const chapters = [
    buildNombres(k),
    buildFractions(k),
    buildDecimaux(k),
    buildCalculMental(k),
    buildOperations(k),
    buildProblemes(k),
    buildAlgebre(k),
    buildMesures(k),
    buildAires(k),
    buildDurees(k),
    buildGeometrie(k),
    buildAngles(k),
    buildDonnees(k),
    buildProbabilites(k),
    buildProportionnalite(k),
  ];
  // Notions du CM1 déjà portées à 5 niveaux : elles remplacent la version à 3 niveaux, sous le même identifiant.
  const renewed = new Map(g === 'cm1' ? [...nombresCm1(k), ...fractionsCm1(k)].map((s) => [s.id, s]) : []);
  // Notions ajoutées par l'audit du programme (complements.ts), rangées dans leur chapitre (m<classe>-<clé>).
  return chapters.map((c) => {
    const more = extra[c.id.replace(`m${g}-`, '')] ?? [];
    return { ...c, skills: [...c.skills.map((s) => renewed.get(s.id) ?? s), ...more] };
  });
}

export const CM1: readonly Chapter[] = build('cm1');
export const CM2: readonly Chapter[] = build('cm2');
