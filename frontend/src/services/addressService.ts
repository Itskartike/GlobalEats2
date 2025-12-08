import { api } from "./api";

export interface Address {
  id: string;
  user_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address_type: "home" | "work" | "other";
  landmark?: string;
  instructions?: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  address_type?: "home" | "work" | "other";
  landmark?: string;
  instructions?: string;
  is_default?: boolean;
}

export type UpdateAddressData = Partial<CreateAddressData>;

export interface AddressApiResponse {
  success: boolean;
  message: string;
  data?: Address | Address[];
  errors?: Array<{ field: string; message: string }>;
}

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      errors?: Array<{ field: string; message: string }>;
    };
  };
  message?: string;
}

class AddressService {
  // Get all user addresses
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await api.get<AddressApiResponse>("/addresses");

      if (response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch addresses");
    } catch (error: unknown) {
      console.error("Get addresses error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch addresses";
      throw new Error(errorMessage);
    }
  }

  // Get user's default address
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const response = await api.get<AddressApiResponse>("/addresses/default");

      if (response.data.success && response.data.data) {
        return response.data.data as Address;
      }

      return null;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      // 404 is expected when no default address exists
      if (apiError.response?.status === 404) {
        return null;
      }

      console.error("Get default address error:", error);
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to fetch default address";
      throw new Error(message);
    }
  }

  // Get specific address
  async getAddress(addressId: string): Promise<Address> {
    try {
      const response = await api.get<AddressApiResponse>(
        `/addresses/${addressId}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data as Address;
      }

      throw new Error(response.data.message || "Failed to fetch address");
    } catch (error: unknown) {
      console.error("Get address error:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to fetch address";
      throw new Error(message);
    }
  }

  // Create new address
  async createAddress(addressData: CreateAddressData): Promise<Address> {
    try {
      const response = await api.post<AddressApiResponse>(
        "/addresses",
        addressData
      );

      if (response.data.success && response.data.data) {
        return response.data.data as Address;
      }

      throw new Error(response.data.message || "Failed to create address");
    } catch (error: unknown) {
      console.error("Create address error:", error);
      const apiError = error as ApiError;

      // Handle validation errors
      if (apiError.response?.data?.errors) {
        const errorMessages = apiError.response.data.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      }

      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to create address";
      throw new Error(message);
    }
  }

  // Update address
  async updateAddress(
    addressId: string,
    addressData: UpdateAddressData
  ): Promise<Address> {
    try {
      const response = await api.put<AddressApiResponse>(
        `/addresses/${addressId}`,
        addressData
      );

      if (response.data.success && response.data.data) {
        return response.data.data as Address;
      }

      throw new Error(response.data.message || "Failed to update address");
    } catch (error: unknown) {
      console.error("Update address error:", error);
      const apiError = error as ApiError;

      // Handle validation errors
      if (apiError.response?.data?.errors) {
        const errorMessages = apiError.response.data.errors
          .map((err) => err.message)
          .join(", ");
        throw new Error(errorMessages);
      }

      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to update address";
      throw new Error(message);
    }
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<void> {
    try {
      const response = await api.delete<AddressApiResponse>(
        `/addresses/${addressId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete address");
      }
    } catch (error: unknown) {
      console.error("Delete address error:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to delete address";
      throw new Error(message);
    }
  }

  // Set address as default
  async setDefaultAddress(addressId: string): Promise<Address> {
    try {
      const response = await api.patch<AddressApiResponse>(
        `/addresses/${addressId}/default`
      );

      if (response.data.success && response.data.data) {
        return response.data.data as Address;
      }

      throw new Error(response.data.message || "Failed to set default address");
    } catch (error: unknown) {
      console.error("Set default address error:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to set default address";
      throw new Error(message);
    }
  }

  // Validate coordinates
  async validateCoordinates(
    latitude: number,
    longitude: number
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const response = await api.post<AddressApiResponse>(
        "/addresses/validate-coordinates",
        {
          latitude,
          longitude,
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data as { latitude: number; longitude: number };
      }

      throw new Error(response.data.message || "Invalid coordinates");
    } catch (error: unknown) {
      console.error("Validate coordinates error:", error);
      const apiError = error as ApiError;
      const message =
        apiError.response?.data?.message ||
        apiError.message ||
        "Failed to validate coordinates";
      throw new Error(message);
    }
  }

  // Helper method to format address for display
  formatAddress(address: Address): string {
    const parts = [
      address.street_address,
      address.apartment,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
      address.country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  // Helper method to get address type badge color
  getAddressTypeBadgeColor(type: string): string {
    switch (type) {
      case "home":
        return "bg-green-100 text-green-800";
      case "work":
        return "bg-blue-100 text-blue-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }
}

export const addressService = new AddressService();
export default addressService;
