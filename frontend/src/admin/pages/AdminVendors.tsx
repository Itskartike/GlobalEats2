import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import { CheckCircle, XCircle, Ban, Search, Eye, DollarSign } from "lucide-react";

type Vendor = any;

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-gray-100 text-gray-800",
};

const AdminVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [commissionModal, setCommissionModal] = useState<string | null>(null);
  const [commissionRate, setCommissionRate] = useState("");

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filterStatus) params.append("status", filterStatus);
      if (search) params.append("search", search);
      const res = await api.get(`/admin/vendors?${params}`);
      if (res.data.success) {
        setVendors(res.data.data.vendors);
        setPagination(res.data.data.pagination);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, [filterStatus, page]);

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/admin/vendors/${id}`);
      if (res.data.success) setSelectedVendor(res.data.data);
    } catch (err) { console.error(err); }
    finally { setDetailLoading(false); }
  };

  const handleAction = async (id: string, action: string, reason?: string) => {
    try {
      await api.put(`/admin/vendors/${id}/${action}`, reason ? { reason } : {});
      fetchVendors();
      if (selectedVendor?.vendor?.id === id) fetchDetail(id);
    } catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleCommissionUpdate = async () => {
    if (!commissionModal) return;
    try {
      await api.put(`/admin/vendors/${commissionModal}/commission`, { commission_rate: parseFloat(commissionRate) });
      setCommissionModal(null);
      fetchVendors();
      if (selectedVendor?.vendor?.id === commissionModal) fetchDetail(commissionModal);
    } catch (err: any) { alert(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Vendor Management</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            placeholder="Search vendors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVendors()}
          />
        </div>
        {["", "pending", "approved", "suspended", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Vendor List */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
          ) : vendors.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">No vendors found</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((v: Vendor) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{v.business_name}</p>
                        <p className="text-xs text-gray-400">ID: {v.id?.slice(0, 8)}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {v.user?.name}<br />
                        <span className="text-xs text-gray-400">{v.user?.email}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 capitalize">{v.business_type?.replace("_", " ")}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{v.commission_rate}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${statusColor[v.status] || "bg-gray-100"}`}>{v.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => fetchDetail(v.id)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="View"><Eye size={16} /></button>
                          {v.status === "pending" && <button onClick={() => handleAction(v.id, "approve")} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle size={16} /></button>}
                          {v.status === "pending" && <button onClick={() => handleAction(v.id, "reject", prompt("Rejection reason:") || undefined)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle size={16} /></button>}
                          {v.status === "approved" && <button onClick={() => handleAction(v.id, "suspend", prompt("Suspension reason:") || undefined)} className="p-1 text-orange-600 hover:bg-orange-50 rounded" title="Suspend"><Ban size={16} /></button>}
                          {v.status === "suspended" && <button onClick={() => handleAction(v.id, "approve")} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Reactivate"><CheckCircle size={16} /></button>}
                          <button onClick={() => { setCommissionModal(v.id); setCommissionRate(String(v.commission_rate || 15)); }} className="p-1 text-purple-600 hover:bg-purple-50 rounded" title="Commission"><DollarSign size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 p-4 border-t">
                  <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
                  <span className="px-3 py-1 text-sm text-gray-600">{page} / {pagination.totalPages}</span>
                  <button disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Sidebar */}
        {selectedVendor && (
          <div className="w-80 bg-white rounded-xl shadow-sm border p-6 sticky top-8 self-start">
            {detailLoading ? (
              <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-4">{selectedVendor.vendor?.business_name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 text-xs rounded-full capitalize ${statusColor[selectedVendor.vendor?.status]}`}>{selectedVendor.vendor?.status}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="capitalize">{selectedVendor.vendor?.business_type?.replace("_"," ")}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Commission</span><span>{selectedVendor.vendor?.commission_rate}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Owner</span><span>{selectedVendor.vendor?.user?.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-xs">{selectedVendor.vendor?.user?.email}</span></div>
                  <hr />
                  <div className="flex justify-between"><span className="text-gray-500">Brands</span><span>{selectedVendor.brands?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Outlets</span><span>{selectedVendor.outlets?.length || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Orders</span><span>{selectedVendor.stats?.totalOrders || 0}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Revenue</span><span>₹{(selectedVendor.stats?.totalRevenue || 0).toLocaleString()}</span></div>
                </div>
                <button onClick={() => setSelectedVendor(null)} className="mt-4 w-full px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50">Close</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Commission Modal */}
      {commissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 m-4">
            <h2 className="text-lg font-bold mb-4">Update Commission Rate</h2>
            <input type="number" min="0" max="100" step="0.5" className="w-full px-3 py-2 border rounded-lg mb-4" value={commissionRate} onChange={e => setCommissionRate(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setCommissionModal(null)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleCommissionUpdate} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
