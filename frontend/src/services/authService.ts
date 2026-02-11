import api from "./api";
import TokenManager from "../utils/tokenManager";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_image?: string;
  is_verified: boolean;
  is_active: boolean;
  email_verified_at?: string;
  phone_verified_at?: string;
  last_login_at?: string;
  preferences?: Record<string, unknown>;
  notification_settings?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export const authService = {
  // Login user
  login: async (loginData: LoginCredentials): Promise<AuthResponse> => {
    console.log("AuthService: Login attempt", { 
      email: loginData.email,
      hasPassword: !!loginData.password,
      passwordLength: loginData.password?.length || 0
    });
    
    // Ensure data is properly formatted
    const payload = {
      email: loginData.email?.trim(),
      password: loginData.password
    };
    
    console.log("AuthService: Sending payload", {
      email: payload.email,
      hasPassword: !!payload.password,
      passwordLength: payload.password?.length || 0
    });
    
    const response = await api.post("/auth/login", payload);
    console.log("AuthService: Login response", {
      success: response.data.success,
      user: response.data.data?.user?.name,
    });

    if (response.data.success && response.data.data) {
      // Use TokenManager for consistent token storage
      TokenManager.setTokens(
        response.data.data.token,
        response.data.data.refreshToken
      );
      console.log("AuthService: Tokens stored in localStorage");
    }
    return response.data;
  },

  // Register user
  register: async (registerData: RegisterData): Promise<AuthResponse> => {
    console.log("AuthService: Register attempt", {
      name: registerData.name,
      email: registerData.email,
      phone: registerData.phone,
      hasPassword: !!registerData.password,
      passwordLength: registerData.password?.length || 0
    });
    
    // Ensure data is properly formatted
    const payload = {
      name: registerData.name?.trim(),
      email: registerData.email?.trim(),
      phone: registerData.phone?.replace(/\D/g, ''), // Remove non-digits
      password: registerData.password,
      role: registerData.role || 'customer'
    };
    
    console.log("AuthService: Sending payload", {
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      hasPassword: !!payload.password,
      passwordLength: payload.password?.length || 0,
      role: payload.role
    });
    
    const response = await api.post("/auth/register", payload);
    if (response.data.success && response.data.data) {
      // Use TokenManager for consistent token storage
      TokenManager.setTokens(
        response.data.data.token,
        response.data.data.refreshToken
      );
    }
    return response.data;
  },

  // Get current user profile
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  // Update user profile
  updateProfile: async (
    profileData: Partial<User>
  ): Promise<{ success: boolean; data: { user: User }; message: string }> => {
    const response = await api.put("/auth/profile", profileData);
    return response.data;
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.put("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Use TokenManager for consistent token clearing
      TokenManager.clearTokens();
    }
  },

  // Request password reset
  forgotPassword: async (
    email: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: { resetToken: string };
  }> => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async (): Promise<{
    success: boolean;
    data: { token: string; refreshToken: string };
  }> => {
    const refreshToken = localStorage.getItem("refresh-token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post("/auth/refresh-token", { refreshToken });
    if (response.data.success && response.data.data) {
      localStorage.setItem("auth-token", response.data.data.token);
      localStorage.setItem("refresh-token", response.data.data.refreshToken);
    }
    return response.data;
  },

  // Utility methods
  getToken: (): string | null => {
    return localStorage.getItem("auth-token");
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("auth-token");
  },
};
