import { cn } from "@/lib/utils";

type Level = "Basico" | "Intermedio" | "Avanzado";

const levels: { id: Level; label: string; emoji: string; cssVar: string }[] = [
  { id: "Basico", label: "Básico", emoji: "🔵", cssVar: "--mentor-level-basic" },
  { id: "Intermedio", label: "Intermedio", emoji: "🟡", cssVar: "--mentor-level-intermediate" },
  { id: "Avanzado", label: "Avanzado", emoji: "🔴", cssVar: "--mentor-level-advanced" },
];

interface Props {
  selected: Level | null;
  onSelect: (l: Level) => void;
}

export function LevelSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Nivel
      </span>
      <div className="grid grid-cols-3 gap-2">
        {levels.map((level) => {
          const isActive = selected === level.id;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(level.id)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 border",
                isActive
                  ? "border-current"
                  : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `hsl(var(${level.cssVar}) / 0.12)`,
                      borderColor: `hsl(var(${level.cssVar}))`,
                      color: `hsl(var(${level.cssVar}))`,
                    }
                  : undefined
              }
            >
              <span className="mr-1">{level.emoji}</span>
              {level.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
