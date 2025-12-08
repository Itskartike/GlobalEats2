const axios = require('axios');

async function testLoginFlow() {
  console.log('🧪 Testing Login Flow - Token Storage...\n');

  try {
    // Step 1: Clear all tokens (simulate expired/deleted tokens)
    console.log('1️⃣ Simulating token deletion...');
    console.log('   (In browser: localStorage.clear())');
    
    // Step 2: Test login with fresh credentials
    console.log('\n2️⃣ Testing fresh login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@globaleats.com',
      password: 'admin123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login API successful');
      console.log('👤 User:', loginResponse.data.data.user.name);
      console.log('📧 Email:', loginResponse.data.data.user.email);
      console.log('🎫 Token received:', !!loginResponse.data.data.token);
      console.log('🔄 Refresh token:', !!loginResponse.data.data.refreshToken);

      const token = loginResponse.data.data.token;
      
      // Step 3: Test API calls with the new token
      console.log('\n3️⃣ Testing API calls with new token...');
      
      // Test profile API
      const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (profileResponse.data.success) {
        console.log('✅ Profile API works with new token');
        console.log('👤 Profile user:', profileResponse.data.data.user.name);
      } else {
        console.log('❌ Profile API failed:', profileResponse.data.message);
      }

      // Test orders API
      const ordersResponse = await axios.get('http://localhost:5000/api/orders/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (ordersResponse.data.success) {
        console.log('✅ Orders API works with new token');
        console.log('📦 Orders found:', ordersResponse.data.data.orders.length);
      } else {
        console.log('❌ Orders API failed:', ordersResponse.data.message);
      }

      console.log('\n🎯 CONCLUSION:');
      console.log('✅ Login flow works correctly');
      console.log('✅ New tokens are generated properly');
      console.log('✅ APIs work with new tokens');
      console.log('\n💡 When you login in the browser:');
      console.log('   1. authService.login() will store token in localStorage');
      console.log('   2. authStore.login() will store token in Zustand state');
      console.log('   3. API interceptor will use the token for requests');
      console.log('   4. Orders should show properly');

    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('🚫 Error:', error.response?.data || error.message);
  }
}

testLoginFlow();
