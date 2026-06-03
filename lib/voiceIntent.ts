// ─────────────────────────────────────────────────────────────────────────────
// Tipos de ação que a voz pode disparar
// ─────────────────────────────────────────────────────────────────────────────
export type VoiceAction =
  // Navegação entre telas
  | { type: "go-to-search" }
  | { type: "go-to-map" }
  | { type: "go-to-guide"; eventName?: string }
  | { type: "go-to-calm-exit" }
  | { type: "restart" }
  // Eventos
  | { type: "select-event"; eventName: string }
  // Filtros de acessibilidade na tela de busca
  | { type: "toggle-filter"; filter: string }
  | { type: "clear-filters" }
  // Busca textual
  | { type: "search-query"; query: string }
  // Mapa sensorial
  | { type: "toggle-map-filter"; filter: string }
  | { type: "start-gps" }
  | { type: "sos" }
  // Dicas de evento
  | { type: "open-tips"; eventName: string }
  // Nenhuma ação (resposta conversacional)
  | { type: "none" };

export const VALID_ACTIONS = new Set([
  "none",
  "go-to-search",
  "go-to-map",
  "go-to-guide",
  "go-to-calm-exit",
  "restart",
  "select-event",
  "toggle-filter",
  "clear-filters",
  "search-query",
  "toggle-map-filter",
  "start-gps",
  "sos",
  "open-tips",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Contexto enviado junto com a transcrição
// ─────────────────────────────────────────────────────────────────────────────
export type VoiceContext = {
  currentStep: string;
  activeFilters?: string[];       // filtros ativos no EventSearch
  activeMapFilters?: string[];    // filtros ativos no SensoryMap
  selectedEventName?: string;     // evento atualmente selecionado
  availableEvents?: string[];     // lista de nomes de eventos disponíveis
  lastAction?: string;            // última ação executada pelo assistente
  lastUserUtterance?: string;     // última fala do usuário (para continuidade de contexto)
};

// ─────────────────────────────────────────────────────────────────────────────
// Chamada à API
// ─────────────────────────────────────────────────────────────────────────────
export async function resolveVoiceIntent(
  transcript: string,
  context: VoiceContext
): Promise<{ action: VoiceAction; message: string }> {
  try {
    const response = await fetch("/api/voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, context }),
    });

    const json = await response.json();

    if (!response.ok || !json || typeof json !== "object") {
      throw new Error("Falha na requisição de voz");
    }

    const actionValue = json.action as string;
    const message: string =
      typeof json.message === "string" && json.message.trim()
        ? json.message.trim()
        : "Desculpa, não entendi. Pode repetir?";

    if (!VALID_ACTIONS.has(actionValue)) throw new Error("Ação inválida");

    // Ações que carregam payload extra
    if (actionValue === "select-event" || actionValue === "open-tips") {
      const eventName = typeof json.eventName === "string" ? json.eventName.trim() : "";
      if (!eventName) throw new Error("Faltou eventName");
      return { action: { type: actionValue as any, eventName }, message };
    }

    if (actionValue === "go-to-guide") {
      const eventName = typeof json.eventName === "string" ? json.eventName.trim() : "";
      return {
        action: { type: "go-to-guide", eventName: eventName || undefined },
        message,
      };
    }

    if (actionValue === "toggle-filter") {
      const filter = typeof json.filter === "string" ? json.filter.trim() : "";
      if (!filter) throw new Error("Faltou filter");
      return { action: { type: "toggle-filter", filter }, message };
    }

    if (actionValue === "toggle-map-filter") {
      const filter = typeof json.filter === "string" ? json.filter.trim() : "";
      if (!filter) throw new Error("Faltou filter");
      return { action: { type: "toggle-map-filter", filter }, message };
    }

    if (actionValue === "search-query") {
      const query = typeof json.query === "string" ? json.query.trim() : "";
      return { action: { type: "search-query", query }, message };
    }

    return { action: { type: actionValue as any }, message };
  } catch {
    return {
      action: { type: "none" },
      message: "Desculpa, não entendi. Pode repetir?",
    };
  }
}