const app = require('../backend/src/server');
const { sequelize } = require('../backend/src/models');
const { ensureSchema } = require('../backend/src/config/ensureSchema');
const seedDatabase = require('../backend/src/seed/seedData');

let isInitialized = false;

// Vercel Serverless Function entry point
module.exports = async (req, res) => {
  if (!isInitialized) {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
      await ensureSchema();
      await seedDatabase();
      isInitialized = true;
    } catch (err) {
      console.error('Serverless database bootstrap error:', err);
    }
  }

  return app(req, res);
};
