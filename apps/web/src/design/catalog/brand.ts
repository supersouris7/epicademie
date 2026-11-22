import { a } from './kinds.ts';

/** Catalogue des images — Marque et illustrations plein cadre */

export const brandAssets = [
  a(
    'logo',
    'branding/logo.webp',
    'Logo Academy Fighters',
    'logo de jeu vidéo : grand blason-bouclier violet à bordure orange et liseré cyan, livre ouvert doré posé sur le haut du blason ; lettrage « ACADEMY » en blanc à contour violet foncé sur la première ligne, « FIGHTERS » plus grand en dégradé jaune-orange à contour violet foncé sur la seconde, lettres très épaisses légèrement inclinées, effet de relief',
    'Écran de choix du joueur, À propos.',
    1,
    { fallback: 'brand-logo' },
  ),
  a(
    'icon',
    'branding/emblem.webp',
    'Emblème',
    'blason-bouclier violet à bordure orange épaisse portant un livre ouvert blanc et un chevron cyan en bas, sans texte, lisible à 32 px',
    'Icône de l’application et de l’onglet.',
    1,
    { fallback: 'brand-emblem' },
  ),
  a(
    'background',
    'environments/backgrounds/accueil.webp',
    'Fond d’accueil',
    'château-académie violet aux toits pointus et bannières portant un livre, sur une île flottante, autres petites îles flottantes, ciel lavande et nuages roses, lumière douce',
    'Fond des menus (accueil, choix du mode).',
    1,
  ),
  a(
    'background',
    'environments/backgrounds/combat.webp',
    'Fond de combat',
    'plaine rocheuse violette au pied du château-académie, cristaux violets, rochers moussus, ciel lavande crépusculaire',
    'Fond des combats de boss.',
    2,
  ),
  a(
    'panelBackdrop',
    'environments/equipement-fond.webp',
    'Fond du rectangle Équipement',
    'arène violette aux anneaux dorés lumineux au centre, rubans de lumière et cristaux flottants',
    'Fond du rectangle Équipement (Mode Histoire).',
    2,
  ),
  a(
    'banner',
    'environments/entrainement-banniere.webp',
    'Bannière du menu Entraînement',
    'les deux héros face à face autour de Questy, livre ouvert lumineux et médailles dans une salle de classe violette',
    'Bannière de l’écran Entraînement (choix de la matière).',
    2,
  ),
];
