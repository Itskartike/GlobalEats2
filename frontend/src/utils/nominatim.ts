// Nominatim (OpenStreetMap) geocoding utility
// No API key required. Rate limit: 1 request/second (for non-commercial use)
// Docs: https://nominatim.org/release-docs/latest/api/Search/

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Shared fetch headers — Nominatim requires a descriptive User-Agent
const HEADERS: HeadersInit = {
  "Accept-Language": "en",
  "User-Agent": "GlobalEats2-App (food-delivery)",
};

export interface NominatimPlace {
  place_id: string;
  display_name: string;
  name?: string;
  lat: number;
  lng: number;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
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

// Convert coordinates → human-readable address
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<GeocodeResult | null> => {
  try {
    const url = `${NOMINATIM_BASE}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data = await res.json();
    const a = data.address || {};

    return {
      address: data.display_name || "",
      city: a.city || a.town || a.village || a.suburb || "",
      state: a.state || "",
      postal_code: a.postcode || "",
      country: a.country || "",
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
};

// Convert address string → coordinates + details
export const geocodeAddress = async (
  address: string
): Promise<GeocodeResult | null> => {
  try {
    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data: Array<{
      place_id: string;
      display_name: string;
      lat: string;
      lon: string;
      address: Record<string, string>;
    }> = await res.json();

    if (!data || data.length === 0) return null;

    const result = data[0];
    const a = result.address || {};
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    return {
      address: result.display_name || "",
      city: a.city || a.town || a.village || a.suburb || "",
      state: a.state || "",
      postal_code: a.postcode || "",
      country: a.country || "",
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

// Search places by query — returns list of suggestions for autocomplete
export const searchPlaces = async (
  query: string,
  limit = 5
): Promise<NominatimPlace[]> => {
  try {
    if (!query || query.trim().length < 2) return [];

    const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=${limit}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);

    const data: Array<{
      place_id: string;
      display_name: string;
      name?: string;
      lat: string;
      lon: string;
      address: Record<string, string>;
    }> = await res.json();

    return (data || []).map((item) => ({
      place_id: String(item.place_id),
      display_name: item.display_name,
      name: item.name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: {
        road: item.address?.road,
        suburb: item.address?.suburb,
        city: item.address?.city || item.address?.town || item.address?.village,
        state: item.address?.state,
        postcode: item.address?.postcode,
        country: item.address?.country,
      },
    }));
  } catch (error) {
    console.error("Place search error:", error);
    return [];
  }
};
