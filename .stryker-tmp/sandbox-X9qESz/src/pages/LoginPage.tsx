// @ts-nocheck
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Loader2, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);

    try {
      console.log("Attempting login with:", email);
      const { error } = await signIn(email, password);

      if (error) {
        console.error("Login error:", error);
        toast.error("Login failed: " + error);
        setLoading(false);
        return;
      }

      console.log("Login successful! Navigating...");
      toast.success("Welcome back!");
      // Navigate based on role — admins go to /admin, patients go to /dashboard
      navigate("/", { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Login exception:", errorMsg, err);
      toast.error("Login error: " + errorMsg);
      setLoading(false);
    }
  };

  if (!authLoading && user && role) {
    return <Navigate to={role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Heart className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-foreground">VitalSync</h1>
          <p className="mt-2 text-muted-foreground">Patient Portal — Track your health</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <UserRound className="h-3.5 w-3.5 text-primary" />
            Patient portal — track your vitals, medications & health
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-muted border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-muted border-border" />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </motion.form>

        <div className="space-y-2 text-center text-sm text-muted-foreground">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Sign up</Link>
          </p>
          <p>
            Are you an admin?{" "}
            <Link to="/admin-login" className="text-destructive hover:underline">Admin Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
