import React from "react";
import { Clock, CheckCircle } from "lucide-react";

const VendorPending: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock size={40} className="text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Application Under Review</h1>
        <p className="text-gray-600 mb-6">
          Thank you for registering! Your vendor application is currently being reviewed by our team.
          This usually takes 1-2 business days.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600 text-left">
            <li className="flex items-start">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
              Our team reviews your business details and documents
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
              You'll receive an email once your application is approved
            </li>
            <li className="flex items-start">
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
              After approval, you can start adding brands, outlets, and menus
            </li>
          </ul>
        </div>
        <button
          onClick={onLogout}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default VendorPending;
