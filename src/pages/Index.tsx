import { useState } from "react";
import { FloatingButton } from "@/components/ScreenMentor/FloatingButton";
import { MentorPanel } from "@/components/ScreenMentor/MentorPanel";
import { Bot, Monitor, Mic, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type PanelState = "closed" | "open" | "minimized";

const Index = () => {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Logout button */}
      <button
        onClick={signOut}
        className="absolute top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-xs font-medium transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        Cerrar sesión
      </button>
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero */}
      <div className="text-center max-w-xl z-10 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Demo MVP — Photoshop · Canva · Shapr3D
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
          Screen<span className="text-primary">Mentor</span> AI
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-md mx-auto">
          Tu mentor digital en tiempo real. Comparte pantalla, habla y recibe
          instrucciones paso a paso adaptadas a tu nivel.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {[
            { icon: Monitor, label: "Comparte pantalla" },
            { icon: Mic, label: "Consulta por voz" },
            { icon: Bot, label: "IA contextual" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/60 text-sm text-secondary-foreground"
            >
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => setPanelState("open")}
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all mentor-glow"
        >
          <Bot className="w-5 h-5" />
          Iniciar ScreenMentor
        </button>
      </div>

      {/* Floating restore button (visible when minimized) */}
      {panelState === "minimized" && (
        <FloatingButton onClick={() => setPanelState("open")} />
      )}

      {/* Floating copilot panel */}
      {panelState === "open" && (
        <MentorPanel
          onClose={() => setPanelState("closed")}
          onMinimize={() => setPanelState("minimized")}
        />
      )}
    </div>
  );
};

export default Index;
