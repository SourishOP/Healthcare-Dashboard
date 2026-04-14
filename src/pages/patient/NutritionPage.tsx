import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Apple, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface NutritionLog {
  id: string;
  meal_type: string;
  food_items: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  recorded_at: string;
}

export default function NutritionPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ meal_type: "breakfast", food_items: "", calories: "", protein: "", carbs: "", fat: "" });

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("nutrition_logs").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(30);
    setLogs((data as NutritionLog[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.food_items) return;
    const { error } = await supabase.from("nutrition_logs").insert({
      user_id: user.id,
      meal_type: form.meal_type,
      food_items: form.food_items,
      calories: form.calories ? parseFloat(form.calories) : null,
      protein: form.protein ? parseFloat(form.protein) : null,
      carbs: form.carbs ? parseFloat(form.carbs) : null,
      fat: form.fat ? parseFloat(form.fat) : null,
    });
    if (error) { toast.error("Failed to log meal"); return; }
    toast.success("Meal logged!");
    setForm({ meal_type: "breakfast", food_items: "", calories: "", protein: "", carbs: "", fat: "" });
    setOpen(false);
    fetchLogs();
  };

  const todayLogs = logs.filter((l) => new Date(l.recorded_at).toDateString() === new Date().toDateString());
  const totalCalories = todayLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const totalProtein = todayLogs.reduce((s, l) => s + (l.protein || 0), 0);
  const totalCarbs = todayLogs.reduce((s, l) => s + (l.carbs || 0), 0);
  const totalFat = todayLogs.reduce((s, l) => s + (l.fat || 0), 0);

  const macroData = [
    { name: "Protein", value: totalProtein, fill: "#14b8a6" },
    { name: "Carbs", value: totalCarbs, fill: "#f59e0b" },
    { name: "Fat", value: totalFat, fill: "#ef4444" },
  ];

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nutrition</h1>
          <p className="text-muted-foreground">Track your daily meals and macros</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Log Meal</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-foreground">Log Meal</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <Label className="text-foreground">Meal Type</Label>
                <Select value={form.meal_type} onValueChange={(v) => setForm({ ...form, meal_type: v })}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-foreground">Food Items</Label><Input value={form.food_items} onChange={(e) => setForm({ ...form, food_items: e.target.value })} className="bg-muted border-border" required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-foreground">Calories</Label><Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="bg-muted border-border" /></div>
                <div><Label className="text-foreground">Protein (g)</Label><Input type="number" value={form.protein} onChange={(e) => setForm({ ...form, protein: e.target.value })} className="bg-muted border-border" /></div>
                <div><Label className="text-foreground">Carbs (g)</Label><Input type="number" value={form.carbs} onChange={(e) => setForm({ ...form, carbs: e.target.value })} className="bg-muted border-border" /></div>
                <div><Label className="text-foreground">Fat (g)</Label><Input type="number" value={form.fat} onChange={(e) => setForm({ ...form, fat: e.target.value })} className="bg-muted border-border" /></div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Log Meal</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Calories", value: totalCalories, unit: "kcal" },
          { label: "Protein", value: `${totalProtein}g` },
          { label: "Carbs", value: `${totalCarbs}g` },
          { label: "Fat", value: `${totalFat}g` },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold text-foreground">{s.value}{s.unit ? ` ${s.unit}` : ""}</p>
          </div>
        ))}
      </div>

      {macroData.some((d) => d.value > 0) && (
        <div className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Today's Macros</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={macroData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent logs */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Meals</h3>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No meals logged yet</p>
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{log.meal_type}: {log.food_items}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.recorded_at).toLocaleString()}</p>
                </div>
                <span className="text-sm text-muted-foreground">{log.calories ? `${log.calories} kcal` : ""}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
