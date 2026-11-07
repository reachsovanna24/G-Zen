const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  category: {
    type: DataTypes.ENUM('Smartphones', 'Tablets', 'Laptops', 'Accessories'),
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  originalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  specs: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.8,
  },
  warranty: {
    type: DataTypes.STRING,
    defaultValue: '1 Year Official Warranty (Cambodia)',
  }
}, {
  tableName: 'products',
});

module.exports = Product;
