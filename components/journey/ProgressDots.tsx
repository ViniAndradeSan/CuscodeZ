type Props = { current?: number; currentStep?: number; total?: number; totalSteps?: number };

export function ProgressDots({ current, currentStep, total, totalSteps }: Props) {
  const step = currentStep ?? current ?? 1;
  const steps = totalSteps ?? total ?? 5;
  
  return (
    <div
      className="flex items-center justify-center gap-2 py-5 safe-area-bottom"
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
  );
}
