// @ts-nocheck
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, FileText, Shield, LogOut, Menu, X, Settings, Database, Pill, Hospital, Stethoscope, Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/patients", icon: Users, label: "Patients" },
  { to: "/admin/data", icon: Database, label: "Data Explorer" },
  { to: "/admin/audit-logs", icon: FileText, label: "Audit Logs" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
  
  // Nearby Services Management
  { to: "/admin/medicine-shops", icon: Pill, label: "Medicine Shops", section: "Services" },
  { to: "/admin/hospitals", icon: Hospital, label: "Hospitals", section: "Services" },
  { to: "/admin/doctors", icon: Stethoscope, label: "Doctors", section: "Services" },
  { to: "/admin/nursing-homes", icon: Home, label: "Nursing Homes", section: "Services" },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin-login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex md:w-64 flex-col border-r border-border bg-card/50">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <Shield className="h-6 w-6 text-destructive" />
          <span className="text-lg font-bold" style={{ background: "linear-gradient(135deg, hsl(0 72% 65%), hsl(0 50% 80%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>VitalSync Admin</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item, idx) => {
            const showSectionHeader = item.section && (idx === 0 || navItems[idx - 1].section !== item.section);
            
            return (
              <div key={item.to}>
                {showSectionHeader && (
                  <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                    {item.section}
                  </h3>
                )}
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-destructive/10 text-destructive"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-semibold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
              <p className="text-xs text-destructive font-medium">Administrator</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start text-muted-foreground hover:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex md:hidden items-center justify-between border-b border-border bg-card/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-destructive" />
            <span className="font-bold text-destructive">Admin</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-muted-foreground">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {mobileOpen && (
          <div className="md:hidden border-b border-border bg-card p-3 space-y-1">
            {navItems.map((item, idx) => {
              const showSectionHeader = item.section && (idx === 0 || navItems[idx - 1].section !== item.section);
              
              return (
                <div key={item.to}>
                  {showSectionHeader && (
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                      {item.section}
                    </h3>
                  )}
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                        isActive ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                </div>
              );
            })}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
