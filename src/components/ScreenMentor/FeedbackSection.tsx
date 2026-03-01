import { useState } from "react";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const FeedbackSection = () => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Debes iniciar sesión para enviar tu opinión.", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Por favor selecciona una calificación.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-feedback", {
        body: { rating, comment: comment.trim().slice(0, 1000) },
      });

      if (error) throw error;

      setSent(true);
      setRating(0);
      setComment("");
      toast({ title: "Gracias por tu opinión. Tu comentario nos ayuda a mejorar." });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
      toast({ title: "Error al enviar tu opinión. Intenta de nuevo.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto py-10 px-6 text-center space-y-6">
      <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 sm:p-12 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          ¿Cómo fue tu experiencia con{" "}
          <span className="text-primary">ScreenMentor</span>?
        </h2>

        {/* Stars */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform duration-150 hover:scale-125 focus:outline-none"
              aria-label={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              <Star
                className={`w-9 h-9 transition-colors duration-200 ${
                  star <= (hoveredStar || rating)
                    ? "fill-primary text-primary"
                    : "text-muted-foreground/40"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Escribe aquí tu sugerencia o comentario…"
          maxLength={1000}
          rows={4}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={sending || rating === 0}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          {sending ? "Enviando…" : "Enviar opinión"}
        </button>

        {sent && (
          <p className="text-sm text-primary animate-fade-in">
            ✓ Gracias por tu opinión. Tu comentario nos ayuda a mejorar.
          </p>
        )}
      </div>
    </section>
  );
};
