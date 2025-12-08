import React, { useContext, useEffect, useState } from "react";
import { MapPin, Clock, Truck, ChevronDown } from "lucide-react";
import LocationContext from "../../contexts/LocationContext";

// API Brand type (different from our local Brand type)
interface ApiBrand {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  cuisine_type?: string;
  average_rating?: string;
  total_reviews?: number;
  is_featured?: boolean;
  minimum_order_amount?: string;
  delivery_fee?: string;
  estimated_delivery_time?: number;
}

interface OutletHeaderProps {
  className?: string;
}

const OutletHeader: React.FC<OutletHeaderProps> = ({ className = "" }) => {
  const locationContext = useContext(LocationContext);
  const [outletBrands, setOutletBrands] = useState<ApiBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchBrands = async () => {
      if (!locationContext?.selectedOutlet?.id) return;

      try {
        setIsLoading(true);
        const brandsData = await locationContext.getOutletBrands(
          locationContext.selectedOutlet.id
        );
        setOutletBrands(brandsData.brands || []);
      } catch (error) {
        console.error("Error fetching outlet brands:", error);
        setOutletBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [locationContext]);

  if (!locationContext) {
    return null;
  }

  const { selectedOutlet, isLocationPermissionGranted } = locationContext;

  // Get unique categories from brands
  const categories = [
    "All",
    ...new Set(outletBrands.map((brand) => brand.cuisine_type || "Food")),
  ];

  // Filter brands by selected category
  const filteredBrands =
    selectedCategory === "All"
      ? outletBrands
      : outletBrands.filter(
          (brand) => (brand.cuisine_type || "Food") === selectedCategory
        );

  // Extract area name from outlet name (e.g., "Pizza Hut - Koramangala" -> "Koramangala")
  const getAreaName = (outletName: string) => {
    const parts = outletName.split(" - ");
    return parts.length > 1 ? parts[parts.length - 1] : outletName;
  };

  // Show loading state or prompt to select location
  if (!isLocationPermissionGranted || !selectedOutlet) {
    return (
      <div className={`bg-white shadow-sm border-b ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center text-gray-500">
            <MapPin className="w-5 h-5 mr-2" />
            <span>Please select your location to see available outlets</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-sm border-b ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Main outlet info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {/* Area name prominently displayed */}
            <div className="flex items-center mb-1">
              <h1 className="text-2xl font-bold text-gray-900 mr-2">
                {getAreaName(selectedOutlet.name)}
              </h1>
              <ChevronDown className="w-5 h-5 text-gray-500" />
            </div>

            {/* Full outlet name as subtitle */}
            <p className="text-sm text-gray-600 mb-2">{selectedOutlet.name}</p>

            {/* Outlet details */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{selectedOutlet.address}</span>
              </div>

              {selectedOutlet.distance && (
                <div className="flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  <span>{selectedOutlet.distance.toFixed(1)} km away</span>
                </div>
              )}

              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>Delivery available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available brands section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <span className="ml-3 text-gray-600">Loading brands...</span>
          </div>
        ) : outletBrands.length > 0 ? (
          <div>
            {/* Quick stats and category filters */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Brands ({filteredBrands.length})
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  25-40 min
                </span>
                <span className="flex items-center">
                  <Truck className="w-4 h-4 mr-1" />
                  Free delivery on orders above ₹199
                </span>
              </div>
            </div>

            {/* Category filters */}
            {categories.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Promotional offers banner */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 mb-6 border border-red-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-500 text-white rounded-full p-2 mr-3">
                    <span className="text-sm font-bold">%</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Special Offers Available!
                    </h4>
                    <p className="text-sm text-gray-600">
                      Get up to 50% off on your first order from selected brands
                    </p>
                  </div>
                </div>
                <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                  View All Offers
                </button>
              </div>
            </div>

            {/* Brand grid - Enhanced EatSure-style layout */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-red-200"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl mb-3 overflow-hidden relative">
                    {brand.logo_url ? (
                      <img
                        src={brand.logo_url}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
                        <span className="text-red-600 text-xl font-bold">
                          {brand.name?.[0]}
                        </span>
                      </div>
                    )}

                    {/* Featured badge */}
                    {brand.is_featured && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Featured
                      </div>
                    )}

                    {/* Delivery time */}
                    {brand.estimated_delivery_time && (
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-md">
                        {brand.estimated_delivery_time} min
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-semibold text-gray-900 truncate text-sm">
                      {brand.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {brand.cuisine_type || "Food"}
                    </p>

                    <div className="flex items-center justify-between">
                      {brand.average_rating && (
                        <div className="flex items-center">
                          <span className="text-xs text-yellow-600">★</span>
                          <span className="text-xs text-gray-700 ml-1 font-medium">
                            {parseFloat(brand.average_rating).toFixed(1)}
                          </span>
                          {brand.total_reviews && (
                            <span className="text-xs text-gray-400 ml-1">
                              (
                              {brand.total_reviews > 1000
                                ? `${(brand.total_reviews / 1000).toFixed(1)}k`
                                : brand.total_reviews}
                              )
                            </span>
                          )}
                        </div>
                      )}

                      {brand.minimum_order_amount &&
                        parseFloat(brand.minimum_order_amount) > 0 && (
                          <span className="text-xs text-gray-500">
                            ₹{parseFloat(brand.minimum_order_amount)} min
                          </span>
                        )}
                    </div>

                    {/* Delivery fee */}
                    {brand.delivery_fee && (
                      <div className="text-xs text-green-600 font-medium">
                        {parseFloat(brand.delivery_fee) === 0
                          ? "Free Delivery"
                          : `₹${parseFloat(brand.delivery_fee)} delivery`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No brands available at this outlet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutletHeader;
