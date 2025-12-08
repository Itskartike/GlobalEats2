import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  ChefHat,
  Tag,
  Clock,
  Flame,
  Leaf,
  Wheat,
} from "lucide-react";
import toast from "react-hot-toast";
import adminService from "../services/adminService";

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

interface MenuItem {
  id: string;
  brand_id: string;
  category_id: string;
  name: string;
  description?: string;
  image_url?: string;
  base_price: number | string; // Can be string from API or number in form
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  spice_level: number;
  calories?: number;
  preparation_time?: number;
  is_available: boolean;
  sort_order: number;
  categoryInfo?: Category;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
}

const AdminMenus: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"categories" | "items">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Category modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
    sort_order: 0,
  });

  // Menu item modal states
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuItemFormData, setMenuItemFormData] = useState({
    brand_id: "",
    category_id: "",
    name: "",
    description: "",
    image_url: "",
    base_price: 0,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    spice_level: 0,
    calories: 0,
    preparation_time: 15,
    is_available: true,
    sort_order: 0,
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (activeTab === "items") {
      fetchMenuItems();
    }
  }, [activeTab, selectedBrand, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await adminService.getAllBrands();
      if (response.success) {
        // Handle both response structures: data.brands or data directly
        const brandsData = response.data.brands || response.data;
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to fetch brands");
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await adminService.getMenuItems({
        brand_id: selectedBrand,
        category_id: selectedCategory,
      });
      if (response.success) {
        setMenuItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items");
    }
  };

  const handleCreateCategory = async () => {
    try {
      const response = await adminService.createCategory(categoryFormData);
      if (response.success) {
        toast.success("Category created successfully");
        setIsCategoryModalOpen(false);
        resetCategoryForm();
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const response = await adminService.updateCategory(editingCategory.id, categoryFormData);
      if (response.success) {
        toast.success("Category updated successfully");
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        resetCategoryForm();
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await adminService.deleteCategory(categoryId);
      if (response.success) {
        toast.success("Category deleted successfully");
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleCreateMenuItem = async () => {
    try {
      const response = await adminService.createMenuItem(menuItemFormData);
      if (response.success) {
        toast.success("Menu item created successfully");
        setIsMenuItemModalOpen(false);
        resetMenuItemForm();
        fetchMenuItems();
      } else {
        toast.error(response.message || "Failed to create menu item");
      }
    } catch (error) {
      console.error("Error creating menu item:", error);
      toast.error("Failed to create menu item");
    }
  };

  const handleUpdateMenuItem = async () => {
    if (!editingMenuItem) return;

    try {
      const response = await adminService.updateMenuItem(editingMenuItem.id, menuItemFormData);
      if (response.success) {
        toast.success("Menu item updated successfully");
        setIsMenuItemModalOpen(false);
        setEditingMenuItem(null);
        resetMenuItemForm();
        fetchMenuItems();
      } else {
        toast.error(response.message || "Failed to update menu item");
      }
    } catch (error) {
      console.error("Error updating menu item:", error);
      toast.error("Failed to update menu item");
    }
  };

  const handleDeleteMenuItem = async (menuItemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const response = await adminService.deleteMenuItem(menuItemId);
      if (response.success) {
        toast.success("Menu item deleted successfully");
        fetchMenuItems();
      } else {
        toast.error(response.message || "Failed to delete menu item");
      }
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error("Failed to delete menu item");
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: "",
      description: "",
      image_url: "",
      is_active: true,
      sort_order: 0,
    });
  };

  const resetMenuItemForm = () => {
    setMenuItemFormData({
      brand_id: "",
      category_id: "",
      name: "",
      description: "",
      image_url: "",
      base_price: 0,
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      spice_level: 0,
      calories: 0,
      preparation_time: 15,
      is_available: true,
      sort_order: 0,
    });
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || "",
        image_url: category.image_url || "",
        is_active: category.is_active,
        sort_order: category.sort_order,
      });
    } else {
      setEditingCategory(null);
      resetCategoryForm();
    }
    setIsCategoryModalOpen(true);
  };

  const openMenuItemModal = (menuItem?: MenuItem) => {
    if (menuItem) {
      setEditingMenuItem(menuItem);
      setMenuItemFormData({
        brand_id: menuItem.brand_id,
        category_id: menuItem.category_id,
        name: menuItem.name,
        description: menuItem.description || "",
        image_url: menuItem.image_url || "",
        base_price: typeof menuItem.base_price === 'string' ? parseFloat(menuItem.base_price) : menuItem.base_price,
        is_vegetarian: menuItem.is_vegetarian,
        is_vegan: menuItem.is_vegan,
        is_gluten_free: menuItem.is_gluten_free,
        spice_level: menuItem.spice_level,
        calories: menuItem.calories || 0,
        preparation_time: menuItem.preparation_time || 15,
        is_available: menuItem.is_available,
        sort_order: menuItem.sort_order,
      });
    } else {
      setEditingMenuItem(null);
      resetMenuItemForm();
    }
    setIsMenuItemModalOpen(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSpiceLevelIcon = (level: number) => {
    const icons = [Flame, Flame, Flame, Flame, Flame];
    const Icon = icons[Math.min(level, 4)];
    return <Icon className="w-4 h-4" />;
  };

  const getSpiceLevelColor = (level: number) => {
    const colors = ["text-gray-400", "text-yellow-500", "text-orange-500", "text-red-500", "text-red-700"];
    return colors[Math.min(level, 4)];
  };

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
        <p className="text-gray-600">Manage categories and menu items for your brands</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("categories")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Tag className="w-4 h-4 inline mr-2" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "items"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ChefHat className="w-4 h-4 inline mr-2" />
              Menu Items
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {activeTab === "items" && (
          <>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Brands</option>
              {Array.isArray(brands) && brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </>
        )}

        <button
          onClick={() => activeTab === "categories" ? openCategoryModal() : openMenuItemModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {activeTab === "categories" ? "Category" : "Menu Item"}
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sort Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image_url ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={category.image_url}
                            alt={category.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                            <Tag className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {category.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {category.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openCategoryModal(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Menu Items Tab */}
      {activeTab === "items" && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attributes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMenuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {item.image_url ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover mr-3"
                            src={item.image_url}
                            alt={item.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                            <ChefHat className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {item.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {Array.isArray(brands) && brands.find((b) => b.id === item.brand_id)?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.categoryInfo?.name || "Unknown"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{typeof item.base_price === 'string' ? parseFloat(item.base_price).toFixed(2) : item.base_price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {item.is_vegetarian && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Leaf className="w-3 h-3 mr-1" />
                            Veg
                          </span>
                        )}
                        {item.is_vegan && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Leaf className="w-3 h-3 mr-1" />
                            Vegan
                          </span>
                        )}
                        {item.is_gluten_free && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Wheat className="w-3 h-3 mr-1" />
                            GF
                          </span>
                        )}
                        {item.spice_level > 0 && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSpiceLevelColor(item.spice_level)}`}>
                            {getSpiceLevelIcon(item.spice_level)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openMenuItemModal(item)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <Dialog
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md w-full bg-white rounded-lg shadow-lg">
            <Dialog.Title className="text-lg font-semibold text-gray-900 p-6 pb-0">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </Dialog.Title>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={categoryFormData.image_url}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, image_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={categoryFormData.sort_order}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={categoryFormData.is_active}
                      onChange={(e) =>
                        setCategoryFormData({ ...categoryFormData, is_active: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={editingCategory ? handleUpdateCategory : handleCreateCategory}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Menu Item Modal */}
      <Dialog
        open={isMenuItemModalOpen}
        onClose={() => setIsMenuItemModalOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-lg font-semibold text-gray-900 p-6 pb-0">
              {editingMenuItem ? "Edit Menu Item" : "Create New Menu Item"}
            </Dialog.Title>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand *
                    </label>
                    <select
                      value={menuItemFormData.brand_id}
                      onChange={(e) =>
                        setMenuItemFormData({ ...menuItemFormData, brand_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Brand</option>
                      {Array.isArray(brands) && brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={menuItemFormData.category_id}
                      onChange={(e) =>
                        setMenuItemFormData({ ...menuItemFormData, category_id: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={menuItemFormData.name}
                    onChange={(e) =>
                      setMenuItemFormData({ ...menuItemFormData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={menuItemFormData.description}
                    onChange={(e) =>
                      setMenuItemFormData({ ...menuItemFormData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={menuItemFormData.image_url}
                    onChange={(e) =>
                      setMenuItemFormData({ ...menuItemFormData, image_url: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={menuItemFormData.base_price}
                        onChange={(e) =>
                          setMenuItemFormData({ ...menuItemFormData, base_price: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preparation Time (min)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        min="0"
                        value={menuItemFormData.preparation_time}
                        onChange={(e) =>
                          setMenuItemFormData({ ...menuItemFormData, preparation_time: parseInt(e.target.value) || 15 })
                        }
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="15"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Calories
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={menuItemFormData.calories}
                      onChange={(e) =>
                        setMenuItemFormData({ ...menuItemFormData, calories: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spice Level
                  </label>
                  <div className="flex items-center space-x-4">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <label key={level} className="flex items-center">
                        <input
                          type="radio"
                          name="spice_level"
                          value={level}
                          checked={menuItemFormData.spice_level === level}
                          onChange={(e) =>
                            setMenuItemFormData({ ...menuItemFormData, spice_level: parseInt(e.target.value) })
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 flex items-center">
                          {level === 0 ? "Mild" : getSpiceLevelIcon(level)}
                          {level > 0 && <span className="ml-1 text-sm">{level}</span>}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Attributes
                  </label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={menuItemFormData.is_vegetarian}
                        onChange={(e) =>
                          setMenuItemFormData({ ...menuItemFormData, is_vegetarian: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900 flex items-center">
                        <Leaf className="w-4 h-4 mr-1" />
                        Vegetarian
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={menuItemFormData.is_vegan}
                        onChange={(e) =>
                          setMenuItemFormData({ ...menuItemFormData, is_vegan: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900 flex items-center">
                        <Leaf className="w-4 h-4 mr-1" />
                        Vegan
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={menuItemFormData.is_gluten_free}
                        onChange={(e) =>
                          setMenuItemFormData({ ...menuItemFormData, is_gluten_free: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900 flex items-center">
                        <Wheat className="w-4 h-4 mr-1" />
                        Gluten Free
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={menuItemFormData.sort_order}
                      onChange={(e) =>
                        setMenuItemFormData({ ...menuItemFormData, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_available"
                      checked={menuItemFormData.is_available}
                      onChange={(e) =>
                        setMenuItemFormData({ ...menuItemFormData, is_available: e.target.checked })
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
                      Available
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsMenuItemModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={editingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {editingMenuItem ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default AdminMenus;
