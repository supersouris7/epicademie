import { useState } from 'react';
import { useLocation } from 'react-router';
import { useDebugMode } from '../lib/debugMode.ts';
import { GeneralReportDialog } from './GeneralReportButton.tsx';

/**
 * Mode debug : petit drapeau discret dans un coin de chaque écran qui ouvre le signalement
 * « Signaler un problème sur cet écran ». Absent par défaut et sur la console d'administration.
 */
export function DebugFlag() {
  const enabled = useDebugMode((s) => s.enabled);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  if (!enabled || pathname.startsWith('/admin')) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Signaler un problème sur cet écran"
        title="Signaler un problème sur cet écran"
        // Languette collée au bord gauche, au tiers de la hauteur : hors du dock de réponse, du HUD
        // et du héros ; sous le brouillon et les modales (z-30) ; contrastée et assez grande (40 px).
        className="fixed top-1/3 left-0 z-30 flex h-10 w-10 items-center justify-center rounded-r-full bg-slate-800 text-white opacity-70 ring-2 ring-white/70 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path d="M6 3v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M6 4h11l-2.5 4L17 12H6z" fill="currentColor" />
        </svg>
      </button>
      {open && <GeneralReportDialog onClose={() => setOpen(false)} />}
    </>
  );
}
