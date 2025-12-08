import React from "react";
import { useLocation } from "../../hooks/useLocation";
import { MapPin, ChevronDown } from "lucide-react";

export const LocationSelector: React.FC = () => {
  const { address, openModal, clearLocation, isLocationPermissionGranted } =
    useLocation();

  const handleLocationClick = () => {
    openModal();
  };

  const truncateAddress = (addr: string, maxLength: number = 30) => {
    if (addr.length <= maxLength) return addr;
    return addr.substring(0, maxLength) + "...";
  };

  return (
    <div className="relative">
      <button
        onClick={handleLocationClick}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors duration-200 max-w-xs"
      >
        <MapPin className="h-4 w-4 text-red-500 flex-shrink-0" />
        <div className="text-left flex-1 min-w-0">
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {isLocationPermissionGranted ? "Deliver to" : "Set Location"}
          </div>
          <div className="font-medium text-gray-900 truncate">
            {truncateAddress(address)}
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
      </button>

      {/* Location Options Dropdown - can be enhanced later */}
      {isLocationPermissionGranted && (
        <div className="absolute top-full left-0 mt-1 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={clearLocation}
            className="text-xs text-red-600 hover:text-red-700 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm"
          >
            Change location
          </button>
        </div>
      )}
    </div>
  );
};
