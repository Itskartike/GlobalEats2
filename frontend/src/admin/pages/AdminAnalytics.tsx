import React, { useEffect, useState } from "react";
import { DollarSign, TrendingUp, BarChart3, Trophy, Clock, ShoppingCart, Users, Star } from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

const AdminAnalytics: React.FC = () => {
  const [revPeriod, setRevPeriod] = useState("month");
  const [ordPeriod, setOrdPeriod] = useState("week");
  const [revenue, setRevenue] = useState<any>(null);
  const [orders, setOrders] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [rev, ord, top] = await Promise.all([
          adminService.getRevenueAnalytics(revPeriod),
          adminService.getOrderTrends(ordPeriod),
          adminService.getTopPerformers(),
        ]);
        setRevenue(rev?.data);
        setOrders(ord?.data);
        setTopPerformers(top?.data);
      } catch { toast.error("Failed to load analytics"); }
      finally { setIsLoading(false); }
    };
    load();
  }, [revPeriod, ordPeriod]);

  const fmt = (n: number) => `₹${(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const periods = ["today", "week", "month", "year"];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Revenue breakdown, order trends, and top performers</p>
      </div>

      {/* Revenue Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" /> Revenue Breakdown
          </h2>
          <PeriodToggle value={revPeriod} onChange={setRevPeriod} options={periods} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{fmt(revenue?.totalRevenue || 0)}</p>
            <p className="text-xs text-gray-400 mt-1">Platform commission: {fmt(revenue?.totalCommission || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-3">Revenue by City</p>
            <div className="space-y-2">
              {(revenue?.cityRevenue || []).slice(0, 5).map((city: any) => (
                <div key={city.city} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{city.city || "Unknown"}</span>
                  <span className="font-medium text-gray-900">{fmt(parseFloat(city.revenue))}</span>
                </div>
              ))}
              {(!revenue?.cityRevenue || revenue.cityRevenue.length === 0) && (
                <p className="text-gray-400 text-sm">No city data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Vendor Revenue Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Revenue by Vendor</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-5 py-3 text-left">Vendor</th>
                <th className="px-5 py-3 text-right">Orders</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">Commission Rate</th>
                <th className="px-5 py-3 text-right">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(revenue?.vendorRevenue || []).map((v: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50 text-sm">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{v.business_name || v.vendor_name}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">{v.order_count}</td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">{fmt(parseFloat(v.revenue))}</td>
                  <td className="px-5 py-3 text-right text-gray-600">{parseFloat(v.commission_rate).toFixed(1)}%</td>
                  <td className="px-5 py-3 text-right font-medium text-emerald-600">{fmt(parseFloat(v.commission))}</td>
                </tr>
              ))}
              {(!revenue?.vendorRevenue || revenue.vendorRevenue.length === 0) && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No revenue data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Order Trends Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" /> Order Trends
          </h2>
          <PeriodToggle value={ordPeriod} onChange={setOrdPeriod} options={periods} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{orders?.totalOrders || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Avg order value: {fmt(orders?.avgOrderValue || 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-3">Status Breakdown</p>
            <div className="space-y-2">
              {(orders?.statusBreakdown || []).map((s: any) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{s.status.replace(/_/g, " ")}</span>
                  <span className="font-medium text-gray-900">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Peak Hours
            </p>
            <div className="space-y-2">
              {(orders?.peakHours || []).map((h: any) => (
                <div key={h.hour} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{String(h.hour).padStart(2, "0")}:00</span>
                  <span className="font-medium text-gray-900">{h.orders} orders</span>
                </div>
              ))}
              {(!orders?.peakHours || orders.peakHours.length === 0) && (
                <p className="text-gray-400 text-sm">No data</p>
              )}
            </div>
          </div>
        </div>

        {/* Daily Volume */}
        {orders?.dailyVolume && orders.dailyVolume.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Daily Volume</h3>
            <div className="overflow-x-auto">
              <div className="flex items-end gap-1 min-w-fit" style={{ height: 120 }}>
                {orders.dailyVolume.map((d: any) => {
                  const maxOrders = Math.max(...orders.dailyVolume.map((x: any) => parseInt(x.orders)));
                  const height = maxOrders > 0 ? (parseInt(d.orders) / maxOrders) * 100 : 0;
                  return (
                    <div key={d.date} className="flex flex-col items-center gap-1 min-w-[40px]" title={`${d.date}: ${d.orders} orders`}>
                      <span className="text-xs text-gray-500">{d.orders}</span>
                      <div className="w-8 bg-blue-500 rounded-t-sm transition-all" style={{ height: `${height}%`, minHeight: 2 }} />
                      <span className="text-[10px] text-gray-400">{new Date(d.date).toLocaleDateString("en", { day: "2-digit", month: "short" })}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Top Performers */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" /> Top Performers
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Vendors */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-transparent">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-500" /> Top Vendors
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {(topPerformers?.topVendors || []).slice(0, 5).map((v: any, i: number) => (
                <div key={v.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{v.business_name || v.name}</p>
                    <p className="text-xs text-gray-400">{v.order_count} orders</p>
                  </div>
                  <span className="font-medium text-emerald-600">{fmt(parseFloat(v.revenue))}</span>
                </div>
              ))}
              {(!topPerformers?.topVendors || topPerformers.topVendors.length === 0) && (
                <p className="px-5 py-6 text-center text-gray-400 text-sm">No data</p>
              )}
            </div>
          </div>

          {/* Top Brands */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Star className="h-4 w-4 text-blue-500" /> Top Brands
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {(topPerformers?.topBrands || []).slice(0, 5).map((b: any, i: number) => (
                <div key={b.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.cuisine_type} · {b.order_count} orders</p>
                  </div>
                  <span className="font-medium text-emerald-600">{fmt(parseFloat(b.revenue))}</span>
                </div>
              ))}
              {(!topPerformers?.topBrands || topPerformers.topBrands.length === 0) && (
                <p className="px-5 py-6 text-center text-gray-400 text-sm">No data</p>
              )}
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-transparent">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" /> Best Sellers
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {(topPerformers?.topItems || []).slice(0, 5).map((item: any, i: number) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.brand_name} · {item.total_sold} sold</p>
                  </div>
                  <span className="font-medium text-emerald-600">{fmt(parseFloat(item.revenue))}</span>
                </div>
              ))}
              {(!topPerformers?.topItems || topPerformers.topItems.length === 0) && (
                <p className="px-5 py-6 text-center text-gray-400 text-sm">No data</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const PeriodToggle: React.FC<{
  value: string; onChange: (v: string) => void; options: string[];
}> = ({ value, onChange, options }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
    {options.map(p => (
      <button key={p} onClick={() => onChange(p)}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          value === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
        }`}>
        {p.charAt(0).toUpperCase() + p.slice(1)}
      </button>
    ))}
  </div>
);

export default AdminAnalytics;
