import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Rating } from "../../ui/Rating";
import { Brand } from "../../../types/brand";
import brandService from "../../../services/brandService";
import LocationContext from "../../../contexts/LocationContext";
import { transformApiBrandToBrand } from "../../../utils/apiTransformers";

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
        console.log("Fetching featured brands...");

        // If we have a selected outlet, fetch brands from that outlet
        if (locationContext?.selectedOutlet?.id) {
          try {
            console.log("Fetching outlet brands for:", locationContext.selectedOutlet.id);
            const outletBrandsData = await locationContext.getOutletBrands(
              locationContext.selectedOutlet.id
            );
            if (outletBrandsData.brands && outletBrandsData.brands.length > 0) {
              console.log("Found outlet brands:", outletBrandsData.brands.length);
              // Convert API brands to local Brand format
              const transformedBrands = outletBrandsData.brands.map(
                (apiBrand: ApiBrand) => ({
                  id: apiBrand.id,
                  name: apiBrand.name,
                  slug:
                    apiBrand.slug ||
                    apiBrand.name.toLowerCase().replace(/ /g, "-"),
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
              setFeaturedBrands(transformedBrands.slice(0, 6)); // Show max 6 brands
              setLoading(false);
              return;
            }
          } catch (outletError) {
            console.warn(
              "Failed to fetch outlet brands, falling back to featured brands:",
              outletError
            );
          }
        }

        // Fallback to general featured brands
        console.log("Fetching general featured brands...");
        const response = await brandService.getAllBrands({
          featured: true,
          limit: 6,
        });
        console.log("API response:", response);
        const transformedBrands = response.brands.map(transformApiBrandToBrand);
        setFeaturedBrands(transformedBrands);
      } catch (err) {
        console.error("Error fetching brands:", err);
        console.log("Using sample data as fallback");
        
        // Fallback to sample data if API fails
        const sampleBrands: Brand[] = [
          {
            id: "1",
            name: "Lunchbox - Meals & More",
            slug: "lunchbox-meals-more",
            description: "Exciting meals perfect for one",
            logo: "",
            coverImage: "",
            cuisines: ["Indian", "Meals"],
            rating: 4.5,
            totalReviews: 120,
            isActive: true,
            outlets: [],
            tags: [],
            offers: [{
              id: "1",
              title: "50% off up ₹500",
              description: "Use code FIRSTTIME",
              discount: 50,
              minOrder: 0,
              validUntil: "2024-12-31",
              code: "FIRSTTIME",
              isActive: true
            }],
          },
          {
            id: "2",
            name: "Honest Bowl",
            slug: "honest-bowl",
            description: "Fresh and healthy bowls",
            logo: "",
            coverImage: "",
            cuisines: ["Healthy", "Bowls"],
            rating: 4.3,
            totalReviews: 89,
            isActive: true,
            outlets: [],
            tags: [],
            offers: [{
              id: "2",
              title: "50% off up ₹500",
              description: "Use code FIRSTTIME",
              discount: 50,
              minOrder: 0,
              validUntil: "2024-12-31",
              code: "FIRSTTIME",
              isActive: true
            }],
          },
          {
            id: "3",
            name: "Oven Story Pizza",
            slug: "oven-story-pizza",
            description: "Pizza with standout toppings",
            logo: "",
            coverImage: "",
            cuisines: ["Pizza", "Italian"],
            rating: 4.7,
            totalReviews: 156,
            isActive: true,
            outlets: [],
            tags: [],
            offers: [{
              id: "3",
              title: "50% off up ₹500",
              description: "Use code FIRSTTIME",
              discount: 50,
              minOrder: 0,
              validUntil: "2024-12-31",
              code: "FIRSTTIME",
              isActive: true
            }],
          },
          {
            id: "4",
            name: "Faasos",
            slug: "faasos",
            description: "Delicious wraps and rolls",
            logo: "",
            coverImage: "",
            cuisines: ["Wraps", "Fast Food"],
            rating: 4.2,
            totalReviews: 203,
            isActive: true,
            outlets: [],
            tags: [],
            offers: [{
              id: "4",
              title: "50% off up ₹500",
              description: "Use code FIRSTTIME",
              discount: 50,
              minOrder: 0,
              validUntil: "2024-12-31",
              code: "FIRSTTIME",
              isActive: true
            }],
          },
          {
            id: "5",
            name: "Royal Biryani",
            slug: "royal-biryani",
            description: "Authentic biryani flavors",
            logo: "",
            coverImage: "",
            cuisines: ["Biryani", "Indian"],
            rating: 4.6,
            totalReviews: 178,
            isActive: true,
            outlets: [],
            tags: [],
            offers: [{
              id: "5",
              title: "50% off up ₹500",
              description: "Use code FIRSTTIME",
              discount: 50,
              minOrder: 0,
              validUntil: "2024-12-31",
              code: "FIRSTTIME",
              isActive: true
            }],
          },
          {
            id: "6",
            name: "Burger King",
            slug: "burger-king",
            description: "Flame-grilled burgers",
            logo: "",
            coverImage: "",
            cuisines: ["Burgers", "American"],
            rating: 4.1,
            totalReviews: 134,
            isActive: true,
            outlets: [],
            tags: [],
            offers: [{
              id: "6",
              title: "50% off up ₹500",
              description: "Use code FIRSTTIME",
              discount: 50,
              minOrder: 0,
              validUntil: "2024-12-31",
              code: "FIRSTTIME",
              isActive: true
            }],
          },
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
      <section className="py-6 sm:py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured brands...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 min-h-[44px]"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  console.log("FeaturedBrands render - loading:", loading, "brands:", featuredBrands.length, "error:", error);

  return (
    <section className="py-4 md:py-6 lg:py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
              {locationContext?.selectedOutlet
                ? "Available Brands"
                : "Popular Brands"}
            </h2>
            <p className="text-xs md:text-sm text-gray-600">
              {locationContext?.selectedOutlet
                ? `Brands available at ${locationContext.selectedOutlet.name}`
                : "Discover top-rated restaurants and cloud kitchens"}
            </p>
            {/* Debug info */}
            <p className="text-xs text-gray-400 mt-1">
              Debug: {featuredBrands.length} brands loaded
            </p>
          </div>
          <Link
            to="/restaurants"
            className="flex items-center text-orange-600 hover:text-orange-700 font-medium"
          >
            View All
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {featuredBrands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No brands available at the moment</p>
          </div>
        ) : (
          <>
            {/* Mobile App-Style Cards */}
            <div className="md:hidden space-y-3">
              {featuredBrands.map((brand) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Link to={`/brands/${brand.slug}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-all duration-300 bg-white">
                      <div className="flex p-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <img
                            src={brand.logo || "/api/placeholder/60/60"}
                            alt={`${brand.name} logo`}
                            className="w-10 h-10 rounded-lg"
                          />
                        </div>
                        <div className="flex-1 ml-3">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-bold text-base text-gray-900">
                              {brand.name}
                            </h3>
                            <div className="flex items-center">
                              <Rating rating={brand.rating} size="sm" />
                              <span className="ml-1 text-xs text-gray-500">
                                ({brand.totalReviews})
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                            {brand.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-wrap gap-1">
                              {brand.cuisines.slice(0, 2).map((cuisine) => (
                                <Badge key={cuisine} variant="info" size="sm">
                                  {cuisine}
                                </Badge>
                              ))}
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-medium text-green-600">
                                30-40 min
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden md:block relative">
              <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4">
              {featuredBrands.map((brand) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex-shrink-0 w-72 sm:w-80"
                >
                  <Link to={`/brands/${brand.slug}`}>
                    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={brand.coverImage || "/api/placeholder/400/200"}
                          alt={brand.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300" />
                        <div className="absolute top-4 left-4">
                          <img
                            src={brand.logo || "/api/placeholder/60/60"}
                            alt={`${brand.name} logo`}
                            className="w-12 h-12 rounded-lg bg-white p-1 shadow-sm"
                          />
                        </div>
                        {brand.isActive && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="success" size="sm">
                              Open
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-orange-600 transition-colors">
                            {brand.name}
                          </h3>
                          <div className="flex items-center">
                            <Rating rating={brand.rating} size="sm" />
                            <span className="ml-1 text-sm text-gray-500">
                              ({brand.totalReviews})
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {brand.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {brand.cuisines.slice(0, 3).map((cuisine) => (
                            <Badge key={cuisine} variant="info" size="sm">
                              {cuisine}
                            </Badge>
                          ))}
                          {brand.cuisines.length > 3 && (
                            <Badge variant="info" size="sm">
                              +{brand.cuisines.length - 3}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-end text-sm text-gray-500">
                          <span className="text-green-600 font-medium">
                            30-40 min
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          </>
        )}
      </div>
    </section>
  );
};
