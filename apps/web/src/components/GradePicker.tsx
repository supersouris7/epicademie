import { motion } from 'motion/react';
import { useState } from 'react';
import { BirthDateSchema, GRADE_INFO, gradeFromBirthDate, gradeInfo, type Grade } from '@questeo/shared';
import { localToday } from '../lib/dates.ts';
import { comingSoon } from '../lib/grades.ts';
import { GameButton } from './game/GameButton.tsx';
import { Questy } from './mascot/Questy.tsx';
import { SpeechBubble } from './SpeechBubble.tsx';

interface GradePickerProps {
  readonly birthDate: string;
  readonly grade: Grade | null;
  readonly onChange: (g: Grade) => void;
}

const question = (g: Grade) => (g === 'adulte' ? 'Tu es un adulte ?' : `Tu es en ${gradeInfo(g).name} ?`);

/**
 * Classe du joueur : déduite de la date de naissance, Questy demande de confirmer (« Tu es en 5e ? »).
 * « Non » ouvre la liste ; les classes sans contenu sont marquées « À venir » mais restent choisissables.
 */
export function GradePicker({ birthDate, grade, onChange }: GradePickerProps) {
  const [choosing, setChoosing] = useState(false);
  const validBirth = BirthDateSchema.safeParse(birthDate).success;
  const guess = validBirth ? gradeFromBirthDate(birthDate, localToday()) : null;
  const pick = (g: Grade) => {
    onChange(g);
    setChoosing(false);
  };

  if (!validBirth && !grade) {
    return <p className="text-muted font-bold">Indique ta date de naissance : Questy devinera ta classe.</p>;
  }

  if (!grade && guess && !choosing) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <Questy mood="wow" size={96} />
        <div className="flex flex-col gap-2">
          <SpeechBubble>{question(guess)}</SpeechBubble>
          <div className="flex gap-2">
            <GameButton size="sm" variant="success" onClick={() => pick(guess)}>
              Oui
            </GameButton>
            <GameButton size="sm" variant="surface" onClick={() => setChoosing(true)}>
              Non
            </GameButton>
          </div>
        </div>
      </motion.div>
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
      {!guess && validBirth && <p className="font-bold">Quelle est ta classe ?</p>}
      <div role="radiogroup" aria-label="Ta classe" className="grid grid-cols-4 gap-2 sm:grid-cols-7">
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
