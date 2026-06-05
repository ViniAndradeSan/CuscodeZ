"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { EventSearch } from "@/components/journey/EventSearch";
import { SensoryMap } from "@/components/journey/SensoryMap";
import { CalmExit } from "@/components/journey/CalmExit";
import { CulturalGuide } from "@/components/journey/CulturalGuide";
import { SOSButton } from "@/components/journey/SOSButton";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import type { EventItem } from "@/types/event";
import type { VoiceAction, VoiceContext } from "@/lib/voiceIntent";
type FilterKey = "ruido" | "acessivel" | "familia" | "apoio" | "infraestrutura" | "zonas-calmas";
import { MOCK_EVENTS } from "@/lib/events";
import { speak } from "@/lib/voiceSynth";

type Step = "event-search" | "map" | "guide";

// Mapeamento: id do filtro de busca → id do filtro do mapa (para tradução de contexto)
const SEARCH_FILTER_TO_MAP: Record<string, string> = {
  pcd: "acessivel",
  libras: "acessivel",
  visual: "acessivel",
  familia: "familia",
  calmo: "zonas-calmas",
};

export default function Home() {
  const [step, setStep] = useState<Step>("event-search");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [needs, setNeeds] = useState<Set<string>>(new Set());

  // Estado dos filtros — controlado AQUI para a voz poder manipulá-los
  const [searchFilters, setSearchFilters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mapFilters, setMapFilters] = useState<Set<FilterKey>>(new Set());

  // Controle de dicas abertas — voz pode abrir
  const [openTipsId, setOpenTipsId] = useState<string | null>(null);

  // Controle do GPS — voz pode disparar
  const [startGpsSignal, setStartGpsSignal] = useState(0);

  // CalmExit agora é um overlay — pode ser aberto de qualquer tela
  const [isShowingCalmExit, setIsShowingCalmExit] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Bloquear scroll do body quando modal está aberto
  useEffect(() => {
    if (isShowingCalmExit) {
      document.body.style.overflow = "hidden";
      // Foco automático no modal para acessibilidade
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isShowingCalmExit]);

  // ──────────────────────────────────────────────────────────────
  // Handlers de navegação
  // ──────────────────────────────────────────────────────────────
  const handleEventSelect = useCallback(
    (event: EventItem, activeFilters: Set<string>) => {
      const newNeeds = new Set<string>();
      if (activeFilters.has("pcd")) newNeeds.add("wheel");
      if (activeFilters.has("libras")) newNeeds.add("hear");
      if (activeFilters.has("visual")) newNeeds.add("sight");
      if (activeFilters.has("familia")) newNeeds.add("family");
      if (activeFilters.has("calmo")) newNeeds.add("calm");

      setNeeds(newNeeds);
      setSelectedEvent(event);
      setMapFilters(new Set());
      setStep("map");
    },
    []
  );

  const handleRestart = useCallback(() => {
    setSelectedEvent(null);
    setNeeds(new Set());
    setSearchFilters(new Set());
    setSearchQuery("");
    setMapFilters(new Set());
    setOpenTipsId(null);
    setStep("event-search");
  }, []);

  const handleDirectGuide = useCallback((event: EventItem) => {
    setSelectedEvent(event);
    setNeeds(new Set());
    setStep("guide");
  }, []);

  // ──────────────────────────────────────────────────────────────
  // Contexto da voz — enviado a cada chamada
  // ──────────────────────────────────────────────────────────────
  const voiceContext: VoiceContext = {
    currentStep: step,
    activeFilters: [...searchFilters],
    activeMapFilters: [...mapFilters],
    selectedEventName: selectedEvent?.name,
    availableEvents: MOCK_EVENTS.map((e) => e.name),
  };

  // ──────────────────────────────────────────────────────────────
  // Handler central da voz
  // ──────────────────────────────────────────────────────────────
  const handleVoiceAction = useCallback(
    (action: VoiceAction) => {
      switch (action.type) {
        // ── Navegação ──────────────────────────────────────────
        case "go-to-search":
          setStep("event-search");
          break;

        case "go-to-map":
          if (selectedEvent) setStep("map");
          else speak("Precisa escolher um evento antes de ir pro mapa.");
          break;

        case "go-to-guide": {
          if (action.eventName) {
            const query = action.eventName.toLowerCase();
            const matched = MOCK_EVENTS.find(
              (e) =>
                e.name.toLowerCase().includes(query) ||
                query.includes(e.name.toLowerCase())
            );
            if (matched) {
              setSelectedEvent(matched);
              setNeeds(new Set());
              setStep("guide");
              break;
            }
            speak("Não encontrei esse evento. Pode repetir o nome do guia?");
            break;
          }

          if (selectedEvent) {
            setStep("guide");
          } else {
            speak("Precisa escolher um evento antes de ver o guia.");
          }
          break;
        }

        case "go-to-calm-exit":
          setIsShowingCalmExit(true);
          break;

        case "restart":
          handleRestart();
          break;

        // ── Eventos ────────────────────────────────────────────
        case "select-event": {
          const query = action.eventName.toLowerCase();
          const matched = MOCK_EVENTS.find(
            (e) =>
              e.name.toLowerCase().includes(query) ||
              query.includes(e.name.toLowerCase())
          );
          if (!matched) {
            speak("Não encontrei esse evento. Pode tentar outro nome?");
          } else {
            handleEventSelect(matched, searchFilters);
          }
          break;
        }

        case "open-tips": {
          // Vai para a busca se não estiver lá, e abre as dicas do evento
          const query = action.eventName.toLowerCase();
          const matched = MOCK_EVENTS.find(
            (e) =>
              e.name.toLowerCase().includes(query) ||
              query.includes(e.name.toLowerCase())
          );
          if (matched) {
            setStep("event-search");
            setOpenTipsId(matched.id);
          } else {
            speak("Não encontrei esse evento para mostrar as dicas.");
          }
          break;
        }

        // ── Filtros de busca ───────────────────────────────────
        case "toggle-filter":
          setSearchFilters((prev) => {
            const next = new Set(prev);
            if (next.has(action.filter)) next.delete(action.filter);
            else next.add(action.filter);
            return next;
          });
          // Garante que está na tela de busca
          if (step !== "event-search") setStep("event-search");
          break;

        case "clear-filters":
          setSearchFilters(new Set());
          setSearchQuery("");
          if (step !== "event-search") setStep("event-search");
          break;

        case "search-query":
          setSearchQuery(action.query);
          if (step !== "event-search") setStep("event-search");
          break;

        // ── Filtros do mapa ────────────────────────────────────
        case "toggle-map-filter":
          setMapFilters((prev) => {
            const next = new Set(prev);
            const filter = action.filter as FilterKey;
            if (next.has(filter)) next.delete(filter);
            else next.add(filter);
            return next;
          });
          // Garante que está no mapa (se houver evento selecionado)
          if (step !== "map" && selectedEvent) setStep("map");
          break;

        case "start-gps":
          if (step !== "map" && selectedEvent) setStep("map");
          // Sinal para SensoryMap iniciar o GPS
          setStartGpsSignal((n) => n + 1);
          break;

        case "sos":
          setIsShowingCalmExit(true);
          break;

        case "none":
          break;
      }
    },
    [handleEventSelect, handleRestart, searchFilters, selectedEvent, step]
  );

  return (
    <main className="min-h-dvh">
      {step === "event-search" && (
        <EventSearch
          onSelect={handleEventSelect}
          onDirectGuide={handleDirectGuide}
          // Props controladas externamente (pela voz)
          externalFilters={searchFilters}
          onFiltersChange={setSearchFilters}
          externalQuery={searchQuery}
          onQueryChange={setSearchQuery}
          externalOpenTipsId={openTipsId}
          onOpenTipsIdChange={setOpenTipsId}
        />
      )}

      {step === "map" && selectedEvent && (
        <SensoryMap
          event={selectedEvent}
          needs={needs}
          onBack={() => setStep("event-search")}
          onContinue={() => setIsShowingCalmExit(true)}
          onSOS={() => setIsShowingCalmExit(true)}
          // Props controladas externamente (pela voz)
          externalFilters={mapFilters}
          onFiltersChange={setMapFilters}
          startGpsSignal={startGpsSignal}
        />
      )}

      {step === "guide" && selectedEvent && (
        <CulturalGuide
          event={selectedEvent}
          onBack={() => setStep("map")}
          onRestart={handleRestart}
        />
      )}

      {/* CalmExit como overlay modal — acessível de qualquer tela */}
      {isShowingCalmExit && (
        <div 
          ref={modalRef}
          className="fixed inset-0 z-50 flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calm-exit-title"
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsShowingCalmExit(false);
            }
          }}
        >
          {/* Backdrop semitransparente */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsShowingCalmExit(false)}
            aria-hidden="true"
          />
          {/* Modal container — ocupa a tela inteira com conteúdo */}
          <div className="relative z-10 flex min-h-dvh flex-col overflow-y-auto">
            <CalmExit
              onBack={() => setIsShowingCalmExit(false)}
              onContinue={() => {
                setIsShowingCalmExit(false);
                setStep("guide");
              }}
            />
          </div>
        </div>
      )}

      {/* Botão SOS flutuante — visível apenas no Mapa e Guia, não no modal */}
      {!isShowingCalmExit && step !== "event-search" && (
        <SOSButton 
          onClick={() => setIsShowingCalmExit(true)}
          compact={step === "guide"}
        />
      )}

      <VoiceAssistant context={voiceContext} onNavigate={handleVoiceAction} />
    </main>
  );
}
