export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses: Address[];
  preferences: UserPreferences;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UserPreferences {
  dietary: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free')[];
  cuisines: string[];
  priceRange: 'budget' | 'mid-range' | 'premium' | 'all';
  notifications: {
    orderUpdates: boolean;
    offers: boolean;
    newsletter: boolean;
    push: boolean;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}