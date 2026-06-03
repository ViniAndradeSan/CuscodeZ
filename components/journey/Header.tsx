import { IconArrowLeft } from "@tabler/icons-react";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function Header({ title, subtitle, onBack }: Props) {
  return (
    <header className="px-5 pt-6 safe-area-top">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Voltar"
          className="mb-5 flex h-[38px] w-[38px] items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted"
        >
          <IconArrowLeft size={18} stroke={1.75} />
        </button>
      )}
      <h1 className="text-[26px] font-medium leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-1 text-[14px] text-muted-foreground">{subtitle}</p>
      )}
    </header>
  );
}
