import React, { useEffect, useState } from "react";
import vendorService from "../services/vendorService";
import { ShoppingCart } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any;

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready_for_pickup: "bg-teal-100 text-teal-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const VendorOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pagination, setPagination] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getOrders({ status: filterStatus || undefined, page, limit: 15 });
      if (res.success) {
        setOrders(res.data.orders);
        setPagination(res.data.pagination);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus, page]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await vendorService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: Order) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  const getNextStatus = (current: string): string | null => {
    const transitions: Record<string, string> = {
      pending: "confirmed",
      confirmed: "preparing",
      preparing: "ready_for_pickup",
    };
    return transitions[current] || null;
  };

  if (loading && orders.length === 0) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {["", "pending", "confirmed", "preparing", "ready_for_pickup", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterStatus === s ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Order List */}
        <div className="flex-1">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: Order) => {
                const nextStatus = getNextStatus(order.status);
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-colors ${
                      selectedOrder?.id === order.id ? "border-emerald-500 ring-1 ring-emerald-200" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">#{order.order_number || order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">{order.user?.name}</p>
                        <p className="text-xs text-gray-400">{order.outlet?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-800">₹{order.total_amount}</p>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColor[order.status] || "bg-gray-100"}`}>
                          {order.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleString()}</span>
                      {nextStatus && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, nextStatus); }}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                        >
                          Mark as {nextStatus.replace(/_/g, " ")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-600">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Detail */}
        {selectedOrder && (
          <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8 self-start">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Order Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order #</span>
                <span className="font-mono">{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span>{selectedOrder.user?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span>{selectedOrder.user?.phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Outlet</span>
                <span>{selectedOrder.outlet?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${statusColor[selectedOrder.status] || "bg-gray-100"}`}>
                  {selectedOrder.status?.replace(/_/g, " ")}
                </span>
              </div>
              <hr />
              <div>
                <p className="font-medium text-gray-700 mb-2">Items</p>
                {selectedOrder.orderItems?.map((item: Order) => (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>{item.quantity}x {item.menuItem?.name || "Item"}</span>
                    <span>₹{item.total_price || item.unit_price * item.quantity}</span>
                  </div>
                )) || <p className="text-gray-400">No items</p>}
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>₹{selectedOrder.total_amount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorOrders;
