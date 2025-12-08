import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, Clock, Star, MapPin, SortAsc } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Rating } from "../components/ui/Rating";
import { Brand } from "../types/brand";
import brandService from "../services/brandService";
import { transformApiBrandToBrand } from "../utils/apiTransformers";

export const BrandListing: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCuisine, setSelectedCuisine] = useState(searchParams.get("category") || "");
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
          cuisine_type: selectedCuisine || undefined,
        });
        let transformedBrands = response.brands.map(transformApiBrandToBrand);
        
        // Apply sorting
        switch (sortBy) {
          case "rating":
            transformedBrands.sort((a, b) => b.rating - a.rating);
            break;
          case "name":
            transformedBrands.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case "delivery_time":
            // Sort by estimated delivery time (mock data)
            transformedBrands.sort((a, b) => {
              const timeA = Math.floor(Math.random() * 20) + 25; // 25-45 min
              const timeB = Math.floor(Math.random() * 20) + 25;
              return timeA - timeB;
            });
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading restaurants...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Header - match Home */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">GlobalEats</h1>
                <p className="text-xs text-gray-500">Browse Restaurants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
              {searchTerm ? `Search Results for "${searchTerm}"` : "All Restaurants"}
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              {loading ? "Loading..." : `Discover amazing food from ${brands.length} restaurants`}
            </p>
            {searchTerm && (
              <p className="text-xs md:text-sm text-orange-600 mt-1">
                Found {brands.length} restaurants matching your search
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 md:space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-orange-50 border-orange-200" : ""}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs md:text-sm"
              >
                <option value="rating">Sort by Rating</option>
                <option value="name">Sort by Name</option>
                <option value="delivery_time">Sort by Delivery Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">All Cuisines</option>
              <option value="Pizza">Pizza</option>
              <option value="Burgers">Burgers</option>
              <option value="Indian">Indian</option>
              <option value="Chinese">Chinese</option>
              <option value="South Indian">South Indian</option>
              <option value="Desserts">Desserts</option>
              <option value="Coffee">Coffee & Tea</option>
              <option value="Healthy">Healthy Food</option>
              <option value="Bakery">Bakery</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="rating">Sort by Rating</option>
              <option value="name">Sort by Name</option>
              <option value="delivery_time">Sort by Delivery Time</option>
            </select>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Any Price</option>
                    <option>Under ₹200</option>
                    <option>₹200 - ₹500</option>
                    <option>₹500 - ₹1000</option>
                    <option>Above ₹1000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Time
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Any Time</option>
                    <option>Under 30 min</option>
                    <option>30-45 min</option>
                    <option>45+ min</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    <option>Any Rating</option>
                    <option>4.5+ Stars</option>
                    <option>4.0+ Stars</option>
                    <option>3.5+ Stars</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Restaurant Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
        >
          {brands.map((brand) => (
            <motion.div key={brand.id} variants={item}>
              <Link to={`/brands/${brand.slug || brand.id}`}>
                <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border-0">
                  <div className="relative">
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={brand.coverImage || "/api/placeholder/400/200"}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                    </div>
                    
                    {/* Offers Badge */}
                    {brand.offers.length > 0 && (
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="error"
                          className="text-white bg-red-500 shadow-lg"
                        >
                          {brand.offers[0].title}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge variant="success" className="bg-green-500 text-white shadow-lg">
                        Open
                      </Badge>
                    </div>
                    
                    {/* Logo */}
                    <div className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-lg">
                      <img
                        src={brand.logo || "/api/placeholder/60/60"}
                        alt={brand.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {brand.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Rating rating={brand.rating} size="sm" />
                        <span className="text-sm text-gray-500 ml-1">
                          ({brand.totalReviews})
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3 md:mb-4 line-clamp-2 text-sm md:text-base">
                      {brand.description || brand.cuisines.join(" • ")}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3 md:space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-orange-500" />
                          <span className="font-medium">25-35 mins</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span>₹{brand.outlets[0]?.deliveryFee || 25} delivery</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {brand.cuisines.slice(0, 2).map((cuisine) => (
                          <Badge key={cuisine} variant="info" size="sm">
                            {cuisine}
                          </Badge>
                        ))}
                        {brand.cuisines.length > 2 && (
                          <Badge variant="info" size="sm">
                            +{brand.cuisines.length - 2}
                          </Badge>
                        )}
                      </div>
                      <div className="text-orange-600 font-semibold text-xs md:text-sm group-hover:text-orange-700">
                        Order Now →
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
