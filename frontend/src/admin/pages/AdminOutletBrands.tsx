import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Building2,
  Tag,
  Check,
  X,
  Clock,
  DollarSign,
  Edit2,
} from "lucide-react";
import adminService from "../services/adminService";
import toast from "react-hot-toast";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

interface OutletBrand {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  Brands?: (Brand & {
    OutletBrand: {
      is_available: boolean;
      preparation_time: number;
      minimum_order_amount: number;
      delivery_fee: number;
      priority: number;
      created_at: string;
    };
  })[];
}

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  outletId: string;
  outletName: string;
  availableBrands: Brand[];
  onBrandAdded: () => void;
}

const AddBrandModal: React.FC<AddBrandModalProps> = ({
  isOpen,
  onClose,
  outletId,
  outletName,
  availableBrands,
  onBrandAdded,
}) => {
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const [formData, setFormData] = useState({
    is_available: true,
    preparation_time: 30,
    minimum_order_amount: 0,
    delivery_fee: 0,
    priority: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) {
      toast.error("Please select a brand");
      return;
    }

    setLoading(true);
    try {
      await adminService.addBrandToOutlet(outletId, selectedBrandId, formData);
      toast.success("Brand added to outlet successfully");
      onBrandAdded();
      onClose();
      setSelectedBrandId("");
      setFormData({
        is_available: true,
        preparation_time: 30,
        minimum_order_amount: 0,
        delivery_fee: 0,
        priority: 1,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add brand");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredBrands = availableBrands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Add Brand to {outletName}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {filteredBrands.length} brand{filteredBrands.length === 1 ? "" : "s"} available
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Brand *
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a brand...</option>
              {filteredBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time (min)
              </label>
              <input
                type="number"
                min="0"
                value={formData.preparation_time}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preparation_time: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Order Amount (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.minimum_order_amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minimum_order_amount: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Fee (₹)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.delivery_fee}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    delivery_fee: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) =>
                setFormData({ ...formData, is_available: e.target.checked })
              }
              className="mr-2"
            />
            <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
              Available for orders
            </label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminOutletBrands: React.FC = () => {
  const [outlets, setOutlets] = useState<OutletBrand[]>([]);
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOutlet, setSelectedOutlet] = useState<{
    id: string;
    name: string;
    existingBrandIds: string[];
  } | null>(null);
  const [editing, setEditing] = useState<{ outletId: string; brandId: string } | null>(null);
  const [editForm, setEditForm] = useState({
    is_available: true,
    preparation_time: 30,
    minimum_order_amount: 0,
    delivery_fee: 0,
    priority: 1,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    const fetchDataAndBrands = async () => {
      setLoading(true);
      try {
        const [dataResponse, brandsResponse] = await Promise.all([
          adminService.getOutletBrandAssociations(currentPage, 10, searchTerm),
          adminService.getAllBrands(),
        ]);
        
        setOutlets(dataResponse.data.outlets);
        setTotalPages(dataResponse.data.pagination.totalPages);
        setAllBrands(brandsResponse.data.brands || []);
      } catch (error) {
        toast.error("Failed to fetch data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndBrands();
  }, [currentPage, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getOutletBrandAssociations(
        currentPage,
        10,
        searchTerm
      );
      setOutlets(response.data.outlets);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      toast.error("Failed to fetch outlet-brand associations");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBrand = async (outletId: string, brandId: string) => {
    if (!window.confirm("Are you sure you want to remove this brand from the outlet?")) {
      return;
    }

    try {
      await adminService.removeBrandFromOutlet(outletId, brandId);
      toast.success("Brand removed from outlet successfully");
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove brand");
    }
  };

  const handleToggleAvailability = async (
    outletId: string,
    brandId: string,
    currentAvailability: boolean
  ) => {
    try {
      await adminService.updateOutletBrand(outletId, brandId, {
        is_available: !currentAvailability,
      });
      toast.success(`Brand ${!currentAvailability ? "enabled" : "disabled"} successfully`);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update brand");
    }
  };

  const handleStartEdit = (
    outletId: string,
    brand: OutletBrand["Brands"][number]
  ) => {
    setEditing({ outletId, brandId: brand.id });
    setEditForm({
      is_available: brand.OutletBrand.is_available,
      preparation_time: brand.OutletBrand.preparation_time,
      minimum_order_amount: brand.OutletBrand.minimum_order_amount,
      delivery_fee: brand.OutletBrand.delivery_fee,
      priority: brand.OutletBrand.priority,
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      await adminService.updateOutletBrand(editing.outletId, editing.brandId, editForm);
      toast.success("Association updated");
      setEditing(null);
      await fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAddBrand = (outlet: OutletBrand) => {
    const existingBrandIds = outlet.Brands?.map((brand) => brand.id) || [];
    setSelectedOutlet({
      id: outlet.id,
      name: outlet.name,
      existingBrandIds,
    });
    setShowAddModal(true);
  };

  const getAvailableBrands = () => {
    if (!selectedOutlet) return [];
    return allBrands.filter(
      (brand) => !selectedOutlet.existingBrandIds.includes(brand.id)
    );
  };

  const filteredOutlets = outlets.filter(
    (outlet) =>
      outlet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      outlet.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Outlet-Brand Management</h1>
        <p className="text-gray-600 mt-2">
          Manage which brands are available at each outlet
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search outlets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOutlets.map((outlet) => (
            <div key={outlet.id} className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <Building2 className="text-blue-600" size={24} />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {outlet.name}
                      </h3>
                      <p className="text-gray-600">{outlet.address}</p>
                      {outlet.city && outlet.state && (
                        <p className="text-sm text-gray-500">
                          {outlet.city}, {outlet.state}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBrand(outlet)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={20} />
                    <span>Add Brand</span>
                  </button>
                </div>

                {outlet.Brands && outlet.Brands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {outlet.Brands.map((brand) => (
                      <div
                        key={brand.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-2">
                            <Tag className="text-orange-600" size={20} />
                            <h4 className="font-semibold text-gray-900">
                              {brand.name}
                            </h4>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStartEdit(outlet.id, brand)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit association"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleToggleAvailability(
                                  outlet.id,
                                  brand.id,
                                  brand.OutletBrand.is_available
                                )
                              }
                              className={`p-1 rounded ${
                                brand.OutletBrand.is_available
                                  ? "text-green-600 hover:bg-green-50"
                                  : "text-red-600 hover:bg-red-50"
                              }`}
                              title={
                                brand.OutletBrand.is_available
                                  ? "Disable brand"
                                  : "Enable brand"
                              }
                            >
                              {brand.OutletBrand.is_available ? (
                                <Check size={18} />
                              ) : (
                                <X size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => handleRemoveBrand(outlet.id, brand.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Remove brand from outlet"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        {editing && editing.outletId === outlet.id && editing.brandId === brand.id ? (
                          <div className="space-y-3 text-sm text-gray-700">
                            <div className="grid grid-cols-2 gap-3">
                              <label className="block">
                                <span className="text-xs text-gray-500">Prep Time (min)</span>
                                <input
                                  type="number"
                                  min={0}
                                  value={editForm.preparation_time}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      preparation_time: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </label>
                              <label className="block">
                                <span className="text-xs text-gray-500">Priority</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={editForm.priority}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      priority: parseInt(e.target.value) || 1,
                                    })
                                  }
                                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <label className="block">
                                <span className="text-xs text-gray-500">Min Order (₹)</span>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={editForm.minimum_order_amount}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      minimum_order_amount: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </label>
                              <label className="block">
                                <span className="text-xs text-gray-500">Delivery Fee (₹)</span>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={editForm.delivery_fee}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      delivery_fee: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="mt-1 w-full px-2 py-1 border border-gray-300 rounded"
                                />
                              </label>
                            </div>
                            <label className="inline-flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={editForm.is_available}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, is_available: e.target.checked })
                                }
                              />
                              <span className="text-sm">Available for orders</span>
                            </label>
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                className="px-3 py-1 text-gray-600 hover:text-gray-900"
                                onClick={() => setEditing(null)}
                                type="button"
                                disabled={savingEdit}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                onClick={handleSaveEdit}
                                type="button"
                                disabled={savingEdit}
                              >
                                {savingEdit ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <Clock size={16} className="mr-1" />
                                Prep Time:
                              </span>
                              <span className="font-medium">
                                {brand.OutletBrand.preparation_time} min
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <DollarSign size={16} className="mr-1" />
                                Min Order:
                              </span>
                              <span className="font-medium">
                                ₹{brand.OutletBrand.minimum_order_amount}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center">
                                <DollarSign size={16} className="mr-1" />
                                Delivery Fee:
                              </span>
                              <span className="font-medium">
                                ₹{brand.OutletBrand.delivery_fee}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Priority:</span>
                              <span className="font-medium">
                                {brand.OutletBrand.priority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Status:</span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  brand.OutletBrand.is_available
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {brand.OutletBrand.is_available ? "Available" : "Disabled"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Tag size={48} className="mx-auto mb-4 text-gray-300" />
                    <p>No brands assigned to this outlet</p>
                    <p className="text-sm">Click "Add Brand" to get started</p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredOutlets.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No outlets found</h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No outlets available to manage"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 text-sm font-medium border ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {selectedOutlet && (
        <AddBrandModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedOutlet(null);
          }}
          outletId={selectedOutlet.id}
          outletName={selectedOutlet.name}
          availableBrands={getAvailableBrands()}
          onBrandAdded={fetchData}
        />
      )}
    </div>
  );
};

export default AdminOutletBrands;
