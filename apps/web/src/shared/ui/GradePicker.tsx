import { motion } from 'motion/react';
import { useState } from 'react';
import { BirthDateSchema, GRADE_INFO, gradeFromBirthDate, gradeInfo, type Grade } from '@epicademie/shared';
import { localToday } from '../lib/dates.ts';
import { comingSoon } from '../lib/grades.ts';
import { GameButton } from './game/GameButton.tsx';
import { Questy } from './mascot/Questy.tsx';

interface GradePickerProps {
  readonly birthDate: string;
  readonly grade: Grade | null;
  readonly onChange: (g: Grade) => void;
  /** Rempli par le parent pour son enfant : vouvoiement (« Votre enfant est en 5e ? »). */
  readonly parent?: boolean;
}

const CHILD = {
  question: (g: Grade) => (g === 'adulte' ? 'Tu es un adulte ?' : `Tu es en ${gradeInfo(g).name} ?`),
  birth: 'Indique ta date de naissance : Questy devinera ta classe.',
  asking: 'Questy te demande ta classe…',
  label: 'Ta classe',
  which: 'Quelle est ta classe ?',
};
const PARENT: typeof CHILD = {
  question: (g: Grade) => (g === 'adulte' ? 'C’est un adulte ?' : `Votre enfant est en ${gradeInfo(g).name} ?`),
  birth: 'Indiquez sa date de naissance : Questy devinera sa classe.',
  asking: 'Questy vous demande sa classe…',
  label: 'Sa classe',
  which: 'Quelle est sa classe ?',
};

/**
 * Classe du joueur : déduite de la date de naissance, Questy demande de confirmer dans une fenêtre
 * au premier plan (« Tu es en 5e ? »).
 * « Non » ouvre la liste ; les classes sans contenu sont marquées « À venir » mais restent choisissables.
 */
export function GradePicker({ birthDate, grade, onChange, parent = false }: GradePickerProps) {
  const t = parent ? PARENT : CHILD;
  const [choosing, setChoosing] = useState(false);
  const validBirth = BirthDateSchema.safeParse(birthDate).success;
  const guess = validBirth ? gradeFromBirthDate(birthDate, localToday()) : null;
  const pick = (g: Grade) => {
    onChange(g);
    setChoosing(false);
  };

  if (!validBirth && !grade) {
    return <p className="text-muted font-bold">{t.birth}</p>;
  }

  if (!grade && guess && !choosing) {
    // Questy demande en grand (fenêtre au premier plan) : impossible de passer à côté.
    return (
      <>
        <p className="text-muted font-bold">{t.asking}</p>
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.label}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="cartoon border-accent bg-surface flex w-full max-w-md flex-col items-center gap-4 p-6 text-center"
          >
            <Questy mood="wow" size={120} />
            <h2 className="font-display text-3xl tracking-wide">{t.question(guess)}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <GameButton size="lg" variant="success" icon="icons-status-correct" onClick={() => pick(guess)}>
                Oui
              </GameButton>
              <GameButton size="lg" variant="surface" onClick={() => setChoosing(true)}>
                Non
              </GameButton>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (grade && !choosing) {
    const info = gradeInfo(grade);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="cartoon bg-accent font-display text-toon px-4 py-2 text-2xl">{info.name}</span>
          <GameButton size="sm" variant="surface" onClick={() => setChoosing(true)}>
            Changer
          </GameButton>
        </div>
        {!info.available && <p className="text-muted font-bold">{comingSoon(grade)}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {!guess && validBirth && <p className="font-bold">{t.which}</p>}
      <div role="radiogroup" aria-label={t.label} className="grid grid-cols-4 gap-2 sm:grid-cols-7">
        {GRADE_INFO.map((g) => (
          <button
            key={g.id}
            type="button"
            role="radio"
            aria-checked={grade === g.id}
            aria-label={g.available ? g.name : `${g.name}, à venir`}
            onClick={() => pick(g.id)}
            className={`cartoon cartoon-press font-display relative flex min-h-14 flex-col items-center justify-center px-2 text-xl ${grade === g.id ? 'bg-accent text-toon' : 'bg-surface-2'} ${g.available ? '' : 'text-muted'}`}
          >
            {g.name}
            {!g.available && (
              <span className="bg-gold text-on-light absolute -top-2 -right-1 rounded-full px-1.5 text-[0.65rem] font-bold">
                À venir
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
