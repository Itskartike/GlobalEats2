const {
  Order,
  OrderItem,
  User,
  Brand,
  Outlet,
  MenuItem,
  OutletMenuItem,
  Address,
} = require("../models/associations");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

class OrderController {
  // Create a new order
  async createOrder(req, res) {
    const transaction =
      await require("../database/config/database").sequelize.transaction();

    try {
      const userId = req.user.id;
      const {
        addressId,
        paymentMethod,
        specialInstructions,
        couponCode,
        brands, // Array of brand orders with items
      } = req.body;

      console.log(
        "Creating order with data:",
        JSON.stringify({ addressId, paymentMethod, brands }, null, 2)
      );

      if (!addressId || !paymentMethod || !brands || brands.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: addressId, paymentMethod, and brands with items",
        });
      }

      let totalOrderAmount = 0;
      let totalDeliveryFee = 0;
      const createdOrders = [];

      // Create separate orders for each brand
      for (const brandOrder of brands) {
        let { brandId, outletId, items, deliveryFee } = brandOrder;

        console.log("Creating order for brand:", brandId, "outlet:", outletId);

        if (!items || items.length === 0) {
          throw new Error(`No items provided for brand ${brandId}`);
        }

        // If no outlet ID provided, select the nearest outlet for the brand based on delivery address
        if (!outletId) {
          // Get user's delivery address
          const deliveryAddress = await Address.findByPk(addressId);
          if (
            !deliveryAddress ||
            !deliveryAddress.latitude ||
            !deliveryAddress.longitude
          ) {
            throw new Error(
              `Delivery address not found or coordinates missing for address ID ${addressId}`
            );
          }

          const brand = await Brand.findByPk(brandId, {
            include: [
              {
                model: Outlet,
                as: "Outlets",
                where: {
                  is_active: true,
                  is_delivery_available: true,
                },
              },
            ],
          });

          if (!brand || !brand.Outlets || brand.Outlets.length === 0) {
            throw new Error(`No active outlets found for brand ${brandId}`);
          }

          // Find the nearest outlet
          let nearestOutlet = null;
          let shortestDistance = Infinity;

          brand.Outlets.forEach((outlet) => {
            if (outlet.latitude && outlet.longitude) {
              const distance = calculateDistance(
                parseFloat(deliveryAddress.latitude),
                parseFloat(deliveryAddress.longitude),
                parseFloat(outlet.latitude),
                parseFloat(outlet.longitude)
              );

              console.log(
                `Distance to outlet ${outlet.name}: ${distance.toFixed(2)} km`
              );

              if (distance < shortestDistance) {
                shortestDistance = distance;
                nearestOutlet = outlet;
              }
            }
          });

          if (!nearestOutlet) {
            // Fallback to first outlet if none have coordinates
            nearestOutlet = brand.Outlets[0];
            console.log(
              `No outlet coordinates found, using first outlet: ${nearestOutlet.name}`
            );
          } else {
            console.log(
              `Selected nearest outlet: ${nearestOutlet.name} at ${shortestDistance.toFixed(2)} km`
            );
          }

          outletId = nearestOutlet.id;
        }

        if (!outletId) {
          throw new Error(`No outletId provided for brand ${brandId}`);
        }

        // Verify outlet exists and belongs to brand through many-to-many relationship
        const outlet = await Outlet.findOne({
          where: { id: outletId },
          include: [
            {
              model: Brand,
              as: "Brands",
              where: { id: brandId },
              required: true,
            },
          ],
        });

        if (!outlet) {
          throw new Error(`Outlet ${outletId} not found for brand ${brandId}`);
        }

        // Generate unique order number using the model method
        const orderNumber = Order.generateOrderNumber();

        // Calculate subtotal for this brand
        let subtotal = 0;
        const validatedItems = [];

        for (const item of items) {
          const menuItem =
            (await MenuItem.findByPk(item.menuItemId)) ||
            (await OutletMenuItem.findByPk(item.menuItemId));

          if (!menuItem) {
            throw new Error(`Menu item ${item.menuItemId} not found`);
          }

          const itemTotal = menuItem.base_price * item.quantity;
          subtotal += itemTotal;

          validatedItems.push({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: menuItem.base_price,
            totalPrice: itemTotal,
            specialInstructions: item.specialInstructions || null,
          });
        }

        // Calculate tax (5%)
        const taxAmount = subtotal * 0.05;

        // Apply coupon discount if provided
        let couponDiscount = 0;
        if (couponCode && couponCode.toLowerCase() === "welcome10") {
          couponDiscount = subtotal * 0.1; // 10% discount
        }

        const totalAmount = subtotal + deliveryFee + taxAmount - couponDiscount;

        // Create order
        const order = await Order.create(
          {
            order_number: orderNumber,
            user_id: userId,
            outlet_id: outletId,
            address_id: addressId,
            subtotal,
            delivery_fee: deliveryFee || 49,
            tax_amount: taxAmount,
            discount_amount: 0,
            total_amount: totalAmount,
            coupon_code: couponCode || null,
            coupon_discount: couponDiscount,
            payment_method: paymentMethod,
            special_instructions: specialInstructions,
            estimated_delivery_time: new Date(Date.now() + 35 * 60 * 1000), // 35 minutes from now
          },
          { transaction }
        );

        console.log(
          `Order created successfully: ${order.id} for user: ${userId}, outlet: ${outletId}`
        );

        // Create order items
        for (const validatedItem of validatedItems) {
          await OrderItem.create(
            {
              order_id: order.id,
              menu_item_id: validatedItem.menuItemId,
              restaurant_id: outletId,
              quantity: validatedItem.quantity,
              unit_price: validatedItem.unitPrice,
              total_price: validatedItem.totalPrice,
              special_instructions: validatedItem.specialInstructions,
            },
            { transaction }
          );
        }

        createdOrders.push(order);
        totalOrderAmount += totalAmount;
        totalDeliveryFee += deliveryFee || 49;
      }

      await transaction.commit();

      // Fetch complete order details with items for each created order
      const completeOrders = [];
      for (const order of createdOrders) {
        const completeOrder = await Order.findByPk(order.id, {
          include: [
            {
              model: Address,
              as: "address",
              required: false,
              attributes: [
                "id",
                "recipient_name",
                "street_address",
                "city",
                "state",
                "pincode",
                "phone",
                "landmark",
                "address_type",
              ],
            },
            {
              model: Outlet,
              as: "outlet",
              required: false,
              attributes: ["id", "name", "address", "phone"],
              include: [
                {
                  model: Brand,
                  as: "Brands",
                  required: false,
                  attributes: ["id", "name", "logo_url", "cuisine_type"],
                  through: { attributes: [] },
                },
              ],
            },
            {
              model: OrderItem,
              as: "orderItems",
              attributes: [
                "id",
                "menu_item_id",
                "quantity",
                "unit_price",
                "total_price",
                "special_instructions",
              ],
              include: [
                {
                  model: MenuItem,
                  as: "menuItem",
                  required: false,
                  attributes: [
                    "id",
                    "name",
                    "description",
                    "base_price",
                    "image_url",
                  ],
                },
              ],
            },
          ],
        });

        if (completeOrder) {
          completeOrders.push(completeOrder);
        }
      }

      console.log(
        `Created ${completeOrders.length} orders with complete details`
      );

      res.status(201).json({
        success: true,
        message: "Orders created successfully",
        data: {
          orders: completeOrders,
          summary: {
            totalOrders: completeOrders.length,
            totalAmount: totalOrderAmount,
            totalDeliveryFee,
            estimatedDeliveryTime: "25-35 minutes",
          },
        },
      });
    } catch (error) {
      await transaction.rollback();
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: error.message,
      });
    }
  }

  // Get user's order history with comprehensive information
  async getOrderHistory(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      console.log(
        `getOrderHistory called for user: ${userId}, page: ${page}, limit: ${limit}, status: ${status}`
      );

      const whereClause = { user_id: userId };
      if (status) {
        whereClause.status = status;
      }

      console.log("Where clause:", whereClause);

      const orders = await Order.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Address,
            as: "address",
            required: false,
            attributes: [
              "id",
              "recipient_name",
              "street_address",
              "city",
              "state",
              "pincode",
              "phone",
              "landmark",
              "address_type",
              "is_default",
            ],
          },
          {
            model: Outlet,
            as: "outlet",
            required: false,
            attributes: [
              "id",
              "name",
              "address",
              "city",
              "state",
              "phone",
              "email",
              "latitude",
              "longitude",
              "is_active",
              "is_delivery_available",
              "is_pickup_available",
              "delivery_radius",
            ],
            include: [
              {
                model: Brand,
                as: "Brands",
                required: false,
                attributes: [
                  "id",
                  "name",
                  "description",
                  "logo_url",
                  "banner_url",
                  "cuisine_type",
                  "rating",
                  "is_active",
                ],
                through: { attributes: [] }, // Exclude junction table attributes
              },
            ],
          },
          {
            model: OrderItem,
            as: "orderItems",
            attributes: [
              "id",
              "menu_item_id",
              "quantity",
              "unit_price",
              "total_price",
              "customization",
              "special_instructions",
              "preparation_time",
            ],
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                required: false,
                attributes: [
                  "id",
                  "name",
                  "description",
                  "base_price",
                  "image_url",
                  "category",
                  "is_vegetarian",
                  "is_vegan",
                  "is_gluten_free",
                  "is_available",
                  "preparation_time",
                  "spice_level",
                ],
              },
            ],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });

      console.log(`Found ${orders.count} orders for user ${userId}`);

      // Transform orders to frontend-friendly format
      const transformedOrders = orders.rows.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        status: order.status,
        orderType: order.order_type,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,

        // Financial details
        subtotal: parseFloat(order.subtotal || 0),
        deliveryFee: parseFloat(order.delivery_fee || 0),
        taxAmount: parseFloat(order.tax_amount || 0),
        discountAmount: parseFloat(order.discount_amount || 0),
        totalAmount: parseFloat(order.total_amount || 0),

        // Timing
        estimatedDeliveryTime: order.estimated_delivery_time,
        actualDeliveryTime: order.actual_delivery_time,
        preparationTime: order.preparation_time,

        // Additional info
        specialInstructions: order.special_instructions,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        placedAt: order.created_at,

        // Delivery address - Enhanced for order history display
        deliveryAddress: order.address
          ? {
              id: order.address.id,
              recipient_name: order.address.recipient_name,
              street_address: order.address.street_address,
              city: order.address.city,
              state: order.address.state,
              pincode: order.address.pincode,
              phone: order.address.phone,
              landmark: order.address.landmark,
              address_type: order.address.address_type,
              is_default: order.address.is_default,
              fullAddress: `${order.address.street_address}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
              shortAddress: `${order.address.city}, ${order.address.state}`,
              area: order.address.city,
            }
          : null,

        // Restaurant/outlet info
        restaurant: order.outlet
          ? {
              id: order.outlet.id,
              outletName: order.outlet.name,
              outletAddress: order.outlet.address,
              phone: order.outlet.phone,
              brand:
                order.outlet.Brands && order.outlet.Brands.length > 0
                  ? {
                      id: order.outlet.Brands[0].id,
                      name: order.outlet.Brands[0].name,
                      logo: order.outlet.Brands[0].logo_url,
                      cuisine: order.outlet.Brands[0].cuisine_type,
                      rating: order.outlet.Brands[0].rating,
                    }
                  : null,
            }
          : null,

        // Order items summary for history view
        items: order.orderItems
          ? order.orderItems.map((item) => ({
              id: item.id,
              menuItemId: item.menu_item_id,
              name: item.menuItem?.name || "Unknown Item",
              quantity: item.quantity,
              price: parseFloat(item.unit_price || 0),
              totalPrice: parseFloat(item.total_price || 0),
              image: item.menuItem?.image_url,
              isVegetarian: item.menuItem?.is_vegetarian,
              category: item.menuItem?.category,
            }))
          : [],

        // Summary calculations
        itemCount: order.orderItems ? order.orderItems.length : 0,
        totalQuantity: order.orderItems
          ? order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
          : 0,

        // For backward compatibility
        orderItems: order.orderItems, // Keep original structure as well
      }));

      res.json({
        success: true,
        data: {
          orders: transformedOrders,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(orders.count / parseInt(limit)),
            totalOrders: orders.count,
            hasNext: parseInt(page) * parseInt(limit) < orders.count,
            hasPrev: parseInt(page) > 1,
          },
        },
        message: "Order history fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching order history:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order history",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Get specific order details with comprehensive information
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      console.log(
        `Fetching order details for order: ${orderId}, user: ${userId}`
      );

      const order = await Order.findOne({
        where: { id: orderId, user_id: userId },
        include: [
          {
            model: Address,
            as: "address",
            required: false,
            attributes: [
              "id",
              "recipient_name",
              "street_address",
              "city",
              "state",
              "pincode",
              "phone",
              "landmark",
              "address_type",
              "is_default",
            ],
          },
          {
            model: Outlet,
            as: "outlet",
            required: false,
            attributes: [
              "id",
              "name",
              "address",
              "city",
              "state",
              "phone",
              "email",
              "latitude",
              "longitude",
              "is_active",
              "is_delivery_available",
              "is_pickup_available",
              "delivery_radius",
            ],
            include: [
              {
                model: Brand,
                as: "Brands",
                required: false,
                attributes: [
                  "id",
                  "name",
                  "description",
                  "logo_url",
                  "banner_url",
                  "cuisine_type",
                  "rating",
                  "is_active",
                ],
                through: { attributes: [] }, // Exclude junction table attributes
              },
            ],
          },
          {
            model: OrderItem,
            as: "orderItems",
            attributes: [
              "id",
              "menu_item_id",
              "quantity",
              "unit_price",
              "total_price",
              "customization",
              "special_instructions",
              "preparation_time",
            ],
            include: [
              {
                model: MenuItem,
                as: "menuItem",
                required: false,
                attributes: [
                  "id",
                  "name",
                  "description",
                  "base_price",
                  "image_url",
                  "category",
                  "is_vegetarian",
                  "is_vegan",
                  "is_gluten_free",
                  "is_available",
                  "preparation_time",
                  "spice_level",
                ],
                include: [
                  {
                    model: Brand,
                    as: "parentBrand",
                    attributes: ["id", "name", "logo_url"],
                  },
                ],
              },
            ],
          },
          {
            model: User,
            as: "user",
            required: false,
            attributes: ["id", "name", "email", "phone"],
          },
        ],
        order: [[{ model: OrderItem, as: "orderItems" }, "created_at", "ASC"]],
      });

      if (!order) {
        console.log(`Order not found: ${orderId} for user: ${userId}`);
        return res.status(404).json({
          success: false,
          message:
            "Order not found or you don't have permission to view this order",
        });
      }

      // Transform the data to match frontend expectations
      const transformedOrder = {
        id: order.id,
        orderNumber: order.order_number,
        userId: order.user_id,
        status: order.status,
        orderType: order.order_type,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,

        // Financial details
        subtotal: parseFloat(order.subtotal || 0),
        deliveryFee: parseFloat(order.delivery_fee || 0),
        taxAmount: parseFloat(order.tax_amount || 0),
        discountAmount: parseFloat(order.discount_amount || 0),
        totalAmount: parseFloat(order.total_amount || 0),

        // Timing
        estimatedDeliveryTime: order.estimated_delivery_time,
        actualDeliveryTime: order.actual_delivery_time,
        preparationTime: order.preparation_time,

        // Additional info
        specialInstructions: order.special_instructions,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        placedAt: order.created_at,

        // Delivery address
        deliveryAddress: order.address
          ? {
              id: order.address.id,
              recipient_name: order.address.recipient_name,
              street_address: order.address.street_address,
              city: order.address.city,
              state: order.address.state,
              pincode: order.address.pincode,
              phone: order.address.phone,
              landmark: order.address.landmark,
              fullAddress: `${order.address.street_address}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}`,
              area: order.address.city,
            }
          : null,

        // Restaurant/outlet info
        restaurant: order.outlet
          ? {
              id: order.outlet.id,
              outletName: order.outlet.name,
              outletAddress: order.outlet.address,
              phone: order.outlet.phone,
              brand:
                order.outlet.Brands && order.outlet.Brands.length > 0
                  ? {
                      id: order.outlet.Brands[0].id,
                      name: order.outlet.Brands[0].name,
                      logo: order.outlet.Brands[0].logo_url,
                      cuisine: order.outlet.Brands[0].cuisine_type,
                      rating: order.outlet.Brands[0].rating,
                    }
                  : null,
            }
          : null,

        // Order items with enhanced details
        items: order.orderItems
          ? order.orderItems.map((item) => ({
              id: item.id,
              menuItemId: item.menu_item_id,
              name: item.menuItem?.name || "Unknown Item",
              description: item.menuItem?.description,
              quantity: item.quantity,
              price: parseFloat(item.unit_price || 0),
              unitPrice: parseFloat(item.unit_price || 0),
              totalPrice: parseFloat(item.total_price || 0),
              basePrice: parseFloat(item.menuItem?.base_price || 0),
              image: item.menuItem?.image_url,
              customization: item.customization,
              specialInstructions: item.special_instructions,
              preparationTime: item.preparation_time,

              // Food characteristics
              isVegetarian: item.menuItem?.is_vegetarian,
              isVegan: item.menuItem?.is_vegan,
              isGlutenFree: item.menuItem?.is_gluten_free,
              spiceLevel: item.menuItem?.spice_level,
              category: item.menuItem?.category,

              // Brand info for the item
              brand: item.menuItem?.parentBrand
                ? {
                    id: item.menuItem.parentBrand.id,
                    name: item.menuItem.parentBrand.name,
                    logo: item.menuItem.parentBrand.logo_url,
                  }
                : null,
            }))
          : [],

        // User info
        user: order.user
          ? {
              id: order.user.id,
              name: order.user.name,
              email: order.user.email,
              phone: order.user.phone,
            }
          : null,

        // Summary calculations
        itemCount: order.orderItems ? order.orderItems.length : 0,
        totalQuantity: order.orderItems
          ? order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
          : 0,

        // For backward compatibility
        orderItems: order.orderItems, // Keep original structure as well
      };

      console.log(`Order details fetched successfully for order: ${orderId}`);
      console.log(`Items count: ${transformedOrder.items.length}`);

      res.json({
        success: true,
        data: transformedOrder,
        message: "Order details fetched successfully",
      });
    } catch (error) {
      console.error("Error fetching order details:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch order details",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }

  // Update order status (for restaurant/admin use)
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, preparationTime } = req.body;

      const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Update order status
      order.status = status;

      if (preparationTime) {
        order.preparationTime = preparationTime;
        order.estimatedDeliveryTime = new Date(
          Date.now() + preparationTime * 60 * 1000
        );
      }

      if (status === "delivered") {
        order.actualDeliveryTime = new Date();
      }

      await order.save();

      res.json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update order status",
        error: error.message,
      });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const order = await Order.findOne({
        where: { id: orderId, user_id: userId },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Check if order can be cancelled
      const nonCancellableStatuses = [
        "picked_up",
        "out_for_delivery",
        "delivered",
      ];
      if (nonCancellableStatuses.includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot cancel order that is ${order.status}`,
        });
      }

      order.status = "cancelled";
      order.cancellationReason = reason;
      await order.save();

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({
        success: false,
        message: "Failed to cancel order",
        error: error.message,
      });
    }
  }

  // Add order rating and review
  async addOrderReview(req, res) {
    try {
      const { orderId } = req.params;
      const { rating, review } = req.body;
      const userId = req.user.id;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      const order = await Order.findOne({
        where: { id: orderId, user_id: userId, status: "delivered" },
      });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found or not delivered yet",
        });
      }

      order.rating = rating;
      order.review = review;
      order.reviewDate = new Date();
      await order.save();

      res.json({
        success: true,
        message: "Review added successfully",
        data: order,
      });
    } catch (error) {
      console.error("Error adding order review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add order review",
        error: error.message,
      });
    }
  }
}

const orderController = new OrderController();

module.exports = {
  createOrder: orderController.createOrder.bind(orderController),
  getOrderHistory: orderController.getOrderHistory.bind(orderController),
  getOrderDetails: orderController.getOrderDetails.bind(orderController),
  updateOrderStatus: orderController.updateOrderStatus.bind(orderController),
  cancelOrder: orderController.cancelOrder.bind(orderController),
  addOrderReview: orderController.addOrderReview.bind(orderController),
};
