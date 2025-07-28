const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const sendVerificationCodeEmail = require('../utils/sendVerificationCodeEmail');
const sendSMS = require('../utils/sendSMS');

// In-memory store for development - replace with Redis or database in production
const verificationCodes = new Map();

// Clean up expired codes every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(key);
    }
  }
}, 60000);

// Generate a random 6-digit code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Normalize phone number (remove spaces, dashes, parentheses)
const normalizePhoneNumber = (phone) => {
  return phone.replace(/[\s\-\(\)]/g, '');
};

// Send verification email using SendGrid
const sendVerificationEmail = async (email, code, name = 'User') => {
  console.log(`Sending verification email to ${email} with code: ${code}`);
  
  try {
    await sendVerificationCodeEmail({
      email: email,
      verificationCode: code,
      name: name
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send verification SMS using Twilio
const sendVerificationSMS = async (phone, code) => {
  console.log(`Sending verification SMS to ${phone} with code: ${code}`);
  
  try {
    const message = `Your VeSoko verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
    
    await sendSMS({
      to: phone,
      message: message
    });
    return true;
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    throw error;
  }
};

// Send email verification code
const sendEmailVerification = async (req, res) => {
  const { email, type } = req.body;

  if (!email || !type) {
    throw new BadRequestError('Email and type are required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new BadRequestError('Invalid email format');
  }

  // Generate verification code
  const code = generateVerificationCode();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  
  // Store the code
  const key = `email:${email}:${type}`;
  verificationCodes.set(key, { code, expires, attempts: 0 });

  // Send the email
  try {
    await sendVerificationEmail(email, code, req.body.name);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new BadRequestError('Failed to send verification email');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Verification email sent successfully',
    expiresIn: 600 // 10 minutes in seconds
  });
};

// Verify email code
const verifyEmailCode = async (req, res) => {
  const { email, code, type } = req.body;

  if (!email || !code || !type) {
    throw new BadRequestError('Email, code, and type are required');
  }

  const key = `email:${email}:${type}`;
  const storedData = verificationCodes.get(key);

  if (!storedData) {
    throw new NotFoundError('No verification code found. Please request a new one.');
  }

  // Check if code has expired
  if (Date.now() > storedData.expires) {
    verificationCodes.delete(key);
    throw new BadRequestError('Verification code has expired. Please request a new one.');
  }

  // Increment attempt counter
  storedData.attempts += 1;

  // Check for too many attempts
  if (storedData.attempts > 3) {
    verificationCodes.delete(key);
    throw new BadRequestError('Too many failed attempts. Please request a new code.');
  }

  // Check if code matches
  if (storedData.code !== code) {
    throw new BadRequestError('Invalid verification code');
  }

  // Code is valid - remove it from storage
  verificationCodes.delete(key);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email verified successfully',
    verified: true
  });
};

// Send SMS verification code
const sendSMSVerification = async (req, res) => {
  const { phone, type } = req.body;

  if (!phone || !type) {
    throw new BadRequestError('Phone and type are required');
  }

  // Normalize phone number
  const normalizedPhone = normalizePhoneNumber(phone);
  
  // Basic phone validation - ensure E.164 format
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(normalizedPhone)) {
    throw new BadRequestError('Invalid phone number format. Please use E.164 format (e.g., +1234567890)');
  }

  // Generate verification code
  const code = generateVerificationCode();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  
  // Store the code (use normalized phone number as key)
  const key = `sms:${normalizedPhone}:${type}`;
  verificationCodes.set(key, { code, expires, attempts: 0 });

  // Send the SMS
  try {
    await sendVerificationSMS(normalizedPhone, code);
  } catch (error) {
    console.error('Failed to send verification SMS:', error);
    throw new BadRequestError('Failed to send verification SMS');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Verification SMS sent successfully',
    expiresIn: 600 // 10 minutes in seconds
  });
};

// Verify SMS code
const verifySMSCode = async (req, res) => {
  const { phone, code, type } = req.body;

  if (!phone || !code || !type) {
    throw new BadRequestError('Phone, code, and type are required');
  }

  const normalizedPhone = normalizePhoneNumber(phone);
  const key = `sms:${normalizedPhone}:${type}`;
  const storedData = verificationCodes.get(key);

  if (!storedData) {
    throw new NotFoundError('No verification code found. Please request a new one.');
  }

  // Check if code has expired
  if (Date.now() > storedData.expires) {
    verificationCodes.delete(key);
    throw new BadRequestError('Verification code has expired. Please request a new one.');
  }

  // Increment attempt counter
  storedData.attempts += 1;

  // Check for too many attempts
  if (storedData.attempts > 3) {
    verificationCodes.delete(key);
    throw new BadRequestError('Too many failed attempts. Please request a new code.');
  }

  // Check if code matches
  if (storedData.code !== code) {
    throw new BadRequestError('Invalid verification code');
  }

  // Code is valid - remove it from storage
  verificationCodes.delete(key);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Phone verified successfully',
    verified: true
  });
};

module.exports = {
  sendEmailVerification,
  verifyEmailCode,
  sendSMSVerification,
  verifySMSCode,
};
