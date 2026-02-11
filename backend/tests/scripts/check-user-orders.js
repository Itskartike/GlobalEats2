const { Order, User } = require("./src/models/associations");
require("./src/database/config/database");

async function checkOrdersByUser() {
  try {
    console.log("🔍 Checking orders by user...");

    // Get count by user
    const userOrderCounts = await Order.findAll({
      attributes: [
        "user_id",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "order_count",
        ],
      ],
      group: ["user_id"],
      raw: true,
    });

    console.log("📊 Orders by user:");
    for (const orderCount of userOrderCounts) {
      const user = await User.findByPk(orderCount.user_id);
      if (user) {
        console.log(
          `👤 ${user.name} (${user.email}) - ${orderCount.order_count} orders`
        );
      }
    }

    // Show a few sample orders
    console.log("\n📦 Sample orders:");
    const sampleOrders = await Order.findAll({
      attributes: [
        "id",
        "order_number",
        "user_id",
        "status",
        "total_amount",
        "createdAt",
      ],
      limit: 5,
      order: [["createdAt", "DESC"]],
    });

    sampleOrders.forEach((order) => {
      console.log(
        `Order ${order.order_number} - User: ${order.user_id} - Status: ${order.status} - Total: ₹${order.total_amount}`
      );
    });
  } catch (error) {
    console.error("🚫 Error:", error);
  }
}

checkOrdersByUser();
