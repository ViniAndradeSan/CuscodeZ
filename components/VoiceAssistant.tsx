"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconMicrophone } from "@tabler/icons-react";
import { resolveVoiceIntent, type VoiceAction, type VoiceContext } from "@/lib/voiceIntent";
import { speak, stopSpeaking } from "@/lib/voiceSynth";

function getSpeechRecognition(): any {
  if (typeof window === "undefined") return undefined;
  const win = window as any;
  return win.SpeechRecognition ?? win.webkitSpeechRecognition;
}

function isSecureContext(): boolean {
  if (typeof window === "undefined") return false;
  return window.isSecureContext === true;
}

type Props = {
  context: VoiceContext;
  onNavigate: (action: VoiceAction) => void;
};

export function VoiceAssistant({ context, onNavigate }: Props) {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<"idle" | "recording" | "processing">("idle");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [showBubble, setShowBubble] = useState(false);

  const recognitionRef = useRef<any>(null);
  const statusRef = useRef<"idle" | "recording" | "processing">("idle");
  const transcriptRef = useRef<string>("");
  const silenceTimerRef = useRef<number | null>(null);
  const fallbackTimerRef = useRef<number | null>(null);

  // Mantém o contexto mais recente nos callbacks sem recriar funções
  const contextRef = useRef<VoiceContext>(context);
  useEffect(() => { contextRef.current = context; }, [context]);

  // Mantém onNavigate sempre atualizado — evita closure stale com selectedEvent antigo
  const onNavigateRef = useRef<(action: VoiceAction) => void>(onNavigate);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);

  // Rastreia a última ação executada e a última fala do usuário para contexto inteligente
  const lastActionRef = useRef<string>("nenhuma");
  const lastUtteranceRef = useRef<string>("nenhuma");

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognition()) && isSecureContext());
  }, []);

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
      recognitionRef.current?.abort?.();
      stopSpeaking();
    };
  }, []);

  const setCurrentStatus = useCallback(
    (value: "idle" | "recording" | "processing") => {
      statusRef.current = value;
      setStatus(value);
    },
    []
  );

  const hideBubbleLater = useCallback(() => {
    if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);
    fallbackTimerRef.current = window.setTimeout(() => {
      setShowBubble(false);
      setStatusText(null);
    }, 4000);
  }, []);

  const processTranscript = useCallback(
    async (finalTranscript: string) => {
      if (!finalTranscript.trim()) {
        setCurrentStatus("idle");
        setStatusText("Não entendi, pode repetir?");
        setShowBubble(true);
        speak("Desculpa, não entendi. Pode repetir?", hideBubbleLater);
        return;
      }

      setCurrentStatus("processing");
      setStatusText("Processando...");
      setShowBubble(true);

      if (fallbackTimerRef.current) window.clearTimeout(fallbackTimerRef.current);

      const timeoutId = window.setTimeout(() => {
        setCurrentStatus("idle");
        setStatusText("Estou com dificuldade agora, tente de novo");
        setShowBubble(true);
        speak("Estou com dificuldade agora, tente de novo", hideBubbleLater);
      }, 10000);
      fallbackTimerRef.current = timeoutId;

      try {
        // Envia contexto completo — incluindo última ação e última fala do usuário
        const enrichedContext: VoiceContext = {
          ...contextRef.current,
          lastAction: lastActionRef.current,
          lastUserUtterance: lastUtteranceRef.current,
        };

        const intent = await resolveVoiceIntent(finalTranscript, enrichedContext);
        window.clearTimeout(timeoutId);
        setCurrentStatus("idle");
        setStatusText(intent.message);
        setShowBubble(true);

        // Atualiza o histórico para a próxima chamada
        lastActionRef.current = intent.action.type;
        lastUtteranceRef.current = finalTranscript;

        onNavigateRef.current(intent.action);
        speak(intent.message, hideBubbleLater);
      } catch {
        window.clearTimeout(timeoutId);
        setCurrentStatus("idle");
        setStatusText("Estou com dificuldade agora, tente de novo");
        setShowBubble(true);
        speak("Estou com dificuldade agora, tente de novo", hideBubbleLater);
      }
    },
    [hideBubbleLater, setCurrentStatus]
  );

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try { recognition.stop(); } catch { recognition.abort?.(); }
  }, []);

  const startListening = useCallback(() => {
    if (!isSecureContext()) {
      const msg = "O microfone só funciona com HTTPS ou localhost.";
      setCurrentStatus("idle");
      setStatusText(msg);
      setShowBubble(true);
      speak(msg, hideBubbleLater);
      return;
    }

    if (!supported) {
      const msg = "Seu navegador não suporta microfone. Tente o Chrome.";
      setCurrentStatus("idle");
      setStatusText(msg);
      setShowBubble(true);
      speak(msg, hideBubbleLater);
      return;
    }

    if (statusRef.current === "recording" || statusRef.current === "processing") return;

    const Recognition = getSpeechRecognition();
    if (!Recognition) return;

    stopSpeaking();
    transcriptRef.current = "";
    setStatusText("Escutando...");
    setShowBubble(true);
    setCurrentStatus("recording");

    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results || []);
      const finalParts: string[] = [];
      let interimText = "";

      for (const result of results as any[]) {
        const t = result?.[0]?.transcript || "";
        if (result?.isFinal) finalParts.push(t);
        else interimText = t;
      }

      const finalText = finalParts.filter(Boolean).join(" ");
      const displayText = finalText.trim() || interimText.trim();
      transcriptRef.current = displayText;
      setStatusText(displayText || "Escutando...");
      setShowBubble(true);

      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => stopListening(), 2000);
    };

    recognition.onerror = (event: any) => {
      if (event.error === "aborted") { recognitionRef.current = null; return; }

      const msg =
        event.error === "not-allowed" || event.error === "permission-denied"
          ? "Precisamos de permissão pro microfone. Clique no cadeado da barra de endereço."
          : event.error === "audio-capture"
          ? "Não encontrei microfone no dispositivo."
          : "Não consegui ouvir direito. Tente de novo.";

      setCurrentStatus("idle");
      setStatusText(msg);
      setShowBubble(true);
      speak(msg, hideBubbleLater);
      recognitionRef.current = null;
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      if (statusRef.current !== "recording") return;
      processTranscript(transcriptRef.current.trim());
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      setCurrentStatus("idle");
      setStatusText("Não consegui iniciar o microfone.");
      setShowBubble(true);
      speak("Não consegui iniciar o microfone.", hideBubbleLater);
    }
  }, [hideBubbleLater, processTranscript, setCurrentStatus, supported, stopListening]);

  const handleButtonToggle = useCallback(() => {
    if (statusRef.current === "recording") { stopListening(); return; }
    startListening();
  }, [startListening, stopListening]);

  return (
    <div className="pointer-events-none fixed bottom-6 left-4 z-50 flex flex-col items-start gap-3">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto transition-opacity duration-200 ${
          showBubble ? "opacity-100" : "opacity-0"
        }`}
      >
        {statusText && (
          <div className="rounded-[12px] bg-card border border-border shadow-md px-3 py-2 max-w-[220px] text-sm">
            {statusText}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={
          status === "recording"
            ? "Gravando… solte para enviar"
            : status === "processing"
            ? "Processando sua fala"
            : "Falar com assistente"
        }
        className={`pointer-events-auto flex h-[52px] w-[52px] items-center justify-center rounded-full shadow-lg transition-colors ${
          status === "recording"
            ? "bg-[#E74C3C] animate-pulse"
            : status === "processing"
            ? "bg-[#1D9E75]"
            : "bg-[#1F5C8F]"
        }`}
        onPointerDown={(e: any) => {
          e.preventDefault();
          if (statusRef.current !== "recording") startListening();
        }}
        onPointerUp={() => {
          if (statusRef.current === "recording") stopListening();
        }}
        onClick={(e: any) => {
          e.preventDefault();
          handleButtonToggle();
        }}
      >
        <IconMicrophone size={24} stroke={1.75} className="text-white" />
      </button>
    </div>
  );
}