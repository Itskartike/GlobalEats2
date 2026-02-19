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
    <div className="glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Banner/Image placeholder */}
      <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 relative overflow-hidden group">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
        <div className="absolute bottom-4 left-4 text-white z-10 w-full pr-4">
          <h3 className="text-xl font-bold truncate text-shadow">{outlet.name}</h3>
        </div>
      </div>

      <div className="p-5">
        {/* Brand info */}
        <div className="mb-4">
          <h4 className="font-semibold text-gray-900 mb-1.5 text-lg">{brandName}</h4>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg">
              <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span className="font-bold text-amber-700">{brandRating.toFixed(1)}</span>
            </div>
            <span className="text-gray-300">•</span>
            <span className="truncate">{cuisineTypes.join(", ")}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start gap-2.5 mb-4">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{outlet.address}</p>
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-2 mb-5 bg-green-50/50 p-2 rounded-lg border border-green-100">
          <Clock className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700 font-medium">
            Delivery in 30-45 min • {outlet.delivery_radius || 5}km
          </span>
        </div>

        {/* Action button */}
        <Link
          to={`/restaurants/${outlet.id}`}
          className="block w-full text-center bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-orange-200/50 btn-press"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
};
