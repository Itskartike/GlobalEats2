import React, { useState } from "react";
import { MapPin, Navigation, Clock, Route } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  getCurrentLocation,
  findNearbyOutletsWithGoogleMaps,
  calculateDistanceWithORS,
} from "../../services/locationService";
import toast from "react-hot-toast";

interface OutletWithDistance {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceText?: string;
  duration?: number;
  durationText?: string;
  travelMode?: string;
}

export const DistanceDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [outlets, setOutlets] = useState<OutletWithDistance[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [travelMode, setTravelMode] = useState<
    "DRIVING" | "WALKING" | "TRANSIT" | "BICYCLING"
  >("DRIVING");

  const handleFindOutlets = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });

      const nearbyOutlets = await findNearbyOutletsWithGoogleMaps(
        latitude,
        longitude
      );
      setOutlets(nearbyOutlets);

      if (nearbyOutlets.length === 0) {
        toast.error("Sorry, no outlets found in your area!");
      } else {
        toast.success(
          `Found ${nearbyOutlets.length} outlets with accurate distances!`
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to find outlets. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateWithMode = async (
    mode: "DRIVING" | "WALKING" | "TRANSIT" | "BICYCLING"
  ) => {
    if (!userLocation || outlets.length === 0) return;

    setIsLoading(true);
    setTravelMode(mode);

    try {
      const origins = [userLocation];
      const destinations = outlets.map((outlet) => ({
        lat: outlet.latitude || 0,
        lng: outlet.longitude || 0,
      }));

      const distanceResults = await calculateDistanceWithORS(
        origins,
        destinations,
        mode
      );

      const enhancedOutlets = outlets.map((outlet, index) => {
        const distanceData = distanceResults[index];
        if (distanceData && distanceData.status === "OK") {
          return {
            ...outlet,
            distance: distanceData.distance.value / 1000,
            distanceText: distanceData.distance.text,
            duration: distanceData.duration.value / 60,
            durationText: distanceData.duration.text,
            travelMode: mode,
          };
        }
        return outlet;
      });

      setOutlets(enhancedOutlets.sort((a, b) => a.distance - b.distance));
      toast.success(`Updated distances for ${mode.toLowerCase()} mode!`);
    } catch (error) {
      console.error("Error recalculating distances:", error);
      toast.error("Failed to recalculate distances.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case "DRIVING": return "🚗";
      case "WALKING": return "🚶";
      case "TRANSIT": return "🚌";
      case "BICYCLING": return "🚴";
      default: return "📍";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🗺️ Distance Calculator
            </h2>
            <p className="text-gray-600">
              Find nearby outlets with accurate distances and travel times
            </p>
          </div>
          <Button
            onClick={handleFindOutlets}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4" />
            <span>{isLoading ? "Finding..." : "Find Outlets"}</span>
          </Button>
        </div>

        {userLocation && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <Navigation className="w-4 h-4" />
              <span className="font-medium">Your Location:</span>
              <span>
                {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
              </span>
            </div>
          </div>
        )}

        {outlets.length > 0 && (
          <div className="space-y-4">
            {/* Travel Mode Selector */}
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-sm font-medium text-gray-700">
                Travel Mode:
              </span>
              {(["DRIVING", "WALKING", "TRANSIT", "BICYCLING"] as const).map(
                (mode) => (
                  <Button
                    key={mode}
                    variant={travelMode === mode ? "primary" : "outline"}
                    size="sm"
                    onClick={() => recalculateWithMode(mode)}
                    disabled={isLoading}
                    className="flex items-center space-x-1"
                  >
                    <span>{getTravelModeIcon(mode)}</span>
                    <span className="text-xs">{mode}</span>
                  </Button>
                )
              )}
            </div>

            {/* Outlets List */}
            <div className="grid gap-4">
              {outlets.map((outlet, index) => (
                <Card
                  key={outlet.id}
                  className="p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg font-semibold text-gray-900">
                          #{index + 1} {outlet.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {getTravelModeIcon(outlet.travelMode || "DRIVING")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {outlet.address}
                      </p>
                      <p className="text-xs text-gray-500">
                        {outlet.city}, {outlet.state}
                      </p>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-1">
                        <Route className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-600">
                          {outlet.distanceText ||
                            `${outlet.distance.toFixed(1)} km`}
                        </span>
                      </div>

                      {outlet.durationText && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600">
                            {outlet.durationText}
                          </span>
                        </div>
                      )}

                      <div className="text-xs">
                        {outlet.distanceText ? (
                          <span className="text-green-600 font-medium">
                            ✅ Road distance
                          </span>
                        ) : (
                          <span className="text-gray-500">📐 Straight-line</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Backward-compat export used by GoogleMapsTest.tsx
export { DistanceDemo as GoogleMapsDistanceDemo };
