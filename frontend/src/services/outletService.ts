import { api } from "./api";
import { Outlet } from "../types";

export interface NearbyOutletsResponse {
  success: boolean;
  data: {
    outlets: Outlet[];
    totalCount: number;
    searchRadius: number;
    userLocation: {
      latitude: number;
      longitude: number;
    };
  };
}

export interface DeliveryCheckResponse {
  success: boolean;
  data: {
    outletId: string;
    outletName: string;
    distance: number;
    deliveryRadius: number;
    isDeliveryAvailable: boolean;
  };
}

export const outletService = {
  // Find nearby outlets within specified radius (default 5km)
  findNearbyOutlets: async (
    latitude: number,
    longitude: number,
    radius: number = 5
  ): Promise<NearbyOutletsResponse> => {
    const response = await api.get("/outlets/nearby", {
      params: {
        latitude,
        longitude,
        radius,
      },
    });
    return response.data;
  },

  // Get outlet details by ID
  getOutletById: async (
    id: string
  ): Promise<{ success: boolean; data: Outlet }> => {
    const response = await api.get(`/outlets/${id}`);
    return response.data;
  },

  // Check if outlet delivers to a specific location
  checkDeliveryAvailability: async (
    outletId: string,
    latitude: number,
    longitude: number
  ): Promise<DeliveryCheckResponse> => {
    const response = await api.get(`/outlets/${outletId}/delivery-check`, {
      params: {
        latitude,
        longitude,
      },
    });
    return response.data;
  },

  // Get user's current location using browser's geolocation API
  getCurrentLocation: (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          let errorMessage = "Failed to get location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  },
};
