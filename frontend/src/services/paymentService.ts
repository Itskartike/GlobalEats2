import api from "./api";

export interface CreateRazorpayOrderResponse {
  success: boolean;
  data?: {
    razorpayOrder: {
      id: string;
      amount: number;
      currency: string;
      receipt?: string;
    };
    paymentId: string;
    keyId: string;
  };
  message?: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  paymentId: string;
}

export const paymentService = {
  async createRazorpayOrder(orderId: string) {
    const res = await api.post<CreateRazorpayOrderResponse>(
      "/payments/create-order",
      { orderId }
    );
    return res.data;
  },

  async verifyPayment(payload: VerifyPaymentRequest) {
    const res = await api.post<{ success: boolean; message?: string }>(
      "/payments/verify",
      payload
    );
    return res.data;
  },

  async myTransactions(page: number = 1, limit: number = 20) {
    const res = await api.get(
      `/payments/my?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(
        limit
      )}`
    );
    return res.data;
  },
};

export default paymentService;



