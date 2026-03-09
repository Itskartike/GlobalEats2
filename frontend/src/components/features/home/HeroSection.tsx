import React from "react";
import { motion } from "framer-motion";
import { Search, MapPin, ChevronDown, Clock, Star, Truck, ArrowRight } from "lucide-react";
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
    <section className="relative overflow-hidden bg-stone-50">
      {/* Premium Minimalist Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white hidden lg:block" />
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-gradient-to-l from-orange-50/50 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Layout */}
        <div className="md:hidden min-h-[85vh] flex flex-col pt-8 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 mt-auto mb-auto"
          >
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 leading-tight tracking-tight mb-3">
                Cravings, <br />
                <span className="text-orange-600">delivered.</span>
              </h1>
              <p className="text-zinc-500 text-lg">Top restaurants to your door.</p>
            </div>

            {/* Premium Location Bar */}
            <div className="px-2">
              <button 
                onClick={() => document.getElementById("location-modal")?.click()}
                className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-zinc-200 active:bg-zinc-50 transition-colors"
               >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-900">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Delivering to</p>
                    <p className="text-sm font-semibold text-zinc-900 truncate max-w-[200px]">Current Location</p>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            {/* Sleek Search Bar */}
            <div className="px-2">
              <div className="relative bg-white rounded-2xl flex items-center p-1.5 border border-zinc-200 shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                <Search className="ml-3 text-zinc-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Restaurant, groceries, dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-3 text-base bg-transparent focus:outline-none placeholder-zinc-400 text-zinc-900"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
                <button 
                  onClick={() => searchQuery.trim() && (window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`)}
                  className="p-3 bg-zinc-900 rounded-xl text-white hover:bg-orange-600 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Minimalist Categories */}
            <div className="pt-2">
              <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-2 pb-2">
                {CUISINES.map((category) => (
                  <button
                    key={category}
                    className="flex-shrink-0 bg-white border border-zinc-200 px-4 py-2 rounded-full text-sm font-medium text-zinc-700 shadow-sm active:bg-zinc-50 transition-all"
                  >
                    {category.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-2 gap-12 lg:gap-20 items-center py-16 lg:py-24">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8 z-10"
          >
            <div className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-zinc-200 rounded-full shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">Lightning fast delivery</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-zinc-900 leading-[1.05] tracking-tight"
              >
                The food you love, <br />
                <span className="text-orange-600">delivered instantly.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-lg lg:text-xl text-zinc-600 leading-relaxed max-w-lg font-light"
              >
                Discover the best local restaurants and get your favorite meals delivered fresh to your door in minutes.
              </motion.p>
            </div>

            {/* Premium Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white p-2 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 flex gap-2 max-w-xl"
            >
              <div className="flex-1 relative flex items-center">
                <MapPin className="absolute left-4 text-zinc-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter delivery address or search cravings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-base bg-transparent focus:outline-none placeholder-zinc-400 text-zinc-900 font-medium"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                />
              </div>
              <Button
                size="lg"
                className="bg-zinc-900 hover:bg-orange-600 text-white px-8 py-4 rounded-xl transition-colors min-h-[56px] font-semibold tracking-wide"
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              >
                Find Food
              </Button>
            </motion.div>

            {/* Trust Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex items-center gap-8 pt-4 border-t border-zinc-200/60 max-w-xl"
            >
              {[
                { number: "500+", label: "Restaurants" },
                { number: "25m", label: "Avg Delivery" },
                { number: "4.9", label: "App Rating", icon: Star },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl font-bold text-zinc-900 flex items-center gap-1">
                    {stat.number}
                    {stat.icon && <stat.icon className="w-4 h-4 text-orange-500 fill-orange-500" />}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Premium Photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-300/50">
              <img 
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
                alt="Delicious premium food spread" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent" />
              
              {/* Floating order card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-zinc-900">Your order is on the way</p>
                  <p className="text-sm text-zinc-500">Arriving in 12 mins</p>
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center bg-orange-50">
                  <span className="text-xs font-bold text-orange-600">12m</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};