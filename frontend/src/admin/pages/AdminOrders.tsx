import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "@headlessui/react";
import {
  Search,
  Eye,
  Edit2,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization?: any;
  special_instructions?: string;
  menuItem: {
    id: string;
    name: string;
    base_price: number;
    parentBrand?: {
      id: string;
      name: string;
      logo_url?: string;
    };
    categoryInfo?: {
      id: string;
      name: string;
    };
  };
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  order_type: string;
  subtotal: number;
  delivery_fee: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_status: string;
  payment_method?: string;
  special_instructions?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  preparation_time?: number;
  delivery_time?: number;
  created_at: string;
  updated_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  outlet: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  address: {
    id: string;
    street_address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  orderItems: OrderItem[];
  restaurant_notes?: any;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("admin_order_sound_enabled");
      return stored ? stored === "true" : true;
    } catch {
      return true;
    }
  });
  const [soundWave, setSoundWave] = useState<"sine" | "square" | "sawtooth" | "triangle">(() => {
    try {
      const stored = localStorage.getItem("admin_order_sound_wave");
      if (stored === "sine" || stored === "square" || stored === "sawtooth" || stored === "triangle") return stored;
      return "sine";
    } catch {
      return "sine";
    }
  });
  const [soundDurationMs, setSoundDurationMs] = useState<number>(() => {
    try {
      const stored = localStorage.getItem("admin_order_sound_duration_ms");
      const n = stored ? parseInt(stored, 10) : 600;
      return Number.isFinite(n) && n >= 200 && n <= 5000 ? n : 600;
    } catch {
      return 600;
    }
  });
  const lastSeenOrderIdRef = useRef<string | null>(null);
  const initializedRef = useRef<boolean>(false);
  const audioCtxRef = useRef<any>(null);
  const speechVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    outlet_id: "",
    search: "",
    date_from: "",
    date_to: "",
    order_type: "",
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const orderStatuses = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
    { value: "preparing", label: "Preparing", color: "bg-orange-100 text-orange-800" },
    { value: "ready", label: "Ready", color: "bg-purple-100 text-purple-800" },
    { value: "picked_up", label: "Picked Up", color: "bg-indigo-100 text-indigo-800" },
    { value: "out_for_delivery", label: "Out for Delivery", color: "bg-cyan-100 text-cyan-800" },
    { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
    { value: "refunded", label: "Refunded", color: "bg-gray-100 text-gray-800" },
  ];

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  // Initialize last seen from storage
  useEffect(() => {
    try {
      lastSeenOrderIdRef.current = localStorage.getItem("admin_last_seen_order_id");
    } catch {}
  }, []);

  // Initialize preferred Indian English voice for Web Speech API if available
  useEffect(() => {
    const synth: SpeechSynthesis | undefined = (window as any).speechSynthesis;
    if (!synth) return;

    const pickVoice = () => {
      const voices = synth.getVoices() || [];
      // Prefer en-IN; fallback to any voice with "India" or "IN" hints; then en-GB, then first English voice
      const byLangEnIN = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-in"));
      const byNameIndia = voices.find(v => (v.name || "").toLowerCase().includes("india"));
      const byLangGB = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-gb"));
      const byLangEN = voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-"));
      speechVoiceRef.current = byLangEnIN || byNameIndia || byLangGB || byLangEN || null;
    };

    // Some browsers load voices asynchronously
    if (synth.getVoices && synth.getVoices().length > 0) {
      pickVoice();
    } else {
      const handler = () => {
        pickVoice();
        synth.removeEventListener("voiceschanged", handler as any);
      };
      synth.addEventListener("voiceschanged", handler as any);
      // Fallback timer in case event doesn't fire
      setTimeout(() => {
        if (!speechVoiceRef.current) pickVoice();
      }, 1500);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrders(filters);
      if (response.success) {
        setOrders(response.data.orders);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // Ensure an AudioContext exists and is resumed (needs user gesture in browsers)
  const ensureAudioContext = async () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        await audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Speak a short phrase using Web Speech API
  const speak = async (text: string) => {
    try {
      const synth: SpeechSynthesis | undefined = (window as any).speechSynthesis;
      if (!synth) return;
      const utter = new SpeechSynthesisUtterance(text);
      // Prefer Indian English voice if available
      if (speechVoiceRef.current) {
        utter.voice = speechVoiceRef.current;
        // Align utterance language with voice when possible
        if (speechVoiceRef.current.lang) utter.lang = speechVoiceRef.current.lang;
      } else {
        // Hint Indian English; browsers may map to closest available
        utter.lang = "en-IN";
      }
      utter.rate = 0.98; // slightly slower for clarity
      utter.pitch = 1.0;
      utter.volume = 1.0;
      synth.cancel();
      synth.speak(utter);
    } catch {
      // ignore
    }
  };

  // Play a "tring tring" ring using Web Audio (two short tone bursts)
  const playRingSequence = async () => {
    try {
      const ctx = await ensureAudioContext();
      if (!ctx) return;

      // Clamp base duration
      const baseMs = Math.min(Math.max(soundDurationMs, 300), 2000);
      const ringMs = Math.max(200, Math.min(400, Math.floor(baseMs * 0.5)));
      const gapMs = 150;

      const playOneRing = (startAt: number, freq = 1400) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = soundWave; // user-selectable
        osc.frequency.setValueAtTime(freq, startAt);
        osc.connect(gain);
        gain.connect(ctx.destination);

        // quick attack/decay envelope
        const attack = 0.02;
        const decay = (ringMs / 1000) - attack;
        gain.gain.setValueAtTime(0.0001, startAt);
        gain.gain.exponentialRampToValueAtTime(0.4, startAt + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, startAt + attack + Math.max(0.04, decay));

        osc.start(startAt);
        osc.stop(startAt + (ringMs / 1000) + 0.05);
      };

      const t0 = ctx.currentTime;
      playOneRing(t0, 1400); // tring
      playOneRing(t0 + (ringMs + gapMs) / 1000, 1500); // tring

      // Wait roughly until rings end
      await new Promise((resolve) => setTimeout(resolve, ringMs * 2 + gapMs + 50));
    } catch {
      // ignore
    }
  };

  // Full alert: rings then voice says "order order"
  const playOrderAlert = async () => {
    await playRingSequence();
    await speak("we have received a new order");
  };

  // Poll for newest pending order and alert when a new one appears
  useEffect(() => {
    let isCancelled = false;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const res = await adminService.getOrders({ status: "pending", page: 1, limit: 1 });
        const newest: Order | undefined = res?.data?.orders?.[0];

        if (!newest) {
          // nothing to track
          return;
        }

        // Initialize last seen on first successful poll to avoid false alert
        if (!initializedRef.current) {
          initializedRef.current = true;
          lastSeenOrderIdRef.current = newest.id;
          try { localStorage.setItem("admin_last_seen_order_id", newest.id); } catch {}
          return;
        }

        if (newest.id && newest.id !== lastSeenOrderIdRef.current) {
          lastSeenOrderIdRef.current = newest.id;
          try { localStorage.setItem("admin_last_seen_order_id", newest.id); } catch {}
          if (soundEnabled) {
            playOrderAlert();
          }
          // Optionally refresh list if currently viewing pending
          if (!isCancelled && (filters.status === "" || filters.status === "pending")) {
            fetchOrders();
          }
        }
      } catch (e) {
        // swallow errors during polling
      }
    };

    // Start immediately, then poll every 10s
    poll();
    timer = window.setInterval(poll, 10000);
    return () => {
      isCancelled = true;
      if (timer) window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundEnabled, filters.status]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem("admin_order_sound_enabled", String(next)); } catch {}
      return next;
    });
  };

  const handleTestSound = async () => {
    await playOrderAlert();
  };

  const handleWaveChange = (value: string) => {
    const casted = (value === "sine" || value === "square" || value === "sawtooth" || value === "triangle") ? value : "sine";
    setSoundWave(casted);
    try { localStorage.setItem("admin_order_sound_wave", casted); } catch {}
  };

  const handleDurationChange = (value: string) => {
    const n = parseInt(value, 10);
    const clamped = Number.isFinite(n) ? Math.min(Math.max(n, 200), 5000) : 600;
    setSoundDurationMs(clamped);
    try { localStorage.setItem("admin_order_sound_duration_ms", String(clamped)); } catch {}
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;

    try {
      const response = await adminService.updateOrderStatus(
        selectedOrder.id,
        newStatus,
        statusNotes
      );
      if (response.success) {
        toast.success("Order status updated successfully");
        setIsStatusModalOpen(false);
        setNewStatus("");
        setStatusNotes("");
        fetchOrders();
      } else {
        toast.error(response.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const openOrderModal = async (order: Order) => {
    try {
      const response = await adminService.getOrderDetails(order.id);
      if (response.success) {
        setSelectedOrder(response.data);
        setIsOrderModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to fetch order details");
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatCurrency = (amount: number | string) => {
    return `₹${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  const getStatusInfo = (status: string) => {
    return orderStatuses.find(s => s.value === status) || {
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      color: "bg-gray-100 text-gray-800"
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "preparing": return <Package className="w-4 h-4" />;
      case "ready": return <CheckCircle className="w-4 h-4" />;
      case "picked_up": return <Truck className="w-4 h-4" />;
      case "out_for_delivery": return <Truck className="w-4 h-4" />;
      case "delivered": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "refunded": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Order #, Customer name..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <select
              value={filters.order_type}
              onChange={(e) => handleFilterChange("order_type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="delivery">Delivery</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">Sound alerts for new pending orders</div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">Wave</label>
              <select
                value={soundWave}
                onChange={(e) => handleWaveChange(e.target.value)}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md"
              >
                <option value="sine">Sine</option>
                <option value="square">Square</option>
                <option value="sawtooth">Sawtooth</option>
                <option value="triangle">Triangle</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">Duration (ms)</label>
              <input
                type="number"
                min={200}
                max={5000}
                step={50}
                value={soundDurationMs}
                onChange={(e) => handleDurationChange(e.target.value)}
                className="w-24 px-2 py-1 text-xs border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleTestSound}
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Test sound
            </button>
            <button
              onClick={toggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? "bg-green-500" : "bg-gray-300"
              }`}
              title="Toggle sound alerts"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outlet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              #{order.order_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.order_type === "delivery" ? "Delivery" : "Pickup"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.outlet.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(order.total_amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{statusInfo.label}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openOrderModal(order)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openStatusModal(order)}
                              className="text-green-600 hover:text-green-900"
                              title="Update Status"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-blue-50 text-blue-600">
                  {pagination.currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Dialog
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold text-gray-900 p-6 pb-0">
              Order Details - #{selectedOrder?.order_number}
            </Dialog.Title>
            <div className="p-6">
              {selectedOrder && (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Order Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Number:</span>
                          <span className="font-medium">#{selectedOrder.order_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(selectedOrder.status).color}`}>
                            {getStatusIcon(selectedOrder.status)}
                            <span className="ml-1">{getStatusInfo(selectedOrder.status).label}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-medium">{selectedOrder.order_type === "delivery" ? "Delivery" : "Pickup"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment:</span>
                          <span className="font-medium">{selectedOrder.payment_method || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Date:</span>
                          <span className="font-medium">{formatDate(selectedOrder.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Customer Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium">{selectedOrder.user.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedOrder.user.email}</span>
                        </div>
                        {selectedOrder.user.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{selectedOrder.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Outlet & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Outlet Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="font-medium">{selectedOrder.outlet.name}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedOrder.outlet.address}</span>
                        </div>
                        {selectedOrder.outlet.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{selectedOrder.outlet.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Delivery Address</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{selectedOrder.address.street_address}</span>
                        </div>
                        <div className="text-gray-600">
                          {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.pincode}
                        </div>
                        {selectedOrder.address.landmark && (
                          <div className="text-gray-600">
                            Landmark: {selectedOrder.address.landmark}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.menuItem.name}</div>
                            {item.menuItem.parentBrand && (
                              <div className="text-sm text-gray-600">{item.menuItem.parentBrand.name}</div>
                            )}
                            {item.special_instructions && (
                              <div className="text-sm text-gray-500 mt-1">
                                Note: {item.special_instructions}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                            <div className="font-medium">{formatCurrency(item.total_price)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Fee:</span>
                        <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax:</span>
                        <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                      </div>
                      {selectedOrder.discount_amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount:</span>
                          <span className="text-green-600">-{formatCurrency(selectedOrder.discount_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {selectedOrder.special_instructions && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Special Instructions</h3>
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-gray-700">{selectedOrder.special_instructions}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-6 pt-0">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Status Update Modal */}
      <Dialog
        open={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900 p-6 pb-0">
              Update Order Status
            </Dialog.Title>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add any notes about this status change..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Update Status
                </button>
    </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
  </div>
);
};

export default AdminOrders;
