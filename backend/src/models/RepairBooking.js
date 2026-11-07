const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RepairBooking = sequelize.define('RepairBooking', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  ticketNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  deviceModel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  serviceType: {
    type: DataTypes.ENUM('Hardware Repair', 'Software Setup', 'Trade-In'),
    allowNull: false,
  },
  issueDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  preferredDate: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('Received', 'In Progress', 'Completed'),
    defaultValue: 'Received',
  },
  technicianNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  estimatedPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  }
}, {
  tableName: 'repair_bookings',
});

module.exports = RepairBooking;
