# Shipping Address Fixes - Test Instructions

## Issues Fixed:

### 1. ✅ Change Address Button Not Working
**Problem**: Clicking "Change" on the review page didn't allow users to edit their shipping address.

**Solution**: Modified the "Change" button to include `?edit=true` query parameter and updated the shipping address page to detect this parameter and force show the form for editing.

**Test**:
1. Go through checkout flow with an existing address
2. Reach the review page
3. Click "Change" button next to the shipping address
4. Verify you can now edit the address form
5. Submit the form and return to review page

### 2. ✅ Shipping Address Not Cleared on Logout
**Problem**: Shipping address persisted in Redux state after logout.

**Solution**: Added `clearShippingAddress()` action to the logout process.

**Test**:
1. Login and set a shipping address
2. Navigate to review page to see the address
3. Logout 
4. Login again and start checkout
5. Verify no shipping address is pre-filled (should show form)

## Changes Made:

### LogoutButton.tsx
- Added `clearShippingAddress` import
- Added `dispatch(clearShippingAddress())` to logout process

### review.tsx  
- Changed "Change" button to navigate to `/checkout/shipping-address?edit=true`

### shipping-address.tsx
- Added detection for `?edit=true` query parameter
- When edit mode detected, force shows the form instead of auto-validation
- Added `router.query.edit` to useEffect dependencies

## Expected Behavior:

1. **Change Address**: Users can now successfully edit their shipping address from the review page
2. **Logout Clearing**: Shipping address is cleared when users logout, ensuring privacy and preventing address confusion between different users
3. **Smooth Navigation**: No more getting stuck in redirect loops when trying to edit address

## Additional Benefits:

- Improved user experience for address editing
- Better privacy by clearing sensitive shipping data on logout  
- More intuitive navigation flow
- Prevents address confusion between different user sessions
