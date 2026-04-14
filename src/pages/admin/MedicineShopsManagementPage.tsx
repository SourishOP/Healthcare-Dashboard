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

interface MedicineShop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  website: string;
  rating: number;
  opening_time: string;
  closing_time: string;
  is_open_24h: boolean;
  description: string;
  image_url: string;
  source: "osm" | "custom";
}

export default function MedicineShopsManagementPage() {
  const [shops, setShops] = useState<MedicineShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MedicineShop>>({
    is_open_24h: false,
    source: "custom",
  });
  const [searchLocation, setSearchLocation] = useState("28.7041,77.1025");

  const fetchPharmaciesFromOSM = useCallback(async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
          q: "pharmacy near " + lat + "," + lon,
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
            opening_time: el.extratags?.opening_hours ? el.extratags.opening_hours.split(";")[0] : "",
            closing_time: "",
            is_open_24h: el.extratags?.opening_hours === "24/7",
            description: el.extratags?.description || "",
            image_url: "",
            source: "osm" as const,
          };
        })
        .filter((p: Pharmacy | null) => p !== null && p.latitude && p.longitude);
    } catch (error) {
      console.error("Error fetching from Nominatim:", error);
      toast.error("Failed to fetch pharmacies from OSM");
      return [];
    }
  }, []);

  const loadShops = useCallback(async () => {
    setLoading(true);
    try {
      const [lat, lon] = searchLocation.split(",").map(s => parseFloat(s.trim()));
      if (isNaN(lat) || isNaN(lon)) {
        toast.error("Invalid coordinates");
        setLoading(false);
        return;
      }

      const osmShops = await fetchPharmaciesFromOSM(lat, lon);
      const customShops = JSON.parse(localStorage.getItem("customMedicineShops") || "[]");
      const combined = [...osmShops, ...customShops];
      const deduped = combined.reduce((acc: MedicineShop[], shop) => {
        const exists = acc.find(s => s.name.toLowerCase().trim() === shop.name.toLowerCase().trim());
        if (!exists) acc.push(shop);
        return acc;
      }, []);

      setShops(deduped);
    } catch (error) {
      toast.error("Error loading pharmacies");
    } finally {
      setLoading(false);
    }
  }, [searchLocation, fetchPharmaciesFromOSM]);

  useEffect(() => {
    loadShops();
  }, [searchLocation, loadShops]);

  const handleSave = () => {
    if (!formData.name || !formData.address) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingId) {
        setShops((prev) =>
          prev.map((shop) =>
            shop.id === editingId ? { ...shop, ...formData } : shop
          )
        );
        toast.success("Pharmacy updated");
      } else {
        const newShop: MedicineShop = {
          id: `custom-${Date.now()}`,
          ...formData,
          source: "custom",
        } as MedicineShop;
        setShops((prev) => [...prev, newShop]);
        toast.success("Pharmacy added");
      }

      const customShops = shops.filter(s => s.source === "custom");
      localStorage.setItem("customMedicineShops", JSON.stringify(customShops));

      setOpenDialog(false);
      setFormData({ is_open_24h: false, source: "custom" });
      setEditingId(null);
    } catch (error: Error) {
      toast.error("Failed to save pharmacy");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this pharmacy?")) return;

    setShops((prev) => prev.filter((shop) => shop.id !== id));
    const customShops = shops.filter(s => s.id !== id && s.source === "custom");
    localStorage.setItem("customMedicineShops", JSON.stringify(customShops));
    toast.success("Pharmacy deleted");
  };

  const handleEdit = (shop: MedicineShop) => {
    setFormData(shop);
    setEditingId(shop.id);
    setOpenDialog(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medicine Shops Management</h1>
          <p className="text-muted-foreground">Real-time pharmacies from OpenStreetMap</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          if (!open) {
            setFormData({ is_open_24h: false, source: "custom" });
            setEditingId(null);
          }
          setOpenDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Pharmacy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Pharmacy" : "Add New Pharmacy"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Shop Name *</Label>
                  <Input
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Apollo Pharmacy"
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
                  <Label>Opening Time</Label>
                  <Input
                    type="time"
                    value={formData.opening_time || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opening_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Closing Time</Label>
                  <Input
                    type="time"
                    value={formData.closing_time || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        closing_time: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_open_24h || false}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_open_24h: e.target.checked,
                        })
                      }
                    />
                    <span className="text-sm">24/7 Open</span>
                  </label>
                </div>
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
                  placeholder="Pharmacy description"
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

              <div className="flex gap-2 pt-4">
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
        <Button onClick={loadShops} disabled={loading} className="gap-2">
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
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                </TableCell>
              </TableRow>
            ) : shops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No pharmacies found
                </TableCell>
              </TableRow>
            ) : (
              shops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell className="font-medium">{shop.name}</TableCell>
                  <TableCell className="text-sm">{shop.address}</TableCell>
                  <TableCell>{shop.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={shop.source === "osm" ? "default" : "secondary"}>
                      {shop.source === "osm" ? "OSM" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(shop)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(shop.id)}
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
