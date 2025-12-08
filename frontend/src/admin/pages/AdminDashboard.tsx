import React, { useEffect, useState } from "react";
import {
  Users,
  ShoppingCart,
  Building2,
  Tag,
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalBrands: number;
  totalOutlets: number;
  todayOrders: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  status: string;
  total_amount: number | string;
  createdAt?: string; // camelCase variant
  created_at?: string; // snake_case variant
  user: {
    name: string;
    email: string;
  };
}

interface OrderAnalytics {
  period: string;
  statusCounts: Array<{
    status: string;
    count: string;
  }>;
  totalRevenue: number;
  averageOrderValue: number;
  outletStats: Array<{
    outlet_id: string;
    order_count: string;
    revenue: string;
    outlet: {
      id: string;
      name: string;
    };
  }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [dashboardData, analyticsData] = await Promise.all([
          adminService.getDashboardData(),
          adminService.getOrderAnalytics(analyticsPeriod)
        ]);
        
        const dash: any = (dashboardData as any)?.data ?? dashboardData;
        const analytics: any = (analyticsData as any)?.data ?? analyticsData;

        setStats(dash?.stats ?? null);
        setRecentOrders(Array.isArray(dash?.recentOrders) ? dash.recentOrders : (Array.isArray(dash?.orders) ? dash.orders : []));
        setOrderAnalytics(analytics ?? null);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load dashboard"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [analyticsPeriod]);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === "number" ? amount : parseFloat(amount);
    if (!Number.isFinite(num)) return "₹0.00";
    return `₹${num.toFixed(2)}`;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow h-32"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the GlobalEats admin dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalUsers || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalOrders || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Outlets
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalOutlets || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Brands</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalBrands || 0}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Tag className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Order Analytics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Order Analytics</h2>
          <div className="flex space-x-2">
            {(["today", "week", "month"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setAnalyticsPeriod(period)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  analyticsPeriod === period
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Revenue Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
              <div className="p-2 bg-green-100 rounded-full">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ₹{orderAnalytics?.totalRevenue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-gray-600 text-sm mt-1">Total revenue ({analyticsPeriod})</p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Avg Order Value</h3>
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-600">
              ₹{orderAnalytics?.averageOrderValue?.toFixed(2) || "0.00"}
            </div>
            <p className="text-gray-600 text-sm mt-1">Average per order</p>
          </div>

          {/* Today's Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {analyticsPeriod === "today" ? "Today's Orders" : `${analyticsPeriod.charAt(0).toUpperCase() + analyticsPeriod.slice(1)}'s Orders`}
              </h3>
              <div className="p-2 bg-indigo-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-indigo-600">
              {orderAnalytics?.statusCounts?.reduce((total, status) => total + parseInt(status.count), 0) || 0}
            </div>
            <p className="text-gray-600 text-sm mt-1">Total orders</p>
          </div>

          {/* Active Orders */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Orders</h3>
              <div className="p-2 bg-orange-100 rounded-full">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-600">
              {orderAnalytics?.statusCounts?.filter(s => 
                ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(s.status)
              ).reduce((total, status) => total + parseInt(status.count), 0) || 0}
            </div>
            <p className="text-gray-600 text-sm mt-1">In progress</p>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
            <div className="space-y-3">
              {orderAnalytics?.statusCounts?.map((status) => {
                const total = orderAnalytics.statusCounts.reduce((sum, s) => sum + parseInt(s.count), 0);
                const percentage = total > 0 ? (parseInt(status.count) / total) * 100 : 0;
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "delivered": return "bg-green-500";
                    case "pending": return "bg-yellow-500";
                    case "cancelled": return "bg-red-500";
                    case "preparing": return "bg-blue-500";
                    case "ready": return "bg-purple-500";
                    default: return "bg-gray-500";
                  }
                };
                
                return (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {status.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{status.count}</span>
                      <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                );
              }) || (
                <p className="text-gray-500 text-center py-4">No order data available</p>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Outlets</h3>
            <div className="space-y-3">
              {orderAnalytics?.outletStats?.slice(0, 5).map((outlet) => (
                <div key={outlet.outlet_id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{outlet.outlet.name}</p>
                    <p className="text-xs text-gray-500">{outlet.order_count} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">₹{parseFloat(outlet.revenue).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">revenue</p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No outlet data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No recent orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_number}
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate((order.createdAt || order.created_at || ""))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
