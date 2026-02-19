import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin,
  Home as HomeIcon,
  ShoppingBag,
  User,
  Heart
} from "lucide-react";
import { FeaturedBrands } from "../components/features/home/FeaturedBrands";
import { HeroSection } from "../components/features/home/HeroSection";
import { Button } from "../components/ui/Button";
import LocationContext from "../contexts/LocationContext";

export const Home: React.FC = () => {
  const locationContext = useContext(LocationContext);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  if (!locationContext) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const { isLocationPermissionGranted } = locationContext;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <HeroSection 
        isLocationGranted={isLocationPermissionGranted}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Featured Brands */}
      <FeaturedBrands />

      {/* Location Prompt */}
      {!isLocationPermissionGranted && (
        <section className="py-10 sm:py-14">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-orange-50 via-white to-rose-50 rounded-3xl border border-orange-100/50 shadow-sm">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-orange-200/50">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  Set Your Location
                </h2>
                <p className="text-gray-500 mb-8 max-w-lg mx-auto px-4">
                  Allow location access to discover amazing restaurants nearby. 
                  We'll match you with the best options in your area.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 rounded-xl shadow-lg shadow-orange-200/50"
                    onClick={() => locationContext.openModal()}
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    Set My Location
                  </Button>
                  <Link to="/restaurants">
                    <Button variant="outline" size="lg" className="rounded-xl">
                      Browse All Restaurants
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section — Customers */}
      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
            <div className="absolute inset-0">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="relative"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Ready to Order Amazing Food?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of satisfied customers who trust GlobalEats for their daily meals
              </p>
              <Link to="/restaurants">
                <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-50 rounded-xl font-semibold shadow-lg">
                  <Search className="w-5 h-5 mr-2" />
                  Start Ordering
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Partner With Us Banner */}
      <section className="py-0 sm:py-4 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900 rounded-3xl overflow-hidden relative shadow-xl">
            <div className="absolute inset-0">
              <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative p-8 sm:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium mb-4 border border-emerald-500/30">
                    For Restaurants & Cloud Kitchens
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    Partner With Us &
                    <span className="text-emerald-400"> Grow Your Business</span>
                  </h2>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    Join GlobalEats as a vendor partner. Zero upfront costs, real-time analytics, multi-brand support
                    — everything you need to scale your food business.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/partner" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25">
                      Become a Partner
                    </Link>
                    <Link to="/partner" className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-xl font-medium hover:bg-white/10 transition-all">
                      Learn More →
                    </Link>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="hidden md:grid grid-cols-2 gap-3"
                >
                  {[
                    { value: "15%", label: "Commission Only" },
                    { value: "24h", label: "Quick Approval" },
                    { value: "∞", label: "Unlimited Brands" },
                    { value: "0", label: "Setup Fees" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                      <p className="text-2xl font-bold text-emerald-400">{stat.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 z-50">
        <div className="flex items-center justify-around py-1">
          {[
            { to: "/", icon: HomeIcon, label: "Home", active: location.pathname === "/" },
            { to: "/restaurants", icon: Search, label: "Search", active: false },
            { to: "/orders", icon: ShoppingBag, label: "Orders", active: false },
            { to: "/favorites", icon: Heart, label: "Favorites", active: false },
            { to: "/profile", icon: User, label: "Profile", active: false },
          ].map(item => (
            <Link key={item.to} to={item.to} className={`flex flex-col items-center py-2 px-3 ${item.active ? "text-orange-600" : "text-gray-400"}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  );
};
