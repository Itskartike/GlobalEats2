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
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { useSelectedAddress } from "../store/addressStore";
import { orderService, CreateOrderRequest } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { AddressSelectionStep } from "../components/features/checkout/AddressSelectionStep";
import { NavigationSafeWrapper } from "/src/components/common/NavigationSafeWrapper";
// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { brands, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const selectedAddress = useSelectedAddress();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<
    "cod" | "card" | "upi" | "wallet"
  >("cod");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const totalDeliveryFees = brands.reduce(
    (sum, brand) => sum + brand.deliveryFee,
    0
  );

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

      // Prepare order data
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
        // Handle different payment methods
        if (paymentMethod === "cod") {
          // For COD, fetch full order details with items
          clearCart();
          try {
            const orderDetails = await orderService.getOrderDetails(
              result.data.orders[0].id
            );
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
              // Fallback to basic order data if details fetch fails
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
            // Fallback to basic order data
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
          // For online payments, initiate payment gateway
          await handleOnlinePayment(result.data.orders[0]);
        }
      } else {
        setError(result.message || "Failed to place order");
      }
    } catch (error: unknown) {
      console.error("Error placing order:", error);
      setError(
        error instanceof Error ? error.message : "Failed to place order"
      );
    } finally {
      if (paymentMethod === "cod") {
        setLoading(false);
      }
      // For online payments, loading will be set to false after payment completion
    }
  };

  const handleOnlinePayment = async (order: any) => {
    try {
      // Create Razorpay order
      const paymentResult = await paymentService.createRazorpayOrder(order.id);

      if (!paymentResult.success || !paymentResult.data) {
        setError("Failed to initiate payment");
        setLoading(false);
        return;
      }

      const { razorpayOrder, paymentId, keyId } = paymentResult.data;

      // Initialize Razorpay
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Global Eats",
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            // Verify payment
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
          color: "#f97316", // Orange theme
        },
      };

      // Check if Razorpay is available
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please login to continue with checkout
          </p>
          <Button onClick={() => navigate("/")}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Empty Cart</h2>
          <p className="text-gray-600 mb-6">
            Your cart is empty. Add some items to checkout
          </p>
          <Button onClick={() => navigate("/")}>Browse Restaurants</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 md:py-8">
      <NavigationSafeWrapper>
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center mb-4 md:mb-8">
            <Button
              variant="outline"
              onClick={() => navigate("/cart")}
              className="mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Checkout
            </h1>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < currentStep ? <Check className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step < currentStep ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                </div>
              )}

              {/* Step 1: Delivery Address */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-5 md:p-6">
                    <AddressSelectionStep
                      onNext={handleAddressNext}
                      onBack={() => navigate("/cart")}
                    />
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-5 md:p-6">
                    <div className="flex items-center mb-6">
                      <CreditCard className="w-6 h-6 text-orange-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Payment Method
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          id: "cod",
                          label: "Cash on Delivery",
                          desc: "Pay when your order arrives",
                        },
                        {
                          id: "upi",
                          label: "UPI Payment",
                          desc: "Pay using UPI apps like GPay, PhonePe",
                        },
                        {
                          id: "card",
                          label: "Credit/Debit Card",
                          desc: "Pay securely with your card",
                        },
                        {
                          id: "wallet",
                          label: "Digital Wallet",
                          desc: "Pay using Paytm, Amazon Pay",
                        },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() =>
                            setPaymentMethod(
                              method.id as "cod" | "card" | "upi" | "wallet"
                            )
                          }
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            paymentMethod === method.id
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                paymentMethod === method.id
                                  ? "border-orange-500 bg-orange-500"
                                  : "border-gray-300"
                              }`}
                            >
                              {paymentMethod === method.id && (
                                <div className="w-full h-full rounded-full bg-white border-2 border-orange-500"></div>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {method.label}
                              </div>
                              <div className="text-sm text-gray-600">
                                {method.desc}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Special Instructions (Optional)
                        </label>
                        <textarea
                          value={specialInstructions}
                          onChange={(e) =>
                            setSpecialInstructions(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Any special instructions for delivery..."
                          rows={3}
                        />
                      </div>

                      <div className="flex space-x-4 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentStep(1)}
                          className="flex-1"
                        >
                          Back
                        </Button>
                        <Button onClick={handlePaymentNext} className="flex-1">
                          Continue to Review
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Order Review */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card className="p-5 md:p-6">
                    <div className="flex items-center mb-6">
                      <Check className="w-6 h-6 text-orange-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">
                        Review Your Order
                      </h2>
                    </div>

                    {/* Delivery Address Review */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Delivery Address
                      </h3>
                      {selectedAddress ? (
                        <>
                          <p className="text-gray-600">
                            {selectedAddress.recipient_name} -{" "}
                            {selectedAddress.phone}
                          </p>
                          <p className="text-gray-600">
                            {selectedAddress.street_address}
                            {selectedAddress.apartment &&
                              `, ${selectedAddress.apartment}`}
                            {selectedAddress.landmark &&
                              `, ${selectedAddress.landmark}`}
                            ,{selectedAddress.city} - {selectedAddress.pincode}
                          </p>
                        </>
                      ) : (
                        <p className="text-red-600">No address selected</p>
                      )}
                    </div>

                    {/* Payment Method Review */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Payment Method
                      </h3>
                      <p className="text-gray-600">
                        {paymentMethod === "cod" && "Cash on Delivery"}
                        {paymentMethod === "upi" && "UPI Payment"}
                        {paymentMethod === "card" && "Credit/Debit Card"}
                        {paymentMethod === "wallet" && "Digital Wallet"}
                      </p>
                    </div>

                    {/* Order Items Review */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-4">
                        Order Items
                      </h3>
                      {brands.map((brand) => (
                        <div
                          key={brand.brandId}
                          className="mb-4 p-4 border border-gray-200 rounded-lg"
                        >
                          <h4 className="font-medium text-gray-900 mb-2">
                            {brand.brandName}
                          </h4>
                          <div className="space-y-2">
                            {brand.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.name} x {item.quantity}
                                </span>
                                <span>
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading
                          ? "Placing Order..."
                          : `Place Order - ₹${total}`}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="p-5 md:p-6 sticky top-20 md:top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fees</span>
                    <span>₹{totalDeliveryFees}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes & Fees</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Estimated delivery: 25-35 min</span>
                  </div>
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 mr-2" />
                    <span>Free delivery on orders above ₹299</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </NavigationSafeWrapper>
    </div>
  );
};
