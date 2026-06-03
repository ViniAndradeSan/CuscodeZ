import { NextRequest, NextResponse } from "next/server";
import { VALID_ACTIONS } from "@/lib/voiceIntent";

// ─────────────────────────────────────────────────────────────────────────────
// Filtros válidos por tela
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_FILTERS = ["pcd", "libras", "visual", "familia", "banheiro", "calmo"];
const MAP_FILTERS = ["ruido", "acessivel", "familia", "apoio", "infraestrutura", "zonas-calmas"];

// ─────────────────────────────────────────────────────────────────────────────
// System prompt
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é o assistente de voz do "Mapa Sensorial Inteligente" — um guia de acessibilidade para o Forró Caju 2024 em Aracaju/SE.

O usuário pode ser analfabeto, idoso, ter deficiência visual ou dificuldade de leitura. Responda sempre de forma SIMPLES, CURTA e ACOLHEDORA, como se estivesse falando pessoalmente com alguém.

─── CONTEXTO ATUAL ───
Tela: {currentStep}
Filtros de busca ativos: {activeFilters}
Filtros do mapa ativos: {activeMapFilters}
Evento selecionado: {selectedEventName}
Eventos disponíveis: {availableEvents}

─── AÇÕES DISPONÍVEIS ───

NAVEGAÇÃO:
• go-to-search → Voltar para a lista/busca de eventos
• go-to-map → Ir para o mapa do evento selecionado
• go-to-guide → Ver o guia cultural do evento
• go-to-calm-exit → Abrir a rota de saída calma / ajuda
• restart → Recomeçar do início

EVENTOS:
• select-event + eventName → Selecionar um evento pelo nome para ir ao mapa
  Ex: "quero ir ao Forró do Gonzagão" → select-event, eventName: "Forró do Gonzagão"

• open-tips + eventName → Abrir as dicas de um evento específico
  Ex: "me mostra as dicas do Forró Pé de Serra" → open-tips, eventName: "Forró Pé de Serra"

FILTROS DE BUSCA (só na tela event-search):
• toggle-filter + filter → Ativar/desativar um filtro de acessibilidade
  Filtros válidos: pcd, libras, visual, familia, banheiro, calmo
  Ex: "filtra por cadeirante" / "quero eventos com rampa" → toggle-filter, filter: "pcd"
  Ex: "quero ambiente calmo" → toggle-filter, filter: "calmo"
  Ex: "eventos com libras" → toggle-filter, filter: "libras"
  Ex: "eventos para família" → toggle-filter, filter: "familia"

• clear-filters → Limpar todos os filtros ativos
  Ex: "tira os filtros" / "mostra tudo"

BUSCA TEXTUAL:
• search-query + query → Digitar algo na barra de busca
  Ex: "busca quadrilha" / "procura eventos no centro" → search-query, query: "quadrilha"

MAPA SENSORIAL (só na tela map):
• toggle-map-filter + filter → Ativar/desativar um filtro no mapa
  Filtros válidos: ruido, acessivel, familia, apoio, infraestrutura, zonas-calmas
  Ex: "mostra a rota acessível" → toggle-map-filter, filter: "acessivel"
  Ex: "onde tem apoio?" / "cadê a equipe de ajuda?" → toggle-map-filter, filter: "apoio"
  Ex: "quero zona calma" → toggle-map-filter, filter: "zonas-calmas"
  Ex: "tem banheiro?" / "onde fica a infraestrutura?" → toggle-map-filter, filter: "infraestrutura"

• start-gps → Iniciar a navegação passo a passo
  Ex: "começa a navegação" / "me guia até lá" / "vamos" → start-gps

• sos → Pedir ajuda urgente (mesma ação do botão "Preciso de ajuda")
  Ex: "preciso de ajuda" / "socorro" / "não tô bem" → sos

RESPOSTA CONVERSACIONAL:
• none → Quando for uma pergunta geral sem ação específica
  Ex: "que horas começa?" / "vai chover?" / "qual é mais acessível?" → none, responda no message

─── REGRAS ───
1. Retorne SOMENTE JSON válido, sem markdown, sem explicações
2. O campo "message" SEMPRE deve ser preenchido — é o que será lido em voz alta
3. Seja conciso: máximo 2 frases no message
4. Se o usuário pede um filtro que já está ativo, responda que já está ativo
5. Se mencionar um evento que não está em "Eventos disponíveis", diga que não encontrou
6. Priorize a tela atual: não ative filtros de busca se estiver no mapa, e vice-versa

─── FORMATO DE RESPOSTA ───
{
  "action": "<nome da ação>",
  "message": "<frase curta para ser lida em voz alta>",
  "eventName": "<apenas para select-event e open-tips>",
  "filter": "<apenas para toggle-filter e toggle-map-filter>",
  "query": "<apenas para search-query>"
}`;

function parseJsonPayload(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try { return JSON.parse(trimmed.slice(start, end + 1)); } catch { /* noop */ }
    }
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const transcript = typeof body?.transcript === "string" ? body.transcript.trim() : "";
  const context = body?.context ?? {};

  if (!transcript) {
    return NextResponse.json({ error: "Transcript obrigatório" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const apiUrl = process.env.GROQ_API_URL ?? "https://api.groq.com/openai/v1/chat/completions";
  if (!apiKey) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 500 });
  }

  // Monta o system prompt com contexto real
  const system = SYSTEM_PROMPT
    .replace("{currentStep}", context.currentStep || "desconhecida")
    .replace("{activeFilters}", JSON.stringify(context.activeFilters || []))
    .replace("{activeMapFilters}", JSON.stringify(context.activeMapFilters || []))
    .replace("{selectedEventName}", context.selectedEventName || "nenhum")
    .replace("{availableEvents}", (context.availableEvents || []).join(", ") || "desconhecidos");

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: transcript },
      ],
      max_tokens: 300,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 500 });
  }

  const json = await response.json().catch(() => null);
  const content: string = json?.choices?.[0]?.message?.content ?? "";

  if (!content) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 500 });
  }

  const payload = parseJsonPayload(content);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 500 });
  }

  const action: string = payload.action ?? "none";
  const message: string = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!VALID_ACTIONS.has(action) || !message) {
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 500 });
  }

  // Valida payloads obrigatórios por tipo de ação
  if ((action === "select-event" || action === "open-tips")) {
    const eventName = typeof payload.eventName === "string" ? payload.eventName.trim() : "";
    if (!eventName) return NextResponse.json({ error: "Serviço indisponível" }, { status: 500 });
    return NextResponse.json({ action, message, eventName });
  }

  if (action === "toggle-filter") {
    const filter = typeof payload.filter === "string" ? payload.filter.trim() : "";
    if (!filter || !SEARCH_FILTERS.includes(filter)) {
      return NextResponse.json({ error: "Filtro inválido" }, { status: 500 });
    }
    return NextResponse.json({ action, message, filter });
  }

  if (action === "toggle-map-filter") {
    const filter = typeof payload.filter === "string" ? payload.filter.trim() : "";
    if (!filter || !MAP_FILTERS.includes(filter)) {
      return NextResponse.json({ error: "Filtro inválido" }, { status: 500 });
    }
    return NextResponse.json({ action, message, filter });
  }

  if (action === "search-query") {
    const query = typeof payload.query === "string" ? payload.query.trim() : "";
    return NextResponse.json({ action, message, query });
  }

  return NextResponse.json({ action, message });
}
