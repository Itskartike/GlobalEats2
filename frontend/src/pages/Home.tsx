import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Search, 
  MapPin,
  Percent,
  Clock,
  Building2,
  ShieldCheck,
  Smartphone,
  Quote
} from "lucide-react";
import { FeaturedBrands } from "../components/features/home/FeaturedBrands";
import { HeroSection } from "../components/features/home/HeroSection";
import { Button } from "../components/ui/Button";
import LocationContext from "../contexts/LocationContext";

export const Home: React.FC = () => {
  const locationContext = useContext(LocationContext);
  const [searchQuery, setSearchQuery] = useState("");

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
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
              >
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-3 tracking-tight">
                  Set Your Location
                </h2>
                <p className="text-gray-500 mb-8 max-w-lg mx-auto px-4">
                  Allow location access to discover amazing restaurants nearby. 
                  We'll match you with the best options in your area.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center px-4">
                  <Button 
                    size="lg" 
                    className="bg-zinc-900 hover:bg-orange-600 text-white border-0 rounded-xl shadow-md transition-colors font-medium tracking-wide"
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

      {/* Split CTA Section */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CTA 1: Customers */}
            <div className="bg-zinc-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col justify-end min-h-[380px] group">
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                <img 
                  src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1974&auto=format&fit=crop" 
                  alt="Background food" 
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="relative z-10 text-left"
              >
                <div className="inline-flex px-3 py-1 bg-orange-600/90 text-white text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  Order Now
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                  Craving something?
                </h2>
                <p className="text-zinc-300 mb-6 max-w-sm font-medium">
                  Get the best local food delivered fast.
                </p>
                <Link to="/restaurants">
                  <Button className="bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl font-bold shadow-lg px-6 py-5">
                    <Search className="w-5 h-5 mr-2" />
                    Find Restaurants
                  </Button>
                </Link>
                <p className="mt-4 text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-orange-500" />
                  No minimum order requirement
                </p>
              </motion.div>
            </div>

            {/* CTA 2: App Download / Riders */}
            <div className="bg-orange-600 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl flex flex-col justify-end min-h-[380px] group">
              <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop')] bg-cover opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900 via-orange-800/20 to-transparent" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative z-10 text-left"
              >
                <div className="inline-flex px-3 py-1 bg-white/20 backdrop-blur text-white border border-white/30 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                  Get the App
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                  Track in real-time
                </h2>
                <p className="text-orange-100 mb-6 max-w-sm font-medium">
                  Download the GlobalEats app for exclusive mobile offers.
                </p>
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-bold shadow-lg px-6 py-5">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Download App
                </Button>
                <p className="mt-4 text-xs text-orange-200 flex items-center gap-1.5 font-medium">
                  Available on iOS & Android
                </p>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Partner With Us Banner */}
      <section className="py-8 sm:py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-[2.5rem] overflow-hidden relative shadow-2xl border border-zinc-100">
            <div className="relative p-8 sm:p-14 lg:p-20">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                
                {/* Left Content */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-100 text-zinc-900 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
                    For Vendors
                  </span>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 mb-6 tracking-tight leading-[1.1]">
                    Partner With Us &
                    <span className="text-orange-600 block mt-2">Grow Your Business</span>
                  </h2>
                  <p className="text-zinc-500 mb-8 leading-relaxed font-light text-xl max-w-lg">
                    Join GlobalEats as a vendor partner. Zero upfront costs, real-time analytics, and world-class logistics mapping.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <Link to="/partner">
                      <Button size="lg" className="w-full sm:w-auto bg-zinc-900 text-white rounded-xl font-bold shadow-xl hover:bg-orange-600 transition-colors px-8 py-4">
                        Become a Partner
                      </Button>
                    </Link>
                    <Link to="/partner">
                      <Button size="lg" variant="outline" className="w-full sm:w-auto text-zinc-800 border-zinc-200 rounded-xl font-bold hover:bg-zinc-50 px-8 py-4">
                        See how it works →
                      </Button>
                    </Link>
                  </div>

                  {/* Testimonial */}
                  <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 relative">
                    <Quote className="absolute top-4 right-4 w-10 h-10 text-zinc-200 rotate-180" />
                    <p className="text-zinc-700 italic font-medium mb-3 relative z-10">
                      "Since joining GlobalEats, our daily orders have tripled and the analytics dashboard is a game-changer."
                    </p>
                    <div className="flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100" className="w-10 h-10 rounded-full object-cover" alt="Partner" />
                      <div>
                        <p className="font-bold text-sm text-zinc-900">Sarah Jenkins</p>
                        <p className="text-xs text-zinc-500">Owner, Burger Bistro</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Content - Stats & Mockup */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      { value: "15%", label: "Commission Only", icon: Percent, color: "text-emerald-500", bg: "bg-emerald-50" },
                      { value: "24h", label: "Quick Approval", icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
                      { value: "∞", label: "Multi-Brands", icon: Building2, color: "text-purple-500", bg: "bg-purple-50" },
                      { value: "₹0", label: "Setup Fees", icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-50" },
                    ].map(stat => (
                      <div key={stat.label} className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden group hover:border-orange-200 transition-colors">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-3xl font-extrabold text-zinc-900 mb-1">{stat.value}</p>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Mock Dashboard Sneak Peek */}
                  <div className="hidden md:block absolute -right-12 -bottom-24 w-[380px] bg-white rounded-t-2xl shadow-2xl border border-zinc-200 p-4 transform rotate-12 hover:rotate-0 transition-transform duration-500 origin-bottom-right z-10">
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <p className="text-xs font-semibold text-zinc-400">Partner Dashboard</p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-20 bg-emerald-50 rounded-xl p-3 flex justify-between items-end border border-emerald-100">
                        <span className="text-emerald-800 font-bold block mb-1">Total Sales</span>
                        <span className="text-emerald-600 text-xl font-extrabold">₹42,500</span>
                      </div>
                      <div className="flex gap-3">
                         <div className="h-16 flex-1 bg-blue-50 rounded-xl border border-blue-100" />
                         <div className="h-16 flex-1 bg-purple-50 rounded-xl border border-purple-100" />
                      </div>
                    </div>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Bottom padding for mobile nav */}
      <div className="md:hidden h-16" />
    </div>
  );
};
