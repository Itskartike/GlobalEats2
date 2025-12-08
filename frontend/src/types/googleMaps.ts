// Google Maps API Type Declarations for Global Eats
// This file provides minimal type definitions for Google Maps API features we use

declare global {
  interface Window {
    google?: {
      maps: {
        Geocoder: new () => {
          geocode(
            request: {
              location?: { lat: number; lng: number };
              address?: string;
            },
            callback: (results: any[] | null, status: string) => void
          ): void;
        };
        DistanceMatrixService: new () => {
          getDistanceMatrix(
            request: {
              origins: { lat: number; lng: number }[];
              destinations: { lat: number; lng: number }[];
              travelMode: string;
              unitSystem: number;
              avoidHighways?: boolean;
              avoidTolls?: boolean;
            },
            callback: (response: any | null, status: string) => void
          ): void;
        };
        LatLng: new (
          lat: number,
          lng: number
        ) => {
          lat(): number;
          lng(): number;
        };
        TravelMode: {
          DRIVING: string;
          WALKING: string;
          TRANSIT: string;
          BICYCLING: string;
        };
        UnitSystem: {
          METRIC: number;
          IMPERIAL: number;
        };
        GeocoderStatus: {
          OK: string;
          ZERO_RESULTS: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          INVALID_REQUEST: string;
          UNKNOWN_ERROR: string;
          ERROR: string;
        };
        DistanceMatrixStatus: {
          OK: string;
          INVALID_REQUEST: string;
          MAX_DIMENSIONS_EXCEEDED: string;
          MAX_ELEMENTS_EXCEEDED: string;
          OVER_QUERY_LIMIT: string;
          REQUEST_DENIED: string;
          UNKNOWN_ERROR: string;
        };
        places?: {
          PlacesService: new (element: HTMLElement) => {
            textSearch(
              request: {
                query: string;
                bounds?: any;
                location?: { lat: number; lng: number };
                radius?: number;
              },
              callback: (results: any[] | null, status: string) => void
            ): void;
          };
          PlacesServiceStatus: {
            OK: string;
            ZERO_RESULTS: string;
            OVER_QUERY_LIMIT: string;
            REQUEST_DENIED: string;
            INVALID_REQUEST: string;
            UNKNOWN_ERROR: string;
          };
        };
      };
    };
    initMap?: () => void;
  }
}

// Re-export for module system compatibility
export {};
