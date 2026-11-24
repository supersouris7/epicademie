import type { Question } from '@epicademie/content';

/**
 * Synthèse vocale de l'appareil (Web Speech API) : le texte reste sur l'appareil, rien n'est envoyé
 * à l'extérieur. On refuse les voix distantes (`localService` faux) pour tenir cette promesse.
 */
const synth = (): SpeechSynthesis | null =>
  typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'
    ? window.speechSynthesis
    : null;

const primary = (lang: string) => lang.toLowerCase().split('-')[0] ?? '';

/** Voix locale disponible pour la langue (`en-GB` accepte `en-US` : même langue). */
export function voiceFor(lang: string): SpeechSynthesisVoice | null {
  const voices = synth()?.getVoices() ?? [];
  const local = voices.filter((v) => v.localService);
  return (
    local.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    local.find((v) => primary(v.lang.replace('_', '-')) === primary(lang)) ??
    null
  );
}

export const canSpeak = (lang: string): boolean => voiceFor(lang) !== null;

/** Texte brut d'un énoncé en mini-balisage (fractions, exposants, gras) pour la lecture à voix haute. */
export function plainText(rich: string): string {
  return rich
    .replace(/\{(\d+)\/(\d+)\}/g, '$1 sur $2')
    .replace(/\^(\d)/g, (_, d: string) => (d === '2' ? ' au carré' : d === '3' ? ' au cube' : ` puissance ${d}`))
    .replace(/\*\*/g, '');
}

/** Lit le texte ; renvoie faux si aucune voix de la langue n'est disponible. */
export function speak(text: string, lang: string): boolean {
  const s = synth();
  const voice = voiceFor(lang);
  if (!s || !voice) return false;
  s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = 0.9;
  s.speak(u);
  return true;
}

export function stopSpeaking(): void {
  synth()?.cancel();
}

/** Une question d'écoute dont la voix manque doit être remplacée par une autre. */
export const isPlayable = (q: Pick<Question, 'audio'>): boolean => !q.audio || canSpeak(q.audio.lang);

/** Classes dont l'énoncé est proposé à l'écoute (CM1, CM2). */
export const READ_ALOUD_GRADES: readonly string[] = ['cm1', 'cm2'];

/** Ce que le bouton lit : l'audio de la question, sinon l'énoncé si la lecture est demandée (CM). */
export function listenTarget(
  question: Pick<Question, 'audio' | 'prompt'>,
  readPrompt: boolean,
): { text: string; lang: string } | null {
  if (question.audio) return question.audio;
  return readPrompt ? { text: plainText(question.prompt), lang: 'fr-FR' } : null;
}
