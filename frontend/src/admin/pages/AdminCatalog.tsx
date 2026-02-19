import React, { useEffect, useState } from "react";
import { Search, Tag, Building2, UtensilsCrossed, ToggleLeft, ToggleRight, User, Filter } from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

type Tab = "brands" | "outlets" | "menu";

const AdminCatalog: React.FC = () => {
  const [tab, setTab] = useState<Tab>("brands");
  const [search, setSearch] = useState("");
  const [brands, setBrands] = useState<any[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (tab === "brands") {
        const res = await adminService.getCatalogBrands({
          search: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        });
        setBrands(res?.data || []);
      } else if (tab === "outlets") {
        const res = await adminService.getCatalogOutlets({
          search: search || undefined,
        });
        setOutlets(res?.data || []);
      } else {
        const res = await adminService.getCatalogMenuItems({
          search: search || undefined,
        });
        setMenuItems(res?.data || []);
      }
    } catch (error) {
      toast.error("Failed to load catalog data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab, statusFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchData(); };

  const handleToggleBrand = async (brandId: string) => {
    try {
      await adminService.toggleCatalogBrand(brandId);
      toast.success("Brand status toggled");
      fetchData();
    } catch { toast.error("Failed to toggle brand"); }
  };

  const handleToggleOutlet = async (outletId: string) => {
    try {
      await adminService.toggleCatalogOutlet(outletId);
      toast.success("Outlet status toggled");
      fetchData();
    } catch { toast.error("Failed to toggle outlet"); }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { key: "brands", label: "Brands", icon: Tag, count: brands.length },
    { key: "outlets", label: "Outlets", icon: Building2, count: outlets.length },
    { key: "menu", label: "Menu Items", icon: UtensilsCrossed, count: menuItems.length },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Catalog</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View all brands, outlets, and menu items across every vendor. Use toggles to activate/deactivate.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab}...`}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </form>
        {tab === "brands" && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-white border border-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tab === "brands" ? (
        <BrandsTable brands={brands} onToggle={handleToggleBrand} />
      ) : tab === "outlets" ? (
        <OutletsTable outlets={outlets} onToggle={handleToggleOutlet} />
      ) : (
        <MenuItemsTable items={menuItems} />
      )}
    </div>
  );
};

const BrandsTable: React.FC<{ brands: any[]; onToggle: (id: string) => void }> = ({ brands, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="text-xs text-gray-500 uppercase bg-gray-50">
          <th className="px-5 py-3 text-left">Brand</th>
          <th className="px-5 py-3 text-left">Vendor</th>
          <th className="px-5 py-3 text-left">Cuisine</th>
          <th className="px-5 py-3 text-left">Categories</th>
          <th className="px-5 py-3 text-center">Status</th>
          <th className="px-5 py-3 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {brands.length === 0 ? (
          <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No brands found</td></tr>
        ) : brands.map(brand => (
          <tr key={brand.id} className="hover:bg-gray-50 text-sm">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Tag className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{brand.name}</p>
                  <p className="text-xs text-gray-400">{brand.slug}</p>
                </div>
              </div>
            </td>
            <td className="px-5 py-3">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-700">{brand.owner?.name || "Unassigned"}</span>
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">{brand.cuisine_type || "—"}</td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-1">
                {brand.categories?.slice(0, 3).map((cat: any) => (
                  <span key={cat.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{cat.name}</span>
                ))}
              </div>
            </td>
            <td className="px-5 py-3 text-center">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                brand.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>{brand.is_active ? "Active" : "Inactive"}</span>
            </td>
            <td className="px-5 py-3 text-center">
              <button onClick={() => onToggle(brand.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                title={brand.is_active ? "Deactivate" : "Activate"}>
                {brand.is_active
                  ? <ToggleRight className="h-5 w-5 text-green-600" />
                  : <ToggleLeft className="h-5 w-5 text-gray-400" />}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const OutletsTable: React.FC<{ outlets: any[]; onToggle: (id: string) => void }> = ({ outlets, onToggle }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="text-xs text-gray-500 uppercase bg-gray-50">
          <th className="px-5 py-3 text-left">Outlet</th>
          <th className="px-5 py-3 text-left">Vendor</th>
          <th className="px-5 py-3 text-left">Location</th>
          <th className="px-5 py-3 text-left">Brands</th>
          <th className="px-5 py-3 text-center">Status</th>
          <th className="px-5 py-3 text-center">Action</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {outlets.length === 0 ? (
          <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No outlets found</td></tr>
        ) : outlets.map(outlet => (
          <tr key={outlet.id} className="hover:bg-gray-50 text-sm">
            <td className="px-5 py-3">
              <p className="font-medium text-gray-900">{outlet.name}</p>
              <p className="text-xs text-gray-400">{outlet.phone || ""}</p>
            </td>
            <td className="px-5 py-3">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-700">{outlet.owner?.name || "Unassigned"}</span>
              </div>
            </td>
            <td className="px-5 py-3">
              <p className="text-gray-700">{outlet.city || "—"}{outlet.state ? `, ${outlet.state}` : ""}</p>
              <p className="text-xs text-gray-400 truncate max-w-48">{outlet.address || ""}</p>
            </td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-1">
                {outlet.Brands?.slice(0, 3).map((b: any) => (
                  <span key={b.id} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">{b.name}</span>
                ))}
              </div>
            </td>
            <td className="px-5 py-3 text-center">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                outlet.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>{outlet.is_active ? "Active" : "Inactive"}</span>
            </td>
            <td className="px-5 py-3 text-center">
              <button onClick={() => onToggle(outlet.id)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                {outlet.is_active
                  ? <ToggleRight className="h-5 w-5 text-green-600" />
                  : <ToggleLeft className="h-5 w-5 text-gray-400" />}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MenuItemsTable: React.FC<{ items: any[] }> = ({ items }) => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="text-xs text-gray-500 uppercase bg-gray-50">
          <th className="px-5 py-3 text-left">Item</th>
          <th className="px-5 py-3 text-left">Brand</th>
          <th className="px-5 py-3 text-left">Vendor</th>
          <th className="px-5 py-3 text-left">Category</th>
          <th className="px-5 py-3 text-right">Price</th>
          <th className="px-5 py-3 text-center">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">No menu items found</td></tr>
        ) : items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50 text-sm">
            <td className="px-5 py-3">
              <div className="flex items-center gap-3">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <UtensilsCrossed className="h-4 w-4 text-orange-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <div className="flex gap-1 mt-0.5">
                    {item.is_vegetarian && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0 rounded">Veg</span>}
                    {item.is_vegan && <span className="text-xs bg-lime-100 text-lime-700 px-1.5 py-0 rounded">Vegan</span>}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-5 py-3 text-gray-700">{item.parentBrand?.name || "—"}</td>
            <td className="px-5 py-3">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-gray-700">{item.parentBrand?.owner?.name || "—"}</span>
              </div>
            </td>
            <td className="px-5 py-3 text-gray-600">{item.categoryInfo?.name || "—"}</td>
            <td className="px-5 py-3 text-right font-medium text-gray-900">₹{parseFloat(item.base_price || 0).toFixed(0)}</td>
            <td className="px-5 py-3 text-center">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>{item.is_available ? "Available" : "Unavailable"}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminCatalog;
