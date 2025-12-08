import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  MapPin,
  ChevronDown,
  Loader2,
  X,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useCartStore } from "../../store/cartStore";
import { useLocation } from "../../hooks/useLocation";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { LoginModal } from "../features/auth/LoginModal";
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
  } = useLocation();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  const itemCount = getItemCount();

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
    // Here you can navigate to the outlet or update the selected outlet
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-orange-600">
                Global
                <span className="text-gray-900">Eats</span>
              </span>
            </Link>

            {/* Location - Hidden on mobile */}
            <div className="hidden md:flex items-center relative">
              <button
                onClick={handleLocationClick}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLocationLoading}
              >
                {isLocationLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4 text-red-500" />
                )}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium">
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
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <h3 className="font-medium text-gray-900">
                      Available Outlets
                    </h3>
                    <p className="text-xs text-gray-500">
                      Choose your preferred delivery location
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {nearbyOutlets.map((outlet: Outlet) => (
                      <div
                        key={outlet.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                        onClick={() => handleOutletSelect(outlet)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">
                              {outlet.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {outlet.address}
                            </p>
                            <p className="text-xs text-gray-400">
                              {outlet.city}
                              {outlet.city && outlet.state ? ", " : ""}
                              {outlet.state}
                            </p>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-xs text-orange-600 font-medium">
                              Delivery Available
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              25-30 mins
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const query = (e.target as HTMLInputElement).value;
                      if (query.trim()) {
                        window.location.href = `/restaurants?search=${encodeURIComponent(query)}`;
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Right side - Cart, User */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative">
                <ShoppingBag className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white">
                    {itemCount}
                  </Badge>
                )}
              </Link>

              {/* User Account */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile">
                    <User className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                  </Link>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden sm:inline-flex"
                >
                  Sign In
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              {/* Mobile Location */}
              <div className="mb-4">
                <button
                  onClick={handleLocationClick}
                  className="flex items-center w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  disabled={isLocationLoading}
                >
                  {isLocationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-3" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-3 text-red-500" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {selectedOutlet
                        ? selectedOutlet.name
                        : isLocationPermissionGranted &&
                            nearbyOutlets.length > 0
                          ? nearbyOutlets[0]?.name || "Select Outlet"
                          : "Set Location"}
                    </span>
                  </div>
                </button>
              </div>

              {/* Mobile Search */}
              <div className="mb-4 px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search restaurants..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const query = (e.target as HTMLInputElement).value;
                        if (query.trim()) {
                          setIsMobileMenuOpen(false);
                          window.location.href = `/restaurants?search=${encodeURIComponent(query)}`;
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="px-4">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setIsAuthModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                </div>
              )}

              {/* Mobile Outlets */}
              {isLocationPermissionGranted && nearbyOutlets.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <div className="px-4 mb-2">
                    <h3 className="font-medium text-gray-900 text-sm">
                      Available Outlets:
                    </h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {nearbyOutlets.slice(0, 3).map((outlet: Outlet) => (
                      <button
                        key={outlet.id}
                        onClick={() => {
                          handleOutletSelect(outlet);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <h4 className="font-medium text-gray-900 text-sm">
                          {outlet.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {outlet.address}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <LoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Header;
