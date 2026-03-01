import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";

type View = "welcome" | "login" | "register";

export default function Auth() {
  const [view, setView] = useState<View>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Debes verificar tu correo electrónico antes de iniciar sesión.");
      } else {
        setError("Credenciales inválidas. Verifica tu correo y contraseña.");
      }
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setInfo("Cuenta creada. Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.");
    }
    setLoading(false);
  };

  if (view === "welcome") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="text-center max-w-md z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Tu copiloto inteligente
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            Screen<span className="text-primary">Mentor</span> AI
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Asistencia en tiempo real mientras trabajas en Photoshop, Canva o Shapr3D.
          </p>
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={() => setView("login")}
              className="w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all mentor-glow"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setView("register")}
              className="w-full px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors border border-border"
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLogin = view === "login";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-sm z-10 space-y-6">
        <button
          onClick={() => { setView("welcome"); setError(""); setInfo(""); }}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </button>

        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isLogin ? "Accede a tu copiloto inteligente." : "Regístrate para comenzar a usar ScreenMentor."}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Nombre completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/60 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Correo electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/60 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-secondary/60 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {info && (
            <p className="text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLogin ? "Ingresar" : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => { setView(isLogin ? "register" : "login"); setError(""); setInfo(""); }}
            className="text-primary hover:underline"
          >
            {isLogin ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
