require('dotenv').config();
const { sequelize } = require('./src/database/config/database');

(async () => {
  try {
    const [brands] = await sequelize.query("SELECT id, name FROM brands");
    const [categories] = await sequelize.query("SELECT id, name FROM categories");
    console.log("BRANDS:", JSON.stringify(brands));
    console.log("CATEGORIES:", JSON.stringify(categories));
  } catch (e) {
    console.error(e.message);
  } finally {
    process.exit();
  }
})();
