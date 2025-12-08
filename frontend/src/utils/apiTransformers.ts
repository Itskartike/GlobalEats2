import { Brand, Outlet } from "../types/brand";
import { MenuItem, MenuCategory } from "../types/menu";
import {
  ApiBrand,
  ApiOutlet,
  ApiMenuItem,
  ApiCategory,
} from "../services/brandService";

// Transform API brand data to frontend brand interface
export const transformApiBrandToBrand = (
  apiBrand: ApiBrand
): Brand & {
  slug: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  estimatedDeliveryTime: number;
} => {
  return {
    id: apiBrand.id.toString(),
    slug: apiBrand.slug,
    name: apiBrand.name,
    description: apiBrand.description,
    logo: apiBrand.logo_url,
    coverImage: apiBrand.banner_url,
    cuisines: [apiBrand.cuisine_type], // API has single cuisine_type, frontend expects array
    rating: Number(apiBrand.average_rating),
    totalReviews: apiBrand.total_reviews,
    isActive: apiBrand.is_active,
    outlets:
      apiBrand.Outlets?.map((outlet) =>
        transformApiOutletToOutlet(outlet, apiBrand.id.toString())
      ) ||
      apiBrand.outlets?.map((outlet) =>
        transformApiOutletToOutlet(outlet, apiBrand.id.toString())
      ) ||
      [],
    tags: apiBrand.is_featured ? ["Featured"] : [],
    offers: [], // API doesn't have offers yet, can be added later
    deliveryFee: Number(apiBrand.delivery_fee || 0),
    minimumOrderAmount: Number(apiBrand.minimum_order_amount || 0),
    estimatedDeliveryTime: apiBrand.estimated_delivery_time || 30,
  };
};

// Transform API outlet data to frontend outlet interface
export const transformApiOutletToOutlet = (
  apiOutlet: ApiOutlet,
  brandId?: string
): Outlet => {
  return {
    id: apiOutlet.id.toString(),
    brandId:
      brandId || (apiOutlet.brand_id ? apiOutlet.brand_id.toString() : ""),
    brandName: "", // Will be filled by parent brand
    name: apiOutlet.name,
    address: {
      street: apiOutlet.address,
      area: "", // API doesn't separate area
      city: apiOutlet.city,
      state: apiOutlet.state || "",
      pincode: apiOutlet.postal_code || "",
      coordinates: {
        lat: Number(apiOutlet.latitude),
        lng: Number(apiOutlet.longitude),
      },
    },
    phone: apiOutlet.phone || "",
    operatingHours: apiOutlet.operating_hours
      ? Object.fromEntries(
          Object.entries(apiOutlet.operating_hours).map(([day, hours]) => [
            day,
            {
              open: hours.open,
              close: hours.close,
              isOpen: hours.is_open,
            },
          ])
        )
      : {},
    deliveryRadius: Number(apiOutlet.delivery_radius) || 0,
    deliveryFee: 0, // Will be filled from brand data
    minimumOrder: 0, // Will be filled from brand data
    estimatedDeliveryTime: "30-45 mins", // Will be calculated
    isActive: apiOutlet.is_active ?? true,
    hasDelivery: apiOutlet.is_delivery_available ?? true,
    hasPickup: apiOutlet.is_pickup_available ?? true,
    rating: 0, // Not available in outlet data
    reviewCount: 0, // Not available in outlet data
  };
};

// Transform API menu items to frontend menu items
export const transformApiMenuItemToMenuItem = (
  apiItem: ApiMenuItem,
  categoryName?: string
): MenuItem => {
  return {
    id: apiItem.id.toString(),
    name: apiItem.name,
    description: apiItem.description,
    price: Number(apiItem.outlet_price || apiItem.base_price),
    originalPrice: apiItem.outlet_price
      ? Number(apiItem.base_price)
      : undefined,
    image: apiItem.image_url,
    category: categoryName || "",
    isVeg: apiItem.is_vegetarian,
    isAvailable: apiItem.is_available,
    tags: [],
    customizations: [],
    nutritionInfo: {
      calories: apiItem.calories || 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
  };
};

// Transform API categories to frontend menu categories
export const transformApiCategoryToMenuCategory = (
  apiCategory: ApiCategory,
  items: MenuItem[]
): MenuCategory => {
  return {
    id: apiCategory.id.toString(),
    name: apiCategory.name,
    description: apiCategory.description,
    isActive: apiCategory.is_active,
    items: items,
  };
};

// Helper to get cuisine display name
export const getCuisineDisplayName = (cuisineType: string): string => {
  const cuisineMap: Record<string, string> = {
    pizza: "Pizza",
    burgers: "Burgers & Fast Food",
    indian: "Indian",
    chinese: "Chinese",
    south_indian: "South Indian",
    desserts: "Desserts",
    beverages: "Beverages",
  };

  return cuisineMap[cuisineType.toLowerCase()] || cuisineType;
};

// Helper to format delivery time
export const formatDeliveryTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
};

// Helper to format delivery fee
export const formatDeliveryFee = (fee: number): string => {
  return fee === 0 ? "Free Delivery" : `₹${fee}`;
};

// Helper to check if outlet is currently open
export const isOutletOpen = (
  operatingHours: Record<
    string,
    {
      open: string;
      close: string;
      isOpen: boolean;
    }
  >
): boolean => {
  const now = new Date();
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const todayHours = operatingHours[currentDay];
  if (!todayHours || !todayHours.isOpen) {
    return false;
  }

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};
