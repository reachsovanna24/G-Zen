const { User, Product } = require('../models');

const seedUsers = [
  {
    id: 1,
    name: 'G-Zen Admin',
    email: 'admin@gzenphone.kh',
    password: 'admin123',
    role: 'admin',
    phone: '+855 12 888 999',
    address: 'Preah Monivong Blvd, BKK1, Phnom Penh',
  }
];

const seedProducts = [
  {
    id: 1,
    name: 'Apple iPhone 16 Pro Max (256GB)',
    category: 'Smartphones',
    price: 1299.00,
    originalPrice: 1399.00,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'The ultimate iPhone featuring Grade 5 Titanium design, A18 Pro Bionic chip, 48MP Fusion camera system with 5x Telephoto, and Camera Control button. Official 1-Year Apple warranty in Cambodia.',
    brand: 'Apple',
    specs: {
      display: '6.9-inch Super Retina XDR OLED 120Hz',
      processor: 'Apple A18 Pro 3nm',
      camera: '48MP Main + 48MP Ultra-Wide + 12MP 5x Telephoto',
      battery: 'Up to 33 hours video playback',
      color: 'Desert Titanium',
      storage: '256GB',
    },
    isFeatured: true,
    rating: 4.9,
    warranty: '1 Year Official Apple Cambodia Warranty',
  },
  {
    id: 2,
    name: 'Samsung Galaxy S25 Ultra (512GB)',
    category: 'Smartphones',
    price: 1199.00,
    originalPrice: 1299.00,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Experience Galaxy AI 2.0 with Snapdragon 8 Elite for Galaxy, built-in S-Pen, Titanium armor frame, and 200MP quad camera setup. Includes free 45W charger at G-Zen.',
    brand: 'Samsung',
    specs: {
      display: '6.8-inch Dynamic AMOLED 2X 120Hz 2600 nits',
      processor: 'Snapdragon 8 Elite for Galaxy',
      camera: '200MP Wide + 50MP 5x Tele + 50MP Ultra-Wide',
      battery: '5000 mAh with 45W Super Fast Charging',
      color: 'Titanium Silverblue',
      storage: '512GB',
    },
    isFeatured: true,
    rating: 4.9,
    warranty: '1 Year Samsung Authorized Warranty',
  },
  {
    id: 3,
    name: 'Apple iPhone 15 (128GB)',
    category: 'Smartphones',
    price: 749.00,
    originalPrice: 829.00,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80',
    description: 'Dynamic Island comes to iPhone 15. 48MP main camera with 2x telephoto, USB-C connectivity, and color-infused glass back.',
    brand: 'Apple',
    specs: {
      display: '6.1-inch Super Retina XDR OLED',
      processor: 'A16 Bionic',
      camera: '48MP Dual Camera',
      color: 'Pastel Blue',
      storage: '128GB'
    },
    isFeatured: false,
    rating: 4.7,
  },
  {
    id: 4,
    name: 'Google Pixel 9 Pro (256GB)',
    category: 'Smartphones',
    price: 899.00,
    originalPrice: 999.00,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
    description: 'Engineered by Google with Gemini Nano built-in, Tensor G4 processor, Super Actua display, and pro camera system.',
    brand: 'Google',
    specs: {
      display: '6.3-inch LTPO OLED 120Hz',
      processor: 'Google Tensor G4',
      camera: '50MP Triple Pro Camera',
      color: 'Obsidian',
      storage: '256GB'
    },
    isFeatured: false,
    rating: 4.8,
  },
  {
    id: 5,
    name: 'iPad Pro 13-inch M4 (256GB)',
    category: 'Tablets',
    price: 1249.00,
    originalPrice: 1299.00,
    stock: 11,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    description: 'Impossibly thin at 5.1mm. Breakthrough Ultra Retina XDR tandem OLED display and the monstrous performance of Apple M4 chip with Apple Pencil Pro support.',
    brand: 'Apple',
    specs: {
      display: '13-inch Tandem OLED Ultra Retina XDR',
      processor: 'Apple M4 chip (9-core CPU, 10-core GPU)',
      storage: '256GB',
      color: 'Space Black',
      connectivity: 'Wi-Fi 6E'
    },
    isFeatured: true,
    rating: 5.0,
    warranty: '1 Year Apple Warranty',
  },
  {
    id: 6,
    name: 'iPad Air 11-inch M2 (128GB)',
    category: 'Tablets',
    price: 599.00,
    originalPrice: 649.00,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&auto=format&fit=crop&q=80',
    description: 'Redesigned 11-inch iPad Air supercharged by the Apple M2 chip. Landscape front camera, Liquid Retina display, all-day battery life.',
    brand: 'Apple',
    specs: {
      display: '11-inch Liquid Retina Display',
      processor: 'Apple M2 Chip',
      storage: '128GB',
      color: 'Starlight'
    },
    isFeatured: false,
    rating: 4.8,
  },
  {
    id: 7,
    name: 'Samsung Galaxy Tab S9 Ultra (256GB)',
    category: 'Tablets',
    price: 999.00,
    originalPrice: 1149.00,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1585770107532-3671ba98a834?w=800&auto=format&fit=crop&q=80',
    description: 'Massive 14.6" Dynamic AMOLED 2X screen with IP68 water & dust resistance, bundled S-Pen, quad AKG speakers, and DeX desktop mode.',
    brand: 'Samsung',
    specs: {
      display: '14.6-inch Dynamic AMOLED 2X 120Hz',
      processor: 'Snapdragon 8 Gen 2 for Galaxy',
      storage: '256GB',
      battery: '11,200 mAh'
    },
    isFeatured: false,
    rating: 4.8,
  },
  {
    id: 8,
    name: 'MacBook Pro 16" M3 Max (36GB/1TB)',
    category: 'Laptops',
    price: 2899.00,
    originalPrice: 3199.00,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    description: 'The powerhouse laptop for creators and engineers. M3 Max chip with 14-core CPU, 30-core GPU, Liquid Retina XDR display, and up to 22 hours of battery life.',
    brand: 'Apple',
    specs: {
      display: '16.2-inch Liquid Retina XDR 120Hz Promotion',
      processor: 'Apple M3 Max',
      memory: '36GB Unified Memory',
      storage: '1TB Superfast SSD',
      color: 'Space Black'
    },
    isFeatured: true,
    rating: 5.0,
    warranty: '1 Year Apple Authorized Warranty',
  },
  {
    id: 9,
    name: 'MacBook Air 13" M3 (16GB/512GB)',
    category: 'Laptops',
    price: 1249.00,
    originalPrice: 1349.00,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
    description: 'Incredibly thin and fast. Liquid Retina display, MagSafe 3 charging, dual external monitor support with lid closed, and silent fanless operation.',
    brand: 'Apple',
    specs: {
      display: '13.6-inch Liquid Retina Display',
      processor: 'Apple M3 chip',
      memory: '16GB Unified RAM',
      storage: '512GB SSD',
      color: 'Midnight'
    },
    isFeatured: true,
    rating: 4.9,
  },
  {
    id: 10,
    name: 'ASUS ROG Zephyrus G16 (RTX 4080)',
    category: 'Laptops',
    price: 2199.00,
    originalPrice: 2399.00,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    description: 'Ultra-slim CNC aluminum gaming laptop with 2.5K OLED 240Hz ROG Nebula Display, Intel Core Ultra 9, and NVIDIA GeForce RTX 4080.',
    brand: 'ASUS',
    specs: {
      display: '16-inch 2.5K OLED 240Hz 0.2ms',
      processor: 'Intel Core Ultra 9 185H',
      gpu: 'NVIDIA GeForce RTX 4080 12GB',
      storage: '1TB PCIe 4.0 NVMe SSD',
      memory: '32GB LPDDR5X'
    },
    isFeatured: false,
    rating: 4.8,
  },
  {
    id: 11,
    name: 'Apple AirPods Pro (2nd Gen, USB-C)',
    category: 'Accessories',
    price: 229.00,
    originalPrice: 249.00,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    description: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, Transparency mode, and USB-C MagSafe charging case with speaker and lanyard loop.',
    brand: 'Apple',
    specs: {
      chip: 'Apple H2 Headphone Chip',
      charging: 'USB-C, MagSafe, Qi Wireless',
      battery: 'Up to 30 hours with case',
      rating: 'IP54 dust, sweat, and water resistant'
    },
    isFeatured: true,
    rating: 4.9,
  },
  {
    id: 12,
    name: 'Samsung Galaxy Watch Ultra (Titanium)',
    category: 'Accessories',
    price: 499.00,
    originalPrice: 549.00,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    description: 'Rugged titanium cushion frame, sapphire crystal, dual-frequency GPS, multi-sport tracking, and 100-hour battery life.',
    brand: 'Samsung',
    specs: {
      case: '47mm Grade 4 Titanium',
      display: '1.5-inch Super AMOLED 3000 nits',
      waterResistance: '10 ATM + IP68 + MIL-STD-810H',
      color: 'Titanium Gray'
    },
    isFeatured: false,
    rating: 4.7,
  },
  {
    id: 13,
    name: 'Anker Prime 100W GaN Wall Charger (3-Port)',
    category: 'Accessories',
    price: 65.00,
    originalPrice: 79.00,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
    description: 'Fast charge 3 devices simultaneously with 2 USB-C and 1 USB-A ports. Powered by GaNPrime technology with ActiveShield 2.0 safety.',
    brand: 'Anker',
    specs: {
      totalOutput: '100W Max',
      ports: '2x USB-C, 1x USB-A',
      technology: 'GaNPrime',
      color: 'Metallic Black'
    },
    isFeatured: false,
    rating: 4.9,
  },
  {
    id: 14,
    name: 'Baseus Blade 100W 20000mAh Ultra-Thin Power Bank',
    category: 'Accessories',
    price: 59.00,
    originalPrice: 69.00,
    stock: 28,
    image: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800&auto=format&fit=crop&q=80',
    description: 'Only 18mm thin! Charges laptops and phones at up to 100W fast charging. Digital real-time power display screen.',
    brand: 'Baseus',
    specs: {
      capacity: '20,000 mAh (74Wh)',
      power: '100W PD Fast Charging',
      ports: '2x USB-C, 2x USB-A'
    },
    isFeatured: false,
    rating: 4.8,
  }
];

const seedDatabase = async () => {
  try {
    if (User && typeof User.count === 'function') {
      const userCount = await User.count().catch(() => 0);
      if (userCount === 0) {
        console.log('🌱 Seeding initial users...');
        await User.bulkCreate(seedUsers, { individualHooks: true }).catch(() => {});
      }
    }

    if (Product && typeof Product.count === 'function') {
      const productCount = await Product.count().catch(() => 0);
      if (productCount === 0) {
        console.log('🌱 Seeding initial flagship products...');
        await Product.bulkCreate(seedProducts).catch(() => {});
      }
    }

    console.log('✅ G-Zen Phone Store Database ready (Catalog & Admin configured, zero demo records).');
  } catch (error) {
    console.warn('Database seeding notice (using memory fallback if needed):', error.message);
  }
};

module.exports = seedDatabase;
module.exports.seedDatabase = seedDatabase;
module.exports.seedProducts = seedProducts;
module.exports.seedUsers = seedUsers;
