import { api } from "../../services/api";

interface VendorUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface VendorProfileData {
  id: string;
  business_name: string;
  business_type: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface VendorLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: VendorUser;
    vendorProfile: VendorProfileData;
  };
}

class VendorService {
  private readonly TOKEN_KEY = "vendor_auth_token";
  private readonly USER_KEY = "vendor_user";
  private readonly PROFILE_KEY = "vendor_profile";

  // ========== AUTH ==========

  async login(email: string, password: string): Promise<VendorLoginResponse> {
    try {
      const response = await api.post("/vendor/login", { email, password });
      if (response.data.success) {
        localStorage.setItem(this.TOKEN_KEY, response.data.data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.data.user));
        if (response.data.data.vendorProfile) {
          localStorage.setItem(this.PROFILE_KEY, JSON.stringify(response.data.data.vendorProfile));
        }
        this.setAuthToken(response.data.data.token);
      }
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Login failed");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async register(data: any) {
    try {
      const response = await api.post("/vendor/register", data);
      if (response.data.success) {
        localStorage.setItem(this.TOKEN_KEY, response.data.data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.data.user));
        if (response.data.data.vendorProfile) {
          localStorage.setItem(this.PROFILE_KEY, JSON.stringify(response.data.data.vendorProfile));
        }
        this.setAuthToken(response.data.data.token);
      }
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Registration failed");
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.PROFILE_KEY);
    this.clearAuthToken();
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): VendorUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  getStoredProfile(): VendorProfileData | null {
    const profileStr = localStorage.getItem(this.PROFILE_KEY);
    return profileStr ? JSON.parse(profileStr) : null;
  }

  setAuthToken(token: string): void {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete api.defaults.headers.common["Authorization"];
  }

  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.setAuthToken(token);
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      await api.get("/vendor/profile");
      return true;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (apiError.response?.status === 401) {
        this.logout();
        return false;
      }
      return true;
    }
  }

  // ========== PROFILE ==========

  async getProfile() {
    const response = await api.get("/vendor/profile");
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateProfile(data: any) {
    const response = await api.put("/vendor/profile", data);
    return response.data;
  }

  // ========== DASHBOARD ==========

  async getDashboardData() {
    const response = await api.get("/vendor/dashboard");
    return response.data;
  }

  // ========== BRANDS ==========

  async getBrands() {
    const response = await api.get("/vendor/brands");
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createBrand(data: any) {
    const response = await api.post("/vendor/brands", data);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateBrand(brandId: string, data: any) {
    const response = await api.put(`/vendor/brands/${brandId}`, data);
    return response.data;
  }

  async deleteBrand(brandId: string) {
    const response = await api.delete(`/vendor/brands/${brandId}`);
    return response.data;
  }

  // ========== OUTLETS ==========

  async getOutlets() {
    const response = await api.get("/vendor/outlets");
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createOutlet(data: any) {
    const response = await api.post("/vendor/outlets", data);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateOutlet(outletId: string, data: any) {
    const response = await api.put(`/vendor/outlets/${outletId}`, data);
    return response.data;
  }

  async deleteOutlet(outletId: string) {
    const response = await api.delete(`/vendor/outlets/${outletId}`);
    return response.data;
  }

  // ========== MENU ITEMS ==========

  async getMenuItems(filters?: { brand_id?: string; category_id?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.brand_id) params.append("brand_id", filters.brand_id);
    if (filters?.category_id) params.append("category_id", filters.category_id);
    if (filters?.search) params.append("search", filters.search);
    const response = await api.get(`/vendor/menu-items?${params}`);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createMenuItem(data: any) {
    const response = await api.post("/vendor/menu-items", data);
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateMenuItem(menuItemId: string, data: any) {
    const response = await api.put(`/vendor/menu-items/${menuItemId}`, data);
    return response.data;
  }

  async deleteMenuItem(menuItemId: string) {
    const response = await api.delete(`/vendor/menu-items/${menuItemId}`);
    return response.data;
  }

  async getCategories() {
    const response = await api.get("/vendor/categories");
    return response.data;
  }

  // ========== OUTLET-BRANDS ==========

  async getOutletBrands() {
    const response = await api.get("/vendor/outlet-brands");
    return response.data;
  }

  async addBrandToOutlet(
    outletId: string,
    data: {
      brand_id: string;
      is_available?: boolean;
      preparation_time?: number;
      minimum_order_amount?: number;
      delivery_fee?: number;
      priority?: number;
    }
  ) {
    const response = await api.post(`/vendor/outlets/${outletId}/brands`, data);
    return response.data;
  }

  async removeBrandFromOutlet(outletId: string, brandId: string) {
    const response = await api.delete(`/vendor/outlets/${outletId}/brands/${brandId}`);
    return response.data;
  }

  // ========== ORDERS ==========

  async getOrders(filters?: { status?: string; page?: number; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    const response = await api.get(`/vendor/orders?${params}`);
    return response.data;
  }

  async getOrderDetails(orderId: string) {
    const response = await api.get(`/vendor/orders/${orderId}`);
    return response.data;
  }

  async updateOrderStatus(orderId: string, status: string) {
    const response = await api.put(`/vendor/orders/${orderId}/status`, { status });
    return response.data;
  }
}

export default new VendorService();
