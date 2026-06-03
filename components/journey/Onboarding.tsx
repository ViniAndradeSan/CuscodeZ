"use client";

import { useState } from "react";
import {
  IconArrowRight,
  IconArrowLeft,
  IconLeaf,
  IconWheelchair,
  IconEarOff,
  IconEyeOff,
  IconBabyCarriage,
  IconMapPin,
  IconCheck,
} from "@tabler/icons-react";
import { ProgressDots } from "./ProgressDots";
import { Bandeirolas } from "./Bandeirolas";
import type { EventItem } from "@/types/event";

type Need = {
  id: string;
  label: string;
  Icon: React.ComponentType<{ size?: number; stroke?: number }>;
  bg: string;
  fg: string;
};

const NEEDS: Need[] = [
  { id: "calm", label: "Caminho calmo", Icon: IconLeaf, bg: "#E1F5EE", fg: "#0F6E56" },
  { id: "wheel", label: "Cadeira de rodas", Icon: IconWheelchair, bg: "#E6F0F8", fg: "#1F5C8F" },
  { id: "hear", label: "Def. auditiva", Icon: IconEarOff, bg: "#FAEEDA", fg: "#8A5A10" },
  { id: "sight", label: "Def. visual", Icon: IconEyeOff, bg: "#EFEAF8", fg: "#5C44A3" },
  { id: "family", label: "Com criança ou idoso", Icon: IconBabyCarriage, bg: "#FAECE7", fg: "#8A3A18" },
  { id: "tourist", label: "Sou turista", Icon: IconMapPin, bg: "#F0F1EF", fg: "#4B5563" },
];

type Props = {
  event: EventItem;
  onContinue: (selected: Set<string>) => void;
  onBack: () => void;
};

function Sanfona() {
  const bars = [
    { h: 36, op: 0.28, delay: "0s" },
    { h: 48, op: 0.35, delay: "0.15s" },
    { h: 28, op: 0.22, delay: "0.3s" },
    { h: 44, op: 0.32, delay: "0.45s" },
    { h: 20, op: 0.18, delay: "0.6s" },
  ];
  const width = 56;
  const height = 56;
  const barW = 8;
  const gap = 3;
  const totalW = bars.length * barW + (bars.length - 1) * gap;
  const startX = (width - totalW) / 2;
  const baseY = height - 6;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {bars.map((b, i) => {
        const x = startX + i * (barW + gap);
        const y = baseY - b.h;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={b.h}
            rx={3}
            fill="#D85A30"
            opacity={b.op}
            className="sanfona-bar"
            style={{ animationDelay: b.delay, transformBox: "fill-box", transformOrigin: "bottom" }}
          />
        );
      })}
      <line
        x1={startX - 2}
        y1={baseY + 1}
        x2={startX + totalW + 2}
        y2={baseY + 1}
        stroke="#D85A30"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Onboarding({ event, onContinue, onBack }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canContinue = selected.size > 0;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Bandeirolas rows={2} />

      {/* Hero */}
      <div className="hero-bg relative overflow-hidden px-5 pt-6 pb-10">
        <div className="xadrez-texture absolute inset-0 pointer-events-none" aria-hidden="true" />
        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border hover:bg-muted transition-colors"
              aria-label="Voltar para busca de eventos"
            >
              <IconArrowLeft size={18} className="text-foreground" />
            </button>
            <div className="badge-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium">
              <span
                className="pulse-dot inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#D85A30" }}
                aria-hidden="true"
              />
              <span>{event.location}</span>
            </div>
          </div>
          <div className="-mt-1">
            <Sanfona />
          </div>
        </div>

        <div className="relative pt-6">
          <h1
            className="hero-title text-[32px] leading-[1.1] tracking-tight font-serif"
          >
            Como posso{" "}
            <em
              className="not-italic"
              style={{ fontStyle: "italic", color: "#D85A30" }}
            >
              te ajudar
            </em>{" "}
            hoje?
          </h1>
          <p className="mt-3 text-[14.5px] leading-relaxed text-muted-foreground">
            Personalize sua experiência para o <strong className="text-foreground">{event.name}</strong>.
          </p>
        </div>
      </div>

      {/* Options */}
      <main className="flex-1 px-5 py-6">
        <ul role="list" className="grid grid-cols-2 gap-3">
          {NEEDS.map(({ id, label, Icon, bg, fg }) => {
            const active = selected.has(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(id)}
                  className={
                    "relative flex w-full flex-col items-start gap-3 rounded-2xl border-[0.5px] p-4 text-left transition " +
                    (active
                      ? "border-[#D85A30] bg-[#FDF6F3]"
                      : "border-border bg-card hover:bg-muted/50")
                  }
                >
                  <span
                    className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px]"
                    style={{ backgroundColor: bg, color: fg }}
                    aria-hidden="true"
                  >
                    <Icon size={22} stroke={1.75} />
                  </span>
                  <span className="text-[14px] font-medium leading-snug text-foreground">
                    {label}
                  </span>
                  {active && (
                    <span
                      className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: "#D85A30" }}
                      aria-hidden="true"
                    >
                      <IconCheck size={12} stroke={3} className="text-white" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </main>

      {/* CTA */}
      <div className="px-5 pt-2 pb-2">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => onContinue(selected)}
          className={
            "flex h-[54px] w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-medium transition " +
            (canContinue
              ? "bg-[#D85A30] text-white hover:bg-[#C04A20]"
              : "bg-muted text-muted-foreground cursor-not-allowed")
          }
        >
          Continuar
          <IconArrowRight size={18} stroke={2} />
        </button>
      </div>

      <ProgressDots current={2} />
    </div>
  );
}
