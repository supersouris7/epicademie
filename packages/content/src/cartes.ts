import { ZONES } from './cartes-zones.ts';

/**
 * Cartes disponibles pour la figure `map` et la réponse `zone` (ADR 0034).
 * Fonds simplifiés : IGN Admin Express (Licence Ouverte 2.0) pour la France métropolitaine, Natural Earth
 * (domaine public) pour l'Europe et le monde. Registre des zones : `cartes-zones.ts` (généré).
 */
export const MAP_IDS = ['france-regions', 'france-departements', 'europe', 'monde'] as const;
export type MapId = (typeof MAP_IDS)[number];

/** Nom français d'une zone d'une carte (undefined si la zone n'existe pas sur cette carte). */
export const zoneName = (map: MapId, zone: string): string | undefined =>
  Object.hasOwn(ZONES[map], zone) ? ZONES[map][zone] : undefined;

/** Identifiants des zones d'une carte. */
export const zoneIds = (map: MapId): readonly string[] => Object.keys(ZONES[map]);

/** Crédit d'un fond de carte, affiché sous la figure. */
export const MAP_CREDIT: Record<MapId, string> = {
  'france-regions': 'Fond simplifié d’après IGN Admin Express (Licence Ouverte 2.0), France métropolitaine.',
  'france-departements': 'Fond simplifié d’après IGN Admin Express (Licence Ouverte 2.0), France métropolitaine.',
  europe: 'Fond simplifié d’après Natural Earth (domaine public).',
  monde: 'Fond simplifié d’après Natural Earth (domaine public).',
};

/** Titre accessible d'une carte (lecteur d'écran), sans nommer les zones surlignées. */
export const MAP_TITLE: Record<MapId, string> = {
  'france-regions': 'Carte de la France métropolitaine : les régions',
  'france-departements': 'Carte de la France métropolitaine : les départements',
  europe: 'Carte de l’Europe : les pays',
  monde: 'Planisphère : continents, océans et grands fleuves',
};
