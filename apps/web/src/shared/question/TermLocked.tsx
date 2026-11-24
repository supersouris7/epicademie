import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { glossaryEntry } from '@epicademie/content';
import { ConfirmDialog } from '../ui/ConfirmDialog.tsx';
import { clearTermReminders, remindTerm } from './termReminders.ts';
import { TermContext } from './termContext.ts';

/**
 * Mot du glossaire en combat de boss ou en défi : le lien reste, mais la définition se lit à
 * l'entraînement ; on peut demander qu'elle soit rappelée à la fin de la partie.
 */
export function TermLocked({ id, children }: { readonly id: string; readonly children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = glossaryEntry(id);
  if (!entry) return <>{children}</>;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className="decoration-accent cursor-help underline decoration-dotted decoration-2 underline-offset-4"
        aria-label={`${typeof children === 'string' ? children : entry.word} : que veut dire ce mot ?`}
      >
        {children}
      </button>
      {open &&
        createPortal(
          <ConfirmDialog
            title={`Le mot « ${entry.word} »`}
            message="Pendant un combat ou un défi, pas de définition : on la lit en mode Entraînement. Je te la montre à la fin de la partie ?"
            confirm="Me le rappeler à la fin"
            cancel="Non merci"
            mood="wink"
            positive
            onConfirm={() => {
              remindTerm(id);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}

/**
 * Zone de jeu sans définitions (combat de boss, défis) : les mots du glossaire ouvrent le message
 * ci-dessus ; la liste des mots à rappeler repart à zéro à chaque partie.
 */
export function NoDefinitions({ children }: { readonly children: React.ReactNode }) {
  useEffect(() => clearTermReminders(), []);
  return <TermContext.Provider value={TermLocked}>{children}</TermContext.Provider>;
}
