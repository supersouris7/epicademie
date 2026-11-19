/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Version du front (image Docker), transmise au suivi d'erreurs. */
  readonly VITE_RELEASE?: string;
}
