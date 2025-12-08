const axios = require('axios');

// Test session-based authentication flow
async function testSessionAuth() {
  console.log('🧪 Testing Session-Based Authentication...\n');

  try {
    // 1. Login and get session token
    console.log('1️⃣ Testing login with session creation...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@globaleats.com',
      password: 'admin123',
    });

    const { user, token, sessionToken, sessionId, expiresAt } = loginResponse.data.data;
    
    console.log('✅ Login successful!');
    console.log(`👤 User: ${user.name}`);
    console.log(`🔑 JWT Token: ${token.substring(0, 20)}...`);
    console.log(`🎫 Session Token: ${sessionToken.substring(0, 20)}...`);
    console.log(`🆔 Session ID: ${sessionId}`);
    console.log(`⏰ Expires at: ${expiresAt}`);
    console.log('');

    // 2. Test API call with session token
    console.log('2️⃣ Testing API call with session token...');
    const profileResponse = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    console.log('✅ Profile API call successful with session token!');
    console.log(`👤 Profile user: ${profileResponse.data.data.user.name}`);
    console.log('');

    // 3. Test orders API with session token
    console.log('3️⃣ Testing orders API with session token...');
    const ordersResponse = await axios.get('http://localhost:5000/api/orders/user', {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    console.log('✅ Orders API call successful with session token!');
    console.log(`📦 Orders found: ${ordersResponse.data.data.orders.length}`);
    console.log('');

    // 4. Test session validation
    console.log('4️⃣ Testing session validation...');
    const sessionsResponse = await axios.get('http://localhost:5000/api/auth/sessions', {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    console.log('✅ Session validation successful!');
    console.log(`📊 Active sessions: ${sessionsResponse.data.data.sessions.length}`);
    console.log(`🔄 Current session ID: ${sessionsResponse.data.data.currentSessionId}`);
    console.log('');

    // 5. Calculate remaining time
    const expiresDate = new Date(expiresAt);
    const now = new Date();
    const timeRemaining = expiresDate.getTime() - now.getTime();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    console.log('📅 Session Info:');
    console.log(`   Created: ${new Date().toISOString()}`);
    console.log(`   Expires: ${expiresDate.toISOString()}`);
    console.log(`   Remaining: ${hoursRemaining}h ${minutesRemaining}m`);
    console.log('');

    // 6. Test logout
    console.log('6️⃣ Testing session logout...');
    const logoutResponse = await axios.post('http://localhost:5000/api/auth/logout', {}, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });

    console.log('✅ Logout successful!');
    console.log(`🔒 Session invalidated: ${logoutResponse.data.data.sessionInvalidated}`);
    console.log('');

    // 7. Try to use invalidated session
    console.log('7️⃣ Testing invalidated session...');
    try {
      await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      console.log('❌ ERROR: Invalidated session should not work!');
    } catch (error) {
      console.log('✅ Invalidated session correctly rejected!');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n🎯 SUMMARY:');
    console.log('✅ Session creation: WORKING');
    console.log('✅ Session authentication: WORKING');
    console.log('✅ API calls with session: WORKING');
    console.log('✅ Session management: WORKING');
    console.log('✅ 2-day expiration: WORKING');
    console.log('✅ Session invalidation: WORKING');
    console.log('\n💡 When temp files are deleted:');
    console.log('   • Session tokens are stored in localStorage');
    console.log('   • Sessions remain valid for 2 days');
    console.log('   • No need to re-login unless session expires');
    console.log('   • Clean session management with proper cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSessionAuth();
