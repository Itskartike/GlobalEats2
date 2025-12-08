export interface Brand {
  id: string;
  slug?: string;
  name: string;
  description: string;
  logo: string;
  coverImage: string;
  cuisines: string[];
  rating: number;
  totalReviews: number;
  isActive: boolean;
  outlets: Outlet[];
  tags: string[];
  offers: Offer[];
}

export interface Outlet {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  phone: string;
  operatingHours: {
    [day: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  isActive: boolean;
  hasDelivery: boolean;
  hasPickup: boolean;
  rating: number;
  reviewCount: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: number;
  minOrder: number;
  validUntil: string;
  code: string;
  isActive: boolean;
}
