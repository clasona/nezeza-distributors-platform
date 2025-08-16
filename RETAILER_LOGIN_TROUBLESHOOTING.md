# Retailer Login Troubleshooting Guide

## Issue: Cannot Login to Retailer Account

### Possible Root Causes and Solutions

## 1. **Account Verification Status**
   
**Check if your account is verified:**
- ❌ **Unverified accounts cannot login**
- ✅ **Solution**: Check your email for verification link or request a new one

**Backend Check:**
```bash
# Check user verification status in MongoDB
db.users.findOne({"email": "your-email@example.com"}, {"isVerified": 1, "email": 1})
```

**Fix Command:**
```bash
# Manually verify account if needed
db.users.updateOne(
  {"email": "your-email@example.com"}, 
  {"$set": {"isVerified": true, "verified": new Date()}}
)
```

## 2. **Role Assignment Issues**

**Check if retailer role is properly assigned:**
- ❌ **Missing retailer role**
- ❌ **Role not found in database**

**Backend Check:**
```bash
# Check user's roles
db.users.findOne({"email": "your-email@example.com"}).populate('roles')

# Check if retailer role exists
db.roles.findOne({"name": "retailer"})
```

**Fix Commands:**
```bash
# Find retailer role ID
const retailerRole = db.roles.findOne({"name": "retailer"});

# Update user with retailer role
db.users.updateOne(
  {"email": "your-email@example.com"},
  {"$addToSet": {"roles": retailerRole._id}}
)
```

## 3. **Environment Configuration**

**Check environment variables:**
- ❌ **NEXT_PUBLIC_BACKEND_URL** not set
- ❌ **JWT secrets mismatch**
- ❌ **Database connection issues**

**Required Environment Variables:**

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

**Backend (.env):**
```bash
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/nezeza
JWT_SECRET=your-jwt-secret
JWT_LIFETIME=1d
CLIENT_URL=http://localhost:3000
```

## 4. **Backend Server Issues**

**Check if backend is running:**
```bash
# Test backend auth endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

**Expected Response (Success):**
```json
{
  "user": {
    "_id": "user-id",
    "email": "your-email@example.com",
    "firstName": "Your",
    "lastName": "Name",
    "roles": [{"name": "retailer"}],
    "isVerified": true
  }
}
```

**Expected Response (Error):**
```json
{
  "message": "Invalid Credentials"
}
// OR
{
  "message": "Account not verified. Please verify your email!"
}
```

## 5. **Frontend Issues**

**Check browser console for errors:**
- ❌ **NextAuth configuration errors**
- ❌ **CORS issues**
- ❌ **Network connectivity problems**

**Common Console Errors:**
```
NextAuth Error: Invalid callback URL
CORS Error: Access-Control-Allow-Origin
Network Error: Failed to fetch
```

## 6. **Database Connection Issues**

**Test MongoDB connection:**
```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/nezeza

# Check if user exists
db.users.findOne({"email": "your-email@example.com"})

# Check if roles collection has retailer role
db.roles.find({"name": "retailer"})
```

## Step-by-Step Debugging Process

### Step 1: Verify Account Status
```bash
# Run this in MongoDB shell
const user = db.users.findOne(
  {"email": "your-retailer-email@example.com"}, 
  {"email": 1, "isVerified": 1, "roles": 1}
);
print("User found:", !!user);
if (user) {
  print("Is Verified:", user.isVerified);
  print("Roles:", user.roles.length);
}
```

### Step 2: Check Role Assignment
```bash
# Populate roles and check
db.users.aggregate([
  {"$match": {"email": "your-retailer-email@example.com"}},
  {"$lookup": {
    "from": "roles",
    "localField": "roles",
    "foreignField": "_id",
    "as": "populatedRoles"
  }},
  {"$project": {
    "email": 1,
    "isVerified": 1,
    "roleNames": "$populatedRoles.name"
  }}
])
```

### Step 3: Test Backend Login Directly
```bash
# Test with curl
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-retailer-email@example.com",
    "password": "your-password"
  }' \
  -v
```

### Step 4: Check Frontend Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Look for failed requests to:
   - `/api/auth/callback/credentials`
   - `/api/v1/auth/login`
   - `/api/auth/session`

### Step 5: Check Browser Console
Look for errors related to:
- NextAuth
- CORS
- Authentication
- Network connectivity

## Quick Fixes

### Fix 1: Manually Verify Account
```bash
# MongoDB command
db.users.updateOne(
  {"email": "your-retailer-email@example.com"},
  {"$set": {"isVerified": true, "verified": new Date()}}
)
```

### Fix 2: Add Missing Retailer Role
```bash
# First, ensure retailer role exists
db.roles.findOneAndUpdate(
  {"name": "retailer"},
  {"$set": {
    "name": "retailer",
    "permissions": [
      "upload_image",
      "create_order",
      "view_current_orders",
      "view_current_order",
      "update_order",
      "cancel_order",
      "create_inventory",
      "update_inventory",
      "delete_inventory",
      "view_inventory",
      "create_support_ticket",
      "view_own_tickets",
      "respond_to_own_tickets",
      "rate_support_experience",
      "escalate_urgent_issues"
    ]
  }},
  {"upsert": true}
);

# Then assign role to user
const retailerRole = db.roles.findOne({"name": "retailer"});
db.users.updateOne(
  {"email": "your-retailer-email@example.com"},
  {"$addToSet": {"roles": retailerRole._id}}
);
```

### Fix 3: Reset Password (if needed)
```bash
# Generate password reset token
node -e "
const crypto = require('crypto');
const token = crypto.randomBytes(70).toString('hex');
console.log('Reset token:', token);
"

# Update user with reset token (expires in 10 minutes)
db.users.updateOne(
  {"email": "your-retailer-email@example.com"},
  {"$set": {
    "passwordToken": "hashed-token", // Use createHash function
    "passwordTokenExpirationDate": new Date(Date.now() + 10*60*1000)
  }}
)
```

### Fix 4: Clear Browser Cache
1. Clear browser cookies for localhost:3000
2. Clear localStorage and sessionStorage
3. Hard refresh (Ctrl+Shift+R)

### Fix 5: Restart Services
```bash
# Restart backend
cd backend && npm run dev

# Restart frontend (in separate terminal)
cd frontend && npm run dev
```

## Advanced Debugging

### Enable Debug Logging

**Backend (authController.js):**
Add logging to login function:
```javascript
const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for:', email);
  
  const user = await User.findOne({ email })
    .populate('roles')
    .populate('storeId');
    
  console.log('User found:', !!user);
  if (user) {
    console.log('User verified:', user.isVerified);
    console.log('User roles:', user.roles.map(r => r.name));
  }
  
  // ... rest of login logic
};
```

**Frontend (NextAuth config):**
Enable debug mode:
```javascript
// In [...nextauth].ts
debug: true, // Enable in development
```

### Check Token Validity
```bash
# Check if there are any existing tokens for the user
db.tokens.find({"user": ObjectId("user-id-here")})

# Clear invalid tokens
db.tokens.deleteMany({"isValid": false})
```

## Contact Support

If none of these solutions work, please provide:

1. **Error Messages**: Exact error messages from console/logs
2. **User Email**: The retailer account email
3. **Account Status**: Result of the verification check queries
4. **Environment**: Development/Production
5. **Browser**: Which browser and version
6. **Network**: Any network restrictions or proxies

## Prevention

To prevent future login issues:

1. **Always verify email** before attempting login
2. **Ensure proper role assignment** during account creation
3. **Keep environment variables** properly configured
4. **Monitor backend logs** for authentication errors
5. **Test login flow** after any authentication changes

---

**Last Updated**: January 2025  
**Version**: 1.0  
**For Support**: Check backend logs and database user status first
