import React, { useState } from "react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Badge } from "../../ui/Badge";
import { AddressMapModal } from "./AddressMapModal";

interface Address {
  id: string;
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
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

interface AddressListProps {
  addresses: Address[];
  onAddAddress: (address: AddressFormData) => Promise<void>;
  onUpdateAddress: (id: string, address: AddressFormData) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  onSelectAddress?: (address: Address) => void;
  selectedAddressId?: string;
  isLoading?: boolean;
  showSelection?: boolean;
}

export const AddressList: React.FC<AddressListProps> = ({
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefault,
  onSelectAddress,
  selectedAddressId,
  isLoading = false,
  showSelection = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );

  const handleAddAddress = async (addressData: AddressFormData) => {
    await onAddAddress(addressData);
    setIsModalOpen(false);
  };

  const handleUpdateAddress = async (addressData: AddressFormData) => {
    if (editingAddress) {
      await onUpdateAddress(editingAddress.id, addressData);
      setEditingAddress(null);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setLoadingActions((prev) => ({ ...prev, [`delete-${id}`]: true }));
      try {
        await onDeleteAddress(id);
      } finally {
        setLoadingActions((prev) => ({ ...prev, [`delete-${id}`]: false }));
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    setLoadingActions((prev) => ({ ...prev, [`default-${id}`]: true }));
    try {
      await onSetDefault(id);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`default-${id}`]: false }));
    }
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

  const formatAddress = (address: Address) => {
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

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {showSelection ? "Select Delivery Address" : "Saved Addresses"}
        </h3>
        <Button onClick={() => setIsModalOpen(true)}>Add New Address</Button>
      </div>

      {/* Address Cards */}
      {addresses.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-lg font-medium">No addresses saved yet</p>
            <p className="text-sm">Add your first address to start ordering</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            Add Your First Address
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`p-4 transition-all duration-200 ${
                showSelection
                  ? selectedAddressId === address.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:ring-1 hover:ring-gray-300 cursor-pointer"
                  : ""
              }`}
              onClick={() => showSelection && onSelectAddress?.(address)}
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
                    <p>{address.phone}</p>
                    {address.instructions && (
                      <p className="text-gray-500 italic">
                        Instructions: {address.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {!showSelection && (
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingAddress(address)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeleteAddress(address.id)}
                        isLoading={loadingActions[`delete-${address.id}`]}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                    {!address.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(address.id)}
                        isLoading={loadingActions[`default-${address.id}`]}
                      >
                        Set Default
                      </Button>
                    )}
                  </div>
                )}

                {showSelection && selectedAddressId === address.id && (
                  <div className="ml-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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

      {/* Add/Edit Address Modal */}
      <AddressMapModal
        isOpen={isModalOpen || !!editingAddress}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={editingAddress ? handleUpdateAddress : handleAddAddress}
        initialAddress={editingAddress || undefined}
        title={editingAddress ? "Edit Address" : "Add New Address"}
      />
    </div>
  );
};
