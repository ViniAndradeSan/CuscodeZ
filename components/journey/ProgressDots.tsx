type Props = { 
  current?: number; 
  currentStep?: number; 
  total?: number; 
  totalSteps?: number;
  showLabels?: boolean;
};

const STEP_LABELS = [
  { label: "Descobrir", description: "Encontrar eventos" },
  { label: "Planejar", description: "Explorar rotas" },
  { label: "Aproveitar", description: "Guia cultural" },
];

export function ProgressDots({ current, currentStep, total, totalSteps, showLabels }: Props) {
  const step = currentStep ?? current ?? 1;
  const steps = totalSteps ?? total ?? 3;
  
  return (
    <div className="flex flex-col items-center gap-4 py-5 safe-area-bottom">
      {/* Indicadores visuais */}
      <div
        className="flex items-center justify-center gap-2"
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={0}
        aria-valuemax={steps}
        aria-label={`Etapa ${step} de ${steps}`}
      >
        {Array.from({ length: steps }).map((_, i) => {
          const active = i === step;
          const done = i < step;
          if (active) {
            return (
              <span
                key={i}
                className="rounded-full"
                style={{ width: 22, height: 5, backgroundColor: "#D85A30" }}
              />
            );
          }
          if (done) {
            return (
              <span
                key={i}
                className="rounded-full"
                style={{ width: 5, height: 5, backgroundColor: "#D85A30", opacity: 0.6 }}
              />
            );
          }
          return (
            <span
              key={i}
              className="rounded-full"
              style={{ width: 5, height: 5, backgroundColor: "#EDD8C8" }}
            />
          );
        })}
      </div>

      {/* Labels semânticos (opcional) */}
      {showLabels && step <= steps && (
        <div className="text-center">
          <p className="text-[13px] font-medium text-foreground">
            {STEP_LABELS[step - 1]?.label}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {STEP_LABELS[step - 1]?.description}
          </p>
        </div>
      )}
    </div>
  );
}
