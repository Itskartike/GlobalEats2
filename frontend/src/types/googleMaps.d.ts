// Google Maps type definitions for frontend
declare global {
  interface Window {
    google: {
      maps: {
        Geocoder: new () => google.maps.Geocoder;
        places: {
          PlacesService: new (
            element: HTMLElement
          ) => google.maps.places.PlacesService;
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
  }
}

declare namespace google.maps {
  interface Geocoder {
    geocode(
      request: { location: { lat: number; lng: number } },
      callback: (
        results: google.maps.GeocoderResult[] | null,
        status: google.maps.GeocoderStatus
      ) => void
    ): void;
  }

  interface GeocoderResult {
    formatted_address: string;
    address_components: google.maps.GeocoderAddressComponent[];
  }

  interface GeocoderAddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  enum GeocoderStatus {
    OK = "OK",
    ZERO_RESULTS = "ZERO_RESULTS",
    OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
    REQUEST_DENIED = "REQUEST_DENIED",
    INVALID_REQUEST = "INVALID_REQUEST",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
  }

  namespace places {
    interface PlacesService {
      textSearch(
        request: { query: string; fields: string[] },
        callback: (
          results: google.maps.places.PlaceResult[] | null,
          status: google.maps.places.PlacesServiceStatus
        ) => void
      ): void;
    }

    interface PlaceResult {
      place_id?: string;
      formatted_address?: string;
      name?: string;
      geometry?: {
        location?: {
          lat(): number;
          lng(): number;
        };
      };
      address_components?: google.maps.GeocoderAddressComponent[];
    }

    enum PlacesServiceStatus {
      OK = "OK",
      ZERO_RESULTS = "ZERO_RESULTS",
      OVER_QUERY_LIMIT = "OVER_QUERY_LIMIT",
      REQUEST_DENIED = "REQUEST_DENIED",
      INVALID_REQUEST = "INVALID_REQUEST",
      UNKNOWN_ERROR = "UNKNOWN_ERROR",
    }
  }
}

export {};
