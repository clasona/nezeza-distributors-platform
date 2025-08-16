// Quick test for customer support integration
const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

async function testSupportIntegration() {
  console.log('🔍 Testing Customer Support Integration...\n');
  
  try {
    // Test 1: Support Metadata (Public endpoint)
    console.log('1. Testing support metadata endpoint...');
    const metadataResponse = await axios.get(`${BACKEND_URL}/api/v1/support/metadata`);
    console.log('✅ Support metadata endpoint working');
    console.log(`✅ Found ${metadataResponse.data.metadata?.categories?.length || 0} categories`);
    console.log(`✅ Found ${metadataResponse.data.metadata?.priorities?.length || 0} priorities`);
    
    // Test 2: Check if support routes are accessible (should get auth error)
    console.log('\n2. Testing protected support endpoints (should require auth)...');
    try {
      await axios.get(`${BACKEND_URL}/api/v1/support/my-tickets`);
      console.log('❌ Unexpected: my-tickets accessible without auth');
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ my-tickets properly requires authentication');
      } else {
        console.log('⚠️  Unexpected error:', authError.response?.status);
      }
    }
    
    try {
      await axios.post(`${BACKEND_URL}/api/v1/support`, {
        subject: 'Test',
        description: 'Test'
      });
      console.log('❌ Unexpected: create ticket accessible without auth');
    } catch (authError) {
      if (authError.response?.status === 401) {
        console.log('✅ Create ticket properly requires authentication');
      } else {
        console.log('⚠️  Unexpected error:', authError.response?.status);
      }
    }
    
    console.log('\n🎉 Support backend integration is ready!');
    console.log('\n📋 Next steps:');
    console.log('1. Create a user account via POST /api/v1/auth/register');
    console.log('2. Login via POST /api/v1/auth/login');
    console.log('3. Test creating tickets from frontend: http://localhost:3000/customer/support');
    console.log('4. The frontend should now connect properly to the backend');
    
  } catch (error) {
    console.error('❌ Support integration test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🚨 Backend server not running on port 8000');
      console.log('Start backend: cd ../backend && npm start');
    } else if (error.response?.status === 404) {
      console.log('\n🚨 Support routes not found');
      console.log('Check if supportRoutes are properly mounted in app.js');
    } else {
      console.log('\n🚨 Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message
      });
    }
  }
}

testSupportIntegration();
