import { Brand, Outlet } from '../types/brand';
import { MenuItem, MenuCategory } from '../types/menu';

export const mockBrands: Brand[] = [
  {
    id: '1',
    name: "McDonald's",
    description: 'Burgers, Fries & Beverages',
    logo: 'https://images.pexels.com/photos/4393021/pexels-photo-4393021.jpeg?auto=compress&cs=tinysrgb&w=200',
    coverImage: 'https://images.pexels.com/photos/580612/pexels-photo-580612.jpeg?auto=compress&cs=tinysrgb&w=800',
    cuisines: ['American', 'Fast Food', 'Burgers'],
    rating: 4.2,
    totalReviews: 1250,
    isActive: true,
    tags: ['Fast Delivery', 'Popular'],
    offers: [
      {
        id: '1',
        title: '20% OFF',
        description: 'On orders above ₹299',
        discount: 20,
        minOrder: 299,
        validUntil: '2024-02-28',
        code: 'SAVE20',
        isActive: true,
      }
    ],
    outlets: [
      {
        id: '1',
        brandId: '1',
        brandName: "McDonald's",
        name: "McDonald's - Bandra West",
        address: {
          street: '123 Hill Road',
          area: 'Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400050',
          coordinates: { lat: 19.0596, lng: 72.8295 }
        },
        phone: '+91 98765 43210',
        operatingHours: {
          monday: { open: '07:00', close: '23:00', isOpen: true },
          tuesday: { open: '07:00', close: '23:00', isOpen: true },
          wednesday: { open: '07:00', close: '23:00', isOpen: true },
          thursday: { open: '07:00', close: '23:00', isOpen: true },
          friday: { open: '07:00', close: '23:00', isOpen: true },
          saturday: { open: '07:00', close: '23:00', isOpen: true },
          sunday: { open: '07:00', close: '23:00', isOpen: true },
        },
        deliveryRadius: 5,
        deliveryFee: 29,
        minimumOrder: 199,
        estimatedDeliveryTime: '25-35 mins',
        isActive: true,
        hasDelivery: true,
        hasPickup: true,
        rating: 4.1,
        reviewCount: 456
      },
      {
        id: '2',
        brandId: '1',
        brandName: "McDonald's",
        name: "McDonald's - Andheri East",
        address: {
          street: '456 WE Highway',
          area: 'Andheri East',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400069',
          coordinates: { lat: 19.1136, lng: 72.8697 }
        },
        phone: '+91 98765 43211',
        operatingHours: {
          monday: { open: '07:00', close: '23:00', isOpen: true },
          tuesday: { open: '07:00', close: '23:00', isOpen: true },
          wednesday: { open: '07:00', close: '23:00', isOpen: true },
          thursday: { open: '07:00', close: '23:00', isOpen: true },
          friday: { open: '07:00', close: '23:00', isOpen: true },
          saturday: { open: '07:00', close: '23:00', isOpen: true },
          sunday: { open: '07:00', close: '23:00', isOpen: true },
        },
        deliveryRadius: 4,
        deliveryFee: 35,
        minimumOrder: 199,
        estimatedDeliveryTime: '30-40 mins',
        isActive: true,
        hasDelivery: true,
        hasPickup: true,
        rating: 4.3,
        reviewCount: 789
      }
    ]
  },
  {
    id: '2',
    name: 'Pizza Hut',
    description: 'Pizza, Sides & Desserts',
    logo: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=200',
    coverImage: 'https://images.pexels.com/photos/1566837/pexels-photo-1566837.jpeg?auto=compress&cs=tinysrgb&w=800',
    cuisines: ['Italian', 'Pizza', 'Fast Food'],
    rating: 4.0,
    totalReviews: 980,
    isActive: true,
    tags: ['Great Offers', 'Pizza'],
    offers: [
      {
        id: '2',
        title: 'Buy 1 Get 1',
        description: 'On all medium pizzas',
        discount: 50,
        minOrder: 399,
        validUntil: '2024-02-29',
        code: 'BOGO',
        isActive: true,
      }
    ],
    outlets: [
      {
        id: '3',
        brandId: '2',
        brandName: 'Pizza Hut',
        name: 'Pizza Hut - Powai',
        address: {
          street: '789 Central Avenue',
          area: 'Powai',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400076',
          coordinates: { lat: 19.1197, lng: 72.9059 }
        },
        phone: '+91 98765 43212',
        operatingHours: {
          monday: { open: '11:00', close: '23:30', isOpen: true },
          tuesday: { open: '11:00', close: '23:30', isOpen: true },
          wednesday: { open: '11:00', close: '23:30', isOpen: true },
          thursday: { open: '11:00', close: '23:30', isOpen: true },
          friday: { open: '11:00', close: '23:30', isOpen: true },
          saturday: { open: '11:00', close: '23:30', isOpen: true },
          sunday: { open: '11:00', close: '23:30', isOpen: true },
        },
        deliveryRadius: 6,
        deliveryFee: 25,
        minimumOrder: 299,
        estimatedDeliveryTime: '35-45 mins',
        isActive: true,
        hasDelivery: true,
        hasPickup: true,
        rating: 3.9,
        reviewCount: 342
      }
    ]
  },
  {
    id: '3',
    name: 'Subway',
    description: 'Healthy Subs & Salads',
    logo: 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=200',
    coverImage: 'https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg?auto=compress&cs=tinysrgb&w=800',
    cuisines: ['Healthy', 'Sandwiches', 'Salads'],
    rating: 4.1,
    totalReviews: 567,
    isActive: true,
    tags: ['Healthy', 'Fresh'],
    offers: [],
    outlets: [
      {
        id: '4',
        brandId: '3',
        brandName: 'Subway',
        name: 'Subway - Lower Parel',
        address: {
          street: '101 Phoenix Mills',
          area: 'Lower Parel',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400013',
          coordinates: { lat: 19.0144, lng: 72.8317 }
        },
        phone: '+91 98765 43213',
        operatingHours: {
          monday: { open: '08:00', close: '22:00', isOpen: true },
          tuesday: { open: '08:00', close: '22:00', isOpen: true },
          wednesday: { open: '08:00', close: '22:00', isOpen: true },
          thursday: { open: '08:00', close: '22:00', isOpen: true },
          friday: { open: '08:00', close: '22:00', isOpen: true },
          saturday: { open: '08:00', close: '22:00', isOpen: true },
          sunday: { open: '08:00', close: '22:00', isOpen: true },
        },
        deliveryRadius: 3,
        deliveryFee: 30,
        minimumOrder: 149,
        estimatedDeliveryTime: '20-30 mins',
        isActive: true,
        hasDelivery: true,
        hasPickup: true,
        rating: 4.0,
        reviewCount: 234
      }
    ]
  }
];

export const mockMenuData: { [outletId: string]: MenuCategory[] } = {
  '1': [
    {
      id: '1',
      name: 'Burgers',
      description: 'Our signature burgers made fresh',
      isActive: true,
      items: [
        {
          id: '1',
          name: 'Big Mac',
          description: 'Two all-beef patties, special sauce, lettuce, cheese, pickles, onions on a sesame seed bun',
          price: 199,
          image: 'https://images.pexels.com/photos/552056/pexels-photo-552056.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Burgers',
          isVeg: false,
          isAvailable: true,
          tags: ['Popular', 'Signature'],
          customizations: [
            {
              id: '1',
              name: 'Make it a Meal',
              required: false,
              maxSelections: 1,
              options: [
                { id: '1', name: 'Medium Meal (+₹89)', price: 89, isDefault: false },
                { id: '2', name: 'Large Meal (+₹109)', price: 109, isDefault: false }
              ]
            }
          ]
        },
        {
          id: '2',
          name: 'Chicken Maharaja Mac',
          description: 'Chicken patty with cheese, onions, tomatoes and thousand island sauce',
          price: 219,
          image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Burgers',
          isVeg: false,
          isAvailable: true,
          tags: ['Spicy', 'Indian Taste'],
          customizations: []
        },
        {
          id: '3',
          name: 'McVeggie Burger',
          description: 'Vegetarian patty with fresh lettuce and mayo',
          price: 149,
          image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Burgers',
          isVeg: true,
          isAvailable: true,
          tags: ['Vegetarian', 'Healthy'],
          customizations: []
        }
      ]
    },
    {
      id: '2',
      name: 'Sides & Beverages',
      description: 'Complete your meal',
      isActive: true,
      items: [
        {
          id: '4',
          name: 'French Fries',
          description: 'Golden and crispy french fries',
          price: 89,
          image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Sides',
          isVeg: true,
          isAvailable: true,
          tags: ['Crispy', 'Popular'],
          customizations: [
            {
              id: '2',
              name: 'Size',
              required: true,
              maxSelections: 1,
              options: [
                { id: '3', name: 'Medium', price: 0, isDefault: true },
                { id: '4', name: 'Large (+₹30)', price: 30, isDefault: false }
              ]
            }
          ]
        },
        {
          id: '5',
          name: 'Coca Cola',
          description: 'Chilled Coca Cola',
          price: 65,
          image: 'https://images.pexels.com/photos/2775860/pexels-photo-2775860.jpeg?auto=compress&cs=tinysrgb&w=400',
          category: 'Beverages',
          isVeg: true,
          isAvailable: true,
          tags: ['Cold', 'Refreshing'],
          customizations: []
        }
      ]
    }
  ]
};