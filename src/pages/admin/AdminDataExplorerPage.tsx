import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Pencil, Trash2, Plus, RefreshCw, Wifi, Search } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type TableName = "health_logs" | "medications" | "nutrition_logs" | "sleep_logs" | "fitness_logs";

const tables: { name: TableName; label: string }[] = [
  { name: "health_logs", label: "Health Logs" },
  { name: "medications", label: "Medications" },
  { name: "nutrition_logs", label: "Nutrition" },
  { name: "sleep_logs", label: "Sleep" },
  { name: "fitness_logs", label: "Fitness" },
];

const editableColumns: Record<TableName, string[]> = {
  health_logs: ["log_type", "value_numeric", "value_text", "notes"],
  medications: ["name", "dosage", "frequency", "is_active", "notes", "start_date", "end_date"],
  nutrition_logs: ["meal_type", "food_items", "calories", "protein", "carbs", "fat"],
  sleep_logs: ["duration_hours", "quality", "notes"],
  fitness_logs: ["exercise_type", "duration_minutes", "calories_burned", "intensity", "notes"],
};

export default function AdminDataExplorerPage() {
  const { user } = useAuth();
  const [activeTable, setActiveTable] = useState<TableName>("health_logs");
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editRow, setEditRow] = useState<Record<string, unknown> | null>(null);
  const [editValues, setEditValues] = useState<Record<string, unknown>>({});

  const fetchProfiles = useCallback(async () => {
    const { data } = await supabase.from("profiles").select("user_id, full_name");
    const map: Record<string, string> = {};
    data?.forEach((p) => { map[p.user_id] = p.full_name || "Unknown"; });
    setProfiles(map);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from(activeTable)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setData(rows || []);
    setLoading(false);
  }, [activeTable]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel(`admin_explorer_${activeTable}`)
      .on("postgres_changes", { event: "*", schema: "public", table: activeTable }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeTable, fetchData]);

  const handleEdit = (row: Record<string, unknown>) => {
    setEditRow(row);
    const vals: Record<string, unknown> = {};
    editableColumns[activeTable].forEach((col) => { vals[col] = row[col] ?? ""; });
    setEditValues(vals);
  };

  const handleSave = async () => {
    if (!editRow) return;
    const { error } = await supabase
      .from(activeTable)
      .update(editValues)
      .eq("id", editRow.id);
    if (error) { toast.error(error.message); return; }
    
    // Log audit
    if (user) {
      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action: `EDITED_${activeTable.toUpperCase()}`,
        target_user_id: editRow.user_id,
        details: { table: activeTable, record_id: editRow.id, changes: editValues },
      });
    }
    
    toast.success("Record updated successfully");
    setEditRow(null);
    fetchData();
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const { error } = await supabase.from(activeTable).delete().eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    
    if (user) {
      await supabase.from("audit_logs").insert({
        admin_id: user.id,
        action: `DELETED_${activeTable.toUpperCase()}`,
        target_user_id: row.user_id,
        details: { table: activeTable, record_id: row.id },
      });
    }
    
    toast.success("Record deleted");
    fetchData();
  };

  const displayCols = ["user_id", ...editableColumns[activeTable], "created_at"];
  const filtered = data.filter((row) => {
    const str = JSON.stringify(row).toLowerCase();
    return str.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Explorer</h1>
          <p className="text-muted-foreground">View and edit all patient data across tables</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3 text-emerald-400" />
            Live
          </Badge>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTable} onValueChange={(v) => setActiveTable(v as TableName)}>
        <TabsList className="bg-muted/50">
          {tables.map((t) => (
            <TabsTrigger key={t.name} value={t.name} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search records..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {displayCols.map((col) => (
                  <th key={col} className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground uppercase whitespace-nowrap">
                    {col === "user_id" ? "Patient" : col.replace(/_/g, " ")}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-right text-xs font-medium text-muted-foreground uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <motion.tr key={row.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border/50 hover:bg-muted/20">
                  {displayCols.map((col) => (
                    <td key={col} className="px-3 py-2.5 whitespace-nowrap text-foreground">
                      {col === "user_id" ? (
                        <span className="text-primary text-xs font-medium">{profiles[row.user_id] || row.user_id?.slice(0, 8)}</span>
                      ) : col === "created_at" ? (
                        <span className="text-xs text-muted-foreground">{new Date(row[col]).toLocaleString()}</span>
                      ) : col === "is_active" ? (
                        <Badge variant={row[col] ? "default" : "secondary"}>{row[col] ? "Active" : "Inactive"}</Badge>
                      ) : (
                        <span className="text-xs">{row[col]?.toString() ?? "—"}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary" onClick={() => handleEdit(row)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(row)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Database className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No records found</p>
            </div>
          )}
        </div>
      )}

      {/* Edit dialog */}
      {editRow && (
        <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="text-xs text-muted-foreground">
                Patient: <span className="text-primary font-medium">{profiles[editRow.user_id] || "Unknown"}</span>
              </div>
              {editableColumns[activeTable].map((col) => (
                <div key={col} className="space-y-1.5">
                  <Label className="text-xs capitalize text-muted-foreground">{col.replace(/_/g, " ")}</Label>
                  {col === "is_active" ? (
                    <Select value={editValues[col]?.toString()} onValueChange={(v) => setEditValues({ ...editValues, [col]: v === "true" })}>
                      <SelectTrigger className="bg-muted border-border"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={editValues[col] ?? ""}
                      onChange={(e) => setEditValues({ ...editValues, [col]: e.target.value })}
                      className="bg-muted border-border"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground">Save Changes</Button>
                <Button variant="outline" onClick={() => setEditRow(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
