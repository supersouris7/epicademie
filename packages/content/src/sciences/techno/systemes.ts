/** Systèmes des exercices (illustrations des faits de `donnees-chaines.ts`), communs aux notions de 4e. */

export const FONCTIONS_ENERGIE = ['alimenter', 'distribuer', 'convertir', 'transmettre'] as const;
export type FonctionEnergie = (typeof FONCTIONS_ENERGIE)[number];

export const FONCTIONS_INFORMATION = ['acquérir', 'traiter', 'communiquer'] as const;
export type FonctionInformation = (typeof FONCTIONS_INFORMATION)[number];

export const ROLE_ENERGIE: Readonly<Record<FonctionEnergie, string>> = {
  alimenter: 'fournir l’énergie au système',
  distribuer: 'autoriser ou non la circulation de l’énergie',
  convertir: 'transformer l’énergie en une autre énergie utilisable par le système',
  transmettre: 'amener l’énergie jusqu’à l’endroit où se fait l’action',
};

export const ROLE_INFORMATION: Readonly<Record<FonctionInformation, string>> = {
  acquérir: 'prélever les informations venant de l’utilisateur ou de l’environnement',
  traiter: 'exécuter le programme pour décider de ce qu’il faut faire',
  communiquer: 'envoyer le résultat à l’utilisateur ou à la chaîne d’énergie',
};

/** « de » devant un groupe nominal indéfini : « d’une barrière ». */
export const de = (nom: string) => (nom.startsWith('un') ? `d’${nom}` : `de ${nom}`);

export interface SystemeEnergie {
  readonly nom: string;
  readonly action: string;
  /** Constituant de chaque fonction. */
  readonly constituants: Readonly<Record<FonctionEnergie, string>>;
}

export const SYSTEMES_ENERGIE: readonly SystemeEnergie[] = [
  {
    nom: 'une trottinette électrique',
    action: 'faire tourner la roue arrière',
    constituants: {
      alimenter: 'la batterie',
      distribuer: 'l’interrupteur',
      convertir: 'le moteur électrique',
      transmettre: 'la courroie et ses poulies',
    },
  },
  {
    nom: 'un portail coulissant',
    action: 'déplacer le portail',
    constituants: {
      alimenter: 'la prise reliée au réseau électrique',
      distribuer: 'le relais',
      convertir: 'le moteur électrique',
      transmettre: 'le pignon et la crémaillère',
    },
  },
  {
    nom: 'une barrière de parking',
    action: 'lever la barrière',
    constituants: {
      alimenter: 'la batterie',
      distribuer: 'le relais',
      convertir: 'le moteur électrique',
      transmettre: 'les engrenages',
    },
  },
  {
    nom: 'un tapis roulant de caisse',
    action: 'faire avancer le tapis',
    constituants: {
      alimenter: 'la prise reliée au réseau électrique',
      distribuer: 'l’interrupteur',
      convertir: 'le moteur électrique',
      transmettre: 'la courroie et ses poulies',
    },
  },
];

export interface SystemeInformation {
  readonly nom: string;
  readonly capteur: string;
  /** Ce que le capteur mesure ou repère. */
  readonly grandeur: string;
  readonly sortie: string;
  readonly actionneur: string;
}

export const SYSTEMES_INFORMATION: readonly SystemeInformation[] = [
  {
    nom: 'une porte automatique',
    capteur: 'le capteur de présence',
    grandeur: 'la présence d’une personne',
    sortie: 'le voyant lumineux',
    actionneur: 'le moteur de la porte',
  },
  {
    nom: 'un chauffage programmable',
    capteur: 'le capteur de température',
    grandeur: 'la température de la pièce',
    sortie: 'l’afficheur',
    actionneur: 'le radiateur',
  },
  {
    nom: 'un robot de livraison',
    capteur: 'le capteur de distance',
    grandeur: 'la distance d’un obstacle',
    sortie: 'l’avertisseur sonore',
    actionneur: 'le moteur des roues',
  },
  {
    nom: 'une serre automatisée',
    capteur: 'le capteur d’humidité',
    grandeur: 'l’humidité de la terre',
    sortie: 'l’afficheur',
    actionneur: 'la pompe d’arrosage',
  },
];
