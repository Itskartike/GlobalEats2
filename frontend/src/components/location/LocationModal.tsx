import React, { useState } from "react";
import { useLocation } from "../../hooks/useLocation";
import { Modal } from "../common/Modal";
import { Button } from "../ui/Button";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";

export const LocationModal: React.FC = () => {
  const {
    isModalOpen,
    closeModal,
    fetchLocation,
    searchLocationByAddress,
    error,
    isLoading,
  } = useLocation();
  const [searchAddress, setSearchAddress] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleAllowLocation = () => {
    fetchLocation();
  };

  const handleSearchLocation = async () => {
    if (!searchAddress.trim()) return;

    setIsSearching(true);
    try {
      await searchLocationByAddress(searchAddress);
      closeModal();
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchLocation();
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={closeModal}
      title="Set Your Location"
      className="max-w-md"
    >
      <div className="p-6">
        <div className="text-center mb-6">
          <MapPin className="mx-auto h-12 w-12 text-blue-500 mb-3" />
          <p className="text-gray-600">
            To find the nearest outlets and check delivery availability, please
            set your location.
          </p>
        </div>

        {/* GPS Location Option */}
        <div className="mb-4">
          <Button
            onClick={handleAllowLocation}
            className="w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            Use Current Location
          </Button>
        </div>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">or</span>
          </div>
        </div>

        {/* Address Search Option */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your address, area, or landmark"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          </div>

          <Button
            onClick={handleSearchLocation}
            variant="secondary"
            className="w-full"
            disabled={isSearching || !searchAddress.trim()}
          >
            {isSearching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search Location
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </Modal>
  );
};
