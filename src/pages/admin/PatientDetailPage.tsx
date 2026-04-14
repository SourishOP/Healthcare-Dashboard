import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Pill, Save, Wifi, Pencil } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PatientDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<Array<Record<string, unknown>>>([]);
  const [meds, setMeds] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<Record<string, unknown>>({});

  const fetchData = useCallback(async () => {
    if (!userId) return;
    const [profileRes, logsRes, medsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("health_logs").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(50),
      supabase.from("medications").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    setProfile(profileRes.data);
    setEditProfile(profileRes.data || {});
    setLogs(logsRes.data || []);
    setMeds(medsRes.data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchData();
    if (!userId) return;
    const channel = supabase
      .channel(`patient_detail_${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "health_logs", filter: `user_id=eq.${userId}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "medications", filter: `user_id=eq.${userId}` }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${userId}` }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, fetchData]);

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editProfile.full_name,
        phone: editProfile.phone,
        date_of_birth: editProfile.date_of_birth,
      })
      .eq("user_id", userId!);
    
    if (error) { toast.error(error.message); return; }
    
    if (adminUser) {
      await supabase.from("audit_logs").insert({
        admin_id: adminUser.id,
        action: "EDITED_PATIENT_PROFILE",
        target_user_id: userId!,
        details: { full_name: editProfile.full_name, phone: editProfile.phone, date_of_birth: editProfile.date_of_birth },
      });
    }
    
    toast.success("Patient profile updated");
    setEditing(false);
    fetchData();
  };

  const toggleMedStatus = async (med: Record<string, unknown>) => {
    const { error } = await supabase
      .from("medications")
      .update({ is_active: !med.is_active })
      .eq("id", med.id);
    if (error) { toast.error(error.message); return; }
    
    if (adminUser) {
      await supabase.from("audit_logs").insert({
        admin_id: adminUser.id,
        action: med.is_active ? "DEACTIVATED_MEDICATION" : "ACTIVATED_MEDICATION",
        target_user_id: userId!,
        details: { medication: med.name, medication_id: med.id },
      });
    }
    toast.success(`Medication ${med.is_active ? "deactivated" : "activated"}`);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  const heartRateData = logs
    .filter((l) => l.log_type === "heart_rate" && l.value_numeric)
    .slice(0, 10)
    .reverse()
    .map((l) => ({
      date: new Date(l.recorded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: l.value_numeric,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/patients")} className="text-muted-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.full_name || "Unknown Patient"}</h1>
            <p className="text-muted-foreground text-sm">Patient ID: {userId?.slice(0, 8)}...</p>
          </div>
        </div>
        <Badge variant="default" className="flex items-center gap-1.5">
          <Wifi className="h-3 w-3 text-emerald-400" />Live
        </Badge>
      </div>

      {/* Editable profile */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Profile Details</h3>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveProfile} className="bg-primary text-primary-foreground">
                <Save className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setEditProfile(profile); }}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        {editing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Full Name</Label>
              <Input value={editProfile.full_name || ""} onChange={(e) => setEditProfile({ ...editProfile, full_name: e.target.value })} className="bg-muted border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={editProfile.phone || ""} onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })} className="bg-muted border-border" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date of Birth</Label>
              <Input type="date" value={editProfile.date_of_birth || ""} onChange={(e) => setEditProfile({ ...editProfile, date_of_birth: e.target.value })} className="bg-muted border-border" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground ml-1">{profile?.full_name || "—"}</span></div>
            <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground ml-1">{profile?.phone || "—"}</span></div>
            <div><span className="text-muted-foreground">DOB:</span> <span className="text-foreground ml-1">{profile?.date_of_birth || "—"}</span></div>
            <div><span className="text-muted-foreground">Joined:</span> <span className="text-foreground ml-1">{new Date(profile?.created_at).toLocaleDateString()}</span></div>
          </div>
        )}
      </div>

      {/* Heart rate chart */}
      {heartRateData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-border bg-card p-5 shadow-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Heart Rate Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={heartRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222, 30%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: "8px", color: "hsl(210, 40%, 96%)" }} />
              <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent vitals */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Health Logs ({logs.length})</h3>
        {logs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No health data</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{log.log_type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.recorded_at).toLocaleString()}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{log.value_text || log.value_numeric}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medications with toggle */}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Medications ({meds.length})</h3>
        {meds.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No medications</p>
        ) : (
          <div className="space-y-2">
            {meds.map((med) => (
              <div key={med.id} className={`flex items-center justify-between rounded-md px-4 py-3 ${med.is_active ? "bg-success/5 border border-success/20" : "bg-muted/50"}`}>
                <div className="flex items-center gap-3">
                  <Pill className={`h-4 w-4 ${med.is_active ? "text-success" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-medium text-foreground">{med.name}</p>
                    <p className="text-xs text-muted-foreground">{[med.dosage, med.frequency].filter(Boolean).join(" • ")}</p>
                  </div>
                </div>
                <Button
                  variant={med.is_active ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggleMedStatus(med)}
                  className="text-xs"
                >
                  {med.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
