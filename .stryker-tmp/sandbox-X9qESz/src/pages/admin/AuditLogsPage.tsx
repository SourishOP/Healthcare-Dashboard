// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  ip_address: string | null;
  created_at: string;
  details: Record<string, unknown>;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setLogs((data as AuditLog[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Track all admin actions for compliance</p>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Target</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <motion.tr
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-border/50"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="text-sm text-foreground">{log.action.replace(/_/g, " ")}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell font-mono">
                  {log.target_user_id ? `${log.target_user_id.slice(0, 8)}...` : "—"}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No audit logs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
