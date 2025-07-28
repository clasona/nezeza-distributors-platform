# Backend Verification Routes Implementation Guide

This guide helps you implement the verification functionality in your main backend application.

## Required Routes

Add these 4 routes to your backend at `/api/v1/verification/`:

### 1. POST /api/v1/verification/send-email

```javascript
// Example Express.js implementation
app.post('/api/v1/verification/send-email', async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and type are required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format' 
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in your database/Redis
    await storeVerificationCode(`email:${email}:${type}`, {
      code,
      expires,
      attempts: 0
    });

    // Send email using your email service
    await sendVerificationEmail(email, code);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully',
      expiresIn: 600
    });

  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

### 2. POST /api/v1/verification/verify-email

```javascript
app.post('/api/v1/verification/verify-email', async (req, res) => {
  try {
    const { email, code, type } = req.body;

    if (!email || !code || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, code, and type are required' 
      });
    }

    const key = `email:${email}:${type}`;
    const storedData = await getVerificationCode(key);

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification code found. Please request a new one.' 
      });
    }

    // Check expiration
    if (new Date() > storedData.expires) {
      await deleteVerificationCode(key);
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Increment attempts
    storedData.attempts += 1;

    // Check attempt limit
    if (storedData.attempts > 3) {
      await deleteVerificationCode(key);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new code.' 
      });
    }

    // Verify code
    if (storedData.code !== code) {
      await updateVerificationCode(key, storedData);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    // Success - remove code
    await deleteVerificationCode(key);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying email code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

### 3. POST /api/v1/verification/send-sms

```javascript
app.post('/api/v1/verification/send-sms', async (req, res) => {
  try {
    const { phone, type } = req.body;

    if (!phone || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone and type are required' 
      });
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Basic phone validation
    const phoneRegex = /^[\d\+]+$/;
    if (!phoneRegex.test(normalizedPhone) || normalizedPhone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid phone number format' 
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in your database/Redis
    await storeVerificationCode(`sms:${normalizedPhone}:${type}`, {
      code,
      expires,
      attempts: 0
    });

    // Send SMS using your SMS service
    await sendVerificationSMS(normalizedPhone, code);

    res.status(200).json({
      success: true,
      message: 'Verification SMS sent successfully',
      expiresIn: 600
    });

  } catch (error) {
    console.error('Error sending verification SMS:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

### 4. POST /api/v1/verification/verify-sms

```javascript
app.post('/api/v1/verification/verify-sms', async (req, res) => {
  try {
    const { phone, code, type } = req.body;

    if (!phone || !code || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone, code, and type are required' 
      });
    }

    const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '');
    const key = `sms:${normalizedPhone}:${type}`;
    const storedData = await getVerificationCode(key);

    if (!storedData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification code found. Please request a new one.' 
      });
    }

    // Check expiration
    if (new Date() > storedData.expires) {
      await deleteVerificationCode(key);
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Increment attempts
    storedData.attempts += 1;

    // Check attempt limit
    if (storedData.attempts > 3) {
      await deleteVerificationCode(key);
      return res.status(400).json({ 
        success: false, 
        message: 'Too many failed attempts. Please request a new code.' 
      });
    }

    // Verify code
    if (storedData.code !== code) {
      await updateVerificationCode(key, storedData);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code' 
      });
    }

    // Success - remove code
    await deleteVerificationCode(key);

    res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      verified: true
    });

  } catch (error) {
    console.error('Error verifying SMS code:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

## Database Implementation

### Option 1: Database Table (Recommended for Production)

```sql
CREATE TABLE verification_codes (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX idx_verification_codes_key ON verification_codes(key);
CREATE INDEX idx_verification_codes_expires ON verification_codes(expires);
```

### Option 2: Redis (Best Performance)

```javascript
// Redis implementation
const redis = require('redis');
const client = redis.createClient();

const storeVerificationCode = async (key, data) => {
  await client.setex(key, 600, JSON.stringify(data)); // 10 minutes TTL
};

const getVerificationCode = async (key) => {
  const data = await client.get(key);
  return data ? JSON.parse(data) : null;
};

const updateVerificationCode = async (key, data) => {
  const ttl = await client.ttl(key);
  await client.setex(key, ttl, JSON.stringify(data));
};

const deleteVerificationCode = async (key) => {
  await client.del(key);
};
```

## Email Service Integration

### SendGrid Example

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async (email, code) => {
  const msg = {
    to: email,
    from: 'noreply@vesoko.com',
    subject: 'Store Application Email Verification',
    text: `Your verification code is: ${code}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 20px; background-color: #f8f9fa; border-radius: 5px; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  };
  
  await sgMail.send(msg);
};
```

## SMS Service Integration

### Twilio Example

```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendVerificationSMS = async (phone, code) => {
  await client.messages.create({
    body: `Your Vesoko verification code is: ${code}. This code expires in 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
};
```

## Environment Variables

Add to your backend `.env` file:

```env
# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# SMS Service  
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Redis (if using)
REDIS_URL=redis://localhost:6379
```

## Security Considerations

1. **Rate Limiting**: Implement per-IP rate limiting
2. **CORS**: Configure proper CORS settings
3. **Input Validation**: Sanitize all inputs
4. **Logging**: Log verification attempts for monitoring
5. **Environment**: Never commit API keys to version control

## Testing

1. Test with real email addresses and phone numbers
2. Verify error handling for all edge cases
3. Test rate limiting and security measures
4. Monitor delivery rates and performance

The frontend is already configured to work with these backend routes through the existing `axiosInstance` configuration.
