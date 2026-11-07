const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const sourceDir = 'C:\\Users\\DI-Cyber\\.gemini\\antigravity-ide\\brain\\dde0b437-723f-40d6-98b0-f1c4dadd3857';
const targetDir = 'c:\\Users\\DI-Cyber\\Desktop\\Track\\frontend\\public\\products';

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(
    path.join(sourceDir, 'baseus_blade_power_bank_1790322577723.jpg'), 
    path.join(targetDir, 'baseus_blade.jpg')
);

fs.copyFileSync(
    path.join(sourceDir, 'samsung_tab_s9_ultra_1790322891719.jpg'), 
    path.join(targetDir, 'samsung_tab_s9.jpg')
);

const { sequelize, Product } = require('./models/index');

async function updateImages() {
  await sequelize.authenticate();
  
  await Product.update(
    { image: '/products/samsung_tab_s9.jpg' },
    { where: { name: 'Samsung Galaxy Tab S9 Ultra (256GB)' } }
  );

  await Product.update(
    { image: '/products/baseus_blade.jpg' },
    { where: { name: 'Baseus Blade 100W 20000mAh Ultra-Thin Power Bank' } }
  );
  
  console.log('Files copied and DB updated successfully!');
}

updateImages();
