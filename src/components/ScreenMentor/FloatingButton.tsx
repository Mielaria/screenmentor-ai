import { Bot } from "lucide-react";

interface Props {
  onClick: () => void;
}

export function FloatingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mentor-glow pulse-ring transition-transform hover:scale-105 active:scale-95"
      aria-label="Abrir ScreenMentor"
    >
      <Bot className="w-6 h-6" />
    </button>
  );
}
