import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Phone,
  CreditCard,
  Package,
  Truck,
  Star,
  Home,
  MapPin,
  User,
  Receipt,
  Share2,
  RotateCcw,
  MessageCircle,
  Timer,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { orderService } from "../services/orderService";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
  image?: string;
}

interface DeliveryAddress {
  id: string;
  recipient_name: string;
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  landmark?: string;
  fullAddress?: string;
  area?: string;
}

interface Restaurant {
  id: string;
  name: string;
  outletName: string;
  outletAddress: string;
  phone?: string;
  rating?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  total_amount?: number;
  delivery_fee?: number;
  tax_amount?: number;
  estimatedDeliveryTime: string;
  paymentMethod: string;
  status: string;
  paymentStatus?: string;
  transactionId?: string;
  placedAt: string;
  items: OrderItem[];
  orderItems?: any[];
  deliveryAddress: DeliveryAddress;
  restaurant: Restaurant;
  specialInstructions?: string;
}

interface OrderSummary {
  totalOrders: number;
  totalAmount: number;
  totalDeliveryFee: number;
  estimatedDeliveryTime: string;
}

interface LocationState {
  orders: Order[];
  summary: OrderSummary;
  paymentMethod?: string;
  paymentStatus?: string;
  orderId?: string;
  selectedAddress?: any;
}

export const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const state = location.state as LocationState;

    if (state && state.orders) {
      const processedOrders = state.orders.map((order: any) => {
        let processedItems: OrderItem[] = [];

        if (order.items && order.items.length > 0) {
          processedItems = order.items.map((item: any) => ({
            id: item.id,
            menuItemId: item.menuItemId || item.menu_item_id,
            name: item.name || "Unknown Item",
            quantity: item.quantity || 1,
            price: parseFloat(item.unitPrice || item.price || 0),
            specialInstructions: item.specialInstructions,
            image: item.image,
          }));
        } else if (order.orderItems && order.orderItems.length > 0) {
          processedItems = order.orderItems.map((item: any) => ({
            id: item.id || item.menu_item_id || item.menuItemId,
            menuItemId: item.menu_item_id || item.menuItemId,
            name: item.menuItem?.name || item.name || "Unknown Item",
            quantity: item.quantity || 1,
            price: parseFloat(item.unit_price || item.price || item.menuItem?.base_price || 0),
            specialInstructions: item.special_instructions || item.specialInstructions,
            image: item.menuItem?.image_url || item.menuItem?.image,
          }));
        }

        return {
          ...order,
          orderNumber: order.orderNumber || order.order_number || order.id,
          totalAmount: order.totalAmount || order.total_amount || 0,
          subtotal: order.subtotal || 0,
          deliveryFee: order.deliveryFee || order.delivery_fee || 0,
          taxAmount: order.taxAmount || order.tax_amount || 0,
          paymentMethod: state.paymentMethod || order.paymentMethod || order.payment_method || "cod",
          items: processedItems,
          deliveryAddress:
            order.deliveryAddress ||
            (state.selectedAddress
              ? {
                  id: state.selectedAddress.id || "",
                  recipient_name: state.selectedAddress.recipient_name || state.selectedAddress.name || "Customer",
                  street_address: state.selectedAddress.street_address || state.selectedAddress.addressLine1 || "",
                  city: state.selectedAddress.city || "",
                  state: state.selectedAddress.state || "",
                  pincode: state.selectedAddress.pincode || state.selectedAddress.postalCode || "",
                  phone: state.selectedAddress.phone || state.selectedAddress.contact_number || "",
                  landmark: state.selectedAddress.landmark || state.selectedAddress.addressLine2,
                  fullAddress: state.selectedAddress.fullAddress || `${state.selectedAddress.street_address || state.selectedAddress.addressLine1}, ${state.selectedAddress.city}`,
                  area: state.selectedAddress.area || state.selectedAddress.city,
                }
              : {
                  id: order.addressId || "",
                  recipient_name: order.recipient_name || "Customer",
                  street_address: order.street_address || "",
                  city: order.city || "",
                  state: order.state || "",
                  pincode: order.pincode || "",
                  phone: order.phone || "",
                  landmark: order.landmark,
                  fullAddress: order.fullAddress,
                  area: order.area,
                }),
          restaurant: order.restaurant || {
            id: order.outlet?.id || "",
            outletName: order.outlet?.name || "Restaurant",
            outletAddress: order.outlet?.address || "",
            phone: order.outlet?.phone || "",
            brand: order.outlet?.Brands?.[0]
              ? {
                  id: order.outlet.Brands[0].id,
                  name: order.outlet.Brands[0].name,
                  logo: order.outlet.Brands[0].logo_url,
                  cuisine: order.outlet.Brands[0].cuisine_type,
                }
              : null,
          },
        };
      });

      setOrders(processedOrders);
      setSummary(state.summary);
      setPaymentStatus(state.paymentStatus || "pending");
      setLoading(false);
    } else if (state && state.orderId) {
      fetchOrderDetails(state.orderId);
    } else {
      navigate("/");
    }
  }, [location.state, navigate]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const result = await orderService.getOrderDetails(orderId);

      if (result.success && result.data) {
        const apiData = result.data as any;

        const orderData: Order = {
          id: apiData.id,
          orderNumber: apiData.order_number || apiData.orderNumber || apiData.id,
          subtotal: parseFloat(apiData.subtotal || 0),
          deliveryFee: parseFloat(apiData.delivery_fee || apiData.deliveryFee || 0),
          taxAmount: parseFloat(apiData.tax_amount || apiData.taxAmount || 0),
          totalAmount: parseFloat(apiData.total_amount || apiData.totalAmount || 0),
          estimatedDeliveryTime: apiData.estimated_delivery_time || apiData.estimatedDeliveryTime || new Date().toISOString(),
          paymentMethod: apiData.payment_method || apiData.paymentMethod || "cod",
          status: apiData.status || "pending",
          paymentStatus: apiData.payment_status || apiData.paymentStatus || "pending",
          transactionId: apiData.payment_id || apiData.transactionId,
          placedAt: apiData.created_at || apiData.createdAt || new Date().toISOString(),
          items: (apiData.orderItems || []).map((item: any) => ({
            id: item.id || item.menu_item_id || item.menuItemId,
            menuItemId: item.menu_item_id || item.menuItemId,
            name: item.menuItem?.name || item.name || "Item",
            quantity: item.quantity || 1,
            price: parseFloat(item.unit_price || item.price || item.menuItem?.base_price || 0),
            specialInstructions: item.special_instructions || item.specialInstructions,
            image: item.menuItem?.image_url || item.menuItem?.image,
          })),
          deliveryAddress: {
            id: apiData.address?.id || "",
            recipient_name: apiData.address?.recipient_name || apiData.address?.name || "Customer",
            street_address: apiData.address?.street_address || "",
            city: apiData.address?.city || "",
            state: apiData.address?.state || "",
            pincode: apiData.address?.pincode || "",
            phone: apiData.address?.phone || apiData.address?.contact_number || "",
            landmark: apiData.address?.landmark,
            fullAddress: apiData.address?.fullAddress,
            area: apiData.address?.area,
          },
          restaurant: {
            id: apiData.outlet?.Brands?.[0]?.id || apiData.outlet?.brand_id || "",
            name: apiData.outlet?.Brands?.[0]?.name || apiData.outlet?.brandName || "Restaurant",
            outletName: apiData.outlet?.name || apiData.outlet?.outlet_name || "Outlet",
            outletAddress: apiData.outlet?.address || apiData.outlet?.outlet_address || "",
            phone: apiData.outlet?.phone || apiData.outlet?.contact_number,
            rating: apiData.outlet?.Brands?.[0]?.average_rating || apiData.outlet?.rating,
          },
          specialInstructions: apiData.special_instructions || apiData.specialInstructions,
        };

        setOrders([orderData]);
        setSummary({
          totalOrders: 1,
          totalAmount: orderData.totalAmount,
          totalDeliveryFee: orderData.deliveryFee,
          estimatedDeliveryTime: orderData.estimatedDeliveryTime,
        });
        setPaymentStatus(orderData.paymentStatus || "pending");
      } else {
        setError("Failed to fetch order details");
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const formatPaymentMethod = (method: string) => {
    const methods: Record<string, string> = {
      cod: "Cash on Delivery",
      cash: "Cash on Delivery",
      upi: "UPI Payment",
      card: "Credit/Debit Card",
      wallet: "Digital Wallet",
      netbanking: "Net Banking",
    };
    return methods[method] || method;
  };

  const handleShareOrder = async () => {
    const order = orders[0];
    const orderNumber = order?.orderNumber || order?.id || "N/A";
    const restaurantName = order?.restaurant?.name || "Global Eats";
    const shareText = `Check out my order from ${restaurantName}! Order #${orderNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "My Order", text: shareText, url: window.location.href });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Order details copied to clipboard!");
    }
  };

  const handleReorder = () => {
    toast.success("Reorder feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-sm">
          <p className="text-4xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-orange-500 to-rose-500 border-0 rounded-xl w-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-sm">
          <p className="text-4xl mb-4">🍽️</p>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Order Data</h2>
          <p className="text-gray-500 text-sm mb-6">Unable to load order information</p>
          <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-orange-500 to-rose-500 border-0 rounded-xl w-full">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const order = orders[0];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/30 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-14 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-4xl font-bold text-white mb-2"
          >
            Order Confirmed! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-green-100 text-sm md:text-base mb-6"
          >
            Your meal is being prepared with love
          </motion.p>

          {/* Order Number Pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30"
          >
            <span className="text-green-100 text-sm">Order</span>
            <span className="text-white font-bold text-lg">
              #{order.orderNumber || order.id || "N/A"}
            </span>
          </motion.div>

          {/* Payment Status */}
          <AnimatePresence>
            {paymentStatus === "paid" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Payment Successful
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-4xl mx-auto px-4 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            {
              icon: Timer,
              value: "25-35 min",
              label: "Delivery",
              gradient: "from-orange-500 to-rose-500",
            },
            {
              icon: Package,
              value: `${order.items.length}`,
              label: "Items",
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              icon: Truck,
              value: `₹${Number(order.deliveryFee || order.delivery_fee || 0).toFixed(0)}`,
              label: "Delivery Fee",
              gradient: "from-purple-500 to-pink-500",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 text-center shadow-md border border-gray-100"
            >
              <div className={`w-9 h-9 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-gray-900 text-sm">{stat.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Order Items</h3>
            </div>
          </div>

          {order.items && order.items.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {order.items.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-rose-100 flex items-center justify-center">
                        <span className="text-lg">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                    <p className="text-xs text-gray-400">Qty: {item.quantity} × ₹{Number(item.price).toFixed(2)}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    ₹{Number(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}

              {/* Price Breakdown */}
              <div className="px-5 py-4 bg-gray-50/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium">₹{Number(order.deliveryFee || order.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">₹{Number(order.taxAmount || order.tax_amount || 0).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-orange-600 text-lg">
                      ₹{Number(order.totalAmount || order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 px-5">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No items found in this order</p>
            </div>
          )}
        </motion.div>

        {/* Delivery & Payment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Delivery Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Delivery Address</h3>
            </div>

            {order.deliveryAddress ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium text-gray-900">
                    {order.deliveryAddress.recipient_name || "Customer"}
                  </span>
                </div>
                <p className="text-gray-600 ml-5.5">
                  {order.deliveryAddress.fullAddress ||
                    `${order.deliveryAddress.street_address || "Address not available"}`}
                </p>
                <p className="text-gray-500 ml-5.5">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
                {order.deliveryAddress.landmark && (
                  <p className="text-xs text-gray-400 ml-5.5">
                    Landmark: {order.deliveryAddress.landmark}
                  </p>
                )}
                {order.deliveryAddress.phone && (
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <a href={`tel:${order.deliveryAddress.phone}`} className="text-green-600 font-medium text-sm">
                      {order.deliveryAddress.phone}
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Address not available</p>
            )}
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Payment Details</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Method</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPaymentMethod(order.paymentMethod || "cod")}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  paymentStatus === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}>
                  {paymentStatus === "paid" ? "Paid" : "Pending"}
                </span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Transaction ID</span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                    {order.transactionId}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-sm">Total Paid</span>
                <span className="font-bold text-orange-600">
                  ₹{Number(order.totalAmount || order.total_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Link to="/profile">
            <button className="w-full flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Track Order</span>
            </button>
          </Link>
          <button
            onClick={handleShareOrder}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Share2 className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Share</span>
          </button>
          <button
            onClick={handleReorder}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all"
          >
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-700">Reorder</span>
          </button>
          <Link to="/">
            <button className="w-full flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-gray-700">Home</span>
            </button>
          </Link>
        </motion.div>

        {/* Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl p-5 border border-orange-100/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Need Help?</h3>
                <p className="text-xs text-gray-500">Our support team is here for you</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-orange-600 text-sm font-medium rounded-xl shadow-sm hover:shadow-md transition-all border border-orange-100">
              <Phone className="w-3.5 h-3.5" />
              Contact
            </button>
          </div>
        </motion.div>

        {/* Rating Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Star className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Enjoying GlobalEats?</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Your feedback helps us serve you better
          </p>
          <div className="flex gap-3 justify-center">
            <button className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-orange-200/30 hover:from-amber-600 hover:to-orange-600 transition-all">
              Rate Experience
            </button>
            <Link to="/">
              <button className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all">
                Maybe Later
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
