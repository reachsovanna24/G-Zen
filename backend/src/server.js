require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const seedDatabase = require('./seed/seedData');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const repairRoutes = require('./routes/repairRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const bakongRoutes = require('./routes/bakongRoutes');
const supabaseRoutes = require('./routes/supabaseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { ensureSchema } = require('./config/ensureSchema');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware with 25MB body limit for image uploads
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Serve static uploads directory for device product images
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Request logging in development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/bakong', bakongRoutes);
app.use('/api/supabase', supabaseRoutes);
app.use('/api/upload', uploadRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    app: 'G-Zen Phone Store API (Phnom Penh)',
    time: new Date().toISOString(),
    version: '1.0.0',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Start Server and Sync Database
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite Database connected successfully.');

    await sequelize.sync();
    await ensureSchema();
    console.log('✅ Sequelize Models synchronized.');

    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 G-Zen Phone Store Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
