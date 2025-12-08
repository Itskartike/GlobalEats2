import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { useCartStore } from "../../../store/cartStore";

export const CartDrawer: React.FC = () => {
  const {
    items,
    brandName,
    outletName,
    outletAddress,
    updateQuantity,
    removeItem,
    getSubtotal,
    getTax,
    getTotal,
    deliveryFee,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Your cart is empty
        </h3>
        <p className="text-gray-600 text-sm">
          Add items from the menu to get started
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Cart Header */}
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
      </div>

      {/* Restaurant Info */}
      {brandName && outletName && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <p className="font-medium text-gray-900">{brandName}</p>
          <p className="text-sm text-gray-600">{outletName}</p>
        </div>
      )}

      {/* Cart Items */}
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-gray-100 pb-3 last:border-b-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-1">
                    {item.isVeg ? (
                      <div className="w-3 h-3 border border-green-500 flex items-center justify-center mt-0.5">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      </div>
                    ) : (
                      <div className="w-3 h-3 border border-red-500 flex items-center justify-center mt-0.5">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                    <h4 className="font-medium text-gray-900 text-sm">
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-medium text-gray-900 min-w-6 text-center text-sm">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  ₹{item.price} each
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Order Summary */}
      <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">₹{getSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Delivery Fee</span>
          <span className="font-medium">₹{deliveryFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Taxes</span>
          <span className="font-medium">₹{getTax().toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>₹{getTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <Link to="/checkout">
        <Button variant="primary" size="lg" className="w-full">
          Proceed to Checkout
        </Button>
      </Link>
    </Card>
  );
};
