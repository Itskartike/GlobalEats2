const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Address = require('./Address');

// User associations
User.hasMany(Restaurant, { foreignKey: 'owner_id', as: 'Restaurants' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'Orders' });
User.hasMany(Address, { foreignKey: 'user_id', as: 'Addresses' });
User.hasMany(Order, { foreignKey: 'delivery_agent_id', as: 'DeliveryOrders' });

// Restaurant associations
Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner' });
Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id', as: 'MenuItems' });
Restaurant.hasMany(OrderItem, { foreignKey: 'restaurant_id', as: 'OrderItems' });

// MenuItem associations
MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'Restaurant' });
MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id', as: 'OrderItems' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'Customer' });
Order.belongsTo(User, { foreignKey: 'delivery_agent_id', as: 'DeliveryAgent' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'MenuItem' });
OrderItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'Restaurant' });

// Address associations
Address.belongsTo(User, { foreignKey: 'user_id', as: 'User' });

module.exports = {
  User,
  Restaurant,
  MenuItem,
  Order,
  OrderItem,
  Address
};
