import React, { useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { AddressMapModal } from "../location/AddressMapModal";
import {
  useAddressStore,
  useSelectedAddress,
  useAddresses,
} from "../../../store/addressStore";
import { useAuthStore } from "../../../store/authStore";
import { Address as AddressType } from "../../../services/addressService";
import TokenManager from "../../../utils/tokenManager";

interface AddressFormData {
  label: string;
  recipient_name: string;
  phone: string;
  street_address: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  address_type: "home" | "work" | "other";
  landmark?: string;
  instructions?: string;
  is_default?: boolean;
}

interface AddressSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const AddressSelectionStep: React.FC<AddressSelectionStepProps> = ({
  onNext,
  onBack,
}) => {
  const { isAuthenticated } = useAuthStore();
  const addresses = useAddresses();
  const selectedAddress = useSelectedAddress();
  const {
    fetchAddresses,
    createAddress,
    setSelectedAddress,
    isLoading,
    error,
  } = useAddressStore();

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Only fetch addresses if user is authenticated and tokens are present
    if (isAuthenticated && TokenManager.hasValidTokens()) {
      fetchAddresses();
    }
  }, [fetchAddresses, isAuthenticated]);

  const handleSelectAddress = (address: AddressType) => {
    setSelectedAddress(address);
  };

  const handleAddAddress = async (addressData: AddressFormData) => {
    await createAddress(addressData);
    setShowAddModal(false);
  };

  const formatAddress = (address: AddressType) => {
    const parts = [
      address.street_address,
      address.apartment,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case "home":
        return "🏠";
      case "work":
        return "🏢";
      default:
        return "📍";
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case "home":
        return "bg-green-100 text-green-800";
      case "work":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
          1
        </div>
        <div>
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          <p className="text-sm text-gray-600">
            Choose where you want your order delivered
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Authentication Check */}
      {!isAuthenticated ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            Please sign in to manage your delivery addresses
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/'}>
            Sign In
          </Button>
        </Card>
      ) : (
        <>
          {/* Quick Add Address Button */}
          <Card className="p-4 border-dashed border-2 border-gray-300">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Address</span>
            </button>
          </Card>

      {/* Address List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No addresses saved yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first address to continue with checkout
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                selectedAddress?.id === address.id
                  ? "ring-2 ring-orange-500 bg-orange-50"
                  : "hover:ring-1 hover:ring-gray-300"
              }`}
              onClick={() => handleSelectAddress(address)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {getAddressTypeIcon(address.address_type)}
                    </span>
                    <h4 className="font-semibold text-gray-900">
                      {address.label}
                    </h4>
                    <Badge
                      className={getAddressTypeColor(address.address_type)}
                    >
                      {address.address_type}
                    </Badge>
                    {address.is_default && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Default
                      </Badge>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="font-medium">{address.recipient_name}</p>
                    <p>{formatAddress(address)}</p>
                    <p className="flex items-center gap-1">
                      <span>📞</span>
                      {address.phone}
                    </p>
                    {address.instructions && (
                      <p className="text-gray-500 italic">
                        Instructions: {address.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {selectedAddress?.id === address.id && (
                  <div className="ml-4">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Address Summary */}
      {selectedAddress && (
        <Card className="p-4 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900">
                Delivering to: {selectedAddress.label}
              </h4>
              <p className="text-sm text-orange-700">
                {selectedAddress.recipient_name} • {selectedAddress.phone}
              </p>
              <p className="text-sm text-orange-600">
                {formatAddress(selectedAddress)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back to Cart
        </Button>
        <Button onClick={onNext} disabled={!selectedAddress}>
          Continue to Payment
        </Button>
      </div>

          {/* Add Address Modal */}
          <AddressMapModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddAddress}
            title="Add Delivery Address"
          />
        </>
      )}
    </div>
  );
};
