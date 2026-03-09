import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { reverseGeocode, searchPlaces, NominatimPlace } from "../../../utils/nominatim";

// Fix Leaflet default marker icons broken by Vite bundling
// (canonical fix: delete the broken _getIconUrl and set URLs directly)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddressFormData {
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address_type: "home" | "work" | "other";
  landmark?: string;
  instructions?: string;
  is_default?: boolean;
}

interface AddressMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: AddressFormData) => Promise<void>;
  initialAddress?: Partial<AddressFormData>;
  title?: string;
}

// ─── Map helpers ─────────────────────────────────────────────────────────────

const DEFAULT_CENTER: [number, number] = [28.6139, 77.209]; // New Delhi

// Re-centers the map when markerPos changes from outside
const MapPanner: React.FC<{ position: [number, number] }> = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

// Handles map click events
const MapClickHandler: React.FC<{
  onClick: (lat: number, lng: number) => void;
}> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// ─── Component ───────────────────────────────────────────────────────────────

export const AddressMapModal: React.FC<AddressMapModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  title = "Add New Address",
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    label: initialAddress?.label || initialAddress?.address_type || "home",
    recipient_name: initialAddress?.recipient_name || "",
    phone: initialAddress?.phone || "",
    street_address: initialAddress?.street_address || "",
    apartment: initialAddress?.apartment || "",
    city: initialAddress?.city || "",
    state: initialAddress?.state || "",
    pincode: initialAddress?.pincode || "",
    country: initialAddress?.country || "India",
    latitude: initialAddress?.latitude,
    longitude: initialAddress?.longitude,
    address_type: initialAddress?.address_type || "home",
    landmark: initialAddress?.landmark || "",
    instructions: initialAddress?.instructions || "",
    is_default: initialAddress?.is_default || false,
  });

  const [markerPosition, setMarkerPosition] = useState<[number, number]>(
    initialAddress?.latitude && initialAddress?.longitude
      ? [initialAddress.latitude, initialAddress.longitude]
      : DEFAULT_CENTER
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Autocomplete state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Autocomplete ────────────────────────────────────────────────────────────

  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchPlaces(value);
      setSuggestions(results);
      setIsSearching(false);
    }, 400); // debounce 400ms to respect Nominatim's rate limit
  };

  const handleSuggestionSelect = (place: NominatimPlace) => {
    const lat = place.lat;
    const lng = place.lng;
    setMarkerPosition([lat, lng]);
    setSearchQuery(place.display_name);
    setSuggestions([]);

    setFormData((prev) => ({
      ...prev,
      street_address: place.display_name,
      city: place.address.city || prev.city,
      state: place.address.state || prev.state,
      pincode: place.address.postcode || prev.pincode,
      country: place.address.country || prev.country,
      latitude: lat,
      longitude: lng,
    }));
  };

  // ── Map click → reverse geocode ─────────────────────────────────────────────

  const handleMapClick = useCallback(async (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

    const result = await reverseGeocode(lat, lng);
    if (result) {
      setFormData((prev) => ({
        ...prev,
        street_address: result.address,
        city: result.city || prev.city,
        state: result.state || prev.state,
        pincode: result.postal_code || prev.pincode,
        country: result.country || prev.country,
      }));
      setSearchQuery(result.address);
    }
  }, []);

  // ── Current location ────────────────────────────────────────────────────────

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarkerPosition([lat, lng]);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));

        const result = await reverseGeocode(lat, lng);
        if (result) {
          setFormData((prev) => ({
            ...prev,
            street_address: result.address,
            city: result.city || prev.city,
            state: result.state || prev.state,
            pincode: result.postal_code || prev.pincode,
            country: result.country || prev.country,
          }));
          setSearchQuery(result.address);
        }
      },
      () => setError("Unable to get your current location")
    );
  }, []);

  const handlePhoneChange = (value: string) => {
    // Allow digits only, max 10
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: digits }));
    if (digits.length > 0 && digits.length < 10) {
      setPhoneError("Phone number must be exactly 10 digits");
    } else {
      setPhoneError(null);
    }
  };

  // ── Form submit ─────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (
        !formData.label ||
        !formData.recipient_name ||
        !formData.phone ||
        !formData.street_address ||
        !formData.city ||
        !formData.state ||
        !formData.pincode
      ) {
        throw new Error("Please fill in all required fields");
      }

      if (formData.phone.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits");
        setIsLoading(false);
        return;
      }

      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* ── Map Section ── */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location on Map
              </label>

              {/* Search box */}
              <div className="relative mb-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearchInput(e.target.value)}
                      placeholder="Search for a location..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {isSearching && (
                      <span className="absolute right-3 top-2.5 text-gray-400 text-sm">
                        Searching…
                      </span>
                    )}
                    {/* Suggestions dropdown */}
                    {suggestions.length > 0 && (
                      <ul className="absolute z-[9999] w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-52 overflow-y-auto">
                        {suggestions.map((place) => (
                          <li
                            key={place.place_id}
                            onClick={() => handleSuggestionSelect(place)}
                            className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                          >
                            <span className="font-medium text-gray-800">
                              {place.name || place.address.city || ""}
                            </span>
                            {place.name && (
                              <span className="text-gray-500 text-xs block truncate">
                                {place.display_name}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Button type="button" onClick={handleCurrentLocation}>
                    📍 Current
                  </Button>
                </div>
              </div>

              {/* Leaflet Map */}
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                  center={markerPosition}
                  zoom={15}
                  style={{ height: "200px", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapPanner position={markerPosition} />
                  <MapClickHandler onClick={handleMapClick} />
                  <Marker
                    position={markerPosition}
                    draggable
                    eventHandlers={{
                      dragend(e) {
                        const latlng = e.target.getLatLng();
                        handleMapClick(latlng.lat, latlng.lng);
                      },
                    }}
                  />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click on the map or drag the pin to set your delivery location.
              </p>
            </div>

            {/* ── Address Form ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Address Type — single icon picker replaces label+type fields */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Type *
                </label>
                <div className="flex gap-3">
                  {([
                    { value: "home", icon: "🏠", label: "Home" },
                    { value: "work", icon: "💼", label: "Work" },
                    { value: "other", icon: "📍", label: "Other" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          address_type: opt.value,
                          label: opt.label,
                        }));
                      }}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${
                        formData.address_type === opt.value
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-orange-300"
                      }`}
                    >
                      <span className="text-2xl">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={formData.recipient_name}
                  onChange={(e) =>
                    handleInputChange("recipient_name", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    phoneError
                      ? "border-red-400 focus:ring-red-300"
                      : "border-gray-300 focus:ring-orange-500"
                  }`}
                  required
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <textarea
                  value={formData.street_address}
                  onChange={(e) =>
                    handleInputChange("street_address", e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment/Unit
                </label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={(e) =>
                    handleInputChange("apartment", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) =>
                    handleInputChange("landmark", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) =>
                    handleInputChange("pincode", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) =>
                    handleInputChange("country", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange("instructions", e.target.value)
                  }
                  rows={2}
                  placeholder="e.g., Ring the doorbell, Call on arrival"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) =>
                      handleInputChange("is_default", e.target.checked)
                    }
                    className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Set as default address
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                Save Address
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
