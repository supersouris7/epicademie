import { afterEach, describe, expect, it, vi } from 'vitest';
import { canSpeak, isPlayable, plainText, speak } from './speech.ts';

const voice = (lang: string, localService = true) => ({ lang, localService, name: lang }) as SpeechSynthesisVoice;

function install(voices: SpeechSynthesisVoice[]) {
  const spoken: { text: string; voice: unknown }[] = [];
  const synth = {
    getVoices: () => voices,
    cancel: vi.fn(),
    speak: (u: { text: string; voice: unknown }) => spoken.push(u),
  };
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', function (this: { text: string }, text: string) {
    this.text = text;
  });
  return spoken;
}

afterEach(() => vi.unstubAllGlobals());

describe('synthèse vocale', () => {
  it('lit avec une voix locale de la langue', () => {
    const spoken = install([voice('fr-FR'), voice('en-US')]);
    expect(speak('Hello', 'en-GB')).toBe(true);
    expect(spoken[0]?.text).toBe('Hello');
  });

  it('refuse les voix distantes et les langues absentes', () => {
    const spoken = install([voice('es-ES', false), voice('fr-FR')]);
    expect(canSpeak('es-ES')).toBe(false);
    expect(speak('Hola', 'es-ES')).toBe(false);
    expect(spoken).toHaveLength(0);
  });

  it('sans API : rien ne se lit, les questions d’écoute sont injouables', () => {
    expect(speak('Hello', 'en-GB')).toBe(false);
    expect(isPlayable({ audio: { text: 'Hello', lang: 'en-GB' } })).toBe(false);
    expect(isPlayable({})).toBe(true);
  });

  it('énoncé lisible', () => {
    expect(plainText('Calcule {3/4} de **12** et 5^2')).toBe('Calcule 3 sur 4 de 12 et 5 au carré');
  });
});
