#!/usr/bin/env node

/**
 * Retailer Account Diagnostic Script
 * 
 * This script helps diagnose login issues for retailer accounts
 * Run this in the backend directory: node ../check-retailer-account.js
 */

const mongoose = require('./backend/node_modules/mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nezeza';

// User and Role schemas (simplified for diagnostic)
const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  isVerified: Boolean,
  roles: [{ type: mongoose.Schema.ObjectId, ref: 'Role' }],
  storeId: { type: mongoose.Schema.ObjectId, ref: 'Store' },
}, { timestamps: true });

const RoleSchema = new mongoose.Schema({
  name: String,
  permissions: [String]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Role = mongoose.model('Role', RoleSchema);

async function checkRetailerAccount(email) {
  if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: node check-retailer-account.js your-email@example.com');
    return;
  }

  console.log('🔍 Diagnosing Retailer Account:', email);
  console.log('=' .repeat(50));

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    console.log('\n1. Checking if user exists...');
    const user = await User.findOne({ email }).populate('roles').populate('storeId');
    
    if (!user) {
      console.log('❌ User not found');
      console.log('   Solution: Create account first');
      return;
    }
    
    console.log('✅ User found');
    console.log(`   ID: ${user._id}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);

    // Check verification status
    console.log('\n2. Checking verification status...');
    if (user.isVerified) {
      console.log('✅ Account is verified');
    } else {
      console.log('❌ Account is NOT verified');
      console.log('   Solution: Verify email or run manual fix');
    }

    // Check roles
    console.log('\n3. Checking role assignment...');
    if (!user.roles || user.roles.length === 0) {
      console.log('❌ No roles assigned');
      console.log('   Solution: Assign retailer role');
    } else {
      console.log('✅ Roles assigned:');
      const roleNames = user.roles.map(role => role.name);
      roleNames.forEach(name => console.log(`   - ${name}`));
      
      if (!roleNames.includes('retailer')) {
        console.log('⚠️  Retailer role missing');
        console.log('   Solution: Add retailer role');
      } else {
        console.log('✅ Retailer role found');
      }
    }

    // Check store assignment
    console.log('\n4. Checking store assignment...');
    if (user.storeId) {
      console.log('✅ Store assigned');
      console.log(`   Store ID: ${user.storeId._id || user.storeId}`);
      if (user.storeId.name) {
        console.log(`   Store Name: ${user.storeId.name}`);
        console.log(`   Store Type: ${user.storeId.storeType}`);
      }
    } else {
      console.log('⚠️  No store assigned');
      console.log('   Note: This may be normal for some retailer accounts');
    }

    // Check retailer role exists in database
    console.log('\n5. Checking if retailer role exists...');
    const retailerRole = await Role.findOne({ name: 'retailer' });
    if (retailerRole) {
      console.log('✅ Retailer role exists in database');
      console.log(`   Role ID: ${retailerRole._id}`);
      console.log(`   Permissions: ${retailerRole.permissions.length} permissions`);
    } else {
      console.log('❌ Retailer role not found in database');
      console.log('   Solution: Create retailer role');
    }

    // Generate fix commands
    console.log('\n' + '=' .repeat(50));
    console.log('🛠️  FIX COMMANDS');
    console.log('=' .repeat(50));

    if (!user.isVerified) {
      console.log('\n// Fix 1: Verify account');
      console.log(`db.users.updateOne(`);
      console.log(`  {"email": "${email}"},`);
      console.log(`  {"$set": {"isVerified": true, "verified": new Date()}}`);
      console.log(`)`);
    }

    if (!user.roles.map(r => r.name).includes('retailer')) {
      console.log('\n// Fix 2: Add retailer role');
      console.log(`const retailerRole = db.roles.findOne({"name": "retailer"});`);
      console.log(`db.users.updateOne(`);
      console.log(`  {"email": "${email}"},`);
      console.log(`  {"$addToSet": {"roles": retailerRole._id}}`);
      console.log(`);`);
    }

    if (!retailerRole) {
      console.log('\n// Fix 3: Create retailer role');
      console.log(`db.roles.insertOne({`);
      console.log(`  "name": "retailer",`);
      console.log(`  "permissions": [`);
      console.log(`    "upload_image", "create_order", "view_current_orders",`);
      console.log(`    "view_current_order", "update_order", "cancel_order",`);
      console.log(`    "create_inventory", "update_inventory", "delete_inventory",`);
      console.log(`    "view_inventory", "create_support_ticket", "view_own_tickets",`);
      console.log(`    "respond_to_own_tickets", "rate_support_experience", "escalate_urgent_issues"`);
      console.log(`  ]`);
      console.log(`});`);
    }

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📊 DIAGNOSIS SUMMARY');
    console.log('=' .repeat(50));

    const issues = [];
    if (!user.isVerified) issues.push('Account not verified');
    if (!user.roles.map(r => r.name).includes('retailer')) issues.push('Missing retailer role');
    if (!retailerRole) issues.push('Retailer role not in database');

    if (issues.length === 0) {
      console.log('✅ Account appears to be properly configured');
      console.log('   If login still fails, check:');
      console.log('   - Backend server is running on correct port');
      console.log('   - Environment variables are set correctly');
      console.log('   - Network connectivity between frontend and backend');
      console.log('   - Browser console for JavaScript errors');
    } else {
      console.log('❌ Issues found:');
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n   Run the fix commands above to resolve these issues');
    }

  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
    console.log('\nPossible causes:');
    console.log('- MongoDB is not running');
    console.log('- Wrong connection string');
    console.log('- Network connectivity issues');
  } finally {
    await mongoose.connection.close();
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node check-retailer-account.js your-email@example.com');
  process.exit(1);
}

checkRetailerAccount(email).then(() => {
  console.log('\n✅ Diagnosis complete');
  process.exit(0);
});
