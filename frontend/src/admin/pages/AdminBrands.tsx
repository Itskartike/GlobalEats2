import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Tag, Globe, Image } from "lucide-react";
import { api } from "../../services/api";
import adminService from "../services/adminService";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  cuisine_type: string;
  is_active: boolean;
  rating: number;
  delivery_time: string;
  categories?: Category[];
}

const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
    banner_url: "",
    cuisine_type: "",
    delivery_time: "30-45",
    is_active: true,
    selectedCategories: [] as string[],
  });

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await adminService.getBrandsForManagement();
      const brandsData = response.data || [];
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      toast.error("Failed to load brands");
      setBrands([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      const categoriesData = response.data?.data || response.data || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error("Failed to load categories");
      setCategories([]); // Set empty array on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const brandData = {
        name: formData.name,
        description: formData.description,
        logo_url: formData.logo_url,
        banner_url: formData.banner_url,
        cuisine_type: formData.cuisine_type,
        delivery_time: formData.delivery_time,
        is_active: formData.is_active,
        categories: formData.selectedCategories,
      };

      if (editingBrand) {
        await api.put(`/admin/brands/${editingBrand.id}`, brandData);
        toast.success("Brand updated successfully");
      } else {
        await api.post("/admin/brands", brandData);
        toast.success("Brand created successfully");
      }

      await fetchBrands();
      resetForm();
    } catch (error: unknown) {
      console.error("Failed to save brand:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to save brand");
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description,
      logo_url: brand.logo_url || "",
      banner_url: brand.banner_url || "",
      cuisine_type: brand.cuisine_type,
      delivery_time: brand.delivery_time,
      is_active: brand.is_active,
      selectedCategories: brand.categories?.map((cat) => cat.id) || [],
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (brandId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this brand? This will also delete all associated outlets."
      )
    )
      return;

    try {
      await api.delete(`/admin/brands/${brandId}`);
      toast.success("Brand deleted successfully");
      await fetchBrands();
    } catch (error: unknown) {
      console.error("Failed to delete brand:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to delete brand");
    }
  };

  const toggleStatus = async (brand: Brand) => {
    try {
      await api.put(`/admin/brands/${brand.id}`, {
        ...brand,
        is_active: !brand.is_active,
      });
      toast.success(
        `Brand ${brand.is_active ? "deactivated" : "activated"} successfully`
      );
      await fetchBrands();
    } catch (error: unknown) {
      console.error("Failed to toggle brand status:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to update brand");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      logo_url: "",
      banner_url: "",
      cuisine_type: "",
      delivery_time: "30-45",
      is_active: true,
      selectedCategories: [],
    });
    setEditingBrand(null);
    setShowCreateModal(false);
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.cuisine_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Brands Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage restaurant brands and their information
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full max-w-md border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Brand Header */}
            <div className="relative">
              {brand.banner_url ? (
                <img
                  src={brand.banner_url}
                  alt={brand.name}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={() => toggleStatus(brand)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    brand.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  {brand.is_active ? "Active" : "Inactive"}
                </button>
              </div>

              {/* Logo */}
              <div className="absolute -bottom-6 left-4">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-12 h-12 rounded-full border-2 border-white bg-white"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                    <Tag className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Brand Info */}
            <div className="p-4 pt-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {brand.name}
                  </h3>
                  <p className="text-sm text-gray-500">{brand.cuisine_type}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(brand.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {brand.description}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  {brand.delivery_time} min
                </div>
                <div className="flex items-center">
                  ⭐ {brand.rating || "N/A"}
                </div>
              </div>

              {brand.categories && brand.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {brand.categories.slice(0, 3).map((category) => (
                    <span
                      key={category.id}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {category.name}
                    </span>
                  ))}
                  {brand.categories.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      +{brand.categories.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No brands found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by creating a new brand."}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingBrand ? "Edit Brand" : "Create New Brand"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo URL
                    </label>
                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, logo_url: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banner URL
                    </label>
                    <input
                      type="url"
                      value={formData.banner_url}
                      onChange={(e) =>
                        setFormData({ ...formData, banner_url: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuisine Type *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cuisine_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cuisine_type: e.target.value,
                        })
                      }
                      placeholder="e.g., Italian, Indian, Chinese"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.delivery_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delivery_time: e.target.value,
                        })
                      }
                      placeholder="e.g., 30-45"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {Array.isArray(categories) &&
                      categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.selectedCategories.includes(
                              category.id
                            )}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedCategories: [
                                    ...formData.selectedCategories,
                                    category.id,
                                  ],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedCategories:
                                    formData.selectedCategories.filter(
                                      (id) => id !== category.id
                                    ),
                                });
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {category.name}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active (visible to customers)
                  </label>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingBrand ? "Update Brand" : "Create Brand"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
