import React from "react";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronDown, Clock, Star, Truck, Shield, Zap } from "lucide-react";
import { Button } from "../../ui/Button";

interface HeroSectionProps {
  isLocationGranted: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CUISINES = ["🍕 Pizza", "🍔 Burgers", "🍛 Indian", "🥗 Healthy", "🍜 Chinese", "🧁 Desserts", "☕ Café"];

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-rose-50" />
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute top-40 left-1/2 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Mobile Layout */}
        <div className="md:hidden min-h-[85vh] flex flex-col justify-center py-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2">
                Craving <span className="text-orange-600">Something?</span>
              </h1>
              <p className="text-gray-500">Fast delivery from best restaurants</p>
            </div>

            {/* Location Bar */}
            <div className="px-2">
              <div className="glass rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-orange-500/10 active:scale-95 transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center text-white shadow-md">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Delivering to</p>
                    <p className="text-sm font-bold text-gray-900">Current Location</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition-opacity" />
                <div className="relative bg-white rounded-2xl flex items-center p-1 border border-gray-100 shadow-xl">
                  <Search className="ml-4 text-orange-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search 'Biryani'..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3.5 text-base bg-transparent focus:outline-none placeholder-gray-400 text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                  />
                  <button 
                    onClick={() => searchQuery.trim() && (window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`)}
                    className="p-2.5 bg-gray-50 rounded-xl text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Categories with Snap Scroll */}
            <div className="pt-4">
              <div className="flex gap-3 overflow-x-auto scrollbar-hide px-2 pb-4 snap-x snap-mandatory">
                {CUISINES.map((category, idx) => (
                  <button
                    key={category}
                    className="snap-start flex-shrink-0 bg-white/80 backdrop-blur-sm border border-gray-100 pl-3 pr-4 py-2.5 rounded-full text-sm font-semibold text-gray-700 shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                  >
                    <span className="text-lg">{category.split(' ')[0]}</span>
                    <span>{category.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-2 gap-10 items-center py-12 lg:py-16">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100/80 rounded-full"
              >
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-700">Delivery in 25 minutes</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 leading-[1.1] tracking-tight"
              >
                Delicious Food,{" "}
                <span className="gradient-text">Delivered Fast</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg text-gray-500 leading-relaxed max-w-lg"
              >
                Order from your favorite restaurants and cloud kitchens.
                Fresh food, amazing deals, and lightning-fast delivery.
              </motion.p>
            </div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, cuisines, or dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 shadow-lg shadow-gray-100 bg-white transition-all"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                  />
                </div>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 px-7 py-4 rounded-2xl shadow-lg shadow-orange-200/50 border-0 text-base min-h-[44px]"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                >
                  <Search className="w-5 h-5" />
                </Button>
              </div>

              {/* Popular Searches */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-gray-400">Popular:</span>
                {["Pizza", "Biryani", "Burger", "Chinese"].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      window.location.href = `/restaurants?search=${encodeURIComponent(term)}`;
                    }}
                    className="text-xs text-gray-500 hover:text-orange-600 px-2.5 py-1 bg-white rounded-full border border-gray-200 hover:border-orange-300 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex items-center gap-6 pt-2"
            >
              {[
                { icon: Clock, label: "25-30 min", sub: "Avg. delivery" },
                { icon: Star, label: "4.8 ★", sub: "500+ reviews" },
                { icon: Shield, label: "Safe", sub: "Contactless" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Decorative Food Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="relative"
          >
            <div className="relative">
              {/* Main visual - food grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <div className="bg-gradient-to-br from-orange-400 to-rose-400 rounded-3xl p-6 text-white shadow-xl shadow-orange-200/50 aspect-square flex flex-col justify-end">
                    <p className="text-5xl mb-3">🍕</p>
                    <p className="font-bold text-lg">Pizza</p>
                    <p className="text-orange-100 text-sm">12 restaurants</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white shadow-xl shadow-emerald-200/50">
                    <p className="text-4xl mb-2">🥗</p>
                    <p className="font-bold">Healthy</p>
                    <p className="text-emerald-100 text-sm">8 options</p>
                  </div>
                </motion.div>
                <motion.div
                  className="space-y-4 pt-8"
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-amber-200/50">
                    <p className="text-4xl mb-2">🍛</p>
                    <p className="font-bold">Indian</p>
                    <p className="text-amber-100 text-sm">20+ brands</p>
                  </div>
                  <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-200/50 aspect-square flex flex-col justify-end">
                    <p className="text-5xl mb-3">🍔</p>
                    <p className="font-bold text-lg">Burgers</p>
                    <p className="text-violet-200 text-sm">15 restaurants</p>
                  </div>
                </motion.div>
              </div>

              {/* Floating delivery card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 border border-gray-100"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-500">On orders above ₹299</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};