import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Star, Clock, ArrowRight } from "lucide-react";
import { Brand } from "../../../types/brand";
import brandService from "../../../services/brandService";
import LocationContext from "../../../contexts/LocationContext";
import { transformApiBrandToBrand } from "../../../utils/apiTransformers";

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
}

export const FeaturedBrands: React.FC = () => {
  const [featuredBrands, setFeaturedBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locationContext = useContext(LocationContext);

  useEffect(() => {
    const fetchFeaturedBrands = async () => {
      try {
        setLoading(true);

        if (locationContext?.selectedOutlet?.id) {
          try {
            const outletBrandsData = await locationContext.getOutletBrands(
              locationContext.selectedOutlet.id
            );
            if (outletBrandsData.brands && outletBrandsData.brands.length > 0) {
              const transformedBrands = outletBrandsData.brands.map(
                (apiBrand: ApiBrand) => ({
                  id: apiBrand.id,
                  name: apiBrand.name,
                  slug: apiBrand.slug || apiBrand.name.toLowerCase().replace(/ /g, "-"),
                  description: apiBrand.description || "",
                  logo: apiBrand.logo_url || "",
                  coverImage: apiBrand.banner_url || "",
                  cuisines: [apiBrand.cuisine_type || "Food"],
                  rating: parseFloat(apiBrand.average_rating || "0"),
                  totalReviews: apiBrand.total_reviews || 0,
                  isActive: true,
                  outlets: [],
                  tags: [],
                  offers: [],
                })
              );
              setFeaturedBrands(transformedBrands.slice(0, 6));
              setLoading(false);
              return;
            }
          } catch (outletError) {
            console.warn("Failed to fetch outlet brands, falling back:", outletError);
          }
        }

        const response = await brandService.getAllBrands({ featured: true, limit: 6 });
        const transformedBrands = response.brands.map(transformApiBrandToBrand);
        setFeaturedBrands(transformedBrands);
      } catch (err) {
        console.error("Error fetching brands:", err);
        const sampleBrands: Brand[] = [
          { id: "1", name: "Lunchbox - Meals & More", slug: "lunchbox-meals-more", description: "Exciting meals perfect for one", logo: "", coverImage: "", cuisines: ["Indian", "Meals"], rating: 4.5, totalReviews: 120, isActive: true, outlets: [], tags: [], offers: [{ id: "1", title: "50% off up ₹500", description: "Use code FIRSTTIME", discount: 50, minOrder: 0, validUntil: "2024-12-31", code: "FIRSTTIME", isActive: true }] },
          { id: "2", name: "Honest Bowl", slug: "honest-bowl", description: "Fresh and healthy bowls", logo: "", coverImage: "", cuisines: ["Healthy", "Bowls"], rating: 4.3, totalReviews: 89, isActive: true, outlets: [], tags: [], offers: [{ id: "2", title: "50% off up ₹500", description: "Use code FIRSTTIME", discount: 50, minOrder: 0, validUntil: "2024-12-31", code: "FIRSTTIME", isActive: true }] },
          { id: "3", name: "Oven Story Pizza", slug: "oven-story-pizza", description: "Pizza with standout toppings", logo: "", coverImage: "", cuisines: ["Pizza", "Italian"], rating: 4.7, totalReviews: 156, isActive: true, outlets: [], tags: [], offers: [{ id: "3", title: "50% off up ₹500", description: "Use code FIRSTTIME", discount: 50, minOrder: 0, validUntil: "2024-12-31", code: "FIRSTTIME", isActive: true }] },
          { id: "4", name: "Faasos", slug: "faasos", description: "Delicious wraps and rolls", logo: "", coverImage: "", cuisines: ["Wraps", "Fast Food"], rating: 4.2, totalReviews: 203, isActive: true, outlets: [], tags: [], offers: [{ id: "4", title: "50% off up ₹500", description: "Use code FIRSTTIME", discount: 50, minOrder: 0, validUntil: "2024-12-31", code: "FIRSTTIME", isActive: true }] },
          { id: "5", name: "Royal Biryani", slug: "royal-biryani", description: "Authentic biryani flavors", logo: "", coverImage: "", cuisines: ["Biryani", "Indian"], rating: 4.6, totalReviews: 178, isActive: true, outlets: [], tags: [], offers: [{ id: "5", title: "50% off up ₹500", description: "Use code FIRSTTIME", discount: 50, minOrder: 0, validUntil: "2024-12-31", code: "FIRSTTIME", isActive: true }] },
          { id: "6", name: "Burger King", slug: "burger-king", description: "Flame-grilled burgers", logo: "", coverImage: "", cuisines: ["Burgers", "American"], rating: 4.1, totalReviews: 134, isActive: true, outlets: [], tags: [], offers: [{ id: "6", title: "50% off up ₹500", description: "Use code FIRSTTIME", discount: 50, minOrder: 0, validUntil: "2024-12-31", code: "FIRSTTIME", isActive: true }] },
        ];
        setFeaturedBrands(sampleBrands);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBrands();
  }, [locationContext?.selectedOutlet?.id, locationContext]);

  if (loading) {
    return (
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <div className="aspect-[4/3] shimmer rounded-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-5 shimmer rounded-lg w-3/4" />
                  <div className="h-4 shimmer rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-red-600">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const GRADIENTS = [
    "from-orange-100 to-rose-100",
    "from-violet-100 to-purple-100",
    "from-emerald-100 to-teal-100",
    "from-amber-100 to-yellow-100",
    "from-blue-100 to-cyan-100",
    "from-pink-100 to-rose-100",
  ];

  return (
    <section className="py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {locationContext?.selectedOutlet ? "Available Brands" : "Popular Brands"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {locationContext?.selectedOutlet
                ? `Brands at ${locationContext.selectedOutlet.name}`
                : "Discover top-rated restaurants near you"}
            </p>
          </div>
          <Link to="/restaurants" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors group">
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {featuredBrands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500">No brands available at the moment</p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {featuredBrands.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                  <Link to={`/brands/${brand.slug}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all active:scale-[0.99]">
                      <div className="flex p-3 gap-3">
                        <div className={`w-20 h-20 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          {brand.logo ? (
                            <img src={brand.logo} alt={brand.name} className="w-14 h-14 rounded-lg object-cover" />
                          ) : (
                            <span className="text-3xl">{["🍛", "🥗", "🍕", "🌯", "🍗", "🍔"][i % 6]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 py-0.5">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">{brand.name}</h3>
                            <div className="flex items-center gap-0.5 bg-green-50 px-1.5 py-0.5 rounded-md flex-shrink-0">
                              <Star className="w-3 h-3 text-green-600 fill-green-600" />
                              <span className="text-xs font-semibold text-green-700">{brand.rating}</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{brand.cuisines.join(" • ")}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> 25-35 min
                            </span>
                            {brand.offers.length > 0 && (
                              <span className="text-xs text-orange-600 font-medium">
                                {brand.offers[0].title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredBrands.map((brand, i) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link to={`/brands/${brand.slug}`}>
                    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 hover:-translate-y-1">
                      {/* Image */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {brand.coverImage ? (
                          <img src={brand.coverImage} alt={brand.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center`}>
                            <span className="text-6xl">{["🍛", "🥗", "🍕", "🌯", "🍗", "🍔"][i % 6]}</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        {/* Rating badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-gray-900">{brand.rating}</span>
                        </div>

                        {/* Offer ribbon */}
                        {brand.offers.length > 0 && (
                          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
                            {brand.offers[0].title}
                          </div>
                        )}

                        {/* Logo */}
                        <div className="absolute bottom-3 right-3 w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
                          {brand.logo ? (
                            <img src={brand.logo} alt="" className="w-9 h-9 rounded-lg object-cover" />
                          ) : (
                            <span className="text-2xl">{["🍛", "🥗", "🍕", "🌯", "🍗", "🍔"][i % 6]}</span>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                          {brand.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{brand.cuisines.join(" • ")}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> 25-35 min
                          </span>
                          <span className="text-xs font-medium text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Order Now <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Mobile View All */}
            <div className="md:hidden mt-4">
              <Link to="/restaurants" className="flex items-center justify-center gap-1 text-sm font-semibold text-orange-600 py-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors">
                View All Restaurants
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
