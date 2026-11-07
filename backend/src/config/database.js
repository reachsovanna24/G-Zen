const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const storagePath = process.env.DB_STORAGE || './data/gzen_store.sqlite';
const resolvedPath = path.resolve(__dirname, '../../', storagePath);
const dataDir = path.dirname(resolvedPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: resolvedPath,
  logging: process.env.NODE_ENV === 'development' ? false : false,
  define: {
    timestamps: true,
    underscored: false,
  }
});

module.exports = { sequelize };
