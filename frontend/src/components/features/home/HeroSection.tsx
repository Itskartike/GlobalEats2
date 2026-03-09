import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, Star, Truck, ArrowRight, Target } from "lucide-react";
import { Button } from "../../ui/Button";

interface HeroSectionProps {
  isLocationGranted: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CUISINES = ["🍕 Pizza", "🍔 Burgers", "🍛 Indian", "🥗 Healthy", "🍜 Chinese", "🧁 Desserts", "☕ Café"];
const ROTATING_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop", // Spread
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop", // Pizza
  "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop"  // Burger
];

const AnimatedCounter: React.FC<{ end: number; suffix?: string; prefix?: string }> = ({ end, suffix = "", prefix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) window.requestAnimationFrame(step);
      else setCount(end);
    };
    window.requestAnimationFrame(step);
  }, [end]);

  return <>{prefix}{count}{suffix}</>;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery
}) => {
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % ROTATING_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
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
        <div className="hidden md:grid md:grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-4 lg:py-8 xl:py-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-5 xl:space-y-6 z-10 min-w-0"
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
                className="text-4xl lg:text-4xl xl:text-5xl font-extrabold text-zinc-900 leading-[1.1] tracking-tight"
              >
                The food you love, <br />
                <span className="text-orange-600">delivered instantly.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-base lg:text-lg text-zinc-600 leading-relaxed max-w-lg font-light"
              >
                Discover the best local restaurants and get your favorite meals delivered fresh to your door in minutes.
              </motion.p>
            </div>

            {/* Premium Split Search Box (Location + Search) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white p-2 rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 flex flex-col xl:flex-row gap-2 w-full max-w-xl xl:max-w-2xl"
            >
              <button 
                onClick={() => document.getElementById("location-modal")?.click()}
                className="flex-[0.8] relative flex items-center px-4 py-3 sm:py-0 border-b sm:border-b-0 sm:border-r border-zinc-100 hover:bg-zinc-50 rounded-xl sm:rounded-r-none transition-colors group cursor-pointer text-left"
              >
                <Target className="absolute left-4 text-orange-500 w-5 h-5 group-hover:scale-110 transition-transform" />
                <div className="pl-10 pr-2 overflow-hidden flex-1">
                  <p className="text-[10px] xl:text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">Delivering To</p>
                  <p className="text-sm font-bold text-zinc-900 truncate w-full">Current Location</p>
                </div>
                <ChevronDown className="absolute right-4 w-4 h-4 text-zinc-400 shrink-0" />
              </button>
              
              <div className="flex-[1.2] relative flex items-center min-w-0">
                <Search className="absolute left-4 text-zinc-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Craving something specific?"
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
                className="bg-zinc-900 hover:bg-orange-600 text-white px-8 py-4 rounded-xl transition-colors min-h-[56px] font-semibold tracking-wide sm:w-auto w-full"
                onClick={() => {
                  if (searchQuery.trim()) {
                    window.location.href = `/restaurants?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
              >
                Find Food
              </Button>
            </motion.div>

            {/* Quick Cuisine Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex gap-2 flex-wrap max-w-2xl"
            >
              {CUISINES.slice(0, 5).map((category) => (
                <button
                  key={category}
                  onClick={() => window.location.href = `/restaurants?search=${encodeURIComponent(category.split(' ').slice(1).join(' '))}`}
                  className="bg-white border border-zinc-200 px-4 py-1.5 rounded-full text-sm font-medium text-zinc-600 shadow-sm hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 transition-all"
                >
                  {category}
                </button>
              ))}
            </motion.div>

            {/* Stats & Trust Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="flex flex-wrap items-center gap-x-8 xl:gap-x-12 gap-y-4 xl:gap-y-6 pt-4 xl:pt-6 border-t border-zinc-200/60 max-w-2xl"
            >
              <div className="space-y-1">
                <p className="text-3xl font-bold text-zinc-900">
                  <AnimatedCounter end={500} suffix="+" />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Restaurants</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-zinc-900">
                  <AnimatedCounter end={25} suffix="m" />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Avg Delivery</p>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold text-zinc-900 flex items-center gap-1.5">
                  <AnimatedCounter end={4} suffix=".9" /> 
                  <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                </p>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">App Rating</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Premium Photography */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block min-w-0 w-full max-w-[340px] xl:max-w-[480px] mx-auto xl:mr-0 pl-10"
          >
            <div className="relative aspect-[4/3] xl:aspect-square rounded-[2rem] overflow-hidden shadow-2xl shadow-zinc-300/50">
              <AnimatePresence mode="popLayout">
                <motion.img 
                  key={currentImageIdx}
                  src={ROTATING_IMAGES[currentImageIdx]}
                  alt="Delicious premium food spread" 
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent pointer-events-none" />
            </div>
              
            {/* Enlarged Floating order card slightly overlapping edge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="absolute -bottom-6 left-6 right-6 xl:left-12 xl:right-12 bg-white/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl flex items-center gap-4 z-20 border border-zinc-100"
            >
              <div className="w-12 h-12 xl:w-14 xl:h-14 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 xl:w-7 xl:h-7 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-zinc-900 text-base xl:text-lg truncate">Order on the way</p>
                <p className="text-xs xl:text-sm font-medium text-zinc-500 truncate">Arriving in <span className="text-orange-600 font-bold">12 mins</span></p>
              </div>
              <div className="w-10 h-10 xl:w-12 xl:h-12 rounded-full border-[3px] border-orange-500 flex items-center justify-center bg-orange-50 shrink-0">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping absolute" />
                <div className="w-2 h-2 rounded-full bg-orange-500 relative z-10" />
              </div>
            </motion.div>
            
            {/* Added a spacer to accommodate the overlapping -bottom-6 card */}
            <div className="h-6 w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};