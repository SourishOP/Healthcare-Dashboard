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

interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  rating: number;
  specialties: string[];
  emergency_services: boolean;
  ambulance_available: boolean;
  icu_beds: number;
  beds: number;
  description: string;
  image_url: string;
  source: "osm" | "custom";
}

export default function HospitalsManagementPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Hospital>>({
    emergency_services: false,
    ambulance_available: false,
    source: "custom",
  });
  const [searchLocation, setSearchLocation] = useState("28.7041,77.1025");

  const fetchHospitalsFromOSM = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
          q: "hospital near " + lat + "," + lon,
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
            specialties: el.extratags?.specialties ? el.extratags.specialties.split(";") : [],
            emergency_services: el.extratags?.emergency === "yes",
            ambulance_available: el.extratags?.ambulance === "yes",
            icu_beds: 0,
            beds: el.extratags?.beds ? parseInt(el.extratags.beds) : 0,
            description: el.extratags?.description || "",
            image_url: "",
            source: "osm" as const,
          };
        })
        .filter((h: Hospital | null) => h !== null && h.latitude && h.longitude);
    } catch (error) {
      console.error("Error fetching from Nominatim:", error);
      toast.error("Failed to fetch hospitals from OSM");
      return [];
    }
  }, []);

  const loadHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const [lat, lon] = searchLocation.split(",").map(s => parseFloat(s.trim()));
      if (isNaN(lat) || isNaN(lon)) {
        toast.error("Invalid coordinates");
        setLoading(false);
        return;
      }

      const osmHospitals = await fetchHospitalsFromOSM(lat, lon);
      const customHospitals = JSON.parse(localStorage.getItem("customHospitals") || "[]");
      const combined = [...osmHospitals, ...customHospitals];
      const deduped = combined.reduce((acc: Hospital[], hospital) => {
        const exists = acc.find(h => h.name.toLowerCase().trim() === hospital.name.toLowerCase().trim());
        if (!exists) acc.push(hospital);
        return acc;
      }, []);

      setHospitals(deduped);
    } catch (error) {
      toast.error("Error loading hospitals");
    } finally {
      setLoading(false);
    }
  }, [searchLocation, fetchHospitalsFromOSM]);

  useEffect(() => {
    loadHospitals();
  }, [searchLocation, loadHospitals]);

  const handleSave = () => {
    if (!formData.name || !formData.address) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingId) {
        setHospitals((prev) =>
          prev.map((hospital) =>
            hospital.id === editingId ? { ...hospital, ...formData } : hospital
          )
        );
        toast.success("Hospital updated");
      } else {
        const newHospital: Hospital = {
          id: `custom-${Date.now()}`,
          ...formData,
          source: "custom",
        } as Hospital;
        setHospitals((prev) => [...prev, newHospital]);
        toast.success("Hospital added");
      }

      const customHospitals = hospitals.filter(h => h.source === "custom");
      localStorage.setItem("customHospitals", JSON.stringify(customHospitals));

      setOpenDialog(false);
      setFormData({ emergency_services: false, ambulance_available: false, source: "custom" });
      setEditingId(null);
    } catch (error: Error) {
      toast.error("Failed to save hospital");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this hospital?")) return;

    setHospitals((prev) => prev.filter((hospital) => hospital.id !== id));
    const customHospitals = hospitals.filter(h => h.id !== id && h.source === "custom");
    localStorage.setItem("customHospitals", JSON.stringify(customHospitals));
    toast.success("Hospital deleted");
  };

  const handleEdit = (hospital: Hospital) => {
    setFormData(hospital);
    setEditingId(hospital.id);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hospitals Management</h1>
          <p className="text-muted-foreground">Real-time hospitals from OpenStreetMap</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          if (!open) {
            setFormData({ emergency_services: false, ambulance_available: false, source: "custom" });
            setEditingId(null);
          }
          setOpenDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Hospital
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Hospital" : "Add New Hospital"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hospital Name *</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Apollo Hospitals"
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Total Beds</Label>
                  <Input
                    type="number"
                    value={formData.beds || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        beds: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>ICU Beds</Label>
                  <Input
                    type="number"
                    value={formData.icu_beds || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        icu_beds: parseInt(e.target.value),
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
                <Label>Specialties (comma-separated)</Label>
                <Input
                  value={formData.specialties?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialties: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  placeholder="Cardiology, Neurology, etc."
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.emergency_services || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emergency_services: e.target.checked,
                      })
                    }
                  />
                  <span className="text-sm">Emergency Services</span>
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
                  placeholder="Hospital description"
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
        <Button onClick={loadHospitals} disabled={loading} className="gap-2">
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
              <TableHead>Beds/ICU</TableHead>
              <TableHead>Emergency</TableHead>
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
            ) : hospitals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hospitals found
                </TableCell>
              </TableRow>
            ) : (
              hospitals.map((hospital) => (
                <TableRow key={hospital.id}>
                  <TableCell className="font-medium">{hospital.name}</TableCell>
                  <TableCell className="text-sm">{hospital.address}</TableCell>
                  <TableCell>{hospital.phone || "-"}</TableCell>
                  <TableCell>{hospital.beds}/{hospital.icu_beds}</TableCell>
                  <TableCell>
                    {hospital.emergency_services ? (
                      <span className="text-sm bg-red-500/20 text-red-700 px-2 py-1 rounded">
                        Yes
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={hospital.source === "osm" ? "default" : "secondary"}>
                      {hospital.source === "osm" ? "OSM" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(hospital)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(hospital.id)}
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
