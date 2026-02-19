import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Search, ShoppingCart, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Badge } from "../../ui/Badge";
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
  const [filteredCategories, setFilteredCategories] = useState<MenuCategory[]>(
    []
  );

  const { addItem, getTotalItems } = useCartStore();

  const fetchBrandMenu = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch both menu and brand details with outlets
      const [menuData, brandDetails] = await Promise.all([
        brandService.getBrandMenu(brandSlug!),
        brandService.getBrandBySlug(brandSlug!),
      ]);

      if (menuData) {
        setBrand(menuData.brand as unknown as BrandInfo);
        setCategories(menuData.categories as unknown as MenuCategory[]);

        // Transform and store brand details with outlets
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
    if (brandSlug) {
      fetchBrandMenu();
    }
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

  const handleAddToCart = (item: MenuItem) => {
    if (!brand) {
      toast.error("Brand information not available");
      return;
    }

    if (!fullBrandDetails) {
      toast.error("Brand details not loaded yet");
      return;
    }

    // Use the first outlet from the brand for cart operations
    const firstOutlet = fullBrandDetails.outlets?.[0];

    if (!firstOutlet) {
      toast.error("No outlets available for this brand");
      return;
    }

    if (!firstOutlet.id) {
      toast.error("Invalid outlet data");
      return;
    }

    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      outletId: firstOutlet.id,
      outletName: firstOutlet.name,
      brandName: brand.name,
      isVeg: item.isVeg,
    };

    const outletInfo = {
      brandId: brand.id,
      brandName: brand.name,
      outletId: firstOutlet.id,
      outletName: firstOutlet.name,
      outletAddress: `${firstOutlet.address.street}, ${firstOutlet.address.area}`,
      deliveryFee: firstOutlet.deliveryFee || 0,
    };

    addItem(cartItem, outletInfo);

    toast.success(`${item.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="ml-4 text-gray-600">Loading menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || "Brand not found"}
            </h1>
            <Link to="/" className="text-orange-500 hover:text-orange-600">
              Go back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f97316"/><text x="50" y="50" font-size="40" fill="white" text-anchor="middle" dy="0.35em">${brand.name.charAt(0)}</text></svg>`;
                    }}
                  />
                  <div>
                    <h1 className="text-lg md:text-xl font-bold text-gray-900">
                      {brand.name}
                    </h1>
                    <p className="text-xs md:text-sm text-gray-600">{brand.cuisineType}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3 md:space-x-4">
                <Link to={`/brands/${brand.slug}/details`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              <div className="relative w-40 sm:w-56 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
                <Link to="/cart" className="relative">
                  <Button variant="outline" size="sm">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {getTotalItems()}
                      </span>
                    )}
                  </Button>
                </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery
                ? "No items found matching your search"
                : "No menu items available"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 pb-2 border-b border-gray-200">
                  {category.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAddToCart={() => handleAddToCart(item)}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToCart }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" font-size="60" fill="%236b7280" text-anchor="middle" dy="0.35em">🍽️</text></svg>`;
          }}
        />
        <div className="absolute top-2 left-2">
          {item.isVeg && (
            <Badge variant="success" size="sm">
              Veg
            </Badge>
          )}
          {item.isVegan && (
            <Badge variant="success" size="sm" className="ml-1">
              Vegan
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="text-xs text-gray-600">
              {item.preparationTime}m
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {item.name}
          </h3>
          <div className="flex items-center space-x-1">
            {Array.from({ length: item.spiceLevel }).map((_, i) => (
              <Zap key={i} className="w-3 h-3 text-red-500 fill-current" />
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {item.description}
        </p>

        <div className="flex justify-between items-center mb-3">
          <div className="text-lg font-bold text-gray-900">₹{item.price}</div>
          {item.calories && (
            <span className="text-xs text-gray-500">{item.calories} cal</span>
          )}
        </div>

        <Button
          onClick={onAddToCart}
          className="w-full"
          disabled={!item.isAvailable}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {item.isAvailable ? "Add to Cart" : "Not Available"}
        </Button>
      </div>
    </Card>
  );
};

export default BrandMenu;
