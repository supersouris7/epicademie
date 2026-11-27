/**
 * Faits du chapitre « Classer le vivant » (5e, lot sv-5e-04). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte du texte consulté (programmes des cycles 3 et 4, Muséum national d’Histoire
 * naturelle, dictionnaires publiés par le CNRTL). Les animaux aux noms inventés, leurs fiches et les croisements des
 * exercices illustrent ces faits, ils ne sont pas des faits.
 */
import { PROGRAMME, type Fait } from './donnees.ts';

const f = (id: string, source: string, citation: string): Fait => ({ id, source, citation });

export const CLASSER = 'mnhn-classer-le-vivant';
export const ARBRE = 'mnhn-arbre-du-vivant';

export const FAITS_CLASSIFICATION: readonly Fait[] = [
  // Programmes.
  f('programme-caracteres', PROGRAMME, 'Caractères partagés et classification.'),
  f(
    'programme-parentes',
    PROGRAMME,
    'Relier l’étude des relations de parenté entre les êtres vivants, et l’évolution.',
  ),
  f(
    'programme-groupes',
    PROGRAMME,
    'Les grands groupes d’êtres vivants, dont Homo sapiens, leur parenté et leur évolution.',
  ),
  f(
    'programme-progressivite',
    PROGRAMME,
    'la classification évolutive est une méthode scientifique universelle pour décrire la diversité du vivant',
  ),
  f(
    'programme-emboites',
    'cycle3-2020',
    "Réaliser une classification en groupes emboités pour mettre en évidence des liens de parenté à partir d'un petit nombre d’espèces possédant des attributs identifiés.",
  ),
  // Classer selon les caractères.
  f(
    'caracteres-communs',
    CLASSER,
    'les êtres vivants pouvaient être réunis en fonction des caractères qu’ils ont en commun',
  ),
  f(
    'vertebres-mamelles',
    CLASSER,
    'les Vertébrés sont les animaux avec des vertèbres, les Mammifères sont les animaux à mamelles',
  ),
  f(
    'pouce-primates',
    CLASSER,
    'les humains et les chimpanzés font partie des primates, car ils ont un caractère commun : le pouce opposable',
  ),
  f('presence', CLASSER, 'Dans une classification, seules les présences de caractères ont du sens.'),
  f('invertebres', CLASSER, 'on y avait classé ensemble tous les animaux par leur absence de vertèbres'),
  f('trier-classer', CLASSER, 'la confusion entre séparer et regrouper, c’est-à-dire entre trier et classer'),
  f('cle', CLASSER, 'si ces outils sont très utiles pour identifier, mais pas pour classer'),
  f('plume', CLASSER, "tous les oiseaux descendent d'ancêtres communs qui leur on légué la plume"),
  f(
    'cetaces',
    'mnhn-cetace',
    'Comme tous les mammifères, les Cétacés donnent naissance à des petits qui sont allaités',
  ),
  f('arthropode-exosquelette', 'mnhn-arthropode', 'à commencer par un exosquelette articulé'),
  f('insecte-pattes', 'mnhn-insecte', 'qui possède trois paires de pattes'),
  f('araignee-pattes', 'mnhn-araignee', 'dont les 8 pattes locomotrices'),
  f('araignee-pas-insecte', 'mnhn-araignee', 'les araignées ne sont pas des insectes'),
  f('primate-def', 'cnrtl-primate', 'au cerveau très développé, dont le pouce est toujours opposable'),
  // Groupes emboîtés.
  f('emboitement', CLASSER, 'une organisation du vivant en groupes emboités les uns dans les autres'),
  f('grand-vers-petit', CLASSER, 'On part ainsi du plus grand groupe pour aller vers le plus spécifique.'),
  f(
    'herisson',
    CLASSER,
    'il faut d’abord ouvrir le grand tiroir des vertébrés, puis à l’intérieur de celui-ci chercher le tiroir des Mammifères',
  ),
  f('boite', CLASSER, 'Un taxon est semblable à une boîte, pouvant en contenir d’autres plus petites'),
  f(
    'boite-parente',
    CLASSER,
    'deux espèces sont dans une boîte de rang d’autant plus petit qu’elles sont étroitement apparentées',
  ),
  f('boite-espece', CLASSER, 'la boîte la plus petite est l’espèce, le plus petit des taxons'),
  f(
    'loup',
    CLASSER,
    'Il fait partie de la famille des Canidés (avec les chacals et les renards), de l’ordre des Carnivores',
  ),
  f('araignee-arachnide', 'mnhn-araignee', 'Elles font partie des arthropodes, et plus précisément des Arachnides'),
  f('arthropodes-groupes', 'mnhn-arthropode', 'les arachnides (dotés de huit pattes comme les araignées'),
  f(
    'hominides',
    'mnhn-humain',
    'Parmi les primates, les Hominidés regroupent les orangs-outangs, les gorilles, les bonobos ainsi que les chimpanzés, les humains',
  ),
  f('espece-primates', 'mnhn-humain', 'Notre espèce fait partie des primates'),
  f('primate-mammiferes', 'cnrtl-primate', 'Ordre de Mammifères'),
  // Parentés.
  f('arbre-role', ARBRE, 'L’arbre du vivant sert à montrer les relations de parenté entre des groupes d’êtres vivants'),
  f('attribut-ancetre', ARBRE, 'a probablement été légué par un ancêtre commun hypothétique exclusif à ces espèces'),
  f(
    'cousinage',
    ARBRE,
    'l’araignée est plus apparentée au crabe qu’à l’escargot, et le crocodile est plus apparenté à la mésange qu’au lézard',
  ),
  f('truite', ARBRE, 'La truite est plus apparentée à vous qu’à un requin'),
  f('ressemblance', ARBRE, 'les ressemblances globales sont parfois trompeuses'),
  f('champignons', CLASSER, 'les champignons sont plus proches des animaux que des plantes'),
  f('pas-echelle', CLASSER, 'elle plaçait l’humain comme la plus aboutie des espèces'),
  f(
    'ancetre-chimpanze',
    'mnhn-homme-singe',
    'humains et chimpanzés ont un ancêtre commun, un singe hominoïde vieux de 5 à 10 millions d’années',
  ),
  f('cousins', 'mnhn-homme-singe', 'ils ne sont pas nos pères ou nos frères, mais plutôt des cousins'),
  f(
    'tous-parents',
    'mnhn-tous-parents',
    'Tous les êtres vivants qui existent, ou ont existé, ont un lien de parenté puisqu’ils proviennent d’un même ancêtre',
  ),
  // Espèce.
  f(
    'espece-academie',
    'academie-espece',
    'Unité de classification groupant les êtres vivants qui ont les mêmes caractères morphologiques, histologiques, cytologiques, sont féconds entre eux et présentent des comportements communs.',
  ),
  f(
    'espece-criteres',
    CLASSER,
    'deux individus sont reconnus de la même espèce s’ils partagent les mêmes caractéristiques, s’ils parviennent à se reproduire entre eux et que leur descendance est fertile',
  ),
  f(
    'espece-definition',
    'mnhn-espece',
    "l'ensemble des individus qui se reconnaissent comme partenaires sexuels et produisent une descendance fertile",
  ),
  f('espece-ressemblance', 'mnhn-espece', 'Il faut donc plus qu’une simple ressemblance ou une capacité reproductive'),
  f(
    'espece-separation',
    'mnhn-espece',
    'S’ils sont maintenus séparés suffisamment longtemps, ces rameaux finissent par ne plus pouvoir se reproduire entre eux',
  ),
  f(
    'nom-binominal',
    'mnhn-espece',
    "le premier est le genre, il s'écrit avec une majuscule, tandis que le second est l'espèce spécifique, en minuscules",
  ),
  f('herisson-nom', ARBRE, 'Pour les hérissons, ce sera Erinaceus europaeus.'),
  f('mulet', 'academie-mulet', "Hybride mâle, né d'un âne et d'une jument, qui ne peut se reproduire"),
  f('hybrides-steriles', 'academie-hybride', "La plupart des hybrides d'espèces sont stériles."),
];
