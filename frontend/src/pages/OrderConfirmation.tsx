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
  ExternalLink,
  Timer,
  DollarSign,
  Navigation,
  Sparkles,
  Heart,
  ThumbsUp,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
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
  total_amount?: number; // snake_case from API
  delivery_fee?: number; // snake_case from API
  tax_amount?: number; // snake_case from API
  estimatedDeliveryTime: string;
  paymentMethod: string;
  status: string;
  paymentStatus?: string;
  transactionId?: string;
  placedAt: string;
  items: OrderItem[];
  orderItems?: any[]; // Raw orderItems from API
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

    console.log("OrderConfirmation: Location state received:", state);

    if (state && state.orders) {
      // Use data from navigation state
      console.log(
        "OrderConfirmation: Using navigation state data:",
        state.orders
      );
      console.log("OrderConfirmation: First order data:", state.orders[0]);
      console.log(
        "OrderConfirmation: First order delivery address:",
        state.orders[0]?.deliveryAddress
      );
      console.log(
        "OrderConfirmation: Selected address from checkout:",
        state.selectedAddress
      );
      console.log(
        "OrderConfirmation: Payment method from state:",
        state.paymentMethod
      );
      console.log(
        "OrderConfirmation: Payment method from order:",
        state.orders[0]?.paymentMethod
      );
      console.log(
        "OrderConfirmation: Summary total amount:",
        state.summary?.totalAmount
      );
      console.log(
        "OrderConfirmation: Order total amount:",
        state.orders[0]?.totalAmount
      );
      console.log(
        "OrderConfirmation: Order total_amount:",
        state.orders[0]?.total_amount
      );
      console.log(
        "OrderConfirmation: Order subtotal:",
        state.orders[0]?.subtotal
      );
      console.log(
        "OrderConfirmation: Order delivery_fee:",
        state.orders[0]?.delivery_fee
      );
      console.log(
        "OrderConfirmation: Order tax_amount:",
        state.orders[0]?.tax_amount
      );
      console.log("OrderConfirmation: Order items:", state.orders[0]?.items);
      console.log(
        "OrderConfirmation: Order orderItems:",
        state.orders[0]?.orderItems
      );
      console.log(
        "OrderConfirmation: Order orderItems length:",
        state.orders[0]?.orderItems?.length
      );
      if (
        state.orders[0]?.orderItems &&
        state.orders[0].orderItems.length > 0
      ) {
        console.log(
          "OrderConfirmation: First orderItem:",
          state.orders[0].orderItems[0]
        );
        console.log(
          "OrderConfirmation: First orderItem menuItem:",
          state.orders[0].orderItems[0]?.menuItem
        );
      }

      // Process orders with enhanced backend data structure support
      const processedOrders = state.orders.map((order: any) => {
        console.log("OrderConfirmation: Processing order:", order.id);
        console.log("OrderConfirmation: Order items array:", order.items);
        console.log(
          "OrderConfirmation: Order orderItems array:",
          order.orderItems
        );

        // Use the enhanced items structure from improved backend or fallback to processing orderItems
        let processedItems = [];

        if (order.items && order.items.length > 0) {
          // Backend already provided processed items structure
          console.log(
            "OrderConfirmation: Using pre-processed items from backend"
          );
          processedItems = order.items.map((item: any) => ({
            id: item.id,
            menuItemId: item.menuItemId || item.menu_item_id,
            name: item.name || "Unknown Item",
            quantity: item.quantity || 1,
            price: parseFloat(item.unitPrice || item.price || 0),
            specialInstructions: item.specialInstructions,
            image: item.image,
            description: item.description,
            isVegetarian: item.isVegetarian,
            isVegan: item.isVegan,
            category: item.category,
          }));
        } else if (order.orderItems && order.orderItems.length > 0) {
          // Process raw orderItems from database
          console.log("OrderConfirmation: Processing raw orderItems");
          processedItems = order.orderItems.map((item: any) => ({
            id: item.id || item.menu_item_id || item.menuItemId,
            menuItemId: item.menu_item_id || item.menuItemId,
            name: item.menuItem?.name || item.name || "Unknown Item",
            quantity: item.quantity || 1,
            price: parseFloat(
              item.unit_price || item.price || item.menuItem?.base_price || 0
            ),
            specialInstructions:
              item.special_instructions || item.specialInstructions,
            image: item.menuItem?.image_url || item.menuItem?.image,
            description: item.menuItem?.description,
            isVegetarian: item.menuItem?.is_vegetarian,
            isVegan: item.menuItem?.is_vegan,
            category: item.menuItem?.category,
          }));
        }

        console.log(
          "OrderConfirmation: Processed items count:",
          processedItems.length
        );
        console.log(
          "OrderConfirmation: First processed item:",
          processedItems[0]
        );

        return {
          ...order,
          orderNumber: order.orderNumber || order.order_number || order.id,
          totalAmount: order.totalAmount || order.total_amount || 0,
          subtotal: order.subtotal || 0,
          deliveryFee: order.deliveryFee || order.delivery_fee || 0,
          taxAmount: order.taxAmount || order.tax_amount || 0,
          paymentMethod:
            state.paymentMethod ||
            order.paymentMethod ||
            order.payment_method ||
            "cod",
          items: processedItems,
          deliveryAddress:
            order.deliveryAddress ||
            (state.selectedAddress
              ? {
                  id: state.selectedAddress.id || "",
                  recipient_name:
                    state.selectedAddress.recipient_name ||
                    state.selectedAddress.name ||
                    "Customer",
                  street_address:
                    state.selectedAddress.street_address ||
                    state.selectedAddress.addressLine1 ||
                    "",
                  city: state.selectedAddress.city || "",
                  state: state.selectedAddress.state || "",
                  pincode:
                    state.selectedAddress.pincode ||
                    state.selectedAddress.postalCode ||
                    "",
                  phone:
                    state.selectedAddress.phone ||
                    state.selectedAddress.contact_number ||
                    "",
                  landmark:
                    state.selectedAddress.landmark ||
                    state.selectedAddress.addressLine2,
                  fullAddress:
                    state.selectedAddress.fullAddress ||
                    `${state.selectedAddress.street_address || state.selectedAddress.addressLine1}, ${state.selectedAddress.city}`,
                  area:
                    state.selectedAddress.area || state.selectedAddress.city,
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

      console.log("OrderConfirmation: Processed orders:", processedOrders);
      console.log(
        "OrderConfirmation: First processed order items:",
        processedOrders[0]?.items
      );
      console.log(
        "OrderConfirmation: Items length:",
        processedOrders[0]?.items?.length
      );

      setOrders(processedOrders);
      setSummary(state.summary);
      setPaymentStatus(state.paymentStatus || "pending");
      setLoading(false);
    } else if (state && state.orderId) {
      // Fetch order data from API using order ID
      console.log(
        "OrderConfirmation: Fetching order details for ID:",
        state.orderId
      );
      fetchOrderDetails(state.orderId);
    } else {
      // If no state, redirect to home
      console.log("OrderConfirmation: No state data, redirecting to home");
      navigate("/");
    }
  }, [location.state, navigate]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      const result = await orderService.getOrderDetails(orderId);

      if (result.success && result.data) {
        const apiData = result.data as any;

        console.log("OrderConfirmation: Raw API response:", apiData);
        console.log("OrderConfirmation: Address data:", apiData.address);
        console.log(
          "OrderConfirmation: Address keys:",
          apiData.address ? Object.keys(apiData.address) : "No address"
        );
        console.log("OrderConfirmation: Outlet data:", apiData.outlet);
        console.log("OrderConfirmation: Order items:", apiData.orderItems);
        console.log("OrderConfirmation: Order number:", apiData.order_number);
        console.log("OrderConfirmation: Order ID:", apiData.id);

        // Transform the API response to match our interface
        const orderData: Order = {
          id: apiData.id,
          orderNumber:
            apiData.order_number || apiData.orderNumber || apiData.id,
          subtotal: parseFloat(apiData.subtotal || 0),
          deliveryFee: parseFloat(
            apiData.delivery_fee || apiData.deliveryFee || 0
          ),
          taxAmount: parseFloat(apiData.tax_amount || apiData.taxAmount || 0),
          totalAmount: parseFloat(
            apiData.total_amount || apiData.totalAmount || 0
          ),
          estimatedDeliveryTime:
            apiData.estimated_delivery_time ||
            apiData.estimatedDeliveryTime ||
            new Date().toISOString(),
          paymentMethod:
            apiData.payment_method || apiData.paymentMethod || "cod",
          status: apiData.status || "pending",
          paymentStatus:
            apiData.payment_status || apiData.paymentStatus || "pending",
          transactionId: apiData.payment_id || apiData.transactionId,
          placedAt:
            apiData.created_at || apiData.createdAt || new Date().toISOString(),
          items: (apiData.orderItems || []).map((item: any) => ({
            id: item.id || item.menu_item_id || item.menuItemId,
            menuItemId: item.menu_item_id || item.menuItemId,
            name: item.menuItem?.name || item.name || "Item",
            quantity: item.quantity || 1,
            price: parseFloat(
              item.unit_price || item.price || item.menuItem?.base_price || 0
            ),
            specialInstructions:
              item.special_instructions || item.specialInstructions,
            image: item.menuItem?.image_url || item.menuItem?.image,
          })),
          deliveryAddress: {
            id: apiData.address?.id || "",
            recipient_name:
              apiData.address?.recipient_name ||
              apiData.address?.name ||
              "Customer",
            street_address: apiData.address?.street_address || "",
            city: apiData.address?.city || "",
            state: apiData.address?.state || "",
            pincode: apiData.address?.pincode || "",
            phone:
              apiData.address?.phone || apiData.address?.contact_number || "",
            landmark: apiData.address?.landmark,
            fullAddress: apiData.address?.fullAddress,
            area: apiData.address?.area,
          },
          restaurant: {
            id:
              apiData.outlet?.Brands?.[0]?.id || apiData.outlet?.brand_id || "",
            name:
              apiData.outlet?.Brands?.[0]?.name ||
              apiData.outlet?.brandName ||
              "Restaurant",
            outletName:
              apiData.outlet?.name || apiData.outlet?.outlet_name || "Outlet",
            outletAddress:
              apiData.outlet?.address || apiData.outlet?.outlet_address || "",
            phone: apiData.outlet?.phone || apiData.outlet?.contact_number,
            rating:
              apiData.outlet?.Brands?.[0]?.average_rating ||
              apiData.outlet?.rating,
          },
          specialInstructions:
            apiData.special_instructions || apiData.specialInstructions,
        };

        console.log("OrderConfirmation: Transformed order data:", orderData);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-orange-500 text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Order Data
          </h2>
          <p className="text-gray-600 mb-4">Unable to load order information</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-orange-100 text-orange-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const handleShareOrder = async () => {
    const order = orders[0];
    const orderNumber = order?.orderNumber || order?.id || "N/A";
    const restaurantName = order?.restaurant?.name || "Global Eats";
    const shareText = `Check out my order from ${restaurantName}! Order #${orderNumber}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Order",
          text: shareText,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success("Order details copied to clipboard!");
    }
  };

  const handleReorder = () => {
    // TODO: Implement reorder functionality
    toast.success("Reorder feature coming soon!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fed7aa' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-6 md:py-12 max-w-7xl">
        {/* Modern Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8 md:mb-12"
        >
          {/* Animated Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4"
          >
            Order Confirmed! 🎉
          </motion.h1>

          {/* Prominent Order Number Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl px-8 py-4 shadow-2xl mb-6 inline-block"
          >
            <div className="text-sm font-medium opacity-90 mb-1">
              Your Order Number
            </div>
            <div className="text-2xl md:text-3xl font-bold">
              #{orders[0]?.orderNumber || orders[0]?.id || "N/A"}
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto"
          >
            Thank you for choosing Global Eats! Your delicious meal is being
            prepared with love.
          </motion.p>

          {/* Order Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-6"
          >
            <Badge
              className={`${getStatusColor(orders[0]?.status)} text-sm px-4 py-2 rounded-full shadow-lg`}
            >
              {orders[0]?.status?.toUpperCase() || "PENDING"}
            </Badge>
          </motion.div>

          {/* Payment Status */}
          <AnimatePresence>
            {paymentStatus === "paid" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Payment Successful
              </motion.div>
            )}
            {paymentStatus === "pending" &&
              orders.length > 0 &&
              orders[0].paymentMethod !== "cod" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg"
                >
                  <Timer className="w-5 h-5 mr-2" />
                  Payment Pending
                </motion.div>
              )}
          </AnimatePresence>
        </motion.div>

        {/* Modern Order Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12"
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {summary?.totalOrders || orders.length}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {orders.length === 1 ? "Order" : "Orders"} Placed
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                ₹
                {Number(
                  summary?.totalAmount ||
                    orders.reduce(
                      (sum, order) =>
                        sum + (order.totalAmount || order.total_amount || 0),
                      0
                    )
                ).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Total Amount
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-orange-100 hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                25-35
              </div>
              <div className="text-sm text-gray-600 font-medium">Minutes</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                ₹
                {Number(
                  summary?.totalDeliveryFee ||
                    orders.reduce(
                      (sum, order) =>
                        sum + (order.deliveryFee || order.delivery_fee || 0),
                      0
                    )
                ).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Delivery Fee
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-3">
                    <Receipt className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Order Items
                  </h3>
                </div>

                <div className="space-y-4">
                  {orders[0]?.items && orders[0].items.length > 0 ? (
                    orders[0].items.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center">
                            {/* Item Image */}
                            <div className="w-16 h-16 rounded-2xl overflow-hidden mr-4 flex-shrink-0">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    const nextElement = e.currentTarget
                                      .nextElementSibling as HTMLElement;
                                    if (nextElement) {
                                      nextElement.style.display = "flex";
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className={`w-full h-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center ${item.image ? "hidden" : "flex"}`}
                              >
                                <span className="text-white font-bold text-lg">
                                  🍽️
                                </span>
                              </div>
                            </div>

                            {/* Item Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                {item.name}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600 mb-2">
                                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium mr-2">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="ml-2 font-semibold text-green-600">
                                  ₹{Number(item.price).toFixed(2)} each
                                </span>
                              </div>
                              {item.specialInstructions && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 mt-2">
                                  <p className="text-sm text-yellow-800 italic">
                                    <span className="font-medium">
                                      Special Instructions:
                                    </span>{" "}
                                    "{item.specialInstructions}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price Summary */}
                        <div className="text-right ml-4 flex-shrink-0">
                          <div className="font-bold text-gray-900 text-xl">
                            ₹{Number(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} × ₹{Number(item.price).toFixed(2)}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg">
                        No items found in this order
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Please contact support if you need assistance
                      </p>
                    </div>
                  )}

                  {/* Order Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="pt-6 border-t-2 border-gray-200 space-y-3"
                  >
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600 font-medium">
                        Subtotal
                      </span>
                      <span className="font-semibold">
                        ₹{Number(orders[0]?.subtotal || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600 font-medium">
                        Delivery Fee
                      </span>
                      <span className="font-semibold">
                        ₹
                        {Number(
                          orders[0]?.deliveryFee || orders[0]?.delivery_fee || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-gray-600 font-medium">Tax</span>
                      <span className="font-semibold">
                        ₹
                        {Number(
                          orders[0]?.taxAmount || orders[0]?.tax_amount || 0
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t-2 border-orange-200 pt-3">
                      <div className="flex justify-between font-bold text-xl">
                        <span className="text-gray-900">Total</span>
                        <span className="text-orange-600">
                          ₹
                          {Number(
                            orders[0]?.totalAmount ||
                              orders[0]?.total_amount ||
                              0
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-green-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mr-3">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Delivery Address
                  </h3>
                </div>

                {orders[0]?.deliveryAddress ? (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="font-bold text-gray-900 text-lg">
                        {orders[0].deliveryAddress.recipient_name || "Customer"}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <Navigation className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="flex-1">
                        {/* Use fullAddress if available, otherwise construct from parts */}
                        {orders[0].deliveryAddress.fullAddress ? (
                          <p className="text-gray-700 font-medium mb-2">
                            {orders[0].deliveryAddress.fullAddress}
                          </p>
                        ) : (
                          <div>
                            <p className="text-gray-700 font-medium">
                              {orders[0].deliveryAddress.street_address ||
                                "Address not available"}
                            </p>
                            {orders[0].deliveryAddress.area && (
                              <p className="text-gray-600">
                                {orders[0].deliveryAddress.area}
                              </p>
                            )}
                          </div>
                        )}

                        <p className="text-gray-600">
                          {orders[0].deliveryAddress.city || "City"},{" "}
                          {orders[0].deliveryAddress.state || "State"} -{" "}
                          {orders[0].deliveryAddress.pincode || "Pincode"}
                        </p>

                        {orders[0].deliveryAddress.landmark && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Landmark:</span>{" "}
                            {orders[0].deliveryAddress.landmark}
                          </p>
                        )}
                      </div>
                    </div>

                    {orders[0].deliveryAddress.phone && (
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3" />
                        <a
                          href={`tel:${orders[0].deliveryAddress.phone}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {orders[0].deliveryAddress.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">
                      Delivery address not available
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Please contact support if you need assistance
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Payment & Support */}
          <div className="space-y-6">
            {/* Payment Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl border border-blue-100">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-3">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Payment Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-2xl">
                    <span className="text-gray-600 font-medium">
                      Payment Method
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatPaymentMethod(orders[0]?.paymentMethod || "cod")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-2xl">
                    <span className="text-gray-600 font-medium">
                      Payment Status
                    </span>
                    <Badge
                      className={`${paymentStatus === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"} px-3 py-1 rounded-full font-medium`}
                    >
                      {paymentStatus === "paid" ? "Paid" : "Pending"}
                    </Badge>
                  </div>

                  {orders[0]?.transactionId && (
                    <div className="flex justify-between items-center p-3 bg-gray-50/50 rounded-2xl">
                      <span className="text-gray-600 font-medium">
                        Transaction ID
                      </span>
                      <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                        {orders[0].transactionId}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
                    <span className="text-gray-700 font-bold text-lg">
                      Order Total
                    </span>
                    <span className="font-bold text-orange-600 text-xl">
                      ₹
                      {Number(
                        orders[0]?.totalAmount || orders[0]?.total_amount || 0
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Support */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl p-6 md:p-8 shadow-xl border border-orange-200">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mr-3">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Need Help?
                  </h3>
                </div>
                <p className="text-gray-600 mb-6 font-medium">
                  Contact our support team if you have any questions about your
                  order.
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-orange-600 border-orange-600 hover:bg-orange-100 font-medium py-3 rounded-2xl"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Support
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-orange-600 border-orange-600 hover:bg-orange-100 font-medium py-3 rounded-2xl"
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    Live Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Modern Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row gap-4 md:gap-6 justify-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/profile">
              <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg">
                <Package className="w-5 h-5 mr-2" />
                Track Your Orders
              </Button>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold py-4 px-8 rounded-2xl shadow-lg"
              onClick={handleShareOrder}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Order
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              className="w-full sm:w-auto border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white font-bold py-4 px-8 rounded-2xl shadow-lg"
              onClick={handleReorder}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reorder
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white font-bold py-4 px-8 rounded-2xl shadow-lg"
              >
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Modern Rating Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-12"
        >
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-3xl p-8 md:p-12 text-center shadow-2xl border border-yellow-200">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Star className="w-8 h-8 text-white" />
            </motion.div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Loving Global Eats? 🍽️
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Share your experience and help others discover amazing food! Your
              feedback helps us serve you better.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white font-bold py-4 px-8 rounded-2xl shadow-lg"
                >
                  <ThumbsUp className="w-5 h-5 mr-2" />
                  Rate Your Experience
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white font-bold py-4 px-8 rounded-2xl shadow-lg"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Write a Review
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
