import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import StatCard from "@/components/StatCard";
import { Users, Activity, Pill, FileText, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ patients: 0, logsToday: 0, activeMeds: 0, auditEntries: 0 });
  const [recentLogs, setRecentLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get admin user IDs to exclude from patient count
      const { data: adminRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");
      const adminIds = new Set((adminRoles || []).map((r) => r.user_id));

      const [patientsRes, logsRes, medsRes, auditRes, recentRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("health_logs").select("id", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("medications").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }),
        supabase.from("health_logs").select("*").order("created_at", { ascending: false }).limit(10),
      ]);

      // Count only non-admin profiles as patients
      const patientCount = (patientsRes.data || []).filter((p) => !adminIds.has(p.user_id)).length;

      setStats({
        patients: patientCount,
        logsToday: logsRes.count || 0,
        activeMeds: medsRes.count || 0,
        auditEntries: auditRes.count || 0,
      });
      setRecentLogs(recentRes.data || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Subscribe to ALL relevant tables for realtime
    const channel = supabase
      .channel("admin_realtime_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "health_logs" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "medications" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "nutrition_logs" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "sleep_logs" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "fitness_logs" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "audit_logs" }, () => fetchData())
      .subscribe((status) => {
        setRealtimeStatus(status === "SUBSCRIBED" ? "connected" : "connecting");
      });

    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and real-time monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={realtimeStatus === "connected" ? "default" : "secondary"} className="flex items-center gap-1.5">
            <Wifi className={`h-3 w-3 ${realtimeStatus === "connected" ? "text-emerald-400" : "text-muted-foreground animate-pulse"}`} />
            {realtimeStatus === "connected" ? "Live" : "Connecting…"}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={stats.patients} icon={Users} variant="primary" />
        <StatCard title="Logs Today" value={stats.logsToday} icon={Activity} variant="success" />
        <StatCard title="Active Medications" value={stats.activeMeds} icon={Pill} variant="warning" />
        <StatCard title="Audit Entries" value={stats.auditEntries} icon={FileText} variant="default" />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Health Logs (All Patients)</h3>
          <span className="text-xs text-muted-foreground">Auto-refreshes in real time</span>
        </div>
        {recentLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No logs yet</p>
        ) : (
          <div className="space-y-2">
            {recentLogs.map((log: Record<string, unknown>) => {
              const logType = typeof log.log_type === 'string' ? log.log_type : '';
              const createdAt = typeof log.created_at === 'string' ? log.created_at : new Date().toISOString();
              const valueText = log.value_text ? String(log.value_text) : '';
              const valueNumeric = log.value_numeric ? String(log.value_numeric) : '';
              return (
                <motion.div
                  key={String(log.id)}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {logType.replace("_", " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(createdAt).toLocaleString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {valueText || valueNumeric}
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
