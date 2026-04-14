import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Plus, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FitnessLog {
  id: string;
  exercise_type: string;
  duration_minutes: number | null;
  calories_burned: number | null;
  intensity: string | null;
  notes: string | null;
  recorded_at: string;
}

export default function FitnessPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ exercise_type: "", duration: "", calories: "", intensity: "moderate" });

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("fitness_logs").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(30);
    setLogs((data as FitnessLog[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.exercise_type) return;
    const { error } = await supabase.from("fitness_logs").insert({
      user_id: user.id,
      exercise_type: form.exercise_type,
      duration_minutes: form.duration ? parseFloat(form.duration) : null,
      calories_burned: form.calories ? parseFloat(form.calories) : null,
      intensity: form.intensity,
    });
    if (error) { toast.error("Failed to log exercise"); return; }
    toast.success("Exercise logged!");
    setForm({ exercise_type: "", duration: "", calories: "", intensity: "moderate" });
    setOpen(false);
    fetchLogs();
  };

  const weekLogs = logs.filter((l) => {
    const d = new Date(l.recorded_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });
  const totalMinutes = weekLogs.reduce((s, l) => s + (l.duration_minutes || 0), 0);
  const totalCalBurned = weekLogs.reduce((s, l) => s + (l.calories_burned || 0), 0);
  const totalWorkouts = weekLogs.length;

  const chartData = logs.slice(0, 7).reverse().map((l) => ({
    date: new Date(l.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    minutes: l.duration_minutes || 0,
    calories: l.calories_burned || 0,
  }));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fitness</h1>
          <p className="text-muted-foreground">Track your workouts and activities</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Log Exercise</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-foreground">Log Exercise</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label className="text-foreground">Exercise Type</Label><Input value={form.exercise_type} onChange={(e) => setForm({ ...form, exercise_type: e.target.value })} className="bg-muted border-border" placeholder="e.g., Running, Swimming" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-foreground">Duration (min)</Label><Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="bg-muted border-border" /></div>
                <div><Label className="text-foreground">Calories Burned</Label><Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="bg-muted border-border" /></div>
              </div>
              <div>
                <Label className="text-foreground">Intensity</Label>
                <Select value={form.intensity} onValueChange={(v) => setForm({ ...form, intensity: v })}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Log Exercise</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
          <Heart className="mx-auto h-5 w-5 text-destructive mb-1" />
          <p className="text-xs text-muted-foreground">Workouts</p>
          <p className="text-xl font-bold text-foreground">{totalWorkouts}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
          <Clock className="mx-auto h-5 w-5 text-info mb-1" />
          <p className="text-xs text-muted-foreground">Minutes</p>
          <p className="text-xl font-bold text-foreground">{totalMinutes}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
          <Flame className="mx-auto h-5 w-5 text-warning mb-1" />
          <p className="text-xs text-muted-foreground">Calories</p>
          <p className="text-xl font-bold text-foreground">{totalCalBurned}</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Bar dataKey="minutes" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Exercises</h3>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No exercises logged yet</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{log.exercise_type}</p>
                  <p className="text-xs text-muted-foreground">{log.duration_minutes}min • {log.intensity} • {new Date(log.recorded_at).toLocaleDateString()}</p>
                </div>
                {log.calories_burned && <span className="text-sm text-warning">{log.calories_burned} kcal</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
