export type Artist = {
  name: string;
  role: string; // ex: "Vocalista", "Sanfoneiro", "Mestre de quadrilha"
  bio: string;  // 2-3 frases sobre a história do artista
  origin: string; // cidade/estado de origem
  highlight: string; // um fato marcante ou conquista
};

export type Venue = {
  name: string;
  history: string; // 2-3 frases sobre a história do local
  neighborhood: string;
  yearFounded?: number;
  culturalNote: string; // curiosidade cultural ou importância para a região
};

export type CulturalData = {
  eventId: string;
  story: string; // parágrafo editorial sobre o evento em si (3-4 frases)
  artists: Artist[];
  venue: Venue;
  funFacts: string[]; // 2-3 curiosidades rápidas sobre o evento ou tradição
};
