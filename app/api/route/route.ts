import { NextRequest, NextResponse } from "next/server";

// Cache simples em memória para evitar requisições repetidas ao Overpass
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query inválida" }, { status: 400 });
    }

    // Verifica cache
    const cacheKey = query.trim();
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "HIT" },
      });
    }

    const overpassUrl = "https://overpass-api.de/api/interpreter";

    const resp = await fetch(overpassUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 300 },
    });

    if (!resp.ok) {
      throw new Error(`Overpass HTTP ${resp.status}`);
    }

    const data = await resp.json();

    // Salva no cache
    cache.set(cacheKey, { data, ts: Date.now() });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Overpass proxy error:", err);
    return NextResponse.json(
      { error: "Falha ao consultar OpenStreetMap", detail: err?.message },
      { status: 502 }
    );
  }
}
