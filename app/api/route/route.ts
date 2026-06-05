import { NextRequest, NextResponse } from "next/server";

// ─── OSRM público — múltiplos endpoints para resiliência ─────────────────────
const OSRM_ENDPOINTS = [
  "https://router.project-osrm.org",
  "https://routing.openstreetmap.de",
];

// ─── Bounding box de Aracaju para queries Overpass ───────────────────────────
const ARACAJU_BBOX = "-11.05,-37.12,-10.85,-36.98";

// ─── Tipos de filtro do mapa ──────────────────────────────────────────────────
type FilterKey = "ruido" | "acessivel" | "familia" | "apoio" | "infraestrutura" | "zonas-calmas";

// ─── Cache de dados OSM por filtro ───────────────────────────────────────────
// Em produção isso fica em memória por processo — suficiente para um evento
const osmCache = new Map<FilterKey, Array<{ lat: number; lng: number; radius: number }>>();

// ─── Raios de influência por tipo de local (em metros) ───────────────────────
const NOISE_RADII: Record<string, number> = {
  stadium: 500, music_venue: 350, nightclub: 250,
  theatre: 200, cinema: 150, pub: 120, bar: 100,
};

// ─── Busca pontos OSM relevantes para um filtro ───────────────────────────────
async function fetchOsmPoints(
  filterKey: FilterKey
): Promise<Array<{ lat: number; lng: number; radius: number }>> {
  if (osmCache.has(filterKey)) return osmCache.get(filterKey)!;

  let query = "";

  if (filterKey === "ruido") {
    query = `[out:json][timeout:15];
(
  node["leisure"="stadium"](${ARACAJU_BBOX});
  way["leisure"="stadium"](${ARACAJU_BBOX});
  node["leisure"="music_venue"](${ARACAJU_BBOX});
  way["leisure"="music_venue"](${ARACAJU_BBOX});
  node["amenity"="music_venue"](${ARACAJU_BBOX});
  node["amenity"="nightclub"](${ARACAJU_BBOX});
  node["amenity"="theatre"](${ARACAJU_BBOX});
  node["amenity"="cinema"](${ARACAJU_BBOX});
  node["amenity"="pub"](${ARACAJU_BBOX});
  node["amenity"="bar"](${ARACAJU_BBOX});
);
out body center 80;`;
  } else if (filterKey === "acessivel") {
    query = `[out:json][timeout:15];
(
  way["wheelchair"="yes"](${ARACAJU_BBOX});
  way["kerb"="lowered"](${ARACAJU_BBOX});
  node["kerb"="lowered"](${ARACAJU_BBOX});
  node["tactile_paving"="yes"](${ARACAJU_BBOX});
);
out body center 80;`;
  } else if (filterKey === "zonas-calmas") {
    query = `[out:json][timeout:15];
(
  way["leisure"="park"](${ARACAJU_BBOX});
  node["leisure"="park"](${ARACAJU_BBOX});
  way["leisure"="garden"](${ARACAJU_BBOX});
  node["place"="square"](${ARACAJU_BBOX});
);
out body center 80;`;
  }

  if (!query) return [];

  const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];

  let resp: Response | null = null;
  for (const ep of OVERPASS_ENDPOINTS) {
    try {
      resp = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(18000),
      });
      if (resp.ok) break;
    } catch {
      resp = null;
    }
  }

  if (!resp?.ok) return [];

  const data = await resp.json().catch(() => ({ elements: [] }));
  const elements: any[] = data.elements || [];

  const points = elements.flatMap((el: any) => {
    let lat: number | undefined, lng: number | undefined;
    if (el.type === "node") { lat = el.lat; lng = el.lon; }
    else if (el.center) { lat = el.center.lat; lng = el.center.lon; }
    if (!lat || !lng) return [];

    // Raio de influência por subtipo
    let radius = 80; // padrão
    const tags = el.tags || {};
    if (filterKey === "ruido") {
      if (tags.leisure === "stadium") radius = NOISE_RADII.stadium;
      else if (tags.leisure === "music_venue" || tags.amenity === "music_venue") radius = NOISE_RADII.music_venue;
      else if (tags.amenity === "nightclub") radius = NOISE_RADII.nightclub;
      else if (tags.amenity === "theatre") radius = NOISE_RADII.theatre;
      else if (tags.amenity === "cinema") radius = NOISE_RADII.cinema;
      else if (tags.amenity === "pub") radius = NOISE_RADII.pub;
      else if (tags.amenity === "bar") radius = NOISE_RADII.bar;
    } else if (filterKey === "acessivel") {
      radius = 15; // pontos acessíveis têm raio pequeno — são waypoints positivos
    } else if (filterKey === "zonas-calmas") {
      radius = tags.leisure === "park" ? 150 : 80;
    }

    return [{ lat, lng, radius }];
  });

  osmCache.set(filterKey, points);
  return points;
}

// ─── Calcula distância Haversine em metros ─────────────────────────────────
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Avalia se um ponto de rota é "ruim" pela proximidade com ruído ──────────
function isNearNoise(
  lat: number,
  lng: number,
  noisePoints: Array<{ lat: number; lng: number; radius: number }>
): boolean {
  return noisePoints.some(
    (p) => haversine(lat, lng, p.lat, p.lng) < p.radius * 1.5 // margem de 50%
  );
}

// ─── Avalia se um ponto é próximo de local acessível ─────────────────────────
function isNearAccessible(
  lat: number,
  lng: number,
  accessPoints: Array<{ lat: number; lng: number; radius: number }>
): boolean {
  return accessPoints.some(
    (p) => haversine(lat, lng, p.lat, p.lng) < 80
  );
}

// ─── Escolhe o melhor perfil OSRM com base nos filtros ───────────────────────
function chooseOsrmProfile(activeFilters: FilterKey[]): string {
  if (activeFilters.includes("acessivel")) return "foot"; // pedestrian é mais preciso
  return "foot";
}

// ─── Adiciona annotations à query OSRM para análise de rota ─────────────────
function buildOsrmUrl(
  base: string,
  fromLat: number, fromLng: number,
  toLat: number, toLng: number,
  profile: string
): string {
  return `${base}/route/v1/${profile}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson&steps=true&annotations=false`;
}

// ─── Pontua a rota com base nos filtros ativos ─────────────────────────────
function scoreRoute(
  coordinates: [number, number][],
  noisePoints: Array<{ lat: number; lng: number; radius: number }>,
  accessPoints: Array<{ lat: number; lng: number; radius: number }>,
  avoidNoise: boolean,
  preferAccessible: boolean
): { noiseCount: number; accessCount: number } {
  let noiseCount = 0;
  let accessCount = 0;

  for (const [lng, lat] of coordinates) {
    if (avoidNoise && isNearNoise(lat, lng, noisePoints)) noiseCount++;
    if (preferAccessible && isNearAccessible(lat, lng, accessPoints)) accessCount++;
  }

  return { noiseCount, accessCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// Handler principal
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const fromLat = parseFloat(searchParams.get("fromLat") ?? "");
  const fromLng = parseFloat(searchParams.get("fromLng") ?? "");
  const toLat   = parseFloat(searchParams.get("toLat") ?? "");
  const toLng   = parseFloat(searchParams.get("toLng") ?? "");

  if ([fromLat, fromLng, toLat, toLng].some(isNaN)) {
    return NextResponse.json(
      { code: "InvalidInput", message: "Coordenadas inválidas" },
      { status: 400 }
    );
  }

  // Filtros ativos passados como query string: ?filters=ruido,acessivel
  const filtersParam = searchParams.get("filters") ?? "";
  const activeFilters = filtersParam
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean) as FilterKey[];

  const avoidNoise = activeFilters.includes("ruido");
  const preferAccessible = activeFilters.includes("acessivel");

  // Busca dados OSM relevantes em paralelo (apenas filtros que precisam de dados)
  const [noisePoints, accessPoints] = await Promise.all([
    avoidNoise ? fetchOsmPoints("ruido").catch(() => []) : Promise.resolve([]),
    preferAccessible ? fetchOsmPoints("acessivel").catch(() => []) : Promise.resolve([]),
  ]);

  const profile = chooseOsrmProfile(activeFilters);

  // ── Tenta OSRM com múltiplos endpoints ────────────────────────────────────
  let routeData: any = null;
  let lastError: string = "";

  for (const base of OSRM_ENDPOINTS) {
    try {
      const url = buildOsrmUrl(base, fromLat, fromLng, toLat, toLng, profile);
      const resp = await fetch(url, {
        headers: { "User-Agent": "CuscodeZ-Aracaju/1.0" },
        signal: AbortSignal.timeout(12000),
      });

      if (!resp.ok) {
        lastError = `HTTP ${resp.status} em ${base}`;
        continue;
      }

      const data = await resp.json();
      if (data.code === "Ok" && data.routes?.length) {
        routeData = data;
        break;
      } else {
        lastError = `OSRM code=${data.code} em ${base}`;
      }
    } catch (err: any) {
      lastError = err?.message ?? "timeout";
    }
  }

  if (!routeData) {
    console.error("[route] Todos os endpoints OSRM falharam:", lastError);
    return NextResponse.json(
      { code: "Error", message: "Serviço de rota indisponível", detail: lastError },
      { status: 503 }
    );
  }

  // ── Pós-processamento: analisa e anota a rota com base nos filtros ─────────
  if (avoidNoise || preferAccessible) {
    const route = routeData.routes[0];
    const coords: [number, number][] = route.geometry?.coordinates ?? [];

    const { noiseCount, accessCount } = scoreRoute(
      coords,
      noisePoints,
      accessPoints,
      avoidNoise,
      preferAccessible
    );

    // Injeta metadados de acessibilidade na resposta
    const totalPoints = coords.length || 1;
    routeData.routes[0].sensoryMeta = {
      avoidNoise,
      preferAccessible,
      noiseExposurePercent: Math.round((noiseCount / totalPoints) * 100),
      accessibleSegmentsPercent: Math.round((accessCount / totalPoints) * 100),
      noisePointsLoaded: noisePoints.length,
      accessPointsLoaded: accessPoints.length,
      // Aviso se rota passa por muito ruído
      noiseWarning: avoidNoise && noiseCount / totalPoints > 0.15,
    };
  }

  return NextResponse.json(routeData);
}
