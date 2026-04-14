import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { Activity, Heart, Droplets, Weight, Thermometer, Wind, Pill } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HealthLog {
  id: string;
  log_type: string;
  value_numeric: number | null;
  value_text: string | null;
  recorded_at: string;
}

const logTypeConfig: Record<string, { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; unit: string; color: string }> = {
  heart_rate: { icon: Heart, label: "Heart Rate", unit: "bpm", color: "hsl(0, 72%, 51%)" },
  blood_pressure: { icon: Activity, label: "Blood Pressure", unit: "mmHg", color: "hsl(199, 89%, 48%)" },
  glucose: { icon: Droplets, label: "Glucose", unit: "mg/dL", color: "hsl(38, 92%, 50%)" },
  weight: { icon: Weight, label: "Weight", unit: "kg", color: "hsl(142, 76%, 36%)" },
  temperature: { icon: Thermometer, label: "Temperature", unit: "°F", color: "hsl(168, 80%, 40%)" },
  oxygen_saturation: { icon: Wind, label: "SpO₂", unit: "%", color: "hsl(262, 80%, 50%)" },
  respiratory_rate: { icon: Wind, label: "Resp Rate", unit: "breaths/min", color: "hsl(330, 80%, 50%)" },
};

export default function PatientDashboard() {
  const { user } = useAuth();
  const [recentLogs, setRecentLogs] = useState<HealthLog[]>([]);
  const [medCount, setMedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [logsRes, medsRes] = await Promise.all([
          supabase.from("health_logs").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(50),
          supabase.from("medications").select("id").eq("user_id", user.id).eq("is_active", true),
        ]);
        setRecentLogs((logsRes.data as HealthLog[]) || []);
        setMedCount(medsRes.data?.length || 0);
      } catch (err) {
        console.error("Patient dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel("health_logs_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "health_logs", filter: `user_id=eq.${user.id}` }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const getLatestValue = (type: string) => {
    const log = recentLogs.find((l) => l.log_type === type);
    if (!log) return "—";
    if (type === "blood_pressure") return log.value_text || "—";
    return log.value_numeric?.toString() || "—";
  };

  const getChartData = (type: string) => {
    return recentLogs
      .filter((l) => l.log_type === type && l.value_numeric)
      .slice(0, 7)
      .reverse()
      .map((l) => ({
        date: new Date(l.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: l.value_numeric,
      }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your health at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Heart Rate"
          value={`${getLatestValue("heart_rate")} bpm`}
          icon={Heart}
          variant="destructive"
        />
        <StatCard
          title="Blood Pressure"
          value={getLatestValue("blood_pressure")}
          subtitle="mmHg"
          icon={Activity}
          variant="primary"
        />
        <StatCard
          title="Glucose"
          value={`${getLatestValue("glucose")} mg/dL`}
          icon={Droplets}
          variant="warning"
        />
        <StatCard
          title="Active Medications"
          value={medCount}
          icon={Pill}
          variant="success"
        />
      </div>

      {/* Mini charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {["heart_rate", "glucose"].map((type) => {
          const data = getChartData(type);
          const config = logTypeConfig[type];
          if (!data.length) return null;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-5 shadow-card"
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-4">{config.label} Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
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
                  <Line type="monotone" dataKey="value" stroke={config.color} strokeWidth={2} dot={{ fill: config.color, r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          );
        })}
      </div>

      {/* Recent activity */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Logs</h3>
        {recentLogs.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No health data yet. Start by logging your vitals!</p>
        ) : (
          <div className="space-y-3">
            {recentLogs.slice(0, 5).map((log) => {
              const config = logTypeConfig[log.log_type];
              const Icon = config?.icon || Activity;
              return (
                <div key={log.id} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{config?.label || log.log_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.recorded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {log.log_type === "blood_pressure" ? log.value_text : log.value_numeric} {config?.unit}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
