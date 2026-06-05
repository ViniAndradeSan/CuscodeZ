"use client";

import { IconAlertCircle } from "@tabler/icons-react";

type Props = {
  onClick: () => void;
  compact?: boolean;
};

export function SOSButton({ onClick, compact }: Props) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        aria-label="Abrir rota de apoio - SOS"
        title="Abrir rota de apoio"
        className={`
          fixed bottom-6 right-6 z-40
          flex h-12 w-12 items-center justify-center
          rounded-full bg-red-600/80 hover:bg-red-600 active:bg-red-700
          text-white shadow-md hover:shadow-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
        `}
      >
        <IconAlertCircle size={20} stroke={2} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      aria-label="Abrir rota de apoio - SOS"
      title="Abrir rota de apoio"
      className={`
        fixed bottom-6 right-6 z-40
        flex h-16 w-16 items-center justify-center
        rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800
        text-white shadow-lg hover:shadow-xl
        transition-all duration-200
        font-medium text-[13px]
        flex-col gap-1
        focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
      `}
    >
      <IconAlertCircle size={24} stroke={2} />
      <span className="text-[10px] leading-none">SOS</span>
    </button>
  );
}
