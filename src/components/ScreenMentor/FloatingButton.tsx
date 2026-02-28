import { Bot } from "lucide-react";

interface Props {
  onClick: () => void;
}

export function FloatingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mentor-glow pulse-ring transition-transform hover:scale-110 active:scale-95 shadow-lg"
      aria-label="Abrir ScreenMentor"
    >
      <Bot className="w-5 h-5" />
    </button>
  );
}
