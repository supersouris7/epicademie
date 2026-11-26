import { useDebugMode } from '../../shared/lib/debugMode.ts';
import { mutedClass, Panel } from './ui.tsx';

/** Réglage du mode debug (propre à cet appareil, désactivé par défaut). */
export function DebugMode() {
  const enabled = useDebugMode((s) => s.enabled);
  const setEnabled = useDebugMode((s) => s.setEnabled);
  return (
    <Panel title="Mode debug">
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Afficher un drapeau de signalement sur chaque écran
      </label>
      <p className={`mt-2 ${mutedClass}`}>
        Réglage de cet appareil seulement. Le drapeau ouvre « Signaler un problème sur cet écran ».
      </p>
    </Panel>
  );
}
