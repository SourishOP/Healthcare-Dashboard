import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Lock, Eye, EyeOff, Activity, Users, Database, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const floatingIcons = [
  { Icon: Shield, x: "10%", y: "15%", delay: 0 },
  { Icon: Database, x: "85%", y: "20%", delay: 0.5 },
  { Icon: Users, x: "15%", y: "75%", delay: 1 },
  { Icon: Activity, x: "80%", y: "80%", delay: 1.5 },
  { Icon: Lock, x: "50%", y: "8%", delay: 0.3 },
  { Icon: Fingerprint, x: "90%", y: "50%", delay: 0.8 },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInAsAdmin, user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);

    try {
      console.log("Attempting admin login with:", email);
      const { error } = await signInAsAdmin(email, password);

      if (error) {
        console.error("Admin login error:", error);
        toast.error(error);
        setLoading(false);
        return;
      }

      console.log("Admin login successful! Navigating to admin panel...");
      toast.success("Welcome, Admin!");
      // Navigate immediately after successful login
      navigate("/admin", { replace: true });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Admin login exception:", errorMsg, err);
      toast.error("Login error: " + errorMsg);
      setLoading(false);
    }
  };

  if (!authLoading && user && role) {
    if (role !== "admin") {
      toast.error("Access denied. This portal is for administrators only.");
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{ background: "linear-gradient(135deg, hsl(222 47% 4%), hsl(0 30% 8%), hsl(222 47% 6%))" }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(0 72% 51%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 72% 51%) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Floating icons */}
      {floatingIcons.map(({ Icon, x, y, delay }, i) => (
        <motion.div
          key={i}
          className="absolute text-destructive/10"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{ delay, duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          <Icon className="h-8 w-8" />
        </motion.div>
      ))}

      {/* Glowing orbs */}
      <motion.div
        className="absolute h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, hsl(0 72% 51% / 0.15), transparent)" }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full blur-[100px]"
        style={{ background: "radial-gradient(circle, hsl(0 50% 30% / 0.1), transparent)", right: "10%", top: "20%" }}
        animate={{ x: [0, -40, 0], y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/30 shadow-[0_0_40px_hsl(0_72%_51%/0.3)]"
            style={{ background: "linear-gradient(135deg, hsl(0 72% 35%), hsl(0 72% 51%))" }}
          >
            <Shield className="h-8 w-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-3xl font-extrabold tracking-tight"
            style={{ background: "linear-gradient(135deg, hsl(0 72% 65%), hsl(0 50% 80%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Admin Control Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            Authorized personnel only • Full system access
          </motion.p>
        </div>

        {/* Login card */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-destructive/20 p-7 shadow-[0_8px_40px_hsl(0_72%_51%/0.1)]"
          style={{ background: "linear-gradient(145deg, hsl(222 47% 10% / 0.95), hsl(222 47% 7% / 0.95))", backdropFilter: "blur(20px)" }}
        >
          {/* Security badge */}
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <Lock className="h-4 w-4 text-destructive" />
            <span className="text-xs font-medium text-destructive/80">Secure admin authentication • All actions are logged</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email" className="text-sm font-medium text-foreground">
              Admin Email
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@vitalsync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/50 border-border/50 focus:border-destructive focus:ring-destructive/30"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/50 border-border/50 pr-10 focus:border-destructive focus:ring-destructive/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-semibold shadow-[0_4px_20px_hsl(0_72%_51%/0.3)] transition-all hover:shadow-[0_4px_30px_hsl(0_72%_51%/0.5)]"
            style={{ background: "linear-gradient(135deg, hsl(0 72% 40%), hsl(0 72% 51%))" }}
            disabled={loading}
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
            Access Admin Panel
          </Button>
        </motion.form>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center"
        >
          <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Patient Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
