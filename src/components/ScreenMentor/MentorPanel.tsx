import { useState, useEffect, useCallback, useRef } from "react";
import { X, Monitor, Mic, MicOff, Volume2, VolumeX, MonitorOff, Minus, GripHorizontal } from "lucide-react";
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
  onMinimize: () => void;
}

export function MentorPanel({ onClose, onMinimize }: Props) {
  const [software, setSoftware] = useState<Software | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Drag state
  const [position, setPosition] = useState({ x: window.innerWidth - 380, y: 60 });
  const [size, setSize] = useState({ w: 350, h: 520 });
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0, px: 0, py: 0 });

  const { isSharing, startSharing, stopSharing, captureSnapshot } = useScreenShare();
  const { isListening, transcript, startListening, stopListening, setTranscript } = useVoiceInput();

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = "none";
  }, [position]);

  // Resize handler
  const handleResizeDown = useCallback((e: React.MouseEvent, edge: string) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = edge;
    resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h, px: position.x, py: position.y };
    document.body.style.userSelect = "none";
  }, [size, position]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.w, e.clientX - dragOffset.current.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y));
        setPosition({ x: newX, y: newY });
      } else if (isResizing.current) {
        const dx = e.clientX - resizeStart.current.x;
        const dy = e.clientY - resizeStart.current.y;
        const edge = isResizing.current;
        let newW = resizeStart.current.w;
        let newH = resizeStart.current.h;
        let newX = resizeStart.current.px;
        let newY = resizeStart.current.py;

        if (edge.includes("r")) newW = Math.max(300, Math.min(600, resizeStart.current.w + dx));
        if (edge.includes("l")) {
          newW = Math.max(300, Math.min(600, resizeStart.current.w - dx));
          newX = resizeStart.current.px + (resizeStart.current.w - newW);
        }
        if (edge.includes("b")) newH = Math.max(350, Math.min(900, resizeStart.current.h + dy));
        if (edge.includes("t")) {
          newH = Math.max(350, Math.min(900, resizeStart.current.h - dy));
          newY = resizeStart.current.py + (resizeStart.current.h - newH);
        }

        setSize({ w: newW, h: newH });
        setPosition({ x: newX, y: newY });
      }
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      isResizing.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [size]);

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

        const resultSteps: string[] = data?.steps || ["No se generaron instrucciones."];
        setSteps(resultSteps);
      } catch (err: any) {
        console.error("Analysis error:", err);
        toast.error("Error al analizar. Intenta de nuevo.");
      } finally {
        setIsAnalyzing(false);
        setTranscript("");
      }
    },
    [software, level, isSharing, captureSnapshot, setTranscript]
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
    <div
      ref={dragRef}
      className="fixed z-50 flex flex-col rounded-2xl border border-border overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
        background: "hsl(var(--mentor-panel) / 0.95)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 8px 40px hsl(225 25% 0% / 0.6), 0 0 0 1px hsl(var(--border) / 0.4)",
      }}
    >
      {/* Resize handles */}
      <div onMouseDown={(e) => handleResizeDown(e, "r")} className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize z-10" />
      <div onMouseDown={(e) => handleResizeDown(e, "b")} className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-10" />
      <div onMouseDown={(e) => handleResizeDown(e, "l")} className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize z-10" />
      <div onMouseDown={(e) => handleResizeDown(e, "t")} className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize z-10" />
      <div onMouseDown={(e) => handleResizeDown(e, "br")} className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize z-20" />
      <div onMouseDown={(e) => handleResizeDown(e, "bl")} className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize z-20" />
      <div onMouseDown={(e) => handleResizeDown(e, "tr")} className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize z-20" />
      <div onMouseDown={(e) => handleResizeDown(e, "tl")} className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize z-20" />
      {/* Title bar — draggable */}
      <div
        onMouseDown={handleMouseDown}
        className="flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none border-b border-border/60"
        style={{ background: "hsl(var(--mentor-surface) / 0.8)" }}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-muted-foreground/50" />
          <div className="w-2 h-2 rounded-full bg-primary mentor-glow-sm" />
          <span className="text-xs font-semibold text-foreground tracking-tight">
            ScreenMentor
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-destructive/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* Screen share */}
        <button
          onClick={isSharing ? stopSharing : startSharing}
          className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 border ${
            isSharing
              ? "bg-primary/10 border-primary text-primary"
              : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
          }`}
        >
          {isSharing ? (
            <>
              <MonitorOff className="w-3.5 h-3.5" /> Dejar de compartir
            </>
          ) : (
            <>
              <Monitor className="w-3.5 h-3.5" /> Compartir pantalla
            </>
          )}
        </button>

        <SoftwareSelector selected={software} onSelect={setSoftware} />
        <LevelSelector selected={level} onSelect={setLevel} />

        <ResponseArea steps={steps} isAnalyzing={isAnalyzing} isMuted={isMuted} />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border/60 flex items-center gap-2">
        <button
          onClick={handleMicToggle}
          disabled={!canQuery || isAnalyzing}
          className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
            isListening
              ? "bg-destructive text-destructive-foreground pulse-ring"
              : "bg-primary text-primary-foreground hover:brightness-110"
          }`}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" /> Escuchando…
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5" /> Consultar
            </>
          )}
        </button>

        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted) window.speechSynthesis.cancel();
          }}
          className="p-2.5 rounded-lg bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
