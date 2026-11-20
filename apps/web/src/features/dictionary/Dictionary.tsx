import { useState } from 'react';
import { GLOSSARY, GLOSSARY_FAMILIES, type GlossaryFamily } from '@questeo/content';
import type { Profile } from '@questeo/shared';
import { PageShell } from '../../shared/ui/PageShell.tsx';
import { Questy } from '../../shared/ui/mascot/Questy.tsx';
import { SpeechBubble } from '../../shared/ui/SpeechBubble.tsx';
import { TermDialog } from '../../shared/question/Term.tsx';
import { markTermSeen, termsSeen } from '../../shared/question/termsSeen.ts';

/**
 * Mon dictionnaire : tous les mots du glossaire, par famille, avec leur définition, un exemple et
 * leur schéma. Les mots déjà regardés sont marqués d'une coche.
 */
export function Dictionary({ profile }: { readonly profile: Profile }) {
  const [open, setOpen] = useState<string | null>(null);
  const [seen, setSeen] = useState(termsSeen);
  const families = Object.keys(GLOSSARY_FAMILIES) as GlossaryFamily[];
  return (
    <PageShell title="Mon dictionnaire" nav={profile}>
      <div className="flex items-center gap-3">
        <Questy mood="wink" size={80} />
        <SpeechBubble>
          Un mot te bloque ? Il est ici, avec un exemple et un dessin. Dans les exercices, touche un mot souligné en
          pointillés pour l’ouvrir.
        </SpeechBubble>
      </div>
      {families.map((f) => (
        <section key={f} aria-labelledby={`famille-${f}`} className="flex flex-col gap-2">
          <h2 id={`famille-${f}`} className="font-display text-2xl tracking-wide">
            {GLOSSARY_FAMILIES[f]}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {GLOSSARY.filter((g) => g.family === f).map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => {
                    markTermSeen(g.id);
                    setSeen(termsSeen());
                    setOpen(g.id);
                  }}
                  className="cartoon cartoon-press bg-surface flex w-full items-center gap-2 p-3 text-left"
                >
                  <span className="font-display flex-1 text-xl tracking-wide">{g.word}</span>
                  {seen.has(g.id) && (
                    <span className="text-success font-bold" aria-label="déjà regardé">
                      ✓
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {open && <TermDialog id={open} onClose={() => setOpen(null)} />}
    </PageShell>
  );
}
