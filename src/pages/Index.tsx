import { useState, useEffect } from "react";
import { FloatingButton } from "@/components/ScreenMentor/FloatingButton";
import { MentorPanel } from "@/components/ScreenMentor/MentorPanel";
import { Bot, Monitor, Mic, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { FeedbackSection } from "@/components/ScreenMentor/FeedbackSection";

type PanelState = "closed" | "open" | "minimized";

const Index = () => {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const { signOut, user } = useAuth();
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    if (!user) { setFullName(""); return; }
    supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.full_name) setFullName(data.full_name);
      });
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 relative overflow-x-hidden">
      {/* Logout button */}
      <button
        onClick={signOut}
        className="absolute top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary text-xs font-medium transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        Cerrar sesión
      </button>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-screen relative">
        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="text-center max-w-xl z-10 space-y-6">
          {fullName && (
            <p className="text-lg sm:text-xl font-medium text-foreground animate-fade-in">
              Hola, <span className="text-primary">{fullName}</span>. ¿En qué te puedo ayudar hoy?
            </p>
          )}

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
      </div>

      {/* Feedback section */}
      <div className="-mt-24">
        <FeedbackSection />
      </div>

      {/* Info section */}
      <section className="w-full max-w-3xl mx-auto py-4 px-6 text-center space-y-6">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 sm:p-12 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            ¿Para quién es <span className="text-primary">ScreenMentor</span>?
          </h2>

          <div className="space-y-4 text-muted-foreground text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            <p>
              ScreenMentor está diseñado para acompañar a personas que quieren aprender a usar herramientas digitales de forma clara, guiada y sin frustración.
            </p>
            <p>
              Está pensado especialmente para jóvenes que están dando sus primeros pasos en el mundo de la tecnología y desean aprender a manejar programas como Photoshop, Canva o herramientas de diseño 3D con mayor confianza.
            </p>
            <p>
              También está dirigido a adultos que desean mejorar sus habilidades digitales pero encuentran complejos algunos programas o procesos técnicos. ScreenMentor ofrece explicaciones paso a paso, adaptadas al nivel de cada persona, para que cualquier usuario pueda avanzar sin sentirse perdido.
            </p>
            <p className="text-foreground font-medium pt-2">
              Nuestro objetivo es hacer que la tecnología sea más accesible, más humana y más fácil de entender para todos.
            </p>
          </div>
        </div>
      </section>

      {/* Floating restore button */}
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
