export interface Order {
  id: string;
  customerId: string;
  brandId: string;
  brandName: string;
  outletId: string;
  outletName: string;
  outletAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: Address;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  specialInstructions?: string;
  estimatedDeliveryTime: string;
  placedAt: Date;
  updatedAt: Date;
  tracking?: OrderTracking;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: SelectedCustomization[];
  specialInstructions?: string;
}

export interface SelectedCustomization {
  customizationId: string;
  name: string;
  selectedOptions: {
    id: string;
    name: string;
    price: number;
  }[];
}

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready_for_pickup' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  instructions?: string;
}

export interface OrderTracking {
  status: OrderStatus;
  estimatedTime: string;
  actualTime?: string;
  driverInfo?: {
    name: string;
    phone: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  updates: TrackingUpdate[];
}

export interface TrackingUpdate {
  status: OrderStatus;
  timestamp: Date;
  message: string;
}

export interface CreateOrderData {
  restaurantId: string;
  items: {
    menuItemId: string;
    quantity: number;
    customizations?: SelectedCustomization[];
    specialInstructions?: string;
  }[];
  deliveryAddressId: string;
  paymentMethod: string;
  specialInstructions?: string;
  couponCode?: string;
}