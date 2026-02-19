import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Camera,
  Save,
  Edit,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  MapPin,
  Calendar,
  Settings,
  Bell,
  Shield,
  ShoppingBag,
  CreditCard,
  Package,
  Receipt,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/authStore";
import { authService, User as UserType } from "../services/authService";
import {
  orderService,
  Order,
  OrderHistoryResponse,
} from "../services/orderService";
import { OrderDetailsModal } from "../components/order/OrderDetailsModal";
import { CancelOrderModal } from "../components/order/CancelOrderModal";
import toast from "react-hot-toast";

export const Profile: React.FC = () => {
  const {
    user: authUser,
    token,
    updateUser,
    logout,
    isAuthenticated,
  } = useAuthStore();

  const [user, setUser] = useState<UserType | null>(authUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "notifications" | "orders" | "transactions"
  >("profile");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string>("");
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("");

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Cancel Order Modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Helper function to get order status display
  const getOrderStatusDisplay = (status: string) => {
    const statusMap: {
      [key: string]: { label: string; color: string; icon: React.ReactNode };
    } = {
      pending: {
        label: "Pending",
        color: "bg-gray-100 text-gray-800",
        icon: <Clock className="w-3 h-3 mr-1" />,
      },
      confirmed: {
        label: "Confirmed",
        color: "bg-blue-100 text-blue-800",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      preparing: {
        label: "Preparing",
        color: "bg-yellow-100 text-yellow-800",
        icon: <Clock className="w-3 h-3 mr-1" />,
      },
      ready: {
        label: "Ready",
        color: "bg-indigo-100 text-indigo-800",
        icon: <Package className="w-3 h-3 mr-1" />,
      },
      picked_up: {
        label: "Picked Up",
        color: "bg-purple-100 text-purple-800",
        icon: <Truck className="w-3 h-3 mr-1" />,
      },
      out_for_delivery: {
        label: "Out for Delivery",
        color: "bg-blue-100 text-blue-800",
        icon: <Truck className="w-3 h-3 mr-1" />,
      },
      delivered: {
        label: "Delivered",
        color: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-3 h-3 mr-1" />,
      },
      cancelled: {
        label: "Cancelled",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
      refunded: {
        label: "Refunded",
        color: "bg-red-100 text-red-800",
        icon: <XCircle className="w-3 h-3 mr-1" />,
      },
    };
    return (
      statusMap[status] || {
        label: status.replace(/_/g, " "),
        color: "bg-gray-100 text-gray-800",
        icon: null,
      }
    );
  };

  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Form errors
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Show/hide password fields
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const fetchUserProfile = useCallback(async () => {
    console.log("ProfileNew: fetchUserProfile called", {
      token: !!token,
      isAuthenticated,
    });

    if (!token || !isAuthenticated) {
      console.log(
        "ProfileNew: No token or not authenticated, skipping profile fetch"
      );
      setIsLoading(false);
      return;
    }

    try {
      console.log("ProfileNew: Calling authService.getProfile");
      const response = await authService.getProfile();
      console.log("ProfileNew: Profile response", {
        success: response.success,
        user: response.data?.user?.name,
      });

      if (response.success && response.data) {
        const userData = response.data.user;
        console.log("ProfileNew: Setting user data", userData.name);
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
        setNotificationSettings({
          email: userData.notification_settings?.email ?? true,
          sms: userData.notification_settings?.sms ?? false,
          push: userData.notification_settings?.push ?? true,
        });
        setImagePreview(userData.profile_image || "");
      }
    } catch (error) {
      console.error("ProfileNew: Error fetching profile:", error);
      toast.error("Failed to load profile", { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const fetchOrders = useCallback(
    async (page: number = 1, status?: string) => {
      console.log("ProfileNew: fetchOrders called", {
        page,
        status,
        token: !!token,
        isAuthenticated,
      });

      if (!token || !isAuthenticated) {
        console.log(
          "ProfileNew: No token or not authenticated, skipping fetch"
        );
        return;
      }

      setOrdersLoading(true);
      setOrdersError("");

      try {
        console.log("ProfileNew: Calling orderService.getOrderHistory");
        const response = await orderService.getOrderHistory(page, 10, status);
        console.log("ProfileNew: Order history response", response);

        if (response.success && response.data) {
          setOrders(response.data.orders);
          setOrdersPagination(response.data.pagination);
        } else {
          setOrdersError("Failed to fetch orders");
          toast.error("Failed to load order history");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrdersError("Failed to fetch orders");
        toast.error("Failed to load order history");
      } finally {
        setOrdersLoading(false);
      }
    },
    [token, isAuthenticated]
  );

  // Order modal handlers
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    // Find the order from the orders list
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setOrderToCancel(order);
      setIsCancelModalOpen(true);
    }
  };

  const onCancelConfirm = async (orderId: string, reason?: string) => {
    try {
      const response = await orderService.cancelOrder(
        orderId,
        reason || "No reason provided"
      );

      if (response.success) {
        toast.success("Order cancelled successfully!");
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        handleCloseOrderModal();
        // Refresh orders list
        fetchOrders(
          ordersPagination.currentPage,
          orderStatusFilter || undefined
        );
      } else {
        toast.error(
          response.message || "Failed to cancel order. Please try again."
        );
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order. Please try again.");
    }
  };

  const onCancelCancel = () => {
    setIsCancelModalOpen(false);
    setOrderToCancel(null);
  };

  const handleRateOrder = async (
    orderId: string,
    rating: number,
    review?: string
  ) => {
    try {
      // TODO: Implement rate order API call
      toast.success("Thank you for your review!");
      handleCloseOrderModal();
      // Refresh orders list
      fetchOrders(ordersPagination.currentPage, orderStatusFilter || undefined);
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    }
  };

  // Fetch orders when orders tab is selected
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders(1, orderStatusFilter || undefined);
    }
  }, [activeTab, fetchOrders, orderStatusFilter]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Reduced to 2MB limit
        toast.error("Image size should be less than 2MB", { duration: 5000 });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    // Clear previous errors
    setFormErrors({ name: "", email: "", phone: "" });

    // Validation
    const errors = { name: "", email: "", phone: "" };
    let hasErrors = false;

    if (!formData.name.trim()) {
      errors.name = "Name is required";
      hasErrors = true;
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
      hasErrors = true;
    }

    if (formData.phone && formData.phone.length < 10) {
      errors.phone = "Please enter a valid phone number";
      hasErrors = true;
    }

    if (hasErrors) {
      setFormErrors(errors);
      toast.error("Please fix the errors below", { duration: 5000 });
      return;
    }

    setIsSaving(true);
    try {
      // Only include image if it's changed and not too large
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Only add profile_image if it's changed
      if (user && imagePreview && imagePreview !== user.profile_image) {
        // Check if image is too large (base64 strings can be very large)
        if (imagePreview.length > 1000000) {
          // ~1MB limit for base64
          toast.error("Image is too large. Please choose a smaller image.", {
            duration: 6000,
          });
          setIsSaving(false);
          return;
        }
        updateData.profile_image = imagePreview;
      }

      console.log("Updating profile with data:", {
        ...updateData,
        profile_image: updateData.profile_image
          ? "base64 image (length: " + updateData.profile_image.length + ")"
          : "no image change",
      });

      const response = await authService.updateProfile(updateData);

      if (response.success && response.data) {
        setUser(response.data.user);
        updateUser(response.data.user);
        setIsEditing(false);
        toast.success("Profile updated successfully!", { duration: 4000 });
      } else {
        toast.error(response.message || "Failed to update profile", {
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      const err = error as {
        response?: { status: number; data?: { message?: string } };
      };

      // More specific error handling
      if (err.response?.status === 413) {
        toast.error("Image is too large. Please choose a smaller image.", {
          duration: 6000,
        });
      } else if (err.response?.status === 400) {
        toast.error(
          err.response.data?.message ||
            "Invalid data. Please check your inputs.",
          { duration: 6000 }
        );
      } else if (err.response?.status === 500 && imagePreview) {
        // If server error with image, try updating without image
        toast.error("Image upload failed. Trying to save other changes...", {
          duration: 3000,
        });

        try {
          const updateDataWithoutImage = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
          };

          const response = await authService.updateProfile(
            updateDataWithoutImage
          );

          if (response.success && response.data) {
            setUser(response.data.user);
            updateUser(response.data.user);
            setIsEditing(false);
            toast.success("Profile updated successfully (except image)!", {
              duration: 4000,
            });
          } else {
            toast.error("Failed to update profile. Please try again.", {
              duration: 6000,
            });
          }
        } catch (retryError) {
          console.error("Retry without image failed:", retryError);
          toast.error("Failed to update profile. Please try again.", {
            duration: 6000,
          });
        }
      } else if (err.response?.status === 500) {
        toast.error("Server error. Please try again or contact support.", {
          duration: 6000,
        });
      } else {
        toast.error("Failed to update profile. Please try again.", {
          duration: 6000,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields", { duration: 5000 });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match", { duration: 5000 });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long", {
        duration: 5000,
      });
      return;
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      toast.error("New password must be different from current password", {
        duration: 5000,
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response.success) {
        toast.success("Password changed successfully!", { duration: 4000 });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(response.message || "Failed to change password", {
          duration: 6000,
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password. Please try again.", {
        duration: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      toast.success("Logged out successfully", { duration: 3000 });
    } catch (error) {
      console.error("Logout error:", error);
      logout(); // Still logout locally even if server call fails
      toast.success("Logged out successfully", { duration: 3000 });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md mx-4 shadow-xl">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Your Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to view and manage your profile information.
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            className="w-full"
          >
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-8">
      {/* Hero Header - Mobile Optimized */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center md:justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-28 h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-xl">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-1 right-1 bg-white text-orange-600 p-2.5 rounded-full cursor-pointer hover:bg-orange-50 transition-all shadow-lg active:scale-95">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{user.name}</h1>
                <p className="text-orange-100 text-base mb-2">{user.email}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                  <div className="flex items-center bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                    <span>Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
                  </div>
                  
                  {user.is_verified ? (
                     <div className="flex items-center bg-green-500/20 px-3 py-1 rounded-full backdrop-blur-md border border-green-500/20">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-green-300" />
                      <span className="text-green-50 font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full backdrop-blur-md border border-yellow-500/20">
                        <XCircle className="w-3.5 h-3.5 mr-1.5 text-yellow-300" />
                        <span className="text-yellow-50 font-medium">Unverified</span>
                      </div>
                      <button
                        onClick={async () => {
                           try {
                            const resp = await fetch(
                              `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/send-verification-email`,
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );
                            const data = await resp.json();
                            if (data.success) {
                              toast.success("Verification email sent");
                            } else {
                              toast.error(data.message || "Failed to sent");
                            }
                          } catch (e) {
                            toast.error("Failed to send verification email");
                          }
                        }}
                        className="text-xs underline text-white hover:text-orange-100"
                      >
                        Verify Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-white/30 text-white hover:bg-white hover:text-orange-600 backdrop-blur-sm bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Tab Navigation */}
      <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="flex min-w-full p-2 gap-2">
          {[
            { id: "profile", label: "Profile", icon: User },
            { id: "orders", label: "Orders", icon: ShoppingBag },
            { id: "notifications", label: "Alerts", icon: Bell },
            { id: "security", label: "Security", icon: Shield },
            { id: "transactions", label: "Wallet", icon: CreditCard },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-500/20"
                  : "bg-gray-50 text-gray-600 border border-gray-100"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Desktop Sidebar Navigation - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="p-5 md:p-6 shadow-lg border-0 ring-1 ring-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">
                Account
              </h3>
              <nav className="space-y-1">
                {[
                  { id: "profile", label: "Profile Info", icon: User },
                  { id: "security", label: "Security", icon: Shield },
                  { id: "notifications", label: "Notifications", icon: Bell },
                  { id: "orders", label: "My Orders", icon: ShoppingBag },
                  { id: "transactions", label: "Transactions", icon: CreditCard },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-orange-50 text-orange-700 font-semibold shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? "text-orange-500" : "text-gray-400"}`} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* Quick Stats */}
              <div className="mt-8 pt-6 border-t border-gray-100 px-2 space-y-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Overview
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-gray-400"/> Orders</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">12</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2"><CreditCard className="w-4 h-4 text-gray-400"/> Spent</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">₹4.2k</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-lg border-0 ring-1 ring-gray-100 overflow-hidden md:rounded-2xl rounded-none md:shadow-md shadow-none bg-transparent md:bg-white">
                {/* Profile Tab */}
                {activeTab === "profile" && (
                  <div className="p-0 md:p-6 space-y-6">
                    <div className="md:hidden flex items-center gap-2 mb-4 px-4">
                       <User className="w-5 h-5 text-orange-500" />
                       <h2 className="text-lg font-bold text-gray-900">Personal Info</h2>
                    </div>
                  
                  {/* Header with Edit Button */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Profile Information
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Manage your personal information and preferences
                      </p>
                    </div>
                    {!isEditing ? (
                      <Button
                        onClick={() => {
                          console.log("Edit button clicked!");
                          setIsEditing(true);
                        }}
                        variant="outline"
                        className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Settings className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user.name || "",
                              email: user.email || "",
                              phone: user.phone || "",
                            });
                            setFormErrors({ name: "", email: "", phone: "" });
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="name"
                          value={isEditing ? formData.name : user.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors ${
                            formErrors.name
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-orange-500"
                          }`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={isEditing ? formData.email : user.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors ${
                            formErrors.email
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-orange-500"
                          }`}
                          placeholder="Enter your email address"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={isEditing ? formData.phone : user.phone || ""}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-colors ${
                            formErrors.phone
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-orange-500"
                          }`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        User Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          disabled
                          value={
                            user.role
                              ? user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)
                              : "Customer"
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Status
                      </label>
                      <div className="relative">
                        {user.is_verified ? (
                          <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                        ) : (
                          <XCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 w-5 h-5" />
                        )}
                        <input
                          type="text"
                          disabled
                          value={
                            user.is_verified
                              ? `Verified${user.email_verified_at ? ` on ${new Date(user.email_verified_at).toLocaleDateString()}` : ""}`
                              : "Not Verified"
                          }
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 md:p-6"
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Security Settings
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Manage your password and security preferences
                    </p>
                  </div>

                  {/* Change Password */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                new: !prev.new,
                              }))
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswords((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                              }))
                            }
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <Button
                        onClick={handleChangePassword}
                        disabled={isSaving}
                        className="w-full md:w-auto"
                      >
                        {isSaving ? (
                          <>
                            <Settings className="w-4 h-4 mr-2 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-5 md:p-6"
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Notification Settings
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Choose how you want to receive notifications
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        key: "email",
                        title: "Email Notifications",
                        description:
                          "Receive order updates and promotional emails",
                        icon: Mail,
                      },
                      {
                        key: "sms",
                        title: "SMS Notifications",
                        description:
                          "Get text messages for order status updates",
                        icon: Phone,
                      },
                      {
                        key: "push",
                        title: "Push Notifications",
                        description:
                          "Receive push notifications in your browser",
                        icon: Bell,
                      },
                    ].map((notification) => (
                      <div
                        key={notification.key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <notification.icon className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {notification.description}
                            </p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={
                              notificationSettings[
                                notification.key as keyof typeof notificationSettings
                              ]
                            }
                            onChange={(e) =>
                              setNotificationSettings((prev) => ({
                                ...prev,
                                [notification.key]: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Orders Section */}
              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      My Orders
                    </h2>
                    <div className="flex gap-2">
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                      >
                        <option value="">All Orders</option>
                        <option value="delivered">Delivered</option>
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="out_for_delivery">
                          Out for Delivery
                        </option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Loading State */}
                  {ordersLoading && (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-3 text-gray-600">
                        Loading orders...
                      </span>
                    </div>
                  )}

                  {/* Error State */}
                  {ordersError && !ordersLoading && (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error Loading Orders
                      </h3>
                      <p className="text-gray-600 mb-4">{ordersError}</p>
                      <Button onClick={() => fetchOrders()} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Empty State */}
                  {!ordersLoading && !ordersError && orders.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Orders Yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        You haven't placed any orders yet. Start exploring
                        restaurants and place your first order!
                      </p>
                      <Button onClick={() => (window.location.href = "/")}>
                        Browse Restaurants
                      </Button>
                    </div>
                  )}

                  {/* Orders List */}
                  {!ordersLoading && !ordersError && orders.length > 0 && (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Package className="w-5 h-5 text-orange-500" />
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  Order #
                                  {order.orderNumber ||
                                    (order as any).order_number ||
                                    "N/A"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {order.createdAt || (order as any).created_at
                                    ? new Date(
                                        order.createdAt ||
                                          (order as any).created_at
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "N/A"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900 mb-1">
                                ₹
                                {order.totalAmount ||
                                  (order as any).total_amount ||
                                  0}
                              </div>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getOrderStatusDisplay(
                                    order.status || "pending"
                                  ).color
                                }`}
                              >
                                {
                                  getOrderStatusDisplay(
                                    order.status || "pending"
                                  ).icon
                                }
                                {
                                  getOrderStatusDisplay(
                                    order.status || "pending"
                                  ).label
                                }
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            {/* Enhanced Delivery Address Display */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 mb-1">
                                    Delivery Address
                                  </div>
                                  {order.deliveryAddress ? (
                                    <div className="text-sm text-gray-600">
                                      {order.deliveryAddress.recipient_name && (
                                        <div className="font-medium text-gray-800">
                                          {order.deliveryAddress.recipient_name}
                                        </div>
                                      )}
                                      <div>
                                        {order.deliveryAddress.fullAddress ||
                                          `${order.deliveryAddress.street_address || ""}${order.deliveryAddress.landmark ? ", " + order.deliveryAddress.landmark : ""}, ${order.deliveryAddress.city || ""}, ${order.deliveryAddress.state || ""} ${order.deliveryAddress.pincode || ""}`}
                                      </div>
                                      {order.deliveryAddress.phone && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          📞 {order.deliveryAddress.phone}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="text-sm text-gray-500">
                                      Address not available
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Restaurant Information */}
                            {order.restaurant && (
                              <div className="bg-orange-50 rounded-lg p-3 mb-3">
                                <div className="flex items-start gap-2">
                                  <Package className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                      Restaurant
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <div className="font-medium text-gray-800">
                                        {order.restaurant.brand?.name ||
                                          order.restaurant.outletName ||
                                          "Restaurant"}
                                      </div>
                                      {order.restaurant.outletAddress && (
                                        <div className="text-xs text-gray-500">
                                          {order.restaurant.outletAddress}
                                        </div>
                                      )}
                                      {order.restaurant.brand?.cuisine && (
                                        <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full mt-1">
                                          {order.restaurant.brand.cuisine}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Order Items Summary */}
                            {order.items && order.items.length > 0 && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                <div className="text-sm font-medium text-gray-900 mb-2">
                                  Items ({order.items.length})
                                </div>
                                <div className="space-y-1">
                                  {order.items
                                    .slice(0, 3)
                                    .map((item, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between text-sm"
                                      >
                                        <span className="text-gray-600">
                                          {item.quantity}x {item.name}
                                          {item.isVegetarian && (
                                            <span className="text-green-600 ml-1">
                                              🟢
                                            </span>
                                          )}
                                        </span>
                                        <span className="text-gray-700 font-medium">
                                          ₹
                                          {(item.price * item.quantity).toFixed(
                                            2
                                          )}
                                        </span>
                                      </div>
                                    ))}
                                  {order.items.length > 3 && (
                                    <div className="text-xs text-gray-500 pt-1">
                                      +{order.items.length - 3} more items
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Payment Method:</strong>{" "}
                              {order.paymentMethod?.toUpperCase() ||
                                (order as any).payment_method?.toUpperCase() ||
                                "N/A"}
                            </div>
                            {order.specialInstructions && (
                              <div className="text-sm text-gray-600">
                                <strong>Special Instructions:</strong>{" "}
                                {order.specialInstructions}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between items-center text-sm">
                              <div className="space-y-1">
                                <div>
                                  Subtotal: ₹
                                  {order.subtotal ||
                                    (order as any).subtotal ||
                                    0}
                                </div>
                                <div>
                                  Delivery Fee: ₹
                                  {order.deliveryFee ||
                                    (order as any).delivery_fee ||
                                    0}
                                </div>
                                <div>
                                  Tax: ₹
                                  {order.taxAmount ||
                                    (order as any).tax_amount ||
                                    0}
                                </div>
                                {(order.discountAmount ||
                                  (order as any).discount_amount ||
                                  0) > 0 && (
                                  <div className="text-green-600">
                                    Discount: -₹
                                    {order.discountAmount ||
                                      (order as any).discount_amount}
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                {order.estimatedDeliveryTime && (
                                  <div className="text-gray-500 mb-2">
                                    Est. Delivery:{" "}
                                    {new Date(
                                      order.estimatedDeliveryTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewOrderDetails(order)
                                    }
                                  >
                                    View Details
                                  </Button>
                                  {order.status === "delivered" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        // TODO: Implement reorder functionality
                                        toast.success(
                                          "Reorder feature coming soon!"
                                        );
                                      }}
                                    >
                                      Reorder
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {ordersPagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fetchOrders(
                                ordersPagination.currentPage - 1,
                                orderStatusFilter || undefined
                              )
                            }
                            disabled={!ordersPagination.hasPrev}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-gray-600 px-4">
                            Page {ordersPagination.currentPage} of{" "}
                            {ordersPagination.totalPages}(
                            {ordersPagination.totalOrders} total orders)
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fetchOrders(
                                ordersPagination.currentPage + 1,
                                orderStatusFilter || undefined
                              )
                            }
                            disabled={!ordersPagination.hasNext}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Transactions Section */}
              {activeTab === "transactions" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Transaction History
                    </h2>
                    <div className="flex gap-2">
                      <select className="px-3 py-2 border border-gray-300 rounded-lg">
                        <option>All Transactions</option>
                        <option>Payments</option>
                        <option>Refunds</option>
                        <option>Credits</option>
                      </select>
                      <Button variant="outline" size="sm">
                        Export
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transaction
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {[
                            {
                              id: "TXN001",
                              date: "2024-01-15",
                              description: "Pizza Palace Order #ORD001",
                              amount: -28.5,
                              type: "payment",
                              status: "completed",
                            },
                            {
                              id: "TXN002",
                              date: "2024-01-12",
                              description: "Burger Barn Order #ORD002",
                              amount: -15.75,
                              type: "payment",
                              status: "completed",
                            },
                            {
                              id: "TXN003",
                              date: "2024-01-10",
                              description: "Sushi Spot Order #ORD003 - Refund",
                              amount: 22.0,
                              type: "refund",
                              status: "completed",
                            },
                            {
                              id: "TXN004",
                              date: "2024-01-05",
                              description: "Wallet Top-up",
                              amount: 50.0,
                              type: "credit",
                              status: "completed",
                            },
                          ].map((transaction) => (
                            <tr
                              key={transaction.id}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                      transaction.type === "payment"
                                        ? "bg-red-100"
                                        : transaction.type === "refund"
                                          ? "bg-green-100"
                                          : "bg-blue-100"
                                    }`}
                                  >
                                    {transaction.type === "payment" && (
                                      <Receipt className="w-4 h-4 text-red-600" />
                                    )}
                                    {transaction.type === "refund" && (
                                      <Receipt className="w-4 h-4 text-green-600" />
                                    )}
                                    {transaction.type === "credit" && (
                                      <CreditCard className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {transaction.description}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {transaction.id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaction.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    transaction.type === "payment"
                                      ? "bg-red-100 text-red-800"
                                      : transaction.type === "refund"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {transaction.type.charAt(0).toUpperCase() +
                                    transaction.type.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <span
                                  className={
                                    transaction.amount >= 0
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }
                                >
                                  {transaction.amount >= 0 ? "+" : ""}$
                                  {Math.abs(transaction.amount).toFixed(2)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  {transaction.status.charAt(0).toUpperCase() +
                                    transaction.status.slice(1)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Transaction Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <CreditCard className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="text-lg font-semibold text-gray-900">
                            $44.25
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <Receipt className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Refunds</p>
                          <p className="text-lg font-semibold text-gray-900">
                            $22.00
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                          <ShoppingBag className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Orders</p>
                          <p className="text-lg font-semibold text-gray-900">
                            3
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        order={selectedOrder as any}
        onCancelOrder={handleCancelOrder}
        onRateOrder={handleRateOrder}
      />

      {/* Cancel Order Modal */}
      <CancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={onCancelCancel}
        onConfirm={onCancelConfirm}
        order={orderToCancel}
      />
    </div>
  );
};
