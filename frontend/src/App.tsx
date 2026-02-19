import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthProvider";
import { LocationProvider } from "./contexts/LocationContext";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { BottomNav } from "./components/layout/BottomNav";
import { Home } from "./pages/Home";
import { BrandListing } from "./pages/BrandListing";
import { Profile } from "./pages/ProfileNew";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";
import PartnerWithUs from "./pages/PartnerWithUs";
import { BrandDetail } from "./components/features/restaurants/BrandDetail";
import { BrandMenu } from "./components/features/restaurants/BrandMenu";
import AdminApp from "./admin/AdminApp";
import VendorApp from "./vendor/VendorApp";
import { LocationModal } from "./components/location/LocationModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isVendor = location.pathname.startsWith("/vendor");

  if (isAdmin) {
    return <AdminApp />;
  }

  if (isVendor) {
    return <VendorApp />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<BrandListing />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/brands/:brandSlug" element={<BrandMenu />} />
          <Route path="/brands/:brandSlug/details" element={<BrandDetail />} />
          <Route path="/partner" element={<PartnerWithUs />} />
        </Routes>
      </main>
      <Footer />
      <BottomNav />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
      <LocationModal />
    </div>
  );
}

function App() {
  // Disable automatic auth recovery check to prevent unwanted redirects
  // useEffect(() => {
  //   AuthRecovery.handleStartupAuthCheck();
  // }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <AppRouter />
          </Router>
        </LocationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
