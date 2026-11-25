import type { SubjectTerm } from '../../types.ts';

/**
 * Glossaire de technologie : chaque terme en gras d'un mémo y est défini (« matériau » et « alliage » sont déjà
 * définis dans le glossaire sciences et technologie).
 */
export const GLOSSAIRE: readonly SubjectTerm[] = [
  {
    id: 'te-besoin',
    word: 'besoin',
    forms: ['besoin', 'besoins'],
    definition: 'Manque ressenti par une personne ou une société, auquel un objet peut répondre.',
    example: '« Se déplacer » est un besoin ; le vélo y répond.',
  },
  {
    id: 'te-usage',
    word: 'usage',
    forms: ['usage', 'usages'],
    definition: 'La façon de se servir d’un objet pour obtenir un effet qui répond à un besoin.',
    example: 'L’usage d’une lampe de bureau : éclairer une table de travail.',
  },
  {
    id: 'te-fonction-technique',
    word: 'fonction technique',
    forms: ['fonction technique', 'fonctions techniques'],
    definition: 'Rôle précis qu’un objet doit assurer.',
    example: 'Dans une lampe : « éclairer », « allumer et éteindre ».',
  },
  {
    id: 'te-solution-technique',
    word: 'solution technique',
    forms: ['solution technique', 'solutions techniques'],
    definition: 'Élément choisi pour assurer une fonction technique.',
    example: 'L’interrupteur permet d’allumer et d’éteindre la lampe.',
  },
  {
    id: 'te-cahier-des-charges',
    word: 'cahier des charges',
    forms: ['cahier des charges', 'cahiers des charges'],
    definition: 'Document qui liste les exigences que le futur objet devra respecter.',
    example: '« La gourde doit contenir au moins 0,75 L. »',
  },
  {
    id: 'te-norme',
    word: 'norme',
    forms: ['norme', 'normes'],
    definition: 'Ensemble de données (mesures, qualités) qui définit un produit et sert de référence.',
    example: 'Une norme fixe les dimensions à respecter pour des prises électriques.',
  },
  {
    id: 'te-label',
    word: 'label',
    forms: ['label', 'labels'],
    definition: 'Marque apposée sur un produit pour en garantir la qualité.',
    example: 'Un logo sur l’emballage atteste que le produit respecte des critères.',
  },
  {
    id: 'te-ergonomie',
    word: 'ergonomie',
    forms: ['ergonomie'],
    definition: 'Adaptation d’un objet à la personne qui s’en sert, pour un usage facile et confortable.',
    example: 'Une poignée qui épouse la forme de la main.',
  },
  {
    id: 'te-securite',
    word: 'sécurité',
    forms: ['sécurité'],
    definition: 'Situation sans danger pour les personnes.',
    example: 'Un mixeur qui ne démarre que couvercle fermé.',
  },
  {
    id: 'te-developpement-durable',
    word: 'développement durable',
    forms: ['développement durable'],
    definition: 'Développement qui répond aux besoins d’aujourd’hui sans priver les générations futures des leurs.',
    example: 'Utiliser un matériau recyclé pour moins puiser dans les ressources.',
  },
  {
    id: 'te-procede',
    word: 'procédé',
    forms: ['procédé', 'procédés'],
    definition: 'Manière de réaliser, façonner ou assembler une pièce.',
    example: 'Le perçage et le pliage sont des procédés.',
  },
  {
    id: 'te-mise-en-forme',
    word: 'mettre en forme',
    forms: ['mettre en forme', 'mise en forme'],
    definition:
      'Donner sa forme à une pièce sans ajouter ni enlever de matière, par exemple en pliant ou en chauffant.',
    example: 'Plier une plaque pour faire un support.',
  },
  {
    id: 'te-assemblage',
    word: 'assemblage',
    forms: ['assemblage', 'assemblages'],
    definition: 'Réunion de pièces ; il est démontable (vis) ou fixe (soudure).',
    example: 'Les quatre pieds d’une table sont vissés au plateau.',
  },
  {
    id: 'te-interacteur-exterieur',
    word: 'interacteurs extérieurs',
    forms: ['interacteur extérieur', 'interacteurs extérieurs'],
    definition: 'Ce qui échange avec un objet depuis l’extérieur : usagers, données, autres objets, environnement.',
    example: 'La pluie et la télécommande pour un portail automatique.',
  },
  {
    id: 'te-cycle-de-vie',
    word: 'cycle de vie',
    forms: ['cycle de vie', 'cycles de vie'],
    definition:
      'Toutes les étapes d’un objet : extraction, traitement, fabrication, assemblage, utilisation, fin de vie, avec le transport.',
    example: 'Du minerai de fer au vélo recyclé.',
  },
  {
    id: 'te-indice-reparabilite',
    word: 'indice de réparabilité',
    forms: ['indice de réparabilité'],
    definition: 'Note de 0 à 10 qui informe sur le caractère plus ou moins réparable d’un produit.',
    example: 'Un lave-vaisselle noté 8,5 est plus réparable qu’un autre noté 3.',
  },
];
