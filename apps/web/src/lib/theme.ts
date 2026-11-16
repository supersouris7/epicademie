import { useEffect } from 'react';
import type { Theme } from '@questeo/shared';

/** Applique le thème du profil sur <html data-theme>, en suivant le système en mode « auto ». */
export function useApplyTheme(theme: Theme) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const effective = theme === 'auto' ? (media.matches ? 'dark' : 'light') : theme;
      document.documentElement.dataset.theme = effective;
    };
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [theme]);
}
