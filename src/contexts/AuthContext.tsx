import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type UserRole = "patient" | "admin";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signInAsAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = async (userId: string): Promise<UserRole> => {
    try {
      console.log("Fetching role for user:", userId);
      
      // Add a timeout so this never hangs
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
        setTimeout(() => resolve({ data: null, error: { message: "Role fetch timed out after 5s" } }), 5000);
      });
      
      // Fetch ALL roles for the user (they may have both 'patient' and 'admin')
      const queryPromise = supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
      
      console.log("Role query result:", { data, error });
      
      if (error) {
        console.warn("Error fetching role (defaulting to patient):", error);
        return "patient";
      }
      
      // If user has an 'admin' role, they're an admin (admin takes priority)
      const roles = Array.isArray(data) ? data.map((r: { role: string }) => r.role) : [];
      const role: UserRole = roles.includes("admin") ? "admin" : "patient";
      console.log("User role:", role, "(all roles:", roles, ")");
      return role;
    } catch (err) {
      console.error("Error fetching role:", err);
      return "patient";
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
        }
        
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const userRole = await fetchRole(session.user.id);
            setRole(userRole);
          } else {
            setRole(null);
          }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err instanceof Error ? err.message : "Auth initialization failed");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const userRole = await fetchRole(session.user.id);
            setRole(userRole);
          } else {
            setRole(null);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("signIn called with:", email);
      
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      console.log("Full signInWithPassword result:", JSON.stringify(result, null, 2));
      
      if (result.error) {
        console.error("Supabase signIn error:", result.error.message);
        return { error: result.error.message };
      }
      
      // Manually update state after successful login
      if (result.data.session && result.data.user) {
        console.log("Sign in successful, updating state:", result.data.user.email);
        setSession(result.data.session);
        setUser(result.data.user);
        
        // Fetch and set role
        const userRole = await fetchRole(result.data.user.id);
        setRole(userRole);
        setLoading(false);
      }
      
      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "SignIn failed";
      console.error("SignIn caught exception:", errorMsg);
      return { error: errorMsg };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error?.message || null };
  };

  const signInAsAdmin = async (email: string, password: string) => {
    try {
      // First, try to sign in
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) return { error: result.error.message };

      if (!result.data.session?.user) return { error: "Failed to retrieve session" };

      // Use the same fetchRole function that already works
      const userRole = await fetchRole(result.data.session.user.id);
      console.log("signInAsAdmin - fetched role:", userRole);

      if (userRole !== "admin") {
        // Not an admin, sign them out immediately
        await supabase.auth.signOut();
        return { error: "Access denied. This account does not have admin privileges." };
      }

      // Manually update state after successful admin login
      console.log("Admin sign in successful:", result.data.user?.email);
      setSession(result.data.session);
      setUser(result.data.user);
      setRole("admin");
      setLoading(false);

      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Admin sign in failed";
      console.error("Admin SignIn exception:", errorMsg);
      return { error: errorMsg };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signIn, signUp, signInAsAdmin, signOut, isAdmin: role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
