# Verification System Environment Setup

To enable email and SMS verification functionality, you need to add the following environment variables to your `.env` file:

## Email Verification (SendGrid)
These are already configured based on your existing email setup:
```
SEND_GRID_API_KEY=your_sendgrid_api_key_here
VERIFIED_EMAIL=your_verified_sender_email@domain.com
```

## SMS Verification (Twilio)
Add these new environment variables:
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

## How to Get Twilio Credentials

1. **Sign up for Twilio** at https://www.twilio.com/
2. **Get your Account SID and Auth Token** from the Twilio Console Dashboard
3. **Purchase a phone number** or use a free trial number
4. **Add the credentials** to your `.env` file

## Phone Number Format
- Phone numbers must be in E.164 format (e.g., +1234567890)
- The system will validate and normalize phone numbers automatically

## Security Notes
- Verification codes expire after 10 minutes
- Maximum of 3 attempts per verification code
- Email verification uses your existing SendGrid configuration
- SMS verification requires a valid Twilio account

## Testing
- In development, verification codes are logged to the console
- Make sure your Twilio account has sufficient credits for SMS sending
- Verify your SendGrid sender email is properly configured
