import api from './api';
import { Brand } from '../types/brand';
import { MenuItem, MenuCategory } from '../types/menu';

export const restaurantService = {
  // Get all restaurants/brands
  getRestaurants: async (params?: {
    search?: string;
    cuisine?: string;
    sort?: string;
    lat?: number;
    lng?: number;
  }): Promise<Brand[]> => {
    const response = await api.get('/restaurants', { params });
    return response.data;
  },

  // Get restaurant by ID
  getRestaurant: async (id: string): Promise<Brand> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // Get restaurant menu
  getRestaurantMenu: async (restaurantId: string): Promise<{
    categories: MenuCategory[];
    items: MenuItem[];
  }> => {
    const response = await api.get(`/restaurants/${restaurantId}/menu`);
    return response.data;
  },

  // Get menu item by ID
  getMenuItem: async (restaurantId: string, itemId: string): Promise<MenuItem> => {
    const response = await api.get(`/restaurants/${restaurantId}/menu/${itemId}`);
    return response.data;
  },

  // Search restaurants
  searchRestaurants: async (query: string, filters?: {
    cuisine?: string[];
    priceRange?: string;
    rating?: number;
    deliveryTime?: number;
  }): Promise<Brand[]> => {
    const response = await api.get('/restaurants/search', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  },

  // Get featured restaurants
  getFeaturedRestaurants: async (): Promise<Brand[]> => {
    const response = await api.get('/restaurants/featured');
    return response.data;
  },

  // Get nearby restaurants
  getNearbyRestaurants: async (lat: number, lng: number, radius: number = 10): Promise<Brand[]> => {
    const response = await api.get('/restaurants/nearby', {
      params: { lat, lng, radius }
    });
    return response.data;
  },
};
