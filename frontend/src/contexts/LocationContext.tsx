import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Outlet } from "../types/index";
import { Brand } from "../types/brand";
import { outletService } from "../services/outletService";
import { loadGoogleMaps } from "../utils/googleMaps";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  error: string | null;
  isModalOpen: boolean;
  isLoading: boolean;
  selectedOutlet: Outlet | null;
  nearbyOutlets: Outlet[];
  isLocationPermissionGranted: boolean;
}

interface LocationContextProps extends LocationState {
  fetchLocation: () => void;
  setLocation: (lat: number, lon: number, address: string) => void;
  openModal: () => void;
  closeModal: () => void;
  setSelectedOutlet: (outlet: Outlet | null) => void;
  searchLocationByAddress: (address: string) => Promise<void>;
  clearLocation: () => void;
  findNearestOutlet: () => Promise<void>;
  getOutletBrands: (
    outletId: string
  ) => Promise<{ outlet: Outlet; brands: Brand[]; totalBrands: number }>;
}

const LocationContext = createContext<LocationContextProps | undefined>(
  undefined
);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    address: "Click to set your location",
    error: null,
    isModalOpen: false,
    isLoading: false,
    selectedOutlet: null,
    nearbyOutlets: [],
    isLocationPermissionGranted: false,
  });

  const setLocation = useCallback(
    (latitude: number, longitude: number, address: string) => {
      setState((prevState) => ({
        ...prevState,
        latitude,
        longitude,
        address,
        error: null,
      }));
      localStorage.setItem(
        "userLocation",
        JSON.stringify({ latitude, longitude, address })
      );
    },
    []
  );

  // Enhanced location fetching with better error handling
  const fetchLocation = useCallback(() => {
    setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

    if (!navigator.geolocation) {
      setState((prevState) => ({
        ...prevState,
        error: "Geolocation is not supported by your browser.",
        isLoading: false,
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Try to get address using Google Maps Geocoding
          let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          try {
            await loadGoogleMaps();
            if (window.google?.maps?.Geocoder) {
              const geocoder = new window.google.maps.Geocoder();
              const result = await new Promise<google.maps.GeocoderResponse>(
                (resolve, reject) => {
                  geocoder.geocode(
                    { location: { lat: latitude, lng: longitude } },
                    (results, status) => {
                      if (status === "OK" && results && results[0]) {
                        resolve({ results } as google.maps.GeocoderResponse);
                      } else {
                        reject(new Error("Geocoding failed"));
                      }
                    }
                  );
                }
              );

              if (result.results?.[0]) {
                address = result.results[0].formatted_address;
              }
            }
          } catch (geocodingError) {
            console.warn(
              "Geocoding failed, using coordinates:",
              geocodingError
            );
          }

          setLocation(latitude, longitude, address);

          // Fetch nearby outlets
          const response = await outletService.findNearbyOutlets(
            latitude,
            longitude
          );

          // Auto-select nearest outlet if outlets found
          if (response.data.outlets && response.data.outlets.length > 0) {
            const nearest = response.data.outlets[0];
            setState((prevState) => ({
              ...prevState,
              nearbyOutlets: response.data.outlets,
              selectedOutlet: nearest,
              isLoading: false,
              isLocationPermissionGranted: true,
            }));
            localStorage.setItem("selectedOutlet", JSON.stringify(nearest));
          } else {
            setState((prevState) => ({
              ...prevState,
              nearbyOutlets: [],
              selectedOutlet: null,
              isLoading: false,
              isLocationPermissionGranted: true,
              error: "No outlets found in your area",
            }));
          }
        } catch (outletError) {
          console.error("Error fetching outlets:", outletError);
          setState((prevState) => ({
            ...prevState,
            error: "Could not fetch nearby outlets.",
            isLoading: false,
          }));
        }
      },
      (error) => {
        let errorMessage = "Location access denied.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location services.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setState((prevState) => ({
          ...prevState,
          error: errorMessage,
          isLoading: false,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [setLocation]);

  // Search location by address using Google Maps Geocoding
  const searchLocationByAddress = useCallback(
    async (searchAddress: string) => {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

      try {
        await loadGoogleMaps();

        if (!window.google?.maps?.Geocoder) {
          throw new Error("Google Maps Geocoding not available");
        }

        const geocoder = new window.google.maps.Geocoder();
        const result = await new Promise<google.maps.GeocoderResponse>(
          (resolve, reject) => {
            geocoder.geocode({ address: searchAddress }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                resolve({ results } as google.maps.GeocoderResponse);
              } else {
                reject(new Error("Address not found"));
              }
            });
          }
        );

        if (result.results?.[0]) {
          const location = result.results[0].geometry.location;
          const latitude = location.lat();
          const longitude = location.lng();
          const formattedAddress = result.results[0].formatted_address;

          setLocation(latitude, longitude, formattedAddress);

          // Fetch nearby outlets for the searched location
          const response = await outletService.findNearbyOutlets(
            latitude,
            longitude
          );

          // Auto-select nearest outlet if outlets found
          if (response.data.outlets && response.data.outlets.length > 0) {
            const nearest = response.data.outlets[0];
            setState((prevState) => ({
              ...prevState,
              nearbyOutlets: response.data.outlets,
              selectedOutlet: nearest,
              isLoading: false,
              isLocationPermissionGranted: true,
            }));
            localStorage.setItem("selectedOutlet", JSON.stringify(nearest));
          } else {
            setState((prevState) => ({
              ...prevState,
              nearbyOutlets: [],
              selectedOutlet: null,
              isLoading: false,
              isLocationPermissionGranted: true,
              error: "No outlets found in this area",
            }));
          }
        }
      } catch (searchError) {
        console.error("Address search error:", searchError);
        setState((prevState) => ({
          ...prevState,
          error: "Could not find the specified address. Please try again.",
          isLoading: false,
        }));
      }
    },
    [setLocation]
  );

  // Load saved location on mount
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      try {
        const { latitude, longitude, address } = JSON.parse(storedLocation);
        setState((prevState) => ({
          ...prevState,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address,
          isLocationPermissionGranted: true,
        }));

        // Fetch nearby outlets for saved location
        outletService
          .findNearbyOutlets(parseFloat(latitude), parseFloat(longitude))
          .then((response) => {
            if (response.data.outlets && response.data.outlets.length > 0) {
              const nearest = response.data.outlets[0];
              setState((prevState) => ({
                ...prevState,
                nearbyOutlets: response.data.outlets,
                selectedOutlet: nearest,
              }));
              localStorage.setItem("selectedOutlet", JSON.stringify(nearest));
            } else {
              setState((prevState) => ({
                ...prevState,
                nearbyOutlets: [],
                selectedOutlet: null,
                error: "No outlets found in your saved location",
              }));
            }
          })
          .catch((error) => {
            console.error("Error fetching outlets for saved location:", error);
            setState((prevState) => ({
              ...prevState,
              error: "Could not load outlets for your saved location",
            }));
          });
      } catch (error) {
        console.error("Error parsing saved location:", error);
        localStorage.removeItem("userLocation");
      }
    } else {
      // Show location modal if no saved location
      setState((prevState) => ({ ...prevState, isModalOpen: true }));
    }
  }, []);

  // Clear location data
  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      address: "Click to set your location",
      error: null,
      isModalOpen: false,
      isLoading: false,
      selectedOutlet: null,
      nearbyOutlets: [],
      isLocationPermissionGranted: false,
    });
    localStorage.removeItem("userLocation");
  }, []);

  const openModal = () =>
    setState((prevState) => ({ ...prevState, isModalOpen: true }));
  const closeModal = () =>
    setState((prevState) => ({ ...prevState, isModalOpen: false }));

  const setSelectedOutlet = (outlet: Outlet | null) => {
    setState((prevState) => ({ ...prevState, selectedOutlet: outlet }));
    if (outlet) {
      localStorage.setItem("selectedOutlet", JSON.stringify(outlet));
    } else {
      localStorage.removeItem("selectedOutlet");
    }
  };

  // Find nearest outlet using new API
  const findNearestOutlet = useCallback(async () => {
    if (!state.latitude || !state.longitude) return;

    try {
      setState((prevState) => ({ ...prevState, isLoading: true, error: null }));

      const response = await fetch(
        `http://localhost:5000/api/outlets/nearest?latitude=${state.latitude}&longitude=${state.longitude}`
      );

      if (!response.ok) {
        throw new Error("Failed to find nearest outlet");
      }

      const data = await response.json();

      if (data.success && data.data.outlet) {
        setState((prevState) => ({
          ...prevState,
          selectedOutlet: data.data.outlet,
          isLoading: false,
        }));
        localStorage.setItem(
          "selectedOutlet",
          JSON.stringify(data.data.outlet)
        );
      } else {
        setState((prevState) => ({
          ...prevState,
          error: "No nearby outlets found",
          isLoading: false,
        }));
      }
    } catch (nearestError) {
      console.error("Error finding nearest outlet:", nearestError);
      setState((prevState) => ({
        ...prevState,
        error: "Failed to find nearest outlet",
        isLoading: false,
      }));
    }
  }, [state.latitude, state.longitude]);

  // Get brands for specific outlet
  const getOutletBrands = useCallback(async (outletId: string) => {
    const response = await fetch(
      `http://localhost:5000/api/outlets/${outletId}/brands`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch outlet brands");
    }

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error("No brands found for this outlet");
    }
  }, []);

  const contextValue = useMemo(
    () => ({
      ...state,
      fetchLocation,
      setLocation,
      openModal,
      closeModal,
      setSelectedOutlet,
      searchLocationByAddress,
      clearLocation,
      findNearestOutlet,
      getOutletBrands,
    }),
    [
      state,
      fetchLocation,
      setLocation,
      searchLocationByAddress,
      clearLocation,
      findNearestOutlet,
      getOutletBrands,
    ]
  );

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
