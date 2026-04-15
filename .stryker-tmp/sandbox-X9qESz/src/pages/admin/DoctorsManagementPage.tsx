// @ts-nocheck
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

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  experience_years: number;
  qualifications: string[];
  consultation_fee: number;
  availability: string;
  description: string;
  image_url: string;
  source: "osm" | "custom";
}

export default function DoctorsManagementPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({
    source: "custom",
  });
  const [searchLocation, setSearchLocation] = useState("28.7041,77.1025");

  const fetchDoctorsFromOSM = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
          q: "doctor near " + lat + "," + lon,
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
            specialization: el.extratags?.specialties || el.extratags?.healthcare_type || "General Practice",
            phone: el.extratags?.phone || "",
            email: el.extratags?.email || "",
            address: el.address || el.display_name || "Address not available",
            rating: el.extratags?.rating ? parseFloat(el.extratags.rating) : 0,
            experience_years: 0,
            qualifications: el.extratags?.qualifications ? el.extratags.qualifications.split(";") : [],
            consultation_fee: 0,
            availability: el.extratags?.opening_hours || "N/A",
            description: el.extratags?.description || "",
            image_url: "",
            source: "osm" as const,
          };
        })
        .filter((d: Doctor | null) => d !== null && d.latitude && d.longitude);
    } catch (error) {
      console.error("Error fetching from Nominatim:", error);
      toast.error("Failed to fetch doctors from OSM");
      return [];
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const [lat, lon] = searchLocation.split(",").map(s => parseFloat(s.trim()));
      if (isNaN(lat) || isNaN(lon)) {
        toast.error("Invalid coordinates");
        setLoading(false);
        return;
      }

      const osmDoctors = await fetchDoctorsFromOSM(lat, lon);
      const customDoctors = JSON.parse(localStorage.getItem("customDoctors") || "[]");
      const combined = [...osmDoctors, ...customDoctors];
      const deduped = combined.reduce((acc: Doctor[], doctor) => {
        const exists = acc.find(d => d.name.toLowerCase().trim() === doctor.name.toLowerCase().trim());
        if (!exists) acc.push(doctor);
        return acc;
      }, []);

      setDoctors(deduped);
    } catch (error) {
      toast.error("Error loading doctors");
    } finally {
      setLoading(false);
    }
  }, [searchLocation, fetchDoctorsFromOSM]);

  useEffect(() => {
    loadDoctors();
  }, [searchLocation, loadDoctors]);

  const handleSave = () => {
    if (!formData.name || !formData.specialization) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingId) {
        setDoctors((prev) =>
          prev.map((doctor) =>
            doctor.id === editingId ? { ...doctor, ...formData } : doctor
          )
        );
        toast.success("Doctor updated");
      } else {
        const newDoctor: Doctor = {
          id: `custom-${Date.now()}`,
          ...formData,
          source: "custom",
        } as Doctor;
        setDoctors((prev) => [...prev, newDoctor]);
        toast.success("Doctor added");
      }

      const customDoctors = doctors.filter(d => d.source === "custom");
      localStorage.setItem("customDoctors", JSON.stringify(customDoctors));

      setOpenDialog(false);
      setFormData({ source: "custom" });
      setEditingId(null);
    } catch (error: Error) {
      toast.error("Failed to save doctor");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
    const customDoctors = doctors.filter(d => d.id !== id && d.source === "custom");
    localStorage.setItem("customDoctors", JSON.stringify(customDoctors));
    toast.success("Doctor deleted");
  };

  const handleEdit = (doctor: Doctor) => {
    setFormData(doctor);
    setEditingId(doctor.id);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Doctors Management</h1>
          <p className="text-muted-foreground">Real-time doctors from OpenStreetMap</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          if (!open) {
            setFormData({ source: "custom" });
            setEditingId(null);
          }
          setOpenDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Doctor" : "Add New Doctor"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Doctor Name *</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Dr. John Doe"
                  />
                </div>
                <div>
                  <Label>Specialization *</Label>
                  <Input
                    value={formData.specialization || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    placeholder="Cardiology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
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
              </div>

              <div>
                <Label>Address</Label>
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Experience (Years)</Label>
                  <Input
                    type="number"
                    value={formData.experience_years || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience_years: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Consultation Fee</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.consultation_fee || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation_fee: parseFloat(e.target.value),
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
                <Label>Qualifications (comma-separated)</Label>
                <Input
                  value={formData.qualifications?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      qualifications: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    })
                  }
                  placeholder="MD, MBBS, etc."
                />
              </div>

              <div>
                <Label>Availability</Label>
                <Input
                  value={formData.availability || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      availability: e.target.value,
                    })
                  }
                  placeholder="Mon-Fri 9AM-5PM"
                />
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
                  placeholder="Doctor description"
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
        <Button onClick={loadDoctors} disabled={loading} className="gap-2">
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
              <TableHead>Specialization</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Rating</TableHead>
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
            ) : doctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No doctors found
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>{doctor.phone || "-"}</TableCell>
                  <TableCell>{doctor.experience_years} years</TableCell>
                  <TableCell>
                    <span className="text-sm bg-yellow-500/20 text-yellow-700 px-2 py-1 rounded">
                      {doctor.rating || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={doctor.source === "osm" ? "default" : "secondary"}>
                      {doctor.source === "osm" ? "OSM" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(doctor)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(doctor.id)}
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
