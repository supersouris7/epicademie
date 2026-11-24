import { useEffect, useState } from 'react';
import type { Question } from '@epicademie/content';
import { GameButton } from '../ui/game/GameButton.tsx';
import { listenTarget, speak, stopSpeaking } from '../lib/speech.ts';

/**
 * Bouton « Écouter » (synthèse vocale de l'appareil). Absent si rien à lire. Si la voix manque
 * au moment du clic, on le dit au lieu de rester muet.
 */
export function ListenButton({
  question,
  readPrompt = false,
  size = 'sm',
}: {
  readonly question: Question;
  readonly readPrompt?: boolean;
  readonly size?: 'sm' | 'md';
}) {
  const [missing, setMissing] = useState(false);
  const target = listenTarget(question, readPrompt);
  useEffect(() => stopSpeaking, [question]);
  if (!target) return null;
  return (
    <span className="inline-flex items-center gap-2">
      <GameButton size={size} variant="surface" onClick={() => setMissing(!speak(target.text, target.lang))}>
        Écouter
      </GameButton>
      {missing && (
        <span role="status" className="text-muted text-sm font-bold">
          Aucune voix disponible sur cet appareil.
        </span>
      )}
    </span>
  );
}
