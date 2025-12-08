import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Clock,
  ArrowLeft,
  CreditCard,
  Tag,
  Search,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { AuthModal } from "../components/auth/AuthModal";

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const {
    brands,
    clearCart,
    clearBrandCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    getBrandSubtotal,
    getBrandItemCount,
  } = useCartStore();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const itemCount = getItemCount();

  const handleQuantityChange = (
    itemId: string,
    brandId: string,
    newQuantity: number
  ) => {
    if (newQuantity === 0) {
      removeItem(itemId, brandId);
    } else {
      updateQuantity(itemId, brandId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    // Navigate to checkout page
    navigate("/checkout");
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "welcome10") {
      setIsPromoApplied(true);
      setPromoCode("WELCOME10");
    } else {
      alert("Invalid promo code. Try 'WELCOME10' for 10% off!");
    }
  };

  if (brands.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-6 md:pt-8">
        {/* Mobile App Header - match Home */}
        <div className="md:hidden bg-white shadow-sm border-b border-gray-100 sticky top-0 z-30">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
                  <p className="text-xs text-gray-500">Review and checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>

            <Card className="text-center py-16 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="mb-6">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-10 h-10 text-orange-600" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Your cart is empty
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                  Looks like you haven't added any delicious items yet. 
                  Let's find something amazing to eat!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/restaurants">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                      <Search className="w-5 h-5 mr-2" />
                      Browse Restaurants
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" size="lg">
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Link
                to="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
              </Link>
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cart
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Cart Items by Brand */}
              <div className="lg:col-span-2 space-y-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Your Cart ({itemCount} {itemCount === 1 ? "item" : "items"})
                </h1>

                {brands.map((brand) => (
                  <Card key={brand.brandId} className="p-6">
                    {/* Brand Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {brand.brandName}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {brand.outletName} • {brand.outletAddress}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          25-35 min
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => clearBrandCart(brand.brandId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    {/* Brand Items */}
                    <div className="space-y-4">
                      {brand.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                        >
                          {/* Item Image */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="w-6 h-6" />
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {item.name}
                                </h4>
                                <div className="flex items-center mt-1">
                                  {item.isVeg ? (
                                    <Badge
                                      variant="success"
                                      className="text-xs"
                                    >
                                      VEG
                                    </Badge>
                                  ) : (
                                    <Badge variant="error" className="text-xs">
                                      NON-VEG
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-lg font-semibold text-gray-900 mt-2">
                                  ₹{item.price}
                                </p>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      brand.brandId,
                                      item.quantity - 1
                                    )
                                  }
                                  className="w-10 h-10 p-0 hover:bg-gray-100"
                                >
                                  <Minus className="w-5 h-5" />
                                </Button>
                                <span className="font-semibold text-xl w-10 text-center">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      brand.brandId,
                                      item.quantity + 1
                                    )
                                  }
                                  className="w-10 h-10 p-0 hover:bg-gray-100"
                                >
                                  <Plus className="w-5 h-5" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    removeItem(item.id, brand.brandId)
                                  }
                                  className="w-10 h-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </Button>
                              </div>
                            </div>

                            {/* Special Instructions */}
                            {item.specialInstructions && (
                              <p className="text-sm text-gray-600 mt-2">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Brand Subtotal */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Subtotal ({getBrandItemCount(brand.brandId)} items)
                        </span>
                        <span className="font-medium">
                          ₹{getBrandSubtotal(brand.brandId)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">
                          ₹{brand.deliveryFee}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="p-5 md:p-6 sticky top-20 md:top-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Order Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fees</span>
                      <span>
                        ₹
                        {brands.reduce(
                          (total, brand) => total + brand.deliveryFee,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Taxes & Fees</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>

                    {/* Promo Code */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex space-x-2 mb-3">
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          disabled={isPromoApplied}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={applyPromoCode}
                          disabled={isPromoApplied || !promoCode.trim()}
                          className="px-4"
                        >
                          <Tag className="w-4 h-4" />
                        </Button>
                      </div>
                      {isPromoApplied && (
                        <div className="text-green-600 text-sm flex items-center">
                          <Tag className="w-4 h-4 mr-1" />
                          Promo code applied: 10% off
                        </div>
                      )}
                    </div>

                    {isPromoApplied && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount (10%)</span>
                        <span>-₹{(subtotal * 0.1).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>
                          ₹
                          {isPromoApplied
                            ? (total - subtotal * 0.1).toFixed(2)
                            : total}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    className="w-full mt-6"
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    By placing your order, you agree to our Terms of Service and
                    Privacy Policy.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
