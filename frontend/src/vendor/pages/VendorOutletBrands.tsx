import React, { useEffect, useState } from "react";
import vendorService from "../services/vendorService";
import { Plus, Trash2, Link2 } from "lucide-react";

type Outlet = any;
type Brand = any;

const VendorOutletBrands: React.FC = () => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [outletRes, brandsRes] = await Promise.all([
        vendorService.getOutletBrands(),
        vendorService.getBrands(),
      ]);
      if (outletRes.success) setOutlets(outletRes.data);
      if (brandsRes.success) setBrands(brandsRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = async () => {
    if (!selectedOutlet || !selectedBrand) { setError("Select both"); return; }
    try {
      await vendorService.addBrandToOutlet(selectedOutlet, { brand_id: selectedBrand });
      setShowAddModal(false); fetchData();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleRemove = async (outletId: string, brandId: string) => {
    if (!confirm("Remove?")) return;
    try { await vendorService.removeBrandFromOutlet(outletId, brandId); fetchData(); }
    catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Outlet-Brand Links</h1>
        <button onClick={() => { setShowAddModal(true); setError(""); }} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          <Plus size={18} className="mr-2" /> Link Brand
        </button>
      </div>

      {outlets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Link2 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No outlets yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {outlets.map((outlet: Outlet) => (
            <div key={outlet.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="font-semibold text-gray-800">{outlet.name}</h3>
                <p className="text-sm text-gray-500">{outlet.city}, {outlet.state}</p>
              </div>
              <div className="p-4">
                {outlet.Brands?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {outlet.Brands.map((brand: Brand) => (
                      <div key={brand.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium text-emerald-800">{brand.name}</span>
                        <button onClick={() => handleRemove(outlet.id, brand.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-400">No brands linked</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 m-4">
            <h2 className="text-xl font-bold mb-4">Link Brand to Outlet</h2>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <select className="w-full px-3 py-2 border rounded-lg" value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)}>
                <option value="">Select outlet...</option>
                {outlets.map((o: Outlet) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <select className="w-full px-3 py-2 border rounded-lg" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)}>
                <option value="">Select brand...</option>
                {brands.map((b: Brand) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleAdd} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Link</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOutletBrands;
