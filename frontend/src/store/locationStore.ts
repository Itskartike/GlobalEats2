import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocationStore {
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
  selectedCity: string;
  selectedArea: string;
  deliveryAddress: any | null;
  
  setCurrentLocation: (location: { lat: number; lng: number }) => void;
  setSelectedArea: (city: string, area: string) => void;
  setDeliveryAddress: (address: any) => void;
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      currentLocation: null,
      selectedCity: 'Mumbai',
      selectedArea: 'Bandra West',
      deliveryAddress: null,

      setCurrentLocation: (location) => {
        set({ currentLocation: location });
      },

      setSelectedArea: (city, area) => {
        set({ selectedCity: city, selectedArea: area });
      },

      setDeliveryAddress: (address) => {
        set({ deliveryAddress: address });
      },
    }),
    {
      name: 'global-eats-location',
    }
  )
);