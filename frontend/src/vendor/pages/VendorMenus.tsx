import React, { useEffect, useState } from "react";
import vendorService from "../services/vendorService";
import { Plus, Edit2, Trash2, X, ChefHat } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MenuItem = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Brand = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Category = any;

const VendorMenus: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterBrand, setFilterBrand] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    brand_id: "", category_id: "", name: "", description: "", image_url: "",
    base_price: "", is_vegetarian: false, is_vegan: false, is_gluten_free: false,
    spice_level: "0", calories: "", preparation_time: "15", is_available: true, sort_order: "0",
  });

  const fetchData = async () => {
    try {
      const [itemsRes, brandsRes, catsRes] = await Promise.all([
        vendorService.getMenuItems(filterBrand ? { brand_id: filterBrand } : undefined),
        vendorService.getBrands(),
        vendorService.getCategories(),
      ]);
      if (itemsRes.success) setItems(itemsRes.data);
      if (brandsRes.success) setBrands(brandsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filterBrand]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ brand_id: brands[0]?.id || "", category_id: "", name: "", description: "", image_url: "", base_price: "", is_vegetarian: false, is_vegan: false, is_gluten_free: false, spice_level: "0", calories: "", preparation_time: "15", is_available: true, sort_order: "0" });
    setShowModal(true); setError("");
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      brand_id: item.brand_id || "", category_id: item.category_id || "",
      name: item.name, description: item.description || "", image_url: item.image_url || "",
      base_price: String(item.base_price), is_vegetarian: item.is_vegetarian || false,
      is_vegan: item.is_vegan || false, is_gluten_free: item.is_gluten_free || false,
      spice_level: String(item.spice_level || 0), calories: String(item.calories || ""),
      preparation_time: String(item.preparation_time || 15), is_available: item.is_available !== false,
      sort_order: String(item.sort_order || 0),
    });
    setShowModal(true); setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      const data = { ...form, base_price: parseFloat(form.base_price), spice_level: parseInt(form.spice_level), calories: form.calories ? parseInt(form.calories) : null, preparation_time: parseInt(form.preparation_time), sort_order: parseInt(form.sort_order) };
      if (editingItem) { await vendorService.updateMenuItem(editingItem.id, data); }
      else { await vendorService.createMenuItem(data); }
      setShowModal(false); fetchData();
    } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    try { await vendorService.deleteMenuItem(id); fetchData(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Items</h1>
        <button onClick={openCreate} disabled={brands.length === 0} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          <Plus size={18} className="mr-2" /> Add Item
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select className="px-3 py-2 border rounded-lg" value={filterBrand} onChange={e => setFilterBrand(e.target.value)}>
          <option value="">All Brands</option>
          {brands.map((b: Brand) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <ChefHat size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">{brands.length === 0 ? "Create a brand first." : "No menu items yet."}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item: MenuItem) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {item.image_url && <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover mr-3" />}
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.parentBrand?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.categoryInfo?.name || "-"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">₹{item.base_price}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {item.is_vegetarian && <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded">VEG</span>}
                      {item.is_vegan && <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded">VEGAN</span>}
                      {item.is_gluten_free && <span className="bg-amber-100 text-amber-700 text-xs px-1.5 py-0.5 rounded">GF</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.is_available ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingItem ? "Edit Item" : "New Item"}</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select className="w-full px-3 py-2 border rounded-lg" value={form.brand_id} onChange={e => setForm(f => ({...f, brand_id: e.target.value}))} required>
                  <option value="">Select Brand *</option>
                  {brands.map((b: Brand) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                <select className="w-full px-3 py-2 border rounded-lg" value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))} required>
                  <option value="">Select Category *</option>
                  {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Item Name *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              <textarea className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Description" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Image URL" value={form.image_url} onChange={e => setForm(f => ({...f, image_url: e.target.value}))} />
              <div className="grid grid-cols-3 gap-3">
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Price ₹ *" type="number" step="0.01" value={form.base_price} onChange={e => setForm(f => ({...f, base_price: e.target.value}))} required />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Prep time (min)" type="number" value={form.preparation_time} onChange={e => setForm(f => ({...f, preparation_time: e.target.value}))} />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Calories" type="number" value={form.calories} onChange={e => setForm(f => ({...f, calories: e.target.value}))} />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.is_vegetarian} onChange={e => setForm(f => ({...f, is_vegetarian: e.target.checked}))} /> Vegetarian</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.is_vegan} onChange={e => setForm(f => ({...f, is_vegan: e.target.checked}))} /> Vegan</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.is_gluten_free} onChange={e => setForm(f => ({...f, is_gluten_free: e.target.checked}))} /> Gluten Free</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({...f, is_available: e.target.checked}))} /> Available</label>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{editingItem ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMenus;
