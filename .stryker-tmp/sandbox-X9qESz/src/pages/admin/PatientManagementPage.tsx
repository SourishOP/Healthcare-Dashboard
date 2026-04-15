// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search, User, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export default function PatientManagementPage() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    // Get admin user IDs so we can exclude them from the patient list
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    const adminIds = new Set((adminRoles || []).map((r) => r.user_id));

    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    // Filter out admins — only show actual patients
    const patientsOnly = (data || []).filter((p) => !adminIds.has(p.user_id));
    setPatients(patientsOnly as Patient[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();

    // Realtime subscription for patient changes
    const channel = supabase
      .channel("admin_patients_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchPatients())
      .on("postgres_changes", { event: "*", schema: "public", table: "health_logs" }, () => fetchPatients())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPatients]);

  const logAudit = async (targetUserId: string) => {
    if (!user) return;
    await supabase.from("audit_logs").insert({
      admin_id: user.id,
      action: "VIEWED_PATIENT_RECORD",
      target_user_id: targetUserId,
    });
  };

  const filtered = patients.filter((p) =>
    (p.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Patient Management</h1>
          <p className="text-muted-foreground">{patients.length} registered patients</p>
        </div>
        <Badge variant="default" className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-emerald-400" />
          Live
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search patients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Patient</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden sm:table-cell">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase hidden md:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((patient) => (
              <motion.tr
                key={patient.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={async () => {
                  await logAudit(patient.user_id);
                  navigate(`/admin/patients/${patient.user_id}`);
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
                      {(patient.full_name || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{patient.full_name || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{patient.phone || "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{new Date(patient.created_at).toLocaleDateString()}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No patients found</p>
        )}
      </div>
    </div>
  );
}
