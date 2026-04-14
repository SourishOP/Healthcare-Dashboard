import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface NursingHome {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  rating: number;
  capacity: number;
  services: string[];
  staff_doctor: boolean;
  ambulance_available: boolean;
  description: string;
  image_url: string;
  source: "osm" | "custom";
}

export default function NursingHomesManagementPage() {
  const [nursingHomes, setNursingHomes] = useState<NursingHome[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<NursingHome>>({
    staff_doctor: false,
    ambulance_available: false,
    source: "custom",
  });
  const [searchLocation, setSearchLocation] = useState("28.7041,77.1025");

  const fetchNursingHomesFromOSM = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
          q: "nursing home near " + lat + "," + lon,
          format: "json",
          limit: "50",
          addressdetails: "1",
        }).toString(),
        {
          headers: {
            "Accept": "application/json",
            "User-Agent": "HealthZenithShield-Healthcare-App",
          },
        }
      );

      if (!response.ok) throw new Error("Nominatim API error");

      const results = await response.json() as Array<Record<string, unknown>>;
      const radiusKm = 15;

      return results
        .map((el: Record<string, unknown>) => {
          const distance = Math.sqrt(
            Math.pow(parseFloat(el.lat) - lat, 2) + Math.pow(parseFloat(el.lon) - lon, 2)
          ) * 111;
          if (distance > radiusKm) return null;
          return {
            id: `osm-${el.osm_id}`,
            name: el.name || el.display_name?.split(",")[0] || "Unknown",
            latitude: parseFloat(el.lat),
            longitude: parseFloat(el.lon),
            address: el.address || el.display_name || "Address not available",
            phone: el.extratags?.phone || "",
            email: el.extratags?.email || "",
            website: el.extratags?.website || "",
            rating: el.extratags?.rating ? parseFloat(el.extratags.rating) : 0,
            capacity: el.extratags?.capacity ? parseInt(el.extratags.capacity) : 0,
            services: el.extratags?.services ? el.extratags.services.split(";") : [],
            staff_doctor: el.extratags?.staff_doctor === "yes",
            ambulance_available: el.extratags?.ambulance === "yes",
            description: el.extratags?.description || "",
            image_url: "",
            source: "osm" as const,
          };
        })
        .filter((n: NursingHome | null) => n !== null && n.latitude && n.longitude);
    } catch (error) {
      console.error("Error fetching from Nominatim:", error);
      toast.error("Failed to fetch nursing homes from OSM");
      return [];
    }
  }, []);

  const loadNursingHomes = useCallback(async () => {
    setLoading(true);
    try {
      const [lat, lon] = searchLocation.split(",").map(s => parseFloat(s.trim()));
      if (isNaN(lat) || isNaN(lon)) {
        toast.error("Invalid coordinates");
        setLoading(false);
        return;
      }

      const osmHomes = await fetchNursingHomesFromOSM(lat, lon);
      const customHomes = JSON.parse(localStorage.getItem("customNursingHomes") || "[]");
      const combined = [...osmHomes, ...customHomes];
      const deduped = combined.reduce((acc: NursingHome[], home) => {
        const exists = acc.find(h => h.name.toLowerCase().trim() === home.name.toLowerCase().trim());
        if (!exists) acc.push(home);
        return acc;
      }, []);

      setNursingHomes(deduped);
    } catch (error) {
      toast.error("Error loading nursing homes");
    } finally {
      setLoading(false);
    }
  }, [searchLocation, fetchNursingHomesFromOSM]);

  useEffect(() => {
    loadNursingHomes();
  }, [searchLocation, loadNursingHomes]);

  const handleSave = () => {
    if (!formData.name || !formData.address) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingId) {
        setNursingHomes((prev) =>
          prev.map((home) =>
            home.id === editingId ? { ...home, ...formData } : home
          )
        );
        toast.success("Nursing home updated");
      } else {
        const newHome: NursingHome = {
          id: `custom-${Date.now()}`,
          ...formData,
          source: "custom",
        } as NursingHome;
        setNursingHomes((prev) => [...prev, newHome]);
        toast.success("Nursing home added");
      }

      const customHomes = nursingHomes.filter(h => h.source === "custom");
      localStorage.setItem("customNursingHomes", JSON.stringify(customHomes));

      setOpenDialog(false);
      setFormData({ staff_doctor: false, ambulance_available: false, source: "custom" });
      setEditingId(null);
    } catch (error: Error) {
      toast.error("Failed to save nursing home");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this nursing home?")) return;

    setNursingHomes((prev) => prev.filter((home) => home.id !== id));
    const customHomes = nursingHomes.filter(h => h.id !== id && h.source === "custom");
    localStorage.setItem("customNursingHomes", JSON.stringify(customHomes));
    toast.success("Nursing home deleted");
  };

  const handleEdit = (home: NursingHome) => {
    setFormData(home);
    setEditingId(home.id);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nursing Homes Management</h1>
          <p className="text-muted-foreground">Real-time nursing homes from OpenStreetMap</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          if (!open) {
            setFormData({ staff_doctor: false, ambulance_available: false, source: "custom" });
            setEditingId(null);
          }
          setOpenDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Nursing Home
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Nursing Home" : "Add New Nursing Home"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nursing Home Name *</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Sunrise Nursing Home"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Address *</Label>
                <Input
                  value={formData.address || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.latitude || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="0.000001"
                    value={formData.longitude || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={formData.website || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Rating</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services (comma-separated)</Label>
                <Input
                  value={formData.services?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      services: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  placeholder="Physiotherapy, Medication Management, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.staff_doctor || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        staff_doctor: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Staff Doctor Available</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.ambulance_available || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ambulance_available: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Ambulance Available</span>
                </label>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Nursing home description"
                />
              </div>

              <div>
                <Label>Image URL</Label>
                <Input
                  value={formData.image_url || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image_url: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingId ? "Update" : "Add"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Search location (lat,lon e.g., 28.7041,77.1025)"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <Button onClick={loadNursingHomes} disabled={loading} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-border/50 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Staff Doctor</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : nursingHomes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No nursing homes found
                </TableCell>
              </TableRow>
            ) : (
              nursingHomes.map((home) => (
                <TableRow key={home.id}>
                  <TableCell className="font-medium">{home.name}</TableCell>
                  <TableCell className="text-sm">{home.address}</TableCell>
                  <TableCell>{home.phone || "-"}</TableCell>
                  <TableCell>{home.capacity}</TableCell>
                  <TableCell>
                    {home.staff_doctor ? (
                      <span className="text-sm bg-blue-500/20 text-blue-700 px-2 py-1 rounded">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={home.source === "osm" ? "default" : "secondary"}>
                      {home.source === "osm" ? "OSM" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(home)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(home.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
