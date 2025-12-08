import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Play,
  Home as HomeIcon,
  ShoppingBag,
  User,
  Heart
} from "lucide-react";
import { FeaturedBrands } from "../components/features/home/FeaturedBrands";
import { HeroSection } from "../components/features/home/HeroSection";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import LocationContext from "../contexts/LocationContext";

export const Home: React.FC = () => {
  const locationContext = useContext(LocationContext);
  const [searchQuery, setSearchQuery] = useState("");

  if (!locationContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const { isLocationPermissionGranted } = locationContext;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile App Header - Clean Design */}
      <div className="md:hidden bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">GlobalEats</h1>
                <p className="text-xs text-gray-500">Foodcourt on an App</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2">
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <HeroSection 
        isLocationGranted={isLocationPermissionGranted}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Featured Brands */}
      <FeaturedBrands />

      {/* Location Prompt - Only show if no location is set */}
      {!isLocationPermissionGranted && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <Card className="text-center py-12 sm:py-16 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="w-10 h-10 text-orange-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Set Your Location to Get Started
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                  Allow location access to discover amazing restaurants and food brands 
                  available in your area. We'll show you the best options nearby!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-orange-600 hover:bg-orange-700 min-h-[44px]"
                    onClick={() => locationContext.openModal()}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Set My Location
                  </Button>
                  <Link to="/restaurants">
                    <Button variant="outline" size="lg" className="min-h-[44px]">
                      Browse All Restaurants
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Card>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to Order Amazing Food?
            </h2>
            <p className="text-lg sm:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust GlobalEats for their daily meals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/restaurants">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-50 min-h-[44px]">
                  <Search className="w-5 h-5 mr-2" />
                  Start Ordering
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 min-h-[44px]">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mobile Bottom Navigation - App Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-1">
          <Link to="/" className="flex flex-col items-center py-2 px-3 text-orange-600">
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Home</span>
          </Link>
          <Link to="/restaurants" className="flex flex-col items-center py-2 px-3 text-gray-400">
            <Search className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Search</span>
          </Link>
          <Link to="/orders" className="flex flex-col items-center py-2 px-3 text-gray-400">
            <ShoppingBag className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Orders</span>
          </Link>
          <Link to="/favorites" className="flex flex-col items-center py-2 px-3 text-gray-400">
            <Heart className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Favorites</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center py-2 px-3 text-gray-400">
            <User className="w-6 h-6" />
            <span className="text-xs font-medium mt-1">Profile</span>
          </Link>
        </div>
      </div>

      {/* Add bottom padding for mobile navigation */}
      <div className="md:hidden h-16"></div>
    </div>
  );
};
