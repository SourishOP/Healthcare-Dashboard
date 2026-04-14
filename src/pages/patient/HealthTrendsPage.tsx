import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";

const logTypes = [
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", color: "#ef4444" },
  { value: "glucose", label: "Blood Glucose", unit: "mg/dL", color: "#f59e0b" },
  { value: "weight", label: "Weight", unit: "kg", color: "#22c55e" },
  { value: "temperature", label: "Temperature", unit: "°F", color: "#14b8a6" },
  { value: "oxygen_saturation", label: "SpO₂", unit: "%", color: "#8b5cf6" },
  { value: "respiratory_rate", label: "Resp Rate", unit: "breaths/min", color: "#ec4899" },
];

const timeRanges = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
];

export default function HealthTrendsPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("heart_rate");
  const [timeRange, setTimeRange] = useState("30");
  const [data, setData] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const selectedConfig = logTypes.find((t) => t.value === selectedType)!;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      const since = new Date();
      since.setDate(since.getDate() - parseInt(timeRange));

      const { data: logs } = await supabase
        .from("health_logs")
        .select("value_numeric, recorded_at")
        .eq("user_id", user.id)
        .eq("log_type", selectedType)
        .gte("recorded_at", since.toISOString())
        .order("recorded_at", { ascending: true });

      setData(
        (logs || [])
          .filter((l) => l.value_numeric !== null)
          .map((l) => ({
            date: new Date(l.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: Number(l.value_numeric),
          }))
      );
      setLoading(false);
    };
    fetchData();
  }, [user, selectedType, timeRange]);

  const avg = data.length ? (data.reduce((s, d) => s + d.value, 0) / data.length).toFixed(1) : "—";
  const min = data.length ? Math.min(...data.map((d) => d.value)).toFixed(1) : "—";
  const max = data.length ? Math.max(...data.map((d) => d.value)).toFixed(1) : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Health Trends</h1>
        <p className="text-muted-foreground">Visualize your health data over time</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {logTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timeRanges.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Average", value: `${avg} ${selectedConfig.unit}` },
          { label: "Min", value: `${min} ${selectedConfig.unit}` },
          { label: "Max", value: `${max} ${selectedConfig.unit}` },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center shadow-card">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-border bg-card p-5 shadow-card"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No data for this period. Start logging!</p>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedConfig.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={selectedConfig.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222, 47%, 9%)",
                  border: "1px solid hsl(222, 30%, 16%)",
                  borderRadius: "8px",
                  color: "hsl(210, 40%, 96%)",
                }}
              />
              <Area type="monotone" dataKey="value" stroke={selectedConfig.color} strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
