/**
 * Test script to verify the new Shippo address validation endpoint
 * Run this from the backend directory: node test_address_validation.js
 */

require('dotenv').config();
const { validateAddressWithShippo } = require('./utils/address/validateAddress');

// Test addresses
const testAddresses = [
  {
    name: 'Valid US Address with Suite',
    address: {
      fullName: 'John Doe',
      street1: '731 Market Street',
      street2: '#200',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      country: 'US'
    }
  },
  {
    name: 'Valid Address Missing Secondary Info (should warn but pass)',
    address: {
      fullName: 'Clasona',
      street1: '5540 S Hyde Park',
      city: 'Chicago',
      state: 'IL',
      zip: '60637',
      country: 'US'
    }
  },
  {
    name: 'Invalid US Address',
    address: {
      fullName: 'Jane Doe',
      street1: '123 Fake Street',
      city: 'Nowhere',
      state: 'XX',
      zip: '00000',
      country: 'US'
    }
  },
  {
    name: 'Incomplete Address',
    address: {
      fullName: 'Test User',
      street1: '123 Main St',
      city: 'Anytown'
      // Missing state, zip, country
    }
  }
];

async function runTests() {
  console.log('🧪 Testing Shippo Address Validation Endpoint Integration\n');
  console.log('=' .repeat(60));

  if (!process.env.SHIPPO_API_TOKEN) {
    console.error('❌ SHIPPO_API_TOKEN environment variable is not set');
    console.log('Please ensure your .env file contains a valid Shippo API token');
    process.exit(1);
  }

  for (const test of testAddresses) {
    console.log(`\n📍 Testing: ${test.name}`);
    console.log('Address:', JSON.stringify(test.address, null, 2));
    console.log('-'.repeat(40));

    try {
      const result = await validateAddressWithShippo(test.address, 'shipping');
      
      console.log('✅ Validation Result:');
      console.log(`   Success: ${result.success}`);
      console.log(`   Valid: ${result.valid}`);
      console.log(`   Message: ${result.message}`);
      
      if (result.warnings && result.warnings.length > 0) {
        console.log(`   Warnings: ${result.warnings.join(', ')}`);
      }
      
      if (result.address) {
        console.log('   Normalized Address:');
        console.log(`     ${result.address.fullName}`);
        console.log(`     ${result.address.street1}${result.address.street2 ? ' ' + result.address.street2 : ''}`);
        console.log(`     ${result.address.city}, ${result.address.state} ${result.address.zip}`);
        console.log(`     ${result.address.country}`);
      }

    } catch (error) {
      console.log('❌ Validation Failed:');
      console.log(`   Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Test completed!');
  console.log('\nNotes:');
  console.log('- Valid addresses should return success: true, valid: true');
  console.log('- Invalid addresses should throw errors with descriptive messages');  
  console.log('- Incomplete addresses should fail basic field validation');
  console.log('- Check the console for detailed Shippo API responses');
}

// Run the tests
runTests().catch(console.error);
