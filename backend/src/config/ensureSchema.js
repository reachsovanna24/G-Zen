const { sequelize } = require('./database');

async function ensureSchema() {
  try {
    const [cols] = await sequelize.query('PRAGMA table_info(orders);');
    const existingColNames = cols.map(c => c.name);

    const requiredColumns = [
      { name: 'khqrMd5', type: 'TEXT' },
      { name: 'khqrString', type: 'TEXT' },
      { name: 'khqrImage', type: 'TEXT' },
      { name: 'khqrDeeplink', type: 'TEXT' },
      { name: 'settlementData', type: 'JSON' },
    ];

    for (const col of requiredColumns) {
      if (!existingColNames.includes(col.name)) {
        await sequelize.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type};`);
        console.log(`[Database Migration] Added column ${col.name} to orders table.`);
      }
    }
  } catch (err) {
    console.error('[Database Migration Warning] ensureSchema:', err.message);
  }
}

module.exports = { ensureSchema };
