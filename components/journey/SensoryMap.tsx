"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  IconAlertTriangle,
  IconHeartOff,
  IconInfoCircle,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconX,
  IconCurrentLocation,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";
import { Header } from "./Header";
import { ProgressDots } from "./ProgressDots";
import { Bandeirolas } from "./Bandeirolas";
import type { EventItem } from "@/types/event";

// ─── Coordenadas reais dos locais em Aracaju ──────────────────────────────────
const DESTINATIONS: Record<string, { label: string; lat: number; lng: number }> = {
  "1": { label: "Praça Hilton Lopes", lat: -10.9172, lng: -37.0516 },
  "2": { label: "Mercado Thales Ferraz", lat: -10.9155, lng: -37.0534 },
  "3": { label: "Centro de Criatividade Aloísio Campos", lat: -10.9217, lng: -37.0462 },
  "4": { label: "Praça Fausto Cardoso", lat: -10.9195, lng: -37.0532 },
  "5": { label: "Orla de Atalaia — Palco Principal", lat: -10.9880, lng: -37.0422 },
  "6": { label: "Museu da Gente Sergipana", lat: -10.9850, lng: -37.0430 },
  "7": { label: "Parque da Sementeira", lat: -10.9633, lng: -37.0461 },
  "8": { label: "Praça Olímpio Campos", lat: -10.9104, lng: -37.0519 },
};

const ARACAJU_CENTER: [number, number] = [-10.9167, -37.0533];
const ARACAJU_BBOX = "-11.05,-37.12,-10.85,-36.98";

type FilterKey = "ruido" | "acessivel" | "familia" | "apoio" | "infraestrutura" | "zonas-calmas";

const FILTERS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "ruido",         label: "Ruído",       icon: "🔇" },
  { key: "acessivel",     label: "Acessível",   icon: "♿" },
  { key: "familia",       label: "Família",     icon: "👶" },
  { key: "apoio",         label: "Apoio",       icon: "🆘" },
  { key: "infraestrutura",label: "Infraestrutura", icon: "🚻" },
  { key: "zonas-calmas",  label: "Zona calma",  icon: "🌿" },
];

// ─── SUBTYPE_VISUAL: ícone + raio proporcional ao impacto real do local ───────
const SUBTYPE_VISUAL: Record<string, {
  icon: string;
  radius: number;
  iconSize: number;
  color: string;
  bgColor: string;
  label: string;
  pulse?: boolean;
}> = {
  // RUÍDO — zonas maiores = mais barulho
  stadium:       { icon: "🏟️", radius: 500, iconSize: 44, color: "#C0392B", bgColor: "#FDEDEC", label: "Estádio",        pulse: true },
  music_venue:   { icon: "🎸", radius: 350, iconSize: 42, color: "#C0392B", bgColor: "#FDEDEC", label: "Casa de Shows",  pulse: true },
  nightclub:     { icon: "🪩", radius: 250, iconSize: 38, color: "#E74C3C", bgColor: "#FCEAE8", label: "Casa Noturna",   pulse: true },
  theatre:       { icon: "🎭", radius: 200, iconSize: 36, color: "#E74C3C", bgColor: "#FCEAE8", label: "Teatro" },
  cinema:        { icon: "🎬", radius: 150, iconSize: 34, color: "#E67E22", bgColor: "#FEF0E7", label: "Cinema" },
  pub:           { icon: "🍺", radius: 120, iconSize: 30, color: "#E67E22", bgColor: "#FEF0E7", label: "Pub" },
  bar:           { icon: "🍹", radius: 100, iconSize: 28, color: "#E67E22", bgColor: "#FEF0E7", label: "Bar" },

  // APOIO / SOS — ícones inconfundíveis entre hospital e bombeiros
  hospital:      { icon: "🏥", radius: 120, iconSize: 46, color: "#922B21", bgColor: "#FADBD8", label: "Hospital",          pulse: true },
  fire_station:  { icon: "🚒", radius: 80,  iconSize: 42, color: "#C0392B", bgColor: "#FDEDEC", label: "Corpo de Bombeiros",pulse: true },
  clinic:        { icon: "🩺", radius: 60,  iconSize: 36, color: "#CB4335", bgColor: "#FCEAE8", label: "Clínica" },
  doctors:       { icon: "👨‍⚕️", radius: 50,  iconSize: 34, color: "#CB4335", bgColor: "#FCEAE8", label: "Médico" },
  pharmacy:      { icon: "💊", radius: 40,  iconSize: 32, color: "#D4500F", bgColor: "#FDEBD0", label: "Farmácia" },
  police:        { icon: "🚔", radius: 60,  iconSize: 36, color: "#1A5276", bgColor: "#D6EAF8", label: "Delegacia" },
  first_aid:     { icon: "🩹", radius: 40,  iconSize: 30, color: "#CB4335", bgColor: "#FCEAE8", label: "Primeiros Socorros" },

  // FAMÍLIA — proporcional ao espaço/público
  playground:    { icon: "🛝", radius: 80,  iconSize: 36, color: "#B7770D", bgColor: "#FEF9E7", label: "Playground" },
  childcare:     { icon: "🍼", radius: 50,  iconSize: 32, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Creche" },
  baby_hatch:    { icon: "👶", radius: 40,  iconSize: 30, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Baby hatch" },
  changing_table:{ icon: "🧷", radius: 25,  iconSize: 26, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Fraldário" },
  fast_food:     { icon: "🍔", radius: 35,  iconSize: 28, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Lanchonete" },
  restaurant:    { icon: "🍽️", radius: 40,  iconSize: 28, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Restaurante" },
  cafe:          { icon: "☕", radius: 30,  iconSize: 26, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Café" },
  ice_cream:     { icon: "🍦", radius: 25,  iconSize: 24, color: "#D4AC0D", bgColor: "#FEF9E7", label: "Sorveteria" },
  mall:          { icon: "🏬", radius: 160, iconSize: 40, color: "#B7770D", bgColor: "#FEF9E7", label: "Shopping" },

  // ZONAS CALMAS — proporcional à área verde
  nature_reserve:{ icon: "🌿", radius: 350, iconSize: 44, color: "#148F77", bgColor: "#D1F2EB", label: "Reserva Natural" },
  park:          { icon: "🌳", radius: 200, iconSize: 40, color: "#1D9E75", bgColor: "#E1F5EE", label: "Parque" },
  garden:        { icon: "🌺", radius: 120, iconSize: 34, color: "#1D9E75", bgColor: "#E1F5EE", label: "Jardim" },
  square:        { icon: "⛲", radius: 80,  iconSize: 32, color: "#1D9E75", bgColor: "#E1F5EE", label: "Praça" },
  grass:         { icon: "🌱", radius: 60,  iconSize: 26, color: "#1D9E75", bgColor: "#E1F5EE", label: "Área verde" },
  bench:         { icon: "🪑", radius: 12,  iconSize: 20, color: "#1D9E75", bgColor: "#E1F5EE", label: "Banco" },

  // INFRAESTRUTURA
  toilets:       { icon: "🚻", radius: 18,  iconSize: 28, color: "#6B3FA0", bgColor: "#F0E8F8", label: "Banheiro" },
  drinking_water:{ icon: "💧", radius: 12,  iconSize: 24, color: "#1A6598", bgColor: "#D6EAF8", label: "Bebedouro" },
  shelter:       { icon: "⛺", radius: 22,  iconSize: 28, color: "#6B3FA0", bgColor: "#F0E8F8", label: "Abrigo" },

  // ACESSÍVEL
  wheelchair:    { icon: "♿", radius: 18,  iconSize: 28, color: "#1F5C8F", bgColor: "#E3EFF8", label: "Acessível" },
  kerb_lowered:  { icon: "🦽", radius: 10,  iconSize: 22, color: "#1F5C8F", bgColor: "#E3EFF8", label: "Rampa" },
  tactile:       { icon: "👁️", radius: 10,  iconSize: 22, color: "#1F5C8F", bgColor: "#E3EFF8", label: "Piso tátil" },
};

// Fallback visual por filtro (quando subtype não é reconhecido)
const FILTER_CONFIG: Record<FilterKey, { icon: string; color: string; bgColor: string; label: string; radius: number; iconSize: number }> = {
  acessivel:      { icon: "♿", color: "#1F5C8F", bgColor: "#E3EFF8", label: "Acessível",      radius: 18, iconSize: 28 },
  infraestrutura: { icon: "🚻", color: "#6B3FA0", bgColor: "#F0E8F8", label: "Infraestrutura", radius: 18, iconSize: 28 },
  apoio:          { icon: "🆘", color: "#D94F3D", bgColor: "#FCEAE8", label: "Apoio",           radius: 60, iconSize: 34 },
  familia:        { icon: "👨‍👩‍👧", color: "#D97706", bgColor: "#FEF3C7", label: "Família",        radius: 40, iconSize: 30 },
  "zonas-calmas": { icon: "🌿", color: "#1D9E75", bgColor: "#E1F5EE", label: "Zona calma",     radius: 80, iconSize: 32 },
  ruido:          { icon: "🔊", color: "#E74C3C", bgColor: "#FCEAE8", label: "Barulho",         radius: 120, iconSize: 32 },
};

// ─── Extrai subtipo do elemento OSM ──────────────────────────────────────────
function getSubtype(el: any): string {
  const tags = el.tags || {};
  if (tags.amenity === "hospital")      return "hospital";
  if (tags.amenity === "fire_station")  return "fire_station";
  if (tags.amenity === "clinic")        return "clinic";
  if (tags.amenity === "doctors")       return "doctors";
  if (tags.amenity === "pharmacy")      return "pharmacy";
  if (tags.amenity === "police")        return "police";
  if (tags.amenity === "first_aid")     return "first_aid";
  if (tags.leisure === "stadium")       return "stadium";
  if (tags.leisure === "music_venue" || tags.amenity === "music_venue") return "music_venue";
  if (tags.amenity === "nightclub")     return "nightclub";
  if (tags.amenity === "theatre")       return "theatre";
  if (tags.amenity === "cinema")        return "cinema";
  if (tags.amenity === "pub")           return "pub";
  if (tags.amenity === "bar")           return "bar";
  if (tags.leisure === "playground")    return "playground";
  if (tags.amenity === "childcare")     return "childcare";
  if (tags.amenity === "baby_hatch")    return "baby_hatch";
  if (tags.changing_table === "yes")    return "changing_table";
  if (tags.amenity === "fast_food")     return "fast_food";
  if (tags.amenity === "cafe")          return "cafe";
  if (tags.amenity === "ice_cream")     return "ice_cream";
  if (tags.shop === "mall" || tags.shop === "supermarket") return "mall";
  if (tags.amenity === "restaurant")    return "restaurant";
  if (tags.boundary === "national_park" || tags.leisure === "nature_reserve") return "nature_reserve";
  if (tags.leisure === "park")          return "park";
  if (tags.leisure === "garden")        return "garden";
  if (tags.historic === "memorial" || tags.amenity === "fountain" || tags.place === "square") return "square";
  if (tags.amenity === "bench")         return "bench";
  if (tags.landuse === "grass" || tags.leisure === "grass") return "grass";
  if (tags.amenity === "toilets")       return "toilets";
  if (tags.amenity === "drinking_water") return "drinking_water";
  if (tags.amenity === "shelter")       return "shelter";
  if (tags.kerb === "lowered" || tags.kerb === "flush") return "kerb_lowered";
  if (tags.tactile_paving === "yes")    return "tactile";
  if (tags.wheelchair === "yes")        return "wheelchair";
  return "";
}

// ─── Queries Overpass por filtro ──────────────────────────────────────────────
function buildOverpassQuery(filterKey: FilterKey): string {
  const bbox = ARACAJU_BBOX;

  switch (filterKey) {
    case "acessivel":
      return `[out:json][timeout:15];
(
  node["wheelchair"="yes"](${bbox});
  node["kerb"="lowered"](${bbox});
  node["kerb"="flush"](${bbox});
  way["wheelchair"="yes"](${bbox});
  node["tactile_paving"="yes"](${bbox});
);
out body 80;`;

    case "infraestrutura":
      return `[out:json][timeout:15];
(
  node["amenity"="toilets"](${bbox});
  node["amenity"="drinking_water"](${bbox});
  node["amenity"="bench"](${bbox});
  node["amenity"="shelter"](${bbox});
);
out body 80;`;

    case "apoio":
      // Queries ricas — distingue hospital, bombeiros, clínica, farmácia, polícia
      return `[out:json][timeout:15];
(
  node["amenity"="hospital"](${bbox});
  way["amenity"="hospital"](${bbox});
  node["amenity"="fire_station"](${bbox});
  way["amenity"="fire_station"](${bbox});
  node["amenity"="clinic"](${bbox});
  node["amenity"="doctors"](${bbox});
  node["amenity"="pharmacy"](${bbox});
  node["amenity"="police"](${bbox});
  way["amenity"="police"](${bbox});
  node["amenity"="first_aid"](${bbox});
);
out body center 80;`;

    case "familia":
      // Família = mais que playground: lanchonetes, shoppings, cafés, fraldários
      return `[out:json][timeout:15];
(
  node["leisure"="playground"](${bbox});
  way["leisure"="playground"](${bbox});
  node["amenity"="childcare"](${bbox});
  node["amenity"="baby_hatch"](${bbox});
  node["changing_table"="yes"](${bbox});
  node["amenity"="fast_food"](${bbox});
  node["amenity"="restaurant"]["kids_area"="yes"](${bbox});
  node["amenity"="restaurant"]["highchair"="yes"](${bbox});
  node["amenity"="cafe"](${bbox});
  node["amenity"="ice_cream"](${bbox});
  node["shop"="mall"](${bbox});
  node["shop"="supermarket"]["changing_table"="yes"](${bbox});
);
out body center 80;`;

    case "zonas-calmas":
      return `[out:json][timeout:15];
(
  way["leisure"="park"](${bbox});
  relation["leisure"="park"](${bbox});
  node["leisure"="park"](${bbox});
  way["leisure"="garden"](${bbox});
  node["leisure"="garden"](${bbox});
  node["leisure"="nature_reserve"](${bbox});
  way["leisure"="nature_reserve"](${bbox});
  node["place"="square"](${bbox});
  node["amenity"="fountain"](${bbox});
  node["historic"="memorial"](${bbox});
  way["landuse"="grass"](${bbox});
  node["amenity"="bench"](${bbox});
);
out body center 80;`;

    case "ruido":
      // Ruído: do maior (estádio) ao menor (bar)
      return `[out:json][timeout:15];
(
  node["leisure"="stadium"](${bbox});
  way["leisure"="stadium"](${bbox});
  node["leisure"="music_venue"](${bbox});
  way["leisure"="music_venue"](${bbox});
  node["amenity"="music_venue"](${bbox});
  node["amenity"="nightclub"](${bbox});
  node["amenity"="theatre"](${bbox});
  way["amenity"="theatre"](${bbox});
  node["amenity"="cinema"](${bbox});
  node["amenity"="pub"](${bbox});
  node["amenity"="bar"](${bbox});
);
out body center 80;`;

    default:
      return "";
  }
}

// ─── Interpreta nome do elemento OSM ─────────────────────────────────────────
function getOsmLabel(el: any, filterKey: FilterKey): string {
  const tags = el.tags || {};
  if (tags.name) return tags.name;
  const sub = getSubtype(el);
  if (sub && SUBTYPE_VISUAL[sub]) return SUBTYPE_VISUAL[sub].label;
  return FILTER_CONFIG[filterKey].label;
}

function getOsmCoords(el: any): [number, number] | null {
  if (el.type === "node" && el.lat != null && el.lon != null) return [el.lat, el.lon];
  if (el.center) return [el.center.lat, el.center.lon];
  return null;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type OsmPoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  filterKey: FilterKey;
  subtype: string;
};

type RouteStep = {
  instruction: string;
  distance: string;
  maneuver?: string;
};

type Props = {
  event: EventItem;
  needs: Set<string>;
  onBack: () => void;
  onContinue: () => void;
  onSOS: () => void;
  externalFilters?: Set<FilterKey>;
  onFiltersChange?: (filters: Set<FilterKey>) => void;
  startGpsSignal?: number;
};

const osmDataCache = new Map<FilterKey, OsmPoint[]>();

export function SensoryMap({
  event,
  needs,
  onBack,
  onContinue,
  onSOS,
  externalFilters,
  onFiltersChange,
  startGpsSignal,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsMode, setGpsMode] = useState(false);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [osmLoading, setOsmLoading] = useState<Set<FilterKey>>(new Set());
  const [osmError, setOsmError] = useState<FilterKey | null>(null);

  const [internalFilters, setInternalFilters] = useState<Set<FilterKey>>(() => {
    const initial = new Set<FilterKey>();
    if (needs.has("wheel") || needs.has("hear") || needs.has("sight")) initial.add("acessivel");
    if (needs.has("family")) initial.add("familia");
    if (needs.has("calm")) initial.add("zonas-calmas");
    return initial;
  });

  const activeFilters = externalFilters !== undefined ? externalFilters : internalFilters;
  const setActiveFilters = (updater: ((prev: Set<FilterKey>) => Set<FilterKey>) | Set<FilterKey>) => {
    const next = typeof updater === "function" ? updater(activeFilters) : updater;
    setInternalFilters(next);
    onFiltersChange?.(next as Set<FilterKey>);
  };

  const destination = DESTINATIONS[event.id] ?? {
    label: event.location,
    lat: ARACAJU_CENTER[0],
    lng: ARACAJU_CENTER[1],
  };

  // ── Busca dados OSM ──────────────────────────────────────────────────────
  const fetchOsmData = useCallback(async (filterKey: FilterKey): Promise<OsmPoint[]> => {
    if (osmDataCache.has(filterKey)) return osmDataCache.get(filterKey)!;

    const query = buildOverpassQuery(filterKey);
    if (!query) return [];

    const OVERPASS_ENDPOINTS = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
      "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    ];

    let resp: Response | null = null;
    let lastError: Error | null = null;

    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        resp = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
          signal: AbortSignal.timeout(20000),
        });
        if (resp.ok) break;
      } catch (err: any) {
        lastError = err;
        resp = null;
      }
    }

    if (!resp || !resp.ok) throw lastError ?? new Error("Todos os servidores Overpass falharam");

    const data = await resp.json();
    const elements: any[] = data.elements || [];

    const points: OsmPoint[] = [];
    const seen = new Set<string>();

    for (const el of elements) {
      const coords = getOsmCoords(el);
      if (!coords) continue;

      const label = getOsmLabel(el, filterKey);
      const subtype = getSubtype(el);
      const key = `${coords[0].toFixed(5)},${coords[1].toFixed(5)}`;

      if (seen.has(key)) continue;
      seen.add(key);

      points.push({
        id: `${el.type}-${el.id}`,
        lat: coords[0],
        lng: coords[1],
        label,
        filterKey,
        subtype,
      });
    }

    osmDataCache.set(filterKey, points);
    return points;
  }, []);

  // ── Inicializa o mapa ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let mounted = true;

    import("leaflet").then((L) => {
      if (!mounted || !mapRef.current || mapInstanceRef.current) return;

      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      leafletRef.current = L;

      const map = L.map(mapRef.current!, {
        center: [destination.lat, destination.lng],
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      const destIcon = L.divIcon({
        html: `<div style="
          background: #1D9E75;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          width: 28px; height: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><span style="transform: rotate(45deg); font-size: 14px; display: block; text-align: center; line-height: 22px;">★</span></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        className: "",
      });

      const destMarker = L.marker([destination.lat, destination.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<strong>${event.name}</strong><br>${destination.label}`, { closeButton: false });

      markersRef.current.push(destMarker);
      setMapReady(true);
    });

    return () => { mounted = false; };
  }, []);

  // ── Atualiza marcadores OSM quando filtros mudam ───────────────────────────
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map || !mapReady) return;

    markersRef.current.slice(1).forEach((m) => map.removeLayer(m));
    markersRef.current = markersRef.current.slice(0, 1);

    if (activeFilters.size === 0) return;

    for (const filterKey of activeFilters) {
      if (osmDataCache.has(filterKey)) {
        renderOsmPoints(L, map, osmDataCache.get(filterKey)!, filterKey);
      } else {
        setOsmLoading((prev) => new Set([...prev, filterKey]));

        fetchOsmData(filterKey)
          .then((points) => {
            setOsmLoading((prev) => {
              const next = new Set(prev);
              next.delete(filterKey);
              return next;
            });

            setInternalFilters((currentFilters) => {
              const filtersToCheck = externalFilters !== undefined ? externalFilters : currentFilters;
              if (filtersToCheck.has(filterKey)) {
                const currentMap = mapInstanceRef.current;
                const currentL = leafletRef.current;
                if (currentL && currentMap) {
                  renderOsmPoints(currentL, currentMap, points, filterKey);
                }
              }
              return currentFilters;
            });
          })
          .catch(() => {
            setOsmLoading((prev) => {
              const next = new Set(prev);
              next.delete(filterKey);
              return next;
            });
            setOsmError(filterKey);
          });
      }
    }
  }, [[...activeFilters].sort().join(","), mapReady]);

  // ── renderOsmPoints: usa SUBTYPE_VISUAL para ícone/raio proporcional ──────
  function renderOsmPoints(L: any, map: any, points: OsmPoint[], filterKey: FilterKey) {
    for (const pt of points) {
      // Resolve visual pelo subtipo; cai no fallback do filtro se não reconhecido
      const visual = (pt.subtype && SUBTYPE_VISUAL[pt.subtype])
        ? SUBTYPE_VISUAL[pt.subtype]
        : FILTER_CONFIG[filterKey];

      const popupHtml = `
        <div style="font-family:system-ui;min-width:150px">
          <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:2px">${pt.label}</div>
          <div style="font-size:11px;color:#555">${visual.label} · OpenStreetMap</div>
        </div>`;

      // ── Filtra que têm ZONA (raio > 0) ────────────────────────────────────
      if (visual.radius > 0) {
        const isNoise = filterKey === "ruido";
        const isCalm  = filterKey === "zonas-calmas";
        const isApoio = filterKey === "apoio";

        if (isNoise) {
          // Ruído: 3 anéis concêntricos — intensidade proporcional ao raio
          const outerRing = L.circle([pt.lat, pt.lng], {
            radius: visual.radius * 1.8,
            color: visual.color, fillColor: visual.color,
            fillOpacity: 0.03, weight: 1, opacity: 0.15, dashArray: "6 4",
          }).addTo(map).bindPopup(popupHtml, { closeButton: false });

          const midRing = L.circle([pt.lat, pt.lng], {
            radius: visual.radius * 1.2,
            color: visual.color, fillColor: visual.color,
            fillOpacity: 0.07, weight: 1.5, opacity: 0.3, dashArray: "4 3",
          }).addTo(map);

          const core = L.circle([pt.lat, pt.lng], {
            radius: visual.radius,
            color: visual.color, fillColor: visual.color,
            fillOpacity: 0.15, weight: 2, opacity: 0.65,
          }).addTo(map);

          markersRef.current.push(outerRing, midRing, core);
        } else if (isCalm) {
          // Zonas calmas: contorno suave tracejado
          const zone = L.circle([pt.lat, pt.lng], {
            radius: visual.radius,
            color: visual.color, fillColor: visual.color,
            fillOpacity: 0.12, weight: 2, opacity: 0.45, dashArray: "5 3",
          }).addTo(map).bindPopup(popupHtml, { closeButton: false });
          markersRef.current.push(zone);
        } else if (isApoio && visual.radius >= 60) {
          // Apoio grande (hospital, bombeiros): halo urgente
          const zone = L.circle([pt.lat, pt.lng], {
            radius: visual.radius,
            color: visual.color, fillColor: visual.color,
            fillOpacity: 0.06, weight: 1.5, opacity: 0.35,
          }).addTo(map).bindPopup(popupHtml, { closeButton: false });
          markersRef.current.push(zone);
        } else {
          // Família e outros: zona suave
          const zone = L.circle([pt.lat, pt.lng], {
            radius: visual.radius,
            color: visual.color, fillColor: visual.color,
            fillOpacity: 0.12, weight: 1.5, opacity: 0.4, dashArray: "4 3",
          }).addTo(map).bindPopup(popupHtml, { closeButton: false });
          markersRef.current.push(zone);
        }
      }

      // ── Ícone central — tamanho proporcional ao subtipo ───────────────────
      const size = visual.iconSize;
      const half = Math.floor(size / 2);
      const pulse = (visual as any).pulse;

      const icon = L.divIcon({
        html: `<div style="
          position:relative;
          width:${size}px; height:${size}px;
          display:flex; align-items:center; justify-content:center;
        ">${pulse ? `<div style="
            position:absolute;
            width:${size}px; height:${size}px;
            border-radius:50%;
            background:${visual.color}22;
            animation:pulse-ring 2s ease-out infinite;
          "></div>` : ""}
          <div style="
            position:relative;
            background:${visual.bgColor};
            border:2.5px solid ${visual.color};
            border-radius:${filterKey === "acessivel" || filterKey === "infraestrutura" ? "6px" : "50%"};
            width:${size - 6}px; height:${size - 6}px;
            display:flex; align-items:center; justify-content:center;
            font-size:${Math.floor((size - 6) * 0.55)}px;
            box-shadow:0 2px 8px ${visual.color}44;
            line-height:1;
          ">${visual.icon}</div>
        </div>
        <style>
          @keyframes pulse-ring {
            0%{transform:scale(1);opacity:0.5}
            100%{transform:scale(2.4);opacity:0}
          }
        </style>`,
        iconSize: [size, size],
        iconAnchor: [half, half],
        className: "",
      });

      const marker = L.marker([pt.lat, pt.lng], { icon })
        .addTo(map).bindPopup(popupHtml, { closeButton: false });

      markersRef.current.push(marker);
    }
  }

  // ── GPS ───────────────────────────────────────────────────────────────────
  const getUserLocation = useCallback(() => {
    setGpsLoading(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError("GPS não disponível neste dispositivo.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(coords);
        setGpsLoading(false);

        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

        const userIcon = L.divIcon({
          html: `<div style="
            background: #1F5C8F;
            border: 3px solid white;
            border-radius: 50%;
            width: 20px; height: 20px;
            box-shadow: 0 0 0 6px rgba(31,92,143,0.25);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          className: "",
        });

        userMarkerRef.current = L.marker(coords, { icon: userIcon })
          .addTo(map).bindPopup("Você está aqui", { closeButton: false });

        const bounds = L.latLngBounds([coords, [destination.lat, destination.lng]]);
        map.fitBounds(bounds, { padding: [40, 40] });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) {
          setGpsError("Permissão de localização negada. Usando localização aproximada.");
          const fallback: [number, number] = ARACAJU_CENTER;
          setUserPos(fallback);

          const L = leafletRef.current;
          const map = mapInstanceRef.current;
          if (!L || !map) return;

          if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

          const userIcon = L.divIcon({
            html: `<div style="
              background: #888;
              border: 3px solid white;
              border-radius: 50%;
              width: 20px; height: 20px;
              box-shadow: 0 0 0 6px rgba(100,100,100,0.2);
            "></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            className: "",
          });

          userMarkerRef.current = L.marker(fallback, { icon: userIcon })
            .addTo(map).bindPopup("Localização aproximada — Centro de Aracaju", { closeButton: false });

          const bounds = L.latLngBounds([fallback, [destination.lat, destination.lng]]);
          map.fitBounds(bounds, { padding: [40, 40] });
        } else {
          setGpsError("Não foi possível obter sua localização. Tente novamente.");
        }
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  }, [destination]);

  // ── Rota OSRM ──────────────────────────────────────────────────────────────
  const fetchRoute = useCallback(
    async (from: [number, number]) => {
      setRouteLoading(true);
      setGpsError(null);

      const proxyUrl = `/api/route?fromLat=${from[0]}&fromLng=${from[1]}&toLat=${destination.lat}&toLng=${destination.lng}`;

      const parseFallbackText = (text: string) => {
        return text
          .split(/\r?\n/)
          .flatMap((line) => line.split(/(?<=\d[\.)])\s*/))
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => line.replace(/^\d+[\.]?\s*/, ""))
          .map((instruction) => ({ instruction, distance: "", maneuver: undefined }));
      };

      try {
        const resp = await fetch(proxyUrl);
        const data = await resp.json();

        if (resp.status !== 200 || data.code !== "Ok" || !data.routes?.length) {
          throw new Error("Rota não encontrada.");
        }

        const route = data.routes[0];
        const geometry = route.geometry;
        const legs = route.legs[0];

        const steps: RouteStep[] = legs.steps
          .filter((s: any) => s.maneuver.type !== "depart" || legs.steps.indexOf(s) === 0)
          .map((s: any) => ({
            instruction: translateOSRMInstruction(s),
            distance: formatDistance(s.distance),
            maneuver: s.maneuver.type,
          }))
          .filter((s: RouteStep) => s.instruction);

        setRouteSteps(steps);
        setCurrentStep(0);
        setGpsMode(true);

        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (!L || !map) return;

        if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);

        routeLayerRef.current = L.geoJSON(geometry, {
          style: {
            color: "#1D9E75",
            weight: 5,
            opacity: 0.85,
            lineCap: "round",
            lineJoin: "round",
          },
        }).addTo(map);

        const bounds = L.latLngBounds([from, [destination.lat, destination.lng]]);
        map.fitBounds(bounds, { padding: [40, 80] });
      } catch (err) {
        const transcript = `Gere instruções de caminhada em Aracaju do ponto (${from[0].toFixed(5)}, ${from[1].toFixed(5)}) até ${destination.label}. Liste passos curtos e numerados.`;
        try {
          const response = await fetch("/api/voice/route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript, context: {} }),
          });

          const voiceData = await response.json().catch(() => null);
          const message = typeof voiceData?.message === "string" ? voiceData.message : "";
          const fallbackSteps = parseFallbackText(message);

          if (fallbackSteps.length) {
            setRouteSteps(fallbackSteps);
            setCurrentStep(0);
            setGpsMode(true);
            setGpsError(null);
            return;
          }
        } catch {
          // continue to error fallback
        }

        setGpsError("Não foi possível calcular a rota. Verifique sua conexão.");
      } finally {
        setRouteLoading(false);
      }
    },
    [destination]
  );

  const prevGpsSignalRef = useRef(0);
  useEffect(() => {
    if (startGpsSignal && startGpsSignal !== prevGpsSignalRef.current) {
      prevGpsSignalRef.current = startGpsSignal;
      handleStartNavigation();
    }
  }, [startGpsSignal]);

  const handleStartNavigation = () => {
    if (userPos) fetchRoute(userPos);
    else getUserLocation();
  };

  const pendingNavRef = useRef(false);
  useEffect(() => {
    if (userPos && pendingNavRef.current) {
      pendingNavRef.current = false;
      fetchRoute(userPos);
    }
  }, [userPos, fetchRoute]);

  const handleMainButton = () => {
    if (gpsMode) {
      if (currentStep < routeSteps.length - 1) {
        setCurrentStep((s) => s + 1);
      } else {
        setGpsMode(false);
        onContinue();
      }
      return;
    }

    if (!userPos) {
      pendingNavRef.current = true;
      getUserLocation();
    } else {
      fetchRoute(userPos);
    }
  };

  const closeGps = () => {
    setGpsMode(false);
    setCurrentStep(0);
  };

  const toggleFilter = (key: FilterKey) => {
    if (osmError === key) setOsmError(null);
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const isOsmLoading = osmLoading.size > 0;
  const loadingFilterNames = [...osmLoading]
    .map((k) => FILTER_CONFIG[k]?.label)
    .filter(Boolean)
    .join(", ");

  const buttonLabel = useMemo(() => {
    if (routeLoading) return "Calculando rota...";
    if (gpsLoading) return "Localizando você...";
    if (gpsMode) return currentStep < routeSteps.length - 1 ? "Próximo passo →" : "Cheguei! 🎉";
    if (!userPos) return "📍 Localizar e traçar rota";
    return "🗺️ Ir para o evento";
  }, [gpsMode, gpsLoading, routeLoading, currentStep, routeSteps.length, userPos]);

  const alertMessage = useMemo(() => {
    if (gpsError) return { icon: "⚠️", text: gpsError, error: true };
    if (osmError) return { icon: "⚠️", text: `Falha ao carregar dados de "${FILTER_CONFIG[osmError]?.label}". Toque no filtro para tentar novamente.`, error: true };
    if (gpsLoading) return { icon: "📡", text: "Obtendo sua localização via GPS...", error: false };
    if (routeLoading) return { icon: "🗺️", text: "Calculando rota acessível via OpenStreetMap...", error: false };
    if (isOsmLoading) return { icon: "🔄", text: `Buscando dados reais: ${loadingFilterNames}...`, error: false };
    if (activeFilters.has("ruido")) return { icon: "🔇", text: "Zonas sonoras proporcionais ao tipo de local — estádios e shows têm raio maior.", error: false };
    if (activeFilters.has("apoio")) return { icon: "🆘", text: "🏥 Hospital  🚒 Bombeiros  🚔 Polícia  💊 Farmácia — ícones distintos para cada serviço.", error: false };
    if (activeFilters.has("familia")) return { icon: "👨‍👩‍👧", text: "Playgrounds, lanchonetes, cafés e shoppings com estrutura para crianças.", error: false };
    if (activeFilters.has("acessivel")) return { icon: "♿", text: "Pontos acessíveis reais (OpenStreetMap) exibidos no mapa.", error: false };
    if (activeFilters.has("infraestrutura")) return { icon: "🚻", text: "Banheiros públicos e bebedouros reais no mapa.", error: false };
    return { icon: "📍", text: `Destino: ${event.name} — ${destination.label}`, error: false };
  }, [activeFilters, gpsError, osmError, gpsLoading, routeLoading, isOsmLoading, loadingFilterNames, event.name, destination.label]);

  const step = gpsMode ? routeSteps[currentStep] : null;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Bandeirolas rows={1} />
      <Header title={event.name} subtitle={destination.label} onBack={onBack} />

      {/* Filtros */}
      <div className="px-4 pt-4">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilters.has(filter.key);
            const isLoading = osmLoading.has(filter.key);
            const hasError = osmError === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => toggleFilter(filter.key)}
                aria-pressed={isActive}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "bg-[#1D9E75] text-white"
                    : hasError
                    ? "border border-red-300 bg-red-50 text-red-700"
                    : "border border-border bg-card text-foreground hover:bg-secondary"
                }`}
              >
                <span aria-hidden="true">
                  {isLoading ? "⏳" : hasError ? "⚠️" : filter.icon}
                </span>
                {filter.label}
                {isActive && !isLoading && (
                  <span className="ml-0.5 text-[10px] font-bold opacity-70" aria-hidden="true">OSM</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Alerta */}
      <div className="px-4 pt-3">
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 rounded-xl px-4 py-3 ${
            alertMessage.error ? "bg-red-50" : isOsmLoading ? "bg-blue-50" : "bg-[#FAEEDA]"
          }`}
        >
          <IconAlertTriangle
            size={18}
            className={alertMessage.error ? "text-red-600" : isOsmLoading ? "text-blue-600" : "text-[#8A5A10]"}
            aria-hidden="true"
          />
          <p className={`flex-1 text-[13.5px] font-medium ${alertMessage.error ? "text-red-700" : isOsmLoading ? "text-blue-700" : "text-[#8A5A10]"}`}>
            {alertMessage.text}
          </p>
          {isOsmLoading && (
            <IconLoader2 size={16} className="text-blue-500 animate-spin shrink-0" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Mapa Leaflet */}
      <div className="relative mx-4 mt-4 flex-1 overflow-hidden rounded-2xl border border-border">
        <div ref={mapRef} style={{ height: "100%", minHeight: "280px", width: "100%" }} />

        {/* Botão centralizar */}
        <button
          type="button"
          onClick={() => {
            const map = mapInstanceRef.current;
            if (!map) return;
            if (userPos) {
              const L = leafletRef.current;
              const bounds = L.latLngBounds([userPos, [destination.lat, destination.lng]]);
              map.fitBounds(bounds, { padding: [40, 40] });
            } else {
              map.setView([destination.lat, destination.lng], 15);
            }
          }}
          className="absolute bottom-14 right-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md border border-border"
          aria-label="Centralizar mapa"
        >
          <IconCurrentLocation size={18} className="text-[#1D9E75]" />
        </button>

        {/* Botão legenda */}
        <button
          type="button"
          onClick={() => setLegendOpen((prev) => !prev)}
          className="absolute bottom-3 right-3 z-[1000] flex h-9 w-9 items-center justify-center rounded-full bg-card shadow-md border border-border"
          aria-label={legendOpen ? "Fechar legenda" : "Abrir legenda"}
          aria-expanded={legendOpen}
        >
          <IconInfoCircle size={18} className="text-muted-foreground" />
        </button>

        {legendOpen && (
          <div className="absolute bottom-14 right-3 z-[1000] rounded-2xl bg-card p-3 shadow-lg border border-border w-[240px]">
            <p className="mb-2 text-xs font-semibold text-foreground">Legenda — dados reais OSM</p>
            <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#1F5C8F]" /> Você (GPS)
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#1D9E75]" /> Evento / Destino
              </div>
              <div className="mt-1 pt-1 border-t border-border">
                <p className="text-[10px] font-semibold mb-1.5 text-foreground">Apoio / SOS</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className="flex items-center gap-1">🏥 Hospital</div>
                  <div className="flex items-center gap-1">🚒 Bombeiros</div>
                  <div className="flex items-center gap-1">🚔 Delegacia</div>
                  <div className="flex items-center gap-1">💊 Farmácia</div>
                  <div className="flex items-center gap-1">🩺 Clínica</div>
                  <div className="flex items-center gap-1">🩹 1º Socorros</div>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-border">
                <p className="text-[10px] font-semibold mb-1.5 text-foreground">Família</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className="flex items-center gap-1">🛝 Playground</div>
                  <div className="flex items-center gap-1">🍔 Lanchonete</div>
                  <div className="flex items-center gap-1">☕ Café</div>
                  <div className="flex items-center gap-1">🍦 Sorveteria</div>
                  <div className="flex items-center gap-1">🧷 Fraldário</div>
                  <div className="flex items-center gap-1">🏬 Shopping</div>
                </div>
              </div>
              <div className="mt-1 pt-1 border-t border-border flex flex-col gap-1.5">
                {FILTERS.filter(f => !["apoio","familia"].includes(f.key)).map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="text-[13px]">{f.icon}</span>
                    <span>{FILTER_CONFIG[f.key].label}</span>
                    {osmDataCache.has(f.key) && (
                      <span className="ml-auto text-[9px] text-green-600 font-bold">✓OSM</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-1 pt-1 border-t border-border">
                <span className="text-[10px] text-muted-foreground">Fonte: © OpenStreetMap contributors</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {(gpsLoading || routeLoading) && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <IconLoader2 size={32} className="text-[#1D9E75] animate-spin" />
              <p className="text-sm font-medium text-[#1D9E75]">
                {routeLoading ? "Calculando rota..." : "Localizando..."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Botões de ação */}
      <div className="px-4 pb-2 pt-4 flex gap-3">
        <button
          type="button"
          onClick={onSOS}
          className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[14px] border border-[#E74C3C] bg-[#FCEAE8] text-[15px] font-medium text-[#8B1A10] hover:bg-[#F9DAD6] transition-colors"
          aria-label="Pedir ajuda urgente"
        >
          <IconHeartOff size={18} stroke={2} aria-hidden="true" />
          Preciso de ajuda
        </button>
        <button
          type="button"
          onClick={handleMainButton}
          disabled={gpsLoading || routeLoading}
          className="flex h-[54px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-[#1D9E75] text-[15px] font-medium text-white hover:bg-[#178A65] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {(gpsLoading || routeLoading) && <IconLoader2 size={16} className="animate-spin" />}
          {buttonLabel}
        </button>
      </div>

      <ProgressDots current={1} total={4} />

      {/* Painel GPS com passos da rota */}
      {gpsMode && step && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          <div className="absolute inset-0 bg-black/20" onClick={closeGps} aria-hidden="true" />
          <div className="relative mx-4 mb-6 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
            <div className="flex h-1">
              {routeSteps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 transition-colors duration-300 ${
                    index <= currentStep ? "bg-[#1D9E75]" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <div className="p-5 safe-area-bottom">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E1F5EE]">
                    <ManeuverIcon type={step.maneuver} />
                  </div>
                  <div>
                    <p className="text-[28px] font-bold text-foreground leading-none">{step.distance}</p>
                    <p className="text-[13px] text-muted-foreground mt-0.5">
                      Passo {currentStep + 1} de {routeSteps.length}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeGps}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-secondary transition-colors"
                  aria-label="Fechar navegação"
                >
                  <IconX size={16} className="text-muted-foreground" />
                </button>
              </div>

              <p className="text-[17px] font-semibold text-foreground mb-3" aria-live="assertive">
                {step.instruction}
              </p>

              {activeFilters.has("acessivel") && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E1F5EE] px-3 py-1.5 text-[12px] font-medium text-[#0F6E56] mb-4">
                  ♿ Rota acessível via OSRM
                </span>
              )}

              <div className="flex items-center gap-2 mb-4">
                {routeSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? "h-2.5 w-2.5 bg-[#1D9E75]"
                        : index < currentStep
                        ? "h-2 w-2 bg-[#1D9E75]/40"
                        : "h-2 w-2 bg-muted"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleMainButton}
                className="w-full h-[50px] rounded-xl bg-[#1D9E75] text-[15px] font-medium text-white hover:bg-[#178A65] transition-colors"
              >
                {currentStep < routeSteps.length - 1 ? "Próximo passo →" : "Cheguei! 🎉"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function ManeuverIcon({ type }: { type?: string }) {
  const size = 28;
  const color = "#0F6E56";
  if (type === "turn-left") return <IconArrowLeft size={size} color={color} />;
  if (type === "turn-right") return <IconArrowRight size={size} color={color} />;
  if (type === "arrive") return <IconCheck size={size} color={color} />;
  return <IconArrowUp size={size} color={color} />;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function translateOSRMInstruction(step: any): string {
  const { maneuver, name, ref } = step;
  const road = name || ref || "a rua";
  const type = maneuver.type;
  const modifier = maneuver.modifier;

  if (type === "depart") return `Siga por ${road}`;
  if (type === "arrive") return `Você chegou ao destino: ${road || "destino"}`;
  if (type === "turn") {
    if (modifier === "left") return `Vire à esquerda em ${road}`;
    if (modifier === "right") return `Vire à direita em ${road}`;
    if (modifier === "slight left") return `Fique levemente à esquerda em ${road}`;
    if (modifier === "slight right") return `Fique levemente à direita em ${road}`;
    if (modifier === "sharp left") return `Vire bruscamente à esquerda em ${road}`;
    if (modifier === "sharp right") return `Vire bruscamente à direita em ${road}`;
    if (modifier === "uturn") return `Retorne em ${road}`;
    return `Vire em ${road}`;
  }
  if (type === "new name") return `Continue por ${road}`;
  if (type === "continue") return `Continue reto por ${road}`;
  if (type === "merge") return `Entre em ${road}`;
  if (type === "roundabout" || type === "rotary") return `Na rotatória, siga por ${road}`;
  if (type === "exit roundabout" || type === "exit rotary") return `Saia da rotatória em ${road}`;
  if (type === "fork") {
    if (modifier?.includes("left")) return `Mantenha-se à esquerda em ${road}`;
    if (modifier?.includes("right")) return `Mantenha-se à direita em ${road}`;
  }
  return `Siga em direção a ${road}`;
}
