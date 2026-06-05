"use client";

import { useEffect, useRef } from "react";
import { IconCheck, IconMapPin, IconArrowRight } from "@tabler/icons-react";
import type { EventItem } from "@/types/event";

type Props = {
  event: EventItem;
  onContinue: () => void;
  onBack: () => void;
};

export function ArrivalConfirmation({ event, onContinue, onBack }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Foco automático e bloqueio de scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      modalRef.current?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
      {/* Backdrop com blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onBack}
        aria-hidden="true"
      />

      {/* Modal de confirmação */}
      <div
        ref={modalRef}
        className="relative z-10 w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="arrival-title"
        tabIndex={-1}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onBack();
          }
        }}
      >
        {/* Header com ícone de sucesso */}
        <div className="bg-linear-to-r from-[#0F6E56] to-[#1D9E75] px-6 pt-8 pb-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <IconCheck size={40} stroke={2} className="text-white" />
            </div>
          </div>
          <h2 id="arrival-title" className="text-2xl font-bold text-white leading-tight">
            Você chegou!
          </h2>
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6 text-center">
          {/* Informação do evento */}
          <div className="mb-6 rounded-2xl bg-[#E1F5EE] p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <IconMapPin size={18} stroke={2} className="text-[#0F6E56]" />
              <span className="text-sm font-medium text-[#0F6E56]">Evento selecionado</span>
            </div>
            <p className="text-lg font-semibold text-foreground">
              {event.name}
            </p>
            {event.location && (
              <p className="mt-2 text-sm text-muted-foreground">
                {event.location}
              </p>
            )}
          </div>

          {/* Mensagem */}
          <p className="text-[15px] text-muted-foreground mb-6">
            Agora conheça melhor o que acontece aqui. Explore as atrações, artistas e dicas culturais.
          </p>

          {/* Botões */}
          <div className="flex gap-3 flex-col">
            <button
              onClick={onContinue}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#1D9E75] text-[15px] font-medium text-white hover:bg-[#178A65] transition-colors"
            >
              Ver guia cultural
              <IconArrowRight size={18} stroke={2} />
            </button>
            <button
              onClick={onBack}
              className="flex h-11 w-full items-center justify-center rounded-[12px] text-[14px] font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Voltar ao mapa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
