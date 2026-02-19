import React, { useEffect, useState } from "react";
import vendorService from "../services/vendorService";
import { Plus, Edit2, Trash2, X, Tag } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Brand = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Category = any;

const VendorBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", cuisine_type: "", delivery_time: "30",
    minimum_order_amount: "0", delivery_fee: "0", logo_url: "", banner_url: "",
    is_active: true, categories: [] as string[],
  });

  const fetchData = async () => {
    try {
      const [brandsRes, catsRes] = await Promise.all([
        vendorService.getBrands(),
        vendorService.getCategories(),
      ]);
      if (brandsRes.success) setBrands(brandsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingBrand(null);
    setForm({ name: "", description: "", cuisine_type: "", delivery_time: "30", minimum_order_amount: "0", delivery_fee: "0", logo_url: "", banner_url: "", is_active: true, categories: [] });
    setShowModal(true); setError("");
  };

  const openEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name, description: brand.description || "", cuisine_type: brand.cuisine_type || "",
      delivery_time: String(brand.estimated_delivery_time || 30),
      minimum_order_amount: String(brand.minimum_order_amount || 0),
      delivery_fee: String(brand.delivery_fee || 0),
      logo_url: brand.logo_url || "", banner_url: brand.banner_url || "",
      is_active: brand.is_active !== false,
      categories: brand.categories?.map((c: Category) => c.id) || [],
    });
    setShowModal(true); setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      if (editingBrand) {
        await vendorService.updateBrand(editingBrand.id, form);
      } else {
        await vendorService.createBrand(form);
      }
      setShowModal(false); fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    try { await vendorService.deleteBrand(id); fetchData(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Delete failed"); }
  };

  const toggleCategory = (catId: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId],
    }));
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Brands</h1>
        <button onClick={openCreate} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus size={18} className="mr-2" /> Add Brand
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Tag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No brands yet. Create your first brand!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand: Brand) => (
            <div key={brand.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {brand.banner_url && <img src={brand.banner_url} alt="" className="w-full h-32 object-cover" />}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{brand.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${brand.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {brand.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{brand.cuisine_type}</p>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3">{brand.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>⏱ {brand.estimated_delivery_time}min</span>
                  <span>•</span>
                  <span>Min ₹{brand.minimum_order_amount}</span>
                </div>
                {brand.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {brand.categories.map((c: Category) => (
                      <span key={c.id} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{c.name}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(brand)} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                    <Edit2 size={14} className="mr-1" /> Edit
                  </button>
                  <button onClick={() => handleDelete(brand.id)} className="flex items-center text-sm text-red-600 hover:text-red-800">
                    <Trash2 size={14} className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingBrand ? "Edit Brand" : "New Brand"}</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Brand Name *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Cuisine Type *" value={form.cuisine_type} onChange={e => setForm(f => ({...f, cuisine_type: e.target.value}))} required />
              <textarea className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Description *" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} required />
              <div className="grid grid-cols-3 gap-3">
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Delivery time (min)" type="number" value={form.delivery_time} onChange={e => setForm(f => ({...f, delivery_time: e.target.value}))} />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Min order ₹" type="number" value={form.minimum_order_amount} onChange={e => setForm(f => ({...f, minimum_order_amount: e.target.value}))} />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Delivery fee ₹" type="number" value={form.delivery_fee} onChange={e => setForm(f => ({...f, delivery_fee: e.target.value}))} />
              </div>
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Logo URL" value={form.logo_url} onChange={e => setForm(f => ({...f, logo_url: e.target.value}))} />
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Banner URL" value={form.banner_url} onChange={e => setForm(f => ({...f, banner_url: e.target.value}))} />
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((c: Category) => (
                      <button key={c.id} type="button" onClick={() => toggleCategory(c.id)}
                        className={`px-3 py-1 rounded-full text-sm ${form.categories.includes(c.id) ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-400" : "bg-gray-100 text-gray-600"}`}
                      >{c.name}</button>
                    ))}
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{editingBrand ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorBrands;
