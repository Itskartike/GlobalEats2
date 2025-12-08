import React, { useEffect, useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import { Brand } from '../types/brand';

export const ApiTest: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        const data = await restaurantService.getRestaurants();
        setRestaurants(data);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch restaurants';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  if (loading) {
    return <div className="p-4">Loading restaurants...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <h3 className="text-red-800 font-semibold">API Connection Error</h3>
        <p className="text-red-600">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Make sure the backend server is running on http://localhost:5000
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">API Test - Restaurants</h3>
      <div className="space-y-2">
        {restaurants.map((restaurant) => (
          <div key={restaurant.id} className="p-3 bg-gray-50 rounded">
            <h4 className="font-medium">{restaurant.name}</h4>
            <p className="text-sm text-gray-600">{restaurant.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
