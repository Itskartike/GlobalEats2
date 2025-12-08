import { api } from "./api";
import { loadGoogleMaps } from "../utils/googleMaps";

export interface GoogleMapsPlace {
  place_id: string;
  formatted_address: string;
  name?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface GeocodeResult {
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude: number;
  longitude: number;
}

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

// Google Maps - Reverse Geocoding
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> => {
  try {
    if (!window.google?.maps) {
      throw new Error("Google Maps is not loaded");
    }

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: latitude, lng: longitude };

    return new Promise((resolve, reject) => {
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const result = results[0];
          const addressComponents = result.address_components;

          const getComponent = (types: string[]) => {
            const component = addressComponents?.find(
              (comp: google.maps.GeocoderAddressComponent) =>
                types.some((type) => comp.types.includes(type))
            );
            return component?.long_name || "";
          };

          resolve({
            address: result.formatted_address || "",
            city: getComponent(["locality", "administrative_area_level_2"]),
            state: getComponent(["administrative_area_level_1"]),
            postal_code: getComponent(["postal_code"]),
            country: getComponent(["country"]),
            latitude,
            longitude,
          });
        } else {
          reject(new Error("Geocoding failed: " + status));
        }
      });
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Google Maps - Places Autocomplete Search
export const searchPlaces = async (
  query: string
): Promise<GoogleMapsPlace[]> => {
  try {
    if (!window.google?.maps) {
      throw new Error("Google Maps is not loaded");
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );

    return new Promise((resolve, reject) => {
      const request = {
        query,
        fields: [
          "place_id",
          "formatted_address",
          "name",
          "geometry",
          "address_components",
        ],
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const places: GoogleMapsPlace[] = results.map(
            (place: google.maps.places.PlaceResult) => ({
              place_id: place.place_id || "",
              formatted_address: place.formatted_address || "",
              name: place.name,
              geometry: {
                location: {
                  lat: place.geometry?.location?.lat() || 0,
                  lng: place.geometry?.location?.lng() || 0,
                },
              },
              address_components: place.address_components || [],
            })
          );
          resolve(places);
        } else {
          reject(new Error("Places search failed: " + status));
        }
      });
    });
  } catch (error) {
    console.error("Places search error:", error);
    return [];
  }
};

// Calculate distance between two coordinates (Haversine formula - fallback)
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
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

// Google Maps Distance Matrix API for accurate distance and travel time
export const calculateDistanceWithGoogleMaps = async (
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
  try {
    if (!window.google?.maps) {
      throw new Error("Google Maps is not loaded");
    }

    const service = new window.google.maps.DistanceMatrixService();

    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: origins,
          destinations: destinations,
          travelMode: mode,
          unitSystem: 1, // METRIC
          avoidHighways: false,
          avoidTolls: false,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (response: any, status: string) => {
          if (status === "OK" && response) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const results = response.rows[0].elements.map((element: any) => ({
              distance: element.distance || { text: "N/A", value: 0 },
              duration: element.duration || { text: "N/A", value: 0 },
              status: element.status,
            }));
            resolve(results);
          } else {
            reject(new Error(`Distance Matrix request failed: ${status}`));
          }
        }
      );
    });
  } catch (error) {
    console.error("Google Maps Distance Matrix error:", error);
    throw error;
  }
};

// Enhanced function to find nearby outlets with Google Maps distance calculation
export const findNearbyOutletsWithGoogleMaps = async (
  latitude: number,
  longitude: number,
  radius = 10
): Promise<OutletWithDistance[]> => {
  try {
    // First get outlets from backend (basic distance calculation)
    const response = await api.get(
      `/location/nearby-outlets?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    const outlets: OutletWithDistance[] =
      response.data.data?.outlets || response.data.outlets || response.data;

    if (!outlets || outlets.length === 0) {
      return outlets;
    }

    // If Google Maps is available, enhance with accurate distance/time data
    if (window.google?.maps) {
      try {
        // Ensure Google Maps is loaded
        await loadGoogleMaps();

        const userLocation = [{ lat: latitude, lng: longitude }];
        const outletLocations = outlets.map((outlet: OutletWithDistance) => ({
          lat: outlet.latitude,
          lng: outlet.longitude,
        }));

        const distanceResults = await calculateDistanceWithGoogleMaps(
          userLocation,
          outletLocations,
          "DRIVING"
        );

        // Enhance outlets with Google Maps data
        return outlets
          .map((outlet: OutletWithDistance, index: number) => {
            const distanceData = distanceResults[index];
            if (distanceData && distanceData.status === "OK") {
              return {
                ...outlet,
                distance: distanceData.distance.value / 1000, // Convert meters to km
                distanceText: distanceData.distance.text,
                duration: distanceData.duration.value / 60, // Convert seconds to minutes
                durationText: distanceData.duration.text,
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
        console.warn(
          "Google Maps distance calculation failed, using basic calculation:",
          error
        );
        return outlets;
      }
    }

    return outlets;
  } catch (error) {
    console.error("Error finding nearby outlets:", error);
    throw error;
  }
};

// Original function for backward compatibility
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
