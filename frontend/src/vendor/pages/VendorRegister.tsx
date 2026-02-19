import React, { useState } from "react";
import vendorService from "../services/vendorService";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface VendorRegisterProps {
  onRegister: () => void;
  onSwitchToLogin: () => void;
}

const STEPS = ["Account", "Business", "Bank Details", "Review"];

const VendorRegister: React.FC<VendorRegisterProps> = ({ onRegister, onSwitchToLogin }) => {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    business_name: "",
    business_type: "restaurant",
    description: "",
    gst_number: "",
    fssai_license: "",
    pan_number: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
  });

  const update = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/[\s-]/g, ""));
  const validateGST = (gst: string) => !gst || /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(gst.toUpperCase());
  const validatePAN = (pan: string) => !pan || /^[A-Z]{5}\d{4}[A-Z]{1}$/.test(pan.toUpperCase());
  const validateFSSAI = (fssai: string) => !fssai || /^\d{14}$/.test(fssai);

  const validateStep = () => {
    setError("");
    if (step === 0) {
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password) {
        setError("All fields are required");
        return false;
      }
      if (formData.name.trim().length < 2) {
        setError("Name must be at least 2 characters");
        return false;
      }
      if (!validateEmail(formData.email.trim())) {
        setError("Please enter a valid email address (e.g. name@gmail.com)");
        return false;
      }
      if (!validatePhone(formData.phone)) {
        setError("Please enter a valid 10-digit Indian phone number");
        return false;
      }
      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }
    if (step === 1) {
      if (!formData.business_name.trim()) {
        setError("Business name is required");
        return false;
      }
      if (formData.gst_number && !validateGST(formData.gst_number)) {
        setError("Invalid GST number format (e.g. 22AAAAA0000A1Z5)");
        return false;
      }
      if (formData.fssai_license && !validateFSSAI(formData.fssai_license)) {
        setError("FSSAI license must be a 14-digit number");
        return false;
      }
      if (formData.pan_number && !validatePAN(formData.pan_number)) {
        setError("Invalid PAN format (e.g. ABCDE1234F)");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const bankDetails = formData.bank_account_number
        ? {
            account_name: formData.bank_account_name,
            account_number: formData.bank_account_number,
            ifsc_code: formData.bank_ifsc_code,
            bank_name: formData.bank_name,
          }
        : null;

      await vendorService.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        business_name: formData.business_name,
        business_type: formData.business_type,
        description: formData.description,
        gst_number: formData.gst_number || undefined,
        fssai_license: formData.fssai_license || undefined,
        pan_number: formData.pan_number || undefined,
        bank_details: bankDetails,
      });
      onRegister();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition";

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Register as Vendor</h1>
          <p className="text-gray-500 mt-1">Join the GlobalEats marketplace</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i < step
                      ? "bg-emerald-600 text-white"
                      : i === step
                      ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
                <span className={`ml-2 text-xs font-medium ${i === step ? "text-emerald-700" : "text-gray-500"}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="w-12 h-px bg-gray-300 mx-2" />}
            </React.Fragment>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        {/* Step 1: Account */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input className={inputClass} value={formData.name} onChange={(e) => update("name", e.target.value)} placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" className={inputClass} value={formData.email} onChange={(e) => update("email", e.target.value)} placeholder="vendor@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input className={inputClass} value={formData.phone} onChange={(e) => update("phone", e.target.value)} placeholder="9876543210" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" className={inputClass} value={formData.password} onChange={(e) => update("password", e.target.value)} placeholder="••••••••" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                <input type="password" className={inputClass} value={formData.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="••••••••" required />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Business */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input className={inputClass} value={formData.business_name} onChange={(e) => update("business_name", e.target.value)} placeholder="My Restaurant" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select className={inputClass} value={formData.business_type} onChange={(e) => update("business_type", e.target.value)}>
                <option value="restaurant">Restaurant</option>
                <option value="cloud_kitchen">Cloud Kitchen</option>
                <option value="cafe">Cafe</option>
                <option value="bakery">Bakery</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className={inputClass} rows={3} value={formData.description} onChange={(e) => update("description", e.target.value)} placeholder="Tell us about your business..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input className={inputClass} value={formData.gst_number} onChange={(e) => update("gst_number", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">FSSAI License</label>
                <input className={inputClass} value={formData.fssai_license} onChange={(e) => update("fssai_license", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                <input className={inputClass} value={formData.pan_number} onChange={(e) => update("pan_number", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bank Details */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-500 text-sm mb-2">Bank details are optional and can be added later.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
              <input className={inputClass} value={formData.bank_account_name} onChange={(e) => update("bank_account_name", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input className={inputClass} value={formData.bank_account_number} onChange={(e) => update("bank_account_number", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                <input className={inputClass} value={formData.bank_ifsc_code} onChange={(e) => update("bank_ifsc_code", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input className={inputClass} value={formData.bank_name} onChange={(e) => update("bank_name", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Account</h3>
              <p className="text-sm text-gray-600">Name: {formData.name}</p>
              <p className="text-sm text-gray-600">Email: {formData.email}</p>
              <p className="text-sm text-gray-600">Phone: {formData.phone}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">Business</h3>
              <p className="text-sm text-gray-600">Name: {formData.business_name}</p>
              <p className="text-sm text-gray-600">Type: {formData.business_type.replace("_", " ")}</p>
              {formData.description && <p className="text-sm text-gray-600">Description: {formData.description}</p>}
            </div>
            {formData.bank_account_number && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-2">Bank Details</h3>
                <p className="text-sm text-gray-600">{formData.bank_name} — ****{formData.bank_account_number.slice(-4)}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={step === 0 ? onSwitchToLogin : prevStep}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            <ArrowLeft size={16} className="mr-1" />
            {step === 0 ? "Back to Login" : "Back"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Next <ArrowRight size={16} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Submitting..." : "Submit Registration"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;
