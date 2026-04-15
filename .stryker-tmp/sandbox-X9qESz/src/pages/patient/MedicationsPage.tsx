// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pill, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  notes: string | null;
}

export default function MedicationsPage() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", notes: "" });

  const fetchMeds = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("medications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setMedications((data as Medication[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchMeds();
    if (!user) return;
    const channel = supabase
      .channel("medications_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "medications", filter: `user_id=eq.${user.id}` }, () => fetchMeds())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchMeds]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name) return;
    const { error } = await supabase.from("medications").insert({
      user_id: user.id,
      name: form.name,
      dosage: form.dosage || null,
      frequency: form.frequency || null,
      notes: form.notes || null,
      start_date: new Date().toISOString().split("T")[0],
    });
    if (error) { toast.error("Failed to add medication"); return; }
    toast.success("Medication added");
    setForm({ name: "", dosage: "", frequency: "", notes: "" });
    setOpen(false);
  };

  const toggleActive = async (med: Medication) => {
    await supabase.from("medications").update({ is_active: !med.is_active }).eq("id", med.id);
    toast.success(med.is_active ? "Medication deactivated" : "Medication activated");
    fetchMeds();
  };

  const deleteMed = async (id: string) => {
    await supabase.from("medications").delete().eq("id", id);
    toast.success("Medication removed");
    fetchMeds();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medications</h1>
          <p className="text-muted-foreground">Manage your prescriptions and supplements</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Add</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle className="text-foreground">Add Medication</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div><Label className="text-foreground">Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-muted border-border" required /></div>
              <div><Label className="text-foreground">Dosage</Label><Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} className="bg-muted border-border" placeholder="e.g., 500mg" /></div>
              <div><Label className="text-foreground">Frequency</Label><Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="bg-muted border-border" placeholder="e.g., Twice daily" /></div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Medication</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center shadow-card">
          <Pill className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No medications added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center justify-between rounded-lg border bg-card p-4 shadow-card ${
                med.is_active ? "border-success/20" : "border-border opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${med.is_active ? "bg-success/10" : "bg-muted"}`}>
                  <Pill className={`h-4 w-4 ${med.is_active ? "text-success" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{med.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[med.dosage, med.frequency].filter(Boolean).join(" • ") || "No details"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(med)} className="text-xs text-muted-foreground">
                  {med.is_active ? "Deactivate" : "Activate"}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteMed(med.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
