// @ts-nocheck
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Heart, Droplets, Weight, Thermometer, Wind, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const vitalTypes = [
  { value: "heart_rate", label: "Heart Rate", icon: Heart, unit: "bpm", placeholder: "72" },
  { value: "blood_pressure", label: "Blood Pressure", icon: Activity, unit: "mmHg", placeholder: "120/80", isText: true },
  { value: "glucose", label: "Blood Glucose", icon: Droplets, unit: "mg/dL", placeholder: "100" },
  { value: "weight", label: "Weight", icon: Weight, unit: "kg", placeholder: "70" },
  { value: "temperature", label: "Temperature", icon: Thermometer, unit: "°F", placeholder: "98.6" },
  { value: "oxygen_saturation", label: "SpO₂", icon: Wind, unit: "%", placeholder: "98" },
  { value: "respiratory_rate", label: "Respiratory Rate", icon: Wind, unit: "breaths/min", placeholder: "16" },
];

export default function LogVitalsPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedVital = vitalTypes.find((v) => v.value === selectedType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedType || !value) { toast.error("Please fill in all required fields"); return; }

    setLoading(true);
    const isText = selectedVital?.isText;
    const { error } = await supabase.from("health_logs").insert({
      user_id: user.id,
      log_type: selectedType,
      value_numeric: isText ? null : parseFloat(value),
      value_text: isText ? value : null,
      notes: notes || null,
    });
    setLoading(false);

    if (error) { toast.error("Failed to log vital"); return; }
    toast.success("Vital logged successfully!");
    setValue("");
    setNotes("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Log Vitals</h1>
        <p className="text-muted-foreground">Record your health measurements</p>
      </div>

      {/* Quick select cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {vitalTypes.map((v) => {
          const Icon = v.icon;
          return (
            <motion.button
              key={v.value}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedType(v.value)}
              className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                selectedType === v.value
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <Icon className={`h-5 w-5 ${selectedType === v.value ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-xs font-medium ${selectedType === v.value ? "text-primary" : "text-muted-foreground"}`}>
                {v.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      {selectedType && (
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card"
        >
          <div className="space-y-2">
            <Label className="text-foreground">{selectedVital?.label} ({selectedVital?.unit})</Label>
            <Input
              type={selectedVital?.isText ? "text" : "number"}
              step={selectedVital?.isText ? undefined : "0.1"}
              placeholder={selectedVital?.placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="bg-muted border-border text-lg"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground">Notes (optional)</Label>
            <Textarea
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-muted border-border"
              rows={3}
            />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={loading}>
            <Check className="mr-2 h-4 w-4" />
            Log {selectedVital?.label}
          </Button>
        </motion.form>
      )}
    </div>
  );
}
