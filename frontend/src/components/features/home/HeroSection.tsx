import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronDown, Clock, Star, Truck, Shield } from "lucide-react";
import { Button } from "../../ui/Button";

interface HeroSectionProps {
  isLocationGranted: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-red-50 py-4 md:py-8 lg:py-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Mobile App-Style Layout */}
        <div className="md:hidden">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            {/* Location Bar */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Deliver to</p>
                    <p className="text-xs text-gray-500">Current Location</p>
                  </div>
                </div>
                <button className="text-orange-600">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm"
                />
              </div>
            </div>

            {/* Quick Categories */}
            <div className="px-4">
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
                {['Pizza', 'Burger', 'Chinese', 'Indian', 'Fast Food'].map((category) => (
                  <button
                    key={category}
                    className="flex-shrink-0 bg-white px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:border-orange-500 hover:text-orange-600 transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              >
                Delicious Food
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                  Delivered Fast
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-base sm:text-lg text-gray-600 leading-relaxed"
              >
                Order from your favorite restaurants and cloud kitchens. 
                Fast delivery, fresh food, and amazing deals await you!
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, cuisines, or dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-lg"
                  />
                </div>
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700 px-6 py-3 text-base sm:text-lg min-h-[44px]"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                >
                  Search
                </Button>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-2"
            >
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-orange-600">25-30</div>
                <div className="text-xs sm:text-sm text-gray-600">Minutes</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-orange-600">4.8</div>
                <div className="text-xs sm:text-sm text-gray-600">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-orange-600">50+</div>
                <div className="text-xs sm:text-sm text-gray-600">Restaurants</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/restaurants">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 px-6 py-3 text-base sm:text-lg min-h-[44px]">
                  <Search className="w-5 h-5 mr-2" />
                  Order Now
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-6 py-3 text-base sm:text-lg min-h-[44px]">
                <MapPin className="w-5 h-5 mr-2" />
                Set Location
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image Placeholder */}
              <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Truck className="w-12 h-12 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Fast Delivery</h3>
                    <p className="text-gray-600">Fresh food at your doorstep</p>
                  </div>
                </div>
              </div>

              {/* Floating Cards - Hidden on mobile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="hidden sm:block absolute -top-3 -left-3 bg-white rounded-xl shadow-lg p-3 border border-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Safe Delivery</div>
                    <div className="text-xs text-gray-600">Contactless</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                className="hidden sm:block absolute -bottom-3 -right-3 bg-white rounded-xl shadow-lg p-3 border border-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">Quick Service</div>
                    <div className="text-xs text-gray-600">25-30 min</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                className="hidden sm:block absolute top-1/2 -right-6 bg-white rounded-xl shadow-lg p-3 border border-gray-100"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">4.8 Rating</div>
                    <div className="text-xs text-gray-600">500+ reviews</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};