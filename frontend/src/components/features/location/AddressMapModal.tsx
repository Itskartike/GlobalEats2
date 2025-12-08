import React, { useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";

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

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

const defaultCenter = {
  lat: 28.6139, // New Delhi
  lng: 77.209,
};

const libraries: "places"[] = ["places"];

export const AddressMapModal: React.FC<AddressMapModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAddress,
  title = "Add New Address",
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    label: initialAddress?.label || "",
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

  const [mapCenter, setMapCenter] = useState(
    initialAddress?.latitude && initialAddress?.longitude
      ? { lat: initialAddress.latitude, lng: initialAddress.longitude }
      : defaultCenter
  );

  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setMapCenter(newCenter);
          setMarkerPosition(newCenter);
          setFormData((prev) => ({
            ...prev,
            latitude: newCenter.lat,
            longitude: newCenter.lng,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to get your current location");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  }, []);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newPosition = { lat, lng };

      setMarkerPosition(newPosition);
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));

      // Reverse geocode to get address
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const addressComponents = results[0].address_components;
          const formattedAddress = results[0].formatted_address;

          let city = "";
          let state = "";
          let postal_code = "";
          let country = "";

          addressComponents?.forEach((component) => {
            const types = component.types;
            if (types.includes("locality")) {
              city = component.long_name;
            } else if (types.includes("administrative_area_level_1")) {
              state = component.long_name;
            } else if (types.includes("postal_code")) {
              postal_code = component.long_name;
            } else if (types.includes("country")) {
              country = component.long_name;
            }
          });

          setFormData((prev) => ({
            ...prev,
            street_address: formattedAddress,
            city: city || prev.city,
            state: state || prev.state,
            pincode: postal_code || prev.pincode,
            country: country || prev.country,
          }));
        }
      });
    }
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        const newPosition = { lat, lng };

        setMapCenter(newPosition);
        setMarkerPosition(newPosition);

        // Update form with place details
        const addressComponents = place.address_components;
        let city = "";
        let state = "";
        let postal_code = "";
        let country = "";

        addressComponents?.forEach((component) => {
          const types = component.types;
          if (types.includes("locality")) {
            city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.long_name;
          } else if (types.includes("postal_code")) {
            postal_code = component.long_name;
          } else if (types.includes("country")) {
            country = component.long_name;
          }
        });

        setFormData((prev) => ({
          ...prev,
          street_address: place.formatted_address || prev.street_address,
          city: city || prev.city,
          state: state || prev.state,
          pincode: postal_code || prev.pincode,
          country: country || prev.country,
          latitude: lat,
          longitude: lng,
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate required fields
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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Map Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Location on Map
              </label>

              {loadError && (
                <div className="text-red-600 mb-4">
                  Error loading Google Maps
                </div>
              )}

              {!isLoaded ? (
                <div className="flex justify-center items-center h-64">
                  <div className="text-gray-500">Loading map...</div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      <Autocomplete
                        onLoad={(autocomplete) => {
                          autocompleteRef.current = autocomplete;
                        }}
                        onPlaceChanged={onPlaceChanged}
                      >
                        <input
                          type="text"
                          placeholder="Search for a location..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </Autocomplete>
                      <Button type="button" onClick={getCurrentLocation}>
                        Current Location
                      </Button>
                    </div>
                  </div>

                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={15}
                    onLoad={onMapLoad}
                    onUnmount={onMapUnmount}
                    onClick={onMapClick}
                    options={{
                      disableDefaultUI: false,
                      zoomControl: true,
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    <Marker position={markerPosition} draggable />
                  </GoogleMap>
                </>
              )}
            </div>

            {/* Address Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Label *
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  placeholder="e.g., Home, Office"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Type
                </label>
                <select
                  value={formData.address_type}
                  onChange={(e) =>
                    handleInputChange(
                      "type",
                      e.target.value as "home" | "work" | "other"
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
