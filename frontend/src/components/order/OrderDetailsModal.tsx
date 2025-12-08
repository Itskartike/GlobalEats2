import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Clock,
  MapPin,
  Phone,
  CreditCard,
  CheckCircle,
  XCircle,
  Truck,
  Star,
  MessageCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization?: any;
  special_instructions?: string;
  menuItem?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    image_url?: string;
  };
}

interface DeliveryAddress {
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  recipient_name: string;
  phone: string;
}

interface Order {
  id: string;
  orderNumber?: string;
  order_number?: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  totalAmount?: number;
  total_amount?: number;
  subtotal?: number;
  deliveryFee?: number;
  delivery_fee?: number;
  taxAmount?: number;
  tax_amount?: number;
  discountAmount?: number;
  discount_amount?: number;
  paymentMethod?: string;
  payment_method?: string;
  specialInstructions?: string;
  special_instructions?: string;
  estimatedDeliveryTime?: string;
  estimated_delivery_time?: string;
  actualDeliveryTime?: string;
  actual_delivery_time?: string;
  deliveryAddress?: DeliveryAddress;
  orderItems?: OrderItem[];
  rating?: number;
  review?: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onCancelOrder?: (orderId: string) => void;
  onRateOrder?: (orderId: string, rating: number, review?: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
  onCancelOrder,
  onRateOrder,
}) => {
  if (!order) return null;

  // Helper function to get order status display
  const getOrderStatusDisplay = (status: string) => {
    const statusMap: {
      [key: string]: { label: string; color: string; icon: React.ReactNode };
    } = {
      pending: {
        label: "Order Placed",
        color: "text-blue-600 bg-blue-50",
        icon: <Package className="w-4 h-4" />,
      },
      confirmed: {
        label: "Confirmed",
        color: "text-green-600 bg-green-50",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      preparing: {
        label: "Preparing",
        color: "text-yellow-600 bg-yellow-50",
        icon: <Clock className="w-4 h-4" />,
      },
      ready: {
        label: "Ready for Pickup",
        color: "text-indigo-600 bg-indigo-50",
        icon: <Package className="w-4 h-4" />,
      },
      picked_up: {
        label: "Picked Up",
        color: "text-purple-600 bg-purple-50",
        icon: <Truck className="w-4 h-4" />,
      },
      out_for_delivery: {
        label: "Out for Delivery",
        color: "text-blue-600 bg-blue-50",
        icon: <Truck className="w-4 h-4" />,
      },
      delivered: {
        label: "Delivered",
        color: "text-green-600 bg-green-50",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      cancelled: {
        label: "Cancelled",
        color: "text-red-600 bg-red-50",
        icon: <XCircle className="w-4 h-4" />,
      },
      refunded: {
        label: "Refunded",
        color: "text-red-600 bg-red-50",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return (
      statusMap[status] || {
        label: status.replace(/_/g, " "),
        color: "text-gray-600 bg-gray-50",
        icon: <Package className="w-4 h-4" />,
      }
    );
  };

  const statusDisplay = getOrderStatusDisplay(order.status);
  const orderNumber = order.orderNumber || order.order_number || "N/A";
  const createdAt = order.createdAt || order.created_at;
  const totalAmount = order.totalAmount || order.total_amount || 0;
  const subtotal = order.subtotal || 0;
  const deliveryFee = order.deliveryFee || order.delivery_fee || 0;
  const taxAmount = order.taxAmount || order.tax_amount || 0;
  const discountAmount = order.discountAmount || order.discount_amount || 0;
  const paymentMethod = order.paymentMethod || order.payment_method || "N/A";
  const specialInstructions =
    order.specialInstructions || order.special_instructions;
  const estimatedDeliveryTime =
    order.estimatedDeliveryTime || order.estimated_delivery_time;
  const actualDeliveryTime =
    order.actualDeliveryTime || order.actual_delivery_time;

  const canCancel = ["pending", "confirmed"].includes(order.status);
  const canRate = order.status === "delivered" && !order.rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{orderNumber}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  {/* Order Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${statusDisplay.color}`}
                      >
                        {statusDisplay.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {statusDisplay.label}
                        </h3>
                        {createdAt && (
                          <p className="text-sm text-gray-500">
                            {new Date(createdAt).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ₹{totalAmount}
                      </div>
                      <div className="text-sm text-gray-500">
                        {paymentMethod.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  {order.deliveryAddress && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Delivery Address
                      </h4>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">
                          {order.deliveryAddress.recipient_name}
                        </p>
                        <p>
                          {order.deliveryAddress.street_address}
                          {order.deliveryAddress.apartment &&
                            `, ${order.deliveryAddress.apartment}`}
                        </p>
                        <p>
                          {order.deliveryAddress.city},{" "}
                          {order.deliveryAddress.state}{" "}
                          {order.deliveryAddress.pincode}
                        </p>
                        <div className="flex items-center mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {order.deliveryAddress.phone}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Package className="w-4 h-4 mr-2" />
                        Order Items ({order.orderItems.length})
                      </h4>
                      <div className="space-y-3">
                        {order.orderItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start"
                          >
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {item.menuItem?.name ||
                                  item.name ||
                                  `Item ${index + 1}`}
                              </h5>
                              <p className="text-sm text-gray-500">
                                Quantity: {item.quantity} × ₹{item.unit_price}
                              </p>
                              {item.special_instructions && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Note: {item.special_instructions}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">
                                ₹{item.total_price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Order Summary */}
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{taxAmount}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{discountAmount}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between font-medium text-gray-900">
                          <span>Total</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Special Instructions */}
                  {specialInstructions && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Special Instructions
                      </h4>
                      <p className="text-sm text-gray-600">
                        {specialInstructions}
                      </p>
                    </Card>
                  )}

                  {/* Delivery Times */}
                  {(estimatedDeliveryTime || actualDeliveryTime) && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Delivery Information
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        {estimatedDeliveryTime && (
                          <p>
                            Estimated Delivery:{" "}
                            {new Date(estimatedDeliveryTime).toLocaleString()}
                          </p>
                        )}
                        {actualDeliveryTime && (
                          <p>
                            Delivered At:{" "}
                            {new Date(actualDeliveryTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Rating & Review */}
                  {order.rating && (
                    <Card className="p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Your Review
                      </h4>
                      <div className="flex items-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= order.rating!
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {order.rating}/5
                        </span>
                      </div>
                      {order.review && (
                        <p className="text-sm text-gray-600">{order.review}</p>
                      )}
                    </Card>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  {canCancel && onCancelOrder && (
                    <Button
                      variant="outline"
                      onClick={() => onCancelOrder(order.id)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                  {canRate && onRateOrder && (
                    <Button
                      onClick={() => {
                        // This would open a rating modal or form
                        onRateOrder(order.id, 5, "Great order!");
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Rate Order
                    </Button>
                  )}
                </div>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
