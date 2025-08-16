# Customer Support Integration - Postman Testing Guide

## Prerequisites
1. Backend running on `http://localhost:8000`
2. Frontend running on `http://localhost:3000`
3. User account created and authenticated

## Test Sequence

### 1. Authentication First
**POST** `http://localhost:8000/api/v1/auth/login`
```json
{
  "email": "customer@example.com",
  "password": "password123"
}
```
- Save the returned cookies/tokens for subsequent requests

### 2. Test Support Metadata (Public or Auth Required)
**GET** `http://localhost:8000/api/v1/support/metadata`
- Headers: Include auth cookies/tokens
- Expected: Categories, priorities, statuses for dropdown forms

### 3. Create Support Ticket
**POST** `http://localhost:8000/api/v1/support`
- Content-Type: `multipart/form-data`
- Form data:
  - `subject`: "Payment issue with order"
  - `description`: "My payment was charged but order shows as failed"
  - `category`: "payment_problem"
  - `priority`: "high"
  - `orderId`: "ORD-2024-001" (optional)
- Expected: 201 with new ticket data and ticket number

### 4. Get User's Tickets
**GET** `http://localhost:8000/api/v1/support/my-tickets`
- Headers: Include auth
- Optional query params:
  - `status=open`
  - `category=payment_problem`
  - `limit=10`
- Expected: 200 with tickets array

### 5. Get Specific Ticket Details
**GET** `http://localhost:8000/api/v1/support/tickets/{ticket_id}`
- Replace `{ticket_id}` with ID from step 3
- Expected: 200 with full ticket details and messages

### 6. Add Message to Ticket
**POST** `http://localhost:8000/api/v1/support/tickets/{ticket_id}/messages`
```json
{
  "message": "I have attached my bank statement showing the charge",
  "isInternal": false
}
```
- Expected: 201 with new message added

## Expected Integration Points

### Frontend Components Testing
After Postman tests pass, verify these work in browser:

1. **Visit**: `http://localhost:3000/customer/support`
2. **Submit Ticket Tab**: 
   - Form loads categories from metadata API
   - Submits to backend API
   - Shows success message with ticket number
3. **My Tickets Tab**:
   - Loads tickets from backend
   - Shows proper status/priority colors
   - Click ticket opens detail view
4. **Ticket Detail View**:
   - Shows messages thread
   - Allows adding new messages

## Error Scenarios to Test

### Network Errors
- Stop backend server
- Try submitting ticket from frontend
- Should show fallback data and error messages

### Authentication Errors
- Use expired/invalid token
- Should redirect to login or show auth error

### Validation Errors
- Submit empty subject/description
- Should show field validation errors

## Success Criteria
✅ Metadata loads from backend
✅ Tickets can be created via API
✅ Tickets appear in "My Tickets" list
✅ Messages can be added to tickets
✅ Frontend forms use real backend data
✅ Error handling works gracefully
✅ File attachments work (if implemented)

## Common Issues to Check
- CORS headers configured correctly
- Authentication cookies/tokens passed
- Environment variable `NEXT_PUBLIC_BACKEND_URL` set
- Backend routes match frontend API calls
- Form data vs JSON content types match expectations
