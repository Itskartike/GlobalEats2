const axios = require('axios');

async function simpleTest() {
  try {
    console.log('🧪 Simple API Test');
    
    const response = await axios.get('http://localhost:5000/api/location/multi-brands', {
      params: {
        latitude: 12.9716,
        longitude: 77.5946,
        radius: 10
      },
      timeout: 10000
    });
    
    console.log('✅ API Response received');
    console.log('📊 Brands found:', response.data.data.brands.length);
    
    if (response.data.data.brands.length > 0) {
      const firstBrand = response.data.data.brands[0];
      console.log(`🍕 First brand: ${firstBrand.name}`);
      console.log(`🏪 Outlets: ${firstBrand.outlets.length}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

simpleTest();
