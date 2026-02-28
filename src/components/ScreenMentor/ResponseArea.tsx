interface Props {
  steps: string[];
  isAnalyzing: boolean;
}

export function ResponseArea({ steps, isAnalyzing }: Props) {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-3">
        <div className="flex space-x-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary analyzing-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground analyzing-pulse">
          Analizando pantalla…
        </p>
      </div>
    );
  }

  if (steps.length === 0) return null;

  return (
    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Instrucciones
      </span>
      <ol className="space-y-2">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex gap-3 p-3 rounded-lg bg-secondary/40 fade-in-up"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-foreground/90">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
