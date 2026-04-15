// @ts-nocheck
import { Settings } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">System configuration</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-12 text-center shadow-card">
        <Settings className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Admin settings coming soon</p>
      </div>
    </div>
  );
}
