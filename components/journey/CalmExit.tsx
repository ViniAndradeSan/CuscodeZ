"use client";

import {
  IconHeartHandshake,
  IconWheelchair,
  IconFirstAidKit,
  IconNavigation,
} from "@tabler/icons-react";
import { Header } from "./Header";
import { ProgressDots } from "./ProgressDots";
import { Bandeirolas } from "./Bandeirolas";

type Props = { onBack: () => void; onContinue: () => void };

function Step({
  n,
  title,
  body,
  badge,
  last,
}: {
  n: number;
  title: string;
  body: string;
  badge?: { icon: React.ReactNode; text: string };
  last?: boolean;
}) {
  return (
    <li className={"flex gap-3 sm:gap-4 py-4 sm:py-5 " + (last ? "" : "border-b-[0.5px] border-border")}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E1F5EE] text-[13px] font-semibold text-[#0F6E56]">
        {n}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] sm:text-[15px] font-medium text-foreground">{title}</p>
        <p className="mt-1 text-[13px] sm:text-[13.5px] leading-snug text-muted-foreground">{body}</p>
        {badge && (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#E1F5EE] px-2.5 py-1 text-[11px] sm:text-[11.5px] font-medium text-[#0F6E56]">
            <span aria-hidden="true">{badge.icon}</span>
            {badge.text}
          </span>
        )}
      </div>
    </li>
  );
}

export function CalmExit({ onBack, onContinue }: Props) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Bandeirolas rows={1} />
      <Header title="Sair com calma" subtitle="Rota de apoio ativada" onBack={onBack} />

      <main className="flex-1 px-4 sm:px-5 overflow-y-auto">
        <div className="flex flex-col items-center pt-6 sm:pt-8 pb-2 text-center">
          <span
            className="flex h-16 w-16 sm:h-[72px] sm:w-[72px] items-center justify-center rounded-full bg-[#E1F5EE]"
            aria-hidden="true"
          >
            <IconHeartHandshake size={32} stroke={1.75} className="text-[#0F6E56]" />
          </span>
          <h2
            id="calm-exit-title"
            className="mt-5 text-[22px] font-semibold leading-tight text-[#2D1810]"
          >
            Tudo bem. Você não está sozinho.
          </h2>
          <p className="mt-2 max-w-[300px] text-[14px] text-muted-foreground">
            Encontramos o caminho mais curto e tranquilo até um ponto de apoio. Siga no seu ritmo.
          </p>
        </div>

        <ol role="list" className="mt-6">
          <Step
            n={1}
            title="Respire. Sem pressa."
            body="Você tem tempo. A rota está traçada e não passa por áreas lotadas."
          />
          <Step
            n={2}
            title="Vire a esquerda na saída B"
            body="Caminho plano, sem escadas, boa iluminação. Cerca de 180 metros."
            badge={{ icon: <IconWheelchair size={13} stroke={2} />, text: "Totalmente acessível" }}
          />
          <Step
            n={3}
            title="Ponto de apoio — tenda verde"
            body="Equipe de saúde, água, cadeiras, ambiente silencioso. Aberto até meia-noite."
            badge={{ icon: <IconFirstAidKit size={13} stroke={2} />, text: "Equipe de apoio presente" }}
            last
          />
        </ol>
      </main>

      <div className="px-4 sm:px-5 pt-4 pb-2 safe-area-bottom">
        <button
          onClick={onContinue}
          className="flex h-[52px] sm:h-[54px] w-full items-center justify-center gap-2 rounded-[14px] bg-[#1D9E75] text-[14px] sm:text-[15px] font-medium text-white hover:bg-[#178A65] active:scale-[0.98] transition-all"
        >
          <IconNavigation size={18} stroke={2} />
          Iniciar rota de apoio
        </button>
        <button
          onClick={onBack}
          className="mt-2 flex h-[44px] sm:h-[48px] w-full items-center justify-center rounded-[14px] text-[13px] sm:text-[14px] font-medium text-muted-foreground hover:bg-muted active:scale-[0.98] transition-all"
        >
          Voltar ao mapa
        </button>
      </div>
    </div>
  );
}
