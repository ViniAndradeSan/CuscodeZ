// Aguarda as vozes carregarem (necessário no Chrome/Android onde são assíncronas)
function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    // Chrome dispara onvoiceschanged quando as vozes ficam prontas
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
    // Fallback: se onvoiceschanged nunca disparar, tenta após 500ms
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}

function selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  // Prioridade: pt-BR > pt > qualquer voz disponível
  return (
    voices.find((v) => /pt[-_]?BR/i.test(v.lang)) ??
    voices.find((v) => /^pt/i.test(v.lang)) ??
    voices[0]
  );
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  stopSpeaking();

  // Chrome tem um bug em que a fala trava após ~15s de página aberta.
  // O workaround padrão é fazer pause/resume antes de falar.
  window.speechSynthesis.pause();
  window.speechSynthesis.resume();

  getVoicesAsync().then((voices) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    const voice = selectBestVoice(voices);
    if (voice) utterance.voice = voice;

    if (onEnd) utterance.onend = onEnd;

    // Garante que qualquer fala anterior foi cancelada antes de começar
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}
