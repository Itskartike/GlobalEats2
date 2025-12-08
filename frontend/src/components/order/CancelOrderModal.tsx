import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Order } from "../../services/orderService";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, reason?: string) => void;
  order: Order | null;
  isLoading?: boolean;
}

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const commonReasons = [
    "Changed my mind",
    "Ordered by mistake",
    "Taking too long",
    "Found a better option",
    "Address/timing issues",
    "Other",
  ];

  const handleSubmit = () => {
    if (!order) return;

    const finalReason = selectedReason === "Other" ? reason : selectedReason;
    onConfirm(order.id, finalReason || "No reason provided");
    handleClose();
  };

  const handleClose = () => {
    setReason("");
    setSelectedReason("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && order && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-lg shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cancel Order
                    </h2>
                    <p className="text-sm text-gray-500">
                      Order #{order?.orderNumber || order?.id || "N/A"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel this order? This action cannot
                  be undone.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for cancellation (optional)
                    </label>
                    <div className="space-y-2">
                      {commonReasons.map((reasonOption) => (
                        <label
                          key={reasonOption}
                          className="flex items-center space-x-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="reason"
                            value={reasonOption}
                            checked={selectedReason === reasonOption}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="text-red-600 focus:ring-red-500"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-700">
                            {reasonOption}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedReason === "Other" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Please specify
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter your reason..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                        rows={3}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Keep Order
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? "Cancelling..." : "Cancel Order"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
