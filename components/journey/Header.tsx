import { IconArrowLeft } from "@tabler/icons-react";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function Header({ title, subtitle, onBack }: Props) {
  return (
    <header className="px-4 sm:px-5 pt-4 sm:pt-6 safe-area-top">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="mb-4 sm:mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted active:scale-95"
        >
          <IconArrowLeft size={18} stroke={1.75} />
        </button>
      )}
      <h1 className="text-[22px] sm:text-[26px] font-medium leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-[13px] sm:text-[14px] text-muted-foreground line-clamp-2">
          {subtitle}
        </p>
      )}
    </header>
  );
}
