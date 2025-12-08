import React from "react";
import { Link } from "react-router-dom";
import { Outlet } from "../../../types";
import { MapPin, Clock, Star } from "lucide-react";

interface OutletCardProps {
  outlet: Outlet;
}

export const OutletCard: React.FC<OutletCardProps> = ({ outlet }) => {
  // Safely access brand data
  const brandName = outlet.brand?.name || "Restaurant";
  const brandRating = outlet.brand?.average_rating || 4.0;
  const cuisineTypes = outlet.brand?.cuisine_types || ["Food"];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Banner/Image placeholder */}
      <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{outlet.name}</h3>
        </div>
      </div>

      <div className="p-4">
        {/* Brand info */}
        <div className="mb-3">
          <h4 className="font-semibold text-gray-800 mb-1">{brandName}</h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{brandRating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{cuisineTypes.join(", ")}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2">{outlet.address}</p>
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">
            Delivery available • {outlet.delivery_radius || 5}km radius
          </span>
        </div>

        {/* Action button */}
        <Link
          to={`/restaurants/${outlet.id}`}
          className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
};
