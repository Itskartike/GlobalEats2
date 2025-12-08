import React, { useState, useCallback } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import {
  getCurrentLocation,
  reverseGeocode,
} from "../../services/locationService";

const libraries: "places"[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 28.6139, // Delhi, India
  lng: 77.209,
};

interface AddressMapSelectorProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }) => void;
  initialLocation?: {
    lat: number;
    lng: number;
  };
  className?: string;
}

export const AddressMapSelector: React.FC<AddressMapSelectorProps> = ({
  onLocationSelect,
  initialLocation,
  className = "",
}) => {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation || defaultCenter
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

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

  const handleMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setSelectedLocation({ lat, lng });
        setIsLoadingLocation(true);

        try {
          const geocodeResult = await reverseGeocode(lat, lng);
          if (geocodeResult) {
            onLocationSelect({
              latitude: lat,
              longitude: lng,
              address: geocodeResult.address,
              city: geocodeResult.city,
              state: geocodeResult.state,
              postal_code: geocodeResult.postal_code,
              country: geocodeResult.country,
            });
          }
        } catch (error) {
          console.error("Error getting address:", error);
        } finally {
          setIsLoadingLocation(false);
        }
      }
    },
    [onLocationSelect]
  );

  const getCurrentLocationHandler = useCallback(async () => {
    setIsLoadingLocation(true);

    try {
      const position = await getCurrentLocation();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setSelectedLocation({ lat, lng });

      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(16);
      }

      const geocodeResult = await reverseGeocode(lat, lng);
      if (geocodeResult) {
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: geocodeResult.address,
          city: geocodeResult.city,
          state: geocodeResult.state,
          postal_code: geocodeResult.postal_code,
          country: geocodeResult.country,
        });
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      // You might want to show a toast or alert here
    } finally {
      setIsLoadingLocation(false);
    }
  }, [map, onLocationSelect]);

  if (loadError) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <p className="text-red-800">Error loading Google Maps</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-96 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Current Location Button */}
      <button
        onClick={getCurrentLocationHandler}
        disabled={isLoadingLocation}
        className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-50 disabled:bg-gray-100 shadow-lg rounded-lg p-2 border border-gray-200 transition-colors"
        title="Get Current Location"
      >
        {isLoadingLocation ? (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedLocation}
        zoom={15}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
        onClick={handleMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <Marker
          position={selectedLocation}
          animation={google.maps.Animation.DROP}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(32, 32),
          }}
        />
      </GoogleMap>

      {/* Instructions */}
      <div className="mt-2 text-sm text-gray-600">
        <p>📍 Click on the map to select your delivery location</p>
        <p>🎯 Or use the location button to get your current position</p>
      </div>
    </div>
  );
};
