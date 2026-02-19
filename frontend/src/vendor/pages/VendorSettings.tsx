import React, { useEffect, useState } from "react";
import vendorService from "../services/vendorService";

const VendorSettings: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    business_name: "", description: "", business_type: "restaurant",
    gst_number: "", fssai_license: "", pan_number: "",
    bank_account_name: "", bank_account_number: "", bank_ifsc_code: "", bank_name: "",
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await vendorService.getProfile();
        if (res.success) {
          const p = res.data;
          setProfile(p);
          setForm({
            business_name: p.business_name || "", description: p.description || "",
            business_type: p.business_type || "restaurant",
            gst_number: p.gst_number || "", fssai_license: p.fssai_license || "",
            pan_number: p.pan_number || "",
            bank_account_name: p.bank_details?.account_name || "",
            bank_account_number: p.bank_details?.account_number || "",
            bank_ifsc_code: p.bank_details?.ifsc_code || "",
            bank_name: p.bank_details?.bank_name || "",
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage("");
    try {
      await vendorService.updateProfile({
        business_name: form.business_name, description: form.description,
        business_type: form.business_type,
        gst_number: form.gst_number || undefined,
        fssai_license: form.fssai_license || undefined,
        pan_number: form.pan_number || undefined,
        bank_details: form.bank_account_number ? {
          account_name: form.bank_account_name, account_number: form.bank_account_number,
          ifsc_code: form.bank_ifsc_code, bank_name: form.bank_name,
        } : undefined,
      });
      setMessage("Profile updated successfully!");
    } catch (err: any) { setMessage(err.message || "Update failed"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" /></div>;

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition";

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Settings</h1>
      <p className="text-gray-500 mb-6">Manage your vendor profile and business details</p>

      {profile && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
          profile.status === "approved" ? "bg-green-50 text-green-700" :
          profile.status === "pending" ? "bg-yellow-50 text-yellow-700" :
          "bg-red-50 text-red-700"
        }`}>
          Account Status: <span className="capitalize">{profile.status}</span>
          {profile.commission_rate !== undefined && ` • Commission Rate: ${profile.commission_rate}%`}
        </div>
      )}

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input className={inputClass} value={form.business_name} onChange={e => setForm(f => ({...f, business_name: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select className={inputClass} value={form.business_type} onChange={e => setForm(f => ({...f, business_type: e.target.value}))}>
                <option value="restaurant">Restaurant</option>
                <option value="cloud_kitchen">Cloud Kitchen</option>
                <option value="cafe">Cafe</option>
                <option value="bakery">Bakery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className={inputClass} rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Compliance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
              <input className={inputClass} value={form.gst_number} onChange={e => setForm(f => ({...f, gst_number: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">FSSAI License</label>
              <input className={inputClass} value={form.fssai_license} onChange={e => setForm(f => ({...f, fssai_license: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input className={inputClass} value={form.pan_number} onChange={e => setForm(f => ({...f, pan_number: e.target.value}))} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Bank Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder</label>
                <input className={inputClass} value={form.bank_account_name} onChange={e => setForm(f => ({...f, bank_account_name: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input className={inputClass} value={form.bank_account_number} onChange={e => setForm(f => ({...f, bank_account_number: e.target.value}))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input className={inputClass} value={form.bank_ifsc_code} onChange={e => setForm(f => ({...f, bank_ifsc_code: e.target.value}))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input className={inputClass} value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))} />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default VendorSettings;
