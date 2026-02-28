import { useState, useEffect, useCallback } from "react";
import { X, Monitor, Mic, MicOff, Volume2, VolumeX, MonitorOff } from "lucide-react";
import { SoftwareSelector } from "./SoftwareSelector";
import { LevelSelector } from "./LevelSelector";
import { ResponseArea } from "./ResponseArea";
import { useScreenShare } from "@/hooks/useScreenShare";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Software = "Photoshop" | "Canva" | "Shapr3D";
type Level = "Basico" | "Intermedio" | "Avanzado";

interface Props {
  onClose: () => void;
}

export function MentorPanel({ onClose }: Props) {
  const [software, setSoftware] = useState<Software | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const { isSharing, startSharing, stopSharing, captureSnapshot } = useScreenShare();
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();
  const { speak, stop: stopTTS } = useTTS();

  // When transcript is ready, trigger analysis
  useEffect(() => {
    if (transcript && !isAnalyzing) {
      handleAnalyze(transcript);
    }
  }, [transcript]);

  const handleAnalyze = useCallback(
    async (text: string) => {
      if (!software || !level) {
        toast.error("Selecciona software y nivel antes de consultar.");
        return;
      }

      setIsAnalyzing(true);
      setSteps([]);

      try {
        let image_base64: string | null = null;
        if (isSharing) {
          image_base64 = await captureSnapshot();
        }

        const { data, error } = await supabase.functions.invoke("analyze-screen", {
          body: {
            image_base64,
            texto_transcrito: text,
            nivel_usuario: level,
            software_seleccionado: software,
          },
        });

        if (error) throw error;

        if (data?.error) {
          toast.error(data.error);
          setIsAnalyzing(false);
          return;
        }

        setSteps(resultSteps);
      } catch (err: any) {
        console.error("Analysis error:", err);
        toast.error("Error al analizar. Intenta de nuevo.");
      } finally {
        setIsAnalyzing(false);
        setTranscript("");
      }
    },
    [software, level, isSharing, captureSnapshot, isMuted, speak, stopTTS, setTranscript]
  );

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const canQuery = !!software && !!level;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-mentor-panel border-l border-border mentor-panel-shadow slide-in-right z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary mentor-glow-sm" />
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            ScreenMentor AI
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Screen share */}
        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pantalla
          </span>
          <button
            onClick={isSharing ? stopSharing : startSharing}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 border ${
              isSharing
                ? "bg-primary/10 border-primary text-primary"
                : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {isSharing ? (
              <>
                <MonitorOff className="w-4 h-4" /> Dejar de compartir
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" /> Compartir pantalla
              </>
            )}
          </button>
        </div>

        <SoftwareSelector selected={software} onSelect={setSoftware} />
        <LevelSelector selected={level} onSelect={setLevel} />

        {/* Response */}
        <ResponseArea steps={steps} isAnalyzing={isAnalyzing} />
      </div>

      {/* Footer actions */}
      <div className="p-4 border-t border-border flex items-center gap-3">
        {/* Mic */}
        <button
          onClick={handleMicToggle}
          disabled={!canQuery || isAnalyzing}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? "bg-destructive text-destructive-foreground pulse-ring"
              : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-4 h-4" /> Escuchando…
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" /> Consultar
            </>
          )}
        </button>

        {/* Mute TTS */}
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted) stopTTS();
          }}
          className="p-3 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
