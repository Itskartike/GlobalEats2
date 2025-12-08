import React from "react";
import { useLocation } from "../../../hooks/useLocation";
import { OutletCard } from "../restaurants/OutletCard";
import { MapPin, Loader2, AlertCircle, Navigation } from "lucide-react";
import { Button } from "../../ui/Button";

export const NearbyOutlets: React.FC = () => {
  const {
    nearbyOutlets,
    address,
    error,
    isLoading,
    isLocationPermissionGranted,
    fetchLocation,
    openModal,
  } = useLocation();

  // Show location prompt if no location permission
  if (!isLocationPermissionGranted) {
    return (
      <div className="container mx-auto py-12">
        <div className="text-center max-w-md mx-auto">
          <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Discover Nearby Outlets
          </h2>
          <p className="text-gray-600 mb-6">
            Share your location to find the best restaurants and cloud kitchens
            near you.
          </p>
          <Button onClick={openModal} className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Set Location
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-6">Finding Nearby Outlets...</h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600">
              Searching for outlets near {address}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Nearby Outlets</h2>
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchLocation} variant="secondary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show no outlets found
  if (nearbyOutlets.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h2 className="text-2xl font-bold mb-4">Nearby Outlets</h2>
        <p className="text-gray-600 mb-4">Location: {address}</p>
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No outlets available in your area
          </h3>
          <p className="text-gray-600 mb-4">
            We're working to expand our delivery network. Try searching in a
            nearby area.
          </p>
          <Button onClick={openModal} variant="secondary">
            Change Location
          </Button>
        </div>
      </div>
    );
  }

  // Show outlets
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Nearby Outlets</h2>
          <p className="text-gray-600">
            Delivering to: <span className="font-medium">{address}</span>
          </p>
        </div>
        <Button onClick={openModal} variant="outline" size="sm">
          Change Location
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nearbyOutlets.map((outlet) => (
          <OutletCard key={outlet.id} outlet={outlet} />
        ))}
      </div>

      {nearbyOutlets.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Found {nearbyOutlets.length} outlet
            {nearbyOutlets.length > 1 ? "s" : ""} in your delivery area
          </p>
        </div>
      )}
    </div>
  );
};
