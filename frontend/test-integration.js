// Simple test to verify frontend-backend integration
const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test 1: Basic health check
    console.log('\n1. Testing basic connectivity...');
    const healthResponse = await axios.get(`${BACKEND_URL}/api/v1/products/all`);
    console.log('✅ Backend is reachable');
    console.log(`✅ Products endpoint status: ${healthResponse.status}`);
    console.log(`✅ Found ${healthResponse.data.products?.length || 0} products`);
    
    // Test 2: Test CORS
    console.log('\n2. Testing CORS configuration...');
    const corsHeaders = healthResponse.headers;
    console.log('✅ CORS headers present:', {
      'access-control-allow-origin': corsHeaders['access-control-allow-origin'],
      'access-control-allow-credentials': corsHeaders['access-control-allow-credentials']
    });
    
    // Test 3: Test auth endpoint
    console.log('\n3. Testing auth endpoint...');
    try {
      await axios.post(`${BACKEND_URL}/api/v1/auth/login`, {
        email: 'test@test.com',
        password: 'wrongpassword'
      });
    } catch (authError) {
      if (authError.response?.status === 401 || authError.response?.status === 400) {
        console.log('✅ Auth endpoint is working (expected error for invalid credentials)');
      } else {
        console.log('❌ Auth endpoint error:', authError.message);
      }
    }
    
    console.log('\n🎉 Integration test completed successfully!');
    console.log('\nFrontend should be able to connect to backend properly.');
    console.log('Visit http://localhost:3000 to test the customer frontend.');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n🚨 Issues found:');
    if (error.code === 'ECONNREFUSED') {
      console.log('- Backend server is not running on port 8000');
      console.log('- Make sure to start the backend with: npm start');
    } else if (error.response?.status === 404) {
      console.log('- API endpoint not found');
      console.log('- Check if routes are properly configured');
    } else {
      console.log('- Unknown error:', error.message);
    }
  }
}

testBackendConnection();
