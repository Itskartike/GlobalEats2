import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  addressService,
  type Address,
  type CreateAddressData,
} from "../services/addressService";

interface AddressState {
  // State
  addresses: Address[];
  selectedAddress: Address | null;
  defaultAddress: Address | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchAddresses: () => Promise<void>;
  fetchDefaultAddress: () => Promise<void>;
  createAddress: (addressData: CreateAddressData) => Promise<Address>;
  updateAddress: (
    addressId: string,
    addressData: Partial<CreateAddressData>
  ) => Promise<Address>;
  deleteAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<Address>;
  setSelectedAddress: (address: Address | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  addresses: [],
  selectedAddress: null,
  defaultAddress: null,
  isLoading: false,
  error: null,
};

export const useAddressStore = create<AddressState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Fetch all user addresses
    fetchAddresses: async () => {
      try {
        set({ isLoading: true, error: null });

        const addresses = await addressService.getAddresses();
        const defaultAddress =
          addresses.find((addr) => addr.is_default) || null;

        set({
          addresses,
          defaultAddress,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch addresses";
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    // Fetch default address
    fetchDefaultAddress: async () => {
      try {
        set({ isLoading: true, error: null });

        const defaultAddress = await addressService.getDefaultAddress();

        set({
          defaultAddress,
          selectedAddress: defaultAddress || get().selectedAddress,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch default address";
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    // Create new address
    createAddress: async (addressData: CreateAddressData) => {
      try {
        set({ isLoading: true, error: null });

        const newAddress = await addressService.createAddress(addressData);

        // Update local state
        const currentAddresses = get().addresses;
        const updatedAddresses = [...currentAddresses, newAddress];

        // If this is set as default, update other addresses
        let defaultAddress = get().defaultAddress;
        if (newAddress.is_default) {
          defaultAddress = newAddress;
          // Remove default from other addresses in local state
          updatedAddresses.forEach((addr) => {
            if (addr.id !== newAddress.id) {
              addr.is_default = false;
            }
          });
        }

        set({
          addresses: updatedAddresses,
          defaultAddress,
          isLoading: false,
        });

        return newAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create address";
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Update address
    updateAddress: async (
      addressId: string,
      addressData: Partial<CreateAddressData>
    ) => {
      try {
        set({ isLoading: true, error: null });

        const updatedAddress = await addressService.updateAddress(
          addressId,
          addressData
        );

        // Update local state
        const currentAddresses = get().addresses;
        const updatedAddresses = currentAddresses.map((addr) =>
          addr.id === addressId ? updatedAddress : addr
        );

        set({
          addresses: updatedAddresses,
          isLoading: false,
        });

        // Update selected address if it was the one being updated
        const selectedAddress = get().selectedAddress;
        if (selectedAddress && selectedAddress.id === addressId) {
          set({ selectedAddress: updatedAddress });
        }

        return updatedAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update address";
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Delete address
    deleteAddress: async (addressId: string) => {
      try {
        set({ isLoading: true, error: null });

        await addressService.deleteAddress(addressId);

        // Update local state
        const currentAddresses = get().addresses;
        const updatedAddresses = currentAddresses.filter(
          (addr) => addr.id !== addressId
        );

        // Update selected address if it was deleted
        const selectedAddress = get().selectedAddress;
        let newSelectedAddress = selectedAddress;
        if (selectedAddress && selectedAddress.id === addressId) {
          newSelectedAddress = null;
        }

        // Update default address if it was deleted
        const defaultAddress = get().defaultAddress;
        let newDefaultAddress = defaultAddress;
        if (defaultAddress && defaultAddress.id === addressId) {
          newDefaultAddress =
            updatedAddresses.find((addr) => addr.is_default) || null;
        }

        set({
          addresses: updatedAddresses,
          selectedAddress: newSelectedAddress,
          defaultAddress: newDefaultAddress,
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete address";
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Set address as default
    setDefaultAddress: async (addressId: string) => {
      try {
        set({ isLoading: true, error: null });

        const defaultAddress =
          await addressService.setDefaultAddress(addressId);

        // Update local state - remove default from all addresses and set new default
        const currentAddresses = get().addresses;
        const updatedAddresses = currentAddresses.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }));

        set({
          addresses: updatedAddresses,
          defaultAddress,
          isLoading: false,
        });

        return defaultAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to set default address";
        set({
          error: errorMessage,
          isLoading: false,
        });
        throw error;
      }
    },

    // Set selected address for checkout
    setSelectedAddress: (address: Address | null) => {
      set({ selectedAddress: address });
    },

    // Clear error
    clearError: () => {
      set({ error: null });
    },

    // Reset store
    reset: () => {
      set(initialState);
    },
  }))
);

// Selector hooks for easier access
export const useAddresses = () => useAddressStore((state) => state.addresses);
export const useSelectedAddress = () =>
  useAddressStore((state) => state.selectedAddress);
export const useDefaultAddress = () =>
  useAddressStore((state) => state.defaultAddress);
export const useAddressLoading = () =>
  useAddressStore((state) => state.isLoading);
export const useAddressError = () => useAddressStore((state) => state.error);
