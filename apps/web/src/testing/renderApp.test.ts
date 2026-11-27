// L'utilitaire de test précharge les écrans, jamais les fichiers de test : les importer
// enregistrerait leurs tests une seconde fois dans le fichier qui rend l'application.
import { describe, expect, it } from 'vitest';
import { preloadedScreens } from './renderApp.tsx';

describe('préchargement des écrans', () => {
  it('charge les écrans sans aucun fichier de test', () => {
    const paths = Object.keys(preloadedScreens);
    expect(paths).toContain('../features/hub/Hub.tsx');
    expect(paths.filter((path) => path.includes('.test.'))).toEqual([]);
  });
});
