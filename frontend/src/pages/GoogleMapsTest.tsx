import React from "react";
import { GoogleMapsDistanceDemo } from "../components/location/GoogleMapsDistanceDemo";

const GoogleMapsTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <GoogleMapsDistanceDemo />
    </div>
  );
};

export default GoogleMapsTestPage;
