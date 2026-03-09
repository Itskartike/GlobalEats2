import { api } from "./api";
import {
  reverseGeocode as nominatimReverseGeocode,
  searchPlaces as nominatimSearchPlaces,
  GeocodeResult,
  NominatimPlace,
} from "../utils/nominatim";

export type { GeocodeResult, NominatimPlace as GoogleMapsPlace };

export interface OutletWithDistance {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceText?: string;
  duration?: number;
  durationText?: string;
  travelMode?: string;
}

// Get user's current location
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};

// Reverse Geocoding via Nominatim
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> => {
  return nominatimReverseGeocode(latitude, longitude);
};

// Place search via Nominatim
export const searchPlaces = async (
  query: string
): Promise<NominatimPlace[]> => {
  return nominatimSearchPlaces(query);
};

// Calculate distance between two coordinates (Haversine formula)
// Used as primary distance calculator (no API key required)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

// OpenRouteService Distance Matrix API (free tier: 2000 req/day)
// Requires VITE_ORS_API_KEY in .env — falls back to Haversine if not set
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY || "";
const ORS_BASE = "https://api.openrouteservice.org";

const ORS_PROFILE_MAP: Record<string, string> = {
  DRIVING: "driving-car",
  WALKING: "foot-walking",
  BICYCLING: "cycling-regular",
  TRANSIT: "driving-car", // ORS doesn't support transit — fall back to driving
};

export const calculateDistanceWithORS = async (
  origins: Array<{ lat: number; lng: number }>,
  destinations: Array<{ lat: number; lng: number }>,
  mode: "DRIVING" | "WALKING" | "TRANSIT" | "BICYCLING" = "DRIVING"
): Promise<
  Array<{
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    status: string;
  }>
> => {
  if (!ORS_API_KEY) {
    // Graceful fallback: use Haversine for each pair
    return destinations.map((dest) => {
      const origin = origins[0];
      const km = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
      const estimatedMinutes = Math.round((km / 40) * 60); // assume 40 km/h avg
      return {
        distance: {
          text: `${km.toFixed(1)} km`,
          value: km * 1000,
        },
        duration: {
          text: `${estimatedMinutes} min`,
          value: estimatedMinutes * 60,
        },
        status: "OK",
      };
    });
  }

  try {
    const profile = ORS_PROFILE_MAP[mode] || "driving-car";

    // ORS matrix API takes [lng, lat] (GeoJSON order)
    const allLocations = [
      ...origins.map((o) => [o.lng, o.lat]),
      ...destinations.map((d) => [d.lng, d.lat]),
    ];

    const sources = origins.map((_, i) => i);
    const dests = destinations.map((_, i) => origins.length + i);

    const response = await fetch(
      `${ORS_BASE}/v2/matrix/${profile}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: ORS_API_KEY,
        },
        body: JSON.stringify({
          locations: allLocations,
          sources,
          destinations: dests,
          metrics: ["distance", "duration"],
          units: "km",
        }),
      }
    );

    if (!response.ok) throw new Error(`ORS error: ${response.status}`);

    const data = await response.json();

    // ORS returns distances[source][dest] and durations[source][dest]
    const distances: number[] = data.distances?.[0] || [];
    const durations: number[] = data.durations?.[0] || [];

    return destinations.map((_, i) => {
      const km = distances[i] ?? 0;
      const secs = durations[i] ?? 0;
      const mins = Math.round(secs / 60);

      return {
        distance: {
          text: `${km.toFixed(1)} km`,
          value: km * 1000,
        },
        duration: {
          text: mins >= 60
            ? `${Math.floor(mins / 60)} hr ${mins % 60} min`
            : `${mins} min`,
          value: secs,
        },
        status: "OK",
      };
    });
  } catch (error) {
    console.error("ORS Distance Matrix error:", error);
    // Fallback to Haversine
    return destinations.map((dest) => {
      const origin = origins[0];
      const km = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
      const estimatedMinutes = Math.round((km / 40) * 60);
      return {
        distance: { text: `${km.toFixed(1)} km`, value: km * 1000 },
        duration: { text: `${estimatedMinutes} min`, value: estimatedMinutes * 60 },
        status: "OK",
      };
    });
  }
};

// Backward-compat alias used by GoogleMapsDistanceDemo
export const calculateDistanceWithGoogleMaps = calculateDistanceWithORS;

// Find nearby outlets and enrich with real road distances from ORS
export const findNearbyOutletsWithGoogleMaps = async (
  latitude: number,
  longitude: number,
  radius = 10
): Promise<OutletWithDistance[]> => {
  try {
    const response = await api.get(
      `/location/nearby-outlets?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    const outlets: OutletWithDistance[] =
      response.data.data?.outlets || response.data.outlets || response.data;

    if (!outlets || outlets.length === 0) return outlets;

    try {
      const userLocation = [{ lat: latitude, lng: longitude }];
      const outletLocations = outlets.map((outlet: OutletWithDistance) => ({
        lat: outlet.latitude,
        lng: outlet.longitude,
      }));

      const distanceResults = await calculateDistanceWithORS(
        userLocation,
        outletLocations,
        "DRIVING"
      );

      return outlets
        .map((outlet: OutletWithDistance, index: number) => {
          const d = distanceResults[index];
          if (d && d.status === "OK") {
            return {
              ...outlet,
              distance: d.distance.value / 1000,
              distanceText: d.distance.text,
              duration: d.duration.value / 60,
              durationText: d.duration.text,
              travelMode: "DRIVING",
            };
          }
          return outlet;
        })
        .sort(
          (a: OutletWithDistance, b: OutletWithDistance) =>
            a.distance - b.distance
        );
    } catch (error) {
      console.warn("Distance enrichment failed, using basic calculation:", error);
      return outlets;
    }
  } catch (error) {
    console.error("Error finding nearby outlets:", error);
    throw error;
  }
};

// Original simple function (kept for backward compatibility)
export const findNearbyOutlets = async (
  latitude: number,
  longitude: number,
  radius = 10
) => {
  try {
    const response = await api.get(
      `/location/nearby-outlets?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    return response.data;
  } catch (error) {
    console.error("Error finding nearby outlets:", error);
    throw error;
  }
};

// Get available brands in user's area
export const getAvailableBrands = async (
  latitude: number,
  longitude: number,
  radius = 10
) => {
  try {
    const response = await api.get(
      `/location/available-brands?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting available brands:", error);
    throw error;
  }
};

// Get brand menu with nearest outlet info
export const getBrandMenuWithLocation = async (
  brandId: string,
  latitude: number,
  longitude: number
) => {
  try {
    const response = await api.get(
      `/location/brand-menu/${brandId}?latitude=${latitude}&longitude=${longitude}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting brand menu with location:", error);
    throw error;
  }
};

// Set delivery location
export const setDeliveryLocation = async (locationData: {
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
  city?: string;
  postal_code?: string;
}) => {
  try {
    const response = await api.post(
      "/location/set-delivery-location",
      locationData
    );
    return response.data;
  } catch (error) {
    console.error("Error setting delivery location:", error);
    throw error;
  }
};
