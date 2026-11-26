/**
 * Faits du chapitre « Usages du numérique » (technologie 5e). Chaque fait cite son identifiant de source (registre
 * `sources.ts`) et la citation exacte du texte officiel. Les fichiers, tailles, réseaux et situations des exercices
 * illustrent ces faits : ils ne sont pas des faits.
 */
import { PROGRAMME, type Fait } from './donnees.ts';

export const FAITS_NUMERIQUE: readonly Fait[] = [
  // ——— Données, fichiers, arborescence ———
  {
    id: 'programme-recenser',
    source: PROGRAMME,
    citation:
      'Recenser des données, les identifier, les classer, les représenter, les stocker dans des fichiers, les retrouver dans une arborescence',
  },
  {
    id: 'programme-fichiers',
    source: PROGRAMME,
    citation:
      'fichiers informatiques (fichier texte, fichier image, fichier de type tableur ou CSV) et dossiers, arborescence',
  },
  {
    id: 'programme-droits',
    source: PROGRAMME,
    citation: 'extension et format de fichiers, droits d’écriture et de lecture sur les fichiers',
  },
  {
    id: 'programme-unites',
    source: PROGRAMME,
    citation: 'unité de quantité d’information : bit, octet et leurs multiples',
  },
  {
    id: 'programme-descripteurs',
    source: PROGRAMME,
    citation:
      'Déterminer des descripteurs permettant de décrire des objets sous forme de données en précisant leurs types et leurs formats',
  },
  {
    id: 'programme-types',
    source: PROGRAMME,
    citation:
      'objet / descripteur / collection (liste) / type (mot/chaîne de caractères, nombre et booléen) / données structurées',
  },
  {
    id: 'fichier-def',
    source: 'academie-fichier',
    citation: 'Ensemble organisé de données ayant trait à un même sujet, enregistré sur un support informatique',
  },
  { id: 'bit-def', source: 'academie-bit', citation: 'le bit est l’unité élémentaire d’information' },
  { id: 'octet-def', source: 'academie-octet', citation: 'Unité d’information composée de huit bits' },
  {
    id: 'kilo-def',
    source: 'academie-kilo',
    citation: 'Élément de composition qui, placé devant le nom d’une unité, multiplie celle-ci par mille.',
  },
  { id: 'giga-def', source: 'academie-giga', citation: 'Élément de composition signifiant Un milliard de fois' },
  {
    id: 'prefixes-si',
    source: 'bipm-prefixes-si',
    citation: 'Multiples et sous-multiples décimaux des unités du SI',
  },
  // ——— Réseau local ———
  {
    id: 'programme-composants',
    source: PROGRAMME,
    citation:
      'Identifier les composants qui constituent un réseau local (terminaux, commutateurs, liaisons filaires et sans fil (WiFi)) et sa topologie',
  },
  {
    id: 'programme-identifier-terminaux',
    source: PROGRAMME,
    citation: 'Justifier la nécessité d’identifier les terminaux pour communiquer sur un réseau local',
  },
  { id: 'programme-local-internet', source: PROGRAMME, citation: 'Un réseau local, le réseau mondial (Internet)' },
  {
    id: 'programme-roles',
    source: PROGRAMME,
    citation:
      'Le rôle d’un terminal, d’une carte réseau, des liaisons (filaires ou non filaires), d’un commutateur, d’un routeur, d’un serveur',
  },
  {
    id: 'reseau-def',
    source: 'ue-reglement-801-2013',
    citation: 'une infrastructure de communication avec une typologie de liens, une architecture',
  },
  {
    id: 'commutateur-def',
    source: 'ue-reglement-801-2013',
    citation:
      'un dispositif de réseau dont la fonction première est de filtrer, transférer et distribuer des trames, sur la base de l’adresse de destination de chaque trame',
  },
  {
    id: 'routeur-def',
    source: 'ue-reglement-801-2013',
    citation: 'Les routeurs transmettent des paquets d’un réseau à l’autre',
  },
  {
    id: 'point-acces-def',
    source: 'ue-reglement-801-2013',
    citation:
      'un dispositif dont la fonction première est d’assurer une connectivité IEEE 802.11 (Wi-Fi) à des clients multiples',
  },
  {
    id: 'serveur-def',
    source: 'academie-serveur',
    citation:
      'Matériel ou logiciel programmé pour accomplir une tâche spécifique en réponse à la demande que lui adresse un autre système informatique ou un utilisateur connecté à un réseau.',
  },
  {
    id: 'etoile-def',
    source: 'cnrtl-etoile',
    citation: 'En forme d’étoile; qui présente une disposition en rayons.',
  },
  // ——— Règles et sécurité ———
  {
    id: 'programme-regles',
    source: PROGRAMME,
    citation:
      'Identifier des règles permettant de sécuriser un environnement numérique (bases de la cybersécurité) et des règles de respect de la propriété intellectuelle',
  },
  {
    id: 'programme-cybersecurite',
    source: PROGRAMME,
    citation:
      'protection des données personnelles, traces numériques (témoins de connexion, géolocalisation), identification, authentification, respect de la propriété intellectuelle',
  },
  {
    id: 'cybersecurite-def',
    source: 'ue-cybersecurite-2019-881',
    citation:
      'les actions nécessaires pour protéger les réseaux et les systèmes d’information, les utilisateurs de ces systèmes et les autres personnes exposées aux cybermenaces',
  },
  {
    id: 'cyberhygiene',
    source: 'ue-nis2-2022-2555',
    citation:
      'les mises à jour logicielles et matérielles, les changements de mot de passe, la gestion de nouvelles installations, la restriction des comptes d’accès de niveau administrateur et la sauvegarde de données',
  },
  {
    id: 'hameconnage',
    source: 'ue-nis2-2022-2555',
    citation: 'sensibiliser aux cybermenaces, au hameçonnage ou aux techniques d’ingénierie sociale',
  },
  {
    id: 'identification-def',
    source: 'ue-eidas-910-2014',
    citation:
      'le processus consistant à utiliser des données d’identification personnelle sous une forme électronique représentant de manière univoque une personne',
  },
  {
    id: 'authentification-def',
    source: 'ue-eidas-910-2014',
    citation: 'un processus électronique qui permet de confirmer l’identification électronique d’une personne',
  },
  {
    id: 'sauvegarde-def',
    source: 'academie-sauvegarde',
    citation:
      'Opération par laquelle on copie des données sur un support afin de prévenir leur disparition ou leur dégradation',
  },
  {
    id: 'auteur-droit',
    source: 'cpi-l111-1',
    citation:
      'L’auteur d’une oeuvre de l’esprit jouit sur cette oeuvre, du seul fait de sa création, d’un droit de propriété incorporelle exclusif et opposable à tous.',
  },
  {
    id: 'reproduction-illicite',
    source: 'cpi-l122-4',
    citation:
      'Toute représentation ou reproduction intégrale ou partielle faite sans le consentement de l’auteur ou de ses ayants droit ou ayants cause est illicite.',
  },
  {
    id: 'plagiat-def',
    source: 'academie-plagiat',
    citation: 'Ouvrage dont certains passages, donnés pour originaux, ont été empruntés à autrui.',
  },
  {
    id: 'acces-frauduleux',
    source: 'code-penal-323-1',
    citation:
      'Le fait d’accéder ou de se maintenir, frauduleusement, dans tout ou partie d’un système de traitement automatisé de données est puni',
  },
  {
    id: 'temoins-consentement',
    source: 'loi-informatique-libertes-82',
    citation:
      'Ces accès ou inscriptions ne peuvent avoir lieu qu’à condition que l’abonné ou la personne utilisatrice ait exprimé, après avoir reçu cette information, son consentement',
  },
  // ——— Impacts sur la société ———
  {
    id: 'programme-systemes-information',
    source: PROGRAMME,
    citation: 'Décrire le rôle des systèmes d’information dans le partage d’information',
  },
  {
    id: 'programme-derives',
    source: PROGRAMME,
    citation:
      'Appréhender la responsabilité de chacun dans les dérives (cyberviolence, atteinte à la vie privée, aux données personnelles, usurpation d’identité)',
  },
  {
    id: 'programme-incidences-reseaux',
    source: PROGRAMME,
    citation: 'incidences liées au stockage, au flux des données et aux réseaux d’information',
  },
  {
    id: 'systeme-information-def',
    source: 'ue-nis2-2022-2555',
    citation:
      'les données numériques stockées, traitées, récupérées ou transmises par les éléments visés aux points a) et b)',
  },
  {
    id: 'donnee-personnelle-def',
    source: 'rgpd-2016-679',
    citation: 'toute information se rapportant à une personne physique identifiée ou identifiable',
  },
  {
    id: 'donnee-personnelle-identifiants',
    source: 'rgpd-2016-679',
    citation: 'un nom, un numéro d’identification, des données de localisation, un identifiant en ligne',
  },
  { id: 'vie-privee', source: 'code-civil-9', citation: 'Chacun a droit au respect de sa vie privée.' },
  {
    id: 'usurpation',
    source: 'code-penal-226-4-1',
    citation:
      'Le fait d’usurper l’identité d’un tiers ou de faire usage d’une ou plusieurs données de toute nature permettant de l’identifier en vue de troubler sa tranquillité ou celle d’autrui',
  },
  {
    id: 'harcelement-groupe',
    source: 'code-penal-222-33-2-2',
    citation:
      'Lorsque ces propos ou comportements sont imposés à une même victime, successivement, par plusieurs personnes qui, même en l’absence de concertation, savent que ces propos ou comportements caractérisent une répétition.',
  },
  {
    id: 'harcelement-numerique',
    source: 'code-penal-222-33-2-2',
    citation:
      'Lorsqu’ils ont été commis par l’utilisation d’un service de communication au public en ligne ou par le biais d’un support numérique ou électronique',
  },
  {
    id: 'cyberharcelement-def',
    source: 'education-cyberharcelement',
    citation:
      'un acte agressif, intentionnel perpétré par un individu ou un groupe d’individus au moyen de formes de communication électroniques, de façon répétée à l’encontre d’une victime qui ne peut facilement se défendre seule',
  },
  {
    id: 'numero-3018',
    source: 'eduscol-donnees-personnelles',
    citation: 'Le numéro national pour les victimes de violences numériques est le 3018.',
  },
  {
    id: 'empreinte-numerique',
    source: 'ecologie-numerique-responsable',
    citation:
      'En 2020, le numérique représentait 2.5% de l’empreinte carbone annuelle de la France et 10% de sa consommation électrique annuelle.',
  },
];
