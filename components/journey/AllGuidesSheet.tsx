"use client";

import { useEffect, useCallback } from "react";
import {
  IconBooks,
  IconX,
  IconChevronRight,
  IconMusic,
  IconUsers,
  IconMicrophone2,
  IconPalette,
  IconToolsKitchen2,
  IconMapPin,
  IconCalendar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_COLORS } from "@/lib/events";
import type { EventItem } from "@/types/event";

type Props = {
  events: EventItem[];
  onClose: () => void;
  onSelectGuide: (event: EventItem) => void;
};

const CATEGORY_ICONS: Record<string, typeof IconMusic> = {
  forro: IconMusic,
  quadrilha: IconUsers,
  show: IconMicrophone2,
  cultural: IconPalette,
  gastronomia: IconToolsKitchen2,
};

export function AllGuidesSheet({ events, onClose, onSelectGuide }: Props) {
  // Fechar com Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // Travar scroll do body
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guides-sheet-title"
        className="relative z-10 w-full max-h-[85dvh] bg-[#FFF8EE] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 ease-out"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E8D5B5]" />
        </div>

        {/* Header */}
        <div className="px-5 pb-4 pt-2 border-b border-[#E8D5B5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D1810] flex items-center justify-center">
                <IconBooks size={20} className="text-[#FDF6E3]" aria-hidden="true" />
              </div>
              <div>
                <h2
                  id="guides-sheet-title"
                  className="font-serif text-lg text-[#2D1810] font-medium"
                >
                  Guias Culturais
                </h2>
                <p className="text-xs text-[#5C4033]">
                  Forro Caju 2024 &middot; {events.length} eventos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8D5B5]/50 transition-colors"
              aria-label="Fechar"
            >
              <IconX size={20} className="text-[#5C4033]" />
            </button>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <ul className="divide-y divide-[#E8D5B5]">
            {events.map((event) => {
              const CategoryIcon = CATEGORY_ICONS[event.category] || IconMusic;
              const iconColor = CATEGORY_ICON_COLORS[event.category] || "#D85A30";

              return (
                <li key={event.id}>
                  <button
                    onClick={() => onSelectGuide(event)}
                    className="w-full min-h-[72px] px-5 py-4 flex items-center gap-4 hover:bg-[#FDF6E3] active:bg-[#E8D5B5]/30 transition-colors text-left"
                  >
                    {/* Icone da categoria */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${iconColor}15` }}
                    >
                      <CategoryIcon
                        size={20}
                        style={{ color: iconColor }}
                        aria-hidden="true"
                      />
                    </div>

                    {/* Info do evento */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2D1810] truncate">
                        {event.name}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-[#5C4033]">
                          <IconMapPin size={12} aria-hidden="true" />
                          <span className="truncate max-w-[120px]">{event.location}</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-[#5C4033]">
                          <IconCalendar size={12} aria-hidden="true" />
                          {event.date} &middot; {event.time}
                        </span>
                      </div>
                    </div>

                    {/* Chevron */}
                    <IconChevronRight
                      size={18}
                      className="text-[#5C4033]/50 shrink-0"
                      aria-hidden="true"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Safe area bottom */}
        <div className="h-6 bg-[#FFF8EE]" />
      </div>
    </div>
  );
}
