import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Moon, Plus, Star } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SleepLog {
  id: string;
  duration_hours: number;
  quality: number | null;
  bed_time: string | null;
  wake_time: string | null;
  notes: string | null;
  recorded_at: string;
}

export default function SleepPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<SleepLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ duration: "", quality: "3", notes: "" });

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("sleep_logs").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(30);
    setLogs((data as SleepLog[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.duration) return;
    const { error } = await supabase.from("sleep_logs").insert({
      user_id: user.id,
      duration_hours: parseFloat(form.duration),
      quality: parseInt(form.quality),
      notes: form.notes || null,
    });
    if (error) { toast.error("Failed to log sleep"); return; }
    toast.success("Sleep logged!");
    setForm({ duration: "", quality: "3", notes: "" });
    setOpen(false);
    fetchLogs();
  };

  const avgDuration = logs.length ? (logs.reduce((s, l) => s + l.duration_hours, 0) / logs.length).toFixed(1) : "—";
  const avgQuality = logs.length ? (logs.reduce((s, l) => s + (l.quality || 0), 0) / logs.length).toFixed(1) : "—";

  const chartData = logs.slice(0, 7).reverse().map((l) => ({
    date: new Date(l.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    hours: l.duration_hours,
    quality: l.quality || 0,
  }));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sleep</h1>
          <p className="text-muted-foreground">Track your sleep patterns</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Log Sleep</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-foreground">Log Sleep</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label className="text-foreground">Duration (hours)</Label><Input type="number" step="0.5" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="bg-muted border-border" required /></div>
              <div>
                <Label className="text-foreground">Quality (1-5)</Label>
                <Select value={form.quality} onValueChange={(v) => setForm({ ...form, quality: v })}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((q) => (<SelectItem key={q} value={q.toString()}>{q} - {["Poor", "Fair", "Good", "Very Good", "Excellent"][q - 1]}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-foreground">Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-muted border-border" rows={2} /></div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Log Sleep</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card p-5 text-center shadow-card">
          <Moon className="mx-auto h-6 w-6 text-info mb-2" />
          <p className="text-xs text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold text-foreground">{avgDuration}h</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 text-center shadow-card">
          <Star className="mx-auto h-6 w-6 text-warning mb-2" />
          <p className="text-xs text-muted-foreground">Avg Quality</p>
          <p className="text-2xl font-bold text-foreground">{avgQuality}/5</p>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Sleep Duration (Last 7)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Bar dataKey="hours" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Logs</h3>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sleep data yet</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{log.duration_hours}h sleep</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.recorded_at).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < (log.quality || 0) ? "text-warning fill-warning" : "text-muted-foreground"}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
