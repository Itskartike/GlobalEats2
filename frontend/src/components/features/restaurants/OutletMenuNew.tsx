import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  ChevronRight,
  Leaf,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";
import { MenuItem, MenuCategory } from "../../../types/menu";
import { menuService } from "../../../services/menuService";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
import { useCartStore } from "../../../store/cartStore";

interface OutletInfo {
  id: string;
  name: string;
  address: string;
  brand: {
    id: string;
    name: string;
    slug: string;
    logo: string;
  };
}

export const OutletMenu: React.FC = () => {
  const { brandSlug, outletId } = useParams<{
    brandSlug: string;
    outletId: string;
  }>();
  const [outlet, setOutlet] = useState<OutletInfo | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [availableCategories, setAvailableCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MenuItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const { addItem, updateQuantity, getItemQuantity, getTotalItems } =
    useCartStore();

  useEffect(() => {
    if (outletId) {
      fetchOutletMenu();
      fetchCategories();
    }
  }, [outletId, selectedCategory]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const fetchOutletMenu = async () => {
    try {
      setLoading(true);
      const data = await menuService.getOutletMenu(outletId!, selectedCategory);
      setOutlet(data.outlet);
      setCategories(data.categories);
      setError(null);
    } catch (err) {
      setError("Failed to load menu. Please try again.");
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await menuService.getOutletCategories(outletId!);
      setAvailableCategories(cats);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const results = await menuService.searchOutletMenu(
        outletId!,
        searchQuery.trim(),
        selectedCategory
      );
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching menu:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCategoryFilter = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? "" : categoryName);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!outlet) return;

    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        outletId: outletId!,
        outletName: outlet.name,
        brandName: outlet.brand.name,
        isVeg: item.isVeg,
      },
      {
        brandId: outlet.brand.id,
        brandName: outlet.brand.name,
        outletId: outletId!,
        outletName: outlet.name,
        outletAddress: outlet.address,
        deliveryFee: 49, // Default delivery fee
      }
    );
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    if (!outlet) return;

    const currentQuantity = getItemQuantity(itemId);
    const newQuantity = Math.max(0, currentQuantity + change);
    updateQuantity(itemId, outlet.brand.id, newQuantity);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveCategory(categoryId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchOutletMenu} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const displayedCategories = searchQuery.trim().length >= 2 ? [] : categories;
  const displayedResults = searchQuery.trim().length >= 2 ? searchResults : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center py-3 text-sm text-gray-500">
            <Link to="/" className="hover:text-orange-500">
              Home
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <Link to={`/brands/${brandSlug}`} className="hover:text-orange-500">
              {outlet?.brand.name}
            </Link>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-gray-900">{outlet?.name}</span>
          </div>

          {/* Outlet Info */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={outlet?.brand.logo}
                alt={outlet?.brand.name}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f97316"/><text x="50" y="50" font-size="40" fill="white" text-anchor="middle" dy="0.35em">${outlet?.brand.name.charAt(0) || "R"}</text></svg>`;
                }}
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {outlet?.name}
                </h1>
                <p className="text-gray-600 text-sm">{outlet?.address}</p>
              </div>
            </div>

            {/* Cart Button */}
            {getTotalItems() > 0 && (
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <ShoppingCart size={20} />
                  <span>{getTotalItems()} items</span>
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {getTotalItems()}
                  </div>
                </motion.div>
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="pb-4 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search for dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                </div>
              )}
            </div>

            {/* Category Filters */}
            {!searchQuery && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => handleCategoryFilter("")}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === ""
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryFilter(category.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category.name
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Category Navigation Sidebar */}
          {!searchQuery && categories.length > 0 && (
            <div className="hidden lg:block w-64 sticky top-32 h-fit">
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <nav className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => scrollToCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeCategory === category.id
                          ? "bg-orange-100 text-orange-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {category.name} ({category.items.length})
                    </button>
                  ))}
                </nav>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Results */}
            {searchQuery.trim().length >= 2 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  Search Results for "{searchQuery}" ({displayedResults.length})
                </h2>
                {displayedResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items found matching your search.
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {displayedResults.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={handleAddToCart}
                        onQuantityChange={handleQuantityChange}
                        quantity={getItemQuantity(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Menu Categories */}
            {!searchQuery &&
              displayedCategories.map((category) => (
                <div
                  key={category.id}
                  id={`category-${category.id}`}
                  className="mb-8"
                >
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {category.name}
                    </h2>
                    <p className="text-gray-600">
                      {category.items.length} items
                    </p>
                  </div>
                  <div className="grid gap-4">
                    {category.items.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToCart={handleAddToCart}
                        onQuantityChange={handleQuantityChange}
                        quantity={getItemQuantity(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}

            {!searchQuery && categories.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p>No menu items available at this outlet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Menu Item Card Component
interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onQuantityChange: (itemId: string, change: number) => void;
  quantity: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onAddToCart,
  onQuantityChange,
  quantity,
}) => {
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Item Image */}
        <div className="w-24 h-24 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f3f4f6"/><text x="50" y="50" font-size="12" fill="%236b7280" text-anchor="middle" dy="0.35em">No Image</text></svg>`;
            }}
          />
        </div>

        {/* Item Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {item.isVeg && <Leaf className="w-4 h-4 text-green-500" />}
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
              </div>

              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-lg">₹{item.price}</span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </div>

                {item.rating && item.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {Number(item.rating).toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              {item.tags && item.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Add to Cart Controls */}
            <div className="ml-4">
              {quantity === 0 ? (
                <Button
                  onClick={() => onAddToCart(item)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2"
                  disabled={!item.isAvailable}
                >
                  {item.isAvailable ? "Add" : "Unavailable"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-orange-500 text-white rounded-lg">
                  <button
                    onClick={() => onQuantityChange(item.id, -1)}
                    className="p-2 hover:bg-orange-600 rounded-l-lg"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => onQuantityChange(item.id, 1)}
                    className="p-2 hover:bg-orange-600 rounded-r-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
