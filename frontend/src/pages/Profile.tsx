import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Settings,
  Camera,
  Save,
  Edit,
  Lock,
  Shield,
  Eye,
  EyeOff,
  LogOut,
  Package,
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
    "profile" | "security" | "notifications" | "orders"
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
    if (!token || !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.getProfile();
      if (response.success && response.data) {
        const userData = response.data.user;
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
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated]);

  const fetchOrders = useCallback(
    async (page: number = 1) => {
      if (!token || !isAuthenticated) {
        console.log("Profile: No token or not authenticated", {
          token: !!token,
          isAuthenticated,
        });
        return;
      }

      console.log("Profile: Fetching orders for page", page);
      setOrdersLoading(true);
      setOrdersError("");

      try {
        const response = await orderService.getOrderHistory(page, 10);
        console.log("Profile: Order history response", response);

        if (response.success && response.data) {
          console.log("Profile: Setting orders", response.data.orders);
          setOrders(response.data.orders);
          setOrdersPagination(response.data.pagination);
        } else {
          console.error("Profile: Failed to fetch orders", response);
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

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Fetch orders when orders tab is selected
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
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
      const response = await authService.updateProfile(formData);

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
      toast.error("Failed to update profile. Please try again.", {
        duration: 6000,
      });
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
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      logout(); // Still logout locally even if server call fails
      toast.success("Logged out successfully");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Access Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Please log in to view and manage your profile.
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Tabs */}
          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {(
                  ["profile", "orders", "security", "notifications"] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-sm font-medium capitalize border-b-2 ${
                      activeTab === tab
                        ? "border-orange-500 text-orange-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab === "orders" ? "Order History" : tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Header with Edit Button */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                      Profile Information
                    </h2>
                    {/* Debug info */}
                    <div className="text-xs text-gray-500 mr-4">
                      isEditing: {isEditing ? "true" : "false"}
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => {
                          console.log(
                            "Edit button clicked, setting isEditing to true"
                          );
                          setIsEditing(true);
                        }}
                        variant="outline"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    {isEditing && (
                      <div className="text-sm text-green-600 font-medium">
                        Editing Mode Active
                      </div>
                    )}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
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
                    <div className="ml-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-gray-500">{user.email}</p>
                      <div className="flex items-center mt-2 space-x-3">
                        {user.is_verified ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        ) : (
                          <>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Unverified
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
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
                                    toast.error(data.message || "Failed to send email");
                                  }
                                } catch (e) {
                                  toast.error("Failed to send verification email");
                                }
                              }}
                            >
                              Verify email
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            formErrors.name
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-orange-500"
                          }`}
                        />
                      </div>
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            formErrors.email
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-orange-500"
                          }`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          name="phone"
                          value={isEditing ? formData.phone : user.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 ${
                            formErrors.phone
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-300 focus:ring-orange-500"
                          }`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {isEditing && (
                      <div className="flex space-x-4 pt-4">
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
                              name: user.name,
                              email: user.email,
                              phone: user.phone,
                            });
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-gray-900">
                    Order History
                  </h2>

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
                    <Card className="p-6 text-center">
                      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Error Loading Orders
                      </h3>
                      <p className="text-gray-600 mb-4">{ordersError}</p>
                      <Button onClick={() => fetchOrders()} variant="outline">
                        Try Again
                      </Button>
                    </Card>
                  )}

                  {/* Empty State */}
                  {!ordersLoading && !ordersError && orders.length === 0 && (
                    <Card className="p-8 text-center">
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
                    </Card>
                  )}

                  {/* Orders List */}
                  {!ordersLoading && !ordersError && orders.length > 0 && (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Card key={order.id} className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                Order #{order.orderNumber}
                              </h3>
                              <div className="flex items-center mt-1 space-x-4">
                                <span className="flex items-center text-sm text-gray-500">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {new Date(order.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {order.paymentMethod.toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ₹{order.totalAmount}
                              </div>
                              <div
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getOrderStatusDisplay(order.status).color
                                }`}
                              >
                                {getOrderStatusDisplay(order.status).icon}
                                {getOrderStatusDisplay(order.status).label}
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-4">
                            <div className="text-sm text-gray-600 mb-2">
                              <strong>Delivery Address:</strong>{" "}
                              {order.deliveryAddress?.fullAddress || "N/A"}
                            </div>

                            {order.specialInstructions && (
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Special Instructions:</strong>{" "}
                                {order.specialInstructions}
                              </div>
                            )}

                            <div className="flex justify-between items-center text-sm">
                              <div className="space-y-1">
                                <div>Subtotal: ₹{order.subtotal}</div>
                                <div>Delivery Fee: ₹{order.deliveryFee}</div>
                                <div>Tax: ₹{order.taxAmount}</div>
                                {order.discountAmount > 0 && (
                                  <div className="text-green-600">
                                    Discount: -₹{order.discountAmount}
                                  </div>
                                )}
                              </div>

                              <div className="text-right">
                                {order.estimatedDeliveryTime && (
                                  <div className="text-gray-500 mb-1">
                                    Est. Delivery:{" "}
                                    {new Date(
                                      order.estimatedDeliveryTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // TODO: Implement order details modal
                                    toast.success(
                                      "Order details feature coming soon!"
                                    );
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      {/* Pagination */}
                      {ordersPagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fetchOrders(ordersPagination.currentPage - 1)
                            }
                            disabled={!ordersPagination.hasPrev}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-gray-600">
                            Page {ordersPagination.currentPage} of{" "}
                            {ordersPagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              fetchOrders(ordersPagination.currentPage + 1)
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

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-gray-900">
                    Security Settings
                  </h2>

                  {/* Change Password */}
                  <Card className="p-6">
                    <h3 className="text-md font-medium text-gray-900 mb-4">
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
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                            className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <Settings className="w-4 h-4 mr-2 animate-spin" />
                            Changing Password...
                          </>
                        ) : (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-gray-900">
                    Notification Preferences
                  </h2>

                  <Card className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Email Notifications
                          </h3>
                          <p className="text-sm text-gray-500">
                            Receive updates via email
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              email: !prev.email,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            notificationSettings.email
                              ? "bg-orange-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.email
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            SMS Notifications
                          </h3>
                          <p className="text-sm text-gray-500">
                            Receive updates via SMS
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              sms: !prev.sms,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            notificationSettings.sms
                              ? "bg-orange-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.sms
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">
                            Push Notifications
                          </h3>
                          <p className="text-sm text-gray-500">
                            Receive browser notifications
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setNotificationSettings((prev) => ({
                              ...prev,
                              push: !prev.push,
                            }))
                          }
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            notificationSettings.push
                              ? "bg-orange-600"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              notificationSettings.push
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
