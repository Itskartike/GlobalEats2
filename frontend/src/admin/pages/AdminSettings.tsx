import React, { useEffect, useState } from "react";
import { Settings, Save, DollarSign, Truck, Bell, Shield } from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

const AdminSettings: React.FC = () => {
  const [platformData, setPlatformData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getPlatformAnalytics();
        setPlatformData(res?.data);
      } catch { /* ignore */ }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure global platform parameters and policies</p>
      </div>

      {/* Platform Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-blue-500" /> Platform Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-600">{platformData?.totalVendors || 0}</p>
            <p className="text-xs text-blue-700">Total Vendors</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{platformData?.approvedVendors || 0}</p>
            <p className="text-xs text-green-700">Approved</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">{platformData?.pendingVendors || 0}</p>
            <p className="text-xs text-amber-700">Pending</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-emerald-600">
              ₹{(platformData?.totalGMV || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-xs text-emerald-700">Total GMV</p>
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <SettingsCard
        icon={DollarSign}
        iconColor="text-emerald-500"
        title="Commission Settings"
        description="Configure platform commission rates applied to vendor orders"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission Rate (%)</label>
            <div className="flex items-center gap-3">
              <input type="number" defaultValue="15" min="0" max="100" step="0.5"
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-sm text-gray-500">Applied to new vendor registrations</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Commission Rate (%)</label>
            <div className="flex items-center gap-3">
              <input type="number" defaultValue="5" min="0" max="100" step="0.5"
                className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-sm text-gray-500">Lowest allowed vendor-specific rate</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Commission earned so far: ₹{(platformData?.commissionEarned || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
        </div>
      </SettingsCard>

      {/* Delivery Settings */}
      <SettingsCard
        icon={Truck}
        iconColor="text-blue-500"
        title="Delivery & Fees"
        description="Configure platform-wide delivery and service fee policies"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Delivery Fee (₹)</label>
            <input type="number" defaultValue="40" min="0" step="5"
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (₹)</label>
            <input type="number" defaultValue="500" min="0" step="50"
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Tax (%)</label>
            <input type="number" defaultValue="5" min="0" step="0.5"
              className="w-32 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </SettingsCard>

      {/* Notification Settings */}
      <SettingsCard
        icon={Bell}
        iconColor="text-amber-500"
        title="Notifications & Alerts"
        description="Configure when the admin panel shows alerts"
      >
        <div className="space-y-3">
          <ToggleSetting label="Alert on new vendor registration" defaultChecked={true} />
          <ToggleSetting label="Alert when order is stuck >15 minutes" defaultChecked={true} />
          <ToggleSetting label="Alert on high cancellation rate (>3/day)" defaultChecked={true} />
          <ToggleSetting label="Daily summary email" defaultChecked={false} />
        </div>
      </SettingsCard>

      <div className="flex justify-end">
        <button onClick={() => toast.success("Settings saved")}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>
    </div>
  );
};

const SettingsCard: React.FC<{
  icon: React.ElementType; iconColor: string; title: string; description: string; children: React.ReactNode;
}> = ({ icon: Icon, iconColor, title, description, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start gap-3 mb-4">
      <div className="p-2 bg-gray-50 rounded-lg">
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

const ToggleSetting: React.FC<{ label: string; defaultChecked: boolean }> = ({ label, defaultChecked }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
      <button onClick={() => setChecked(!checked)} className="relative">
        <div className={`w-10 h-5 rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-gray-200"}`}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
      </button>
    </label>
  );
};

export default AdminSettings;
