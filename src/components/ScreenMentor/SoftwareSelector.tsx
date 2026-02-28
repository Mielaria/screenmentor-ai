import { cn } from "@/lib/utils";

type Software = "Photoshop" | "Canva" | "Shapr3D";

const items: { id: Software; label: string; colorClass: string }[] = [
  { id: "Photoshop", label: "Photoshop", colorClass: "mentor-photoshop" },
  { id: "Canva", label: "Canva", colorClass: "mentor-canva" },
  { id: "Shapr3D", label: "Shapr3D", colorClass: "mentor-shapr3d" },
];

interface Props {
  selected: Software | null;
  onSelect: (s: Software) => void;
}

export function SoftwareSelector({ selected, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Software
      </span>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const isActive = selected === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 border",
                isActive
                  ? `bg-${item.colorClass}/15 border-${item.colorClass} text-${item.colorClass}`
                  : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
              style={
                isActive
                  ? {
                      backgroundColor: `hsl(var(--${item.colorClass.replace("mentor-", "mentor-")}) / 0.12)`,
                      borderColor: `hsl(var(--${item.colorClass.replace("mentor-", "mentor-")}))`,
                      color: `hsl(var(--${item.colorClass.replace("mentor-", "mentor-")}))`,
                    }
                  : undefined
              }
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
