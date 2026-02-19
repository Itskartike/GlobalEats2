import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CreditCard,
  Truck,
  Clock,
  ArrowLeft,
  Check,
  AlertCircle,
  MapPin,
  Wallet,
  Banknote,
  Smartphone,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useSelectedAddress } from "../store/addressStore";
import { orderService, CreateOrderRequest } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { Button } from "../components/ui/Button";
import { AddressSelectionStep } from "../components/features/checkout/AddressSelectionStep";
import { NavigationSafeWrapper } from "/src/components/common/NavigationSafeWrapper";

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

const STEPS = [
  { label: "Address", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: Check },
];

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: Banknote },
  { id: "upi", label: "UPI Payment", desc: "GPay, PhonePe, Paytm", icon: Smartphone },
  { id: "card", label: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "wallet", label: "Digital Wallet", desc: "Paytm, Amazon Pay", icon: Wallet },
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { brands, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const selectedAddress = useSelectedAddress();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card" | "upi" | "wallet">("cod");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const totalDeliveryFees = brands.reduce((sum, brand) => sum + brand.deliveryFee, 0);

  const handleAddressNext = () => {
    if (!selectedAddress) {
      setError("Please select a delivery address");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handlePaymentNext = () => {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedAddress) {
        setError("Please select a delivery address");
        return;
      }

      const orderData: CreateOrderRequest = {
        addressId: selectedAddress.id,
        paymentMethod,
        specialInstructions,
        brands: brands.map((brand) => ({
          brandId: brand.brandId,
          outletId: brand.outletId,
          deliveryFee: brand.deliveryFee,
          items: brand.items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
            specialInstructions: item.specialInstructions,
          })),
        })),
      };

      console.log("Order data being sent:", orderData);
      console.log("Brands in cart:", brands);

      const result = await orderService.createOrder(orderData);

      if (result.success && result.data) {
        if (paymentMethod === "cod") {
          clearCart();
          try {
            const orderDetails = await orderService.getOrderDetails(result.data.orders[0].id);
            if (orderDetails.success && orderDetails.data) {
              navigate(`/order-confirmation`, {
                state: {
                  orders: [orderDetails.data],
                  summary: result.data.summary,
                  paymentMethod: "cod",
                  selectedAddress: selectedAddress,
                },
              });
            } else {
              navigate(`/order-confirmation`, {
                state: {
                  orders: result.data.orders,
                  summary: result.data.summary,
                  paymentMethod: "cod",
                  selectedAddress: selectedAddress,
                },
              });
            }
          } catch (error) {
            console.error("Error fetching order details:", error);
            navigate(`/order-confirmation`, {
              state: {
                orders: result.data.orders,
                summary: result.data.summary,
                paymentMethod: "cod",
                selectedAddress: selectedAddress,
              },
            });
          }
        } else {
          await handleOnlinePayment(result.data.orders[0]);
        }
      } else {
        setError(result.message || "Failed to place order");
      }
    } catch (error: unknown) {
      console.error("Error placing order:", error);
      setError(error instanceof Error ? error.message : "Failed to place order");
    } finally {
      if (paymentMethod === "cod") {
        setLoading(false);
      }
    }
  };

  const handleOnlinePayment = async (order: any) => {
    try {
      const paymentResult = await paymentService.createRazorpayOrder(order.id);

      if (!paymentResult.success || !paymentResult.data) {
        setError("Failed to initiate payment");
        setLoading(false);
        return;
      }

      const { razorpayOrder, paymentId, keyId } = paymentResult.data;

      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Global Eats",
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            const verifyResult = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentId,
            });

            if (verifyResult.success) {
              clearCart();
              navigate(`/order-confirmation`, {
                state: {
                  orders: [order],
                  summary: { total: order.totalAmount },
                  paymentMethod: paymentMethod,
                  paymentStatus: "paid",
                  selectedAddress: selectedAddress,
                },
              });
            } else {
              setError("Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            setError("Payment verification failed");
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setError("Payment cancelled");
            setLoading(false);
          },
        },
        prefill: {
          name: selectedAddress?.recipient_name || "",
          contact: selectedAddress?.phone || "",
        },
        theme: {
          color: "#f97316",
        },
      };

      if (typeof window.Razorpay === "undefined") {
        setError("Payment gateway not available. Please refresh the page.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initiation error:", error);
      setError("Failed to initiate payment");
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 text-sm mb-6">Please sign in to continue checkout</p>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-orange-500 to-rose-500 border-0 rounded-xl w-full">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border border-gray-100 shadow-sm">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-7 h-7 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add some items to proceed</p>
          <Button onClick={() => navigate("/restaurants")} className="bg-gradient-to-r from-orange-500 to-rose-500 border-0 rounded-xl w-full">
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-6 md:py-8">
      <NavigationSafeWrapper>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate("/cart")} className="p-2 rounded-xl hover:bg-white transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      i + 1 <= currentStep
                        ? "bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200/50"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {i + 1 < currentStep ? <Check className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-medium mt-1.5 ${i + 1 <= currentStep ? "text-orange-600" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-12 sm:w-20 h-0.5 mx-2 mb-5 rounded-full transition-colors ${
                    i + 1 < currentStep ? "bg-orange-500" : "bg-gray-200"
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Step 1: Delivery Address */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
                    <AddressSelectionStep
                      onNext={handleAddressNext}
                      onBack={() => navigate("/cart")}
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                        <p className="text-xs text-gray-500">Choose how you'd like to pay</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {PAYMENT_METHODS.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                          className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
                            paymentMethod === method.id
                              ? "bg-orange-50 border-2 border-orange-400 shadow-sm"
                              : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            paymentMethod === method.id ? "bg-orange-100" : "bg-white"
                          }`}>
                            <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? "text-orange-500" : "text-gray-400"}`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{method.label}</p>
                            <p className="text-xs text-gray-500">{method.desc}</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            paymentMethod === method.id ? "border-orange-500 bg-orange-500" : "border-gray-300"
                          }`}>
                            {paymentMethod === method.id && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Instructions <span className="text-gray-400">(optional)</span>
                      </label>
                      <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 text-sm resize-none transition-all"
                        placeholder="Any special delivery instructions..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1 rounded-xl">
                        Back
                      </Button>
                      <Button onClick={handlePaymentNext} className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 border-0 rounded-xl">
                        Continue
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm space-y-5">
                    <h2 className="text-lg font-bold text-gray-900">Review Your Order</h2>

                    {/* Delivery Address */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-orange-500" />
                        <h3 className="font-medium text-gray-900 text-sm">Delivery Address</h3>
                      </div>
                      {selectedAddress ? (
                        <div className="text-sm text-gray-600 ml-6">
                          <p className="font-medium">{selectedAddress.recipient_name} — {selectedAddress.phone}</p>
                          <p>{selectedAddress.street_address}{selectedAddress.apartment && `, ${selectedAddress.apartment}`}{selectedAddress.landmark && `, ${selectedAddress.landmark}`}, {selectedAddress.city} - {selectedAddress.pincode}</p>
                        </div>
                      ) : (
                        <p className="text-red-600 text-sm ml-6">No address selected</p>
                      )}
                    </div>

                    {/* Payment */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-4 h-4 text-orange-500" />
                        <h3 className="font-medium text-gray-900 text-sm">Payment</h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm mb-3">Order Items</h3>
                      {brands.map((brand) => (
                        <div key={brand.brandId} className="mb-3 p-4 bg-gray-50 rounded-xl">
                          <p className="font-medium text-gray-900 text-sm mb-2">{brand.brandName}</p>
                          <div className="space-y-1.5">
                            {brand.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                                <span className="font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1 rounded-xl">
                        Back
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-rose-500 border-0 rounded-xl shadow-lg shadow-orange-200/50"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Placing...
                          </span>
                        ) : (
                          `Place Order — ₹${total}`
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-20 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fees</span>
                    <span className="font-medium">₹{totalDeliveryFees}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900 text-lg">₹{total}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated delivery: 25-35 min</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Free delivery on orders above ₹299</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="w-3.5 h-3.5" />
                    <span>100% secure payments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </NavigationSafeWrapper>
    </div>
  );
};
