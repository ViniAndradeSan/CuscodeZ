"use client";

import {
  IconMapPin,
  IconSparkles,
  IconMusic,
  IconUsers,
  IconBuildingCommunity,
  IconCalendar,
  IconChevronLeft,
  IconHome,
  IconMicrophone2,
  IconPalette,
  IconToolsKitchen2,
  IconBuilding,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Header } from "./Header";
import { ProgressDots } from "./ProgressDots";
import { Bandeirolas } from "./Bandeirolas";
import { getCulturalData } from "@/lib/culturalData";
import type { EventItem } from "@/types/event";
import type { Artist, Venue, CulturalData } from "@/types/cultural";

type Props = {
  event: EventItem;
  onBack: () => void;
  onRestart: () => void;
};

// Cores por categoria
const CATEGORY_COLORS: Record<string, { bg: string; text: string; bgSoft: string }> = {
  forro: { bg: "bg-[#D85A30]", text: "text-white", bgSoft: "bg-[#D85A30]/10" },
  quadrilha: { bg: "bg-[#8B5CF6]", text: "text-white", bgSoft: "bg-[#8B5CF6]/10" },
  show: { bg: "bg-[#0F6E56]", text: "text-white", bgSoft: "bg-[#0F6E56]/10" },
  cultural: { bg: "bg-[#1F5C8F]", text: "text-white", bgSoft: "bg-[#1F5C8F]/10" },
  gastronomia: { bg: "bg-[#92400E]", text: "text-white", bgSoft: "bg-[#92400E]/10" },
};

// Labels das categorias
const CATEGORY_LABELS: Record<string, string> = {
  forro: "Forró",
  quadrilha: "Quadrilha",
  show: "Show",
  cultural: "Cultural",
  gastronomia: "Gastronomia",
};

// Ícones por categoria
const CATEGORY_ICONS: Record<string, typeof IconMusic> = {
  forro: IconMusic,
  quadrilha: IconUsers,
  show: IconMicrophone2,
  cultural: IconPalette,
  gastronomia: IconToolsKitchen2,
};

export function CulturalGuide({ event, onBack, onRestart }: Props) {
  const culturalData = getCulturalData(event.id);
  const categoryColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.forro;
  const CategoryIcon = CATEGORY_ICONS[event.category] || IconMusic;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Bandeirolas rows={2} />
      <Header
        title="Guia Cultural"
        subtitle={event.name}
        onBack={onBack}
      />

      <main className="flex-1 overflow-y-auto pb-4">
        {/* 1. Hero do evento */}
        <section aria-labelledby="hero-title" className="px-5 pt-4">
          <div
            className={cn(
              "relative rounded-2xl p-6 overflow-hidden",
              categoryColor.bg
            )}
          >
            {/* Padrão decorativo xadrez sutil */}
            <div className="absolute inset-0 xadrez-texture opacity-30" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Ícone da categoria */}
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
                <CategoryIcon size={32} className={categoryColor.text} strokeWidth={1.5} />
              </div>

              {/* Nome do evento */}
              <h2
                id="hero-title"
                className={cn(
                  "font-serif text-2xl font-medium leading-tight text-balance",
                  categoryColor.text
                )}
              >
                {event.name}
              </h2>

              {/* Chips de data e local */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white/90">
                  <IconCalendar size={14} aria-hidden="true" />
                  {event.date} às {event.time}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white/90">
                  <IconMapPin size={14} aria-hidden="true" />
                  {event.location}
                </span>
              </div>

              {/* Badge de categoria */}
              <span className="mt-3 inline-flex rounded-full bg-white/25 px-3 py-1 text-xs font-medium text-white">
                {CATEGORY_LABELS[event.category]}
              </span>
            </div>
          </div>

          {/* Story editorial */}
          {culturalData?.story && (
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              {culturalData.story}
            </p>
          )}
        </section>

        {/* 2. Seção "O local" */}
        {culturalData?.venue && (
          <VenueSection venue={culturalData.venue} categoryColor={categoryColor} />
        )}

        {/* 3. Seção "Quem se apresenta" */}
        <ArtistsSection
          artists={culturalData?.artists || []}
          categoryColor={categoryColor}
        />

        {/* 4. Seção "Você sabia?" */}
        {culturalData?.funFacts && culturalData.funFacts.length > 0 && (
          <FunFactsSection funFacts={culturalData.funFacts} />
        )}

        {/* 5. Rodapé de ação */}
        <div className="mt-8 px-5 pb-2">
          <button
            onClick={onRestart}
            className="flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#1D9E75] text-[15px] font-medium text-white transition-colors hover:bg-[#178A65]"
            aria-label="Planejar nova visita"
          >
            <IconHome size={18} strokeWidth={2} aria-hidden="true" />
            Planejar nova visita
          </button>
          <button
            onClick={onBack}
            className="mt-2 flex h-[48px] w-full items-center justify-center gap-1.5 rounded-[14px] text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Voltar para a etapa anterior"
          >
            <IconChevronLeft size={16} aria-hidden="true" />
            Voltar
          </button>
        </div>
      </main>

      <ProgressDots current={3} total={4} />
    </div>
  );
}

// ===== Seção do Local =====
function VenueSection({
  venue,
  categoryColor,
}: {
  venue: Venue;
  categoryColor: { bg: string; text: string; bgSoft: string };
}) {
  return (
    <section aria-labelledby="venue-title" className="mt-8 px-5">
      <h2
        id="venue-title"
        className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground"
      >
        <IconBuilding size={20} className="text-[#D85A30]" aria-hidden="true" />
        O local
      </h2>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              categoryColor.bgSoft
            )}
          >
            <IconMapPin size={20} className="text-[#D85A30]" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">{venue.name}</h3>
            <p className="text-sm text-muted-foreground">
              {venue.neighborhood}
              {venue.yearFounded && ` · Desde ${venue.yearFounded}`}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            {venue.history}
          </p>
          <div className={cn("rounded-lg p-3", categoryColor.bgSoft)}>
            <p className="text-[13px] leading-relaxed text-foreground">
              <span className="font-medium">Curiosidade:</span> {venue.culturalNote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== Seção dos Artistas =====
function ArtistsSection({
  artists,
  categoryColor,
}: {
  artists: Artist[];
  categoryColor: { bg: string; text: string; bgSoft: string };
}) {
  return (
    <section aria-labelledby="artists-title" className="mt-8 px-5">
      <h2
        id="artists-title"
        className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground"
      >
        <IconMicrophone2 size={20} className="text-[#D85A30]" aria-hidden="true" />
        Quem se apresenta
      </h2>

      {artists.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <IconUsers size={24} className="text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">
            As atrações deste evento ainda serão anunciadas. Fique de olho nas
            atualizações!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {artists.map((artist, index) => (
            <ArtistCard
              key={`${artist.name}-${index}`}
              artist={artist}
              categoryColor={categoryColor}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ===== Card de Artista =====
function ArtistCard({
  artist,
  categoryColor,
}: {
  artist: Artist;
  categoryColor: { bg: string; text: string; bgSoft: string };
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-foreground">{artist.name}</h3>
          <span
            className={cn(
              "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
              categoryColor.bg,
              categoryColor.text
            )}
          >
            {artist.role}
          </span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{artist.origin}</span>
      </div>

      <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
        {artist.bio}
      </p>

      {/* Destaque */}
      <div
        className={cn(
          "mt-3 flex items-start gap-2 rounded-lg p-3",
          categoryColor.bgSoft
        )}
      >
        <IconSparkles
          size={16}
          className="mt-0.5 shrink-0 text-[#D85A30]"
          aria-hidden="true"
        />
        <p className="text-[13px] leading-snug text-foreground">{artist.highlight}</p>
      </div>
    </article>
  );
}

// ===== Seção "Você sabia?" =====
function FunFactsSection({ funFacts }: { funFacts: string[] }) {
  return (
    <section aria-labelledby="funfacts-title" className="mt-8 px-5">
      <h2
        id="funfacts-title"
        className="mb-3 flex items-center gap-2 text-lg font-medium text-foreground"
      >
        <IconSparkles size={20} className="text-[#D85A30]" aria-hidden="true" />
        Você sabia?
      </h2>

      {/* Lista vertical em mobile */}
      <div className="space-y-3">
        {funFacts.map((fact, index) => (
          <div
            key={index}
            className="flex gap-3 rounded-xl border border-border bg-muted p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#D85A30]/10 font-serif text-lg font-semibold text-[#D85A30]">
              {String(index + 1).padStart(2, "0")}
            </span>
            <p className="flex-1 text-[14px] leading-relaxed text-foreground">
              {fact}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
