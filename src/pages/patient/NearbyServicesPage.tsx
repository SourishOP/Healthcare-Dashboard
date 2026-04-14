import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { MapPin, Hospital, Pill, Stethoscope, Home, Navigation, Loader2, AlertCircle, Phone, Clock, ExternalLink, Star, MapPinIcon, X } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Place {
  id: string;
  name: string;
  type: "hospital" | "pharmacy" | "doctor" | "nursing_home";
  latitude: number;
  longitude: number;
  distance: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  opening_time?: string;
  closing_time?: string;
  is_open_24h?: boolean;
  specialization?: string;
  experience_years?: number;
  description?: string;
  image_url?: string;
}

type ServiceType = "pharmacy" | "hospital" | "doctor" | "nursing_home";

const serviceSearchTerms: Record<ServiceType, { icon: React.FC<React.SVGProps<SVGSVGElement>>; label: string; color: string; searchTerms: string[] }> = {
  pharmacy: { icon: Pill, label: "Pharmacies", color: "text-primary", searchTerms: ["pharmacy", "chemist", "drugstore"] },
  hospital: { icon: Hospital, label: "Hospitals", color: "text-destructive", searchTerms: ["hospital", "clinic", "medical center"] },
  doctor: { icon: Stethoscope, label: "Doctors", color: "text-info", searchTerms: ["doctor", "physician", "medical practice"] },
  nursing_home: { icon: Home, label: "Nursing Homes", color: "text-success", searchTerms: ["nursing home", "care home", "aged care"] },
};

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function NearbyServicesPage() {
  const [location, setLocation] = useState<{ lat: number; lon: number }>({ lat: 28.7041, lon: 77.1025 }); // Default: Delhi
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeType, setActiveType] = useState<ServiceType>("pharmacy");
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showMapDialog, setShowMapDialog] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported. Using default location (Delhi).");
      toast.info("Using default location (Delhi)");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationError("");
        toast.success("Location detected");
      },
      (err) => {
        setLocationError("Location access denied. Using default location (Delhi).");
        setLocation({ lat: 28.7041, lon: 77.1025 });
        toast.info("Using default location (Delhi)");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleCustomLocation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customLocation) {
      const [lat, lon] = customLocation.split(",").map(s => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lon)) {
        setLocation({ lat, lon });
        setLocationError("");
        setCustomLocation("");
        toast.success("Location updated");
      } else {
        setLocationError("Invalid coordinates. Use format: lat,lon");
        toast.error("Invalid coordinates");
      }
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (!location) return;

    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const config = serviceSearchTerms[activeType];
        const radiusKm = 10;

        // Use first search term for Nominatim
        const searchQuery = `${config.searchTerms[0]} near ${location.lat},${location.lon}`;

        // Query Nominatim API (OpenStreetMap's official search engine)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
            q: searchQuery,
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

        if (!response.ok) {
          throw new Error("Nominatim API error");
        }

        const results = await response.json() as Array<Record<string, unknown>>;

        // Convert Nominatim results to Place objects
        const placesWithDistance: Place[] = results
          .map((result: Record<string, unknown>, idx: number) => {
            const lat = parseFloat(String(result.lat));
            const lon = parseFloat(String(result.lon));
            const distance = haversineDistance(location.lat, location.lon, lat, lon);

            if (distance > radiusKm) return null;

            const displayName = String(result.display_name || "");
            const name = String(result.name || displayName.split(",")[0] || "Unknown");
            const extratags = result.extratags as Record<string, unknown> | undefined;

            return {
              id: `nominatim-${result.osm_id}`,
              name: name,
              type: activeType,
              latitude: lat,
              longitude: lon,
              distance: distance,
              address: displayName || "Address not available",
              phone: extratags?.phone ? String(extratags.phone) : undefined,
              website: extratags?.website ? String(extratags.website) : undefined,
              rating: extratags?.rating ? parseFloat(String(extratags.rating)) : undefined,
              opening_time: undefined,
              closing_time: undefined,
              is_open_24h: false,
              specialization: undefined,
              experience_years: undefined,
              description: undefined,
              image_url: undefined,
            } as Place;
          })
          .filter((p): p is Place => p !== null)
          .sort((a: Place, b: Place) => a.distance - b.distance);

        setPlaces(placesWithDistance);
      } catch (error) {
        console.error("Error fetching from Nominatim API:", error);
        toast.error("Failed to fetch nearby services. Please try again.");
        setPlaces([]);
      }
      setLoading(false);
    };

    fetchPlaces();
  }, [location, activeType]);

  const openDirections = (place: Place) => {
    setSelectedPlace(place);
    setShowMapDialog(true);
  };

  const openOnMaps = (place: Place) => {
    window.open(
      `https://www.google.com/maps/search/${encodeURIComponent(place.name)}/@${place.latitude},${place.longitude},18z`,
      "_blank"
    );
  };

  if (locationError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nearby Services</h1>
          <p className="text-muted-foreground">Find hospitals, pharmacies, doctors & nursing homes near you</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-12 text-center shadow-card">
          <AlertCircle className="mx-auto h-10 w-10 text-warning mb-3" />
          <p className="text-foreground font-medium mb-2">Location Access Required</p>
          <p className="text-muted-foreground text-sm mb-4">{locationError}</p>
          <Button onClick={getLocation} className="gradient-primary text-primary-foreground">
            <Navigation className="mr-2 h-4 w-4" /> Enable Location
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nearby Services</h1>
        <p className="text-muted-foreground">
          {location
            ? `Showing results within 10km of your location (${location.lat.toFixed(4)}, ${location.lon.toFixed(4)})`
            : "Detecting your location..."}
        </p>
      </div>

      <Tabs value={activeType} onValueChange={(v) => setActiveType(v as ServiceType)}>
        <TabsList className="bg-muted/50">
          {Object.entries(serviceSearchTerms).map(([key, cfg]) => (
            <TabsTrigger key={key} value={key} className="gap-1.5">
              <cfg.icon className="h-3.5 w-3.5" />
              {cfg.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : places.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center shadow-card">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No {serviceSearchTerms[activeType].label.toLowerCase()} found nearby
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {places.slice(0, 30).map((place, i) => {
            const cfg = serviceSearchTerms[activeType];
            return (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-lg border border-border bg-card p-4 shadow-card hover:border-primary/30 transition-colors overflow-hidden"
              >
                {place.image_url && (
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${cfg.color}`}>
                      <cfg.icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{place.name}</h3>
                      {place.specialization && (
                        <p className="text-xs text-muted-foreground">
                          {place.specialization}
                        </p>
                      )}
                      {place.experience_years && (
                        <p className="text-xs text-muted-foreground">
                          {place.experience_years} years exp.
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs whitespace-nowrap">
                    {place.distance < 1
                      ? `${(place.distance * 1000).toFixed(0)}m`
                      : `${place.distance.toFixed(1)}km`}
                  </Badge>
                </div>

                {place.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-medium">{place.rating}/5</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mb-3 line-clamp-1">
                  <MapPinIcon className="h-3 w-3 inline mr-1" />
                  {place.address}
                </p>

                <div className="flex flex-wrap gap-1.5 text-xs text-muted-foreground mb-3">
                  {place.phone && (
                    <Badge variant="outline" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      {place.phone}
                    </Badge>
                  )}
                  {place.is_open_24h && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-700 border-green-500/20">
                      <Clock className="h-3 w-3 mr-1" />
                      24/7
                    </Badge>
                  )}
                  {place.opening_time && !place.is_open_24h && (
                    <Badge variant="outline" className="text-xs">
                      {place.opening_time} - {place.closing_time}
                    </Badge>
                  )}
                </div>

                {place.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {place.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => openDirections(place)}
                  >
                    <Navigation className="mr-1 h-3 w-3" />
                    Directions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => openOnMaps(place)}
                  >
                    <MapPin className="h-3 w-3" />
                  </Button>
                  {place.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => window.open(place.website, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Map Dialog */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="border-b px-6 py-4 flex flex-row items-center justify-between">
            <DialogTitle>{selectedPlace?.name}</DialogTitle>
            <DialogClose className="opacity-70 hover:opacity-100" />
          </DialogHeader>
          <div className="overflow-hidden" style={{ height: "500px" }}>
            {selectedPlace && (
              <iframe
                width="100%"
                height="500"
                style={{ border: 0, display: "block" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedPlace.longitude - 0.01},${selectedPlace.latitude - 0.01},${selectedPlace.longitude + 0.01},${selectedPlace.latitude + 0.01}&layer=mapnik&marker=${selectedPlace.latitude},${selectedPlace.longitude}`}
              ></iframe>
            )}
          </div>
          <div className="border-t p-4 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(
                `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lon}&destination=${selectedPlace?.latitude},${selectedPlace?.longitude}`,
                "_blank"
              )}
            >
              <Navigation className="mr-2 h-4 w-4" />
              Open in Google Maps
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(
                `https://www.openstreetmap.org/directions?engine=osrm_car&route=${location.lat},${location.lon};${selectedPlace?.latitude},${selectedPlace?.longitude}`,
                "_blank"
              )}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Open in OpenStreetMap
            </Button>
            <Button
              variant="default"
              onClick={() => setShowMapDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
