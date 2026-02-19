import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import vendorService from "./services/vendorService";
import VendorLogin from "./pages/VendorLogin";
import VendorRegister from "./pages/VendorRegister";
import VendorPending from "./pages/VendorPending";
import VendorDashboard from "./pages/VendorDashboard";
import VendorBrands from "./pages/VendorBrands";
import VendorOutlets from "./pages/VendorOutlets";
import VendorMenus from "./pages/VendorMenus";
import VendorOrders from "./pages/VendorOrders";
import VendorOutletBrands from "./pages/VendorOutletBrands";
import VendorSettings from "./pages/VendorSettings";
import VendorLayout from "./components/VendorLayout";

const VendorApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        vendorService.initializeAuth();
        if (vendorService.isAuthenticated()) {
          const isValid = await vendorService.validateToken();
          if (isValid) {
            const res = await vendorService.getProfile();
            setVendorStatus(res.data?.status || null);
            setIsAuthenticated(true);
          }
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await vendorService.getProfile();
      setVendorStatus(res.data?.status || null);
    } catch {}
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    setVendorStatus("pending");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    vendorService.logout();
    setIsAuthenticated(false);
    setVendorStatus(null);
    setShowRegister(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return <VendorRegister onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />;
    }
    return <VendorLogin onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />;
  }

  if (vendorStatus && vendorStatus !== "approved") {
    return <VendorPending onLogout={handleLogout} />;
  }

  return (
    <Routes>
      <Route element={<VendorLayout onLogout={handleLogout} />}>
        <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/vendor/brands" element={<VendorBrands />} />
        <Route path="/vendor/outlets" element={<VendorOutlets />} />
        <Route path="/vendor/menus" element={<VendorMenus />} />
        <Route path="/vendor/outlet-brands" element={<VendorOutletBrands />} />
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/settings" element={<VendorSettings />} />
        <Route path="*" element={<Navigate to="/vendor/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

export default VendorApp;
