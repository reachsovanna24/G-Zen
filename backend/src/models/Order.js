const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  guestInfo: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  items: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('KHQR', 'ABA Bank', 'Cash on Delivery'),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('Pending', 'Paid', 'Failed'),
    defaultValue: 'Pending',
  },
  transactionRef: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'QC Testing', 'Out for Delivery', 'Delivered'),
    defaultValue: 'Pending',
  },
  khqrMd5: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  khqrString: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  khqrImage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  khqrDeeplink: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  settlementData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'orders',
});

module.exports = Order;
