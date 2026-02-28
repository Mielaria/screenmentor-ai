import { useState, useEffect, useCallback } from "react";
import { SkipForward, RotateCcw, Square } from "lucide-react";

interface Props {
  steps: string[];
  isAnalyzing: boolean;
  isMuted: boolean;
}

export function ResponseArea({ steps, isAnalyzing, isMuted }: Props) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const speakStep = useCallback(
    (index: number) => {
      window.speechSynthesis.cancel();
      if (isMuted || !steps[index]) return;
      const utterance = new SpeechSynthesisUtterance(steps[index]);
      utterance.lang = "es-ES";
      utterance.rate = 1.05;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    [steps, isMuted]
  );

  // Reset and auto-read first step when new steps arrive
  useEffect(() => {
    if (steps.length > 0) {
      setCurrentStepIndex(0);
      speakStep(0);
    }
  }, [steps]); // intentionally not including speakStep to avoid re-trigger

  const handleNext = () => {
    const next = currentStepIndex + 1;
    if (next < steps.length) {
      setCurrentStepIndex(next);
      speakStep(next);
    }
  };

  const handleRepeat = () => {
    speakStep(currentStepIndex);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
  };

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

  const isLastStep = currentStepIndex >= steps.length - 1;

  return (
    <div className="space-y-3">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Instrucciones
      </span>

      {/* Step list */}
      <ol className="space-y-2 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
        {steps.map((step, i) => {
          const isActive = i === currentStepIndex;
          return (
            <li
              key={i}
              className={`flex gap-3 p-3 rounded-lg transition-colors duration-200 fade-in-up ${
                isActive
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary/40"
              }`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-sm leading-relaxed ${
                  isActive ? "text-foreground font-medium" : "text-foreground/70"
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNext}
          disabled={isLastStep}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipForward className="w-3.5 h-3.5" />
          Siguiente paso
        </button>
        <button
          onClick={handleRepeat}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Repetir
        </button>
        <button
          onClick={handleStop}
          className="flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
          Detener
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Paso {currentStepIndex + 1} de {steps.length}
      </p>
    </div>
  );
}
