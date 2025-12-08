import api from "./api";

// Types that match our Phase 2 backend API
export interface ApiBrand {
  id: string | number; // Can be UUID string or number
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  cuisine_type: string;
  average_rating: number;
  total_reviews: number;
  is_active: boolean;
  is_featured: boolean;
  minimum_order_amount: number;
  delivery_fee: number;
  estimated_delivery_time: number;
  created_at: string;
  updated_at: string;
  outlets?: ApiOutlet[]; // Legacy property name
  Outlets?: ApiOutlet[]; // Current property name from Sequelize association
  categories?: ApiCategory[];
}

export interface ApiOutlet {
  id: string | number; // Can be UUID string or number
  brand_id?: number; // Optional when nested under brand
  name: string;
  address: string;
  city: string;
  state?: string; // Optional in some responses
  postal_code?: string; // Optional in some responses
  country?: string; // Optional in some responses
  latitude: number;
  longitude: number;
  phone?: string; // Optional in some responses
  email?: string;
  is_active?: boolean; // Optional in some responses
  is_delivery_available?: boolean; // Optional in some responses
  is_pickup_available?: boolean; // Optional in some responses
  delivery_radius: number;
  operating_hours?: Record<
    string,
    {
      open: string;
      close: string;
      is_open: boolean;
    }
  >;
  created_at: string;
  updated_at: string;
  distance?: number;
}

export interface ApiCategory {
  id: number;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface ApiMenuItem {
  id: number;
  brand_id: number;
  category_id: number;
  name: string;
  description: string;
  image_url: string;
  base_price: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: number;
  calories?: number;
  preparation_time: number;
  is_available: boolean;
  sort_order: number;
  outlet_price?: number;
  stock_quantity?: number;
}

export interface BrandListParams {
  page?: number;
  limit?: number;
  featured?: boolean;
  cuisine_type?: string;
  search?: string;
}

export interface NearbyOutletsParams {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}

export const brandService = {
  // Get all brands with pagination and filtering
  getAllBrands: async (
    params?: BrandListParams
  ): Promise<{
    brands: ApiBrand[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> => {
    const response = await api.get("/brands", { params });
    const data = response.data.data;

    // Transform pagination to match frontend interface
    return {
      brands: data.brands,
      pagination: {
        page: data.pagination.current_page,
        limit: data.pagination.per_page,
        total: data.pagination.total_count,
        pages: data.pagination.total_pages,
      },
    };
  },

  // Get brand details by slug
  getBrandBySlug: async (slug: string): Promise<ApiBrand> => {
    const response = await api.get(`/brands/${slug}`);
    return response.data.data.brand;
  },

  // Get nearby outlets for a brand
  getNearbyOutlets: async (
    brandId: number,
    params: NearbyOutletsParams
  ): Promise<{
    outlets: ApiOutlet[];
    total: number;
  }> => {
    const response = await api.get(`/brands/${brandId}/outlets/nearby`, {
      params,
    });
    return response.data.data;
  },

  // Get menu for a specific outlet
  getOutletMenu: async (
    outletId: number
  ): Promise<{
    outlet: ApiOutlet;
    categories: ApiCategory[];
    items: ApiMenuItem[];
  }> => {
    const response = await api.get(`/outlets/${outletId}/menu`);
    return response.data.data;
  },

  // Search brands (for future use)
  searchBrands: async (
    query: string,
    filters?: {
      cuisine_type?: string;
      featured?: boolean;
    }
  ): Promise<ApiBrand[]> => {
    const params = { search: query, ...filters };
    const response = await api.get("/brands", { params });
    return response.data.data.brands;
  },
};

export default brandService;
