import React, { useEffect, useState } from "react";
import vendorService from "../services/vendorService";
import { Plus, Edit2, Trash2, X, Building2 } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Outlet = any;

const VendorOutlets: React.FC = () => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", postal_code: "",
    latitude: "", longitude: "", phone: "", email: "",
    delivery_radius: "5", is_active: true,
  });

  const fetchData = async () => {
    try {
      const res = await vendorService.getOutlets();
      if (res.success) setOutlets(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingOutlet(null);
    setForm({ name: "", address: "", city: "", state: "", postal_code: "", latitude: "", longitude: "", phone: "", email: "", delivery_radius: "5", is_active: true });
    setShowModal(true); setError("");
  };

  const openEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
    setForm({
      name: outlet.name, address: outlet.address || "", city: outlet.city || "",
      state: outlet.state || "", postal_code: outlet.postal_code || "",
      latitude: String(outlet.latitude || ""), longitude: String(outlet.longitude || ""),
      phone: outlet.phone || "", email: outlet.email || "",
      delivery_radius: String(outlet.delivery_radius || 5), is_active: outlet.is_active !== false,
    });
    setShowModal(true); setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    try {
      if (editingOutlet) {
        await vendorService.updateOutlet(editingOutlet.id, form);
      } else {
        await vendorService.createOutlet(form);
      }
      setShowModal(false); fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this outlet?")) return;
    try { await vendorService.deleteOutlet(id); fetchData(); }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Outlets</h1>
        <button onClick={openCreate} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          <Plus size={18} className="mr-2" /> Add Outlet
        </button>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No outlets yet. Create your first outlet!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brands</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {outlets.map((outlet: Outlet) => (
                <tr key={outlet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{outlet.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{outlet.city}, {outlet.state}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{outlet.phone || outlet.email || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{outlet.Brands?.length || 0} brands</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${outlet.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {outlet.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(outlet)} className="text-blue-600 hover:text-blue-800"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(outlet.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
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
              <h2 className="text-xl font-bold">{editingOutlet ? "Edit Outlet" : "New Outlet"}</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Outlet Name *" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
              <input className="w-full px-3 py-2 border rounded-lg" placeholder="Address *" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} required />
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="City *" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} required />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="State *" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Postal Code" value={form.postal_code} onChange={e => setForm(f => ({...f, postal_code: e.target.value}))} />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Delivery Radius (km)" type="number" value={form.delivery_radius} onChange={e => setForm(f => ({...f, delivery_radius: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Latitude" value={form.latitude} onChange={e => setForm(f => ({...f, latitude: e.target.value}))} />
                <input className="w-full px-3 py-2 border rounded-lg" placeholder="Longitude" value={form.longitude} onChange={e => setForm(f => ({...f, longitude: e.target.value}))} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({...f, is_active: e.target.checked}))} />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">{editingOutlet ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOutlets;
