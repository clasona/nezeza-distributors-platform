# Email and SMS Verification Setup

This document outlines the email and SMS verification functionality implemented for the store application form.

## Overview

The verification system allows users to verify their email addresses and phone numbers during the store application process by sending verification codes via email and SMS.

## Architecture

### Frontend Components
- **StoreInfoInput Component**: Enhanced with verification UI and logic
- **Verification Utilities**: API client functions for sending and verifying codes
- **Real-time UI States**: Loading, code sent, verification, and error states

### Backend APIs
- **Email Verification Endpoints**:
  - `POST /api/verification/send-email` - Sends verification code to email
  - `POST /api/verification/verify-email` - Verifies email code
- **SMS Verification Endpoints**:
  - `POST /api/verification/send-sms` - Sends verification code via SMS
  - `POST /api/verification/verify-sms` - Verifies SMS code

### Data Storage
- **Development**: In-memory store with automatic cleanup
- **Production**: Should be replaced with Redis or database solution

## Features

### Email Verification
1. **Send Code**: Validates email format and sends 6-digit code
2. **Code Input**: User enters received code
3. **Verification**: Validates code with attempt limits and expiration
4. **Resend**: Option to resend code if needed

### SMS Verification
1. **Send Code**: Validates phone format and sends 6-digit code
2. **Code Input**: User enters received code
3. **Verification**: Validates code with attempt limits and expiration
4. **Resend**: Option to resend code if needed

### Security Features
- **Code Expiration**: 10-minute timeout for all codes
- **Attempt Limiting**: Maximum 3 verification attempts per code
- **Rate Limiting**: Prevents code spam (can be enhanced)
- **Phone Normalization**: Handles various phone number formats

## User Experience

### Verification Flow
1. User fills in email/phone field
2. Clicks "Send Verification Email/SMS" button
3. System shows loading state while sending
4. Code input field appears with verify/resend options
5. User enters 6-digit code and clicks "Verify"
6. Success state shows verification complete

### UI States
- **Idle**: Initial state with send button
- **Sending**: Loading state while code is being sent
- **Code Sent**: Input field with verify/resend options
- **Verifying**: Loading state while checking code
- **Verified**: Success state with checkmark
- **Invalid**: Error state with error message

## Integration with Email/SMS Services

### Email Service (SendGrid Example)
```javascript
// Replace the mock function in send-email.ts
const sendVerificationEmail = async (email: string, code: string) => {
  await sgMail.send({
    to: email,
    from: 'noreply@vesoko.com',
    subject: 'Store Application Email Verification',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <strong>${code}</strong></p>`,
  });
  return true;
};
```

### SMS Service (Twilio Example)
```javascript
// Replace the mock function in send-sms.ts
const sendVerificationSMS = async (phone: string, code: string) => {
  await twilioClient.messages.create({
    body: `Your Vesoko verification code is: ${code}`,
    from: '+1234567890', // Your Twilio phone number
    to: phone
  });
  return true;
};
```

## Production Considerations

### Database/Redis Integration
Replace the in-memory store with persistent storage:

```javascript
// Example Redis integration
import redis from 'redis';
const client = redis.createClient();

const verificationStore = {
  set: (key, data) => client.setex(key, 600, JSON.stringify(data)),
  get: async (key) => {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  },
  delete: (key) => client.del(key)
};
```

### Environment Variables
Add to your `.env` file:
```
SENDGRID_API_KEY=your_sendgrid_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Rate Limiting
Implement rate limiting to prevent abuse:
```javascript
// Example with express-rate-limit
const rateLimit = require('express-rate-limit');
const verificationLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: 'Too many verification requests, try again later.'
});
```

## Testing

### Development Testing
1. Check browser console for verification codes during development
2. Use the in-memory store for quick testing
3. Verify UI state transitions work correctly

### Production Testing
1. Test with real email addresses and phone numbers
2. Verify delivery times and reliability
3. Test error handling and edge cases
4. Monitor verification success rates

## Troubleshooting

### Common Issues
1. **Codes not arriving**: Check email/SMS service configuration
2. **Expired codes**: Verify system time and expiration logic
3. **Multiple attempts failing**: Check attempt counter logic
4. **UI not updating**: Verify state management and re-renders

### Logs to Check
- Email/SMS service delivery logs
- Verification code generation and storage
- User attempt patterns and failures
- API endpoint response times

## Future Enhancements

1. **Backup Verification**: Alternative methods if primary fails
2. **International Support**: Better phone number validation
3. **Analytics**: Track verification success rates
4. **A/B Testing**: Different verification flows
5. **Voice Calls**: Alternative to SMS for phone verification
