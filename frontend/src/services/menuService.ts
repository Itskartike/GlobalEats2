import axios from "axios";
import { MenuItem, MenuCategory } from "../types/menu";

const BASE_URL = "http://localhost:5000/api";

interface OutletMenuResponse {
  success: boolean;
  data: {
    outlet: {
      id: string;
      name: string;
      address: string;
      brand: {
        id: string;
        name: string;
        slug: string;
        logo: string;
      };
    };
    categories: MenuCategory[];
    totalItems: number;
  };
  message?: string;
}

interface MenuCategoriesResponse {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
  }>;
  message?: string;
}

interface MenuSearchResponse {
  success: boolean;
  data: {
    query: string;
    results: MenuItem[];
    totalResults: number;
  };
  message?: string;
}

class MenuService {
  // Get complete menu for an outlet
  async getOutletMenu(
    outletId: string,
    category?: string
  ): Promise<OutletMenuResponse["data"]> {
    try {
      const params = category ? { category } : {};
      const response = await axios.get<OutletMenuResponse>(
        `${BASE_URL}/menu/outlet/${outletId}`,
        { params }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch outlet menu");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching outlet menu:", error);
      throw error;
    }
  }

  // Get available categories for an outlet
  async getOutletCategories(
    outletId: string
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await axios.get<MenuCategoriesResponse>(
        `${BASE_URL}/menu/outlet/${outletId}/categories`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch categories");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  // Search menu items in an outlet
  async searchOutletMenu(
    outletId: string,
    query: string,
    category?: string
  ): Promise<MenuItem[]> {
    try {
      if (!query || query.trim().length < 2) {
        throw new Error("Search query must be at least 2 characters");
      }

      const params = { q: query.trim(), ...(category && { category }) };
      const response = await axios.get<MenuSearchResponse>(
        `${BASE_URL}/menu/outlet/${outletId}/search`,
        { params }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to search menu");
      }

      return response.data.data.results;
    } catch (error) {
      console.error("Error searching menu:", error);
      throw error;
    }
  }
}

export const menuService = new MenuService();
export default menuService;
