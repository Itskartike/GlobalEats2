import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, ShoppingCart, Clock, Zap, Plus, Star, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../ui/Button";
import { useCartStore } from "../../../store/cartStore";
import brandService from "../../../services/brandService";
import { transformApiBrandToBrand } from "../../../utils/apiTransformers";
import { Brand } from "../../../types/brand";
import toast from "react-hot-toast";

interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  cuisineType: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: number;
  calories: number;
  preparationTime: number;
  isAvailable: boolean;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export const BrandMenu: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [brand, setBrand] = useState<BrandInfo | null>(null);
  const [fullBrandDetails, setFullBrandDetails] = useState<Brand | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const { addItem, getTotalItems, getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  const fetchBrandMenu = useCallback(async () => {
    try {
      setLoading(true);
      const [menuData, brandDetails] = await Promise.all([
        brandService.getBrandMenu(brandSlug!),
        brandService.getBrandBySlug(brandSlug!),
      ]);

      if (menuData) {
        setBrand(menuData.brand as unknown as BrandInfo);
        setCategories(menuData.categories as unknown as MenuCategory[]);
        const transformedBrand = transformApiBrandToBrand(brandDetails);
        setFullBrandDetails(transformedBrand);
        setError(null);
      }
    } catch (err) {
      console.error("Error fetching brand menu:", err);
      setError("Failed to load menu");
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [brandSlug]);

  useEffect(() => {
    if (brandSlug) fetchBrandMenu();
  }, [brandSlug, fetchBrandMenu]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = categories
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((category) => category.items.length > 0);
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchQuery, categories]);

  useEffect(() => {
    if (filteredCategories.length > 0 && !activeCategory) {
      setActiveCategory(filteredCategories[0].name);
    }
  }, [filteredCategories, activeCategory]);

  const scrollToCategory = (categoryName: string) => {
    setActiveCategory(categoryName);
    const el = categoryRefs.current[categoryName];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!brand || !fullBrandDetails) {
      toast.error("Brand information not available");
      return;
    }
    const firstOutlet = fullBrandDetails.outlets?.[0];
    if (!firstOutlet?.id) {
      toast.error("No outlets available for this brand");
      return;
    }

    addItem(
      {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        outletId: firstOutlet.id,
        outletName: firstOutlet.name,
        brandName: brand.name,
        isVeg: item.isVeg,
      },
      {
        brandId: brand.id,
        brandName: brand.name,
        outletId: firstOutlet.id,
        outletName: firstOutlet.name,
        outletAddress: `${firstOutlet.address.street}, ${firstOutlet.address.area}`,
        deliveryFee: firstOutlet.deliveryFee || 0,
      }
    );
    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Skeleton header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 shimmer rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 shimmer rounded-lg w-48" />
              <div className="h-4 shimmer rounded-lg w-32" />
            </div>
          </div>
          {/* Skeleton menu */}
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl">
                <div className="flex-1 space-y-2">
                  <div className="h-5 shimmer rounded-lg w-3/4" />
                  <div className="h-4 shimmer rounded-lg w-full" />
                  <div className="h-5 shimmer rounded-lg w-16" />
                </div>
                <div className="w-28 h-28 shimmer rounded-2xl flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">😕</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">{error || "Brand not found"}</h1>
          <Link to="/" className="text-orange-600 hover:underline font-medium text-sm">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Brand Hero */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-rose-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-5 md:py-6">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/restaurants" className="p-2 rounded-xl hover:bg-white/80 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg flex-shrink-0 bg-white">
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f97316"/><text x="50" y="50" font-size="40" fill="white" text-anchor="middle" dy="0.35em">${brand.name.charAt(0)}</text></svg>`;
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">{brand.name}</h1>
              <p className="text-sm text-gray-500">{brand.cuisineType}</p>
              <div className="flex items-center gap-3 mt-2">
                {fullBrandDetails && (
                  <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 text-green-600 fill-green-600" />
                    <span className="text-xs font-semibold text-green-700">{fullBrandDetails.rating}</span>
                  </div>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 25-35 min
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs - Sticky */}
      {filteredCategories.length > 1 && (
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => scrollToCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.name
                      ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200/50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  {cat.name}
                  <span className="ml-1.5 text-xs opacity-70">({cat.items.length})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search + Menu Content */}
      <div className="max-w-7xl mx-auto px-4 py-5">
        {/* Search */}
        <div className="mb-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search this menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 text-sm shadow-sm transition-all"
            />
          </div>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-900 font-semibold mb-1">No items found</p>
            <p className="text-sm text-gray-500">
              {searchQuery ? "Try a different search term" : "No menu items available"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div
                key={category.name}
                ref={(el) => { categoryRefs.current[category.name] = el; }}
                className="scroll-mt-20"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  {category.name}
                  <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {category.items.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {category.items.map((item, idx) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      index={idx}
                      onAddToCart={() => handleAddToCart(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartItemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 z-30 p-4 md:px-8"
        >
          <Link to="/cart">
            <div className="max-w-lg mx-auto bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl shadow-2xl shadow-orange-500/30 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{cartItemCount} {cartItemCount === 1 ? "item" : "items"} in cart</p>
                  <p className="text-xs text-orange-100">from {brand.name}</p>
                </div>
              </div>
              <span className="font-semibold text-sm">View Cart →</span>
            </div>
          </Link>
        </motion.div>
      )}
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  index: number;
  onAddToCart: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, index, onAddToCart }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={`glass rounded-2xl overflow-hidden hover:shadow-lg transition-all ${
        !item.isAvailable ? "opacity-50 grayscale" : ""
      }`}
    >
      <div className="flex p-4 gap-4">
        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            {/* Veg/Non-veg indicator */}
            <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${
              item.isVeg ? "border-green-600" : "border-red-600"
            }`}>
              <div className={`w-2 h-2 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
            </div>
            {item.isVegan && (
              <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                VEGAN
              </span>
            )}
            {item.spiceLevel > 2 && (
              <span className="flex items-center gap-0.5">
                {Array.from({ length: Math.min(item.spiceLevel, 3) }).map((_, i) => (
                  <Flame key={i} className="w-3 h-3 text-red-500 fill-red-500" />
                ))}
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-sm md:text-base">{item.name}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{item.description}</p>

          <div className="flex items-center gap-3 mt-3">
            <span className="text-base font-bold text-gray-900">₹{item.price}</span>
            {item.calories > 0 && (
              <span className="text-[10px] text-gray-400">{item.calories} cal</span>
            )}
            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
              <Clock className="w-3 h-3" /> {item.preparationTime}m
            </span>
          </div>
        </div>

        {/* Image + Add Button */}
        <div className="relative flex-shrink-0">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-gray-100">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f5f5f4"/><text x="100" y="100" font-size="60" fill="%239ca3af" text-anchor="middle" dy="0.35em">🍽️</text></svg>`;
              }}
            />
          </div>
          <button
            onClick={(e) => { e.preventDefault(); onAddToCart(); }}
            disabled={!item.isAvailable}
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-xl text-xs font-bold shadow-lg transition-all ${
              item.isAvailable
                ? "bg-white text-orange-600 border-2 border-orange-500 hover:bg-orange-500 hover:text-white active:scale-95"
                : "bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
            }`}
          >
            {item.isAvailable ? (
              <span className="flex items-center gap-1">ADD <Plus className="w-3 h-3" /></span>
            ) : (
              "N/A"
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BrandMenu;
