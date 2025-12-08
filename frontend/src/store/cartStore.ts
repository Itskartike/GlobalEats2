import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  brandName: string;
  outletId: string;
  outletName: string;
  isVeg: boolean;
  quantity: number;
  customizations?: unknown[];
  specialInstructions?: string;
}

export interface BrandCart {
  brandId: string;
  brandName: string;
  outletId: string;
  outletName: string;
  outletAddress: string;
  deliveryFee: number;
  items: CartItem[];
}

interface CartStore {
  brands: BrandCart[];

  addItem: (
    item: Omit<CartItem, "quantity">,
    outletInfo: {
      brandId: string;
      brandName: string;
      outletId: string;
      outletName: string;
      outletAddress: string;
      deliveryFee: number;
    }
  ) => void;
  removeItem: (itemId: string, brandId: string) => void;
  updateQuantity: (itemId: string, brandId: string, quantity: number) => void;
  clearCart: () => void;
  clearBrandCart: (brandId: string) => void;

  // Legacy methods for backward compatibility
  items: CartItem[];
  brandId: string | null;
  brandName: string | null;
  outletId: string | null;
  outletName: string | null;
  outletAddress: string | null;
  deliveryFee: number;
  setOutletInfo: (outletInfo: {
    brandId: string;
    brandName: string;
    outletId: string;
    outletName: string;
    outletAddress: string;
    deliveryFee: number;
  }) => void;

  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  getItemQuantity: (itemId: string) => number;
  getTotalItems: () => number;

  // New multi-brand methods
  getBrandSubtotal: (brandId: string) => number;
  getBrandItemCount: (brandId: string) => number;
  getAllItemsFlat: () => CartItem[];
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      brands: [],

      // Legacy properties for backward compatibility
      items: [],
      brandId: null,
      brandName: null,
      outletId: null,
      outletName: null,
      outletAddress: null,
      deliveryFee: 0,

      addItem: (item, outletInfo) => {
        const state = get();
        let targetBrand = state.brands.find(
          (brand) => brand.brandId === outletInfo.brandId
        );

        if (!targetBrand) {
          // Create new brand cart
          targetBrand = {
            brandId: outletInfo.brandId,
            brandName: outletInfo.brandName,
            outletId: outletInfo.outletId,
            outletName: outletInfo.outletName,
            outletAddress: outletInfo.outletAddress,
            deliveryFee: outletInfo.deliveryFee,
            items: [],
          };
        }

        const existingItemIndex = targetBrand.items.findIndex(
          (cartItem) => cartItem.id === item.id
        );

        if (existingItemIndex > -1) {
          targetBrand.items[existingItemIndex].quantity += 1;
        } else {
          targetBrand.items.push({ ...item, quantity: 1 });
        }

        const updatedBrands = state.brands.filter(
          (brand) => brand.brandId !== outletInfo.brandId
        );
        updatedBrands.push(targetBrand);

        // Update legacy items array for backward compatibility
        const allItems = updatedBrands.flatMap((brand) => brand.items);

        set({
          brands: updatedBrands,
          items: allItems,
          brandId: updatedBrands.length === 1 ? updatedBrands[0].brandId : null,
          brandName:
            updatedBrands.length === 1 ? updatedBrands[0].brandName : null,
          outletId:
            updatedBrands.length === 1 ? updatedBrands[0].outletId : null,
          outletName:
            updatedBrands.length === 1 ? updatedBrands[0].outletName : null,
          outletAddress:
            updatedBrands.length === 1 ? updatedBrands[0].outletAddress : null,
          deliveryFee:
            updatedBrands.length === 1 ? updatedBrands[0].deliveryFee : 0,
        });
      },

      removeItem: (itemId, brandId) => {
        const state = get();
        const updatedBrands = state.brands
          .map((brand) => {
            if (brand.brandId === brandId) {
              return {
                ...brand,
                items: brand.items.filter((item) => item.id !== itemId),
              };
            }
            return brand;
          })
          .filter((brand) => brand.items.length > 0); // Remove empty brands

        const allItems = updatedBrands.flatMap((brand) => brand.items);

        set({
          brands: updatedBrands,
          items: allItems,
          brandId: updatedBrands.length === 1 ? updatedBrands[0].brandId : null,
          brandName:
            updatedBrands.length === 1 ? updatedBrands[0].brandName : null,
          outletId:
            updatedBrands.length === 1 ? updatedBrands[0].outletId : null,
          outletName:
            updatedBrands.length === 1 ? updatedBrands[0].outletName : null,
          outletAddress:
            updatedBrands.length === 1 ? updatedBrands[0].outletAddress : null,
          deliveryFee:
            updatedBrands.length === 1 ? updatedBrands[0].deliveryFee : 0,
        });
      },

      updateQuantity: (itemId, brandId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId, brandId);
          return;
        }

        const state = get();
        const updatedBrands = state.brands.map((brand) => {
          if (brand.brandId === brandId) {
            return {
              ...brand,
              items: brand.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item
              ),
            };
          }
          return brand;
        });

        const allItems = updatedBrands.flatMap((brand) => brand.items);

        set({
          brands: updatedBrands,
          items: allItems,
        });
      },

      clearCart: () => {
        set({
          brands: [],
          items: [],
          brandId: null,
          brandName: null,
          outletId: null,
          outletName: null,
          outletAddress: null,
          deliveryFee: 0,
        });
      },

      clearBrandCart: (brandId) => {
        const state = get();
        const updatedBrands = state.brands.filter(
          (brand) => brand.brandId !== brandId
        );
        const allItems = updatedBrands.flatMap((brand) => brand.items);

        set({
          brands: updatedBrands,
          items: allItems,
          brandId: updatedBrands.length === 1 ? updatedBrands[0].brandId : null,
          brandName:
            updatedBrands.length === 1 ? updatedBrands[0].brandName : null,
          outletId:
            updatedBrands.length === 1 ? updatedBrands[0].outletId : null,
          outletName:
            updatedBrands.length === 1 ? updatedBrands[0].outletName : null,
          outletAddress:
            updatedBrands.length === 1 ? updatedBrands[0].outletAddress : null,
          deliveryFee:
            updatedBrands.length === 1 ? updatedBrands[0].deliveryFee : 0,
        });
      },

      setOutletInfo: (outletInfo) => {
        set(outletInfo);
      },

      getSubtotal: () => {
        const state = get();
        return state.brands.reduce((total, brand) => {
          return (
            total +
            brand.items.reduce((brandTotal, item) => {
              return brandTotal + item.price * item.quantity;
            }, 0)
          );
        }, 0);
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return subtotal * 0.05; // 5% tax
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const tax = get().getTax();
        const totalDeliveryFees = get().brands.reduce(
          (total, brand) => total + brand.deliveryFee,
          0
        );
        return subtotal + tax + totalDeliveryFees;
      },

      getItemCount: () => {
        const state = get();
        return state.brands.reduce((total, brand) => {
          return (
            total +
            brand.items.reduce(
              (brandTotal, item) => brandTotal + item.quantity,
              0
            )
          );
        }, 0);
      },

      getItemQuantity: (itemId) => {
        const state = get();
        for (const brand of state.brands) {
          const item = brand.items.find((item) => item.id === itemId);
          if (item) return item.quantity;
        }
        return 0;
      },

      getTotalItems: () => {
        return get().getItemCount();
      },

      getBrandSubtotal: (brandId) => {
        const state = get();
        const brand = state.brands.find((b) => b.brandId === brandId);
        if (!brand) return 0;
        return brand.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getBrandItemCount: (brandId) => {
        const state = get();
        const brand = state.brands.find((b) => b.brandId === brandId);
        if (!brand) return 0;
        return brand.items.reduce((total, item) => total + item.quantity, 0);
      },

      getAllItemsFlat: () => {
        const state = get();
        return state.brands.flatMap((brand) => brand.items);
      },
    }),
    {
      name: "global-eats-cart",
    }
  )
);
