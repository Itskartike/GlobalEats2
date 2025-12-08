import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, Truck, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Rating } from "../../ui/Rating";
import { Brand, Outlet } from "../../../types/brand";
import brandService from "../../../services/brandService";
import { transformApiBrandToBrand } from "../../../utils/apiTransformers";

export const BrandDetail: React.FC = () => {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const [brand, setBrand] = useState<
    | (Brand & {
        slug: string;
        deliveryFee: number;
        minimumOrderAmount: number;
        estimatedDeliveryTime: number;
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const fetchBrandDetails = async () => {
      if (!brandSlug) return;

      try {
        setLoading(true);
        const apiBrand = await brandService.getBrandBySlug(brandSlug);
        const transformedBrand = transformApiBrandToBrand(apiBrand);
        setBrand(transformedBrand);

        // Auto-select first outlet if available
        if (transformedBrand.outlets.length > 0) {
          setSelectedOutlet(transformedBrand.outlets[0]);
        }
      } catch (err) {
        console.error("Error fetching brand details:", err);
        setError("Failed to load brand details");
      } finally {
        setLoading(false);
      }
    };

    fetchBrandDetails();
  }, [brandSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading brand details...</p>
        </div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Brand not found"}
          </h1>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                to="/restaurants"
                className="text-gray-500 hover:text-gray-700"
              >
                Restaurants
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <Link
                to={`/brands/${brand.slug}`}
                className="text-gray-500 hover:text-gray-700"
              >
                {brand.name}
              </Link>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">Details</span>
            </nav>
            <Link to={`/brands/${brand.slug}`}>
              <Button variant="outline" size="sm">
                Back to Menu
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-xl shadow-lg overflow-hidden bg-white flex items-center justify-center">
                  {!logoError ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <div className="w-full h-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">
                        {brand.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {brand.name}
                  </h1>
                  <p className="text-gray-600 mb-3">{brand.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {brand.cuisines.map((cuisine) => (
                      <Badge key={cuisine} variant="info" size="sm">
                        {cuisine}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Rating rating={brand.rating} size="md" />
                    <span className="text-sm text-gray-500">
                      ({brand.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src={brand.coverImage}
                alt={brand.name}
                className="w-full h-64 object-cover rounded-xl shadow-lg"
              />
              {brand.offers.length > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="error" className="text-white bg-red-500">
                    {brand.offers[0].title}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Outlet List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Choose Location ({brand.outlets.length} outlet
              {brand.outlets.length !== 1 ? "s" : ""} available)
            </h2>
            <div className="space-y-4">
              {brand.outlets.map((outlet) => (
                <OutletCard
                  key={outlet.id}
                  outlet={outlet}
                  brand={brand}
                  isSelected={selectedOutlet?.id === outlet.id}
                  onSelect={() => setSelectedOutlet(outlet)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">₹{brand.deliveryFee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Min Order</span>
                  <span className="font-medium">
                    ₹{brand.minimumOrderAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Delivery Time</span>
                  <span className="font-medium">
                    {brand.estimatedDeliveryTime} mins
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cuisine</span>
                  <span className="font-medium">{brand.cuisines[0]}</span>
                </div>
              </div>
            </Card>

            {/* Offers Card */}
            {brand.offers.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Available Offers
                </h3>
                <div className="space-y-3">
                  {brand.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="border border-orange-200 rounded-lg p-3 bg-orange-50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="error" size="sm">
                          {offer.title}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Code: {offer.code}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {offer.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Min order: ₹{offer.minOrder}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Popular Items Preview */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Popular Items
              </h3>
              <div className="space-y-3">
                <div className="text-center text-gray-500 py-4">
                  <p>View menu for pricing and ordering</p>
                  <div className="flex justify-center mt-2">
                    <Link to={`/brands/${brand.slug}`}>
                      <Button variant="primary" size="sm">
                        View Menu
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Menu Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link to={`/brands/${brand.slug}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
          >
            <span className="font-medium">View Menu</span>
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

interface OutletCardProps {
  outlet: Outlet;
  brand: Brand & {
    slug: string;
    deliveryFee: number;
    minimumOrderAmount: number;
    estimatedDeliveryTime: number;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const OutletCard: React.FC<OutletCardProps> = ({
  outlet,
  brand,
  isSelected,
  onSelect,
}) => {
  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
      <Card
        className={`p-6 cursor-pointer transition-all duration-200 ${
          isSelected ? "ring-2 ring-orange-500 border-orange-200" : ""
        }`}
        onClick={onSelect}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {outlet.name}
            </h3>
            <div className="flex items-start gap-2 text-gray-600 mb-2">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-sm">
                {outlet.address.street}, {outlet.address.area}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{brand.estimatedDeliveryTime} mins</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>
                  ₹{brand.deliveryFee || outlet.deliveryFee} delivery fee
                </span>
              </div>
              {outlet.rating > 0 && <Rating rating={outlet.rating} size="sm" />}
            </div>
          </div>
          <div className="text-right">
            {(brand.minimumOrderAmount || outlet.minimumOrder) > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                Min order: ₹{brand.minimumOrderAmount || outlet.minimumOrder}
              </p>
            )}
            <Link to={`/brands/${brand.slug || brand.id}`}>
              <Button variant="primary" size="sm" className="w-full">
                View Menu
              </Button>
            </Link>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Today</span>
            {outlet.operatingHours &&
            Object.keys(outlet.operatingHours).length > 0 ? (
              <span className="font-medium text-green-600">
                Open until{" "}
                {Object.values(outlet.operatingHours)[0]?.close || "11:00 PM"}
              </span>
            ) : (
              <span className="font-medium text-green-600">
                Open until 11:00 PM
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
