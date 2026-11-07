const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

const isVercel = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let storagePath = process.env.DB_STORAGE;

if (isVercel) {
  storagePath = '/tmp/gzen_store.sqlite';
} else if (!storagePath) {
  storagePath = './data/gzen_store.sqlite';
}

const resolvedPath = isVercel 
  ? '/tmp/gzen_store.sqlite' 
  : path.resolve(__dirname, '../../', storagePath);

const dataDir = path.dirname(resolvedPath);

if (!fs.existsSync(dataDir)) {
  try {
    fs.mkdirSync(dataDir, { recursive: true });
  } catch (e) {
    // Ignore in read-only filesystems
  }
}

// In Vercel serverless environment, copy seed database into /tmp on first boot
if (isVercel && !fs.existsSync(resolvedPath)) {
  const seedDbPaths = [
    path.resolve(__dirname, '../../backend/data/gzen_store.sqlite'),
    path.resolve(__dirname, '../data/gzen_store.sqlite'),
    path.resolve(process.cwd(), 'backend/data/gzen_store.sqlite'),
    path.resolve(process.cwd(), 'data/gzen_store.sqlite')
  ];
  for (const sPath of seedDbPaths) {
    if (fs.existsSync(sPath)) {
      try {
        fs.copyFileSync(sPath, resolvedPath);
        console.log('✅ Seed database initialized at /tmp/gzen_store.sqlite');
        break;
      } catch (e) {
        console.warn('Seed database copy skipped:', e.message);
      }
    }
  }
}

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: resolvedPath,
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
  }
});

module.exports = { sequelize };
