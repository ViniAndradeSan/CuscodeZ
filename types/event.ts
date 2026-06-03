export type AccessibilityFeature =
  | "rampa"
  | "libras"
  | "audiodescrição"
  | "banheiro-adaptado"
  | "vaga-pcd"
  | "area-calma"
  | "guia-visual"
  | "kit-sensorial";

export type EventTipHour = {
  time: string;
  pct: number;
  tone: "calm" | "warn" | "alert";
  tag: string;
};

export type EventTipItem = {
  icon: string;
  text: string;
  badge: string;
  tone: "calm" | "warn" | "alert";
};

export type EventTip = {
  icon: string;
  title: string;
  subtitle: string;
  type: "chart" | "list";
  hours?: EventTipHour[];
  items?: EventTipItem[];
};

export type EventItem = {
  id: string;
  name: string;
  location: string;
  date: string;
  time: string;
  category: "forro" | "quadrilha" | "show" | "cultural" | "gastronomia";
  noiseLevel: "baixo" | "médio" | "alto";
  accessibility: AccessibilityFeature[];
  capacity: number;
  occupancyPct: number;
  description: string;
  tips: EventTip[];
};

export type MemoryEntry = {
  id: string;
  eventId: string;
  eventName: string;
  eventLocation: string;
  eventCategory: EventItem["category"];
  eventDate: string;
  visitedAt: string;
  needs: string[];
  accessibilityUsed: AccessibilityFeature[];
  noiseLevel: EventItem["noiseLevel"];
  usedSOS: boolean;
  routeCompleted: boolean;
};
