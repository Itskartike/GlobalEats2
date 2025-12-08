export interface OperatingHours {
  [key: string]: {
    open: string;
    close: string;
    is_open: boolean;
  };
}

export interface Outlet {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  phone?: string;
  is_delivery_available: boolean;
  is_pickup_available: boolean;
  delivery_radius: number;
  operating_hours: OperatingHours;
  distance?: number;
  brand: {
    id: string;
    name: string;
    logo_url?: string;
    cuisine_types: string[];
    average_rating: number;
  };
}
