import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, ChevronDown, Loader2, Handshake, ShoppingBag, User } from "lucide-react";
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
          isScrolled ? "glass border-b border-gray-200/50" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group btn-press">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
                <span className="text-white font-black text-sm">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Global<span className="text-orange-600">Eats</span>
              </span>
            </Link>

            {/* Desktop: Location & Search */}
            <div className="hidden md:flex items-center flex-1 ml-8 gap-6">
              {/* Location Picker */}
              <div className="relative">
                <button
                  onClick={handleLocationClick}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer px-3 py-2 rounded-xl hover:bg-black/5 transition-all btn-press"
                  disabled={isLocationLoading}
                >
                  {isLocationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 text-orange-500" />
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold">
                      {selectedOutlet
                        ? selectedOutlet.name
                        : isLocationPermissionGranted && nearbyOutlets.length > 0
                        ? nearbyOutlets[0]?.name || "Select Outlet"
                        : "Set Location"}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 ml-1" />
                </button>

                {/* Outlet Dropdown */}
                {showOutletDropdown && nearbyOutlets.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-80 glass rounded-2xl overflow-hidden animate-scale-in origin-top-left">
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50/50 to-rose-50/50">
                      <h3 className="font-semibold text-gray-900">Available Outlets</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Select for delivery</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {nearbyOutlets.map((outlet: Outlet) => (
                        <div
                          key={outlet.id}
                          className="p-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                          onClick={() => handleOutletSelect(outlet)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 text-sm">{outlet.name}</h4>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{outlet.address}</p>
                            </div>
                            <div className="text-right ml-2">
                              <div className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-full">OPEN</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="flex-1 max-w-md relative group">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-orange-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search restaurants, cuisines..."
                  className="input-field py-2.5 pl-10 text-sm bg-gray-100/50 border-transparent focus:bg-white"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const query = (e.currentTarget as HTMLInputElement).value;
                      if (query.trim()) {
                        window.location.href = `/restaurants?search=${encodeURIComponent(query)}`;
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Partner Link */}
              <Link to="/partner" className="hidden lg:flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors mr-2 px-3 py-2 rounded-lg hover:bg-emerald-50">
                <Handshake className="w-4 h-4" />
                <span>Partner</span>
              </Link>

              {/* Cart Button */}
              <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-black/5 transition-colors btn-press group">
                <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition-colors" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm animate-scale-in">
                    {itemCount}
                  </span>
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

              {/* Mobile: Simple User Icon (if logged in) or Login Icon */}
              <button 
                 onClick={() => !isAuthenticated && setIsAuthModalOpen(true)}
                 className="md:hidden p-2.5 rounded-xl hover:bg-black/5 transition-colors btn-press"
              >
                  {isAuthenticated ? (
                      <Link to="/profile">
                         <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-rose-400 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                            {user?.name?.charAt(0)?.toUpperCase()}
                         </div>
                      </Link>
                  ) : (
                      <User className="w-5 h-5 text-gray-700" />
                  )}
              </button>
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
