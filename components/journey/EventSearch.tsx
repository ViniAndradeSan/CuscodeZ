"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  IconSearch,
  IconX,
  IconWheelchair,
  IconEar,
  IconEye,
  IconBabyCarriage,
  IconToiletPaper,
  IconLeaf,
  IconVolume,
  IconVolumeOff,
  IconVolume2,
  IconMapPin,
  IconClock,
  IconBulb,
  IconChevronRight,
  IconMoodEmpty,
  IconBackpack,
  IconBus,
  IconDroplet,
  IconPlug,
  IconCar,
  IconWalk,
  IconCheck,
  IconInfoCircle,
  IconBooks,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ProgressDots } from "./ProgressDots";
import { AllGuidesSheet } from "./AllGuidesSheet";
import { Bandeirolas } from "./Bandeirolas";
import { MOCK_EVENTS, CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/events";
import type { EventItem, AccessibilityFeature, EventTip } from "@/types/event";

const NOISE_CONFIG: Record<string, { color: string; icon: typeof IconVolume; label: string }> = {
  baixo: { color: "bg-green-100 text-green-800", icon: IconVolumeOff, label: "baixo" },
  médio: { color: "bg-yellow-100 text-yellow-800", icon: IconVolume2, label: "médio" },
  alto: { color: "bg-red-100 text-red-800", icon: IconVolume, label: "alto" },
};

const ACCESSIBILITY_LABELS: Record<AccessibilityFeature, string> = {
  rampa: "Rampa",
  libras: "Libras",
  "audiodescrição": "Audiodescrição",
  "banheiro-adaptado": "Banheiro PcD",
  "vaga-pcd": "Vaga PcD",
  "area-calma": "Área calma",
  "guia-visual": "Guia visual",
  "kit-sensorial": "Kit sensorial",
};

const FILTER_OPTIONS = [
  { id: "pcd", icon: IconWheelchair, label: "Rampa/PcD" },
  { id: "libras", icon: IconEar, label: "Libras" },
  { id: "visual", icon: IconEye, label: "Def. visual" },
  { id: "familia", icon: IconBabyCarriage, label: "Família" },
  { id: "banheiro", icon: IconToiletPaper, label: "Banheiro" },
  { id: "calmo", icon: IconLeaf, label: "Ambiente calmo" },
];

const FILTER_MAP: Record<string, AccessibilityFeature[]> = {
  pcd: ["rampa", "vaga-pcd"],
  libras: ["libras"],
  visual: ["audiodescrição", "guia-visual"],
  familia: ["area-calma", "kit-sensorial"],
  banheiro: ["banheiro-adaptado"],
  calmo: [],
};

type Props = {
  onSelect: (event: EventItem, activeFilters: Set<string>) => void;
  onDirectGuide?: (event: EventItem) => void;
  // Props controladas externamente pela voz
  externalFilters?: Set<string>;
  onFiltersChange?: (filters: Set<string>) => void;
  externalQuery?: string;
  onQueryChange?: (query: string) => void;
  externalOpenTipsId?: string | null;
  onOpenTipsIdChange?: (id: string | null) => void;
};

export function EventSearch({
  onSelect,
  onDirectGuide,
  externalFilters,
  onFiltersChange,
  externalQuery,
  onQueryChange,
  externalOpenTipsId,
  onOpenTipsIdChange,
}: Props) {
  const [internalQuery, setInternalQuery] = useState("");
  const [internalFilters, setInternalFilters] = useState<Set<string>>(new Set());
  const [internalOpenTipsId, setInternalOpenTipsId] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [showGuidesModal, setShowGuidesModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tipsButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Hint dismissível com persistência
  useEffect(() => {
    const isDismissed = localStorage.getItem("eventSearchHintDismissed") === "true";
    if (isDismissed) {
      setHintVisible(false);
    }
  }, []);

  const handleDismissHint = () => {
    setHintVisible(false);
    localStorage.setItem("eventSearchHintDismissed", "true");
  };

  // Estado controlado ou interno
  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = (v: string) => {
    setInternalQuery(v);
    onQueryChange?.(v);
  };
  const activeFilters = externalFilters !== undefined ? externalFilters : internalFilters;
  const setActiveFilters = (updater: ((prev: Set<string>) => Set<string>) | Set<string>) => {
    const next = typeof updater === "function" ? updater(activeFilters) : updater;
    setInternalFilters(next);
    onFiltersChange?.(next);
  };
  const openTipsId = externalOpenTipsId !== undefined ? externalOpenTipsId : internalOpenTipsId;
  const setOpenTipsId = (id: string | null) => {
    setInternalOpenTipsId(id);
    onOpenTipsIdChange?.(id);
  };

  // Foco automático no input ao abrir a tela
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredEvents = useMemo(() => {
    let result = MOCK_EVENTS;

    // Filtro de busca textual
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
      );
    }

    // Filtro de acessibilidade (OR lógico)
    if (activeFilters.size > 0) {
      result = result.filter((e) => {
        if (activeFilters.has("calmo") && e.noiseLevel === "baixo") return true;
        return [...activeFilters].some((f) =>
          (FILTER_MAP[f] || []).some((feat) => e.accessibility.includes(feat))
        );
      });
    }

    return result;
  }, [query, activeFilters]);

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setQuery("");
    setActiveFilters(new Set());
  };

  const toggleTips = (eventId: string) => {
    if (openTipsId === eventId) {
      setOpenTipsId(null);
      // Retornar foco ao botão de dicas
      setTimeout(() => {
        tipsButtonRefs.current.get(eventId)?.focus();
      }, 100);
    } else {
      setOpenTipsId(eventId);
    }
  };

  const getOccupancyColor = (pct: number) => {
    if (pct < 60) return "bg-green-500";
    if (pct <= 85) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getOccupancyLabel = (pct: number) => {
    if (pct < 40) return "Tranquilo";
    if (pct < 60) return "Movimento moderado";
    if (pct <= 85) return "Bastante cheio";
    return "Muito cheio";
  };

  const getToneColor = (tone: "calm" | "warn" | "alert") => {
    if (tone === "calm") return "bg-green-100 text-green-800";
    if (tone === "warn") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const renderTipIcon = (iconName: string) => {
    const iconMap: Record<string, typeof IconClock> = {
      clock: IconClock,
      backpack: IconBackpack,
      bus: IconBus,
      ear: IconEar,
      droplet: IconDroplet,
      plug: IconPlug,
      wheelchair: IconWheelchair,
      car: IconCar,
      walk: IconWalk,
      eye: IconEye,
    };
    const Icon = iconMap[iconName] || IconBulb;
    return <Icon size={18} aria-hidden="true" />;
  };

  return (
    <div className="min-h-dvh bg-[#FDF6E3] flex flex-col">
      <Bandeirolas rows={2} />
      {/* Header fixo */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D85A30] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D85A30]" />
          </span>
          <span className="text-sm text-[#5C4033]">Forró Caju 2024 - Aracaju/SE</span>
        </div>
        <h1 className="font-serif text-2xl text-[#2D1810] mb-1 text-balance">
          Qual evento você vai curtir?
        </h1>
        <p className="text-sm text-[#5C4033]">
          Encontre e veja o que esperar antes de chegar
        </p>
      </div>

      {/* Hint de acessibilidade */}
      {hintVisible && (
        <div className="mx-4 mb-2 flex items-start gap-2.5 rounded-xl bg-[#E1F5EE] px-3 py-2.5 border border-[#1D9E75]/20">
          <IconInfoCircle size={16} className="text-[#0F6E56] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[12px] text-[#0F6E56] leading-snug flex-1">
            Use os filtros abaixo para encontrar eventos com os recursos de acessibilidade que você precisa.
          </p>
          <button
            onClick={handleDismissHint}
            className="shrink-0 p-1 rounded hover:bg-[#1D9E75]/10 transition-colors min-w-7 min-h-7 flex items-center justify-center"
            aria-label="Fechar dica"
          >
            <IconX size={14} className="text-[#0F6E56]" />
          </button>
        </div>
      )}

      {/* Barra de busca */}
      <div className="px-4 py-3" role="search">
        <div className="relative">
          <IconSearch
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C4033]/50"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar evento ou local..."
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#E8D5B5] text-[#2D1810] placeholder:text-[#5C4033]/50 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/50 min-h-12"
            aria-label="Buscar evento ou local"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-[#E8D5B5]/50 min-w-9 min-h-9 flex items-center justify-center"
              aria-label="Limpar busca"
            >
              <IconX size={18} className="text-[#5C4033]/70" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros horizontais com label contextual */}
      <div className="px-4 pb-3">
        <p className="text-xs font-medium text-[#5C4033] mb-2">
          {activeFilters.size === 0
            ? "Filtrar por recurso disponível no evento:"
            : "Mostrando eventos com:"}
        </p>
        <div
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-1"
          role="group"
          aria-label="Filtros de acessibilidade"
        >
          {FILTER_OPTIONS.map((filter) => {
            const isActive = activeFilters.has(filter.id);
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                aria-pressed={isActive}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm whitespace-nowrap transition-all min-h-11",
                  isActive
                    ? "bg-[#D85A30] text-white font-medium"
                    : "bg-white border border-[#E8D5B5] text-[#5C4033] hover:border-[#D85A30]/50"
                )}
              >
                <filter.icon size={15} aria-hidden="true" />
                {filter.label}
                {isActive && (
                  <IconX size={13} className="ml-0.5 opacity-80" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contagem de resultados */}
      <div className="px-4 pb-2 flex items-center justify-between" aria-live="polite" aria-atomic="true">
        <span className="text-sm text-[#5C4033]">
          {filteredEvents.length === MOCK_EVENTS.length
            ? `${filteredEvents.length} eventos disponíveis`
            : `${filteredEvents.length} de ${MOCK_EVENTS.length} eventos`}
        </span>
        {(activeFilters.size > 0 || query.trim()) && (
          <button
            onClick={clearFilters}
            className="text-xs text-[#D85A30] font-medium hover:underline py-1 px-2 min-h-9"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Lista de eventos */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <IconMoodEmpty size={64} className="text-[#5C4033]/30 mb-4" aria-hidden="true" />
            <p className="text-[#5C4033] mb-4">
              Nenhum evento encontrado com esses filtros
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-3 rounded-xl bg-[#D85A30] text-white font-medium min-h-12"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="bg-white rounded-2xl border border-[#E8D5B5] overflow-hidden"
                aria-label={`${event.name}: ${CATEGORY_LABELS[event.category]} em ${event.location}, ${event.date} às ${event.time}. Ruído ${event.noiseLevel}. ${event.accessibility.length} recursos de acessibilidade.`}
              >
              <div className="p-3">
                  {/* Badge categoria e ruído */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        CATEGORY_COLORS[event.category]
                      )}
                    >
                      {CATEGORY_LABELS[event.category]}
                    </span>
                    <span
                      title={`Nível de ruído do evento: ${NOISE_CONFIG[event.noiseLevel].label}`}
                      aria-label={`Nível de ruído: ${NOISE_CONFIG[event.noiseLevel].label}`}
                      className={cn(
                        "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                        NOISE_CONFIG[event.noiseLevel].color
                      )}
                    >
                      {(() => {
                        const NoiseIcon = NOISE_CONFIG[event.noiseLevel].icon;
                        return <NoiseIcon size={14} aria-hidden="true" />;
                      })()}
                      Ruído {NOISE_CONFIG[event.noiseLevel].label}
                    </span>
                  </div>

                  {/* Nome e local */}
                  <h2 className="font-semibold text-lg text-[#2D1810] mb-1">
                    {event.name}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-[#5C4033] mb-2">
                    <span className="flex items-center gap-1">
                      <IconMapPin size={14} aria-hidden="true" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconClock size={14} aria-hidden="true" />
                      {event.date} · {event.time}
                    </span>
                  </div>

                  {/* Recursos de acessibilidade */}
                  <div className="mb-2">
                    <p className="text-[11px] font-medium text-[#0F6E56] mb-1.5 flex items-center gap-1">
                      <IconCheck size={11} className="text-[#0F6E56]" aria-hidden="true" />
                      Recursos de acessibilidade disponíveis
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {event.accessibility.slice(0, 2).map((feat) => (
                        <span
                          key={feat}
                          className="text-xs px-2 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] border border-[#1D9E75]/20 flex items-center gap-1"
                        >
                          <IconCheck size={10} aria-hidden="true" />
                          {ACCESSIBILITY_LABELS[feat]}
                        </span>
                      ))}
                      {event.accessibility.length > 2 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] border border-[#1D9E75]/20">
                          +{event.accessibility.length - 2} recursos
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Barra de lotação */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#5C4033]">Lotação agora</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          event.occupancyPct < 60
                            ? "text-green-700"
                            : event.occupancyPct <= 85
                            ? "text-yellow-700"
                            : "text-red-700"
                        )}
                      >
                        {getOccupancyLabel(event.occupancyPct)}
                      </span>
                    </div>
                    <div
                      className="h-2.5 bg-[#E8D5B5]/50 rounded-full overflow-hidden"
                      role="meter"
                      aria-valuenow={event.occupancyPct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Lotação atual: ${event.occupancyPct}%`}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          getOccupancyColor(event.occupancyPct)
                        )}
                        style={{ width: `${event.occupancyPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2">
                    <button
                      ref={(el) => {
                        if (el) tipsButtonRefs.current.set(event.id, el);
                      }}
                      onClick={() => toggleTips(event.id)}
                      aria-expanded={openTipsId === event.id}
                      aria-controls={`tips-${event.id}`}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-colors min-h-12 text-sm",
                        openTipsId === event.id
                          ? "border-[#D85A30] bg-[#D85A30]/5 text-[#D85A30]"
                          : "border-[#E8D5B5] text-[#5C4033] hover:bg-[#E8D5B5]/30"
                      )}
                    >
                      {openTipsId === event.id ? (
                        <>
                          <IconX size={16} aria-hidden="true" /> Fechar dicas
                        </>
                      ) : (
                        <>
                          <IconBulb size={16} aria-hidden="true" /> Ver dicas
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => onSelect(event, activeFilters)}
                      aria-label={`Escolher ${event.name} e ir para o mapa`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D85A30] text-white font-medium hover:bg-[#C04A20] transition-colors min-h-12 text-sm"
                    >
                      Escolher
                      <IconChevronRight size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Bottom sheet de Dicas (expandido) */}
                <div
                  id={`tips-${event.id}`}
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    openTipsId === event.id ? "max-h-150 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="border-t border-[#E8D5B5] bg-[#FDF6E3]/50 p-4">
                    <h3 className="font-semibold text-[#2D1810] mb-4 flex items-center gap-2">
                      <IconBulb size={20} className="text-[#D85A30]" aria-hidden="true" />
                      Antes de sair de casa
                    </h3>

                    <div className="space-y-4">
                      {event.tips.map((tip, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-[#E8D5B5]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 rounded-lg bg-[#D85A30]/10 text-[#D85A30]">
                              {renderTipIcon(tip.icon)}
                            </span>
                            <div>
                              <h4 className="font-medium text-[#2D1810]">{tip.title}</h4>
                              <p className="text-xs text-[#5C4033]">{tip.subtitle}</p>
                            </div>
                          </div>

                          {tip.type === "chart" && tip.hours && (
                            <div className="space-y-2 mt-3">
                              {tip.hours.map((hour, hIdx) => (
                                <div key={hIdx} className="flex items-center gap-3">
                                  <span className="text-xs text-[#5C4033] w-10">{hour.time}</span>
                                  <div className="flex-1 h-3 bg-[#E8D5B5]/50 rounded-full overflow-hidden">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        hour.tone === "calm" && "bg-green-500",
                                        hour.tone === "warn" && "bg-yellow-500",
                                        hour.tone === "alert" && "bg-red-500"
                                      )}
                                      style={{ width: `${hour.pct}%` }}
                                    />
                                  </div>
                                  <span
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      getToneColor(hour.tone)
                                    )}
                                  >
                                    {hour.tag}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {tip.type === "list" && tip.items && (
                            <div className="space-y-2 mt-3">
                              {tip.items.map((item, iIdx) => (
                                <div
                                  key={iIdx}
                                  className="flex items-center gap-3 p-2 rounded-lg bg-[#FDF6E3]"
                                >
                                  <span className="text-[#5C4033]">
                                    {renderTipIcon(item.icon)}
                                  </span>
                                  <span className="flex-1 text-sm text-[#2D1810]">{item.text}</span>
                                  <span
                                    className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      getToneColor(item.tone)
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleTips(event.id)}
                      className="w-full mt-4 py-3 text-sm text-[#5C4033] hover:text-[#2D1810] min-h-11"
                    >
                      Fechar dicas
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Botao "Ver todos os guias" - fixo, canto inferior esquerdo */}
      {onDirectGuide && (
        <button
          onClick={() => setShowGuidesModal(true)}
          aria-label="Ver todos os guias culturais"
          className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-full bg-[#2D1810] px-4 py-3 text-sm font-medium text-[#FDF6E3] shadow-lg transition-all hover:bg-[#1A0A04] active:scale-95"
        >
          <IconBooks size={18} aria-hidden="true" />
          Guias culturais
        </button>
      )}

      {/* AllGuidesSheet Modal */}
      {showGuidesModal && onDirectGuide && (
        <AllGuidesSheet
          events={MOCK_EVENTS}
          onClose={() => setShowGuidesModal(false)}
          onSelectGuide={(event) => {
            setShowGuidesModal(false);
            onDirectGuide(event);
          }}
        />
      )}

      {/* Progress dots */}
      <div className="fixed bottom-0 left-0 right-0 bg-linear-to-t from-[#FDF6E3] to-transparent pt-8 pb-6 pointer-events-none">
        <ProgressDots currentStep={0} totalSteps={3} />
      </div>
    </div>
  );
}
