require('dotenv').config();
const { sequelize } = require('./src/database/config/database');
const { Brand, Category, MenuItem } = require('./src/models/associations');
const { v4: uuidv4 } = require('uuid');

const ADJECTIVES = ['Spicy', 'Sweet', 'Savory', 'Crispy', 'Grilled', 'Roasted', 'Fresh', 'Zesty', 'Cheesy', 'Tangy'];
const NOUNS = ['Burger', 'Pizza', 'Salad', 'Wrap', 'Taco', 'Pasta', 'Curry', 'Sandwich', 'Soup', 'Fries'];
const IMAGES = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
  'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500'
];

(async () => {
  try {
    console.log('Connecting to DB...');
    await sequelize.authenticate();
    
    // Fetch Brands and Categories
    const brands = await Brand.findAll({ attributes: ['id'] });
    const categories = await Category.findAll({ attributes: ['id'] });

    if (brands.length === 0) {
      throw new Error('No brands found. Please create a brand first.');
    }
    if (categories.length === 0) {
      throw new Error('No categories found. Please seed categories first.');
    }

    const menuItems = [];

    for (let i = 0; i < 20; i++) {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
      const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
      
      menuItems.push({
        id: uuidv4(),
        brand_id: brand.id,
        category_id: category.id,
        name: `${adj} ${noun} ${i + 1}`,
        description: `A delicious ${adj.toLowerCase()} ${noun.toLowerCase()} made with fresh ingredients. Item #${i + 1}`,
        image_url: IMAGES[Math.floor(Math.random() * IMAGES.length)],
        base_price: (Math.random() * 500 + 50).toFixed(2), // 50 to 550
        is_vegetarian: Math.random() > 0.5,
        is_vegan: Math.random() > 0.8,
        is_gluten_free: Math.random() > 0.8,
        spice_level: Math.floor(Math.random() * 4), // 0-3
        calories: Math.floor(Math.random() * 800 + 200),
        preparation_time: Math.floor(Math.random() * 30 + 10),
        is_available: true,
        sort_order: i
      });
    }

    await MenuItem.bulkCreate(menuItems);
    console.log(`✅ Successfully seeded ${menuItems.length} menu items.`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
})();
