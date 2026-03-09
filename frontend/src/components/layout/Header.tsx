import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, ChevronDown, Loader2, Handshake, ShoppingBag, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useLocation as useAppLocation } from "../../hooks/useLocation";
import { Button } from "../ui/Button";
import { AuthModal } from "../auth/AuthModal";
import { Outlet } from "../../types/index";

const Header: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const { getItemCount } = useCartStore();
  const {
    nearbyOutlets,
    selectedOutlet,
    isLoading: isLocationLoading,
    isLocationPermissionGranted,
    openModal: openLocationModal,
  } = useAppLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLocationClick = () => {
    if (isLocationPermissionGranted && nearbyOutlets.length > 0) {
      setShowOutletDropdown(!showOutletDropdown);
    } else {
      openLocationModal();
    }
  };

  const handleOutletSelect = (outlet: Outlet) => {
    console.log("Selected outlet:", outlet);
    setShowOutletDropdown(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md border-b border-zinc-200 shadow-sm" : "bg-white/80 backdrop-blur-sm border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group btn-press shrink-0 mr-auto sm:mr-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                <span className="text-white font-black text-sm">G</span>
              </div>
              <span className="text-[17px] sm:text-xl font-bold tracking-tight text-gray-900 shrink-0">
                Global<span className="text-orange-600">Eats</span>
              </span>
            </Link>

            {/* Location Picker */}
            <div className="relative shrink min-w-0 sm:ml-8 sm:mr-auto">
              <button
                onClick={handleLocationClick}
                className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-900 cursor-pointer px-1 sm:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-black/5 transition-all text-left"
                disabled={isLocationLoading}
              >
                {isLocationLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0 text-orange-500" />
                ) : (
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-orange-500" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] sm:text-[11px] text-zinc-500 font-bold uppercase tracking-wider leading-none hidden sm:block mb-0.5">Delivering to</span>
                  <span className="text-sm font-bold text-zinc-900 truncate max-w-[120px] sm:max-w-[200px]">
                    {selectedOutlet
                      ? selectedOutlet.name
                      : isLocationPermissionGranted && nearbyOutlets.length > 0
                      ? nearbyOutlets[0]?.name || "Select Outlet"
                      : "Set Location"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 shrink-0 text-zinc-400" />
              </button>

              {/* Outlet Dropdown */}
              {showOutletDropdown && nearbyOutlets.length > 0 && (
                <div className="absolute top-full right-0 sm:left-0 sm:right-auto mt-2 w-[260px] sm:w-80 glass bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl shadow-xl overflow-hidden animate-scale-in origin-top-right sm:origin-top-left z-50">
                  <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-rose-50/50 text-left">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Available Outlets</h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Select for delivery</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto custom-scrollbar text-left">
                    {nearbyOutlets.map((outlet: Outlet) => (
                      <div
                        key={outlet.id}
                        className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                        onClick={() => handleOutletSelect(outlet)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0 pr-2">
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{outlet.name}</h4>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-1">{outlet.address}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-[9px] sm:text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">OPEN</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Empty space intentionally left for navbar balance on Desktop */}
            <div className="flex-1 max-w-xl mx-4 overflow-hidden hidden xl:block"></div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Partner Link */}
              <Link to="/partner" className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-orange-600 transition-colors mr-2 px-4 py-2 rounded-full border border-zinc-200 hover:border-orange-200 hover:bg-orange-50">
                <Handshake className="w-4 h-4" />
                <span>Partner with us</span>
              </Link>

              {/* Cart Button */}
              <Link to="/cart" className="hidden md:block relative p-2.5 rounded-xl hover:bg-zinc-100 transition-colors btn-press group">
                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-600 rounded-full animate-pulse shadow-[0_0_0_2px_#fff]" />
                )}
              </Link>

              {/* User Profile / Login */}
              {isAuthenticated ? (
                <Link to="/profile" className="hidden md:flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all btn-press">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user?.name?.split(" ")[0]}</span>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:flex bg-gradient-to-r from-orange-600 to-rose-600 hover:shadow-lg hover:shadow-orange-500/30 border-0 rounded-xl px-6"
                >
                  Sign In
                </Button>
              )}


            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Header;
