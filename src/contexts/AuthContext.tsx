import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const TAB_SESSION_KEY = "screenmentor_tab_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tab-scoped session: if no sessionStorage flag exists, this is a new tab → sign out
    const tabFlag = sessionStorage.getItem(TAB_SESSION_KEY);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          sessionStorage.setItem(TAB_SESSION_KEY, "active");
        } else {
          sessionStorage.removeItem(TAB_SESSION_KEY);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession && !tabFlag) {
        // Session exists in localStorage but this is a fresh tab → invalidate
        supabase.auth.signOut().then(() => {
          setSession(null);
          setLoading(false);
        });
      } else {
        setSession(currentSession);
        if (currentSession) {
          sessionStorage.setItem(TAB_SESSION_KEY, "active");
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem(TAB_SESSION_KEY);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
