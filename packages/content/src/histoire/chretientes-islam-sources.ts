/**
 * Preuves du chapitre « Chrétientés et islam (VIe-XIIIe siècles), des mondes en contact » (5e) : chacune cite un
 * identifiant du registre (`sources.ts`) et la citation exacte du texte. Les preuves sans `who` viennent du programme du
 * cycle 4 ; les autres, de la ressource d'accompagnement Éduscol du thème (mars 2016).
 */
import type { Preuve } from './kit.ts';

const programme = (quote: string) => ({ source: 'cycle4-2020', quote });
const eduscol = (quote: string) => ({
  source: 'eduscol-5e-chretientes-islam',
  who: 'La ressource d’accompagnement d’Éduscol',
  quote,
});

export const PREUVES = {
  // Programme du cycle 4, classe de 5e, thème 1
  periode: programme(
    'La période qui s’étend du VIe au XIIIe siècle, de Justinien à la prise de Bagdad par les Mongols (1258), est l’occasion de montrer comment naissent et évoluent des empires',
  ),
  fonctions: programme(
    'Les relations entre les pouvoirs politiques, militaires et religieux permettent par ailleurs de définir les fonctions de calife, de basileus et d’empereur.',
  ),
  mediterranee: programme(
    'La Méditerranée, sillonnée par des marins, des guerriers, des marchands, est aussi un lieu d’échanges scientifiques, culturels et artistiques.',
  ),

  // Byzance et l'Europe carolingienne
  justinien: eduscol(
    'La période s’ouvre avec le règne de l’empereur Justinien (527-565), c’est-à-dire avec la dernière tentative de reconstitution de l’unité de l’empire romain',
  ),
  basileus: eduscol(
    'le titre « d’Auguste », qui donne à l’empereur et à son autorité (auctoritas) un caractère sacré, devient à Constantinople le titre de « Basileus ».',
  ),
  heraclius: eduscol('c’est d’ailleurs Héraclius qui a pris le titre de « Basileus »'),
  couronnement: eduscol('Quand Charlemagne se fait couronner empereur en 800, il reprend le titre « d’Auguste ».'),
  romanite: eduscol('Dans le monde chrétien, elle est un héritage de la romanité.'),
  aix: eduscol(
    'étudier Charlemagne en son palais d’Aix permet de faire comprendre aux élèves le lien entre la religion et le pouvoir temporel',
  ),
  representants: eduscol(
    'le développement d’un système administratif reposant sur des représentants du pouvoir central est à étudier',
  ),
  louis: eduscol('il ne lui reste à la fin de son règne qu’un héritier, Louis le Pieux'),
  verdun: eduscol('le morcellement est effectif en 843 (Traité de Verdun)'),
  otton: eduscol('Otton Ier, fils d’Henri l’Oiseleur, restaure la dignité impériale à son profit en 962.'),
  saintEmpire: eduscol('C’est le début du Saint-Empire romain germanique'),
  pertes: eduscol('Mais la conquête arabe lui a fait perdre la Syrie, l’Égypte et toute l’Afrique.'),
  patriarche: eduscol(
    'l’empereur byzantin était le vrai chef religieux de l’Orient, et nommait à son gré le patriarche de Constantinople qui lui était soumis',
  ),
  palaisBasilique: eduscol(
    'Le plan aisément identifiable de cette ville permet de faire les mêmes constats de proximité entre palais et basilique',
  ),

  // De la naissance de l'islam à la prise de Bagdad
  hegire: eduscol('622 : Hégire et début de l’ère musulmane'),
  calife: eduscol('Le calife (« successeur ») se réclame de l’héritage de Muhammad.'),
  ali: eduscol(
    'C’est à propos du quatrième calife, Ali, cousin et gendre de Muhammad, que naissent les divisions entre musulmans',
  ),
  chiites: eduscol('de là naît l’opposition entre sunnites et chiites, pour lesquels Ali est le premier imam'),
  omeyyades: eduscol('La dynastie des Omeyyades domine le monde musulman jusqu’en 750 depuis leur capitale de Damas'),
  territoire: eduscol('un territoire immense qui va de l’Indus à la péninsule ibérique'),
  abbassides: eduscol('la dynastie des Abbassides s’impose, qui restera au pouvoir jusqu’en 1258'),
  capitaleAbbassides: eduscol('l’éloignement plus important de la capitale des Abbassides'),
  cordoue: eduscol('c’est un Omeyyade, rescapé de cette défaite, qui fonde un nouvel État à Cordoue'),
  bagdad: eduscol('la prise de Bagdad par les Mongols (1258) qui sonne le glas de la puissance du califat abbasside'),
  mosquee: eduscol(
    'La Grande mosquée de Damas, par son emplacement sur une ancienne église chrétienne, elle-même succédant à un temple romain, permet de faire, avec les élèves, le constat de la succession des religions et de la pérennité des lieux.',
  ),
  citadelle: eduscol('Sa proximité avec la citadelle peut être observée.'),
  pouvoirReligion: eduscol('que le lien entre pouvoir et religion est fort dans le monde médiéval'),
  diversite: eduscol('que l’islam et le christianisme sont précocement marqués par la diversité'),

  // Mondes en contact
  pacifiques: eduscol(
    'que les contacts entre des civilisations et des puissances différentes peuvent être pacifiques ou guerriers',
  ),
  rapports: eduscol(
    'Les rapports entre le monde chrétien et le monde musulman ne se résument pas à des affrontements militaires.',
  ),
  haroun: eduscol(
    'Charlemagne n’a aucune difficulté à initier des relations diplomatiques avec Haroun al Rachid, calife abbasside de Bagdad, pour prendre à revers les Omeyyades d’Al-Andalous',
  ),
  poitiers: eduscol(
    'La bataille dite de Poitiers (732 ou plus vraisemblablement 733) n’est pas perçue à l’époque comme un affrontement décisif entre chrétiens et musulmans.',
  ),
  schisme: eduscol('1054 : excommunication mutuelle du pape et du patriarche de Constantinople'),
  sac: eduscol(
    '1204 : sac de Constantinople par les croisés qui marque la rupture définitive entre chrétientés occidentale et orientale.',
  ),
  jerusalem: eduscol('un événement contextualisé (prise de Jérusalem en 1099, de Constantinople en 1204)'),
  croisadesByzantins: eduscol(
    'les premières croisades qui commencent ensuite ont aussi pour objet de soutenir les Byzantins face aux Turcs',
  ),
  tolede: eduscol(
    'contacts culturels qui visent parfois au partage de l’héritage antique (en particulier grâce aux traducteurs de Tolède ou à l’école d’astronomie de Cordoue)',
  ),
  commerce: eduscol(
    'échanges commerciaux dans le monde méditerranéen (d’abord dominés par l’empire byzantin, puis par les cités italiennes)',
  ),
  saladin: eduscol('Saladin a également échangé avec Richard Cœur de Lion des lettres'),
  alexiade: eduscol(
    'Alexis Comnène en son palais de Constantinople voit défiler les principaux chefs francs de la première croisade, décrits par sa fille Anne',
  ),
} satisfies Record<string, Preuve & { readonly source: string }>;
