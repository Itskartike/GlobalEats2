import { api } from "../../services/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AdminLoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalBrands: number;
  totalOutlets: number;
  todayOrders: number;
}

interface RecentOrder {
  id: string;
  status: string;
  total: number;
  created_at: string;
  User: {
    name: string;
    email: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
}

class AdminService {
  private readonly TOKEN_KEY = "admin_auth_token";
  private readonly USER_KEY = "admin_user";

  // Authentication methods
  async login(email: string, password: string): Promise<AdminLoginResponse> {
    try {
      const response = await api.post("/admin/login", { email, password });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem(this.TOKEN_KEY, response.data.data.token);
        localStorage.setItem(
          this.USER_KEY,
          JSON.stringify(response.data.data.user)
        );

        // Set token for future requests
        this.setAuthToken(response.data.data.token);
      }

      return response.data;
    } catch (error: unknown) {
      console.error("Admin login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || errorMessage);
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.clearAuthToken();
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AdminUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuthToken(token: string): void {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete api.defaults.headers.common["Authorization"];
  }

  // Initialize auth token on app start
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.setAuthToken(token);
    }
  }

  // Dashboard methods
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get("/admin/dashboard");
      return response.data.data;
    } catch (error: unknown) {
      console.error("Dashboard data error:", error);

      // Handle auth errors
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (
        apiError.response?.status === 401 ||
        apiError.response?.status === 403
      ) {
        this.logout();
        throw new Error("Session expired. Please login again.");
      }

      throw new Error(
        apiError.response?.data?.message || "Failed to fetch dashboard data"
      );
    }
  }

  // Outlet-Brand management methods
  async getOutletBrandAssociations(page = 1, limit = 10, search = "") {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const response = await api.get(`/admin/outlet-brands?${params}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Outlet brands fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch outlet brands"
      );
    }
  }

  async getAllBrands() {
    try {
      const response = await api.get("/admin/brands");
      return response.data;
    } catch (error: unknown) {
      console.error("Brands fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch brands"
      );
    }
  }

  async getBrandsForManagement() {
    try {
      const response = await api.get("/admin/brands/manage");
      return response.data;
    } catch (error: unknown) {
      console.error("Brands management fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message ||
          "Failed to fetch brands for management"
      );
    }
  }

  async addBrandToOutlet(
    outletId: string,
    brandId: string,
    data: {
      is_available: boolean;
      preparation_time: number;
      minimum_order_amount: number;
      delivery_fee: number;
      priority: number;
    }
  ) {
    try {
      const response = await api.post(`/admin/outlets/${outletId}/brands`, {
        brand_id: brandId,
        ...data,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Add brand to outlet error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to add brand to outlet"
      );
    }
  }

  async removeBrandFromOutlet(outletId: string, brandId: string) {
    try {
      const response = await api.delete(
        `/admin/outlets/${outletId}/brands/${brandId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Remove brand from outlet error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to remove brand from outlet"
      );
    }
  }

  async updateOutletBrand(
    outletId: string,
    brandId: string,
    data: {
      is_available?: boolean;
      preparation_time?: number;
      minimum_order_amount?: number;
      delivery_fee?: number;
      priority?: number;
    }
  ) {
    try {
      const response = await api.patch(
        `/admin/outlets/${outletId}/brands/${brandId}`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Update outlet brand error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to update outlet brand"
      );
    }
  }

  // Token validation
  async validateToken(): Promise<boolean> {
    try {
      await api.get("/admin/dashboard");
      return true;
    } catch (error: unknown) {
      const apiError = error as { response?: { status?: number } };
      if (
        apiError.response?.status === 401 ||
        apiError.response?.status === 403
      ) {
        this.logout();
        return false;
      }
      return true; // Other errors don't invalidate the token
    }
  }

  // Category management methods
  async getCategories() {
    try {
      const response = await api.get("/admin/categories");
      return response.data;
    } catch (error: unknown) {
      console.error("Categories fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch categories"
      );
    }
  }

  async createCategory(data: {
    name: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    sort_order: number;
  }) {
    try {
      const response = await api.post("/admin/categories", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Create category error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to create category"
      );
    }
  }

  async updateCategory(
    categoryId: string,
    data: {
      name: string;
      description?: string;
      image_url?: string;
      is_active: boolean;
      sort_order: number;
    }
  ) {
    try {
      const response = await api.put(`/admin/categories/${categoryId}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Update category error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to update category"
      );
    }
  }

  async deleteCategory(categoryId: string) {
    try {
      const response = await api.delete(`/admin/categories/${categoryId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Delete category error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to delete category"
      );
    }
  }

  // Menu item management methods
  async getMenuItems(filters?: {
    brand_id?: string;
    category_id?: string;
    search?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.brand_id) params.append("brand_id", filters.brand_id);
      if (filters?.category_id)
        params.append("category_id", filters.category_id);
      if (filters?.search) params.append("search", filters.search);

      const response = await api.get(`/admin/menu-items?${params}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Menu items fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch menu items"
      );
    }
  }

  async createMenuItem(data: {
    brand_id: string;
    category_id: string;
    name: string;
    description?: string;
    image_url?: string;
    base_price: number;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    spice_level: number;
    calories?: number;
    preparation_time?: number;
    is_available: boolean;
    sort_order: number;
  }) {
    try {
      const response = await api.post("/admin/menu-items", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Create menu item error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to create menu item"
      );
    }
  }

  async updateMenuItem(
    menuItemId: string,
    data: {
      brand_id: string;
      category_id: string;
      name: string;
      description?: string;
      image_url?: string;
      base_price: number;
      is_vegetarian: boolean;
      is_vegan: boolean;
      is_gluten_free: boolean;
      spice_level: number;
      calories?: number;
      preparation_time?: number;
      is_available: boolean;
      sort_order: number;
    }
  ) {
    try {
      const response = await api.put(`/admin/menu-items/${menuItemId}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Update menu item error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to update menu item"
      );
    }
  }

  async deleteMenuItem(menuItemId: string) {
    try {
      const response = await api.delete(`/admin/menu-items/${menuItemId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Delete menu item error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to delete menu item"
      );
    }
  }

  // Order management methods
  async getOrders(filters?: {
    page?: number;
    limit?: number;
    status?: string;
    outlet_id?: string;
    user_id?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    order_type?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);
      if (filters?.outlet_id) params.append("outlet_id", filters.outlet_id);
      if (filters?.user_id) params.append("user_id", filters.user_id);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.date_from) params.append("date_from", filters.date_from);
      if (filters?.date_to) params.append("date_to", filters.date_to);
      if (filters?.order_type) params.append("order_type", filters.order_type);

      const response = await api.get(`/admin/orders?${params}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Orders fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch orders"
      );
    }
  }

  async getOrderDetails(orderId: string) {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Order details fetch error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch order details"
      );
    }
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Order status update error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to update order status"
      );
    }
  }

  async updateOrder(
    orderId: string,
    data: {
      special_instructions?: string;
      restaurant_notes?: any;
      estimated_delivery_time?: string;
      preparation_time?: number;
      delivery_time?: number;
    }
  ) {
    try {
      const response = await api.put(`/admin/orders/${orderId}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Order update error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to update order"
      );
    }
  }

  async getOrderAnalytics(period: "today" | "week" | "month" = "today") {
    try {
      const response = await api.get(
        `/admin/orders/analytics?period=${period}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Order analytics error:", error);
      const apiError = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      throw new Error(
        apiError.response?.data?.message || "Failed to fetch order analytics"
      );
    }
  }

  // ==================== PLATFORM CATALOG ====================

  async getCatalogBrands(filters?: { search?: string; vendor_id?: string; status?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.vendor_id) params.append("vendor_id", filters.vendor_id);
      if (filters?.status) params.append("status", filters.status);
      const response = await api.get(`/admin/catalog/brands?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch catalog brands");
    }
  }

  async getCatalogOutlets(filters?: { search?: string; vendor_id?: string; city?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.vendor_id) params.append("vendor_id", filters.vendor_id);
      if (filters?.city) params.append("city", filters.city);
      const response = await api.get(`/admin/catalog/outlets?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch catalog outlets");
    }
  }

  async getCatalogMenuItems(filters?: { search?: string; brand_id?: string }) {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.brand_id) params.append("brand_id", filters.brand_id);
      const response = await api.get(`/admin/catalog/menu-items?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch catalog menu items");
    }
  }

  async toggleCatalogBrand(brandId: string) {
    const response = await api.put(`/admin/catalog/brands/${brandId}/toggle`);
    return response.data;
  }

  async toggleCatalogOutlet(outletId: string) {
    const response = await api.put(`/admin/catalog/outlets/${outletId}/toggle`);
    return response.data;
  }

  // ==================== ANALYTICS ====================

  async getRevenueAnalytics(period: string = "month") {
    try {
      const response = await api.get(`/admin/analytics/revenue?period=${period}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch revenue analytics");
    }
  }

  async getOrderTrends(period: string = "week") {
    try {
      const response = await api.get(`/admin/analytics/orders?period=${period}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch order trends");
    }
  }

  async getTopPerformers() {
    try {
      const response = await api.get("/admin/analytics/top-performers");
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch top performers");
    }
  }

  // ==================== VENDOR MANAGEMENT ====================

  async getVendors(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", String(filters.page));
      if (filters?.limit) params.append("limit", String(filters.limit));
      const response = await api.get(`/admin/vendors?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch vendors");
    }
  }

  async getVendorDetail(vendorId: string) {
    try {
      const response = await api.get(`/admin/vendors/${vendorId}`);
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch vendor detail");
    }
  }

  async approveVendor(vendorId: string) {
    const response = await api.put(`/admin/vendors/${vendorId}/approve`);
    return response.data;
  }

  async rejectVendor(vendorId: string, reason: string) {
    const response = await api.put(`/admin/vendors/${vendorId}/reject`, { reason });
    return response.data;
  }

  async suspendVendor(vendorId: string, reason: string) {
    const response = await api.put(`/admin/vendors/${vendorId}/suspend`, { reason });
    return response.data;
  }

  async updateVendorCommission(vendorId: string, commissionRate: number) {
    const response = await api.put(`/admin/vendors/${vendorId}/commission`, { commission_rate: commissionRate });
    return response.data;
  }

  async getPlatformAnalytics() {
    try {
      const response = await api.get("/admin/platform-analytics");
      return response.data;
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      throw new Error(apiError.response?.data?.message || "Failed to fetch platform analytics");
    }
  }
}

export default new AdminService();
