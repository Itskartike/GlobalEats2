import { api } from "./api";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("response" in error || "message" in error)
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  return fallback;
}

export interface OrderSummary {
  subtotal: number;
  totalDeliveryFee: number;
  tax: number;
  total: number;
  orderCount: number;
  estimatedDeliveryTime?: string;
}

export interface OrderItem {
  menuItemId: string;
  quantity: number;
  specialInstructions?: string;
}

export interface BrandOrder {
  brandId: string;
  outletId: string;
  items: OrderItem[];
  deliveryFee: number;
}

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: "cod" | "card" | "upi" | "wallet";
  specialInstructions?: string;
  couponCode?: string;
  brands: BrandOrder[];
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  deliveryAddress: {
    id?: string;
    recipient_name?: string;
    street_address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    landmark?: string;
    address_type?: string;
    is_default?: boolean;
    fullAddress?: string;
    shortAddress?: string;
    area?: string;
  };
  restaurant?: {
    id: string;
    outletName: string;
    outletAddress: string;
    phone?: string;
    brand?: {
      id: string;
      name: string;
      logo?: string;
      cuisine?: string;
      rating?: number;
    };
  };
  items?: Array<{
    id: string;
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    totalPrice: number;
    image?: string;
    isVegetarian?: boolean;
    category?: string;
    specialInstructions?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  couponDiscount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  specialInstructions?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
  placedAt?: string;
  itemCount?: number;
  totalQuantity?: number;
  orderItems?: OrderItem[];
}

export interface OrderHistoryResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalOrders: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

class OrderService {
  async createOrder(orderData: CreateOrderRequest): Promise<{
    success: boolean;
    data?: { orders: Order[]; summary: OrderSummary };
    message?: string;
  }> {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating order:", error);

      return {
        success: false,
        message: getErrorMessage(error, "Failed to create order"),
      };
    }
  }

  async getOrderHistory(
    page: number = 1,
    limit: number = 10,
    status?: string
  ): Promise<OrderHistoryResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      console.log("OrderService: Fetching order history with params", {
        page,
        limit,
        status,
      });
      const response = await api.get(`/orders/history?${params}`);
      console.log("OrderService: Order history API response", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching order history:", error);
      throw new Error(getErrorMessage(error, "Failed to fetch order history"));
    }
  }

  async getOrderDetails(
    orderId: string
  ): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching order details:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Failed to fetch order details"),
      };
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    preparationTime?: number
  ): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await api.patch(`/orders/${orderId}/status`, {
        status,
        preparationTime,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Failed to update order status"),
      };
    }
  }

  async cancelOrder(
    orderId: string,
    reason: string
  ): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error: unknown) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Failed to cancel order"),
      };
    }
  }

  async addOrderReview(
    orderId: string,
    rating: number,
    review?: string
  ): Promise<{ success: boolean; data?: Order; message?: string }> {
    try {
      const response = await api.post(`/orders/${orderId}/review`, {
        rating,
        review,
      });
      return response.data;
    } catch (error: unknown) {
      console.error("Error adding order review:", error);
      return {
        success: false,
        message: getErrorMessage(error, "Failed to add order review"),
      };
    }
  }

  // Utility method to get order status display text
  getOrderStatusDisplay(status: string): { text: string; color: string } {
    const statusMap: Record<string, { text: string; color: string }> = {
      pending: { text: "Order Placed", color: "blue" },
      confirmed: { text: "Confirmed", color: "green" },
      preparing: { text: "Preparing", color: "yellow" },
      ready: { text: "Ready for Pickup", color: "orange" },
      picked_up: { text: "Picked Up", color: "purple" },
      out_for_delivery: { text: "Out for Delivery", color: "indigo" },
      delivered: { text: "Delivered", color: "green" },
      cancelled: { text: "Cancelled", color: "red" },
      refunded: { text: "Refunded", color: "gray" },
    };

    return statusMap[status] || { text: status, color: "gray" };
  }

  // Utility method to check if order can be cancelled
  canCancelOrder(status: string): boolean {
    const nonCancellableStatuses = [
      "picked_up",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "refunded",
    ];
    return !nonCancellableStatuses.includes(status);
  }

  // Utility method to check if order can be reviewed
  canReviewOrder(status: string, hasReview: boolean): boolean {
    return status === "delivered" && !hasReview;
  }
}

export const orderService = new OrderService();
