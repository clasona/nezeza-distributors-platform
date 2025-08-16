#!/usr/bin/env node

/**
 * Simple Login Diagnostic Script
 * Run: cd backend && node diagnose-login.js your-email@example.com
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nezeza';

// User and Role schemas (simplified)
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

async function diagnoseLogin(email) {
  if (!email) {
    console.log('❌ Usage: node diagnose-login.js your-email@example.com');
    return;
  }

  console.log('🔍 Diagnosing Login Issue for:', email);
  console.log('='.repeat(50));

  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const user = await User.findOne({ email }).populate('roles').populate('storeId');
    
    if (!user) {
      console.log('❌ User not found');
      console.log('   Solution: Register account first');
      return;
    }
    
    console.log('✅ User found');
    console.log(`   Name: ${user.firstName} ${user.lastName}`);

    // Check verification
    if (user.isVerified) {
      console.log('✅ Account verified');
    } else {
      console.log('❌ Account NOT verified - This is likely the issue!');
      console.log('   Fix: Run verification command below');
    }

    // Check roles
    const roleNames = user.roles.map(role => role.name);
    console.log('✅ Roles:', roleNames.join(', '));
    
    if (!roleNames.includes('retailer')) {
      console.log('❌ Missing retailer role - This is likely the issue!');
    }

    // Check if retailer role exists
    const retailerRole = await Role.findOne({ name: 'retailer' });
    if (!retailerRole) {
      console.log('❌ Retailer role missing from database!');
    } else {
      console.log('✅ Retailer role exists in database');
    }

    // Store info
    if (user.storeId) {
      console.log('✅ Store assigned');
    } else {
      console.log('⚠️  No store assigned (may be normal)');
    }

    console.log('\n' + '='.repeat(50));
    console.log('🛠️  QUICK FIXES');
    console.log('='.repeat(50));

    if (!user.isVerified) {
      console.log('\n// Fix 1: Verify account');
      console.log(`db.users.updateOne({email: "${email}"}, {$set: {isVerified: true, verified: new Date()}})`);
    }

    if (!roleNames.includes('retailer') && retailerRole) {
      console.log('\n// Fix 2: Add retailer role');
      console.log(`db.users.updateOne({email: "${email}"}, {$addToSet: {roles: ObjectId("${retailerRole._id}")}})`);
    }

    if (!retailerRole) {
      console.log('\n// Fix 3: Create retailer role first');
      console.log(`db.roles.insertOne({
  name: "retailer",
  permissions: [
    "upload_image", "create_order", "view_current_orders",
    "view_current_order", "update_order", "cancel_order",
    "create_inventory", "update_inventory", "delete_inventory",
    "view_inventory", "create_support_ticket", "view_own_tickets",
    "respond_to_own_tickets", "rate_support_experience", "escalate_urgent_issues"
  ]
})`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));

    const issues = [];
    if (!user.isVerified) issues.push('Account not verified');
    if (!roleNames.includes('retailer')) issues.push('Missing retailer role');
    if (!retailerRole) issues.push('Retailer role not in database');

    if (issues.length === 0) {
      console.log('✅ Account looks good! If still can\'t login, check:');
      console.log('   - Backend/frontend servers running');
      console.log('   - Environment variables');
      console.log('   - Browser console errors');
    } else {
      console.log('❌ Found issues:', issues.join(', '));
      console.log('   Run the fix commands above');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

const email = process.argv[2];
diagnoseLogin(email).then(() => process.exit(0));
