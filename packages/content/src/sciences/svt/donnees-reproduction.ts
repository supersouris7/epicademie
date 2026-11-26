/**
 * Faits du chapitre « Reproduction et sexualité » (4e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte du texte consulté (programme du cycle 4, Académie française et CNRTL, Inserm,
 * Santé publique France). Les élevages, carnets, fiches et calendriers des exercices de niveau 5 sont inventés : ils
 * illustrent ces faits, ils ne sont pas des faits.
 */
import type { Fait } from './donnees.ts';

export const PROGRAMME = 'cycle4-2020';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const FAITS_REPRODUCTION: readonly Fait[] = [
  // Programme.
  f('programme-modes', PROGRAMME, 'reproduction sexuée et asexuée des êtres'),
  f('programme-puberte', PROGRAMME, 'Puberté, organes reproducteurs, production de'),
  f('programme-maitrise', PROGRAMME, 'de la maîtrise de la reproduction.'),
  f('programme-comportements', PROGRAMME, 'fertilité, grossesse, respect de l’autre, choix'),

  // Reproductions sexuée et asexuée.
  f(
    'reproduction-sexuee',
    'academie-reproduction',
    's’unissent au cours de la fécondation pour donner un œuf qui sera à l’origine d’un nouvel organisme génétiquement distinct de celui de chacun des parents',
  ),
  f(
    'reproduction-asexuee',
    'academie-reproduction',
    'un organisme donne naissance, sans rencontre de gamètes, à un ou plusieurs descendants qui lui sont génétiquement identiques',
  ),
  f(
    'asexuee-plantes',
    'academie-asexue',
    'Le bouturage et le marcottage sont, pour les plantes, des exemples de reproduction asexuée.',
  ),
  f('bouture', 'academie-bouture', 'Fragment qu’on a détaché d’un végétal et qui, planté en terre, y prend racine.'),
  f('bouturage', 'academie-bouturage', 'Reproduction des plantes par bouture.'),
  f('bourgeonnement', 'academie-bourgeonnement', 'L’hydre d’eau douce se reproduit par bourgeonnement.'),
  f('stolon', 'cnrtl-stolon', 'pour produire de nouveaux pieds par marcottage naturel'),
  f('scissiparite', 'cnrtl-scissiparite', 'Mode de reproduction asexuée par division'),
  f('clone', 'academie-clone', 'possédant le même patrimoine génétique'),
  f('gamete', 'academie-gamete', 'L’ovule est un gamète femelle, le spermatozoïde un gamète mâle.'),
  f(
    'fecondation-interne',
    'academie-fecondation',
    'La fécondation est interne chez les Mammifères, externe chez la plupart des Poissons.',
  ),
  f(
    'pollen-insectes',
    'academie-fecondation',
    'Les insectes butineurs facilitent la fécondation croisée des plantes en transportant le pollen de fleur en fleur.',
  ),
  f(
    'pollen',
    'academie-pollen',
    'Les anthères libèrent le pollen, qui est ensuite dispersé par les insectes ou par le vent.',
  ),
  f('graine', 'academie-graine', 'provient de la fécondation de l’ovule et qui assure la reproduction de la plante'),
  f(
    'dissemination',
    'academie-dissemination',
    'Dispersion des graines et des spores effectuée par des agents naturels.',
  ),
  f('hermaphrodite', 'academie-hermaphrodite', 'L’escargot, le ver de terre sont hermaphrodites'),

  f('ovule-graine', 'academie-ovule', 'qui, après fécondation, devient graine'),
  f('pollen-etamines', 'academie-pollen', 'produits dans l’anthère des étamines chez les Angiospermes'),
  f('pollen-gametes', 'academie-pollen', 'dont deux cellules sont des cellules reproductrices mâles'),

  // Puberté.
  f(
    'ovocytes-ovules',
    'inserm-menopause',
    'À la naissance, les ovaires contiennent un stock d’environ un million d’ovocytes (ou ovules)',
  ),
  f(
    'puberte-definition',
    'academie-puberte',
    'au cours de laquelle les organes génitaux deviennent aptes à la reproduction',
  ),
  f(
    'puberte-signes',
    'academie-puberte',
    'chez les filles par l’apparition des règles et l’émission d’un ovule à chaque cycle, chez les garçons par la production des spermatozoïdes',
  ),
  f('puberte-age', 'academie-puberte', 'L’âge de la puberté varie selon les individus.'),
  f('ovaire', 'academie-ovaire', 'où se forment les ovules et qui produisent les hormones sexuelles'),
  f(
    'testicule',
    'cnrtl-testicule',
    'possède une fonction exocrine (production de spermatozoïdes) et une fonction endocrine (production d’hormones mâles notamment de la testostérone)',
  ),
  f('testosterone', 'cnrtl-testosterone', 'détermine l’apparition des caractères sexuels'),
  f(
    'oestrogene',
    'academie-oestrogene',
    'intervient dans la régulation des cycles menstruels, et dans le développement des caractères sexuels secondaires',
  ),
  f(
    'hormone',
    'academie-hormone',
    'apportée par le sang jusqu’aux cellules d’un autre organe dont elle assure la régulation',
  ),
  f('hypophyse', 'academie-hypophyse', 'sécrète les hormones nécessaires au fonctionnement des autres glandes'),
  f(
    'controle-cerveau',
    'inserm-infertilite',
    'Cette production est contrôlée par le cerveau au niveau du complexe hypothalamo-hypophysaire qui libère deux hormones dans le sang : FSH et LH.',
  ),
  f(
    'spermatozoides-continu',
    'inserm-infertilite',
    'la production de gamètes, ou spermatogenèse (Processus de formation des spermatozoïdes.), débute à la puberté',
  ),
  f(
    'stock-ovocytes',
    'inserm-infertilite',
    'Une fille naît avec un stock complet d’ovocytes dans chacun de ses ovaires.',
  ),
  f(
    'cycle-ovocyte',
    'inserm-infertilite',
    'un ovocyte est expulsé chaque mois par l’un des deux ovaires vers le 14e jour du cycle (sachant que ce dernier débute le premier jour des règles)',
  ),
  f('ovulation', 'academie-ovulation', 'Production périodique, par l’ovaire, d’un ovule parvenu à maturité.'),
  f(
    'regles',
    'academie-menstruation',
    'résulte de la chute de la muqueuse utérine et qui se manifeste par un écoulement sanguin',
  ),

  // Reproduction humaine.
  f('sperme', 'cnrtl-sperme', 'contenant les spermatozoïdes'),
  f(
    'spermatozoide',
    'cnrtl-spermatozoide',
    'Cellule reproductrice mâle, arrivée à maturité et apte à féconder l’ovule.',
  ),
  f('fecondation-trompe', 'academie-fecondation', 'Chez la femme, la fécondation s’effectue dans la trompe utérine.'),
  f('trompes', 'inserm-infertilite', 'les conduits qui relient chaque ovaire à l’utérus'),
  f('uterus', 'cnrtl-uterus', 'où s’effectue la gestation'),
  f('nidation', 'academie-nidation', 'implantation de l’œuf dans la muqueuse utérine'),
  f(
    'embryon-foetus',
    'academie-embryon',
    'Dans l’espèce humaine, l’embryon prend le nom de fœtus lors du troisième mois de la grossesse.',
  ),
  f('foetus', 'academie-foetus', 'Produit de la conception en cours de développement dans l’utérus'),
  f(
    'placenta',
    'academie-placenta',
    'Le placenta permet le passage de l’oxygène et des nutriments du sang maternel au sang fœtal, et le passage, en sens inverse, du gaz carbonique et des déchets fœtaux.',
  ),
  f('cordon', 'academie-ombilical', 'cordon torsadé qui relie le fœtus au placenta'),
  f('liquide-amniotique', 'academie-amniotique', 'liquide dans lequel baigne le fœtus'),
  f('grossesse', 'academie-grossesse', 'État d’une femme enceinte ; durée de cet état.'),
  f('accouchement', 'academie-accouchement', 'Le fait de mettre un enfant au monde.'),
  f(
    'alcool-placenta',
    'inserm-alcool-sante',
    'L’alcool consommé pendant la grossesse traverse facilement le placenta et expose directement l’embryon et le fœtus.',
  ),
  f('alcool-recommandation', 'inserm-alcool-sante', 'la recommandation est donc de ne pas consommer d’alcool'),

  f('remontee', 'inserm-amp', 'Les spermatozoïdes mobiles remontent naturellement vers les trompes'),

  // Maîtrise de la reproduction.
  f('implant-ovulation', 'inserm-contraception', 'conduisant au blocage de l’ovulation'),
  f('contraception', 'academie-contraception', 'Ensemble de pratiques destinées à empêcher la fécondation de l’ovule'),
  f('hormonale', 'inserm-contraception', 'l’administration d’hormones qui vont bloquer l’ovulation'),
  f('pilule', 'academie-pilule', 'dont la prise régulière empêche la fécondation en bloquant notamment l’ovulation'),
  f(
    'prescription',
    'inserm-contraception',
    'les contraceptifs hormonaux doivent faire l’objet d’une prescription, réalisée à l’issue d’une consultation médicale',
  ),
  f(
    'implant',
    'inserm-contraception',
    'un petit bâtonnet en plastique de la taille d’une allumette qui est inséré sous la peau du bras',
  ),
  f(
    'diu-cuivre',
    'inserm-contraception',
    'La présence du cuivre a un effet toxique sur les spermatozoïdes, et le dispositif en lui-même empêche l’implantation d’un ovule fécondé.',
  ),
  f(
    'preservatif-barriere',
    'inserm-contraception',
    'Les préservatifs empêchent le passage des spermatozoïdes dans le vagin.',
  ),
  f('preservatif-ist', 'inserm-contraception', 'les préservatifs protègent des infections sexuellement transmissibles'),
  f(
    'preservatif-definition',
    'academie-preservatif',
    'dans un but contraceptif ou pour éviter de transmettre ou de contracter une infection sexuellement transmissible',
  ),
  f(
    'urgence',
    'inserm-contraception',
    'il existe des méthodes de « rattrapage » pour éviter une grossesse non souhaitée. On parle de contraception d’urgence.',
  ),
  f(
    'urgence-mineures',
    'inserm-contraception',
    'Elle est accessible gratuitement aux mineures, sans ordonnance médicale, en pharmacie, à l’infirmerie scolaire',
  ),
  f('urgence-delai', 'inserm-contraception', 'Plus elle est administrée rapidement et plus elle est efficace.'),
  f(
    'ist-transmission',
    'spf-ist',
    'Les infections sexuellement transmissibles (IST) se transmettent principalement lors des rapports sexuels.',
  ),
  f('ist-prevention', 'spf-ist', 'le préservatif et le dépistage sont les moyens de prévention actuels'),
  f('vih', 'spf-vih', 'Il affaiblit le système immunitaire, et en l’absence de traitement, est responsable du sida.'),
  f('vih-silencieux', 'spf-vih', 'L’infection peut rester asymptomatique pendant plusieurs années.'),
  f('hpv-vaccin', 'spf-papillomavirus', 'peut être évité grâce à la vaccination contre le HPV'),
  f('chlamydia', 'spf-chlamydiae', 'Limiter les contaminations passe par l’usage du préservatif et le dépistage.'),
  f(
    'amp',
    'inserm-amp',
    'consiste à manipuler un ovule et/ou un spermatozoïde pour favoriser l’obtention d’une grossesse',
  ),
  f('insemination', 'inserm-amp', 'pour l’injecter directement dans l’utérus de la femme'),
  f('fiv', 'inserm-amp', 'provoquer la rencontre d’un ovule et d’un spermatozoïde en laboratoire'),
  f('fiv-transfert', 'inserm-amp', 'les embryons sont transférés dans l’utérus de la femme'),
];
