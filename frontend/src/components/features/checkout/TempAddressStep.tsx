import React from "react";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { MapPin } from "lucide-react";

interface TempAddressStepProps {
  onNext: () => void;
  onBack: () => void;
}

export const TempAddressStep: React.FC<TempAddressStepProps> = ({
  onNext,
  onBack,
}) => {
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

      {/* Temporary placeholder */}
      <Card className="p-8 text-center">
        <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Address & Map Integration Ready!
        </h3>
        <p className="text-gray-600 mb-4">
          Backend APIs are set up. Google Maps integration is ready.
          <br />
          Add your Google Maps API key to .env to enable full functionality.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Next Step:</strong> Add{" "}
            <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key</code> to your .env file
          </p>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="secondary" onClick={onBack}>
          Back to Cart
        </Button>
        <Button onClick={onNext}>Continue to Payment (Test)</Button>
      </div>
    </div>
  );
};
