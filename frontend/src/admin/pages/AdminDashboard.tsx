import React, { useEffect, useState } from "react";
import {
  Users, ShoppingCart, Building2, Tag, TrendingUp, DollarSign,
  AlertTriangle, Activity, ArrowUpRight, ArrowDownRight, Store,
  Clock, ChefHat, Truck, CheckCircle, Package,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await adminService.getDashboardData();
        setData((res as any)?.data ?? res);
      } catch (error) {
        toast.error("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fmt = (n: number | null | undefined) =>
    `₹${(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (isLoading || !data) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const { stats, vendorHealth, revenue, liveOps, growth, alerts, recentOrders } = data;
  const totalLive = (liveOps?.pendingOrders || 0) + (liveOps?.confirmedOrders || 0) +
    (liveOps?.preparingOrders || 0) + (liveOps?.readyOrders || 0) + (liveOps?.outForDeliveryOrders || 0);

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Command Center</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time overview of GlobalEats operations</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Live — auto-refreshes every 30s
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert: any, i: number) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${
              alert.type === "danger"
                ? "bg-red-50 text-red-800 border border-red-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Revenue Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total GMV" value={fmt(revenue?.totalGMV)}
          sub="All delivered orders" color="emerald" />
        <StatCard icon={TrendingUp} label="Platform Commission" value={fmt(revenue?.totalCommission)}
          sub={`@ ${revenue?.avgCommissionRate?.toFixed(1) || 15}% avg rate`} color="blue" />
        <StatCard icon={DollarSign} label="Today's Revenue" value={fmt(revenue?.todayGMV)}
          sub={`Commission: ${fmt(revenue?.todayCommission)}`} color="violet" />
        <StatCard icon={ShoppingCart} label="Today's Orders" value={String(stats?.todayOrders || 0)}
          sub={`${stats?.totalOrders || 0} total lifetime`} color="amber" />
      </div>

      {/* Live Ops + Vendor Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Live Order Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900">Live Order Pipeline</h2>
            <span className="ml-auto text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{totalLive} active</span>
          </div>
          <div className="space-y-3">
            {[
              { label: "Pending", count: liveOps?.pendingOrders, icon: Clock, color: "amber" },
              { label: "Confirmed", count: liveOps?.confirmedOrders, icon: CheckCircle, color: "blue" },
              { label: "Preparing", count: liveOps?.preparingOrders, icon: ChefHat, color: "purple" },
              { label: "Ready", count: liveOps?.readyOrders, icon: Package, color: "emerald" },
              { label: "Out for Delivery", count: liveOps?.outForDeliveryOrders, icon: Truck, color: "indigo" },
            ].map(stage => (
              <div key={stage.label} className="flex items-center gap-3">
                <stage.icon className={`h-4 w-4 text-${stage.color}-500`} />
                <span className="text-sm text-gray-700 flex-1">{stage.label}</span>
                <span className="font-semibold text-gray-900">{stage.count || 0}</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${stage.color}-500 rounded-full transition-all`}
                    style={{ width: `${totalLive > 0 ? ((stage.count || 0) / totalLive * 100) : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Store className="h-5 w-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Vendor Health</h2>
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{vendorHealth?.totalVendors || 0} total</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{vendorHealth?.approvedVendors || 0}</p>
              <p className="text-xs text-green-700 mt-1">Approved</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{vendorHealth?.pendingVendors || 0}</p>
              <p className="text-xs text-amber-700 mt-1">Pending</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{vendorHealth?.suspendedVendors || 0}</p>
              <p className="text-xs text-red-700 mt-1">Suspended</p>
            </div>
          </div>
          {/* Growth stats */}
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">
                <strong className="text-gray-900">{growth?.newVendorsWeek || 0}</strong> new this week
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">
                <strong className="text-gray-900">{growth?.newVendorsMonth || 0}</strong> new this month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Stats + Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Customers" value={String(stats?.totalUsers || 0)}
          sub={`+${growth?.newCustomersWeek || 0} this week`} color="blue" />
        <StatCard icon={Tag} label="Total Brands" value={String(stats?.totalBrands || 0)}
          sub="Across all vendors" color="orange" />
        <StatCard icon={Building2} label="Active Outlets" value={String(stats?.totalOutlets || 0)}
          sub="Across all vendors" color="purple" />
        <StatCard icon={ShoppingCart} label="Orders this Month" value={String(growth?.ordersMonth || 0)}
          sub={`${growth?.ordersWeek || 0} this week`} color="teal" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3 text-left">Order</th>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-left">Outlet / Vendor</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!recentOrders || recentOrders.length === 0) ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
              ) : recentOrders.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-5 py-3 font-medium text-gray-900">#{order.order_number}</td>
                  <td className="px-5 py-3">
                    <div className="text-gray-900">{order.user?.name || "—"}</div>
                    <div className="text-xs text-gray-400">{order.user?.email || ""}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-gray-900">{order.outlet?.name || "—"}</div>
                    <div className="text-xs text-gray-400">{order.outlet?.owner?.name || ""}</div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">
                    {fmt(parseFloat(order.total_amount))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const colorMap: Record<string, { bg: string; text: string; iconBg: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", iconBg: "bg-emerald-100" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    iconBg: "bg-blue-100" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-700",  iconBg: "bg-violet-100" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   iconBg: "bg-amber-100" },
  orange:  { bg: "bg-orange-50",  text: "text-orange-700",  iconBg: "bg-orange-100" },
  purple:  { bg: "bg-purple-50",  text: "text-purple-700",  iconBg: "bg-purple-100" },
  teal:    { bg: "bg-teal-50",    text: "text-teal-700",    iconBg: "bg-teal-100" },
};

const StatCard: React.FC<{
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}> = ({ icon: Icon, label, value, sub, color }) => {
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <div className={`p-2 rounded-lg ${c.iconBg}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    preparing: "bg-purple-100 text-purple-700",
    ready: "bg-emerald-100 text-emerald-700",
    out_for_delivery: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
    </span>
  );
};

export default AdminDashboard;
