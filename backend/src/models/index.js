const { sequelize } = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const RepairBooking = require('./RepairBooking');
const Setting = require('./Setting');

// Associations
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Product,
  Order,
  RepairBooking,
  Setting,
};

