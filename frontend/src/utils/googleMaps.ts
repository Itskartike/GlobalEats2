interface GoogleMapsConfig {
  apiKey: string;
  libraries: string[];
}

// You need to add your Google Maps API key here
// Get it from: https://console.developers.google.com/
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY_HERE";

const config: GoogleMapsConfig = {
  apiKey: GOOGLE_MAPS_API_KEY,
  libraries: ["places", "geometry"],
};

let isLoading = false;
let isLoaded = false;

export const loadGoogleMaps = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded && window.google?.maps) {
      resolve();
      return;
    }

    // If already loading, wait for it
    if (isLoading) {
      const checkLoaded = () => {
        if (isLoaded && window.google?.maps) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Start loading
    isLoading = true;

    // Check if API key is configured
    if (!config.apiKey || config.apiKey === "YOUR_API_KEY_HERE") {
      console.warn(
        "Google Maps API key not configured. Using fallback location services."
      );
      isLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${config.libraries.join(",")}&loading=async`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = (error) => {
      isLoading = false;
      console.error("Failed to load Google Maps API:", error);
      reject(new Error("Failed to load Google Maps API"));
    };

    document.head.appendChild(script);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && !!window.google?.maps;
};

export { GOOGLE_MAPS_API_KEY };
