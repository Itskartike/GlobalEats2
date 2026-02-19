import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Clock, Star, MapPin, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Brand } from "../types/brand";
import brandService from "../services/brandService";
import { transformApiBrandToBrand } from "../utils/apiTransformers";

const CUISINES = ["All", "Pizza", "Burgers", "Indian", "Chinese", "South Indian", "Desserts", "Coffee & Tea", "Healthy", "Bakery"];
const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "A-Z" },
  { value: "delivery_time", label: "Fastest" },
];

const GRADIENTS = [
  "from-orange-100 to-rose-100",
  "from-violet-100 to-purple-100",
  "from-emerald-100 to-teal-100",
  "from-amber-100 to-yellow-100",
  "from-blue-100 to-cyan-100",
  "from-pink-100 to-rose-100",
];

export const BrandListing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get("category") || "All");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await brandService.getAllBrands({
          page: 1,
          limit: 50,
          search: searchTerm || undefined,
          cuisine_type: selectedCuisine === "All" ? undefined : selectedCuisine,
        });
        let transformedBrands = response.brands.map(transformApiBrandToBrand);
        
        switch (sortBy) {
          case "rating":
            transformedBrands.sort((a, b) => b.rating - a.rating);
            break;
          case "name":
            transformedBrands.sort((a, b) => a.name.localeCompare(b.name));
            break;
          default:
            break;
        }
        
        setBrands(transformedBrands);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError("Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [searchTerm, selectedCuisine, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Skeleton header */}
          <div className="mb-8 space-y-3">
            <div className="h-8 shimmer rounded-xl w-60" />
            <div className="h-5 shimmer rounded-lg w-80" />
          </div>
          {/* Skeleton search */}
          <div className="h-12 shimmer rounded-2xl w-full mb-6" />
          {/* Skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[16/10] shimmer rounded-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-5 shimmer rounded-lg w-3/4" />
                  <div className="h-4 shimmer rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">Something went wrong</p>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-rose-600 transition-all shadow-lg shadow-orange-200/50"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {searchTerm ? (
              <>Results for "<span className="gradient-text">{searchTerm}</span>"</>
            ) : (
              "All Restaurants"
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {brands.length} restaurants available
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-5">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder="Search restaurants, cuisines, or dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 text-sm shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Cuisine Pills + Sort */}
        <div className="flex items-center gap-3 mb-6 overflow-x-auto scrollbar-hide pb-1">
          <div className="flex gap-2 flex-shrink-0">
            {CUISINES.map((cuisine) => (
              <button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCuisine === cuisine
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-200/50"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
                }`}
              >
                {cuisine}
              </button>
            ))}
          </div>
          <div className="ml-auto flex-shrink-0 hidden sm:block">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Restaurant Grid */}
        {brands.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-900 font-semibold text-lg mb-2">No restaurants found</p>
            <p className="text-gray-500 text-sm mb-6">Try adjusting your search or filters</p>
            <button onClick={() => { setSearchTerm(""); setSelectedCuisine("All"); }}
              className="text-orange-600 font-medium text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
          >
            {brands.map((brand, i) => (
              <motion.div
                key={brand.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0 },
                }}
              >
                <Link to={`/brands/${brand.slug || brand.id}`}>
                  <div className="group glass rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {brand.coverImage ? (
                        <img
                          src={brand.coverImage}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                          <span className="text-6xl">{["🍛", "🥗", "🍕", "🌯", "🍗", "🍔"][i % 6]}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      
                      {/* Rating */}
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-gray-900">{brand.rating}</span>
                        <span className="text-[10px] text-gray-500">({brand.totalReviews})</span>
                      </div>

                      {/* Offer */}
                      {brand.offers.length > 0 && (
                        <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
                          {brand.offers[0].title}
                        </div>
                      )}

                      {/* Logo */}
                      <div className="absolute bottom-3 right-3 w-11 h-11 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
                        {brand.logo ? (
                          <img src={brand.logo} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <span className="text-xl">{["🍛", "🥗", "🍕", "🌯", "🍗", "🍔"][i % 6]}</span>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {brand.description || brand.cuisines.join(" • ")}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 25-35 min
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> ₹{brand.outlets[0]?.deliveryFee || 25}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Order →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
