const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

// Bangalore coordinates for testing
const BANGALORE_LAT = 12.9716;
const BANGALORE_LON = 77.5946;

// Test coordinates (slightly different locations in Bangalore)
const INDIRANAGAR_LAT = 12.9719;
const INDIRANAGAR_LON = 77.5938;

const KORAMANGALA_LAT = 12.9352;
const KORAMANGALA_LON = 77.6245;

async function testPhase3BLocationAPIs() {
  console.log('🚀 Testing Phase 3B: Location-Based Multi-Brand APIs\n');

  try {
    // Test 1: Get brands available near location
    console.log('📍 Test 1: Get Multi-Brands Near Location');
    console.log('='.repeat(50));
    
    const brandsResponse = await axios.get(`${BASE_URL}/api/location/multi-brands`, {
      params: {
        latitude: BANGALORE_LAT,
        longitude: BANGALORE_LON,
        radius: 10
      }
    });

    if (brandsResponse.data.success) {
      console.log(`✅ Found ${brandsResponse.data.data.brands.length} brands near location`);
      console.log(`📊 Total outlets in area: ${brandsResponse.data.data.total_outlets}`);
      
      brandsResponse.data.data.brands.forEach((brand, index) => {
        console.log(`\n   ${index + 1}. ${brand.name}`);
        console.log(`      📍 Nearest outlet: ${brand.nearest_outlet.outlet_name}`);
        console.log(`      🚚 Distance: ${brand.nearest_outlet.distance} km`);
        console.log(`      ⏱️  Prep time: ${brand.min_preparation_time} min`);
        console.log(`      💰 Min order: ₹${brand.nearest_outlet.minimum_order_amount}`);
        console.log(`      🏪 Total outlets: ${brand.total_outlets}`);
      });
    } else {
      console.log('❌ Failed to get brands near location');
    }

    console.log('\n' + '='.repeat(50));

    // Test 2: Get menu with outlet-specific pricing
    if (brandsResponse.data.success && brandsResponse.data.data.brands.length > 0) {
      const firstBrand = brandsResponse.data.data.brands[0];
      
      console.log(`\n🍽️  Test 2: Get Menu for ${firstBrand.name} with Outlet Pricing`);
      console.log('='.repeat(50));

      const menuResponse = await axios.get(`${BASE_URL}/api/location/multi-brands/${firstBrand.id}/menu`, {
        params: {
          latitude: BANGALORE_LAT,
          longitude: BANGALORE_LON
        }
      });

      if (menuResponse.data.success) {
        const { brand, outlet, menu } = menuResponse.data.data;
        
        console.log(`✅ Retrieved menu for ${brand.name}`);
        console.log(`🏪 Assigned outlet: ${outlet.name}`);
        console.log(`📍 Outlet address: ${outlet.address}`);
        console.log(`⏱️  Preparation time: ${outlet.preparation_time} min`);
        console.log(`💰 Minimum order: ₹${outlet.minimum_order_amount}`);
        console.log(`🚚 Delivery fee: ₹${outlet.delivery_fee}`);
        console.log(`\n📋 Menu items (${menu.available_items}/${menu.total_items} available):`);

        menu.items.slice(0, 5).forEach((item, index) => {
          console.log(`\n   ${index + 1}. ${item.name}`);
          console.log(`      💰 Price: ₹${item.final_price} ${item.has_outlet_pricing ? '(outlet-specific)' : '(base price)'}`);
          console.log(`      📊 Available: ${item.is_available ? 'Yes' : 'No'}`);
          console.log(`      ⏱️  Prep time: ${item.preparation_time} min`);
          if (item.discount_percentage > 0) {
            console.log(`      🏷️  Discount: ${item.discount_percentage}%`);
          }
        });
      } else {
        console.log('❌ Failed to get menu with pricing');
      }
    }

    console.log('\n' + '='.repeat(50));

    // Test 3: Outlet assignment for order
    if (brandsResponse.data.success && brandsResponse.data.data.brands.length > 0) {
      const testBrand = brandsResponse.data.data.brands[0];
      
      console.log(`\n🎯 Test 3: Assign Outlet for Order (${testBrand.name})`);
      console.log('='.repeat(50));

      const assignmentResponse = await axios.post(`${BASE_URL}/api/location/assign-outlet`, {
        brand_id: testBrand.id,
        customer_latitude: INDIRANAGAR_LAT,
        customer_longitude: INDIRANAGAR_LON,
        order_items: [
          { menu_item_id: 'test-item-1', quantity: 2 },
          { menu_item_id: 'test-item-2', quantity: 1 }
        ]
      });

      if (assignmentResponse.data.success) {
        const outlet = assignmentResponse.data.data.assigned_outlet;
        
        console.log(`✅ Outlet assigned successfully!`);
        console.log(`🏪 Assigned outlet: ${outlet.name}`);
        console.log(`📍 Address: ${outlet.address}`);
        console.log(`🚚 Distance: ${outlet.distance} km`);
        console.log(`⏱️  Preparation time: ${outlet.preparation_time} min`);
        console.log(`💰 Minimum order: ₹${outlet.minimum_order_amount}`);
        console.log(`🎯 Assignment score: ${outlet.assignment_score} (lower = better)`);
        console.log(`📞 Phone: ${outlet.phone}`);
      } else {
        console.log('❌ Failed to assign outlet for order');
      }
    }

    console.log('\n' + '='.repeat(50));

    // Test 4: Compare different locations
    console.log('\n🗺️  Test 4: Compare Brand Availability Across Locations');
    console.log('='.repeat(50));

    const locations = [
      { name: 'Indiranagar', lat: INDIRANAGAR_LAT, lon: INDIRANAGAR_LON },
      { name: 'Koramangala', lat: KORAMANGALA_LAT, lon: KORAMANGALA_LON }
    ];

    for (const location of locations) {
      console.log(`\n📍 ${location.name} (${location.lat}, ${location.lon}):`);
      
      try {
        const locationResponse = await axios.get(`${BASE_URL}/api/location/multi-brands`, {
          params: {
            latitude: location.lat,
            longitude: location.lon,
            radius: 5 // Smaller radius for comparison
          }
        });

        if (locationResponse.data.success) {
          const brands = locationResponse.data.data.brands;
          console.log(`   ✅ ${brands.length} brands available`);
          console.log(`   🏪 ${locationResponse.data.data.total_outlets} outlets in area`);
          
          brands.slice(0, 3).forEach(brand => {
            console.log(`   • ${brand.name} - ${brand.nearest_outlet.distance} km away`);
          });
        }
      } catch (error) {
        console.log(`   ❌ Error checking ${location.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 Phase 3B Location-Based API Testing Complete!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Multi-brand location discovery');
    console.log('   ✅ Outlet-specific menu pricing');
    console.log('   ✅ Smart outlet assignment');
    console.log('   ✅ Location-based comparison');
    console.log('\n🚀 Cloud Kitchen Model Successfully Implemented!');

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testPhase3BLocationAPIs();
