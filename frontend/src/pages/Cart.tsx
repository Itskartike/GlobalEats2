import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Percent,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/Button";
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
      <div className="min-h-screen bg-stone-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Continue Shopping
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto px-4">
              Looks like you haven't added any delicious items yet.
              Let's find something amazing!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center px-6">
              <Link to="/restaurants">
                <Button size="lg" className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 rounded-xl shadow-lg shadow-orange-200/50">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Restaurants
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="lg" className="rounded-xl">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-stone-50 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                to="/"
                className="inline-flex items-center text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors mb-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Your Cart <span className="text-gray-400 font-normal text-base">({itemCount})</span>
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items by Brand */}
            <div className="lg:col-span-2 space-y-4">
              {brands.map((brand) => (
                <motion.div
                  key={brand.brandId}
                  layout
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  {/* Brand Header */}
                  <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-rose-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {brand.brandName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{brand.brandName}</h3>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {brand.outletName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 25-35 min
                      </span>
                      <button
                        onClick={() => clearBrandCart(brand.brandId)}
                        className="text-xs text-red-400 hover:text-red-500 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {brand.items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center gap-3 px-5 py-4"
                        >
                          {/* Image */}
                          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <div className={`w-3 h-3 border-[1.5px] rounded-sm flex items-center justify-center ${
                                item.isVeg ? "border-green-600" : "border-red-600"
                              }`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                          </div>

                          {/* Quantity Stepper */}
                          <div className="flex items-center bg-gradient-to-r from-orange-500 to-rose-500 rounded-xl overflow-hidden shadow-md shadow-orange-200/30">
                            <button
                              onClick={() => handleQuantityChange(item.id, brand.brandId, item.quantity - 1)}
                              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                            >
                              {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                            </button>
                            <span className="w-8 text-center text-white font-semibold text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, brand.brandId, item.quantity + 1)}
                              className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Brand Subtotal */}
                  <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal ({getBrandItemCount(brand.brandId)} items)
                    </span>
                    <span className="font-semibold text-gray-900">₹{getBrandSubtotal(brand.brandId)}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Order Summary - Sticky on desktop */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-20 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-gray-900">Order Summary</h3>
                </div>
                
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delivery Fee</span>
                    <span className="font-medium">
                      ₹{brands.reduce((total, brand) => total + brand.deliveryFee, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxes & Fees</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>

                  {/* Promo Code */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-300 transition-all"
                          disabled={isPromoApplied}
                        />
                      </div>
                      <button
                        onClick={applyPromoCode}
                        disabled={isPromoApplied || !promoCode.trim()}
                        className="px-4 py-2.5 bg-orange-50 text-orange-600 text-sm font-medium rounded-xl hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                    {isPromoApplied && (
                      <div className="flex items-center gap-1.5 mt-2 text-green-600 text-xs font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        WELCOME10 applied — 10% off!
                      </div>
                    )}
                  </div>

                  {isPromoApplied && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount (10%)</span>
                      <span className="font-medium">-₹{(subtotal * 0.1).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="font-bold text-gray-900 text-lg">
                        ₹{isPromoApplied ? (total - subtotal * 0.1).toFixed(2) : total}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 rounded-xl shadow-lg shadow-orange-200/50 py-3"
                    size="lg"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  <p className="text-[10px] text-gray-400 text-center mt-3 leading-relaxed">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Checkout Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/60 p-4 z-40">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div>
              <p className="text-xs text-gray-500">{itemCount} items</p>
              <p className="font-bold text-gray-900">
                ₹{isPromoApplied ? (total - subtotal * 0.1).toFixed(2) : total}
              </p>
            </div>
            <Button
              onClick={handleCheckout}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 border-0 rounded-xl shadow-lg shadow-orange-200/30 px-8"
            >
              Checkout
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
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
